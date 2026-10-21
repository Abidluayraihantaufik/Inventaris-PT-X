import { useEffect, useState, useCallback, useRef } from 'react'
import { History, FileText, Download, Printer, X } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import Modal from '../../components/ui/Modal'
import { PageHeader, SearchBar, EmptyState, Skeleton, Pagination } from '../../components/shared/SharedComponents'
import { stockOutAPI } from '../../api'
import { formatDate, formatNumber } from '../../utils/helpers'

// ─── Template HTML Laporan PDF ────────────────────────────────────────────
function buildReportHtml(log) {
  const rows = log.items?.length
    ? log.items.map((item, i) => `
        <tr style="background:${i % 2 === 0 ? '#fff' : '#f8fafc'}">
          <td style="border:1px solid #cbd5e1;padding:7px 10px;text-align:center">${i + 1}</td>
          <td style="border:1px solid #cbd5e1;padding:7px 10px;font-weight:600">${item.batch?.product?.product_name ?? log.product_name ?? '-'}</td>
          <td style="border:1px solid #cbd5e1;padding:7px 10px;font-family:monospace;font-size:11px">${item.batch?.batch_no ?? log.batch_no ?? '-'}</td>
          <td style="border:1px solid #cbd5e1;padding:7px 10px">${item.batch?.expiry_date ? formatDate(item.batch.expiry_date) : (log.expiry_date ?? '-')}</td>
          <td style="border:1px solid #cbd5e1;padding:7px 10px;text-align:right;font-weight:700">${formatNumber(item.quantity ?? log.quantity)}</td>
          <td style="border:1px solid #cbd5e1;padding:7px 10px">${item.batch?.product?.unit ?? log.unit ?? '-'}</td>
        </tr>`)
      .join('')
    : `<tr>
        <td style="border:1px solid #cbd5e1;padding:7px 10px;text-align:center">1</td>
        <td style="border:1px solid #cbd5e1;padding:7px 10px;font-weight:600">${log.product_name ?? '-'}</td>
        <td style="border:1px solid #cbd5e1;padding:7px 10px;font-family:monospace;font-size:11px">${log.batch_no ?? '-'}</td>
        <td style="border:1px solid #cbd5e1;padding:7px 10px">${log.expiry_date ?? '-'}</td>
        <td style="border:1px solid #cbd5e1;padding:7px 10px;text-align:right;font-weight:700">${formatNumber(log.quantity)}</td>
        <td style="border:1px solid #cbd5e1;padding:7px 10px">${log.unit ?? '-'}</td>
      </tr>`

  const notesRow = log.notes
    ? `<div style="margin-bottom:24px;padding:12px 16px;background:#f8fafc;border-radius:6px;border-left:3px solid #166534">
        <p style="font-weight:700;color:#334155;margin:0 0 4px">Catatan:</p>
        <p style="color:#64748b;margin:0;font-size:12px">${log.notes}</p>
      </div>`
    : ''

  return `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:780px;margin:0 auto;padding:32px;font-size:13px;color:#1e293b">

      <!-- Header -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;padding-bottom:20px;border-bottom:3px solid #166534">
        <div style="display:flex;align-items:center;gap:14px">
          <div style="width:48px;height:48px;background:linear-gradient(135deg,#14532d,#16a34a);border-radius:10px;display:flex;align-items:center;justify-content:center">
            <span style="color:white;font-size:22px;font-weight:900">M</span>
          </div>
          <div>
            <h1 style="margin:0;font-size:20px;font-weight:800;color:#14532d;letter-spacing:-0.5px">PT MASKITANI</h1>
            <p style="margin:2px 0 0;font-size:11px;color:#64748b">Sistem Inventaris Agrokimia</p>
          </div>
        </div>
        <div style="text-align:right">
          <div style="display:inline-block;background:#166534;color:white;padding:4px 14px;border-radius:4px;font-size:12px;font-weight:700;letter-spacing:0.5px;margin-bottom:6px">
            LAPORAN PENGELUARAN BARANG
          </div>
          <p style="margin:0;font-size:11px;color:#64748b">No. Dokumen: <strong style="color:#1e293b">${log.document_no ?? '-'}</strong></p>
          <p style="margin:2px 0 0;font-size:11px;color:#64748b">Dicetak: ${log.printed_at ?? new Date().toLocaleDateString('id-ID')}</p>
        </div>
      </div>

      <!-- Info Transaksi -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px">
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px">
          <p style="font-weight:700;color:#14532d;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 10px">Informasi Transaksi</p>
          <table style="width:100%;border-collapse:collapse;font-size:12px">
            <tr><td style="color:#64748b;padding:3px 0;width:110px">Tanggal Keluar</td><td style="color:#1e293b;font-weight:600">: ${log.out_date ?? '-'}</td></tr>
            <tr><td style="color:#64748b;padding:3px 0">Kategori</td><td style="color:#1e293b;font-weight:600">: ${log.category ?? '-'}</td></tr>
            <tr><td style="color:#64748b;padding:3px 0">Lokasi Penyimpanan</td><td style="color:#1e293b;font-weight:600">: ${log.storage_location ?? '-'}</td></tr>
            <tr><td style="color:#64748b;padding:3px 0">Supplier</td><td style="color:#1e293b;font-weight:600">: ${log.supplier_name ?? '-'}</td></tr>
          </table>
        </div>
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:14px">
          <p style="font-weight:700;color:#1d4ed8;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 10px">Informasi Penerima</p>
          <table style="width:100%;border-collapse:collapse;font-size:12px">
            <tr><td style="color:#64748b;padding:3px 0;width:110px">Penerima</td><td style="color:#1e293b;font-weight:600">: ${log.recipient_name ?? log.recipient ?? '-'}</td></tr>
            <tr><td style="color:#64748b;padding:3px 0">Tujuan</td><td style="color:#1e293b;font-weight:600">: ${log.destination ?? log.purpose ?? '-'}</td></tr>
            <tr><td style="color:#64748b;padding:3px 0">Petugas</td><td style="color:#1e293b;font-weight:600">: ${log.officer ?? log.user?.name ?? '-'}</td></tr>
            <tr><td style="color:#64748b;padding:3px 0">Divisi</td><td style="color:#1e293b;font-weight:600">: ${log.officer_division ?? log.user?.division ?? '-'}</td></tr>
          </table>
        </div>
      </div>

      <!-- Tabel Produk -->
      <p style="font-weight:700;color:#334155;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 8px">Detail Barang</p>
      <table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:24px">
        <thead>
          <tr style="background:linear-gradient(90deg,#14532d,#166534);color:white">
            <th style="border:1px solid #166534;padding:8px 10px;text-align:center;width:40px">No.</th>
            <th style="border:1px solid #166534;padding:8px 10px;text-align:left">Nama Produk</th>
            <th style="border:1px solid #166534;padding:8px 10px;text-align:left">No. Batch</th>
            <th style="border:1px solid #166534;padding:8px 10px;text-align:left">Kadaluarsa</th>
            <th style="border:1px solid #166534;padding:8px 10px;text-align:right">Jumlah</th>
            <th style="border:1px solid #166534;padding:8px 10px;text-align:left">Satuan</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <!-- Catatan -->
      ${notesRow}

      <!-- Tanda Tangan -->
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin-top:32px;text-align:center;font-size:12px">
        ${['Disiapkan Oleh', 'Diterima Oleh', 'Diketahui / Menyetujui'].map(label => `
          <div>
            <p style="font-weight:700;color:#334155;margin:0 0 48px">${label}</p>
            <div style="border-top:1.5px solid #94a3b8;padding-top:6px;color:#64748b">( ______________________ )</div>
          </div>`).join('')}
      </div>

      <!-- Footer -->
      <div style="margin-top:24px;padding-top:12px;border-top:1px solid #e2e8f0;text-align:center;font-size:10px;color:#94a3b8">
        Dokumen ini dicetak secara otomatis oleh Sistem Inventaris PT Maskitani · ${log.printed_at ?? ''}
      </div>
    </div>
  `
}

