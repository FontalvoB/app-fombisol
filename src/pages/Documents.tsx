import { useState } from 'react'

import { useHistory } from 'react-router-dom'

import { motion } from 'framer-motion'

import { docCategories, type Document, type DocType } from '@/lib/mock-data'

import { useApp } from '@/context/AppContext'

import { Badge } from '@/components/ui/Badge'

import { FilterChip } from '@/components/ui/FilterChip'

import { PageHero } from '@/components/ui/PageHero'

import { SectionTitle } from '@/components/ui/SectionTitle'



const docTypeConfig: Record<DocType, { icon: string; color: string; bg: string; label: string }> = {

  pdf: { icon: 'picture_as_pdf', color: 'text-red-500', bg: 'bg-red-50', label: 'PDF' },

  xlsx: { icon: 'table_chart', color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Excel' },

  docx: { icon: 'article', color: 'text-brand-blue', bg: 'bg-blue-50', label: 'Word' },

  pptx: { icon: 'slideshow', color: 'text-amber-600', bg: 'bg-amber-50', label: 'PPT' },

}



function DocCard({ doc, read, onOpen }: { doc: Document; read: boolean; onOpen: () => void }) {

  const typeConf = docTypeConfig[doc.type]



  return (

    <div className="list-card" onClick={onOpen} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && onOpen()}>

      <div className={`list-card-accent ${doc.mandatory ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-slate-200'}`} />

      <div className="list-card-body">

        <div className={`list-card-icon ${typeConf.bg}`}>

          <span className={`material-symbols-outlined ${typeConf.color} text-[20px]`}>{typeConf.icon}</span>

        </div>

        <div className="flex-1 min-w-0">

          <div className="flex items-start justify-between gap-2">

            <h3 className="list-card-title line-clamp-2">{doc.name}</h3>

            {doc.mandatory && !read && <Badge variant="unread">No leído</Badge>}

            {doc.mandatory && read && <Badge variant="success">Leído</Badge>}

          </div>

          <div className="flex items-center gap-1.5 flex-wrap mt-1.5">

            <span className="text-[10px] font-semibold uppercase text-on-surface-variant bg-slate-100 px-2 py-0.5 rounded-full">{typeConf.label}</span>

            {doc.mandatory && <Badge variant="mandatory">Obligatorio</Badge>}

          </div>

          <p className="list-card-meta">

            <span className="material-symbols-outlined text-[13px]">schedule</span>

            {doc.updatedAt} · {doc.updatedBy}

          </p>

        </div>

        <span className="material-symbols-outlined text-slate-300 text-[18px] flex-shrink-0">chevron_right</span>

      </div>

    </div>

  )

}



export default function DocumentsPage() {

  const history = useHistory()

  const { documents, isDocumentRead } = useApp()

  const [activeCategory, setActiveCategory] = useState('Todos')

  const [search, setSearch] = useState('')



  const mandatoryDocs = documents.filter(d => d.mandatory)

  const unreadMandatory = mandatoryDocs.filter(d => !isDocumentRead(d.id)).length



  const filtered = documents.filter(d => {

    const matchesCat = activeCategory === 'Todos' || d.category === activeCategory

    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))

    return matchesCat && matchesSearch

  })



  return (

    <div className="page-container">

      {unreadMandatory > 0 && (

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl overflow-hidden bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_6px_20px_rgba(245,158,11,0.3)]">

          <div className="flex items-center gap-3.5 px-4 py-3.5">

            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">

              <span className="material-symbols-outlined text-white text-[22px]">priority_high</span>

            </div>

            <div className="flex-1 min-w-0">

              <p className="text-white font-semibold text-sm">{unreadMandatory} documento{unreadMandatory > 1 ? 's' : ''} obligatorio{unreadMandatory > 1 ? 's' : ''} sin leer</p>

              <p className="text-white/75 text-xs mt-0.5">Léelos completamente para cumplir con las políticas.</p>

            </div>

          </div>

        </motion.div>

      )}



      <PageHero

        eyebrow="Biblioteca"

        title={`${documents.length}`}

        subtitle="documentos disponibles"

        stats={[

          { value: mandatoryDocs.length, label: 'Obligatorios' },

          { value: unreadMandatory, label: 'Pendientes' },

          { value: documents.length - mandatoryDocs.length, label: 'Opcionales' },

        ]}

      />



      <div className="relative">

        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>

        <input

          type="text"

          value={search}

          onChange={e => setSearch(e.target.value)}

          placeholder="Buscar documentos..."

          className="field-input pl-12"

        />

      </div>



      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 hide-scrollbar pb-0.5">

        {docCategories.map(cat => (

          <FilterChip

            key={cat}

            label={cat}

            active={activeCategory === cat}

            onClick={() => setActiveCategory(cat)}

          />

        ))}

      </div>



      <div>

        <SectionTitle

          title={activeCategory === 'Todos' ? 'Todos los documentos' : activeCategory}

          subtitle={`${filtered.length} resultado${filtered.length !== 1 ? 's' : ''}`}

        />

        <div className="flex flex-col gap-2.5">

          {filtered.map(doc => (

            <DocCard

              key={doc.id}

              doc={doc}

              read={isDocumentRead(doc.id)}

              onOpen={() => history.push(`/dashboard/documents/${doc.id}`)}

            />

          ))}

        </div>

      </div>

    </div>

  )

}

