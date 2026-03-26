import { useEffect } from 'react'

const ICON_MAP = {
  success: (
    <svg viewBox="0 0 18 18" fill="none" className="toast-icon">
      <circle cx="9" cy="9" r="9" fill="currentColor" opacity="0.15" />
      <path d="M5.5 9.5L7.5 11.5L12.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 18 18" fill="none" className="toast-icon">
      <circle cx="9" cy="9" r="9" fill="currentColor" opacity="0.15" />
      <path d="M6.5 6.5L11.5 11.5M11.5 6.5L6.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
}

export default function Toast({ message, type = 'success', onClose, duration = 4000 }) {
  useEffect(() => {
    if (!duration) return
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div className="toast-container">
      <div className={`toast toast--${type}`}>
        {ICON_MAP[type]}
        <span className="toast-message">{message}</span>
        <button className="toast-close" onClick={onClose} aria-label="Chiudi">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}
