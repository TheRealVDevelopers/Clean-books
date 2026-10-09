import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, TrendingUp, CalendarClock, AlertOctagon, Landmark, IndianRupee, Sparkles,
  ArrowRight, Clock, Zap, MessageSquareOff, FileCheck2, ShoppingBag, AlertTriangle,
  Upload, BellRing, UtensilsCrossed, CheckCircle2, Hammer, Plane, Scissors, Wrench,
  Truck, Stethoscope, ScrollText,
} from 'lucide-react'
import {
  BarChart, Bar as RBar, XAxis, YAxis, CartesianGrid, Tooltip, Line, LineChart, Legend,
} from 'recharts'
import { Card, CardHead, PageHead, Kpi, Pill, Donut, Table, Empty, MiniStat, Bar } from '../components/ui.jsx'
import { ClientChip, StatusPill, DueCell, Readiness, SectionTitle, Note, AutoTag, VerticalIcon } from '../components/bits.jsx'
import ChartBox from '../components/ChartBox.jsx'
import { useApp } from '../lib/store.jsx'
import { useRepo } from '../repo/index.js'
import { isDone, sortByDue } from '../lib/obligations.js'
import { ACTIVITY_TONE } from '../lib/status.js'
import { inr, inrShort, axisMoney, rel, num, pct } from '../lib/format.js'
import { pLabel, pLabelLong } from '../lib/dates.js'

const ICONS = {
  FileCheck2, ShoppingBag, AlertTriangle, Upload, BellRing, UtensilsCrossed, TrendingUp,
  CheckCircle2, Hammer, Plane, Scissors, Wrench, Truck, Stethoscope, ScrollText,
}

