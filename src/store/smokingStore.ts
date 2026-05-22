import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import type { SmokingSession } from '../types/smoking'

interface SmokingState {
  sessions: SmokingSession[]
  addSession: (session: Omit<SmokingSession, 'id' | 'createdAt'>) => void
  updateSession: (id: string, partial: Partial<Omit<SmokingSession, 'id' | 'createdAt'>>) => void
  deleteSession: (id: string) => void
}

export const useSmokingStore = create<SmokingState>()(
  persist(
    (set) => ({
      sessions: [],

      addSession: (session) =>
        set((s) => ({
          sessions: [
            ...s.sessions,
            { ...session, id: uuidv4(), createdAt: new Date().toISOString() },
          ],
        })),

      updateSession: (id, partial) =>
        set((s) => ({
          sessions: s.sessions.map((sess) =>
            sess.id === id ? { ...sess, ...partial } : sess
          ),
        })),

      deleteSession: (id) =>
        set((s) => ({ sessions: s.sessions.filter((sess) => sess.id !== id) })),
    }),
    { name: 'kucharka-denik' }
  )
)
