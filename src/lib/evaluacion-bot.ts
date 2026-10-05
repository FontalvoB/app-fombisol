import { kpis, teamMembers, type Kpi } from './mock-data'

export const EVALUATION_PERIOD = 'Julio - Diciembre 2026'

export type EvalFlow = 'menu' | 'self' | 'team' | 'periods' | 'questions' | 'summary'

export interface EvalMenuOption {
  id: string
  icon: string
  iconBg: string
  title: string
  subtitle: string
  flow: EvalFlow
}

export const evalMenuOptions: EvalMenuOption[] = [
  {
    id: 'self',
    icon: 'front_hand',
    iconBg: 'bg-brand-blue/10 text-brand-blue',
    title: 'Mi autoevaluación',
    subtitle: 'Evalúa tus propios KPIs del período',
    flow: 'self',
  },
  {
    id: 'team',
    icon: 'group',
    iconBg: 'bg-violet-100 text-violet-600',
    title: 'Evaluar a un colaborador',
    subtitle: 'Revisa el desempeño de tu equipo',
    flow: 'team',
  },
  {
    id: 'periods',
    icon: 'settings',
    iconBg: 'bg-slate-100 text-slate-600',
    title: 'Administrar períodos',
    subtitle: 'Configura ventanas de evaluación',
    flow: 'periods',
  },
]

export interface EvalQuestion {
  id: string
  kpiId: string
  kpiName: string
  category: string
  prompt: string
  hint: string
}

export function getSelfEvalQuestions(): EvalQuestion[] {
  return kpis.map(kpi => ({
    id: `q-${kpi.id}`,
    kpiId: kpi.id,
    kpiName: kpi.name,
    category: kpi.category,
    prompt: `¿Cómo calificarías tu desempeño en "${kpi.name}"?`,
    hint: `Meta: ${kpi.target}${kpi.unit} · Avance actual: ${kpi.progress.toFixed(0)}%`,
  }))
}

export function getTeamEvalQuestions(memberId: string): EvalQuestion[] {
  const member = teamMembers.find(m => m.id === memberId)
  if (!member) return []
  return member.kpis.map(kpi => ({
    id: `q-${memberId}-${kpi.id}`,
    kpiId: kpi.id,
    kpiName: kpi.name,
    category: kpi.category,
    prompt: `Evalúa a ${member.name.split(' ')[0]} en "${kpi.name}"`,
    hint: `Meta: ${kpi.target}${kpi.unit} · Avance: ${kpi.progress.toFixed(0)}%`,
  }))
}

export interface EvalAnswer {
  questionId: string
  score: number
  comment: string
}

export function computeSummary(answers: EvalAnswer[], questions: EvalQuestion[]) {
  const avg = answers.length
    ? Math.round(answers.reduce((s, a) => s + a.score, 0) / answers.length)
    : 0
  const level =
    avg >= 85 ? { label: 'Alto desempeño', color: 'text-emerald-600', bg: 'bg-emerald-50' } :
    avg >= 70 ? { label: 'En desarrollo', color: 'text-amber-600', bg: 'bg-amber-50' } :
    { label: 'Requiere mejora', color: 'text-red-500', bg: 'bg-red-50' }

  return { avg, level, total: questions.length, answered: answers.length }
}

export function scoreToTrafficLight(score: number): 'green' | 'yellow' | 'red' {
  if (score >= 85) return 'green'
  if (score >= 70) return 'yellow'
  return 'red'
}

export function formatKpiRef(kpi: Kpi) {
  if (kpi.unit === '$') return `$${(kpi.current / 1_000_000).toFixed(2)}M / $${(kpi.target / 1_000_000).toFixed(2)}M`
  return `${kpi.current}${kpi.unit} / ${kpi.target}${kpi.unit}`
}
