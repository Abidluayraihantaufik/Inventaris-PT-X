import { useState } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

/**
 * AppLayout — wrapper utama halaman yang butuh sidebar.
 * Props:
 *   title: string — judul halaman untuk topbar
 *   children: ReactNode — konten halaman
 */
export default function AppLayout({ title = 'Dashboard', children }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* Main content area */}
      <div className="page-wrapper flex-1 flex flex-col">
        {/* Topbar */}
        <Topbar
          title={title}
          onMenuClick={() => setMobileOpen(true)}
        />

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
