import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Icon, useSaved, Badge, Heading } from "./shared";
import { evalQuestions } from "./data";

export function Evaluations({ evaluated }: { evaluated: string[] }) {
  const [result] = useSaved<number[]>("evaluation-result", []);
  return (
    <>
      <Heading
        eyebrow="CRECER EMPIEZA POR CONOCERTE"
        title="Tu desarrollo, en primer plano."
        description="Haz una pausa, reconoce tus logros y descubre nuevas oportunidades."
      />
      <section className="pn-evaluation-hero">
        <div>
          <span className="pn-eyebrow">CICLO OCTUBRE — DICIEMBRE 2026</span>
          <h2>
            Una conversación contigo.
            <br />
            Un paso hacia tu mejor versión.
          </h2>
          <p>
            Eva te acompaña en una autoevaluación sencilla.
            <br />
            Reflexiona sobre tu colaboración, tus resultados y tu crecimiento.
          </p>
          <Link className="pn-button" to="/dashboard/evaluations/chat">
            {evaluated.includes("self")
              ? "Revisar una nueva autoevaluación"
              : "Comenzar mi autoevaluación"}
            <Icon name="arrow_forward" size={18} />
          </Link>
          <span className="evaluation-duration">
            <Icon name="schedule" size={16} /> Aproximadamente 5 minutos
          </span>
        </div>
        <div className="evaluation-art">
          <Icon name="target" size={120} />
          <span>
            Tu próximo nivel
            <br />
            empieza aquí.
          </span>
        </div>
      </section>
      {result.length === 3 && (
        <section className="pn-panel evaluation-result">
          <div>
            <span className="pn-eyebrow">TU ÚLTIMA AUTOEVALUACIÓN</span>
            <h3>
              {(result.reduce((a, b) => a + b, 0) / 3).toLocaleString("es-CO", {
                maximumFractionDigits: 1,
              })}{" "}
              de 5 · Cada reflexión es un avance.
            </h3>
          </div>
          <div className="evaluation-scores">
            {result.map((score, i) => (
              <span key={i}>
                {["Colaboración", "Resultados", "Aprendizaje"][i]}{" "}
                <strong>{score}/5</strong>
              </span>
            ))}
          </div>
        </section>
      )}
      <div className="pn-section-heading">
        <h2>Tu ruta de desarrollo</h2>
      </div>
      <div className="pn-three-grid">
        {[
          [
            "01",
            "Reconoce tus logros",
            "Reflexiona sobre lo que has construido este trimestre.",
            "Autoevaluación",
          ],
          [
            "02",
            "Escucha otras perspectivas",
            "Tu líder te acompañará con retroalimentación útil.",
            "Conversación con tu líder",
          ],
          [
            "03",
            "Traza tu siguiente paso",
            "Define acciones concretas para seguir creciendo.",
            "Plan de desarrollo",
          ],
        ].map(([n, t, d, label], i) => (
          <section className="pn-panel development-card" key={n}>
            <span className="development-number">{n}</span>
            <h3>{t}</h3>
            <p>{d}</p>
            <span>{label}</span>
            <Badge>
              {i === 0
                ? evaluated.includes("self")
                  ? "Completada"
                  : "Pendiente"
                : "Próximamente"}
            </Badge>
          </section>
        ))}
      </div>
    </>
  );
}

