import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { HttpsError, onCall } from 'firebase-functions/v2/https'

initializeApp()

const db = getFirestore()
const auth = getAuth()
const ADMIN_ROLES = ['principal', 'manager']
const ALLOWED_ROLES = ['principal', 'manager', 'staff', 'reviewer', 'client_owner', 'client_manager', 'employee']

function requireAuth(request) {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in is required.')
  return request.auth
}

async function activeProfile(uid) {
  const snapshot = await db.doc(`users/${uid}`).get()
  if (!snapshot.exists || snapshot.data().status !== 'active') {
    throw new HttpsError('permission-denied', 'The CleanBook account is not active.')
  }
  return snapshot.data()
}

export const createFirm = onCall(async (request) => {
  const caller = requireAuth(request)
  if (caller.token.platformAdmin !== true) {
    throw new HttpsError('permission-denied', 'Platform administrator access is required.')
  }

  const name = String(request.data?.name || '').trim()
  const registrationNumber = String(request.data?.registrationNumber || '').trim()
  const principalUid = String(request.data?.principalUid || '').trim()
  if (!name || !principalUid) throw new HttpsError('invalid-argument', 'Firm name and principal user are required.')

  const principal = await auth.getUser(principalUid)
  const firmRef = db.collection('firms').doc()
  const batch = db.batch()
  batch.set(firmRef, {
    name, registrationNumber, status: 'active',
    createdAt: FieldValue.serverTimestamp(), createdBy: caller.uid,
  })
  batch.set(db.doc(`users/${principalUid}`), {
    firmId: firmRef.id, role: 'principal', status: 'active', clientIds: [],
    displayName: principal.displayName || principal.email || 'Firm principal',
    email: principal.email || '', createdAt: FieldValue.serverTimestamp(),
  })
  await batch.commit()
  return { firmId: firmRef.id }
})

export const createInvitation = onCall(async (request) => {
  const caller = requireAuth(request)
  const profile = await activeProfile(caller.uid)
  if (!ADMIN_ROLES.includes(profile.role)) throw new HttpsError('permission-denied', 'Firm administrator access is required.')

  const email = String(request.data?.email || '').trim().toLowerCase()
  const role = String(request.data?.role || '')
  const clientIds = Array.isArray(request.data?.clientIds) ? request.data.clientIds.map(String) : []
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new HttpsError('invalid-argument', 'A valid email is required.')
  if (!ALLOWED_ROLES.includes(role) || role === 'principal') throw new HttpsError('invalid-argument', 'Select a permitted invitation role.')
  if (role.startsWith('client_') || role === 'employee') {
    if (!clientIds.length) throw new HttpsError('invalid-argument', 'Client users require at least one client assignment.')
  }

  const ref = db.collection(`firms/${profile.firmId}/invitations`).doc()
  await ref.set({
    email, role, clientIds, status: 'pending', firmId: profile.firmId,
    invitedBy: caller.uid, createdAt: FieldValue.serverTimestamp(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  })
  return { invitationId: ref.id, expiresInDays: 7 }
})

export const acceptInvitation = onCall(async (request) => {
  const caller = requireAuth(request)
  const invitationId = String(request.data?.invitationId || '').trim()
  const firmId = String(request.data?.firmId || '').trim()
  if (!invitationId || !firmId) throw new HttpsError('invalid-argument', 'Invitation and firm IDs are required.')

  const ref = db.doc(`firms/${firmId}/invitations/${invitationId}`)
  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists) throw new HttpsError('not-found', 'Invitation not found.')
    const invitation = snapshot.data()
    const callerEmail = String(caller.token.email || '').toLowerCase()
    if (!callerEmail || callerEmail !== invitation.email) throw new HttpsError('permission-denied', 'Sign in with the invited email address.')
    if (invitation.status !== 'pending') throw new HttpsError('failed-precondition', 'Invitation is no longer pending.')
    if (invitation.expiresAt.toDate().getTime() < Date.now()) throw new HttpsError('deadline-exceeded', 'Invitation has expired.')

    transaction.set(db.doc(`users/${caller.uid}`), {
      firmId, role: invitation.role, clientIds: invitation.clientIds || [], status: 'active',
      displayName: caller.token.name || callerEmail, email: callerEmail,
      createdAt: FieldValue.serverTimestamp(),
    })
    transaction.update(ref, { status: 'accepted', acceptedBy: caller.uid, acceptedAt: FieldValue.serverTimestamp() })
  })
  return { accepted: true }
})
