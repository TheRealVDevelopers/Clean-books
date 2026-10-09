// What the owner of a client with no application sees — which is really what
// the CA shows that owner in order to sell one.

import { Link } from 'react-router-dom'
import {
  Wrench, AlertTriangle, CheckCircle2, Clock, IndianRupee, ArrowRight, FileWarning, Sparkles,
} from 'lucide-react'
import { Card, CardHead, Pill, MiniStat, Bar, Field } from '../../../components/ui.jsx'
import { Note } from '../../../components/bits.jsx'
import { isDone } from '../../../lib/obligations.js'
import { useRepo } from '../../../repo/index.js'
import { inr, dateFull } from '../../../lib/format.js'

export default function NotBuilt({ client: c, accent }) {
  const { SNAPSHOTS, DOC_REQUESTS, forClient, daysLeft, NOTICES, LEDGER, CURRENT_PERIOD } = useRepo()
  const snap = SNAPSHOTS[c.id]
  const row = LEDGER[c.id][CURRENT_PERIOD]
  const docs = DOC_REQUESTS.filter((d) => d.clientId === c.id && d.status !== 'Received')
  const open = forClient(c.id).filter((o) => !isDone(o))
  const overdue = open.filter((o) => daysLeft(o) < 0)
  const notices = NOTICES.filter((n) => n.clientId === c.id && !['Closed', 'Dropped'].includes(n.status))
  const building = c.realv.status === 'Build In Progress'
  const share = Math.round((c.realv.fee || 8000) * 0.2)

  return (
    <div className="space-y-5">
      {building ? (
        <Card>
          <CardHead title="Your application is being built right now" sub={'Go-live 01 October 2026 · ' + c.realv.appName} icon={Wrench}
            right={<Pill tone="brand" dot>70% done</Pill>} />
          <div className="p-4 space-y-4">
            <Bar value={70} tone="brand" height={10} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {c.realv.modules.map((mod, i) => {
                const done = i < 3
                return (
                  <div key={mod} className="flex items-center gap-2.5 rounded-lg border border-line p-3">
                    <span className={'w-6 h-6 rounded-md grid place-items-center shrink-0 ' + (done ? 'bg-ok-50 text-ok-600' : 'bg-soft text-faint')}>
                      {done ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                    </span>
                    <span className="text-[12.5px] font-semibold text-ink">{mod}</span>
                    <span className="ml-auto shrink-0">{done ? <Pill tone="ok">Ready</Pill> : <Pill tone="mute">Building</Pill>}</span>
                  </div>
                )
              })}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-line">
              <MiniStat label="Build started" value="25 Aug 2026" />
              <MiniStat label="Go-live" value="01 Oct 2026" tone="brand" />
              <MiniStat label="Monthly fee from Oct" value={inr(c.realv.fee)} />
              <MiniStat label="Your CA's share" value={inr(share) + '/mo'} tone="ok" />
            </div>
          </div>
        </Card>
      ) : (
        <div className="card p-5 border-l-4" style={{ borderLeftColor: accent }}>
          <div className="flex flex-wrap items-start gap-4">
            <span className="w-11 h-11 rounded-xl grid place-items-center shrink-0" style={{ background: accent + '18', color: accent }}>
              <Wrench size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-[17px] font-extrabold text-ink">There is no application for {c.short} yet</h2>
              <p className="text-[13px] text-mute mt-1 leading-relaxed">
                {c.name} runs on {c.books.mode.toLowerCase()}. Books are closed only till{' '}
                {dateFull(c.books.closedTill)}, which is why this screen has nothing live to show — and why the
                practice spends its month chasing this one account.
              </p>
            </div>
            <Pill tone="warn" dot>{c.realv.status}</Pill>
          </div>
        </div>
      )}

      {/* ------------------------------------------------ what it costs today */}
      <div>
        <div className="flex items-end justify-between gap-3 mb-2.5">
          <div>
            <h3 className="text-[15px] font-extrabold text-ink">What that costs today</h3>
            <p className="text-[12px] text-mute mt-0.5">Not a projection — this is the current state of the account.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          <Cost label="Books behind by" value={Math.round((new Date('2026-09-10') - new Date(c.books.closedTill)) / 86400000) + ' days'} icon={Clock} tone="bad" />
          <Cost label="Documents being chased" value={docs.length} icon={FileWarning} tone={docs.length ? 'bad' : 'ok'} />
          <Cost label="Filings overdue" value={overdue.length} icon={AlertTriangle} tone={overdue.length ? 'bad' : 'ok'} />
          <Cost label="Open notices" value={notices.length} icon={AlertTriangle} tone={notices.length ? 'bad' : 'ok'} />
          <Cost label="Data ready for this month" value={row.readiness.pct + '%'} icon={Sparkles} tone={row.readiness.pct < 60 ? 'bad' : 'warn'} />
        </div>
      </div>

      {snap && (
        <Card>
          <CardHead title="Everything anyone knows about this business right now" sub={snap.headline} />
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {snap.tiles.map((t) => (
              <div key={t.label} className="rounded-xl border border-line p-3.5">
                <p className="label truncate">{t.label}</p>
                <p className={'text-[19px] font-extrabold num mt-1.5 leading-none ' +
                  { ok: 'text-ok-600', warn: 'text-warn-600', bad: 'text-bad-600', brand: 'text-brand-600', info: 'text-info-600', mute: 'text-ink' }[t.tone]}>
                  {t.value}
                </p>
                <p className="text-[11.5px] text-mute mt-1.5 truncate">{t.sub}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ------------------------------------------------------ what we'd build */}
      {!building && c.realv.modules.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card className="xl:col-span-2 overflow-hidden">
            <CardHead title={'What Real V would build for ' + c.short} sub={c.realv.appName + ' — scoped after a visit to the business, not picked off a menu'} icon={Sparkles} />
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 divide-line">
              {c.realv.modules.map((mod, i) => (
                <div key={mod} className={'px-4 py-3 flex items-start gap-2.5 ' + (i % 2 === 0 ? 'sm:border-r border-line' : '')}>
                  <span className="w-5 h-5 rounded-md grid place-items-center shrink-0 text-[10.5px] font-extrabold num"
                    style={{ background: accent + '20', color: accent }}>{i + 1}</span>
                  <span className="text-[12.5px] text-ink">{mod}</span>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-line bg-soft/50">
              <p className="text-[12px] text-mute leading-relaxed">
                Plus the four screens every CleanBook business gets: today's numbers, your people and
                attendance, your money, and the compliance corner your CA reads from.
              </p>
            </div>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHead title="The commercials" icon={IndianRupee} />
              <div className="p-4 space-y-3">
                <div className="rounded-xl p-3.5" style={{ background: accent + '12' }}>
                  <p className="label">Monthly fee to Real V</p>
                  <p className="text-[26px] font-extrabold num leading-none mt-1" style={{ color: accent }}>{inr(c.realv.fee || 8000)}</p>
                  <p className="text-[11.5px] text-mute mt-1">Build, hosting, changes and support included</p>
                </div>
                <Field label="What the owner gets" value="A system built around how this business actually runs, plus a website" />
                <Field label="What the practice gets" value={'Data that arrives on its own — and ' + inr(share) + ' a month, every month'} />
                <div className="pt-3 border-t border-line grid grid-cols-2 gap-3">
                  <MiniStat label="Your 20% share" value={inr(share) + '/mo'} tone="ok" />
                  <MiniStat label="Over a year" value={inr(share * 12)} tone="ok" />
                </div>
                <Link to="/revenue" className="btn-ghost w-full justify-center">See it in your revenue statement <ArrowRight size={13} /></Link>
              </div>
            </Card>

            <Note tone="brand" title="How to open the conversation">
              Do not lead with software. Lead with the {docs.length} documents being chased, the{' '}
              {overdue.length} overdue filing{overdue.length === 1 ? '' : 's'} and the{' '}
              {notices.length} open notice{notices.length === 1 ? '' : 's'}. The owner already knows
              this is painful — he has just never been shown the number.
            </Note>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Link to={'/clients/' + c.id} className="btn-ghost">Open the practice file for {c.short}</Link>
        <Link to="/apps" className="btn-ghost">See the apps that are live</Link>
      </div>
    </div>
  )
}

function Cost({ label, value, icon: Icon, tone }) {
  const col = { bad: 'text-bad-600 bg-bad-50', warn: 'text-warn-600 bg-warn-50', ok: 'text-ok-600 bg-ok-50' }[tone]
  return (
    <div className="card p-3.5">
      <div className="flex items-start justify-between gap-2">
        <p className="label">{label}</p>
        <span className={'w-6 h-6 rounded-md grid place-items-center shrink-0 ' + col}><Icon size={13} /></span>
      </div>
      <p className="text-[21px] font-extrabold num text-ink mt-1.5 leading-none">{value}</p>
    </div>
  )
}
