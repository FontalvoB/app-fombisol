# DEPLOY.md — Autodespliegue iOS (TestFlight / App Store) — PeopleNet mobile

Arquitectura de entornos y CI/CD de `app-fombisol` (`com.peoplenet.app`).
**Estado: CONFIGURADO, SIN ACTIVAR.** No se ha ejecutado ningún despliegue (el equipo
avisa cuándo arrancar; ver "Activación paso a paso" al final).

## 1. Mapa de entornos

| Rama | Trigger | Modo de build | Archivo env | Backend | Destino |
|---|---|---|---|---|---|
| `develop` | push (src/, ios/, configs) | `testflight` | `.env.testflight` | **DEV** (absoluta, CI var) | **TestFlight** (QA externa) |
| `main` | push (src/, ios/, configs) | `production` | `.env.production` | **PROD** `https://tech.peoplenet.info/api` | **App Store Connect** (publicación MANUAL) |
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
  con mode → `npx cap add ios` (si falta) → `npx cap sync ios` → keychain → fastlane
  (`testflight` o `appstore`) → artefacto IPA + report.xml.
- `.github/workflows/testflight.yml` — push a `develop` → lane `testflight`.
- `.github/workflows/appstore.yml` — push a `main` → lane `appstore` (sin auto-publicar).

Fastlane (ios/fastlane/Fastfile): ASC API key autenticación, match para firma,
build number = `100 + GITHUB_RUN_NUMBER` (monotónico, sin colisiones).

## 3. Secrets a configurar en GitHub (Settings → Secrets and variables → Actions)

### Secrets (OBLIGATORIOS para que el pipeline funcione)
| Secret | Qué es | Cómo obtenerlo |
|---|---|---|
| `ASC_KEY_ID` | ID de la API key de App Store Connect | App Store Connect → Users and Access → Integrations → App Store Connect API → Team Keys → generar key (rol **App Manager** mínimo) |
| `ASC_ISSUER_ID` | Issuer ID (arriba de la lista de keys) | Misma página |
| `ASC_KEY_P8_BASE64` | Contenido del archivo `.p8` **en base64** | `base64 -i AuthKey_XXXX.p8 \| pbcopy` (mac) o `certutil -encode` (win) |
| `APPLE_TEAM_ID` | Team ID de Apple Developer | Membership details (ej. `ABC123DEF4`) |
| `MATCH_GIT_URL` | Repo PRIVADO que alojará certificados (match) | Crear repo vacío privado p. ej. `FontalvoB/apple-certs` y poner su URL |
| `MATCH_PASSWORD` | Contraseña de cifrado del repo de match | Contraseña larga nueva (guárdala en el gestor del equipo) |
| `KEYCHAIN_PASSWORD` | Password del keychain temporal del runner macOS | Cualquier valor largo aleatorio (solo CI) |

### Variables (no secretas)
| Var | Valor | Nota |
|---|---|---|
| `VITE_API_BASE_URL_TESTFLIGHT` | URL del backend **DEV** p. ej. `https://dev-api.peoplenet.info/api` | **PENDIENTE**: no existe backend dev desplegado aún; mientras tanto TestFlight apuntará al placeholder (falla visible) |
| `VITE_API_BASE_URL_PRODUCTION` | `https://tech.peoplenet.info/api` | Backend prod verificado (health UP) |

## 4. Bloqueadores y pendientes ANTES del primer despliegue

1. **Certificado TLS de producción EXPIRADO** (`tech.peoplenet.info`): `SEC_E_CERT_EXPIRED`.
   iOS (ATS) rechaza TLS inválido en release. Renovarlo en el host del backend ANTES de
   publicar a App Store (TestFlight con backend dev no lo padece).
2. **Backend DEV desplegable**: crear/reutilizar un despliegue de `kpis-ms` (develop) con
   HTTPS válido y CORS abierto al origen de la app (`app.cors.allowed-origins`).
   Para Capacitor nativo el "origen" es `capacitor://localhost` (iOS) / `https://localhost`
   (Android scheme) — o simplemente permitir ambos hosts.
3. **Proyecto iOS aún no generado** (`ios/` sin App.xcodeproj): el workflow lo genera con
   `npx cap add ios` en el runner macOS; PERO para registrar el App ID
   `com.peoplenet.app` en el portal y para `match init` se necesita que exista al menos
   una vez. Recomendado: primer push a `develop` hace todo (cap add + match readonly
   fallará si el repo de certs está vacío → ver paso de activación).
4. **match primera vez**: el repo de certs debe estar INICIALIZADO con certificados
   válidos: en un Mac con acceso Apple ID → `bundle exec fastlane match init` (o ya está
   el Matchfile) y `bundle exec fastlane match appstore` (create). Luego CI usa readonly.
5. **App Store Connect**: crear la app (Bundle ID `com.peoplenet.app`, SKU
   `peoplenet-mobile`) — el primer `pilot` la crea automáticamente si la API key tiene
   permisos, pero el App ID hay que registrarlo en el portal de developer.
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
