import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Leaf, Package, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getErrorMessage } from '../../utils/helpers'

export default function LoginPage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { login } = useAuth()

  const [form,    setForm]    = useState({ login: '', password: '' })
  const [showPw,  setShowPw]  = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const from = location.state?.from?.pathname || null

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (error) setError(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.login || !form.password) {
      setError('Username/email dan password wajib diisi.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const user = await login(form)
      // Arahkan sesuai role
      if (from) {
        navigate(from, { replace: true })
      } else {
        navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard', { replace: true })
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
      {/* Card container */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex animate-scale-in">

        {/* ─── Sisi kiri — Branding ─────────────────────────────────── */}
        <div className="hidden md:flex w-5/12 flex-col justify-between p-10"
          style={{ background: 'linear-gradient(145deg, #14532d 0%, #166534 50%, #15803d 100%)' }}>

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              PT Maskitani
            </span>
          </div>

          {/* Tagline */}
          <div>
            <h1 className="text-white font-bold text-2xl leading-snug mb-6" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Sistem Manajemen Inventaris Agrokimia
            </h1>

            {/* Feature highlights */}
            <div className="space-y-3">
              {[
                'Monitoring batch & kadaluarsa real-time',
                'Stock opname & audit terpusat',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-lime-400 flex-shrink-0" />
                  <span className="text-white/80 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Decorative icons */}
          <div className="flex gap-3 opacity-20">
            {[...Array(5)].map((_, i) => (
              <Package key={i} className="w-5 h-5 text-white" />
            ))}
          </div>
        </div>

        {/* ─── Sisi kanan — Form Login ──────────────────────────────── */}
        <div className="flex-1 p-8 md:p-10 flex flex-col justify-center">

          {/* Header mobile */}
          <div className="md:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#166534' }}>
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-800" style={{ fontFamily: 'Plus Jakarta Sans' }}>PT Maskitani</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1.5" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Selamat Datang
            </h2>
            <p className="text-slate-500 text-sm">Masuk dengan akun yang telah terdaftar</p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="alert alert-error mb-5 animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username / Email */}
            <div className="form-group">
              <label htmlFor="login" className="form-label">
                Username atau Email
              </label>
              <input
                id="login"
                name="login"
                type="text"
                autoComplete="username"
                autoFocus
                value={form.login}
                onChange={handleChange}
                placeholder="Masukkan username atau email"
                className={`form-input ${error ? 'error' : ''}`}
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Masukkan password"
                  className={`form-input pr-11 ${error ? 'error' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPw ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPw ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" className="w-4 h-4 rounded accent-green-700" />
                <span className="text-sm text-slate-600">Ingat saya</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm font-medium hover:underline transition-colors"
                style={{ color: '#166534' }}
              >
                Lupa password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="btn-login"
              disabled={loading}
              className="btn btn-primary btn-full btn-lg"
              style={{ background: '#166534', borderColor: '#166534' }}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memproses...
                </>
              ) : 'Masuk'}
            </button>
          </form>

          {/* Register link */}
          <p className="mt-6 text-center text-sm text-slate-500">
            Belum punya akun?{' '}
            <Link
              to="/register"
              className="font-semibold hover:underline"
              style={{ color: '#166534' }}
            >
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
