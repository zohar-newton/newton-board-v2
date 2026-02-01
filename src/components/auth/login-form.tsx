import { useState } from 'react'
import { useBoardStore } from '@/stores/board.store'
import { setGitHubToken, verifyToken } from '@/services/github.service'
import { cn } from '@/lib/utils'

export function LoginForm() {
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [step, setStep] = useState<'token' | 'password'>('token')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const login = useBoardStore((s) => s.login)

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const valid = await verifyToken(token.trim())
    if (valid) {
      setGitHubToken(token.trim())
      setStep('password')
    } else {
      setError('Invalid token or no repo access')
    }
    setIsLoading(false)
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
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
            {step === 'token' ? 'Enter your GitHub token' : 'Enter password to decrypt'}
          </p>
        </div>

        {step === 'token' ? (
          <form onSubmit={handleTokenSubmit} className="space-y-4">
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="GitHub Personal Access Token"
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
              disabled={isLoading || !token}
              className="w-full rounded-lg px-4 py-3 text-sm font-medium transition-colors disabled:opacity-50"
              style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
            >
              {isLoading ? 'Verifying...' : 'Continue'}
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
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
        )}
      </div>
    </div>
  )
}
