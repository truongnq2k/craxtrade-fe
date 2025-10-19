import { useState } from 'react'
import { createPortal } from 'react-dom'

interface SymbolTimeframeModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (symbol: string, timeframe: string) => void
  initialSymbol?: string
  initialTimeframe?: string
}

const POPULAR_SYMBOLS = [
  'BTCUSDT',
  'ETHUSDT', 
  'BNBUSDT',
  'ADAUSDT',
  'SOLUSDT',
  'XRPUSDT',
  'DOGEUSDT',
  'AVAXUSDT',
  'DOTUSDT',
  'LINKUSDT'
]

const TIMEFRAMES = [
  { value: 'M1', label: '1 Minute' },
  { value: 'M5', label: '5 Minutes' },
  { value: 'M15', label: '15 Minutes' },
  { value: 'H1', label: '1 Hour' },
  { value: 'H4', label: '4 Hours' },
  { value: 'D1', label: '1 Day' }
]

export function SymbolTimeframeModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  initialSymbol = 'BTCUSDT',
  initialTimeframe = 'H1'
}: SymbolTimeframeModalProps) {
  const [symbol, setSymbol] = useState(initialSymbol)
  const [timeframe, setTimeframe] = useState(initialTimeframe)
  const [customSymbol, setCustomSymbol] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const finalSymbol = customSymbol.trim() || symbol
    if (finalSymbol) {
      onConfirm(finalSymbol, timeframe)
      onClose()
    }
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] backdrop-blur-sm">
      <div className="bg-black/90 border border-green-500/50 rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-4 transform transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-green-400 font-mono tracking-wider">
            [SELECT_TRADING_PAIR]
          </h2>
          <button
            onClick={onClose}
            className="text-red-400 hover:text-red-300 font-mono text-lg"
          >
            [X]
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Symbol Selection */}
          <div className="space-y-4">
            <h3 className="text-green-400 text-lg font-mono tracking-wider">[TRADING_SYMBOL]</h3>
            
            {/* Popular Symbols */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {POPULAR_SYMBOLS.map((sym) => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => {
                    setSymbol(sym)
                    setCustomSymbol('')
                  }}
                  className={`px-4 py-2 rounded font-mono text-sm transition-all duration-300 ${
                    symbol === sym && !customSymbol
                      ? 'bg-green-500 text-black border-2 border-green-400'
                      : 'bg-black/50 border border-green-500/50 text-green-400 hover:bg-green-500/20 hover:border-green-400'
                  }`}
                >
                  {sym}
                </button>
              ))}
            </div>

            {/* Custom Symbol Input */}
            <div>
              <label className="text-green-400 text-xs font-mono mb-2 block">CUSTOM_SYMBOL</label>
              <input
                type="text"
                value={customSymbol}
                onChange={(e) => {
                  setCustomSymbol(e.target.value.toUpperCase())
                  setSymbol('')
                }}
                placeholder="Enter custom symbol (e.g., BTCUSDT)"
                className="w-full bg-black/50 border border-green-500/50 rounded px-4 py-3 text-green-400 font-mono placeholder-green-600 focus:outline-none focus:border-green-400 transition-all duration-300"
              />
            </div>
          </div>

          {/* Timeframe Selection */}
          <div className="space-y-4">
            <h3 className="text-green-400 text-lg font-mono tracking-wider">[TIMEFRAME]</h3>
            
            <div className="flex flex-wrap gap-3">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf.value}
                  type="button"
                  onClick={() => setTimeframe(tf.value)}
                  className={`px-4 py-2 rounded font-mono text-sm transition-all duration-300 ${
                    timeframe === tf.value
                      ? 'bg-green-500 text-black border-2 border-green-400'
                      : 'bg-black/50 border border-green-500/50 text-green-400 hover:bg-green-500/20 hover:border-green-400'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>

          {/* Current Selection Display */}
          <div className="bg-green-500/10 border border-green-500/30 rounded p-4">
            <div className="text-green-400 text-sm font-mono">
              <div className="animate-pulse">CURRENT_SELECTION:</div>
              <div className="mt-2">Symbol: <span className="text-green-300">{customSymbol.trim() || symbol}</span></div>
              <div>Timeframe: <span className="text-green-300">{TIMEFRAMES.find(tf => tf.value === timeframe)?.label}</span></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-green-500/50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-red-500/20 border border-red-500/50 text-red-400 font-mono hover:bg-red-500/30 transition-all duration-300 rounded"
            >
              [CANCEL]
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-green-500 text-black font-mono font-bold rounded hover:bg-green-400 transition-all duration-300"
            >
              [CONFIRM]
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
