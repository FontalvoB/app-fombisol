# Checklist — Publicación App Store v1.0 (PeopleNet, com.peoplenet.app)

**Objetivo:** primera versión 1.0 en revisión de Apple y publicación profesional.

## Pendientes críticos (bloquean el submit)

| # | Pendiente | Dónde | Estado |
|---|-----------|-------|--------|
| 1 | **Cuenta demo para App Review** (usuario + contraseña con datos de ejemplo) | `fastlane/metadata/review_information/demo_user.txt` y `demo_password.txt` | ⛔ PENDIENTE |
| 2 | **URL de Política de Privacidad real** | `fastlane/metadata/es-419/privacy_url.txt` y `en-US/` | ⛔ PENDIENTE (contenidos listos en `docs/appstore/privacy-policy-es|en.html`) |
| 3 | **Email + teléfono de contacto de App Review** | `fastlane/metadata/review_information/email_address.txt`, `phone_number.txt` | ⛔ PENDIENTE |
| 4 | **Screenshots 1290×2796 (mín. 4)** | `fastlane/metadata/screenshots/es-419/` + copiar a `en-US/` | ⛔ PENDIENTE (guion en `docs/appstore/SCREENSHOTS.md`) |
| 5 | **Age rating** (solo una vez, en ASC) | ASC → versión 1.0 → Calificación | ⛔ PENDIENTE (respuestas abajo → 4+) |
| 6 | **App Privacy / etiquetas de privacidad** (solo una vez, en ASC) | ASC → App Privacy | ⛔ PENDIENTE (valores abajo) |

## Ya resuelto ✅

- ✅ CORS del backend prod permite `capacitor://localhost` y `https://localhost` (preflight verificado 2026-10-08 — el login nativo funciona).
- ✅ Icono App Store 1024×1024 sin canal alfa (`ios/App/App/Assets.xcassets`).
- ✅ Splash assets presentes.
- ✅ `ITSAppUsesNonExemptEncryption=false` (sin cuestionario de exportación).
- ✅ Sin permisos NS* (la app no usa cámara/ubicación/fotos/micro).
- ✅ ATS habilitado — solo HTTPS contra `peoplenet.info` (cert válido hasta 2027-03-18).
- ✅ Metadata de tienda completa es/en (`fastlane/metadata/`).
- ✅ Notas de App Review profesionales (`review_information/notes.txt`).
- ✅ Workflow `appstore-submit.yml` para enviar a revisión por API (sin salir de GitHub Actions).
- ✅ v1 restringida a iPhone (evita screenshots iPad 13").

## Flujo de envío (orden exacto)

1. **Pendiente 1–3:** escribir credenciales demo + contacto + URL privacy en los `.txt` de `fastlane/metadata/` y hacer commit/push a la rama de release.
2. **Build nuevo en ASC:** push a `main` → workflow `appstore` sube el build `100+run_number` (v1.0, backend PROD). Verificar en ASC → TestFlight & Builds que el build esté **Ready to Submit** (procesamiento 10–30 min).
3. **Screenshots:** capturar según guion → copiar a `fastlane/metadata/screenshots/{es-419,en-US}/` → commit/push.
4. **One-time en ASC (manual, 5 min):**
   - **Age rating** → contestar todas las secciones "None/No" → resultado **4+**.
   - **App Privacy** → declaraciones abajo.
5. **Enviar a revisión:** GitHub Actions → `appstore-submit` → Run workflow:
   - `submit_for_review: false` (opcional: dry-run — sube metadata, valida, no envía)
   - `submit_for_review: true` + `build_number: <el del paso 2>` → **envía a revisión**.
6. **Monitoreo:** Apple responde típicamente en 24–48 h. Estado en ASC → Distribución → versión 1.0. Rechazo → corregir y re-correr paso 5 con build nuevo si aplica.
7. **Publicación:** aprobada → ASC → "Publicar esta versión manualmente" (coordinar con el equipo; `automatic_release: false`).

## Age rating (respuestas → 4+)
Todas las categorías (violencia, contenido sexual, lenguaje, drogas, apuestas, terror, medicina, acceso web sin restricción, chat no filtrado, etc.): **None / No**. La app es de gestión empresarial, sin UGC abierto ni acceso web.

## App Privacy (declaraciones recomendadas — honestas y mínimas)

| Tipo de dato | Uso | Vinculado a identidad | Tracking |
|---|---|---|---|
| Identificadores — User ID | App Functionality | Sí | No |
| Contact Info — Email Address | App Functionality | Sí | No |
| User Content — Other User Content (solicitudes, documentos, evaluaciones) | App Functionality | Sí | No |

- **Data Used to Track You:** ninguna.
- **Third-party SDKs:** ninguno (solo Capacitor core — no analítica, no ads).

## Post-aprobación (go-live profesional)

1. Publicar la versión manualmente en ASC y verificar la ficha en el App Store (nombre, textos, screenshots).
2. Probar descarga real desde el App Store en un iPhone.
3. Crear/release notes para v1.0.1+ en `fastlane/metadata/*/release_notes.txt`.
4. Mantener el certificado TLS de prod vigente (vence 2027-03-18) — renovar ANTES.
