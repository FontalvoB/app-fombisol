# PWA — Despliegue en el Windows Server de peoplenet.info

Guía de instalación de **PeopleNet como PWA** en el mismo Windows Server que hospeda
el backend (kpis-ms) y el frontend Angular. Decide 2026-10-27: la app ya **no se
publica en App Store / Google Play**; el canal de distribución es esta PWA
instalable (plataforma privada, dominio interno).

## 1. Arquitectura

```
                       DNS (GoDaddy, zona peoplenet.info)
                       app.peoplenet.info  A  →  179.50.79.202
                                        │
                                        ▼
┌──────────────────────── Windows Server (179.50.79.202) ───────────────────────┐
│                                                                              │
│  IIS — sitio "peoplenet-pwa" (app.peoplenet.info, 80→443 HTTPS)              │
│  ├─ contenido estático: dist/ del build PWA (index.html, sw.js, assets/)     │
│  └─ regla URL Rewrite + ARR:  /api/*  →  http://127.0.0.1:8080/api/*         │
│                                        │                                     │
│                                        ▼                                     │
│                        kpis-ms (Spring Boot, :8080) — SIN cambios            │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Por qué same-origin:** el PWA y la API comparten origen (`app.peoplenet.info`),
el navegador nunca envía preflight CORS y no depende del WAF Barracuda
(que históricamente bloqueaba `OPTIONS /api`; **resuelto por GTD el 2026-10-27**,
pero same-origin se mantiene como arquitectura preferida: sin CORS que
mantener, sin reglas de WAF por origen, headers/cookies sin configuración). El
backend no necesita ningún cambio (su allowlist CORS ni siquiera entra en juego).

**Service worker:** `sw.js` precachea el shell (746 KB) → carga instantánea y
funciona offline tras el primer uso. Fuentes (10 MB en `/fonts`) y portadas jpg
se cachean a demanda (CacheFirst). Las respuestas de `/api` **no** se cachean:
los datos son por usuario (token Bearer) y evitar mostrar datos rancios o
fugas entre sesiones en dispositivos compartidos.

## 2. Prerrequisitos (en tu máquina dev)

- ✅ Conversión PWA ya aplicada al repo (`vite.config.ts` con `VitePWA`,
  `scripts/generate-pwa-icons.mjs`, `.env.pwa`, `npm run build:pwa`).
- Build artefacto:
  ```bash
  cd app-fombisol
  npm run build:pwa        # → dist/ con sw.js, manifest.webmanifest, registerSW.js
  ```

## 3. Paso 1 — DNS: crear el subdominio en GoDaddy

El DNS de `peoplenet.info` vive en **GoDaddy** (nameservers `ns73/ns74.domaincontrol.com`).

1. GoDaddy → **My Products → Domain peoplenet.info → DNS → Manage DNS**.
2. Añadir registro:
   | Tipo | Nombre | Valor | TTL |
   |------|--------|-------|-----|
   | `A` | `app` | `179.50.79.202` | 600 (subir a 3600 cuando esté estable) |
3. Verificar propagación (5–15 min típicamente):
   ```powershell
   nslookup app.peoplenet.info
   # debe devolver 179.50.79.202
   ```

## 4. Paso 2 — Servidor: IIS con reverse proxy para /api

En el Windows Server (RDP), **Paso 0: confirma el stack**. Si el frontend Angular
de `peoplenet.info` se sirve con IIS (lo habitual en Windows Server), sigue IIS.
Si usa nginx, usa el Apéndice A.

### 4.1 Instalar módulos (si no existen)

- **URL Rewrite 2.1** — https://www.iis.net/downloads/microsoft/url-rewrite
- **ARR 3.0** (Application Request Routing) — https://www.iis.net/downloads/microsoft/application-request-routing
  (instala también su dependencia Web Farm Framework si la pide)

Si `peoplenet.info` ya proxyea `/api` hacia el backend en este mismo server,
ambos módulos ya están instalados — salta a 4.2.

### 4.2 Habilitar el proxy de ARR (una sola vez, nivel servidor)

GUI: **IIS Manager → nodo raíz del server → Application Request Routing Cache → Server Proxy Settings → ✅ Enable proxy → Apply**

O por línea de comandos (admin):

```powershell
& "$env:windir\system32\inetsrv\appcmd.exe" set config -section:system.webServer/proxy /enabled:"True" /commit:apphost
```

### 4.3 Crear carpeta del sitio

```powershell
New-Item -ItemType Directory -Path "C:\inetpub\peoplenet-pwa" -Force
```

## 5. Paso 3 — Subir el artefacto y el web.config

Copia `dist/` desde tu máquina dev al servidor (lo que prefieras: carpeta
compartida, RDP clipboard, `scp`). Estructura esperada en el servidor:

```
C:\inetpub\peoplenet-pwa\
├─ web.config          ← de deploy\web.config del repo (source of truth)
├─ index.html
├─ manifest.webmanifest
├─ registerSW.js
├─ sw.js
├─ workbox-*.js
├─ icon.svg, icons\*.png
├─ assets\*.js / *.css / *.png
├─ fonts\*.ttf
└─ images\people\*.jpg
```

> El `web.config` del repo (`app-fombisol/deploy/web.config`) ya trae: MIME de
> `.webmanifest`, regla proxy `/api` → `127.0.0.1:8080`, SPA fallback
> (`/login` → `index.html`), redirect HTTP→HTTPS, límite de subida 50 MB y
> cabeceras de caché correctas (assets inmutables 1 año; `index.html`/`sw.js`/
> `manifest.webmanifest` con `DisableCache` para que las actualizaciones
> lleguen a los clientes instalados).

## 6. Paso 4 — Crear el sitio IIS

GUI: **IIS Manager → Sites → Add Website**
- Site name: `peoplenet-pwa`
- Physical path: `C:\inetpub\peoplenet-pwa`
- Binding: tipo `http`, host name `app.peoplenet.info`, puerto `80`
  (el binding 443 lo añade win-acme en el paso 5)

O por línea de comandos (admin):

```powershell
appcmd add site /name:"peoplenet-pwa" /physicalPath:"C:\inetpub\peoplenet-pwa" /bindings:"http/*:80:app.peoplenet.info"
appcmd start site /site.name:"peoplenet-pwa"
```

Prueba intermedia (HTTP puro): `http://app.peoplenet.info/` debe devolver la app
y `http://app.peoplenet.info/api/actuator/health` debe responder `{"status":"UP"...}`
desde el propio server (asegúrate de que `spring-boot:run`/el jar esté arriba).

