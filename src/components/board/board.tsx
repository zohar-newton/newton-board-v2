import { COLUMNS } from '@/types'
import { useBoardStore } from '@/stores/board.store'
import { Column } from './column'

export function Board() {
  const { data, activeProjectId } = useBoardStore()

  if (!data) return null

  const tasks = data.tasks.filter((t) => t.projectId === activeProjectId)

  return (
    <div className="flex gap-4 overflow-x-auto p-6">
      {COLUMNS.map((col) => (
        <Column
          key={col.id}
          id={col.id}
          label={col.label}
          tasks={tasks.filter((t) => t.status === col.id)}
        />
      ))}
    </div>
  )
}
