import { useEffect, useRef, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { teamMembers } from '@/lib/mock-data'
import {
  EVALUATION_PERIOD,
  evalMenuOptions,
  getSelfEvalQuestions,
  getTeamEvalQuestions,
  computeSummary,
  scoreToTrafficLight,
  type EvalFlow,
  type EvalAnswer,
  type EvalQuestion,
} from '@/lib/evaluacion-bot'
import { Button } from '@/components/ui/Button'

type ChatItem =
  | { type: 'bot'; text: string; html?: boolean; badge?: string }
  | { type: 'menu' }
  | { type: 'team-select' }
  | { type: 'question'; question: EvalQuestion; index: number; total: number }
  | { type: 'summary'; avg: number; level: { label: string; color: string; bg: string } }

export default function EvaluationChatPage() {
  const history = useHistory()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [flow, setFlow] = useState<EvalFlow>('menu')
  const [questions, setQuestions] = useState<EvalQuestion[]>([])
  const [qIndex, setQIndex] = useState(0)
  const [answers, setAnswers] = useState<EvalAnswer[]>([])
  const [score, setScore] = useState('')
  const [comment, setComment] = useState('')
  const [items, setItems] = useState<ChatItem[]>([
    {
      type: 'bot',
      text: '¡Hola! Soy EvaBot 👋 Te acompañaré en la evaluación de desempeño. Responderé con criterios claros, ejemplos y al final generaré un informe con semáforos y gráficas.',
      badge: EVALUATION_PERIOD,
    },
    { type: 'bot', text: 'Para empezar, ¿qué vamos a diligenciar hoy?' },
    { type: 'menu' },
  ])

  const progress = questions.length ? Math.round(((qIndex) / questions.length) * 100) : 0
  const currentQ = questions[qIndex]

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [items, qIndex])

  function startSelfEval() {
    const qs = getSelfEvalQuestions()
    setQuestions(qs)
    setFlow('questions')
    setQIndex(0)
    setAnswers([])
    setItems(prev => [
      ...prev.filter(i => i.type !== 'menu'),
      { type: 'bot', text: 'Perfecto. Comencemos tu autoevaluación. Califica cada KPI del 0 al 100.' },
      { type: 'question', question: qs[0], index: 0, total: qs.length },
    ])
  }

  function startTeamSelect() {
    setFlow('team')
    setItems(prev => [
      ...prev.filter(i => i.type !== 'menu'),
      { type: 'bot', text: 'Selecciona el colaborador que deseas evaluar:' },
      { type: 'team-select' },
    ])
  }

  function selectMember(memberId: string) {
    const member = teamMembers.find(m => m.id === memberId)
    if (!member) return
    const qs = getTeamEvalQuestions(memberId)
    setQuestions(qs)
    setFlow('questions')
    setQIndex(0)
    setAnswers([])
    setItems(prev => [
      ...prev.filter(i => i.type !== 'team-select'),
      { type: 'bot', text: `Evaluaremos a ${member.name}. Responde cada pregunta con un puntaje del 0 al 100.` },
      { type: 'question', question: qs[0], index: 0, total: qs.length },
    ])
  }

  function handleMenu(flowTarget: EvalFlow) {
    if (flowTarget === 'self') startSelfEval()
    else if (flowTarget === 'team') startTeamSelect()
    else {
      setItems(prev => [
        ...prev.filter(i => i.type !== 'menu'),
        { type: 'bot', text: 'La administración de períodos estará disponible próximamente. Por ahora puedes realizar autoevaluaciones o evaluar colaboradores.' },
        { type: 'menu' },
      ])
    }
  }

  function submitAnswer() {
    if (!currentQ || !score) return
    const num = Math.min(100, Math.max(0, Number(score)))
    const answer: EvalAnswer = { questionId: currentQ.id, score: num, comment }
    const newAnswers = [...answers, answer]
    setAnswers(newAnswers)
    setScore('')
    setComment('')

    const nextIndex = qIndex + 1
    if (nextIndex >= questions.length) {
      const summary = computeSummary(newAnswers, questions)
      setFlow('summary')
      setItems(prev => [
        ...prev.filter(i => i.type !== 'question'),
        { type: 'bot', text: `¡Evaluación completada! Tu puntaje promedio es ${summary.avg}%.` },
        { type: 'summary', avg: summary.avg, level: summary.level },
      ])
    } else {
      setQIndex(nextIndex)
      setItems(prev => [
        ...prev.filter(i => i.type !== 'question'),
        { type: 'question', question: questions[nextIndex], index: nextIndex, total: questions.length },
      ])
    }
  }

  function resetChat() {
    setFlow('menu')
    setQuestions([])
    setQIndex(0)
    setAnswers([])
    setScore('')
    setComment('')
    setItems([
      {
        type: 'bot',
        text: '¡Hola! Soy EvaBot 👋 Te acompañaré en la evaluación de desempeño. Responderé con criterios claros, ejemplos y al final generaré un informe con semáforos y gráficas.',
        badge: EVALUATION_PERIOD,
      },
      { type: 'bot', text: 'Para empezar, ¿qué vamos a diligenciar hoy?' },
      { type: 'menu' },
    ])
  }

  return (
    <div className="eval-chat flex flex-col h-full min-h-[calc(100dvh-8rem)]">
      <div className="eval-chat-top pt-safe">
        <div className="eval-chat-top-bar">
          <div className="eval-bot-avatar eval-bot-avatar-eva eval-bot-avatar-sm">E</div>
          <div className="flex-1 min-w-0">
            <p className="eval-chat-top-eyebrow">Evaluación de desempeño</p>
            <p className="eval-chat-top-title">EvaBot</p>
          </div>
          <button type="button" onClick={() => history.push('/dashboard/evaluations')} className="eval-chat-pill-btn">
            <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
            Cambiar
          </button>
          <button type="button" onClick={() => history.goBack()} className="eval-chat-icon-btn" aria-label="Cerrar">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        <div className="eval-chat-sub-bar">
          <div className="eval-bot-avatar eval-bot-avatar-eva eval-bot-avatar-xs">E</div>
          <div className="flex-1 min-w-0">
            <p className="eval-chat-sub-eyebrow">Asistente de evaluación · PeopleNet</p>
            <p className="eval-chat-sub-status">
              <span className="eval-chat-online-dot" />
              EvaBot en línea
            </p>
          </div>
          <button type="button" onClick={resetChat} className="eval-chat-icon-btn eval-chat-icon-btn-light" aria-label="Reiniciar">
            <span className="material-symbols-outlined text-[18px]">sync</span>
          </button>
        </div>
        {flow === 'questions' && questions.length > 0 && (
          <div className="eval-chat-progress-wrap">
            <div className="eval-chat-progress-track">
              <div className="eval-chat-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="eval-chat-progress-labels">
              <span>Pregunta {qIndex + 1} de {questions.length}</span>
              <span>{progress}%</span>
            </div>
          </div>
        )}
      </div>

      <div ref={scrollRef} className="eval-chat-messages flex-1 overflow-y-auto hide-scrollbar">
        <AnimatePresence initial={false}>
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="eval-chat-row"
            >
              {item.type === 'bot' && (
                <>
                  <div className="eval-bot-avatar eval-bot-avatar-eva eval-bot-avatar-xs flex-shrink-0 mt-1">E</div>
                  <div className="eval-chat-bubble">
                    {item.badge && (
                      <div className="eval-chat-period-badge">
                        <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                        Período activo: <strong>{item.badge}</strong>
                      </div>
                    )}
                    <p className="text-sm text-slate-700 leading-relaxed">{item.text}</p>
                  </div>
                </>
              )}

              {item.type === 'menu' && (
                <div className="eval-chat-menu-col">
                  {evalMenuOptions.map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleMenu(opt.flow)}
                      className="eval-chat-menu-card"
                    >
                      <div className={`eval-chat-menu-icon ${opt.iconBg}`}>
                        <span className="material-symbols-outlined text-[20px]">{opt.icon}</span>
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-semibold text-brand-dark">{opt.title}</p>
                        <p className="text-[11px] text-on-surface-variant mt-0.5">{opt.subtitle}</p>
                      </div>
                      <span className="material-symbols-outlined text-slate-300 text-[18px]">chevron_right</span>
                    </button>
                  ))}
                </div>
              )}

              {item.type === 'team-select' && (
                <div className="eval-chat-menu-col">
                  {teamMembers.map(member => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => selectMember(member.id)}
                      className="eval-chat-menu-card"
                    >
                      <div className="eval-chat-menu-icon bg-brand-blue/10 text-brand-blue font-bold text-sm">
                        {member.name.split(' ').slice(0, 2).map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-semibold text-brand-dark">{member.name}</p>
                        <p className="text-[11px] text-on-surface-variant">{member.role}</p>
                      </div>
                      <span className="material-symbols-outlined text-slate-300 text-[18px]">chevron_right</span>
                    </button>
                  ))}
                </div>
              )}

              {item.type === 'question' && (
                <div className="eval-chat-question-col">
                  <div className="eval-chat-bubble eval-chat-bubble-question">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-brand-blue mb-1">{item.question.category}</p>
                    <p className="text-sm font-semibold text-brand-dark">{item.question.prompt}</p>
                    <p className="text-[11px] text-on-surface-variant mt-1.5">{item.question.hint}</p>
                  </div>
                  {i === items.length - 1 && flow === 'questions' && (
                    <div className="eval-chat-answer-form">
                      <label className="field-label">Puntaje (0-100)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={score}
                        onChange={e => setScore(e.target.value)}
                        className="field-input"
                        placeholder="Ej. 85"
                      />
                      <label className="field-label mt-3">Comentario (opcional)</label>
                      <textarea
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        className="field-textarea"
                        rows={2}
                        placeholder="Observaciones sobre este KPI..."
                      />
                      <Button
                        variant="amber"
                        fullWidth
                        showArrow
                        className="mt-3"
                        disabled={!score}
                        onClick={submitAnswer}
                      >
                        {item.index + 1 >= item.total ? 'Finalizar evaluación' : 'Siguiente pregunta'}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {item.type === 'summary' && (
                <div className="eval-chat-summary">
                  <div className="eval-chat-summary-score">
                    <span className="text-4xl font-bold text-brand-dark">{item.avg}</span>
                    <span className="text-sm text-on-surface-variant">/ 100</span>
                  </div>
                  <div className={`eval-chat-summary-badge ${item.level.bg} ${item.level.color}`}>
                    {item.level.label}
                  </div>
                  <div className="eval-chat-traffic-lights">
                    {answers.map(a => (
                      <div
                        key={a.questionId}
                        className={`eval-traffic-light eval-traffic-light-${scoreToTrafficLight(a.score)}`}
                        title={`${a.score}%`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-on-surface-variant text-center mt-2">
                    Semáforo por KPI evaluado
                  </p>
                  <Button variant="primary" fullWidth showArrow icon="save" className="mt-4" onClick={() => history.push('/dashboard/kpis')}>
                    Guardar informe
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="eval-chat-footer pb-safe">
        <Button variant="secondary" icon="arrow_back" onClick={() => history.push('/dashboard/evaluations')}>
          Volver
        </Button>
        <Button variant="danger" icon="restart_alt" onClick={resetChat}>
          Reiniciar
        </Button>
      </div>
    </div>
  )
}
