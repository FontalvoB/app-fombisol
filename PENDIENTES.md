# PENDIENTES — PeopleNet (tareas del equipo/equipo del usuario)

_Fecha: 2026-10-08 · Actualizar casillas al completar ✅ / ⛔_

## Google Play — bloqueantes para publicar producción

| # | Pendiente | Dónde | Estado |
|---|-----------|-------|--------|
| 1 | **Publicar Política de Privacidad en URL real** (must mencionar PeopleNet; contenido base en `docs/appstore/privacy-policy-es.html`) | peoplenet.info + pegar URL en Play Console → App content → Privacy policy | ⛔ (en progreso) |
| 2 | **Cuenta demo para revisores de Google** (usuario + contraseña, datos de ejemplo inofensivos) | crearla en prod → Play Console → App content → Sign-in details | ⛔ |
| 3 | **Gráficos del listing**: icono 512×512 PNG 32-bit · feature graphic 1024×500 · 2+ screenshots reales 9:16/16:9 (login, KPIs, evaluación, solicitudes, documentos) | Play Console → Main store listing | ⛔ |
| 4 | **Completar App content**: Ads: No · Content rating (todo No → Everyone/3+) · Target audience 18+ o más, no atrae niños · Data safety (respuestas exactas en `docs/PLAY-STORE-PUBLICACION.md` §4.5) · Government/Health/Financial/News: No | Play Console → App content | ⛔ |
| 5 | **Pegar textos del listing** (title/short/full es-419 + en-US) | fuente: `android/app/src/main/play/listings/` → Play Console | ⛔ |
| 6 | **Verificar check verde "Android developer registration"** (verificación de desarrollador Android, fecha límite 30-sep-2026) | Play Console Home | ⛔ |
| 7 | **Lanzar producción** cuando 1–6 estén: Actions → `android-prod` → Run (status=draft) → consola → revisar países/notas → **Enviar para revisión** (1–7 días) | GitHub Actions + Play Console | ⛔ |

## Apple App Store — bloqueantes para enviar a revisión
(detalle completo: `docs/appstore/CHECKLIST-SUBMIT.md`)

| # | Pendiente | Dónde | Estado |
|---|-----------|-------|--------|
| 1 | **Cuenta demo App Review** | `fastlane/metadata/review_information/demo_user.txt` + `demo_password.txt` | ⛔ |
| 2 | **Contacto de App Review** (email + teléfono) | `fastlane/metadata/review_information/email_address.txt` + `phone_number.txt` | ⛔ |
| 3 | **URL de Política de Privacidad real** (contenido ya escrito en `docs/appstore/privacy-policy-es|en.html`) | `fastlane/metadata/{es-419,en-US}/privacy_url.txt` | ⛔ (mismo URL que Play — una publicación sirve para ambas) |
| 4 | **Screenshots 1290×2796 (mín. 4)** según guion | `docs/appstore/SCREENSHOTS.md` → `fastlane/metadata/screenshots/{es-419,en-US}/` | ⛔ |
| 5 | **One-time en ASC**: Age rating (todo None/No → 4+) + App Privacy (valores en CHECKLIST-SUBMIT.md) | ASC manual, 5 min | ⛔ |
| 6 | **Build nuevo en ASC** (push a `main` → workflow `appstore`) y **enviar a revisión** (Actions → `appstore-submit`, `submit_for_review: true`) | GitHub Actions | ⛔ |

## Comunes / infra

- [ ] **Workflows iOS rotos** (commits "firma determinística P12" de la otra sesión fallan con YAML inválido 0s) — arreglar en esa sesión.
- [ ] **Cert TLS prod vence 2027-03-18** — renovar ANTES de esa fecha (app nativa exige TLS válido).
- [ ] **CORS del backend**: mantener `https://localhost` (Android) y `capacitor://localhost` (iOS) en el allowlist en cualquier cambio del server.
- [ ] Unificar nombre en tiendas: "PeopleNet" (Capacitor/iOS) vs "People Net" (listing Play).
- [ ] Si algún día se agrega SDK de analítica/ads/crashlytics → actualizar Data safety (Play) y App Privacy (Apple).
- [ ] Si se agrega registro self-service de cuentas → obrigatoria URL de eliminación de cuenta (Play) y botón de borrado in-app.
