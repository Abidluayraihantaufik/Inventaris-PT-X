import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Package, Archive, PackageMinus, AlertTriangle,
  TrendingDown, Clock, ChevronRight, RefreshCw
} from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import AppLayout from '../../components/layout/AppLayout'
import { StatCard, Skeleton, EmptyState } from '../../components/shared/SharedComponents'
import { ExpiryBadge } from '../../components/ui/Badge'
import { dashboardAPI } from '../../api'
import { formatDate, formatNumber, CHART_COLORS } from '../../utils/helpers'

// ─── Format label bulan untuk chart ──────────────────────────────────────
function formatMonth(month) {
  if (!month) return ''
  const [year, m] = month.split('-')
  const names = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  return `${names[parseInt(m)]} ${year.slice(2)}`
}

export default function DashboardPage() {
  const navigate = useNavigate()

  const [summary,  setSummary]  = useState(null)
  const [charts,   setCharts]   = useState(null)
  const [alerts,   setAlerts]   = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  async function fetchAll() {
    setLoading(true)
    setError(null)
    try {
      const [s, c, a] = await Promise.all([
        dashboardAPI.summary(),
        dashboardAPI.charts(),
        dashboardAPI.alerts(),
      ])
      setSummary(s.data)
      setCharts(c.data)
      setAlerts(a.data)
    } catch {
      setError('Gagal memuat data dashboard. Coba refresh.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  // ─── Gabungkan data tren masuk + keluar untuk chart ──────────────────
  const trendData = (() => {
    if (!charts) return []
    const months = {}
    charts.in_trend?.forEach(d => {
      months[d.month] = { month: d.month, masuk: Number(d.total_qty ?? 0) }
    })
    charts.out_trend?.forEach(d => {
      if (!months[d.month]) months[d.month] = { month: d.month, masuk: 0 }
      months[d.month].keluar = Number(d.total_qty ?? 0)
    })
    return Object.values(months)
      .sort((a, b) => a.month.localeCompare(b.month))
      .map(d => ({ ...d, month: formatMonth(d.month) }))
  })()

  return (
    <AppLayout title="Dashboard">
      <div className="page-content animate-fade-in">

        {/* ─── Page header ──────────────────────────────────────────── */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Dashboard Admin</h1>
          </div>
          <button
            onClick={fetchAll}
            disabled={loading}
            className="btn btn-secondary btn-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="alert alert-error mb-5">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ─── Stat Cards ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="card p-5">
                <Skeleton className="h-10 w-10 rounded-lg mb-3" />
                <Skeleton className="h-7 w-20 mb-1.5" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))
          ) : (
            <>
              <StatCard
                label="Total Stok Aktif"
                value={formatNumber(summary?.total_stock ?? 0)}
                icon={Archive}
                bgColor="#f0fdf4"
                iconColor="#166534"
              />
              <StatCard
                label="Masuk Bulan Ini"
                value={summary?.in_this_month ?? 0}
                icon={Package}
                bgColor="#eff6ff"
                iconColor="#1d4ed8"
                suffix="batch"
              />
              <StatCard
                label="Keluar Bulan Ini"
                value={formatNumber(summary?.out_this_month ?? 0)}
                icon={PackageMinus}
                bgColor="#fef9c3"
                iconColor="#a16207"
              />
              <StatCard
                label="Stok Rendah"
                value={summary?.low_stock_count ?? 0}
                icon={TrendingDown}
                bgColor="#fff1f2"
                iconColor="#be123c"
                suffix="produk"
              />
            </>
          )}
        </div>

        {/* ─── Alert Kadaluarsa summary ─────────────────────────────── */}
        {!loading && summary && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { key: 'expiry_expired',  label: 'Batch Expired',  color: '#64748b', bg: '#f1f5f9', to: '/admin/inventory?expiry_status=expired' },
              { key: 'expiry_critical', label: 'Kritis (< 30 hari)',  color: '#dc2626', bg: '#fff1f2', to: '/admin/inventory?expiry_status=critical' },
              { key: 'expiry_warning',  label: 'Perhatian (30–60 hari)', color: '#d97706', bg: '#fefce8', to: '/admin/inventory?expiry_status=warning' },
            ].map(({ key, label, color, bg, to }) => (
              <button
                key={key}
                onClick={() => navigate(to)}
                className="card p-4 text-left hover:shadow-md transition-all duration-200 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                  <Clock className="w-5 h-5" style={{ color }} />
                </div>
                <div>
                  <p className="text-xl font-bold" style={{ color, fontFamily: 'Plus Jakarta Sans' }}>
                    {summary[key] ?? 0}
                  </p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 ml-auto" />
              </button>
            ))}
          </div>
        )}

        {/* ─── Charts row ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">

          {/* Tren Transaksi (Line Chart) — 2/3 lebar */}
          <div className="card p-5 lg:col-span-2">
            <h2 className="font-semibold text-slate-800 mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Tren Barang Masuk & Keluar (6 Bulan)
            </h2>
            {loading ? (
              <Skeleton className="h-52 w-full" />
            ) : trendData.length === 0 ? (
              <EmptyState icon={Package} title="Belum ada data transaksi" />
            ) : (
              <ResponsiveContainer width="100%" height={210}>
                <LineChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                    cursor={{ stroke: '#e2e8f0' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="masuk"  name="Masuk"  stroke="#166534" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="keluar" name="Keluar" stroke="#84cc16" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Stok per Kategori (Pie Chart) — 1/3 lebar */}
          <div className="card p-5">
            <h2 className="font-semibold text-slate-800 mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Stok per Kategori
            </h2>
            {loading ? (
              <Skeleton className="h-52 w-full rounded-full" />
            ) : !charts?.stock_by_category?.length ? (
              <EmptyState icon={Archive} title="Belum ada data stok" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie
                      data={charts.stock_by_category}
                      dataKey="total"
                      nameKey="category"
                      cx="50%" cy="50%"
                      innerRadius={40} outerRadius={65}
                      paddingAngle={2}
                    >
                      {charts.stock_by_category.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 11 }}
                      formatter={(v) => [formatNumber(v), 'Qty']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend custom */}
                <div className="mt-3 space-y-1.5">
                  {charts.stock_by_category.slice(0, 5).map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                        <span className="text-slate-600 truncate max-w-[100px]">{item.category}</span>
                      </div>
                      <span className="text-slate-800 font-medium">{formatNumber(item.total)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ─── Tabel batch kadaluarsa terdekat ──────────────────────── */}
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <h2 className="font-semibold text-slate-800" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Batch Perlu Perhatian
            </h2>
            <button
              onClick={() => navigate('/admin/inventory?expiry_status=critical')}
              className="btn btn-ghost btn-sm text-green-700"
            >
              Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="p-5 space-y-3">
              {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : !alerts?.critical?.length && !alerts?.expired?.length ? (
            <EmptyState
              icon={Clock}
              title="Tidak ada batch yang perlu perhatian"
              description="Semua batch masih dalam kondisi aman."
            />
          ) : (
            <div className="table-wrapper rounded-none border-none">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Produk</th>
                    <th>No. Batch</th>
                    <th>Lokasi</th>
                    <th>Stok</th>
                    <th>Kadaluarsa</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {[...(alerts?.expired ?? []), ...(alerts?.critical ?? [])].slice(0, 8).map((batch) => (
                    <tr key={batch.id}>
                      <td>
                        <div>
                          <p className="font-medium text-slate-800">{batch.product?.product_name}</p>
                          <p className="text-xs text-slate-400">{batch.product?.category?.name}</p>
                        </div>
                      </td>
                      <td><span className="font-mono text-sm">{batch.batch_no}</span></td>
                      <td><span className="text-slate-600">{batch.storage_location}</span></td>
                      <td>
                        <span className="font-medium">{formatNumber(batch.stock_quantity)}</span>
                        <span className="text-slate-400 text-xs ml-1">{batch.product?.unit}</span>
                      </td>
                      <td><span className="text-sm">{formatDate(batch.expiry_date)}</span></td>
                      <td><ExpiryBadge expiryDate={batch.expiry_date} showDays /></td>
                      <td>
                        <button
                          onClick={() => navigate(`/admin/inventory/${batch.id}`)}
                          className="btn btn-ghost btn-sm btn-icon"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </AppLayout>
  )
}
