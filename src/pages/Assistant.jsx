import { useState } from 'react'
import { Sparkles, Send, GitCompareArrows, FolderOpen, Copy, Bot, UserRound, ShieldCheck, FileSpreadsheet } from 'lucide-react'
import { Card, CardHead, PageHead, Pill, MiniStat } from '../components/ui.jsx'
import { ClientChip, Note, StatusPill } from '../components/bits.jsx'
import { CLIENTS, CURRENT_PERIOD, LEDGER, OBLIGATIONS, ITC_ROWS, DOC_REQUESTS } from '../data/index.js'
import { inr } from '../lib/format.js'
import { pLabel } from '../lib/dates.js'
import { useApp } from '../lib/store.jsx'

const PROMPTS = [
  'Prepare August GST pack',
  'What is missing for GSTR-3B?',
  'Show GSTR-2B mismatches',
  'Draft a WhatsApp reminder',
]

export default function Assistant() {
  const [clientId, setClientId] = useState('CL-02')
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([{ id: 'hello', role: 'assistant', text: 'Good morning. Pick a client and ask me what you need. I can prepare a GST summary, find missing data, show 2B mismatches or draft a reminder.' }])
  const { statusOf, docStatusOf, receiptsFor, toast } = useApp()
  const client = CLIENTS.find((item) => item.id === clientId)

  const ask = (text = question) => {
    const clean = text.trim()
    if (!clean) return
    const answer = buildAnswer({ client, question: clean, statusOf, docStatusOf, receiptsFor })
    const stamp = Date.now()
    setMessages((items) => [...items, { id: 'q' + stamp, role: 'user', text: clean, client: client.short }, { id: 'a' + stamp, role: 'assistant', text: answer.summary, answer }])
    setQuestion('')
  }

  return <div className="space-y-5">
    <PageHead title="CleanBook Assistant" sub="Ask in normal language. Get a short answer, the source figures and the next action." chips={<Pill tone="brand"><Sparkles size={11} /> Demo intelligence</Pill>} />

    <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4 items-start">
      <Card className="overflow-hidden min-h-[680px] flex flex-col">
        <CardHead title="Chat" sub="Rules-based today · AI-ready when credentials are connected" icon={Bot} right={<Pill tone="ok">Client data connected</Pill>} />
        <div className="flex-1 p-4 lg:p-5 bg-soft/40 space-y-4 overflow-y-auto max-h-[560px]">
          {messages.map((message) => <Message key={message.id} message={message} onCopy={() => { navigator.clipboard?.writeText(message.answer?.plainText || message.text); toast('Answer copied', 'Ready to use in a working paper or client message', 'brand') }} />)}
        </div>
        <div className="border-t border-line bg-card p-3 lg:p-4">
          <div className="flex gap-2"><input value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && ask()} placeholder={'Ask about ' + client.short + '…'} className="input flex-1 !h-11" /><button onClick={() => ask()} className="btn-primary !h-11 !px-4"><Send size={15} /> Ask</button></div>
          <p className="text-[10.5px] text-faint mt-2 flex items-center gap-1"><ShieldCheck size={11} /> CleanBook can prepare and explain. A CA must approve before filing.</p>
        </div>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHead title="Talking about" />
          <div className="p-4 space-y-3"><ClientChip client={client} link={false} /><select value={clientId} onChange={(event) => setClientId(event.target.value)} className="select w-full">{CLIENTS.map((item) => <option key={item.id} value={item.id}>{item.short}</option>)}</select></div>
        </Card>
        <Card>
          <CardHead title="Try asking" sub="One tap" />
          <div className="p-3 space-y-2">{PROMPTS.map((prompt) => <button key={prompt} onClick={() => ask(prompt)} className="w-full rounded-xl border border-line bg-card hover:bg-brand-50 hover:border-brand-200 text-left px-3 py-2.5 text-[12px] font-semibold text-ink transition-colors">{prompt}<Send size={11} className="float-right mt-0.5 text-faint" /></button>)}</div>
        </Card>
        <Note tone="info" title="Coming with real AI">Ask follow-up questions, read uploaded invoices, prepare workpapers and explain why a figure changed.</Note>
      </div>
    </div>
  </div>
}

function Message({ message, onCopy }) {
  if (message.role === 'user') return <div className="flex justify-end"><div className="max-w-[78%]"><p className="text-[10.5px] text-faint text-right mb-1">{message.client}</p><div className="rounded-2xl rounded-br-md bg-brand-600 text-white px-4 py-3 text-[13px] leading-relaxed flex gap-2"><UserRound size={15} className="shrink-0 mt-0.5" />{message.text}</div></div></div>
  return <div className="flex items-start gap-2.5"><span className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 grid place-items-center shrink-0"><Bot size={16} /></span><div className="max-w-[88%] rounded-2xl rounded-tl-md bg-card border border-line px-4 py-3.5 shadow-card"><p className="text-[13px] leading-relaxed text-ink">{message.text}</p>{message.answer && <Answer answer={message.answer} onCopy={onCopy} />}</div></div>
}

