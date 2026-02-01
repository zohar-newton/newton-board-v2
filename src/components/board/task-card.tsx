import type { Task } from '@/types'
import { cn } from '@/lib/utils'

const priorityColors = {
  low: 'border-l-slate-300',
  medium: 'border-l-amber-400',
  high: 'border-l-red-500',
}

const priorityLabels = {
  low: 'Low',
  medium: 'Med',
  high: 'High',
}

interface TaskCardProps {
  task: Task
  onDelete: (id: string) => void
  onDragStart: (e: React.DragEvent, task: Task) => void
}

export function TaskCard({ task, onDelete, onDragStart }: TaskCardProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      className={cn(
        'group relative rounded-lg border border-l-4 p-3 shadow-sm transition-all',
        'hover:shadow-md hover:-translate-y-0.5 cursor-grab active:cursor-grabbing',
        priorityColors[task.priority]
      )}
      style={{ backgroundColor: 'hsl(var(--card))' }}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium leading-snug">{task.title}</h4>
        <button
          onClick={() => onDelete(task.id)}
          className="shrink-0 rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500"
          style={{ color: 'hsl(var(--muted-foreground))' }}
          aria-label="Delete task"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      {task.description && (
        <p className="mt-1 text-xs line-clamp-2" style={{ color: 'hsl(var(--muted-foreground))' }}>
          {task.description}
        </p>
      )}
      <div className="mt-2">
        <span className={cn(
          'inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium',
          task.priority === 'high' && 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
          task.priority === 'medium' && 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
          task.priority === 'low' && 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
        )}>
          {priorityLabels[task.priority]}
        </span>
      </div>
    </div>
  )
}
