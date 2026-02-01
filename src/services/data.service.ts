import type { BoardData, Task } from '@/types'
import { encrypt, decrypt, isEncrypted } from './crypto.service'
import { readEncryptedData, writeEncryptedData } from './github.service'
import { generateId } from '@/lib/utils'

let currentSha: string | undefined

const DEFAULT_DATA: BoardData = {
  projects: [],
  tasks: [],
}

export async function loadBoard(password: string): Promise<BoardData | null> {
  const file = await readEncryptedData()

  if (!file) {
    // First time — create the data file
    const encrypted = await encrypt(JSON.stringify(DEFAULT_DATA), password)
    await writeEncryptedData(encrypted)
    currentSha = undefined
    return DEFAULT_DATA
  }

  currentSha = file.sha

  if (isEncrypted(file.content)) {
    const decrypted = await decrypt(file.content, password)
    if (!decrypted) return null // wrong password
    try {
      return JSON.parse(decrypted) as BoardData
    } catch {
      return null
    }
  }

  // Unencrypted (shouldn't happen but handle gracefully)
  try {
    const data = JSON.parse(file.content) as BoardData
    await saveBoard(data, password)
    return data
  } catch {
    return null
  }
}

export async function saveBoard(data: BoardData, password: string): Promise<boolean> {
  const encrypted = await encrypt(JSON.stringify(data), password)
  const success = await writeEncryptedData(encrypted, currentSha)
  if (success) {
    // Refresh sha after write
    const file = await readEncryptedData()
    if (file) currentSha = file.sha
  }
  return success
}

// Helper functions for mutations
export function addTask(data: BoardData, task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): BoardData {
  const now = new Date().toISOString()
  return {
    ...data,
    tasks: [...data.tasks, {
      ...task,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    }],
  }
}

export function updateTask(data: BoardData, id: string, updates: Partial<Task>): BoardData {
  return {
    ...data,
    tasks: data.tasks.map((t) =>
      t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
    ),
  }
}

export function removeTask(data: BoardData, id: string): BoardData {
  return {
    ...data,
    tasks: data.tasks.filter((t) => t.id !== id),
  }
}

export function addProject(data: BoardData, name: string, description?: string): BoardData {
  return {
    ...data,
    projects: [...data.projects, {
      id: generateId(),
      name,
      description,
      createdAt: new Date().toISOString(),
    }],
  }
}

export function removeProject(data: BoardData, id: string): BoardData {
  return {
    ...data,
    projects: data.projects.filter((p) => p.id !== id),
    tasks: data.tasks.filter((t) => t.projectId !== id),
  }
}
