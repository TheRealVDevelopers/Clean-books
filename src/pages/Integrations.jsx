import { Database, Landmark, MessageCircle, FileSpreadsheet, CreditCard, ScanLine, MapPin, Fingerprint, ShieldCheck, KeyRound } from 'lucide-react'
import { Card, CardHead, PageHead, Pill } from '../components/ui.jsx'
import { Note } from '../components/bits.jsx'
import { useApp } from '../lib/store.jsx'

const INTEGRATIONS = [
  { name: 'Firebase', icon: Database, state: 'Foundation ready', tone: 'brand', detail: 'Authentication, Firestore and Storage. Needs your Firebase project keys.' },
  { name: 'Tally / Zoho / Busy', icon: FileSpreadsheet, state: 'Connector planned', tone: 'mute', detail: 'Import ledgers, sales, purchases and outstanding balances.' },
  { name: 'Bank and UPI', icon: Landmark, state: 'Connector planned', tone: 'mute', detail: 'Bank statements and Razorpay / Cashfree settlement reconciliation.' },
  { name: 'WhatsApp Business', icon: MessageCircle, state: 'Connector planned', tone: 'mute', detail: 'Document reminders, approval alerts and daily owner summaries.' },
  { name: 'GST / e-Invoice GSP', icon: ShieldCheck, state: 'Requires authorised GSP', tone: 'warn', detail: 'Generate e-invoices, e-way bills and file only after CA approval.' },
  { name: 'OCR bill capture', icon: ScanLine, state: 'UI ready', tone: 'ok', detail: 'Capture flow exists; add an OCR provider to extract invoice fields.' },
  { name: 'Biometric attendance', icon: Fingerprint, state: 'Connector planned', tone: 'mute', detail: 'Sync employee punches, shifts and payroll attendance.' },
  { name: 'GPS / fleet telematics', icon: MapPin, state: 'Connector planned', tone: 'mute', detail: 'Vehicle location, trip events, fuel and driver behaviour.' },
]

export default function Integrations() {
  const { toast } = useApp()
  return <div className="space-y-5">
    <PageHead title="Integrations & automation" sub="Connect real systems when credentials are available. Nothing here pretends to be connected before it is." />
    <Note tone="info" title="Safe rollout">
      Connect Firebase first. Then add one integration at a time to a test client before enabling it for the practice.
    </Note>
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {INTEGRATIONS.map((item) => <Card key={item.name} className="p-4 flex flex-col gap-4"><div className="flex items-start gap-3"><span className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 grid place-items-center"><item.icon size={18} /></span><div className="min-w-0 flex-1"><p className="font-bold text-[13.5px] text-ink">{item.name}</p><Pill tone={item.tone} className="mt-1">{item.state}</Pill></div></div><p className="text-[12px] text-mute leading-relaxed flex-1">{item.detail}</p><button className="btn-ghost justify-center" onClick={() => toast('Configuration needed', item.name + ' requires credentials before it can be connected.', 'brand')}><KeyRound size={13} /> Configure</button></Card>)}
    </div>
  </div>
}
