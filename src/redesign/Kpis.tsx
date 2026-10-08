import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Icon,
  Button,
  Badge,
  Heading,
  Tabs,
  download,
  Modal,
  SectionError,
  LoadingNote,
} from "./shared";
import { ProgressRing } from "./Charts";
import {
  useApi,
  useEmployeeIndicators,
  sessionEmployeeId,
  periodsFromIndicators,
  periodLabel,
  monthLabel,
  formatMeasure,
  type MonthPeriod,
} from "../lib/api";
import type {
  EmployeeMonthlyAnalyticsResponse,
  IndicatorWire,
} from "../lib/api-types";

/**
 * M3 — KPIs / Metas con datos reales de kpis-ms.
 * - Períodos derivados de los indicadores reales del colaborador
 *   (GET /api/indicators/employee/{employeeId}); nunca un selector fijo.
 * - Lista del período: GET /api/indicators/employee/{id}/year/{y}/month/{m}
 *   (finalResultValue null = pendiente de calificar).
 * - Resumen del mes: GET .../analytics — completionRate (% calificados) y
 *   averageResult (promedio de resultados) son métricas distintas.
 * - Se respeta measurementUnit (no se asume "%" para otra unidad) y
 *   measurementDirection (descendente ≠ "más es mejor").
 * - Sin sparklines ni variaciones inventadas: solo valores con contrato.
 * - Exportar: CSV con los indicadores reales del período seleccionado.
 * - Lecturas obsoletas al cambiar mes: canceladas por useApi (AbortController).
 */

