import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AppProvider, useApp } from './lib/store.jsx'
import AppShell from './layout/AppShell.jsx'

import Dashboard from './pages/Dashboard.jsx'
import Calendar from './pages/Calendar.jsx'
import Clients from './pages/Clients.jsx'
import ClientDetail from './pages/ClientDetail.jsx'
import ClientApps from './pages/ClientApps.jsx'
import Documents from './pages/Documents.jsx'
import Gst from './pages/Gst.jsx'
import Itc from './pages/Itc.jsx'
import Tds from './pages/Tds.jsx'
import DirectTax from './pages/DirectTax.jsx'
import Notices from './pages/Notices.jsx'
import Revenue from './pages/Revenue.jsx'
import Team from './pages/Team.jsx'
import Reports from './pages/Reports.jsx'
import SettingsPage from './pages/Settings.jsx'
import Assistant from './pages/Assistant.jsx'
import WorkInbox from './pages/WorkInbox.jsx'
import Integrations from './pages/Integrations.jsx'
import Access from './pages/Access.jsx'
import Login from './pages/Login.jsx'
import Setup from './pages/Setup.jsx'
import AcceptInvitation from './pages/AcceptInvitation.jsx'
import { useAuth } from './lib/auth.jsx'

import OwnerApp from './apps/owner/OwnerApp.jsx'

function Shortcuts() {
  const { setCmdOpen } = useApp()
  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setCmdOpen(true) }
      if (e.key === 'Escape') setCmdOpen(false)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [setCmdOpen])
  return null
}

// The practice dashboard. Everything the auditor works in.
function PracticeApp() {
  return (
    <AppShell>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="clients" element={<Clients />} />
        <Route path="clients/:id" element={<ClientDetail />} />
        <Route path="apps" element={<ClientApps />} />
        <Route path="documents" element={<Documents />} />
        <Route path="gst" element={<Gst />} />
        <Route path="itc" element={<Itc />} />
        <Route path="tds" element={<Tds />} />
        <Route path="direct-tax" element={<DirectTax />} />
        <Route path="notices" element={<Notices />} />
        <Route path="revenue" element={<Revenue />} />
        <Route path="team" element={<Team />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="assistant" element={<Assistant />} />
        <Route path="inbox" element={<WorkInbox />} />
        <Route path="integrations" element={<Integrations />} />
        <Route path="access" element={<Access />} />
        <Route path="setup" element={<Setup />} />
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </AppShell>
  )
}

export default function App() {
  const auth = useAuth()
  const location = useLocation()

  if (auth.loading) return <div className="min-h-[100dvh] bg-bg grid place-items-center text-sm text-mute">Opening CleanBook…</div>
  if (!auth.demoMode && !auth.enabled) return <NotConfigured />

  return (
    <AppProvider>
      <Shortcuts />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/accept-invitation" element={<AcceptInvitation />} />
        {!auth.demoMode && !auth.user && <Route path="*" element={<Navigate to="/login" state={{ from: location.pathname }} replace />} />}
        {/* The client's own application — its own chrome, its own colour, no
            practice sidebar. Both apps share one store, so a document sent
            from here lands on the auditor's screen immediately. */}
        {(auth.demoMode || auth.user) && <Route path="/app/:id" element={<OwnerApp />} />}
        {(auth.demoMode || auth.user) && <Route path="/*" element={<PracticeApp />} />}
      </Routes>
    </AppProvider>
  )
}

// A live build with no Firebase project behind it. Say so plainly rather than
// falling back to sample data that could be mistaken for a real practice.
function NotConfigured() {
  return (
    <main className="min-h-[100dvh] bg-bg grid place-items-center p-4">
      <section className="card w-full max-w-lg p-7">
        <h1 className="text-xl font-extrabold text-ink">Firebase is not configured</h1>
        <p className="text-[13px] text-mute mt-2 leading-relaxed">
          This is a live build of CleanBook, and it has no Firebase project settings. Add the six
          VITE_FIREBASE_* values to <code>.env</code> and build again. For local development, run the
          emulators with <code>npm run emulators</code> and start <code>npm run dev</code>. For the sales
          demo, use <code>npm run dev:demo</code> or <code>npm run build:demo</code>.
        </p>
      </section>
    </main>
  )
}
