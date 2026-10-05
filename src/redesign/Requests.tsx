import { useState } from "react";
import { Link } from "react-router-dom";
import { SOLICITUD_TIPO_LABELS } from "../lib/solicitud-types";
import {
  Icon,
  Avatar,
  Button,
  Badge,
  Heading,
  Empty,
  Search,
  Tabs,
  date,
  Modal,
} from "./shared";
import { type RequestItem } from "./data";

export function Requests({ requests }: { requests: RequestItem[] }) {
  const [filter, setFilter] = useState("Todas");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<RequestItem | null>(null);
  const list = requests.filter(
    (x) =>
      (filter === "Todas" || x.status === filter) &&
      x.type.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <Heading
        eyebrow="TU TIEMPO TAMBIÉN IMPORTA"
        title="Permisos y solicitudes"
        description="Organiza tus ausencias y sigue cada solicitud, sin complicaciones."
        action={
          <Link className="pn-button" to="/dashboard/requests/new">
            <Icon name="add" /> Nueva solicitud
          </Link>
        }
      />
      <div className="pn-banner">
        <span className="quick-icon">
          <Icon name="beach_access" size={26} />
        </span>
        <div>
          <h3>Un descanso también es avanzar.</h3>
          <p>
            Tienes <strong>15 días de vacaciones</strong> disponibles para
            recargar energías.
          </p>
        </div>
        <Link to="/dashboard/requests/new">
          Planea tu descanso <Icon name="arrow_forward" size={17} />
        </Link>
      </div>
      <section className="pn-panel">
        <div className="pn-toolbar padded">
          <Tabs
            items={["Todas", "Pendiente", "Aprobada", "Rechazada"]}
            value={filter}
            set={setFilter}
          />
          <Search
            value={query}
            onChange={setQuery}
            placeholder="Buscar solicitud…"
          />
        </div>
        <div className="pn-table-wrap">
          <table className="pn-table">
            <thead>
              <tr>
                <th>Solicitud</th>
                <th>Periodo</th>
                <th>Responsable</th>
                <th>Estado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id}>
                  <td>
                    <button
                      className="table-title"
                      onClick={() => setSelected(r)}
                    >
                      <span className="file-icon">
                        <Icon
                          name={
                            r.type === "Vacaciones"
                              ? "beach_access"
                              : "event_note"
                          }
                        />
                      </span>
                      <span>
                        <strong>{r.type}</strong>
                        <small>{r.id}</small>
                      </span>
                    </button>
                  </td>
                  <td>
                    {date(r.start)} — {date(r.end)}, {r.end.slice(0, 4)}
                  </td>
                  <td>
                    <span className="inline-person">
                      <Avatar name="MG" tone={1} /> María Gómez
                    </span>
                  </td>
                  <td>
                    <Badge>{r.status}</Badge>
                  </td>
                  <td>
                    <button
                      className="pn-icon-button"
                      aria-label={`Ver ${r.id}`}
                      onClick={() => setSelected(r)}
                    >
                      <Icon name="chevron_right" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!list.length && <Empty />}
        </div>
        <div className="vivid-request-list">
          {list.map((r) => (
            <button
              key={r.id}
              className="vivid-request-card"
              onClick={() => setSelected(r)}
              aria-label={`Ver solicitud ${r.id}`}
            >
              <div className="request-card-top">
                <span
                  className={`request-card-icon ${r.type === "Vacaciones" ? "holiday" : ""}`}
                >
                  <Icon
                    name={
                      r.type === "Vacaciones"
                        ? "beach_access"
                        : r.type === "Citación médica"
                          ? "medical_services"
                          : "event_note"
                    }
                    size={25}
                  />
                </span>
                <div>
                  <strong>{r.type}</strong>
                  <small>{r.id}</small>
                </div>
                <Badge>{r.status}</Badge>
              </div>
              <div className="request-card-dates">
                <Icon name="calendar_today" size={17} />
                <span>
                  {date(r.start)} — {date(r.end)}, {r.end.slice(0, 4)}
                </span>
                <Icon name="arrow_forward" size={18} />
              </div>
              <div className="request-card-person">
                <Avatar name="MG" tone={1} />
                <span>Revisa María Gómez</span>
                <span>Ver detalle</span>
              </div>
            </button>
          ))}
          {!list.length && <Empty />}
        </div>
        <div className="table-footer">
          {list.length} solicitudes · Información de demostración
        </div>
      </section>
      {selected && (
        <Modal title={selected.type} close={() => setSelected(null)}>
          <Badge>{selected.status}</Badge>
          <div className="request-timeline">
            {[
              "Enviada",
              "En revisión",
              selected.status === "Rechazada" ? "Rechazada" : "Aprobada",
            ].map((label, i) => (
              <div
                key={label}
                className={
                  i < 2 || selected.status !== "Pendiente" ? "done" : ""
                }
              >
                <span>
                  <Icon
                    name={
                      i === 0
                        ? "send"
                        : i === 1
                          ? "schedule"
                          : selected.status === "Rechazada"
                            ? "close"
                            : "check"
                    }
                    size={17}
                  />
                </span>
                <small>{label}</small>
              </div>
            ))}
          </div>
          <dl className="pn-details">
            <dt>Referencia</dt>
            <dd>{selected.id}</dd>
            <dt>Periodo</dt>
            <dd>
              {date(selected.start)} — {date(selected.end)}
            </dd>
            <dt>Observaciones</dt>
            <dd>{selected.note}</dd>
            <dt>Responsable</dt>
            <dd>María Gómez · Talento humano</dd>
          </dl>
          <div className="pn-info">
            {selected.status === "Pendiente"
              ? "Tu solicitud está en revisión. Te avisaremos cuando tu líder responda."
              : selected.status === "Aprobada"
                ? "Tu solicitud fue aprobada por María Gómez."
                : "La solicitud no fue aprobada por necesidades de cobertura del equipo. Puedes crear una nueva con otras fechas."}
          </div>
        </Modal>
      )}
    </>
  );
}

