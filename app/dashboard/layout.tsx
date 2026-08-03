'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { currentUser } from '@/lib/mock-data'

const navItems = [
  { path: '/dashboard', icon: 'grid_view', label: 'Inicio' },
  { path: '/dashboard/kpis', icon: 'analytics', label: 'KPIs' },
  { path: '/dashboard/documents', icon: 'description', label: 'Docs' },
  { path: '/dashboard/requests', icon: 'fact_check', label: 'Permisos' },
  { path: '/dashboard/profile', icon: 'manage_accounts', label: 'Perfil' },
]

const sidebarItems = [
  { path: '/dashboard', icon: 'grid_view', label: 'Inicio' },
  { path: '/dashboard/kpis', icon: 'analytics', label: 'KPIs' },
  { path: '/dashboard/documents', icon: 'description', label: 'Documentos' },
  { path: '/dashboard/org-chart', icon: 'hub', label: 'Organigrama' },
  { path: '/dashboard/requests', icon: 'fact_check', label: 'Permisos' },
  { path: '/dashboard/notifications', icon: 'notifications', label: 'Notificaciones' },
  { path: '/dashboard/profile', icon: 'manage_accounts', label: 'Perfil' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function getPageTitle() {
    if (pathname === '/dashboard') return 'Inicio'
    if (pathname.includes('kpis')) return 'Mis KPIs'
    if (pathname.includes('documents')) return 'Documentos'
    if (pathname.includes('org-chart')) return 'Organigrama'
    if (pathname.includes('requests')) return 'Solicitudes'
    if (pathname.includes('notifications')) return 'Notificaciones'
    if (pathname.includes('profile')) return 'Mi Perfil'
    return 'PeopleNet'
  }

  const isDashboard = pathname === '/dashboard'

  return (
    <div className="min-h-dvh w-full bg-[#f4f7fb] relative overflow-x-hidden">
      {/* ── Sidebar Overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-[60] backdrop-blur-sm animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-[70] w-72 glass flex flex-col transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="pt-safe px-5 flex flex-col h-full">
          {/* Header */}
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center shadow-md shadow-brand-blue/20">
                <span className="material-symbols-outlined text-white text-[18px]">diversity_3</span>
              </div>
              <span className="font-bold text-[#213053] text-lg tracking-tight">PeopleNet</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-on-surface-variant hover:bg-black/5 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* User mini card */}
          <div className="mt-2 mb-4 bg-brand-blue/8 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center shadow-md shadow-brand-blue/20 flex-shrink-0">
              <span className="material-symbols-outlined text-white text-[20px]">person</span>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-[#213053] text-sm truncate">{currentUser.name}</p>
              <p className="text-xs text-on-surface-variant truncate">{currentUser.role}</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
            {sidebarItems.map((item) => {
              const active = pathname === item.path
              return (
                <button
                  key={item.path}
                  onClick={() => { router.push(item.path); setSidebarOpen(false) }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left w-full ${
                    active
                      ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/25 font-semibold'
                      : 'text-on-surface-variant hover:bg-black/5 hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                  {item.label === 'Notificaciones' && currentUser.notifications > 0 && (
                    <span className="ml-auto w-5 h-5 rounded-full bg-brand-yellow text-[#422c00] text-[10px] font-bold flex items-center justify-center">
                      {currentUser.notifications}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Logout */}
          <button
            onClick={() => router.push('/login')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-50 transition-all mb-safe mb-4 w-full text-left"
          >
            <span className="material-symbols-outlined text-[22px]">logout</span>
            <span className="text-sm font-medium">Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* ── Top Header ── */}
      <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl pt-safe border-b border-white/60 shadow-[0_4px_30px_rgba(0,0,0,0.04)]">
        <div className="h-14 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-9 h-9 flex items-center justify-center text-[#213053] rounded-xl hover:bg-black/5 transition-colors"
              aria-label="Abrir menú"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            {isDashboard ? (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center shadow-md shadow-brand-blue/20">
                  <span className="material-symbols-outlined text-white text-[16px]">diversity_3</span>
                </div>
                <span className="font-bold text-[#213053] text-base tracking-tight">PeopleNet</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.back()}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5 text-on-surface-variant hover:bg-black/8 transition-colors"
                  aria-label="Volver"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back_ios_new</span>
                </button>
                <h1 className="font-semibold text-[#213053] text-base">{getPageTitle()}</h1>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => router.push('/dashboard/notifications')}
              className="w-9 h-9 flex items-center justify-center text-on-surface-variant hover:text-brand-blue rounded-xl hover:bg-black/5 transition-colors relative"
              aria-label="Notificaciones"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              {currentUser.notifications > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-brand-yellow text-[#422c00] text-[9px] font-bold flex items-center justify-center">
                  {currentUser.notifications}
                </span>
              )}
            </button>
            <button
              onClick={() => router.push('/dashboard/profile')}
              className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center shadow-md shadow-brand-blue/20 border-2 border-white"
              aria-label="Mi perfil"
            >
              <span className="material-symbols-outlined text-white text-[16px]">person</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="pt-14 pb-24 min-h-dvh">
        {children}
      </main>

      {/* ── Bottom Navigation ── */}
      <nav
        className="fixed bottom-0 w-full z-50 pb-safe bottom-nav-bg border-t border-white/10 shadow-[0_-8px_30px_rgba(0,0,0,0.2)]"
        aria-label="Navegación principal"
      >
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const active = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path))
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`flex flex-col items-center justify-center gap-0.5 w-14 h-14 transition-all duration-200 ${
                  active ? 'text-brand-yellow scale-105' : 'text-slate-400 hover:text-slate-200 hover:scale-105'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <span
                  className={`material-symbols-outlined text-[24px] transition-all ${
                    active ? 'font-bold' : ''
                  }`}
                  style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                <span
                  className={`text-[10px] font-semibold tracking-wide transition-all ${
                    active ? 'text-brand-yellow' : 'text-slate-500'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
