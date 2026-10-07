# DEPLOY.md — Autodespliegue iOS (TestFlight / App Store) — PeopleNet mobile

Arquitectura de entornos y CI/CD de `app-fombisol` (`com.peoplenet.app`).
**Estado: CONFIGURADO, SIN ACTIVAR.** No se ha ejecutado ningún despliegue (el equipo
avisa cuándo arrancar; ver "Activación paso a paso" al final).

## 1. Mapa de entornos

| Rama | Trigger | Modo de build | Archivo env | Backend | Destino |
|---|---|---|---|---|---|
| `develop` | push (src/, ios/, configs) | `testflight` | `.env.testflight` | **DEV** (absoluta, CI var) | **TestFlight** (QA externa) |
| `main` | push (src/, ios/, configs) | `production` | `.env.production` | **PROD** `https://peoplenet.info/api` | **App Store Connect** (publicación MANUAL) |
| local | `npm run dev` / `npm run build` | `development` | `.env.development` | `/api` → proxy Vite → `localhost:8080` | — |

Regla de oro: la URL de la API **nunca** se hardcodea en el código — se resuelve en
`src/lib/config.ts` con prioridad: variable de CI > `.env.[mode]` > fallback `/api`.
En build nativo la URL debe ser ABSOLUTA (no existe el proxy de Vite en el dispositivo);
`config.ts` emite error visible si un build nativo lleva URL relativa.

### Scripts de build (`package.json`)
- `npm run dev` — web dev con proxy.
- `npm run build` — web/build dev (mode development).
- `npm run build:testflight` — mode testflight (URL dev embebida).
- `npm run build:production` — mode production (URL prod embebida).

Verificado: cada modo inyecta su URL correcta en `dist/assets/index-*.js`.

## 2. Workflows (GitHub Actions)

- `.github/workflows/ios-release.yml` — reutilizable (workflow_call): npm ci → build web
  con mode → `npx cap add ios` (si falta) → `npx cap sync ios` → API key materializada →
  `agvtool` build number (100 + run_number) → `xcodebuild archive` + `exportArchive`
  (firma automática con ASC API key, SIN match) → `altool` upload → artefacto IPA.
  Runner: `macos-26` (Apple exige SDK iOS 26+ / Xcode 26 para subir a ASC).
- `.github/workflows/testflight.yml` — push a `develop` → build `testflight`.
- `.github/workflows/appstore.yml` — push a `main` → build `production` (sin auto-publicar).

Firma SIN match (2026-10-07): el provisioning profile lo genera Xcode directamente
con la App Store Connect API key (`-allowProvisioningUpdates -authenticationKey*`).
No requiere repo de certificados, Apple ID password ni keychain del equipo.
El Fastfile de `ios/fastlane/` queda como alternativa manual (requiere match).

Historia 2026-10-07: primer build (v1.0.0 build 1) subido manualmente desde Mac
local (Xcode 27) con altool → TestFlight VALID (Delivery UUID 2ee72748).

## 3. Secrets a configurar en GitHub (Settings → Secrets and variables → Actions)

### Secrets (OBLIGATORIOS para que el pipeline funcione)
| Secret | Qué es | Cómo obtenerlo |
|---|---|---|
| `ASC_KEY_ID` | ID de la API key de App Store Connect | App Store Connect → Users and Access → Integrations → App Store Connect API → Team Keys → generar key (rol **App Manager** mínimo) |
| `ASC_ISSUER_ID` | Issuer ID (arriba de la lista de keys) | Misma página |
| `ASC_KEY_P8_BASE64` | Contenido del archivo `.p8` **en base64** | `base64 -i AuthKey_XXXX.p8 \| pbcopy` (mac) o `certutil -encode` (win) |
| `ASC_APP_ID` | App ID numérico en ASC | ASC → App Details → Apple ID (ej. `6819857478`) |
| `APPLE_TEAM_ID` | Team ID de Apple Developer | Membership details (ej. `XZSSM34MU6`) |

✅ Configurados 2026-10-07: ASC_KEY_ID (7CHJDBN598 "fombisol-ci"), ASC_ISSUER_ID,
ASC_KEY_P8_BASE64, ASC_APP_ID (6819857478), APPLE_TEAM_ID.

### Secrets ya NO requeridos (firma sin match)
~~`MATCH_GIT_URL`, `MATCH_PASSWORD`, `KEYCHAIN_PASSWORD`~~ — el pipeline firma con
la API key vía xcodebuild; match solo para el flujo manual del Fastfile.

### Variables (no secretas)
| Var | Valor | Nota |
|---|---|---|
| `VITE_API_BASE_URL_TESTFLIGHT` | `https://peoplenet.info/api` | TestFlight apunta a PROD (no existe backend dev desplegado) |
| `VITE_API_BASE_URL_PRODUCTION` | `https://peoplenet.info/api` | Backend prod verificado 2026-10-07 (cert TLS válido hasta mar 2027) |

## 4. Bloqueadores y pendientes

1. ~~Certificado TLS de producción expirado~~ ✅ RESUELTO 2026-10-07: el host prod
   real es `https://peoplenet.info` (cert Let's Encrypt válido hasta 2027-03-18).
   `tech.peoplenet.info` quedó deprecado (caído + cert expirado).
2. **CORS del backend prod** ⚠️ PENDIENTE SERVER: el preflight desde
   `capacitor://localhost` (origen de la app nativa iOS) y `https://localhost`
   (scheme Android) responde 403. Agregar ambos al allowlist de CORS del server
   prod (`CORS_ALLOWED_ORIGINS` env o `app.cors.allowed-origins`) y reiniciar.
   Sin esto, la app nativa NO logra loguearse contra prod.
3. ~~Proyecto iOS no generado~~ ✅ RESUELTO: `ios/App/App.xcodeproj` commiteado
   (commit e3bb29b); workflow ya no regenera (check path corregido).
4. ~~match primera vez~~ ⛔ OBSOLETO: la firma por match fue reemplazada por
   firma automática con API key (ver §2).
5. ~~App Store Connect: crear la app~~ ✅ RESUELTO: PeopleNet ya existe
   (ASC App ID numérico `6819857478`, SKU `peoplenet-ios-001`).
6. **Android (Play Store)**: fuera de alcance actual (keystore + console pending);
   el flujo sería análogo con lane `android` + `supply`. Documentar cuando se decida.

## 5. Activación paso a paso (CUANDO el equipo lo decida)

1. Configurar secrets + vars del §3 en GitHub.
2. Inicializar repo de certificados (única vez, desde un Mac): `fastlane match appstore`.
3. Registrar App ID `com.peoplenet.app` en developer.apple.com.
4. Crear la rama `develop` del repo (si no existe) y hacer push — dispara TestFlight.
5. Verificar en Actions que el build subió y aparece en TestFlight (puede tardar
   5-15 min en procesamiento de Apple).
6. Para producción: push a `main` → build en ASC → **publicar manualmente**.

## 6. Rollback / diagnóstico

- Cada run deja artefacto IPA + `report.xml` (14 días) — descargable desde el run.
- Build number visible en TestFlight identifica el run (`100 + run_number`).
- Si match falla por certificado revocado: renovar certs en el repo de match (mac).
- Si el build web falla: correr localmente `npm run build:testflight` (mismo tsc).
