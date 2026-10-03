import { useMemo, useState } from 'react'
import {
  BarChart3, Download, FileSpreadsheet, Landmark, Users, Sparkles, TrendingUp, IndianRupee, ScrollText,
} from 'lucide-react'
import {
  BarChart, Bar as RBar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, ComposedChart,
} from 'recharts'
import { Card, CardHead, PageHead, Pill, Table, MiniStat, Segmented, Kpi } from '../components/ui.jsx'
import { ClientChip, SectionTitle, Note } from '../components/bits.jsx'
import ChartBox from '../components/ChartBox.jsx'
import {
  CLIENTS, clientById, staffById, CURRENT_PERIOD, PERIOD_KEYS, LEDGER, OBLIGATIONS, ITC_ROWS,
  DOC_REQUESTS, NOTICES, isDone, revenue,
} from '../data/index.js'
import { turnoverSeries, practiceKpis } from '../lib/derive.js'
import { inr, inrShort, axisMoney, num, pct, toCsv } from '../lib/format.js'
import { pLabel } from '../lib/dates.js'
import { useApp } from '../lib/store.jsx'

const save = (name, csv) => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  a.click()
  URL.revokeObjectURL(a.href)
}

export default function Reports() {
  const { toast, statusOf } = useApp()
  const [span, setSpan] = useState(12)

  const k = useMemo(() => practiceKpis(), [])
  const series = useMemo(() => turnoverSeries(PERIOD_KEYS.slice(-span)), [span])

  const fyRows = useMemo(() => CLIENTS.map((c) => {
    const fyKeys = PERIOD_KEYS.filter((key) => key >= '2026-04')
    const t = fyKeys.reduce((s, key) => s + LEDGER[c.id][key].sales, 0)
    const tax = fyKeys.reduce((s, key) => s + LEDGER[c.id][key].netPayable, 0)
    const itc = fyKeys.reduce((s, key) => s + LEDGER[c.id][key].itcClaimable, 0)
    const out = fyKeys.reduce((s, key) => s + LEDGER[c.id][key].outputTax, 0)
    return { client: c, turnover: t, outputTax: out, itc, cash: tax, months: fyKeys.length }
  }).sort((a, b) => b.turnover - a.turnover), [])

  const REPORTS = [
    {
      id: 'r1', title: 'Turnover & tax summary — FY 2026-27', icon: FileSpreadsheet,
      sub: 'Client-wise taxable turnover, output tax, ITC claimed and cash paid, month by month',
      run: () => save('turnover-tax-summary-fy2627.csv', toCsv(fyRows, [
        { label: 'Client', value: (r) => r.client.name },
        { label: 'GSTIN', value: (r) => r.client.gstin || 'Unregistered' },
        { label: 'Scheme', value: (r) => r.client.scheme },
        { label: 'Taxable turnover', value: (r) => r.turnover },
        { label: 'Output tax', value: (r) => r.outputTax },
        { label: 'ITC claimed', value: (r) => r.itc },
        { label: 'Cash paid', value: (r) => r.cash },
      ])),
    },
    {
      id: 'r2', title: 'Filing status register', icon: Landmark,
      sub: 'Every obligation with its due date, current status, ARN and owner — the register a departmental audit asks for',
      run: () => save('filing-status-register.csv', toCsv(OBLIGATIONS, [
        { label: 'Client', value: (o) => clientById[o.clientId].name },
        { label: 'Head', value: (o) => o.kind },
        { label: 'Form', value: (o) => o.form },
        { label: 'Period', value: (o) => o.periodLabel },
        { label: 'Due', value: (o) => o.due },
        { label: 'Status', value: (o) => statusOf(o) },
        { label: 'Filed on', value: (o) => o.filedOn || '' },
        { label: 'ARN', value: (o) => o.arn || '' },
        { label: 'Amount', value: (o) => o.amount || '' },
        { label: 'Owner', value: (o) => staffById[o.assignee].name },
      ])),
    },
    {
      id: 'r3', title: 'ITC reconciliation working', icon: Sparkles,
      sub: 'Line-wise books against GSTR-2B with the reason for every difference — attach this to a scrutiny reply',
      run: () => save('itc-reconciliation-working.csv', toCsv(ITC_ROWS, [
        { label: 'Client', value: (r) => clientById[r.clientId].name },
        { label: 'Period', value: (r) => r.periodLabel },
        { label: 'Vendor', value: (r) => r.vendor },
        { label: 'Vendor GSTIN', value: (r) => r.gstin },
        { label: 'Invoice', value: (r) => r.invoiceNo },
        { label: 'Taxable', value: (r) => r.taxable },
        { label: 'Tax', value: (r) => r.tax },
        { label: 'Reason', value: (r) => r.reason },
        { label: 'Action', value: (r) => r.action },
      ])),
    },
    {
      id: 'r4', title: 'Data readiness & chase log', icon: Users,
      sub: 'What was asked for, through which channel, how long it took — the evidence for a fee revision conversation',
      run: () => save('data-readiness-chase-log.csv', toCsv(DOC_REQUESTS, [
        { label: 'Client', value: (d) => clientById[d.clientId].name },
        { label: 'Document', value: (d) => d.what },
        { label: 'Period', value: (d) => d.periodLabel },
        { label: 'Requested on', value: (d) => d.requested },
        { label: 'Channel', value: (d) => d.channel },
        { label: 'In hand', value: (d) => d.got + ' of ' + d.need },
        { label: 'Days waiting', value: (d) => d.ageDays },
        { label: 'Blocks', value: (d) => d.blocks || '' },
        { label: 'Status', value: (d) => d.status },
      ])),
    },
    {
      id: 'r5', title: 'Notice & litigation register', icon: ScrollText,
      sub: 'Authority, form, reference, amount at stake, reply date and our position for each open matter',
      run: () => save('notice-register.csv', toCsv(NOTICES, [
        { label: 'Client', value: (n) => clientById[n.clientId].name },
        { label: 'Authority', value: (n) => n.authority },
        { label: 'Form', value: (n) => n.form },
        { label: 'Reference', value: (n) => n.ref },
        { label: 'Period', value: (n) => n.period },
        { label: 'Received', value: (n) => n.receivedOn },
        { label: 'Reply by', value: (n) => n.replyBy },
        { label: 'Amount', value: (n) => n.amount || '' },
        { label: 'Status', value: (n) => n.status },
        { label: 'Risk', value: (n) => n.risk },
      ])),
    },
    {
      id: 'r6', title: 'Revenue share statement', icon: IndianRupee,
      sub: 'Month-wise Real V collections, your 20%, GST charged, TDS deducted and the net credited',
      run: () => save('revenue-share-statement.csv', toCsv(revenue.MONTHS, [
        { label: 'Month', value: (m) => m.label },
        { label: 'Clients billed', value: (m) => m.clients },
        { label: 'Real V collections', value: (m) => m.realvRevenue },
        { label: 'Your share', value: (m) => m.gross },
        { label: 'GST 18%', value: (m) => m.gst },
        { label: 'TDS 194H', value: (m) => m.tds },
        { label: 'Net credited', value: (m) => m.net },
        { label: 'Status', value: (m) => m.status },
        { label: 'UTR', value: (m) => m.utr || '' },
      ])),
    },
  ]

  return (
    <div className="space-y-5">
      <PageHead
        title="Reports"
        sub="The six things a practice actually has to produce — each one a click, not an evening"
        chips={[
          <Pill key="a" tone="mute">{CLIENTS.length} clients</Pill>,
          <Pill key="b" tone="brand">{OBLIGATIONS.length} obligations on record</Pill>,
          <Pill key="c" tone="info">18 months of history</Pill>,
        ]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Turnover under management" value={inrShort(k.turnoverFy)} icon={TrendingUp} tone="brand" sub="FY 2026-27 projected" />
        <Kpi label="Output tax handled" value={inrShort(fyRows.reduce((s, r) => s + r.outputTax, 0))} icon={Landmark} tone="info" sub="Apr to Aug 2026" />
        <Kpi label="ITC claimed" value={inrShort(fyRows.reduce((s, r) => s + r.itc, 0))} icon={Sparkles} tone="ok" sub="after 2B matching" />
        <Kpi label="Cash tax paid" value={inrShort(fyRows.reduce((s, r) => s + r.cash, 0))} icon={FileSpreadsheet} tone="mute" sub="across the book this FY" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {REPORTS.map((r) => (
          <div key={r.id} className="card p-4 flex flex-col">
            <div className="flex items-start gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 grid place-items-center shrink-0">
                <r.icon size={17} />
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-ink leading-snug">{r.title}</p>
              </div>
            </div>
            <p className="text-[12px] text-mute mt-2.5 leading-relaxed flex-1">{r.sub}</p>
            <button className="btn-ghost w-full justify-center mt-3" onClick={() => { r.run(); toast('Report generated', r.title) }}>
              <Download size={14} /> Generate CSV
            </button>
          </div>
        ))}
      </div>

      <Card>
        <CardHead
          title="Turnover, output tax and credit"
          sub="The whole book combined"
          icon={BarChart3}
          right={<Segmented value={span} onChange={setSpan} options={[{ value: 6, label: '6M' }, { value: 12, label: '12M' }, { value: 18, label: '18M' }]} />}
        />
        <div className="p-4">
          <ChartBox height={280}>
            {(w, h) => (
              <ComposedChart width={w} height={h} data={series} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--line))" vertical={false} />
                <XAxis dataKey="short" tick={{ fontSize: 11, fill: 'rgb(var(--mute))' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={axisMoney} tick={{ fontSize: 11, fill: 'rgb(var(--mute))' }} axisLine={false} tickLine={false} width={54} />
                <Tooltip formatter={(v, n) => [inr(v), n]} contentStyle={{ background: 'rgb(var(--card))', border: '1px solid rgb(var(--line))', borderRadius: 10, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11.5 }} />
                <RBar dataKey="turnover" name="Turnover" fill="#4F46E5" radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Line type="monotone" dataKey="outputTax" name="Output tax" stroke="#06B6D4" strokeWidth={2.2} dot={false} />
                <Line type="monotone" dataKey="net" name="Cash paid" stroke="#F59E0B" strokeWidth={2.2} dot={false} />
              </ComposedChart>
            )}
          </ChartBox>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <CardHead title="Client-wise position for FY 2026-27" sub="Apr to Aug 2026, five months closed" icon={FileSpreadsheet}
          right={<Pill tone="mute">{fyRows[0].months} months</Pill>} />
        <Table
          columns={[
            { key: 'client', label: 'Client', render: (r) => <ClientChip client={r.client} sub={r.client.gstin || 'Unregistered'} /> },
            { key: 'scheme', label: 'Scheme', render: (r) => <Pill tone={r.client.scheme === 'Regular' ? 'brand' : 'info'}>{r.client.scheme}</Pill> },
            { key: 'turn', label: 'Taxable turnover', align: 'right', sortValue: (r) => r.turnover,
              render: (r) => <span className="num text-[12.5px] font-bold">{inr(r.turnover)}</span> },
            { key: 'out', label: 'Output tax', align: 'right', sortValue: (r) => r.outputTax,
              render: (r) => <span className="num text-[12.5px]">{inr(r.outputTax)}</span> },
            { key: 'itc', label: 'ITC claimed', align: 'right', sortValue: (r) => r.itc,
              render: (r) => <span className="num text-[12.5px]">{inr(r.itc)}</span> },
            { key: 'cash', label: 'Cash paid', align: 'right', sortValue: (r) => r.cash,
              render: (r) => <span className="num text-[12.5px] font-semibold">{inr(r.cash)}</span> },
            { key: 'eff', label: 'Effective rate', align: 'right', sortValue: (r) => r.cash / (r.turnover || 1),
              render: (r) => <span className="num text-[12.5px] text-mute">{pct((r.cash / (r.turnover || 1)) * 100, 2)}</span> },
          ]}
          rows={fyRows}
          keyFn={(r) => r.client.id}
          initialSort={{ key: 'turn', dir: 'desc' }}
          pageSize={0}
        />
        <div className="px-4 py-3 border-t border-line bg-soft/50 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MiniStat label="Turnover" value={inr(fyRows.reduce((s, r) => s + r.turnover, 0))} />
          <MiniStat label="Output tax" value={inr(fyRows.reduce((s, r) => s + r.outputTax, 0))} />
          <MiniStat label="ITC claimed" value={inr(fyRows.reduce((s, r) => s + r.itc, 0))} tone="ok" />
          <MiniStat label="Cash paid" value={inr(fyRows.reduce((s, r) => s + r.cash, 0))} tone="brand" />
        </div>
      </Card>

      <Note tone="brand" title="What the practice could not produce before">
        None of these reports existed as a click. The turnover register was rebuilt from returns every time a bank
        asked for it, and the chase log did not exist at all — which is exactly why fee revisions were so hard to
        justify.
      </Note>
    </div>
  )
}
