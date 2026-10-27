# AGENTS.md — app-fombisol (PeopleNet móvil)

Ionic React sobre Vite (React 18, TypeScript, Tailwind 4). **Canal principal: PWA
instalable** (manifest + Workbox vía `vite-plugin-pwa`, build `npm run build:pwa`).
Capacitor (`android/`, `ios/`) queda como contenedor legacy — las tiendas ya no se
publican (decisión 2026-10-27). Despliegue web en el Windows Server de
peoplenet.info (IIS, same-origin `/api` → `:8080`): `docs/PWA-DESPLIEGUE-WINDOWS-SERVER.md`.
Dev server en 5173 con proxy `/api` → kpis-ms `:8080` (vite.config.ts).

## Commands

```bash
npm install
npm run dev          # vite → http://localhost:5173
npm run build        # tsc && vite build (mode development)
npm run build:pwa    # PWA instalable → dist/ con sw.js + manifest.webmanifest
npm run preview      # sirve dist/ en :4173 (verificar SW + manifest)

node scripts/generate-pwa-icons.mjs   # regenerar public/icons/ si cambia la marca

# Release al Windows Server (dist/ ya copiado al server):
powershell -ExecutionPolicy Bypass -File scripts\deploy-pwa-server.ps1
```

- Modos de build: `development` (proxy Vite) · `testflight`/`production` (nativo
  legacy, URL absoluta) · `pwa` (web, `/api` same-origin vía IIS).
- El SW precachea el shell (~750 KB); `/fonts` (10 MB) e `images/people` van a
  caché runtime; las respuestas `/api` NO se cachean (datos por usuario/token).

## Tests e2e (framework `e2e` de TesterArmy)

```bash
npx e2e run           # suite (targets desktop + phone 390x844)
npx e2e run --headed  # ver el navegador
npx e2e list          # listar sin correr
```

- Config `e2e.config.ts`: target `desktop` y `phone` sobre `http://localhost:5173`; arranca Vite si no hay server (`reuseExisting`), log en `.e2e/logs/app.log`.
- Tests deterministas en `tests/*.e2e.ts` (locators + `expect`). Sin `agents` → no se necesita modelo ni API key.
- Para probar la app nativa de Capacitor: sin Android SDK local hoy. Opciones: servir la build (`vite preview`) y apuntar `APP_URL`, o instalar el SDK y migrar el target a `@e2e-dev/mobile`.
- Skill del framework: `.agents/skills/e2e/SKILL.md` — leerla antes de escribir o correr un test e2e. Docs offline: `node_modules/e2e/docs/`.
