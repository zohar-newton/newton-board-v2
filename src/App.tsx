import { useEffect } from 'react'
import { useBoardStore } from '@/stores/board.store'
import { LoginForm } from '@/components/auth/login-form'
import { Header } from '@/components/board/header'
import { Board } from '@/components/board/board'

function App() {
  const { data, isLoading, login } = useBoardStore()

  useEffect(() => {
    const saved = localStorage.getItem('bp')
    if (saved && !data) {
      login(saved)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: 'hsl(var(--background))' }}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: 'hsl(var(--primary))', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (!data) {
    return <LoginForm />
  }

  return (
    <main className="flex h-screen flex-col" style={{ backgroundColor: 'hsl(var(--background))' }}>
      <Header />
      <div className="flex-1 overflow-hidden">
        <Board />
      </div>
    </main>
  )
}

export default App
