export type SolicitudTipo = 'PERMISO' | 'LICENCIA' | 'VACACIONES' | 'CITACION_MEDICA' | 'INCAPACIDAD' | 'OTRO'

export const SOLICITUD_TIPO_LABELS: Record<SolicitudTipo, string> = {
  PERMISO: 'Permiso',
  LICENCIA: 'Licencia',
  VACACIONES: 'Vacaciones',
  CITACION_MEDICA: 'Citación médica',
  INCAPACIDAD: 'Incapacidad',
  OTRO: 'Otra novedad',
}

export const PERMISO_SUBTIPOS = [
  'Permiso remunerado',
  'Permiso no remunerado',
  'Permiso por calamidad doméstica',
  'Permiso por duelo',
] as const

export const LICENCIA_SUBTIPOS = [
  'Licencia de maternidad',
  'Licencia de paternidad',
  'Licencia remunerada',
  'Licencia no remunerada',
  'Licencia por luto',
] as const

export const INCAPACIDAD_SUBTIPOS = [
  'Incapacidad por enfermedad general',
  'Incapacidad por accidente de trabajo',
  'Incapacidad por enfermedad laboral',
] as const

export interface FormDocumento {
  id: string
  nombre: string
  tamano: number
  tipo: string
  file?: File
}

export interface SolicitudFormData {
  empresaId: number | null
  empresaNombre: string
  cargo: string
  nombreCompleto: string
  numeroIdentificacion: string
  correoElectronico: string
  numeroContacto: string
  tipo: SolicitudTipo | null
  subtipo: string
  otraNovedad: string
  fechaDesde: string
  fechaHasta: string
  horaSalida: string
  horaRegreso: string
  descripcion: string
  documentos: FormDocumento[]
  aprobadorId: number | null
  aprobadorNombre: string
  aprobadorCargo: string
}

export interface StepDef {
  id: number
  key: string
  title: string
  shortTitle: string
  description: string
  icon: string
  badge: string
}

export const SOLICITUD_STEPS: StepDef[] = [
  { id: 1, key: 'lineamientos', title: 'Lineamientos para la solicitud', shortTitle: 'Lineamientos', description: 'Conoce las políticas antes de iniciar tu solicitud', icon: 'menu_book', badge: 'Paso 01' },
  { id: 2, key: 'colaborador', title: 'Datos del colaborador', shortTitle: 'Colaborador', description: 'Confirma tu información personal y de contacto', icon: 'person', badge: 'Paso 02' },
  { id: 3, key: 'tipo', title: 'Tipo de solicitud', shortTitle: 'Tipo', description: 'Selecciona la categoría y el subtipo de tu solicitud', icon: 'grid_view', badge: 'Paso 03' },
  { id: 4, key: 'periodo', title: 'Periodo de ausencia', shortTitle: 'Periodo', description: 'Define las fechas y horas de la ausencia', icon: 'calendar_month', badge: 'Paso 04' },
  { id: 5, key: 'soporte', title: 'Soporte y observaciones', shortTitle: 'Soporte', description: 'Adjunta los documentos necesarios y agrega comentarios', icon: 'upload_file', badge: 'Paso 05' },
  { id: 6, key: 'aprobador', title: 'Responsable de aprobación', shortTitle: 'Aprobador', description: 'Selecciona quién revisará tu solicitud', icon: 'groups', badge: 'Paso 06' },
]

export const LINEAMIENTOS = [
  { icon: 'calendar_month', title: 'Planea y solicita con anticipación', body: 'Toda solicitud programada debe comunicarse con mínimo 8 días calendario de anticipación, sin excepción, para garantizar la continuidad de la operación.' },
  { icon: 'verified', title: 'Primera aprobación: tu líder directo', body: 'Tu líder evalúa el impacto operativo y tiene la primera responsabilidad de aprobar o negar la solicitud según las necesidades del servicio.' },
  { icon: 'warning', title: 'Casos urgentes o de fuerza mayor', body: 'Ante situaciones imprevistas, informa de inmediato a tu líder y a Gestión Humana. Cada caso se atenderá de manera particular con la flexibilidad necesaria.' },
  { icon: 'description', title: 'Todo permiso debe estar soportado', body: 'Adjunta los soportes correspondientes (citas médicas, incapacidades, calamidades, licencias legales, etc.) cuando aplique, para cumplir con la normatividad laboral vigente.' },
  { icon: 'fact_check', title: 'Diligenciamiento obligatorio de este formulario', body: 'Con la aprobación de tu líder, completa este Formulario Único para que Gestión Humana realice el seguimiento, registro y gestión correspondiente.' },
]

export const TIPOS_DISPONIBLES: SolicitudTipo[] = ['PERMISO', 'LICENCIA', 'VACACIONES', 'CITACION_MEDICA', 'INCAPACIDAD', 'OTRO']

export const TIPO_ICONS: Record<SolicitudTipo, string> = {
  PERMISO: 'fact_check',
  LICENCIA: 'description',
  VACACIONES: 'beach_access',
  CITACION_MEDICA: 'medical_services',
  INCAPACIDAD: 'healing',
  OTRO: 'chat',
}

export const SUBTIPOS: Record<string, readonly string[]> = {
  PERMISO: PERMISO_SUBTIPOS,
  LICENCIA: LICENCIA_SUBTIPOS,
  INCAPACIDAD: INCAPACIDAD_SUBTIPOS,
}