// ─── Komponen Preview Laporan ──────────────────────────────────────────────
function ReportPreview({ log }) {
  if (!log) return null
  return (
    <div
      id="pdf-report-area"
      dangerouslySetInnerHTML={{ __html: buildReportHtml(log) }}
    />
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function StockOutLogsPage() {
  const [logs,          setLogs]          = useState([])
  const [meta,          setMeta]          = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [search,        setSearch]        = useState('')
  const [fromDate,      setFromDate]      = useState('')
  const [toDate,        setToDate]        = useState('')
  const [page,          setPage]          = useState(1)

  const [previewLog,    setPreviewLog]    = useState(null)
  const [previewOpen,   setPreviewOpen]   = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [generating,    setGenerating]    = useState(false)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await stockOutAPI.getLogs({ search, from_date: fromDate, to_date: toDate, page })
      setLogs(data.data ?? [])
      setMeta(data)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [search, fromDate, toDate, page])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  async function handleOpenReport(log) {
    setPreviewOpen(true)
    setPreviewLog(null)
    setLoadingDetail(true)
    try {
      const { data } = await stockOutAPI.printData(log.id)
      setPreviewLog(data)
    } catch {
      // Fallback: gunakan data dari tabel
      setPreviewLog({
        document_no:    `LPK-${String(log.id).padStart(6, '0')}`,
        printed_at:     new Date().toLocaleString('id-ID'),
        out_date:       log.out_date,
        product_name:   log.inventory_batch?.product?.product_name,
        category:       log.inventory_batch?.product?.category?.name,
        batch_no:       log.inventory_batch?.batch_no,
        quantity:       log.quantity,
        unit:           log.inventory_batch?.product?.unit,
        recipient:      log.recipient,
        purpose:        log.purpose,
        officer:        log.user?.name,
        notes:          log.notes,
      })
    } finally {
      setLoadingDetail(false)
    }
  }

  async function handleDownloadPDF() {
    setGenerating(true)
    try {
      const { default: jsPDF }      = await import('jspdf')
      const { default: html2canvas } = await import('html2canvas')

      const el = document.getElementById('pdf-report-area')
      if (!el) return

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf     = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

      const pageW  = pdf.internal.pageSize.getWidth()
      const pageH  = pdf.internal.pageSize.getHeight()
      const margin = 8
      const imgW   = pageW - margin * 2
      const imgH   = (canvas.height * imgW) / canvas.width

      // Handle multi-halaman jika konten panjang
      let y = margin
      let remainingH = imgH
      while (remainingH > 0) {
        pdf.addImage(imgData, 'PNG', margin, y, imgW, imgH)
        remainingH -= (pageH - margin * 2)
        if (remainingH > 0) {
          pdf.addPage()
          y = margin - (imgH - remainingH)
        }
      }

      pdf.save(`Laporan-Pengeluaran-${previewLog?.document_no ?? 'doc'}.pdf`)
    } catch (err) {
      console.error('PDF generation error:', err)
    } finally {
      setGenerating(false)
    }
  }

  function handlePrint() {
    const area = document.getElementById('pdf-report-area')
    if (!area) return
    const win = window.open('', '_blank', 'width=900,height=700')
    win.document.write(`
      <html><head>
        <title>Laporan Pengeluaran - ${previewLog?.document_no ?? ''}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Segoe UI', Arial, sans-serif; }
          @media print { @page { margin: 0; } }
        </style>
      </head><body>${area.innerHTML}</body></html>
    `)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 400)
  }

  return (
    <AppLayout title="Riwayat Barang Keluar">
      <div className="page-content animate-fade-in">
        <PageHeader title="Riwayat Barang Keluar" subtitle="Log semua transaksi pengeluaran barang" />

        {/* Filter bar */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <SearchBar value={search} onChange={v => { setSearch(v); setPage(1) }}
            placeholder="Cari produk, penerima..." className="flex-1 min-w-[200px]" />
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <label>Dari:</label>
            <input type="date" value={fromDate} onChange={e => { setFromDate(e.target.value); setPage(1) }}
              className="form-input w-38" />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <label>s/d:</label>
            <input type="date" value={toDate} onChange={e => { setToDate(e.target.value); setPage(1) }}
              className="form-input w-38" />
          </div>
          {(fromDate || toDate || search) && (
            <button onClick={() => { setSearch(''); setFromDate(''); setToDate(''); setPage(1) }}
              className="btn btn-ghost btn-sm text-red-500">
              Reset Filter
            </button>
          )}
        </div>

        {/* Tabel log */}
        <div className="card">
          <div className="table-wrapper rounded-none border-none">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Produk</th>
                  <th>No. Batch</th>
                  <th>Jumlah Keluar</th>
                  <th>Penerima</th>
                  <th>Tujuan</th>
                  <th>Dicatat oleh</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(7).fill(0).map((_, i) => (
                    <tr key={i}>{Array(8).fill(0).map((_, j) => (
                      <td key={j}><Skeleton className="h-4" /></td>
                    ))}</tr>
                  ))
                ) : logs.length === 0 ? (
                  <tr><td colSpan={8}>
                    <EmptyState icon={History} title="Belum ada riwayat pengeluaran"
                      description="Transaksi barang keluar akan muncul di sini." />
                  </td></tr>
                ) : logs.map(log => (
                  <tr key={log.id}>
                    <td><span className="text-sm whitespace-nowrap">{formatDate(log.out_date)}</span></td>
                    <td>
                      <p className="font-semibold text-slate-800">{log.inventory_batch?.product?.product_name}</p>
                      <p className="text-xs text-slate-400">{log.inventory_batch?.product?.category?.name}</p>
                    </td>
                    <td><span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">{log.inventory_batch?.batch_no}</span></td>
                    <td>
                      <span className="font-semibold text-slate-800">{formatNumber(log.quantity)}</span>
                      <span className="text-slate-400 text-xs ml-1">{log.inventory_batch?.product?.unit}</span>
                    </td>
                    <td><span className="text-slate-700">{log.recipient}</span></td>
                    <td><span className="text-slate-600 text-sm max-w-[150px] truncate block">{log.purpose}</span></td>
                    <td><span className="text-slate-600 text-sm">{log.user?.name}</span></td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          id={`btn-report-${log.id}`}
                          onClick={() => handleOpenReport(log)}
                          className="btn btn-ghost btn-sm flex items-center gap-1.5 text-slate-500 hover:text-green-700"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span className="text-xs">Laporan PDF</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination meta={meta} onPageChange={setPage} />
        </div>
      </div>

      {/* ─── Modal Preview Laporan PDF ──────────────────────────────── */}
      <Modal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Preview Laporan PDF"
        size="xl"
        footer={
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={!previewLog || generating}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Cetak
            </button>
            <button
              id="btn-download-pdf"
              onClick={handleDownloadPDF}
              disabled={!previewLog || generating}
              className="btn btn-primary flex items-center gap-2"
              style={{ background: '#166534', borderColor: '#166534' }}
            >
              {generating ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Unduh PDF
                </>
              )}
            </button>
          </div>
        }
      >
        {loadingDetail ? (
          <div className="flex items-center justify-center py-14 gap-2 text-slate-500">
            <span className="w-5 h-5 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin" />
            Memuat data laporan...
          </div>
        ) : (
          <div className="max-h-[65vh] overflow-y-auto bg-white rounded-lg border border-slate-100">
            <ReportPreview log={previewLog} />
          </div>
        )}
      </Modal>
    </AppLayout>
  )
}
