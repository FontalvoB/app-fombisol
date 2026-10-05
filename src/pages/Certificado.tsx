import { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { motion } from 'framer-motion'
import { currentUser, empresas } from '@/lib/mock-data'
import type { CertificadoFormData, CertificadoGenerado, CertificadoTipo } from '@/lib/certificado-types'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { PageHero } from '@/components/ui/PageHero'

const tipoOptions: { value: CertificadoTipo; label: string; desc: string; icon: string }[] = [
  { value: 'laboral', label: 'Laboral', desc: 'Certificado estándar de vinculación', icon: 'badge' },
  { value: 'personalizado', label: 'Personalizado', desc: 'Con campos adicionales a medida', icon: 'edit_document' },
]

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export default function CertificadoPage() {
  const history = useHistory()
  const [submitting, setSubmitting] = useState(false)
  const [generated, setGenerated] = useState<CertificadoGenerado | null>(null)

  const [form, setForm] = useState<CertificadoFormData>({
    nombreCompleto: currentUser.name,
    documento: currentUser.documento,
    cargo: currentUser.role,
    empresaId: currentUser.empresaId,
    empresaNombre: currentUser.empresaNombre,
    tipo: 'laboral',
    fechaEmision: todayISO(),
  })

  const isValid = !!(
    form.nombreCompleto.trim() &&
    form.documento.trim() &&
    form.cargo.trim() &&
    form.empresaId &&
    form.fechaEmision
  )

  function patch(p: Partial<CertificadoFormData>) {
    setForm(prev => ({ ...prev, ...p }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1400))
    const numero = `CERT-${Date.now().toString().slice(-6)}`
    setGenerated({
      id: `c-${Date.now()}`,
      numero,
      tipo: form.tipo,
      empleado: form.nombreCompleto,
      empresa: form.empresaNombre,
      fechaEmision: form.fechaEmision,
      generadoEn: new Date().toLocaleString('es-CO'),
    })
    setSubmitting(false)
  }

  return (
    <div className="page-container pb-28">
      <PageHero
        eyebrow="Recursos humanos"
        title="Certificado"
        subtitle="Generación de certificado laboral"
        stats={[
          { value: '2', label: 'Tipos' },
          { value: empresas.length, label: 'Empresas' },
          { value: 'PDF', label: 'Formato' },
        ]}
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="section-card">
          <div className="section-header">
            <span className="material-symbols-outlined text-brand-blue text-[20px]">person</span>
            <div>
              <h3 className="section-title text-base">Datos del empleado</h3>
              <p className="section-desc text-xs">Información que aparecerá en el certificado</p>
            </div>
          </div>
          <div className="section-body space-y-4">
            <div>
              <label className="field-label">Nombre completo</label>
              <input
                type="text"
                value={form.nombreCompleto}
                onChange={e => patch({ nombreCompleto: e.target.value })}
                className="field-input"
                placeholder="Nombre del empleado"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="field-label">Documento</label>
                <input
                  type="text"
                  value={form.documento}
                  onChange={e => patch({ documento: e.target.value })}
                  className="field-input"
                />
              </div>
              <div>
                <label className="field-label">Cargo</label>
                <input
                  type="text"
                  value={form.cargo}
                  onChange={e => patch({ cargo: e.target.value })}
                  className="field-input"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="section-card">
          <div className="section-header">
            <span className="material-symbols-outlined text-brand-blue text-[20px]">business</span>
            <div>
              <h3 className="section-title text-base">Empresa</h3>
              <p className="section-desc text-xs">Entidad emisora del certificado</p>
            </div>
          </div>
          <div className="section-body">
            <label className="field-label">Empresa</label>
            <select
              value={form.empresaId}
              onChange={e => {
                const emp = empresas.find(x => x.id === Number(e.target.value))
                patch({ empresaId: Number(e.target.value), empresaNombre: emp?.name ?? '' })
              }}
              className="field-select"
            >
              {empresas.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="section-card">
          <div className="section-header">
            <span className="material-symbols-outlined text-brand-blue text-[20px]">category</span>
            <div>
              <h3 className="section-title text-base">Tipo de certificado</h3>
              <p className="section-desc text-xs">Selecciona el formato a generar</p>
            </div>
          </div>
          <div className="section-body grid grid-cols-1 gap-2.5">
            {tipoOptions.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => patch({ tipo: opt.value })}
                className={`cert-type-option ${form.tipo === opt.value ? 'cert-type-option-active' : ''}`}
              >
                <div className={`cert-type-icon ${form.tipo === opt.value ? 'cert-type-icon-active' : ''}`}>
                  <span className="material-symbols-outlined text-[20px]">{opt.icon}</span>
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-semibold text-brand-dark">{opt.label}</p>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">{opt.desc}</p>
                </div>
                <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  form.tipo === opt.value ? 'border-brand-blue bg-brand-blue' : 'border-slate-300'
                }`}>
                  {form.tipo === opt.value && <span className="w-2 h-2 rounded-full bg-white" />}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="section-card">
          <div className="section-header">
            <span className="material-symbols-outlined text-brand-blue text-[20px]">event</span>
            <div>
              <h3 className="section-title text-base">Fecha de emisión</h3>
              <p className="section-desc text-xs">Fecha que constará en el documento</p>
            </div>
          </div>
          <div className="section-body">
            <label className="field-label">Fecha</label>
            <input
              type="date"
              value={form.fechaEmision}
              onChange={e => patch({ fechaEmision: e.target.value })}
              className="field-input"
            />
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="form-submit-bar">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            showArrow
            icon="workspace_premium"
            disabled={!isValid || submitting}
          >
            {submitting ? 'Generando certificado...' : 'Generar certificado'}
          </Button>
        </motion.div>
      </form>

      <Modal
        open={!!generated}
        onClose={() => { setGenerated(null); history.push('/dashboard') }}
        title="Certificado generado"
        icon="verified"
      >
        {generated && (
          <div className="space-y-4">
            <div className="text-center py-2">
              <div className="w-16 h-16 rounded-2xl gradient-brand mx-auto flex items-center justify-center shadow-brand mb-3">
                <span className="material-symbols-outlined text-white text-[32px]">description</span>
              </div>
              <p className="text-xs text-on-surface-variant uppercase font-bold tracking-wider">Número de certificado</p>
              <p className="text-xl font-bold text-brand-dark mt-1">{generated.numero}</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 space-y-2 text-sm">
              <p><span className="text-on-surface-variant">Empleado:</span> <strong>{generated.empleado}</strong></p>
              <p><span className="text-on-surface-variant">Empresa:</span> <strong>{generated.empresa}</strong></p>
              <p><span className="text-on-surface-variant">Tipo:</span> <strong className="capitalize">{generated.tipo}</strong></p>
              <p><span className="text-on-surface-variant">Emisión:</span> <strong>{generated.fechaEmision}</strong></p>
            </div>
            <Button variant="primary" fullWidth showArrow icon="download" onClick={() => setGenerated(null)}>
              Descargar PDF
            </Button>
            <Button variant="secondary" fullWidth onClick={() => { setGenerated(null); history.push('/dashboard') }}>
              Volver al inicio
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
