import { useState, type FormEvent } from "react";
import { useHistory } from "react-router-dom";
import { Icon, Brand, Button } from "./shared";
import { login, toApiError } from "../lib/api";

/**
 * M1 — Login real contra POST /api/auth/login.
 * - Sin credenciales ni entrada demo hardcodeadas.
 * - El botón se deshabilita durante el submit para evitar doble petición.
 * - Errores en español (credencial inválida, red, 5xx).
 * - requirePasswordChange=true: mensaje claro y avance bloqueado (la sesión
 *   no se guarda: api.login() no persiste en ese caso).
 */
export function Login() {
  const history = useHistory();
  const [show, setShow] = useState(false);
  const [help, setHelp] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [passwordChangeRequired, setPasswordChangeRequired] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;
    setError("");
    setPasswordChangeRequired(false);
    const user = username.trim();
    const pass = password;
    if (!user || !pass) {
      setError("Ingresa tu usuario y tu contraseña.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await login({ username: user, password: pass });
      if (response.requirePasswordChange === true) {
        // Cuenta bloqueada por política de cambio de contraseña: no avanzar
        // ni crear sesión (decisión O0; flujo de cambio pendiente de backend).
        setPasswordChangeRequired(true);
        setError(
          "Tu cuenta requiere cambiar la contraseña antes de continuar. " +
            "Usa la opción de recuperación de acceso o contacta a Gestión Humana.",
        );
        return;
      }
      history.push("/dashboard");
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="pn-login">
      <section className="pn-login-story">
        <Brand />
        <div className="login-story-copy">
          <span className="login-kicker">
            <i /> TU TALENTO. NUESTRAS POSIBILIDADES.
          </span>
          <h1>
            El mejor lugar
            <br />
            para <em>crecer,</em>
            <br />
            es juntos.
          </h1>
          <p>
            Un espacio que conecta lo que haces,
            <br />
            lo que necesitas y lo que puedes llegar a ser.
          </p>
          <div className="login-art">
            <div className="art-orbit" />
            <div className="art-arch" />
            <div className="art-yellow" />
            <div className="art-dot" />
            <div className="art-card">
              <Icon name="trending_up" />
              <span>
                Pequeños pasos.<strong>Grandes logros.</strong>
              </span>
              <span className="art-bars">
                <i />
                <i />
                <i />
                <i />
                <i />
              </span>
            </div>
          </div>
        </div>
        <div className="login-bottom">
          <span>Personas primero. Siempre.</span>
          <span>Hecho para ti ✦</span>
        </div>
      </section>
      <section className="pn-login-form">
        <span className="login-top">TU PORTAL DE TALENTO HUMANO</span>
        <div className="login-form-inner">
          <span className="welcome-icon">
            <Icon name="waving_hand" size={26} />
          </span>
          <h2>Qué bueno verte de nuevo.</h2>
          <p>Tu próximo gran día empieza aquí.</p>
          <form onSubmit={handleSubmit}>
            <label htmlFor="login-username">
              Usuario o correo corporativo
            </label>
            <input
              id="login-username"
              type="text"
              placeholder="nombre.usuario"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={submitting}
              required
            />
            <label htmlFor="login-password">Contraseña</label>
            <div className="password-field">
              <input
                id="login-password"
                type={show ? "text" : "password"}
                placeholder="Ingresa tu contraseña"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                required
              />
              <button
                type="button"
                aria-label={
                  show ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                onClick={() => setShow(!show)}
                disabled={submitting}
              >
                <Icon name={show ? "visibility_off" : "visibility"} />
              </button>
            </div>
            <div className="login-options">
              <span>Accede con tus credenciales.</span>
              <button type="button" onClick={() => setHelp(!help)}>
                ¿Necesitas ayuda?
              </button>
            </div>
            {help && (
              <div className="pn-info">
                Si olvidaste tu contraseña o tu usuario, contacta a Gestión
                Humana para recuperar tu acceso.
              </div>
            )}
            {error && (
              <p role="alert" className="pn-info">
                {error}
              </p>
            )}
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                "Iniciando sesión…"
              ) : (
                <>
                  Iniciar sesión <Icon name="arrow_forward" size={18} />
                </>
              )}
            </Button>
          </form>
          {passwordChangeRequired && (
            <div className="login-divider">
              <span>Tu acceso está bloqueado hasta cambiar la contraseña</span>
            </div>
          )}
          <div className="login-trust">
            <Icon name="verified_user" size={16} />
            <span>Tu espacio personal, en un solo lugar.</span>
          </div>
        </div>
        <div className="login-form-footer">
          © 2026 PeopleNet <span>Conectamos personas y posibilidades.</span>
        </div>
      </section>
    </main>
  );
}
