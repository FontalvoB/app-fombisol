import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Icon,
  Badge,
  Heading,
  Empty,
  Search,
  Modal,
  SectionError,
  LoadingNote,
} from "./shared";
import {
  useOrganigramaView,
  getOrgGerenciaAreas,
  getOrgAreaSubareas,
  getOrgAreaEmployees,
  getOrgSubareaEmployees,
  getOrgSearch,
  sessionEmployeeId,
  toApiError,
} from "../lib/api";
import type {
  OrgAreaNode,
  OrgGerenciaNode,
  OrgPersonNode,
  OrgSearchNodeType,
  OrgSubareaNode,
  OrganigramaSearchResult,
} from "../lib/api-types";

/**
 * M6 — Equipo / OrgChart con el árbol REAL del backend.
 * - Raíz: GET /api/organigrama/employee/{employeeId}?isAdmin=false&lazy=true
 *   (viewScope + gerencias; el backend genera nodos sintéticos con id
 *   negativo cuando la vista es de área/subárea/employee).
 * - Lazy: expandir gerencia → /gerencia/{id}/areas; expandir área →
 *   /area/{id}/subareas + /area/{id}/employees; expandir subárea →
 *   /subarea/{id}/employees. "Sin cargar" ≠ vacío (contador del nodo).
 * - Paginación sin duplicados: acumula páginas y dedupe por id de persona.
 * - Búsqueda: /organigrama/employee/{employeeId}/search (resultados con
 *   nodeType/person — nunca contactos demo).
 * - 403 (sin organigrama.ver) → sección restringida; fallo de UNA rama no
 *   borra el resto del árbol (estado por rama).
 */

/** Etiqueta en español del tipo de nodo encontrado por búsqueda. */
function nodeTypeLabel(nodeType: OrgSearchNodeType | null): string {
  switch (nodeType) {
    case "GERENCIA_HEAD":
      return "Jefatura de gerencia";
    case "AREA_HEAD":
      return "Jefatura de área";
    case "SUBAREA_HEAD":
      return "Jefatura de subárea";
    case "AREA_DIRECT":
      return "Empleado directo del área";
    case "SUBAREA_EMPLOYEE":
      return "Empleado de subárea";
    default:
      return "Ubicación sin dato";
  }
}

/** Estado lazy de una rama del árbol (área, subárea o gerencia). */
interface BranchState {
  areas?: OrgAreaNode[];
  subareas?: OrgSubareaNode[];
  /** Empleados acumulados paginando (dedupe por id). */
  employees?: OrgPersonNode[];
  /** Total de empleados del nodo según el backend. */
  totalEmployees: number | null;
  /** Siguiente página a pedir. */
  nextPage: number;
  loading: boolean;
  error: string | null;
  expanded: boolean;
}

const EMPTY_BRANCH: BranchState = {
  totalEmployees: null,
  nextPage: 0,
  loading: false,
  error: null,
  expanded: false,
};

