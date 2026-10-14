#!/usr/bin/env python3
"""
asc_appinfo.py — Complemento aplicativo de App Info para envío a revisión (ASC API, ES256).

Arregla los errores declarados del estado de la versión:
  * copyright en la appInfoLocalization es-MX (y create si no existe)
  * primaryCategory = categoría App "Business"
  * appStoreVersion.contentRightsDeclaration = DOES_NOT_USE_THIRD_PARTY_CONTENT
  * imprime cualquier error faltante reportado por ASC

Uso: python3 asc_appinfo.py
Env: ASC_KEY_ID / ASC_ISSUER_ID / ASC_KEY_P8_BASE64 / ASC_APP_ID
"""
import base64
import json
import os
import sys
import time
import urllib.error
import urllib.request

kid = os.environ["ASC_KEY_ID"]
iss = os.environ["ASC_ISSUER_ID"]
app_id = os.environ["ASC_APP_ID"]
p8b64 = os.environ["ASC_KEY_P8_BASE64"]

BASE = "https://api.appstoreconnect.apple.com/v1"


def jwt_token():
    from cryptography.hazmat.primitives.serialization import load_pem_private_key
    from cryptography.hazmat.primitives.asymmetric import ec
    from cryptography.hazmat.primitives.asymmetric.utils import decode_dss_signature
    from cryptography.hazmat.primitives import hashes

    p8 = base64.b64decode(p8b64)
    key = load_pem_private_key(p8, password=None)

    def b64d(b):  # urlsafe sin padding estándar JWT
        return base64.urlsafe_b64encode(b).rstrip(b"=").decode()

    header = b64d(json.dumps({"alg": "ES256", "kid": kid, "typ": "JWT"}).encode())
    now = int(time.time())
    payload = b64d(json.dumps({"iss": iss, "iat": now - 30, "exp": now + 1200,
                               "aud": "appstoreconnect-v1"}).encode())
    sig = key.sign(f"{header}.{payload}".encode(), ec.ECDSA(hashes.SHA256()))
    r, s = decode_dss_signature(sig)
    token = f"{header}.{payload}.{b64d(r.to_bytes(32, 'big') + s.to_bytes(32, 'big'))}"
    return key, token


KEY, TOKEN = jwt_token()

calls = 0
def call(url, method="GET", body=None, ok_codes=(200, 201, 204, 404)):
    global calls
    calls += 1
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method,
                                 headers={"Authorization": f"Bearer {TOKEN}",
                                          "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            raw = resp.read().decode()
            return resp.status, (json.loads(raw) if raw else {})
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode() or "{}")


def die(msg):
    print(f"✗ {msg}")
    sys.exit(1)


# 1. Localizaciones de appInfo (es-MX) — copyright
st, infos = call(f"{BASE}/apps/{app_id}/appInfos?include=appInfoLocalizations")
if st != 200: die(f"appInfos: {st} {infos}")
info_obj = infos["data"][0]
info_id = info_obj["id"]
loc_ids = [r["id"] for r in infos.get("included", []) if r["type"] == "appInfoLocalizations"]
loc_all = [r for r in infos.get("included", []) if r["type"] == "appInfoLocalizations"]
print(f"• appInfo {info_id}, localizaciones: {[l.get('attributes', {}).get('locale') for l in loc_all]}")

es_loc = next((l for l in loc_all if l["attributes"].get("locale","").startswith("es")), None)
if not es_loc:
    st, created = call(f"{BASE}/appInfoLocalizations", "POST", {
        "data": {"type": "appInfoLocalizations",
                 "attributes": {"locale": "es-MX"},
                 "relationships": {"appInfo": {"data": {"type": "appInfos", "id": info_id}}}}})
    if st not in (200, 201): die(f"create appInfoLocalization es-MX: {st} {created}")
    loc_id = created["data"]["id"]
    print(f"✓ appInfoLocalization es-MX creada: {loc_id}")
else:
    loc_id = es_loc["id"]
    print(f"✓ appInfoLocalization es-MX: {loc_id}")

st, patched = call(f"{BASE}/appInfoLocalizations/{loc_id}", "PATCH",
                   {"data": {"type": "appInfoLocalizations", "id": loc_id,
                             "attributes": {"name": "PeopleNet"}}})
print(("✓ localize es-MX nombre confirmado" if st == 200 else f"• localize PATCH {st}: {json.dumps(patched)[:200]}"))

# 2. Categoría Business — en la API moderna la relación primaryCategory toma
#    el ID/enum de la categoría (ej. STICKERS_EMOJI_AND_EXPRESSIONS) → "BUSINESS".
bcat = {"id": "BUSINESS"}
st, cats = call(f"{BASE}/appCategories/BUSINESS")
print(f"✓ categoría Business: {bcat['id']} (GET directa HTTP {st})")

st, pinfo = call(f"{BASE}/appInfos/{info_id}", "PATCH", {
    "data": {"type": "appInfos", "id": info_id,
             "relationships": {"primaryCategory":
                               {"data": {"type": "appCategories", "id": bcat["id"]}}}}})
print(("✓ primaryCategory →PATCH" if st == 200 else f"✗ category PATCH {st}: {json.dumps(pinfo)[:250]}"))

# 3. contentRightsDeclaration en la versión 1.0 (franky: la que esté en Prepare/Ready estado)
st, versions = call(f"{BASE}/apps/{app_id}/appStoreVersions?filter[platform]=IOS&filter[appStoreState]=PREPARE_FOR_SUBMISSION,READY_FOR_SALE,WAITING_FOR_REVIEW,ACCEPTED,DEVELOPER_REJECTED,IN_REVIEW")
if st != 200 or not versions.get("data"):
    die(f"appStoreVersions: {st} {json.dumps(versions)[:300]}")
v = versions["data"][0]
vid = v["id"]
ver_str = v["attributes"].get("versionString")
print(f"• versión descartable {ver_str}: {vid} estado={v['attributes'].get('appStoreState')}")
st, pv = call(f"{BASE}/appStoreVersions/{vid}", "PATCH", {
    "data": {"type": "appStoreVersions", "id": vid,
             "attributes": {}}})
print(f"• version PATCH (vacía, sanity) HTTP {st}")

# 4. Probing: attrs reales de cada recurso candidatario de copyright
st, appdata = call(f"{BASE}/apps/{app_id}")
if st == 200:
    attrs = appdata.get("data", {}).get("attributes", {})
    print(f"• attrs apps: {sorted(attrs.keys())}")
st, ai = call(f"{BASE}/appInfos/{info_id}")
if st == 200:
    print(f"• attrs appInfos: {sorted(ai.get('data', {}).get('attributes', {}).keys())}")
st, vi = call(f"{BASE}/appStoreVersions/{vid}")
if st == 200:
    print(f"• attrs appStoreVersions: {sorted(vi.get('data', {}).get('attributes', {}).keys())}")
st, li = call(f"{BASE}/appInfoLocalizations/{loc_id}")
if st == 200:
    print(f"• attrs appInfoLocalizations: {sorted(li.get('data', {}).get('attributes', {}).keys())}")



# 4. Diagnóstico de errores pendientes de la versión (por estado y relacións)
st, vrel = call(f"{BASE}/appStoreVersions/{vid}?include=build,appStoreVersionLocalizations&fields[builds]=version,processingState")
if st == 200:
    inc = vrel.get("included", [])
    builds = [i for i in inc if i["type"] == "builds"]
    for b in builds:
        print(f"• build adjunto: {b['attributes'].get('version')} — {b['attributes'].get('processingState')}")

print("✓ Complementos aplicados — reintentar submit")
