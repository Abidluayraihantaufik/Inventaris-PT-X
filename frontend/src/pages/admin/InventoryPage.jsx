import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Archive, Eye, Pencil, Trash2, Filter } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import { ConfirmModal } from '../../components/ui/Modal'
import Alert from '../../components/ui/Alert'
import { ExpiryBadge } from '../../components/ui/Badge'
import { PageHeader, SearchBar, EmptyState, Skeleton, Pagination } from '../../components/shared/SharedComponents'
import { inventoryAPI, categoryAPI } from '../../api'
import { formatDate, formatNumber, getErrorMessage } from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'

export default function InventoryPage() {
  const navigate       = useNavigate()
  const [searchParams] = useSearchParams()
  const { isAdmin }    = useAuth()

  const [batches,       setBatches]       = useState([])
  const [categories,    setCategories]    = useState([])
  const [meta,          setMeta]          = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [alert,         setAlert]         = useState(null)
  const [showConfirm,   setShowConfirm]   = useState(false)
  const [deleteTarget,  setDeleteTarget]  = useState(null)
  const [deleting,      setDeleting]      = useState(false)

  // Filter state
  const [search,        setSearch]        = useState(searchParams.get('search') ?? '')
  const [catFilter,     setCatFilter]     = useState('')
  const [expiryFilter,  setExpiryFilter]  = useState(searchParams.get('expiry_status') ?? '')
  const [availableOnly, setAvailableOnly] = useState(true)
  const [page,          setPage]          = useState(1)

  const fetchBatches = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await inventoryAPI.getAll({
        search,
        category_id:   catFilter,
        expiry_status: expiryFilter,
        available_only: availableOnly ? 1 : 0,
        page,
      })
      setBatches(data.data ?? [])
      setMeta(data)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [search, catFilter, expiryFilter, availableOnly, page])

  useEffect(() => { fetchBatches() }, [fetchBatches])
  useEffect(() => {
    categoryAPI.getAll().then(({ data }) => setCategories(data))
  }, [])

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await inventoryAPI.delete(deleteTarget.id)
      setAlert({ type: 'success', msg: `Batch "${deleteTarget.batch_no}" berhasil dihapus.` })
      setShowConfirm(false)
      fetchBatches()
    } catch (err) {
      setAlert({ type: 'error', msg: getErrorMessage(err) })
      setShowConfirm(false)
    } finally { setDeleting(false) }
  }

  // Warna baris berdasarkan status kadaluarsa
  function rowClass(expiryDate) {
    const today = new Date().toISOString().slice(0, 10)
    if (expiryDate < today) return 'bg-slate-50 opacity-70'
    const diff = Math.ceil((new Date(expiryDate) - new Date()) / 86400000)
    if (diff < 30) return 'bg-red-50/50'
    if (diff <= 60) return 'bg-yellow-50/50'
    return ''
  }

  const expiryOptions = [
    { value: '',         label: 'Semua Status' },
    { value: 'safe',     label: '✓ Aman' },
    { value: 'warning',  label: '⚠ Perhatian (≤60 hari)' },
    { value: 'critical', label: '🔴 Kritis (≤30 hari)' },
    { value: 'expired',  label: '✕ Expired' },
  ]

  return (
    <AppLayout title="Inventaris / Stok">
      <div className="page-content animate-fade-in">

        <PageHeader title="Inventaris / Stok" subtitle="Daftar batch produk yang tersimpan di gudang">
          {isAdmin && (
            <button onClick={() => navigate('/admin/inventory/add')} className="btn btn-primary">
              <Plus className="w-4 h-4" />
              Tambah Batch
            </button>
          )}
        </PageHeader>

        {alert && <Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} className="mb-4" />}

        {/* Filter bar */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <SearchBar
            value={search}
            onChange={v => { setSearch(v); setPage(1) }}
            placeholder="Cari produk, batch, atau lokasi..."
            className="flex-1 min-w-[200px]"
          />
          <select value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1) }}
            className="form-input form-select w-44">
            <option value="">Semua Kategori</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={expiryFilter} onChange={e => { setExpiryFilter(e.target.value); setPage(1) }}
            className="form-input form-select w-52">
            {expiryOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer ml-auto bg-white border px-3 py-2 rounded-md hover:bg-slate-50 transition-colors">
            <input 
              type="checkbox" 
              checked={!availableOnly} 
              onChange={e => { setAvailableOnly(!e.target.checked); setPage(1) }}
              className="rounded text-green-600 focus:ring-green-500 w-4 h-4 cursor-pointer"
            />
            Tampilkan Stok Habis
          </label>
        </div>

        {/* Tabel batch */}
        <div className="card">
          <div className="table-wrapper rounded-none border-none">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Produk</th>
                  <th>No. Batch</th>
                  <th>Lokasi Rak</th>
                  <th>Tgl Masuk</th>
                  <th>Kadaluarsa</th>
                  <th>Stok</th>
                  <th>Status</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(7).fill(0).map((_, i) => (
                    <tr key={i}>
                      {Array(8).fill(0).map((_, j) => (
                        <td key={j}><Skeleton className="h-4" /></td>
                      ))}
                    </tr>
                  ))
                ) : batches.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <EmptyState
                        icon={Archive}
                        title="Tidak ada batch ditemukan"
                        description={search || expiryFilter || catFilter
                          ? "Coba ubah filter pencarian."
                          : "Belum ada batch yang ditambahkan."}
                        action={isAdmin && (
                          <button onClick={() => navigate('/admin/inventory/add')} className="btn btn-primary btn-sm">
                            <Plus className="w-3.5 h-3.5" /> Tambah Batch
                          </button>
                        )}
                      />
                    </td>
                  </tr>
                ) : (
                  batches.map(batch => (
                    <tr key={batch.id} className={rowClass(batch.expiry_date)}>
                      <td>
                        <div>
                          <p className="font-semibold text-slate-800">{batch.product?.product_name}</p>
                          <p className="text-xs text-slate-400">{batch.product?.category?.name}</p>
                        </div>
                      </td>
                      <td>
                        <span className="font-mono text-sm bg-slate-100 px-2 py-0.5 rounded">
                          {batch.batch_no}
                        </span>
                      </td>
                      <td><span className="text-slate-600">{batch.storage_location}</span></td>
                      <td><span className="text-sm">{formatDate(batch.entry_date)}</span></td>
                      <td><span className="text-sm">{formatDate(batch.expiry_date)}</span></td>
                      <td>
                        <span className="font-semibold text-slate-800">{formatNumber(batch.stock_quantity)}</span>
                        <span className="text-slate-400 text-xs ml-1">{batch.product?.unit}</span>
                      </td>
                      <td>
                        <ExpiryBadge expiryDate={batch.expiry_date} showDays />
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`${isAdmin ? '/admin' : ''}/inventory/${batch.id}`)}
                            className="btn btn-ghost btn-icon btn-sm text-slate-500 hover:text-green-600"
                            title="Lihat detail"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => navigate(`/admin/inventory/${batch.id}`)}
                                className="btn btn-ghost btn-icon btn-sm text-slate-500 hover:text-blue-600"
                                title="Edit batch"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => { setDeleteTarget(batch); setShowConfirm(true) }}
                                className="btn btn-ghost btn-icon btn-sm text-slate-500 hover:text-red-600"
                                title="Hapus batch"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination meta={meta} onPageChange={setPage} />
        </div>
      </div>

      <ConfirmModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Hapus Batch"
        message={`Hapus batch "${deleteTarget?.batch_no}"? Aksi ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus"
      />
    </AppLayout>
  )
}
