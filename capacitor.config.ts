import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Configuración de Capacitor — PeopleNet (com.peoplenet.app).
 *
 * La URL del backend NO se define aquí: se resuelve en build web
 * (src/lib/config.ts vía .env.[mode] / variables de CI). El contenedor
 * nativo sirve dist/ embebido y consume la API con URL absoluta.
 */
const config: CapacitorConfig = {
  appId: "com.peoplenet.app",
  appName: "PeopleNet",
  webDir: "dist",
  server: {
    // Esquema seguro en Android nativo: evita mixed-content al consumir
    // APIs https y habilita contextos seguros (fetch, storage).
    androidScheme: "https",
  },
  ios: {
    // Contenido embebido servido bajo el esquema seguro de Capacitor;
    // ATS exige TLS válido en las APIs remotas (cert de prod al día).
    contentInset: "always",
  },
};

export default config;
