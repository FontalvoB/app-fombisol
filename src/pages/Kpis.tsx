import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { kpis, kpiSummary, teamMembers, type Kpi, type KpiStatus, type TeamMember } from '@/lib/mock-data'
import { useApp, isJefe } from '@/context/AppContext'
import { Card, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { FilterChip } from '@/components/ui/FilterChip'
import { Modal } from '@/components/ui/Modal'

const categories = ['Todos', 'Comercial', 'Operaciones', 'Finanzas', 'RRHH']

const statusConfig: Record<KpiStatus, { label: string; color: string; bg: string; dot: string }> = {
  'on-track': { label: 'En Curso', color: 'text-brand-blue', bg: 'bg-brand-blue/10', dot: 'bg-brand-blue' },
  'achieved': { label: 'Logrado', color: 'text-emerald-600', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
  'at-risk': { label: 'En Riesgo', color: 'text-amber-600', bg: 'bg-amber-50', dot: 'bg-amber-500' },
  'behind': { label: 'Atrasado', color: 'text-red-500', bg: 'bg-red-50', dot: 'bg-red-500' },
}

function formatKpiValue(kpi: Kpi) {
  if (kpi.unit === '$') return `$${(kpi.current / 1_000_000).toFixed(2)}M`
  return `${kpi.current}${kpi.unit}`
}

function formatTarget(kpi: Kpi) {
  if (kpi.unit === '$') return `$${(kpi.target / 1_000_000).toFixed(2)}M`
  return `${kpi.target}${kpi.unit}`
}

function KpiCard({ kpi, onEvaluate }: { kpi: Kpi; onEvaluate?: (k: Kpi) => void }) {
  const [expanded, setExpanded] = useState(false)
  const status = statusConfig[kpi.status]
  const progressColor =
    kpi.status === 'achieved' ? 'bg-emerald-500' :
    kpi.status === 'at-risk' ? 'bg-amber-500' :
    kpi.status === 'behind' ? 'bg-red-400' : 'bg-brand-blue'

  return (
    <Card className="active:scale-[0.99] transition-transform" onClick={() => setExpanded(!expanded)}>
      <CardBody className="!pt-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-2">
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-0.5">{kpi.category}</p>
            <h3 className="font-semibold text-brand-dark text-[15px] leading-snug">{kpi.name}</h3>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full ${status.bg}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              <span className={`text-[10px] font-bold ${status.color}`}>{status.label}</span>
            </div>
            {kpi.pendingEvaluation && (
              <Badge variant="warning">Por evaluar</Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(kpi.progress, 100)}%` }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className={`h-full ${progressColor} rounded-full`}
            />
          </div>
          <span className="text-sm font-bold text-brand-dark w-11 text-right">{kpi.progress.toFixed(0)}%</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-brand-dark">{formatKpiValue(kpi)}</span>
            <span className="text-xs text-on-surface-variant">/ {formatTarget(kpi)}</span>
          </div>
          <div className={`flex items-center gap-0.5 ${kpi.trend === 'up' ? 'text-emerald-500' : kpi.trend === 'down' ? 'text-red-400' : 'text-slate-400'}`}>
            <span className="material-symbols-outlined text-[18px]">
              {kpi.trend === 'up' ? 'trending_up' : kpi.trend === 'down' ? 'trending_down' : 'trending_flat'}
            </span>
            <span className="text-xs font-semibold">{kpi.trendValue}</span>
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="border-t border-slate-100 mt-4 pt-4">
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {[
                    { label: 'Período', value: kpi.period },
                    { label: 'Meta', value: formatTarget(kpi) },
                    { label: 'Avance', value: `${kpi.progress.toFixed(1)}%` },
                  ].map(item => (
                    <div key={item.label} className="text-center">
                      <p className="text-[10px] text-on-surface-variant uppercase font-semibold">{item.label}</p>
                      <p className="text-xs font-bold text-brand-dark mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>
                {onEvaluate && kpi.pendingEvaluation && (
                  <Button variant="primary" size="sm" className="w-full" icon="rate_review" onClick={(e) => { e.stopPropagation(); onEvaluate(kpi) }}>
                    Evaluar KPI
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardBody>
    </Card>
  )
}

function TeamMemberSection({ member, onEvaluate }: { member: TeamMember; onEvaluate: (k: Kpi, m: TeamMember) => void }) {
  const pending = member.kpis.filter(k => k.pendingEvaluation).length

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 px-1">
        <div className="w-11 h-11 rounded-full gradient-brand text-white font-bold flex items-center justify-center text-sm shadow-brand">
          {member.name.split(' ').slice(0, 2).map(n => n[0]).join('')}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-brand-dark text-sm">{member.name}</p>
          <p className="text-xs text-on-surface-variant">{member.role}</p>
        </div>
        {pending > 0 && <Badge variant="warning">{pending} pendiente{pending > 1 ? 's' : ''}</Badge>}
      </div>
      {member.kpis.map(kpi => (
        <KpiCard key={kpi.id} kpi={kpi} onEvaluate={(k) => onEvaluate(k, member)} />
      ))}
    </div>
  )
}

export default function KpisPage() {
  const { userRole } = useApp()
  const jefe = isJefe(userRole)
  const [tab, setTab] = useState<'mine' | 'team'>(jefe ? 'team' : 'mine')
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [evalTarget, setEvalTarget] = useState<{ kpi: Kpi; member?: TeamMember } | null>(null)
  const [evalScore, setEvalScore] = useState('')
  const [evalNote, setEvalNote] = useState('')
  const [evalDone, setEvalDone] = useState(false)

  const filtered = activeCategory === 'Todos' ? kpis : kpis.filter(k => k.category === activeCategory)
  const pendingTeam = teamMembers.reduce((acc, m) => acc + m.kpis.filter(k => k.pendingEvaluation).length, 0)

  function submitEvaluation() {
    setEvalDone(true)
    setTimeout(() => {
      setEvalTarget(null)
      setEvalDone(false)
      setEvalScore('')
      setEvalNote('')
    }, 1800)
  }

  return (
    <div className="page-container">
      {jefe && (
        <div className="flex gap-2 p-1 bg-white rounded-2xl shadow-[0_2px_12px_rgba(33,48,83,0.06)] border border-slate-100/90">
          {[
            { key: 'mine' as const, label: 'Mis KPIs', icon: 'person' },
            { key: 'team' as const, label: 'Mi Equipo', icon: 'groups', badge: pendingTeam },
          ].map(t => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-300 ${
                tab === t.key
                  ? 'text-white bg-gradient-to-br from-[#0569a8] via-[#045C94] to-[#213053] shadow-[0_4px_14px_rgba(4,92,148,0.32)]'
                  : 'text-on-surface-variant hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">{t.icon}</span>
              {t.label}
              {t.badge ? (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${tab === t.key ? 'bg-white/25 text-white' : 'bg-amber-100 text-amber-700'}`}>
                  {t.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      )}

      {tab === 'mine' && (
        <>
          <Card variant="gradient" glow>
            <CardBody>
              <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">Cumplimiento Global</p>
              <div className="flex items-end gap-3 mt-1 mb-4">
                <span className="text-white text-5xl font-bold">{kpiSummary.compliance}%</span>
                <div className="flex items-center gap-0.5 text-emerald-300 mb-2">
                  <span className="material-symbols-outlined text-[18px]">trending_up</span>
                  <span className="text-sm font-semibold">+3.2%</span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-brand-yellow rounded-full" style={{ width: `${kpiSummary.compliance}%` }} />
              </div>
            </CardBody>
          </Card>

          <div className="flex gap-2 overflow-x-auto -mx-4 px-4 hide-scrollbar pb-0.5">
            {categories.map(cat => (
              <FilterChip
                key={cat}
                label={cat}
                active={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
              />
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {filtered.map(kpi => <KpiCard key={kpi.id} kpi={kpi} />)}
          </div>
        </>
      )}

      {tab === 'team' && jefe && (
        <>
          <Card variant="elevated">
            <CardBody className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-indigo-600 text-[24px]">supervisor_account</span>
              </div>
              <div>
                <p className="font-bold text-brand-dark">Evaluación de equipo</p>
                <p className="text-sm text-on-surface-variant">{pendingTeam} KPIs pendientes de evaluación</p>
              </div>
            </CardBody>
          </Card>

          {teamMembers.map(member => (
            <TeamMemberSection
              key={member.id}
              member={member}
              onEvaluate={(kpi, m) => setEvalTarget({ kpi, member: m })}
            />
          ))}
        </>
      )}

      <Modal
        open={!!evalTarget && !evalDone}
        onClose={() => setEvalTarget(null)}
        title="Evaluar KPI"
        icon="rate_review"
      >
        {evalTarget && (
          <div className="space-y-4">
            {evalTarget.member && (
              <p className="text-sm text-on-surface-variant text-center">
                Colaborador: <strong className="text-brand-dark">{evalTarget.member.name}</strong>
              </p>
            )}
            <p className="text-center font-bold text-brand-dark">{evalTarget.kpi.name}</p>
            <div>
              <label className="field-label">Calificación (0-100)</label>
              <input type="number" min={0} max={100} value={evalScore} onChange={e => setEvalScore(e.target.value)} className="field-input" placeholder="Ej. 85" />
            </div>
            <div>
              <label className="field-label">Observaciones</label>
              <textarea value={evalNote} onChange={e => setEvalNote(e.target.value)} className="field-textarea" rows={3} placeholder="Comentarios de la evaluación..." />
            </div>
            <Button variant="success" className="w-full" icon="check" disabled={!evalScore} onClick={submitEvaluation}>
              Confirmar evaluación
            </Button>
          </div>
        )}
      </Modal>

      <Modal open={evalDone} onClose={() => {}} title="Evaluación registrada" icon="check_circle" iconClass="bg-emerald-500">
        <p className="text-center text-on-surface-variant text-sm">
          La evaluación del KPI fue guardada correctamente.
        </p>
      </Modal>
    </div>
  )
}
