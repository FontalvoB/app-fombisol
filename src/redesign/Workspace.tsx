import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Link,
  Redirect,
  Route,
  Switch,
  useHistory,
  useLocation,
} from "react-router-dom";
import { Icon, useSaved, Avatar, Brand, Search } from "./shared";
import { nav, initialRequests } from "./data";
import { Home } from "./Home";
import { Login } from "./Login";
import { Kpis } from "./Kpis";
import { Requests, RequestForm } from "./Requests";
import { Documents, Reader } from "./Documents";
import { Team } from "./Team";
import { Evaluations, Chat } from "./Evaluations";
import { Certificates, Notifications, Profile } from "./Account";

export default function Workspace() {
  const location = useLocation();
  const history = useHistory();
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [requests, setRequests] = useSaved("requests", initialRequests);
  const [reads, setReads] = useSaved<string[]>("reads", []);
  const [seen, setSeen] = useSaved<string[]>("seen", []);
  const [profile, setProfile] = useSaved("profile", {
    name: "Álvaro Méndez",
    email: "alvaro.mendez@peoplenet.com",
    phone: "+57 300 123 4567",
  });
  const [evaluated, setEvaluated] = useSaved<string[]>("evaluated", []);
  useEffect(() => {
    if (!menu) return;
    const previous = document.activeElement as HTMLElement | null;
    const panel = menuRef.current;
    const focusable = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled])",
        ) || [],
      ).filter((el) => el.getClientRects().length > 0);
    focusable()[0]?.focus();
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = focusable();
      const first = items[0],
        last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    panel?.addEventListener("keydown", trapFocus);
    return () => {
      panel?.removeEventListener("keydown", trapFocus);
      previous?.focus();
    };
  }, [menu]);
  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenu(false);
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, []);
  useEffect(() => {
    setMenu(false);
    setSearch("");
    document.querySelector(".pn-main")?.scrollTo(0, 0);
  }, [location.pathname]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4200);
    return () => clearTimeout(timer);
  }, [toast]);
  const title =
    nav.find((x) => x[0] && location.pathname.includes(x[0]))?.[2] ||
    (location.pathname.includes("profile")
      ? "Mi perfil"
      : location.pathname.includes("notifications")
        ? "Notificaciones"
        : location.pathname.includes("assistant")
          ? "Asistente Eva"
          : "Resumen");
  if (location.pathname === "/") return <Redirect to="/login" />;
  if (location.pathname === "/login") return <Login />;
  if (!location.pathname.startsWith("/dashboard"))
    return <Redirect to="/dashboard" />;
  return (
    <div className="pn-app">
      {menu && (
        <button
          className="pn-overlay"
          aria-label="Cerrar menú"
          onClick={() => setMenu(false)}
        />
      )}
      <aside
        ref={menuRef}
        className={`pn-sidebar ${menu ? "is-open" : ""}`}
        role={menu ? "dialog" : undefined}
        aria-modal={menu ? true : undefined}
        aria-label={menu ? "Todos los módulos" : undefined}
      >
        <button
          className="vivid-close-menu"
          aria-label="Cerrar navegación"
          onClick={() => setMenu(false)}
        >
          <Icon name="close" />
        </button>
        <Brand />
        <button
          className="pn-workspace"
          onClick={() => history.push("/dashboard/profile")}
        >
          <span className="workspace-icon">P</span>
          <span>
            <strong>PeopleNet Colombia</strong>
            <small>Mi espacio de trabajo</small>
          </span>
          <Icon name="unfold_more" size={18} />
        </button>
        <div className="pn-nav-label">MI ESPACIO</div>
        <nav aria-label="Navegación principal">
          {nav.map(([path, icon, label]) => (
            <Link
              aria-current={
                location.pathname === "/dashboard" + (path ? "/" + path : "")
                  ? "page"
                  : undefined
              }
              className={title === label ? "active" : ""}
              key={path}
              to={"/dashboard" + (path ? "/" + path : "")}
            >
              <Icon name={icon} />
              <span>{label}</span>
              {path === "requests" && (
                <small>
                  {requests.filter((x) => x.status === "Pendiente").length}
                </small>
              )}
            </Link>
          ))}
        </nav>
        <div className="pn-sidebar-bottom">
          <Link className="pn-assistant-card" to="/dashboard/assistant">
            <span className="spark">
              <Icon name="auto_awesome" />
            </span>
            <strong>
              Un poco de ayuda,
              <br />
              muchas posibilidades.
            </strong>
            <p>Tu asistente está a un clic.</p>
            <span>
              Conoce a Eva <Icon name="arrow_outward" size={17} />
            </span>
          </Link>
          <Link className="pn-settings" to="/dashboard/profile">
            <Icon name="settings" /> Mi perfil y preferencias
          </Link>
          <button
            className="pn-user"
            onClick={() => history.push("/dashboard/profile")}
          >
            <Avatar />
            <span>
              <strong>{profile.name}</strong>
              <small>Gerente de Operaciones</small>
            </span>
            <Icon name="chevron_right" size={17} />
          </button>
          <button className="pn-logout" onClick={() => history.push("/login")}>
            <Icon name="logout" size={16} /> Cerrar sesión
          </button>
        </div>
      </aside>
      <div className="pn-main">
        <header className="pn-topbar">
          <button
            className="pn-icon-button mobile-menu"
            aria-label="Abrir menú"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            <Icon name="menu" />
          </button>
          <div className="pn-breadcrumb">
            Mi espacio <Icon name="chevron_right" size={15} />
            <strong>
              {location.pathname.includes("assistant")
                ? "Asistente Eva"
                : title}
            </strong>
          </div>
          <div className="vivid-mobile-brand">
            <Brand />
          </div>
          <Link
            className="vivid-header-eva"
            to="/dashboard/assistant"
            aria-label="Abrir asistente Eva"
          >
            <Icon name="auto_awesome" size={17} />
            <span>Eva</span>
          </Link>
          <div className="pn-global-search">
            <Search
              value={search}
              onChange={setSearch}
              placeholder="Buscar en tu espacio…"
            />
            {search && (
              <div className="pn-search-results">
                {nav
                  .filter((x) =>
                    x[2].toLowerCase().includes(search.toLowerCase()),
                  )
                  .map((x) => (
                    <Link key={x[0]} to={"/dashboard/" + x[0]}>
                      <Icon name={x[1]} />
                      {x[2]}
                    </Link>
                  ))}
                {!nav.some((x) =>
                  x[2].toLowerCase().includes(search.toLowerCase()),
                ) && <p>No hay módulos con ese nombre.</p>}
              </div>
            )}
          </div>
          <span className="pn-demo">Espacio demo</span>
          <Link
            className="pn-icon-button notification-button"
            aria-label="Ver notificaciones"
            to="/dashboard/notifications"
          >
            <Icon name="notifications" />
            {seen.length < 3 && <i />}
          </Link>
          <Link aria-label="Mi perfil" to="/dashboard/profile">
            <Avatar />
          </Link>
        </header>
        <motion.main
          className={`pn-content route-${location.pathname.split("/")[2] || "home"}`}
          key={location.pathname}
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <Switch>
            <Route exact path="/dashboard">
              <Home
                requests={requests}
                reads={reads}
                name={profile.name}
                evaluationComplete={evaluated.includes("self")}
              />
            </Route>
            <Route path="/dashboard/kpis">
              <Kpis notify={setToast} />
            </Route>
            <Route exact path="/dashboard/requests">
              <Requests requests={requests} />
            </Route>
            <Route path="/dashboard/requests/new">
              <RequestForm
                onSave={(r) => {
                  setRequests([r, ...requests]);
                  setToast("Tu solicitud se envió a María Gómez.");
                  history.push("/dashboard/requests");
                }}
              />
            </Route>
            <Route exact path="/dashboard/documents">
              <Documents reads={reads} />
            </Route>
            <Route path="/dashboard/documents/:id">
              <Reader
                reads={reads}
                onRead={(id) => {
                  setReads([...new Set([...reads, id])]);
                  setToast("Lectura confirmada. ¡Gracias por estar al día!");
                }}
              />
            </Route>
            <Route path="/dashboard/org-chart">
              <Team />
            </Route>
            <Route exact path="/dashboard/evaluations">
              <Evaluations evaluated={evaluated} />
            </Route>
            <Route path="/dashboard/evaluations/chat">
              <Chat
                evaluation
                onComplete={() => {
                  setEvaluated([...new Set([...evaluated, "self"])]);
                  setToast("Autoevaluación guardada.");
                }}
              />
            </Route>
            <Route path="/dashboard/assistant">
              <Chat />
            </Route>
            <Route path="/dashboard/certificates">
              <Certificates name={profile.name} />
            </Route>
            <Route path="/dashboard/notifications">
              <Notifications seen={seen} setSeen={setSeen} />
            </Route>
            <Route path="/dashboard/profile">
              <Profile
                profile={profile}
                save={(p) => {
                  setProfile(p);
                  setToast("Tus preferencias se guardaron.");
                }}
              />
            </Route>
            <Route>
              <div className="pn-empty">
                <h1>Esta página no existe</h1>
                <Link className="pn-button" to="/dashboard">
                  Volver al inicio
                </Link>
              </div>
            </Route>
          </Switch>
          <footer className="pn-footer">
            <span>Hecho para las personas. Impulsado por PeopleNet.</span>
            <span>
              © 2026 PeopleNet <i /> Colombia
            </span>
          </footer>
        </motion.main>
      </div>
      {toast && (
        <div className="pn-toast" role="status">
          <Icon name="check_circle" />
          {toast}
          <button aria-label="Cerrar aviso" onClick={() => setToast("")}>
            <Icon name="close" size={18} />
          </button>
        </div>
      )}
      <Link
        to="/dashboard/assistant"
        aria-label="Abrir asistente Eva"
        className="pn-floating-eva"
      >
        <Icon name="auto_awesome" />
        <span>Eva</span>
      </Link>
      <nav className="vivid-bottom-nav" aria-label="Navegación móvil">
        {[
          ["", "space_dashboard", "Inicio"],
          ["kpis", "monitoring", "Metas"],
          ["requests", "event_available", "Permisos"],
          ["documents", "auto_stories", "Biblioteca"],
        ].map(([path, icon, label]) => {
          const active = path
            ? location.pathname.startsWith("/dashboard/" + path)
            : location.pathname === "/dashboard";
          return (
            <Link
              key={path}
              to={"/dashboard" + (path ? "/" + path : "")}
              aria-current={active ? "page" : undefined}
              className={active ? "active" : ""}
            >
              {active && (
                <motion.span
                  className="bottom-active-pill"
                  layoutId="mobile-tab"
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 380, damping: 30 }
                  }
                />
              )}
              <Icon name={icon} size={23} />
              <span>{label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setMenu(true)}
          aria-label="Más opciones"
          aria-expanded={menu}
          className={
            menu ||
            (location.pathname !== "/dashboard" &&
              !["kpis", "requests", "documents"].some((path) =>
                location.pathname.startsWith("/dashboard/" + path),
              ))
              ? "active"
              : ""
          }
        >
          <Icon name="grid_view" size={23} />
          <span>Más</span>
        </button>
      </nav>
    </div>
  );
}
