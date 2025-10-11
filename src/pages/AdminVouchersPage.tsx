import { useEffect, useState } from 'react'
import { DashboardLayout } from '../components/DashboardLayout'
import { apiFetch } from '../utils/api'

type Voucher = {
  id: string
  code: string
  credits: number
  type: string
  value?: number
  description?: string
  isActive: boolean
  maxUses: number
  usedCount: number
  validFrom: string
  validTo: string
  createdAt: string
}

export function AdminVouchersPage() {
  const [items, setItems] = useState<Voucher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<Voucher | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    credits: 0,
    type: 'CREDIT',
    value: 0,
    description: '',
    isActive: true,
    maxUses: 1,
    validFrom: '',
    validTo: '',
    maxUsesPerUser: 1
  })

  useEffect(() => {
    loadVouchers()
  }, [])

  async function loadVouchers() {
    try {
      setLoading(true)
      const res = await apiFetch<{ success: boolean; data: any }>('/api/vouchers')
      const data = (res as any).data?.vouchers || (res as any).data || []
      setItems(data)
    } catch (err: any) {
      setError(err.message || 'Load failed')
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setFormData({
      code: '',
      credits: 0,
      type: 'CREDIT',
      value: 0,
      description: '',
      isActive: true,
      maxUses: 1,
      validFrom: '',
      validTo: '',
      maxUsesPerUser: 1
    })
    setEditingItem(null)
    setShowForm(false)
  }

  function startEdit(item: Voucher) {
    setFormData({
      code: item.code,
      credits: item.credits,
      type: item.type,
      value: item.value || 0,
      description: item.description || '',
      isActive: item.isActive,
      maxUses: item.maxUses,
      validFrom: item.validFrom.split('T')[0],
      validTo: item.validTo.split('T')[0],
      maxUsesPerUser: 1
    })
    setEditingItem(item)
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const submitData = {
        ...formData,
        validFrom: formData.validFrom ? new Date(formData.validFrom).toISOString() : undefined,
        validTo: formData.validTo ? new Date(formData.validTo).toISOString() : undefined
      }

      if (editingItem) {
        await apiFetch(`/api/vouchers/${editingItem.id}`, {
          method: 'PUT',
          body: submitData
        })
      } else {
        await apiFetch('/api/vouchers', {
          method: 'POST',
          body: submitData
        })
      }
      resetForm()
      loadVouchers()
    } catch (err: any) {
      setError(err.message || 'Save failed')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bạn có chắc muốn xóa voucher này?')) return
    try {
      await apiFetch(`/api/vouchers/${id}`, { method: 'DELETE' })
      loadVouchers()
    } catch (err: any) {
      setError(err.message || 'Delete failed')
    }
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Quản lý voucher</h1>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Thêm voucher mới
        </button>
      </div>
      
      {error && <div className="text-red-600 mb-4">{error}</div>}
      
      {/* Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-medium mb-4">
            {editingItem ? 'Chỉnh sửa voucher' : 'Thêm voucher mới'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Mã voucher</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
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
              <label className="block text-sm font-medium mb-1">Loại</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full border rounded px-3 py-2"
              >
                <option value="CREDIT">Credit</option>
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED">Fixed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Giá trị</label>
              <input
                type="number"
                min="0"
                value={formData.value}
                onChange={(e) => setFormData({...formData, value: Number(e.target.value)})}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Số lần sử dụng tối đa</label>
              <input
                type="number"
                required
                min="1"
                value={formData.maxUses}
                onChange={(e) => setFormData({...formData, maxUses: Number(e.target.value)})}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hiệu lực từ</label>
              <input
                type="date"
                value={formData.validFrom}
                onChange={(e) => setFormData({...formData, validFrom: e.target.value})}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hiệu lực đến</label>
              <input
                type="date"
                value={formData.validTo}
                onChange={(e) => setFormData({...formData, validTo: e.target.value})}
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
                <th className="px-3 py-2">Mã</th>
                <th className="px-3 py-2">Credits</th>
                <th className="px-3 py-2">Loại</th>
                <th className="px-3 py-2">Đã sử dụng</th>
                <th className="px-3 py-2">Hiệu lực</th>
                <th className="px-3 py-2">Trạng thái</th>
                <th className="px-3 py-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-3 py-2 font-medium">{item.code}</td>
                  <td className="px-3 py-2">{item.credits}</td>
                  <td className="px-3 py-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {item.type}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {item.usedCount} / {item.maxUses}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    <div>{new Date(item.validFrom).toLocaleDateString()}</div>
                    <div>đến {new Date(item.validTo).toLocaleDateString()}</div>
                  </td>
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
