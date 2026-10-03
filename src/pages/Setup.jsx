import { useState } from 'react'
import { Building2, CheckCircle2, UserPlus, Users } from 'lucide-react'
import { Card, CardHead, Pill } from '../components/ui.jsx'
import { useAuth } from '../lib/auth.jsx'
import { useApp } from '../lib/store.jsx'
import { createClient, createInvitation, saveFirmProfile } from '../lib/foundation.js'

const EMPTY_CLIENT = { name: '', legalName: '', owner: '', email: '', phone: '', pan: '', gstin: '', vertical: 'transport', gstScheme: 'regular', filingFrequency: 'monthly', entityType: 'proprietorship', pf: false, esi: false, pt: true, taxAudit: false }

export default function Setup() {
  const auth = useAuth()
  const { toast } = useApp()
  const [firm, setFirm] = useState({ name: '', registrationNumber: '', phone: '', city: 'Bengaluru', state: 'Karnataka' })
  const [client, setClient] = useState(EMPTY_CLIENT)
  const [invite, setInvite] = useState({ email: '', role: 'staff', clientIds: '' })
  const [busy, setBusy] = useState('')
  const [inviteLink, setInviteLink] = useState('')
  const firmId = auth.profile?.firmId
  const canWrite = auth.enabled && firmId && ['principal', 'manager'].includes(auth.profile?.role)

  const execute = async (name, action, success) => {
    setBusy(name)
    try { await action(); toast(success, 'Saved securely to Firebase', 'ok') }
    catch (error) { toast('Could not save', error.message, 'warn') }
    finally { setBusy('') }
  }

  const addClient = () => execute('client', async () => {
    if (!client.name || !client.owner || !client.phone) throw new Error('Client name, owner and phone are required.')
    await createClient(firmId, client, auth.user.uid)
    setClient(EMPTY_CLIENT)
  }, 'Client added')

  const sendInvite = () => execute('invite', async () => {
    const result = await createInvitation({ email: invite.email, role: invite.role, clientIds: invite.clientIds.split(',').map((value) => value.trim()).filter(Boolean) })
    setInviteLink(`${window.location.origin}${window.location.pathname}#/accept-invitation?firmId=${firmId}&invitationId=${result.invitationId}`)
  }, 'Invitation created')

  return <div className="space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-[23px] font-extrabold text-ink">Firm & client onboarding</h1><p className="text-[12.5px] text-mute mt-1">Create the production records that drive access, compliance and client applications.</p></div><Pill tone={canWrite ? 'ok' : 'warn'}>{canWrite ? 'Firebase connected' : auth.demoMode ? 'Preview — configure Firebase to save' : 'Principal or manager required'}</Pill></div>
    <Card><CardHead title="Firm profile" sub="The legal practice that owns every client record" icon={Building2} /><div className="p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3"><Input label="Firm name" value={firm.name} set={(v) => setFirm({ ...firm, name: v })} /><Input label="Firm registration number" value={firm.registrationNumber} set={(v) => setFirm({ ...firm, registrationNumber: v })} /><Input label="Phone" value={firm.phone} set={(v) => setFirm({ ...firm, phone: v })} /><Input label="City" value={firm.city} set={(v) => setFirm({ ...firm, city: v })} /><Input label="State" value={firm.state} set={(v) => setFirm({ ...firm, state: v })} /><Action disabled={!canWrite || busy} onClick={() => execute('firm', () => saveFirmProfile(firmId, firm), 'Firm profile updated')}>{busy === 'firm' ? 'Saving…' : 'Save firm profile'}</Action></div></Card>
    <Card><CardHead title="Add client" sub="Registration answers determine the compliance calendar" icon={Users} /><div className="p-4 space-y-4"><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3"><Input label="Trade name" value={client.name} set={(v) => setClient({ ...client, name: v })} /><Input label="Legal name" value={client.legalName} set={(v) => setClient({ ...client, legalName: v })} /><Input label="Owner" value={client.owner} set={(v) => setClient({ ...client, owner: v })} /><Input label="Phone" value={client.phone} set={(v) => setClient({ ...client, phone: v })} /><Input label="Email" value={client.email} set={(v) => setClient({ ...client, email: v })} /><Input label="PAN" value={client.pan} set={(v) => setClient({ ...client, pan: v.toUpperCase() })} /><Input label="GSTIN" value={client.gstin} set={(v) => setClient({ ...client, gstin: v.toUpperCase() })} /><Select label="Business type" value={client.vertical} set={(v) => setClient({ ...client, vertical: v })} options={['transport', 'manufacturing', 'restaurant', 'gym', 'travel', 'salon', 'contractor', 'ecommerce', 'education', 'other']} /><Select label="Entity" value={client.entityType} set={(v) => setClient({ ...client, entityType: v })} options={['proprietorship', 'partnership', 'llp', 'company', 'huf', 'trust']} /><Select label="GST scheme" value={client.gstScheme} set={(v) => setClient({ ...client, gstScheme: v })} options={['regular', 'qrmp', 'composition', 'unregistered', 'exempt']} /><Select label="Filing" value={client.filingFrequency} set={(v) => setClient({ ...client, filingFrequency: v })} options={['monthly', 'quarterly']} /></div><div className="flex flex-wrap gap-4"><Toggle label="PF" checked={client.pf} set={(v) => setClient({ ...client, pf: v })} /><Toggle label="ESI" checked={client.esi} set={(v) => setClient({ ...client, esi: v })} /><Toggle label="Professional tax" checked={client.pt} set={(v) => setClient({ ...client, pt: v })} /><Toggle label="Tax audit" checked={client.taxAudit} set={(v) => setClient({ ...client, taxAudit: v })} /></div><Action disabled={!canWrite || busy} onClick={addClient}>{busy === 'client' ? 'Adding…' : 'Add client'}</Action></div></Card>
    <Card><CardHead title="Invite a user" sub="The invited email receives only its assigned role and clients" icon={UserPlus} /><div className="p-4 space-y-3"><div className="grid sm:grid-cols-3 gap-3"><Input label="Email" value={invite.email} set={(v) => setInvite({ ...invite, email: v })} /><Select label="Role" value={invite.role} set={(v) => setInvite({ ...invite, role: v })} options={['manager', 'staff', 'reviewer', 'client_owner', 'client_manager', 'employee']} /><Input label="Client IDs (comma separated)" value={invite.clientIds} set={(v) => setInvite({ ...invite, clientIds: v })} /></div><Action disabled={!canWrite || busy} onClick={sendInvite}>{busy === 'invite' ? 'Creating…' : 'Create secure invitation'}</Action>{inviteLink && <div className="rounded-xl bg-ok-50 border border-ok-500/20 p-3"><p className="text-[11px] font-bold text-ok-700 flex items-center gap-1"><CheckCircle2 size={12} /> Invitation link</p><p className="font-mono text-[10.5px] break-all mt-1 text-ok-700">{inviteLink}</p></div>}</div></Card>
  </div>
}

function Input({ label, value, set }) { return <label><span className="field-l">{label}</span><input className="input w-full" value={value} onChange={(event) => set(event.target.value)} /></label> }
function Select({ label, value, set, options }) { return <label><span className="field-l">{label}</span><select className="select w-full" value={value} onChange={(event) => set(event.target.value)}>{options.map((option) => <option key={option} value={option}>{option.replaceAll('_', ' ')}</option>)}</select></label> }
function Toggle({ label, checked, set }) { return <label className="inline-flex items-center gap-2 text-[12px] font-semibold text-ink"><input type="checkbox" checked={checked} onChange={(event) => set(event.target.checked)} /> {label}</label> }
function Action({ children, ...props }) { return <button className="btn-primary !h-10 justify-center disabled:opacity-40" {...props}>{children}</button> }