function Answer({ answer, onCopy }) {
  return <div className="mt-4 space-y-3">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">{answer.metrics.map((metric) => <div key={metric.label} className="rounded-lg bg-soft p-2.5"><MiniStat {...metric} /></div>)}</div>
    <div className="space-y-2">{answer.actions.slice(0, 3).map((action) => <div key={action.label} className="rounded-lg border border-line p-2.5 flex items-start gap-2"><action.icon size={13} className="text-warn-600 mt-0.5 shrink-0" /><div className="min-w-0 flex-1"><p className="text-[11.5px] font-bold text-ink">{action.label}</p><p className="text-[10.5px] text-mute mt-0.5">{action.value}</p></div><StatusPill status={action.status} /></div>)}</div>
    <div className="flex items-center justify-between pt-2 border-t border-line"><p className="text-[10.5px] text-faint">Sources: GST ledger · 2B match · document queue</p><button onClick={onCopy} className="btn-quiet !h-7 text-[11px]"><Copy size={11} /> Copy</button></div>
  </div>
}

function buildAnswer({ client, question, statusOf, docStatusOf, receiptsFor }) {
  const row = LEDGER[client.id][CURRENT_PERIOD]
  const obligations = OBLIGATIONS.filter((item) => item.clientId === client.id && item.period === CURRENT_PERIOD)
  const gstr1 = obligations.find((item) => item.form === 'GSTR-1')
  const gstr3b = obligations.find((item) => item.form === 'GSTR-3B')
  const docs = DOC_REQUESTS.filter((item) => item.clientId === client.id && docStatusOf(item) !== 'Received')
  const itc = ITC_ROWS.filter((item) => item.clientId === client.id && item.period === CURRENT_PERIOD)
  const receipts = receiptsFor(client.id)
  const lower = question.toLowerCase()
  const gstr1Status = gstr1 ? statusOf(gstr1) : 'Not Applicable'
  const gstr3bStatus = gstr3b ? statusOf(gstr3b) : 'Not Applicable'
  const actions = [
    ...docs.map((item) => ({ label: item.what, value: item.blocks || 'Client document is pending', status: 'Awaiting Data', icon: FolderOpen })),
    ...itc.filter((item) => item.status === 'Open').slice(0, 2).map((item) => ({ label: item.vendor + ' · ' + inr(item.tax), value: item.reason + ' — ' + item.action, status: 'In Progress', icon: GitCompareArrows })),
  ]
  if (!actions.length) actions.push({ label: 'Final CA review', value: 'Confirm source records and approve the filing pack.', status: 'Ready to File', icon: FileSpreadsheet })
  let summary
  if (lower.includes('reminder') || lower.includes('whatsapp')) summary = docs.length ? 'Hi ' + client.owner.split(' ')[0] + ', please upload ' + docs.map((item) => item.what).join(' and ') + ' for ' + pLabel(CURRENT_PERIOD) + '. We need this to complete your GST filing. Thank you.' : 'Hi ' + client.owner.split(' ')[0] + ', we have everything needed for ' + pLabel(CURRENT_PERIOD) + '. We will update you after filing.'
  else if (lower.includes('2b') || lower.includes('itc') || lower.includes('mismatch')) summary = itc.length ? inr(row.mismatch) + ' needs reconciliation across ' + itc.length + ' GSTR-2B items. Resolve the open vendor lines before claiming the credit.' : 'No GSTR-2B mismatch needs action for this period.'
  else if (lower.includes('missing') || lower.includes('3b')) summary = docs.length ? 'GSTR-3B is waiting on ' + docs.length + ' client item(s). After they arrive, review ITC, RCM and cash tax of ' + inr(row.netPayable) + '.' : 'No client document is pending. Review ITC and cash tax before filing GSTR-3B.'
  else summary = client.short + ' is ' + row.readiness.pct + '% ready for ' + pLabel(CURRENT_PERIOD) + '. GSTR-1 is ' + gstr1Status.toLowerCase() + ', GSTR-3B is ' + gstr3bStatus.toLowerCase() + ', and estimated cash tax is ' + inr(row.netPayable) + '.'
  const metrics = [{ label: 'Ready', value: row.readiness.pct + '%', tone: row.readiness.pct >= 90 ? 'ok' : 'warn' }, { label: 'Sales', value: inr(row.sales) }, { label: 'ITC in 2B', value: inr(row.itc2B), tone: 'ok' }, { label: 'New bills', value: String(receipts.length) }]
  const plainText = [summary, ...metrics.map((item) => item.label + ': ' + item.value), ...actions.map((item) => item.label + ': ' + item.value)].join('\n')
  return { summary, metrics, actions, plainText }
}
