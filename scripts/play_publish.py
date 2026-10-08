#!/usr/bin/env python3
"""
play_publish.py — Sube y lanza un AAB a Google Play (pista interna) vía REST puro.

Sin dependencias: usa urllib + ADC (gcloud) + impersonación de service account.
Config leída de android/app/build.gradle: SA en IMPERSONATE_SA (constante abajo).

Uso:
  python3 scripts/play_publish.py \
    --aab android/app/build/outputs/bundle/release/app-release.aab \
    --version-code 2 [--track internal] [--notes-file ruta] [--dry-run]

Flujo: edits.insert → upload bundle → tracks.update (release + notas) → commit.
La pista interna se publica al instante (sin revisión de Google).
"""
import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

APP_ID = "com.peoplenet.app"
IMPERSONATE_SA = "play-publisher-net@peoplenet-510915.iam.gserviceaccount.com"
ANDROIDPUBLISHER = "https://www.googleapis.com/auth/androidpublisher"
BASE = "https://androidpublisher.googleapis.com/androidpublisher/v3/applications"
UPLOAD_BASE = "https://androidpublisher.googleapis.com/upload/androidpublisher/v3/applications"
ADC_PATH = os.environ.get(
    "GOOGLE_ADC_FILE",
    os.path.expanduser("~/.config/gcloud/application_default_credentials.json"))


def die(msg, hint=None):
    print(f"✗ {msg}")
    if hint:
        print(hint)
    sys.exit(1)


# ── Autenticación ─────────────────────────────────────────────────────────────
def adc_user_token():
    """Token de usuario desde el ADC plano (authorized_user) de gcloud."""
    if not os.path.exists(ADC_PATH):
        die("No existe ADC de gcloud.", f"Ejecuta:\n  gcloud auth application-default login")
    d = json.load(open(ADC_PATH))
    if d.get("type") != "authorized_user":
        die(f"ADC es '{d.get('type')}' y debe ser 'authorized_user'.",
            "Regenera con:  gcloud auth application-default login  (SIN --impersonate-service-account)")
    body = urllib.parse.urlencode({
        "client_id": d["client_id"], "client_secret": d["client_secret"],
        "refresh_token": d["refresh_token"], "grant_type": "refresh_token",
    }).encode()
    try:
        r = json.load(urllib.request.urlopen(
            urllib.request.Request("https://oauth2.googleapis.com/token", data=body)))
        return r["access_token"]
    except urllib.error.HTTPError as e:
        die(f"Refresh del token de usuario falló ({e.code})", e.read().decode()[:300])


def sa_token(user_token):
    """Token de la SA de Play impersonada con el usuario."""
    body = json.dumps({"delegates": [], "scope": [ANDROIDPUBLISHER], "lifetime": "3600s"}).encode()
    req = urllib.request.Request(
        "https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/"
        f"{IMPERSONATE_SA}:generateAccessToken",
        data=body, method="POST",
        headers={"Authorization": f"Bearer {user_token}", "Content-Type": "application/json"})
    try:
        r = json.load(urllib.request.urlopen(req))
        return r["accessToken"]
    except urllib.error.HTTPError as e:
        detail = e.read().decode()[:300]
        if "getAccessToken" in detail:
            die("Impersonación denegada (403 getAccessToken).",
                "Falta rol 'Creador de tokens de cuenta de servicio' para TU usuario sobre "
                f"la SA en Google Cloud → IAM (recurso: {IMPERSONATE_SA}).")
        die("Impersonación falló", detail)


# ── API Play ──────────────────────────────────────────────────────────────────
class PlayApi:
    def __init__(self, token):
        self.token = token

    def call(self, method, path, body=None, headers=None, ok_empty=False):
        req = urllib.request.Request(
            f"{BASE}/{APP_ID}{path}",
            data=json.dumps(body).encode() if body is not None else (b"" if method == "POST" else None),
            method=method,
            headers={"Authorization": f"Bearer {self.token}",
                     "Content-Type": "application/json", **(headers or {})})
        try:
            resp = urllib.request.urlopen(req)
            return {} if (ok_empty and resp.status == 204) else json.load(resp)
        except urllib.error.HTTPError as e:
            raw = e.read().decode()
            try:
                err = json.loads(raw).get("error", {})
                raise RuntimeError(f"{method} {path} → {e.code}: {err.get('message', raw[:200])}")
            except json.JSONDecodeError:
                raise RuntimeError(f"{method} {path} → {e.code}: {raw[:200]}")

    def upload_aab(self, edit_id, aab_path, ack_warning=False):
        data = open(aab_path, "rb").read()
        q = "?ackBundleInstallationWarning=true" if ack_warning else ""
        req = urllib.request.Request(
            f"{UPLOAD_BASE}/{APP_ID}/edits/{edit_id}/bundles{q}",
            data=data, method="POST",
            headers={"Authorization": f"Bearer {self.token}",
                     "Content-Type": "application/octet-stream"})
        try:
            return json.load(urllib.request.urlopen(req))
        except urllib.error.HTTPError as e:
            raw = e.read().decode()
            try:
                err = json.loads(raw).get("error", {})
                raise RuntimeError(f"Upload AAB → {e.code}: {err.get('message', raw[:300])}")
            except json.JSONDecodeError:
                raise RuntimeError(f"Upload AAB → {e.code}: {raw[:300]}")


