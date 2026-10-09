// The demo repository: the sample practice in src/data, fixed on its own date
// so the story reads the same in every sales meeting. Nobody signs in, and
// nothing is saved — see demo-session.js for what a presenter can change.
//
// This module, and through it src/data, is loaded only by the demo build.

import { FIRM, STAFF, staffById, PORTALS, TODAY, CURRENT_PERIOD } from '../data/practice.js'
import { CLIENTS, clientById, WATCHLIST } from '../data/clients.js'
import { LEDGER, PERIOD_KEYS } from '../data/periods.js'
import {
  OBLIGATIONS, daysLeft, openObligations, overdueObligations, dueWithin, forClient, estimatedTax,
} from '../data/compliance.js'
import { ITC_ROWS, itcTotals, DOC_REQUESTS, CHASE_STATS } from '../data/recon.js'
import { NOTICES, openNotices } from '../data/notices.js'
import { SNAPSHOTS, ACTIVITY, AUTOMATION } from '../data/ops.js'
import { OPS, PEOPLE, MONEY, FEED, ACTIONS, attendanceSummary, hasApp, brandOf } from '../data/business.js'
import * as revenue from '../data/revenue.js'
import { makeDerive } from '../lib/derive.js'
import { AuthContext } from '../lib/auth.jsx'
import { RepoContext } from './index.js'
import { useDemoSession } from './demo-session.js'

const data = {
  FIRM, STAFF, staffById, PORTALS, TODAY, CURRENT_PERIOD,
  CLIENTS, clientById, WATCHLIST,
  LEDGER, PERIOD_KEYS,
  OBLIGATIONS, daysLeft, openObligations, overdueObligations, dueWithin, forClient, estimatedTax,
  ITC_ROWS, itcTotals, DOC_REQUESTS, CHASE_STATS,
  NOTICES, openNotices,
  SNAPSHOTS, ACTIVITY, AUTOMATION, OPS, PEOPLE, MONEY, FEED, ACTIONS, attendanceSummary, hasApp, brandOf,
  revenue,
}

const nothingSaved = () => Promise.reject(new Error('The demo does not save anything.'))

export const DEMO_REPO = {
  ...data,
  ...makeDerive(data),
  saveFirmProfile: nothingSaved,
  createClient: nothingSaved,
  createInvitation: nothingSaved,
  acceptInvitation: nothingSaved,
  useSession: useDemoSession,
}

const DEMO_AUTH = { enabled: false, demoMode: true, user: null, profile: null, loading: false }

export function RepoProvider({ children }) {
  return (
    <AuthContext.Provider value={DEMO_AUTH}>
      <RepoContext.Provider value={DEMO_REPO}>{children}</RepoContext.Provider>
    </AuthContext.Provider>
  )
}
