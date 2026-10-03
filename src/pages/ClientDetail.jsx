import { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Phone, Mail, MapPin, ArrowLeft, ExternalLink, Sparkles, TrendingUp, CalendarClock,
  FileSpreadsheet, GitCompareArrows, FolderOpen, ScrollText, MonitorSmartphone,
  IndianRupee, ShieldAlert, Send, Building2, Landmark,
} from 'lucide-react'
import {
  BarChart, Bar as RBar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, ComposedChart,
} from 'recharts'
import { Card, CardHead, PageHead, Kpi, Pill, Table, Tabs, MiniStat, Field, Empty, Bar } from '../components/ui.jsx'
import { ClientChip, DueCell, StatusPill, Readiness, Note, AutoTag, VerticalIcon, SectionTitle } from '../components/bits.jsx'
import ChartBox from '../components/ChartBox.jsx'
import { clientById, SNAPSHOTS, staffById, CURRENT_PERIOD, PERIOD_KEYS, LEDGER, isDone } from '../data/index.js'
import { DOC_STATUS_TONE } from '../data/recon.js'
import { NOTICE_TONE, RISK_TONE, PIPELINE_TONE } from '../lib/status.js'
import { AUTHORITY_TONE } from '../data/notices.js'
import { clientBrief } from '../lib/derive.js'
import { inr, inrShort, axisMoney, pct, dateFull, num } from '../lib/format.js'
import { pLabel } from '../lib/dates.js'
import { useApp } from '../lib/store.jsx'

