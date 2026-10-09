import { describe, it, expect, vi } from 'vitest'
import { renderToString } from 'react-dom/server'
import { REPO_KEYS, SESSION_KEYS } from './contract.js'
import { DEMO_REPO } from './demo.jsx'
import { useDemoSession } from './demo-session.js'
import { liveData, liveSession } from './live-data.js'

const sortedKeys = (o) => Object.keys(o).sort()

// Runs a hook once outside the app and returns what it gave back.
function runHook(hook, args) {
  let result
  function Probe() {
    result = hook(args)
    return null
  }
  renderToString(<Probe />)
  return result
}

// firestore.jsx adds these to liveData(); they need Firebase, so they are named here.
const LIVE_ADDS = ['saveFirmProfile', 'createClient', 'createInvitation', 'acceptInvitation', 'useSession']

describe('repository contract', () => {
  it('the demo repository provides exactly the contract', () => {
    expect(sortedKeys(DEMO_REPO)).toEqual([...REPO_KEYS].sort())
  })

  it('the live repository provides exactly the contract', () => {
    expect([...Object.keys(liveData({})), ...LIVE_ADDS].sort()).toEqual([...REPO_KEYS].sort())
  })

  it('both sessions offer the same actions', () => {
    const demo = runHook(useDemoSession, { who: 'ST-1', toast: () => {} })
    const live = liveSession({ user: { uid: 'u1' }, profile: null, staffById: {}, toast: () => {} })
    // The demo can be reset; live mode identifies the signed-in user instead.
    expect(sortedKeys(demo)).toEqual([...SESSION_KEYS, 'resetDemo'].sort())
    expect(sortedKeys(live)).toEqual([...SESSION_KEYS, 'who', 'setWho', 'whoInfo'].sort())
  })
})

describe('demo repository', () => {
  it('tells the story in the README', () => {
    const k = DEMO_REPO.practiceKpis()
    expect(k.clients).toBe(12)
    expect(k.onAuto).toBe(8)
    expect(k.docsOpen).toBe(14)
    expect(k.overdueCount).toBe(4)
    expect(DEMO_REPO.TODAY.toISOString()).toBe('2026-09-10T05:00:00.000Z')
    expect(DEMO_REPO.revenue.CURRENT_MONTH.gross).toBe(38000)
  })

  it('does not pretend to save firm records', async () => {
    await expect(DEMO_REPO.createClient('firm', {}, 'uid')).rejects.toThrow(/demo does not save/)
  })
})

describe('live repository', () => {
  const firm = { name: 'Seed Firm A', registrationNumber: '012345S', city: 'Bengaluru', state: 'Karnataka' }
  const users = [
    { id: 'u1', role: 'principal', displayName: 'Asha Rao', email: 'asha@example.test' },
    { id: 'u2', role: 'staff', displayName: 'Ravi K', email: 'ravi@example.test' },
    { id: 'u3', role: 'client_owner', displayName: 'Owner', email: 'owner@example.test' },
  ]
  const today = new Date('2026-10-09T10:00:00+05:30')

  it('builds the practice from the firm and its users only', () => {
    const repo = liveData({ firm, users, today })
    expect(repo.FIRM).toMatchObject({ name: 'Seed Firm A', frn: '012345S', principal: 'Asha Rao', office: 'Bengaluru, Karnataka' })
    expect(repo.STAFF.map((s) => s.id)).toEqual(['u1', 'u2'])
    expect(repo.staffById.u1).toMatchObject({ name: 'Asha Rao', short: 'Asha', title: 'Principal' })
    expect(repo.CURRENT_PERIOD).toBe('2026-09')
    expect(repo.revenue).toBeNull()
  })

  it('makes nothing up for a firm with no data', () => {
    const repo = liveData({ firm, users, today })
    for (const key of ['CLIENTS', 'OBLIGATIONS', 'DOC_REQUESTS', 'NOTICES', 'ITC_ROWS', 'WATCHLIST', 'ACTIVITY', 'PORTALS']) {
      expect(repo[key], key).toEqual([])
    }
    const k = repo.practiceKpis()
    expect(k).toMatchObject({ clients: 0, openCount: 0, overdueCount: 0, docsOpen: 0, noticesOpen: 0, shareMonth: null })
    expect(repo.alerts()).toEqual([])
    expect(repo.staffWorkload().map((w) => w.open)).toEqual([0, 0])
    expect(repo.calendarMonth(2026, 9).filter(Boolean).every((day) => day.items.length === 0)).toBe(true)
  })

  it('leaves out clients that have no figures yet instead of failing', () => {
    const repo = liveData({ firm, users, today, clients: [{ id: 'c1', name: 'Test Traders', owner: 'Ramesh' }] })
    expect(repo.CLIENTS).toHaveLength(1)
    expect(repo.practiceKpis()).toMatchObject({ clients: 1, onAuto: 0, turnoverMonth: 0 })
    expect(repo.filingBoard()).toEqual([])
    expect(repo.readinessBuckets().map((b) => b.value)).toEqual([0, 0, 0, 0])
  })

  it('reports an action it cannot save instead of faking it', () => {
    const toast = vi.fn()
    const session = liveSession({ user: { uid: 'u1' }, profile: { role: 'principal' }, staffById: {}, toast })
    session.fileReturn({ id: 'o1', status: 'Ready to File' }, 'Client')
    session.uploadDoc({ id: 'd1' })
    expect(toast).toHaveBeenCalledTimes(2)
    for (const [title, , tone] of toast.mock.calls) {
      expect(title).toBe('Not available yet')
      expect(tone).toBe('warn')
    }
    expect(session.statusOf({ status: 'Ready to File' })).toBe('Ready to File')
  })

  it('names the signed-in user even before the staff list arrives', () => {
    const session = liveSession({
      user: { uid: 'u9', email: 'new@example.test' }, profile: { role: 'manager', displayName: 'Meera N' }, staffById: {}, toast: () => {},
    })
    expect(session.who).toBe('u9')
    expect(session.whoInfo).toMatchObject({ name: 'Meera N', title: 'Manager' })
  })
})
