'use client'

import { useState } from 'react'
import { leaveRequests, type LeaveRequest, type RequestStatus, type RequestType } from '@/lib/mock-data'

const statusConfig: Record<RequestStatus, { label: string; color: string; bg: string; icon: string }> = {
  pending: { label: 'Pendiente', color: 'text-amber-600', bg: 'bg-amber-50', icon: 'pending' },
  approved: { label: 'Aprobado', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: 'check_circle' },
  rejected: { label: 'Rechazado', color: 'text-red-500', bg: 'bg-red-50', icon: 'cancel' },
  draft: { label: 'Borrador', color: 'text-slate-500', bg: 'bg-slate-100', icon: 'draft' },
}

const typeConfig: Record<RequestType, { label: string; icon: string; color: string; bg: string }> = {
  vacation: { label: 'Vacaciones', icon: 'beach_access', color: 'text-brand-blue', bg: 'bg-brand-blue/10' },
  medical: { label: 'Médico', icon: 'medical_services', color: 'text-red-500', bg: 'bg-red-50' },
  personal: { label: 'Personal', icon: 'person', color: 'text-purple-600', bg: 'bg-purple-50' },
  training: { label: 'Capacitación', icon: 'school', color: 'text-amber-600', bg: 'bg-amber-50' },
  other: { label: 'Otro', icon: 'more_horiz', color: 'text-slate-500', bg: 'bg-slate-100' },
}

const requestTypes: RequestType[] = ['vacation', 'medical', 'personal', 'training', 'other']

