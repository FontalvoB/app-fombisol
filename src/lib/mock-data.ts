// ──────────────────────────────────────────────
// PeopleNet – Mock Data
// ──────────────────────────────────────────────

export type UserRoleType = 'Jefe' | 'Colaborador'

export const currentUser = {
  id: '1',
  name: 'ALVARO MENDEZ',
  firstName: 'Alvaro',
  role: 'Gerente de Operaciones',
  roleType: 'Jefe' as UserRoleType,
  department: 'Operaciones',
  email: 'alvaro.mendez@peoplenet.com',
  documento: 'CC 1.023.456.789',
  avatar: null,
  joinDate: '15 Mar 2019',
  phone: '+57 300 123 4567',
  location: 'Bogotá, Colombia',
  notifications: 4,
  empresaId: 1,
  empresaNombre: 'PeopleNet Colombia S.A.S.',
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
  employeeId?: string
  pendingEvaluation?: boolean
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
  mandatory: boolean
  content: string[]
}

const docContent = {
  onboarding: [
    'Bienvenido a PeopleNet. Este manual establece los lineamientos fundamentales para tu integración a la organización.',
    'Capítulo 1 — Cultura organizacional: Nuestros valores son integridad, colaboración y excelencia operativa. Cada colaborador es responsable de representar estos principios en su día a día.',
    'Capítulo 2 — Primeros pasos: Durante tu primera semana completarás inducción con tu líder, acceso a sistemas, y lectura de documentos obligatorios en esta plataforma.',
    'Capítulo 3 — Canales de comunicación: Utiliza PeopleNet para KPIs, documentos, permisos y notificaciones. Para urgencias contacta a tu líder directo.',
    'Capítulo 4 — Confidencialidad: Toda la información corporativa es confidencial. No compartas credenciales ni datos sensibles de clientes o compañeros.',
    'Al finalizar la lectura de este documento, confirma que lo has revisado completamente marcándolo como leído.',
  ],
  vacaciones: [
    'Política de Vacaciones — PeopleNet Colombia S.A.S.',
    'Artículo 1: Todo colaborador tiene derecho a 15 días hábiles de vacaciones por cada año de servicio cumplido, conforme al Código Sustantivo del Trabajo.',
    'Artículo 2: Las vacaciones deben solicitarse con mínimo 8 días calendario de anticipación a través del módulo de Permisos.',
    'Artículo 3: El líder directo evaluará el impacto operativo antes de aprobar. Gestión Humana realizará el registro formal.',
    'Artículo 4: No se podrán acumular más de dos periodos de vacaciones sin disfrute, salvo autorización expresa de la Dirección.',
    'Artículo 5: En caso de terminación del contrato, se liquidarán las vacaciones causadas y no disfrutadas.',
    'Confirma tu lectura al llegar al final de este documento.',
  ],
  codigo: [
    'Código de Conducta y Ética Empresarial',
    'Sección I — Compromiso: PeopleNet promueve un ambiente de respeto, inclusión y cero tolerancia al acoso laboral.',
    'Sección II — Conflictos de interés: Debes declarar cualquier situación que pueda afectar tu imparcialidad en decisiones laborales.',
    'Sección III — Regalos y beneficios: No se aceptan regalos de proveedores o clientes que excedan el valor permitido por la política interna.',
    'Sección IV — Uso de activos: Los equipos, software y recursos de la empresa deben usarse exclusivamente para fines laborales.',
    'Sección V — Reporte de incumplimientos: Cualquier violación debe reportarse al canal ético o a Gestión Humana de forma confidencial.',
    'Has llegado al final. Marca este documento como leído para cumplir con el requisito obligatorio.',
  ],
  seguridad: [
    'Política de Seguridad y Salud en el Trabajo (SST)',
    'Objetivo: Garantizar condiciones seguras y saludables para todos los colaboradores, contratistas y visitantes.',
    'Responsabilidades del colaborador: Cumplir normas SST, usar EPP cuando aplique, reportar condiciones inseguras de inmediato.',
    'Procedimiento de emergencias: Conoce las rutas de evacuación, puntos de encuentro y números de contacto de emergencia en tu sede.',
    'Investigación de incidentes: Todo accidente o incidente debe reportarse en las primeras 24 horas a través del canal oficial.',
    'Capacitación: La inducción SST es obligatoria para todo ingreso. Refuerzos anuales serán programados por Gestión Humana.',
    'Documento finalizado. Confirma tu lectura para registrar el cumplimiento.',
  ],
}

