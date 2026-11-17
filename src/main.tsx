import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

import "./theme/variables.css";
import "./redesign/native.css";

// Sincroniza el modo instalado, incluida la señal propia de iOS.
const standaloneMedia = window.matchMedia("(display-mode: standalone)");
const syncAppMode = () => {
  const iosStandalone = (navigator as Navigator & { standalone?: boolean })
    .standalone === true;
  document.documentElement.dataset.appMode =
    standaloneMedia.matches || iosStandalone ? "standalone" : "browser";
};

syncAppMode();
standaloneMedia.addEventListener("change", syncAppMode);
window.addEventListener("pageshow", syncAppMode);

// Evita acumular listeners durante la recarga de módulos en desarrollo.
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    standaloneMedia.removeEventListener("change", syncAppMode);
    window.removeEventListener("pageshow", syncAppMode);
  });
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
