import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Plus, Download, Sparkles, TrendingUp, ShieldAlert, IndianRupee } from 'lucide-react'
import { Card, CardHead, PageHead, Kpi, Pill, Table, Tabs, MiniStat, Segmented, Bar } from '../components/ui.jsx'
import { ClientChip, DueCell, Readiness, StatusPill, Note } from '../components/bits.jsx'
import { CLIENTS, STAFF, staffById, CURRENT_PERIOD, LEDGER, forClient, isDone } from '../data/index.js'
import { PIPELINE_TONE, RISK_TONE } from '../lib/status.js'
import { inr, inrShort, toCsv, pct } from '../lib/format.js'
import { practiceKpis } from '../lib/derive.js'
import { useApp } from '../lib/store.jsx'

export default function Clients() {
  const { toast } = useApp()
  const [tab, setTab] = useState('all')
  const [staff, setStaff] = useState('all')

  const k = useMemo(() => practiceKpis(), [])

  const rows = useMemo(() => CLIENTS.map((c) => {
    const row = LEDGER[c.id][CURRENT_PERIOD]
    const open = forClient(c.id).filter((o) => !isDone(o)).sort((a, b) => (a.due < b.due ? -1 : 1))
    return {
      client: c, row, open,
      next: open[0] || null,
      overdue: open.filter((o) => o.due < '2026-09-10').length,
    }
  }), [])

  const view = rows.filter((r) => {
    if (tab === 'auto' && r.client.books.mode !== 'CleanBook Auto') return false
    if (tab === 'manual' && r.client.books.mode === 'CleanBook Auto') return false
    if (tab === 'gst' && r.client.scheme === 'Unregistered') return false
    if (tab === 'risk' && r.client.risk === 'Low') return false
    if (staff !== 'all' && r.client.staffId !== staff) return false
    return true
  })

  const exportCsv = () => {
    const csv = toCsv(rows, [
      { label: 'Client', value: (r) => r.client.name },
      { label: 'Trade', value: (r) => r.client.verticalLabel },
      { label: 'Constitution', value: (r) => r.client.constitution },
      { label: 'GSTIN', value: (r) => r.client.gstin || 'Unregistered' },
      { label: 'PAN', value: (r) => r.client.pan },
      { label: 'Scheme', value: (r) => r.client.scheme },
      { label: 'FY 26-27 turnover', value: (r) => r.client.annual },
      { label: 'Aug turnover', value: (r) => r.row.sales },
      { label: 'Readiness %', value: (r) => r.row.readiness.pct },
      { label: 'Open obligations', value: (r) => r.open.length },
      { label: 'Assigned to', value: (r) => staffById[r.client.staffId].name },
      { label: 'Real V status', value: (r) => r.client.realv.status },
      { label: 'Monthly fee', value: (r) => r.client.realv.fee },
    ])
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'cleanbook-client-book.csv'
    a.click()
    URL.revokeObjectURL(a.href)
    toast('Client book exported', '12 clients with turnover, readiness and assignment')
  }

  const billing = CLIENTS.filter((c) => c.realv.fee > 0 && c.realv.status === 'Live & Billing')
  const feeTotal = billing.reduce((s, c) => s + c.realv.fee, 0)

  return (
    <div className="space-y-5">
      <PageHead
        title="Client book"
        sub="Everything the practice is responsible for, in one list"
        chips={[
          <Pill key="a" tone="mute">{CLIENTS.length} clients</Pill>,
          <Pill key="b" tone="ok" dot>{k.onAuto} on automatic capture</Pill>,
          <Pill key="c" tone="warn">{CLIENTS.length - k.onAuto} still manual</Pill>,
          <Pill key="d" tone="brand">{inrShort(k.turnoverFy)} turnover under management</Pill>,
        ]}
        actions={
          <>
            <button className="btn-ghost" onClick={exportCsv}><Download size={14} /> Export</button>
            <button className="btn-primary" onClick={() => toast('Client onboarding', 'CleanBook is free for your whole book — add as many as you like', 'brand')}>
              <Plus size={14} /> Add client
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        <Kpi label="Turnover under management" value={inrShort(k.turnoverFy)} icon={TrendingUp} tone="brand" sub="FY 2026-27 projected" />
        <Kpi label="Average readiness" value={k.readiness + '%'} icon={Sparkles} tone="ok" sub={'for ' + 'Aug 2026'} />
        <Kpi label="High-risk clients" value={CLIENTS.filter((c) => c.risk === 'High').length} icon={ShieldAlert} tone="bad" sub="data or threshold trouble" />
        <Kpi label="On a Real V app" value={billing.length} icon={Users} tone="info" sub={inr(feeTotal) + '/mo billed'} />
        <Kpi label="Your share of that" value={inr(Math.round(feeTotal * 0.2))} icon={IndianRupee} tone="ok"
          sub="20%, every month"
          foot={<Link to="/revenue" className="text-[11.5px] font-bold text-ok-600">Open statement →</Link>} />
      </div>

      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-line flex flex-wrap items-center gap-3 justify-between">
          <Tabs
            active={tab} onChange={setTab}
            tabs={[
              { id: 'all', label: 'All', count: rows.length },
              { id: 'auto', label: 'Automatic data', count: rows.filter((r) => r.client.books.mode === 'CleanBook Auto').length },
              { id: 'manual', label: 'Manual data', count: rows.filter((r) => r.client.books.mode !== 'CleanBook Auto').length },
              { id: 'gst', label: 'GST registered', count: rows.filter((r) => r.client.scheme !== 'Unregistered').length },
              { id: 'risk', label: 'Needs watching', count: rows.filter((r) => r.client.risk !== 'Low').length },
            ]}
          />
          <Segmented
            value={staff} onChange={setStaff}
            options={[{ value: 'all', label: 'Everyone' }, ...STAFF.map((s) => ({ value: s.id, label: s.short }))]}
          />
        </div>

        <Table
          searchable
          searchKeys={[(r) => r.client.name, (r) => r.client.owner, (r) => r.client.gstin || '', (r) => r.client.verticalLabel, (r) => r.client.area]}
          columns={[
            { key: 'client', label: 'Client', render: (r) => <ClientChip client={r.client} /> },
            { key: 'reg', label: 'Registration', render: (r) => (
              <div className="min-w-0">
                <p className="num text-[12px] font-semibold text-ink">{r.client.gstin || '— unregistered —'}</p>
                <p className="text-[11px] text-mute">{r.client.constitution} · {r.client.area}</p>
              </div>
            ) },
            { key: 'scheme', label: 'Scheme', render: (r) => (
              <div className="flex flex-col gap-1 items-start">
                <Pill tone={r.client.scheme === 'Regular' ? 'brand' : r.client.scheme === 'Unregistered' ? 'mute' : 'info'}>{r.client.scheme}</Pill>
                {r.client.eInvoice && <Pill tone="ok">e-Invoice</Pill>}
              </div>
            ) },
            { key: 'turnover', label: 'Turnover', align: 'right', sortValue: (r) => r.client.annual, render: (r) => (
              <div>
                <p className="num text-[12.5px] font-bold text-ink">{inrShort(r.client.annual)}</p>
                <p className="text-[10.5px] text-mute num">Aug {inrShort(r.row.sales)} · {pct(r.client.growth * 100, 0)} growth</p>
              </div>
            ) },
            { key: 'ready', label: 'Aug readiness', sortValue: (r) => r.row.readiness.pct, render: (r) => (
              <div>
                <Readiness pct={r.row.readiness.pct} width={80} />
                <p className="text-[10.5px] text-faint mt-1">{r.client.books.mode}</p>
              </div>
            ) },
            { key: 'next', label: 'Next obligation', sortValue: (r) => r.next?.due || '9999', render: (r) => r.next ? (
              <div>
                <p className="text-[12.5px] font-semibold text-ink">{r.next.form}</p>
                <DueCell due={r.next.due} showDate={false} />
              </div>
            ) : <span className="text-faint">—</span> },
            { key: 'open', label: 'Open', align: 'right', sortValue: (r) => r.open.length, render: (r) => (
              <div className="flex items-center gap-1.5 justify-end">
                <span className="num text-[12.5px] font-bold">{r.open.length}</span>
                {r.overdue > 0 && <Pill tone="bad">{r.overdue} late</Pill>}
              </div>
            ) },
            { key: 'staff', label: 'Handled by', render: (r) => (
              <div>
                <p className="text-[12.5px] font-semibold text-ink">{staffById[r.client.staffId].short}</p>
                <p className="text-[10.5px] text-mute">{staffById[r.client.staffId].title.split('—')[0]}</p>
              </div>
            ) },
            { key: 'realv', label: 'Real V', render: (r) => (
              <div className="min-w-0">
                <Pill tone={PIPELINE_TONE[r.client.realv.status] || 'mute'} dot>{r.client.realv.status}</Pill>
                {r.client.realv.fee > 0 && (
                  <p className="text-[11px] text-mute mt-1 num">
                    {inr(r.client.realv.fee)}/mo · you {inr(Math.round(r.client.realv.fee * 0.2))}
                  </p>
                )}
              </div>
            ) },
            { key: 'risk', label: 'Risk', render: (r) => <Pill tone={RISK_TONE[r.client.risk]}>{r.client.risk}</Pill> },
          ]}
          rows={view}
          keyFn={(r) => r.client.id}
          initialSort={{ key: 'turnover', dir: 'desc' }}
          pageSize={0}
          onRowClick={undefined}
        />
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHead title="Where the book sits by trade" sub="Turnover under management, by kind of business" icon={TrendingUp} />
          <div className="p-4 space-y-2.5">
            {[...CLIENTS].sort((a, b) => b.annual - a.annual).map((c) => (
              <div key={c.id}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <Link to={'/clients/' + c.id} className="text-[12.5px] font-semibold text-ink hover:text-brand-600 truncate">{c.short}</Link>
                  <span className="text-[11.5px] text-mute num shrink-0">{inrShort(c.annual)} · {c.verticalLabel}</span>
                </div>
                <Bar value={c.annual} max={CLIENTS[3].annual} tone={c.books.mode === 'CleanBook Auto' ? 'brand' : 'warn'} height={6} />
              </div>
            ))}
            <p className="text-[11px] text-faint pt-2">Amber bars are clients whose data still arrives by hand.</p>
          </div>
        </Card>

        <Card>
          <CardHead title="The four manual clients" sub="Every overdue filing in the practice sits here" icon={ShieldAlert} />
          <div className="p-4 space-y-3">
            {CLIENTS.filter((c) => c.books.mode !== 'CleanBook Auto').map((c) => (
              <Link key={c.id} to={'/clients/' + c.id} className="block rounded-lg border border-line p-3 hover:border-brand-300 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <ClientChip client={c} link={false} />
                  <Pill tone={PIPELINE_TONE[c.realv.status]}>{c.realv.status}</Pill>
                </div>
                <p className="text-[11.5px] text-mute mt-2 leading-snug">{c.books.mode} · books closed till {c.books.closedTill.slice(8, 10)}/{c.books.closedTill.slice(5, 7)}</p>
                {c.realv.fee > 0 && (
                  <p className="text-[11.5px] font-semibold text-ok-600 mt-1.5">
                    Converting them adds {inr(Math.round(c.realv.fee * 0.2))}/mo to your share
                  </p>
                )}
              </Link>
            ))}
            <Note tone="brand" title="The pattern">
              Manual data is not a discipline problem. Every one of these owners is running a business without a system
              — which is exactly what Real V builds.
            </Note>
          </div>
        </Card>
      </div>
    </div>
  )
}
