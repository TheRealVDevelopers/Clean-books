// The compliance corner of the owner's app — and the whole reason CleanBook
// exists. What the CA needs, what has been filed, what has to be paid.
//
// An upload here writes to the same session state the practice dashboard reads,
// so the moment the owner sends a file the auditor's chase list gets shorter.

import { useMemo } from 'react'
import {
  ShieldCheck, Upload, Phone, Mail, CheckCircle2, AlertTriangle, Landmark, FileCheck2, MessageSquareOff,
} from 'lucide-react'
import { Card, CardHead, Pill, Table, Bar, Field } from '../../../components/ui.jsx'
import { Note, AutoTag } from '../../../components/bits.jsx'
import { isDone } from '../../../lib/obligations.js'
import { inr, inrShort, dateFull } from '../../../lib/format.js'
import { daysBetween } from '../../../lib/dates.js'
import { useApp } from '../../../lib/store.jsx'
import { useRepo } from '../../../repo/index.js'

const NOW = '2026-09-10'

// The same status, said the way an owner would say it.
const OWNER_WORDS = {
  'Filed': ['Filed for you', 'ok'],
  'Filed Late': ['Filed — late', 'warn'],
  'Ready to File': ['With your CA, ready to go', 'brand'],
  'In Progress': ['Your CA is working on it', 'info'],
  'Awaiting Data': ['Waiting on you', 'bad'],
  'Blocked': ['Waiting on you', 'bad'],
  'Not Started': ['Not started yet', 'mute'],
  'Not Applicable': ['Does not apply to you', 'mute'],
}

