/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

/** Versión y fecha ISO de la compilación que se está ejecutando. */
declare const __APP_VERSION__: string;
declare const __BUILD_TIME__: string;

/** Variables de entorno disponibles en la app (definidas en .env.[mode] o inyectadas por CI). */
interface ImportMetaEnv {
  /** Modo de la app: development | testflight | production | pwa. */
  readonly VITE_APP_ENV?: string;
  /** Base de la API: '/api' en web dev (proxy) o URL absoluta en builds nativos. */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
