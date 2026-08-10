import { useState } from 'react'
import { IonContent, IonPage } from '@ionic/react'
import { Switch, Route, useHistory, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { currentUser } from '@/lib/mock-data'
import { useApp } from '@/context/AppContext'
import DashboardHome from '@/pages/DashboardHome'
import KpisPage from '@/pages/Kpis'
import DocumentsPage from '@/pages/Documents'
import DocumentViewer from '@/pages/DocumentViewer'
import RequestsPage from '@/pages/Requests'
import SolicitudForm from '@/pages/SolicitudForm'
import ProfilePage from '@/pages/Profile'
import NotificationsPage from '@/pages/Notifications'
import OrgChartPage from '@/pages/OrgChart'

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

export default function DashboardLayout() {
  const pathname = useLocation().pathname
  const history = useHistory()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { userRole } = useApp()

  const hideBottomNav = pathname.includes('/documents/') || pathname.includes('/requests/new')
  const isDashboard = pathname === '/dashboard'

  function getPageTitle() {
    if (pathname === '/dashboard') return 'Inicio'
    if (pathname.includes('kpis')) return userRole === 'Jefe' ? 'KPIs' : 'Mis KPIs'
    if (pathname.includes('documents/')) return 'Lectura'
    if (pathname.includes('documents')) return 'Documentos'
    if (pathname.includes('requests/new')) return 'Nueva Solicitud'
    if (pathname.includes('org-chart')) return 'Organigrama'
    if (pathname.includes('requests')) return 'Permisos'
    if (pathname.includes('notifications')) return 'Notificaciones'
    if (pathname.includes('profile')) return 'Mi Perfil'
    return 'PeopleNet'
  }

  return (
    <IonPage className="dashboard-page">
      <div className="dashboard-bg" />

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="pt-safe px-5 flex flex-col h-full">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shadow-brand">
                <span className="material-symbols-outlined text-white text-[18px]">diversity_3</span>
              </div>
              <span className="font-bold text-brand-dark text-lg">PeopleNet</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="w-9 h-9 rounded-xl hover:bg-black/5 flex items-center justify-center">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="mt-2 mb-4 bg-brand-blue/8 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full gradient-brand flex items-center justify-center shadow-brand flex-shrink-0">
              <span className="material-symbols-outlined text-white text-[22px]">person</span>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-brand-dark text-sm truncate">{currentUser.name}</p>
              <p className="text-xs text-on-surface-variant truncate">{currentUser.role}</p>
              <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-brand-yellow/20 text-amber-800 border border-brand-yellow/30">
                {userRole}
              </span>
            </div>
          </div>

          <nav className="flex-1 flex flex-col gap-1 overflow-y-auto hide-scrollbar">
            {sidebarItems.map((item) => {
              const active = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path))
              return (
                <button
                  key={item.path}
                  onClick={() => { history.push(item.path); setSidebarOpen(false) }}
                  className={`sidebar-link ${active ? 'active' : ''}`}
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

          <button onClick={() => history.push('/login')} className="sidebar-link text-red-500 mb-safe mb-4">
            <span className="material-symbols-outlined text-[22px]">logout</span>
            <span className="text-sm font-medium">Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setSidebarOpen(true)} className="header-btn" aria-label="Menú">
              <span className="material-symbols-outlined">menu</span>
            </button>
            {isDashboard ? (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center shadow-brand">
                  <span className="material-symbols-outlined text-white text-[16px]">diversity_3</span>
                </div>
                <div>
                  <span className="header-page-title block">PeopleNet</span>
                  <span className="header-page-subtitle">Talento humano</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 min-w-0">
                <button onClick={() => history.goBack()} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0" aria-label="Volver">
                  <span className="material-symbols-outlined text-[18px] text-slate-600">arrow_back_ios_new</span>
                </button>
                <div className="min-w-0">
                  <h1 className="header-page-title truncate">{getPageTitle()}</h1>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button onClick={() => history.push('/dashboard/notifications')} className="header-btn relative" aria-label="Notificaciones">
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              {currentUser.notifications > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-brand-yellow text-[9px] font-bold flex items-center justify-center text-brand-dark">
                  {currentUser.notifications}
                </span>
              )}
            </button>
            <button onClick={() => history.push('/dashboard/profile')} className="w-9 h-9 rounded-full gradient-brand flex items-center justify-center shadow-brand border-2 border-white" aria-label="Perfil">
              <span className="material-symbols-outlined text-white text-[16px]">person</span>
            </button>
          </div>
        </div>
      </header>

      <IonContent fullscreen scrollY className="dashboard-ion-content">
        <div className={`dashboard-scroll ${hideBottomNav ? 'no-bottom-nav' : ''}`}>
          <Switch>
            <Route exact path="/dashboard" component={DashboardHome} />
            <Route exact path="/dashboard/kpis" component={KpisPage} />
            <Route exact path="/dashboard/documents" component={DocumentsPage} />
            <Route exact path="/dashboard/documents/:id" component={DocumentViewer} />
            <Route exact path="/dashboard/requests" component={RequestsPage} />
            <Route exact path="/dashboard/requests/new" component={SolicitudForm} />
            <Route exact path="/dashboard/profile" component={ProfilePage} />
            <Route exact path="/dashboard/notifications" component={NotificationsPage} />
            <Route exact path="/dashboard/org-chart" component={OrgChartPage} />
          </Switch>
        </div>
      </IonContent>

      {!hideBottomNav && (
        <nav className="dashboard-bottom-nav pb-safe" aria-label="Navegación principal">
          <div className="flex justify-around items-center h-[4.25rem] px-1">
            {navItems.map((item) => {
              const active = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path))
              return (
                <button
                  key={item.path}
                  onClick={() => history.push(item.path)}
                  className={`bottom-nav-item ${active ? 'active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  {active && (
                    <motion.div layoutId="nav-pill" className="absolute inset-1 rounded-2xl bg-white/10" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                  )}
                  <span
                    className="material-symbols-outlined text-[24px] relative z-10"
                    style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {item.icon}
                  </span>
                  <span className="text-[10px] font-semibold relative z-10">{item.label}</span>
                </button>
              )
            })}
          </div>
        </nav>
      )}
    </IonPage>
  )
}
