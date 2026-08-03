// ──────────────────────────────────────────────
// PeopleNet – Mock Data
// ──────────────────────────────────────────────

export const currentUser = {
  id: '1',
  name: 'ALVARO MENDEZ',
  firstName: 'Alvaro',
  role: 'Gerente de Operaciones',
  department: 'Operaciones',
  email: 'alvaro.mendez@peoplenet.com',
  avatar: null,
  joinDate: '15 Mar 2019',
  phone: '+57 300 123 4567',
  location: 'Bogotá, Colombia',
  notifications: 4,
}

// ── KPIs ──────────────────────────────────────
export type KpiStatus = 'on-track' | 'at-risk' | 'achieved' | 'behind'

export interface Kpi {
  id: string
  name: string
  category: string
  current: number
  target: number
  unit: string
  progress: number
  status: KpiStatus
  trend: 'up' | 'down' | 'stable'
  trendValue: string
  period: string
}

export const kpis: Kpi[] = [
  {
    id: 'k1',
    name: 'Satisfacción del Cliente',
    category: 'Comercial',
    current: 88,
    target: 95,
    unit: '%',
    progress: 92.6,
    status: 'on-track',
    trend: 'up',
    trendValue: '+3.2%',
    period: 'Q4 2024',
  },
  {
    id: 'k2',
    name: 'Cumplimiento de Entregas',
    category: 'Operaciones',
    current: 74,
    target: 90,
    unit: '%',
    progress: 82.2,
    status: 'at-risk',
    trend: 'down',
    trendValue: '-1.8%',
    period: 'Q4 2024',
  },
  {
    id: 'k3',
    name: 'Ingresos Q4',
    category: 'Finanzas',
    current: 2_340_000,
    target: 2_500_000,
    unit: '$',
    progress: 93.6,
    status: 'on-track',
    trend: 'up',
    trendValue: '+5.1%',
    period: 'Q4 2024',
  },
  {
    id: 'k4',
    name: 'Retención de Talento',
    category: 'RRHH',
    current: 96,
    target: 95,
    unit: '%',
    progress: 100,
    status: 'achieved',
    trend: 'up',
    trendValue: '+0.8%',
    period: 'Q4 2024',
  },
  {
    id: 'k5',
    name: 'Tiempo de Ciclo',
    category: 'Operaciones',
    current: 8.2,
    target: 6.0,
    unit: 'días',
    progress: 48,
    status: 'behind',
    trend: 'down',
    trendValue: '-0.4 días',
    period: 'Q4 2024',
  },
  {
    id: 'k6',
    name: 'NPS Empleados',
    category: 'RRHH',
    current: 71,
    target: 75,
    unit: 'pts',
    progress: 94.7,
    status: 'on-track',
    trend: 'up',
    trendValue: '+4 pts',
    period: 'Q4 2024',
  },
]

export const kpiSummary = {
  assigned: 42,
  pending: 12,
  compliance: 88,
  achieved: 18,
}

// ── Documents ─────────────────────────────────
export type DocType = 'pdf' | 'xlsx' | 'docx' | 'pptx'

export interface Document {
  id: string
  name: string
  category: string
  type: DocType
  size: string
  updatedAt: string
  updatedBy: string
  tags: string[]
}

