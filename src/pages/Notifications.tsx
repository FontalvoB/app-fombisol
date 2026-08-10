import { useState } from 'react'
import { notifications as initialNotifications } from '@/lib/mock-data'

export default function NotificationsPage() {
  const [items, setItems] = useState(initialNotifications)

  const unread = items.filter(n => !n.read).length

  function markAll() {
    setItems(prev => prev.map(n => ({ ...n, read: true })))
  }

  function markOne(id: string) {
    setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between anim-hidden animate-slide-up delay-100">
        <div>
          <h2 className="font-bold text-[#213053] text-base">Centro de Notificaciones</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            {unread > 0 ? `${unread} sin leer` : 'Todo al día'}
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={markAll}
            className="text-brand-blue text-xs font-semibold hover:underline"
          >
            Marcar todo leído
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2 anim-hidden animate-slide-up delay-150">
        {items.map((notif, i) => (
          <div
            key={notif.id}
            onClick={() => markOne(notif.id)}
            className={`flex items-start gap-3 p-4 rounded-2xl border transition-all duration-200 cursor-pointer active:scale-[0.98] ${
              !notif.read
                ? 'bg-white border-brand-blue/15 shadow-[0_4px_20px_rgba(4,92,148,0.06)]'
                : 'bg-white/60 border-gray-100/80'
            }`}
            style={{ animationDelay: `${0.1 + i * 0.05}s` }}
          >
            <div className={`w-10 h-10 rounded-full ${notif.iconBg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
              <span className={`material-symbols-outlined ${notif.iconColor} text-[20px]`}>{notif.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className={`text-sm leading-snug ${!notif.read ? 'font-semibold text-[#213053]' : 'font-medium text-on-surface'}`}>
                  {notif.title}
                </p>
                {!notif.read && (
                  <div className="w-2 h-2 rounded-full bg-brand-blue flex-shrink-0 mt-1.5" />
                )}
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">{notif.body}</p>
              <p className="text-[10px] text-on-surface-variant/60 uppercase font-semibold tracking-wider mt-1.5">{notif.time}</p>
            </div>
          </div>
        ))}
      </div>

      {unread === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in">
          <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-emerald-500 text-[28px]">notifications_active</span>
          </div>
          <p className="text-sm font-semibold text-[#213053]">Estás al día</p>
          <p className="text-xs text-on-surface-variant mt-1">No tienes notificaciones sin leer.</p>
        </div>
      )}

      <div className="h-2" />
    </div>
  )
}
