// The live repository: the signed-in user's firm, read from Firestore and kept
// current as it changes. The security rules decide what each user may read;
// this module only asks for it.
//
// This module, and through it Firebase, is loaded only by the live build.

import { useEffect, useMemo, useState } from 'react'
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore'
import { firebase } from '../lib/firebase.js'
import { useAuth } from '../lib/auth.jsx'
import { saveFirmProfile, createClient, createInvitation, acceptInvitation } from '../lib/foundation.js'
import { AuthProvider } from './firebase-auth.jsx'
import { RepoContext } from './index.js'
import { FIRM_ROLES, liveData, liveSession } from './live-data.js'

function useLiveSession({ toast, staffById }) {
  const { user, profile } = useAuth()
  return useMemo(() => liveSession({ user, profile, staffById, toast }), [user, profile, staffById, toast])
}

const failed = (what) => (error) => console.error('CleanBook could not read ' + what, error)
const withId = (snapshot) => ({ id: snapshot.id, ...snapshot.data() })

function LiveRepo({ children }) {
  const { profile } = useAuth()
  const firmId = profile?.status === 'active' ? profile.firmId : null
  // Firm members read the whole client book; a client user reads only the
  // clients they belong to.
  const clientIds = FIRM_ROLES.includes(profile?.role) ? null : (profile?.clientIds || [])
  const clientKey = clientIds ? clientIds.join(',') : '*'

  const [firm, setFirm] = useState(null)
  const [users, setUsers] = useState([])
  const [clients, setClients] = useState([])

  useEffect(() => {
    setFirm(null)
    if (!firmId) return undefined
    return onSnapshot(doc(firebase.db, 'firms', firmId),
      (snapshot) => setFirm(snapshot.exists() ? snapshot.data() : null), failed('the firm'))
  }, [firmId])

  useEffect(() => {
    setUsers([])
    if (!firmId) return undefined
    return onSnapshot(query(collection(firebase.db, 'users'), where('firmId', '==', firmId)),
      (snapshot) => setUsers(snapshot.docs.map(withId)), failed('the firm’s users'))
  }, [firmId])

  useEffect(() => {
    setClients([])
    if (!firmId) return undefined
    if (clientKey === '*') {
      return onSnapshot(collection(firebase.db, 'firms', firmId, 'clients'),
        (snapshot) => setClients(snapshot.docs.map(withId)), failed('the client book'))
    }
    const ids = clientKey ? clientKey.split(',') : []
    const found = {}
    const stops = ids.map((id) => onSnapshot(doc(firebase.db, 'firms', firmId, 'clients', id), (snapshot) => {
      if (snapshot.exists()) found[id] = withId(snapshot)
      else delete found[id]
      setClients(ids.filter((x) => found[x]).map((x) => found[x]))
    }, failed('client ' + id)))
    return () => stops.forEach((stop) => stop())
  }, [firmId, clientKey])

  const repo = useMemo(() => ({
    ...liveData({ firm, users, clients }),
    saveFirmProfile,
    createClient,
    createInvitation,
    acceptInvitation,
    useSession: useLiveSession,
  }), [firm, users, clients])

  return <RepoContext.Provider value={repo}>{children}</RepoContext.Provider>
}

export function RepoProvider({ children }) {
  return <AuthProvider><LiveRepo>{children}</LiveRepo></AuthProvider>
}