export const documents: Document[] = [
  {
    id: 'd1',
    name: 'Manual de Onboarding 2024',
    category: 'RRHH',
    type: 'pdf',
    size: '2.4 MB',
    updatedAt: 'Hace 2 días',
    updatedBy: 'MARIA GOMEZ',
    tags: ['Onboarding', 'Políticas'],
  },
  {
    id: 'd2',
    name: 'Reporte KPIs Q3 2024',
    category: 'Reportes',
    type: 'xlsx',
    size: '1.1 MB',
    updatedAt: 'Hace 5 días',
    updatedBy: 'ANA SILVA',
    tags: ['KPIs', 'Q3'],
  },
  {
    id: 'd3',
    name: 'Contrato Marco de Servicios',
    category: 'Legal',
    type: 'pdf',
    size: '3.8 MB',
    updatedAt: 'Hace 1 semana',
    updatedBy: 'CARLOS RUIZ',
    tags: ['Legal', 'Contratos'],
  },
  {
    id: 'd4',
    name: 'Presentación Estrategia 2025',
    category: 'Estrategia',
    type: 'pptx',
    size: '8.2 MB',
    updatedAt: 'Hace 2 semanas',
    updatedBy: 'ALVARO MENDEZ',
    tags: ['Estrategia', '2025'],
  },
  {
    id: 'd5',
    name: 'Política de Vacaciones',
    category: 'RRHH',
    type: 'docx',
    size: '0.5 MB',
    updatedAt: 'Hace 1 mes',
    updatedBy: 'MARIA GOMEZ',
    tags: ['Políticas', 'Vacaciones'],
  },
  {
    id: 'd6',
    name: 'Presupuesto Operativo 2024',
    category: 'Finanzas',
    type: 'xlsx',
    size: '4.3 MB',
    updatedAt: 'Hace 3 semanas',
    updatedBy: 'PEDRO VEGA',
    tags: ['Finanzas', 'Presupuesto'],
  },
]

export const docCategories = ['Todos', 'RRHH', 'Reportes', 'Legal', 'Estrategia', 'Finanzas']

// ── Org Chart ─────────────────────────────────
export interface OrgNode {
  id: string
  name: string
  role: string
  department: string
  avatar: string | null
  children?: OrgNode[]
}

export const orgChart: OrgNode = {
  id: 'o1',
  name: 'ROBERTO TORRES',
  role: 'CEO',
  department: 'Dirección',
  avatar: null,
  children: [
    {
      id: 'o2',
      name: 'LUCIA HERRERA',
      role: 'Dir. Comercial',
      department: 'Comercial',
      avatar: null,
      children: [
        {
          id: 'o5',
          name: 'JUAN PEREZ',
          role: 'Gerente de Ventas',
          department: 'Comercial',
          avatar: null,
        },
        {
          id: 'o6',
          name: 'SOFIA RIOS',
          role: 'Ejecutiva de Cuentas',
          department: 'Comercial',
          avatar: null,
        },
      ],
    },
    {
      id: 'o3',
      name: 'ALVARO MENDEZ',
      role: 'Gerente Operaciones',
      department: 'Operaciones',
      avatar: null,
      children: [
        {
          id: 'o7',
          name: 'DIANA MORA',
          role: 'Coordinadora Logística',
          department: 'Operaciones',
          avatar: null,
        },
        {
          id: 'o8',
          name: 'FELIPE CASTRO',
          role: 'Analista de Procesos',
          department: 'Operaciones',
          avatar: null,
        },
      ],
    },
    {
      id: 'o4',
      name: 'MARIA GOMEZ',
      role: 'Dir. RRHH',
      department: 'RRHH',
      avatar: null,
      children: [
        {
          id: 'o9',
          name: 'PEDRO VEGA',
          role: 'Analista RRHH',
          department: 'RRHH',
          avatar: null,
        },
      ],
    },
  ],
}

// ── Leave Requests ─────────────────────────────
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'draft'
export type RequestType = 'vacation' | 'medical' | 'personal' | 'training' | 'other'

export interface LeaveRequest {
  id: string
  type: RequestType
  title: string
  startDate: string
  endDate: string
  days: number
  status: RequestStatus
  note: string
  submittedAt: string
  approvedBy?: string
}

