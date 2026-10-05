import { useState } from 'react'

import { useHistory } from 'react-router-dom'

import { motion } from 'framer-motion'

import { leaveRequests, type LeaveRequest, type RequestStatus } from '@/lib/mock-data'

import { Badge } from '@/components/ui/Badge'

import { Button } from '@/components/ui/Button'

import { Fab } from '@/components/ui/Fab'

import { FilterChip } from '@/components/ui/FilterChip'

import { PageHero } from '@/components/ui/PageHero'

import { SectionTitle } from '@/components/ui/SectionTitle'



const statusConfig: Record<RequestStatus, { label: string; variant: 'warning' | 'success' | 'danger' | 'default'; icon: string }> = {

  pending: { label: 'Pendiente', variant: 'warning', icon: 'pending' },

  approved: { label: 'Aprobado', variant: 'success', icon: 'check_circle' },

  rejected: { label: 'Rechazado', variant: 'danger', icon: 'cancel' },

  draft: { label: 'Borrador', variant: 'default', icon: 'draft' },

}



const typeIcons: Record<string, string> = {

  vacation: 'beach_access',

  medical: 'medical_services',

  personal: 'person',

  training: 'school',

  other: 'more_horiz',

}



function RequestCard({ req }: { req: LeaveRequest }) {

  const [expanded, setExpanded] = useState(false)

  const status = statusConfig[req.status]



  return (

    <div className="list-card" onClick={() => setExpanded(!expanded)} role="button" tabIndex={0}>

      <div className={`list-card-accent bg-gradient-to-r ${

        req.status === 'approved' ? 'from-emerald-400 to-emerald-500' :

        req.status === 'rejected' ? 'from-red-400 to-red-500' :

        req.status === 'pending' ? 'from-amber-400 to-orange-400' :

        'from-slate-300 to-slate-400'

      }`} />

      <div className="list-card-body">

        <div className={`list-card-icon bg-brand-blue/10`}>

          <span className="material-symbols-outlined text-brand-blue text-[20px]">{typeIcons[req.type]}</span>

        </div>

        <div className="flex-1 min-w-0">

          <div className="flex items-start justify-between gap-2">

            <h3 className="list-card-title">{req.title}</h3>

            <Badge variant={status.variant}>{status.label}</Badge>

          </div>

          <p className="list-card-meta">

            <span className="material-symbols-outlined text-[13px]">calendar_today</span>

            {req.startDate}

            <span className="mx-1">·</span>

            {req.days} día{req.days !== 1 ? 's' : ''}

          </p>

        </div>

        <span className={`material-symbols-outlined text-slate-300 text-[18px] flex-shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`}>chevron_right</span>

      </div>

      {expanded && (

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pb-3.5 pt-0 border-t border-slate-100 mx-4 space-y-2">

          {req.note && <p className="text-xs text-slate-600 pt-3">{req.note}</p>}

          <p className="text-[11px] text-on-surface-variant">Radicado: {req.submittedAt}</p>

          {req.approvedBy && <p className="text-[11px] text-emerald-600 font-medium">Aprobado por {req.approvedBy}</p>}

        </motion.div>

      )}

    </div>

  )

}



export default function RequestsPage() {

  const history = useHistory()

  const [activeTab, setActiveTab] = useState<RequestStatus | 'all'>('all')



  const filtered = activeTab === 'all' ? leaveRequests : leaveRequests.filter(r => r.status === activeTab)

  const pending = leaveRequests.filter(r => r.status === 'pending').length

  const approved = leaveRequests.filter(r => r.status === 'approved').length



  const tabs: { key: RequestStatus | 'all'; label: string; count?: number }[] = [

    { key: 'all', label: 'Todas', count: leaveRequests.length },

    { key: 'pending', label: 'Pendientes', count: pending },

    { key: 'approved', label: 'Aprobadas', count: approved },

    { key: 'rejected', label: 'Rechazadas' },

  ]



  return (

    <div className="page-container">

      <PageHero

        eyebrow="Permisos"

        title={`${leaveRequests.length}`}

        subtitle="solicitudes este año"

        stats={[

          { value: pending, label: 'Pendientes' },

          { value: approved, label: 'Aprobadas' },

          { value: leaveRequests.filter(r => r.status === 'rejected').length, label: 'Rechazadas' },

        ]}

        action={
          <Button variant="amber" size="md" icon="add" fullWidth showArrow onClick={() => history.push('/dashboard/requests/new')}>
            Nueva solicitud
          </Button>
        }

      />



      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 hide-scrollbar pb-0.5">

        {tabs.map(tab => (

          <FilterChip

            key={tab.key}

            label={tab.label}

            active={activeTab === tab.key}

            count={tab.count}

            onClick={() => setActiveTab(tab.key)}

          />

        ))}

      </div>



      {filtered.length === 0 ? (

        <div className="flex flex-col items-center py-14 text-center">

          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">

            <span className="material-symbols-outlined text-slate-400 text-[28px]">inbox</span>

          </div>

          <p className="font-medium text-on-surface-variant text-sm">No hay solicitudes</p>

          <p className="text-xs text-slate-400 mt-1">Crea tu primera solicitud de permiso</p>

          <Button variant="primary" className="mt-4" icon="add" showArrow onClick={() => history.push('/dashboard/requests/new')}>
            Crear solicitud
          </Button>

        </div>

      ) : (

        <div>

          <SectionTitle

            title={tabs.find(t => t.key === activeTab)?.label || 'Solicitudes'}

            subtitle={`${filtered.length} registro${filtered.length !== 1 ? 's' : ''}`}

          />

          <div className="flex flex-col gap-2.5">

            {filtered.map(req => <RequestCard key={req.id} req={req} />)}

          </div>

        </div>

      )}



      <Fab icon="add" label="Nueva" onClick={() => history.push('/dashboard/requests/new')} />

    </div>

  )

}

