import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Icon,
  Brand,
  Button,
  Badge,
  Heading,
  Empty,
  Search,
  Tabs,
  download,
} from "./shared";
import { docs, documentCopy } from "./data";

export function Documents({ reads }: { reads: string[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Todos");
  const list = docs.filter(
    (d) =>
      d.title.toLowerCase().includes(query.toLowerCase()) &&
      (filter === "Todos" ||
        (filter === "Por leer" ? !reads.includes(d.id) : reads.includes(d.id))),
  );
  return (
    <>
      <Heading
        eyebrow="EL CONOCIMIENTO NOS CONECTA"
        title="Tu biblioteca de documentos"
        description="Información útil, políticas claras y todo lo que necesitas conocer."
      />
      <Link
        className="editorial-library-feature"
        to="/dashboard/documents/manual"
      >
        <img
          src="/images/people/convivencia.jpg"
          alt=""
          width="1536"
          height="1024"
        />
        <div>
          <span className="pn-eyebrow">TU PRÓXIMA LECTURA</span>
          <h2>
            Lo que nos
            <br />
            hace equipo.
          </h2>
          <p>Conoce nuestro manual de convivencia.</p>
          <span className="featured-read">
            Leer el manual <Icon name="arrow_forward" size={18} />
          </span>
        </div>
      </Link>
      <div className="pn-banner library-progress">
        <span className="quick-icon">
          <Icon name="auto_stories" size={28} />
        </span>
        <div>
          <h3>
            {reads.length} de {docs.length} lecturas completadas
          </h3>
          <p>
            Tienes {docs.length - reads.length} documentos por explorar. Tómate
            un momento para conocerlos.
          </p>
          <div className="pn-progress">
            <i style={{ width: (reads.length / docs.length) * 100 + "%" }} />
          </div>
        </div>
        <span className="library-counter">
          {reads.length}
          <small> / {docs.length} leídos</small>
        </span>
      </div>
      <div className="pn-toolbar">
        <Tabs
          items={["Todos", "Por leer", "Leídos"]}
          value={filter}
          set={setFilter}
        />
        <Search
          value={query}
          onChange={setQuery}
          placeholder="Buscar documentos…"
        />
      </div>
      <div className="pn-doc-grid editorial-doc-grid">
        {list.map((d) => (
          <Link
            className="pn-panel document-card editorial-doc-card"
            key={d.id}
            to={"/dashboard/documents/" + d.id}
          >
            <div className="editorial-doc-cover">
              <img
                src={`/images/people/${d.image}.jpg`}
                alt=""
                width="1536"
                height="1024"
                loading="lazy"
                decoding="async"
              />
              <span className="editorial-doc-icon">
                <Icon name={d.icon} size={22} />
              </span>
            </div>
            <div className="document-card-body">
              <div className="panel-heading">
                <span className="pn-eyebrow">{d.category}</span>
                <Badge>{reads.includes(d.id) ? "Leído" : "Por leer"}</Badge>
              </div>
              <h3>{d.title}</h3>
              <p>Actualizado el {d.date}</p>
              <div>
                <span>{d.pages} secciones · Lectura de 3 min</span>
                <Icon name="arrow_forward" size={19} />
              </div>
            </div>
          </Link>
        ))}
      </div>
      {!list.length && <Empty />}
    </>
  );
}

export function Reader({
  reads,
  onRead,
}: {
  reads: string[];
  onRead: (id: string) => void;
}) {
  const { id } = useParams<{ id: string }>();
  const [textSize, setTextSize] = useState(16);
  const d = docs.find((x) => x.id === id);
  if (!d) return <Empty />;
  const sections = documentCopy[id];
  return (
    <>
      <Link className="pn-back" to="/dashboard/documents">
        <Icon name="arrow_back" size={17} /> Volver a la biblioteca
      </Link>
      <Heading
        eyebrow={d.category}
        title={d.title}
        description={`Actualizado el ${d.date} · Documento de demostración`}
        action={
          <Button
            secondary
            onClick={() =>
              download(
                d.id + ".txt",
                d.title + "\n\n" + sections.join("\n\n").split("|").join("\n"),
              )
            }
          >
            <Icon name="download" /> Descargar texto
          </Button>
        }
      />
      <div className="pn-reader-layout">
        <aside className="pn-reader-index">
          <span className="pn-eyebrow">EN ESTE DOCUMENTO</span>
          {sections.map((s, i) => (
            <a key={s} href={"#section-" + i}>
              <span>0{i + 1}</span>
              {s.split("|")[0]}
            </a>
          ))}
          <div className="pn-info">
            <Icon name="info" size={20} />
            Contenido ilustrativo para explorar la experiencia.
          </div>
        </aside>
        <article className="pn-panel pn-paper" style={{ fontSize: textSize }}>
          <div className="vivid-reading-tools">
            <span>
              <Icon name="auto_stories" size={18} /> Modo lectura
            </span>
            <div>
              <button
                aria-label="Reducir tamaño del texto"
                disabled={textSize <= 14}
                onClick={() => setTextSize(textSize - 2)}
              >
                A−
              </button>
              <span>{textSize}</span>
              <button
                aria-label="Aumentar tamaño del texto"
                disabled={textSize >= 22}
                onClick={() => setTextSize(textSize + 2)}
              >
                A+
              </button>
            </div>
          </div>
          <div className="paper-brand">
            <Brand />
            <span>DOCUMENTO INTERNO</span>
          </div>
          <h1>{d.title}</h1>
          <img
            className="editorial-reader-photo"
            src={`/images/people/${d.image}.jpg`}
            alt=""
            width="1536"
            height="1024"
          />
          <p className="paper-intro">
            Una guía para seguir construyendo un mejor lugar para todos.
          </p>
          {sections.map((s, i) => (
            <section id={"section-" + i} key={s}>
              <span className="pn-eyebrow">0{i + 1}</span>
              <h2>{s.split("|")[0]}</h2>
              <p>{s.split("|")[1]}</p>
            </section>
          ))}
          <div className="paper-end">
            <Icon name="verified" size={25} />
            <div>
              <h3>
                {reads.includes(id)
                  ? "Tu lectura ya está registrada"
                  : "¿Terminaste de leer?"}
              </h3>
              <p>Confirma tu lectura para mantener tu biblioteca al día.</p>
            </div>
            <Button disabled={reads.includes(id)} onClick={() => onRead(id)}>
              {reads.includes(id) ? "Lectura confirmada" : "Confirmar lectura"}
            </Button>
          </div>
        </article>
      </div>
    </>
  );
}
