import { useMemo, useState } from 'react'
import { Mic, MicOff, Sparkles, Plus, Trash2, CheckCircle2, Printer, RotateCcw, Volume2 } from 'lucide-react'
import { Card, CardHead, Pill, Field } from '../../../components/ui.jsx'
import { Note } from '../../../components/bits.jsx'
import { inr } from '../../../lib/format.js'
import { useApp } from '../../../lib/store.jsx'

const SAMPLE = 'Create invoice for Metro Warehousing, phone 9876543210, buying 10 brake drums at 2500 each, GST 18 percent, due in 15 days'

const EMPTY_ITEM = () => ({ id: Math.random().toString(36).slice(2, 8), name: '', quantity: 1, rate: 0, gstRate: 18 })

export default function VoiceInvoice({ client, accent }) {
  const { saveInvoice, invoicesFor, toast } = useApp()
  const existing = invoicesFor(client.id)
  const [listening, setListening] = useState(false)
  const [command, setCommand] = useState('')
  const [created, setCreated] = useState(null)
  const [draft, setDraft] = useState(() => freshDraft(client, existing))
  const totals = useMemo(() => calculate(draft), [draft])

  const parse = (text) => {
    if (!text.trim()) {
      toast('Say or type an invoice command', 'Add the customer, item, quantity and rate', 'warn')
      return
    }
    const parsed = parseCommand(text)
    setCommand(text)
    setDraft((current) => ({ ...current, ...parsed, items: parsed.items || current.items }))
    setCreated(null)
    toast('Voice understood', 'Check the highlighted invoice before creating it', 'brand')
  }

  const startVoice = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!Recognition) {
      toast('Microphone speech recognition is unavailable', 'Use the sample command or type the instruction below', 'warn')
      return
    }
    const recognition = new Recognition()
    recognition.lang = 'en-IN'
    recognition.interimResults = false
    setListening(true)
    recognition.onresult = (event) => parse(event.results[0][0].transcript)
    recognition.onerror = () => toast('Could not hear the command', 'Please try again or type it', 'warn')
    recognition.onend = () => setListening(false)
    recognition.start()
  }

  const update = (key, value) => setDraft((current) => ({ ...current, [key]: value }))
  const updateItem = (id, key, value) => setDraft((current) => ({ ...current, items: current.items.map((item) => item.id === id ? { ...item, [key]: ['quantity', 'rate', 'gstRate'].includes(key) ? Number(value) : value } : item) }))
  const addItem = () => setDraft((current) => ({ ...current, items: [...current.items, EMPTY_ITEM()] }))
  const removeItem = (id) => setDraft((current) => ({ ...current, items: current.items.filter((item) => item.id !== id) }))

  const create = () => {
    if (created) {
      toast('Invoice already created', created.number + ' is ready to print or share', 'warn')
      return
    }
    if (!draft.customer || draft.items.some((item) => !item.name || !item.quantity || !item.rate)) {
      toast('Complete the invoice first', 'Customer, product, quantity and rate are required', 'warn')
      return
    }
    const number = nextInvoiceNumber(client, existing)
    const invoice = { ...draft, number, clientId: client.id, ...totals, createdAt: new Date().toISOString(), status: 'Created — not sent' }
    saveInvoice(invoice)
    setCreated(invoice)
    setDraft((current) => ({ ...current, number }))
  }

  const reset = () => { setDraft(freshDraft(client, existing)); setCommand(''); setCreated(null) }

  return <div className="space-y-5">
    <section className="rounded-2xl p-5 lg:p-7 text-white overflow-hidden relative" style={{ background: `linear-gradient(120deg, ${accent}, #0F172A)` }}>
      <div className="absolute -right-12 -top-12 w-52 h-52 rounded-full bg-white/5" />
      <div className="relative grid lg:grid-cols-[1fr_auto] gap-5 items-center">
        <div><div className="flex items-center gap-2 mb-2"><Pill className="bg-white/15 text-white"><Sparkles size={11} /> Voice invoice</Pill><Pill className="bg-white/15 text-white">Review before creation</Pill></div><h2 className="text-[25px] lg:text-[31px] font-extrabold tracking-tight">Say it. Check it. Create the bill.</h2><p className="text-[13px] text-white/75 mt-2 max-w-2xl">Tell CleanBook the customer, product, quantity, rate and GST. It prepares the invoice while you speak.</p></div>
        <button onClick={startVoice} className={'w-28 h-28 rounded-full grid place-items-center border-[8px] transition-all ' + (listening ? 'bg-bad-500 border-white/25 animate-pulse' : 'bg-white text-ink border-white/20 hover:scale-105')} style={!listening ? { color: accent } : undefined}>{listening ? <MicOff size={34} /> : <Mic size={34} />}<span className="sr-only">{listening ? 'Listening' : 'Start voice command'}</span></button>
      </div>
    </section>

    <Card>
      <CardHead title="Voice command" sub="Speak naturally or type. Nothing is created until you confirm." icon={Volume2} right={<button onClick={() => parse(SAMPLE)} className="btn-ghost"><Sparkles size={13} /> Use sample</button>} />
      <div className="p-4 flex gap-2"><input value={command} onChange={(event) => setCommand(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && parse(command)} placeholder="Create invoice for…" className="input flex-1 !h-11" /><button onClick={() => parse(command)} className="btn !h-11 text-white" style={{ background: accent }}><Sparkles size={14} /> Understand</button></div>
      {command && <div className="px-4 pb-4"><Note tone="ok" title="I heard">“{command}”</Note></div>}
    </Card>

    <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4 items-start">
      <Card className="overflow-hidden print:shadow-none">
        <CardHead title="Invoice preview" sub="Everything remains editable" right={<Pill tone={created ? 'ok' : 'brand'}>{created ? 'Created' : 'Draft'}</Pill>} />
        <div className="p-4 lg:p-6 space-y-5">
          <div className="flex flex-wrap justify-between gap-4 border-b border-line pb-5"><div><p className="text-[19px] font-extrabold text-ink">{client.name}</p><p className="text-[11.5px] text-mute mt-1">GSTIN {client.gstin || 'Unregistered'} · {client.area}, {client.city}</p></div><div className="text-right"><p className="label">Tax invoice</p><p className="font-mono font-extrabold text-[16px] mt-1">{draft.number}</p><p className="text-[11px] text-mute mt-1">10 Sep 2026</p></div></div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3"><Input label="Customer / company" value={draft.customer} onChange={(value) => update('customer', value)} /><Input label="Phone" value={draft.phone} onChange={(value) => update('phone', value)} mono /><Input label="Customer GSTIN" value={draft.customerGstin} onChange={(value) => update('customerGstin', value.toUpperCase())} mono /><label><span className="field-l">Place of supply</span><select className="select w-full" value={draft.state} onChange={(event) => update('state', event.target.value)}><option>Karnataka</option><option>Tamil Nadu</option><option>Maharashtra</option><option>Telangana</option><option>Kerala</option></select></label></div>

          <div className="overflow-x-auto rounded-xl border border-line"><table className="w-full min-w-[720px]"><thead className="bg-soft"><tr><th className="th">Product / service</th><th className="th w-24">Qty</th><th className="th w-36">Rate</th><th className="th w-28">GST %</th><th className="th text-right w-40">Amount</th><th className="th w-12" /></tr></thead><tbody>{draft.items.map((item) => <tr key={item.id}><td className="td"><input className="input w-full" value={item.name} onChange={(event) => updateItem(item.id, 'name', event.target.value)} /></td><td className="td"><input className="input w-full num" type="number" min="1" value={item.quantity} onChange={(event) => updateItem(item.id, 'quantity', event.target.value)} /></td><td className="td"><input className="input w-full num" type="number" min="0" value={item.rate} onChange={(event) => updateItem(item.id, 'rate', event.target.value)} /></td><td className="td"><select className="select w-full" value={item.gstRate} onChange={(event) => updateItem(item.id, 'gstRate', event.target.value)}><option value="0">0%</option><option value="5">5%</option><option value="12">12%</option><option value="18">18%</option><option value="28">28%</option></select></td><td className="td text-right font-mono font-bold">{inr(item.quantity * item.rate)}</td><td className="td"><button onClick={() => draft.items.length > 1 && removeItem(item.id)} className="btn-quiet !w-8 !px-0 justify-center"><Trash2 size={13} /></button></td></tr>)}</tbody></table></div>
          <button onClick={addItem} className="btn-ghost"><Plus size={13} /> Add another item</button>

          <div className="grid sm:grid-cols-2 gap-4 items-end"><div className="grid grid-cols-2 gap-3"><Input label="Payment due in days" value={draft.dueDays} type="number" onChange={(value) => update('dueDays', Math.max(0, Number(value)))} /><Input label="Reference / PO" value={draft.reference} onChange={(value) => update('reference', value)} /></div><div className="rounded-xl bg-soft p-4 space-y-2"><Total label="Taxable value" value={totals.taxable} /><Total label={totals.interstate ? 'IGST' : 'CGST'} value={totals.interstate ? totals.tax : totals.tax / 2} /><Total label={totals.interstate ? null : 'SGST'} value={totals.interstate ? null : totals.tax / 2} /><div className="border-t border-line pt-2"><Total label="Invoice total" value={totals.total} strong /></div></div></div>
        </div>
      </Card>

      <div className="space-y-4">
        <Card><CardHead title="Ready to create?" sub="Check these once" icon={CheckCircle2} /><div className="p-4 space-y-3"><Check ok={!!draft.customer.trim()}>Customer selected</Check><Check ok={draft.items.every((item) => item.name.trim() && item.quantity > 0 && item.rate > 0)}>Products, quantity and rates complete</Check><Check ok={draft.items.every((item) => item.gstRate >= 0)}>GST calculated</Check><Check ok={!draft.phone || /^\d{10}$/.test(draft.phone)}>Phone number valid</Check><button disabled={!!created} onClick={create} className="btn w-full !h-11 justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: accent }}><CheckCircle2 size={15} /> {created ? 'Invoice created' : 'Create invoice'}</button><button onClick={reset} className="btn-ghost w-full justify-center"><RotateCcw size={13} /> {created ? 'Create another invoice' : 'Start again'}</button></div></Card>
        {created && <Card><CardHead title="Invoice created" icon={CheckCircle2} /><div className="p-4 space-y-3"><Field label="Invoice" value={created.number} mono /><Field label="Customer" value={created.customer} /><Field label="Total" value={inr(created.total)} tone="ok" /><button onClick={() => window.print()} className="btn-primary w-full justify-center"><Printer size={13} /> Print / save PDF</button><button onClick={() => toast('Demo share prepared', created.number + ' would be sent after your confirmation', 'brand')} className="btn-ghost w-full justify-center">Preview sharing</button><p className="text-[10.5px] text-faint">The demo never sends automatically.</p></div></Card>}
        {existing.length > 0 && <Card><CardHead title="Created this session" /><div className="p-4 space-y-2">{existing.slice(0, 4).map((invoice) => <div key={invoice.number} className="flex justify-between gap-3 text-[12px]"><span className="font-semibold truncate">{invoice.number} · {invoice.customer}</span><span className="font-mono font-bold">{inr(invoice.total)}</span></div>)}</div></Card>}
      </div>
    </div>
  </div>
}

