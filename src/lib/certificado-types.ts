export type CertificadoTipo = 'laboral' | 'personalizado'

export interface CertificadoFormData {
  nombreCompleto: string
  documento: string
  cargo: string
  empresaId: number
  empresaNombre: string
  tipo: CertificadoTipo
  fechaEmision: string
}

export interface CertificadoGenerado {
  id: string
  numero: string
  tipo: CertificadoTipo
  empleado: string
  empresa: string
  fechaEmision: string
  generadoEn: string
}
