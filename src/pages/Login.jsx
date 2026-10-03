import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { BookOpenCheck, LockKeyhole } from 'lucide-react'
import { useAuth } from '../lib/auth.jsx'

export default function Login() {
  const auth = useAuth()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (auth.demoMode || auth.user) return <Navigate to={location.state?.from || '/'} replace />

  const run = async (action) => {
    setBusy(true)
    setError('')
    try { await action() } catch (reason) { setError(reason.message || 'Unable to sign in') } finally { setBusy(false) }
  }

  return <main className="min-h-[100dvh] bg-bg grid place-items-center p-4">
    <section className="w-full max-w-md rounded-2xl border border-line bg-card shadow-xl p-6 lg:p-8">
      <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 grid place-items-center mb-5"><BookOpenCheck size={25} /></div>
      <h1 className="text-[25px] font-extrabold text-ink">Sign in to CleanBook</h1>
      <p className="text-[12.5px] text-mute mt-2">Access is limited to invited CA firms, staff and client users.</p>
      <form className="space-y-4 mt-6" onSubmit={(event) => { event.preventDefault(); run(() => auth.signIn(email, password)) }}>
        <label><span className="field-l">Email</span><input className="input w-full" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <label><span className="field-l">Password</span><input className="input w-full" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        {error && <p className="text-[11.5px] text-bad-600 bg-bad-50 rounded-lg p-3">{error}</p>}
        <button disabled={busy} className="btn-primary w-full !h-11 justify-center"><LockKeyhole size={14} /> {busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <button disabled={busy} onClick={() => run(auth.signInWithGoogle)} className="btn-ghost w-full justify-center mt-3">Continue with Google</button>
      <button disabled={!email || busy} onClick={() => run(() => auth.resetPassword(email))} className="text-[11.5px] font-semibold text-brand-600 w-full mt-4 disabled:opacity-40">Send password reset email</button>
    </section>
  </main>
}
