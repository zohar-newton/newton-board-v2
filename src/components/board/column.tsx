import type { Task, TaskStatus, Project } from '@/types'
import { TaskCard } from './task-card'

interface ColumnProps {
  id: TaskStatus
  label: string
  tasks: Task[]
  projects: Project[]
}

export function Column({ label, tasks, projects }: ColumnProps) {
  const getProjectName = (projectId: string) => {
    return projects.find((p) => p.id === projectId)?.name ?? ''
  }

  return (
    <div
      className="flex h-full w-72 shrink-0 flex-col rounded-xl p-3"
      style={{ backgroundColor: 'hsl(var(--muted) / 0.5)' }}
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
          <TaskCard
            key={task.id}
            task={task}
            projectName={getProjectName(task.projectId)}
          />
        ))}
      </div>
    </div>
  )
}
