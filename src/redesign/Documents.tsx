/**
 * M5 — Documentos conectados al backend real (kpis-ms).
 *
 * Contratos verificados en vivo (2026-10-06) contra el backend local:
 * - GET /api/corporate-documents → ApiResponse<CorporateDocumentDTO[]> sin
 *   paginación (raíz).
 * - GET /api/corporate-documents/categories → ApiResponse<{value,label}[]>
 *   (catálogo real; difiere del "string[]" anotado en el plan).
 * - GET /api/corporate-documents/category/{c}?page=0&size=20 →
 *   ApiResponse<Page<CorporateDocumentDTO>> (página Spring).
 * - GET /api/corporate-documents/search?query=&category= →
 *   ApiResponse<CorporateDocumentDTO[]> lista directa.
 * - GET /api/corporate-documents/{id} → ApiResponse<…DetailResponse> con
 *   versionHistory; 404 → success:false + message.
 * - GET /api/corporate-documents/{id}/download → binario real (200
 *   application/pdf para el fixture, ~805 KB, "%PDF-1.7").
 * - GET /api/corporate-documents/{id}/download-url →
 *   ApiResponse<{downloadUrl, expiresInMinutes}> (fallback; la URL es
 *   pre-firmada y puede caducar o apuntar a un key S3 inexistente).
 * - GET /api/document-confirmations/user/{userId}/document-ids →
 *   ApiResponse<{documentIds:number[]}>.
 * - POST /api/document-confirmations {documentId, userId} → SOLO con acción
 *   explícita del usuario (nunca automática al abrir; decisión M5).
 *
 * Los props son opcionales para mantener compatible Workspace.tsx mientras
 * otro agente lo actualiza; el estado de lectura ya NO vive en storage demo
 * (pn-v2-reads): se lee del registro real de confirmaciones del servidor.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Icon,
  Brand,
  Button,
  Badge,
  Heading,
  Search,
  Tabs,
  LoadingNote,
  SectionError,
  date,
} from "./shared";
import {
  confirmDocumentRead,
  downloadCorporateDocument,
  getCorporateDocumentDownloadUrl,
  sessionUserId,
  useConfirmedDocumentIds,
  useCorporateDocumentDetail,
  useCorporateDocumentSearch,
  useCorporateDocuments,
  useCorporateDocumentsByCategory,
  useDocumentCategories,
  toApiError,
} from "../lib/api";
import type {
  CorporateCategoryOption,
  CorporateDocumentDTO,
} from "../lib/api-types";

// ─────────────────────────────────────────────────────────────────────────────
// Ayudantes de presentación (locales; los datos siempre vienen de la API)
// ─────────────────────────────────────────────────────────────────────────────

/** Icono de portada por categoría (solo presentación; valor por defecto si la
 * categoría no está en el mapa). */
const CATEGORY_ICONS: Record<string, string> = {
  policies: "shield",
  procedures: "assignment",
  codes: "menu_book",
  guidelines: "lightbulb",
  templates: "description",
  certifications: "workspace_premium",
  other: "folder_open",
};

function categoryIcon(category: string | null): string {
  const key = category?.toLowerCase().trim() ?? "";
  return CATEGORY_ICONS[key] ?? "description";
}

/** Portada editorial por categoría. Solo presentación; el contenido sigue siendo el del servidor. */
const CATEGORY_COVERS: Record<string, string> = {
  policies: "integridad",
  procedures: "estrategia",
  codes: "convivencia",
  guidelines: "bienestar-activo",
  templates: "seguridad-digital",
  certifications: "trayectoria",
  other: "vacaciones",
};

function categoryCover(category: string | null): string {
  const key = category?.toLowerCase().trim() ?? "";
  return CATEGORY_COVERS[key] ?? "convivencia";
}

/**
 * Etiqueta de categoría: si el catálogo del servidor trae label para el value,
 * se usa; si no, se muestra la categoría tal como está almacenada (el fixture
 * guarda "policies" en minúscula). null → "Sin categoría".
 */
function categoryLabel(
  category: string | null,
  options: CorporateCategoryOption[] | null,
): string {
  if (!category) return "Sin categoría";
  const match = (options ?? []).find(
    (o) => (o.value ?? "").toLowerCase() === category.toLowerCase(),
  );
  return match?.label ?? category;
}

/** "yyyy-MM-dd HH:mm:ss" (JsonFormat del backend) o ISO → "12 oct" es-CO. */
function wireDate(value: string | null): string {
  if (!value) return "Sin dato";
  const day = value.split(/[ T]/)[0];
  return day ? date(day) : "Sin dato";
}

