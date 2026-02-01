import { create } from 'zustand'
import type { BoardData, Task, TaskStatus } from '@/types'
import {
  loadBoard,
  saveBoard,
  addTask as addTaskToData,
  updateTask as updateTaskInData,
  removeTask as removeTaskFromData,
  addProject as addProjectToData,
} from '@/services/data.service'

interface BoardState {
  data: BoardData | null
  password: string | null
  activeProjectId: string | null
  isLoading: boolean
  isSaving: boolean
  error: string | null

  login: (password: string) => Promise<boolean>
  logout: () => void
  setActiveProject: (id: string) => void
  addTask: (title: string, status?: TaskStatus, priority?: 'low' | 'medium' | 'high') => Promise<void>
  moveTask: (id: string, status: TaskStatus) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  addProject: (name: string, description?: string) => Promise<void>
}

export const useBoardStore = create<BoardState>((set, get) => ({
  data: null,
  password: null,
  activeProjectId: null,
  isLoading: false,
  isSaving: false,
  error: null,

  login: async (password: string) => {
    set({ isLoading: true, error: null })
    const data = await loadBoard(password)
    if (!data) {
      set({ isLoading: false, error: 'Wrong password' })
      return false
    }
    const activeProjectId = data.projects.length > 0 ? data.projects[0].id : null
    set({ data, password, activeProjectId, isLoading: false })
    return true
  },

  logout: () => {
    set({ data: null, password: null, activeProjectId: null })
  },

  setActiveProject: (id: string) => set({ activeProjectId: id }),

  addTask: async (title, status = 'backlog', priority = 'medium') => {
    const { data, password, activeProjectId } = get()
    if (!data || !password || !activeProjectId) return

    const newData = addTaskToData(data, {
      projectId: activeProjectId,
      title,
      status,
      priority,
      order: data.tasks.filter((t) => t.status === status).length,
    })

    set({ data: newData, isSaving: true })
    await saveBoard(newData, password)
    set({ isSaving: false })
  },

  moveTask: async (id, status) => {
    const { data, password } = get()
    if (!data || !password) return

    const newData = updateTaskInData(data, id, { status })
    set({ data: newData, isSaving: true })
    await saveBoard(newData, password)
    set({ isSaving: false })
  },

  deleteTask: async (id) => {
    const { data, password } = get()
    if (!data || !password) return

    const newData = removeTaskFromData(data, id)
    set({ data: newData, isSaving: true })
    await saveBoard(newData, password)
    set({ isSaving: false })
  },

  updateTask: async (id, updates) => {
    const { data, password } = get()
    if (!data || !password) return

    const newData = updateTaskInData(data, id, updates)
    set({ data: newData, isSaving: true })
    await saveBoard(newData, password)
    set({ isSaving: false })
  },

  addProject: async (name, description) => {
    const { data, password } = get()
    if (!data || !password) return

    const newData = addProjectToData(data, name, description)
    const newProject = newData.projects[newData.projects.length - 1]
    set({ data: newData, activeProjectId: newProject.id, isSaving: true })
    await saveBoard(newData, password)
    set({ isSaving: false })
  },
}))
