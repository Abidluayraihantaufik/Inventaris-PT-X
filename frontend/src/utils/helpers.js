import { format, parseISO, differenceInDays, isAfter, isBefore } from 'date-fns'
import { id } from 'date-fns/locale'

// ─── Format Tanggal ───────────────────────────────────────────────────────

/**
 * Format tanggal menjadi "1 Sep 2026"
 */
export function formatDate(dateStr) {
  if (!dateStr) return '-'
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr
    return format(date, 'd MMM yyyy', { locale: id })
  } catch {
    return dateStr
  }
}

/**
 * Format tanggal + jam menjadi "1 Sep 2026, 14:30"
 */
export function formatDateTime(dateStr) {
  if (!dateStr) return '-'
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr
    return format(date, 'd MMM yyyy, HH:mm', { locale: id })
  } catch {
    return dateStr
  }
}

/**
 * Format untuk input type="date" (YYYY-MM-DD)
 */
export function toInputDate(dateStr) {
  if (!dateStr) return ''
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr
    return format(date, 'yyyy-MM-dd')
  } catch {
    return ''
  }
}

// ─── Status Kadaluarsa (PRD Section 4.6) ─────────────────────────────────

/**
 * Hitung status kadaluarsa batch
 * @returns { status, label, days }
 */
export function getExpiryStatus(expiryDateStr) {
  if (!expiryDateStr) return { status: 'safe', label: 'Aman', days: null }

  const today    = new Date()
  const expiry   = typeof expiryDateStr === 'string' ? parseISO(expiryDateStr) : expiryDateStr
  const days     = differenceInDays(expiry, today)

  if (days < 0)        return { status: 'expired',  label: 'Expired',    days }
  if (days < 30)       return { status: 'critical', label: 'Kritis',     days }
  if (days <= 60)      return { status: 'warning',  label: 'Perhatian',  days }
  return                      { status: 'safe',     label: 'Aman',       days }
}

/**
 * CSS class badge untuk status kadaluarsa
 */
export function getExpiryBadgeClass(status) {
  const map = {
    safe:     'badge badge-safe',
    warning:  'badge badge-warning',
    critical: 'badge badge-critical',
    expired:  'badge badge-expired',
  }
  return map[status] ?? 'badge'
}

// ─── Format Angka ─────────────────────────────────────────────────────────

/**
 * Format angka dengan pemisah ribuan: 1000 → "1.000"
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return '0'
  return Number(num).toLocaleString('id-ID')
}

/**
 * Format jumlah stok dengan satuan: 150 L
 */
export function formatStock(qty, unit) {
  return `${formatNumber(qty)} ${unit ?? ''}`
}

// ─── Error Message dari Axios ─────────────────────────────────────────────

/**
 * Ekstrak pesan error dari response Laravel
 */
export function getErrorMessage(error) {
  if (error?.response?.data?.message) {
    return error.response.data.message
  }
  if (error?.response?.data?.errors) {
    const errors = error.response.data.errors
    const firstKey = Object.keys(errors)[0]
    return errors[firstKey][0]
  }
  if (error?.message) return error.message
  return 'Terjadi kesalahan. Coba lagi.'
}

/**
 * Ekstrak semua validation errors dari Laravel response
 * @returns { fieldName: 'error message', ... }
 */
export function getValidationErrors(error) {
  return error?.response?.data?.errors ?? {}
}

// ─── Warna untuk Charts (Recharts) ───────────────────────────────────────
export const CHART_COLORS = [
  '#166534', // primary
  '#84cc16', // accent/lime
  '#0ea5e9', // sky
  '#eab308', // warning
  '#a855f7', // purple
  '#f97316', // orange
]

// ─── Role & Status Label ──────────────────────────────────────────────────
export function getRoleLabel(role) {
  return role === 'admin' ? 'Admin' : 'User Gudang'
}

export function getStatusLabel(status) {
  const map = { active: 'Aktif', inactive: 'Nonaktif', pending: 'Pending' }
  return map[status] ?? status
}
