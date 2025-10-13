import { useState } from 'react'
import { DashboardLayout } from '../components/DashboardLayout'
import { apiFetch } from '../utils/api'
import { useAuthStore } from '../store/auth'

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
}

export function UserVouchersPage() {
  const { user } = useAuthStore()
  const [voucherCode, setVoucherCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleUseVoucher() {
    if (!voucherCode.trim()) {
      setError('Vui lòng nhập mã voucher')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // First get voucher details
      const voucherRes = await apiFetch<{ success: boolean; data: Voucher }>(`/api/vouchers/code/${voucherCode}`)
      const voucher = voucherRes.data

      if (!voucher.isActive) {
        setError('Voucher không còn hoạt động')
        return
      }

      if (voucher.usedCount >= voucher.maxUses) {
        setError('Voucher đã hết lượt sử dụng')
        return
      }

      const now = new Date()
      const validFrom = new Date(voucher.validFrom)
      const validTo = new Date(voucher.validTo)

      if (now < validFrom || now > validTo) {
        setError('Voucher đã hết hạn')
        return
      }

      // Use the voucher
      await apiFetch(`/api/vouchers/${voucher.id}/use`, {
        method: 'POST',
        body: { userId: user?.sub || user?.id }
      })

      setSuccess(`Sử dụng voucher thành công! Nhận được ${voucher.credits} credits`)
      setVoucherCode('')
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Sử dụng voucher thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-semibold mb-4">Voucher</h1>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-medium mb-4">Sử dụng voucher</h2>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 border rounded px-3 py-2"
            placeholder="Nhập mã voucher"
            value={voucherCode}
            onChange={(e) => setVoucherCode(e.target.value)}
          />
          <button
            onClick={handleUseVoucher}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : 'Sử dụng'}
          </button>
        </div>
        {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
        {success && <div className="text-green-600 text-sm mt-2">{success}</div>}
      </div>

      <div className="bg-gray-50 p-4 rounded">
        <h3 className="font-medium mb-2">Hướng dẫn sử dụng voucher:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Nhập mã voucher vào ô trên</li>
          <li>• Nhấn "Sử dụng" để kích hoạt voucher</li>
          <li>• Credits sẽ được cộng vào tài khoản của bạn</li>
          <li>• Mỗi voucher chỉ có thể sử dụng một lần</li>
        </ul>
      </div>
    </DashboardLayout>
  )
}
