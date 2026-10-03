// Cash in, cash out, who owes you, who you owe. In an owner's words, not an
// accountant's.

import { useMemo, useState } from 'react'
import { Wallet, TrendingUp, TrendingDown, Landmark, AlertTriangle, PiggyBank, Camera, Upload, ReceiptText, CheckCircle2 } from 'lucide-react'
import { Bar as RBar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, ComposedChart } from 'recharts'
import { Card, CardHead, MiniStat, Bar } from '../../../components/ui.jsx'
import { Note } from '../../../components/bits.jsx'
import ChartBox from '../../../components/ChartBox.jsx'
import { MONEY } from '../../../data/business.js'
import { clientSeries } from '../../../lib/derive.js'
import { inr, inrShort, axisMoney, pct } from '../../../lib/format.js'
import { useApp } from '../../../lib/store.jsx'

export default function Money({ client: c, accent }) {
  const { receiptsFor, addReceipt } = useApp()
  const m = MONEY[c.id]
  const series = useMemo(() => clientSeries(c.id).slice(-9), [c.id])
  const receipts = receiptsFor(c.id)
  const runway = m.cashInHand + m.bank
  const committed = m.gstPayable + m.payrollDue
  const tight = runway < committed * 1.4

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <Tile label="In hand" value={inrShort(m.cashInHand)} sub="counter and petty cash" icon={Wallet} accent={accent} />
        <Tile label="In the bank" value={inrShort(m.bank)} sub="current account" icon={Landmark} accent={accent} />
        <Tile label="Owed to you" value={inrShort(m.receivables)} sub="customers and parties" icon={TrendingUp} accent={accent} />
        <Tile label="You owe" value={inrShort(m.payables)} sub="suppliers and vendors" icon={TrendingDown} accent="#F59E0B" />
        <Tile label="GST to pay" value={inrShort(m.gstPayable)} sub="by the 20th" icon={AlertTriangle} accent="#EF4444" />
        <Tile label="Left this month" value={inrShort(m.profitMonth)} sub="before tax and drawings" icon={PiggyBank} accent={m.profitMonth > 0 ? '#059669' : '#EF4444'} />
      </div>

      {tight && (
        <Note tone="warn" title="Watch the next ten days">
          You are holding {inrShort(runway)} between cash and bank, and {inrShort(committed)} is already committed to
          GST and salaries. Collecting even a third of what is over 60 days would settle it comfortably.
        </Note>
      )}

      <PurchaseCapture client={c} accent={accent} receipts={receipts} addReceipt={addReceipt} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHead title="Billed against collected" sub="Last nine months — the gap is your working capital" icon={TrendingUp} />
          <div className="p-4">
            <ChartBox height={264}>
              {(w, h) => (
                <ComposedChart width={w} height={h} data={series} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--line))" vertical={false} />
                  <XAxis dataKey="short" tick={{ fontSize: 11, fill: 'rgb(var(--mute))' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={axisMoney} tick={{ fontSize: 11, fill: 'rgb(var(--mute))' }} axisLine={false} tickLine={false} width={54} />
                  <Tooltip formatter={(v, n) => [inr(v), n]}
                    contentStyle={{ background: 'rgb(var(--card))', border: '1px solid rgb(var(--line))', borderRadius: 10, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11.5 }} />
                  <RBar dataKey="turnover" name="Billed" fill={accent} radius={[4, 4, 0, 0]} maxBarSize={30} />
                  <RBar dataKey="purchases" name="Spent on purchases" fill="#CBD5E1" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  <Line type="monotone" dataKey="net" name="GST paid in cash" stroke="#F59E0B" strokeWidth={2.2} dot={{ r: 2.5 }} />
                </ComposedChart>
              )}
            </ChartBox>
          </div>
        </Card>

        <Card>
          <CardHead title="Who owes you, and for how long" sub={'Total ' + inr(m.receivables)} icon={AlertTriangle} />
          <div className="p-4 space-y-3.5">
            {m.ageing.map((a) => (
              <div key={a.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12.5px] text-mute">{a.label}</span>
                  <span className="num text-[13px] font-bold text-ink">{inr(a.value)}</span>
                </div>
                <Bar value={a.value} max={m.receivables} tone={a.tone} height={7} />
              </div>
            ))}
            <div className="pt-3 border-t border-line">
              <p className="text-[12px] text-mute leading-relaxed">
                Anything past 90 days rarely comes back on its own. That bucket is{' '}
                <span className="font-bold text-bad-600">{pct((m.ageing[3].value / m.receivables) * 100, 0)}</span>{' '}
                of what you are owed.
              </p>
            </div>
            <button className="btn-ghost w-full justify-center">Send reminders to everyone over 60 days</button>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHead title="This month, in one place" />
          <div className="p-4 space-y-3">
            <Row label="Billed" value={m.billedMonth} strong />
            <Row label="Collected" value={m.collectedMonth} />
            <Row label="Still to collect" value={m.billedMonth - m.collectedMonth} tone="warn" />
            <Row label="Spent on purchases" value={m.expensesMonth} tone="bad" />
            <Row label="Salaries and wages" value={m.payrollMonth} tone="bad" />
            <Row label="GST payable" value={m.gstPayable} tone="bad" />
            <div className="pt-3 border-t border-line">
              <Row label="What is left" value={m.profitMonth} strong tone={m.profitMonth > 0 ? 'ok' : 'bad'} />
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHead title="What your accountant would call this" sub="Same numbers, the words your CA uses — so the two of you are never arguing about the figures" />
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <MiniStat label="Turnover (taxable)" value={inr(m.billedMonth)} />
            <MiniStat label="Purchases" value={inr(m.expensesMonth)} />
            <MiniStat label="Employee benefit expense" value={inr(m.payrollMonth)} />
            <MiniStat label="Trade receivables" value={inr(m.receivables)} tone="warn" />
            <MiniStat label="Trade payables" value={inr(m.payables)} tone="warn" />
            <MiniStat label="Cash and bank balance" value={inr(runway)} tone="ok" />
            <MiniStat label="GST payable (output − ITC)" value={inr(m.gstPayable)} tone="bad" />
            <MiniStat label="Statutory dues (PF, ESI, PT)" value={m.payrollDue ? inr(Math.round(m.payrollMonth * 0.28)) : '—'} />
            <MiniStat label="Profit before tax (est.)" value={inr(m.profitMonth)} tone={m.profitMonth > 0 ? 'ok' : 'bad'} />
          </div>
        </Card>
      </div>
    </div>
  )
}

