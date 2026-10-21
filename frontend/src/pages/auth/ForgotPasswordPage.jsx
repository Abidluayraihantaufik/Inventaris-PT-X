import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Leaf, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { authAPI } from '../../api'
import { getErrorMessage } from '../../utils/helpers'

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [sent,    setSent]    = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email) { setError('Email wajib diisi.'); return }
    setLoading(true)
    setError(null)
    try {
      await authAPI.forgotPassword({ email })
      setSent(true)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 animate-scale-in">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#166534' }}>
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-800" style={{ fontFamily: 'Plus Jakarta Sans' }}>PT Maskitani</span>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Email Terkirim!
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              Link reset password telah dikirim ke <strong>{email}</strong>. Periksa kotak masuk email Anda.
            </p>
            <Link to="/login" className="btn btn-primary btn-full" style={{ background: '#166534' }}>
              Kembali ke Login
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Lupa Password
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              Masukkan email Anda dan kami akan mengirimkan link untuk mereset password.
            </p>

            {error && (
              <div className="alert alert-error mb-5">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Alamat Email</label>
                <div className="relative">
                  <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(null) }}
                    placeholder="email@maskitani.com" className="form-input pl-10" />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary btn-full btn-lg"
                style={{ background: '#166534' }}>
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Mengirim...</>
                ) : 'Kirim Link Reset'}
              </button>
            </form>

            <Link to="/login" className="flex items-center justify-center gap-1.5 mt-5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Login
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
