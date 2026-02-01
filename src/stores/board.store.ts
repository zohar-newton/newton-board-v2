import { create } from 'zustand'
import type { BoardData } from '@/types'
import { loadBoard } from '@/services/data.service'

interface BoardState {
  data: BoardData | null
  activeProjectId: string | null
  isLoading: boolean
  error: string | null

  login: (password: string) => Promise<boolean>
  logout: () => void
  setActiveProject: (id: string) => void
  refresh: () => Promise<void>
}

export const useBoardStore = create<BoardState>((set, get) => ({
  data: null,
  activeProjectId: null,
  isLoading: false,
  error: null,

  login: async (password: string) => {
    set({ isLoading: true, error: null })
    const data = await loadBoard(password)
    if (!data) {
      set({ isLoading: false, error: 'Wrong password' })
      return false
    }
    const activeProjectId = data.projects.length > 0 ? data.projects[0].id : null
    // Store password for refresh
    sessionStorage.setItem('bp', password)
    set({ data, activeProjectId, isLoading: false })
    return true
  },

  logout: () => {
    sessionStorage.removeItem('bp')
    set({ data: null, activeProjectId: null })
  },

  setActiveProject: (id: string) => set({ activeProjectId: id }),

  refresh: async () => {
    const password = sessionStorage.getItem('bp')
    if (!password) return

    set({ isLoading: true })
    const data = await loadBoard(password)
    if (data) {
      const { activeProjectId } = get()
      const validProject = data.projects.find((p) => p.id === activeProjectId)
      set({
        data,
        activeProjectId: validProject ? activeProjectId : data.projects[0]?.id ?? null,
        isLoading: false,
      })
    } else {
      set({ isLoading: false })
    }
  },
}))