export const documents: Document[] = [
  {
    id: 'd1',
    name: 'Manual de Onboarding 2024',
    category: 'Obligatorios',
    type: 'pdf',
    size: '2.4 MB',
    updatedAt: 'Hace 2 días',
    updatedBy: 'MARIA GOMEZ',
    tags: ['Onboarding', 'Políticas'],
    mandatory: true,
    content: docContent.onboarding,
  },
  {
    id: 'd5',
    name: 'Política de Vacaciones',
    category: 'Obligatorios',
    type: 'docx',
    size: '0.5 MB',
    updatedAt: 'Hace 1 mes',
    updatedBy: 'MARIA GOMEZ',
    tags: ['Políticas', 'Vacaciones'],
    mandatory: true,
    content: docContent.vacaciones,
  },
  {
    id: 'd7',
    name: 'Código de Conducta y Ética',
    category: 'Obligatorios',
    type: 'pdf',
    size: '1.8 MB',
    updatedAt: 'Hace 1 semana',
    updatedBy: 'MARIA GOMEZ',
    tags: ['Ética', 'Obligatorio'],
    mandatory: true,
    content: docContent.codigo,
  },
  {
    id: 'd8',
    name: 'Política SST 2024',
    category: 'Obligatorios',
    type: 'pdf',
    size: '2.1 MB',
    updatedAt: 'Hace 3 días',
    updatedBy: 'MARIA GOMEZ',
    tags: ['SST', 'Seguridad'],
    mandatory: true,
    content: docContent.seguridad,
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
    mandatory: false,
    content: ['Reporte consolidado de KPIs del tercer trimestre 2024.'],
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
    mandatory: false,
    content: ['Contrato marco de servicios con cláusulas generales.'],
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
    mandatory: false,
    content: ['Presentación ejecutiva de la estrategia corporativa 2025.'],
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
    mandatory: false,
    content: ['Presupuesto operativo consolidado 2024.'],
  },
]

export const docCategories = ['Todos', 'Obligatorios', 'RRHH', 'Reportes', 'Legal', 'Estrategia', 'Finanzas']

// ── Team KPIs (for Jefe role) ─────────────────
export interface TeamMember {
  id: string
  name: string
  role: string
  department: string
  kpis: Kpi[]
}

export const teamMembers: TeamMember[] = [
  {
    id: 'tm1',
    name: 'DIANA MORA',
    role: 'Coordinadora Logística',
    department: 'Operaciones',
    kpis: [
      { id: 'tk1', name: 'Entregas a Tiempo', category: 'Operaciones', current: 91, target: 95, unit: '%', progress: 95.8, status: 'on-track', trend: 'up', trendValue: '+2.1%', period: 'Q4 2024', employeeId: 'tm1', pendingEvaluation: true },
      { id: 'tk2', name: 'Costo Logístico', category: 'Finanzas', current: 820000, target: 750000, unit: '$', progress: 91.5, status: 'at-risk', trend: 'down', trendValue: '+9.3%', period: 'Q4 2024', employeeId: 'tm1', pendingEvaluation: true },
    ],
  },
  {
    id: 'tm2',
    name: 'FELIPE CASTRO',
    role: 'Analista de Procesos',
    department: 'Operaciones',
    kpis: [
      { id: 'tk3', name: 'Eficiencia de Procesos', category: 'Operaciones', current: 78, target: 85, unit: '%', progress: 91.8, status: 'on-track', trend: 'up', trendValue: '+4.5%', period: 'Q4 2024', employeeId: 'tm2', pendingEvaluation: false },
      { id: 'tk4', name: 'Documentación Actualizada', category: 'Operaciones', current: 62, target: 90, unit: '%', progress: 68.9, status: 'behind', trend: 'down', trendValue: '-5%', period: 'Q4 2024', employeeId: 'tm2', pendingEvaluation: true },
    ],
  },
  {
    id: 'tm3',
    name: 'SOFIA RIOS',
    role: 'Ejecutiva de Cuentas',
    department: 'Comercial',
    kpis: [
      { id: 'tk5', name: 'Cartera Activa', category: 'Comercial', current: 45, target: 50, unit: 'clientes', progress: 90, status: 'on-track', trend: 'stable', trendValue: '0%', period: 'Q4 2024', employeeId: 'tm3', pendingEvaluation: true },
    ],
  },
]

export const empresas = [
  { id: 1, name: 'PeopleNet Colombia S.A.S.', nit: '900.123.456-7' },
  { id: 2, name: 'PeopleNet Servicios S.A.', nit: '900.987.654-3' },
]

export const aprobadores = [
  { id: 1, nombre: 'MARIA GOMEZ', cargo: 'Directora RRHH', departamento: 'RRHH', correo: 'maria.gomez@peoplenet.com' },
  { id: 2, nombre: 'ROBERTO TORRES', cargo: 'CEO', departamento: 'Dirección', correo: 'roberto.torres@peoplenet.com' },
  { id: 3, nombre: 'LUCIA HERRERA', cargo: 'Directora Comercial', departamento: 'Comercial', correo: 'lucia.herrera@peoplenet.com' },
]

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
