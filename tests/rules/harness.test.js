// Proves the security-rules test harness reaches the emulators and loads the
// rules from this repository. The access-matrix cases belong to WO1-05.

import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, describe, it } from 'vitest'
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { ref, uploadString } from 'firebase/storage'

let env

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-cleanbook',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
    storage: { rules: readFileSync('storage.rules', 'utf8') },
  })
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), 'firms/firm-a'), { name: 'Harness firm' })
  })
})

afterAll(async () => {
  await env?.cleanup()
})

describe('rules harness', () => {
  it('reads seeded data with the rules switched off', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await assertSucceeds(getDoc(doc(ctx.firestore(), 'firms/firm-a')))
    })
  })

  it('denies a signed-out visitor in Firestore', async () => {
    const db = env.unauthenticatedContext().firestore()
    await assertFails(getDoc(doc(db, 'firms/firm-a')))
    await assertFails(setDoc(doc(db, 'firms/firm-a'), { name: 'Changed' }))
  })

  it('denies a signed-out visitor in Storage', async () => {
    const storage = env.unauthenticatedContext().storage()
    await assertFails(uploadString(ref(storage, 'firms/firm-a/clients/c1/requests/r1/a.pdf'), 'x', 'raw', { contentType: 'application/pdf' }))
  })
})
