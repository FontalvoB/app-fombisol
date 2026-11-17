import { useCallback, useEffect, useRef, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import "./PwaUpdatePrompt.css";

const CHECK_INTERVAL_MS = 60 * 60 * 1000;
const CHECK_THROTTLE_MS = 5 * 60 * 1000;
const SNOOZE_MS = 30 * 60 * 1000;
const SNOOZE_KEY = "pn-update-snoozed-until";
const UPDATE_TIMEOUT_MS = 12 * 1000;
const buildDate = new Date(__BUILD_TIME__).toLocaleString("es-CO");
// Solo el canal PWA (web instalable) registra el SW y muestra el aviso.
// Las builds nativas de Capacitor no pasan por este flujo.
const isPwaBuild = import.meta.env.VITE_APP_ENV === "pwa";

function snoozeRemaining(): number {
  try {
    const until = Number(localStorage.getItem(SNOOZE_KEY));
    return Number.isFinite(until) ? Math.max(0, until - Date.now()) : 0;
  } catch {
    return 0;
  }
}

export default function PwaUpdatePrompt() {
  return isPwaBuild ? <RegisteredPwaUpdatePrompt /> : null;
}

function RegisteredPwaUpdatePrompt() {
  const registrationRef = useRef<ServiceWorkerRegistration>();
  const checkingRef = useRef(false);
  const lastCheckRef = useRef<number | null>(null);
  const updateRequestedRef = useRef(false);
  const readyToReloadRef = useRef(false);
  const updateTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const [updating, setUpdating] = useState(false);
  const [snoozed, setSnoozed] = useState(() => snoozeRemaining() > 0);
  const [error, setError] = useState("");

  const checkForUpdates = useCallback(async () => {
    const registration = registrationRef.current;
    const now = Date.now();
    if (
      !registration ||
      !navigator.onLine ||
      registration.installing ||
      checkingRef.current ||
      (lastCheckRef.current !== null &&
        now - lastCheckRef.current < CHECK_THROTTLE_MS)
    ) {
      return;
    }

    checkingRef.current = true;
    lastCheckRef.current = now;
    try {
      await registration.update();
    } catch (cause: unknown) {
      // Un fallo de red no elimina una actualización que ya esté pendiente.
      console.warn("No se pudo comprobar la actualización de la PWA.", cause);
    } finally {
      checkingRef.current = false;
    }
  }, []);

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      registrationRef.current = registration;
      void checkForUpdates();
    },
    onNeedReload() {
      // Otra pestaña puede activar el SW; esta solo recarga con consentimiento.
      readyToReloadRef.current = true;
      if (updateRequestedRef.current) window.location.reload();
    },
    onRegisterError(cause: unknown) {
      console.warn("No se pudo registrar el service worker de la PWA.", cause);
    },
  });

  useEffect(() => {
    const check = () => void checkForUpdates();
    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", check);
    window.addEventListener("online", check);
    const interval = window.setInterval(check, CHECK_INTERVAL_MS);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", check);
      window.removeEventListener("online", check);
      window.clearInterval(interval);
      clearTimeout(updateTimeoutRef.current);
      updateRequestedRef.current = false;
    };
  }, [checkForUpdates]);

  useEffect(() => {
    if (!snoozed) return;
    // La pausa se conserva entre recargas dentro de la misma versión.
    const remaining = snoozeRemaining();
    if (remaining === 0) {
      setSnoozed(false);
      return;
    }
    const timeout = window.setTimeout(() => {
      try {
        localStorage.removeItem(SNOOZE_KEY);
      } catch {
        // Sin almacenamiento no hay pausa persistida que limpiar.
      }
      setSnoozed(false);
    }, remaining);
    return () => window.clearTimeout(timeout);
  }, [snoozed]);

  const snooze = () => {
    try {
      localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_MS));
      setSnoozed(true);
    } catch {
      // Sin almacenamiento no se puede conservar la pausa; el aviso sigue visible.
    }
  };

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    // Red de seguridad: si el SW nuevo toma el control, recarga una sola vez.
    const onControllerChange = () => {
      if (updateRequestedRef.current) window.location.reload();
    };
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange,
    );
    return () =>
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange,
      );
  }, []);

  const updateNow = async () => {
    if (updateRequestedRef.current) return;
    updateRequestedRef.current = true;
    setUpdating(true);
    setError("");
    try {
      localStorage.removeItem(SNOOZE_KEY);
    } catch {
      // Sin almacenamiento no hay pausa persistida que limpiar.
    }

    const recover = () => {
      clearTimeout(updateTimeoutRef.current);
      updateRequestedRef.current = false;
      setUpdating(false);
      setError("No pudimos actualizar. Inténtalo de nuevo en unos momentos.");
    };

    const registration = registrationRef.current;
    // Si el SW nuevo ya se activó (por ejemplo, desde otra pestaña), solo
    // falta recargar; mandar SKIP_WAITING a un SW que ya no espera no hace nada.
    if (registration && !registration.waiting) {
      window.location.reload();
      return;
    }

    // La promesa confirma el envío del mensaje, no la activación del SW.
    updateTimeoutRef.current = setTimeout(recover, UPDATE_TIMEOUT_MS);
    try {
      await updateServiceWorker(true);
      if (readyToReloadRef.current && updateRequestedRef.current) {
        window.location.reload();
      }
    } catch (cause: unknown) {
      console.warn("No se pudo activar la actualización de la PWA.", cause);
      recover();
    }
  };

  if (!needRefresh || snoozed) return null;

  return (
    <aside
      className="pwa-update-prompt"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-labelledby="pwa-update-title"
    >
      <h2 id="pwa-update-title">Nueva versión disponible</h2>
      <p>
        Actualiza PeopleNet para recibir las novedades. Tu sesión se mantiene;
        guarda lo que estés editando antes de continuar.
      </p>
      <small>
        Versión {__APP_VERSION__} · Compilación del{" "}
        <time dateTime={__BUILD_TIME__}>{buildDate}</time>
      </small>
      {error && <p className="pwa-update-prompt__error">{error}</p>}
      <div className="pwa-update-prompt__actions">
        <button
          type="button"
          className="pwa-update-prompt__primary"
          disabled={updating}
          onClick={() => void updateNow()}
        >
          {updating ? "Actualizando…" : "Actualizar ahora"}
        </button>
        <button
          type="button"
          disabled={updating}
          onClick={snooze}
        >
          Más tarde
        </button>
      </div>
    </aside>
  );
}
