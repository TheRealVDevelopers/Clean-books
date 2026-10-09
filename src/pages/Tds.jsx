import { useMemo, useState } from 'react'
import { Receipt, Users, Landmark, AlertOctagon, Download, CheckCheck } from 'lucide-react'
import { Card, CardHead, PageHead, Kpi, Pill, Table, Tabs, MiniStat, Empty } from '../components/ui.jsx'
import { ClientChip, DueCell, StatusPill, Note, AutoTag } from '../components/bits.jsx'
import { isDone } from '../lib/obligations.js'
import { inr, inrShort, num, toCsv } from '../lib/format.js'
import { pLabel } from '../lib/dates.js'
import { useApp } from '../lib/store.jsx'
import { useRepo } from '../repo/index.js'

export default function Tds() {
  const { CLIENTS, clientById, staffById, CURRENT_PERIOD, LEDGER, OBLIGATIONS } = useRepo()
  const { statusOf, fileReturn, markReady, toast } = useApp()
  const [tab, setTab] = useState('tds')

  const tdsObs = useMemo(() => OBLIGATIONS.filter((o) => o.kind === 'TDS'), [])
  const payObs = useMemo(() => OBLIGATIONS.filter((o) => o.kind === 'Payroll'), [])

  const tdsClients = CLIENTS.filter((c) => c.tdsApplicable)
  const payClients = CLIENTS.filter((c) => c.pf || c.esi || c.pt)

  const tdsMonth = tdsClients.map((c) => ({ client: c, row: LEDGER[c.id][CURRENT_PERIOD] }))
  const totals = {
    tds: tdsMonth.reduce((s, x) => s + (x.row.tds?.deducted || 0), 0),
    pf: payClients.reduce((s, c) => s + (LEDGER[c.id][CURRENT_PERIOD].payroll?.pf || 0), 0),
    esi: payClients.reduce((s, c) => s + (LEDGER[c.id][CURRENT_PERIOD].payroll?.esi || 0), 0),
    pt: payClients.reduce((s, c) => s + (LEDGER[c.id][CURRENT_PERIOD].payroll?.pt || 0), 0),
    staff: payClients.reduce((s, c) => s + (LEDGER[c.id][CURRENT_PERIOD].payroll?.employees || 0), 0),
    wages: payClients.reduce((s, c) => s + (LEDGER[c.id][CURRENT_PERIOD].payroll?.wages || 0), 0),
  }
  const overdue = [...tdsObs, ...payObs].filter((o) => !isDone({ ...o, status: statusOf(o) }) && o.due < '2026-09-10')

  const exportCsv = () => {
    const csv = toCsv(tdsMonth, [
      { label: 'Client', value: (x) => x.client.name },
      { label: 'TAN sections', value: (x) => x.client.tdsSections.join(' ') },
      { label: 'Deducted', value: (x) => x.row.tds.deducted },
      { label: 'Due', value: (x) => x.row.tds.due },
      { label: 'Status', value: (x) => x.row.tds.status },
      { label: 'Challan', value: (x) => x.row.tds.challan },
    ])
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'tds-payroll-' + CURRENT_PERIOD + '.csv'
    a.click()
    URL.revokeObjectURL(a.href)
    toast('Exported', 'TDS and payroll working for ' + pLabel(CURRENT_PERIOD))
  }

  return (
    <div className="space-y-5">
      <PageHead
        title="TDS & payroll compliance"
        sub={'Deductions, challans, quarterly returns and the monthly payroll heads for ' + pLabel(CURRENT_PERIOD)}
        chips={[
          <Pill key="a" tone="brand" dot>{tdsClients.length} clients deduct TDS</Pill>,
          <Pill key="b" tone="mute">{num(totals.staff)} employees on roll across the book</Pill>,
          <Pill key="c" tone={overdue.length ? 'bad' : 'ok'} dot>{overdue.length} overdue</Pill>,
        ]}
        actions={<button className="btn-ghost" onClick={exportCsv}><Download size={14} /> Export working</button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <Kpi label="TDS deducted" value={inrShort(totals.tds)} icon={Receipt} tone="brand" sub="payable by the 7th" />
        <Kpi label="PF contribution" value={inrShort(totals.pf)} icon={Landmark} tone="info" sub="employer + employee, due 15th" />
        <Kpi label="ESI contribution" value={inrShort(totals.esi)} icon={Landmark} tone="info" sub="due 15th" />
        <Kpi label="Professional tax" value={inrShort(totals.pt)} icon={Landmark} tone="mute" sub="Karnataka, due 20th" />
        <Kpi label="Wage bill covered" value={inrShort(totals.wages)} icon={Users} tone="mute" sub={num(totals.staff) + ' employees'} />
        <Kpi label="Overdue items" value={overdue.length} icon={AlertOctagon} tone={overdue.length ? 'bad' : 'ok'} sub="interest at 1.5% a month" />
      </div>

      {overdue.length > 0 && (
        <Note tone="bad" title="Two TDS challans are past their date">
          Kaveri Dental and Zenith Coaching both had an Aug challan due on 07 Sep. Neither payout sheet has arrived, so
          the deduction could not be computed. Interest under section 201(1A) runs from the date of deduction, not the
          date of payment — so the cost is already accruing.
        </Note>
      )}

      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-line">
          <Tabs
            active={tab} onChange={setTab}
            tabs={[
              { id: 'tds', label: 'Monthly TDS', count: tdsClients.length },
              { id: 'returns', label: 'Quarterly returns', count: tdsObs.filter((o) => ['26Q', '16A'].includes(o.form)).length },
              { id: 'payroll', label: 'PF, ESI & PT', count: payClients.length },
            ]}
          />
        </div>

        {tab === 'tds' && (
          <Table
            columns={[
              { key: 'client', label: 'Client', render: (x) => <ClientChip client={x.client} /> },
              { key: 'sections', label: 'Sections in play', render: (x) => (
                <div className="flex flex-wrap gap-1">
                  {x.client.tdsSections.map((s) => <Pill key={s} tone="mute">{s}</Pill>)}
                </div>
              ) },
              { key: 'base', label: 'Payments in the month', align: 'right', sortValue: (x) => x.row.purchases,
                render: (x) => <span className="num text-[12.5px] text-mute">{inr(x.row.purchases)}</span> },
              { key: 'ded', label: 'TDS deducted', align: 'right', sortValue: (x) => x.row.tds.deducted,
                render: (x) => <span className="num text-[13px] font-extrabold text-ink">{inr(x.row.tds.deducted)}</span> },
              { key: 'due', label: 'Deposit by', sortValue: (x) => x.row.tds.due,
                render: (x) => <DueCell due={x.row.tds.due} done={x.row.tds.status.startsWith('Paid')} /> },
              { key: 'status', label: 'Status', render: (x) => (
                <Pill tone={x.row.tds.status === 'Paid' ? 'ok' : x.row.tds.status === 'Paid Late' ? 'warn' : 'bad'} dot>
                  {x.row.tds.status}
                </Pill>
              ) },
              { key: 'challan', label: 'Challan', render: (x) => x.row.tds.status.startsWith('Paid')
                ? <span className="num text-[11.5px] text-mute">{x.row.tds.challan}</span>
                : <span className="text-faint">—</span> },
              { key: 'src', label: 'Data', render: (x) => x.client.books.mode === 'CleanBook Auto'
                ? <AutoTag>Computed from the app</AutoTag>
                : <Pill tone="warn">Needs a payout sheet</Pill> },
            ]}
            rows={tdsMonth}
            keyFn={(x) => x.client.id}
            initialSort={{ key: 'ded', dir: 'desc' }}
            pageSize={0}
          />
        )}

        {tab === 'returns' && (
          <Table
            columns={[
              { key: 'client', label: 'Client', render: (o) => <ClientChip client={clientById[o.clientId]} /> },
              { key: 'form', label: 'Return', render: (o) => (
                <div>
                  <p className="text-[12.5px] font-bold text-ink">{o.form}</p>
                  <p className="text-[11px] text-mute">{o.formLabel}</p>
                </div>
              ) },
              { key: 'period', label: 'Quarter', render: (o) => <span className="text-[12.5px] text-mute">{o.periodLabel}</span> },
              { key: 'due', label: 'Due', sortValue: (o) => o.due, render: (o) => <DueCell due={o.due} done={isDone({ ...o, status: statusOf(o) })} /> },
              { key: 'status', label: 'Status', render: (o) => <StatusPill status={statusOf(o)} /> },
              { key: 'who', label: 'Owner', render: (o) => <span className="text-[12px] text-mute">{staffById[o.assignee].short}</span> },
              { key: 'note', label: 'Note', render: (o) => <p className="text-[11.5px] text-mute max-w-[280px] whitespace-normal">{o.note || '—'}</p> },
              { key: 'act', label: '', align: 'right', render: (o) => {
                const s = statusOf(o)
                if (isDone({ ...o, status: s })) return <span className="text-[11.5px] text-ok-600 font-bold">Done</span>
                if (s === 'Ready to File') return <button className="btn-primary !h-7 !px-2.5 text-[12px]" onClick={() => fileReturn(o, clientById[o.clientId].short)}>File</button>
                return <button className="btn-ghost !h-7 !px-2.5 text-[12px]" onClick={() => markReady(o, clientById[o.clientId].short)}>Mark ready</button>
              } },
            ]}
            rows={tdsObs.filter((o) => ['26Q', '16A'].includes(o.form))}
            keyFn={(o) => o.id}
            initialSort={{ key: 'due', dir: 'asc' }}
            pageSize={0}
          />
        )}

        {tab === 'payroll' && (
          <Table
            columns={[
              { key: 'client', label: 'Client', render: (c) => <ClientChip client={c} /> },
              { key: 'staff', label: 'On roll', align: 'right', sortValue: (c) => LEDGER[c.id][CURRENT_PERIOD].payroll?.employees || 0,
                render: (c) => <span className="num text-[12.5px] font-semibold">{LEDGER[c.id][CURRENT_PERIOD].payroll?.employees || '—'}</span> },
              { key: 'wages', label: 'Wage bill', align: 'right', sortValue: (c) => LEDGER[c.id][CURRENT_PERIOD].payroll?.wages || 0,
                render: (c) => <span className="num text-[12.5px]">{inr(LEDGER[c.id][CURRENT_PERIOD].payroll?.wages || 0)}</span> },
              { key: 'pf', label: 'PF', align: 'right', render: (c) => c.pf
                ? <span className="num text-[12.5px]">{inr(LEDGER[c.id][CURRENT_PERIOD].payroll.pf)}</span>
                : <Pill tone="mute">n/a</Pill> },
              { key: 'esi', label: 'ESI', align: 'right', render: (c) => c.esi
                ? <span className="num text-[12.5px]">{inr(LEDGER[c.id][CURRENT_PERIOD].payroll.esi)}</span>
                : <Pill tone="mute">n/a</Pill> },
              { key: 'pt', label: 'PT (KA)', align: 'right', render: (c) => c.pt
                ? <span className="num text-[12.5px]">{inr(LEDGER[c.id][CURRENT_PERIOD].payroll?.pt || 0)}</span>
                : <Pill tone="mute">n/a</Pill> },
              { key: 'status', label: 'This month', render: (c) => {
                const p = LEDGER[c.id][CURRENT_PERIOD].payroll
                return p ? <StatusPill status={p.status} /> : <Pill tone="mute">Not applicable</Pill>
              } },
              { key: 'due', label: 'Due', render: (c) => {
                const p = LEDGER[c.id][CURRENT_PERIOD].payroll
                return p ? <DueCell due={p.due} done={false} /> : <span className="text-faint">—</span>
              } },
            ]}
            rows={payClients}
            keyFn={(c) => c.id}
            initialSort={{ key: 'wages', dir: 'desc' }}
            pageSize={0}
          />
        )}

        <div className="px-4 py-3 border-t border-line bg-soft/50 grid grid-cols-2 lg:grid-cols-5 gap-4">
          <MiniStat label="TDS this month" value={inr(totals.tds)} />
          <MiniStat label="PF" value={inr(totals.pf)} />
          <MiniStat label="ESI" value={inr(totals.esi)} />
          <MiniStat label="PT" value={inr(totals.pt)} />
          <MiniStat label="Total statutory outgo" value={inr(totals.tds + totals.pf + totals.esi + totals.pt)} tone="brand" />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Note tone="ok" title="Where the deduction is computed for you">
          In Iron Temple Studio, a trainer invoice uploaded by the owner is checked against the 194J threshold and the
          deduction is worked out on the spot. Meena only reviews and pays — she does not chase or calculate.
        </Note>
        <Note tone="warn" title="194Q and 206C(1H) overlap">
          Sri Balaji, Precision Auto and BuildRight all buy above ₹50 L from single vendors. Where the buyer deducts
          under 194Q the seller must not collect under 206C(1H) — the declaration has to be on file for each vendor.
        </Note>
      </div>
    </div>
  )
}
