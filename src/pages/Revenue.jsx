import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  IndianRupee, TrendingUp, CalendarCheck2, Users, Download, Percent, Wallet,
  ArrowRight, ShieldQuestion, Handshake, Target, FileText, Building2, Info,
} from 'lucide-react'
import {
  BarChart, Bar as RBar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, ComposedChart, Area, AreaChart,
} from 'recharts'
import { Card, CardHead, PageHead, Kpi, Pill, Table, Tabs, MiniStat, Bar, Field, Empty } from '../components/ui.jsx'
import { ClientChip, SectionTitle, Note, VerticalIcon } from '../components/bits.jsx'
import ChartBox from '../components/ChartBox.jsx'
import { PIPELINE_TONE } from '../lib/status.js'
import { inr, inrShort, axisMoney, pct, toCsv, dateFull, num } from '../lib/format.js'
import { useApp } from '../lib/store.jsx'
import { useRepo } from '../repo/index.js'

export default function Revenue() {
  const { clientById, revenue } = useRepo()
  const {
    TERMS, MONTHS, CURRENT_MONTH, PAID_MONTHS, LIFETIME, BY_CLIENT, ACTIVE_BY_CLIENT,
    PIPELINE, PROJECTION, STATEMENTS,
  } = revenue
  const { toast } = useApp()
  const [tab, setTab] = useState('clients')

  const chart = useMemo(
    () => MONTHS.map((m) => ({ label: m.label.slice(0, 3), month: m.label, revenue: m.realvRevenue, share: m.gross, clients: m.clients })),
    [],
  )

  const download = (name, rows, columns) => {
    const csv = toCsv(rows, columns)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = name
    a.click()
    URL.revokeObjectURL(a.href)
    toast('Statement downloaded', name)
  }

  return (
    <div className="space-y-5">
      <PageHead
        title="Revenue share"
        sub="Your 20% of everything The Real V Developers collects from clients you introduced"
        chips={[
          <Pill key="a" tone="ok" dot>{TERMS.sharePct}% of gross collections</Pill>,
          <Pill key="b" tone="mute">Paid on the {TERMS.payoutDay}th, every month</Pill>,
          <Pill key="c" tone="brand">{ACTIVE_BY_CLIENT.length} clients earning</Pill>,
          <Pill key="d" tone="info">{LIFETIME.months} months running</Pill>,
        ]}
        actions={
          <>
            <button
              className="btn-ghost"
              onClick={() => download('cleanbook-revenue-share-all-months.csv', MONTHS, [
                { label: 'Month', value: (m) => m.label },
                { label: 'Clients billed', value: (m) => m.clients },
                { label: 'Real V collections', value: (m) => m.realvRevenue },
                { label: 'Your share (20%)', value: (m) => m.gross },
                { label: 'GST 18%', value: (m) => m.gst },
                { label: 'TDS 194H 2%', value: (m) => m.tds },
                { label: 'Net credited', value: (m) => m.net },
                { label: 'Status', value: (m) => m.status },
                { label: 'Paid on', value: (m) => m.paidOn || '' },
                { label: 'UTR', value: (m) => m.utr || '' },
              ])}
            >
              <Download size={14} /> Export all months
            </button>
            <Link to="/clients" className="btn-primary">Refer another business <ArrowRight size={14} /></Link>
          </>
        }
      />

      {/* ------------------------------------------------------------- top row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <Kpi label="Accruing this month" value={inr(CURRENT_MONTH.gross)} icon={IndianRupee} tone="ok"
          sub={'20% of ' + inr(CURRENT_MONTH.realvRevenue) + ' collected'}
          foot={<div className="flex items-center justify-between"><span className="text-[11px] text-mute">Payable</span><span className="num text-[11.5px] font-bold text-ok-600">07 Oct 2026</span></div>} />
        <Kpi label="Received to date" value={inr(LIFETIME.paid)} icon={Wallet} tone="brand"
          sub={PAID_MONTHS.length + ' payouts, all on time'} />
        <Kpi label="Net of GST & TDS" value={inr(CURRENT_MONTH.net)} icon={Percent} tone="info"
          sub="What actually hits the bank" />
        <Kpi label="Clients earning" value={ACTIVE_BY_CLIENT.length} icon={Users} tone="mute"
          sub={PIPELINE.length + ' more in the pipeline'} />
        <Kpi label="Annual run-rate" value={inrShort(PROJECTION.annualToday)} icon={TrendingUp} tone="ok"
          sub={'up to ' + inrShort(PROJECTION.annualPotential) + ' if the pipeline closes'} />
        <Kpi label="Avg per client" value={inr(Math.round(CURRENT_MONTH.gross / ACTIVE_BY_CLIENT.length))} icon={Target} tone="mute"
          sub="per month, per referred client" />
      </div>

      {/* --------------------------------------------- payout maths + trend */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card>
          <CardHead title="Next payout" sub="Statement for Sep 2026 · credited 07 Oct 2026" icon={CalendarCheck2}
            right={<Pill tone="brand" dot>Accruing</Pill>} />
          <div className="p-4">
            <div className="rounded-xl bg-soft border border-line divide-y divide-line">
              <Row label="Real V collections from your clients" value={inr(CURRENT_MONTH.realvRevenue)} sub={CURRENT_MONTH.clients + ' clients billed'} />
              <Row label={'Your share at ' + TERMS.sharePct + '%'} value={inr(CURRENT_MONTH.gross)} strong />
              <Row label="GST on commission at 18%" value={'+ ' + inr(CURRENT_MONTH.gst)} sub="You raise the invoice, so you charge GST" />
              <Row label="TDS deducted u/s 194H at 2%" value={'− ' + inr(CURRENT_MONTH.tds)} sub="Claim it in your 26AS" tone="bad" />
              <Row label="Net credited to your account" value={inr(CURRENT_MONTH.net)} strong tone="ok" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <MiniStat label="Invoice to raise" value="RC/26-27/08" />
              <MiniStat label="Mode" value="NEFT" />
            </div>
            <button
              className="btn-ghost w-full justify-center mt-3"
              onClick={() => download('revenue-share-sep-2026.csv', CURRENT_MONTH.lines, [
                { label: 'Client', value: (l) => clientById[l.clientId].name },
                { label: 'Monthly fee', value: (l) => l.fee },
                { label: 'Your 20%', value: (l) => l.share },
              ])}
            >
              <Download size={14} /> Download working for this month
            </button>
          </div>
        </Card>

        <Card className="xl:col-span-2">
          <CardHead title="Every month since the arrangement started" sub="Bars are Real V collections; the line is your share" icon={TrendingUp}
            right={<Pill tone="ok">{pct(((CURRENT_MONTH.gross - MONTHS[0].gross) / MONTHS[0].gross) * 100, 0)} growth since Feb</Pill>} />
          <div className="p-4">
            <ChartBox height={262}>
              {(w, h) => (
                <ComposedChart width={w} height={h} data={chart} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--line))" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'rgb(var(--mute))' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={axisMoney} tick={{ fontSize: 11, fill: 'rgb(var(--mute))' }} axisLine={false} tickLine={false} width={54} />
                  <Tooltip formatter={(v, n) => [inr(v), n]} contentStyle={{ background: 'rgb(var(--card))', border: '1px solid rgb(var(--line))', borderRadius: 10, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11.5 }} />
                  <RBar dataKey="revenue" name="Real V collections" fill="#818CF8" radius={[4, 4, 0, 0]} maxBarSize={34} />
                  <Line type="monotone" dataKey="share" name="Your 20% share" stroke="#059669" strokeWidth={2.4} dot={{ r: 3 }} />
                </ComposedChart>
              )}
            </ChartBox>
          </div>
        </Card>
      </div>

      {/* ----------------------------------------------------------- the tabs */}
      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-line flex flex-wrap items-center gap-3 justify-between">
          <Tabs
            active={tab} onChange={setTab}
            tabs={[
              { id: 'clients', label: 'Per client', count: BY_CLIENT.filter((b) => b.monthsBilled).length },
              { id: 'payouts', label: 'Payout history', count: STATEMENTS.length },
              { id: 'pipeline', label: 'Pipeline', count: PIPELINE.length },
              { id: 'terms', label: 'How it works' },
            ]}
          />
          {tab === 'clients' && (
            <button
              className="btn-quiet !h-8 text-[12px]"
              onClick={() => download('revenue-share-by-client.csv', BY_CLIENT.filter((b) => b.monthsBilled), [
                { label: 'Client', value: (b) => b.client.name },
                { label: 'Trade', value: (b) => b.client.verticalLabel },
                { label: 'Live since', value: (b) => b.since || '' },
                { label: 'Months billed', value: (b) => b.monthsBilled },
                { label: 'Monthly fee', value: (b) => b.monthlyFee },
                { label: 'Your monthly share', value: (b) => b.monthlyShare },
                { label: 'Lifetime fee', value: (b) => b.lifetimeFee },
                { label: 'Lifetime share', value: (b) => b.lifetimeShare },
              ])}
            >
              <Download size={13} /> Export
            </button>
          )}
        </div>

        {tab === 'clients' && <PerClient />}
        {tab === 'payouts' && <Payouts download={download} />}
        {tab === 'pipeline' && <Pipeline />}
        {tab === 'terms' && <TermsPanel />}
      </Card>
    </div>
  )
}

