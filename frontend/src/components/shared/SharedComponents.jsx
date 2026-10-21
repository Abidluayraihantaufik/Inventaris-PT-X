import { Search, X } from 'lucide-react'

/**
 * SearchBar — input pencarian dengan tombol clear.
 * Props:
 *   value: string
 *   onChange: fn(value)
 *   placeholder?: string
 *   className?: string
 */
export function SearchBar({ value, onChange, placeholder = 'Cari...', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="form-input"
        style={{ paddingLeft: '2.25rem', paddingRight: value ? '2.25rem' : '1rem' }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Hapus pencarian"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}

/**
 * EmptyState — tampilan ketika data kosong.
 */
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <Icon className="w-7 h-7 text-slate-400" />
        </div>
      )}
      <h3 className="font-semibold text-slate-700 mb-1.5">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  )
}

/**
 * Skeleton — loading placeholder.
 */
export function Skeleton({ className = 'h-4 w-full' }) {
  return <div className={`skeleton ${className}`} />
}

/**
 * StatCard — kartu statistik dashboard.
 * Props:
 *   label, value, icon, color, trend?
 */
export function StatCard({ label, value, icon: Icon, bgColor = '#f0fdf4', iconColor = '#166534', suffix = '' }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bgColor }}>
        <Icon className="w-5 h-5" style={{ color: iconColor }} />
      </div>
      <div className="min-w-0">
        <p className="stat-value">{value}<span className="text-sm font-normal text-slate-400 ml-1">{suffix}</span></p>
        <p className="stat-label">{label}</p>
      </div>
    </div>
  )
}

/**
 * PageHeader — header standar halaman dengan judul dan slot aksi.
 */
export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}

/**
 * Pagination — navigasi halaman untuk data tabel.
 */
export function Pagination({ meta, onPageChange }) {
  if (!meta || meta.last_page <= 1) return null

  const { current_page, last_page, from, to, total } = meta

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
      <p className="text-sm text-slate-500">
        Menampilkan <strong>{from}–{to}</strong> dari <strong>{total}</strong> data
      </p>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(current_page - 1)}
          disabled={current_page === 1}
          className="btn btn-secondary btn-sm"
        >
          ← Sebelumnya
        </button>
        <span className="px-3 py-1.5 text-sm font-medium text-slate-700">
          {current_page} / {last_page}
        </span>
        <button
          onClick={() => onPageChange(current_page + 1)}
          disabled={current_page === last_page}
          className="btn btn-secondary btn-sm"
        >
          Berikutnya →
        </button>
      </div>
    </div>
  )
}
