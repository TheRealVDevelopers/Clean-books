import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileSpreadsheet, Landmark, GitCompareArrows, Zap, Download, CheckCheck, Upload,
  AlertOctagon, Sparkles, ArrowRight,
} from 'lucide-react'
import { Card, CardHead, PageHead, Kpi, Pill, Table, MiniStat, Segmented, Empty, Bar } from '../components/ui.jsx'
import { ClientChip, DueCell, StatusPill, Readiness, Note, AutoTag } from '../components/bits.jsx'
import { isDone } from '../lib/obligations.js'
import { inr, inrShort, num, toCsv } from '../lib/format.js'
import { pLabel, dueOn } from '../lib/dates.js'
import { useApp } from '../lib/store.jsx'
import { useRepo } from '../repo/index.js'

export default function Gst() {
  const { CLIENTS, CURRENT_PERIOD, PERIOD_KEYS, LEDGER, OBLIGATIONS, filingBoard } = useRepo()
  const { statusOf, fileReturn, markReady, toast, docStatusOf } = useApp()
  const [period, setPeriod] = useState(CURRENT_PERIOD)
  const [only, setOnly] = useState('all')

  const board = useMemo(
    () => filingBoard(period, docStatusOf).filter((b) => b.client.scheme !== 'Unregistered'),
    [period, docStatusOf],
  )
  const obs = useMemo(
    () => OBLIGATIONS.filter((o) => o.period === period && ['GSTR-1', 'GSTR-3B', 'PMT-06'].includes(o.form)),
    [period],
  )
  const obFor = (clientId, form) => obs.find((o) => o.clientId === clientId && o.form === form)

  const rows = board.filter((b) => {
    if (only === 'ready') return ['Ready to File', 'Filed', 'Filed Late'].includes(statusOf(obFor(b.client.id, 'GSTR-1') || { id: 'x', status: 'Not Started' }))
    if (only === 'blocked') return b.blockers > 0 || b.readiness.pct < 80
    if (only === 'monthly') return b.client.scheme === 'Regular'
    return true
  })

  const totals = board.reduce((a, b) => ({
    output: a.output + b.row.outputTax,
    itc: a.itc + b.row.itcClaimable,
    cash: a.cash + b.row.netPayable,
    gap: a.gap + b.row.mismatch,
    invoices: a.invoices + b.row.invoiceCount,
    rcm: a.rcm + b.row.rcm,
  }), { output: 0, itc: 0, cash: 0, gap: 0, invoices: 0, rcm: 0 })

  const r1 = obs.filter((o) => o.form === 'GSTR-1')
  const readyNow = r1.filter((o) => statusOf(o) === 'Ready to File')
  const filed = r1.filter((o) => ['Filed', 'Filed Late'].includes(statusOf(o)))

  const fileAll = () => {
    readyNow.forEach((o) => fileReturn(o, CLIENTS.find((c) => c.id === o.clientId).short))
  }

  const exportJson = () => {
    toast('GSTR-1 JSON generated', readyNow.length + ' returns packaged for the GST portal offline utility', 'brand')
  }

  const exportCsv = () => {
    const csv = toCsv(board, [
      { label: 'Client', value: (b) => b.client.name },
      { label: 'GSTIN', value: (b) => b.client.gstin },
      { label: 'Scheme', value: (b) => b.client.scheme },
      { label: 'Taxable sales', value: (b) => b.row.sales },
      { label: 'Output tax', value: (b) => b.row.outputTax },
      { label: 'ITC in books', value: (b) => b.row.itcBooks },
      { label: 'ITC in 2B', value: (b) => b.row.itc2B },
      { label: 'Gap', value: (b) => b.row.mismatch },
      { label: 'RCM', value: (b) => b.row.rcm },
      { label: 'Net cash payable', value: (b) => b.row.netPayable },
      { label: 'Readiness %', value: (b) => b.readiness.pct },
      { label: 'GSTR-1', value: (b) => b.gstr1.status },
      { label: 'GSTR-3B', value: (b) => b.gstr3b.status },
    ])
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'gst-workspace-' + period + '.csv'
    a.click()
    URL.revokeObjectURL(a.href)
    toast('Working sheet exported', 'gst-workspace-' + period + '.csv')
  }

  return (
    <div className="space-y-5">
      <PageHead
        title="GST workspace"
        sub={'One screen for the whole book. Output tax, credit, cash and status for ' + pLabel(period) + '.'}
        chips={[
          <Pill key="a" tone="brand" dot>{pLabel(period)}</Pill>,
          <Pill key="b" tone="ok">{filed.length} filed</Pill>,
          <Pill key="c" tone="warn">{readyNow.length} ready to file</Pill>,
          <Pill key="d" tone="bad">GSTR-1 due {dueOn(period, 1, 11).slice(8, 10)}/{dueOn(period, 1, 11).slice(5, 7)}</Pill>,
        ]}
        actions={
          <>
            <button className="btn-ghost" onClick={exportCsv}><Download size={14} /> Working sheet</button>
            <button className="btn-ghost" onClick={exportJson}><Upload size={14} /> Generate JSON</button>
            <button className="btn-primary disabled:opacity-40" disabled={!readyNow.length} onClick={fileAll}>
              <CheckCheck size={14} /> File {readyNow.length} ready
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <Kpi label="Output tax" value={inrShort(totals.output)} icon={FileSpreadsheet} tone="brand" sub={num(totals.invoices) + ' invoices'} />
        <Kpi label="ITC claimable" value={inrShort(totals.itc)} icon={Sparkles} tone="ok" sub="after 2B matching" />
        <Kpi label="RCM to self-invoice" value={inrShort(totals.rcm)} icon={AlertOctagon} tone="warn" sub="freight from unregistered vendors" />
        <Kpi label="Cash to pay" value={inrShort(totals.cash)} icon={Landmark} tone="info" sub="across the book, by 20th" />
        <Kpi label="Credit gap vs 2B" value={inrShort(totals.gap)} icon={GitCompareArrows} tone="bad"
          sub="held back until matched"
          foot={<Link to="/itc" className="text-[11.5px] font-bold text-brand-600 flex items-center gap-1">Reconcile <ArrowRight size={11} /></Link>} />
        <Kpi label="Can file today" value={filed.length + readyNow.length + ' of ' + r1.length} icon={Zap} tone="ok" sub="GSTR-1, this period" />
      </div>

      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-line flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            <span className="label">Period</span>
            <Segmented
              value={period} onChange={setPeriod}
              options={PERIOD_KEYS.slice(-6).map((k) => ({ value: k, label: pLabel(k).replace(' 20', ' ') }))}
            />
          </div>
          <Segmented
            value={only} onChange={setOnly}
            options={[
              { value: 'all', label: 'All ' + board.length },
              { value: 'monthly', label: 'Monthly filers' },
              { value: 'ready', label: 'Ready' },
              { value: 'blocked', label: 'Blocked' },
            ]}
          />
        </div>

        <Table
          searchable
          searchKeys={[(b) => b.client.name, (b) => b.client.gstin || '']}
          columns={[
            { key: 'client', label: 'Client', render: (b) => <ClientChip client={b.client} sub={b.client.gstin} /> },
            { key: 'ready', label: 'Data', sortValue: (b) => b.readiness.pct, render: (b) => (
              <div>
                <Readiness pct={b.readiness.pct} width={76} />
                <p className="text-[10.5px] text-faint mt-1">
                  {b.readiness.salesDocs.captured}/{b.readiness.salesDocs.expected} sales · {b.readiness.purchDocs.captured}/{b.readiness.purchDocs.expected} purch
                </p>
              </div>
            ) },
            { key: 'sales', label: 'Taxable sales', align: 'right', sortValue: (b) => b.row.sales,
              render: (b) => <span className="num text-[12.5px] font-semibold">{inr(b.row.sales)}</span> },
            { key: 'out', label: 'Output tax', align: 'right', sortValue: (b) => b.row.outputTax,
              render: (b) => <span className="num text-[12.5px]">{inr(b.row.outputTax)}</span> },
            { key: 'itc', label: 'ITC (2B matched)', align: 'right', sortValue: (b) => b.row.itcClaimable, render: (b) => (
              <div>
                <span className="num text-[12.5px]">{inr(b.row.itcClaimable)}</span>
                {b.row.mismatch > 0 && <p className="text-[10.5px] text-warn-600 num">gap {inr(b.row.mismatch)}</p>}
              </div>
            ) },
            { key: 'cash', label: 'Cash payable', align: 'right', sortValue: (b) => b.row.netPayable,
              render: (b) => <span className="num text-[13px] font-extrabold text-ink">{inr(b.row.netPayable)}</span> },
            { key: 'r1', label: 'GSTR-1', render: (b) => {
              const o = obFor(b.client.id, 'GSTR-1')
              if (!o) return <Pill tone="mute">Quarterly</Pill>
              return (
                <div className="space-y-1">
                  <StatusPill status={statusOf(o)} />
                  <DueCell due={o.due} done={isDone({ ...o, status: statusOf(o) })} showDate={false} />
                </div>
              )
            } },
            { key: 'r3', label: 'GSTR-3B', render: (b) => {
              const o = obFor(b.client.id, 'GSTR-3B') || obFor(b.client.id, 'PMT-06')
              if (!o) return <Pill tone="mute">Quarterly</Pill>
              return (
                <div className="space-y-1">
                  <StatusPill status={statusOf(o)} />
                  <DueCell due={o.due} done={isDone({ ...o, status: statusOf(o) })} showDate={false} />
                </div>
              )
            } },
            { key: 'block', label: 'Blocking', render: (b) => b.docs.length
              ? (
                <Link to="/documents" className="block max-w-[220px]">
                  <Pill tone="bad">{b.docs.length} document{b.docs.length > 1 ? 's' : ''} short</Pill>
                  <p className="text-[10.5px] text-mute mt-1 truncate">{b.docs[0].what}</p>
                </Link>
              )
              : <AutoTag>Nothing pending</AutoTag> },
            { key: 'act', label: '', align: 'right', render: (b) => {
              const o = obFor(b.client.id, 'GSTR-1') || obFor(b.client.id, 'PMT-06')
              if (!o) return null
              const s = statusOf(o)
              if (['Filed', 'Filed Late'].includes(s)) return <span className="text-[11.5px] font-bold text-ok-600">Filed</span>
              if (s === 'Ready to File') return <button className="btn-primary !h-7 !px-2.5 text-[12px]" onClick={() => fileReturn(o, b.client.short)}>File</button>
              if (['Blocked', 'Awaiting Data'].includes(s)) return <Link to="/documents" className="btn-ghost !h-7 !px-2.5 text-[12px]">Chase</Link>
              return <button className="btn-ghost !h-7 !px-2.5 text-[12px]" onClick={() => markReady(o, b.client.short)}>Mark ready</button>
            } },
          ]}
          rows={rows}
          keyFn={(b) => b.client.id}
          initialSort={{ key: 'cash', dir: 'desc' }}
          pageSize={0}
          empty="No clients in this view"
        />

        <div className="px-4 py-3 border-t border-line bg-soft/50 grid grid-cols-2 lg:grid-cols-6 gap-4">
          <MiniStat label="Clients" value={board.length} />
          <MiniStat label="Output tax" value={inr(totals.output)} />
          <MiniStat label="ITC claimed" value={inr(totals.itc)} tone="ok" />
          <MiniStat label="RCM" value={inr(totals.rcm)} tone="warn" />
          <MiniStat label="Cash payable" value={inr(totals.cash)} tone="brand" />
          <MiniStat label="Gap held back" value={inr(totals.gap)} tone="bad" />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Note tone="ok" title="Why four returns are already done">
          Precision Auto, Iron Temple, Sri Balaji and UrbanKart all run a Real V application. Their invoices reached
          CleanBook the day they were raised, so the return only needed a review — no data entry at all.
        </Note>
        <Note tone="warn" title="Two returns need a decision, not data">
          Sri Balaji's 3B is waiting on RCM self-invoices for hire freight, and Anand Bhavan has to reverse capital-goods
          ITC before the 3B can be filed. Both are judgement calls for the principal.
        </Note>
        <Note tone="bad" title="Sharada Medicals is stuck at the source">
          Jul and Aug cannot be filed at all until the Tally backup arrives. A GSTR-3A default notice is already in,
          with a reply due 19 Sep. This is the strongest case in the book for a custom counter app.
        </Note>
      </div>
    </div>
  )
}
