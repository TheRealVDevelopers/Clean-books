import { useMemo, useState } from 'react'
import { CheckCircle2, Clock3, FileText, ReceiptText, BellRing, ClipboardCheck, History, XCircle } from 'lucide-react'
import { Card, CardHead, PageHead, Pill, Table, Segmented, Empty } from '../components/ui.jsx'
import { ClientChip, Note } from '../components/bits.jsx'
import { isDone } from '../lib/obligations.js'
import { inr, rel } from '../lib/format.js'
import { useApp } from '../lib/store.jsx'
import { useRepo } from '../repo/index.js'

export default function WorkInbox() {
  const [tab, setTab] = useState('tasks')
  const { statusOf, docStatusOf, receiptsFor, reviewReceipt, taskStatusOf, completeTask, auditEvents } = useApp()
  const { CLIENTS, CURRENT_PERIOD, OBLIGATIONS, DOC_REQUESTS } = useRepo()
  const receipts = CLIENTS.flatMap((client) => receiptsFor(client.id).map((receipt) => ({ ...receipt, client })))
  const tasks = useMemo(() => {
    const documents = DOC_REQUESTS.filter((doc) => docStatusOf(doc) !== 'Received').map((doc) => ({
      id: 'doc:' + doc.id, type: 'Document', title: doc.what, sub: doc.blocks || 'Client document request', client: CLIENTS.find((item) => item.id === doc.clientId), tone: doc.status === 'Overdue' ? 'bad' : 'warn', icon: FileText,
    }))
    const filing = OBLIGATIONS.filter((item) => item.period === CURRENT_PERIOD && !isDone({ ...item, status: statusOf(item) }))
      .filter((item) => ['GSTR-1', 'GSTR-3B', 'PMT-06'].includes(item.form)).map((item) => ({
        id: 'filing:' + item.id, type: 'Filing review', title: item.form + ' · ' + item.periodLabel, sub: item.note || 'Review and prepare for filing', client: CLIENTS.find((client) => client.id === item.clientId), tone: item.status === 'Awaiting Data' || item.status === 'Blocked' ? 'bad' : 'brand', icon: ClipboardCheck,
      }))
    return [...documents, ...filing]
  }, [CLIENTS, CURRENT_PERIOD, OBLIGATIONS, DOC_REQUESTS, statusOf, docStatusOf])
  const openTasks = tasks.filter((task) => taskStatusOf(task.id) !== 'Done')

  return <div className="space-y-5">
    <PageHead title="Work inbox" sub="One queue for data, filing reviews and client-captured purchases. Every action leaves an audit trail." chips={<Pill tone="bad">{openTasks.length} open</Pill>} />
    <Segmented value={tab} onChange={setTab} options={[
      { value: 'tasks', label: 'Tasks (' + openTasks.length + ')' },
      { value: 'purchases', label: 'Purchase review (' + receipts.filter((item) => item.status === 'Captured — CA review pending').length + ')' },
      { value: 'audit', label: 'Audit trail (' + auditEvents.length + ')' },
    ]} />

    {tab === 'tasks' && <Tasks tasks={openTasks} statusOf={taskStatusOf} completeTask={completeTask} />}
    {tab === 'purchases' && <Purchases receipts={receipts} reviewReceipt={reviewReceipt} />}
    {tab === 'audit' && <Audit events={auditEvents} />}
  </div>
}