/* ------------------------------------------------------------------ per client */
function PerClient() {
  const { LIFETIME, BY_CLIENT } = useRepo().revenue
  const earning = BY_CLIENT.filter((b) => b.monthsBilled > 0)
  const totalShare = earning.reduce((s, b) => s + b.monthlyShare, 0)
  const top = earning[0]

  return (
    <div>
      <div className="px-4 py-3 bg-soft/50 border-b border-line grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStat label="Clients earning" value={earning.length} />
        <MiniStat label="Monthly share" value={inr(totalShare)} tone="ok" />
        <MiniStat label="Biggest contributor" value={top.client.short + ' · ' + inr(top.monthlyShare)} tone="brand" />
        <MiniStat label="Lifetime share" value={inr(LIFETIME.gross)} tone="ok" />
      </div>
      <Table
        searchable
        searchKeys={[(b) => b.client.name, (b) => b.client.verticalLabel]}
        columns={[
          { key: 'client', label: 'Client', render: (b) => <ClientChip client={b.client} /> },
          { key: 'since', label: 'Billing since', sortValue: (b) => b.since || '', render: (b) => (
            <div>
              <p className="text-[12.5px] font-semibold text-ink">{b.since ? dateFull(b.since) : '—'}</p>
              <p className="text-[11px] text-mute">{b.monthsBilled} months billed</p>
            </div>
          ) },
          { key: 'app', label: 'What Real V runs for them', render: (b) => (
            <div className="min-w-0">
              <p className="text-[12.5px] font-semibold text-ink truncate max-w-[230px]">{b.client.realv.appName}</p>
              <p className="text-[11px] text-mute truncate max-w-[230px]">{b.client.realv.modules.length} modules · {b.client.realv.users} users</p>
            </div>
          ) },
          { key: 'fee', label: 'Monthly fee', align: 'right', sortValue: (b) => b.monthlyFee,
            render: (b) => <span className="num text-[12.5px] font-semibold">{inr(b.monthlyFee)}</span> },
          { key: 'share', label: 'Your 20%', align: 'right', sortValue: (b) => b.monthlyShare,
            render: (b) => <span className="num text-[13px] font-extrabold text-ok-600">{inr(b.monthlyShare)}</span> },
          { key: 'lifefee', label: 'Billed to date', align: 'right', sortValue: (b) => b.lifetimeFee,
            render: (b) => <span className="num text-[12.5px] text-mute">{inr(b.lifetimeFee)}</span> },
          { key: 'lifeshare', label: 'Earned to date', align: 'right', sortValue: (b) => b.lifetimeShare,
            render: (b) => <span className="num text-[12.5px] font-bold">{inr(b.lifetimeShare)}</span> },
          { key: 'bar', label: 'Share of your earnings', render: (b) => (
            <div className="w-[120px]">
              <Bar value={b.lifetimeShare} max={earning[0].lifetimeShare} tone="ok" height={6} />
              <p className="text-[10.5px] text-faint mt-1 num">{pct((b.lifetimeShare / LIFETIME.gross) * 100, 1)} of total</p>
            </div>
          ) },
        ]}
        rows={earning}
        keyFn={(b) => b.clientId}
        initialSort={{ key: 'share', dir: 'desc' }}
        pageSize={0}
      />
      <div className="px-4 py-3 border-t border-line bg-soft/50 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12px] text-mute">
          Every rupee here is a client the practice already had. Nothing new was sold — the introduction was the work.
        </p>
        <div className="flex items-center gap-5">
          <div className="text-right">
            <p className="label">Monthly</p>
            <p className="text-[15px] font-extrabold num text-ok-600">{inr(totalShare)}</p>
          </div>
          <div className="text-right">
            <p className="label">Lifetime</p>
            <p className="text-[15px] font-extrabold num text-ink">{inr(LIFETIME.gross)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* --------------------------------------------------------------- payout history */
function Payouts({ download }) {
  const { LIFETIME, STATEMENTS } = useRepo().revenue
  return (
    <div>
      <Table
        columns={[
          { key: 'month', label: 'For the month', render: (s) => (
            <div>
              <p className="text-[12.5px] font-bold text-ink">{s.label}</p>
              <p className="text-[11px] text-mute">{s.clients} clients billed</p>
            </div>
          ) },
          { key: 'inv', label: 'Invoice', render: (s) => <span className="num text-[12.5px] text-mute">{s.id}</span> },
          { key: 'rev', label: 'Real V collections', align: 'right', sortValue: (s) => s.realvRevenue,
            render: (s) => <span className="num text-[12.5px] text-mute">{inr(s.realvRevenue)}</span> },
          { key: 'gross', label: 'Share 20%', align: 'right', sortValue: (s) => s.gross,
            render: (s) => <span className="num text-[13px] font-extrabold text-ink">{inr(s.gross)}</span> },
          { key: 'gst', label: '+ GST 18%', align: 'right', render: (s) => <span className="num text-[12.5px] text-mute">{inr(s.gst)}</span> },
          { key: 'tds', label: '− TDS 2%', align: 'right', render: (s) => <span className="num text-[12.5px] text-bad-600">{inr(s.tds)}</span> },
          { key: 'net', label: 'Net credited', align: 'right', sortValue: (s) => s.net,
            render: (s) => <span className="num text-[13px] font-extrabold text-ok-600">{inr(s.net)}</span> },
          { key: 'paid', label: 'Credited on', render: (s) => (
            <div>
              <p className="text-[12.5px] font-semibold text-ink">{dateFull(s.paidOn)}</p>
              <p className="text-[10.5px] text-faint num">{s.utr}</p>
            </div>
          ) },
          { key: 'act', label: '', align: 'right', render: (s) => (
            <button
              className="btn-quiet !h-7 !px-2 text-[12px]"
              onClick={() => download('statement-' + s.month + '.csv', [s], [
                { label: 'Month', value: (x) => x.label },
                { label: 'Real V collections', value: (x) => x.realvRevenue },
                { label: 'Share 20%', value: (x) => x.gross },
                { label: 'GST 18%', value: (x) => x.gst },
                { label: 'TDS 194H', value: (x) => x.tds },
                { label: 'Net credited', value: (x) => x.net },
                { label: 'UTR', value: (x) => x.utr },
              ])}
            >
              <Download size={12} /> Statement
            </button>
          ) },
        ]}
        rows={STATEMENTS}
        keyFn={(s) => s.id}
        pageSize={0}
      />
      <div className="p-4 border-t border-line grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MiniStat label="Payouts received" value={STATEMENTS.length} />
          <MiniStat label="Gross earned" value={inr(LIFETIME.paid)} tone="ok" />
          <MiniStat label="Net credited" value={inr(LIFETIME.net)} tone="ok" />
          <MiniStat label="Average per month" value={inr(Math.round(LIFETIME.paid / STATEMENTS.length))} />
        </div>
        <Note tone="info" title="On the TDS">
          Real V deducts 2% under section 194H before crediting. It shows up in your 26AS every quarter and is
          adjusted against the firm's own tax — it is not a cost.
        </Note>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------- pipeline */
function Pipeline() {
  const { clientById, revenue: { PIPELINE, PIPELINE_TOTALS, FORWARD } } = useRepo()
  return (
    <div>
      <div className="px-4 py-3 bg-soft/50 border-b border-line grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStat label="In the pipeline" value={PIPELINE.length} />
        <MiniStat label="Fees if all close" value={inr(PIPELINE_TOTALS.fee) + '/mo'} />
        <MiniStat label="Your share if all close" value={inr(PIPELINE_TOTALS.share) + '/mo'} tone="ok" />
        <MiniStat label="Weighted by probability" value={inr(PIPELINE_TOTALS.weighted) + '/mo'} tone="brand" />
      </div>

      <Table
        columns={[
          { key: 'name', label: 'Business', render: (p) => (
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-8 h-8 rounded-lg bg-soft text-mute grid place-items-center shrink-0">
                {p.clientId ? <VerticalIcon client={clientById[p.clientId]} size={15} /> : <Building2 size={15} />}
              </span>
              <div className="min-w-0">
                <p className="text-[12.5px] font-bold text-ink truncate">{p.name}</p>
                <p className="text-[11px] text-mute truncate">{p.kind}</p>
              </div>
            </div>
          ) },
          { key: 'stage', label: 'Stage', render: (p) => <Pill tone={PIPELINE_TONE[p.stage] || 'mute'} dot>{p.stage}</Pill> },
          { key: 'fee', label: 'Expected fee', align: 'right', sortValue: (p) => p.fee,
            render: (p) => <span className="num text-[12.5px] font-semibold">{inr(p.fee)}/mo</span> },
          { key: 'share', label: 'Your 20%', align: 'right', sortValue: (p) => p.share,
            render: (p) => <span className="num text-[13px] font-extrabold text-ok-600">{inr(p.share)}/mo</span> },
          { key: 'prob', label: 'Confidence', sortValue: (p) => p.probability, render: (p) => (
            <div className="w-[90px]">
              <Bar value={p.probability * 100} tone={p.probability > 0.7 ? 'ok' : p.probability > 0.4 ? 'warn' : 'bad'} height={6} />
              <p className="text-[10.5px] text-faint mt-1 num">{pct(p.probability * 100, 0)}</p>
            </div>
          ) },
          { key: 'when', label: 'Expected', sortValue: (p) => p.expected, render: (p) => <span className="text-[12.5px] text-mute">{dateFull(p.expected)}</span> },
          { key: 'next', label: 'Where it stands', render: (p) => <p className="text-[11.5px] text-mute max-w-[320px] whitespace-normal leading-snug">{p.next}</p> },
        ]}
        rows={PIPELINE}
        keyFn={(p) => p.id}
        initialSort={{ key: 'share', dir: 'desc' }}
        pageSize={0}
      />

      <div className="p-4 border-t border-line">
        <SectionTitle sub="Holding the current book and layering the pipeline in at its expected date, weighted by confidence.">
          Twelve-month projection
        </SectionTitle>
        <ChartBox height={230}>
          {(w, h) => (
            <AreaChart width={w} height={h} data={FORWARD} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--line))" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10.5, fill: 'rgb(var(--mute))' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={axisMoney} tick={{ fontSize: 11, fill: 'rgb(var(--mute))' }} axisLine={false} tickLine={false} width={54} />
              <Tooltip formatter={(v, n) => [inr(v), n]} contentStyle={{ background: 'rgb(var(--card))', border: '1px solid rgb(var(--line))', borderRadius: 10, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11.5 }} />
              <Area type="monotone" dataKey="base" name="Current book" stackId="1" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.18} strokeWidth={2} />
              <Area type="monotone" dataKey="added" name="Pipeline (weighted)" stackId="1" stroke="#059669" fill="#10B981" fillOpacity={0.22} strokeWidth={2} />
            </AreaChart>
          )}
        </ChartBox>
      </div>
    </div>
  )
}

/* ----------------------------------------------------------------- the terms */
function TermsPanel() {
  const { FIRM, revenue: { TERMS } } = useRepo()
  return (
    <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Handshake size={16} className="text-brand-600" />
            <h3 className="text-[13.5px] font-bold text-ink">The arrangement, in plain terms</h3>
          </div>
          <ol className="space-y-3">
            {[
              ['You introduce a client', 'A phone call or a WhatsApp introduction to the owner. That is the whole ask — you do not sell, quote or support anything.'],
              ['Real V visits the business', 'They study how that specific business actually runs, then build a custom application and website for it. Not a template.'],
              ['The client pays Real V monthly', 'Whatever that build and support is worth for that business — ₹9,000 for a clinic, ₹50,000 for a factory.'],
              ['You get 20% of that, every month', 'Of the gross collection, not the profit. It continues for as long as the client keeps paying, with no cap and no end date.'],
              ['Their data lands in your dashboard', 'Every custom app pipes sales, purchases and payroll into CleanBook. That is why your filing readiness looks the way it does.'],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-3">
                <span className="w-6 h-6 rounded-lg bg-brand-50 text-brand-700 text-[11.5px] font-extrabold grid place-items-center shrink-0 num">{i + 1}</span>
                <div className="min-w-0">
                  <p className="text-[12.5px] font-bold text-ink">{t}</p>
                  <p className="text-[12px] text-mute mt-0.5 leading-relaxed">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <Note tone="warn" title="Before you sign — the ICAI question" icon={ShieldQuestion}>
          {TERMS.agreementNote}
        </Note>
      </div>

      <div className="space-y-4">
        <div className="card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <FileText size={15} className="text-brand-600" />
            <h3 className="text-[13px] font-bold text-ink">Terms on record</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Share" value={TERMS.sharePct + '% of gross'} />
            <Field label="Paid on" value={'The ' + TERMS.payoutDay + 'th'} />
            <Field label="GST you charge" value={TERMS.gstOnCommission + '%'} />
            <Field label="TDS deducted" value={TERMS.tdsSection + ' · ' + TERMS.tdsPct + '%'} />
          </div>
          <Field label="Basis" value={TERMS.basis} />
          <Field label="Lock-in" value={TERMS.lockIn} />
          <Field label="Refund clawback" value={TERMS.clawback} />
          <Field label="Agreement" value={TERMS.agreement} />
          <Field label="Counterparty" value={TERMS.contact} />
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Info size={15} className="text-mute" />
            <h3 className="text-[13px] font-bold text-ink">Your firm on this invoice</h3>
          </div>
          <Field label="Firm" value={FIRM.name} />
          <div className="grid grid-cols-2 gap-3 mt-3">
            <Field label="FRN" value={FIRM.frn} mono />
            <Field label="GSTIN" value={FIRM.gstin} mono />
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, sub, strong, tone }) {
  const col = tone === 'ok' ? 'text-ok-600' : tone === 'bad' ? 'text-bad-600' : 'text-ink'
  return (
    <div className="flex items-start justify-between gap-3 px-3.5 py-2.5">
      <div className="min-w-0">
        <p className={'text-[12.5px] ' + (strong ? 'font-bold text-ink' : 'text-mute')}>{label}</p>
        {sub && <p className="text-[11px] text-faint mt-0.5">{sub}</p>}
      </div>
      <p className={'num shrink-0 ' + (strong ? 'text-[15px] font-extrabold ' : 'text-[13px] font-semibold ') + col}>{value}</p>
    </div>
  )
}
