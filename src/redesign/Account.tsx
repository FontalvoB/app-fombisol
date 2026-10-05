import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Icon,
  useSaved,
  Avatar,
  Button,
  Badge,
  Heading,
  Tabs,
  download,
} from "./shared";
import { notices } from "./data";

export function Certificates({ name }: { name: string }) {
  const [recipient, setRecipient] = useState("A quien corresponda");
  const [type, setType] = useState("Certificado laboral");
  const [generated, setGenerated] = useState(false);
  const content = `PEOPLENET COLOMBIA S.A.S.\n${type.toUpperCase()}\n\nDOCUMENTO DE DEMOSTRACIÓN — SIN VALIDEZ OFICIAL\n\n${recipient}\n\nHacemos constar que ${name} se desempeña como Gerente de Operaciones, vinculado desde el 15 de marzo de 2019.\n\nExpedido en Bogotá el 5 de octubre de 2026.\n\nTalento Humano · PeopleNet`;
  return (
    <>
      <Heading
        eyebrow="LO QUE NECESITAS, A TU ALCANCE"
        title="Tus certificados, sin vueltas."
        description="Prepara una constancia de ejemplo con tu información laboral."
      />
      <div className="pn-form-layout">
        <form
          className="pn-panel pn-form"
          onSubmit={(e) => {
            e.preventDefault();
            setGenerated(true);
          }}
        >
          <h2>Personaliza tu certificado</h2>
          <label>
            Tipo de documento
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setGenerated(false);
              }}
            >
              <option>Certificado laboral</option>
              <option>Constancia de vinculación</option>
            </select>
          </label>
          <label>
            Dirigido a
            <input
              required
              value={recipient}
              onChange={(e) => {
                setRecipient(e.target.value);
                setGenerated(false);
              }}
            />
          </label>
          <div className="pn-info">
            <Icon name="verified_user" />
            <span>
              Se usarán tus datos de perfil: <strong>{name}</strong>, Gerente de
              Operaciones.
            </span>
          </div>
          <Button type="submit">
            <Icon name="description" /> Generar vista previa
          </Button>
        </form>
        <aside className="pn-form-aside">
          <div className="vivid-certificate-art" aria-hidden="true">
            <div>
              <span>PEOPLENET</span>
              <strong>
                Tu talento
                <br />
                tiene respaldo.
              </strong>
              <i />
              <i />
              <i />
              <Icon name="workspace_premium" size={42} />
              <small>DOCUMENTO DEMO</small>
            </div>
          </div>
          <Icon name="workspace_premium" size={32} />
          <h3>Listo cuando lo necesitas.</h3>
          <p>
            Genera una vista previa y descarga el contenido en texto o usa la
            impresión de tu navegador para guardarlo como PDF.
          </p>
          <p>Los certificados de esta demo no tienen validez oficial.</p>
        </aside>
      </div>
      {generated && (
        <section className="pn-panel certificate-preview">
          <div className="panel-heading">
            <h2>Tu certificado está listo</h2>
            <div className="inline-person">
              <Button
                secondary
                onClick={() => download("certificado-demo.txt", content)}
              >
                <Icon name="download" /> Descargar texto
              </Button>
              <Button onClick={() => window.print()}>
                <Icon name="print" /> Imprimir / PDF
              </Button>
            </div>
          </div>
          <pre className="certificate-print">{content}</pre>
        </section>
      )}
    </>
  );
}

export function Notifications({
  seen,
  setSeen,
}: {
  seen: string[];
  setSeen: (v: string[]) => void;
}) {
  const [filter, setFilter] = useState("Todas");
  const list = notices.filter(
    (n) => filter === "Todas" || !seen.includes(n.id),
  );
  return (
    <>
      <Heading
        eyebrow="NO TE PIERDAS LO IMPORTANTE"
        title="Lo nuevo en tu espacio"
        description="Tus actualizaciones, organizadas y siempre a mano."
        action={
          <Button secondary onClick={() => setSeen(notices.map((x) => x.id))}>
            <Icon name="done_all" /> Marcar todas como leídas
          </Button>
        }
      />
      <Tabs items={["Todas", "Sin leer"]} value={filter} set={setFilter} />
      <section className="pn-panel notification-list">
        {list.map((n, i) => (
          <div key={n.id} className={seen.includes(n.id) ? "read" : "unread"}>
            <span className={`activity-icon stat-${i}`}>
              <Icon name={n.icon} />
            </span>
            <div>
              <span className="small-muted">{n.time}</span>
              <h3>{n.title}</h3>
              <p>{n.text}</p>
              <Link
                to={"/dashboard/" + n.path}
                onClick={() => setSeen([...new Set([...seen, n.id])])}
              >
                Ver detalle <Icon name="arrow_forward" size={17} />
              </Link>
            </div>
            {!seen.includes(n.id) && (
              <button
                className="pn-icon-button"
                aria-label={`Marcar como leída: ${n.title}`}
                onClick={() => setSeen([...seen, n.id])}
              >
                <Icon name="check" size={20} />
              </button>
            )}
          </div>
        ))}
        {!list.length && (
          <div className="pn-empty">
            <Icon name="done_all" size={36} />
            <h3>Todo al día.</h3>
            <p>No tienes notificaciones pendientes.</p>
          </div>
        )}
      </section>
    </>
  );
}

export function Profile({
  profile,
  save,
}: {
  profile: { name: string; email: string; phone: string };
  save: (p: { name: string; email: string; phone: string }) => void;
}) {
  const [form, setForm] = useState(profile);
  const [emailNotice, setEmailNotice] = useSaved("email-notice", true);
  return (
    <>
      <Heading
        eyebrow="ESTE ESPACIO ES TUYO"
        title="Tu perfil"
        description="Tu información y preferencias, siempre en tus manos."
      />
      <div className="pn-profile-layout">
        <section className="pn-panel profile-summary">
          <div className="profile-cover" />
          <Avatar />
          <h2>{profile.name}</h2>
          <p>Gerente de Operaciones</p>
          <Badge>Operaciones</Badge>
          <hr />
          <span>
            <Icon name="location_on" size={18} /> Bogotá, Colombia
          </span>
          <span>
            <Icon name="calendar_today" size={18} /> En el equipo desde marzo de
            2019
          </span>
          <span>
            <Icon name="business" size={18} /> PeopleNet Colombia S.A.S.
          </span>
        </section>
        <form
          className="pn-panel pn-form"
          onSubmit={(e) => {
            e.preventDefault();
            save(form);
          }}
        >
          <h2>Información personal</h2>
          <p className="small-muted">
            Mantén tus datos de contacto actualizados.
          </p>
          <label>
            Nombre completo
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <div className="form-two">
            <label>
              Correo electrónico
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>
            <label>
              Teléfono
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </label>
          </div>
          <hr />
          <h3>Preferencias</h3>
          <label className="pn-toggle">
            <span>
              <strong>Recordatorios por correo</strong>
              <small>
                Preferencia guardada para la demo; no se envían correos.
              </small>
            </span>
            <input
              type="checkbox"
              checked={emailNotice}
              onChange={(e) => setEmailNotice(e.target.checked)}
            />
          </label>
          <div className="form-actions">
            <span className="small-muted">
              Los cambios se guardan en este navegador.
            </span>
            <Button type="submit">
              Guardar cambios <Icon name="check" size={18} />
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