function Tasks({ tasks, completeTask }) {
  if (!tasks.length) return <Empty label="Your inbox is clear" sub="No data chase or filing review is waiting for the team." icon={CheckCircle2} />
  return <Card>
    <CardHead title="Open work" sub="Complete the task only after checking the source record." icon={Clock3} />
    <Table columns={[
      { key: 'task', label: 'Task', render: (task) => <div className="flex items-start gap-2.5"><span className={'mt-0.5 w-7 h-7 rounded-lg grid place-items-center ' + (task.tone === 'bad' ? 'bg-bad-50 text-bad-600' : task.tone === 'warn' ? 'bg-warn-50 text-warn-600' : 'bg-brand-50 text-brand-600')}><task.icon size={14} /></span><div><p className="text-[13px] font-bold text-ink">{task.title}</p><p className="text-[11.5px] text-mute mt-0.5">{task.sub}</p></div></div> },
      { key: 'client', label: 'Client', render: (task) => <ClientChip client={task.client} /> },
      { key: 'kind', label: 'Type', render: (task) => <Pill tone={task.tone}>{task.type}</Pill> },
      { key: 'action', label: '', align: 'right', render: (task) => <button className="btn-ghost" onClick={() => completeTask(task.id, task.title)}><CheckCircle2 size={13} /> Mark done</button> },
    ]} rows={tasks} keyFn={(task) => task.id} pageSize={18} />
  </Card>
}

function Purchases({ receipts, reviewReceipt }) {
  if (!receipts.length) return <Empty label="No purchase has been captured yet" sub="When an owner captures a bill from their Money screen, it lands here for CA review." icon={ReceiptText} />
  return <Card>
    <CardHead title="Purchase capture review" sub="Verify vendor, value, GSTIN and tax before posting to books." icon={ReceiptText} />
    <Table columns={[
      { key: 'file', label: 'Bill / receipt', render: (receipt) => <div><p className="text-[13px] font-bold text-ink">{receipt.fileName}</p><p className="text-[11px] text-mute">Captured from client app</p></div> },
      { key: 'client', label: 'Client', render: (receipt) => <ClientChip client={receipt.client} /> },
      { key: 'vendor', label: 'Vendor', render: (receipt) => <span className="text-[12.5px] text-mute">{receipt.vendor}</span> },
      { key: 'amount', label: 'Amount', align: 'right', render: (receipt) => <span className="num font-semibold">{receipt.amount ? inr(receipt.amount) : '—'}</span> },
      { key: 'status', label: 'Status', render: (receipt) => <Pill tone={receipt.status === 'Approved for books' ? 'ok' : receipt.status.includes('clarification') ? 'warn' : 'brand'}>{receipt.status}</Pill> },
      { key: 'actions', label: '', align: 'right', render: (receipt) => receipt.status === 'Captured — CA review pending' ? <div className="flex gap-1 justify-end"><button className="btn-quiet !h-8 text-warn-700" onClick={() => reviewReceipt(receipt, false)}><XCircle size={13} /> Clarify</button><button className="btn-primary !h-8" onClick={() => reviewReceipt(receipt, true)}><CheckCircle2 size={13} /> Approve</button></div> : <span className="text-faint">—</span> },
    ]} rows={receipts} keyFn={(receipt) => receipt.id} pageSize={18} />
  </Card>
}

function Audit({ events }) {
  return <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
    <Card className="xl:col-span-2">
      <CardHead title="Immutable activity record" sub="Production uses a server-side log; this demo logs all actions taken during this session." icon={History} />
      <div className="divide-y divide-line">
        {events.length ? events.map((event) => <div key={event.id} className="px-4 py-3 flex gap-3"><span className={'w-7 h-7 rounded-lg grid place-items-center shrink-0 ' + (event.tone === 'ok' ? 'bg-ok-50 text-ok-600' : event.tone === 'warn' ? 'bg-warn-50 text-warn-600' : 'bg-brand-50 text-brand-600')}><History size={13} /></span><div className="min-w-0 flex-1"><p className="text-[13px] font-bold text-ink">{event.action}</p><p className="text-[11.5px] text-mute">{event.detail}</p><p className="text-[10.5px] text-faint mt-1">{event.by} · {rel(event.at)}</p></div></div>) : <div className="p-10 text-center text-mute text-[13px]">Actions such as uploads, reviews and task completion will appear here.</div>}
      </div>
    </Card>
    <Note tone="info" title="Production rule"><BellRing size={14} className="inline mr-1" />Audit entries are append-only. A person can correct a record, but they cannot erase that an earlier action happened.</Note>
  </div>
}
