import { ShieldCheck, UserRoundCheck, Building2, BriefcaseBusiness, LockKeyhole } from 'lucide-react'
import { Card, CardHead, PageHead, Pill, Table } from '../components/ui.jsx'
import { Note } from '../components/bits.jsx'
import { STAFF } from '../data/index.js'

const ROLES = [
  { role: 'CA Principal', icon: ShieldCheck, tone: 'brand', people: 'CA S. Ramanathan', access: 'All clients, filing approval, notices, payout and firm settings', action: 'Final approval and DSC' },
  { role: 'CA Manager', icon: BriefcaseBusiness, tone: 'ok', people: 'CA Divya Prasad', access: 'Assigned clients, tax audits, direct tax and review queue', action: 'Review and recommend' },
  { role: 'CA Executive', icon: UserRoundCheck, tone: 'info', people: 'Kiran Kumar · Meena R', access: 'Assigned returns, data chase and reconciliation work', action: 'Prepare, cannot file' },
  { role: 'Client Owner', icon: Building2, tone: 'warn', people: 'One owner per client business', access: 'Only their business app, documents, approvals and CA status', action: 'Upload and approve' },
  { role: 'Client Manager / Employee', icon: UserRoundCheck, tone: 'mute', people: 'Branch, fleet and operations teams', access: 'Only modules permitted by their business owner', action: 'Operational entry only' },
]

export default function Access() {
  return <div className="space-y-5">
    <PageHead title="Users & access" sub="Every user sees only the clients and actions their role permits." chips={<Pill tone="ok"><LockKeyhole size={11} /> Role model ready</Pill>} />
    <Note tone="info" title="Firebase enforcement">
      This demo shows the access model. Firebase Authentication and Firestore security rules will enforce it in production — hiding a screen alone is never security.
    </Note>
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {ROLES.map((item) => <Card key={item.role} className="p-4"><div className="flex items-start gap-3"><span className={'w-9 h-9 rounded-xl grid place-items-center ' + (item.tone === 'brand' ? 'bg-brand-50 text-brand-600' : item.tone === 'ok' ? 'bg-ok-50 text-ok-600' : item.tone === 'warn' ? 'bg-warn-50 text-warn-600' : 'bg-soft text-mute')}><item.icon size={18} /></span><div><p className="text-[13.5px] font-bold text-ink">{item.role}</p><p className="text-[11.5px] text-mute mt-0.5">{item.people}</p></div></div><div className="mt-4 pt-3 border-t border-line space-y-2"><p className="text-[12px] text-mute leading-relaxed">{item.access}</p><Pill tone={item.tone}>{item.action}</Pill></div></Card>)}
    </div>
    <Card>
      <CardHead title="Current CA-firm users" sub="Demo identities; production identities come from Firebase Authentication." />
      <Table columns={[
        { key: 'person', label: 'Person', render: (person) => <div><p className="font-bold text-[13px] text-ink">{person.name}</p><p className="text-[11px] text-mute">{person.email}</p></div> },
        { key: 'role', label: 'Role', render: (person) => <Pill tone={person.role === 'principal' ? 'brand' : person.role === 'manager' ? 'ok' : 'info'}>{person.title}</Pill> },
        { key: 'scope', label: 'Data scope', render: (person) => <span className="text-[12.5px] text-mute">{person.scope}</span> },
      ]} rows={STAFF} keyFn={(person) => person.id} pageSize={0} />
    </Card>
  </div>
}
