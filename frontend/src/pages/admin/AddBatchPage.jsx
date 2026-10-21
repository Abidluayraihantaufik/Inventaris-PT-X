import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, Save, Package, MapPin, Calendar,
  Hash, FileText, AlertTriangle
} from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import Alert from '../../components/ui/Alert'
import { ExpiryBadge } from '../../components/ui/Badge'
import { inventoryAPI, productAPI, categoryAPI } from '../../api'
import { formatDate, formatNumber, getErrorMessage, getValidationErrors, toInputDate } from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'

export default function AddBatchPage() {
  const navigate   = useNavigate()
  const { id }     = useParams()            // ada id = edit mode
  const { isAdmin }= useAuth()
  const isEdit     = Boolean(id)

  const [products,  setProducts]   = useState([])
  const [loading,   setLoading]    = useState(false)
  const [saving,    setSaving]     = useState(false)
  const [alert,     setAlert]      = useState(null)
  const [formErrors,setFormErrors] = useState({})
  const [batchData, setBatchData]  = useState(null) // untuk edit mode

  const [form, setForm] = useState({
    product_id:       '',
    batch_no:         '',
    entry_date:       new Date().toISOString().slice(0, 10),
    expiry_date:      '',
    initial_quantity: '',
    storage_location: '',
    supplier:         '',
    notes:            '',
  })

  // Fetch daftar produk untuk dropdown
  useEffect(() => {
    productAPI.getAll({ per_page: 999 })
      .then(({ data }) => setProducts(data.data ?? []))
  }, [])

  // Jika edit mode, load data batch
  useEffect(() => {
    if (!isEdit) return
    setLoading(true)
    inventoryAPI.getOne(id)
      .then(({ data }) => {
        setBatchData(data)
        setForm({
          product_id:       data.product_id,
          batch_no:         data.batch_no,
          entry_date:       toInputDate(data.entry_date),
          expiry_date:      toInputDate(data.expiry_date),
          initial_quantity: data.initial_quantity,
          storage_location: data.storage_location ?? '',
          supplier:         data.supplier ?? '',
          notes:            data.notes ?? '',
        })
      })
      .catch(() => setAlert({ type: 'error', msg: 'Gagal memuat data batch.' }))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (formErrors[e.target.name]) {
      setFormErrors(prev => ({ ...prev, [e.target.name]: null }))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setFormErrors({})
    setAlert(null)
    try {
      if (isEdit) {
        await inventoryAPI.update(id, form)
        setAlert({ type: 'success', msg: 'Batch berhasil diperbarui.' })
      } else {
        await inventoryAPI.create(form)
        setAlert({ type: 'success', msg: 'Batch berhasil ditambahkan ke inventaris.' })
        // Reset form setelah tambah
        setForm(prev => ({
          ...prev,
          batch_no: '', expiry_date: '', initial_quantity: '',
          storage_location: '', supplier: '', notes: '',
        }))
      }
    } catch (err) {
      const errs = getValidationErrors(err)
      if (Object.keys(errs).length) setFormErrors(errs)
      else setAlert({ type: 'error', msg: getErrorMessage(err) })
    } finally {
      setSaving(false)
    }
  }

  const selectedProduct = products.find(p => p.id === Number(form.product_id))

  return (
    <AppLayout title={isEdit ? 'Edit Batch' : 'Tambah Batch'}>
      <div className="page-content animate-fade-in max-w-3xl">

        {/* Back button */}
        <button
          onClick={() => navigate('/admin/inventory')}
          className="btn btn-ghost btn-sm mb-4 -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Inventaris
        </button>

        <div className="page-header">
          <div>
            <h1 className="page-title">{isEdit ? 'Edit Batch' : 'Tambah Batch Masuk'}</h1>
            <p className="page-subtitle">
              {isEdit ? `Batch #${batchData?.batch_no}` : 'Catat penerimaan barang dari supplier'}
            </p>
          </div>
          {isEdit && batchData && (
            <ExpiryBadge expiryDate={batchData.expiry_date} showDays />
          )}
        </div>

        {alert && <Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} className="mb-5" />}

        <form onSubmit={handleSubmit} className="card p-6">
          <div className="grid grid-cols-2 gap-5">

            {/* Produk */}
            <div className="form-group col-span-2">
              <label className="form-label flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-slate-400" /> Produk *
              </label>
              <select name="product_id" value={form.product_id} onChange={handleChange}
                disabled={isEdit}
                className={`form-input form-select ${formErrors.product_id ? 'error' : ''} ${isEdit ? 'opacity-60 cursor-not-allowed' : ''}`}>
                <option value="">-- Pilih Produk --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.product_name} ({p.unit})</option>
                ))}
              </select>
              {formErrors.product_id && <p className="form-error">{formErrors.product_id[0]}</p>}
              {selectedProduct && (
                <p className="text-xs text-slate-400 mt-1">
                  Kategori: {selectedProduct.category?.name} · Merek: {selectedProduct.brand || '-'}
                </p>
              )}
            </div>

            {/* No Batch */}
            <div className="form-group">
              <label className="form-label flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-slate-400" /> Nomor Batch *
              </label>
              <input name="batch_no" value={form.batch_no} onChange={handleChange}
                className={`form-input font-mono ${formErrors.batch_no ? 'error' : ''}`} />
              {formErrors.batch_no && <p className="form-error">{formErrors.batch_no[0]}</p>}
            </div>

            {/* Supplier */}
            <div className="form-group">
              <label className="form-label">Supplier / Distributor</label>
              <input name="supplier" value={form.supplier} onChange={handleChange}
                placeholder="Nama supplier" className="form-input" />
            </div>

            {/* Tgl Masuk */}
            <div className="form-group">
              <label className="form-label flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Tanggal Masuk *
              </label>
              <input name="entry_date" type="date" value={form.entry_date} onChange={handleChange}
                className={`form-input ${formErrors.entry_date ? 'error' : ''}`} />
              {formErrors.entry_date && <p className="form-error">{formErrors.entry_date[0]}</p>}
            </div>

            {/* Tgl Kadaluarsa */}
            <div className="form-group">
              <label className="form-label flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Tanggal Kadaluarsa *
              </label>
              <input name="expiry_date" type="date" value={form.expiry_date} onChange={handleChange}
                min={form.entry_date}
                className={`form-input ${formErrors.expiry_date ? 'error' : ''}`} />
              {formErrors.expiry_date && <p className="form-error">{formErrors.expiry_date[0]}</p>}
              {form.expiry_date && (
                <div className="mt-1.5">
                  <ExpiryBadge expiryDate={form.expiry_date} showDays />
                </div>
              )}
            </div>

            {/* Jumlah */}
            <div className="form-group">
              <label className="form-label">
                Jumlah Awal {selectedProduct && `(${selectedProduct.unit})`} *
              </label>
              <input name="initial_quantity" type="number" min="0.01" step="0.01"
                value={form.initial_quantity} onChange={handleChange}
                placeholder="0"
                className={`form-input ${formErrors.initial_quantity ? 'error' : ''}`}
                disabled={isEdit}
              />
              {formErrors.initial_quantity && <p className="form-error">{formErrors.initial_quantity[0]}</p>}
              {isEdit && (
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Jumlah awal tidak dapat diubah. Gunakan Stock Opname untuk koreksi stok.
                </p>
              )}
            </div>

            {/* Lokasi */}
            <div className="form-group">
              <label className="form-label flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Lokasi Penyimpanan
              </label>
              <input name="storage_location" value={form.storage_location} onChange={handleChange}
                placeholder="Contoh: Rack A1, Gudang B" className="form-input" />
            </div>

            {/* Catatan */}
            <div className="form-group col-span-2">
              <label className="form-label flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" /> Catatan
              </label>
              <textarea name="notes" value={form.notes} onChange={handleChange}
                rows={3} placeholder="Catatan tambahan (opsional)"
                className="form-input resize-none" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <button type="button" onClick={() => navigate('/admin/inventory')} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Menyimpan...</>
                : <><Save className="w-4 h-4" /> {isEdit ? 'Simpan Perubahan' : 'Tambah ke Inventaris'}</>
              }
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