## 7. Paso 5 — HTTPS (Let's Encrypt con win-acme)

Un PWA **exige HTTPS** (service worker + instalación). Usa **win-acme**:

1. Descargar: https://www.win-acme.com (zip `wacs-x64`) → descomprimir en `C:\tools\win-acme`.
2. Ejecutar como admin (requiere el registro DNS del Paso 1 ya propagado y
   puerto 80 alcanzable desde internet — ya lo está para `peoplenet.info`):
   ```powershell
   C:\tools\win-acme\wacs.exe --source iis --site-id <ID_del_sitio> `
     --installation iis --store certificatestore
   ```
   O modo GUI: ejecutar `wacs.exe` → `N` (Create certificate default settings) →
   seleccionar sitio `peoplenet-pwa` → Enter. Crea binding 443 + renewal automático.
3. Verificar: `https://app.peoplenet.info/` con candado válido.

*Alternativa:* si la empresa tiene un certificado wildcard `*.peoplenet.info`,
instala el PFX en CertLM y añade el binding https a mano — win-acme sobra.

## 8. Paso 6 — Firewall

80/443 ya están abiertos para este server (`peoplenet.info` funciona). Solo si
el WAF/firewall perimetral filtra por Host: permitir `app.peoplenet.info` al
mismo backend. No se requiere regla nueva en Windows Defender Firewall.

## 9. Paso 7 — Verificación end-to-end

Desde cualquier máquina:

```powershell
# Shell + PWA
(Invoke-WebRequest "https://app.peoplenet.info/" -UseBasicParsing).StatusCode          # 200
(Invoke-WebRequest "https://app.peoplenet.info/manifest.webmanifest" -UseBasicParsing).StatusCode  # 200 + Content-Type: application/manifest+json
(Invoke-WebRequest "https://app.peoplenet.info/sw.js" -UseBasicParsing).StatusCode     # 200

# API same-origin (sin CORS)
(Invoke-WebRequest "https://app.peoplenet.info/api/actuator/health" -UseBasicParsing).Content   # {"status":"UP"...
```

