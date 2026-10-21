import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react'

const variants = {
  success: { cls: 'alert-success', Icon: CheckCircle },
  warning: { cls: 'alert-warning', Icon: AlertCircle },
  error:   { cls: 'alert-error',   Icon: XCircle },
  info:    { cls: 'alert-info',    Icon: Info },
}

/**
 * Alert — komponen pesan notifikasi.
 * Props:
 *   type: 'success' | 'warning' | 'error' | 'info'
 *   message: string
 *   onClose?: fn — tampilkan tombol close
 *   className?: string
 */
export default function Alert({ type = 'info', message, onClose, className = '' }) {
  if (!message) return null
  const { cls, Icon } = variants[type] ?? variants.info

  return (
    <div className={`alert ${cls} animate-fade-in ${className}`} role="alert">
      <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <span className="flex-1 text-sm">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity ml-2"
          aria-label="Tutup notifikasi"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
