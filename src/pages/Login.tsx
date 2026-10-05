import { useState } from 'react'
import { IonContent, IonPage } from '@ionic/react'
import { useHistory } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export default function Login() {
  const history = useHistory()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) {
      setError('Por favor completa todos los campos.')
      return
    }
    setLoading(true)
    setError('')
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false)
    history.push('/dashboard')
  }

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="min-h-dvh w-full flex flex-col items-center justify-center relative overflow-hidden bg-[#0a1628]">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute -top-32 -left-32 w-80 h-80 rounded-full opacity-20 animate-spin-slow"
              style={{ background: 'radial-gradient(circle, #045C94 0%, transparent 70%)' }}
            />
            <div
              className="absolute top-1/3 -right-24 w-64 h-64 rounded-full opacity-15"
              style={{ background: 'radial-gradient(circle, #FFB71B 0%, transparent 70%)', animationDelay: '1s' }}
            />
            <div
              className="absolute -bottom-20 left-1/4 w-72 h-72 rounded-full opacity-10"
              style={{ background: 'radial-gradient(circle, #213053 0%, transparent 70%)' }}
            />
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
              }}
            />
          </div>

          <div className="relative w-full max-w-sm mx-4 animate-scale-in">
            <div className="flex flex-col items-center mb-8 anim-hidden animate-slide-up delay-100">
              <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center shadow-2xl shadow-brand-blue/40 mb-4">
                <span className="material-symbols-outlined text-white text-[32px]">diversity_3</span>
              </div>
              <h1 className="text-white text-2xl font-bold tracking-tight">PeopleNet</h1>
              <p className="text-slate-400 text-sm mt-1 font-medium">Tu plataforma de talento humano</p>
            </div>

            <div className="bg-white/8 backdrop-blur-2xl rounded-3xl border border-white/10 p-7 shadow-2xl anim-hidden animate-slide-up delay-200">
              <h2 className="text-white text-xl font-semibold mb-1">Iniciar sesión</h2>
              <p className="text-slate-400 text-sm mb-6">Ingresa tus credenciales para continuar.</p>

              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]">
                      mail
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="usuario@peoplenet.com"
                      className="w-full bg-white/8 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/60 focus:border-transparent transition-all"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
                    Contraseña
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]">
                      lock
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/8 border border-white/10 rounded-xl pl-10 pr-12 py-3 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/60 focus:border-transparent transition-all"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                    <span className="material-symbols-outlined text-red-400 text-[18px]">error</span>
                    <span className="text-red-400 text-sm">{error}</span>
                  </div>
                )}

                <div className="flex justify-end -mt-1">
                  <button type="button" className="text-brand-yellow text-xs font-semibold hover:underline transition-all">
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  fullWidth
                  size="lg"
                  showArrow={!loading}
                  className="mt-1"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Ingresando...
                    </span>
                  ) : (
                    'Ingresar'
                  )}
                </Button>
              </form>

              <p className="text-center text-slate-500 text-xs mt-5">
                Demo: cualquier correo y contraseña
              </p>
            </div>

            <p className="text-center text-slate-600 text-xs mt-6 anim-hidden animate-fade-in delay-500">
              &copy; 2024 PeopleNet. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}
