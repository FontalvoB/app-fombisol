import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { currentUser as defaultUser, documents as initialDocs, type Document } from '@/lib/mock-data'

export type UserRoleType = 'Jefe' | 'Colaborador'

interface ReadRecord {
  readAt: string
}

interface AppContextValue {
  userRole: UserRoleType
  setUserRole: (role: UserRoleType) => void
  documentReads: Record<string, ReadRecord>
  markDocumentRead: (docId: string) => string
  isDocumentRead: (docId: string) => boolean
  getDocumentReadAt: (docId: string) => string | null
  documents: Document[]
}

const AppContext = createContext<AppContextValue | null>(null)

const STORAGE_KEY = 'peoplenet-doc-reads'
const ROLE_KEY = 'peoplenet-user-role'

export function AppProvider({ children }: { children: ReactNode }) {
  const [userRole, setUserRoleState] = useState<UserRoleType>(() => {
    const saved = localStorage.getItem(ROLE_KEY)
    return (saved as UserRoleType) || defaultUser.roleType
  })

  const [documentReads, setDocumentReads] = useState<Record<string, ReadRecord>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    localStorage.setItem(ROLE_KEY, userRole)
  }, [userRole])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(documentReads))
  }, [documentReads])

  const setUserRole = useCallback((role: UserRoleType) => {
    setUserRoleState(role)
  }, [])

  const markDocumentRead = useCallback((docId: string) => {
    const readAt = new Date().toLocaleString('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    setDocumentReads(prev => ({ ...prev, [docId]: { readAt } }))
    return readAt
  }, [])

  const isDocumentRead = useCallback((docId: string) => !!documentReads[docId], [documentReads])
  const getDocumentReadAt = useCallback((docId: string) => documentReads[docId]?.readAt ?? null, [documentReads])

  return (
    <AppContext.Provider value={{
      userRole,
      setUserRole,
      documentReads,
      markDocumentRead,
      isDocumentRead,
      getDocumentReadAt,
      documents: initialDocs,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export function isJefe(role: UserRoleType) {
  return role === 'Jefe'
}
