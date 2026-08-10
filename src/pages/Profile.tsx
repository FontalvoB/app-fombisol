import { useHistory } from 'react-router-dom'
import { currentUser } from '@/lib/mock-data'
import { useApp, type UserRoleType } from '@/context/AppContext'
import { Card, CardBody } from '@/components/ui/Card'

const profileSections = [
  {
    title: 'Información Personal',
    items: [
      { icon: 'badge', label: 'Nombre completo', value: currentUser.name },
      { icon: 'work', label: 'Cargo', value: currentUser.role },
      { icon: 'corporate_fare', label: 'Departamento', value: currentUser.department },
      { icon: 'mail', label: 'Correo', value: currentUser.email },
      { icon: 'phone', label: 'Teléfono', value: currentUser.phone },
      { icon: 'location_on', label: 'Ubicación', value: currentUser.location },
      { icon: 'calendar_month', label: 'Ingreso', value: currentUser.joinDate },
    ],
  },
]

const settingItems = [
  { icon: 'notifications', label: 'Notificaciones', desc: 'Gestionar alertas y avisos', color: 'text-brand-blue', bg: 'bg-brand-blue/10' },
  { icon: 'lock', label: 'Privacidad', desc: 'Cambiar contraseña y seguridad', color: 'text-purple-600', bg: 'bg-purple-50' },
  { icon: 'language', label: 'Idioma', desc: 'Español (Colombia)', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { icon: 'help', label: 'Ayuda y soporte', desc: 'Centro de ayuda y contacto', color: 'text-amber-600', bg: 'bg-amber-50' },
]

export default function ProfilePage() {
  const history = useHistory()
  const { userRole, setUserRole } = useApp()

  return (
    <div className="page-container">
      <div className="gradient-brand rounded-2xl p-5 relative overflow-hidden anim-hidden animate-slide-up delay-100">
        <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/5" />
        <div className="absolute right-4 bottom-0 w-20 h-20 rounded-full bg-white/5" />
        <div className="relative flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="material-symbols-outlined text-white text-[30px]">person</span>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-white text-lg leading-tight truncate">{currentUser.name}</h2>
            <p className="text-white/70 text-sm">{currentUser.role}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="bg-brand-yellow/20 border border-brand-yellow/30 text-brand-yellow text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                {currentUser.department}
              </span>
            </div>
          </div>
        </div>

        <div className="relative mt-4 grid grid-cols-3 gap-2">
          {[
            { label: 'KPIs', value: '42' },
            { label: 'Docs', value: '18' },
            { label: 'Días dis.', value: '14' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/10 rounded-xl py-2.5 flex flex-col items-center">
              <span className="text-white text-base font-bold">{stat.value}</span>
              <span className="text-white/60 text-[10px] uppercase font-semibold">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      <Card variant="elevated">
        <CardBody>
          <p className="text-sm font-bold text-brand-dark mb-3">Rol de usuario (demo)</p>
          <div className="flex gap-2">
            {(['Jefe', 'Colaborador'] as UserRoleType[]).map(role => (
              <button
                key={role}
                onClick={() => setUserRole(role)}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                  userRole === role ? 'gradient-brand text-white shadow-brand' : 'bg-slate-100 text-on-surface-variant'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
          <p className="text-xs text-on-surface-variant mt-2">
            Como <strong>Jefe</strong> puedes evaluar los KPIs de tu equipo en el módulo KPIs.
          </p>
        </CardBody>
      </Card>

      <div className="bg-white rounded-2xl border border-gray-100/80 shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden anim-hidden animate-slide-up delay-150">
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <h3 className="font-bold text-[#213053] text-sm">Información Personal</h3>
          <button className="flex items-center gap-1 text-brand-blue text-xs font-semibold hover:underline">
            <span className="material-symbols-outlined text-[14px]">edit</span>
            Editar
          </button>
        </div>
        <div className="flex flex-col">
          {profileSections[0].items.map((item, i) => (
            <div
              key={item.label}
              className={`flex items-center gap-3 px-4 py-3 ${
                i < profileSections[0].items.length - 1 ? 'border-b border-gray-50' : ''
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">{item.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-on-surface-variant uppercase font-semibold tracking-wider">{item.label}</p>
                <p className="text-sm font-medium text-[#213053] truncate">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100/80 shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden anim-hidden animate-slide-up delay-200">
        <div className="px-4 pt-4 pb-2">
          <h3 className="font-bold text-[#213053] text-sm">Configuración</h3>
        </div>
        <div className="flex flex-col">
          {settingItems.map((item, i) => (
            <button
              key={item.label}
              className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 active:bg-gray-100 text-left w-full ${
                i < settingItems.length - 1 ? 'border-b border-gray-50' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}>
                <span className={`material-symbols-outlined ${item.color} text-[18px]`}>{item.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#213053]">{item.label}</p>
                <p className="text-xs text-on-surface-variant">{item.desc}</p>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">chevron_right</span>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => history.push('/login')}
        className="w-full bg-red-50 border border-red-100 rounded-2xl py-4 flex items-center justify-center gap-2 text-red-500 font-semibold text-sm active:scale-95 transition-all shadow-sm anim-hidden animate-slide-up delay-300"
      >
        <span className="material-symbols-outlined text-[20px]">logout</span>
        Cerrar sesión
      </button>

      <div className="h-2" />
    </div>
  )
}
