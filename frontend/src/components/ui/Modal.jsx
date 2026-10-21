import { X } from 'lucide-react'
import { useEffect } from 'react'

/**
 * Modal — dialog overlay.
 * Props:
 *   open: boolean
 *   onClose: fn
 *   title: string
 *   children: ReactNode
 *   size?: 'sm' | 'md' | 'lg' | 'xl'
 *   footer?: ReactNode — tombol aksi custom di bagian bawah
 */
export default function Modal({ open, onClose, title, children, size = 'md', footer }) {
  // Blokir scroll body saat modal terbuka
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Tutup dengan tombol Escape
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose?.() }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const sizeMap = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div className={`relative w-full ${sizeMap[size]} bg-white rounded-2xl shadow-xl animate-scale-in`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <h3 className="font-semibold text-slate-900 text-base" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Tutup modal"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
        {/* Body */}
        <div className="px-6 py-5">{children}</div>
        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-slate-50 rounded-b-2xl"
            style={{ borderColor: 'var(--color-border)' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * ConfirmModal — modal konfirmasi hapus/aksi berbahaya.
 */
export function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel = 'Hapus', loading = false }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm"
      footer={
        <>
          <button onClick={onClose} className="btn btn-secondary" disabled={loading}>Batal</button>
          <button onClick={onConfirm} className="btn btn-danger" disabled={loading}>
            {loading
              ? <><span className="w-3.5 h-3.5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" /> Memproses...</>
              : confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm text-slate-600">{message}</p>
    </Modal>
  )
}
