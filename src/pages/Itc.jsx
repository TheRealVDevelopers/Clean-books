import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { GitCompareArrows, AlertOctagon, FileWarning, Download, Send, Sparkles } from 'lucide-react'
import { Card, CardHead, PageHead, Kpi, Pill, Table, Segmented, MiniStat, Bar, Empty } from '../components/ui.jsx'
import { ClientChip, Note, AutoTag } from '../components/bits.jsx'
import { ITC_ROWS, itcTotals } from '../data/recon.js'
import { CLIENTS, clientById, staffById, CURRENT_PERIOD, LEDGER } from '../data/index.js'
import { inr, inrShort, num, pct, toCsv } from '../lib/format.js'
import { pLabel, dueOn } from '../lib/dates.js'
import { useApp } from '../lib/store.jsx'

export default function Itc() {
  const { toast } = useApp()
  const [reason, setReason] = useState('all')
  const [client, setClient] = useState('all')

  const rows = ITC_ROWS.filter((r) =>
    (reason === 'all' || r.reason === reason) && (client === 'all' || r.clientId === client))
  const t = useMemo(() => itcTotals(ITC_ROWS), [])
  const reasons = [...new Set(ITC_ROWS.map((r) => r.reason))]

  const byClient = useMemo(() => CLIENTS
    .filter((c) => c.scheme === 'Regular' || c.scheme === 'QRMP')
    .map((c) => {
      const row = LEDGER[c.id][CURRENT_PERIOD]
      const mine = ITC_ROWS.filter((r) => r.clientId === c.id)
      return { client: c, row, lines: mine, tax: mine.reduce((s, r) => s + r.tax, 0) }
    })
    .sort((a, b) => b.tax - a.tax), [])

  const exportCsv = () => {
    const csv = toCsv(rows, [
      { label: 'Client', value: (r) => clientById[r.clientId].name },
      { label: 'Vendor', value: (r) => r.vendor },
      { label: 'Vendor GSTIN', value: (r) => r.gstin },
      { label: 'Invoice', value: (r) => r.invoiceNo },
      { label: 'Date', value: (r) => r.date },
      { label: 'Taxable', value: (r) => r.taxable },
      { label: 'Tax', value: (r) => r.tax },
      { label: 'Reason', value: (r) => r.reason },
      { label: 'Action', value: (r) => r.action },
      { label: 'Status', value: (r) => r.status },
    ])
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'itc-reconciliation-' + CURRENT_PERIOD + '.csv'
    a.click()
    URL.revokeObjectURL(a.href)
    toast('Reconciliation exported', rows.length + ' lines')
  }

  return (
    <div className="space-y-5">
      <PageHead
        title="ITC vs GSTR-2B"
        sub={'Every line where the books and the portal disagree for ' + pLabel(CURRENT_PERIOD)}
        chips={[
          <Pill key="a" tone="brand" dot>{pLabel(CURRENT_PERIOD)}</Pill>,
          <Pill key="b" tone="bad">{inrShort(t.atRisk)} of credit at risk</Pill>,
          <Pill key="c" tone="warn">{t.missingBills} bills missing from the books</Pill>,
          <Pill key="d" tone="mute">2B available since {dueOn(CURRENT_PERIOD, 1, 14).slice(8, 10)} Sep</Pill>,
        ]}
        actions={
          <>
            <button className="btn-ghost" onClick={exportCsv}><Download size={14} /> Export</button>
            <button className="btn-primary" onClick={() => toast('Vendor follow-ups queued', 'Emails drafted to ' + t.count + ' vendors from the client’s letterhead', 'brand')}>
              <Send size={14} /> Chase vendors
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Lines to reconcile" value={t.count} icon={GitCompareArrows} tone="warn" sub="across 8 registered clients" />
        <Kpi label="Total tax in dispute" value={inrShort(t.tax)} icon={FileWarning} tone="info" sub="difference between books and 2B" />
        <Kpi label="Credit to hold back" value={inrShort(t.atRisk)} icon={AlertOctagon} tone="bad" sub="vendor has not filed GSTR-1" />
        <Kpi label="Bills to collect" value={t.missingBills} icon={Sparkles} tone="brand" sub="in 2B but not in the books — free credit" />
      </div>

      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-line flex flex-wrap items-center gap-3 justify-between">
          <Segmented value={reason} onChange={setReason}
            options={[{ value: 'all', label: 'All reasons' }, ...reasons.map((r) => ({ value: r, label: r }))]} />
          <select className="select w-56" value={client} onChange={(e) => setClient(e.target.value)}>
            <option value="all">All clients</option>
            {CLIENTS.filter((c) => ITC_ROWS.some((r) => r.clientId === c.id)).map((c) => (
              <option key={c.id} value={c.id}>{c.short}</option>
            ))}
          </select>
        </div>
        <Table
          searchable
          searchKeys={[(r) => r.vendor, (r) => r.invoiceNo, (r) => clientById[r.clientId].name]}
          columns={[
            { key: 'client', label: 'Client', render: (r) => <ClientChip client={clientById[r.clientId]} sub={staffById[r.assignee].short} /> },
            { key: 'vendor', label: 'Vendor', render: (r) => (
              <div className="min-w-0">
                <p className="text-[12.5px] font-bold text-ink truncate max-w-[210px]">{r.vendor}</p>
                <p className="num text-[10.5px] text-mute">{r.gstin}</p>
              </div>
            ) },
            { key: 'inv', label: 'Invoice', render: (r) => (
              <div>
                <p className="num text-[12px] text-ink">{r.invoiceNo}</p>
                <p className="text-[10.5px] text-mute">{r.date.slice(8, 10)}/{r.date.slice(5, 7)}/26</p>
              </div>
            ) },
            { key: 'taxable', label: 'Taxable value', align: 'right', sortValue: (r) => r.taxable,
              render: (r) => <span className="num text-[12.5px]">{inr(r.taxable)}</span> },
            { key: 'tax', label: 'Tax involved', align: 'right', sortValue: (r) => r.tax,
              render: (r) => <span className="num text-[13px] font-extrabold text-ink">{inr(r.tax)}</span> },
            { key: 'reason', label: 'Why it differs', render: (r) => <Pill tone={r.tone} dot>{r.reason}</Pill> },
            { key: 'action', label: 'What to do about it', render: (r) => (
              <p className="text-[11.5px] text-mute max-w-[300px] whitespace-normal leading-snug">{r.action}</p>
            ) },
            { key: 'status', label: 'Status', render: (r) => <Pill tone={r.status === 'Open' ? 'warn' : 'info'}>{r.status}</Pill> },
          ]}
          rows={rows}
          keyFn={(r) => r.id}
          initialSort={{ key: 'tax', dir: 'desc' }}
          pageSize={18}
          empty="Nothing to reconcile in this view"
        />
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2 overflow-hidden">
          <CardHead title="The gap, client by client" sub="Books against 2B for this period" icon={GitCompareArrows} />
          <Table
            columns={[
              { key: 'client', label: 'Client', render: (b) => <ClientChip client={b.client} /> },
              { key: 'books', label: 'ITC in books', align: 'right', sortValue: (b) => b.row.itcBooks,
                render: (b) => <span className="num text-[12.5px]">{inr(b.row.itcBooks)}</span> },
              { key: 'portal', label: 'ITC in 2B', align: 'right', sortValue: (b) => b.row.itc2B,
                render: (b) => <span className="num text-[12.5px]">{inr(b.row.itc2B)}</span> },
              { key: 'gap', label: 'Gap', align: 'right', sortValue: (b) => b.row.mismatch,
                render: (b) => b.row.mismatch
                  ? <span className="num text-[12.5px] font-bold text-warn-600">{inr(b.row.mismatch)}</span>
                  : <span className="text-[12px] font-bold text-ok-600">nil</span> },
              { key: 'match', label: 'Match rate', sortValue: (b) => b.row.itc2B / (b.row.itcBooks || 1), render: (b) => (
                <div className="w-[110px]">
                  <Bar value={b.row.itc2B} max={b.row.itcBooks || 1} tone={b.row.itc2B / (b.row.itcBooks || 1) > 0.96 ? 'ok' : 'warn'} height={6} />
                  <p className="text-[10.5px] text-faint mt-1 num">{pct((b.row.itc2B / (b.row.itcBooks || 1)) * 100, 1)}</p>
                </div>
              ) },
              { key: 'lines', label: 'Lines', align: 'right', sortValue: (b) => b.lines.length,
                render: (b) => <span className="num text-[12.5px] font-semibold">{b.lines.length}</span> },
              { key: 'src', label: 'Data source', render: (b) => b.client.books.mode === 'CleanBook Auto'
                ? <AutoTag>3-way matched at source</AutoTag>
                : <Pill tone="warn">{b.client.books.mode}</Pill> },
            ]}
            rows={byClient}
            keyFn={(b) => b.client.id}
            initialSort={{ key: 'gap', dir: 'desc' }}
            pageSize={0}
          />
        </Card>

        <div className="space-y-4">
          <Note tone="ok" title="Why the automated clients match at 97%+">
            In Precision PlantOps, a purchase bill is only accepted after a three-way match against the purchase order
            and the goods receipt. By the time 2B arrives there is almost nothing left to argue about.
          </Note>
          <Note tone="warn" title="Restaurant credit is a special case">
            Anand Bhavan pays 5% on restaurant service and therefore cannot take input credit at all. Their 2B is still
            reconciled — not to claim the credit, but to prove the reversal.
          </Note>
          <Note tone="bad" title="Rule 36(4) in practice">
            Credit not appearing in 2B cannot be claimed at all. Holding it back is not conservatism, it is the law —
            and it is why {inrShort(t.atRisk)} stays out of this month's 3B.
          </Note>
          <Link to="/gst" className="btn-ghost w-full justify-center">Back to the GST workspace</Link>
        </div>
      </div>
    </div>
  )
}
