import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { UsersRound, Clock, AlertOctagon, Phone, Mail, CheckCheck } from 'lucide-react'
import { Card, CardHead, PageHead, Kpi, Pill, Table, MiniStat, Bar, Avatar, Segmented } from '../components/ui.jsx'
import { ClientChip, DueCell, StatusPill, Note, Readiness } from '../components/bits.jsx'
import { STAFF, staffById, clientById, CURRENT_PERIOD, LEDGER, isDone } from '../data/index.js'
import { staffWorkload } from '../lib/derive.js'
import { openObligations } from '../data/compliance.js'
import { inr, inrShort, num } from '../lib/format.js'
import { useApp } from '../lib/store.jsx'

export default function Team() {
  const { statusOf, markReady, fileReturn } = useApp()
  const [pick, setPick] = useState('all')

  const load = useMemo(() => staffWorkload(), [])
  const open = useMemo(() => openObligations(), [])
  const rows = pick === 'all' ? open : open.filter((o) => o.assignee === pick)

  const totalHours = load.reduce((s, x) => s + x.weekHours, 0)
  const capacity = STAFF.reduce((s, x) => s + x.capacity, 0)

  return (
    <div className="space-y-5">
      <PageHead
        title="Team & workload"
        sub="Who is carrying what this week, and where the practice is going to run out of hours"
        chips={[
          <Pill key="a" tone="mute">{STAFF.length} people</Pill>,
          <Pill key="b" tone="brand">{open.length} open obligations</Pill>,
          <Pill key="c" tone={totalHours > capacity ? 'bad' : 'ok'} dot>{totalHours}h of work against {capacity}h of capacity this week</Pill>,
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {load.map((x) => (
          <div key={x.staff.id} className="card p-4">
            <div className="flex items-start gap-3">
              <Avatar name={x.staff.name} size={40} tone={x.staff.avatarTone} />
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-extrabold text-ink truncate">{x.staff.name}</p>
                <p className="text-[11.5px] text-mute truncate">{x.staff.title}</p>
              </div>
              {x.overdue > 0 && <Pill tone="bad">{x.overdue} late</Pill>}
            </div>

            <div className="mt-3.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11.5px] text-mute">This week</span>
                <span className="num text-[12px] font-bold text-ink">{x.weekHours}h / {x.staff.capacity}h</span>
              </div>
              <Bar value={x.load} tone={x.load > 100 ? 'bad' : x.load > 80 ? 'warn' : 'ok'} height={7} />
              <p className={'text-[11px] mt-1 font-semibold ' + (x.load > 100 ? 'text-bad-600' : x.load > 80 ? 'text-warn-600' : 'text-ok-600')}>
                {x.load}% loaded{x.load > 100 ? ' — over capacity' : ''}
              </p>
            </div>

            <div className="mt-3 pt-3 border-t border-line grid grid-cols-2 gap-3">
              <MiniStat label="Open items" value={x.open} />
              <MiniStat label="Total hours" value={x.hours + 'h'} />
            </div>

            <div className="mt-3 pt-3 border-t border-line">
              <p className="label mb-1.5">Clients ({x.clients.length})</p>
              <div className="flex flex-wrap gap-1">
                {x.clients.map((c) => (
                  <Link key={c.id} to={'/clients/' + c.id} className="chip border bg-soft text-mute border-line hover:text-ink">
                    {c.short}
                  </Link>
                ))}
                {!x.clients.length && <span className="text-[11.5px] text-faint">Reviews across the whole book</span>}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-line flex items-center gap-3 text-[11px] text-mute">
              <span className="flex items-center gap-1"><Phone size={11} /> <span className="num">{x.staff.phone}</span></span>
            </div>
          </div>
        ))}
      </div>

      <Note tone="warn" title="September is going to hurt">
        Divya is at {load.find((x) => x.staff.id === 'ST-2')?.load}% of capacity this week and the principal has four
        tax audit reports to sign by the 30th. The two clients generating the most manual work — Sharada Medicals and
        Nandi Agro — are also the two with no software. Converting either one buys back real hours.
      </Note>

      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-line flex flex-wrap items-center gap-3 justify-between">
          <Segmented
            value={pick} onChange={setPick}
            options={[{ value: 'all', label: 'Everyone ' + open.length }, ...STAFF.map((s) => ({
              value: s.id, label: s.short + ' ' + open.filter((o) => o.assignee === s.id).length,
            }))]}
          />
          <p className="text-[12px] text-mute">Open obligations only — filed items are hidden</p>
        </div>
        <Table
          searchable
          searchKeys={[(o) => clientById[o.clientId].name, (o) => o.form]}
          columns={[
            { key: 'due', label: 'Due', sortValue: (o) => o.due, render: (o) => <DueCell due={o.due} done={isDone({ ...o, status: statusOf(o) })} /> },
            { key: 'client', label: 'Client', render: (o) => <ClientChip client={clientById[o.clientId]} /> },
            { key: 'kind', label: 'Head', render: (o) => <Pill tone="mute">{o.kind}</Pill> },
            { key: 'form', label: 'Obligation', render: (o) => (
              <div className="min-w-0">
                <p className="text-[12.5px] font-bold text-ink">{o.form}</p>
                <p className="text-[11px] text-mute truncate max-w-[260px]">{o.periodLabel} · {o.formLabel}</p>
              </div>
            ) },
            { key: 'hours', label: 'Effort', align: 'right', sortValue: (o) => o.hours, render: (o) => <span className="num text-[12.5px]">{o.hours}h</span> },
            { key: 'amt', label: 'Amount', align: 'right', sortValue: (o) => o.amount || 0,
              render: (o) => o.amount ? <span className="num text-[12.5px]">{inr(o.amount)}</span> : <span className="text-faint">—</span> },
            { key: 'status', label: 'Status', render: (o) => <StatusPill status={statusOf(o)} /> },
            { key: 'who', label: 'Owner', render: (o) => (
              <div className="flex items-center gap-2">
                <Avatar name={staffById[o.assignee].name} size={22} tone={staffById[o.assignee].avatarTone} />
                <span className="text-[12px] text-mute">{staffById[o.assignee].short}</span>
              </div>
            ) },
            { key: 'act', label: '', align: 'right', render: (o) => statusOf(o) === 'Ready to File'
              ? <button className="btn-primary !h-7 !px-2.5 text-[12px]" onClick={() => fileReturn(o, clientById[o.clientId].short)}>File</button>
              : <button className="btn-ghost !h-7 !px-2.5 text-[12px]" onClick={() => markReady(o, clientById[o.clientId].short)}>Mark ready</button> },
          ]}
          rows={rows}
          keyFn={(o) => o.id}
          initialSort={{ key: 'due', dir: 'asc' }}
          pageSize={16}
        />
      </Card>

      <Card className="overflow-hidden">
        <CardHead title="Client assignment" sub="Who owns which account, and how clean that account's data is" icon={UsersRound} />
        <Table
          columns={[
            { key: 'staff', label: 'Handled by', render: (c) => (
              <div className="flex items-center gap-2">
                <Avatar name={staffById[c.staffId].name} size={26} tone={staffById[c.staffId].avatarTone} />
                <span className="text-[12.5px] font-semibold text-ink">{staffById[c.staffId].short}</span>
              </div>
            ) },
            { key: 'client', label: 'Client', render: (c) => <ClientChip client={c} /> },
            { key: 'turn', label: 'Turnover', align: 'right', sortValue: (c) => c.annual, render: (c) => <span className="num text-[12.5px]">{inrShort(c.annual)}</span> },
            { key: 'ready', label: 'Data readiness', sortValue: (c) => LEDGER[c.id][CURRENT_PERIOD].readiness.pct,
              render: (c) => <Readiness pct={LEDGER[c.id][CURRENT_PERIOD].readiness.pct} width={100} /> },
            { key: 'items', label: 'Open items', align: 'right', sortValue: (c) => open.filter((o) => o.clientId === c.id).length,
              render: (c) => <span className="num text-[12.5px] font-bold">{open.filter((o) => o.clientId === c.id).length}</span> },
            { key: 'hours', label: 'Hours booked', align: 'right',
              sortValue: (c) => open.filter((o) => o.clientId === c.id).reduce((s, o) => s + o.hours, 0),
              render: (c) => <span className="num text-[12.5px]">{Math.round(open.filter((o) => o.clientId === c.id).reduce((s, o) => s + o.hours, 0))}h</span> },
            { key: 'mode', label: 'Data source', render: (c) => c.books.mode === 'CleanBook Auto'
              ? <Pill tone="ok" dot>Automatic</Pill>
              : <Pill tone="warn" dot>{c.books.mode}</Pill> },
          ]}
          rows={[...clientList()]}
          keyFn={(c) => c.id}
          initialSort={{ key: 'hours', dir: 'desc' }}
          pageSize={0}
        />
      </Card>
    </div>
  )
}

function clientList() {
  return Object.values(clientById)
}
