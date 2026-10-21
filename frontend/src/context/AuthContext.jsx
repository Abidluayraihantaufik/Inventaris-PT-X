import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authAPI } from '../api'

const AuthContext = createContext(null)

/**
 * AuthProvider — menyimpan state user login secara global.
 * Digunakan oleh useAuth() di seluruh komponen.
 */
export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [token,   setToken]   = useState(() => localStorage.getItem('auth_token'))
  const [loading, setLoading] = useState(true)  // true saat verifikasi token awal

  // ─── Inisialisasi: cek token tersimpan ────────────────────────────────
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token')
    const savedUser  = localStorage.getItem('auth_user')

    if (savedToken && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
        setToken(savedToken)
      } catch {
        // Data rusak → bersihkan
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      }
    }
    setLoading(false)
  }, [])

  // ─── Login ────────────────────────────────────────────────────────────
  const login = useCallback(async (credentials) => {
    const response = await authAPI.login(credentials)
    const { token: newToken, user: newUser } = response.data

    localStorage.setItem('auth_token', newToken)
    localStorage.setItem('auth_user', JSON.stringify(newUser))

    setToken(newToken)
    setUser(newUser)

    return newUser
  }, [])

  // ─── Logout ───────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await authAPI.logout()
    } catch {
      // Lanjut logout meski request gagal
    } finally {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      setToken(null)
      setUser(null)
    }
  }, [])

  // ─── Update user data lokal ───────────────────────────────────────────
  const updateUser = useCallback((newUserData) => {
    const updated = { ...user, ...newUserData }
    setUser(updated)
    localStorage.setItem('auth_user', JSON.stringify(updated))
  }, [user])

  // ─── Helpers ──────────────────────────────────────────────────────────
  const isAdmin      = user?.role === 'admin'
  const isLoggedIn   = !!token && !!user
  const isActive     = user?.status === 'active'

  const value = {
    user,
    token,
    loading,
    isLoggedIn,
    isAdmin,
    isActive,
    login,
    logout,
    updateUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook untuk mengakses AuthContext
 * @example const { user, isAdmin, login, logout } = useAuth()
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider')
  }
  return context
}
