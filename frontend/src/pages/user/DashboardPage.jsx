import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, PackageMinus, ClipboardList, Clock,
  AlertTriangle, ChevronRight, RefreshCw, Archive
} from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import { Skeleton, EmptyState } from '../../components/shared/SharedComponents'
import { ExpiryBadge } from '../../components/ui/Badge'
import { dashboardAPI } from '../../api'
import { formatDate, formatNumber } from '../../utils/helpers'

export default function UserDashboardPage() {
  const navigate = useNavigate()
  const [summary,  setSummary]  = useState(null)
  const [alerts,   setAlerts]   = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')

  async function fetchAll() {
    setLoading(true)
    try {
      const [s, a] = await Promise.all([
        dashboardAPI.summary(),
        dashboardAPI.alerts(),
      ])
      setSummary(s.data)
      setAlerts(a.data)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  function handleSearch(e) {
    e.preventDefault()
    if (search.trim()) navigate(`/inventory?search=${encodeURIComponent(search.trim())}`)
  }

  return (
    <AppLayout title="Dashboard">
      <div className="page-content animate-fade-in">

        {/* ─── Search cepat ─────────────────────────────────────────── */}
        <div className="card p-6 mb-5" style={{ background: 'linear-gradient(135deg, #166534 0%, #15803d 100%)' }}>
          <h1 className="text-white font-bold text-xl mb-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Cari Barang atau Lokasi Rak
          </h1>
          <p className="text-white/70 text-sm mb-4">Masukkan nama produk, nomor batch, atau lokasi</p>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Contoh: Roundup, Rack A1, batch #..."
                className="form-input pl-9 w-full"
              />
            </div>
            <button type="submit" className="btn btn-accent flex-shrink-0">
              <Search className="w-4 h-4" />
              Cari
            </button>
          </form>
        </div>

        {/* ─── Shortcut actions ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Barang Keluar',  icon: PackageMinus,  to: '/stock-out',    color: '#1d4ed8', bg: '#eff6ff' },
            { label: 'Stock Opname',   icon: ClipboardList, to: '/stock-opname', color: '#7c3aed', bg: '#ede9fe' },
            { label: 'Daftar Stok',    icon: Archive,       to: '/inventory',    color: '#166534', bg: '#f0fdf4' },
          ].map(({ label, icon: Icon, to, color, bg }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="card p-4 flex items-center gap-3 hover:shadow-md transition-all text-left"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <span className="font-semibold text-slate-800 text-sm">{label}</span>
              <ChevronRight className="w-4 h-4 text-slate-300 ml-auto" />
            </button>
          ))}
        </div>

        {/* ─── Ringkasan stok ───────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {loading ? (
            Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-20" />)
          ) : (
            <>
              {[
                { label: 'Batch Expired',   value: summary?.expiry_expired ?? 0,  color: '#64748b', bg: '#f1f5f9' },
                { label: 'Kritis',          value: summary?.expiry_critical ?? 0, color: '#dc2626', bg: '#fff1f2' },
                { label: 'Perhatian',       value: summary?.expiry_warning ?? 0,  color: '#d97706', bg: '#fefce8' },
              ].map(({ label, value, color, bg }) => (
                <div key={label} className="card p-4 text-center">
                  <p className="text-2xl font-bold" style={{ color, fontFamily: 'Plus Jakarta Sans' }}>{value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                </div>
              ))}
            </>
          )}
        </div>

        {/* ─── Batch prioritas (kritis + expired) ───────────────────── */}
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <h2 className="font-semibold text-slate-800" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Batch Perlu Diprioritaskan
            </h2>
            <button onClick={() => navigate('/inventory')} className="btn btn-ghost btn-sm text-green-700">
              Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="p-5 space-y-3">
              {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : !alerts?.critical?.length && !alerts?.expired?.length ? (
            <EmptyState
              icon={Clock}
              title="Tidak ada batch prioritas"
              description="Semua batch dalam kondisi aman."
            />
          ) : (
            <div className="divide-y" style={{ borderColor: '#f1f5f9' }}>
              {[...(alerts?.expired ?? []), ...(alerts?.critical ?? [])].slice(0, 6).map((batch) => (
                <button
                  key={batch.id}
                  onClick={() => navigate(`/inventory/${batch.id}`)}
                  className="w-full px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{batch.product?.product_name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {batch.batch_no} · Rak {batch.storage_location}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-medium text-slate-700">
                      {formatNumber(batch.stock_quantity)} <span className="text-slate-400 text-xs">{batch.product?.unit}</span>
                    </p>
                    <ExpiryBadge expiryDate={batch.expiry_date} showDays />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    </AppLayout>
  )
}
