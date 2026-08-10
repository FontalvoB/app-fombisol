'use client'

import { useState } from 'react'
import { kpis, kpiSummary, type Kpi, type KpiStatus } from '@/lib/mock-data'

const categories = ['Todos', 'Comercial', 'Operaciones', 'Finanzas', 'RRHH']

const statusConfig: Record<KpiStatus, { label: string; color: string; bg: string; dot: string }> = {
  'on-track': { label: 'En Curso', color: 'text-brand-blue', bg: 'bg-brand-blue/10', dot: 'bg-brand-blue' },
  'achieved': { label: 'Logrado', color: 'text-emerald-600', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
  'at-risk': { label: 'En Riesgo', color: 'text-amber-600', bg: 'bg-amber-50', dot: 'bg-amber-500' },
  'behind': { label: 'Atrasado', color: 'text-red-500', bg: 'bg-red-50', dot: 'bg-red-500' },
}

function KpiCard({ kpi, delay }: { kpi: Kpi; delay: number }) {
  const [expanded, setExpanded] = useState(false)
  const status = statusConfig[kpi.status]
  const progressColor =
    kpi.status === 'achieved' ? 'bg-emerald-500' :
    kpi.status === 'at-risk' ? 'bg-amber-500' :
    kpi.status === 'behind' ? 'bg-red-400' :
    'bg-brand-blue'

  const displayValue =
    kpi.unit === '$'
      ? `$${(kpi.current / 1_000_000).toFixed(2)}M`
      : `${kpi.current}${kpi.unit}`

  const displayTarget =
    kpi.unit === '$'
      ? `$${(kpi.target / 1_000_000).toFixed(2)}M`
      : `${kpi.target}${kpi.unit}`

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100/80 shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-300 anim-hidden animate-slide-up cursor-pointer active:scale-[0.98]"
      style={{ animationDelay: `${delay}s` }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-2">
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-0.5">
              {kpi.category}
            </p>
            <h3 className="font-semibold text-[#213053] text-sm leading-snug">{kpi.name}</h3>
          </div>
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full ${status.bg} flex-shrink-0`}>
            <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            <span className={`text-[10px] font-bold ${status.color}`}>{status.label}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${progressColor} rounded-full transition-all duration-1000`}
              style={{ width: `${Math.min(kpi.progress, 100)}%` }}
            />
          </div>
          <span className="text-xs font-bold text-[#213053] w-10 text-right">{kpi.progress.toFixed(0)}%</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-bold text-[#213053]">{displayValue}</span>
            <span className="text-xs text-on-surface-variant">/ {displayTarget}</span>1
          </div>
          <div className={`flex items-center gap-0.5 ${kpi.trend === 'up' ? 'text-emerald-500' : kpi.trend === 'down' ? 'text-red-400' : 'text-slate-400'}`}>
            <span className="material-symbols-outlined text-[16px]">
              {kpi.trend === 'up' ? 'trending_up' : kpi.trend === 'down' ? 'trending_down' : 'trending_flat'}
            </span>
            <span className="text-xs font-semibold">{kpi.trendValue}</span>
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50/60 px-4 py-3 animate-slide-up">
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-on-surface-variant uppercase font-semibold mb-0.5">Período</span>
              <span className="text-xs font-bold text-[#213053]">{kpi.period}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-on-surface-variant uppercase font-semibold mb-0.5">Meta</span>
              <span className="text-xs font-bold text-[#213053]">{displayTarget}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-on-surface-variant uppercase font-semibold mb-0.5">Avance</span>
              <span className="text-xs font-bold text-[#213053]">{kpi.progress.toFixed(1)}%</span>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button className="flex-1 py-2 rounded-xl bg-brand-blue text-white text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-[16px]">edit</span>
              Actualizar
            </button>
            <button className="flex-1 py-2 rounded-xl bg-gray-100 text-on-surface-variant text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-[16px]">bar_chart</span>
              Historial
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function KpisPage() {
  const [activeCategory, setActiveCategory] = useState('Todos')

  const filtered = activeCategory === 'Todos' ? kpis : kpis.filter(k => k.category === activeCategory)

  const totalAchieved = kpis.filter(k => k.status === 'achieved').length
  const totalOnTrack = kpis.filter(k => k.status === 'on-track').length
  const totalAtRisk = kpis.filter(k => k.status === 'at-risk' || k.status === 'behind').length

  return (
    <div className="flex flex-col gap-4 px-4 py-4 max-w-lg mx-auto">
      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-2.5 anim-hidden animate-slide-up delay-100">
        <div className="bg-white rounded-2xl p-3 border border-gray-100/80 shadow-[0_4px_15px_rgba(0,0,0,0.04)] text-center">
          <span className="text-2xl font-bold text-emerald-600">{totalAchieved}</span>
          <p className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-wide mt-0.5">Logrados</p>
        </div>
        <div className="bg-white rounded-2xl p-3 border border-gray-100/80 shadow-[0_4px_15px_rgba(0,0,0,0.04)] text-center">
          <span className="text-2xl font-bold text-brand-blue">{totalOnTrack}</span>
          <p className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-wide mt-0.5">En Curso</p>
        </div>
        <div className="bg-white rounded-2xl p-3 border border-gray-100/80 shadow-[0_4px_15px_rgba(0,0,0,0.04)] text-center">
          <span className="text-2xl font-bold text-amber-600">{totalAtRisk}</span>
          <p className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-wide mt-0.5">En Riesgo</p>
        </div>
      </div>

      {/* Overall compliance */}
      <div className="gradient-brand rounded-2xl p-4 relative overflow-hidden anim-hidden animate-slide-up delay-150">
        <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/5" />
        <div className="absolute -right-2 bottom-0 w-20 h-20 rounded-full bg-white/5" />
        <div className="relative">
          <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">Cumplimiento Global</p>
          <div className="flex items-end gap-2 mt-1 mb-3">
            <span className="text-white text-4xl font-bold">{kpiSummary.compliance}%</span>
            <div className="flex items-center gap-0.5 text-emerald-300 mb-1">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span className="text-xs font-semibold">+3.2%</span>
            </div>
          </div>
          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-yellow rounded-full transition-all"
              style={{ width: `${kpiSummary.compliance}%` }}
            />
          </div>
          <p className="text-white/60 text-xs mt-2">Período: Q4 2024</p>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-0.5 hide-scrollbar anim-hidden animate-slide-up delay-200">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
              activeCategory === cat
                ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/25'
                : 'bg-white text-on-surface-variant border border-gray-200 hover:border-brand-blue/30'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="flex flex-col gap-3">
        {filtered.map((kpi, i) => (
          <KpiCard key={kpi.id} kpi={kpi} delay={0.2 + i * 0.05} />
        ))}
      </div>

      <div className="h-2" />
    </div>
  )
}
