import { useState, useMemo } from 'react'
import { NavLink, useNavigate, Link } from 'react-router-dom'
import {
  LayoutDashboard, CalendarDays, Users, FolderOpen, FileSpreadsheet, GitCompareArrows,
  Landmark, Receipt, ScrollText, IndianRupee, UsersRound, BarChart3, Settings,
  Search, Bell, Moon, Sun, ChevronDown, Menu, X, Command, BookOpenCheck, RotateCcw, LogOut, ClipboardCheck, PlugZap, ShieldCheck,
  MonitorSmartphone, Building2,
  Sparkles,
} from 'lucide-react'
import { useApp } from '../lib/store.jsx'
import { useRepo } from '../repo/index.js'
import { IS_DEMO } from '../lib/mode.js'
import { inr, inrShort } from '../lib/format.js'
import { pLabel } from '../lib/dates.js'
import { Pill, Avatar } from '../components/ui.jsx'
import { Toasts, VerticalIcon } from '../components/bits.jsx'
import cleanBookMark from '../assets/cleanbook-mark.svg'

const NAV = [
  { section: 'Practice', items: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/inbox', label: 'Work Inbox', icon: ClipboardCheck, badge: 'docsOverdue' },
    { to: '/calendar', label: 'Compliance Calendar', icon: CalendarDays, badge: 'overdueCount' },
  ] },
  { section: 'Client book', items: [
    { to: '/clients', label: 'All Clients', icon: Users },
    { to: '/apps', label: 'Their Applications', icon: MonitorSmartphone, demo: true },
    { to: '/documents', label: 'Data & Documents', icon: FolderOpen, badge: 'docsOverdue' },
  ] },
  { section: 'Filing desk', items: [
    { to: '/assistant', label: 'CA Assistant', icon: Sparkles, demo: true },
    { to: '/gst', label: 'GST Workspace', icon: FileSpreadsheet, demo: true },
    { to: '/itc', label: 'ITC vs GSTR-2B', icon: GitCompareArrows, demo: true },
    { to: '/tds', label: 'TDS & Payroll', icon: Receipt, demo: true },
    { to: '/direct-tax', label: 'Direct Tax & ROC', icon: Landmark, demo: true },
  ] },
  { section: 'Risk', items: [
    { to: '/notices', label: 'Notices & Demands', icon: ScrollText, badge: 'noticesOpen', demo: true },
  ] },
  { section: 'My earnings', items: [
    { to: '/revenue', label: 'Revenue Share', icon: IndianRupee, accent: true, demo: true },
  ] },
  { section: 'Practice admin', items: [
    { to: '/setup', label: 'Firm & Onboarding', icon: Building2 },
    { to: '/integrations', label: 'Integrations', icon: PlugZap, demo: true },
    { to: '/access', label: 'Users & Access', icon: ShieldCheck },
    { to: '/team', label: 'Team & Workload', icon: UsersRound },
    { to: '/reports', label: 'Reports', icon: BarChart3 },
    { to: '/settings', label: 'Settings', icon: Settings },
  ] },
]

// The live build has no demo-only screens (see App.jsx), so it has no links to them.
const MENU = NAV
  .map((grp) => ({ ...grp, items: grp.items.filter((it) => IS_DEMO || !it.demo) }))
  .filter((grp) => grp.items.length)

