import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, CalendarDays, AlertOctagon, Landmark, CheckCheck, Download } from 'lucide-react'
import { Card, CardHead, PageHead, Kpi, Pill, Table, Segmented, MiniStat, Empty } from '../components/ui.jsx'
import { ClientChip, DueCell, StatusPill, Note } from '../components/bits.jsx'
import { OBLIGATIONS, KINDS, clientById, staffById, STAFF, isDone } from '../data/index.js'
import { calendarMonth, monthTotals } from '../lib/derive.js'
import { inr, inrShort, toCsv } from '../lib/format.js'
import { MONTHS_LONG, iso } from '../lib/dates.js'
import { TODAY } from '../data/practice.js'
import { useApp } from '../lib/store.jsx'

const NOW = iso(TODAY)

export default function Calendar() {
  const { statusOf, fileReturn, markReady, toast } = useApp()
  const [year, setYear] = useState(2026)
  const [month, setMonth] = useState(8) // September
  const [kind, setKind] = useState('all')
  const [staff, setStaff] = useState('all')
  const [pickedDay, setPickedDay] = useState(null)

  const cells = useMemo(() => calendarMonth(year, month), [year, month])
  const filtered = useMemo(() => cells.map((c) => {
    if (!c) return null
    const items = c.items.filter((o) => (kind === 'all' || o.kind === kind) && (staff === 'all' || o.assignee === staff))
    return { ...c, items, open: items.filter((o) => !isDone({ ...o, status: statusOf(o) })).length, amount: items.reduce((s, o) => s + (o.amount || 0), 0) }
  }), [cells, kind, staff, statusOf])

  const totals = monthTotals(filtered)
  const listRows = useMemo(() => {
    const all = filtered.filter(Boolean).flatMap((c) => c.items)
    const rows = pickedDay ? all.filter((o) => o.due === pickedDay) : all
    return [...rows].sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : 0))
  }, [filtered, pickedDay])

  const shift = (n) => {
    const t = year * 12 + month + n
    setYear(Math.floor(t / 12)); setMonth(t % 12); setPickedDay(null)
  }

  const exportCsv = () => {
    const csv = toCsv(listRows, [
      { label: 'Due', value: (o) => o.due },
      { label: 'Client', value: (o) => clientById[o.clientId].name },
      { label: 'Head', value: (o) => o.kind },
      { label: 'Form', value: (o) => o.form },
      { label: 'Period', value: (o) => o.periodLabel },
      { label: 'Amount', value: (o) => o.amount || '' },
      { label: 'Status', value: (o) => statusOf(o) },
      { label: 'Owner', value: (o) => staffById[o.assignee].name },
      { label: 'Note', value: (o) => o.note || '' },
    ])
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'compliance-calendar-' + year + '-' + String(month + 1).padStart(2, '0') + '.csv'
    a.click()
    URL.revokeObjectURL(a.href)
    toast('Calendar exported', listRows.length + ' obligations')
  }

  return (
    <div className="space-y-5">
      <PageHead
        title="Compliance calendar"
        sub="Every statutory date for every client, generated from their registration profile"
        chips={[
          <Pill key="a" tone="mute">{OBLIGATIONS.length} obligations tracked</Pill>,
          <Pill key="b" tone="bad" dot>{totals.overdue} overdue this month</Pill>,
          <Pill key="c" tone="warn">{totals.open} open</Pill>,
          <Pill key="d" tone="info">{inrShort(totals.amount)} of payments due</Pill>,
        ]}
        actions={<button className="btn-ghost" onClick={exportCsv}><Download size={14} /> Export month</button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Due this month" value={totals.total} icon={CalendarDays} tone="brand" sub={MONTHS_LONG[month] + ' ' + year} />
        <Kpi label="Still open" value={totals.open} icon={AlertOctagon} tone="warn" sub={totals.overdue + ' past their date'} />
        <Kpi label="Payments due" value={inrShort(totals.amount)} icon={Landmark} tone="info" sub="tax, TDS, PF, ESI, PT" />
        <Kpi label="Completed" value={totals.total - totals.open} icon={CheckCheck} tone="ok" sub="filed or not applicable" />
      </div>

      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-line flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            <button className="btn-quiet !h-8 !w-8 !px-0 justify-center" onClick={() => shift(-1)}><ChevronLeft size={16} /></button>
            <p className="text-[14px] font-extrabold text-ink w-[150px] text-center">{MONTHS_LONG[month]} {year}</p>
            <button className="btn-quiet !h-8 !w-8 !px-0 justify-center" onClick={() => shift(1)}><ChevronRight size={16} /></button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Segmented value={kind} onChange={(v) => { setKind(v); setPickedDay(null) }}
              options={[{ value: 'all', label: 'All heads' }, ...KINDS.map((k) => ({ value: k, label: k }))]} />
            <Segmented value={staff} onChange={(v) => { setStaff(v); setPickedDay(null) }}
              options={[{ value: 'all', label: 'Everyone' }, ...STAFF.map((s) => ({ value: s.id, label: s.short }))]} />
          </div>
        </div>

        <div className="p-3 lg:p-4">
          <div className="grid grid-cols-7 gap-1.5 mb-1.5">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <p key={d} className="label text-center">{d}</p>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {filtered.map((c, i) => {
              if (!c) return <div key={'e' + i} />
              const hasOverdue = c.items.some((o) => !isDone({ ...o, status: statusOf(o) }) && o.due < NOW)
              const picked = pickedDay === c.date
              return (
                <button
                  key={c.date}
                  onClick={() => setPickedDay(picked ? null : c.date)}
                  className={'text-left rounded-xl border p-2 min-h-[92px] transition-colors ' +
                    (picked ? 'border-brand-500 bg-brand-50/60 ring-2 ring-brand-500/15 ' :
                      c.isToday ? 'border-brand-400 bg-brand-50/40 ' :
                        hasOverdue ? 'border-bad-500/40 bg-bad-50/40 ' :
                          c.items.length ? 'border-line bg-card hover:border-brand-300 ' : 'border-line/60 bg-soft/40 ')}
                >
                  <div className="flex items-center justify-between">
                    <span className={'num text-[12px] font-bold ' + (c.isToday ? 'text-brand-700' : c.isPast ? 'text-faint' : 'text-ink')}>
                      {c.day}
                    </span>
                    {c.isToday && <span className="chip bg-brand-600 text-white">today</span>}
                  </div>
                  {c.items.length > 0 && (
                    <div className="mt-1.5 space-y-1">
                      {[...new Set(c.items.map((o) => o.form))].slice(0, 3).map((f) => {
                        const same = c.items.filter((o) => o.form === f)
                        const openN = same.filter((o) => !isDone({ ...o, status: statusOf(o) })).length
                        return (
                          <div key={f} className={'text-[10.5px] font-semibold px-1.5 py-0.5 rounded truncate ' +
                            (openN === 0 ? 'bg-ok-50 text-ok-700' : c.isPast ? 'bg-bad-50 text-bad-700' : 'bg-soft text-mute')}>
                            {f} · {same.length}
                          </div>
                        )
                      })}
                      {[...new Set(c.items.map((o) => o.form))].length > 3 && (
                        <p className="text-[10px] text-faint px-1.5">+{[...new Set(c.items.map((o) => o.form))].length - 3} more</p>
                      )}
                    </div>
                  )}
                  {c.amount > 0 && (
                    <p className="text-[10px] text-mute num mt-1 px-1.5">{inrShort(c.amount)}</p>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <CardHead
          title={pickedDay ? 'Due on ' + pickedDay.slice(8, 10) + ' ' + MONTHS_LONG[month].slice(0, 3) : 'Everything due in ' + MONTHS_LONG[month]}
          sub={pickedDay ? 'Click the date again to see the whole month' : 'Click any date in the grid to narrow this list'}
          icon={CalendarDays}
          right={<Pill tone="mute">{listRows.length} items</Pill>}
        />
        {listRows.length ? (
          <Table
            columns={[
              { key: 'due', label: 'Due', sortValue: (o) => o.due, render: (o) => <DueCell due={o.due} done={isDone({ ...o, status: statusOf(o) })} /> },
              { key: 'client', label: 'Client', render: (o) => <ClientChip client={clientById[o.clientId]} /> },
              { key: 'kind', label: 'Head', render: (o) => <Pill tone="mute">{o.kind}</Pill> },
              { key: 'form', label: 'Obligation', render: (o) => (
                <div className="min-w-0">
                  <p className="text-[12.5px] font-bold text-ink">{o.form}</p>
                  <p className="text-[11px] text-mute truncate max-w-[280px]">{o.periodLabel} · {o.formLabel}</p>
                </div>
              ) },
              { key: 'amt', label: 'Amount', align: 'right', sortValue: (o) => o.amount || 0,
                render: (o) => o.amount ? <span className="num text-[12.5px] font-semibold">{inr(o.amount)}</span> : <span className="text-faint">—</span> },
              { key: 'status', label: 'Status', render: (o) => <StatusPill status={statusOf(o)} /> },
              { key: 'who', label: 'Owner', render: (o) => <span className="text-[12px] text-mute">{staffById[o.assignee].short}</span> },
              { key: 'act', label: '', align: 'right', render: (o) => {
                const s = statusOf(o)
                const c = clientById[o.clientId]
                if (['Filed', 'Filed Late', 'Not Applicable'].includes(s)) return <span className="text-[11.5px] text-mute">—</span>
                if (s === 'Ready to File') return <button className="btn-primary !h-7 !px-2.5 text-[12px]" onClick={() => fileReturn(o, c.short)}>File</button>
                return <button className="btn-ghost !h-7 !px-2.5 text-[12px]" onClick={() => markReady(o, c.short)}>Mark ready</button>
              } },
            ]}
            rows={listRows}
            keyFn={(o) => o.id}
            initialSort={{ key: 'due', dir: 'asc' }}
            pageSize={16}
          />
        ) : <Empty label="Nothing on this date" sub="Try another day, or clear the filters" />}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Note tone="info" title="The dates are not typed in">
          Each client's registration profile — regular, QRMP, composition, PF, ESI, PT, company or firm — decides which
          forms apply and when. Change the scheme on a client and this calendar rewrites itself.
        </Note>
        <Note tone="warn" title="September is the heavy month">
          GSTR-1 on the 11th, advance tax on the 15th, PF and ESI on the 15th, PT on the 20th, GSTR-3B on the 20th,
          QRMP challan on the 25th, and tax audit reports plus DIR-3 KYC on the 30th.
        </Note>
        <Note tone="bad" title="What is already late">
          Both overdue items are TDS challans for clients whose payout sheets never arrived. Interest under section
          201(1A) runs at 1.5% a month from the date of deduction.
        </Note>
      </div>
    </div>
  )
}
