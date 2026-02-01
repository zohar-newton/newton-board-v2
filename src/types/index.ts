export type TaskStatus = 'backlog' | 'in-progress' | 'review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Project {
  id: string
  name: string
  description?: string
  createdAt: string
}

export interface Task {
  id: string
  projectId: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  order: number
  createdAt: string
  updatedAt: string
}

export interface BoardData {
  projects: Project[]
  tasks: Task[]
}

export const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' },
]
