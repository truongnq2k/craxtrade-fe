import { createPortal } from 'react-dom'

interface ReasoningModalProps {
  reasoning: string | null
  onClose: () => void
}

export function ReasoningModal({ reasoning, onClose }: ReasoningModalProps) {
  if (!reasoning) return null

  return createPortal(
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
      <div className="bg-black/90 border border-green-500/50 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-green-400 font-mono">[SIGNAL_REASONING]</h3>
          <button
            onClick={onClose}
            className="text-red-400 hover:text-red-300 text-xl font-mono"
          >
            [X]
          </button>
        </div>
        <div className="text-green-300 font-mono text-sm whitespace-pre-wrap break-words">
          {reasoning}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-400 font-mono hover:bg-green-500/30 transition-all duration-300 rounded"
          >
            [CLOSE]
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
