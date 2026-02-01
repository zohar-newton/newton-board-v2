import { useState } from 'react'
import { useBoardStore } from '@/stores/board.store'
import { cn } from '@/lib/utils'

export function LoginForm() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const login = useBoardStore((s) => s.login)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const success = await login(password)
    if (!success) {
      setError('Wrong password')
      setPassword('')
    }
    setIsLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: 'hsl(var(--background))' }}>
      <div className="w-full max-w-sm space-y-6 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">🍎 Newton Board</h1>
          <p className="mt-1 text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Enter password to view
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            className={cn(
              'w-full rounded-lg border px-4 py-3 text-sm outline-none transition-colors',
              'focus:ring-2 focus:ring-opacity-20'
            )}
            style={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
          />
          {error && <p className="text-center text-sm" style={{ color: 'hsl(var(--destructive))' }}>{error}</p>}
          <button
            type="submit"
            disabled={isLoading || !password}
            className="w-full rounded-lg px-4 py-3 text-sm font-medium transition-colors disabled:opacity-50"
            style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
          >
            {isLoading ? 'Unlocking...' : 'Unlock'}
          </button>
        </form>
      </div>
    </div>
  )
}
