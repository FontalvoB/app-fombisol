import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

/**
 * Configuración del web manifest (PWA instalable). El shell estático se
 * precachea con Workbox (precache manifest del build); fuentes y portadas
 * jpg van a caché runtime para no inflar la instalación inicial.
 */
const pwaManifest = {
  id: '/',
  name: 'PeopleNet · Tu espacio para crecer',
  short_name: 'PeopleNet',
  description:
    'Plataforma interna de Fombisol: KPIs, solicitudes de novedades, documentos corporativos, evaluaciones y perfil de colaborador.',
  lang: 'es',
  dir: 'ltr',
  start_url: '/',
  scope: '/',
  display: 'standalone',
  theme_color: '#045C94',
  background_color: '#0B3E8F',
  categories: ['business', 'productivity'],
  prefer_related_applications: false,
  icons: [
    { src: 'icons/pwa-192.png', sizes: '192x192', type: 'image/png' },
    { src: 'icons/pwa-512.png', sizes: '512x512', type: 'image/png' },
    {
      src: 'icons/pwa-maskable-192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'maskable',
    },
    {
      src: 'icons/pwa-maskable-512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable',
    },
  ],
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // autoUpdate: la nueva versión se activa sola en la siguiente recarga,
      // sin prompt (plataforma privada, sin necesidad de UI de actualización).
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['icon.svg'],
      manifest: pwaManifest,
      workbox: {
        // Código del shell (js/css/html) + svg + el PNG de marca importado por
        // shared.tsx + iconos del manifest. Los TTF de 10 MB en /fonts y las
        // portadas jpg NO se precachean: van a runtime caching.
        globPatterns: [
          '**/*.{js,css,html,svg,ico}',
          'assets/**/*.png',
          'icons/**/*.png',
        ],
        navigateFallback: '/index.html',
        // /api nunca cae al shell: es una SPA pero las rutas API deben ir a red.
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            // Fuentes auto-hospedadas (/fonts/*.ttf de globals.css):
            // CacheFirst — inmutables en la práctica, pesan 3-10 MB.
            urlPattern: /\/fonts\/[^/]+\.(?:ttf|woff2?)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pn-fonts',
              expiration: { maxEntries: 8, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            // CSS de Google Fonts: StaleWhileRevalidate (sirve cacheado y
            // actualiza en background).
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'pn-google-fonts-css',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            // Binarios de Google Fonts: CacheFirst.
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pn-google-fonts-files',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            // Portadas de la UI (/images/people/*.jpg): CacheFirst acotado.
            urlPattern: /\/images\/people\/[^/]+\.(?:jpe?g|png|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pn-people-images',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [200] },
            },
          },
        ],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
      },
      // Sin service worker en dev: no interfiere con e2e ni con HMR.
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // Igual que el web Angular (proxy.conf.json): /api sin quitar el prefijo
      // hacia kpis-ms. changeOrigin evita problemas de Host/VirtualHost.
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
