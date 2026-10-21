import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, Package, Search } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import Modal, { ConfirmModal } from '../../components/ui/Modal'
import Alert from '../../components/ui/Alert'
import { PageHeader, SearchBar, EmptyState, Skeleton, Pagination } from '../../components/shared/SharedComponents'
import { productAPI, categoryAPI } from '../../api'
import { getErrorMessage, getValidationErrors, formatNumber } from '../../utils/helpers'

// ─── Form Modal Add/Edit Produk ───────────────────────────────────────────
function ProductForm({ initial = {}, categories = [], onSubmit, loading, errors }) {
  const [form, setForm] = useState({
    product_name:  initial.product_name  ?? '',
    category_id:   initial.category_id   ?? '',
    brand:         initial.brand         ?? '',
    unit:          initial.unit          ?? '',
    minimum_stock: initial.minimum_stock ?? '',
    description:   initial.description   ?? '',
  })

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit(form)
  }

  const units = ['L', 'mL', 'Kg', 'g', 'Pcs', 'Pak', 'Karton', 'Botol', 'Sachet']

  return (
    <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Nama Produk */}
        <div className="form-group col-span-2">
          <label className="form-label">Nama Produk *</label>
          <input name="product_name" value={form.product_name} onChange={handleChange}
            placeholder="Contoh: Roundup 486 SL" className={`form-input ${errors?.product_name ? 'error' : ''}`} />
          {errors?.product_name && <p className="form-error">{errors.product_name[0]}</p>}
        </div>

        {/* Kategori */}
        <div className="form-group">
          <label className="form-label">Kategori *</label>
          <select name="category_id" value={form.category_id} onChange={handleChange}
            className={`form-input form-select ${errors?.category_id ? 'error' : ''}`}>
            <option value="">-- Pilih Kategori --</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors?.category_id && <p className="form-error">{errors.category_id[0]}</p>}
        </div>

        {/* Merek */}
        <div className="form-group">
          <label className="form-label">Merek / Brand</label>
          <input name="brand" value={form.brand} onChange={handleChange}
            placeholder="Contoh: Monsanto" className="form-input" />
        </div>

        {/* Satuan */}
        <div className="form-group">
          <label className="form-label">Satuan *</label>
          <select name="unit" value={form.unit} onChange={handleChange}
            className={`form-input form-select ${errors?.unit ? 'error' : ''}`}>
            <option value="">-- Pilih Satuan --</option>
            {units.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
          {errors?.unit && <p className="form-error">{errors.unit[0]}</p>}
        </div>

        {/* Stok Minimum */}
        <div className="form-group">
          <label className="form-label">Stok Minimum</label>
          <input name="minimum_stock" type="number" min="0" value={form.minimum_stock} onChange={handleChange}
            placeholder="0" className="form-input" />
          <p className="text-xs text-slate-400 mt-1">Untuk notifikasi stok rendah</p>
        </div>

        {/* Deskripsi */}
        <div className="form-group col-span-2">
          <label className="form-label">Deskripsi</label>
          <textarea name="description" value={form.description} onChange={handleChange}
            placeholder="Deskripsi singkat produk..." rows={3}
            className="form-input resize-none" />
        </div>
      </div>
    </form>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const [products,    setProducts]    = useState([])
  const [categories,  setCategories]  = useState([])
  const [meta,        setMeta]        = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [catFilter,   setCatFilter]   = useState('')
  const [page,        setPage]        = useState(1)

  const [showModal,   setShowModal]   = useState(false)
  const [editItem,    setEditItem]    = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const [saving,      setSaving]      = useState(false)
  const [deleting,    setDeleting]    = useState(false)
  const [formErrors,  setFormErrors]  = useState({})
  const [alert,       setAlert]       = useState(null)

  // ─── Fetch data ──────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await productAPI.getAll({ search, category_id: catFilter, page })
      setProducts(data.data ?? [])
      setMeta(data)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [search, catFilter, page])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  useEffect(() => {
    categoryAPI.getAll().then(({ data }) => setCategories(data))
  }, [])

  // ─── Handlers ────────────────────────────────────────────────────────
  function openAdd() { setEditItem(null); setFormErrors({}); setShowModal(true) }
  function openEdit(product) { setEditItem(product); setFormErrors({}); setShowModal(true) }
  function openDelete(product) { setDeleteTarget(product); setShowConfirm(true) }

  async function handleSave(form) {
    setSaving(true)
    setFormErrors({})
    try {
      if (editItem) {
        await productAPI.update(editItem.id, form)
        setAlert({ type: 'success', msg: `Produk "${form.product_name}" berhasil diperbarui.` })
      } else {
        await productAPI.create(form)
        setAlert({ type: 'success', msg: `Produk "${form.product_name}" berhasil ditambahkan.` })
      }
      setShowModal(false)
      fetchProducts()
    } catch (err) {
      const errs = getValidationErrors(err)
      if (Object.keys(errs).length) {
        setFormErrors(errs)
      } else {
        setAlert({ type: 'error', msg: getErrorMessage(err) })
        setShowModal(false)
      }
    } finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await productAPI.delete(deleteTarget.id)
      setAlert({ type: 'success', msg: `Produk "${deleteTarget.product_name}" berhasil dihapus.` })
      setShowConfirm(false)
      fetchProducts()
    } catch (err) {
      setAlert({ type: 'error', msg: getErrorMessage(err) })
      setShowConfirm(false)
    } finally { setDeleting(false) }
  }

  return (
    <AppLayout title="Master Produk">
      <div className="page-content animate-fade-in">

        <PageHeader title="Master Produk" subtitle="Kelola data produk agrokimia">
          <button onClick={openAdd} className="btn btn-primary">
            <Plus className="w-4 h-4" />
            Tambah Produk
          </button>
        </PageHeader>

        {alert && (
          <Alert type={alert.type} message={alert.msg}
            onClose={() => setAlert(null)} className="mb-4" />
        )}

        {/* Filter bar */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <SearchBar
            value={search}
            onChange={v => { setSearch(v); setPage(1) }}
            placeholder="Cari nama produk atau merek..."
            className="flex-1 min-w-[200px]"
          />
          <select
            value={catFilter}
            onChange={e => { setCatFilter(e.target.value); setPage(1) }}
            className="form-input form-select w-44"
          >
            <option value="">Semua Kategori</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Tabel produk */}
        <div className="card">
          <div className="table-wrapper rounded-none border-none">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Produk</th>
                  <th>Kategori</th>
                  <th>Merek</th>
                  <th>Satuan</th>
                  <th>Total Stok</th>
                  <th>Min. Stok</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(6).fill(0).map((_, i) => (
                    <tr key={i}>
                      {Array(7).fill(0).map((_, j) => (
                        <td key={j}><Skeleton className="h-4" /></td>
                      ))}
                    </tr>
                  ))
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState
                        icon={Package}
                        title="Belum ada produk"
                        description="Mulai tambah produk agrokimia yang dikelola di gudang."
                        action={
                          <button onClick={openAdd} className="btn btn-primary btn-sm">
                            <Plus className="w-3.5 h-3.5" /> Tambah Produk
                          </button>
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  products.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div>
                          <p className="font-semibold text-slate-800">{p.product_name}</p>
                          {p.description && (
                            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px]">{p.description}</p>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-user text-xs">{p.category?.name}</span>
                      </td>
                      <td><span className="text-slate-600">{p.brand || '-'}</span></td>
                      <td><span className="font-mono text-sm">{p.unit}</span></td>
                      <td>
                        <span className="font-semibold text-slate-800">
                          {formatNumber(p.total_stock ?? 0)}
                        </span>
                        <span className="text-slate-400 text-xs ml-1">{p.unit}</span>
                      </td>
                      <td>
                        {p.minimum_stock > 0 ? (
                          <span className={`font-medium ${(p.total_stock ?? 0) < p.minimum_stock ? 'text-red-600' : 'text-slate-600'}`}>
                            {formatNumber(p.minimum_stock)}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(p)}
                            className="btn btn-ghost btn-icon btn-sm text-slate-500 hover:text-blue-600">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => openDelete(p)}
                            className="btn btn-ghost btn-icon btn-sm text-slate-500 hover:text-red-600">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Modal Add/Edit */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editItem ? 'Edit Produk' : 'Tambah Produk Baru'}
        size="lg"
        footer={
          <>
            <button onClick={() => setShowModal(false)} className="btn btn-secondary" disabled={saving}>
              Batal
            </button>
            <button
              type="submit" form="product-form"
              className="btn btn-primary" disabled={saving}>
              {saving
                ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Menyimpan...</>
                : editItem ? 'Simpan Perubahan' : 'Tambah Produk'}
            </button>
          </>
        }
      >
        <ProductForm
          initial={editItem}
          categories={categories}
          onSubmit={handleSave}
          loading={saving}
          errors={formErrors}
        />
      </Modal>

      {/* Konfirmasi hapus */}
      <ConfirmModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Hapus Produk"
        message={`Apakah Anda yakin ingin menghapus produk "${deleteTarget?.product_name}"? Aksi ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus"
      />
    </AppLayout>
  )
}
