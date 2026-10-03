import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, FileUp, Fuel, MapPin, Plus, Truck } from 'lucide-react'
import { Card, CardHead, Pill } from '../../../components/ui.jsx'
import { inr } from '../../../lib/format.js'
import { useApp } from '../../../lib/store.jsx'

const SEED_TRIPS = [
  { id: 'TR-24188', lr: 'LR-24188', vehicle: 'KA-51-AC-4412', driver: 'Shivakumar Gowda', from: 'Peenya', to: 'Hosur', customer: 'Bosch India', freight: 42000, advance: 4000, status: 'In transit', podFile: '', startedAt: '05:40' },
  { id: 'TR-24177', lr: 'LR-24177', vehicle: 'KA-01-AB-7781', driver: 'Ravi Hegde', from: 'Tumkur', to: 'Bengaluru', customer: 'Metro Warehousing', freight: 28500, advance: 3000, status: 'Delivered', podFile: 'POD-LR-24177.jpg', startedAt: 'Yesterday' },
  { id: 'TR-24191', lr: 'LR-24191', vehicle: 'KA-41-C-2210', driver: 'Nagaraj Rao', from: 'Peenya', to: 'Mysuru', customer: 'Ace Components', freight: 36000, advance: 4000, status: 'Loading', podFile: '', startedAt: '08:15' },
]

const EXPIRIES = [
  { vehicle: 'KA-41-C-2210', document: 'Insurance', due: '6 days', tone: 'bad' },
  { vehicle: 'KA-51-AC-4412', document: 'National permit', due: '18 days', tone: 'warn' },
  { vehicle: 'KA-01-AB-7781', document: 'Fitness certificate', due: '27 days', tone: 'warn' },
]

const EMPTY = { vehicle: '', driver: '', from: 'Peenya', to: '', customer: '', freight: '', advance: '', goods: '', weight: '' }

