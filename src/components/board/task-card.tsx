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
}

export function TaskCard({ task }: TaskCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-l-4 p-3 shadow-sm',
        priorityColors[task.priority]
      )}
      style={{ backgroundColor: 'hsl(var(--card))' }}
    >
      <h4 className="text-sm font-medium leading-snug">{task.title}</h4>
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
