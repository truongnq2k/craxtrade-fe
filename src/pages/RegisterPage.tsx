import { BlankLayout } from '../components/BlankLayout'
import { useState } from 'react'
import { apiFetch, ApiPaths } from '../utils/api'
import { useNavigate } from 'react-router-dom'

export function RegisterPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await apiFetch<{ success: boolean }>(ApiPaths.signup, {
        method: 'POST',
        body: { name, email, password },
        auth: false,
      })
      navigate('/login')
    } catch (err: any) {
      setError(err.message || 'Register failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <BlankLayout>
      <div className="w-full max-w-sm bg-white rounded-lg shadow p-6">
        <h1 className="text-xl font-semibold mb-4">Đăng ký</h1>
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            placeholder="Họ tên"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            className="w-full border rounded px-3 py-2"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button disabled={loading} type="submit" className="w-full bg-black text-white rounded px-3 py-2 disabled:opacity-50">
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>
      </div>
    </BlankLayout>
  )
}


