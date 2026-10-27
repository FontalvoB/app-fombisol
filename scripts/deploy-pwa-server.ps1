# Deploy del PWA PeopleNet al sitio IIS del Windows Server.
# Sin tildes en comentarios/strings para evitar problemas de encoding en PS 5.1.
#
# Uso (en el servidor, con dist/ ya copiado junto a este script):
#   powershell -ExecutionPolicy Bypass -File scripts\deploy-pwa-server.ps1
# Parametros:
#   -SitePath  carpeta raiz del sitio IIS (default C:\inetpub\peoplenet-pwa)
#   -DistPath  carpeta dist del build (default ..\dist relativo a este script)
param(
  [string]$SitePath = "C:\inetpub\peoplenet-pwa",
  [string]$DistPath = ""
)

$ErrorActionPreference = "Stop"

# Layout auto-detectado:
#   - release zip  (dist y web.config junto a este script)
#   - repo checkout (dist y deploy\web.config un nivel arriba)
if (-not $DistPath) {
  if (Test-Path (Join-Path $PSScriptRoot "dist")) {
    $DistPath = Join-Path $PSScriptRoot "dist"
  }
  else {
    $DistPath = Join-Path $PSScriptRoot "..\dist"
  }
}
$cfg = if (Test-Path (Join-Path $PSScriptRoot "web.config")) {
  Join-Path $PSScriptRoot "web.config"
}
else {
  Join-Path $PSScriptRoot "..\deploy\web.config"
}

if (-not (Test-Path $DistPath)) {
  throw "No existe '$DistPath'. Ejecuta primero: npm run build:pwa"
}
if (-not (Test-Path (Join-Path $DistPath "sw.js"))) {
  throw "'$DistPath' no contiene sw.js - el build no fue en modo pwa (usa npm run build:pwa)"
}
if (-not (Test-Path $SitePath)) {
  New-Item -ItemType Directory -Path $SitePath -Force | Out-Null
}

# 1) Espejo dist -> sitio (borra assets hashados de releases anteriores)
robocopy $DistPath $SitePath /MIR /NFL /NDL /NJH /NJS /NP | Out-Null
$rc = $LASTEXITCODE
if ($rc -ge 8) { throw "robocopy fallo con codigo $rc" }

# 2) web.config del repo manda (source of truth del proxy /api y cache headers)
if (Test-Path $cfg) {
  Copy-Item $cfg (Join-Path $SitePath "web.config") -Force
}
else {
  Write-Warning "web.config no encontrado - se conserva el web.config existente del sitio"
}

Write-Host ""
Write-Host "Deploy OK  ($DistPath -> $SitePath, robocopy rc=$rc)"
Write-Host "Verifica:  https://app.peoplenet.info/  y  https://app.peoplenet.info/api/actuator/health"
