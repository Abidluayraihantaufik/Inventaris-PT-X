import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Leaf, AlertCircle, CheckCircle } from 'lucide-react'
import { authAPI } from '../../api'
import { getErrorMessage } from '../../utils/helpers'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', username: '', email: '', password: '', password_confirmation: '', division: ''
  })
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors]   = useState({})

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: null }))
    if (error) setError(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setErrors({})
    try {
      await authAPI.register(form)
      setSuccess(true)
    } catch (err) {
      const validationErrors = err?.response?.data?.errors
      if (validationErrors) {
        setErrors(validationErrors)
      } else {
        setError(getErrorMessage(err))
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center animate-scale-in">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Pendaftaran Berhasil!
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            Akun Anda berhasil didaftarkan. Silakan tunggu persetujuan dari admin sebelum dapat masuk ke sistem.
          </p>
          <Link to="/login" className="btn btn-primary btn-full" style={{ background: '#166534' }}>
            Kembali ke Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 md:p-10 animate-scale-in">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#166534' }}>
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-800" style={{ fontFamily: 'Plus Jakarta Sans' }}>PT Maskitani</span>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          Daftar Akun Baru
        </h2>
        <p className="text-slate-500 text-sm mb-6">Akun akan aktif setelah disetujui admin</p>

        {error && (
          <div className="alert alert-error mb-5 animate-fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group col-span-2">
              <label className="form-label">Nama Lengkap *</label>
              <input name="name" type="text" value={form.name} onChange={handleChange}
                placeholder="Nama lengkap" className={`form-input ${errors.name ? 'error' : ''}`} />
              {errors.name && <p className="form-error">{errors.name[0]}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Username *</label>
              <input name="username" type="text" value={form.username} onChange={handleChange}
                placeholder="username" className={`form-input ${errors.username ? 'error' : ''}`} />
              {errors.username && <p className="form-error">{errors.username[0]}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Divisi</label>
              <input name="division" type="text" value={form.division} onChange={handleChange}
                placeholder="Gudang / Lapangan" className="form-input" />
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Email *</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="email@maskitani.com" className={`form-input ${errors.email ? 'error' : ''}`} />
              {errors.email && <p className="form-error">{errors.email[0]}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <div className="relative">
                <input name="password" type={showPw ? 'text' : 'password'} value={form.password}
                  onChange={handleChange} placeholder="Min. 6 karakter"
                  className={`form-input pr-10 ${errors.password ? 'error' : ''}`} />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password[0]}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Konfirmasi Password *</label>
              <input name="password_confirmation" type={showPw ? 'text' : 'password'}
                value={form.password_confirmation} onChange={handleChange}
                placeholder="Ulangi password" className="form-input" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-full btn-lg mt-2"
            style={{ background: '#166534' }}>
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Mendaftarkan...</>
            ) : 'Daftar Sekarang'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-semibold hover:underline" style={{ color: '#166534' }}>
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  )
}
