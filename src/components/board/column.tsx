import { useState } from 'react'
import type { Task, TaskStatus } from '@/types'
import { TaskCard } from './task-card'
import { cn } from '@/lib/utils'

interface ColumnProps {
  id: TaskStatus
  label: string
  tasks: Task[]
  onAddTask: (title: string, status: TaskStatus) => void
  onDeleteTask: (id: string) => void
  onDragStart: (e: React.DragEvent, task: Task) => void
  onDrop: (e: React.DragEvent, status: TaskStatus) => void
}

export function Column({ id, label, tasks, onAddTask, onDeleteTask, onDragStart, onDrop }: ColumnProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)

  const handleSubmit = () => {
    if (newTitle.trim()) {
      onAddTask(newTitle.trim(), id)
      setNewTitle('')
      setIsAdding(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
    if (e.key === 'Escape') { setIsAdding(false); setNewTitle('') }
  }

  return (
    <div
      className={cn(
        'flex h-full w-72 shrink-0 flex-col rounded-xl p-3 transition-colors',
        isDragOver && 'ring-2 ring-blue-400/30'
      )}
      style={{ backgroundColor: isDragOver ? 'hsl(var(--muted))' : 'hsl(var(--muted) / 0.5)' }}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => { setIsDragOver(false); onDrop(e, id) }}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold" style={{ color: 'hsl(var(--muted-foreground))' }}>{label}</h3>
        <span
          className="rounded-full px-2 py-0.5 text-xs font-medium"
          style={{ backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}
        >
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
        {tasks.sort((a, b) => a.order - b.order).map((task) => (
          <TaskCard key={task.id} task={task} onDelete={onDeleteTask} onDragStart={onDragStart} />
        ))}
      </div>

      {isAdding ? (
        <div className="mt-2">
          <input
            autoFocus
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => { if (!newTitle.trim()) setIsAdding(false) }}
            placeholder="Task title..."
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400/20"
            style={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
          />
          <div className="mt-1.5 flex gap-1.5">
            <button
              onClick={handleSubmit}
              className="rounded-md px-3 py-1 text-xs font-medium"
              style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
            >
              Add
            </button>
            <button
              onClick={() => { setIsAdding(false); setNewTitle('') }}
              className="rounded-md px-3 py-1 text-xs"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="mt-2 flex w-full items-center gap-1 rounded-lg px-2 py-1.5 text-sm transition-colors hover:opacity-80"
          style={{ color: 'hsl(var(--muted-foreground))' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add task
        </button>
      )}
    </div>
  )
}
