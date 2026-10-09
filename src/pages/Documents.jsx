import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FolderOpen, Send, Clock, Sparkles, MessageSquareOff, AlertOctagon, Zap } from 'lucide-react'
import { Card, CardHead, PageHead, Kpi, Pill, Table, Tabs, MiniStat, Bar, Empty } from '../components/ui.jsx'
import { ClientChip, Readiness, Note, AutoTag, SectionTitle } from '../components/bits.jsx'
import { DOC_STATUS_TONE } from '../lib/status.js'
import { inr, inrShort, num, pct, dateFull } from '../lib/format.js'
import { pLabel } from '../lib/dates.js'
import { useApp } from '../lib/store.jsx'
import { useRepo } from '../repo/index.js'

export default function Documents() {
  const { remind, remindedOf, toast, docStatusOf, docGotOf, uploadedNow } = useApp()
  const { DOC_REQUESTS, CHASE_STATS, CLIENTS, clientById, staffById, CURRENT_PERIOD, LEDGER, AUTOMATION } = useRepo()
  const [tab, setTab] = useState('open')

  const rows = useMemo(() => {
    if (tab === 'open') return DOC_REQUESTS.filter((d) => docStatusOf(d) !== 'Received')
    if (tab === 'overdue') return DOC_REQUESTS.filter((d) => docStatusOf(d) === 'Overdue')
    if (tab === 'app') return DOC_REQUESTS.filter((d) => d.onApp)
    if (tab === 'manual') return DOC_REQUESTS.filter((d) => !d.onApp)
    return DOC_REQUESTS
  }, [DOC_REQUESTS, tab, docStatusOf])

  const open = DOC_REQUESTS.filter((d) => docStatusOf(d) !== 'Received')
  const blockedValue = open.reduce((s, d) => s + (d.value || 0), 0)

  const remindAll = () => {
    open.forEach((d) => remind(d, clientById[d.clientId].short, d.onApp))
    toast('Requests sent', open.length + ' document requests pushed out', 'brand')
  }

  return (
    <div className="space-y-5">
      <PageHead
        title="Data & documents"
        sub="What is still missing, who was asked, and what it is holding up"
        chips={[
          <Pill key="a" tone="bad" dot>{open.length} still open</Pill>,
          <Pill key="b" tone="warn">{DOC_REQUESTS.filter((d) => docStatusOf(d) === 'Overdue').length} overdue</Pill>,
          <Pill key="c" tone="ok">{DOC_REQUESTS.filter((d) => d.onApp).length} requested through a client app</Pill>,
        ]}
        actions={<button className="btn-primary" onClick={remindAll}><Send size={14} /> Remind everyone</button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        <Kpi label="Open requests" value={open.length} icon={FolderOpen} tone="warn" sub={DOC_REQUESTS.length + ' raised this cycle'} />
        <Kpi label="Value held up" value={inrShort(blockedValue)} icon={AlertOctagon} tone="bad" sub="turnover and credit waiting on paper" />
        <Kpi label="Captured automatically" value={pct((AUTOMATION.autoCaptured / AUTOMATION.totalDocs) * 100, 0)} icon={Sparkles} tone="ok"
          sub={num(AUTOMATION.autoCaptured) + ' of ' + num(AUTOMATION.totalDocs) + ' documents'} />
        <Kpi label="Hours saved" value={AUTOMATION.hoursSaved} icon={Clock} tone="ok" sub="this month, across the book" />
        <Kpi label="Chase messages avoided" value={AUTOMATION.chaseMessagesAvoided} icon={MessageSquareOff} tone="brand" sub="no WhatsApp reminders needed" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2 overflow-hidden">
          <div className="px-4 py-3 border-b border-line">
            <Tabs
              active={tab} onChange={setTab}
              tabs={[
                { id: 'open', label: 'Open', count: open.length },
                { id: 'overdue', label: 'Overdue', count: DOC_REQUESTS.filter((d) => docStatusOf(d) === 'Overdue').length },
                { id: 'app', label: 'Through their app', count: DOC_REQUESTS.filter((d) => d.onApp).length },
                { id: 'manual', label: 'WhatsApp / email', count: DOC_REQUESTS.filter((d) => !d.onApp).length },
                { id: 'all', label: 'Everything', count: DOC_REQUESTS.length },
              ]}
            />
          </div>
          <Table
            searchable
            searchKeys={[(d) => d.what, (d) => clientById[d.clientId].name]}
            columns={[
              { key: 'client', label: 'Client', render: (d) => <ClientChip client={clientById[d.clientId]} /> },
              { key: 'what', label: 'What was asked for', render: (d) => (
                <div className="min-w-0">
                  <p className="text-[12.5px] font-bold text-ink whitespace-normal max-w-[300px] leading-snug">{d.what}</p>
                  <p className="text-[11px] text-mute mt-0.5">{d.periodLabel} · asked {dateFull(d.requested)} · {staffById[d.assignee].short}</p>
                </div>
              ) },
              { key: 'chan', label: 'Asked through', render: (d) => d.onApp
                ? <AutoTag>Their own app</AutoTag>
                : <Pill tone={d.channel === 'WhatsApp' ? 'warn' : 'bad'}>{d.channel}</Pill> },
              { key: 'prog', label: 'In hand', sortValue: (d) => docGotOf(d) / d.need, render: (d) => {
                const got = docGotOf(d)
                return (
                  <div className="w-[110px]">
                    <Bar value={got} max={d.need} tone={got === d.need ? 'ok' : got ? 'warn' : 'bad'} height={6} />
                    <p className="text-[10.5px] text-faint mt-1 num">
                      {got} of {d.need}{uploadedNow(d) ? ' · just arrived' : ''}
                    </p>
                  </div>
                )
              } },
              { key: 'age', label: 'Waiting', align: 'right', sortValue: (d) => d.ageDays,
                render: (d) => <span className={'num text-[12.5px] font-bold ' + (d.ageDays > 7 ? 'text-bad-600' : d.ageDays > 3 ? 'text-warn-600' : 'text-mute')}>{d.ageDays}d</span> },
              { key: 'value', label: 'Value', align: 'right', sortValue: (d) => d.value || 0,
                render: (d) => d.value ? <span className="num text-[12.5px]">{inrShort(d.value)}</span> : <span className="text-faint">—</span> },
              { key: 'blocks', label: 'Holding up', render: (d) => d.blocks ? <Pill tone="bad">{d.blocks}</Pill> : <span className="text-faint">—</span> },
              { key: 'status', label: 'Status', render: (d) => (
                <Pill tone={DOC_STATUS_TONE[docStatusOf(d)]} dot>{docStatusOf(d)}</Pill>
              ) },
              { key: 'act', label: '', align: 'right', render: (d) => docStatusOf(d) === 'Received'
                ? <span className="text-[11.5px] font-bold text-ok-600">In</span>
                : remindedOf(d)
                  ? <span className="text-[11.5px] text-brand-600 font-semibold">Sent</span>
                  : <button className="btn-ghost !h-7 !px-2.5 text-[12px]" onClick={() => remind(d, clientById[d.clientId].short, d.onApp)}>
                      <Send size={12} /> Remind
                    </button> },
            ]}
            rows={rows}
            keyFn={(d) => d.id}
            initialSort={{ key: 'age', dir: 'desc' }}
            pageSize={0}
            empty="Nothing in this view"
          />
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHead title="How long a request takes to come back" sub="By the channel it was sent through" icon={Zap} />
            <div className="p-4 space-y-3">
              {CHASE_STATS.map((s) => (
                <div key={s.channel} className="rounded-lg border border-line p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[12.5px] font-bold text-ink">{s.channel}</p>
                    <Pill tone={s.tone}>{s.closed} closed</Pill>
                  </div>
                  <div className="flex items-end justify-between mt-2">
                    <div>
                      <p className="text-[20px] font-extrabold num leading-none text-ink">{s.avgHours}h</p>
                      <p className="text-[11px] text-mute mt-0.5">average turnaround</p>
                    </div>
                    <p className="text-[11.5px] text-mute num">{s.requests} requests</p>
                  </div>
                  <div className="mt-2">
                    <Bar value={200 - s.avgHours} max={200} tone={s.tone} height={5} />
                  </div>
                </div>
              ))}
              <Note tone="ok" title="Nine hours against four days">
                A request that appears inside the owner's own application gets answered the same working day. The same
                request on WhatsApp takes four days and often needs three reminders.
              </Note>
            </div>
          </Card>
        </div>
      </div>

      <div>
        <SectionTitle sub={'Sales and purchase capture for ' + pLabel(CURRENT_PERIOD) + ', client by client'}>Capture board</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {CLIENTS.map((c) => {
            const r = LEDGER[c.id][CURRENT_PERIOD].readiness
            return (
              <Link key={c.id} to={'/clients/' + c.id} className="card p-3.5 hover:border-brand-300 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <ClientChip client={c} link={false} />
                  {c.books.mode === 'CleanBook Auto' ? <AutoTag>Auto</AutoTag> : <Pill tone="warn">Manual</Pill>}
                </div>
                <div className="mt-3"><Readiness pct={r.pct} width={140} /></div>
                <div className="mt-3 space-y-2">
                  <Line label="Sales invoices" got={r.salesDocs.captured} need={r.salesDocs.expected} />
                  <Line label="Purchase bills" got={r.purchDocs.captured} need={r.purchDocs.expected} />
                </div>
                <p className="text-[11px] text-mute mt-2.5 pt-2.5 border-t border-line">
                  Bank synced {r.bankSyncedTill ? dateFull(r.bankSyncedTill) : '—'} · books closed {dateFull(c.books.closedTill)}
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Line({ label, got, need }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11.5px] text-mute">{label}</span>
        <span className="text-[11.5px] num font-semibold text-ink">{got} / {need}</span>
      </div>
      <Bar value={got} max={need} tone={got >= need ? 'ok' : got / need > 0.7 ? 'warn' : 'bad'} height={5} />
    </div>
  )
}