export default function MyCa({ client: c, accent }) {
  const { docStatusOf, docGotOf, uploadDoc, uploadedNow, statusOf } = useApp()
  const { FIRM, staffById, DOC_REQUESTS, forClient, LEDGER, CURRENT_PERIOD, MONEY } = useRepo()
  const staff = staffById[c.staffId]
  const row = LEDGER[c.id][CURRENT_PERIOD]
  const m = MONEY[c.id]

  const docs = DOC_REQUESTS.filter((d) => d.clientId === c.id)
  const pending = docs.filter((d) => docStatusOf(d) !== 'Received')

  const obligations = useMemo(
    () => forClient(c.id)
      .filter((o) => o.kind !== 'Internal')
      .sort((a, b) => (a.due < b.due ? -1 : 1))
      .slice(0, 14),
    [forClient, c.id],
  )
  const payable = obligations.filter((o) => !isDone({ ...o, status: statusOf(o) }) && o.amount)

  return (
    <div className="space-y-5">
      {/* ------------------------------------------------- what the CA wants */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2 overflow-hidden">
          <CardHead
            title={pending.length ? 'Your CA is waiting for ' + pending.length + ' thing' + (pending.length > 1 ? 's' : '') : 'Your CA has everything'}
            sub="Send it from here. No WhatsApp, no email, no pen drive."
            icon={Upload}
            right={pending.length ? <Pill tone="bad" dot>{pending.length} pending</Pill> : <Pill tone="ok" dot>All clear</Pill>}
          />
          <div className="divide-y divide-line">
            {docs.map((d) => {
              const st = docStatusOf(d)
              const got = docGotOf(d)
              const done = st === 'Received'
              return (
                <div key={d.id} className="px-4 py-3.5 flex flex-wrap items-start gap-3">
                  <span className={'w-8 h-8 rounded-lg grid place-items-center shrink-0 ' +
                    (done ? 'bg-ok-50 text-ok-600' : st === 'Overdue' ? 'bg-bad-50 text-bad-600' : 'bg-warn-50 text-warn-600')}>
                    {done ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-bold text-ink leading-snug">{d.what}</p>
                    <p className="text-[11.5px] text-mute mt-1">
                      For {d.periodLabel} · asked by {staffById[d.assignee].short} on {dateFull(d.requested)}
                      {d.blocks ? ' · holds up ' + d.blocks : ''}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-[120px]">
                        <Bar value={got} max={d.need} tone={got >= d.need ? 'ok' : got ? 'warn' : 'bad'} height={5} />
                      </div>
                      <span className="text-[11px] text-faint num">{got} of {d.need} sent</span>
                      {uploadedNow(d) && <AutoTag>Just sent</AutoTag>}
                    </div>
                  </div>
                  <div className="shrink-0">
                    {done
                      ? <span className="text-[12px] font-bold text-ok-600">Sent</span>
                      : (
                        <button
                          onClick={() => uploadDoc(d)}
                          className="btn text-white"
                          style={{ background: accent }}
                        >
                          <Upload size={13} /> Send {d.need - got > 1 ? d.need - got + ' files' : 'file'}
                        </button>
                      )}
                  </div>
                </div>
              )
            })}
            {!docs.length && (
              <div className="px-4 py-10 text-center">
                <CheckCircle2 size={24} className="text-ok-500 mx-auto mb-2" />
                <p className="text-[13px] font-semibold text-mute">Nothing has ever been chased on this account.</p>
                <p className="text-[12px] text-faint mt-1">Everything your CA needs already arrives from this app.</p>
              </div>
            )}
          </div>
          {pending.length > 0 && (
            <div className="px-4 py-3 border-t border-line bg-soft/50 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[12px] text-mute">Sending these clears your CA's list straight away — you will see it change on their screen.</p>
              <button onClick={() => pending.forEach(uploadDoc)} className="btn text-white" style={{ background: accent }}>
                <Upload size={13} /> Send everything pending
              </button>
            </div>
          )}
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHead title="Your accountant" sub={FIRM.short} icon={ShieldCheck} />
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-full grid place-items-center text-[13px] font-extrabold text-white shrink-0" style={{ background: accent }}>
                  {staff.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                </span>
                <div className="min-w-0">
                  <p className="text-[13.5px] font-bold text-ink truncate">{staff.name}</p>
                  <p className="text-[11.5px] text-mute truncate">{staff.title}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <a href={'tel:' + staff.phone.replace(/\s/g, '')} className="btn-ghost justify-center"><Phone size={13} /> {staff.phone}</a>
                <a href={'mailto:' + staff.email} className="btn-ghost justify-center"><Mail size={13} /> Email {staff.short}</a>
              </div>
              <div className="pt-3 border-t border-line">
                <Field label="Firm" value={FIRM.name} />
                <div className="grid grid-cols-2 gap-3 mt-2.5">
                  <Field label="Principal" value={FIRM.principal} />
                  <Field label="FRN" value={FIRM.frn} mono />
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHead title="What reaches them by itself" icon={MessageSquareOff} />
            <div className="p-4 space-y-2.5">
              {[
                ['Sales invoices', row.readiness.salesDocs.captured + ' of ' + row.readiness.salesDocs.expected],
                ['Purchase bills', row.readiness.purchDocs.captured + ' of ' + row.readiness.purchDocs.expected],
                ['Bank statement', row.readiness.bankSyncedTill ? 'synced to ' + dateFull(row.readiness.bankSyncedTill) : '—'],
                ['Payroll and attendance', 'sent on the 1st'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-3">
                  <span className="text-[12.5px] text-mute">{k}</span>
                  <span className="text-[12.5px] font-semibold text-ink num">{v}</span>
                </div>
              ))}
              <div className="pt-3 border-t border-line">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] font-bold text-ink">Ready for this month's return</span>
                  <span className="num text-[13px] font-extrabold" style={{ color: accent }}>{row.readiness.pct}%</span>
                </div>
                <Bar value={row.readiness.pct} tone={row.readiness.pct >= 95 ? 'ok' : row.readiness.pct >= 80 ? 'brand' : 'warn'} height={7} />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ------------------------------------------------------- what to pay */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card>
          <CardHead title="What you have to pay" sub="And the date it stops being optional" icon={Landmark} />
          <div className="p-4 space-y-3">
            {payable.slice(0, 6).map((o) => {
              const d = daysBetween(NOW, o.due)
              return (
                <div key={o.id} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-bold text-ink truncate">{o.form}</p>
                    <p className="text-[11px] text-mute">{o.periodLabel} · {o.due.slice(8, 10)}/{o.due.slice(5, 7)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="num text-[13px] font-extrabold text-ink">{inr(o.amount)}</p>
                    <Pill tone={d < 0 ? 'bad' : d <= 5 ? 'warn' : 'mute'}>{d < 0 ? -d + 'd late' : 'in ' + d + 'd'}</Pill>
                  </div>
                </div>
              )
            })}
            <div className="pt-3 border-t border-line flex items-end justify-between">
              <p className="text-[12.5px] font-bold text-ink">Total to keep aside</p>
              <p className="text-[19px] font-extrabold num" style={{ color: accent }}>
                {inr(payable.reduce((s, o) => s + o.amount, 0))}
              </p>
            </div>
            <p className="text-[11.5px] text-mute leading-relaxed">
              You are holding {inrShort(m.cashInHand + m.bank)} between cash and bank right now.
            </p>
          </div>
        </Card>

        <Card className="xl:col-span-2 overflow-hidden">
          <CardHead title="Your returns" sub="Everything your CA files for you, and where each one stands" icon={FileCheck2} />
          <Table
            columns={[
              { key: 'form', label: 'Return', render: (o) => (
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-ink">{o.form}</p>
                  <p className="text-[11px] text-mute truncate max-w-[240px]">{o.formLabel}</p>
                </div>
              ) },
              { key: 'period', label: 'For', render: (o) => <span className="text-[12.5px] text-mute">{o.periodLabel}</span> },
              { key: 'due', label: 'Due', sortValue: (o) => o.due, render: (o) => {
                const done = isDone({ ...o, status: statusOf(o) })
                const d = daysBetween(NOW, o.due)
                return (
                  <div className="flex items-center gap-2">
                    <span className="num text-[12.5px] text-mute">{o.due.slice(8, 10)}/{o.due.slice(5, 7)}</span>
                    {!done && <Pill tone={d < 0 ? 'bad' : d <= 5 ? 'warn' : 'mute'}>{d < 0 ? -d + 'd late' : 'in ' + d + 'd'}</Pill>}
                  </div>
                )
              } },
              { key: 'amount', label: 'To pay', align: 'right', sortValue: (o) => o.amount || 0,
                render: (o) => o.amount ? <span className="num text-[13px] font-semibold text-ink">{inr(o.amount)}</span> : <span className="text-faint">—</span> },
              { key: 'state', label: 'Where it stands', render: (o) => {
                const [word, tone] = OWNER_WORDS[statusOf(o)] || ['—', 'mute']
                return <Pill tone={tone} dot={tone !== 'mute'}>{word}</Pill>
              } },
              { key: 'arn', label: 'Acknowledgement', render: (o) => o.arn
                ? <span className="num text-[11px] text-mute">{o.arn}</span>
                : <span className="text-faint">—</span> },
            ]}
            rows={obligations}
            keyFn={(o) => o.id}
            pageSize={0}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Note tone="ok" title="Why this page is short">
          Your CA can already see your sales, purchases, bank and payroll. The only things that ever
          appear here are the papers that live outside the business — a vendor's bill, a bank advice,
          a signed acknowledgement.
        </Note>
        <Note tone="info" title="You are not going to be surprised by a notice">
          Every deadline above is watched for you. If a return is at risk, your CA sees it on their
          screen before the date, not after the department writes to you.
        </Note>
      </div>
    </div>
  )
}
