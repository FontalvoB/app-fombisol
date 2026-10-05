import { ProgressRing, PerformanceChart } from "./Charts";
import { Link } from "react-router-dom";
import { Icon, Badge, Heading } from "./shared";
import { type RequestItem, docs, metrics } from "./data";

export function Home({
  requests,
  reads,
  name,
}: {
  requests: RequestItem[];
  reads: string[];
  name: string;
}) {
  return (
    <>
      <div className="vivid-mobile-greeting">
        <div>
          <span>LUNES, 5 DE OCTUBRE</span>
          <h1>
            Hola, {name.split(" ")[0]} <span className="greeting-sun">✦</span>
          </h1>
          <p>Hoy es un buen día para crecer.</p>
        </div>
        <Link
          to="/dashboard/profile"
          className="greeting-avatar"
          aria-label="Ver mi perfil"
        >
          {name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")}
          <i />
        </Link>
      </div>
      <div className="vivid-desktop-heading">
        <Heading
          eyebrow="LUNES, 5 DE OCTUBRE DE 2026"
          title={`Hola, ${name.split(" ")[0]}. Qué bueno tenerte aquí.`}
          description="Un nuevo día para conectar, avanzar y hacer que las cosas pasen."
          action={
            <Link className="pn-button secondary" to="/dashboard/requests/new">
              <Icon name="add" size={18} /> Nueva solicitud
            </Link>
          }
        />
      </div>
      <div className="pn-home-top">
        <section className="pn-welcome vivid-home-hero">
          <div className="hero-topline">
            <span>
              <i /> TU MOMENTO ES AHORA
            </span>
            <Icon name="auto_awesome" size={20} />
          </div>
          <div className="hero-center">
            <div className="hero-message">
              <h2>
                Vas por
                <br />
                <em>cosas grandes.</em>
              </h2>
              <p>
                Tu talento nos mueve.
                <br />
                Tus logros nos inspiran.
              </p>
            </div>
            <ProgressRing value={87.3} label="de tu objetivo" compact />
          </div>
          <div className="hero-bottom">
            <span className="hero-growth">
              <Icon name="trending_up" size={16} /> +4,2 pts este mes
            </span>
            <Link to="/dashboard/kpis">
              Ver mis metas <Icon name="arrow_forward" size={18} />
            </Link>
          </div>
          <span className="hero-orbit orbit-one" aria-hidden="true" />
          <span className="hero-orbit orbit-two" aria-hidden="true" />
        </section>
        <Link className="pn-focus" to="/dashboard/evaluations">
          <div className="focus-top">
            <span>
              <i /> EN TU RADAR
            </span>
            <Icon name="arrow_outward" />
          </div>
          <span className="focus-icon">
            <Icon name="target" size={27} />
          </span>
          <h3>
            Tu crecimiento <br />
            merece un momento.
          </h3>
          <p>
            Ya puedes completar tu evaluación
            <br />
            de desempeño de este trimestre.
          </p>
          <span className="focus-bottom">
            Comenzar evaluación <Icon name="arrow_forward" size={18} />
          </span>
        </Link>
      </div>
      <div className="pn-stats">
        {[
          [
            "monitoring",
            "Metas del trimestre",
            "04",
            "metas",
            "1 alcanzada",
            "sigue avanzando",
            "kpis",
          ],
          [
            "event_available",
            "Solicitudes pendientes",
            String(
              requests.filter((x) => x.status === "Pendiente").length,
            ).padStart(2, "0"),
            "",
            "En revisión",
            "por tu líder",
            "requests",
          ],
          [
            "folder_open",
            "Documentos por leer",
            String(docs.length - reads.length).padStart(2, "0"),
            "",
            "Mantente al día",
            "con tu organización",
            "documents",
          ],
          [
            "beach_access",
            "Días de vacaciones",
            "15",
            "días",
            "Tu próximo descanso",
            "te está esperando",
            "requests/new",
          ],
        ].map(([icon, label, value, unit, detail, sub, path], i) => (
          <Link to={"/dashboard/" + path} className="pn-stat" key={label}>
            <div>
              <span className={`stat-icon stat-${i}`}>
                <Icon name={icon} />
              </span>
              <Icon name="north_east" size={16} />
            </div>
            <p>{label}</p>
            <strong>
              {value}
              <small>{unit}</small>
            </strong>
            {i === 0 && (
              <span className="mini-goal-dots" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
              </span>
            )}
            <span className="stat-detail">
              <b>{detail}</b> {sub}
            </span>
          </Link>
        ))}
      </div>
      <div className="pn-section-heading">
        <div>
          <h2>¿Qué necesitas hacer hoy?</h2>
          <p>Menos vueltas. Más tiempo para lo que importa.</p>
        </div>
        <span className="small-muted">TUS ACCESOS RÁPIDOS</span>
      </div>
      <div className="pn-quick-grid">
        {[
          [
            "event_available",
            "Solicitar un permiso",
            "Gestiona tu tiempo",
            "requests/new",
          ],
          [
            "workspace_premium",
            "Obtener un certificado",
            "A un clic de distancia",
            "certificates",
          ],
          [
            "account_tree",
            "Conocer al equipo",
            "Conecta con las personas",
            "org-chart",
          ],
          [
            "auto_awesome",
            "Preguntarle a Eva",
            "Estamos para ayudarte",
            "assistant",
          ],
        ].map(([icon, title, desc, path]) => (
          <Link to={"/dashboard/" + path} className="pn-quick" key={path}>
            <span className="quick-icon">
              <Icon name={icon} />
            </span>
            <div>
              <strong>{title}</strong>
              <p>{desc}</p>
            </div>
            <Icon name="chevron_right" size={18} />
          </Link>
        ))}
      </div>
      <div className="vivid-home-chart">
        <PerformanceChart />
        <section className="vivid-agenda">
          <div className="panel-heading">
            <div>
              <span className="pn-eyebrow">UN PASO A LA VEZ</span>
              <h2>Lo que viene para ti</h2>
            </div>
            <Icon name="calendar_month" />
          </div>
          <Link to="/dashboard/evaluations">
            <span className="agenda-date">
              <strong>05</strong>OCT
            </span>
            <div>
              <span className="agenda-tag">TU DESARROLLO</span>
              <h3>Un momento para crecer</h3>
              <p>Tu autoevaluación ya está lista.</p>
            </div>
            <Icon name="chevron_right" />
          </Link>
          <Link to="/dashboard/requests">
            <span className="agenda-date yellow">
              <strong>19</strong>OCT
            </span>
            <div>
              <span className="agenda-tag">BIENESTAR</span>
              <h3>Tu próximo descanso</h3>
              <p>5 días para recargar energías.</p>
            </div>
            <Icon name="chevron_right" />
          </Link>
          <Link className="agenda-cta" to="/dashboard/requests/new">
            <Icon name="add_circle" size={19} /> Planea algo para ti{" "}
            <Icon name="arrow_forward" size={17} />
          </Link>
        </section>
      </div>
      <div className="pn-bottom-grid">
        <section className="pn-panel">
          <div className="panel-heading">
            <div>
              <h2>Así van tus objetivos</h2>
              <p>Cada avance cuenta. Sigue así.</p>
            </div>
            <Link to="/dashboard/kpis">
              Ver indicadores <Icon name="arrow_forward" size={16} />
            </Link>
          </div>
          {metrics.slice(0, 3).map((m, i) => (
            <Link className="objective-row" to="/dashboard/kpis" key={m.name}>
              <span className={`objective-icon stat-${i}`}>
                <Icon
                  name={["sentiment_satisfied", "local_shipping", "groups"][i]}
                />
              </span>
              <div>
                <strong>{m.name}</strong>
                <div className="pn-progress">
                  <i
                    style={{
                      width: m.value + "%",
                      background: i === 1 ? "#FFB71B" : "",
                    }}
                  />
                </div>
              </div>
              <span>
                {m.value}
                <small>%</small>
              </span>
              <Badge>{m.status}</Badge>
            </Link>
          ))}
        </section>
        <section className="pn-panel">
          <div className="panel-heading">
            <div>
              <h2>Lo último en tu espacio</h2>
              <p>Las novedades que te importan.</p>
            </div>
            <Link
              aria-label="Ver todas las novedades"
              to="/dashboard/notifications"
            >
              <Icon name="arrow_outward" size={19} />
            </Link>
          </div>
          {[
            [
              "check",
              "Tus vacaciones están aprobadas",
              "19 – 23 de octubre · Disfruta tu descanso",
              "requests",
            ],
            [
              "description",
              "Un nuevo documento para ti",
              "Manual de convivencia · Hace 2 horas",
              "documents/manual",
            ],
            [
              "celebration",
              "¡Seguimos creciendo juntos!",
              "Conoce a las personas de tu equipo",
              "org-chart",
            ],
          ].map(([icon, title, desc, path], i) => (
            <Link
              className="activity-row"
              key={title}
              to={"/dashboard/" + path}
            >
              <span className={`activity-icon stat-${i}`}>
                <Icon name={icon} size={18} />
              </span>
              <div>
                <strong>{title}</strong>
                <p>{desc}</p>
              </div>
            </Link>
          ))}
        </section>
      </div>
      <div className="pn-quote">
        <Icon name="favorite" size={17} />
        <span>Detrás de cada gran resultado, hay personas como tú.</span>
        <span>Somos PeopleNet.</span>
      </div>
    </>
  );
}
