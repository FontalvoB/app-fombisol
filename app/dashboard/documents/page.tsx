'use client'

import { useState } from 'react'
import { documents, docCategories, type Document, type DocType } from '@/lib/mock-data'

const docTypeConfig: Record<DocType, { icon: string; color: string; bg: string; label: string }> = {
  pdf: { icon: 'picture_as_pdf', color: 'text-red-500', bg: 'bg-red-50', label: 'PDF' },
  xlsx: { icon: 'table_chart', color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Excel' },
  docx: { icon: 'article', color: 'text-brand-blue', bg: 'bg-blue-50', label: 'Word' },
  pptx: { icon: 'slideshow', color: 'text-amber-600', bg: 'bg-amber-50', label: 'PPT' },
}

function DocCard({ doc, delay }: { doc: Document; delay: number }) {
  const [pressed, setPressed] = useState(false)
  const typeConf = docTypeConfig[doc.type]

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100/80 shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden anim-hidden animate-slide-up transition-all duration-200 active:scale-[0.97] cursor-pointer"
      style={{ animationDelay: `${delay}s` }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
    >
      {/* Color accent top bar */}
      <div className={`h-1 ${typeConf.bg.replace('bg-', 'bg-').replace('50', '200')}`} />

      <div className="p-4 flex items-start gap-3">
        {/* Icon */}
        <div className={`w-11 h-11 rounded-xl ${typeConf.bg} flex items-center justify-center flex-shrink-0`}>
          <span className={`material-symbols-outlined ${typeConf.color} text-[22px]`}>{typeConf.icon}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#213053] text-sm leading-snug mb-1 truncate pr-1">{doc.name}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase text-on-surface-variant bg-gray-100 px-2 py-0.5 rounded-full">
              {typeConf.label}
            </span>
            <span className="text-[10px] text-on-surface-variant">{doc.size}</span>
          </div>
          <div className="flex items-center gap-1 mt-1.5">
            <span className="material-symbols-outlined text-on-surface-variant text-[12px]">schedule</span>
            <span className="text-[10px] text-on-surface-variant">{doc.updatedAt}</span>
            <span className="text-on-surface-variant text-[10px] mx-0.5">&bull;</span>
            <span className="text-[10px] text-on-surface-variant font-medium truncate">{doc.updatedBy}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          <button
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20 transition-colors active:scale-95"
            onClick={(e) => { e.stopPropagation(); }}
            aria-label="Descargar"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
          </button>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-on-surface-variant hover:bg-gray-200 transition-colors active:scale-95"
            onClick={(e) => { e.stopPropagation(); }}
            aria-label="Compartir"
          >
            <span className="material-symbols-outlined text-[18px]">share</span>
          </button>
        </div>
      </div>

      {/* Tags */}
      {doc.tags.length > 0 && (
        <div className="px-4 pb-3 flex gap-1.5 flex-wrap">
          {doc.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] bg-brand-blue/8 text-brand-blue font-semibold px-2 py-0.5 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default function DocumentsPage() {
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [search, setSearch] = useState('')

  const filtered = documents.filter((d) => {
    const matchesCat = activeCategory === 'Todos' || d.category === activeCategory
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    return matchesCat && matchesSearch
  })

  return (
    <div className="flex flex-col gap-4 px-4 py-4 max-w-lg mx-auto">
      {/* Summary banner */}
      <div className="gradient-brand rounded-2xl p-4 relative overflow-hidden anim-hidden animate-slide-up delay-100">
        <div className="absolute -right-8 -bottom-4 w-32 h-32 rounded-full bg-white/5" />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">Mis Documentos</p>
            <p className="text-white text-3xl font-bold mt-0.5">{documents.length}</p>
            <p className="text-white/60 text-xs mt-1">archivos disponibles</p>
          </div>
          <div className="flex gap-3">
            {(['pdf', 'xlsx', 'docx'] as DocType[]).map((t) => {
              const count = documents.filter(d => d.type === t).length
              const conf = docTypeConfig[t]
              return (
                <div key={t} className="flex flex-col items-center bg-white/10 rounded-xl px-3 py-2">
                  <span className={`material-symbols-outlined text-white text-[18px]`}>{conf.icon}</span>
                  <span className="text-white text-sm font-bold">{count}</span>
                  <span className="text-white/60 text-[9px] uppercase font-semibold">{conf.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative anim-hidden animate-slide-up delay-150">
        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
          search
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar documentos, etiquetas..."
          className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-transparent transition-all shadow-sm"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-0.5 hide-scrollbar anim-hidden animate-slide-up delay-200">
        {docCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
              activeCategory === cat
                ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/25'
                : 'bg-white text-on-surface-variant border border-gray-200 hover:border-brand-blue/30'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Document list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 anim-hidden animate-fade-in">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-gray-400 text-[32px]">folder_off</span>
          </div>
          <p className="text-on-surface-variant font-medium">No se encontraron documentos</p>
          <p className="text-on-surface-variant/60 text-sm mt-1">Intenta con otra búsqueda o categoría</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((doc, i) => (
            <DocCard key={doc.id} doc={doc} delay={0.2 + i * 0.05} />
          ))}
        </div>
      )}

      {/* Upload FAB */}
      <button
        className="fixed bottom-24 right-4 w-14 h-14 gradient-brand rounded-full flex items-center justify-center shadow-xl shadow-brand-blue/35 active:scale-90 transition-all duration-200 z-40"
        aria-label="Subir documento"
      >
        <span className="material-symbols-outlined text-white text-[24px]">add</span>
      </button>

      <div className="h-2" />
    </div>
  )
}