export default function ClientDetail() {
  const { id } = useParams()
  const { statusOf, fileReturn, markReady, remind, toast, docStatusOf } = useApp()
  const [tab, setTab] = useState('overview')

  const b = useMemo(() => (clientById[id] ? clientBrief(id) : null), [id])
  if (!b) return <Empty label="No such client" sub="Pick one from the client book" />

  const c = b.client
  const snap = SNAPSHOTS[c.id]
  const staff = staffById[c.staffId]

  return (
    <div className="space-y-5">
      <Link to="/clients" className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-mute hover:text-ink">
        <ArrowLeft size={14} /> Client book
      </Link>

      {/* ------------------------------------------------------------- header */}
      <div className="card p-4 lg:p-5">
        <div className="flex flex-wrap items-start gap-4">
          <span className={'w-14 h-14 rounded-2xl grid place-items-center shrink-0 ' +
            (c.realv.status === 'Live & Billing' ? 'bg-brand-50 text-brand-600' : 'bg-soft text-mute')}>
            <VerticalIcon client={c} size={26} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[21px] font-extrabold tracking-tight text-ink">{c.name}</h1>
              <Pill tone={RISK_TONE[c.risk]} dot>{c.risk} risk</Pill>
              <Pill tone={PIPELINE_TONE[c.realv.status]}>{c.realv.status}</Pill>
              {c.eInvoice && <Pill tone="ok">e-Invoicing live</Pill>}
            </div>
            <p className="text-[13px] text-mute mt-1">
              {c.verticalLabel} · {c.constitution} · {c.area}, {c.city}
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3 text-[12px]">
              <span className="flex items-center gap-1.5 text-mute"><Building2 size={13} /> GSTIN <span className="num font-semibold text-ink">{c.gstin || 'Unregistered'}</span></span>
              <span className="flex items-center gap-1.5 text-mute"><Landmark size={13} /> PAN <span className="num font-semibold text-ink">{c.pan}</span></span>
              <span className="flex items-center gap-1.5 text-mute"><Phone size={13} /> {c.owner} · <span className="num">{c.ownerPhone}</span></span>
              <span className="flex items-center gap-1.5 text-mute"><Mail size={13} /> {c.ownerEmail}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <Link to={'/app/' + c.id} className="btn-ghost">
                <MonitorSmartphone size={14} /> {c.realv.status === 'Live & Billing' ? 'See what the owner sees' : 'The case for building it'}
              </Link>
              <button className="btn-primary" onClick={() => toast(
                c.realv.status === 'Live & Billing' ? 'Request pushed into their app' : 'Reminder sent on WhatsApp',
                c.owner + ' will see the pending list on ' + (c.realv.appName || 'WhatsApp'),
                c.realv.status === 'Live & Billing' ? 'ok' : 'warn',
              )}>
                <Send size={14} /> Request documents
              </button>
            </div>
            <p className="text-[11.5px] text-mute">Handled by <span className="font-semibold text-ink">{staff.name}</span> · {staff.title}</p>
          </div>
        </div>

        {c.notes && (
          <p className="mt-4 pt-3.5 border-t border-line text-[12.5px] text-mute leading-relaxed">
            <span className="font-bold text-ink">File note. </span>{c.notes}
          </p>
        )}
      </div>

      {/* ---------------------------------------------------------------- KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <Kpi label="FY 26-27 turnover" value={inrShort(b.fyTurnover)} icon={TrendingUp} tone="brand" sub={'projected ' + inrShort(c.annual)} />
        <Kpi label={pLabel(CURRENT_PERIOD) + ' turnover'} value={inrShort(b.row.sales)} icon={FileSpreadsheet} tone="mute" sub={num(b.row.invoiceCount) + ' invoices'} />
        <Kpi label="Data readiness" value={b.row.readiness.pct + '%'} icon={Sparkles} tone={b.row.readiness.pct >= 95 ? 'ok' : b.row.readiness.pct >= 80 ? 'info' : 'bad'}
          sub={c.books.mode} />
        <Kpi label="Open obligations" value={b.open.length} icon={CalendarClock} tone={b.overdue.length ? 'bad' : 'warn'}
          sub={b.overdue.length ? b.overdue.length + ' overdue' : 'none overdue'} />
        <Kpi label="GST paid this FY" value={inrShort(b.taxPaidFy)} icon={Landmark} tone="info" sub={'Aug payable ' + inrShort(b.row.netPayable)} />
        <Kpi label="Your share" value={c.realv.fee ? inr(Math.round(c.realv.fee * 0.2)) : '—'} icon={IndianRupee} tone={c.realv.fee ? 'ok' : 'mute'}
          sub={c.realv.fee ? '20% of ' + inr(c.realv.fee) + '/mo' : 'not on a Real V app yet'} />
      </div>

      {/* -------------------------------------------------- business snapshot */}
      {snap && (
        <Card>
          <CardHead
            title="What is actually happening in the business"
            sub={snap.headline}
            icon={MonitorSmartphone}
            right={c.realv.status === 'Live & Billing' ? <AutoTag>Live from {c.realv.appName}</AutoTag> : <Pill tone="warn">No live feed</Pill>}
          />
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {snap.tiles.map((t) => (
                <div key={t.label} className="rounded-xl border border-line p-3">
                  <p className="label truncate">{t.label}</p>
                  <p className={'text-[18px] font-extrabold num mt-1 leading-none ' +
                    { ok: 'text-ok-600', warn: 'text-warn-600', bad: 'text-bad-600', brand: 'text-brand-600', info: 'text-info-600', mute: 'text-ink' }[t.tone]}>
                    {t.value}
                  </p>
                  <p className="text-[11px] text-mute mt-1 truncate">{t.sub}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              {snap.flags.map((f, i) => (
                <div key={i} className="flex items-start gap-2.5 text-[12.5px] text-mute leading-relaxed">
                  <ShieldAlert size={14} className="text-warn-600 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* ---------------------------------------------------------------- tabs */}
      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-line">
          <Tabs
            active={tab} onChange={setTab}
            tabs={[
              { id: 'overview', label: 'Overview' },
              { id: 'compliance', label: 'Compliance', count: b.open.length },
              { id: 'gst', label: 'GST ledger' },
              { id: 'itc', label: 'ITC vs 2B', count: b.itc.length },
              { id: 'docs', label: 'Documents', count: b.docs.filter((d) => docStatusOf(d) !== 'Received').length },
              { id: 'notices', label: 'Notices', count: b.notices.length },
              { id: 'app', label: 'Their application' },
            ]}
          />
        </div>

        {tab === 'overview' && <Overview b={b} />}
        {tab === 'compliance' && (
          <Table
            columns={[
              { key: 'form', label: 'Obligation', render: (o) => (
                <div className="min-w-0">
                  <p className="text-[12.5px] font-bold text-ink">{o.form}</p>
                  <p className="text-[11px] text-mute truncate max-w-[300px]">{o.formLabel}</p>
                </div>
              ) },
              { key: 'kind', label: 'Head', render: (o) => <Pill tone="mute">{o.kind}</Pill> },
              { key: 'period', label: 'Period', render: (o) => <span className="text-[12.5px] text-mute">{o.periodLabel}</span> },
              { key: 'due', label: 'Due', sortValue: (o) => o.due, render: (o) => <DueCell due={o.due} done={isDone({ ...o, status: statusOf(o) })} /> },
              { key: 'amt', label: 'Amount', align: 'right', sortValue: (o) => o.amount || 0,
                render: (o) => o.amount ? <span className="num text-[12.5px] font-semibold">{inr(o.amount)}</span> : <span className="text-faint">—</span> },
              { key: 'status', label: 'Status', render: (o) => <StatusPill status={statusOf(o)} /> },
              { key: 'who', label: 'Owner', render: (o) => <span className="text-[12px] text-mute">{staffById[o.assignee].short}</span> },
              { key: 'note', label: 'Note', render: (o) => o.note
                ? <p className="text-[11.5px] text-mute max-w-[280px] whitespace-normal leading-snug">{o.note}</p>
                : <span className="text-faint">—</span> },
              { key: 'act', label: '', align: 'right', render: (o) => {
                const s = statusOf(o)
                if (['Filed', 'Filed Late', 'Not Applicable'].includes(s)) return <span className="text-[11.5px] text-mute">{o.arn ? <span className="num">{o.arn}</span> : '—'}</span>
                if (s === 'Ready to File') return <button className="btn-primary !h-7 !px-2.5 text-[12px]" onClick={() => fileReturn(o, c.short)}>File</button>
                return <button className="btn-ghost !h-7 !px-2.5 text-[12px]" onClick={() => markReady(o, c.short)}>Mark ready</button>
              } },
            ]}
            rows={b.obligations}
            keyFn={(o) => o.id}
            initialSort={{ key: 'due', dir: 'asc' }}
            pageSize={14}
          />
        )}
        {tab === 'gst' && <GstLedger clientId={c.id} />}
        {tab === 'itc' && (
          b.itc.length ? (
            <Table
              columns={[
                { key: 'vendor', label: 'Vendor', render: (r) => (
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-bold text-ink truncate max-w-[200px]">{r.vendor}</p>
                    <p className="num text-[10.5px] text-mute">{r.gstin}</p>
                  </div>
                ) },
                { key: 'inv', label: 'Invoice', render: (r) => (
                  <div>
                    <p className="num text-[12px] text-ink">{r.invoiceNo}</p>
                    <p className="text-[10.5px] text-mute">{r.date.slice(8, 10)}/{r.date.slice(5, 7)}</p>
                  </div>
                ) },
                { key: 'taxable', label: 'Taxable', align: 'right', sortValue: (r) => r.taxable, render: (r) => <span className="num text-[12.5px]">{inr(r.taxable)}</span> },
                { key: 'tax', label: 'Tax', align: 'right', sortValue: (r) => r.tax, render: (r) => <span className="num text-[12.5px] font-bold">{inr(r.tax)}</span> },
                { key: 'reason', label: 'Why it differs', render: (r) => <Pill tone={r.tone}>{r.reason}</Pill> },
                { key: 'action', label: 'What to do', render: (r) => <p className="text-[11.5px] text-mute max-w-[280px] whitespace-normal leading-snug">{r.action}</p> },
                { key: 'status', label: 'Status', render: (r) => <Pill tone={r.status === 'Open' ? 'warn' : 'info'}>{r.status}</Pill> },
              ]}
              rows={b.itc}
              keyFn={(r) => r.id}
              initialSort={{ key: 'tax', dir: 'desc' }}
              pageSize={12}
            />
          ) : <Empty label="Books and 2B agree" sub="Nothing to reconcile for this period" icon={GitCompareArrows} />
        )}
        {tab === 'docs' && (
          b.docs.length ? (
            <Table
              columns={[
                { key: 'what', label: 'What was asked for', render: (d) => (
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-bold text-ink whitespace-normal max-w-[320px] leading-snug">{d.what}</p>
                    <p className="text-[11px] text-mute mt-0.5">{d.periodLabel} · asked {dateFull(d.requested)}</p>
                  </div>
                ) },
                { key: 'chan', label: 'Channel', render: (d) => d.onApp
                  ? <AutoTag>Client app</AutoTag>
                  : <Pill tone="warn">{d.channel}</Pill> },
                { key: 'prog', label: 'Received', render: (d) => (
                  <div className="w-[110px]">
                    <Bar value={d.got} max={d.need} tone={d.got === d.need ? 'ok' : d.got ? 'warn' : 'bad'} height={6} />
                    <p className="text-[10.5px] text-faint mt-1 num">{d.got} of {d.need}</p>
                  </div>
                ) },
                { key: 'age', label: 'Waiting', align: 'right', sortValue: (d) => d.ageDays, render: (d) => <span className="num text-[12.5px]">{d.ageDays}d</span> },
                { key: 'blocks', label: 'Blocks', render: (d) => d.blocks ? <Pill tone="bad">{d.blocks}</Pill> : <span className="text-faint">—</span> },
                { key: 'status', label: 'Status', render: (d) => <Pill tone={DOC_STATUS_TONE[docStatusOf(d)]} dot>{docStatusOf(d)}</Pill> },
                { key: 'act', label: '', align: 'right', render: (d) => docStatusOf(d) === 'Received'
                  ? <span className="text-[11.5px] text-ok-600 font-bold">Done</span>
                  : <button className="btn-ghost !h-7 !px-2.5 text-[12px]" onClick={() => remind(d, c.short, d.onApp)}>Remind</button> },
              ]}
              rows={b.docs}
              keyFn={(d) => d.id}
              pageSize={0}
            />
          ) : <Empty label="Nothing pending" sub="Every document for this period is in" icon={FolderOpen} />
        )}
        {tab === 'notices' && (
          b.notices.length ? (
            <div className="divide-y divide-line">
              {b.notices.map((n) => (
                <div key={n.id} className="p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill tone={AUTHORITY_TONE[n.authority]}>{n.authority}</Pill>
                    <span className="text-[13px] font-bold text-ink">{n.form}</span>
                    <span className="num text-[11.5px] text-mute">{n.ref}</span>
                    <Pill tone={NOTICE_TONE[n.status]} dot>{n.status}</Pill>
                    {n.amount && <Pill tone="bad">{inr(n.amount)} at stake</Pill>}
                    <span className="ml-auto text-[11.5px] text-mute">Reply by <span className="font-bold text-ink">{dateFull(n.replyBy)}</span></span>
                  </div>
                  <p className="text-[12.5px] text-ink mt-2.5 leading-relaxed">{n.summary}</p>
                  <p className="text-[12.5px] text-mute mt-2 leading-relaxed"><span className="font-bold text-ink">Our position. </span>{n.ourPosition}</p>
                </div>
              ))}
            </div>
          ) : <Empty label="No notices" sub="Nothing outstanding with any department" icon={ScrollText} />
        )}
        {tab === 'app' && <TheApp client={c} />}
      </Card>
    </div>
  )
}

/* ------------------------------------------------------------------- overview */
function Overview({ b }) {
  const c = b.client
  return (
    <div className="p-4 grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div className="xl:col-span-2 space-y-4">
        <div>
          <SectionTitle sub="Turnover, output tax and the credit actually claimed">Twelve-month trend</SectionTitle>
          <ChartBox height={250}>
            {(w, h) => (
              <ComposedChart width={w} height={h} data={b.series} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--line))" vertical={false} />
                <XAxis dataKey="short" tick={{ fontSize: 11, fill: 'rgb(var(--mute))' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={axisMoney} tick={{ fontSize: 11, fill: 'rgb(var(--mute))' }} axisLine={false} tickLine={false} width={54} />
                <Tooltip formatter={(v, n) => [inr(v), n]} contentStyle={{ background: 'rgb(var(--card))', border: '1px solid rgb(var(--line))', borderRadius: 10, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11.5 }} />
                <RBar dataKey="turnover" name="Turnover" fill="#4F46E5" radius={[4, 4, 0, 0]} maxBarSize={26} />
                <RBar dataKey="purchases" name="Purchases" fill="#A5B4FC" radius={[4, 4, 0, 0]} maxBarSize={26} />
                <Line type="monotone" dataKey="net" name="GST paid in cash" stroke="#F59E0B" strokeWidth={2.2} dot={{ r: 2.5 }} />
              </ComposedChart>
            )}
          </ChartBox>
        </div>

        {b.watch.length > 0 && (
          <div>
            <SectionTitle sub="Thresholds and exposures that need a decision, not a filing">On the watchlist</SectionTitle>
            <div className="space-y-2.5">
              {b.watch.map((w) => (
                <Note key={w.id} tone={w.severity === 'high' ? 'bad' : 'warn'} title={w.headline}>
                  <p>{w.detail}</p>
                  <p className="font-semibold mt-1.5">→ {w.action} (by {dateFull(w.by)})</p>
                </Note>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="card p-4">
          <p className="label mb-2.5">Registration & compliance profile</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Scheme" value={c.scheme} />
            <Field label="GST since" value={c.regDate ? dateFull(c.regDate) : '—'} />
            <Field label="e-Invoicing" value={c.eInvoice ? 'Live' : 'Not applicable'} tone={c.eInvoice ? 'ok' : undefined} />
            <Field label="Blended GST rate" value={c.gstRate + '%'} />
            <Field label="TDS sections" value={c.tdsSections.length ? c.tdsSections.join(', ') : 'Not applicable'} />
            <Field label="PF / ESI / PT" value={[c.pf && 'PF', c.esi && 'ESI', c.pt && 'PT'].filter(Boolean).join(' · ') || 'None'} />
            <Field label="ITR form" value={c.itr.form + ' · ' + c.itr.status} />
            <Field label="ROC filings" value={c.roc.length ? c.roc.join(', ') : 'Not a company'} />
          </div>
          <div className="mt-3 pt-3 border-t border-line">
            <Field label="Tax audit u/s 44AB" value={c.taxAudit.applicable ? 'Applicable' : 'Not applicable'} tone={c.taxAudit.applicable ? 'bad' : 'ok'} />
            <p className="text-[11.5px] text-mute mt-1 leading-snug">{c.taxAudit.reason}</p>
          </div>
        </div>

        <div className="card p-4">
          <p className="label mb-2.5">Books & data</p>
          <Field label="Source" value={c.books.mode} tone={c.books.mode === 'CleanBook Auto' ? 'ok' : 'bad'} />
          <div className="grid grid-cols-2 gap-3 mt-3">
            <Field label="Closed till" value={dateFull(c.books.closedTill)} />
            <Field label="Bank synced" value={b.row.readiness.bankSyncedTill ? dateFull(b.row.readiness.bankSyncedTill) : '—'} />
          </div>
          <div className="mt-3 pt-3 border-t border-line">
            <p className="label mb-1.5">{pLabel(CURRENT_PERIOD)} capture</p>
            <div className="space-y-2">
              <CaptureBar label="Sales invoices" got={b.row.readiness.salesDocs.captured} need={b.row.readiness.salesDocs.expected} />
              <CaptureBar label="Purchase bills" got={b.row.readiness.purchDocs.captured} need={b.row.readiness.purchDocs.expected} />
            </div>
            <p className="text-[11.5px] text-mute mt-2.5">
              {b.row.readiness.autoCaptured}% of it arrived without anyone asking.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function CaptureBar({ label, got, need }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11.5px] text-mute">{label}</span>
        <span className="text-[11.5px] num font-semibold text-ink">{got} / {need}</span>
      </div>
      <Bar value={got} max={need} tone={got >= need ? 'ok' : got / need > 0.7 ? 'warn' : 'bad'} height={6} />
    </div>
  )
}

/* ----------------------------------------------------------------- GST ledger */
function GstLedger({ clientId }) {
  const keys = [...PERIOD_KEYS].reverse().slice(0, 14)
  const rows = keys.map((k) => LEDGER[clientId][k])
  return (
    <Table
      columns={[
        { key: 'p', label: 'Period', render: (r) => <span className="text-[12.5px] font-bold text-ink">{pLabel(r.period)}</span> },
        { key: 'sales', label: 'Taxable sales', align: 'right', sortValue: (r) => r.sales, render: (r) => <span className="num text-[12.5px]">{inr(r.sales)}</span> },
        { key: 'out', label: 'Output tax', align: 'right', sortValue: (r) => r.outputTax, render: (r) => <span className="num text-[12.5px]">{inr(r.outputTax)}</span> },
        { key: 'igst', label: 'of which IGST', align: 'right', render: (r) => <span className="num text-[12px] text-mute">{inr(r.igstOut)}</span> },
        { key: 'itcb', label: 'ITC in books', align: 'right', sortValue: (r) => r.itcBooks, render: (r) => <span className="num text-[12.5px]">{inr(r.itcBooks)}</span> },
        { key: 'itc2b', label: 'ITC in 2B', align: 'right', sortValue: (r) => r.itc2B, render: (r) => <span className="num text-[12.5px]">{inr(r.itc2B)}</span> },
        { key: 'gap', label: 'Gap', align: 'right', sortValue: (r) => r.mismatch,
          render: (r) => r.mismatch ? <span className="num text-[12.5px] font-bold text-warn-600">{inr(r.mismatch)}</span> : <span className="text-ok-600 text-[12px] font-bold">nil</span> },
        { key: 'net', label: 'Paid in cash', align: 'right', sortValue: (r) => r.netPayable, render: (r) => <span className="num text-[12.5px] font-bold">{inr(r.netPayable)}</span> },
        { key: 'r1', label: 'GSTR-1', render: (r) => <StatusPill status={r.gstr1.status} dot={false} /> },
        { key: 'r3', label: 'GSTR-3B', render: (r) => <StatusPill status={r.gstr3b.status} dot={false} /> },
        { key: 'late', label: 'Late fee', align: 'right', render: (r) => r.lateFee ? <span className="num text-[12px] text-bad-600">{inr(r.lateFee + r.interest)}</span> : <span className="text-faint">—</span> },
        { key: 'arn', label: 'ARN', render: (r) => r.gstr3b.arn ? <span className="num text-[11px] text-mute">{r.gstr3b.arn}</span> : <span className="text-faint">—</span> },
      ]}
      rows={rows}
      keyFn={(r) => r.period}
      pageSize={0}
    />
  )
}

/* ------------------------------------------------------------- their software */
function TheApp({ client: c }) {
  if (!c.realv.appName) {
    return (
      <div className="p-6">
        <Note tone="warn" title="No application built for this business yet">
          {c.short} is on the free tier. Their books arrive as {c.books.mode.toLowerCase()}, which is why the data
          readiness on this account keeps the practice waiting. A custom build would remove the chase entirely — and
          add {inr(Math.round((c.realv.fee || 8000) * 0.2))} a month to your revenue share.
        </Note>
      </div>
    )
  }
  const live = c.realv.status === 'Live & Billing'
  return (
    <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        <div className="card p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <MonitorSmartphone size={16} className="text-brand-600" />
                <h3 className="text-[14px] font-bold text-ink">{c.realv.appName}</h3>
                <Pill tone={PIPELINE_TONE[c.realv.status]} dot>{c.realv.status}</Pill>
              </div>
              <p className="text-[12px] text-mute mt-1">
                Built for {c.name} by The Real V Developers{c.realv.since ? ' · live since ' + dateFull(c.realv.since) : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link to={'/app/' + c.id} className="btn-primary">
                <MonitorSmartphone size={14} /> Open the owner's app
              </Link>
              {c.realv.site && (
                <a href={'https://' + c.realv.site} target="_blank" rel="noreferrer" className="btn-ghost">
                  <ExternalLink size={14} /> {c.realv.site}
                </a>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3.5 border-t border-line">
            <MiniStat label="Modules" value={c.realv.modules.length} />
            <MiniStat label="Users" value={c.realv.users || '—'} />
            <MiniStat label="Uptime" value={c.realv.uptime ? c.realv.uptime + '%' : '—'} tone="ok" />
            <MiniStat label="Monthly fee" value={c.realv.fee ? inr(c.realv.fee) : '—'} />
          </div>
        </div>

        <div className="card overflow-hidden">
          <CardHead title="What was built" sub="Shaped around how this business actually runs — not a template" />
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 divide-line">
            {c.realv.modules.map((m, i) => (
              <div key={m} className={'px-4 py-3 flex items-start gap-2.5 ' + (i % 2 === 0 ? 'sm:border-r border-line' : '')}>
                <span className="w-5 h-5 rounded-md bg-brand-50 text-brand-700 text-[10.5px] font-extrabold grid place-items-center shrink-0 num">{i + 1}</span>
                <span className="text-[12.5px] text-ink">{m}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="card p-4">
          <p className="label mb-2">What it does for the practice</p>
          <ul className="space-y-2 text-[12.5px] text-mute leading-relaxed">
            <li>Sales and purchase documents land in CleanBook as they happen, tagged to the right GST head.</li>
            <li>Document requests go into the owner's own app, so there is no WhatsApp chase.</li>
            <li>Payroll, TDS and payment data come across in the same feed.</li>
          </ul>
          <div className="mt-3 pt-3 border-t border-line">
            <MiniStat label="Readiness this month" value={LEDGER[c.id][CURRENT_PERIOD].readiness.pct + '%'} tone={live ? 'ok' : 'warn'} />
          </div>
        </div>

        {c.realv.fee > 0 && (
          <div className="card p-4 bg-ok-50/40 border-ok-500/25">
            <p className="label mb-1">Your revenue share from this client</p>
            <p className="text-[24px] font-extrabold num text-ok-700 leading-none">{inr(Math.round(c.realv.fee * 0.2))}</p>
            <p className="text-[12px] text-mute mt-1">every month · 20% of {inr(c.realv.fee)}</p>
            <Link to="/revenue" className="btn-ghost w-full justify-center mt-3">Full statement</Link>
          </div>
        )}
      </div>
    </div>
  )
}
