import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { MonitorSmartphone, ArrowRight, Users, Activity, IndianRupee, Wrench } from 'lucide-react'
import { PageHead, Kpi, Pill, MiniStat, Bar } from '../components/ui.jsx'
import { VerticalIcon, Readiness, Note, SectionTitle } from '../components/bits.jsx'
import { CLIENTS, CURRENT_PERIOD, LEDGER } from '../data/index.js'
import { brandOf, hasApp } from '../data/business.js'
import { PIPELINE_TONE } from '../lib/status.js'
import { inr, inrShort, pct } from '../lib/format.js'
import { pLabel } from '../lib/dates.js'

export default function ClientApps() {
  const live = CLIENTS.filter(hasApp)
  const building = CLIENTS.filter((c) => c.realv.status === 'Build In Progress')
  const rest = CLIENTS.filter((c) => !hasApp(c) && c.realv.status !== 'Build In Progress')

  const totals = useMemo(() => ({
    fee: live.reduce((s, c) => s + c.realv.fee, 0),
    users: live.reduce((s, c) => s + c.realv.users, 0),
    modules: live.reduce((s, c) => s + c.realv.modules.length, 0),
    uptime: (live.reduce((s, c) => s + c.realv.uptime, 0) / live.length).toFixed(1),
  }), [live])

  return (
    <div className="space-y-5">
      <PageHead
        title="Client applications"
        sub="The systems your clients actually run their businesses on — and where your data comes from"
        chips={[
          <Pill key="a" tone="ok" dot>{live.length} live</Pill>,
          <Pill key="b" tone="brand">{building.length} being built</Pill>,
          <Pill key="c" tone="mute">{rest.length} not built yet</Pill>,
          <Pill key="d" tone="info">{totals.modules} modules across the book</Pill>,
        ]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Applications live" value={live.length} icon={MonitorSmartphone} tone="ok" sub="one per business, none of them the same" />
        <Kpi label="People using them daily" value={totals.users} icon={Users} tone="brand" sub="owners, managers, drivers, stylists" />
        <Kpi label="Average uptime" value={totals.uptime + '%'} icon={Activity} tone="ok" sub="last 90 days" />
        <Kpi label="Fees these generate" value={inr(totals.fee) + '/mo'} icon={IndianRupee} tone="info"
          sub={'your share ' + inr(Math.round(totals.fee * 0.2))}
          foot={<Link to="/revenue" className="text-[11.5px] font-bold text-ok-600 flex items-center gap-1">Statement <ArrowRight size={11} /></Link>} />
      </div>

      <Note tone="brand" title="Why this page matters more than it looks">
        A gym does not need a transporter's software. Each of these was scoped after a visit to that
        specific business, which is why every one of them feeds your filing readiness without anyone
        being asked for a bill. Open one and see what the owner sees.
      </Note>

      <div>
        <SectionTitle sub="Click through to see exactly what that owner sees when he opens his laptop">Live applications</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {live.map((c) => {
            const b = brandOf(c.id)
            const row = LEDGER[c.id][CURRENT_PERIOD]
            return (
              <Link key={c.id} to={'/app/' + c.id} className="card overflow-hidden hover:border-brand-300 transition-colors group">
                <div style={{ background: b.accent }} className="px-4 py-3.5 text-white">
                  <div className="flex items-start gap-3">
                    <span className="w-10 h-10 rounded-xl bg-white/20 grid place-items-center shrink-0">
                      <VerticalIcon client={c} size={20} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14.5px] font-extrabold truncate">{c.realv.appName}</p>
                      <p className="text-[11.5px] text-white/80 truncate">{c.name}</p>
                    </div>
                    <ArrowRight size={16} className="shrink-0 opacity-70 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-[11.5px] text-white/75 mt-2.5 truncate">{b.tagline}</p>
                </div>

                <div className="p-4">
                  <div className="flex flex-wrap gap-1.5">
                    {c.realv.modules.slice(0, 3).map((m) => (
                      <span key={m} className="chip bg-soft text-mute border border-line">{m}</span>
                    ))}
                    {c.realv.modules.length > 3 && (
                      <span className="chip bg-soft text-faint border border-line">+{c.realv.modules.length - 3} more</span>
                    )}
                  </div>

                  <div className="mt-3.5 grid grid-cols-3 gap-3">
                    <MiniStat label="Users" value={c.realv.users} />
                    <MiniStat label="Uptime" value={c.realv.uptime + '%'} tone="ok" />
                    <MiniStat label="Fee" value={inrShort(c.realv.fee)} />
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-line">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11.5px] text-mute">Data ready for {pLabel(CURRENT_PERIOD)}</span>
                      <Readiness pct={row.readiness.pct} width={70} />
                    </div>
                    <p className="text-[11px] text-faint">
                      {row.readiness.autoCaptured}% of it arrived without anyone asking
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {building.length > 0 && (
        <div>
          <SectionTitle sub="Billing starts the month it goes live">Being built</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {building.map((c) => {
              const b = brandOf(c.id)
              return (
                <Link key={c.id} to={'/app/' + c.id} className="card p-4 hover:border-brand-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <span className="w-10 h-10 rounded-xl grid place-items-center shrink-0" style={{ background: b.accent + '18', color: b.accent }}>
                      <Wrench size={19} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-extrabold text-ink truncate">{c.realv.appName}</p>
                      <p className="text-[11.5px] text-mute truncate">{c.name}</p>
                    </div>
                    <Pill tone="brand" dot>70%</Pill>
                  </div>
                  <div className="mt-3"><Bar value={70} tone="brand" height={7} /></div>
                  <div className="mt-3.5 grid grid-cols-3 gap-3">
                    <MiniStat label="Go-live" value="01 Oct" tone="brand" />
                    <MiniStat label="Fee" value={inrShort(c.realv.fee)} />
                    <MiniStat label="Your share" value={inrShort(Math.round(c.realv.fee * 0.2))} tone="ok" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      <div>
        <SectionTitle sub="Open one to see the case for building it — the chase list, the overdue filings and the fee">
          No application yet
        </SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {rest.map((c) => {
            const row = LEDGER[c.id][CURRENT_PERIOD]
            return (
              <Link key={c.id} to={'/app/' + c.id} className="card p-4 hover:border-brand-300 transition-colors">
                <div className="flex items-start gap-3">
                  <span className="w-10 h-10 rounded-xl bg-soft text-mute grid place-items-center shrink-0">
                    <VerticalIcon client={c} size={19} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-extrabold text-ink truncate">{c.name}</p>
                    <p className="text-[11.5px] text-mute truncate">{c.books.mode}</p>
                  </div>
                  <Pill tone={PIPELINE_TONE[c.realv.status]}>{c.realv.status}</Pill>
                </div>
                <div className="mt-3.5 grid grid-cols-2 gap-3">
                  <MiniStat label="Data ready" value={row.readiness.pct + '%'} tone={row.readiness.pct < 60 ? 'bad' : 'warn'} />
                  <MiniStat label="Would add" value={inrShort(Math.round((c.realv.fee || 8000) * 0.2)) + '/mo'} tone="ok" />
                </div>
                <p className="text-[11.5px] text-mute mt-3 pt-3 border-t border-line leading-snug">
                  Books closed till {c.books.closedTill.slice(8, 10)}/{c.books.closedTill.slice(5, 7)} · {c.risk} risk
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
