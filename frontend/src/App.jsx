import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AdminRoute, GuestRoute, ProtectedRoute } from './routes/ProtectedRoute'

// ─── Lazy Load halaman (code splitting) ──────────────────────────────────
// Auth (public)
const LoginPage        = lazy(() => import('./pages/auth/LoginPage'))
const RegisterPage     = lazy(() => import('./pages/auth/RegisterPage'))
const ForgotPassPage   = lazy(() => import('./pages/auth/ForgotPasswordPage'))

// Admin pages
const AdminDashboard   = lazy(() => import('./pages/admin/DashboardPage'))
const ProductsPage     = lazy(() => import('./pages/admin/ProductsPage'))
const InventoryPage    = lazy(() => import('./pages/admin/InventoryPage'))
const AddBatchPage     = lazy(() => import('./pages/admin/AddBatchPage'))
const BatchDetailPage  = lazy(() => import('./pages/admin/BatchDetailPage'))
const StockOutPage     = lazy(() => import('./pages/admin/StockOutPage'))
const StockOutLogsPage = lazy(() => import('./pages/admin/StockOutLogsPage'))
const StockOpnamePage  = lazy(() => import('./pages/admin/StockOpnamePage'))
const UsersPage        = lazy(() => import('./pages/admin/UsersPage'))
const ProfilePage      = lazy(() => import('./pages/shared/ProfilePage'))

// User pages
const UserDashboard    = lazy(() => import('./pages/user/DashboardPage'))

// Fallback loader untuk lazy load
function SuspenseFallback() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-bg">
      <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-800 rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<SuspenseFallback />}>
          <Routes>
            {/* ─── Default redirect ──────────────────────────────────── */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* ─── Guest only (belum login) ──────────────────────────── */}
            <Route path="/login"          element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/register"       element={<GuestRoute><RegisterPage /></GuestRoute>} />
            <Route path="/forgot-password" element={<GuestRoute><ForgotPassPage /></GuestRoute>} />

            {/* ─── Admin routes ──────────────────────────────────────── */}
            <Route path="/admin/dashboard"   element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/products"    element={<AdminRoute><ProductsPage /></AdminRoute>} />
            <Route path="/admin/inventory"   element={<AdminRoute><InventoryPage /></AdminRoute>} />
            <Route path="/admin/inventory/add" element={<AdminRoute><AddBatchPage /></AdminRoute>} />
            <Route path="/admin/inventory/:id" element={<AdminRoute><BatchDetailPage /></AdminRoute>} />
            <Route path="/admin/stock-out"   element={<AdminRoute><StockOutPage /></AdminRoute>} />
            <Route path="/admin/stock-out/logs" element={<AdminRoute><StockOutLogsPage /></AdminRoute>} />
            <Route path="/admin/stock-opname" element={<AdminRoute><StockOpnamePage /></AdminRoute>} />
            <Route path="/admin/users"       element={<AdminRoute><UsersPage /></AdminRoute>} />
            <Route path="/admin/profile"     element={<AdminRoute><ProfilePage /></AdminRoute>} />

            {/* ─── User routes ───────────────────────────────────────── */}
            <Route path="/dashboard"     element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
            <Route path="/inventory"     element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
            <Route path="/inventory/:id" element={<ProtectedRoute><BatchDetailPage /></ProtectedRoute>} />
            <Route path="/stock-out"     element={<ProtectedRoute><StockOutPage /></ProtectedRoute>} />
            <Route path="/stock-opname"  element={<ProtectedRoute><StockOpnamePage /></ProtectedRoute>} />
            <Route path="/profile"       element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

            {/* ─── 404 ───────────────────────────────────────────────── */}
            <Route path="*" element={
              <div className="fixed inset-0 flex items-center justify-center bg-bg">
                <div className="text-center">
                  <p className="text-6xl font-bold text-primary-800 font-display">404</p>
                  <p className="text-muted mt-2">Halaman tidak ditemukan.</p>
                  <a href="/login" className="btn btn-primary mt-4 inline-flex">Kembali ke Login</a>
                </div>
              </div>
            } />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}
