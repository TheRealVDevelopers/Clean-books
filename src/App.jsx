import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AppProvider, useApp } from './lib/store.jsx'
import { useAuth } from './lib/auth.jsx'
import AppShell from './layout/AppShell.jsx'
import ScreenBoundary from './components/ScreenBoundary.jsx'

// Every screen is its own chunk, downloaded the first time it is opened.
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const Calendar = lazy(() => import('./pages/Calendar.jsx'))
const Clients = lazy(() => import('./pages/Clients.jsx'))
const ClientDetail = lazy(() => import('./pages/ClientDetail.jsx'))
const Documents = lazy(() => import('./pages/Documents.jsx'))
const Team = lazy(() => import('./pages/Team.jsx'))
const Reports = lazy(() => import('./pages/Reports.jsx'))
const SettingsPage = lazy(() => import('./pages/Settings.jsx'))
const WorkInbox = lazy(() => import('./pages/WorkInbox.jsx'))
const Access = lazy(() => import('./pages/Access.jsx'))
const Setup = lazy(() => import('./pages/Setup.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const AcceptInvitation = lazy(() => import('./pages/AcceptInvitation.jsx'))
const OwnerApp = lazy(() => import('./apps/owner/OwnerApp.jsx'))

// Screens only the demo build has: they show features that run on sample data
// and have no live counterpart yet. The mode test is written out (not IS_DEMO)
// so the bundler leaves these screens, and their sample text, out of the live
// build altogether.
const DEMO_SCREENS = import.meta.env.VITE_APP_MODE === 'demo'
  ? [
      ['apps', lazy(() => import('./pages/ClientApps.jsx'))],
      ['gst', lazy(() => import('./pages/Gst.jsx'))],
      ['itc', lazy(() => import('./pages/Itc.jsx'))],
      ['tds', lazy(() => import('./pages/Tds.jsx'))],
      ['direct-tax', lazy(() => import('./pages/DirectTax.jsx'))],
      ['notices', lazy(() => import('./pages/Notices.jsx'))],
      ['revenue', lazy(() => import('./pages/Revenue.jsx'))],
      ['assistant', lazy(() => import('./pages/Assistant.jsx'))],
      ['integrations', lazy(() => import('./pages/Integrations.jsx'))],
    ]
  : []

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
  const location = useLocation()
  return (
    <AppShell>
      <ScreenBoundary key={location.pathname}>
        <Suspense fallback={null}>
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="clients" element={<Clients />} />
            <Route path="clients/:id" element={<ClientDetail />} />
            <Route path="documents" element={<Documents />} />
            <Route path="team" element={<Team />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="inbox" element={<WorkInbox />} />
            <Route path="access" element={<Access />} />
            <Route path="setup" element={<Setup />} />
            {DEMO_SCREENS.map(([path, Screen]) => <Route key={path} path={path} element={<Screen />} />)}
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </Suspense>
      </ScreenBoundary>
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
      <ScreenBoundary>
        <Suspense fallback={<div className="min-h-[100dvh] bg-bg" />}>
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
        </Suspense>
      </ScreenBoundary>
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
