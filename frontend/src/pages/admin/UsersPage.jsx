import { useEffect, useState, useCallback } from 'react'
import { Users, UserCheck, UserX, ShieldCheck, Trash2, Search } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import { ConfirmModal } from '../../components/ui/Modal'
import Alert from '../../components/ui/Alert'
import { StatusBadge, RoleBadge } from '../../components/ui/Badge'
import { PageHeader, SearchBar, EmptyState, Skeleton, Pagination } from '../../components/shared/SharedComponents'
import { userAPI } from '../../api'
import { formatDateTime, getErrorMessage } from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'

export default function UsersPage() {
  const { user: currentUser } = useAuth()

  const [users,         setUsers]         = useState([])
  const [meta,          setMeta]          = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [search,        setSearch]        = useState('')
  const [roleFilter,    setRoleFilter]    = useState('')
  const [statusFilter,  setStatusFilter]  = useState('pending') // default: tampilkan pending dulu
  const [page,          setPage]          = useState(1)

  const [alert,         setAlert]         = useState(null)
  const [processing,    setProcessing]    = useState(null) // id user yang sedang diproses

  const [deleteTarget,  setDeleteTarget]  = useState(null)
  const [deleting,      setDeleting]      = useState(false)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await userAPI.getAll({ search, role: roleFilter, status: statusFilter, page })
      setUsers(data.data ?? [])
      setMeta(data)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [search, roleFilter, statusFilter, page])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  // ─── Update status user ───────────────────────────────────────────────
  async function handleStatusChange(user, newStatus) {
    setProcessing(user.id)
    try {
      await userAPI.updateStatus(user.id, { status: newStatus })
      const label = { active: 'diaktifkan', inactive: 'dinonaktifkan', pending: 'dikembalikan ke pending' }
      setAlert({ type: 'success', msg: `Akun ${user.name} berhasil ${label[newStatus]}.` })
      fetchUsers()
    } catch (err) {
      setAlert({ type: 'error', msg: getErrorMessage(err) })
    } finally { setProcessing(null) }
  }

  // ─── Update role ──────────────────────────────────────────────────────
  async function handleRoleChange(user, newRole) {
    setProcessing(user.id)
    try {
      await userAPI.update(user.id, { role: newRole })
      setAlert({ type: 'success', msg: `Role ${user.name} berhasil diubah menjadi ${newRole}.` })
      fetchUsers()
    } catch (err) {
      setAlert({ type: 'error', msg: getErrorMessage(err) })
    } finally { setProcessing(null) }
  }

  // ─── Hapus user ───────────────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await userAPI.delete(deleteTarget.id)
      setAlert({ type: 'success', msg: `Pengguna ${deleteTarget.name} berhasil dihapus.` })
      setDeleteTarget(null)
      fetchUsers()
    } catch (err) {
      setAlert({ type: 'error', msg: getErrorMessage(err) })
      setDeleteTarget(null)
    } finally { setDeleting(false) }
  }

  // Hitung pending count untuk badge
  const pendingCount = statusFilter !== 'pending' ? null : meta?.total

  return (
    <AppLayout title="Kelola Pengguna">
      <div className="page-content animate-fade-in">
        <PageHeader title="Kelola Pengguna" subtitle="Approval dan manajemen akun pengguna sistem" />

        {alert && <Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} className="mb-4" />}

        {/* Tab Status filter */}
        <div className="flex items-center gap-1 mb-4 p-1 bg-slate-100 rounded-xl w-fit">
          {[
            { value: 'pending',  label: 'Pending Approval', icon: '🕐' },
            { value: 'active',   label: 'Aktif',            icon: '✓' },
            { value: 'inactive', label: 'Nonaktif',         icon: '✕' },
            { value: '',         label: 'Semua',            icon: '·' },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => { setStatusFilter(tab.value); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                statusFilter === tab.value
                  ? 'bg-white shadow-sm text-slate-800'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Search + filter */}
        <div className="flex items-center gap-3 mb-4">
          <SearchBar value={search} onChange={v => { setSearch(v); setPage(1) }}
            placeholder="Cari nama, username, email..." className="flex-1" />
          <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1) }}
            className="form-input form-select w-36">
            <option value="">Semua Role</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>

        {/* Tabel */}
        <div className="card">
          <div className="table-wrapper rounded-none border-none">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Pengguna</th>
                  <th>Username</th>
                  <th>Divisi</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Terdaftar</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}>{Array(7).fill(0).map((_, j) => (
                      <td key={j}><Skeleton className="h-4" /></td>
                    ))}</tr>
                  ))
                ) : users.length === 0 ? (
                  <tr><td colSpan={7}>
                    <EmptyState icon={Users}
                      title={statusFilter === 'pending' ? 'Tidak ada akun yang menunggu approval' : 'Tidak ada pengguna ditemukan'}
                      description={statusFilter === 'pending' ? 'Semua pendaftaran baru akan muncul di sini.' : 'Coba ubah filter pencarian.'} />
                  </td></tr>
                ) : users.map(user => {
                  const isSelf    = user.id === currentUser?.id
                  const isProc    = processing === user.id

                  return (
                    <tr key={user.id} className={isSelf ? 'bg-green-50/50' : ''}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                            style={{ background: '#166534', color: 'white' }}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 flex items-center gap-1">
                              {user.name}
                              {isSelf && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">Anda</span>}
                            </p>
                            <p className="text-xs text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td><span className="font-mono text-sm">@{user.username}</span></td>
                      <td><span className="text-slate-600 text-sm">{user.division ?? '-'}</span></td>
                      <td>
                        {/* Dropdown role change */}
                        <select
                          value={user.role}
                          onChange={e => handleRoleChange(user, e.target.value)}
                          disabled={isSelf || isProc}
                          className="form-input form-select py-1 px-2 text-xs w-28 disabled:opacity-50"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td><StatusBadge status={user.status} /></td>
                      <td><span className="text-xs text-slate-500">{formatDateTime(user.created_at)}</span></td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          {isProc ? (
                            <span className="w-4 h-4 border-2 border-slate-200 border-t-green-600 rounded-full animate-spin" />
                          ) : (
                            <>
                              {/* Tombol sesuai status */}
                              {user.status === 'pending' && (
                                <button onClick={() => handleStatusChange(user, 'active')}
                                  className="btn btn-ghost btn-sm text-green-700 hover:bg-green-50">
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span className="text-xs">Approve</span>
                                </button>
                              )}
                              {user.status === 'active' && !isSelf && (
                                <button onClick={() => handleStatusChange(user, 'inactive')}
                                  className="btn btn-ghost btn-sm text-amber-600 hover:bg-amber-50">
                                  <UserX className="w-3.5 h-3.5" />
                                  <span className="text-xs">Nonaktifkan</span>
                                </button>
                              )}
                              {user.status === 'inactive' && (
                                <button onClick={() => handleStatusChange(user, 'active')}
                                  className="btn btn-ghost btn-sm text-green-700 hover:bg-green-50">
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span className="text-xs">Aktifkan</span>
                                </button>
                              )}
                              {/* Hapus */}
                              {!isSelf && (
                                <button onClick={() => setDeleteTarget(user)}
                                  className="btn btn-ghost btn-icon btn-sm text-slate-400 hover:text-red-600">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <Pagination meta={meta} onPageChange={setPage} />
        </div>
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Hapus Pengguna"
        message={`Hapus akun "${deleteTarget?.name}"? Aksi ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus Akun"
      />
    </AppLayout>
  )
}
