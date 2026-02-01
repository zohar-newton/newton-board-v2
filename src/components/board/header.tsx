import { useState } from 'react'
import { useBoardStore } from '@/stores/board.store'

export function Header() {
  const { data, activeProjectId, setActiveProject, isLoading, refresh, logout } = useBoardStore()
  const [isRefreshing, setIsRefreshing] = useState(false)

  if (!data) return null

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refresh()
    setIsRefreshing(false)
  }

  return (
    <header
      className="flex items-center justify-between border-b px-6 py-4"
      style={{ borderColor: 'hsl(var(--border))' }}
    >
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold">🍎 Newton Board</h1>
        <select
          value={activeProjectId ?? 'all'}
          onChange={(e) => setActiveProject(e.target.value)}
          className="rounded-md border px-2 py-1 text-sm"
          style={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
        >
          <option value="all">All Projects</option>
          {data.projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing || isLoading}
          className="rounded-md border px-3 py-1.5 text-sm transition-colors hover:opacity-80 disabled:opacity-50"
          style={{ borderColor: 'hsl(var(--border))' }}
          title="Refresh board"
        >
          {isRefreshing ? '⏳' : '🔄'} Refresh
        </button>
        <button
          onClick={logout}
          className="rounded-md px-3 py-1.5 text-sm transition-colors hover:opacity-80"
          style={{ color: 'hsl(var(--muted-foreground))' }}
          title="Lock board"
        >
          🔒
        </button>
      </div>
    </header>
  )
}
