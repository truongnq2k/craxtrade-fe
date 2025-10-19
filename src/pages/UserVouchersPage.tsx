import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { voucherService } from '../services/voucher.service'

interface MatrixDrop {
  x: number
  y: number
  speed: number
}

export function UserVouchersPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [voucherCode, setVoucherCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [matrixRain, setMatrixRain] = useState<MatrixDrop[]>([])

  // Matrix rain effect
  useEffect(() => {
    const columns = Math.floor(window.innerWidth / 20)
    const drops = Array(columns).fill(0).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight - window.innerHeight,
      speed: Math.random() * 2 + 1
    }))
    setMatrixRain(drops)

    const animateRain = () => {
      setMatrixRain(prev => prev.map(drop => ({
        ...drop,
        y: drop.y > window.innerHeight ? 0 : drop.y + drop.speed
      })))
    }

    const interval = setInterval(animateRain, 50)
    return () => clearInterval(interval)
  }, [])


  async function handleUseVoucher() {
    if (!voucherCode.trim()) {
      setError('Vui lòng nhập mã voucher')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const userId = user?.sub || user?.userId
      if (!userId) {
        setError('[ERROR] Thiếu userId trong token')
        return
      }

      // Use voucher with the provided code
      await voucherService.useVoucher({
        code: voucherCode
      })

      setSuccess('[SUCCESS] Voucher đã được kích hoạt!')
      setVoucherCode('')
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || '[ERROR] Sử dụng voucher thất bại')
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-green-400 font-mono tracking-wider" style={{ textShadow: '0 0 10px #00ff00' }}>
            [VOUCHER_SYSTEM]
          </h1>
          <p className="text-green-600 text-sm font-mono mt-1">
            $ ./activate_quantum_vouchers.sh
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 font-mono hover:bg-red-500/30 transition-all duration-300 rounded"
        >
          [BACK_TO_DASHBOARD]
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="text-red-400 text-sm font-mono bg-red-500/10 border border-red-500/30 rounded px-4 py-3">
          <span className="text-red-500">$</span> {error}
        </div>
      )}

      {/* Success Display */}
      {success && (
        <div className="text-green-400 text-sm font-mono bg-green-500/10 border border-green-500/30 rounded px-4 py-3">
          <span className="text-green-500">$</span> {success}
        </div>
      )}

      {/* Matrix Rain Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        {matrixRain.map((drop, i) => (
          <div
            key={i}
            className="absolute text-green-500 text-xs font-mono opacity-70"
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

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {/* User Vouchers List */}



      {/* Activate Voucher Form */}
      <div className="bg-black/50 border border-green-500/50 rounded-lg p-6">
        <h3 className="text-lg font-bold text-green-400 mb-4 font-mono tracking-wider">
          [ACTIVATE_VOUCHER]
        </h3>
        <p className="text-green-600 text-xs font-mono mb-4">
          $ ./activate_quantum_voucher.sh
        </p>

        <form onSubmit={handleUseVoucher} className="space-y-4">
          <div>
            <label className="text-green-400 text-xs font-mono mb-2 block">VOUCHER_CODE</label>
            <input
              type="text"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              className="w-full bg-black/50 border border-green-500/50 rounded px-4 py-3 text-green-400 font-mono placeholder-green-600 focus:outline-none focus:border-green-400 transition-all duration-300"
              placeholder="ENTER_VOUCHER_CODE"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-green-500 text-black font-mono font-bold rounded hover:bg-green-400 disabled:opacity-50 transition-all duration-300"
          >
            {loading ? '[ACTIVATING...]' : '[ACTIVATE_QUANTUM_VOUCHER]'}
          </button>
        </form>
      </div>

      {/* Terminal Info */}
      <div className="mt-6 text-center">
        <div className="text-xs font-mono text-green-600">
          <div className="animate-pulse">SYSTEM: ONLINE</div>
          <div className="mt-1">ENCRYPTION: QUANTUM</div>
          <div className="mt-1">STATUS: SECURE</div>
        </div>
      </div>

    </div>
  )

}
