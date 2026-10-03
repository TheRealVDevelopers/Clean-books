import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ScrollText, AlertOctagon, Gavel, IndianRupee, CalendarClock, FileText } from 'lucide-react'
import { Card, CardHead, PageHead, Kpi, Pill, Table, Segmented, MiniStat, Drawer, Field, Empty } from '../components/ui.jsx'
import { ClientChip, DueCell, Note } from '../components/bits.jsx'
import { NOTICES, AUTHORITY_TONE } from '../data/notices.js'
import { clientById, staffById } from '../data/index.js'
import { NOTICE_TONE, RISK_TONE } from '../lib/status.js'
import { inr, inrShort, dateFull } from '../lib/format.js'
import { daysBetween } from '../lib/dates.js'

const NOW = '2026-09-10'

export default function Notices() {
  const [filter, setFilter] = useState('all')
  const [open, setOpen] = useState(null)

  const rows = NOTICES.filter((n) => {
    if (filter === 'all') return true
    if (filter === 'urgent') return daysBetween(NOW, n.replyBy) <= 10 && !['Closed', 'Dropped'].includes(n.status)
    if (filter === 'gst') return n.authority === 'GST'
    if (filter === 'it') return n.authority === 'Income Tax'
    if (filter === 'other') return !['GST', 'Income Tax'].includes(n.authority)
    return true
  })

  const totals = useMemo(() => ({
    open: NOTICES.filter((n) => !['Closed', 'Dropped'].includes(n.status)).length,
    exposure: NOTICES.reduce((s, n) => s + (n.amount || 0), 0),
    urgent: NOTICES.filter((n) => daysBetween(NOW, n.replyBy) <= 10).length,
    hearings: NOTICES.filter((n) => n.status === 'Hearing Fixed').length,
  }), [])

  return (
    <div className="space-y-5">
      <PageHead
        title="Notices & demands"
        sub="Every piece of departmental correspondence with a reply date attached"
        chips={[
          <Pill key="a" tone="bad" dot>{totals.open} open</Pill>,
          <Pill key="b" tone="warn">{totals.urgent} due within ten days</Pill>,
          <Pill key="c" tone="info">{totals.hearings} hearings fixed</Pill>,
          <Pill key="d" tone="mute">{inrShort(totals.exposure)} of exposure</Pill>,
        ]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Open notices" value={totals.open} icon={ScrollText} tone="bad" sub={NOTICES.length + ' on record'} />
        <Kpi label="Reply due within 10 days" value={totals.urgent} icon={CalendarClock} tone="warn" sub="misses become ex-parte orders" />
        <Kpi label="Money at stake" value={inrShort(totals.exposure)} icon={IndianRupee} tone="info" sub="tax, interest and penalty claimed" />
        <Kpi label="Hearings fixed" value={totals.hearings} icon={Gavel} tone="brand" sub="appearance required" />
      </div>

      <Note tone="bad" title="The one that cannot wait">
        Nandi Agro's CMP-05 reply is due tomorrow, and Sharada Medicals has a GSTR-3A default notice with nine days left
        that cannot be answered until the Tally backup arrives. Both need a call to the owner today, not an email.
      </Note>

      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-line flex flex-wrap items-center gap-3 justify-between">
          <Segmented
            value={filter} onChange={setFilter}
            options={[
              { value: 'all', label: 'All ' + NOTICES.length },
              { value: 'urgent', label: 'Urgent' },
              { value: 'gst', label: 'GST' },
              { value: 'it', label: 'Income tax' },
              { value: 'other', label: 'PF / other' },
            ]}
          />
          <p className="text-[12px] text-mute">Click a row for the working file</p>
        </div>
        <Table
          columns={[
            { key: 'client', label: 'Client', render: (n) => <ClientChip client={clientById[n.clientId]} /> },
            { key: 'auth', label: 'From', render: (n) => (
              <div className="space-y-1">
                <Pill tone={AUTHORITY_TONE[n.authority]}>{n.authority}</Pill>
                <p className="text-[12.5px] font-bold text-ink">{n.form}</p>
              </div>
            ) },
            { key: 'ref', label: 'Reference', render: (n) => (
              <div>
                <p className="num text-[11.5px] text-ink">{n.ref}</p>
                <p className="text-[11px] text-mute">received {dateFull(n.receivedOn)}</p>
              </div>
            ) },
            { key: 'period', label: 'Period', render: (n) => <span className="text-[12.5px] text-mute">{n.period}</span> },
            { key: 'summary', label: 'What they are asking', render: (n) => (
              <p className="text-[11.5px] text-mute max-w-[340px] whitespace-normal leading-snug">{n.summary}</p>
            ) },
            { key: 'amt', label: 'At stake', align: 'right', sortValue: (n) => n.amount || 0,
              render: (n) => n.amount ? <span className="num text-[12.5px] font-bold text-bad-600">{inr(n.amount)}</span> : <span className="text-faint">—</span> },
            { key: 'reply', label: 'Reply by', sortValue: (n) => n.replyBy, render: (n) => <DueCell due={n.replyBy} done={['Closed', 'Dropped', 'Replied'].includes(n.status)} /> },
            { key: 'status', label: 'Status', render: (n) => <Pill tone={NOTICE_TONE[n.status]} dot>{n.status}</Pill> },
            { key: 'risk', label: 'Risk', render: (n) => <Pill tone={RISK_TONE[n.risk]}>{n.risk}</Pill> },
            { key: 'who', label: 'Owner', render: (n) => <span className="text-[12px] text-mute">{staffById[n.assignee].short}</span> },
          ]}
          rows={rows}
          keyFn={(n) => n.id}
          initialSort={{ key: 'reply', dir: 'asc' }}
          pageSize={0}
          onRowClick={(n) => setOpen(n)}
        />
      </Card>

      <Drawer
        open={!!open}
        onClose={() => setOpen(null)}
        title={open ? open.form + ' — ' + clientById[open.clientId].name : ''}
        sub={open ? open.authority + ' · ' + open.ref : ''}
        width={620}
        footer={open && (
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="label">Reply due</p>
              <p className="text-[13px] font-bold text-ink">{dateFull(open.replyBy)} · {daysBetween(NOW, open.replyBy)} days left</p>
            </div>
            <Link to={'/clients/' + open.clientId} className="btn-primary">Open client file</Link>
          </div>
        )}
      >
        {open && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Authority" value={open.authority} />
              <Field label="Form" value={open.form} />
              <Field label="Reference" value={open.ref} mono />
              <Field label="Period" value={open.period} />
              <Field label="Received" value={dateFull(open.receivedOn)} />
              <Field label="Reply by" value={dateFull(open.replyBy)} tone="bad" />
              <Field label="Amount claimed" value={open.amount ? inr(open.amount) : 'No demand quantified'} tone={open.amount ? 'bad' : undefined} />
              <Field label="Handled by" value={staffById[open.assignee].name} />
            </div>

            <div>
              <p className="label mb-1.5">What the department says</p>
              <p className="text-[13px] text-ink leading-relaxed">{open.summary}</p>
            </div>

            <div className="rounded-xl bg-soft border border-line p-4">
              <p className="label mb-1.5">Our position</p>
              <p className="text-[13px] text-ink leading-relaxed">{open.ourPosition}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <MiniStat label="Status" value={open.status} tone={NOTICE_TONE[open.status]} />
              <MiniStat label="Assessed risk" value={open.risk} tone={RISK_TONE[open.risk]} />
            </div>

            <Note tone="info" title="Papers behind this reply">
              Everything referenced above is already in the client's CleanBook vault — month-wise reconciliations,
              invoice copies, challans and the correspondence trail. Nothing needs to be reconstructed.
            </Note>
          </div>
        )}
      </Drawer>
    </div>
  )
}