export default function TripDesk({ client, accent }) {
  const { tripsFor, tripStateOf, addTrip, updateTrip, toast } = useApp()
  const created = tripsFor(client.id)
  const trips = [...created, ...SEED_TRIPS].map((trip) => ({ ...trip, ...tripStateOf(trip.id) }))
  const [form, setForm] = useState(EMPTY)
  const [showForm, setShowForm] = useState(false)
  const totals = useMemo(() => ({ active: trips.filter((trip) => ['Loading', 'In transit'].includes(trip.status)).length, podPending: trips.filter((trip) => trip.status === 'Delivered' && !trip.podFile).length, advances: trips.reduce((sum, trip) => sum + Number(trip.advance || 0), 0) }), [trips])

  const create = () => {
    if (!form.vehicle || !form.driver || !form.to || !form.customer || Number(form.freight) <= 0) {
      toast('Complete the trip sheet', 'Vehicle, driver, destination, customer and freight are required', 'warn')
      return
    }
    const serial = 24200 + created.length
    addTrip({ ...form, id: 'TR-' + serial, lr: 'LR-' + serial, clientId: client.id, freight: Number(form.freight), advance: Number(form.advance) || 0, status: 'Loading', podFile: '', startedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) })
    setForm(EMPTY); setShowForm(false)
  }

  return <div className="space-y-5">
    <section className="rounded-2xl p-5 lg:p-7 text-white" style={{ background: `linear-gradient(120deg, ${accent}, #0F172A)` }}><div className="flex flex-wrap justify-between gap-5"><div><Pill className="bg-white/15 text-white"><Truck size={11} /> Transport operations</Pill><h2 className="text-[26px] font-extrabold mt-3">Every load from LR to POD.</h2><p className="text-[13px] text-white/75 mt-2">Create the trip once. Driver advance, delivery proof, billing and CA records stay connected.</p></div><button onClick={() => setShowForm(!showForm)} className="h-11 px-4 rounded-xl bg-white font-bold flex items-center gap-2" style={{ color: accent }}><Plus size={16} /> New trip</button></div></section>

    <div className="grid sm:grid-cols-3 gap-3"><Metric label="Active trips" value={totals.active} icon={MapPin} /><Metric label="PODs pending" value={totals.podPending} icon={FileUp} warn={totals.podPending > 0} /><Metric label="Driver advances" value={inr(totals.advances)} icon={Fuel} /></div>

    {showForm && <Card><CardHead title="New trip sheet" sub="LR number is generated after confirmation" icon={Plus} /><div className="p-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3"><Input label="Vehicle number" value={form.vehicle} set={(value) => setForm({ ...form, vehicle: value.toUpperCase() })} /><Input label="Driver" value={form.driver} set={(value) => setForm({ ...form, driver: value })} /><Input label="From" value={form.from} set={(value) => setForm({ ...form, from: value })} /><Input label="To" value={form.to} set={(value) => setForm({ ...form, to: value })} /><Input label="Customer / consignor" value={form.customer} set={(value) => setForm({ ...form, customer: value })} /><Input label="Goods" value={form.goods} set={(value) => setForm({ ...form, goods: value })} /><Input label="Weight" value={form.weight} set={(value) => setForm({ ...form, weight: value })} /><Input label="Freight" type="number" value={form.freight} set={(value) => setForm({ ...form, freight: value })} /><Input label="Driver advance" type="number" value={form.advance} set={(value) => setForm({ ...form, advance: value })} /><div className="flex items-end gap-2"><button onClick={create} className="btn-primary h-10">Create trip</button><button onClick={() => setShowForm(false)} className="btn-ghost h-10">Cancel</button></div></div></Card>}

    <div className="grid xl:grid-cols-[1fr_340px] gap-4 items-start"><Card><CardHead title="Trip register" sub="Operational status, advance and POD in one line" /><div className="overflow-x-auto"><table className="w-full min-w-[850px]"><thead className="bg-soft"><tr><th className="th">LR / Vehicle</th><th className="th">Route</th><th className="th">Driver</th><th className="th">Customer</th><th className="th text-right">Freight</th><th className="th text-right">Advance</th><th className="th">Status</th><th className="th">POD</th></tr></thead><tbody>{trips.map((trip) => <tr key={trip.id}><td className="td"><p className="font-bold">{trip.lr}</p><p className="text-[10.5px] text-mute font-mono">{trip.vehicle}</p></td><td className="td"><p className="font-semibold">{trip.from} → {trip.to}</p><p className="text-[10.5px] text-mute">Started {trip.startedAt}</p></td><td className="td">{trip.driver}</td><td className="td">{trip.customer}</td><td className="td text-right font-mono font-bold">{inr(trip.freight)}</td><td className="td text-right font-mono">{inr(trip.advance)}</td><td className="td"><select className="select !h-8 text-[11px]" value={trip.status} onChange={(event) => updateTrip(trip.id, { status: event.target.value })}><option>Loading</option><option>In transit</option><option>Delivered</option><option>Closed</option></select></td><td className="td">{trip.podFile ? <Pill tone="ok"><CheckCircle2 size={11} /> Received</Pill> : <label className="btn-ghost !h-8 cursor-pointer"><FileUp size={12} /> Upload<input type="file" accept="image/*,.pdf" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) updateTrip(trip.id, { podFile: file.name, status: 'Delivered' }) }} /></label>}</td></tr>)}</tbody></table></div></Card>
      <Card><CardHead title="Vehicle papers" sub="Renew before the truck stops" icon={AlertTriangle} /><div className="p-4 space-y-3">{EXPIRIES.map((item) => <div key={item.vehicle + item.document} className="rounded-xl border border-line p-3"><div className="flex justify-between gap-3"><p className="text-[12px] font-bold font-mono">{item.vehicle}</p><Pill tone={item.tone}>{item.due}</Pill></div><p className="text-[11.5px] text-mute mt-1">{item.document}</p></div>)}</div></Card></div>
  </div>
}

function Metric({ label, value, icon: Icon, warn }) { return <Card><div className="p-4 flex items-center gap-3"><span className={'w-10 h-10 rounded-xl grid place-items-center ' + (warn ? 'bg-warn-50 text-warn-600' : 'bg-brand-50 text-brand-600')}><Icon size={18} /></span><div><p className="text-[11px] text-mute font-semibold">{label}</p><p className="text-[21px] font-extrabold text-ink">{value}</p></div></div></Card> }
function Input({ label, value, set, type = 'text' }) { return <label><span className="field-l">{label}</span><input className="input w-full" type={type} value={value} onChange={(event) => set(event.target.value)} /></label> }
