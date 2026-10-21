import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * ProtectedRoute — mencegah akses ke halaman yang butuh login.
 * Redirect ke /login jika belum login.
 */
export function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageLoader />

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

/**
 * AdminRoute — khusus halaman admin.
 * Redirect ke /dashboard jika bukan admin.
 */
export function AdminRoute({ children }) {
  const { isLoggedIn, isAdmin, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageLoader />

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

/**
 * GuestRoute — hanya untuk yang belum login (login, register, dll).
 * Jika sudah login, redirect ke dashboard.
 */
export function GuestRoute({ children }) {
  const { isLoggedIn, isAdmin, loading } = useAuth()

  if (loading) return <PageLoader />

  if (isLoggedIn) {
    return <Navigate to={isAdmin ? '/admin/dashboard' : '/dashboard'} replace />
  }

  return children
}

// ─── Full-page loader saat cek auth ──────────────────────────────────────
function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-3 border-primary-200 border-t-primary-800 rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Memuat...</p>
      </div>
    </div>
  )
}