export function Team() {
  const employeeId = sessionEmployeeId();
  const tree = useOrganigramaView(employeeId);

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    OrganigramaSearchResult[] | null
  >(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<OrgPersonNode | null>(
    null,
  );
  const [selectedPersonContext, setSelectedPersonContext] = useState("");
  const [branches, setBranches] = useState<Record<string, BranchState>>({});

  const gerencias = tree.state.data?.gerencias ?? [];
  const viewScope = tree.state.data?.viewScope ?? null;

  /** Carga lazy de una rama (primera página). */
  const loadBranch = useCallback(
    async (
      key: string,
      loader: (page: number) => Promise<{
        areas?: OrgAreaNode[] | null;
        subareas?: OrgSubareaNode[] | null;
        content?: OrgPersonNode[] | null;
        totalElements?: number | null;
      }>,
    ) => {
      setBranches((prev) => ({
        ...prev,
        [key]: { ...EMPTY_BRANCH, ...(prev[key] ?? {}), loading: true, error: null, expanded: true },
      }));
      try {
        const data = await loader(0);
        setBranches((prev) => ({
          ...prev,
          [key]: {
            ...prev[key],
            areas: data.areas ?? prev[key]?.areas,
            subareas: data.subareas ?? prev[key]?.subareas,
            employees: data.content ?? prev[key]?.employees,
            totalEmployees: data.totalElements ?? prev[key]?.totalEmployees ?? null,
            nextPage: 1,
            loading: false,
            error: null,
            expanded: true,
          },
        }));
      } catch (error) {
        const apiError = toApiError(error);
        setBranches((prev) => ({
          ...prev,
          [key]: {
            ...(prev[key] ?? EMPTY_BRANCH),
            loading: false,
            error: apiError.message,
            expanded: true,
          },
        }));
      }
    },
    [],
  );

  /** Página siguiente de empleados de una rama, acumulando sin duplicados. */
  const loadMoreEmployees = useCallback(
    async (
      key: string,
      loader: (page: number) => Promise<{
        content?: OrgPersonNode[] | null;
        totalElements?: number | null;
      }>,
    ) => {
      const branch = branches[key];
      if (!branch || branch.loading) return;
      const page = branch.nextPage;
      setBranches((prev) => ({
        ...prev,
        [key]: { ...(prev[key] ?? EMPTY_BRANCH), loading: true },
      }));
      try {
        const data = await loader(page);
        const incoming = data.content ?? [];
        setBranches((prev) => {
          const current = prev[key]?.employees ?? [];
          const seen = new Set(current.map((p) => p.id));
          const merged = [...current];
          for (const person of incoming) {
            if (person.id != null && !seen.has(person.id)) {
              seen.add(person.id);
              merged.push(person);
            }
          }
          return {
            ...prev,
            [key]: {
              ...(prev[key] ?? EMPTY_BRANCH),
              employees: merged,
              totalElements: data.totalElements ?? prev[key]?.totalEmployees ?? null,
              nextPage: page + 1,
              loading: false,
              error: null,
            },
          };
        });
      } catch (error) {
        const apiError = toApiError(error);
        setBranches((prev) => ({
          ...prev,
          [key]: {
            ...(prev[key] ?? EMPTY_BRANCH),
            loading: false,
            error: apiError.message,
          },
        }));
      }
    },
    [branches],
  );

  /** Búsqueda real en la vista actual (server-side). */
  useEffect(() => {
    const term = query.trim();
    if (employeeId == null || term.length < 2) {
      setSearchResults(null);
      setSearchError("");
      return undefined;
    }
    const controller = new AbortController();
    setSearchLoading(true);
    getOrgSearch(employeeId, term, 10)
      .then((results) => {
        if (controller.signal.aborted) return;
        setSearchResults(Array.isArray(results) ? results : []);
        setSearchError("");
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setSearchResults([]);
        setSearchError(toApiError(error).message);
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, employeeId]);

  const totalPeople = useMemo(() => {
    // Solo suma REAL de totalPeopleCount reportado por el backend.
    return gerencias.reduce((acc, g) => {
      return (
        acc +
        (g.areas ?? []).reduce((accArea, a) => accArea + (a.totalPeopleCount ?? 0), 0)
      );
    }, 0);
  }, [gerencias]);

  /** Tarjeta de persona reutilizable. */
  function personCard(
    person: OrgPersonNode,
    tone: number,
    context = "",
  ) {
    return (
      <button
        className="pn-person-card"
        key={person.id ?? person.fullName}
        onClick={() => {
          setSelectedPerson(person);
          setSelectedPersonContext(context);
        }}
      >
        <Avatarish initials={initials(person.fullName)} tone={tone} />
        <strong>{person.fullName ?? "Sin nombre"}</strong>
        <p>{person.position ?? "Sin cargo"}</p>
        {person.email ? <span>{person.email}</span> : null}
      </button>
    );
  }

  function initials(fullName: string | null): string {
    const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (parts[0]?.slice(0, 2) ?? "??").toUpperCase();
  }

  function renderHeads(heads: OrgPersonNode[] | null, context: string) {
    if (!heads?.length) return null;
    return (
      <div className="org-leaders">
        {heads.map((h, i) => personCard(h, i, context))}
      </div>
    );
  }

  function renderArea(area: OrgAreaNode) {
    const key = `area-${area.id}`;
    const branch = branches[key];
    const areaContext = `Área: ${area.name ?? "Sin nombre"}`;
    return (
      <div className="pn-panel org-branch" key={key}>
        <div className="panel-heading">
          <div>
            <span className="pn-eyebrow">ÁREA</span>
            <h3>{area.name ?? "Sin nombre"}</h3>
          </div>
          <span className="org-count">
            {area.totalPeopleCount != null
              ? `${area.totalPeopleCount} personas`
              : "Sin dato"}
            {area.subareasCount != null ? ` · ${area.subareasCount} sub.` : ""}
          </span>
        </div>
        {renderHeads(area.heads, `Jefatura de ${areaContext}`)}
        {area.employees?.length ? (
          <div className="pn-people-grid">
            {area.employees.map((p, i) => personCard(p, i, areaContext))}
          </div>
        ) : null}
        {branch?.expanded ? (
          <>
            {branch.loading ? <LoadingNote label="Cargando equipo…" /> : null}
            {branch.error ? (
              <p role="alert" className="pn-info">
                {branch.error}
              </p>
            ) : null}
            {branch.subareas?.length ? (
              <div className="org-subarea-group">
                {branch.subareas.map((s) => renderSubarea(s, areaContext))}
              </div>
            ) : null}
            {branch.totalEmployees != null &&
              (branch.employees?.length ?? 0) < branch.totalEmployees && (
                <button
                  className="pn-button secondary"
                  disabled={branch.loading}
                  onClick={() =>
                    loadMoreEmployees(key, (page) =>
                      area.id != null
                        ? getOrgAreaEmployees(area.id, page)
                        : Promise.resolve({ content: [], totalElements: 0 }),
                    )
                  }
                >
                  Cargar más ({(branch.employees?.length ?? 0)}/
                  {branch.totalEmployees})
                </button>
              )}
          </>
        ) : area.id != null &&
          ((area.subareasCount ?? 0) > 0 || (area.employeesCount ?? 0) > 0) ? (
          <button
            className="pn-button secondary"
            onClick={() =>
              loadBranch(key, (page) =>
                Promise.all([
                  getOrgAreaSubareas(area.id as number),
                  getOrgAreaEmployees(area.id as number, page),
                ]).then(([subareas, paged]) => ({
                  subareas,
                  content: paged.content ?? [],
                  totalElements: paged.totalElements,
                })),
              )
            }
          >
            Expandir equipo <Icon name="unfold_more" size={16} />
          </button>
        ) : null}
      </div>
    );
  }

  function renderSubarea(subarea: OrgSubareaNode, parentContext: string) {
    const key = `subarea-${subarea.id}`;
    const branch = branches[key];
    const subContext = `${parentContext} · Subárea: ${subarea.name ?? "Sin nombre"}`;
    return (
      <div className="pn-panel org-branch" key={key}>
        <div className="panel-heading">
          <div>
            <span className="pn-eyebrow">SUBÁREA</span>
            <h3>{subarea.name ?? "Sin nombre"}</h3>
          </div>
          <span className="org-count">
            {subarea.employeesCount != null
              ? `${subarea.employeesCount} personas`
              : "Sin dato"}
          </span>
        </div>
        {renderHeads(subarea.heads, `Jefatura de ${subContext}`)}
        {branch?.expanded ? (
          <>
            {branch.loading ? <LoadingNote label="Cargando equipo…" /> : null}
            {branch.error ? (
              <p role="alert" className="pn-info">
                {branch.error}
              </p>
            ) : null}
            <div className="pn-people-grid">
              {(branch.employees ?? []).map((p, i) => personCard(p, i, subContext))}
            </div>
            {branch.totalEmployees != null &&
              (branch.employees?.length ?? 0) < branch.totalEmployees && (
                <button
                  className="pn-button secondary"
                  disabled={branch.loading}
                  onClick={() =>
                    loadMoreEmployees(key, (page) =>
                      subarea.id != null
                        ? getOrgSubareaEmployees(subarea.id, page)
                        : Promise.resolve({ content: [], totalElements: 0 }),
                    )
                  }
                >
                  Cargar más ({(branch.employees?.length ?? 0)}/
                  {branch.totalEmployees})
                </button>
              )}
          </>
        ) : subarea.id != null ? (
          <button
            className="pn-button secondary"
            onClick={() =>
              loadBranch(key, (page) =>
                subarea.id != null
                  ? getOrgSubareaEmployees(subarea.id, page).then((paged) => ({
                      content: paged.content ?? [],
                      totalElements: paged.totalElements,
                    }))
                  : Promise.resolve({ content: [], totalElements: 0 }),
              )
            }
          >
            Ver personas <Icon name="unfold_more" size={16} />
          </button>
        ) : null}
      </div>
    );
  }

  function renderGerencia(g: OrgGerenciaNode) {
    const key = `gerencia-${g.id}`;
    const branch = branches[key];
    return (
      <div className="pn-panel org-branch" key={key}>
        <div className="panel-heading">
          <div>
            <span className="pn-eyebrow">GERENCIA</span>
            <h3>{g.name ?? "Sin nombre"}</h3>
          </div>
        </div>
        {renderHeads(g.heads, `Jefatura de gerencia: ${g.name ?? "Sin nombre"}`)}
        {(g.areas?.length ?? 0) > 0 ? (
          <div className="org-subarea-group">
            {(g.areas ?? []).map((a) => renderArea(a))}
          </div>
        ) : branch?.expanded ? (
          <>
            {branch.loading ? <LoadingNote label="Cargando áreas…" /> : null}
            {branch.error ? (
              <p role="alert" className="pn-info">
                {branch.error}
              </p>
            ) : null}
            <div className="org-subarea-group">
              {(branch.areas ?? []).map((a) => renderArea(a))}
            </div>
          </>
        ) : (g.areasCount ?? 0) > 0 && g.id != null && g.id > 0 ? (
          <button
            className="pn-button secondary"
            onClick={() =>
              loadBranch(key, () =>
                getOrgGerenciaAreas(g.id as number).then((areas) => ({
                  areas,
                })),
              )
            }
          >
            Expandir áreas ({g.areasCount}) <Icon name="unfold_more" size={16} />
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <>
      <Heading
        eyebrow="EL EQUIPO DETRÁS DE CADA LOGRO"
        title="Las personas que nos mueven"
        description="Conoce cómo nos conectamos y encuentra a tu próximo aliado."
      />
      {tree.state.status === "error" ? (
        <SectionError
          error={tree.state.error ?? "Sin dato"}
          restricted={tree.state.errorStatus === 403}
          onRetry={tree.reload}
        />
      ) : tree.state.status === "loading" ? (
        <LoadingNote label="Cargando organigrama…" />
      ) : employeeId == null ? (
        <div className="pn-empty">
          <Icon name="account_tree" size={30} />
          <h3>Usuario sin colaborador asociado</h3>
          <p>El organigrama requiere un colaborador asociado a tu usuario.</p>
        </div>
      ) : (
        <>
          <div className="vivid-team-banner human-team-banner">
            <div>
              <span className="pn-eyebrow">
                TU VISTA DEL ORGANIGRAMA
                {viewScope ? ` · ${viewScope}` : ""}
              </span>
              <h2>Juntos, llegamos más lejos.</h2>
              <div className="vivid-avatar-stack">
                <span>
                  {totalPeople > 0
                    ? `${totalPeople} personas en tu alcance`
                    : "Organigrama sin personas todavía"}
                  <br />
                  <strong>Datos del servidor.</strong>
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
            <Search
              value={query}
              onChange={setQuery}
              placeholder="Buscar persona… (mínimo 2 letras)"
            />
          </div>
          {query.trim().length >= 2 ? (
            <section className="pn-panel">
              {searchLoading ? (
                <LoadingNote label="Buscando personas…" />
              ) : searchError ? (
                <SectionError
                  error={searchError}
                  restricted={false}
                  onRetry={() => setQuery((q) => q)}
                />
              ) : searchResults && searchResults.length > 0 ? (
                <div className="pn-people-grid">
                  {searchResults.map((r) => (
                    <button
                      className="pn-person-card"
                      key={r.person?.id ?? `${r.gerenciaId}-${r.areaId}`}
                      onClick={() => {
                        if (r.person) setSelectedPerson(r.person);
                        setSelectedPersonContext(nodeTypeLabel(r.nodeType));
                      }}
                    >
                      <Avatarish
                        initials={initials(r.person?.fullName ?? null)}
                        tone={1}
                      />
                      <strong>{r.person?.fullName ?? "Sin nombre"}</strong>
                      <p>{r.person?.position ?? "Sin cargo"}</p>
                      <span>
                        <Icon name="account_tree" size={14} />{" "}
                        {nodeTypeLabel(r.nodeType)}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <Empty />
              )}
            </section>
          ) : !gerencias.length ? (
            <Empty />
          ) : (
            <div className="org-subarea-group">
              {gerencias.map(renderGerencia)}
            </div>
          )}
          <div className="org-note">
            <Icon name="info" size={18} /> Selecciona una persona para ver su
            cargo y ubicación en el organigrama.
          </div>
        </>
      )}
      {selectedPerson && (
        <Modal title="Perfil del equipo" close={() => setSelectedPerson(null)}>
          <div className="person-detail">
            <Avatarish
              initials={initials(selectedPerson.fullName)}
              tone={1}
            />
            <h2>{selectedPerson.fullName ?? "Sin nombre"}</h2>
            <p>{selectedPerson.position ?? "Sin cargo"}</p>
            <Badge>{selectedPersonContext || "Ubicación sin dato"}</Badge>
          </div>
          <dl className="pn-details">
            <dt>Correo</dt>
            <dd>{selectedPerson.email ?? "Sin dato"}</dd>
            <dt>Nivel</dt>
            <dd>{selectedPerson.levelName ?? "Sin dato"}</dd>
          </dl>
        </Modal>
      )}
    </>
  );
}

/** Avatar con iniciales (sin nombres demo). */
function Avatarish({ initials, tone }: { initials: string; tone: number }) {
  return <span className={`pn-avatar tone-${tone % 4}`}>{initials || "PN"}</span>;
}
