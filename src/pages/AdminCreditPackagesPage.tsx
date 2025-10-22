import { useEffect, useState } from 'react'
import { apiFetch } from '../utils/api'

type CreditPackage = {
  id: string
  name: string
  credits: number
  price: number
  currency: string
  description?: string
  isActive: boolean
  validDays?: number
  bonusCredits?: number
}

export function AdminCreditPackagesPage() {
  const [items, setItems] = useState<CreditPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<CreditPackage | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    credits: 0,
    price: 0,
    currency: 'USD',
    description: '',
    isActive: true,
    validDays: 0,
    bonusCredits: 0
  })

  useEffect(() => {
    loadPackages()
  }, [])

  async function loadPackages() {
    try {
      setLoading(true)
      const res = await apiFetch<{ success: boolean; data: { packages: CreditPackage[] } }>('/api/credit-packages')
      const data = res.data?.packages || []
      setItems(data)
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Load failed')
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setFormData({
      name: '',
      credits: 0,
      price: 0,
      currency: 'USD',
      description: '',
      isActive: true,
      validDays: 0,
      bonusCredits: 0
    })
    setEditingItem(null)
    setShowForm(false)
  }

  function startEdit(item: CreditPackage) {
    setFormData({
      name: item.name,
      credits: item.credits,
      price: item.price,
      currency: item.currency,
      description: item.description || '',
      isActive: item.isActive,
      validDays: item.validDays || 0,
      bonusCredits: item.bonusCredits || 0
    })
    setEditingItem(item)
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (editingItem) {
        await apiFetch(`/api/credit-packages/${editingItem.id}`, {
          method: 'PUT',
          body: formData
        })
      } else {
        await apiFetch('/api/credit-packages', {
          method: 'POST',
          body: formData
        })
      }
      resetForm()
      loadPackages()
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Save failed')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bạn có chắc muốn xóa gói này?')) return
    try {
      await apiFetch(`/api/credit-packages/${id}`, { method: 'DELETE' })
      loadPackages()
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Delete failed')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-black text-green-400 font-mono tracking-wider mb-6" style={{ textShadow: '0 0 10px #00ff00' }}>
        [CREDIT_PACKAGES]
      </h1>
      <p className="text-green-600 text-sm font-mono mb-4">
        $ ./manage_credit_system.sh
      </p>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xs font-mono text-green-600 uppercase tracking-wider">
          {'>'} PACKAGE_MANAGEMENT
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-500/20 text-green-300 border border-green-500/50 px-4 py-2 rounded hover:bg-green-500/30 transition-all duration-300 font-mono text-sm uppercase tracking-wide"
        >
          [CREATE_PACKAGE]
        </button>
      </div>

      {error && <div className="text-red-400 mb-4">{error}</div>}

      {/* Form */}
      {showForm && (
        <div className="bg-black/50 border border-green-500/30 rounded-lg p-6 backdrop-blur-sm mb-6">
          <h2 className="text-lg font-medium mb-4 text-green-400">
            {editingItem ? 'Chỉnh sửa gói' : 'Thêm gói mới'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-green-400">Tên gói</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-black/50 border border-green-500/50 rounded px-3 py-2 text-green-400 placeholder-green-600 focus:border-green-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-green-400">Số credits</label>
              <input
                type="number"
                required
                min="1"
                value={formData.credits}
                onChange={(e) => setFormData({...formData, credits: Number(e.target.value)})}
                className="w-full bg-black/50 border border-green-500/50 rounded px-3 py-2 text-green-400 placeholder-green-600 focus:border-green-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-green-400">Giá</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                className="w-full bg-black/50 border border-green-500/50 rounded px-3 py-2 text-green-400 placeholder-green-600 focus:border-green-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-green-400">Tiền tệ</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({...formData, currency: e.target.value})}
                className="w-full bg-black/50 border border-green-500/50 rounded px-3 py-2 text-green-400 focus:border-green-400 focus:outline-none"
              >
                <option value="USD">USD</option>
                <option value="VND">VND</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-green-400 font-mono text-xs uppercase tracking-wide">CREDITS_BONUS</label>
              <input
                type="number"
                min="0"
                value={formData.bonusCredits}
                onChange={(e) => setFormData({...formData, bonusCredits: Number(e.target.value)})}
                className="w-full bg-black/50 border border-green-500/50 rounded px-3 py-2 text-green-400 placeholder-green-600 focus:border-green-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-green-400 font-mono text-xs uppercase tracking-wide">VALIDITY_DAYS</label>
              <input
                type="number"
                min="0"
                value={formData.validDays}
                onChange={(e) => setFormData({...formData, validDays: Number(e.target.value)})}
                className="w-full bg-black/50 border border-green-500/50 rounded px-3 py-2 text-green-400 placeholder-green-600 focus:border-green-400 focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-green-400 font-mono text-xs uppercase tracking-wide">DESCRIPTION</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-black/50 border border-green-500/50 rounded px-3 py-2 text-green-400 placeholder-green-600 focus:border-green-400 focus:outline-none"
                rows={3}
              />
            </div>
            <div className="md:col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="rounded border-green-500/50 bg-black/50 text-green-400 focus:ring-green-500/50"
              />
              <label htmlFor="isActive" className="text-sm text-green-400 font-mono text-xs uppercase tracking-wide">ACTIVE_STATUS</label>
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="bg-green-500/20 text-green-300 border border-green-500/50 px-4 py-2 rounded hover:bg-green-500/30 transition-all duration-300 font-mono text-sm uppercase tracking-wide"
              >
                [{editingItem ? 'UPDATE' : 'CREATE'}]
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500/20 text-gray-300 border border-gray-500/50 px-4 py-2 rounded hover:bg-gray-500/30 transition-all duration-300 font-mono text-sm uppercase tracking-wide"
              >
                [CANCEL]
              </button>
            </div>
          </form>
        </div>
      )}
      
      {loading && (
        <div className="text-center py-8">
          <div className="text-green-400 font-mono animate-pulse mb-2">
            $ ./loading_credit_packages.sh
          </div>
          <div className="text-green-600 text-sm font-mono">
            Retrieving credit packages from quantum database...
          </div>
        </div>
      )}

      {!loading && (
        <div className="overflow-x-auto border border-green-500/30 rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-black/70 text-left">
              <tr>
                <th className="px-3 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider border-b border-green-500/30">PACKAGE_NAME</th>
                <th className="px-3 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider border-b border-green-500/30">CREDITS</th>
                <th className="px-3 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider border-b border-green-500/30">PRICE</th>
                <th className="px-3 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider border-b border-green-500/30">BONUS</th>
                <th className="px-3 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider border-b border-green-500/30">VALIDITY</th>
                <th className="px-3 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider border-b border-green-500/30">STATUS</th>
                <th className="px-3 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider border-b border-green-500/30">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="text-green-300">
              {items.map((item) => (
                <tr key={item.id} className="border-t border-green-500/20 hover:bg-black/50">
                  <td className="px-3 py-2">
                    <div>
                      <div className="font-medium text-green-300">{item.name}</div>
                      {item.description && (
                        <div className="text-xs text-green-600">{item.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-green-400">{item.credits}</td>
                  <td className="px-3 py-2 text-green-400">{item.price} <span className="text-green-500">{item.currency}</span></td>
                  <td className="px-3 py-2 text-green-400">{item.bonusCredits || 0}</td>
                  <td className="px-3 py-2 text-green-400">{item.validDays || '∞'} ngày</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded text-xs border ${
                      item.isActive
                        ? 'bg-green-500/30 text-green-300 border-green-500/30'
                        : 'bg-red-500/30 text-red-300 border-red-500/30'
                    }`}>
                      {item.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEdit(item)}
                        className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs font-mono border border-blue-500/50 hover:bg-blue-500/30 transition-all duration-300 uppercase tracking-wide"
                      >
                        [EDIT]
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-500/20 text-red-300 px-2 py-1 rounded text-xs font-mono border border-red-500/50 hover:bg-red-500/30 transition-all duration-300 uppercase tracking-wide"
                      >
                        [DELETE]
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Empty State */}
          {items.length === 0 && (
            <div className="text-center py-12 text-green-600">
              <div className="text-8xl mb-4">💳</div>
              <div className="text-sm font-mono mb-2 animate-pulse">
                $ ./no_credit_packages_found.sh
              </div>
              <div className="text-xs mt-2 text-green-500">
                No credit packages available. Create the first package to get started!
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
