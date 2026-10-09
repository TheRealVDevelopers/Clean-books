// The live repository's data, built from what Firestore holds for the signed-in
// user's firm. Plain functions, so they can be tested without Firebase.
//
// The data model so far has firms, their users and their clients. Everything
// else a screen can ask for — obligations, document requests, notices, the
// businesses' own figures — is empty here until CleanBook stores it. Nothing
// is filled in to look busy.

import { makeDerive } from '../lib/derive.js'
import { obligationQueries } from '../lib/obligations.js'
import { addMonths, iso } from '../lib/dates.js'

export const FIRM_ROLES = ['principal', 'manager', 'staff', 'reviewer']

const ROLE_TITLE = {
  principal: 'Principal', manager: 'Manager', staff: 'Staff', reviewer: 'Reviewer',
  client_owner: 'Business owner', client_manager: 'Business manager', employee: 'Employee',
}
const AVATAR_TONE = { principal: 'brand', manager: 'ok', staff: 'warn' }
const NONE = Object.freeze([])
const DEFAULT_BRAND = { accent: '#4F46E5', tagline: '' }

// GST work in any month is for the month before it.
export const currentPeriod = (today) => addMonths(iso(today).slice(0, 7), -1)

export function staffMember(id, user = {}) {
  const name = user.displayName || user.email || 'CleanBook user'
  return {
    id, name, short: name.split(' ')[0], title: ROLE_TITLE[user.role] || user.role,
    role: user.role, email: user.email, phone: user.phone, avatarTone: AVATAR_TONE[user.role] || 'mute',
  }
}

export function liveData({ firm = null, users = NONE, clients = NONE, today = new Date() }) {
  const STAFF = users.filter((u) => FIRM_ROLES.includes(u.role)).map((u) => staffMember(u.id, u))
  const clientById = Object.fromEntries(clients.map((c) => [c.id, c]))
  const OBLIGATIONS = NONE
  const ITC_ROWS = NONE
  const NOTICES = NONE
  const { daysLeft, openObligations, overdueObligations, dueWithin, forClient } =
    obligationQueries(OBLIGATIONS, today, clientById)

  const data = {
    FIRM: {
      name: firm?.name,
      short: firm?.name,
      frn: firm?.registrationNumber,
      principal: STAFF.find((s) => s.role === 'principal')?.name,
      office: [firm?.city, firm?.state].filter(Boolean).join(', ') || undefined,
      phone: firm?.phone,
    },
    STAFF,
    staffById: Object.fromEntries(STAFF.map((s) => [s.id, s])),
    PORTALS: NONE,
    TODAY: today,
    CURRENT_PERIOD: currentPeriod(today),

    CLIENTS: clients,
    clientById,
    WATCHLIST: NONE,

    LEDGER: {},
    PERIOD_KEYS: NONE,

    OBLIGATIONS, daysLeft, openObligations, overdueObligations, dueWithin, forClient,
    estimatedTax: () => null,

    ITC_ROWS,
    itcTotals: (rows = ITC_ROWS) => ({
      count: rows.length,
      tax: rows.reduce((s, r) => s + r.tax, 0),
      atRisk: rows.filter((r) => r.reason === 'In books, not in 2B').reduce((s, r) => s + r.tax, 0),
      missingBills: rows.filter((r) => r.reason === 'In 2B, not in books').length,
    }),
    DOC_REQUESTS: NONE,
    CHASE_STATS: NONE,

    NOTICES,
    openNotices: () => NOTICES.filter((n) => !['Closed', 'Dropped'].includes(n.status)),

    SNAPSHOTS: {},
    ACTIVITY: NONE,
    AUTOMATION: { autoCaptured: 0, totalDocs: 0, hoursSaved: 0, chaseMessagesAvoided: 0 },
    OPS: {}, PEOPLE: {}, MONEY: {}, FEED: {}, ACTIONS: {},
    attendanceSummary: () => null,
    hasApp: () => false,
    brandOf: () => DEFAULT_BRAND,

    revenue: null,
  }
  return { ...data, ...makeDerive(data) }
}

// The session actions in live mode. Until an action is backed by Firestore it
// says so and changes nothing, so no screen reports a filing, an upload or a
// reminder that did not happen.
export function liveSession({ user, profile, staffById, toast }) {
  const notYet = (what) => () =>
    toast('Not available yet', what + ' is not connected in live mode yet. Nothing was changed.', 'warn')
  const uid = user?.uid
  return {
    who: uid,
    setWho: () => {},
    whoInfo: staffById[uid] || staffMember(uid, {
      ...profile,
      displayName: profile?.displayName || user?.displayName,
      email: profile?.email || user?.email,
    }),

    statusOf: (o) => o.status,
    metaOf: () => null,
    fileReturn: notYet('Filing'),
    markReady: notYet('Filing status'),
    reopen: notYet('Filing status'),

    docStatusOf: (d) => d.status,
    docGotOf: (d) => d.got,
    uploadDoc: notYet('Document upload'),
    uploadedNow: () => false,
    remind: notYet('Reminders'),
    remindedOf: () => false,

    receiptsFor: () => NONE,
    addReceipt: notYet('Purchase capture'),
    reviewReceipt: notYet('Purchase review'),

    taskStatusOf: () => 'Open',
    completeTask: notYet('Task completion'),
    auditEvents: NONE,

    ownerMissionDone: () => false,
    completeOwnerMission: notYet('Owner missions'),

    invoicesFor: () => NONE,
    saveInvoice: notYet('Invoices'),
    ewayBillsFor: () => NONE,
    saveEwayBill: notYet('E-Way Bills'),
    tripsFor: () => NONE,
    tripStateOf: () => null,
    addTrip: notYet('Trip sheets'),
    updateTrip: notYet('Trip sheets'),

    actionCount: 0,
  }
}
