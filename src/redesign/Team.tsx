import { useState } from "react";
import {
  Icon,
  Avatar,
  Badge,
  Heading,
  Empty,
  Search,
  Tabs,
  Modal,
} from "./shared";
import { people } from "./data";

export function Team() {
  const [query, setQuery] = useState("");
  const [view, setView] = useState("Organigrama");
  const [selected, setSelected] = useState<string[] | null>(null);
  const filtered = people.filter((p) =>
    (p[0] + " " + p[2]).toLowerCase().includes(query.toLowerCase()),
  );
  const card = (p: string[], i: number) => (
    <button
      className="pn-person-card"
      key={p[0]}
      onClick={() => setSelected(p)}
    >
      <Avatar name={p[3]} tone={i} />
      <strong>{p[0]}</strong>
      <p>{p[1]}</p>
      <span>{p[2]}</span>
    </button>
  );
  return (
    <>
      <Heading
        eyebrow="EL EQUIPO DETRÁS DE CADA LOGRO"
        title="Las personas que nos mueven"
        description="Conoce cómo nos conectamos y encuentra a tu próximo aliado."
      />
      <div className="vivid-team-banner human-team-banner">
        <div>
          <span className="pn-eyebrow">
            DIFERENTES TALENTOS. UN MISMO PROPÓSITO.
          </span>
          <h2>Juntos, llegamos más lejos.</h2>
          <div className="vivid-avatar-stack">
            {people.slice(0, 4).map((p, i) => (
              <Avatar name={p[3]} tone={i} key={p[3]} />
            ))}
            <span>
              6 personas increíbles
              <br />
              <strong>Un equipo que te acompaña.</strong>
            </span>
          </div>
        </div>
        <img
          className="human-team-photo"
          src="/images/people/team.jpg"
          alt="Compañeros compartiendo un momento de colaboración en la oficina"
          width="1536"
          height="1024"
        />
      </div>
      <div className="pn-toolbar">
        <Tabs
          items={["Organigrama", "Directorio"]}
          value={view}
          set={setView}
        />
        <Search
          value={query}
          onChange={setQuery}
          placeholder="Buscar persona o área…"
        />
      </div>
      {view === "Organigrama" && !query ? (
        <section className="pn-panel pn-org">
          <div className="org-root">
            <span className="pn-eyebrow">DIRECCIÓN GENERAL</span>
            <Avatar name="LC" tone={2} />
            <h3>Lucía Cárdenas</h3>
            <p>Gerente general</p>
          </div>
          <div className="org-connector" />
          <div className="org-leaders">{people.slice(0, 4).map(card)}</div>
          <div className="org-note">
            <Icon name="info" size={18} /> Selecciona una persona para conocer
            su perfil y área.
          </div>
        </section>
      ) : (
        <div className="pn-people-grid">
          {filtered.map(card)}
          {!filtered.length && <Empty />}
        </div>
      )}
      {selected && (
        <Modal title="Conoce a tu equipo" close={() => setSelected(null)}>
          <div className="person-detail">
            <Avatar name={selected[3]} tone={1} />
            <h2>{selected[0]}</h2>
            <p>{selected[1]}</p>
            <Badge>{selected[2]}</Badge>
          </div>
          <dl className="pn-details">
            <dt>Ubicación</dt>
            <dd>Bogotá, Colombia</dd>
            <dt>Modalidad</dt>
            <dd>Híbrida</dd>
            <dt>Contacto</dt>
            <dd>
              {selected[0]
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(" ", ".")}
              @peoplenet.com
            </dd>
          </dl>
        </Modal>
      )}
    </>
  );
}