export default function Dashboard() {
  const { whoInfo, statusOf, fileReturn, markReady, docStatusOf } = useApp()
  const {
    FIRM, CURRENT_PERIOD, clientById, WATCHLIST, OBLIGATIONS, overdueObligations, dueWithin,
    ACTIVITY, AUTOMATION, revenue,
    practiceKpis, alerts, turnoverSeries, readinessBuckets, kindLoad, filingBoard,
  } = useRepo()
  const k = useMemo(() => practiceKpis(docStatusOf), [practiceKpis, docStatusOf])
  const feed = useMemo(() => alerts(docStatusOf), [alerts, docStatusOf])
  const series = useMemo(() => turnoverSeries(), [turnoverSeries])
  const buckets = useMemo(() => readinessBuckets(), [readinessBuckets])
  const kinds = useMemo(() => kindLoad(), [kindLoad])
  const board = useMemo(() => filingBoard(CURRENT_PERIOD, docStatusOf), [filingBoard, CURRENT_PERIOD, docStatusOf])

  const week = useMemo(() => sortByDue([...overdueObligations(), ...dueWithin(7)]), [overdueObligations, dueWithin])
  const gstr1 = useMemo(
    () => OBLIGATIONS.filter((o) => o.form === 'GSTR-1' && o.period === CURRENT_PERIOD),
    [OBLIGATIONS, CURRENT_PERIOD],
  )
  const r1Ready = gstr1.filter((o) => ['Filed', 'Filed Late', 'Ready to File'].includes(statusOf(o))).length

  return (
    <div className="space-y-5">
      <PageHead
        title={'Good morning, ' + whoInfo.short.split(' ')[0]}
        sub={pLabelLong('2026-09') + ' · 10 September, Thursday · ' + FIRM.short}
        chips={[
          <Pill key="p" tone="brand" dot>Filing period {pLabel(CURRENT_PERIOD)}</Pill>,
          <Pill key="c" tone="mute">{k.clients} clients</Pill>,
          <Pill key="a" tone="ok" dot>{k.onAuto} on automatic capture</Pill>,
          <Pill key="o" tone={k.overdueCount ? 'bad' : 'ok'} dot>{k.overdueCount} overdue</Pill>,
        ]}
        actions={
          <>
            <Link to="/gst" className="btn-ghost">Open GST workspace</Link>
            {revenue && <Link to="/revenue" className="btn-primary"><IndianRupee size={14} /> My revenue share</Link>}
          </>
        }
      />

      {/* ------------------------------------------------------- opening alarm */}
      <div className="card p-4 border-l-4 border-l-bad-500 flex flex-wrap items-center gap-4">
        <span className="w-10 h-10 rounded-xl bg-bad-50 text-bad-600 grid place-items-center shrink-0">
          <CalendarClock size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-extrabold text-ink">
            GSTR-1 for {pLabel(CURRENT_PERIOD)} falls due tomorrow — {r1Ready} of {gstr1.length} monthly clients can go out today
          </p>
          <p className="text-[12.5px] text-mute mt-0.5">
            {gstr1.length - r1Ready} are still short of data. GSTR-3B follows on 20 Sep with {inrShort(k.taxToPay)} of tax to pay,
            and advance tax for Q2 is due on 15 Sep.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/documents" className="btn-ghost">Chase {k.docsOpen} documents</Link>
          <Link to="/gst" className="btn-primary">File returns <ArrowRight size={14} /></Link>
        </div>
      </div>

      {/* ---------------------------------------------------------------- KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <Kpi label="Clients managed" value={k.clients} icon={Users} tone="brand"
          sub={k.onAuto + ' feed data automatically'}
          foot={<div className="flex items-center justify-between"><span className="text-[11px] text-mute">Free tier</span><span className="num text-[11.5px] font-bold">{k.clients - k.onAuto}</span></div>} />
        <Kpi label="Turnover this month" value={inrShort(k.turnoverMonth)} icon={TrendingUp} tone="ok"
          sub={'FY 26-27 run-rate ' + inrShort(k.turnoverFy)} />
        <Kpi label="Due in 7 days" value={k.weekCount} icon={CalendarClock} tone="warn"
          sub={k.openCount + ' obligations open in total'} />
        <Kpi label="Overdue" value={k.overdueCount} icon={AlertOctagon} tone="bad"
          sub="All on manual-data clients" />
        <Kpi label="Tax payable this cycle" value={inrShort(k.taxToPay)} icon={Landmark} tone="info"
          sub="GSTR-3B cash across the book" />
        {revenue && (
          <Kpi label="Your 20% share" value={inr(k.shareMonth)} icon={IndianRupee} tone="ok"
            sub={inr(k.sharePaid) + ' received so far'}
            foot={<Link to="/revenue" className="text-[11.5px] font-bold text-ok-600 flex items-center gap-1">Statement <ArrowRight size={11} /></Link>} />
        )}
      </div>

      {/* ------------------------------------------------- work queue + alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2 overflow-hidden">
          <CardHead title="This week's filing queue" sub="Overdue first, then everything due in the next seven days" icon={CalendarClock}
            right={<Link to="/calendar" className="btn-quiet !h-7 text-[12px]">Full calendar <ArrowRight size={12} /></Link>} />
          <Table
            columns={[
              { key: 'client', label: 'Client', render: (o) => <ClientChip client={clientById[o.clientId]} sub={clientById[o.clientId].constitution} /> },
              { key: 'form', label: 'Obligation', render: (o) => (
                <div className="min-w-0">
                  <p className="text-[12.5px] font-bold text-ink">{o.form}</p>
                  <p className="text-[11px] text-mute truncate max-w-[240px]">{o.periodLabel} · {o.formLabel}</p>
                </div>
              ) },
              { key: 'due', label: 'Due', sortValue: (o) => o.due, render: (o) => <DueCell due={o.due} done={isDone({ ...o, status: statusOf(o) })} /> },
              { key: 'amt', label: 'Payable', align: 'right', sortValue: (o) => o.amount || 0,
                render: (o) => o.amount ? <span className="num text-[12.5px] font-bold">{inr(o.amount)}</span> : <span className="text-faint">—</span> },
              { key: 'status', label: 'Status', render: (o) => <StatusPill status={statusOf(o)} /> },
              { key: 'act', label: '', align: 'right', render: (o) => {
                const s = statusOf(o)
                const c = clientById[o.clientId]
                if (['Filed', 'Filed Late'].includes(s)) return <span className="text-[11.5px] text-ok-600 font-bold">Done</span>
                if (s === 'Ready to File') return <button onClick={() => fileReturn(o, c.short)} className="btn-primary !h-7 !px-2.5 text-[12px]">File now</button>
                if (['Awaiting Data', 'Blocked'].includes(s)) return <Link to="/documents" className="btn-ghost !h-7 !px-2.5 text-[12px]">Chase</Link>
                return <button onClick={() => markReady(o, c.short)} className="btn-ghost !h-7 !px-2.5 text-[12px]">Mark ready</button>
              } },
            ]}
            rows={week}
            keyFn={(o) => o.id}
            pageSize={9}
            empty="Nothing due this week"
          />
        </Card>

        <Card className="overflow-hidden">
          <CardHead title="Needs attention" sub="Statutory deadlines first, advisory nudges after" icon={AlertOctagon}
            right={<Pill tone="bad">{feed.length}</Pill>} />
          <div className="max-h-[520px] overflow-y-auto">
            {feed.slice(0, 11).map((a) => (
              <Link key={a.id} to={a.link} className="block px-4 py-3 border-t border-line first:border-t-0 hover:bg-soft transition-colors">
                <div className="flex items-start gap-2.5">
                  <span className={'w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ' +
                    (a.severity === 'critical' ? 'bg-bad-500' : a.severity === 'high' ? 'bg-warn-500' : 'bg-info-500')} />
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-bold text-ink leading-snug">{a.title}</p>
                    <p className="text-[11.5px] text-mute mt-0.5 leading-snug">{a.detail}</p>
                    <Pill tone={a.kind === 'Advisory' ? 'brand' : a.kind === 'Notice' ? 'bad' : 'mute'} className="mt-1.5">{a.kind}</Pill>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {/* ------------------------------------------------------------- charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHead title="Turnover and tax across the whole book" sub="Last twelve months, every client combined" icon={TrendingUp} />
          <div className="p-4">
            <ChartBox height={252}>
              {(w, h) => (
                <BarChart width={w} height={h} data={series} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--line))" vertical={false} />
                  <XAxis dataKey="short" tick={{ fontSize: 11, fill: 'rgb(var(--mute))' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={axisMoney} tick={{ fontSize: 11, fill: 'rgb(var(--mute))' }} axisLine={false} tickLine={false} width={54} />
                  <Tooltip
                    formatter={(v, n) => [inr(v), n]}
                    contentStyle={{ background: 'rgb(var(--card))', border: '1px solid rgb(var(--line))', borderRadius: 10, fontSize: 12 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11.5 }} />
                  <RBar dataKey="turnover" name="Turnover" fill="#4F46E5" radius={[4, 4, 0, 0]} maxBarSize={26} />
                  <RBar dataKey="outputTax" name="Output tax" fill="#06B6D4" radius={[4, 4, 0, 0]} maxBarSize={26} />
                  <RBar dataKey="itc" name="ITC claimed" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={26} />
                </BarChart>
              )}
            </ChartBox>
          </div>
        </Card>

        <Card>
          <CardHead title="Can we file today?" sub={'Data readiness for ' + pLabel(CURRENT_PERIOD)} icon={Zap} />
          <div className="p-4 flex items-center gap-5">
            <Donut
              segments={buckets.map((b) => ({ value: b.value, color: b.color }))}
              center={
                <div>
                  <p className="text-[22px] font-extrabold num leading-none text-ink">{k.readiness}%</p>
                  <p className="text-[10.5px] text-mute mt-0.5">avg ready</p>
                </div>
              }
            />
            <div className="min-w-0 flex-1 space-y-2">
              {buckets.map((b) => (
                <div key={b.label} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: b.color }} />
                  <span className="text-[12px] text-mute truncate flex-1">{b.label}</span>
                  <span className="num text-[12.5px] font-bold text-ink">{b.value}</span>
                </div>
              ))}
              <div className="pt-2 mt-1 border-t border-line">
                <p className="text-[11.5px] text-mute leading-snug">
                  Every client below 80% is on manual data. The four blocked returns are all waiting on the same thing — bills.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ------------------------------------------------- client readiness board */}
      <div>
        <SectionTitle sub="One tile per client. Green means the return can go out today.">Client board</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {board.map((b) => {
            const next = b.obligations.filter((o) => !isDone({ ...o, status: statusOf(o) })).sort((x, y) => (x.due < y.due ? -1 : 1))[0]
            return (
              <Link key={b.client.id} to={'/clients/' + b.client.id} className="card p-3.5 hover:border-brand-300 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <ClientChip client={b.client} link={false} />
                  {b.client.realv.status === 'Live & Billing'
                    ? <Pill tone="ok">{inrShort(b.client.realv.fee)}/mo</Pill>
                    : <Pill tone="mute">Free tier</Pill>}
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <Readiness pct={b.readiness.pct} width={104} />
                  {b.blockers > 0 && <Pill tone="bad">{b.blockers} blocked</Pill>}
                </div>
                <div className="mt-3 pt-2.5 border-t border-line grid grid-cols-2 gap-2">
                  <MiniStat label="Turnover (Aug)" value={inrShort(b.row.sales)} />
                  <MiniStat label="3B payable" value={b.row.netPayable ? inrShort(b.row.netPayable) : '—'} tone={b.row.netPayable ? 'mute' : 'ok'} />
                </div>
                {next && (
                  <div className="mt-2.5 pt-2.5 border-t border-line flex items-center justify-between gap-2">
                    <span className="text-[11.5px] text-mute truncate">Next: <span className="font-semibold text-ink">{next.form}</span></span>
                    <DueCell due={next.due} showDate={false} />
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      </div>

      {/* --------------------------------------------------- automation + feed */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card>
          <CardHead title="What arrived without being asked for" sub={'Document capture in ' + pLabel(CURRENT_PERIOD)} icon={Sparkles}
            right={<AutoTag>CleanBook</AutoTag>} />
          <div className="p-4 space-y-4">
            <div>
              <div className="flex items-end justify-between mb-1.5">
                <p className="text-[28px] font-extrabold num leading-none text-ok-600">
                  {pct((AUTOMATION.autoCaptured / AUTOMATION.totalDocs) * 100, 0)}
                </p>
                <p className="text-[12px] text-mute">{num(AUTOMATION.autoCaptured)} of {num(AUTOMATION.totalDocs)} documents</p>
              </div>
              <Bar value={AUTOMATION.autoCaptured} max={AUTOMATION.totalDocs} tone="ok" height={8} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-soft p-3">
                <p className="label">Staff hours saved</p>
                <p className="text-[18px] font-extrabold num text-ink mt-0.5 flex items-center gap-1"><Clock size={14} className="text-ok-600" />{AUTOMATION.hoursSaved}</p>
                <p className="text-[11px] text-mute mt-0.5">this month, across the book</p>
              </div>
              <div className="rounded-lg bg-soft p-3">
                <p className="label">Chase messages avoided</p>
                <p className="text-[18px] font-extrabold num text-ink mt-0.5 flex items-center gap-1"><MessageSquareOff size={14} className="text-ok-600" />{AUTOMATION.chaseMessagesAvoided}</p>
                <p className="text-[11px] text-mute mt-0.5">no WhatsApp begging</p>
              </div>
            </div>
            <Note tone="brand" title="Where the gap is">
              The four clients still on manual data account for every overdue filing in the practice. Two of them
              already have a Real V proposal out.
            </Note>
          </div>
        </Card>

        <Card className="xl:col-span-2 overflow-hidden">
          <CardHead title="Practice inbox" sub="Everything that landed in the last three days" icon={Zap}
            right={<Pill tone="mute">{ACTIVITY.length} events</Pill>} />
          <div className="max-h-[430px] overflow-y-auto">
            {ACTIVITY.map((a) => {
              const c = clientById[a.clientId]
              const I = ICONS[a.icon] || Zap
              const tone = ACTIVITY_TONE[a.kind]
              return (
                <div key={a.id} className="px-4 py-3 border-t border-line first:border-t-0 flex items-start gap-3 hover:bg-soft transition-colors">
                  <span className={'w-8 h-8 rounded-lg grid place-items-center shrink-0 ' +
                    { ok: 'bg-ok-50 text-ok-600', warn: 'bg-warn-50 text-warn-600', bad: 'bg-bad-50 text-bad-600', info: 'bg-info-50 text-info-600', brand: 'bg-brand-50 text-brand-600', mute: 'bg-soft text-mute' }[tone]}>
                    <I size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[12.5px] font-bold text-ink">{a.title}</p>
                      <span className="text-[11px] text-faint shrink-0">{rel(a.at)}</span>
                    </div>
                    <p className="text-[11.5px] text-mute mt-0.5 leading-snug">{a.detail}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Link to={'/clients/' + c.id} className="chip border bg-soft text-mute border-line hover:text-ink">
                        <VerticalIcon client={c} size={10} /> {c.short}
                      </Link>
                      {a.kind === 'auto' && <AutoTag>Automatic</AutoTag>}
                      {a.kind === 'chase' && <Pill tone="warn">Chasing</Pill>}
                      {a.kind === 'notice' && <Pill tone="bad">Notice</Pill>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* ----------------------------------------------------- advisory + load */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2 overflow-hidden">
          <CardHead title="Advisory opportunities" sub="Thresholds and exposures worth a phone call this month" icon={TrendingUp}
            right={<Pill tone="brand">{WATCHLIST.length} on the watchlist</Pill>} />
          <div>
            {WATCHLIST.slice(0, 4).map((w) => {
              const c = clientById[w.clientId]
              return (
                <div key={w.id} className="px-4 py-3 border-t border-line first:border-t-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Pill tone={w.severity === 'high' ? 'bad' : w.severity === 'medium' ? 'warn' : 'info'}>{w.kind}</Pill>
                        <Link to={'/clients/' + c.id} className="text-[12.5px] font-bold text-ink hover:text-brand-600">{c.short}</Link>
                      </div>
                      <p className="text-[13px] font-bold text-ink mt-1.5">{w.headline}</p>
                      <p className="text-[11.5px] text-mute mt-0.5 leading-snug">{w.detail}</p>
                      <p className="text-[11.5px] text-brand-600 font-semibold mt-1.5">→ {w.action}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="label">Act by</p>
                      <p className="text-[12.5px] font-bold num text-ink mt-0.5">{w.by.slice(8, 10)}/{w.by.slice(5, 7)}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card>
          <CardHead title="Open work by type" sub="Where the hours are going" icon={CalendarClock} />
          <div className="p-4 space-y-2.5">
            {kinds.map((x) => (
              <div key={x.kind}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[12.5px] font-semibold text-ink">{x.kind}</span>
                  <span className="text-[11.5px] text-mute num">{x.value} items · {x.hours}h</span>
                </div>
                <div className="w-full h-2 rounded-full bg-soft overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: (x.value / Math.max(...kinds.map((y) => y.value))) * 100 + '%', background: x.color }} />
                </div>
              </div>
            ))}
            <div className="pt-3 mt-1 border-t border-line grid grid-cols-2 gap-3">
              <MiniStat label="ITC lines to match" value={k.itcLines} tone="warn" />
              <MiniStat label="ITC at risk" value={inrShort(k.itcAtRisk)} tone="bad" />
              <MiniStat label="Notices open" value={k.noticesOpen} tone="bad" />
              <MiniStat label="Notice exposure" value={inrShort(k.noticeExposure)} tone="bad" />
            </div>
            <Link to="/team" className="btn-ghost w-full justify-center mt-1">See workload by person</Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
