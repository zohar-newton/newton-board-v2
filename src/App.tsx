import { useBoardStore } from '@/stores/board.store'
import { LoginForm } from '@/components/auth/login-form'
import { Header } from '@/components/board/header'
import { Board } from '@/components/board/board'

function App() {
  const data = useBoardStore((s) => s.data)

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