En navegador (Chrome/Edge):

1. **Application → Manifest**: "Installability: ✓" (iconos 192 + 512 detectados).
2. **Application → Service Workers**: `sw.js` **activated and is running**.
3. Login real contra el backend → dashboard carga (via proxy, mismo origen).
4. **Network offline** (DevTools) + recarga → la app abre desde el caché (shell).
5. Lighthouse → categoría "Installable" ✓ (correr un audit PWA).
6. Instalación: ícono en la barra de direcciones → **Instalar**; en iOS:
   Compartir → **Añadir a pantalla de inicio** (usa `apple-touch-icon`).

## 10. Actualizar releases (el día a día)

```bash
# en dev
npm run build:pwa
# copiar dist/ al server (robocopy por UNC, scp, RDP…) y ahí:
powershell -ExecutionPolicy Bypass -File scripts\deploy-pwa-server.ps1
```

- Los assets son hashados → la copia los reemplaza sin conflictos.
- `index.html`/`sw.js` con `DisableCache` → los clientes instalados se
  actualizan solos en la siguiente visita (`autoUpdate`, sin prompt).
- `cleanupOutdatedCaches` borra el precache viejo. **No hay invalidaciones** (a
  diferencia de CDN): IIS lee del disco.

## 11. Rollback

Conserva la versión anterior antes de cada release:

```powershell
Copy-Item C:\inetpub\peoplenet-pwa C:\inetpub\releases\peoplenet-pwa-20261027 -Recurse
# rollback: copiar de vuelta el contenido de la carpeta de release + web.config
```

## 12. Troubleshooting

| Síntoma | Causa probable | Fix |
|---|---|---|
| `502.3` en `/api/*` | ARR proxy deshabilitado o backend caído | 4.2 + revisar servicio Spring (`:8080`) |
| Manifest 404 o `text/plain` | web.config no copiado | restaurar `deploy\web.config` en la raíz del sitio |
| `/login` da 404 al recargar | falta SPA fallback | regla `PWA-SPA-Fallback` del web.config |
| SW no instala / manifest no aparece | sitio servido por HTTP puro | completar Paso 5 (HTTPS) |
| Redirect loop | binding 443 + regla HTTPS duplicada a nivel server | revisar reglas heredadas del server |
| Uploads fallan >30 MB | límite IIS default (30 MB) | `maxAllowedContentLength` ya en web.config (50 MB); verificar también `siteDefaults` |
| Cambios no aparecen para usuarios | clientes con precache viejo | pedir recarga; el SW actualiza solo en la siguiente visita |

## 13. Notas

- El web Angular de `peoplenet.info` y el backend **no se tocan**.
- Capacitor (`android/`, `ios/`) queda en el repo como contenedor legacy; los
  workflows de tiendas quedan obsoletos (ver `PENDIENTES.md`).
- La sesión vive en `localStorage` de `app.peoplenet.info` — es un origen
  distinto al de `peoplenet.info` (web Angular): sesiones independientes.
- Renovación del cert: win-acme deja tarea programada (verificar en
  `schtasks /query | findstr acme` a los pocos días).

## Apéndice A — Equivalente nginx (si el server usa nginx)

```nginx
server {
  listen 80;
  server_name app.peoplenet.info;
  return 301 https://$host$request_uri;
}

server {
  listen 443 ssl http2;
  server_name app.peoplenet.info;
  root C:/inetpub/peoplenet-pwa;          # ruta con forward slashes
  index index.html;

  # Same-origin: API al backend local
  location /api/ {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    client_max_body_size 50m;
  }

  # SPA fallback
  location / {
    try_files $uri $uri/ /index.html;
  }

  # Cache: assets inmutables, críticos no-cache
  location /assets/ { add_header Cache-Control "public, max-age=31536000, immutable"; }
  location = /index.html   { add_header Cache-Control "no-cache"; }
  location = /sw.js        { add_header Cache-Control "no-cache"; }
  location = /registerSW.js { add_header Cache-Control "no-cache"; }
  location = /manifest.webmanifest { add_header Cache-Control "no-cache"; }
}
```
Añade `ssl_certificate`/`ssl_certificate_key` según el certificado que instales
en el servidor.