export function RequestForm({ onSave }: { onSave: (r: RequestItem) => void }) {
  const [type, setType] = useState("Vacaciones");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState("");
  const [fileError, setFileError] = useState("");
  const [review, setReview] = useState(false);
  return (
    <>
      <Link className="pn-back" to="/dashboard/requests">
        <Icon name="arrow_back" size={17} /> Volver a mis solicitudes
      </Link>
      <Heading
        eyebrow="UN ESPACIO PARA LO QUE NECESITAS"
        title="Crea una nueva solicitud"
        description="Cuéntanos qué necesitas. Nosotros te ayudamos con el siguiente paso."
      />
      <div className="pn-form-layout">
        <form
          className="pn-panel pn-form"
          onSubmit={(e) => {
            e.preventDefault();
            setReview(true);
          }}
        >
          <div className="form-section-title">
            <span>01</span>
            <div>
              <h3>¿Qué tipo de solicitud necesitas?</h3>
              <p>Selecciona la opción que mejor se ajuste.</p>
            </div>
          </div>
          <div className="request-types">
            {Object.values(SOLICITUD_TIPO_LABELS).map((x, i) => (
              <button
                type="button"
                aria-pressed={type === x}
                className={type === x ? "selected" : ""}
                key={x}
                onClick={() => setType(x)}
              >
                <Icon
                  name={
                    [
                      "event_available",
                      "family_restroom",
                      "beach_access",
                      "medical_services",
                      "health_and_safety",
                      "more_horiz",
                    ][i]
                  }
                />
                {x}
                {type === x && <Icon name="check_circle" size={17} />}
              </button>
            ))}
          </div>
          <div className="form-section-title">
            <span>02</span>
            <div>
              <h3>Define los detalles</h3>
              <p>Las fechas y el contexto ayudan a tu líder a revisar.</p>
            </div>
          </div>
          <div className="form-two">
            <label>
              Fecha de inicio
              <input
                type="date"
                required
                min="2026-10-05"
                value={start}
                onChange={(e) => {
                  setStart(e.target.value);
                  if (end < e.target.value) setEnd(e.target.value);
                }}
              />
            </label>
            <label>
              Fecha de finalización
              <input
                type="date"
                required
                min={start || "2026-10-05"}
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </label>
          </div>
          <label>
            Observaciones
            <textarea
              required
              placeholder="Cuéntanos un poco más sobre tu solicitud…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
            />
          </label>
          <label className="pn-upload">
            <Icon name="cloud_upload" size={28} />
            <strong>{file || "Adjunta un soporte si lo necesitas"}</strong>
            <span>PDF o imagen · Máximo 10 MB</span>
            <input
              aria-label="Adjuntar soporte"
              type="file"
              accept=".pdf,image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f && f.size > 10 * 1024 * 1024) {
                  e.target.value = "";
                  setFile("");
                  setFileError(
                    "El archivo supera los 10 MB. Selecciona otro o continúa sin adjunto.",
                  );
                } else {
                  setFile(f?.name || "");
                  setFileError("");
                }
              }}
            />
          </label>
          {fileError && (
            <p role="alert" className="pn-info">
              {fileError}
            </p>
          )}
          <div className="form-actions">
            <Link to="/dashboard/requests">Cancelar</Link>
            <Button type="submit">
              Revisar solicitud <Icon name="arrow_forward" size={18} />
            </Button>
          </div>
        </form>
        <aside className="pn-form-aside">
          <Icon name="info" size={25} />
          <h3>Ten en cuenta</h3>
          <p>
            Solicita tus ausencias programadas con anticipación para que tu
            equipo pueda organizarse.
          </p>
          <hr />
          <h4>Tu responsable de aprobación</h4>
          <div className="inline-person">
            <Avatar name="MG" tone={1} />
            <div>
              <strong>María Gómez</strong>
              <small>Directora de Talento</small>
            </div>
          </div>
          <p>Recibirás una notificación cuando tu solicitud sea revisada.</p>
          <Link to="/dashboard/documents/permisos">
            Consultar la política <Icon name="arrow_outward" size={17} />
          </Link>
        </aside>
      </div>
      {review && (
        <Modal title="Todo listo para enviar" close={() => setReview(false)}>
          <dl className="pn-details">
            <dt>Tipo</dt>
            <dd>{type}</dd>
            <dt>Periodo</dt>
            <dd>
              {date(start)} — {date(end)}
            </dd>
            <dt>Observaciones</dt>
            <dd>{note}</dd>
            <dt>Soporte</dt>
            <dd>{file || "Sin adjunto"}</dd>
          </dl>
          <p className="small-muted">
            Demo: se guardan los datos de la solicitud en este navegador. Los
            archivos no se envían a un servidor.
          </p>
          <Button
            onClick={() =>
              onSave({
                id: "SOL-" + Date.now().toString().slice(-6),
                type,
                start,
                end,
                note: note + (file ? " · Soporte: " + file : ""),
                status: "Pendiente",
              })
            }
          >
            Confirmar y enviar <Icon name="send" size={18} />
          </Button>
        </Modal>
      )}
    </>
  );
}
