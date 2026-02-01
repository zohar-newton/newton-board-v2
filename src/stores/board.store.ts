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
    const activeProjectId = 'all'
    // Store password for refresh + persistence
    localStorage.setItem('bp', password)
    set({ data, activeProjectId, isLoading: false })
    return true
  },

  logout: () => {
    localStorage.removeItem('bp')
    set({ data: null, activeProjectId: null })
  },

  setActiveProject: (id: string) => set({ activeProjectId: id }),

  refresh: async () => {
    const password = localStorage.getItem('bp')
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
