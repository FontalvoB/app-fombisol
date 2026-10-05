import { useState } from "react";
import { Icon, Button, Badge, Heading, Tabs, download, Modal } from "./shared";
import { metrics } from "./data";
import { PerformanceChart, ProgressRing, Sparkline } from "./Charts";

export function Kpis({ notify }: { notify: (v: string) => void }) {
  const [filter, setFilter] = useState("Todos");
  const [period, setPeriod] = useState("Octubre 2026");
  const [detail, setDetail] = useState<string | null>(null);
  const periodMetrics = metrics.map((m, i) => ({
    ...m,
    index: i,
    value: period === "Octubre 2026" ? m.value : m.value - 4,
    status:
      period === "Septiembre 2026" && m.status === "Cumplido"
        ? "En curso"
        : m.status,
  }));
  const items = periodMetrics.filter(
    (m) => filter === "Todos" || m.status === filter,
  );
  const selected = periodMetrics.find((m) => m.name === detail);
  const exportReport = () => {
    download(
      "indicadores.csv",
      "Indicador;Área;Resultado;Meta;Periodo\n" +
        periodMetrics
          .map((m) => `${m.name};${m.area};${m.value};${m.target};${period}`)
          .join("\n"),
    );
    notify("Reporte descargado.");
  };
  return (
    <>
      <Heading
        eyebrow="TU ESFUERZO, EN NÚMEROS"
        title="Vas por más."
        description="Cada paso cuenta. Mira todo lo que estás logrando."
        action={
          <Button secondary onClick={exportReport}>
            <Icon name="download" /> Exportar
          </Button>
        }
      />
      <div className="vivid-period">
        <span>
          <Icon name="calendar_month" size={18} /> Tu desempeño
        </span>
        <select
          aria-label="Periodo"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option>Octubre 2026</option>
          <option>Septiembre 2026</option>
        </select>
      </div>
      <div className="pn-kpi-overview">
        <section className="vivid-score-card">
          <div className="score-top">
            <span>
              <i /> VISTA GENERAL
            </span>
            <Icon name="auto_awesome" />
          </div>
          <div className="score-center">
            <ProgressRing value={period === "Octubre 2026" ? 87.3 : 83.1} />
            <div>
              <span className="score-pill">
                <Icon name="trending_up" size={15} /> +
                {period === "Octubre 2026" ? "4,2" : "7,1"} puntos
              </span>
              <h2>
                ¡Tu mejor versión
                <br />
                está en marcha!
              </h2>
              <p>
                Los pequeños avances
                <br />
                hacen grandes resultados.
              </p>
            </div>
          </div>
          <div className="score-legend">
            <span>
              <i /> Tu avance
            </span>
            <span>
              <i /> Lo que viene
            </span>
            <strong>Meta global 100%</strong>
          </div>
        </section>
        <PerformanceChart period={period} />
      </div>
      <div className="pn-section-heading vivid-metrics-heading">
        <div>
          <h2>El detalle de tus metas</h2>
          <p>Enfócate, avanza y celebra.</p>
        </div>
        <span className="vivid-count">04</span>
      </div>
      <div className="pn-toolbar">
        <Tabs
          items={["Todos", "En curso", "En riesgo", "Cumplido"]}
          value={filter}
          set={setFilter}
        />
      </div>
      <div className="pn-metric-grid">
        {items.map((m) => (
          <button
            className={`pn-panel metric-card metric-tone-${m.index}`}
            key={m.name}
            onClick={() => setDetail(m.name)}
            aria-label={`Ver detalle de ${m.name}`}
          >
            <div className="panel-heading">
              <span className="quick-icon">
                <Icon
                  name={
                    ["sentiment_satisfied", "local_shipping", "groups", "bolt"][
                      m.index
                    ]
                  }
                />
              </span>
              <Badge>{m.status}</Badge>
            </div>
            <span className="pn-eyebrow">{m.area}</span>
            <h3>{m.name}</h3>
            <div className="metric-value-chart">
              <div className="metric-number">
                {m.value}
                <small>%</small>
              </div>
              <Sparkline
                values={[
                  m.value - 16,
                  m.value - 8,
                  m.value - 11,
                  m.value - 4,
                  m.value - 6,
                  m.value,
                ]}
                color={m.status === "En riesgo" ? "#c58c09" : "#045c94"}
              />
            </div>
            <div className="metric-target">
              <span>Meta: {m.target}%</span>
              <strong>
                {Math.min(Math.round((m.value / m.target) * 100), 100)}% del
                objetivo
              </strong>
            </div>
            <div className="pn-progress">
              <i
                style={{
                  width: Math.min((m.value / m.target) * 100, 100) + "%",
                }}
              />
            </div>
            <div className="metric-bottom">
              <span
                className={m.status === "En riesgo" ? "warning" : "positive"}
              >
                <Icon
                  name={m.status === "En riesgo" ? "south_east" : "north_east"}
                  size={14}
                />
                {m.change}% este mes
              </span>
              <Icon name="arrow_forward" size={18} />
            </div>
          </button>
        ))}
      </div>
      {!items.length && (
        <div className="pn-empty">
          <Icon name="flag" size={32} />
          <h3>Aún no hay metas en este estado.</h3>
          <p>Selecciona otro filtro para seguir explorando.</p>
        </div>
      )}
      <div className="vivid-insight">
        <span>
          <Icon name="tips_and_updates" size={24} />
        </span>
        <div>
          <strong>Un pequeño impulso, un gran cambio.</strong>
          <p>
            Prioriza las entregas esta semana. Estás a{" "}
            {period === "Octubre 2026" ? 16 : 20} puntos de alcanzar la meta de
            tu equipo.
          </p>
        </div>
      </div>
      {selected && (
        <Modal title={selected.name} close={() => setDetail(null)}>
          <div className="metric-detail">
            <Badge>{selected.status}</Badge>
            <ProgressRing value={selected.value} label="Resultado actual" />
            <div className="metric-detail-comparison">
              <div>
                <span>Tu resultado</span>
                <strong>{selected.value}%</strong>
              </div>
              <div>
                <span>Tu meta</span>
                <strong>{selected.target}%</strong>
              </div>
              <div>
                <span>Por alcanzar</span>
                <strong>
                  {Math.max(0, selected.target - selected.value)} pts
                </strong>
              </div>
            </div>
            <p>
              {selected.value >= selected.target
                ? "¡Lo lograste! Superaste tu meta. Sigue compartiendo lo que te funciona con tu equipo."
                : "Tu próximo paso: revisa los pendientes de la semana con tu equipo y define una acción concreta para avanzar."}
            </p>
            <span className="small-muted">
              Periodo: {period} · Datos de demostración
            </span>
          </div>
        </Modal>
      )}
    </>
  );
}
