# Screenshots App Store — PeopleNet v1.0 (solo iPhone)

## Requisito Apple (2026)
- **1 tamaño obligatorio:** iPhone 6.9" → **1320×2868** (iPhone 16 Pro Max) o **1290×2796** (iPhone 15/14 Pro Max, 15 Plus).
- Formato: PNG o JPEG, sin transparencia, sin marcos ni textos ajenos al sistema.
- Si la carpeta `en-US` tiene metadata, Apple exige screenshots también para ese locale → copiar los mismos PNG.
- Mínimo recomendado: **4–6 screenshots** (hasta 10).

## Cómo capturar (TestFlight ya instalado)
1. Instalar el build de TestFlight más reciente en el iPhone.
2. Ajustes iOS → App Store → desactivar "descargas automáticas" no es necesario; usar **modo no molestar silencioso** y fondo limpio.
3. Capturar con botones laterales. Los screenshots salen al tamaño exacto del dispositivo (1290×2796 o 1320×2868).
4. Nombrar los archivos descriptivamente (deliver los asocia por resolución) y copiarlos a:
   - `fastlane/metadata/screenshots/es-419/`
   - `fastlane/metadata/screenshots/en-US/` (los mismos)
5. Commit + push a la rama actual.

## Guion de capturas (en este orden)
| # | Pantalla | Estado | Qué mostrar |
|---|----------|--------|-------------|
| 1 | Login | vacío | Pantalla de acceso con logo y eslogan «Conectamos personas y posibilidades» |
| 2 | Resumen (Home) | demo | KPIs principales, saludo, accesos rápidos |
| 3 | Mis indicadores | demo | Gráficas de KPIs legibles |
| 4 | Permisos y solicitudes | demo | Lista de solicitudes con estados (Aprobada/Pendiente) |
| 5 | Documentos | demo | Lista de documentos |
| 6 | Certificados | demo | Certificados disponibles para descarga |

## Antes de capturar
- Cargar la cuenta **demo** (la que irá en App Review) para que las pantallas muestren datos de ejemplo limpios y reales.
- Verificar que el build de TestFlight apunte a PROD y cargue datos (el login en nativo ya funciona: CORS verificado 2026-10-08).

## Alternativa: subirlas directamente en ASC
También se pueden subir manualmente en App Store Connect → PeopleNet → Distribución → versión 1.0 → «Capturas de pantalla». En ese caso el workflow `appstore-submit` correrá con `skip_screenshots` (ajustar `skip_screenshots: false` → `true` en el Fastfile si no se commitean).