/** Guarda un Blob recibido de la API como archivo del navegador con el
 * fileName real devuelto por el backend. */
function saveBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/** Diferencia pequeñas escrituras para no disparar una búsqueda por tecla; el
 * hook de API además cancela las lecturas obsoletas al cambiar la ruta. */
function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

/** Estado vacío con copy contextual (misma presentación que Empty). */
function NoResults({ title, text }: { title: string; text: string }) {
  return (
    <div className="pn-empty">
      <Icon name="search_off" size={36} />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

/** Estilo del visor de PDF (bytes reales vía /download; blob URL local). */
const PDF_FRAME_STYLE = {
  width: "100%",
  height: "70vh",
  minHeight: 420,
  border: "1px solid var(--pn-line)",
  borderRadius: 8,
  background: "#fff",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Biblioteca (/dashboard/documents)
// ─────────────────────────────────────────────────────────────────────────────

export function Documents(_props: { reads?: string[] }) {
  const userId = sessionUserId();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const [readFilter, setReadFilter] = useState("Todos");
  const [category, setCategory] = useState("Todas");

  // Fuentes reales del servidor (raíz / búsqueda / categoría + catálogo).
  const documents = useCorporateDocuments();
  const categories = useDocumentCategories();
  const confirmed = useConfirmedDocumentIds(userId);

  const trimmed = debouncedQuery.trim();
  const searching = trimmed.length > 0;
  const categoryValue = category === "Todas" ? null : category;

  const searchResults = useCorporateDocumentSearch(
    trimmed,
    categoryValue,
    searching,
  );
  const categoryPage = useCorporateDocumentsByCategory(
    categoryValue,
    !searching && categoryValue != null,
  );

  const confirmedIds = confirmed.state.data?.documentIds;
  const idsKnown = Array.isArray(confirmedIds);
  const confirmedSet = useMemo(
    () => new Set<number>(idsKnown ? confirmedIds : []),
    [idsKnown, confirmedIds],
  );

  /** null = desconocido (sin ids aún); true/false = estado real del servidor. */
  const readStateOf = (d: CorporateDocumentDTO): boolean | null => {
    if (!idsKnown || d.id == null) return null;
    return confirmedSet.has(d.id);
  };

  // Lista activa según la fuente (búsqueda | categoría | raíz) + filtro de
  // lectura aplicado en cliente SOLO cuando el servidor reportó los ids.
  const list = useMemo(() => {
    let base: CorporateDocumentDTO[] | null = null;
    if (searching) {
      base =
        searchResults.state.status === "success"
          ? searchResults.state.data ?? []
          : null;
    } else if (categoryValue != null) {
      base =
        categoryPage.state.status === "success"
          ? categoryPage.state.data?.content ?? []
          : null;
    } else {
      base =
        documents.state.status === "success" ? documents.state.data ?? [] : null;
    }
    if (base == null) return null;
    if (!idsKnown || readFilter === "Todos") return base;
    return base.filter((d) => {
      if (d.id == null) return readFilter !== "Por leer" && readFilter !== "Leídos";
      const read = confirmedSet.has(d.id);
      return readFilter === "Por leer" ? !read : read;
    });
  }, [
    searching,
    searchResults.state,
    categoryValue,
    categoryPage.state,
    documents.state,
    readFilter,
    idsKnown,
    confirmedIds,
    confirmedSet,
  ]);

  // Estado de la fuente activa (para loading/error de la sección).
  const activeState = searching
    ? searchResults.state
    : categoryValue != null
      ? categoryPage.state
      : documents.state;

  const retryAll = () => {
    documents.reload();
    categories.reload();
    confirmed.reload();
    searchResults.reload();
    categoryPage.reload();
  };

  // Documento destacado: el primero marcado obligatorio (o el primero real).
  const featured =
    documents.state.status === "success"
      ? documents.state.data?.find((d) => d.isRequired === true) ??
        documents.state.data?.[0] ??
        null
      : null;

  // Progreso de lectura real (conteo del servidor, no storage demo).
  const allDocs =
    documents.state.status === "success" ? documents.state.data ?? [] : null;
  const totalDocs = allDocs?.length ?? 0;
  const readCount = idsKnown
    ? (allDocs ?? []).filter((d) => d.id != null && confirmedSet.has(d.id)).length
    : 0;

  // Tabs de categoría con los labels reales del catálogo del servidor.
  const categoryTabs = useMemo(
    () => [
      "Todas",
      ...(categories.state.data ?? []).map((o) => o.label ?? o.value ?? ""),
    ],
    [categories.state.data],
  );

  return (
    <>
      <Heading
        eyebrow="EL CONOCIMIENTO NOS CONECTA"
        title="Tu biblioteca de documentos"
        description="Información útil, políticas claras y todo lo que necesitas conocer."
      />
      {featured && featured.id != null && (
        <Link
          className="editorial-library-feature"
          to={"/dashboard/documents/" + featured.id}
        >
          <img
            src={`/images/people/${categoryCover(featured.category)}.jpg`}
            alt=""
            width="1536"
            height="1024"
          />
          <div>
            <span className="pn-eyebrow">TU PRÓXIMA LECTURA</span>
            <h2>{featured.title ?? "Sin título"}</h2>
            <p>
              {featured.description?.slice(0, 90) ??
                categoryLabel(featured.category, categories.state.data)}
              {featured.description && featured.description.length > 90
                ? "…"
                : ""}
            </p>
            <span className="featured-read">
              Abrir <Icon name="arrow_forward" size={18} />
            </span>
          </div>
        </Link>
      )}
      {documents.state.status === "success" && (
        <div className="pn-banner library-progress">
          <span className="quick-icon">
            <Icon name="auto_stories" size={28} />
          </span>
          <div>
            <h3>
              {idsKnown
                ? `${readCount} de ${totalDocs} lecturas completadas`
                : "Calculando tu progreso de lectura…"}
            </h3>
            <p>
              {idsKnown && totalDocs - readCount === 0 && totalDocs > 0
                ? "¡Al día! Has confirmado toda la biblioteca."
                : `Tu progreso refleja las confirmaciones registradas en el servidor.${
                    idsKnown && totalDocs > 0
                      ? ` Tienes ${totalDocs - readCount} documentos por explorar.`
                      : ""
                  }`}
            </p>
            <div className="pn-progress">
              <i
                style={{
                  width: `${totalDocs ? (readCount / totalDocs) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
          <span className="library-counter">
            {idsKnown ? readCount : "—"}
            <small> / {totalDocs} leídos</small>
          </span>
        </div>
      )}
      <div className="pn-toolbar">
        <Tabs
          items={["Todos", "Por leer", "Leídos"]}
          value={readFilter}
          set={setReadFilter}
        />
        <Search
          value={query}
          onChange={setQuery}
          placeholder="Buscar documentos…"
        />
      </div>
      <div className="pn-toolbar">
        <Tabs
          items={categoryTabs}
          value={category}
          set={(label) => setCategory(label)}
        />
      </div>
      {activeState.status === "loading" && list == null && (
        <LoadingNote
          label={searching ? "Buscando documentos…" : "Cargando documentos…"}
        />
      )}
      {activeState.status === "error" && list == null && (
        <SectionError
          error={activeState.error ?? "Error inesperado."}
          restricted={activeState.errorStatus === 403}
          onRetry={retryAll}
        />
      )}
      {activeState.status === "error" && list != null && (
        <div className="pn-info" role="alert" style={{ color: "#b3261e" }}>
          <Icon name="cloud_off" size={16} /> No se pudo actualizar la lista:{" "}
          {activeState.error}{" "}
          <Button secondary onClick={retryAll}>
            Reintentar
          </Button>
        </div>
      )}
      <div className="pn-doc-grid editorial-doc-grid">
        {(list ?? []).map((d, i) => {
          const read = readStateOf(d);
          return (
            <Link
              className="pn-panel document-card editorial-doc-card"
              key={d.id ?? `doc-${i}`}
              to={"/dashboard/documents/" + d.id}
            >
              <div className="editorial-doc-cover">
                <img
                  src={`/images/people/${categoryCover(d.category)}.jpg`}
                  alt=""
                  width="1536"
                  height="1024"
                  loading="lazy"
                  decoding="async"
                />
                <span className="editorial-doc-icon">
                  <Icon name={categoryIcon(d.category)} size={22} />
                </span>
              </div>
              <div className="document-card-body">
                <div className="panel-heading">
                  <span className="pn-eyebrow">
                    {categoryLabel(d.category, categories.state.data)}
                  </span>
                  {read !== null && (
                    <Badge>{read ? "Leído" : "Por leer"}</Badge>
                  )}
                </div>
                <h3>{d.title ?? "Sin título"}</h3>
                <p>
                  Versión {d.version ?? "Sin dato"} ·{" "}
                  {wireDate(d.uploadedAt)}
                </p>
                <div>
                  <span>
                    {d.isRequired ? "Obligatorio · " : ""}
                    {d.fileSizeFormatted ?? "Sin dato"}
                  </span>
                  <Icon name="arrow_forward" size={19} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      {list != null && list.length === 0 && (
        <NoResults
          title={
            searching
              ? `Sin resultados para “${trimmed}”`
              : categoryValue != null
                ? "Aún no hay documentos en esta categoría"
                : readFilter !== "Todos"
                  ? `No tienes documentos ${readFilter === "Por leer" ? "por leer" : "leídos"} aquí`
                  : "La biblioteca está vacía por ahora"
          }
          text={
            searching
              ? "Prueba con otras palabras o cambia la categoría."
              : categoryValue != null
                ? "Cuando Gestión Humana publique documentos en esta categoría aparecerán aquí."
                : "Cuando el equipo publique documentos los verás en este espacio."
          }
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Lector (/dashboard/documents/:id)
// ─────────────────────────────────────────────────────────────────────────────

export function Reader(_props: {
  reads?: string[];
  onRead?: (id: string) => void;
}) {
  const { id } = useParams<{ id: string }>();
  // Los ids reales son numéricos; enlaces antiguos no numéricos → no existe.
  const documentId = id != null && /^\d+$/.test(id) ? Number(id) : null;
  const userId = sessionUserId();

  const detail = useCorporateDocumentDetail(documentId);
  const categories = useDocumentCategories();
  const confirmed = useConfirmedDocumentIds(userId);
  const confirmedIds = confirmed.state.data?.documentIds;
  const idsKnown = Array.isArray(confirmedIds);
  const doc = detail.state.data;

  const notFound = documentId == null || detail.state.errorStatus === 404;

  // ── Visor del archivo real (PDF) ──────────────────────────────────────────
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerLoading, setViewerLoading] = useState(false);
  const [viewerError, setViewerError] = useState<string | null>(null);

  useEffect(() => {
    if (!doc || doc.id == null) return;
    const mime = (doc.mimeType ?? "").toLowerCase();
    if (!mime.includes("pdf")) {
      setViewerUrl(null);
      return;
    }
    let active = true;
    let url: string | null = null;
    setViewerLoading(true);
    setViewerError(null);
    downloadCorporateDocument(doc.id)
      .then((blob) => {
        if (!active) return;
        url = URL.createObjectURL(blob);
        setViewerUrl(url);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setViewerUrl(null);
        setViewerError(toApiError(error).message);
      })
      .finally(() => {
        if (active) setViewerLoading(false);
      });
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [doc?.id, doc?.mimeType]);

  // ── Descarga manual con fallback download-url ────────────────────────────
  const [downloadStatus, setDownloadStatus] = useState<
    "idle" | "loading" | "error"
  >("idle");
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleDownload = useCallback(async () => {
    if (!doc || doc.id == null) return;
    setDownloadStatus("loading");
    setDownloadError(null);
    try {
      const blob = await downloadCorporateDocument(doc.id);
      saveBlob(blob, doc.fileName ?? "documento.pdf");
      setDownloadStatus("idle");
    } catch (error) {
      // Fallback: URL pre-firmada del servidor (puede caducar o apuntar a un
      // key S3 inexistente). Si también falla → error amigable con retry.
      try {
        const data = await getCorporateDocumentDownloadUrl(doc.id);
        if (!data.downloadUrl) {
          throw new Error("El servidor no generó la URL de descarga.");
        }
        const opened = window.open(
          data.downloadUrl,
          "_blank",
          "noopener,noreferrer",
        );
        if (!opened) {
          throw new Error("Tu navegador bloqueó la apertura de la descarga.");
        }
        setDownloadStatus("idle");
      } catch {
        setDownloadError(
          `No se pudo descargar el archivo. ${
            toApiError(error).message !== "" ? toApiError(error).message : ""
          } Inténtalo de nuevo.`,
        );
        setDownloadStatus("error");
      }
    }
  }, [doc]);

  // ── Confirmación de lectura (SOLO explícita) ─────────────────────────────
  const [confirmState, setConfirmState] = useState<{
    status: "idle" | "loading" | "done" | "error";
    message: string | null;
  }>({ status: "idle", message: null });

  const alreadyConfirmed =
    idsKnown && doc?.id != null ? confirmedIds?.includes(doc.id) === true : false;

  const handleConfirm = useCallback(async () => {
    if (!doc || doc.id == null) return;
    if (userId == null) {
      setConfirmState({
        status: "error",
        message:
          "No se pudo identificar tu usuario. Cierra sesión y vuelve a entrar.",
      });
      return;
    }
    setConfirmState({ status: "loading", message: null });
    try {
      const result = await confirmDocumentRead(doc.id, userId);
      // success:true (DTO nuevo o alreadyConfirmed) → releer document-ids
      // para reflejar el estado REAL del servidor (decisión M5).
      confirmed.reload();
      const wasAlready =
        "alreadyConfirmed" in result && result.alreadyConfirmed === true;
      setConfirmState({
        status: "done",
        message: wasAlready
          ? "Ya habías confirmado la lectura de este documento."
          : "Lectura confirmada. Tu registro quedó en el servidor.",
      });
    } catch (error) {
      // success:false / 400 / 404 / 500 → sigue pendiente, con motivo visible.
      setConfirmState({
        status: "error",
        message:
          toApiError(error).message ||
          "No se pudo registrar la confirmación. Inténtalo de nuevo.",
      });
    }
  }, [doc, userId, confirmed]);

  // ── Estados de sección ───────────────────────────────────────────────────
  if (notFound && detail.state.status !== "loading") {
    return (
      <>
        <Link className="pn-back" to="/dashboard/documents">
          <Icon name="arrow_back" size={17} /> Volver a la biblioteca
        </Link>
        <div className="pn-empty">
          <Icon name="search_off" size={36} />
          <h3>
            {documentId == null
              ? "Este documento no existe"
              : "Documento no encontrado"}
          </h3>
          <p>
            {documentId == null
              ? "El enlace no es válido. Vuelve a la biblioteca."
              : detail.state.error ?? "Fue eliminado o nunca existió."}
          </p>
          <Link className="pn-button" to="/dashboard/documents">
            Ir a la biblioteca
          </Link>
        </div>
      </>
    );
  }

  if (detail.state.status === "error") {
    return (
      <>
        <Link className="pn-back" to="/dashboard/documents">
          <Icon name="arrow_back" size={17} /> Volver a la biblioteca
        </Link>
        <SectionError
          error={detail.state.error ?? "Error inesperado."}
          restricted={detail.state.errorStatus === 403}
          onRetry={detail.reload}
        />
      </>
    );
  }

  if (!doc) {
    return <LoadingNote label="Cargando documento…" />;
  }

  const mime = (doc.mimeType ?? "").toLowerCase();
  const isPdf = mime.includes("pdf");
  const mimeLabel = doc.mimeType?.split("/").pop()?.toUpperCase() ?? "Archivo";
  const versions = doc.versionHistory ?? [];

  return (
    <>
      <Link className="pn-back" to="/dashboard/documents">
        <Icon name="arrow_back" size={17} /> Volver a la biblioteca
      </Link>
      <Heading
        eyebrow={categoryLabel(doc.category, categories.state.data)}
        title={doc.title ?? "Sin título"}
        description={`Versión ${doc.version ?? "Sin dato"} · ${wireDate(
          doc.uploadedAt,
        )}${doc.uploadedBy ? ` · Subido por ${doc.uploadedBy}` : ""}`}
        action={
          <Button
            secondary
            disabled={downloadStatus === "loading" || doc.id == null}
            onClick={() => void handleDownload()}
          >
            <Icon name="download" />{" "}
            {downloadStatus === "loading" ? "Descargando…" : "Descargar"}
          </Button>
        }
      />
      {downloadStatus === "error" && (
        <div className="pn-info" role="alert" style={{ color: "#b3261e" }}>
          <Icon name="cloud_off" size={16} /> {downloadError}{" "}
          <Button secondary onClick={() => void handleDownload()}>
            Reintentar
          </Button>
        </div>
      )}
      <div className="pn-reader-layout">
        <aside className="pn-reader-index">
          <span className="pn-eyebrow">INFORMACIÓN</span>
          <div className="pn-info">
            {doc.fileName ?? "Sin archivo"}
            <br />
            {doc.fileSizeFormatted ?? "Sin dato"} ·{" "}
            {mimeLabel}
            <br />
            {doc.isRequired ? "Lectura obligatoria" : "Lectura opcional"}
          </div>
          <span className="pn-eyebrow">VERSIONES</span>
          {versions.length === 0 && (
            <div className="pn-info">Sin historial de versiones.</div>
          )}
          {versions.map((v, i) => (
            <a key={v.id ?? i} href={"#version-" + i}>
              <span>{v.isCurrent ? "★" : String(i + 1).padStart(2, "0")}</span>
              {`Versión ${v.version ?? "Sin dato"}`}
            </a>
          ))}
        </aside>
        <article className="pn-panel pn-paper">
          <div className="paper-brand">
            <Brand />
            <span>DOCUMENTO INTERNO</span>
          </div>
          <h1>{doc.title ?? "Sin título"}</h1>
          <img
            className="editorial-reader-photo"
            src={`/images/people/${categoryCover(doc.category)}.jpg`}
            alt=""
            width="1536"
            height="1024"
          />
          <p className="paper-intro">
            {doc.description ?? "Sin descripción del servidor."}
          </p>
          <section id="documento">
            <span className="pn-eyebrow">CONTENIDO</span>
            <h2>{doc.fileName ?? "Archivo del documento"}</h2>
            {isPdf ? (
              viewerLoading ? (
                <LoadingNote label="Cargando el archivo real del documento…" />
              ) : viewerUrl ? (
                <iframe
                  title={doc.title ?? "Documento"}
                  src={viewerUrl}
                  style={PDF_FRAME_STYLE}
                  loading="lazy"
                />
              ) : (
                <div className="pn-info" role="alert">
                  <Icon name="cloud_off" size={16} /> No pudimos mostrar el
                  archivo en pantalla.{" "}
                  {viewerError ? `${viewerError} ` : ""}Puedes intentar la
                  descarga{" "}
                  <Button secondary onClick={() => void handleDownload()}>
                    Descargar archivo
                  </Button>
                </div>
              )
            ) : (
              <div className="pn-info">
                Este formato ({mimeLabel}) no tiene visor integrado: descárgalo
                y ábrelo con la aplicación correspondiente.{" "}
                <Button secondary onClick={() => void handleDownload()}>
                  Descargar archivo
                </Button>
              </div>
            )}
          </section>
          <section id="versiones">
            <span className="pn-eyebrow">HISTORIAL</span>
            <h2>Historial de versiones</h2>
            {versions.length === 0 ? (
              <p>El servidor no reporta versiones anteriores.</p>
            ) : (
              versions.map((v, i) => (
                <section id={"version-" + i} key={v.id ?? i}>
                  <span className="pn-eyebrow">
                    {v.isCurrent ? "ACTUAL" : String(i + 1).padStart(2, "0")}
                  </span>
                  <h2>
                    {v.version ?? "Sin dato"}
                    {v.isCurrent ? " (versión actual)" : ""}
                  </h2>
                  <p>
                    {wireDate(v.uploadedAt)}
                    {v.uploadedBy ? ` · ${v.uploadedBy}` : ""} ·{" "}
                    {v.fileSizeFormatted ?? "Sin dato"} ·{" "}
                    {v.fileName ?? "Sin archivo"}
                  </p>
                </section>
              ))
            )}
          </section>
          <div className="paper-end">
            <Icon name={alreadyConfirmed ? "verified" : "history_edu"} size={25} />
            <div>
              <h3>
                {alreadyConfirmed
                  ? "Tu lectura ya está registrada"
                  : "¿Terminaste de leer?"}
              </h3>
              <p>
                {alreadyConfirmed
                  ? "Tu confirmación quedó registrada en el servidor."
                  : "La confirmación se registra con tu usuario real; no se hace automáticamente al abrir."}
              </p>
            </div>
            <Button
              disabled={
                alreadyConfirmed ||
                confirmState.status === "loading" ||
                doc.id == null ||
                userId == null
              }
              onClick={() => void handleConfirm()}
            >
              {alreadyConfirmed
                ? "Lectura confirmada"
                : confirmState.status === "loading"
                  ? "Confirmando…"
                  : "Confirmar lectura"}
            </Button>
          </div>
          {userId == null && !alreadyConfirmed && (
            <p className="pn-info" role="note">
              No se pudo identificar tu usuario en la sesión; la confirmación
              está deshabilitada para no atribuir la lectura a otra persona.
            </p>
          )}
          {confirmState.message && (
            <p
              className="pn-info"
              role={confirmState.status === "error" ? "alert" : "status"}
              style={{ marginTop: 10 }}
            >
              {confirmState.message}
            </p>
          )}
        </article>
      </div>
    </>
  );
}