export const leaveRequests: LeaveRequest[] = [
  {
    id: 'r1',
    type: 'vacation',
    title: 'Vacaciones diciembre',
    startDate: '20 Dic 2024',
    endDate: '31 Dic 2024',
    days: 8,
    status: 'approved',
    note: 'Viaje familiar programado.',
    submittedAt: '01 Nov 2024',
    approvedBy: 'MARIA GOMEZ',
  },
  {
    id: 'r2',
    type: 'medical',
    title: 'Cita médica especialista',
    startDate: '28 Nov 2024',
    endDate: '28 Nov 2024',
    days: 1,
    status: 'pending',
    note: 'Cita con especialista cardiología.',
    submittedAt: '18 Nov 2024',
  },
  {
    id: 'r3',
    type: 'training',
    title: 'Capacitación liderazgo',
    startDate: '05 Dic 2024',
    endDate: '06 Dic 2024',
    days: 2,
    status: 'approved',
    note: 'Programa externo de liderazgo estratégico.',
    submittedAt: '10 Nov 2024',
    approvedBy: 'MARIA GOMEZ',
  },
  {
    id: 'r4',
    type: 'personal',
    title: 'Diligencia personal',
    startDate: '15 Nov 2024',
    endDate: '15 Nov 2024',
    days: 1,
    status: 'rejected',
    note: 'Asunto personal urgente.',
    submittedAt: '08 Nov 2024',
  },
]

// ── Notifications ──────────────────────────────
export interface Notification {
  id: string
  title: string
  body: string
  icon: string
  iconColor: string
  iconBg: string
  time: string
  read: boolean
  category: 'kpi' | 'document' | 'request' | 'system'
}

export const notifications: Notification[] = [
  {
    id: 'n1',
    title: 'Solicitud aprobada',
    body: 'Tu solicitud de vacaciones diciembre fue aprobada por MARIA GOMEZ.',
    icon: 'check_circle',
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
    time: 'Hace 30 min',
    read: false,
    category: 'request',
  },
  {
    id: 'n2',
    title: 'KPI por vencer',
    body: 'El KPI "Cumplimiento de Entregas" está en riesgo. Actualiza el avance.',
    icon: 'warning',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50',
    time: 'Hace 2 horas',
    read: false,
    category: 'kpi',
  },
  {
    id: 'n3',
    title: 'Nuevo documento',
    body: 'CARLOS RUIZ subió "Contrato Marco de Servicios" a la carpeta Legal.',
    icon: 'upload_file',
    iconColor: 'text-brand-blue',
    iconBg: 'bg-blue-50',
    time: 'Ayer, 14:30',
    read: false,
    category: 'document',
  },
  {
    id: 'n4',
    title: 'Evaluación pendiente',
    body: 'Tienes 12 KPIs pendientes de evaluación para el cierre de Q4.',
    icon: 'pending_actions',
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-50',
    time: 'Hace 2 días',
    read: false,
    category: 'kpi',
  },
  {
    id: 'n5',
    title: 'Recordatorio capacitación',
    body: 'Tu capacitación de liderazgo comienza el 5 de diciembre. Confirma asistencia.',
    icon: 'school',
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-50',
    time: 'Hace 3 días',
    read: true,
    category: 'system',
  },
  {
    id: 'n6',
    title: 'Actualización de KPI',
    body: 'ANA SILVA actualizó el KPI "Ingresos Q4". Nuevo valor: $2.34M.',
    icon: 'update',
    iconColor: 'text-brand-blue',
    iconBg: 'bg-blue-50',
    time: 'Hace 4 días',
    read: true,
    category: 'kpi',
  },
]

// ── Recent Activity ────────────────────────────
export const recentActivity = [
  {
    id: 'a1',
    text: 'Evaluación completada para',
    bold: 'MARIA GOMEZ',
    icon: 'verified',
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-50',
    time: 'Hace 2 horas',
  },
  {
    id: 'a2',
    text: 'Documento subido por',
    bold: 'CARLOS RUIZ',
    icon: 'upload_file',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50',
    time: 'Ayer, 14:30',
  },
  {
    id: 'a3',
    text: 'KPI actualizado: Ventas Q3 por',
    bold: 'ANA SILVA',
    icon: 'update',
    iconColor: 'text-brand-blue',
    iconBg: 'bg-blue-50',
    time: 'Hace 2 días',
  },
]