export function Chat({
  evaluation = false,
  onComplete,
}: {
  evaluation?: boolean;
  onComplete?: () => void;
}) {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([
    {
      role: "eva",
      text: evaluation
        ? "Hola, Álvaro. Este es un espacio para reconocer tus avances. " +
          evalQuestions[0]
        : "Hola, Álvaro. Soy Eva, tu compañera en PeopleNet. Puedo orientarte sobre vacaciones, solicitudes, documentos y tus indicadores. ¿Por dónde empezamos?",
    },
  ]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [, setResult] = useSaved<number[]>("evaluation-result", []);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "nearest",
    });
  }, [messages]);
  function send(text: string) {
    if (!text.trim()) return;
    let reply = "";
    if (evaluation) {
      const score = Number(text);
      if (step >= 3)
        reply =
          "Tu autoevaluación está completa. Puedes regresar a Evaluaciones para consultar su estado.";
      else if (!Number.isInteger(score) || score < 1 || score > 5)
        reply = "Para este paso, selecciona una valoración entre 1 y 5.";
      else {
        const next = [...scores, score];
        setScores(next);
        setStep(step + 1);
        reply =
          step < 2
            ? "Gracias por compartirlo. " + evalQuestions[step + 1]
            : `¡Gracias, Álvaro! Completaste tu autoevaluación. Tu valoración promedio es ${(next.reduce((a, b) => a + b, 0) / 3).toFixed(1)} de 5. Reconoce tus fortalezas y elige una acción para crecer esta semana. Esta respuesta quedó guardada en la demo.`;
        if (step === 2) {
          setResult(next);
          onComplete?.();
        }
      }
    } else {
      const t = text.toLowerCase();
      reply = /vacacion|descans|días/.test(t)
        ? "Tienes 15 días de vacaciones disponibles. En Permisos y solicitudes → Nueva solicitud, elige Vacaciones, selecciona las fechas y envía a revisión de María Gómez."
        : /permiso|solicitud|ausencia/.test(t)
          ? "Puedes crear una solicitud desde Permisos y solicitudes. Elige el tipo, indica las fechas y el motivo, y revisa el resumen antes de enviar. Encontrarás el estado actualizado en tu listado."
          : /document|manual|política/.test(t)
            ? "En Documentos encontrarás el manual de convivencia y las políticas de la organización. Abre un documento y pulsa Confirmar lectura al terminar."
            : /indicador|kpi|meta/.test(t)
              ? "Tu cumplimiento general de octubre es 87,3%. La satisfacción del cliente está en 88% y las entregas en 74%. En Mis indicadores puedes consultar las metas y exportar el reporte."
              : /certificado/.test(t)
                ? "En Certificados puedes generar una constancia de ejemplo con tus datos y descargarla como texto o imprimirla."
                : /equipo|persona|organigrama/.test(t)
                  ? "Visita Nuestro equipo para explorar el organigrama y el directorio. Puedes buscar por nombre o área y abrir el perfil de cada persona."
                  : "En esta demo respondo sobre vacaciones, permisos, documentos, indicadores, certificados y el equipo. Prueba con «¿Cómo solicito vacaciones?».";
    }
    setMessages((prev) => [
      ...prev,
      { role: "user", text },
      { role: "eva", text: reply },
    ]);
    setInput("");
  }
  return (
    <>
      <Heading
        eyebrow={
          evaluation
            ? "UN MOMENTO PARA REFLEXIONAR"
            : "UN POCO DE AYUDA, MUCHAS POSIBILIDADES"
        }
        title={evaluation ? "Tu autoevaluación con Eva" : "Hola, soy Eva."}
        description={
          evaluation
            ? "Tres preguntas para reconocer cómo vas y hacia dónde quieres crecer."
            : "Tu asistente para encontrar respuestas y dar el siguiente paso."
        }
      />
      <div className="pn-chat-layout">
        <section className="pn-panel pn-chat">
          <header>
            <span className="spark">
              <Icon name="auto_awesome" />
            </span>
            <div>
              <strong>Eva · Tu asistente PeopleNet</strong>
              <small>
                <i /> Disponible para ti
              </small>
            </div>
            <span>DEMO</span>
          </header>
          <div className="chat-messages" aria-live="polite">
            {messages.map((m, i) => (
              <div className={`chat-message ${m.role}`} key={i}>
                {m.role === "eva" && (
                  <span className="chat-eva">
                    <Icon name="auto_awesome" size={17} />
                  </span>
                )}
                <div>{m.text}</div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          {evaluation && step < 3 && (
            <div className="chat-ratings">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => send(String(n))}>
                  {n}
                </button>
              ))}
              <span>1 · Por mejorar / 5 · Excelente</span>
            </div>
          )}
          {evaluation && step === 3 ? (
            <Link className="pn-button" to="/dashboard/evaluations">
              Volver a evaluaciones <Icon name="check" />
            </Link>
          ) : (
            <form
              className="chat-input"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <input
                aria-label="Mensaje para Eva"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  evaluation
                    ? "Escribe una valoración del 1 al 5…"
                    : "Escribe tu pregunta…"
                }
              />
              <button disabled={!input.trim()} aria-label="Enviar mensaje">
                <Icon name="arrow_upward" />
              </button>
            </form>
          )}
          <p className="chat-disclaimer">
            Asistente de demostración · Respuestas guiadas, sin conexión a
            inteligencia artificial.
          </p>
        </section>
        <aside className="pn-chat-aside">
          <Icon name={evaluation ? "target" : "tips_and_updates"} size={30} />
          <h3>
            {evaluation ? "Tu perspectiva importa." : "¿Por dónde empezamos?"}
          </h3>
          <p>
            {evaluation
              ? "No hay respuestas perfectas. Responde con honestidad y piensa en ejemplos de tu día a día."
              : "Estas son algunas cosas en las que puedo acompañarte."}
          </p>
          {!evaluation &&
            [
              "¿Cuántos días de vacaciones tengo?",
              "¿Cómo solicito un permiso?",
              "¿Dónde encuentro los documentos?",
              "¿Cómo van mis indicadores?",
            ].map((q) => (
              <button key={q} onClick={() => send(q)}>
                {q}
                <Icon name="arrow_forward" size={17} />
              </button>
            ))}
          {evaluation && (
            <div className="pn-progress">
              <i style={{ width: (step / 3) * 100 + "%" }} />
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