function freshDraft(client, invoices = []) {
  return { number: nextInvoiceNumber(client, invoices), customer: '', phone: '', customerGstin: '', state: 'Karnataka', dueDays: 15, reference: '', items: [EMPTY_ITEM()] }
}

function nextInvoiceNumber(client, invoices) {
  const highest = invoices.reduce((max, invoice) => {
    const serial = Number(invoice.number?.split('/').pop())
    return Number.isFinite(serial) ? Math.max(max, serial) : max
  }, 183)
  return client.code + '/26-27/' + String(highest + 1).padStart(4, '0')
}

function parseCommand(text) {
  const words = text.replace(/₹/g, '').replace(/,/g, ' ')
  const customer = words.match(/(?:invoice|bill)\s+for\s+(.+?)(?=\s+(?:phone|number|buying|purchasing|for\s+\d+)|$)/i)?.[1]?.trim() || ''
  const phone = words.match(/(?:phone|number)\s*(?:is\s*)?(\d{10})/i)?.[1] || ''
  const gst = Number(words.match(/(?:gst|tax)\s*(?:is\s*)?(\d+(?:\.\d+)?)\s*(?:percent|%)/i)?.[1] || 18)
  const dueDays = Number(words.match(/due\s+in\s+(\d+)\s+days?/i)?.[1] || 15)
  const item = words.match(/(?:buying|purchasing|for)\s+(\d+)\s+(.+?)\s+at\s+(\d+(?:\.\d+)?)\s*(?:each|per\s+item)?/i)
  return { customer, phone, dueDays, items: item ? [{ id: Math.random().toString(36).slice(2, 8), quantity: Number(item[1]), name: item[2].trim(), rate: Number(item[3]), gstRate: gst }] : undefined }
}

