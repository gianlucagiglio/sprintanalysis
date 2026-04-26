import { AlertTriangle, Info, CheckCircle, XCircle, X } from 'lucide-react'
import { useEffect } from 'react'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  type?: 'danger' | 'warning' | 'info' | 'success'
  confirmText?: string
  cancelText?: string
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'warning',
  confirmText = 'Conferma',
  cancelText = 'Annulla',
}: ConfirmDialogProps) {
  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const iconConfig = {
    danger: { Icon: XCircle, color: 'var(--danger)', bgColor: 'var(--danger-bg)' },
    warning: { Icon: AlertTriangle, color: 'var(--warning)', bgColor: 'var(--warning-bg)' },
    info: { Icon: Info, color: 'var(--accent-primary)', bgColor: 'var(--accent-subtle)' },
    success: { Icon: CheckCircle, color: 'var(--success)', bgColor: 'var(--success-bg)' },
  }

  const { Icon, color, bgColor } = iconConfig[type]

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 modal-overlay"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-2xl shadow-2xl max-w-md w-full pointer-events-auto modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Icon */}
          <div className="p-6 pb-4">
            <div className="flex items-start gap-4">
              <div
                className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: bgColor }}
              >
                <Icon size={24} style={{ color }} />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  {title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {message}
                </p>
              </div>

              <button
                onClick={onClose}
                className="flex-shrink-0 p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors rounded-lg hover:bg-[var(--bg-hover)]"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={onClose}
              className="btn btn-secondary flex-1"
              autoFocus
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className={`btn flex-1 ${
                type === 'danger'
                  ? 'bg-[var(--danger)] hover:bg-[#dc2626] text-white'
                  : 'btn-primary'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
