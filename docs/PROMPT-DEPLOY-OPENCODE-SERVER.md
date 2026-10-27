# Prompt para OpenCode en el Windows Server — Despliegue PWA PeopleNet

Copiar y pegar en OpenCode corriendo en el Windows Server (RDP).
Antes de pegarlo, copiar el zip `peoplenet-pwa-release.zip` (build PWA ya
compilado, generado en el repo dev) a una ruta conocida, p. ej.
`C:\Users\Administrator\Desktop\peoplenet-pwa-release.zip`, y ajustar
`<RUTA_DEL_ZIP>` en el prompt. Requiere el registro DNS de
`app.peoplenet.info` ya creado en GoDaddy (ver guía GoDaddy/GTD abajo).

---

```text
CONTEXTO
Eres el agente de OpenCode en el Windows Server de Fombisol (IP pública
179.50.79.202). En este server ya corren el frontend Angular
(https://peoplenet.info) y el backend Spring Boot "kpis-ms" (127.0.0.1:8080).
Tu tarea: desplegar la PWA de PeopleNet (app-fombisol) como UN NUEVO sitio
web en el subdominio app.peoplenet.info, sirviendo el shell estático desde
IIS y proxyeando /api al backend local (same-origin: sin CORS, sin preflight).
NO modifiques el sitio existente de peoplenet.info ni el servicio del backend.

ARTEFACTO
El build ya compilado está en el zip <RUTA_DEL_ZIP>. Si esa ruta no existe,
pregúntame la ruta real antes de continuar. Extraer con Expand-Archive.
Estructura del zip (todo en una carpeta raíz):
  dist/                      → shell estático del PWA (index.html, sw.js,
                               manifest.webmanifest, registerSW.js, assets/,
                               icons/, icon.svg, fonts/, images/)
  web.config                 → configuración IIS lista: MIME .webmanifest,
                               reglas URL Rewrite (redirect HTTP→HTTPS,
                               proxy /api → http://127.0.0.1:8080, SPA
                               fallback), caché (assets inmutables 1 año,
                               index.html/sw.js/manifest DisableCache),
                               límite de subida 50 MB
  deploy-pwa-server.ps1      → deploy idempotente por robocopy espejo
  PWA-DESPLIEGUE-WINDOWS-SERVER.md → guía completa de referencia

PASOS
1. Detectar el stack web: peoplenet.info puede servirse con IIS (camino
   principal) o nginx. Verifica con:
     & "$env:windir\system32\inetsrv\appcmd.exe" list sites
     Get-Process | Where-Object { $_.Name -match 'nginx' }
   Si es nginx, usa el Apéndice A de la guía (equivalente nginx) en vez de IIS.

2. IIS — módulos:
   a. Verifica que URL Rewrite 2.1 y ARR están instalados
      (módulos en %windir%\System32\inetsrv\ o DLL rewriter/proxy en
      applicationHost.config). Si el sitio actual de peoplenet.info ya
      proxyea /api, ambos ya están.
   b. Habilita el proxy de ARR si no está activo:
      & "$env:windir\system32\inetsrv\appcmd.exe" set config `
        -section:system.webServer/proxy /enabled:"True" /commit:apphost

