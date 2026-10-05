import { useId, useState } from "react";
import { Icon } from "./shared";

export function ProgressRing({
  value,
  label = "Cumplimiento",
  compact = false,
}: {
  value: number;
  label?: string;
  compact?: boolean;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={`vivid-ring ${compact ? "compact" : ""}`}
      role="img"
      aria-label={`${label}: ${value.toLocaleString("es-CO")} por ciento`}
    >
      <svg viewBox="0 0 180 180" aria-hidden="true">
        <circle className="ring-track" cx="90" cy="90" r="73" />
        <circle
          className="ring-value"
          cx="90"
          cy="90"
          r="73"
          pathLength="100"
          strokeDasharray={`${clamped} 100`}
          transform="rotate(-90 90 90)"
        />
        <circle className="ring-inner" cx="90" cy="90" r="57" />
      </svg>
      <div>
        <strong>
          {value.toLocaleString("es-CO", { maximumFractionDigits: 1 })}
          <small>%</small>
        </strong>
        <span>{label}</span>
      </div>
    </div>
  );
}
export function Sparkline({
  values,
  color = "currentColor",
}: {
  values: number[];
  color?: string;
}) {
  const id = useId().replace(/:/g, "");
  const min = Math.min(...values) - 8,
    max = Math.max(...values) + 8;
  const points = values.map((v, i) => [
    (i / (values.length - 1)) * 160,
    50 - ((v - min) / (max - min)) * 44,
  ]);
  const line = points
    .map(([x, y], i) => `${i ? "L" : "M"} ${x} ${y}`)
    .join(" ");
  return (
    <svg className="vivid-sparkline" viewBox="0 0 160 56" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor={color} stopOpacity=".23" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L160 56 L0 56 Z`} fill={`url(#${id})`} />
      <path
        className="spark-stroke"
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
const months = ["May", "Jun", "Jul", "Ago", "Sep", "Oct"];
const values = [61, 68, 65, 76, 83.1, 87.3];
export function PerformanceChart({
  period = "Octubre 2026",
}: {
  period?: string;
}) {
  const [range, setRange] = useState(6);
  const [selected, setSelected] = useState<number | null>(null);
  const id = useId().replace(/:/g, "");
  const end = period === "Septiembre 2026" ? 5 : 6;
  const start = Math.max(0, end - range);
  const data = values.slice(start, end);
  const labels = months.slice(start, end);
  const focus =
    selected !== null && selected < data.length ? selected : data.length - 1;
  const pts = data.map((v, i) => ({
    x: 32 + (i / (data.length - 1)) * 316,
    y: 180 - ((v - 40) / 60) * 152,
  }));
  const path = pts
    .map((p, i) =>
      i
        ? `C ${pts[i - 1].x + (p.x - pts[i - 1].x) / 2} ${pts[i - 1].y}, ${pts[i - 1].x + (p.x - pts[i - 1].x) / 2} ${p.y}, ${p.x} ${p.y}`
        : `M${p.x} ${p.y}`,
    )
    .join(" ");
  return (
    <section className="pn-panel vivid-chart">
      <div className="vivid-chart-heading">
        <div>
          <span className="pn-eyebrow">TU CONSTANCIA SE NOTA</span>
          <h2>Así estás creciendo</h2>
        </div>
        <div className="vivid-segment" aria-label="Rango de la gráfica">
          {[3, 6].map((n) => (
            <button
              key={n}
              aria-pressed={range === n}
              onClick={() => {
                setRange(n);
                setSelected(null);
              }}
            >
              {n} meses
            </button>
          ))}
        </div>
      </div>
      <div className="chart-summary" aria-live="polite">
        <strong>
          {data[focus].toLocaleString("es-CO")}
          <small>%</small>
        </strong>
        <span>
          {labels[focus]} 2026
          <br />
          <b>
            <Icon name="north_east" size={13} /> Tu desempeño
          </b>
        </span>
      </div>
      <svg
        className="performance-svg"
        viewBox="0 0 380 210"
        role="img"
        aria-label={`Desempeño mensual: ${data.map((v, i) => labels[i] + " " + v + "%").join(", ")}`}
      >
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#0476bb" stopOpacity=".24" />
            <stop offset="1" stopColor="#0476bb" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[40, 60, 80, 100].map((v) => (
          <g key={v}>
            <line
              x1="32"
              x2="348"
              y1={180 - ((v - 40) / 60) * 152}
              y2={180 - ((v - 40) / 60) * 152}
              stroke="#e5edf5"
              strokeDasharray="3 5"
            />
            <text
              x="0"
              y={184 - ((v - 40) / 60) * 152}
              fill="#8193aa"
              fontSize="9"
            >
              {v}%
            </text>
          </g>
        ))}
        <path d={`${path} L348 195 L32 195 Z`} fill={`url(#${id})`} />
        <path
          className="performance-line"
          d={path}
          pathLength="1"
          fill="none"
          stroke="#045c94"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <line
          x1={pts[focus].x}
          x2={pts[focus].x}
          y1={pts[focus].y}
          y2="195"
          stroke="#045c94"
          strokeDasharray="3 4"
          opacity=".35"
        />
        {pts.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={i === focus ? 10 : 4}
              fill={i === focus ? "#ffb71b" : "white"}
              stroke={i === focus ? "white" : "#045c94"}
              strokeWidth="3"
            />
            {i === focus && <circle cx={p.x} cy={p.y} r="3" fill="#213053" />}
          </g>
        ))}
      </svg>
      <div className="chart-months">
        {labels.map((m, i) => (
          <button
            key={m}
            aria-label={`Ver ${m}: ${data[i]}%`}
            aria-pressed={focus === i}
            onClick={() => setSelected(i)}
          >
            {m}
          </button>
        ))}
      </div>
      <p className="chart-hint">
        <Icon name="touch_app" size={14} /> Toca un mes para explorar tu avance
      </p>
    </section>
  );
}
