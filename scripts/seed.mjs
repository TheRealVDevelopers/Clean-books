// Loads test logins into the local Firebase emulators (`npm run seed`).
//
// Emulator only: it talks to 127.0.0.1 with the offline `demo-cleanbook`
// project and starts by wiping the emulators, so it can never touch a real
// Firebase project. The accounts it creates are listed in SEED-USERS.md.
//
// This is the first slice. WO1-15 extends it to the full seed (two firms with
// principal, manager and staff, three clients each, requests and filings)
// once the WO1-04 data model is in place.

import { readFileSync } from 'node:fs'
import { initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'

const PROJECT = 'demo-cleanbook'
const HOST = '127.0.0.1'
const PORTS = JSON.parse(readFileSync(new URL('../firebase.json', import.meta.url), 'utf8')).emulators
const AUTH = `http://${HOST}:${PORTS.auth.port}`
const OWNER = { Authorization: 'Bearer owner', 'Content-Type': 'application/json' }

const SEED_PASSWORD = 'cleanbook-seed-1'

const FIRMS = [
  { id: 'firm-a', name: 'Seed Firm A', city: 'Bengaluru', state: 'Karnataka' },
  { id: 'firm-b', name: 'Seed Firm B', city: 'Mysuru', state: 'Karnataka' },
]

const USERS = [
  { email: 'principal.a@cleanbook.test', displayName: 'Asha (principal, Firm A)', firmId: 'firm-a', role: 'principal' },
  { email: 'principal.b@cleanbook.test', displayName: 'Bharat (principal, Firm B)', firmId: 'firm-b', role: 'principal' },
]

async function call(method, url, body) {
  const res = await fetch(url, { method, headers: OWNER, body: body && JSON.stringify(body) })
  if (!res.ok) throw new Error(method + ' ' + url + ' → ' + res.status + ' ' + (await res.text()))
  return res.json()
}

async function reachable() {
  try {
    await fetch(AUTH)
    await fetch(`http://${HOST}:${PORTS.firestore.port}`)
    return true
  } catch {
    return false
  }
}

async function createAccount(user) {
  const signUp = await call('POST', `${AUTH}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-api-key`, {
    email: user.email, password: SEED_PASSWORD, displayName: user.displayName, returnSecureToken: false,
  })
  await call('POST', `${AUTH}/identitytoolkit.googleapis.com/v1/projects/${PROJECT}/accounts:update`, {
    localId: signUp.localId, emailVerified: true,
  })
  return signUp.localId
}

async function main() {
  if (!(await reachable())) {
    console.error('The emulators are not running. Start them first with `npm run emulators`.')
    process.exit(1)
  }

  const env = await initializeTestEnvironment({
    projectId: PROJECT,
    firestore: { host: HOST, port: PORTS.firestore.port },
  })

  await call('DELETE', `${AUTH}/emulator/v1/projects/${PROJECT}/accounts`)
  await env.clearFirestore()

  const uids = {}
  for (const user of USERS) uids[user.email] = await createAccount(user)

  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore()
    for (const firm of FIRMS) {
      const { id, ...fields } = firm
      await setDoc(doc(db, 'firms', id), { ...fields, status: 'active', createdAt: serverTimestamp(), createdBy: 'seed' })
    }
    for (const user of USERS) {
      await setDoc(doc(db, 'users', uids[user.email]), {
        firmId: user.firmId, role: user.role, status: 'active', clientIds: [],
        displayName: user.displayName, email: user.email, createdAt: serverTimestamp(),
      })
    }
  })

  await env.cleanup()
  console.log('Seeded ' + FIRMS.length + ' firms and ' + USERS.length + ' users. Password for every account: ' + SEED_PASSWORD)
  USERS.forEach((u) => console.log('  ' + u.email.padEnd(30) + u.role + ' · ' + u.firmId))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