function RequestCard({ req, delay }: { req: LeaveRequest; delay: number }) {
  const [expanded, setExpanded] = useState(false)
  const status = statusConfig[req.status]
  const type = typeConfig[req.type]

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100/80 shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden transition-all anim-hidden animate-slide-up cursor-pointer active:scale-[0.98]"
      style={{ animationDelay: `${delay}s` }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Type icon */}
          <div className={`w-10 h-10 rounded-xl ${type.bg} flex items-center justify-center flex-shrink-0`}>
            <span className={`material-symbols-outlined ${type.color} text-[20px]`}>{type.icon}</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-[#213053] text-sm leading-snug flex-1 min-w-0 truncate">
                {req.title}
              </h3>
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full ${status.bg} flex-shrink-0`}>
                <span className={`material-symbols-outlined ${status.color} text-[12px]`} style={{ fontSize: '12px' }}>
                  {status.icon}
                </span>
                <span className={`text-[10px] font-bold ${status.color}`}>{status.label}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-1.5">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-on-surface-variant text-[14px]">calendar_today</span>
                <span className="text-[11px] text-on-surface-variant">{req.startDate}</span>
                {req.endDate !== req.startDate && (
                  <span className="text-[11px] text-on-surface-variant"> — {req.endDate}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-on-surface-variant text-[14px]">schedule</span>
                <span className="text-[11px] text-on-surface-variant font-medium">{req.days} día{req.days !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50/60 px-4 py-3 animate-slide-up">
          <div className="flex flex-col gap-2.5">
            {req.note && (
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider mb-1">Motivo</p>
                <p className="text-sm text-[#213053]">{req.note}</p>
              </div>
            )}
            <div className="flex gap-4">
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider mb-0.5">Solicitado</p>
                <p className="text-xs text-[#213053] font-medium">{req.submittedAt}</p>
              </div>
              {req.approvedBy && (
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider mb-0.5">Aprobado por</p>
                  <p className="text-xs text-[#213053] font-medium">{req.approvedBy}</p>
                </div>
              )}
            </div>

            {req.status === 'pending' && (
              <button className="w-full mt-1 py-2.5 rounded-xl bg-red-50 text-red-500 font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all">
                <span className="material-symbols-outlined text-[16px]">delete</span>
                Cancelar solicitud
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

type FormStep = 'type' | 'dates' | 'note' | 'confirm'

function NewRequestModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<FormStep>('type')
  const [selectedType, setSelectedType] = useState<RequestType | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [note, setNote] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const steps: FormStep[] = ['type', 'dates', 'note', 'confirm']
  const stepIndex = steps.indexOf(step)
  const progress = ((stepIndex + 1) / steps.length) * 100

  async function handleSubmit() {
    setSubmitted(true)
    await new Promise(r => setTimeout(r, 1500))
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl overflow-hidden animate-slide-up shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-brand-blue transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-6">
          {/* Handle */}
          <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-[#213053] text-lg">Nueva Solicitud</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-2 mb-6">
            {steps.map((s, i) => (
              <div
                key={s}
                className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                  i <= stepIndex ? 'bg-brand-blue' : 'bg-gray-100'
                }`}
              />
            ))}
          </div>

          {/* STEP 1: Type */}
          {step === 'type' && (
            <div className="animate-scale-in">
              <p className="text-sm text-on-surface-variant mb-4 font-medium">¿Qué tipo de permiso necesitas?</p>
              <div className="grid grid-cols-2 gap-2.5">
                {requestTypes.map((t) => {
                  const conf = typeConfig[t]
                  return (
                    <button
                      key={t}
                      onClick={() => setSelectedType(t)}
                      className={`flex items-center gap-2.5 p-3.5 rounded-xl border-2 transition-all ${
                        selectedType === t
                          ? 'border-brand-blue bg-brand-blue/5 shadow-md shadow-brand-blue/10'
                          : 'border-gray-100 bg-gray-50/60 hover:border-gray-200'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg ${conf.bg} flex items-center justify-center flex-shrink-0`}>
                        <span className={`material-symbols-outlined ${conf.color} text-[18px]`}>{conf.icon}</span>
                      </div>
                      <span className={`text-xs font-semibold ${selectedType === t ? 'text-brand-blue' : 'text-[#213053]'}`}>
                        {conf.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Dates */}
          {step === 'dates' && (
            <div className="animate-scale-in flex flex-col gap-4">
              <p className="text-sm text-on-surface-variant font-medium">Selecciona las fechas del permiso</p>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Fecha de inicio</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-transparent transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Fecha de fin</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  min={startDate}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-transparent transition-all"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Note */}
          {step === 'note' && (
            <div className="animate-scale-in flex flex-col gap-3">
              <p className="text-sm text-on-surface-variant font-medium">Agrega un motivo o comentario (opcional)</p>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Describe brevemente el motivo de tu solicitud..."
                rows={4}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-transparent transition-all resize-none"
              />
            </div>
          )}

          {/* STEP 4: Confirm */}
          {step === 'confirm' && !submitted && selectedType && (
            <div className="animate-scale-in flex flex-col gap-3">
              <p className="text-sm text-on-surface-variant font-medium">Revisa los detalles antes de enviar</p>
              <div className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${typeConfig[selectedType].bg} flex items-center justify-center`}>
                    <span className={`material-symbols-outlined ${typeConfig[selectedType].color} text-[20px]`}>
                      {typeConfig[selectedType].icon}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-[#213053] text-sm">{typeConfig[selectedType].label}</p>
                    <p className="text-xs text-on-surface-variant">
                      {startDate || '—'} {endDate && endDate !== startDate ? `— ${endDate}` : ''}
                    </p>
                  </div>
                </div>
                {note && (
                  <div className="border-t border-gray-200 pt-3">
                    <p className="text-xs text-on-surface-variant">{note}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {submitted && (
            <div className="flex flex-col items-center py-4 animate-bounce-in">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-emerald-500 text-[32px]">check_circle</span>
              </div>
              <p className="font-bold text-[#213053] text-base">Solicitud enviada</p>
              <p className="text-on-surface-variant text-sm mt-1 text-center">
                Tu solicitud fue enviada y está pendiente de aprobación.
              </p>
            </div>
          )}

          {/* Navigation */}
          {!submitted && (
            <div className="flex gap-3 mt-6">
              {stepIndex > 0 && (
                <button
                  onClick={() => setStep(steps[stepIndex - 1])}
                  className="flex-1 py-3 rounded-xl bg-gray-100 text-on-surface-variant font-semibold text-sm active:scale-95 transition-all"
                >
                  Atrás
                </button>
              )}
              {step !== 'confirm' ? (
                <button
                  onClick={() => setStep(steps[stepIndex + 1])}
                  disabled={step === 'type' && !selectedType}
                  className="flex-1 py-3 rounded-xl gradient-brand text-white font-semibold text-sm active:scale-95 transition-all disabled:opacity-40 shadow-md shadow-brand-blue/25"
                >
                  Continuar
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  Enviar solicitud
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RequestsPage() {
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState<RequestStatus | 'all'>('all')

  const filtered = activeTab === 'all'
    ? leaveRequests
    : leaveRequests.filter(r => r.status === activeTab)

  const tabs: { key: RequestStatus | 'all'; label: string }[] = [
    { key: 'all', label: 'Todas' },
    { key: 'pending', label: 'Pendientes' },
    { key: 'approved', label: 'Aprobadas' },
    { key: 'rejected', label: 'Rechazadas' },
  ]

  return (
    <div className="flex flex-col gap-4 px-4 py-4 max-w-lg mx-auto">
      {/* Summary */}
      <div className="gradient-brand rounded-2xl p-4 relative overflow-hidden anim-hidden animate-slide-up delay-100">
        <div className="absolute -right-8 -bottom-4 w-32 h-32 rounded-full bg-white/5" />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">Mis Solicitudes</p>
            <p className="text-white text-3xl font-bold mt-0.5">{leaveRequests.length}</p>
            <p className="text-white/60 text-xs mt-1">en total este año</p>
          </div>
          <div className="flex gap-2.5">
            {(['pending', 'approved', 'rejected'] as RequestStatus[]).map((s) => {
              const count = leaveRequests.filter(r => r.status === s).length
              const conf = statusConfig[s]
              return (
                <div key={s} className="flex flex-col items-center bg-white/10 rounded-xl px-3 py-2">
                  <span className={`material-symbols-outlined text-white text-[18px]`}>{conf.icon}</span>
                  <span className="text-white text-sm font-bold">{count}</span>
                  <span className="text-white/60 text-[9px] uppercase font-semibold">{conf.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-0.5 hide-scrollbar anim-hidden animate-slide-up delay-150">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/25'
                : 'bg-white text-on-surface-variant border border-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-gray-400 text-[32px]">inbox</span>
          </div>
          <p className="text-on-surface-variant font-medium">No hay solicitudes</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((req, i) => (
            <RequestCard key={req.id} req={req} delay={0.2 + i * 0.05} />
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-24 right-4 w-14 h-14 gradient-brand rounded-full flex items-center justify-center shadow-xl shadow-brand-blue/35 active:scale-90 transition-all duration-200 z-40"
        aria-label="Nueva solicitud"
      >
        <span className="material-symbols-outlined text-white text-[24px]">add</span>
      </button>

      {showModal && <NewRequestModal onClose={() => setShowModal(false)} />}

      <div className="h-2" />
    </div>
  )
}
