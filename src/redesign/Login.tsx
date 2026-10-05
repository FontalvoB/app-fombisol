import { useState } from "react";
import { useHistory } from "react-router-dom";
import { Icon, Brand, Button } from "./shared";

export function Login() {
  const history = useHistory();
  const [show, setShow] = useState(false);
  const [help, setHelp] = useState(false);
  return (
    <div className="pn-login">
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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              history.push("/dashboard");
            }}
          >
            <label>
              Correo corporativo
              <input
                type="email"
                placeholder="nombre@empresa.com"
                autoComplete="email"
                required
              />
            </label>
            <label>
              Contraseña
              <div className="password-field">
                <input
                  type={show ? "text" : "password"}
                  placeholder="Ingresa tu contraseña"
                  autoComplete="current-password"
                  required
                  minLength={4}
                />
                <button
                  type="button"
                  aria-label={
                    show ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  onClick={() => setShow(!show)}
                >
                  <Icon name={show ? "visibility_off" : "visibility"} />
                </button>
              </div>
            </label>
            <div className="login-options">
              <span>Acceso de demostración</span>
              <button type="button" onClick={() => setHelp(!help)}>
                ¿Necesitas ayuda?
              </button>
            </div>
            {help && (
              <div className="pn-info">
                Esta es una demo: usa cualquier correo y una contraseña de al
                menos 4 caracteres, o entra con el acceso de exploración.
              </div>
            )}
            <Button type="submit">
              Iniciar sesión <Icon name="arrow_forward" size={18} />
            </Button>
          </form>
          <div className="login-divider">
            <span>o descubre tu nuevo espacio</span>
          </div>
          <Button secondary onClick={() => history.push("/dashboard")}>
            Explorar la demo <Icon name="arrow_outward" size={18} />
          </Button>
          <div className="login-trust">
            <Icon name="verified_user" size={16} />
            <span>Tu espacio personal, en un solo lugar.</span>
          </div>
        </div>
        <div className="login-form-footer">
          © 2026 PeopleNet <span>Conectamos personas y posibilidades.</span>
        </div>
      </section>
    </div>
  );
}
