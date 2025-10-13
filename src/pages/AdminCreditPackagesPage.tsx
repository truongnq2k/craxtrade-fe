import { useEffect, useState } from 'react'
import { DashboardLayout } from '../components/DashboardLayout'
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
    <DashboardLayout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Quản lý gói credits</h1>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Thêm gói mới
        </button>
      </div>
      
      {error && <div className="text-red-600 mb-4">{error}</div>}
      
      {/* Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-medium mb-4">
            {editingItem ? 'Chỉnh sửa gói' : 'Thêm gói mới'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tên gói</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Số credits</label>
              <input
                type="number"
                required
                min="1"
                value={formData.credits}
                onChange={(e) => setFormData({...formData, credits: Number(e.target.value)})}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Giá</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tiền tệ</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({...formData, currency: e.target.value})}
                className="w-full border rounded px-3 py-2"
              >
                <option value="USD">USD</option>
                <option value="VND">VND</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Credits bonus</label>
              <input
                type="number"
                min="0"
                value={formData.bonusCredits}
                onChange={(e) => setFormData({...formData, bonusCredits: Number(e.target.value)})}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Số ngày hiệu lực</label>
              <input
                type="number"
                min="0"
                value={formData.validDays}
                onChange={(e) => setFormData({...formData, validDays: Number(e.target.value)})}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Mô tả</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full border rounded px-3 py-2"
                rows={3}
              />
            </div>
            <div className="md:col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="rounded"
              />
              <label htmlFor="isActive" className="text-sm">Kích hoạt</label>
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                {editingItem ? 'Cập nhật' : 'Thêm'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}
      
      {loading && <div>Đang tải...</div>}
      
      {!loading && (
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-3 py-2">Tên gói</th>
                <th className="px-3 py-2">Credits</th>
                <th className="px-3 py-2">Giá</th>
                <th className="px-3 py-2">Bonus</th>
                <th className="px-3 py-2">Hiệu lực</th>
                <th className="px-3 py-2">Trạng thái</th>
                <th className="px-3 py-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-3 py-2">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      {item.description && (
                        <div className="text-xs text-gray-600">{item.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">{item.credits}</td>
                  <td className="px-3 py-2">{item.price} {item.currency}</td>
                  <td className="px-3 py-2">{item.bonusCredits || 0}</td>
                  <td className="px-3 py-2">{item.validDays || '∞'} ngày</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <button 
                        onClick={() => startEdit(item)}
                        className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                      >
                        Sửa
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  )
}