/** Celdas CSV con escape de separador, comillas y saltos de línea. */
function csvCell(value: string | number | null): string {
  const raw = value == null ? "" : String(value);
  return /[;"\n\r]/.test(raw) ? `"${raw.replace(/"/g, '""')}"` : raw;
}

const FILTERS = ["Todos", "Evaluado", "Pendiente"] as const;
type Filter = (typeof FILTERS)[number];

export function Kpis({ notify }: { notify: (v: string) => void }) {
  const [filter, setFilter] = useState<Filter>("Todos");
  const [selectedPeriod, setSelectedPeriod] = useState<MonthPeriod | null>(
    null,
  );
  const [detailId, setDetailId] = useState<number | null>(null);

  const employeeId = sessionEmployeeId();

  // Períodos reales (meses con datos) a partir de los indicadores del empleado.
  const indicatorsAll = useEmployeeIndicators(employeeId);
  const periods = periodsFromIndicators(indicatorsAll.state.data);
  // Por defecto el período más reciente con datos; el usuario puede cambiarlo.
  const period: MonthPeriod | null = selectedPeriod ?? periods[0] ?? null;

  // Lista del período (lista directa, sin paginación).
  const monthIndicators = useApi<IndicatorWire[]>(
    employeeId != null && period
      ? `/indicators/employee/${employeeId}/year/${period.year}/month/${period.month}`
      : null,
  );

  // Resumen del período con analytics (completionRate ≠ averageResult).
  const analytics = useApi<EmployeeMonthlyAnalyticsResponse>(
    employeeId != null && period
      ? `/indicators/employee/${employeeId}/year/${period.year}/month/${period.month}/analytics`
      : null,
  );
  const analyticsData = analytics.state.data;

  const rows = monthIndicators.state.data ?? [];
  const items = rows.filter(
    (r) =>
      filter === "Todos" ||
      (filter === "Evaluado" ? r.finalResultValue != null : r.finalResultValue == null),
  );
  const selected = rows.find((r) => r.id != null && r.id === detailId) ?? null;

  const noEmployee = employeeId == null;
  const listLoading = monthIndicators.state.status === "loading";
  const listError = monthIndicators.state.status === "error";

  const exportReport = () => {
    if (!rows.length) return;
    const header =
      "Indicador;Objetivo;Area;Mes;Anio;Unidad;Direccion;Meta (%);Peso (%);Resultado;Estado";
    const body = rows
      .map((r) =>
        [
          r.indicatorTitle ?? r.objective ?? `Indicador ${r.id ?? ""}`,
          r.objective ?? "",
          r.areaName ?? r.dependencyName ?? "",
          monthLabel(r.month),
          r.year ?? "",
          r.measurementUnit ?? "%",
          r.measurementDirection ?? "",
          r.targetPercentage ?? "",
          r.weightPercentage ?? "",
          r.finalResultValue ?? "",
          r.finalResultValue != null ? "Evaluado" : "Pendiente",
        ]
          .map(csvCell)
          .join(";"),
      )
      .join("\n");
    download(
      `indicadores-${period?.month ?? "sin-periodo"}-${period?.year ?? ""}.csv`,
      `${header}\n${body}\n`,
    );
    notify("Reporte descargado.");
  };

  const canExport = monthIndicators.state.status === "success" && rows.length > 0;

  return (
    <>
      <Heading
        eyebrow="TU ESFUERZO, EN NÚMEROS"
        title="Vas por más."
        description="Cada paso cuenta. Mira todo lo que estás logrando."
        action={
          <Button secondary onClick={exportReport} disabled={!canExport}>
            <Icon name="download" /> Exportar
          </Button>
        }
      />
      <div className="vivid-period">
        <span>
          <Icon name="calendar_month" size={18} /> Tu desempeño
        </span>
        {noEmployee ? (
          <LoadingNote label="Usuario sin colaborador asociado." />
        ) : indicatorsAll.state.status === "loading" ? (
          <LoadingNote label="Cargando períodos…" />
        ) : indicatorsAll.state.status === "error" ? (
          <SectionError
            error={indicatorsAll.state.error ?? "Sin dato"}
            restricted={indicatorsAll.state.errorStatus === 403}
            onRetry={indicatorsAll.reload}
          />
        ) : !periods.length ? (
          <LoadingNote label="Sin períodos con indicadores todavía." />
        ) : (
          <select
            aria-label="Periodo"
            value={period ? periodLabel(period) : ""}
            onChange={(e) => {
              const chosen = periods.find((p) => periodLabel(p) === e.target.value);
              if (chosen) setSelectedPeriod(chosen);
            }}
          >
            {periods.map((p) => (
              <option key={`${p.year}-${p.month}`} value={periodLabel(p)}>
                {periodLabel(p)}
              </option>
            ))}
          </select>
        )}
      </div>
      <Link className="editorial-strategy" to="/dashboard/documents">
        <img
          src="/images/people/estrategia.jpg"
          alt=""
          width="1536"
          height="1024"
        />
        <div>
          <span className="human-eyebrow">CADA META TIENE UN PROPÓSITO</span>
          <h2>Tu aporte nos lleva más lejos.</h2>
          <p>
            Descubre cómo tus objetivos conectan con los documentos de la
            organización.
          </p>
          <span className="editorial-strategy-link">
            Ver la biblioteca <Icon name="arrow_forward" size={17} />
          </span>
        </div>
      </Link>
      {period && (
        <div className="pn-kpi-overview">
          <section className="vivid-score-card">
            <div className="score-top">
              <span>
                <i /> VISTA GENERAL · {periodLabel(period)}
              </span>
              <Icon name="auto_awesome" />
            </div>
            <div className="score-center">
              {analytics.state.status === "success" &&
              analyticsData?.completionRate != null ? (
                <ProgressRing
                  value={analyticsData.completionRate}
                  label="indicadores evaluados"
                />
              ) : (
                <div className="score-center-text">
                  {analytics.state.status === "loading"
                    ? "Cargando resumen…"
                    : analytics.state.status === "error"
                      ? analytics.state.error
                      : "Sin resumen para este período."}
                </div>
              )}
              <div>
                {analytics.state.status === "success" &&
                analyticsData?.totalIndicators != null ? (
                  <span className="score-pill">
                    <Icon name="check_circle" size={15} />
                    {analyticsData.completedIndicators ?? 0} de{" "}
                    {analyticsData.totalIndicators} indicadores evaluados
                  </span>
                ) : null}
                <h2>
                  Tu avance
                  <br />
                  <em>de este mes.</em>
                </h2>
                <p>
                  {analyticsData?.averageResult != null
                    ? `Resultado promedio: ${formatMeasure(analyticsData.averageResult, "%")}`
                    : "Sin resultados calificados todavía."}
                </p>
              </div>
            </div>
            <div className="score-legend">
              <span>
                <i /> Indicadores evaluados
              </span>
              <span>
                <i /> Resultado promedio
              </span>
              <strong>
                Meta promedio:{" "}
                {analyticsData?.averageTargetPercentage != null
                  ? formatMeasure(analyticsData.averageTargetPercentage, "%")
                  : "Sin dato"}
              </strong>
            </div>
          </section>
        </div>
      )}
      <div className="pn-section-heading vivid-metrics-heading">
        <div>
          <h2>El detalle de tus metas</h2>
          <p>Enfócate, avanza y celebra.</p>
        </div>
        <span className="vivid-count">
          {String(items.length).padStart(2, "0")}
        </span>
      </div>
      {period && (
        <div className="pn-toolbar">
          <Tabs
            items={[...FILTERS]}
            value={filter}
            set={(v) => setFilter(v as Filter)}
          />
        </div>
      )}
      {listLoading ? (
        <LoadingNote label="Cargando indicadores…" />
      ) : listError ? (
        <SectionError
          error={monthIndicators.state.error ?? "Sin dato"}
          restricted={monthIndicators.state.errorStatus === 403}
          onRetry={monthIndicators.reload}
        />
      ) : !rows.length ? (
        <div className="pn-empty">
          <Icon name="flag" size={32} />
          <h3>
            {period
              ? `Sin indicadores en ${periodLabel(period)}.`
              : "Sin indicadores todavía."}
          </h3>
          <p>
            Cuando tu líder asigne indicadores para un mes, aparecerán aquí.
          </p>
        </div>
      ) : (
        <>
          <div className="pn-metric-grid">
            {items.map((r) => {
              const completed = r.finalResultValue != null;
              const ascending =
                (r.measurementDirection ?? "").toLowerCase() === "ascendente";
              const unitIsPercent = (r.measurementUnit ?? "%") === "%";
              // Barra solo para indicadores ascendentes en % con resultado:
              // otra unidad o dirección descendente no admiten esa fórmula.
              const progress =
                completed && ascending && unitIsPercent
                  ? Math.max(0, Math.min(100, r.finalResultValue as number))
                  : null;
              return (
                <button
                  className={`pn-panel metric-card metric-tone-${(r.id ?? 0) % 4}`}
                  key={r.id ?? r.indicatorTitle}
                  onClick={() => r.id != null && setDetailId(r.id)}
                  aria-label={`Ver detalle de ${r.indicatorTitle ?? r.objective ?? "indicador"}`}
                  disabled={r.id == null}
                >
                  <div className="panel-heading">
                    <span className="quick-icon">
                      <Icon name="monitoring" />
                    </span>
                    <Badge>{completed ? "Evaluado" : "Pendiente"}</Badge>
                  </div>
                  <span className="pn-eyebrow">
                    {r.areaName ?? r.dependencyName ?? "Sin área"}
                  </span>
                  <h3>{r.indicatorTitle ?? r.objective ?? "Indicador"}</h3>
                  <div className="metric-value-chart">
                    <div className="metric-number">
                      {completed
                        ? formatMeasure(r.finalResultValue, r.measurementUnit)
                        : "Pendiente"}
                    </div>
                  </div>
                  <div className="metric-target">
                    <span>
                      Meta:{" "}
                      {r.targetPercentage != null
                        ? formatMeasure(r.targetPercentage, "%")
                        : "Sin dato"}
                    </span>
                    <strong>
                      Peso:{" "}
                      {r.weightPercentage != null
                        ? formatMeasure(r.weightPercentage, "%")
                        : "Sin dato"}
                    </strong>
                  </div>
                  {progress != null && (
                    <div className="pn-progress">
                      <i style={{ width: `${progress}%` }} />
                    </div>
                  )}
                  <div className="metric-bottom">
                    <span className={completed ? "positive" : ""}>
                      <Icon
                        name={completed ? "check_circle" : "hourglass_empty"}
                        size={14}
                      />
                      {r.measurementDirection
                        ? r.measurementDirection.toLowerCase() === "descendente"
                          ? "Dirección descendente"
                          : "Dirección ascendente"
                        : "Sin dirección"}
                    </span>
                    <Icon name="arrow_forward" size={18} />
                  </div>
                </button>
              );
            })}
          </div>
          {!items.length && (
            <div className="pn-empty">
              <Icon name="filter_alt" size={30} />
              <h3>Aún no hay indicadores en este estado.</h3>
              <p>Selecciona otro filtro para seguir explorando.</p>
            </div>
          )}
        </>
      )}
      {selected && (
        <Modal
          title={
            selected.indicatorTitle ??
            selected.objective ??
            "Detalle del indicador"
          }
          close={() => setDetailId(null)}
        >
          <div className="metric-detail">
            <Badge>
              {selected.finalResultValue != null ? "Evaluado" : "Pendiente"}
            </Badge>
            {selected.finalResultValue != null &&
            (selected.measurementDirection ?? "").toLowerCase() ===
              "ascendente" &&
            (selected.measurementUnit ?? "%") === "%" ? (
              <ProgressRing
                value={selected.finalResultValue}
                label="Resultado actual"
              />
            ) : null}
            <div className="metric-detail-comparison">
              <div>
                <span>Tu resultado</span>
                <strong>
                  {formatMeasure(selected.finalResultValue, selected.measurementUnit)}
                </strong>
              </div>
              <div>
                <span>Tu meta</span>
                <strong>
                  {selected.targetPercentage != null
                    ? formatMeasure(selected.targetPercentage, "%")
                    : "Sin dato"}
                </strong>
              </div>
              <div>
                <span>Peso</span>
                <strong>
                  {selected.weightPercentage != null
                    ? formatMeasure(selected.weightPercentage, "%")
                    : "Sin dato"}
                </strong>
              </div>
            </div>
            {selected.objective && (
              <p>
                <strong>Objetivo: </strong>
                {selected.objective}
              </p>
            )}
            {selected.indicatorDescription && (
              <p>{selected.indicatorDescription}</p>
            )}
            <p>
              {selected.finalResultValue == null
                ? "Sin calificación registrada todavía. Aparecerá cuando este indicador sea evaluado."
                : (selected.measurementDirection ?? "").toLowerCase() ===
                    "descendente"
                  ? "Indicador de dirección descendente: aquí un valor menor respecto a la referencia es mejor."
                  : selected.targetPercentage != null &&
                      selected.finalResultValue >= selected.targetPercentage
                    ? "¡Meta alcanzada! Sigue compartiendo lo que te funciona con tu equipo."
                    : "En avance hacia la meta. Revisa los pendientes con tu líder y define una acción concreta."}
            </p>
            <span className="small-muted">
              {period ? `Período: ${periodLabel(period)} · ` : ""}Datos del
              servidor
            </span>
          </div>
        </Modal>
      )}
    </>
  );
}
