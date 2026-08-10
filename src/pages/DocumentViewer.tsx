import { useRef, useState, useCallback } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'

export default function DocumentViewer() {
  const { id } = useParams<{ id: string }>()
  const history = useHistory()
  const { documents, isDocumentRead, markDocumentRead, getDocumentReadAt } = useApp()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [reachedEnd, setReachedEnd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmedAt, setConfirmedAt] = useState<string | null>(getDocumentReadAt(id!))

  const doc = documents.find(d => d.id === id)
  const alreadyRead = isDocumentRead(id!)

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el || alreadyRead) return
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 48
    if (atBottom) setReachedEnd(true)
  }, [alreadyRead])

  if (!doc) {
    return (
      <div className="page-container items-center justify-center min-h-[50dvh]">
        <p className="text-on-surface-variant">Documento no encontrado.</p>
        <Button variant="secondary" onClick={() => history.push('/dashboard/documents')}>Volver</Button>
      </div>
    )
  }

  function handleMarkRead() {
    if (!doc) return
    const readAt = markDocumentRead(doc.id)
    setConfirmedAt(readAt)
    setShowConfirm(true)
  }

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-4 pt-2 pb-3">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {doc.mandatory && <Badge variant="mandatory">Obligatorio</Badge>}
              {alreadyRead ? <Badge variant="success">Leído</Badge> : <Badge variant="unread">No leído</Badge>}
            </div>
            <h2 className="text-lg font-bold text-brand-dark leading-tight">{doc.name}</h2>
            <p className="text-xs text-on-surface-variant mt-1">{doc.updatedBy} · {doc.updatedAt}</p>
          </div>
        </div>

        {!alreadyRead && (
          <div className="mt-3 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-brand-blue rounded-full"
              animate={{ width: reachedEnd ? '100%' : '30%' }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 pb-32"
        style={{ maxHeight: 'calc(100dvh - 12rem)' }}
      >
        <div className="bg-white rounded-3xl shadow-card border border-slate-100 p-6 space-y-5">
          {doc.content.map((paragraph, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`text-[15px] leading-relaxed ${i === 0 ? 'text-brand-dark font-semibold text-base' : 'text-slate-600'}`}
            >
              {paragraph}
            </motion.p>
          ))}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px]">flag</span>
            <span className="text-xs font-semibold uppercase tracking-wider">Fin del documento</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {(reachedEnd || alreadyRead) && !showConfirm && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-40 p-4 pb-safe bg-white/90 backdrop-blur-xl border-t border-slate-100 shadow-elevated"
          >
            {alreadyRead ? (
              <div className="max-w-lg mx-auto text-center">
                <p className="text-sm text-emerald-600 font-semibold flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">check_circle</span>
                  Leído el {confirmedAt || getDocumentReadAt(doc.id)}
                </p>
              </div>
            ) : (
              <div className="max-w-lg mx-auto">
                <Button variant="success" size="lg" className="w-full" icon="done_all" onClick={handleMarkRead}>
                  Marcar como leído
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Modal
        open={showConfirm}
        onClose={() => { setShowConfirm(false); history.push('/dashboard/documents') }}
        title="Documento marcado como leído"
        icon="verified"
        iconClass="bg-emerald-500"
      >
        <div className="text-center space-y-4">
          <p className="text-sm text-on-surface-variant">
            Has confirmado la lectura completa de:
          </p>
          <p className="font-bold text-brand-dark">{doc.name}</p>
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider mb-1">Fecha y hora de confirmación</p>
            <p className="text-brand-blue font-bold text-base">{confirmedAt}</p>
          </div>
          <Button variant="primary" className="w-full" onClick={() => { setShowConfirm(false); history.push('/dashboard/documents') }}>
            Entendido
          </Button>
        </div>
      </Modal>
    </div>
  )
}
