// The client side: the application Real V built for one specific business.
//
// Deliberately a different product from the practice dashboard — bigger
// numbers, fewer words, the owner's language, and its own colour. An owner
// who opens this from a hotel room should know how his business is doing
// before he finishes his coffee.

import { lazy, Suspense, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import {
  ArrowLeft, Home, Users, Wallet, ShieldCheck, Sun, Moon, Dumbbell, Truck, UtensilsCrossed, Factory, Plane, Scissors, Hammer, ShoppingBag, GraduationCap, LayoutGrid, Mic, Route, ClipboardList,
} from 'lucide-react'
import { useApp } from '../../lib/store.jsx'
import { useRepo } from '../../repo/index.js'
import { Toasts } from '../../components/bits.jsx'
import ScreenBoundary from '../../components/ScreenBoundary.jsx'
import MyCa from './panels/MyCa.jsx'

// Panels only the demo build has. Live mode shows the My CA tab alone until the
// trade modules are built. The mode test is written out (not IS_DEMO) so the
// bundler leaves these panels, and their sample data, out of the live build.
const DEMO_PANELS = import.meta.env.VITE_APP_MODE === 'demo'
  ? {
      Today: lazy(() => import('./panels/Today.jsx')),
      Operations: lazy(() => import('./panels/Operations.jsx')),
      People: lazy(() => import('./panels/People.jsx')),
      Money: lazy(() => import('./panels/Money.jsx')),
      NotBuilt: lazy(() => import('./panels/NotBuilt.jsx')),
      VoiceInvoice: lazy(() => import('./panels/VoiceInvoice.jsx')),
      EWayBill: lazy(() => import('./panels/EWayBill.jsx')),
      TripDesk: lazy(() => import('./panels/TripDesk.jsx')),
    }
  : null
const { Today, Operations, People, Money, NotBuilt, VoiceInvoice, EWayBill, TripDesk } = DEMO_PANELS || {}

const OPS_ICONS = {
  Dumbbell, Truck, UtensilsCrossed, Factory, Plane, Scissors, Hammer, ShoppingBag, GraduationCap,
}

// "B. Muniraju" and "Dr. Shruti Kaveri" both need the name, not the initial.
const firstName = (full) => {
  const parts = full.replace(/\(.*\)/, '').trim().split(' ').filter(Boolean)
  return parts.find((p) => p.replace(/\./g, '').length > 2) || parts[0]
}

export default function OwnerApp() {
  const { id } = useParams()
  const { theme, toggleTheme } = useApp()
  const { clientById, OPS, brandOf, hasApp, FIRM } = useRepo()
  const [tab, setTab] = useState(DEMO_PANELS ? 'today' : 'ca')

  const c = clientById[id]
  if (!c) return <Navigate to="/apps" replace />

  const brand = brandOf(c.id)
  const ops = OPS[c.id]
  // In the demo, "live" means Real V has built this business its app. Live
  // mode has only the My CA tab for now.
  const live = DEMO_PANELS ? hasApp(c) : true
  const OpsIcon = (ops && OPS_ICONS[ops.icon]) || LayoutGrid

  const tabs = !DEMO_PANELS
    ? [{ id: 'ca', label: 'My CA', icon: ShieldCheck }]
    : live
    ? [
        { id: 'today', label: 'Today', icon: Home },
        ...(ops ? [{ id: 'ops', label: ops.label, icon: OpsIcon }] : []),
        ...(c.vertical === 'transport' ? [{ id: 'trips', label: 'Trip Desk', icon: ClipboardList }] : []),
        { id: 'invoice', label: 'Voice bill', icon: Mic },
        ...(c.vertical === 'transport' ? [{ id: 'eway', label: 'E-Way Bill', icon: Route }] : []),
        { id: 'people', label: 'My people', icon: Users },
        { id: 'money', label: 'Money', icon: Wallet },
        { id: 'ca', label: 'My CA', icon: ShieldCheck },
      ]
    : []

  return (
    <div className="min-h-[100dvh] bg-bg flex flex-col">
      {/* ------------------------------------------------------------ top bar */}
      <header style={{ background: brand.accent }} className="text-white">
        <div className="max-w-[1500px] mx-auto px-4 lg:px-6">
          <div className="h-11 flex items-center gap-3 text-[11.5px] border-b border-white/15">
            <Link to={'/clients/' + c.id} className="inline-flex items-center gap-1.5 font-semibold text-white/80 hover:text-white transition-colors">
              <ArrowLeft size={13} /> Back to the practice dashboard
            </Link>
            <span className="hidden sm:inline text-white/50">·</span>
            <span className="hidden sm:inline text-white/70">You are seeing what {firstName(c.owner)} sees</span>
            <div className="ml-auto flex items-center gap-1.5">
              {DEMO_PANELS && (
                <Link to="/apps" className="hidden sm:inline-flex items-center gap-1.5 font-semibold text-white/80 hover:text-white transition-colors">
                  <LayoutGrid size={13} /> All client apps
                </Link>
              )}
              <button onClick={toggleTheme} className="w-7 h-7 grid place-items-center rounded-md hover:bg-white/15 transition-colors" title="Toggle theme">
                {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
              </button>
            </div>
          </div>

          <div className="py-4 flex flex-wrap items-center gap-4">
            <span className="w-12 h-12 rounded-2xl bg-white/15 grid place-items-center shrink-0 backdrop-blur">
              <OpsIcon size={24} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[20px] lg:text-[23px] font-extrabold tracking-tight">
                  {c.realv?.appName || c.name}
                </h1>
                {DEMO_PANELS && (live
                  ? <span className="chip bg-white/20 text-white">Live</span>
                  : <span className="chip bg-white/20 text-white">{c.realv.status}</span>)}
              </div>
              <p className="text-[12.5px] text-white/80 mt-0.5">{c.name} · {brand.tagline}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-[10.5px] uppercase tracking-wider text-white/70 font-semibold">Today</p>
                <p className="text-[13px] font-bold">{new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}</p>
              </div>
              <span className="w-9 h-9 rounded-full bg-white/20 grid place-items-center text-[12px] font-extrabold">
                {c.owner.split(' ').map((w) => w[0]).slice(0, 2).join('')}
              </span>
            </div>
          </div>

          {tabs.length > 0 && (
            <nav className="flex items-center gap-1 overflow-x-auto -mb-px">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={'flex items-center gap-2 px-3.5 h-10 rounded-t-lg text-[13px] font-bold whitespace-nowrap transition-colors ' +
                    (tab === t.id ? 'bg-bg text-ink' : 'text-white/80 hover:bg-white/15')}
                  style={tab === t.id ? { color: brand.accent } : undefined}
                >
                  <t.icon size={15} /> {t.label}
                </button>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* -------------------------------------------------------------- panel */}
      <main className="flex-1 max-w-[1500px] w-full mx-auto p-4 lg:p-6">
        <ScreenBoundary key={tab}>
          <Suspense fallback={null}>
            {!live && <NotBuilt client={c} accent={brand.accent} />}
            {live && tab === 'today' && <Today client={c} accent={brand.accent} onGo={setTab} />}
            {live && tab === 'ops' && <Operations client={c} accent={brand.accent} />}
            {live && tab === 'trips' && <TripDesk client={c} accent={brand.accent} />}
            {live && tab === 'invoice' && <VoiceInvoice client={c} accent={brand.accent} />}
            {live && tab === 'eway' && <EWayBill client={c} accent={brand.accent} />}
            {live && tab === 'people' && <People client={c} accent={brand.accent} />}
            {live && tab === 'money' && <Money client={c} accent={brand.accent} />}
            {live && tab === 'ca' && <MyCa client={c} accent={brand.accent} />}
          </Suspense>
        </ScreenBoundary>
      </main>

      {DEMO_PANELS && (
        <footer className="px-6 py-3 border-t border-line text-[11.5px] text-faint flex flex-wrap gap-x-4 gap-y-1 justify-between max-w-[1500px] w-full mx-auto">
          <span>{c.realv.appName || c.name} · built for {c.name} by The Real V Developers</span>
          <span>
            Compliance data flows to {FIRM.name.split(',')[0]} automatically
            {c.realv.uptime ? ' · uptime ' + c.realv.uptime + '%' : ''}
          </span>
        </footer>
      )}

      <Toasts />
    </div>
  )
}
