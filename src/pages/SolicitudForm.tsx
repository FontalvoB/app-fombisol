import { useState, useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { currentUser, empresas, aprobadores } from '@/lib/mock-data'
import {
  SOLICITUD_STEPS, LINEAMIENTOS, TIPOS_DISPONIBLES, TIPO_ICONS,
  SUBTIPOS, SOLICITUD_TIPO_LABELS,
  type SolicitudFormData, type FormDocumento,
} from '@/lib/solicitud-types'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

function getInitials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase()
}

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

function formatDateLong(iso: string) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function formatBytes(b: number) {
  if (b < 1024) return b + ' B'
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB'
  return (b / 1024 / 1024).toFixed(1) + ' MB'
}

export default function SolicitudForm() {
  const history = useHistory()
  const [step, setStep] = useState(1)
  const [lineamientosLeidos, setLineamientosLeidos] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedRadicado, setSubmittedRadicado] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const [form, setForm] = useState<SolicitudFormData>({
    empresaId: currentUser.empresaId,
    empresaNombre: currentUser.empresaNombre,
    cargo: currentUser.role,
    nombreCompleto: currentUser.name,
    numeroIdentificacion: currentUser.documento,
    correoElectronico: currentUser.email,
    numeroContacto: currentUser.phone,
    tipo: null,
    subtipo: '',
    otraNovedad: '',
    fechaDesde: '',
    fechaHasta: '',
    horaSalida: '',
    horaRegreso: '',
    descripcion: '',
    documentos: [],
    aprobadorId: aprobadores[0]?.id ?? null,
    aprobadorNombre: aprobadores[0]?.nombre ?? '',
    aprobadorCargo: aprobadores[0]?.cargo ?? '',
  })

  const progress = (step / SOLICITUD_STEPS.length) * 100
  const currentStepDef = SOLICITUD_STEPS[step - 1]

  const duracionDias = useMemo(() => {
    if (!form.fechaDesde || !form.fechaHasta) return 0
    const desde = new Date(form.fechaDesde + 'T00:00:00')
    const hasta = new Date(form.fechaHasta + 'T00:00:00')
    const diff = Math.round((hasta.getTime() - desde.getTime()) / 86400000) + 1
    return diff > 0 ? diff : 0
  }, [form.fechaDesde, form.fechaHasta])

  const isStepValid = useMemo(() => {
    switch (step) {
      case 1: return lineamientosLeidos
      case 2: return !!(form.empresaId && form.cargo.trim() && form.nombreCompleto.trim() &&
        form.numeroIdentificacion.trim() && isEmail(form.correoElectronico) && form.numeroContacto.trim())
      case 3:
        if (!form.tipo) return false
        if (form.tipo === 'OTRO') return form.otraNovedad.trim().length > 0
        if (['PERMISO', 'LICENCIA', 'INCAPACIDAD'].includes(form.tipo)) return !!form.subtipo
        return true
      case 4:
        if (!form.fechaDesde || !form.fechaHasta) return false
        if (form.fechaDesde > form.fechaHasta) return false
        if ((form.horaSalida && !form.horaRegreso) || (!form.horaSalida && form.horaRegreso)) return false
        return true
      case 5: return true
      case 6: return !!form.aprobadorId
      default: return false
    }
  }, [step, form, lineamientosLeidos])

  function patch(p: Partial<SolicitudFormData>) {
    setForm(prev => ({ ...prev, ...p }))
  }

  function addFiles(files: FileList | File[]) {
    const nuevos: FormDocumento[] = Array.from(files).map(f => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      nombre: f.name,
      tamano: f.size,
      tipo: f.type || 'application/octet-stream',
      file: f,
    }))
    patch({ documentos: [...form.documentos, ...nuevos] })
  }

  async function submit() {
    setIsSubmitting(true)
    await new Promise(r => setTimeout(r, 1500))
    const radicado = `SOL-${Date.now().toString().slice(-8)}`
    setSubmittedRadicado(radicado)
    setIsSubmitting(false)
  }

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="mx-4 mt-2 mb-4 rounded-3xl gradient-brand overflow-hidden shadow-brand relative">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
        <div className="px-5 py-5 relative">
          <button onClick={() => history.push('/dashboard/requests')} className="flex items-center gap-1.5 text-white/80 text-sm font-semibold mb-4">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Volver al listado
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[24px]">fact_check</span>
            </div>
            <div>
              <p className="text-brand-yellow text-[10px] font-bold uppercase tracking-widest">Solicitud de Novedades</p>
              <h1 className="text-white text-xl font-bold">Crear nueva solicitud</h1>
            </div>
          </div>
          <div className="flex justify-between text-xs text-white/70 mb-2">
            <span>Paso {step} de {SOLICITUD_STEPS.length}</span>
            <span>{Math.round(progress)}% completado</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="px-4 py-3 bg-black/15">
          <div className="stepper">
            {SOLICITUD_STEPS.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => s.id <= step && setStep(s.id)}
                className={`step-node ${s.id === step ? 'current' : ''} ${s.id < step ? 'done' : ''}`}
              >
                <div className="step-circle">
                  {s.id < step ? <span className="material-symbols-outlined text-[16px]">check</span> : s.id}
                </div>
                <span className="step-label">{s.shortTitle}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            <div className="section-card">
              <div className="section-header">
                <div className="section-icon">
                  <span className="material-symbols-outlined text-[28px]">{currentStepDef.icon}</span>
                </div>
                <div>
                  <div className="section-badge">{currentStepDef.badge}</div>
                  <h2 className="section-title">{currentStepDef.title}</h2>
                  <p className="section-desc">{currentStepDef.description}</p>
                </div>
              </div>

              <div className="section-body space-y-4">
                {/* STEP 1 */}
                {step === 1 && (
                  <>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Antes de iniciar, lee detenidamente las siguientes políticas internas para la solicitud de permisos y ausencias.
                    </p>
                    {LINEAMIENTOS.map((item, i) => (
                      <div key={i} className="lineamiento-card">
                        <span className="lineamiento-number">{i + 1}</span>
                        <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-brand-blue">{item.icon}</span>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-brand-dark mb-1">{item.title}</h3>
                          <p className="text-sm text-slate-600 leading-relaxed">{item.body}</p>
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={() => setLineamientosLeidos(!lineamientosLeidos)} className={`consent-card ${lineamientosLeidos ? 'checked' : ''}`}>
                      <div className="consent-checkbox">
                        {lineamientosLeidos && <span className="material-symbols-outlined text-[16px]">check</span>}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-brand-dark">He leído y comprendido los lineamientos</p>
                        <p className="text-xs text-slate-500 mt-0.5">Confirmo que entendí las políticas y estoy listo para continuar.</p>
                      </div>
                    </button>
                  </>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                  <>
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-brand-dark/5 to-brand-blue/5 rounded-2xl border border-brand-blue/10">
                      <div className="w-14 h-14 rounded-full gradient-brand text-white font-bold flex items-center justify-center text-lg">
                        {getInitials(currentUser.name)}
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Sesión activa</p>
                        <p className="font-bold text-brand-dark">{currentUser.name}</p>
                        <p className="text-xs text-slate-500">{currentUser.role} · {currentUser.documento}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="field-label">Empresa *</label>
                        <select className="field-select" value={form.empresaId ?? ''} onChange={e => {
                          const id = Number(e.target.value)
                          const emp = empresas.find(x => x.id === id)
                          patch({ empresaId: id, empresaNombre: emp?.name ?? '' })
                        }}>
                          {empresas.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="field-label">Nombre completo *</label>
                        <input className="field-input" value={form.nombreCompleto} onChange={e => patch({ nombreCompleto: e.target.value })} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="field-label">Identificación *</label>
                          <input className="field-input" value={form.numeroIdentificacion} onChange={e => patch({ numeroIdentificacion: e.target.value })} />
                        </div>
                        <div>
                          <label className="field-label">Cargo *</label>
                          <input className="field-input" value={form.cargo} onChange={e => patch({ cargo: e.target.value })} />
                        </div>
                      </div>
                      <div>
                        <label className="field-label">Correo *</label>
                        <input type="email" className="field-input" value={form.correoElectronico} onChange={e => patch({ correoElectronico: e.target.value })} />
                      </div>
                      <div>
                        <label className="field-label">Teléfono *</label>
                        <input type="tel" className="field-input" value={form.numeroContacto} onChange={e => patch({ numeroContacto: e.target.value })} />
                      </div>
                    </div>
                  </>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                  <>
                    <label className="field-label">Categoría *</label>
                    <div className="tipo-grid">
                      {TIPOS_DISPONIBLES.map(t => (
                        <button key={t} type="button" onClick={() => patch({ tipo: t, subtipo: '', otraNovedad: '' })} className={`tipo-card ${form.tipo === t ? 'selected' : ''}`}>
                          <span className="material-symbols-outlined text-[28px]">{TIPO_ICONS[t]}</span>
                          <span className="text-sm font-bold">{SOLICITUD_TIPO_LABELS[t]}</span>
                        </button>
                      ))}
                    </div>
                    {form.tipo && SUBTIPOS[form.tipo] && (
                      <div className="mt-4">
                        <label className="field-label">Subtipo *</label>
                        <div className="flex flex-wrap gap-2">
                          {SUBTIPOS[form.tipo].map(s => (
                            <button key={s} type="button" onClick={() => patch({ subtipo: s })} className={`subtipo-chip ${form.subtipo === s ? 'selected' : ''}`}>{s}</button>
                          ))}
                        </div>
                      </div>
                    )}
                    {form.tipo === 'OTRO' && (
                      <div>
                        <label className="field-label">Describe la novedad *</label>
                        <textarea className="field-textarea" rows={3} value={form.otraNovedad} onChange={e => patch({ otraNovedad: e.target.value })} />
                      </div>
                    )}
                  </>
                )}

                {/* STEP 4 */}
                {step === 4 && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="field-label">Fecha inicio *</label>
                        <input type="date" className="field-input" value={form.fechaDesde} onChange={e => patch({ fechaDesde: e.target.value })} />
                      </div>
                      <div>
                        <label className="field-label">Fecha fin *</label>
                        <input type="date" className="field-input" value={form.fechaHasta} min={form.fechaDesde} onChange={e => patch({ fechaHasta: e.target.value })} />
                      </div>
                    </div>
                    {form.fechaDesde && form.fechaHasta && (
                      <div className="duracion-display">
                        <span className="material-symbols-outlined text-[28px]">schedule</span>
                        <div className="flex-1">
                          <p className="text-xs text-white/70 uppercase font-semibold">Duración estimada</p>
                          <p className="text-sm">{formatDateLong(form.fechaDesde)} — {formatDateLong(form.fechaHasta)}</p>
                        </div>
                        <p className="text-3xl font-bold">{duracionDias} <span className="text-sm font-normal">días</span></p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="field-label">Hora salida (opc.)</label>
                        <input type="time" className="field-input" value={form.horaSalida} onChange={e => patch({ horaSalida: e.target.value })} />
                      </div>
                      <div>
                        <label className="field-label">Hora regreso (opc.)</label>
                        <input type="time" className="field-input" value={form.horaRegreso} onChange={e => patch({ horaRegreso: e.target.value })} />
                      </div>
                    </div>
                  </>
                )}

                {/* STEP 5 */}
                {step === 5 && (
                  <>
                    <label
                      className={`dropzone ${isDragging ? 'dragging' : ''}`}
                      onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={e => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files) addFiles(e.dataTransfer.files) }}
                    >
                      <div className="w-14 h-14 rounded-full gradient-brand flex items-center justify-center shadow-brand">
                        <span className="material-symbols-outlined text-white text-[28px]">cloud_upload</span>
                      </div>
                      <p className="font-bold text-brand-dark">Arrastra archivos o toca para seleccionar</p>
                      <p className="text-xs text-slate-500">PDF, IMG, DOC, XLS — Máx 10MB</p>
                      <input type="file" multiple className="hidden" onChange={e => e.target.files && addFiles(e.target.files)} />
                    </label>
                    {form.documentos.map(doc => (
                      <div key={doc.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="material-symbols-outlined text-brand-blue">description</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{doc.nombre}</p>
                          <p className="text-xs text-slate-500">{formatBytes(doc.tamano)}</p>
                        </div>
                        <button onClick={() => patch({ documentos: form.documentos.filter(d => d.id !== doc.id) })} className="text-red-400">
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    ))}
                    <div>
                      <label className="field-label">Observaciones</label>
                      <textarea className="field-textarea" rows={4} value={form.descripcion} onChange={e => patch({ descripcion: e.target.value })} placeholder="Comentarios para tu líder o Gestión Humana (opcional)..." />
                    </div>
                  </>
                )}

                {/* STEP 6 */}
                {step === 6 && (
                  <>
                    <div className="resumen-grid space-y-3 mb-4">
                      {form.tipo && (
                        <div className="resumen-card">
                          <span className="material-symbols-outlined text-brand-blue">fact_check</span>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-500">Tipo</p>
                            <p className="font-bold text-brand-dark">{SOLICITUD_TIPO_LABELS[form.tipo]}</p>
                            {form.subtipo && <p className="text-xs text-slate-500">{form.subtipo}</p>}
                          </div>
                        </div>
                      )}
                      {form.fechaDesde && (
                        <div className="resumen-card">
                          <span className="material-symbols-outlined text-brand-blue">calendar_month</span>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-500">Periodo</p>
                            <p className="font-bold text-brand-dark">{formatDateLong(form.fechaDesde)} — {formatDateLong(form.fechaHasta)}</p>
                            <p className="text-xs text-slate-500">{duracionDias} días hábiles</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <label className="field-label">Selecciona tu aprobador *</label>
                    <div className="space-y-2">
                      {aprobadores.map(a => (
                        <button key={a.id} type="button" onClick={() => patch({ aprobadorId: a.id, aprobadorNombre: a.nombre, aprobadorCargo: a.cargo })} className={`aprobador-card ${form.aprobadorId === a.id ? 'selected' : ''}`}>
                          <div className="aprobador-avatar">{getInitials(a.nombre)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-brand-dark text-sm">{a.nombre}</p>
                            <p className="text-xs text-slate-500">{a.cargo} · {a.departamento}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="footer-nav">
                {step > 1 ? (
                  <Button variant="secondary" icon="arrow_back" onClick={() => setStep(s => s - 1)}>Anterior</Button>
                ) : <div />}
                {step < 6 ? (
                  <Button variant="primary" icon="arrow_forward" disabled={!isStepValid} onClick={() => setStep(s => s + 1)}>
                    {step === 1 ? 'Continuar al formulario' : 'Siguiente'}
                  </Button>
                ) : (
                  <Button variant="success" icon="send" disabled={!isStepValid || isSubmitting} onClick={submit}>
                    {isSubmitting ? 'Enviando...' : 'Enviar solicitud'}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <Modal open={!!submittedRadicado} onClose={() => history.push('/dashboard/requests')} title="Solicitud enviada" icon="check_circle" iconClass="bg-emerald-500">
        <div className="text-center space-y-4">
          <p className="text-sm text-on-surface-variant">Tu solicitud fue registrada y notificada a tu aprobador.</p>
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Número de radicado</p>
            <p className="text-2xl font-bold text-brand-blue font-mono">{submittedRadicado}</p>
          </div>
          <Button variant="primary" className="w-full" onClick={() => history.push('/dashboard/requests')}>
            Volver al listado
          </Button>
        </div>
      </Modal>
    </div>
  )
}