function calculate(draft) {
  const taxable = draft.items.reduce((sum, item) => sum + item.quantity * item.rate, 0)
  const tax = draft.items.reduce((sum, item) => sum + item.quantity * item.rate * item.gstRate / 100, 0)
  const interstate = draft.state !== 'Karnataka'
  return { taxable, tax, total: Math.round((taxable + tax) * 100) / 100, interstate }
}

function Input({ label, value, onChange, mono, type = 'text' }) {
  return <label><span className="field-l">{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} className={'input w-full ' + (mono ? 'font-mono' : '')} /></label>
}

function Total({ label, value, strong }) {
  if (!label) return null
  return <div className="flex items-center justify-between gap-3"><span className={strong ? 'text-[13px] font-bold' : 'text-[12px] text-mute'}>{label}</span><span className={'font-mono ' + (strong ? 'text-[19px] font-extrabold text-ink' : 'text-[13px] font-semibold')}>{inr(value)}</span></div>
}

function Check({ ok, children }) {
  return <div className="flex items-center gap-2 text-[12.5px]"><span className={'w-5 h-5 rounded-full grid place-items-center ' + (ok ? 'bg-ok-50 text-ok-600' : 'bg-soft text-faint')}><CheckCircle2 size={12} /></span><span className={ok ? 'text-ink' : 'text-mute'}>{children}</span></div>
}
