'use client'

import { useRouter } from 'next/navigation'
import { currentUser, kpiSummary, recentActivity } from '@/lib/mock-data'

const quickActions = [
  { icon: 'analytics', label: 'Mis KPIs', path: '/dashboard/kpis', color: 'bg-brand-blue/10', iconColor: 'text-brand-blue' },
  { icon: 'fact_check', label: 'Solicitar Permiso', path: '/dashboard/requests', color: 'bg-amber-100', iconColor: 'text-amber-600' },
  { icon: 'description', label: 'Documentos', path: '/dashboard/documents', color: 'bg-emerald-100', iconColor: 'text-emerald-600' },
  { icon: 'hub', label: 'Organigrama', path: '/dashboard/org-chart', color: 'bg-indigo-100', iconColor: 'text-indigo-600' },
]

const statCards = [
  { label: 'KPIs Asig.', value: kpiSummary.assigned, icon: 'target', iconBg: 'bg-brand-blue/10', iconColor: 'text-brand-blue' },
  { label: 'Por Evaluar', value: kpiSummary.pending, icon: 'pending_actions', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
  { label: 'Cumplimiento', value: `${kpiSummary.compliance}%`, icon: 'check_circle', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
]

function today() {
  return new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function DashboardPage() {
  const router = useRouter()

  // Donut chart values
  const highPerf = 76 // % of circumference for blue (251.2 total = 2πr, r=40)
  const circumference = 2 * Math.PI * 40 // ≈ 251.2

  return (
    <div className="flex flex-col gap-5 px-4 py-4 max-w-lg mx-auto">
      {/* Welcome */}
      <div className="flex items-start justify-between anim-hidden animate-slide-up delay-100">
        <div>
          <p className="text-xs text-on-surface-variant font-medium capitalize">{today()}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <h1 className="text-[#213053] text-2xl font-bold leading-tight">
              Bienvenido, {currentUser.firstName}
            </h1>
            <div className="relative w-3 h-3 flex items-center justify-center">
              <div className="absolute inset-0 bg-brand-blue rounded-full opacity-60 animate-pulse-soft" />
              <div className="relative w-2 h-2 bg-brand-blue rounded-full shadow-[0_0_8px_rgba(4,92,148,0.6)]" />
            </div>
          </div>
          <p className="text-on-surface-variant text-sm mt-0.5">{currentUser.role}</p>
        </div>
        <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center shadow-lg shadow-brand-blue/30 flex-shrink-0 mt-1">
          <span className="material-symbols-outlined text-white text-[24px]">person</span>
        </div>
      </div>

      {/* Stat cards horizontal scroll */}
      <div className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-1 hide-scrollbar anim-hidden animate-slide-up delay-150">
        {statCards.map((card, i) => (
          <div
            key={card.label}
            className="min-w-[130px] flex-shrink-0 bg-white rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100/80 relative overflow-hidden transition-all duration-300 active:scale-95"
            style={{ animationDelay: `${0.15 + i * 0.05}s` }}
          >
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand-yellow to-brand-blue" />
            <div className="flex items-center gap-2 mb-2 mt-1">
              <div className={`w-8 h-8 rounded-lg ${card.iconBg} flex items-center justify-center`}>
                <span className={`material-symbols-outlined ${card.iconColor} text-[18px]`}>{card.icon}</span>
              </div>
              <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider leading-tight">
                {card.label}
              </span>
            </div>
            <span className="text-[#213053] text-3xl font-bold leading-none">{card.value}</span>
          </div>
        ))}
      </div>

      {/* Donut chart card */}
      <div className="card-glass rounded-2xl p-4 anim-hidden animate-slide-up delay-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-bold text-[#213053] text-base">Distribución de Talento</h2>
            <p className="text-xs text-on-surface-variant">Cierre Q4 2024</p>
          </div>
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white/60 text-on-surface-variant hover:bg-white/90 transition-colors">
            <span className="material-symbols-outlined text-[18px]">more_vert</span>
          </button>
        </div>

        <div className="flex items-center gap-6">
          {/* SVG Donut */}
          <div className="relative w-32 h-32 flex-shrink-0">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e2e8f0" strokeWidth="12" />
              <circle
                cx="50" cy="50" r="40" fill="transparent"
                stroke="#045C94"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${circumference * 0.76} ${circumference}`}
                strokeDashoffset="0"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(4,92,148,0.35))' }}
                className="animate-stroke"
              />
              <circle
                cx="50" cy="50" r="40" fill="transparent"
                stroke="#FFB71B"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${circumference * 0.20} ${circumference}`}
                strokeDashoffset={`-${circumference * 0.76}`}
                style={{ filter: 'drop-shadow(0 2px 4px rgba(255,183,27,0.35))' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[#213053] text-2xl font-bold leading-none">88%</span>
              <span className="text-[9px] text-on-surface-variant uppercase font-bold tracking-widest">Global</span>
            </div>
          </div>

          {/* Legend & detail */}
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-blue shadow-[0_0_5px_rgba(4,92,148,0.5)]" />
                  <span className="text-xs text-on-surface-variant font-medium">Alto Desempeño</span>
                </div>
                <span className="text-xs font-bold text-[#213053]">76%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-blue rounded-full w-[76%] animate-progress" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-yellow shadow-[0_0_5px_rgba(255,183,27,0.5)]" />
                  <span className="text-xs text-on-surface-variant font-medium">En Desarrollo</span>
                </div>
                <span className="text-xs font-bold text-[#213053]">20%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-yellow rounded-full w-[20%] animate-progress" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <span className="text-xs text-on-surface-variant font-medium">Bajo Rend.</span>
                </div>
                <span className="text-xs font-bold text-[#213053]">4%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-300 rounded-full w-[4%] animate-progress" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="anim-hidden animate-slide-up delay-300">
        <h2 className="font-bold text-[#213053] text-base mb-3 px-1">Acciones Rápidas</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, i) => (
            <button
              key={action.path}
              onClick={() => router.push(action.path)}
              className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center gap-2.5 border border-gray-100/80 shadow-[0_4px_15px_rgba(0,0,0,0.04)] transition-all duration-200 active:scale-95 hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)] group"
              style={{ animationDelay: `${0.3 + i * 0.05}s` }}
            >
              <div className={`w-11 h-11 rounded-full ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <span className={`material-symbols-outlined ${action.iconColor} text-[22px]`}>{action.icon}</span>
              </div>
              <span className="text-xs font-semibold text-[#213053] text-center leading-tight">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card-glass rounded-2xl p-4 anim-hidden animate-slide-up delay-400">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-[#213053] text-base">Actividad Reciente</h2>
          <button
            onClick={() => router.push('/dashboard/notifications')}
            className="text-brand-blue text-xs font-semibold uppercase tracking-wider hover:underline"
          >
            Ver todo
          </button>
        </div>
        <div className="flex flex-col">
          {recentActivity.map((item, i) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 py-3 transition-colors cursor-pointer hover:bg-white/40 -mx-4 px-4 rounded-xl ${
                i < recentActivity.length - 1 ? 'border-b border-gray-100/70' : ''
              }`}
            >
              <div className={`w-10 h-10 rounded-full ${item.iconBg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                <span className={`material-symbols-outlined ${item.iconColor} text-[20px]`}>{item.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#213053] leading-snug truncate">
                  {item.text} <span className="font-bold">{item.bold}</span>
                </p>
                <span className="text-[10px] text-on-surface-variant uppercase font-semibold tracking-wider">{item.time}</span>
              </div>
              <span className="material-symbols-outlined text-slate-300 text-[18px]">chevron_right</span>
            </div>
          ))}
        </div>
      </div>

      {/* Spacer */}
      <div className="h-2" />
    </div>
  )
}
