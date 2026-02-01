import { useRef } from 'react'
import type { Task, TaskStatus } from '@/types'
import { COLUMNS } from '@/types'
import { useBoardStore } from '@/stores/board.store'
import { Column } from './column'

export function Board() {
  const { data, activeProjectId, addTask, moveTask, deleteTask } = useBoardStore()
  const draggedTask = useRef<Task | null>(null)

  if (!data) return null

  const tasks = data.tasks.filter((t) => t.projectId === activeProjectId)

  const handleDragStart = (_e: React.DragEvent, task: Task) => {
    draggedTask.current = task
  }

  const handleDrop = (_e: React.DragEvent, status: TaskStatus) => {
    if (draggedTask.current && draggedTask.current.status !== status) {
      moveTask(draggedTask.current.id, status)
    }
    draggedTask.current = null
  }

  return (
    <div className="flex gap-4 overflow-x-auto p-6">
      {COLUMNS.map((col) => (
        <Column
          key={col.id}
          id={col.id}
          label={col.label}
          tasks={tasks.filter((t) => t.status === col.id)}
          onAddTask={(title, status) => addTask(title, status)}
          onDeleteTask={deleteTask}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
        />
      ))}
    </div>
  )
}
