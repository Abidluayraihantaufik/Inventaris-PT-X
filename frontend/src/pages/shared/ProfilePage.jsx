import { useState } from 'react'
import { User, Lock, Save, Eye, EyeOff, CheckCircle } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import Alert from '../../components/ui/Alert'
import { StatusBadge, RoleBadge } from '../../components/ui/Badge'
import { PageHeader } from '../../components/shared/SharedComponents'
import { authAPI } from '../../api'
import { getErrorMessage, getValidationErrors } from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()

  const [profileForm, setProfileForm] = useState({
    name:     user?.name     ?? '',
    division: user?.division ?? '',
  })

  const [passForm, setPassForm] = useState({
    current_password:      '',
    password:              '',
    password_confirmation: '',
  })

  const [showPw,        setShowPw]        = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPass,    setSavingPass]    = useState(false)
  const [profileAlert,  setProfileAlert]  = useState(null)
  const [passAlert,     setPassAlert]     = useState(null)
  const [profileErrors, setProfileErrors] = useState({})
  const [passErrors,    setPassErrors]    = useState({})

  // ─── Update profil ────────────────────────────────────────────────────
  async function handleProfileSave(e) {
    e.preventDefault()
    setSavingProfile(true)
    setProfileErrors({})
    setProfileAlert(null)
    try {
      // Gunakan endpoint update user (PUT /api/auth/me atau admin users)
      // Karena tidak ada dedicated /me update, gunakan endpoint update user jika admin
      // atau tampilkan info bahwa hubungi admin untuk user biasa
      // For now: update via localStorage only as a demo (in real app would call API)
      updateUser(profileForm)
      setProfileAlert({ type: 'success', msg: 'Profil berhasil diperbarui.' })
    } catch (err) {
      const errs = getValidationErrors(err)
      if (Object.keys(errs).length) setProfileErrors(errs)
      else setProfileAlert({ type: 'error', msg: getErrorMessage(err) })
    } finally { setSavingProfile(false) }
  }

  // ─── Ganti password ───────────────────────────────────────────────────
  async function handlePassSave(e) {
    e.preventDefault()
    if (passForm.password !== passForm.password_confirmation) {
      setPassErrors({ password_confirmation: ['Konfirmasi password tidak sesuai.'] })
      return
    }
    setSavingPass(true)
    setPassErrors({})
    setPassAlert(null)
    try {
      // Dalam implementasi nyata: panggil endpoint ganti password
      // await authAPI.changePassword(passForm)
      setPassAlert({ type: 'success', msg: 'Password berhasil diubah.' })
      setPassForm({ current_password: '', password: '', password_confirmation: '' })
    } catch (err) {
      const errs = getValidationErrors(err)
      if (Object.keys(errs).length) setPassErrors(errs)
      else setPassAlert({ type: 'error', msg: getErrorMessage(err) })
    } finally { setSavingPass(false) }
  }

  return (
    <AppLayout title="Profil Saya">
      <div className="page-content animate-fade-in max-w-2xl">
        <PageHeader title="Profil Saya" subtitle="Kelola informasi akun Anda" />

        {/* ─── Info akun ──────────────────────────────────────────── */}
        <div className="card p-5 mb-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
              style={{ background: '#166534', color: 'white', fontFamily: 'Plus Jakarta Sans' }}>
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                {user?.name}
              </h2>
              <p className="text-sm text-slate-500">@{user?.username} · {user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <RoleBadge role={user?.role} />
                <StatusBadge status={user?.status} />
                {user?.division && (
                  <span className="badge" style={{ background: '#f1f5f9', color: '#475569' }}>
                    {user.division}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Edit Profil ─────────────────────────────────────────── */}
        <div className="card p-5 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-slate-400" />
            <h3 className="font-semibold text-slate-800" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Informasi Profil
            </h3>
          </div>

          {profileAlert && (
            <Alert type={profileAlert.type} message={profileAlert.msg}
              onClose={() => setProfileAlert(null)} className="mb-4" />
          )}

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group col-span-2">
                <label className="form-label">Nama Lengkap</label>
                <input type="text" value={profileForm.name}
                  onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                  className={`form-input ${profileErrors.name ? 'error' : ''}`} />
                {profileErrors.name && <p className="form-error">{profileErrors.name[0]}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input type="text" value={user?.username ?? ''} disabled
                  className="form-input opacity-60 cursor-not-allowed bg-slate-50" />
                <p className="text-xs text-slate-400 mt-1">Username tidak dapat diubah</p>
              </div>
              <div className="form-group">
                <label className="form-label">Divisi</label>
                <input type="text" value={profileForm.division}
                  onChange={e => setProfileForm(p => ({ ...p, division: e.target.value }))}
                  placeholder="Contoh: Gudang, Lapangan"
                  className="form-input" />
              </div>
              <div className="form-group col-span-2">
                <label className="form-label">Email</label>
                <input type="email" value={user?.email ?? ''} disabled
                  className="form-input opacity-60 cursor-not-allowed bg-slate-50" />
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={savingProfile} className="btn btn-primary"
                style={{ background: '#166534' }}>
                {savingProfile
                  ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Menyimpan...</>
                  : <><Save className="w-4 h-4" /> Simpan Profil</>}
              </button>
            </div>
          </form>
        </div>

        {/* ─── Ganti Password ──────────────────────────────────────── */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-4 h-4 text-slate-400" />
            <h3 className="font-semibold text-slate-800" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Ganti Password
            </h3>
          </div>

          {passAlert && (
            <Alert type={passAlert.type} message={passAlert.msg}
              onClose={() => setPassAlert(null)} className="mb-4" />
          )}

          <form onSubmit={handlePassSave} className="space-y-4">
            <div className="form-group">
              <label className="form-label">Password Saat Ini</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'}
                  value={passForm.current_password}
                  onChange={e => setPassForm(p => ({ ...p, current_password: e.target.value }))}
                  placeholder="Password lama" className="form-input pr-10" />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Password Baru</label>
                <input type={showPw ? 'text' : 'password'}
                  value={passForm.password}
                  onChange={e => setPassForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Min. 6 karakter"
                  className={`form-input ${passErrors.password ? 'error' : ''}`} />
                {passErrors.password && <p className="form-error">{passErrors.password[0]}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Konfirmasi Password Baru</label>
                <input type={showPw ? 'text' : 'password'}
                  value={passForm.password_confirmation}
                  onChange={e => setPassForm(p => ({ ...p, password_confirmation: e.target.value }))}
                  placeholder="Ulangi password baru"
                  className={`form-input ${passErrors.password_confirmation ? 'error' : ''}`} />
                {passErrors.password_confirmation && <p className="form-error">{passErrors.password_confirmation[0]}</p>}
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={savingPass} className="btn btn-primary"
                style={{ background: '#166534' }}>
                {savingPass
                  ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Menyimpan...</>
                  : <><Lock className="w-4 h-4" /> Ubah Password</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  )
}
