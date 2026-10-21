import { useEffect, useState, useCallback } from 'react'
import { ClipboardList, Plus, CheckCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import Modal from '../../components/ui/Modal'
import Alert from '../../components/ui/Alert'
import { ExpiryBadge, StatusBadge } from '../../components/ui/Badge'
import { PageHeader, SearchBar, EmptyState, Skeleton, Pagination } from '../../components/shared/SharedComponents'
import { stockOpnameAPI, inventoryAPI } from '../../api'
import { formatDate, formatDateTime, formatNumber, getErrorMessage, getValidationErrors } from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'

// ─── Form Modal: Input Opname Baru ────────────────────────────────────────
function OpnameForm({ batches, onSubmit, loading, errors }) {
  const [form, setForm] = useState({
    inventory_batch_id: '',
    physical_quantity: '',
    opname_date: new Date().toISOString().slice(0, 10),
    notes: '',
  })
  const [selectedBatch, setSelectedBatch] = useState(null)

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (name === 'inventory_batch_id') {
      setSelectedBatch(batches.find(b => b.id === Number(value)) ?? null)
    }
  }

  const selisih = selectedBatch && form.physical_quantity !== ''
    ? Number(form.physical_quantity) - Number(selectedBatch.stock_quantity)
    : null

  return (
    <form id="opname-form" onSubmit={e => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
      {/* Pilih batch */}
      <div className="form-group">
        <label className="form-label">Pilih Batch Produk *</label>
        <select name="inventory_batch_id" value={form.inventory_batch_id} onChange={handleChange}
          className={`form-input form-select ${errors?.inventory_batch_id ? 'error' : ''}`}>
          <option value="">-- Pilih Batch --</option>
          {batches.map(b => (
            <option key={b.id} value={b.id}>
              {b.product?.product_name} — {b.batch_no} (Stok: {formatNumber(b.stock_quantity)} {b.product?.unit})
            </option>
          ))}
        </select>
        {errors?.inventory_batch_id && <p className="form-error">{errors.inventory_batch_id[0]}</p>}
      </div>

      {/* Info batch terpilih */}
      {selectedBatch && (
        <div className="bg-slate-50 rounded-xl p-3 text-sm space-y-2 border" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Stok sistem saat ini:</span>
            <span className="font-bold text-slate-800">
              {formatNumber(selectedBatch.stock_quantity)} {selectedBatch.product?.unit}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Lokasi:</span>
            <span className="text-slate-700">{selectedBatch.storage_location ?? '-'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Kadaluarsa:</span>
            <ExpiryBadge expiryDate={selectedBatch.expiry_date} showDays />
          </div>
        </div>
      )}

      {/* Jumlah fisik */}
      <div className="form-group">
        <label className="form-label">Jumlah Fisik Hasil Hitung *</label>
        <input type="number" name="physical_quantity" min="0" step="0.01"
          value={form.physical_quantity} onChange={handleChange}
          placeholder="Masukkan hasil hitung fisik"
          className={`form-input ${errors?.physical_quantity ? 'error' : ''}`} />
        {errors?.physical_quantity && <p className="form-error">{errors.physical_quantity[0]}</p>}

        {/* Preview selisih */}
        {selisih !== null && (
          <div className={`mt-2 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
            selisih === 0 ? 'bg-green-50 text-green-700 border border-green-200' :
            selisih > 0   ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {selisih === 0 ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>
              Selisih: <strong>{selisih > 0 ? `+${formatNumber(selisih)}` : formatNumber(selisih)}</strong>
              {' '}({selisih === 0 ? 'Sesuai' : selisih > 0 ? 'Lebih banyak' : 'Kurang'})
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="form-group">
          <label className="form-label">Tanggal Opname *</label>
          <input type="date" name="opname_date" value={form.opname_date} onChange={handleChange}
            className="form-input" />
        </div>
        <div className="form-group">
          <label className="form-label">Catatan</label>
          <input type="text" name="notes" value={form.notes} onChange={handleChange}
            placeholder="Opsional" className="form-input" />
        </div>
      </div>
    </form>
  )
}

// ─── Modal Verifikasi Admin ───────────────────────────────────────────────
function VerifyModal({ open, opname, onClose, onVerify, loading }) {
  const [adjustStock, setAdjustStock] = useState(false)
  const [notes, setNotes] = useState('')

  if (!opname) return null
  return (
    <Modal open={open} onClose={onClose} title="Verifikasi Stock Opname" size="md"
      footer={
        <>
          <button onClick={onClose} className="btn btn-secondary" disabled={loading}>Batal</button>
          <button onClick={() => onVerify({ adjust_stock: adjustStock, notes })}
            className="btn btn-primary" disabled={loading} style={{ background: '#166534' }}>
            {loading ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Memproses...</>
              : <><CheckCircle className="w-4 h-4" /> Verifikasi</>}
          </button>
        </>
      }>
      {/* Info opname */}
      <div className="bg-slate-50 rounded-xl p-3 mb-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Produk</span>
          <span className="font-semibold">{opname.inventory_batch?.product?.product_name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Stok Sistem</span>
          <span>{formatNumber(opname.system_quantity)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Stok Fisik</span>
          <span className="font-bold">{formatNumber(opname.physical_quantity)}</span>
        </div>
        <div className="flex justify-between border-t pt-2" style={{ borderColor: 'var(--color-border)' }}>
          <span className="text-slate-500">Selisih</span>
          <span className={`font-bold ${opname.difference > 0 ? 'text-blue-600' : opname.difference < 0 ? 'text-red-600' : 'text-green-600'}`}>
            {opname.difference > 0 ? '+' : ''}{formatNumber(opname.difference)}
          </span>
        </div>
      </div>

      {/* Opsi rekonsiliasi */}
      {opname.difference !== 0 && (
        <label className="flex items-start gap-3 p-3 border rounded-xl cursor-pointer hover:bg-slate-50 transition-colors mb-4"
          style={{ borderColor: adjustStock ? '#166534' : 'var(--color-border)' }}>
          <input type="checkbox" checked={adjustStock} onChange={e => setAdjustStock(e.target.checked)}
            className="mt-0.5 accent-green-700 w-4 h-4" />
          <div>
            <p className="font-semibold text-slate-800 text-sm">Sesuaikan stok sistem dengan hasil fisik</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Stok sistem akan diubah dari <strong>{formatNumber(opname.system_quantity)}</strong> menjadi <strong>{formatNumber(opname.physical_quantity)}</strong>
            </p>
          </div>
        </label>
      )}

      <div className="form-group">
        <label className="form-label">Catatan Verifikasi</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)}
          rows={2} placeholder="Catatan (opsional)" className="form-input resize-none text-sm" />
      </div>
    </Modal>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function StockOpnamePage() {
  const { isAdmin } = useAuth()

  const [opnames,       setOpnames]       = useState([])
  const [batches,       setBatches]       = useState([])
  const [meta,          setMeta]          = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [search,        setSearch]        = useState('')
  const [statusFilter,  setStatusFilter]  = useState('')
  const [page,          setPage]          = useState(1)

  const [showAdd,       setShowAdd]       = useState(false)
  const [saving,        setSaving]        = useState(false)
  const [formErrors,    setFormErrors]    = useState({})
  const [alert,         setAlert]         = useState(null)

  const [verifyTarget,  setVerifyTarget]  = useState(null)
  const [verifying,     setVerifying]     = useState(false)

  // Fetch opnames
  const fetchOpnames = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await stockOpnameAPI.getAll({ search, status: statusFilter, page })
      setOpnames(data.data ?? [])
      setMeta(data)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [search, statusFilter, page])

  useEffect(() => { fetchOpnames() }, [fetchOpnames])

  // Fetch batches untuk form
  useEffect(() => {
    inventoryAPI.getAll({ per_page: 999 })
      .then(({ data }) => setBatches(data.data ?? []))
  }, [])

  async function handleAddOpname(form) {
    setSaving(true)
    setFormErrors({})
    try {
      await stockOpnameAPI.create(form)
      setAlert({ type: 'success', msg: 'Stock opname berhasil dicatat.' })
      setShowAdd(false)
      fetchOpnames()
    } catch (err) {
      const errs = getValidationErrors(err)
      if (Object.keys(errs).length) setFormErrors(errs)
      else setAlert({ type: 'error', msg: getErrorMessage(err) })
    } finally { setSaving(false) }
  }

  async function handleVerify(verifyData) {
    if (!verifyTarget) return
    setVerifying(true)
    try {
      await stockOpnameAPI.verify(verifyTarget.id, verifyData)
      setAlert({ type: 'success', msg: 'Stock opname berhasil diverifikasi.' })
      setVerifyTarget(null)
      fetchOpnames()
    } catch (err) {
      setAlert({ type: 'error', msg: getErrorMessage(err) })
      setVerifyTarget(null)
    } finally { setVerifying(false) }
  }

  return (
    <AppLayout title="Stock Opname">
      <div className="page-content animate-fade-in">
        <PageHeader title="Stock Opname" subtitle="Pencatatan dan verifikasi stok fisik vs sistem">
          <button onClick={() => { setShowAdd(true); setFormErrors({}) }} className="btn btn-primary">
            <Plus className="w-4 h-4" />
            Catat Opname
          </button>
        </PageHeader>

        {alert && <Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} className="mb-4" />}

        {/* Filter */}
        <div className="flex items-center gap-3 mb-4">
          <SearchBar value={search} onChange={v => { setSearch(v); setPage(1) }}
            placeholder="Cari produk atau batch..." className="flex-1" />
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
            className="form-input form-select w-40">
            <option value="">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
          </select>
        </div>

        {/* Tabel */}
        <div className="card">
          <div className="table-wrapper rounded-none border-none">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Produk / Batch</th>
                  <th className="text-right">Stok Sistem</th>
                  <th className="text-right">Stok Fisik</th>
                  <th className="text-right">Selisih</th>
                  <th>Dicatat oleh</th>
                  <th>Status</th>
                  {isAdmin && <th className="text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(6).fill(0).map((_, i) => (
                    <tr key={i}>{Array(isAdmin ? 8 : 7).fill(0).map((_, j) => (
                      <td key={j}><Skeleton className="h-4" /></td>
                    ))}</tr>
                  ))
                ) : opnames.length === 0 ? (
                  <tr><td colSpan={isAdmin ? 8 : 7}>
                    <EmptyState icon={ClipboardList} title="Belum ada data stock opname"
                      description="Klik 'Catat Opname' untuk memulai pencatatan stok fisik." />
                  </td></tr>
                ) : opnames.map(op => (
                  <tr key={op.id}>
                    <td><span className="text-sm whitespace-nowrap">{formatDate(op.opname_date)}</span></td>
                    <td>
                      <p className="font-semibold text-slate-800">{op.inventory_batch?.product?.product_name}</p>
                      <p className="text-xs font-mono text-slate-400">{op.inventory_batch?.batch_no}</p>
                    </td>
                    <td className="text-right">
                      <span className="font-medium">{formatNumber(op.system_quantity)}</span>
                    </td>
                    <td className="text-right">
                      <span className="font-medium">{formatNumber(op.physical_quantity)}</span>
                    </td>
                    <td className="text-right">
                      <span className={`font-bold ${
                        op.difference > 0 ? 'text-blue-600' :
                        op.difference < 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {op.difference > 0 ? '+' : ''}{formatNumber(op.difference)}
                      </span>
                    </td>
                    <td><span className="text-sm text-slate-600">{op.user?.name}</span></td>
                    <td>
                      <span className={`badge ${op.status === 'verified' ? 'badge-active' : 'badge-pending'}`}>
                        {op.status === 'verified' ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td>
                        <div className="flex justify-end">
                          {op.status === 'pending' ? (
                            <button onClick={() => setVerifyTarget(op)}
                              className="btn btn-ghost btn-sm text-green-700 hover:bg-green-50">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span className="text-xs">Verifikasi</span>
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400">
                              {op.verifier?.name ?? 'Admin'} · {formatDate(op.verified_at)}
                            </span>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination meta={meta} onPageChange={setPage} />
        </div>
      </div>

      {/* Modal Add Opname */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Catat Stock Opname Baru" size="md"
        footer={
          <>
            <button onClick={() => setShowAdd(false)} className="btn btn-secondary" disabled={saving}>Batal</button>
            <button type="submit" form="opname-form" className="btn btn-primary" disabled={saving}
              style={{ background: '#166534' }}>
              {saving ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Menyimpan...</>
                : <><ClipboardList className="w-4 h-4" /> Simpan Opname</>}
            </button>
          </>
        }>
        <OpnameForm batches={batches} onSubmit={handleAddOpname} loading={saving} errors={formErrors} />
      </Modal>

      {/* Modal Verifikasi */}
      <VerifyModal
        open={Boolean(verifyTarget)}
        opname={verifyTarget}
        onClose={() => setVerifyTarget(null)}
        onVerify={handleVerify}
        loading={verifying}
      />
    </AppLayout>
  )
}