# ── Flujo principal ───────────────────────────────────────────────────────────
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--aab", required=True)
    ap.add_argument("--version-code", type=int, required=True)
    ap.add_argument("--track", default="internal")
    ap.add_argument("--notes-file", default=None,
                    help="Texto de notas de la versión (si no, usa android/app/src/main/play/release-notes/en-US/internal.txt)")
    ap.add_argument("--status", default="completed", choices=["completed", "draft", "halted"])
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    if not os.path.exists(args.aab):
        die(f"No existe el AAB: {args.aab}")

    notes_text = None  # (reemplazado abajo por multi-idioma)
    notes_dir = os.path.join(os.path.dirname(__file__), "..",
                             "android/app/src/main/play/release-notes")
    notes = []
    # Notas por pista: internal.txt / closed.txt / production.txt (fallback: internal.txt)
    notes_name = {"closed": "closed.txt", "production": "production.txt"}.get(
        args.track, "internal.txt")
    if args.notes_file:
        notes = [("es-419", open(args.notes_file).read().strip())]
    else:
        for lang in ("es-419", "en-US"):
            f = os.path.join(notes_dir, lang, notes_name)
            if not os.path.exists(f):
                f = os.path.join(notes_dir, lang, "internal.txt")
            if os.path.exists(f) and open(f).read().strip():
                notes.append((lang, open(f).read().strip()))
    if args.notes_file and not notes:
        die("Notes file vacío")
    print(f"• AAB: {args.aab} ({os.path.getsize(args.aab)//1024} KB)")
    print(f"• versionCode: {args.version_code} — pista: {args.track} — status: {args.status}")
    for lang, txt in notes:
        print(f"• notas [{lang}]: {txt[:60]}{'…' if len(txt) > 60 else ''}")

    user_tok = adc_user_token()
    token = sa_token(user_tok)
    print("✓ Autenticación OK (SA impersonada)")

    if args.dry_run:
        api = PlayApi(token)
        edit = api.call("POST", "/edits")
        try:
            tracks = api.call("GET", f"/edits/{edit['id']}/tracks", ok_empty=True)
            for t in tracks.get("tracks", []):
                rel = t.get("releases", [])
                info = ", ".join(
                    f"{r.get('name', '?')} v{','.join(map(str, r.get('versionCodes', [])))} ({r.get('status')})"
                    for r in rel)
                print(f"  pista {t['track']}: {info or '(sin releases)'}")
            if not tracks.get("tracks"):
                print("  (sin pistas con releases)")
        finally:
            api.call("DELETE", f"/edits/{edit['id']}", ok_empty=True)
        print("✓ Dry-run: API operativa. No se subió nada.")
        return

    api = PlayApi(token)
    edit = api.call("POST", "/edits")
    eid = edit["id"]
    print(f"✓ Edit creado: {eid}")

    try:
        bundle = api.upload_aab(eid, args.aab)
        vc = bundle["versionCode"]
        print(f"✓ AAB subido — versionCode {vc}")

        release = {"versionCodes": [str(vc)], "status": args.status}
        if notes:
            release["releaseNotes"] = [{"language": lang, "text": txt} for lang, txt in notes]
        track_body = {"track": args.track, "releases": [release]}
        api.call("PUT", f"/edits/{eid}/tracks/{args.track}", track_body)
        print(f"✓ Pista {args.track} actualizada con release")

        api.call("POST", f"/edits/{eid}:commit", ok_empty=True)
        print(f"✓ COMMIT OK — versión {vc} lanzada a {args.track} (disponible en minutos)")
    finally:
        # Si algo falló, abandonar el edit para no dejar basura
        try:
            urllib.request.urlopen(urllib.request.Request(
                f"{BASE}/{APP_ID}/edits/{eid}", method="DELETE",
                headers={"Authorization": f"Bearer {token}"}))
            print("(edit abandonado por fallo)")
        except Exception:
            pass


if __name__ == "__main__":
    try:
        main()
    except RuntimeError as e:
        die(str(e), "Sugerencias: si el error dice 'Version code ... already been used', "
                    "sube versionCode en android/app/build.gradle, recompila y reintenta.")
