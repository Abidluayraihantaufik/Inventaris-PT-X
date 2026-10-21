import { useEffect, useState, useCallback } from 'react'
import { PackageMinus, Search, AlertTriangle, ChevronRight, CheckCircle, Info } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import Alert from '../../components/ui/Alert'
import Modal from '../../components/ui/Modal'
import { ExpiryBadge } from '../../components/ui/Badge'
import { PageHeader, SearchBar } from '../../components/shared/SharedComponents'
import { productAPI, stockOutAPI } from '../../api'
import { formatDate, formatNumber, getErrorMessage, getValidationErrors } from '../../utils/helpers'

// ─── Komponen: FEFO Recommendation Card ──────────────────────────────────
function FefoCard({ batch, index, qty, onQtyChange }) {
  return (
    <div className={`flex items-start gap-3 p-3.5 rounded-xl border transition-colors ${
      index === 0 ? 'border-green-300 bg-green-50' : 'border-slate-200 bg-white'
    }`}>
      {/* Prioritas badge */}
      <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
        index === 0 ? 'bg-green-700 text-white' : 'bg-slate-200 text-slate-600'
      }`}>
        {index + 1}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <p className="font-semibold text-slate-800 text-sm">{batch.batch_no}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Lokasi: {batch.storage_location ?? '-'}
            </p>
          </div>
          <ExpiryBadge expiryDate={batch.expiry_date} showDays />
        </div>

        <div className="flex items-center gap-4 mt-2 text-xs text-slate-600">
          <span>Kadaluarsa: <strong>{formatDate(batch.expiry_date)}</strong></span>
          <span>Stok: <strong className="text-slate-800">{formatNumber(batch.stock_quantity)}</strong></span>
        </div>

        {/* Input qty untuk batch ini */}
        {qty !== undefined && (
          <div className="mt-2.5 flex items-center gap-2">
            <label className="text-xs font-medium text-slate-700 whitespace-nowrap">
              Ambil dari batch ini:
            </label>
            <input
              type="number"
              min={0}
              max={batch.stock_quantity}
              step="0.01"
              value={qty}
              onWheel={(e) => e.target.blur()}
              onChange={e => onQtyChange(Number(e.target.value))}
              className="form-input py-1 px-2 text-sm w-28"
              placeholder="0"
            />
          </div>
        )}
      </div>

      {index === 0 && (
        <div className="flex-shrink-0 text-green-600 text-xs font-medium whitespace-nowrap">
          ← FEFO
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function StockOutPage() {
  const [products,      setProducts]      = useState([])
  const [selectedProd,  setSelectedProd]  = useState(null)
  const [fefoBatches,   setFefoBatches]   = useState([])
  const [fefoLoading,   setFefoLoading]   = useState(false)
  const [productSearch, setProductSearch] = useState('')

  // Form state
  const [outDate,      setOutDate]      = useState(new Date().toISOString().slice(0, 10))
  const [recipient,    setRecipient]    = useState('')
  const [purpose,      setPurpose]      = useState('')
  const [notes,        setNotes]        = useState('')
  const [batchQtys,    setBatchQtys]    = useState({}) // { batchId: qty }
  const [useManual,    setUseManual]    = useState(false) // mode manual override

  const [saving,       setSaving]       = useState(false)
  const [alert,        setAlert]        = useState(null)
  const [formErrors,   setFormErrors]   = useState({})
  const [showSuccess,  setShowSuccess]  = useState(false)
  const [lastResult,   setLastResult]   = useState(null)

  // ─── Fetch produk ────────────────────────────────────────────────────
  useEffect(() => {
    productAPI.getAll({ per_page: 999 })
      .then(({ data }) => setProducts(data.data ?? []))
  }, [])

  // Filter produk berdasarkan search
  const filteredProducts = products.filter(p =>
    p.product_name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category?.name?.toLowerCase().includes(productSearch.toLowerCase())
  )

  // ─── Ambil rekomendasi FEFO saat pilih produk ─────────────────────────
  async function selectProduct(product) {
    setSelectedProd(product)
    setFefoBatches([])
    setBatchQtys({})
    setAlert(null)
    setFefoLoading(true)
    try {
      const { data } = await stockOutAPI.fefo(product.id)
      setFefoBatches(data.batches ?? [])
      // Default: ambil semua dari batch pertama (FEFO)
      if (data.batches?.length > 0) {
        setBatchQtys({ [data.batches[0].id]: 0 })
      }
    } catch {
      setAlert({ type: 'error', msg: 'Gagal memuat data stok. Coba lagi.' })
    } finally {
      setFefoLoading(false)
    }
  }

  // Total qty yang akan dikeluarkan
  const totalOut = Object.values(batchQtys).reduce((sum, q) => sum + (Number(q) || 0), 0)

  // ─── Submit ──────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault()
    if (!selectedProd) { setAlert({ type: 'error', msg: 'Pilih produk terlebih dahulu.' }); return }
    if (totalOut <= 0) { setAlert({ type: 'error', msg: 'Masukkan jumlah yang akan dikeluarkan.' }); return }

    setSaving(true)
    setFormErrors({})
    setAlert(null)

    try {
      const payload = {
        product_id:    selectedProd.id,
        out_date:      outDate,
        recipient,
        purpose,
        notes,
        batches:       Object.entries(batchQtys)
                         .filter(([, q]) => Number(q) > 0)
                         .map(([id, qty]) => ({ batch_id: Number(id), quantity: Number(qty) })),
      }

      const { data } = await stockOutAPI.create(payload)
      setLastResult(data)
      setShowSuccess(true)

      // Reset form
      setSelectedProd(null)
      setFefoBatches([])
      setBatchQtys({})
      setRecipient('')
      setPurpose('')
      setNotes('')
    } catch (err) {
      const errs = getValidationErrors(err)
      if (Object.keys(errs).length) setFormErrors(errs)
      else setAlert({ type: 'error', msg: getErrorMessage(err) })
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppLayout title="Barang Keluar">
      <div className="page-content animate-fade-in">
        <PageHeader title="Barang Keluar" subtitle="Catat pengeluaran barang dengan rekomendasi FEFO otomatis" />

        {alert && <Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} className="mb-4" />}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* ─── Kiri: Pilih Produk ──────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="card p-4">
              <h3 className="font-semibold text-slate-800 mb-3 text-sm" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                1. Pilih Produk
              </h3>
              <SearchBar
                value={productSearch}
                onChange={setProductSearch}
                placeholder="Cari nama produk..."
                className="mb-3"
              />
              <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-0.5">
                {filteredProducts.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-6">Tidak ada produk ditemukan.</p>
                ) : filteredProducts.map(p => (
                  <button
                    key={p.id}
                    onClick={() => selectProduct(p)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all text-sm ${
                      selectedProd?.id === p.id
                        ? 'border-green-600 bg-green-50 text-green-800'
                        : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <p className="font-semibold">{p.product_name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {p.category?.name} · Stok: {formatNumber(p.total_stock ?? 0)} {p.unit}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ─── Kanan: Form + FEFO ──────────────────────────────────── */}
          <div className="lg:col-span-3">
            {!selectedProd ? (
              <div className="card flex items-center justify-center py-20 text-center">
                <div>
                  <PackageMinus className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">Pilih produk di sebelah kiri</p>
                  <p className="text-sm text-slate-400 mt-1">untuk melihat rekomendasi FEFO</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* ─── Info produk ──────────────────────────────── */}
                <div className="card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-slate-800 text-sm" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                      2. Rekomendasi FEFO — {selectedProd.product_name}
                    </h3>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      Total stok: {formatNumber(selectedProd.total_stock ?? 0)} {selectedProd.unit}
                    </span>
                  </div>

                  {/* FEFO info box */}
                  <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5 mb-3 text-xs text-blue-700">
                    <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span>
                      Sistem merekomendasikan pengambilan dari batch dengan tanggal kadaluarsa paling dekat (FEFO).
                      Anda bisa membagi jumlah ke beberapa batch.
                    </span>
                  </div>

                  {fefoLoading ? (
                    <div className="flex items-center gap-2 py-4 text-slate-400 text-sm">
                      <span className="w-4 h-4 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin" />
                      Memuat data stok...
                    </div>
                  ) : fefoBatches.length === 0 ? (
                    <div className="flex items-center gap-2 py-4 text-amber-600 text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      Tidak ada stok tersedia untuk produk ini.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {fefoBatches.map((batch, i) => (
                        <FefoCard
                          key={batch.id}
                          batch={batch}
                          index={i}
                          qty={batchQtys[batch.id] ?? ''}
                          onQtyChange={qty => setBatchQtys(prev => ({ ...prev, [batch.id]: qty }))}
                        />
                      ))}
                    </div>
                  )}

                  {/* Total */}
                  {totalOut > 0 && (
                    <div className="mt-3 flex items-center justify-end gap-2 py-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                      <span className="text-sm text-slate-600">Total yang akan dikeluarkan:</span>
                      <span className="font-bold text-lg text-green-700" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                        {formatNumber(totalOut)} {selectedProd.unit}
                      </span>
                    </div>
                  )}
                </div>

                {/* ─── Detail transaksi ─────────────────────────── */}
                <div className="card p-4">
                  <h3 className="font-semibold text-slate-800 text-sm mb-3" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                    3. Detail Transaksi
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-group">
                      <label className="form-label text-xs">Tanggal Keluar *</label>
                      <input type="date" value={outDate} onChange={e => setOutDate(e.target.value)}
                        className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label text-xs">Penerima / Divisi *</label>
                      <input type="text" value={recipient} onChange={e => setRecipient(e.target.value)}
                        placeholder="Nama penerima atau divisi"
                        className={`form-input ${formErrors.recipient ? 'error' : ''}`} />
                      {formErrors.recipient && <p className="form-error">{formErrors.recipient[0]}</p>}
                    </div>
                    <div className="form-group col-span-2">
                      <label className="form-label text-xs">Tujuan Penggunaan *</label>
                      <input type="text" value={purpose} onChange={e => setPurpose(e.target.value)}
                        placeholder="Contoh: Aplikasi lahan blok A3"
                        className={`form-input ${formErrors.purpose ? 'error' : ''}`} />
                      {formErrors.purpose && <p className="form-error">{formErrors.purpose[0]}</p>}
                    </div>
                    <div className="form-group col-span-2">
                      <label className="form-label text-xs">Catatan</label>
                      <textarea value={notes} onChange={e => setNotes(e.target.value)}
                        rows={2} placeholder="Catatan tambahan (opsional)"
                        className="form-input resize-none text-sm" />
                    </div>
                  </div>
                </div>

                {/* ─── Submit ───────────────────────────────────── */}
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setSelectedProd(null)} className="btn btn-secondary">
                    Batal
                  </button>
                  <button type="submit" disabled={saving || totalOut === 0 || fefoBatches.length === 0}
                    className="btn btn-primary">
                    {saving ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Memproses...</>
                    ) : (
                      <><PackageMinus className="w-4 h-4" /> Catat Pengeluaran</>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ─── Modal Sukses ─────────────────────────────────────────── */}
      <Modal open={showSuccess} onClose={() => setShowSuccess(false)} title="Transaksi Berhasil!" size="sm"
        footer={
          <button onClick={() => setShowSuccess(false)} className="btn btn-primary" style={{ background: '#166534' }}>
            OK, Selesai
          </button>
        }>
        <div className="text-center py-2">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-7 h-7 text-green-600" />
          </div>
          {lastResult && (
            <>
              <p className="font-semibold text-slate-800 mb-1">{lastResult.product?.product_name}</p>
              <p className="text-slate-500 text-sm mb-3">
                {formatNumber(lastResult.total_out)} {lastResult.product?.unit} berhasil dicatat keluar
              </p>
              <div className="bg-slate-50 rounded-lg px-4 py-3 text-sm text-left space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Penerima</span>
                  <span className="font-medium text-slate-800">{lastResult.recipient}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tujuan</span>
                  <span className="font-medium text-slate-800">{lastResult.purpose}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>
    </AppLayout>
  )
}
