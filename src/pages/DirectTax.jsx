import { useMemo, useState } from 'react'
import { Landmark, ClipboardCheck, Building2, FileStack, Download, AlertOctagon } from 'lucide-react'
import { Card, CardHead, PageHead, Kpi, Pill, Table, Tabs, MiniStat, Bar, Empty, Field } from '../components/ui.jsx'
import { ClientChip, DueCell, StatusPill, Note } from '../components/bits.jsx'
import { CLIENTS, clientById, staffById, OBLIGATIONS, isDone, estimatedTax, PERIOD_KEYS, LEDGER } from '../data/index.js'
import { inr, inrShort, pct, toCsv, dateFull } from '../lib/format.js'
import { useApp } from '../lib/store.jsx'

export default function DirectTax() {
  const { statusOf, markReady, fileReturn, toast } = useApp()
  const [tab, setTab] = useState('advance')

  const dt = useMemo(() => OBLIGATIONS.filter((o) => o.kind === 'Direct Tax'), [])
  const roc = useMemo(() => OBLIGATIONS.filter((o) => o.kind === 'ROC'), [])
  const annual = useMemo(() => OBLIGATIONS.filter((o) => o.form.startsWith('GSTR-9')), [])

  const advance = dt.filter((o) => o.form === 'Advance Tax Q2')
  const audits = dt.filter((o) => o.form === '3CB-3CD')
  const itrs = dt.filter((o) => o.form.startsWith('ITR'))

  const totals = {
    advance: advance.reduce((s, o) => s + (o.amount || 0), 0),
    estimated: CLIENTS.reduce((s, c) => s + estimatedTax(c), 0),
    audits: audits.length,
    roc: roc.length,
  }

  const fyTurnover = (id) => PERIOD_KEYS.filter((k) => k >= '2026-04').reduce((s, k) => s + LEDGER[id][k].sales, 0)

  const exportCsv = () => {
    const csv = toCsv(advance, [
      { label: 'Client', value: (o) => clientById[o.clientId].name },
      { label: 'Constitution', value: (o) => clientById[o.clientId].constitution },
      { label: 'Estimated annual tax', value: (o) => estimatedTax(clientById[o.clientId]) },
      { label: 'Q2 instalment', value: (o) => o.amount },
      { label: 'Due', value: (o) => o.due },
      { label: 'Status', value: (o) => statusOf(o) },
    ])
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'advance-tax-q2-fy2627.csv'
    a.click()
    URL.revokeObjectURL(a.href)
    toast('Advance tax working exported', '12 clients')
  }

  return (
    <div className="space-y-5">
      <PageHead
        title="Direct tax, audit & ROC"
        sub="The annual calendar — advance tax, tax audits, returns and MCA filings"
        chips={[
          <Pill key="a" tone="bad" dot>Advance tax Q2 due 15 Sep</Pill>,
          <Pill key="b" tone="warn">Tax audit reports due 30 Sep</Pill>,
          <Pill key="c" tone="info">ITR for audit cases 31 Oct</Pill>,
          <Pill key="d" tone="mute">GSTR-9 by 31 Dec</Pill>,
        ]}
        actions={<button className="btn-ghost" onClick={exportCsv}><Download size={14} /> Export advance tax</button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Advance tax due 15 Sep" value={inrShort(totals.advance)} icon={Landmark} tone="bad" sub="45% cumulative instalment" />
        <Kpi label="Estimated annual tax" value={inrShort(totals.estimated)} icon={FileStack} tone="brand" sub="across the whole book, FY 26-27" />
        <Kpi label="Tax audits to sign" value={totals.audits} icon={ClipboardCheck} tone="warn" sub="all due 30 Sep 2026" />
        <Kpi label="MCA filings pending" value={totals.roc} icon={Building2} tone="info" sub="AOC-4, MGT-7, DIR-3 KYC" />
      </div>

      <Note tone="info" title="Why the estimate is worth something this year">
        The advance tax numbers below are not last year's tax plus ten per cent. They are built from live turnover to
        31 August pulled out of each client's own application, annualised on their actual trend and margin. That is the
        difference between a guess and an estimate.
      </Note>

      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-line">
          <Tabs
            active={tab} onChange={setTab}
            tabs={[
              { id: 'advance', label: 'Advance tax', count: advance.length },
              { id: 'audit', label: 'Tax audit', count: audits.length },
              { id: 'itr', label: 'Income tax returns', count: itrs.length },
              { id: 'roc', label: 'ROC / MCA', count: roc.length },
              { id: 'annual', label: 'GST annual return', count: annual.length },
            ]}
          />
        </div>

        {tab === 'advance' && (
          <Table
            columns={[
              { key: 'client', label: 'Client', render: (o) => <ClientChip client={clientById[o.clientId]} sub={clientById[o.clientId].constitution} /> },
              { key: 'turn', label: 'Turnover to 31 Aug', align: 'right', sortValue: (o) => fyTurnover(o.clientId),
                render: (o) => <span className="num text-[12.5px]">{inr(fyTurnover(o.clientId))}</span> },
              { key: 'est', label: 'Estimated annual tax', align: 'right', sortValue: (o) => estimatedTax(clientById[o.clientId]),
                render: (o) => <span className="num text-[12.5px] font-semibold">{inr(estimatedTax(clientById[o.clientId]))}</span> },
              { key: 'q2', label: 'Instalment now', align: 'right', sortValue: (o) => o.amount || 0,
                render: (o) => <span className="num text-[13px] font-extrabold text-ink">{inr(o.amount)}</span> },
              { key: 'due', label: 'Due', render: (o) => <DueCell due={o.due} done={isDone({ ...o, status: statusOf(o) })} /> },
              { key: 'status', label: 'Status', render: (o) => <StatusPill status={statusOf(o)} /> },
              { key: 'note', label: 'Basis', render: (o) => <p className="text-[11.5px] text-mute max-w-[260px] whitespace-normal">{o.note}</p> },
              { key: 'act', label: '', align: 'right', render: (o) => statusOf(o) === 'Ready to File'
                ? <button className="btn-primary !h-7 !px-2.5 text-[12px]" onClick={() => fileReturn(o, clientById[o.clientId].short)}>Pay</button>
                : <button className="btn-ghost !h-7 !px-2.5 text-[12px]" onClick={() => markReady(o, clientById[o.clientId].short)}>Mark ready</button> },
            ]}
            rows={advance}
            keyFn={(o) => o.id}
            initialSort={{ key: 'q2', dir: 'desc' }}
            pageSize={0}
          />
        )}

        {tab === 'audit' && (
          <div>
            <Table
              columns={[
                { key: 'client', label: 'Client', render: (o) => <ClientChip client={clientById[o.clientId]} /> },
                { key: 'turn', label: 'FY 25-26 turnover', align: 'right', sortValue: (o) => clientById[o.clientId].annual,
                  render: (o) => <span className="num text-[12.5px]">{inrShort(clientById[o.clientId].annual / (1 + clientById[o.clientId].growth))}</span> },
                { key: 'why', label: 'Why 44AB applies', render: (o) => (
                  <p className="text-[11.5px] text-mute max-w-[380px] whitespace-normal leading-snug">{o.note}</p>
                ) },
                { key: 'due', label: 'Report due', render: (o) => <DueCell due={o.due} done={isDone({ ...o, status: statusOf(o) })} /> },
                { key: 'hours', label: 'Est. effort', align: 'right', render: (o) => <span className="num text-[12.5px]">{o.hours}h</span> },
                { key: 'status', label: 'Status', render: (o) => <StatusPill status={statusOf(o)} /> },
                { key: 'who', label: 'Signing', render: (o) => <span className="text-[12px] text-mute">{staffById[o.assignee].short}</span> },
              ]}
              rows={audits}
              keyFn={(o) => o.id}
              pageSize={0}
            />
            <div className="p-4 border-t border-line grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Note tone="warn" title="Three weeks, four audits, one signature">
                Every 3CB-3CD in this practice is signed by the principal, and all four fall on 30 Sep. At 14 hours
                each that is 56 hours of work in 20 days — on top of the September GST cycle.
              </Note>
              <Note tone="ok" title="Where the automated clients help">
                For Precision Auto, the ledger scrutiny, related-party listing and clause 44 GST breakup come straight
                out of PlantOps. What used to take a week of vouching now takes a day of reviewing.
              </Note>
            </div>
          </div>
        )}

        {tab === 'itr' && (
          <div>
            <Table
              columns={[
                { key: 'client', label: 'Client', render: (c) => <ClientChip client={c} sub={c.constitution} /> },
                { key: 'form', label: 'Form', render: (c) => <Pill tone="brand">{c.itr.form}</Pill> },
                { key: 'due', label: 'Due date', sortValue: (c) => c.itr.due, render: (c) => <DueCell due={c.itr.due} done={c.itr.status === 'Filed'} /> },
                { key: 'audit', label: 'Audit case', render: (c) => c.taxAudit.applicable ? <Pill tone="bad">Yes — 31 Oct</Pill> : <Pill tone="ok">No — 31 Jul</Pill> },
                { key: 'status', label: 'Status', render: (c) => <StatusPill status={c.itr.status === 'Filed' ? 'Filed' : c.itr.status} /> },
                { key: 'tax', label: 'Estimated tax', align: 'right', sortValue: (c) => estimatedTax(c),
                  render: (c) => <span className="num text-[12.5px] font-semibold">{inr(estimatedTax(c))}</span> },
                { key: 'who', label: 'Owner', render: (c) => <span className="text-[12px] text-mute">{staffById[c.staffId].short}</span> },
              ]}
              rows={CLIENTS}
              keyFn={(c) => c.id}
              initialSort={{ key: 'due', dir: 'asc' }}
              pageSize={0}
            />
          </div>
        )}

        {tab === 'roc' && (
          roc.length ? (
            <Table
              columns={[
                { key: 'client', label: 'Company / LLP', render: (o) => <ClientChip client={clientById[o.clientId]} sub={clientById[o.clientId].constitution} /> },
                { key: 'form', label: 'Form', render: (o) => (
                  <div>
                    <p className="text-[12.5px] font-bold text-ink">{o.form}</p>
                    <p className="text-[11px] text-mute">{o.formLabel}</p>
                  </div>
                ) },
                { key: 'period', label: 'For', render: (o) => <span className="text-[12.5px] text-mute">{o.periodLabel}</span> },
                { key: 'due', label: 'Due', sortValue: (o) => o.due, render: (o) => <DueCell due={o.due} done={isDone({ ...o, status: statusOf(o) })} /> },
                { key: 'status', label: 'Status', render: (o) => <StatusPill status={statusOf(o)} /> },
                { key: 'note', label: 'Note', render: (o) => <p className="text-[11.5px] text-mute max-w-[300px] whitespace-normal">{o.note || '—'}</p> },
                { key: 'act', label: '', align: 'right', render: (o) => (
                  <button className="btn-ghost !h-7 !px-2.5 text-[12px]" onClick={() => markReady(o, clientById[o.clientId].short)}>Mark ready</button>
                ) },
              ]}
              rows={roc}
              keyFn={(o) => o.id}
              initialSort={{ key: 'due', dir: 'asc' }}
              pageSize={0}
            />
          ) : <Empty label="No company clients" />
        )}

        {tab === 'annual' && (
          <Table
            columns={[
              { key: 'client', label: 'Client', render: (o) => <ClientChip client={clientById[o.clientId]} /> },
              { key: 'form', label: 'Form', render: (o) => <Pill tone={o.form.includes('9C') ? 'bad' : 'brand'}>{o.form}</Pill> },
              { key: 'turn', label: 'FY 25-26 turnover', align: 'right', sortValue: (o) => clientById[o.clientId].annual,
                render: (o) => <span className="num text-[12.5px]">{inrShort(clientById[o.clientId].annual / (1 + clientById[o.clientId].growth))}</span> },
              { key: 'due', label: 'Due', render: (o) => <DueCell due={o.due} done={false} /> },
              { key: 'hours', label: 'Est. effort', align: 'right', render: (o) => <span className="num text-[12.5px]">{o.hours}h</span> },
              { key: 'note', label: 'Requirement', render: (o) => <p className="text-[11.5px] text-mute max-w-[320px] whitespace-normal">{o.note || 'Annual return only'}</p> },
              { key: 'who', label: 'Owner', render: (o) => <span className="text-[12px] text-mute">{staffById[o.assignee].short}</span> },
            ]}
            rows={annual}
            keyFn={(o) => o.id}
            initialSort={{ key: 'turn', dir: 'desc' }}
            pageSize={0}
          />
        )}
      </Card>
    </div>
  )
}
