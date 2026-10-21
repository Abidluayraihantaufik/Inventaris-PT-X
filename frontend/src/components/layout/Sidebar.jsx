import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, Archive, PackagePlus,
  PackageMinus, ClipboardList, History, Users,
  LogOut, Leaf, ChevronRight, X
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

// ─── Navigasi Admin ───────────────────────────────────────────────────────
const adminNav = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    to: '/admin/dashboard',
  },
  {
    label: 'Master Produk',
    icon: Package,
    to: '/admin/products',
  },
  {
    label: 'Inventaris / Stok',
    icon: Archive,
    to: '/admin/inventory',
  },
  {
    label: 'Tambah Barang',
    icon: PackagePlus,
    to: '/admin/inventory/add',
  },
  {
    label: 'Barang Keluar',
    icon: PackageMinus,
    to: '/admin/stock-out',
  },
  {
    label: 'Riwayat Keluar',
    icon: History,
    to: '/admin/stock-out/logs',
  },
  {
    label: 'Stock Opname',
    icon: ClipboardList,
    to: '/admin/stock-opname',
  },
  {
    label: 'Kelola User',
    icon: Users,
    to: '/admin/users',
  },
]

// ─── Navigasi User Gudang ─────────────────────────────────────────────────
const userNav = [
  { label: 'Dashboard',      icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Cari Barang',    icon: Archive,          to: '/inventory' },
  { label: 'Barang Keluar',  icon: PackageMinus,     to: '/stock-out' },
  { label: 'Stock Opname',   icon: ClipboardList,    to: '/stock-opname' },
]

/**
 * Sidebar — navigasi utama aplikasi.
 * Props:
 *   mobileOpen: boolean — apakah sidebar tampil di mobile
 *   onClose: fn — menutup sidebar di mobile
 */
export default function Sidebar({ mobileOpen = false, onClose }) {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const navItems = isAdmin ? adminNav : userNav

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      {/* Overlay mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* ─── Logo / Brand ──────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-lime-400/20 flex items-center justify-center flex-shrink-0">
              <Leaf className="w-4 h-4 text-lime-400" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                Maskitani
              </p>
              <p className="text-white/40 text-[10px] leading-tight">Inventory System</p>
            </div>
          </div>
          {/* Tombol tutup (mobile) */}
          <button
            onClick={onClose}
            className="md:hidden text-white/50 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ─── User info ─────────────────────────────────────────── */}
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
              style={{ background: 'rgba(132, 204, 22, 0.25)', color: '#a3e635' }}
            >
              {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-white/50 text-xs truncate">{user?.division ?? (isAdmin ? 'Administrator' : 'User')}</p>
            </div>
          </div>
        </div>

        {/* ─── Navigation ────────────────────────────────────────── */}
        <nav className="flex-1 py-3 overflow-y-auto space-y-0.5">
          {navItems.map(({ label, icon: Icon, to }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0 sidebar-icon" />
              <span className="flex-1">{label}</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        {/* ─── Logout ────────────────────────────────────────────── */}
        <div className="px-3 pb-4 pt-2 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-left text-red-300 hover:text-red-200 hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  )
}
