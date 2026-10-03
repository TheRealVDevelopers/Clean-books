import { useMemo, useState } from 'react'
import { CheckCircle2, FileCheck2, Route, ShieldAlert, Truck } from 'lucide-react'
import { Card, CardHead, Field, Pill } from '../../../components/ui.jsx'
import { inr } from '../../../lib/format.js'
import { useApp } from '../../../lib/store.jsx'

const initial = {
  invoice: 'SBT/26-27/0184', invoiceDate: '2026-09-10', value: 29500,
  customer: 'Metro Warehousing', customerGstin: '29AAFCM4821K1Z8',
  from: 'Bengaluru, Karnataka', to: 'Hosur, Tamil Nadu', distance: 48,
  vehicle: 'KA-51-AC-4412', transporterId: '29AAFFS9214L1ZP',
  hsn: '8708', goods: 'Brake drums', reason: 'Outward supply',
}

export default function EWayBill({ client, accent }) {
  const { ewayBillsFor, saveEwayBill, toast } = useApp()
  const bills = ewayBillsFor(client.id)
  const [draft, setDraft] = useState(initial)
  const [created, setCreated] = useState(null)
  const errors = useMemo(() => validate(draft), [draft])
  const update = (key, value) => { setDraft((current) => ({ ...current, [key]: value })); setCreated(null) }

  const prepare = () => {
    if (errors.length) {
      toast('E-Way Bill needs attention', errors[0], 'warn')
      return
    }
    const serial = String(100000000000 + 48291 + bills.length)
    const bill = {
      ...draft, clientId: client.id, number: serial,
      validUntil: validity(draft.distance), status: 'Prepared — portal submission pending',
      createdAt: new Date().toISOString(),
    }
    saveEwayBill(bill)
    setCreated(bill)
  }

  return <div className="space-y-5">
    <section className="rounded-2xl p-5 lg:p-7 text-white" style={{ background: `linear-gradient(120deg, ${accent}, #0F172A)` }}>
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div><div className="flex gap-2 mb-2"><Pill className="bg-white/15 text-white"><Route size={11} /> Transport compliance</Pill><Pill className="bg-white/15 text-white">Demo workflow</Pill></div><h2 className="text-[25px] lg:text-[31px] font-extrabold">Prepare an E-Way Bill without retyping.</h2><p className="text-[13px] text-white/75 mt-2">Pull invoice details, add the vehicle and route, validate, then submit after approval.</p></div>
        <div className="w-24 h-24 rounded-3xl bg-white/15 grid place-items-center"><Truck size={38} /></div>
      </div>
    </section>

    <div className="grid xl:grid-cols-[1fr_350px] gap-4 items-start">
      <Card><CardHead title="E-Way Bill details" sub="Part A + Part B in one screen" icon={FileCheck2} /><div className="p-4 lg:p-6 space-y-5">
        <Group title="Invoice and customer"><Input label="Invoice number" value={draft.invoice} set={(v) => update('invoice', v)} /><Input label="Invoice date" type="date" value={draft.invoiceDate} set={(v) => update('invoiceDate', v)} /><Input label="Consignment value" type="number" value={draft.value} set={(v) => update('value', Number(v))} /><Input label="Customer" value={draft.customer} set={(v) => update('customer', v)} /><Input label="Customer GSTIN" value={draft.customerGstin} set={(v) => update('customerGstin', v.toUpperCase())} /></Group>
        <Group title="Goods"><Input label="Description" value={draft.goods} set={(v) => update('goods', v)} /><Input label="HSN code" value={draft.hsn} set={(v) => update('hsn', v)} /><label><span className="field-l">Transaction type</span><select className="select w-full" value={draft.reason} onChange={(e) => update('reason', e.target.value)}><option>Outward supply</option><option>Inward supply</option><option>Job work</option><option>Sales return</option><option>Exhibition / fair</option></select></label></Group>
        <Group title="Movement"><Input label="From" value={draft.from} set={(v) => update('from', v)} /><Input label="To" value={draft.to} set={(v) => update('to', v)} /><Input label="Distance (km)" type="number" value={draft.distance} set={(v) => update('distance', Number(v))} /><Input label="Vehicle number" value={draft.vehicle} set={(v) => update('vehicle', v.toUpperCase())} /><Input label="Transporter ID / GSTIN" value={draft.transporterId} set={(v) => update('transporterId', v.toUpperCase())} /></Group>
      </div></Card>

      <div className="space-y-4">
        <Card><CardHead title="Automatic check" icon={errors.length ? ShieldAlert : CheckCircle2} /><div className="p-4 space-y-3">
          <Check ok={draft.value > 0}>Invoice value {inr(draft.value)}</Check>
          <Check ok={validGstin(draft.customerGstin)}>Customer GSTIN format</Check>
          <Check ok={/^\d{4,8}$/.test(draft.hsn)}>HSN code available</Check>
          <Check ok={validVehicle(draft.vehicle)}>Vehicle number format</Check>
          <Check ok={draft.distance > 0}>Distance and validity calculated</Check>
          <div className="rounded-xl bg-soft p-3"><Field label="Expected validity" value={validity(draft.distance)} /></div>
          <button onClick={prepare} disabled={!!created} className="btn w-full !h-11 justify-center text-white disabled:opacity-50" style={{ background: accent }}><FileCheck2 size={14} /> {created ? 'Prepared' : 'Prepare E-Way Bill'}</button>
          <p className="text-[10.5px] text-faint">Demo only. It does not submit to the government portal.</p>
        </div></Card>
        {created && <Card><CardHead title="Ready for submission" icon={CheckCircle2} /><div className="p-4 space-y-2"><Field label="Demo EWB number" value={created.number} mono /><Field label="Vehicle" value={created.vehicle} mono /><Field label="Route" value={`${created.from} → ${created.to}`} /><Field label="Valid until" value={created.validUntil} tone="ok" /><button onClick={() => window.print()} className="btn-primary w-full justify-center">Print summary</button></div></Card>}
        {bills.length > 0 && <Card><CardHead title="Prepared this session" /><div className="p-4 space-y-2">{bills.slice(0, 3).map((bill) => <div key={bill.number} className="rounded-lg border border-line p-3"><div className="flex justify-between text-[12px] font-bold"><span>{bill.number}</span><span>{bill.vehicle}</span></div><p className="text-[10.5px] text-mute mt-1">{bill.from} → {bill.to}</p></div>)}</div></Card>}
      </div>
    </div>
  </div>
}

