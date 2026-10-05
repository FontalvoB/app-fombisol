import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";

export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="material-symbols-outlined"
      style={{ fontSize: size }}
    >
      {name}
    </span>
  );
}

export function useSaved<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem("pn-v2-" + key);
      return stored ? (JSON.parse(stored) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("pn-v2-" + key, JSON.stringify(value));
    } catch {
      /* Demo remains usable without storage. */
    }
  }, [key, value]);
  return [value, setValue] as const;
}

export function Avatar({
  name = "AM",
  tone = 0,
}: {
  name?: string;
  tone?: number;
}) {
  return <span className={`pn-avatar tone-${tone % 4}`}>{name}</span>;
}

export function Brand() {
  return (
    <Link className="pn-brand" to="/dashboard">
      <span className="pn-mark">
        <i />
        <i />
        <i />
      </span>
      <span>
        people<span className="brand-light">net</span>
        <small>PERSONAS QUE NOS MUEVEN</small>
      </span>
    </Link>
  );
}

export function Button({
  children,
  onClick,
  secondary = false,
  type = "button",
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  secondary?: boolean;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`pn-button ${secondary ? "secondary" : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function Badge({ children }: { children: string }) {
  return (
    <span
      className={`pn-badge ${["Aprobada", "Cumplido", "Leído", "Completada"].includes(children) ? "green" : ["Pendiente", "En riesgo", "Por leer"].includes(children) ? "amber" : children === "Rechazada" ? "red" : "blue"}`}
    >
      <i />
      {children}
    </span>
  );
}

export function Heading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="pn-heading">
      <div>
        <div className="pn-eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}

export function Empty() {
  return (
    <div className="pn-empty">
      <Icon name="search_off" size={36} />
      <h3>No encontramos resultados</h3>
      <p>Prueba con otra búsqueda o cambia los filtros.</p>
    </div>
  );
}

export function Search({
  value,
  onChange,
  placeholder = "Buscar…",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="pn-search">
      <Icon name="search" />
      <input
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button aria-label="Limpiar búsqueda" onClick={() => onChange("")}>
          <Icon name="close" size={16} />
        </button>
      )}
    </label>
  );
}

export function Tabs({
  items,
  value,
  set,
}: {
  items: string[];
  value: string;
  set: (v: string) => void;
}) {
  return (
    <div className="pn-tabs">
      {items.map((x) => (
        <button
          key={x}
          aria-pressed={value === x}
          className={value === x ? "active" : ""}
          onClick={() => set(x)}
        >
          {x}
        </button>
      ))}
    </div>
  );
}

export function date(v: string) {
  return new Date(v + "T12:00:00").toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
  });
}

export function download(name: string, content: string) {
  const url = URL.createObjectURL(
    new Blob(["\ufeff" + content], { type: "text/plain;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function Modal({
  title,
  children,
  close,
}: {
  title: string;
  children: ReactNode;
  close: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    d?.showModal();
    return () => d?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="pn-modal"
      aria-labelledby="pn-modal-title"
      onCancel={close}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="panel-heading">
        <h2 id="pn-modal-title">{title}</h2>
        <button
          aria-label="Cerrar ventana"
          className="pn-icon-button"
          onClick={close}
        >
          <Icon name="close" />
        </button>
      </div>
      {children}
    </dialog>
  );
}
