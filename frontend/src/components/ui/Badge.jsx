import { getExpiryBadgeClass, getExpiryStatus } from '../../utils/helpers'
import { Clock } from 'lucide-react'

/**
 * ExpiryBadge — menampilkan status kadaluarsa batch.
 * Props:
 *   expiryDate: string (YYYY-MM-DD)
 *   showDays?: boolean — tampilkan sisa hari
 */
export function ExpiryBadge({ expiryDate, showDays = false }) {
  const { status, label, days } = getExpiryStatus(expiryDate)
  const cls = getExpiryBadgeClass(status)

  return (
    <span className={cls}>
      {status !== 'safe' && <Clock className="w-3 h-3" />}
      {label}
      {showDays && days !== null && (
        <span className="ml-1 opacity-75">
          {days < 0 ? `(${Math.abs(days)}h lalu)` : `(${days}h lagi)`}
        </span>
      )}
    </span>
  )
}

/**
 * StatusBadge — badge untuk status user: active, inactive, pending.
 */
export function StatusBadge({ status }) {
  const map = {
    active:   { cls: 'badge badge-active',   label: 'Aktif' },
    inactive: { cls: 'badge badge-inactive', label: 'Nonaktif' },
    pending:  { cls: 'badge badge-pending',  label: 'Pending' },
  }
  const { cls, label } = map[status] ?? { cls: 'badge', label: status }
  return <span className={cls}>{label}</span>
}

/**
 * RoleBadge — badge untuk role user: admin, user.
 */
export function RoleBadge({ role }) {
  const map = {
    admin: { cls: 'badge badge-admin', label: 'Admin' },
    user:  { cls: 'badge badge-user',  label: 'User Gudang' },
  }
  const { cls, label } = map[role] ?? { cls: 'badge', label: role }
  return <span className={cls}>{label}</span>
}
