import { useHistory } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export default function EvaluationsPage() {
  const history = useHistory()

  return (
    <div className="eval-hub min-h-full">
      <div className="eval-hub-header pt-safe">
        <div className="eval-hub-header-inner">
          <div className="eval-hub-logo">
            <span className="eval-hub-logo-e">E</span>
            <span className="eval-hub-logo-n">N</span>
          </div>
          <div className="flex-1 text-center px-2">
            <p className="eval-hub-eyebrow">Asistente · PeopleNet</p>
            <h1 className="eval-hub-title">¿Con quién quieres hablar?</h1>
          </div>
          <button type="button" onClick={() => history.goBack()} className="eval-hub-close" aria-label="Cerrar">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      </div>

      <div className="eval-hub-body page-container !pt-5 !gap-5">
        <div className="eval-bot-card">
          <div className="eval-bot-card-badge eval-bot-card-badge-wizard">
            <span className="material-symbols-outlined text-[12px]">checklist</span>
            WIZARD
          </div>
          <div className="flex items-start gap-4">
            <div className="eval-bot-avatar eval-bot-avatar-eva">E</div>
            <div className="flex-1 min-w-0 pt-1">
              <p className="eval-bot-category">
                <span className="eval-bot-dot eval-bot-dot-eva" />
                Evaluación de desempeño
              </p>
              <h2 className="eval-bot-name">EvaBot</h2>
              <p className="eval-bot-desc">
                Te guía paso a paso en la evaluación de desempeño con criterios claros, puntajes y un informe final listo para guardar.
              </p>
              <div className="eval-bot-tags">
                <span>Cuestionario</span>
                <span>Puntajes</span>
                <span>Informe</span>
              </div>
            </div>
          </div>
          <Button
            variant="amber"
            size="lg"
            fullWidth
            showArrow
            className="mt-5 !text-[#2a2000]"
            onClick={() => history.push('/dashboard/evaluations/chat')}
          >
            Iniciar evaluación
          </Button>
        </div>

        <div className="eval-bot-card eval-bot-card-muted">
          <div className="eval-bot-card-badge eval-bot-card-badge-info">
            <span className="material-symbols-outlined text-[12px]">info</span>
            INFO
          </div>
          <div className="flex items-start gap-4">
            <div className="eval-bot-avatar eval-bot-avatar-nana">N</div>
            <div className="flex-1 min-w-0 pt-1">
              <p className="eval-bot-category">
                <span className="eval-bot-dot eval-bot-dot-nana" />
                Información de la plataforma
              </p>
              <h2 className="eval-bot-name">Nanabot</h2>
              <p className="eval-bot-desc">
                Resuelve consultas sobre módulos, rutas y procedimientos del sistema. Solo información — no realiza acciones.
              </p>
              <div className="eval-bot-tags eval-bot-tags-blue">
                <span>Consultas</span>
                <span>Módulos</span>
                <span>Guías</span>
              </div>
            </div>
          </div>
          <Button variant="primary" size="lg" fullWidth showArrow className="mt-5" disabled>
            Próximamente
          </Button>
        </div>
      </div>
    </div>
  )
}
