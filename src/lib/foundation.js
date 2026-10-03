import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { firebase } from './firebase.js'

function requireFirebase() {
  if (!firebase) throw new Error('Firebase is not configured.')
}

export async function saveFirmProfile(firmId, values) {
  requireFirebase()
  await setDoc(doc(firebase.db, 'firms', firmId), { ...values, updatedAt: serverTimestamp() }, { merge: true })
}

export async function createClient(firmId, values, actorId) {
  requireFirebase()
  const ref = doc(collection(firebase.db, `firms/${firmId}/clients`))
  await setDoc(ref, { ...values, id: ref.id, firmId, status: 'active', createdBy: actorId, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
  return ref.id
}

export async function createInvitation(values) {
  requireFirebase()
  return (await httpsCallable(firebase.functions, 'createInvitation')(values)).data
}

export async function acceptInvitation(values) {
  requireFirebase()
  return (await httpsCallable(firebase.functions, 'acceptInvitation')(values)).data
}
