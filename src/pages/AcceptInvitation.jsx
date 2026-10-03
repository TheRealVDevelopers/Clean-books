import { useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, MailCheck } from 'lucide-react'
import { useAuth } from '../lib/auth.jsx'
import { acceptInvitation } from '../lib/foundation.js'

export default function AcceptInvitation() {
  const auth = useAuth()
  const [params] = useSearchParams()
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  if (auth.demoMode) return <Navigate to="/" replace />
  if (!auth.user) return <Navigate to="/login" replace />

  const accept = async () => {
    setBusy(true); setError('')
    try { await acceptInvitation({ firmId: params.get('firmId'), invitationId: params.get('invitationId') }); setDone(true) }
    catch (reason) { setError(reason.message || 'Unable to accept invitation') }
    finally { setBusy(false) }
  }

  return <main className="min-h-[100dvh] bg-bg grid place-items-center p-4"><section className="card w-full max-w-md p-7 text-center"><span className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 grid place-items-center mx-auto"><MailCheck size={27} /></span>{done ? <><h1 className="text-xl font-extrabold mt-4">Invitation accepted</h1><p className="text-sm text-mute mt-2">Sign in again to load your CleanBook firm and permissions.</p><button onClick={() => auth.signOut()} className="btn-primary mt-5 mx-auto">Continue</button></> : <><h1 className="text-xl font-extrabold mt-4">Join CleanBook</h1><p className="text-sm text-mute mt-2">You are signed in as {auth.user.email}. Accept only if this is the invited address.</p>{error && <p className="text-xs text-bad-600 bg-bad-50 p-3 rounded-lg mt-4">{error}</p>}<button disabled={busy} onClick={accept} className="btn-primary mt-5 mx-auto"><CheckCircle2 size={14} /> {busy ? 'Accepting…' : 'Accept invitation'}</button></>}</section></main>
}
