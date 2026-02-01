import { useBoardStore } from '@/stores/board.store'

export function Header() {
  const { data, activeProjectId, setActiveProject, isSaving } = useBoardStore()

  if (!data) return null

  const activeProject = data.projects.find((p) => p.id === activeProjectId)

  return (
    <header
      className="flex items-center justify-between border-b px-6 py-4"
      style={{ borderColor: 'hsl(var(--border))' }}
    >
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold">🍎 Newton Board</h1>
        {data.projects.length > 1 && (
          <select
            value={activeProjectId ?? ''}
            onChange={(e) => setActiveProject(e.target.value)}
            className="rounded-md border px-2 py-1 text-sm"
            style={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
          >
            {data.projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        )}
        {isSaving && (
          <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Saving...
          </span>
        )}
      </div>
      {activeProject?.description && (
        <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
          {activeProject.description}
        </p>
      )}
    </header>
  )
}
