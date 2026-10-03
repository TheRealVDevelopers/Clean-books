// "How many employees are there, when did they check in, when did they check
// out, what is the payout" — the question the owner actually asked for.

import { useMemo } from 'react'
import { Users, Clock, IndianRupee, CalendarCheck2, LogIn, LogOut } from 'lucide-react'
import { Card, CardHead, Pill, Table, Bar, Avatar } from '../../../components/ui.jsx'
import { Note } from '../../../components/bits.jsx'
import { PEOPLE, MONEY, attendanceSummary } from '../../../data/business.js'
import { LEDGER } from '../../../data/periods.js'
import { CURRENT_PERIOD } from '../../../data/practice.js'
import { inr, inrShort, num } from '../../../lib/format.js'

const STATE_TONE = { Present: 'ok', Late: 'warn', 'On trip': 'brand', Absent: 'bad', 'On leave': 'info' }

export default function People({ client: c, accent }) {
  const p = PEOPLE[c.id]
  const att = useMemo(() => attendanceSummary(c.id), [c.id])
  const m = MONEY[c.id]
  const payroll = LEDGER[c.id][CURRENT_PERIOD].payroll

  // Advances already taken come off what actually goes out this month.
  const overtime = Math.round(m.payrollMonth * 0.04)
  const advances = Math.round(p.rows.reduce((s, e) => s + e.advance, 0) * (p.total / p.rows.length))
  const statutory = payroll ? payroll.pf + payroll.esi + payroll.pt : 0
  const toPay = m.payrollMonth + overtime - advances + statutory

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <Tile label="On the roll" value={att.total} sub="permanent + contract" icon={Users} accent={accent} />
        <Tile label="On duty now" value={att.onDuty} sub="punched in, not out" icon={LogIn} accent={accent} />
        <Tile label="Late today" value={att.late} sub="after 10 am" icon={Clock} accent="#F59E0B" />
        <Tile label="Absent" value={att.absent} sub={att.leave + ' on approved leave'} icon={LogOut} accent="#EF4444" />
        <Tile label="Salary bill" value={inrShort(m.payrollMonth)} sub="for this month" icon={IndianRupee} accent={accent} />
        <Tile label="PF + ESI" value={payroll ? inrShort(payroll.pf + payroll.esi) : '—'} sub="due on the 15th" icon={CalendarCheck2} accent={accent} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        <Card className="xl:col-span-3 overflow-hidden">
          <CardHead
            title="Attendance today"
            sub={'Live from the ' + (c.vertical === 'transport' ? 'driver app and the gate register' : c.vertical === 'contractor' ? 'site attendance app' : 'biometric at the entrance')}
            icon={Clock}
            right={<Pill tone="ok" dot>Updated 2 minutes ago</Pill>}
          />
          <Table
            searchable
            searchKeys={[(e) => e.name, (e) => e.role]}
            columns={[
              { key: 'name', label: 'Name', render: (e) => (
                <div className="flex items-center gap-2.5">
                  <Avatar name={e.name} size={30} tone={e.state === 'Absent' ? 'mute' : 'brand'} />
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-ink truncate">{e.name}</p>
                    <p className="text-[11px] text-mute truncate">{e.role}</p>
                  </div>
                </div>
              ) },
              { key: 'state', label: 'Status', render: (e) => <Pill tone={STATE_TONE[e.state]} dot>{e.state}</Pill> },
              { key: 'in', label: 'Checked in', render: (e) => e.inAt
                ? <span className={'num text-[13px] font-semibold ' + (e.state === 'Late' ? 'text-warn-600' : 'text-ink')}>{e.inAt}</span>
                : <span className="text-faint">—</span> },
              { key: 'out', label: 'Checked out', render: (e) => e.outAt
                ? <span className="num text-[13px] text-mute">{e.outAt}</span>
                : e.state === 'On trip'
                  ? <span className="text-[12px] text-brand-600 font-semibold">On the road</span>
                  : e.onDutyNow
                    ? <span className="text-[12px] font-semibold" style={{ color: accent }}>Still in</span>
                    : <span className="text-faint">—</span> },
              { key: 'days', label: 'Days this month', align: 'right', sortValue: (e) => e.daysThisMonth, render: (e) => (
                <div className="w-[92px] ml-auto">
                  <Bar value={e.daysThisMonth} max={26} tone={e.daysThisMonth >= 24 ? 'ok' : e.daysThisMonth >= 20 ? 'warn' : 'bad'} height={6} />
                  <p className="text-[10.5px] text-faint mt-1 num text-right">{e.daysThisMonth} / 26</p>
                </div>
              ) },
              { key: 'ot', label: 'Overtime', align: 'right', sortValue: (e) => e.otHours,
                render: (e) => e.otHours ? <span className="num text-[12.5px]">{e.otHours} hrs</span> : <span className="text-faint">—</span> },
              { key: 'salary', label: 'Monthly salary', align: 'right', sortValue: (e) => e.salary,
                render: (e) => <span className="num text-[13px] font-semibold text-ink">{inr(e.salary)}</span> },
              { key: 'advance', label: 'Advance taken', align: 'right', sortValue: (e) => e.advance,
                render: (e) => e.advance ? <span className="num text-[12.5px] text-warn-600">{inr(e.advance)}</span> : <span className="text-faint">—</span> },
              { key: 'phone', label: 'Phone', render: (e) => <span className="num text-[11.5px] text-mute">{e.phone}</span> },
            ]}
            rows={p.rows}
            keyFn={(e) => e.id}
            pageSize={0}
          />
          {p.total > p.rows.length && (
            <div className="px-4 py-2.5 border-t border-line text-[12px] text-mute">
              Showing {p.rows.length} of {p.total} on the roll — the rest are on the same screen in the full app.
            </div>
          )}
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHead title="This month's payout" sub="Ready for your approval" icon={IndianRupee} />
            <div className="p-4 space-y-3">
              <Row label="Salaries and wages" value={m.payrollMonth} />
              <Row label="Overtime" value={overtime} />
              <Row label="Less: advances already taken" value={-advances} tone="bad" />
              {payroll && <Row label="PF (employer + employee)" value={payroll.pf} sub="paid to EPFO, not to staff" />}
              {payroll && payroll.esi > 0 && <Row label="ESI" value={payroll.esi} sub="paid to ESIC" />}
              {payroll && payroll.pt > 0 && <Row label="Professional tax" value={payroll.pt} sub="deducted and paid to the state" />}
              <div className="pt-3 border-t border-line flex items-end justify-between">
                <p className="text-[12.5px] font-bold text-ink">To pay this month</p>
                <p className="text-[19px] font-extrabold num" style={{ color: accent }}>{inr(toPay)}</p>
              </div>
              <button className="btn-ghost w-full justify-center">Approve and generate payslips</button>
            </div>
          </Card>

          <Note tone="ok" title="Where this goes next">
            Attendance, salary, PF and ESI numbers reach your CA from this screen. Nobody re-types a
            muster roll into a spreadsheet at month end.
          </Note>
        </div>
      </div>
    </div>
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
      <p className="text-[22px] font-extrabold num text-ink mt-1.5 leading-none">{value}</p>
      <p className="text-[11px] text-mute mt-1 truncate">{sub}</p>
    </div>
  )
}

function Row({ label, value, sub, tone }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[12.5px] text-mute">{label}</p>
        {sub && <p className="text-[11px] text-faint">{sub}</p>}
      </div>
      <p className={'num text-[13px] font-semibold shrink-0 ' + (tone === 'bad' ? 'text-bad-600' : 'text-ink')}>{inr(value)}</p>
    </div>
  )
}