function Group({ title, children }) { return <section><h3 className="text-[13px] font-extrabold text-ink mb-3">{title}</h3><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{children}</div></section> }
function Input({ label, value, set, type = 'text' }) { return <label><span className="field-l">{label}</span><input className="input w-full" type={type} value={value} onChange={(e) => set(e.target.value)} /></label> }
function Check({ ok, children }) { return <div className="flex items-center gap-2 text-[12px]"><span className={'w-5 h-5 rounded-full grid place-items-center ' + (ok ? 'bg-ok-50 text-ok-600' : 'bg-bad-50 text-bad-600')}><CheckCircle2 size={12} /></span><span>{children}</span></div> }
function validGstin(value) { return /^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]$/.test(value) }
function validVehicle(value) { return /^[A-Z]{2}[ -]?\d{1,2}[ -]?[A-Z]{1,3}[ -]?\d{4}$/.test(value) }
function validity(distance) { return `${Math.max(1, Math.ceil(Number(distance || 0) / 200))} day${distance > 200 ? 's' : ''} from generation` }
function validate(draft) {
  if (!draft.invoice || !draft.customer || !draft.goods) return ['Invoice, customer and goods are required']
  if (draft.value <= 0) return ['Enter a valid consignment value']
  if (!validGstin(draft.customerGstin)) return ['Enter a valid 15-character customer GSTIN']
  if (!/^\d{4,8}$/.test(draft.hsn)) return ['Enter a valid HSN code']
  if (!validVehicle(draft.vehicle)) return ['Enter a valid vehicle number']
  if (draft.distance <= 0) return ['Enter the transport distance']
  return []
}
