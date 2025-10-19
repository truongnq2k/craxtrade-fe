import { useEffect, useState } from 'react'
import { DashboardLayout } from '../components/DashboardLayout'
import { apiFetch } from '../utils/api'
import { voucherService, type Voucher } from '../services/voucher.service'

interface MatrixDrop {
  x: number
  y: number
  speed: number
}

export function AdminVouchersPage() {
  const [items, setItems] = useState<Voucher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<Voucher | null>(null)
  const [matrixRain, setMatrixRain] = useState<MatrixDrop[]>([])
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    value: '0',
    description: '',
    isActive: true
  })

  // Matrix rain effect
  useEffect(() => {
    const columns = Math.floor(window.innerWidth / 30)
    const drops = Array(columns).fill(0).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight - window.innerHeight,
      speed: Math.random() * 1.5 + 0.5
    }))
    setMatrixRain(drops)

    const animateRain = () => {
      setMatrixRain(prev => prev.map(drop => ({
        ...drop,
        y: drop.y > window.innerHeight ? 0 : drop.y + drop.speed
      })))
    }

    const interval = setInterval(animateRain, 100)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    loadVouchers()
  }, [])

  async function loadVouchers() {
    try {
      setLoading(true)
      const res = await apiFetch<{ success: boolean; data: { vouchers: Voucher[] } }>('/api/vouchers')
      const data = res.data?.vouchers || []
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
      code: '',
      name: '',
      value: '0',
      description: '',
      isActive: true
    })
    setEditingItem(null)
    setShowForm(false)
    setSuccess(null)
  }

  function startEdit(item: Voucher) {
    setFormData({
      code: item.code,
      name: item.name || '',
      value: item.value,
      description: item.description || '',
      isActive: item.isActive
    })
    setEditingItem(item)
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      setError(null)
      setSuccess(null)

      if (editingItem) {
        await voucherService.updateVoucher(editingItem.id, formData)
        setSuccess('[SUCCESS] Voucher updated successfully!')
      } else {
        await voucherService.createVoucher(formData)
        setSuccess('[SUCCESS] Voucher created successfully!')
      }
      resetForm()
      loadVouchers()
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Save failed')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('[CONFIRM] Delete this voucher?')) return
    try {
      setError(null)
      setSuccess(null)
      await voucherService.deleteVoucher(id)
      setSuccess('[SUCCESS] Voucher deleted successfully!')
      loadVouchers()
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Delete failed')
    }
  }

  async function handleBulkCreate() {
    try {
      setError(null)
      setSuccess(null)
      const baseCode = formData.code || 'VOUCHER'
      const baseName = formData.name || 'Quantum Voucher'
      
      await voucherService.bulkCreateVouchers(Array(10).fill(0).map((_, i) => ({
        code: `${baseCode}${i + 1}`,
        name: `${baseName} #${i + 1}`,
        description: formData.description,
        value: formData.value.toString(),
        isActive: formData.isActive
      })))
      setSuccess('[SUCCESS] Bulk vouchers created successfully!')
      resetForm()
      loadVouchers()
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Bulk create failed')
    }
  }

  function getValueColor(value: string) {
    const numValue = Number(value)
    if (numValue >= 1000) return 'text-purple-400'
    if (numValue >= 500) return 'text-blue-400'
    if (numValue >= 100) return 'text-green-400'
    return 'text-green-300'
  }

  function getVoucherIcon(value: string) {
    const numValue = Number(value)
    if (numValue >= 1000) return '💎'
    if (numValue >= 500) return '💎'
    if (numValue >= 100) return '💵'
    return '🎫'
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-green-400 font-mono tracking-wider" style={{ textShadow: '0 0 10px #00ff00' }}>
              [VOUCHER_ADMIN_PANEL]
            </h1>
            <p className="text-green-600 text-sm font-mono mt-1">
              $ ./manage_quantum_vouchers.sh
            </p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={handleBulkCreate}
              className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 text-purple-400 font-mono hover:bg-purple-500/30 transition-all duration-300 rounded"
            >
              [BULK_CREATE]
            </button>
            <button 
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-400 font-mono hover:bg-green-500/30 transition-all duration-300 rounded"
            >
              [CREATE_VOUCHER]
            </button>
          </div>
        </div>

        {/* Error/Success Display */}
        {error && (
          <div className="text-red-400 text-sm font-mono bg-red-500/10 border border-red-500/30 rounded px-4 py-3">
            <span className="text-red-500">$</span> {error}
          </div>
        )}
        
        {success && (
          <div className="text-green-400 text-sm font-mono bg-green-500/10 border border-green-500/30 rounded px-4 py-3">
            <span className="text-green-500">$</span> {success}
          </div>
        )}

        {/* Matrix Rain Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
          {matrixRain.map((drop, i) => (
            <div
              key={i}
              className="absolute text-green-500 text-xs font-mono opacity-50"
              style={{
                left: `${drop.x}px`,
                top: `${drop.y}px`,
                transform: `translateY(${drop.y}px)`
              }}
            >
              {String.fromCharCode(0x30A0 + Math.random() * 96)}
            </div>
          ))}
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-black/90 border border-green-500/50 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-green-400 font-mono tracking-wider">
                [{editingItem ? 'EDIT' : 'CREATE'}_VOUCHER]
              </h2>
              <button
                onClick={resetForm}
                className="text-red-400 font-mono text-sm hover:text-red-300 transition-colors"
              >
                [CLOSE]
              </button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-green-400 text-xs font-mono mb-2 block">VOUCHER_CODE</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  className="w-full bg-black/50 border border-green-500/50 rounded px-4 py-3 text-green-400 font-mono placeholder-green-600 focus:outline-none focus:border-green-400 transition-all duration-300"
                  placeholder="VOUCHER_CODE"
                />
              </div>
              <div>
                <label className="text-green-400 text-xs font-mono mb-2 block">VOUCHER_NAME</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-black/50 border border-green-500/50 rounded px-4 py-3 text-green-400 font-mono placeholder-green-600 focus:outline-none focus:border-green-400 transition-all duration-300"
                  placeholder="Quantum Voucher"
                />
              </div>
              <div>
                <label className="text-green-400 text-xs font-mono mb-2 block">VOUCHER_VALUE</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  className="w-full bg-black/50 border border-green-500/50 rounded px-4 py-3 text-green-400 font-mono placeholder-green-600 focus:outline-none focus:border-green-400 transition-all duration-300"
                  placeholder="100"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="w-4 h-4 bg-black/50 border border-green-500/50 rounded text-green-400 focus:ring-green-500"
                />
                <label htmlFor="isActive" className="text-green-400 text-sm font-mono ml-2">
                  ACTIVE_STATUS
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="text-green-400 text-xs font-mono mb-2 block">DESCRIPTION</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-black/50 border border-green-500/50 rounded px-4 py-3 text-green-400 font-mono placeholder-green-600 focus:outline-none focus:border-green-400 transition-all duration-300"
                  rows={3}
                  placeholder="Voucher description..."
                />
              </div>
              <div className="md:col-span-2 flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-black font-mono font-bold rounded hover:bg-green-400 transition-all duration-300"
                >
                  [{editingItem ? 'UPDATE' : 'CREATE'}_VOUCHER]
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 font-mono hover:bg-red-500/30 transition-all duration-300 rounded"
                >
                  [CANCEL]
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Loading */}
        {loading && (
          <div className="text-center py-8 text-green-600">
            <div className="text-sm font-mono animate-pulse">
              $ ./loading_vouchers.sh
            </div>
            <div className="text-xs mt-2">
              Retrieving voucher data from quantum database...
            </div>
          </div>
        )}
        
        {/* Vouchers Table */}
        {!loading && (
          <div className="bg-black/90 border border-green-500/30 rounded-lg p-6">
            <div className="text-green-600 text-xs font-mono mb-4 animate-pulse">
              $ ./display_voucher_database.sh
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-green-500/30">
                  <tr>
                    <th className="px-4 py-3 text-left text-green-400 font-mono text-xs">CODE</th>
                    <th className="px-4 py-3 text-left text-green-400 font-mono text-xs">NAME</th>
                    <th className="px-4 py-3 text-left text-green-400 font-mono text-xs">VALUE</th>
                    <th className="px-4 py-3 text-left text-green-400 font-mono text-xs">STATUS</th>
                    <th className="px-4 py-3 text-left text-green-400 font-mono text-xs">USER</th>
                    <th className="px-4 py-3 text-left text-green-400 font-mono text-xs">CREATED</th>
                    <th className="px-4 py-3 text-left text-green-400 font-mono text-xs">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-green-500/20 hover:bg-green-500/5 transition-all duration-300">
                      <td className="px-4 py-3">
                        <span className="text-green-400 font-mono font-bold">{item.code}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-green-300 font-mono text-sm">
                          {item.name || 'Unnamed Voucher'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-mono font-bold ${getValueColor(item.value)}`}>
                          ${getVoucherIcon(item.value)} ${item.value}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-mono px-2 py-1 rounded ${
                          item.isActive ? 'text-green-400 bg-green-500/20' : 'text-red-400 bg-red-500/20'
                        }`}>
                          [{item.isActive ? 'ACTIVE' : 'INACTIVE'}]
                        </span>
                        {item.isUsed && (
                          <span className="text-xs font-mono px-2 py-1 rounded text-yellow-400 bg-yellow-500/20 ml-1">
                            [USED]
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-green-500 font-mono text-xs">
                          {item.userId ? `USER_${item.userId.slice(0, 8)}` : 'NOT_ASSIGNED'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-green-600 font-mono text-xs">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button 
                            onClick={() => startEdit(item)}
                            className="px-2 py-1 bg-blue-500/20 border border-blue-500/50 text-blue-400 font-mono text-xs hover:bg-blue-500/30 transition-all duration-300 rounded"
                          >
                            [EDIT]
                          </button>
                          {!item.isUsed && (
                            <button 
                              onClick={() => handleDelete(item.id)}
                              className="px-2 py-1 bg-red-500/20 border border-red-500/50 text-red-400 font-mono text-xs hover:bg-red-500/30 transition-all duration-300 rounded"
                            >
                              [DELETE]
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {items.length === 0 && (
              <div className="text-center py-12 text-green-600">
                <div className="text-8xl mb-4">🎫</div>
                <div className="text-sm font-mono mb-2">
                  $ ./no_vouchers_found.sh
                </div>
                <div className="text-xs mt-2">
                  No vouchers found
                </div>
              </div>
            )}

            {/* Terminal Info */}
            <div className="mt-6 text-center">
              <div className="text-xs font-mono text-green-600">
                <div className="animate-pulse">DATABASE: CONNECTED</div>
                <div className="mt-1">ENCRYPTION: QUANTUM</div>
                <div className="mt-1">TOTAL_VOUCHERS: {items.length}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