function PurchaseCapture({ client, accent, receipts, addReceipt }) {
  const [file, setFile] = useState(null)
  const [vendor, setVendor] = useState('')
  const [amount, setAmount] = useState('')

  const submit = (event) => {
    event.preventDefault()
    if (!file) return
    addReceipt({ clientId: client.id, fileName: file.name, vendor, amount })
    setFile(null)
    setVendor('')
    setAmount('')
    event.currentTarget.reset()
  }

  return (
    <Card className="overflow-hidden">
      <CardHead title="Capture a purchase" sub="Take a bill photo or upload it once. Your CA sees it for review — no manual register entry needed." icon={Camera}
        right={receipts.length ? <span className="chip bg-ok-50 text-ok-700 border border-ok-500/25"><CheckCircle2 size={10} /> {receipts.length} captured today</span> : null} />
      <div className="p-4 grid grid-cols-1 xl:grid-cols-3 gap-4 items-start">
        <form onSubmit={submit} className="xl:col-span-2 grid sm:grid-cols-[1.35fr_1fr_0.7fr_auto] gap-2.5">
          <label className="h-9 px-3 rounded-lg border border-dashed border-line bg-soft/50 hover:border-brand-400 transition-colors flex items-center gap-2 cursor-pointer text-[12.5px] text-mute min-w-0">
            <Upload size={14} style={{ color: accent }} />
            <span className="truncate">{file ? file.name : 'Tap to add bill / invoice photo'}</span>
            <input type="file" accept="image/*,.pdf" className="hidden" onChange={(event) => setFile(event.target.files?.[0] || null)} />
          </label>
          <input className="input" value={vendor} onChange={(event) => setVendor(event.target.value)} placeholder="Vendor (optional)" />
          <input className="input num" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Amount" />
          <button className="btn text-white justify-center" style={{ background: accent }} disabled={!file}><ReceiptText size={13} /> Capture</button>
        </form>
        <div className="xl:border-l xl:border-line xl:pl-4 min-w-0">
          {receipts.length ? (
            <div className="space-y-1.5">
              <p className="label">Latest captured</p>
              {receipts.slice(0, 2).map((receipt) => <p key={receipt.id} className="text-[12px] text-mute truncate"><span className="font-semibold text-ink">{receipt.fileName}</span>{receipt.amount ? ' · ' + inr(receipt.amount) : ''}</p>)}
            </div>
          ) : <p className="text-[12px] text-mute leading-relaxed">In the live Firebase version, the image is securely stored and OCR extracts invoice details for CA review.</p>}
        </div>
      </div>
    </Card>
  )
}

function Tile({ label, value, sub, icon: Icon, accent }) {
  return (
    <div className="card p-3.5">
      <div className="flex items-start justify-between gap-2">
        <p className="label">{label}</p>
        <span className="w-6 h-6 rounded-md grid place-items-center shrink-0" style={{ background: accent + '18', color: accent }}>
          <Icon size={13} />
        </span>
      </div>
      <p className="text-[21px] font-extrabold num text-ink mt-1.5 leading-none">{value}</p>
      <p className="text-[11px] text-mute mt-1 truncate">{sub}</p>
    </div>
  )
}

function Row({ label, value, strong, tone }) {
  const col = tone === 'ok' ? 'text-ok-600' : tone === 'bad' ? 'text-bad-600' : tone === 'warn' ? 'text-warn-600' : 'text-ink'
  return (
    <div className="flex items-center justify-between gap-3">
      <p className={'text-[12.5px] ' + (strong ? 'font-bold text-ink' : 'text-mute')}>{label}</p>
      <p className={'num shrink-0 ' + (strong ? 'text-[15px] font-extrabold ' : 'text-[13px] font-semibold ') + col}>{inr(value)}</p>
    </div>
  )
}
