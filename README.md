# PeopleNet Mobile

App móvil de recursos humanos construida con **Ionic + React + Vite + Capacitor**.

Incluye login, dashboard, KPIs, documentos, solicitudes de permisos, organigrama, notificaciones y perfil de usuario.

## Requisitos

- Node.js 18+
- npm

## Desarrollo (navegador)

```bash
npm install
npm run dev
```

Abre `http://localhost:5173` en el navegador.

## Build de producción

```bash
npm run build
npm run preview
```

## App nativa con Capacitor

Para compilar en iOS o Android:

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap init
npm run build
npx cap add android   # o ios
npx cap sync
npx cap open android  # o ios
```

## Estructura

```
src/
├── components/     # Layout compartido (DashboardLayout)
├── lib/            # Datos mock
├── pages/          # Pantallas de la app
├── styles/         # Tailwind + estilos PeopleNet
└── theme/          # Variables Ionic (colores de marca)
```

## Demo

En login, usa cualquier correo y contraseña para entrar al dashboard.
