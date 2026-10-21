import { useNavigate } from 'react-router-dom'
import { Menu, Bell, User, ChevronDown, Settings } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useState, useRef, useEffect } from 'react'

/**
 * Topbar — header bar di atas halaman.
 * Props:
 *   title: string — judul halaman
 *   onMenuClick: fn — toggle sidebar (mobile)
 */
export default function Topbar({ title, onMenuClick }) {
  const { user, isAdmin, logout } = useAuth()
  const navigate   = useNavigate()
  const [open, setOpen] = useState(false)
  const dropRef    = useRef(null)

  // Tutup dropdown kalau klik di luar
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  const profilePath = isAdmin ? '/admin/profile' : '/profile'

  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between px-6 py-3.5 bg-white border-b"
      style={{ borderColor: 'var(--color-border)' }}
    >
      {/* Kiri: hamburger + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          aria-label="Buka menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1
          className="text-base font-semibold text-slate-800"
          style={{ fontFamily: 'Plus Jakarta Sans' }}
        >
          {title}
        </h1>
      </div>

      {/* Kanan: notif + profil dropdown */}
      <div className="flex items-center gap-2">
        {/* Notifikasi (placeholder) */}
        <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell className="w-4.5 h-4.5" />
        </button>

        {/* Profile dropdown */}
        <div className="relative" ref={dropRef}>
          <button
            id="topbar-profile-btn"
            onClick={() => setOpen(v => !v)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: '#166534', color: 'white' }}
            >
              {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
            </div>
            <span className="text-sm font-medium text-slate-700 hidden sm:block max-w-[120px] truncate">
              {user?.name}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-lg border py-1 animate-scale-in z-50"
              style={{ borderColor: 'var(--color-border)' }}>
              {/* User info */}
              <div className="px-3 py-2.5 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                <span className={`badge mt-1 ${isAdmin ? 'badge-admin' : 'badge-user'}`}>
                  {isAdmin ? 'Admin' : 'User Gudang'}
                </span>
              </div>

              {/* Menu items */}
              <button
                onClick={() => { navigate(profilePath); setOpen(false) }}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <User className="w-4 h-4 text-slate-400" />
                Profil Saya
              </button>

              <button
                onClick={() => { setOpen(false) }}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                Pengaturan
              </button>

              <div className="border-t my-1" style={{ borderColor: 'var(--color-border)' }} />

              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