3. IIS — sitio:
   a. Extrae el zip y copia el CONTENIDO de dist/ a C:\inetpub\peoplenet-pwa
      (archivos directamente en la raíz, sin carpeta dist intermedia).
   b. Copia web.config a la raíz del sitio (C:\inetpub\peoplenet-pwa\web.config).
      Alternativa idempotente: ejecuta deploy-pwa-server.ps1 apuntando al zip
      extraído:
        powershell -ExecutionPolicy Bypass -File deploy-pwa-server.ps1 `
          -SitePath C:\inetpub\peoplenet-pwa
   c. Crea el sitio IIS con binding http en el host app.peoplenet.info:80:
        & "$env:windir\system32\inetsrv\appcmd.exe" add site /name:"peoplenet-pwa" `
          /physicalPath:"C:\inetpub\peoplenet-pwa" `
          /bindings:"http/*:80:app.peoplenet.info"
        & "$env:windir\system32\inetsrv\appcmd.exe" start site /site.name:"peoplenet-pwa"
   d. Verifica permisos de lectura para IIS_IUSRS/IIS AppPool en la carpeta.

4. HTTPS (obligatorio para PWA):
   a. Busca un wildcard *.peoplenet.info existente:
        Get-ChildItem Cert:\LocalMachine\My | Select-Object Subject,NotAfter,Thumbprint
      Si existe, crea el binding https 443 con SNI usando ese thumbprint:
        New-WebBinding -Name peoplenet-pwa -Protocol https -Port 443 `
          -HostHeader app.peoplenet.info -SslFlags 1
        (Get-WebConfiguration "system.applicationHost/sites/site[@name='peoplenet-pwa']").
          bindings.Add(...)  # o IIS Manager si New-WebBinding no está
        netsh http add sslcert ...  # según el método que funcione
   b. Si NO hay wildcard, emite cert Let's Encrypt con win-acme:
      descarga https://www.win-acme.com (wacs-x64.zip) a C:\tools\win-acme y:
        C:\tools\win-acme\wacs.exe --source iis --site-id <ID> `
          --installation iis --store certificatestore
      (requiere que app.peoplenet.info ya resuelva en DNS y puerto 80
      alcanzable desde internet). Deja la renovación automática que crea
      wacs y verifica la tarea: schtasks /query | findstr /i acme
   c. Si el DNS de app.peoplenet.info aún no responde, deja el binding https
      pendiente y REPÓRTELO: el cert HTTP-01 no puede emitirse sin DNS.

5. VERIFICACIÓN (reporta el resultado de cada una con su código HTTP):
     Invoke-WebRequest http://app.peoplenet.info/ -UseBasicParsing
        → esperado 200 (o 301 a https si 443 ya está)
     Invoke-WebRequest https://app.peoplenet.info/ -UseBasicParsing
        → 200 text/html
     Invoke-WebRequest https://app.peoplenet.info/manifest.webmanifest
        → 200 application/manifest+json
     Invoke-WebRequest https://app.peoplenet.info/sw.js
        → 200 text/javascript (NO text/html: si da html, el SPA fallback
          está capturando sw.js — revisa las reglas de rewrite)
     Invoke-WebRequest https://app.peoplenet.info/api/actuator/health
        → {"status":"UP",...} (proxy ARR funcionando)
     Invoke-WebRequest https://app.peoplenet.info/login
        → 200 text/html (SPA fallback funcionando)
     Cabeceras de caché: index.html y sw.js con Cache-Control no-cache/no-store;
     /assets/index-*.js con max-age=31536000.

6. REPORTE FINAL (obligatorio): stack detectado (IIS/nginx), comandos
   ejecutados y su salida relevante, certificado usado o emitido (subject +
   vigencia), tabla de verificaciones con códigos HTTP, y pendientes
   (DNS, firewall perimetral de GTD, etc.).

RESTRICCIONES
- No modificar el sitio peoplenet.info existente, sus bindings ni app pools.
- No tocar el servicio del backend (solo consultar su estado/health).
- No ejecutar iisreset global: comparten server otros sitios. Si necesitas
  reiniciar algo, solo appcmd stop/start del sitio peoplenet-pwa.
- Firewall perimetral/NAT: lo gestiona GTD — NO abras puertos ahí; puedes
  revisar reglas locales (Get-NetFirewallRule) para 80/443 y reportar.
- Si algo falla, diagnostica con IIS logs / Event Viewer y reporta el error
  EXACTO antes de improvisar.
```

---

## Pasos MANUALES del usuario (GoDaddy + GTD)

### GoDaddy (DNS)

1. Iniciar sesión en godaddy.com → **My Products** → junto a `peoplenet.info` → **DNS / Manage DNS**.
2. En la tabla de registros → **Add New Record**:
   - **Type:** `CNAME` · **Name:** `app` · **Value:** `peoplenet.info` · **TTL:** 600
   - (alternativa: registro `A` con Value `179.50.79.202`; el CNAME es preferible
     para subdominios porque hereda cambios futuros del IP del server)
3. **Save**. Propagación 5–15 min; verificar desde cualquier máquina:
   `nslookup app.peoplenet.info` o `Resolve-DnsName app.peoplenet.info`.

### GTD (proveedor de infraestructura)

Ticket sugerido:

> Solicitud: habilitar acceso web para subdominio `app.peoplenet.info`
> (misma IP pública 179.50.79.202 y mismos puertos que `peoplenet.info`).
>
> 1. Confirmar que el NAT/firewall perimetral permite HTTP (80) y HTTPS (443)
>    entrantes hacia el server para el vhost `app.peoplenet.info`
>    (mismo destino que peoplenet.info — solo si hay filtrado por Host/SNI se
>    requiere agregar el subdominio a la misma política del WAF).
> 2. Confirmar que el challenge HTTP-01 de Let's Encrypt
>    (`http://app.peoplenet.info/.well-known/acme-challenge/…`) llegará al
>    server sin interceptar/reescribir (para emitir el cert TLS del PWA).
> 3. Si el WAF Barracuda aplica a este vhost: misma política que
>    peoplenet.info (OPTIONS ya permitido el 2026-10-27 — gracias).

Con OPTIONS ya desbloqueado, no hay que pedir nada más: same-origin evita
CORS por completo y el backend no cambia.
