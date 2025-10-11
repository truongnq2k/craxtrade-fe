import { useAuth } from '../hooks/useAuth'

export function HomePage() {
  const { isAuthenticated, user, login, logout } = useAuth()

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Welcome</h1>
      <p className="text-gray-600">This is a minimal React + TS + Tailwind + Zustand setup.</p>

      <div className="rounded border bg-white p-4">
        <div className="mb-2 text-sm text-gray-500">Auth state demo</div>
        <div className="flex items-center gap-2 text-sm">
          <span className={isAuthenticated ? 'text-emerald-600' : 'text-rose-600'}>
            {isAuthenticated ? 'Authenticated' : 'Guest'}
          </span>
          {isAuthenticated && (
            <span className="text-gray-400">|</span>
          )}
          {isAuthenticated && (
            <span className="truncate">user: {String(user?.sub ?? 'unknown')}</span>
          )}
        </div>
        <div className="mt-3 flex gap-2">
          <button
            className="px-3 py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={() => {
              const fake =
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
                'eyJzdWIiOiJ1c2VyLTEyMyIsImV4cCI6MjI5MjI5MjIyMiwiaWF0IjoxNjAwMDAwMDAwfQ.' +
                'dummy-signature'
              login(fake)
            }}
          >
            Fake Login
          </button>
          <button
            className="px-3 py-1.5 rounded bg-rose-600 text-white hover:bg-rose-700"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </div>
    </section>
  )
}