export default function AppShell({ children }) {
  const { theme, toggleTheme, who, setWho, whoInfo, setCmdOpen, resetDemo, actionCount, docStatusOf } = useApp()
  const { FIRM, STAFF, CLIENTS, CURRENT_PERIOD, OBLIGATIONS, practiceKpis, alerts, revenue } = useRepo()
  const [mobileNav, setMobileNav] = useState(false)
  const [bell, setBell] = useState(false)
  const [whoMenu, setWhoMenu] = useState(false)
  const nav = useNavigate()

  const k = useMemo(() => practiceKpis(docStatusOf), [practiceKpis, docStatusOf])
  const feed = useMemo(() => alerts(docStatusOf), [alerts, docStatusOf])
  const critical = feed.filter((a) => a.severity === 'critical').length

  return (
    <div className="min-h-full flex bg-bg">
      {/* ------------------------------------------------------------ sidebar */}
      <aside className={'fixed lg:static inset-y-0 left-0 z-40 w-[240px] shrink-0 bg-card border-r border-line flex flex-col transition-transform ' +
        (mobileNav ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')}>
        <div className="h-14 flex items-center gap-2.5 px-4 border-b border-line shrink-0">
          <img src={cleanBookMark} alt="CleanBook" className="w-8 h-8 shrink-0" />
          <div className="min-w-0">
            <p className="text-[14px] font-extrabold tracking-tight text-ink leading-none">CleanBook</p>
            <p className="text-[10.5px] text-faint truncate mt-0.5">{FIRM.short}</p>
          </div>
          <button className="ml-auto lg:hidden btn-quiet !h-7 !w-7 !px-0 justify-center" onClick={() => setMobileNav(false)}>
            <X size={15} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2.5">
          {MENU.map((grp) => (
            <div key={grp.section} className="mb-3">
              <p className="label px-2 mb-1">{grp.section}</p>
              {grp.items.map((it) => (
                <NavLink key={it.to} to={it.to} end={it.to === '/'}
                  onClick={() => setMobileNav(false)}
                  className={({ isActive }) =>
                    'flex items-center gap-2.5 px-2 h-8 rounded-lg text-[13px] font-semibold mb-0.5 transition-colors ' +
                    (isActive
                      ? 'bg-brand-50 text-brand-700'
                      : it.accent ? 'text-ok-700 hover:bg-ok-50' : 'text-mute hover:bg-soft hover:text-ink')}>
                  <it.icon size={15} className="shrink-0" />
                  <span className="truncate">{it.label}</span>
                  {it.badge && k[it.badge] > 0 && (
                    <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-bad-50 text-bad-600 num">
                      {k[it.badge]}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="p-2.5 border-t border-line shrink-0 space-y-2">
          {revenue && (
            <Link to="/revenue" className="block rounded-lg bg-ok-50 border border-ok-500/25 px-3 py-2.5 hover:bg-ok-100 transition-colors">
              <p className="text-[10px] font-bold uppercase tracking-wider text-ok-700/70">Your share this month</p>
              <p className="text-[19px] font-extrabold text-ok-700 num leading-tight mt-0.5">{inr(k.shareMonth)}</p>
              <p className="text-[10.5px] text-ok-700/80">20% of {inrShort(k.shareMonth * 5)} collected · paid 07 Oct</p>
            </Link>
          )}
          {actionCount > 0 && (
            <button onClick={resetDemo} className="w-full btn-quiet !h-8 justify-center text-[11.5px]">
              <RotateCcw size={12} /> Reset demo ({actionCount})
            </button>
          )}
        </div>
      </aside>

      {mobileNav && <div className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden" onClick={() => setMobileNav(false)} />}

      {/* ---------------------------------------------------------- main area */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 bg-card border-b border-line flex items-center gap-3 px-4 sticky top-0 z-30">
          <button className="lg:hidden btn-quiet !h-8 !w-8 !px-0 justify-center" onClick={() => setMobileNav(true)}>
            <Menu size={17} />
          </button>

          <button onClick={() => setCmdOpen(true)}
            className="flex items-center gap-2 h-9 px-3 rounded-lg border border-line bg-soft/60 text-[12.5px] text-faint hover:border-brand-300 transition-colors w-40 sm:w-80">
            <Search size={14} />
            <span className="truncate">Search client, GSTIN, form, notice…</span>
            <kbd className="ml-auto hidden sm:flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-card border border-line">
              <Command size={9} />K
            </kbd>
          </button>

          <div className="ml-auto flex items-center gap-1.5">
            <div className="hidden xl:flex items-center gap-4 mr-2 pr-3 border-r border-line">
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-faint">Filing period</p>
                <p className="text-[13px] font-extrabold text-ink">{pLabel(CURRENT_PERIOD)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-faint">Due in 7 days</p>
                <p className="text-[13px] font-extrabold text-warn-600 num">{k.weekCount} filings</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-faint">Tax to pay</p>
                <p className="text-[13px] font-extrabold text-ink num">{inrShort(k.taxToPay)}</p>
              </div>
            </div>

            <button onClick={toggleTheme} className="btn-quiet !h-9 !w-9 !px-0 justify-center" title="Toggle theme">
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            <div className="relative">
              <button onClick={() => { setBell(!bell); setWhoMenu(false) }} className="btn-quiet !h-9 !w-9 !px-0 justify-center relative">
                <Bell size={16} />
                {critical > 0 && (
                  <span className="absolute top-1 right-1 min-w-[15px] h-[15px] px-1 rounded-full bg-bad-500 text-white text-[9px] font-bold grid place-items-center num">
                    {critical}
                  </span>
                )}
              </button>
              {bell && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setBell(false)} />
                  <div className="absolute right-0 mt-2 w-[380px] card shadow-pop z-50 overflow-hidden animate-slidein">
                    <div className="px-4 py-2.5 border-b border-line flex items-center justify-between">
                      <p className="text-[13px] font-bold">Needs attention</p>
                      <Pill tone="bad">{feed.length} items</Pill>
                    </div>
                    <div className="max-h-[420px] overflow-y-auto">
                      {feed.slice(0, 12).map((a) => (
                        <button key={a.id} onClick={() => { nav(a.link); setBell(false) }}
                          className="w-full text-left px-4 py-2.5 border-t border-line first:border-t-0 hover:bg-soft transition-colors">
                          <div className="flex items-start gap-2">
                            <span className={'w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ' +
                              (a.severity === 'critical' ? 'bg-bad-500' : a.severity === 'high' ? 'bg-warn-500' : 'bg-info-500')} />
                            <div className="min-w-0">
                              <p className="text-[12.5px] font-bold text-ink">{a.title}</p>
                              <p className="text-[11.5px] text-mute line-clamp-2">{a.detail}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    <button onClick={() => { nav('/calendar'); setBell(false) }}
                      className="w-full px-4 py-2.5 border-t border-line text-[12px] font-bold text-brand-600 hover:bg-soft">
                      Open the compliance calendar
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="relative">
              <button onClick={() => { setWhoMenu(!whoMenu); setBell(false) }}
                className="flex items-center gap-2 h-9 pl-1 pr-2 rounded-lg hover:bg-soft transition-colors">
                <Avatar name={whoInfo.name} size={26} tone={whoInfo.avatarTone} />
                <div className="hidden md:block text-left leading-tight">
                  <p className="text-[12px] font-bold text-ink">{whoInfo.short}</p>
                  <p className="text-[10px] text-faint">{whoInfo.title}</p>
                </div>
                <ChevronDown size={13} className="text-faint" />
              </button>
              {whoMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setWhoMenu(false)} />
                  <div className="absolute right-0 mt-2 w-64 card shadow-pop z-50 overflow-hidden animate-slidein">
                    <p className="label px-4 pt-3 pb-1">Signed in as</p>
                    {STAFF.map((s) => (
                      <button key={s.id} onClick={() => { setWho(s.id); setWhoMenu(false) }}
                        className={'w-full text-left px-4 py-2.5 hover:bg-soft transition-colors flex items-center gap-2.5 ' +
                          (who === s.id ? 'bg-brand-50/60' : '')}>
                        <Avatar name={s.name} size={30} tone={who === s.id ? 'brand' : 'mute'} />
                        <div className="min-w-0">
                          <p className="text-[12.5px] font-bold text-ink truncate">{s.name}</p>
                          <p className="text-[11px] text-mute truncate">{s.title}</p>
                        </div>
                      </button>
                    ))}
                    <div className="border-t border-line px-4 py-2.5 text-[11.5px] text-faint flex items-center gap-2">
                      <LogOut size={13} /> {FIRM.name}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 max-w-[1600px] w-full mx-auto">{children}</main>

        <footer className="px-6 py-3 border-t border-line text-[11.5px] text-faint flex flex-wrap gap-x-4 gap-y-1 justify-between">
          <span>CleanBook · {FIRM.plan} · FRN {FIRM.frn}{IS_DEMO ? ' · demo dataset' : ''}</span>
          <span>{CLIENTS.length} clients · {OBLIGATIONS.length} obligations tracked · {k.onAuto} on automatic data capture</span>
        </footer>
      </div>

      <CommandBar />
      <Toasts />
    </div>
  )
}

/* --------------------------------------------------------------- command bar */
function CommandBar() {
  const { cmdOpen, setCmdOpen } = useApp()
  const { CLIENTS, OBLIGATIONS } = useRepo()
  const [q, setQ] = useState('')
  const nav = useNavigate()
  if (!cmdOpen) return null

  const s = q.trim().toLowerCase()
  const results = []
  if (s) {
    CLIENTS.filter((c) =>
      [c.name, c.gstin, c.verticalLabel, c.owner].some((field) => (field || '').toLowerCase().includes(s)),
    ).slice(0, 6).forEach((c) => results.push({
      type: 'Client', title: c.name, sub: [c.gstin || 'Unregistered', c.verticalLabel].filter(Boolean).join(' · '), to: '/clients/' + c.id, client: c,
    }))
    const forms = [...new Set(OBLIGATIONS.map((o) => o.form))].filter((f) => f.toLowerCase().includes(s)).slice(0, 4)
    forms.forEach((f) => results.push({ type: 'Form', title: f, sub: 'Open the compliance calendar filtered to ' + f, to: '/calendar' }))
  }
  const quick = [
    { title: 'Dashboard', to: '/' }, { title: 'GST Workspace — Aug 2026', to: '/gst', demo: true },
    { title: 'ITC vs GSTR-2B', to: '/itc', demo: true }, { title: 'Documents still to collect', to: '/documents' },
    { title: 'Revenue share statement', to: '/revenue', demo: true }, { title: 'Notices & demands', to: '/notices', demo: true },
  ].filter((x) => IS_DEMO || !x.demo)
  const go = (to) => { nav(to); setCmdOpen(false); setQ('') }

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[12vh] px-4" onClick={() => setCmdOpen(false)}>
      <div className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]" />
      <div className="relative w-full max-w-[580px] card shadow-pop overflow-hidden animate-slidein" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2.5 px-4 h-12 border-b border-line">
          <Search size={16} className="text-faint" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Client name, GSTIN, owner, form…"
            className="flex-1 bg-transparent outline-none text-[14px] text-ink placeholder:text-faint" />
          <kbd className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-soft border border-line text-faint">ESC</kbd>
        </div>
        <div className="max-h-[46vh] overflow-y-auto">
          {(s ? results : quick.map((x) => ({ ...x, type: 'Go to', sub: '' }))).map((r, i) => (
            <button key={i} onClick={() => go(r.to)}
              className="w-full text-left px-4 py-2.5 border-t border-line first:border-t-0 hover:bg-soft transition-colors flex items-center gap-3">
              <Pill tone={r.type === 'Go to' ? 'mute' : 'brand'} className="w-[62px] justify-center shrink-0">{r.type}</Pill>
              {r.client && <VerticalIcon client={r.client} size={15} className="text-mute shrink-0" />}
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-ink truncate">{r.title}</p>
                {r.sub && <p className="text-[11.5px] text-mute truncate">{r.sub}</p>}
              </div>
            </button>
          ))}
          {s && !results.length && <p className="px-4 py-8 text-center text-[13px] text-mute">No match for “{q}”</p>}
        </div>
      </div>
    </div>
  )
}
