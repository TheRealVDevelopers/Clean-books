// Eighteen months of month-end numbers for every client, generated from a
// seeded RNG so the demo tells the same story on every reload.
//
// For CleanBook clients these numbers are the point: they arrive from the
// custom application the business runs, not from a shoebox of bills. The
// readiness figures below are what tells the auditor whether a return can
// actually be filed today.

import { CLIENTS } from './clients.js'
import { CURRENT_PERIOD } from './practice.js'
import { periodRange, monthsBetween, pParts, dueOn, shiftDays, quarterOf } from '../lib/dates.js'
import { rngFor, iBetween, between, chance } from '../lib/rng.js'

export const HISTORY_FROM = '2025-04'
export const PERIOD_KEYS = periodRange(HISTORY_FROM, CURRENT_PERIOD)

// Turnover is seasonal, and the shape depends on the trade. Index 0 = January.
const SEASON = {
  gym:           [1.34, 1.16, 1.04, 1.08, 0.96, 0.92, 0.88, 0.92, 0.96, 1.02, 0.98, 1.06],
  transport:     [0.94, 0.98, 1.14, 1.04, 0.96, 0.86, 0.82, 0.92, 1.02, 1.14, 1.12, 1.04],
  restaurant:    [1.06, 1.04, 0.98, 0.96, 1.02, 0.92, 0.88, 0.94, 0.98, 1.12, 1.18, 1.22],
  manufacturing: [0.98, 1.02, 1.16, 0.92, 0.98, 1.04, 1.02, 1.00, 1.04, 1.06, 0.98, 0.96],
  travel:        [0.86, 0.92, 1.04, 1.22, 1.28, 1.18, 0.88, 0.84, 0.92, 1.16, 1.14, 1.02],
  salon:         [1.02, 1.08, 0.98, 1.04, 1.06, 0.94, 0.92, 0.96, 1.02, 1.14, 1.16, 1.08],
  pharmacy:      [1.04, 0.98, 0.96, 0.98, 1.02, 1.14, 1.18, 1.12, 1.02, 0.96, 0.94, 0.98],
  contractor:    [1.08, 1.14, 1.22, 0.98, 0.94, 0.86, 0.78, 0.88, 1.02, 1.12, 1.06, 1.04],
  clinic:        [1.02, 1.00, 0.96, 1.04, 1.06, 0.98, 0.94, 0.96, 1.02, 1.08, 1.04, 1.02],
  agri:          [1.18, 1.12, 1.02, 0.92, 0.86, 0.84, 0.88, 0.94, 0.98, 1.14, 1.26, 1.22],
  education:     [1.06, 1.02, 1.12, 1.28, 1.24, 1.14, 0.92, 0.86, 0.88, 0.92, 0.96, 1.00],
  ecommerce:     [0.94, 0.92, 0.96, 0.98, 1.02, 0.96, 0.92, 0.98, 1.04, 1.34, 1.28, 1.06],
}

// Where the current month actually stands, client by client. Hand-set, because
// this is the story the dashboard opens on: GSTR-1 for Aug 2026 falls due
// tomorrow and four clients are not ready.
const CURRENT_STATE = {
  'CL-01': { r1: 'Ready to File', r3b: 'In Progress',   readiness: 96, sales: [124, 129], purch: [38, 38] },
  'CL-02': { r1: 'Ready to File', r3b: 'Awaiting Data', readiness: 98, sales: [412, 419], purch: [268, 274] },
  'CL-03': { r1: 'In Progress',   r3b: 'Not Started',   readiness: 78, sales: [286, 366], purch: [141, 181] },
  'CL-04': { r1: 'Filed',         r3b: 'Ready to File', readiness: 100, sales: [318, 318], purch: [204, 204] },
  'CL-05': { r1: 'Awaiting Data', r3b: 'Not Started',   readiness: 61, sales: [96, 158], purch: [71, 116] },
  'CL-06': { r1: 'Not Applicable', r3b: 'Not Applicable', readiness: 88, sales: [604, 686], purch: [31, 35] },
  'CL-07': { r1: 'Blocked',       r3b: 'Blocked',       readiness: 34, sales: [0, 1180], purch: [0, 402] },
  'CL-08': { r1: 'In Progress',   r3b: 'Not Started',   readiness: 82, sales: [46, 56], purch: [188, 229] },
  'CL-09': { r1: 'Not Applicable', r3b: 'Not Applicable', readiness: 90, sales: [388, 431], purch: [24, 27] },
  'CL-10': { r1: 'Not Applicable', r3b: 'Not Applicable', readiness: 72, sales: [61, 85], purch: [44, 61] },
  'CL-11': { r1: 'Awaiting Data', r3b: 'Not Started',   readiness: 55, sales: [212, 386], purch: [9, 16] },
  'CL-12': { r1: 'Ready to File', r3b: 'In Progress',   readiness: 94, sales: [1842, 1960], purch: [166, 177] },
}

const autoBooks = (c) => c.books.mode === 'CleanBook Auto'

function genPeriod(c, key, t, n) {
  const r = rngFor(c.id + ':' + key)
  const [, m] = pParts(key)
  const season = (SEASON[c.vertical] || SEASON.manufacturing)[m]
  // Scale so the latest month sits on the client's stated run-rate.
  const trend = Math.pow(1 + c.growth, (t - (n - 1)) / 12)
  const noise = between(r, 0.94, 1.06)
  const base = (c.annual / 12) * season * trend * noise

  const sales = Math.round(base / 1000) * 1000
  const cash = Math.round(sales * c.cashRatio)
  const purchases = Math.round(sales * c.purchaseRatio * between(r, 0.93, 1.07))

  const rate = c.gstRate / 100
  const outputTax = c.scheme === 'Composition' ? Math.round(sales * 0.01) : Math.round(sales * rate)
  // Interstate share: manufacturing and e-commerce ship out of state a lot.
  const igstShare = { manufacturing: 0.46, ecommerce: 0.38, transport: 0.22, contractor: 0.12 }[c.vertical] || 0.04
  const igstOut = Math.round(outputTax * igstShare)
  const cgst = Math.round((outputTax - igstOut) / 2)

  const itcBooks = c.scheme === 'Composition' || c.gstRate === 0 ? 0 : Math.round(purchases * rate * between(r, 0.88, 0.99))
  // 2B never quite matches the books — that gap is the auditor's month.
  const matchQuality = autoBooks(c) ? between(r, 0.965, 0.998) : between(r, 0.86, 0.95)
  const itc2B = Math.round(itcBooks * matchQuality)
  const mismatch = itcBooks - itc2B
  const mismatchCount = itcBooks ? Math.max(0, Math.round((1 - matchQuality) * (autoBooks(c) ? 90 : 220))) : 0

  // Restaurant at 5% cannot take credit; that reversal is a real monthly entry.
  const itcClaimable = c.vertical === 'restaurant' ? 0 : itc2B
  const rcm = c.vertical === 'transport' ? Math.round(purchases * 0.05 * between(r, 0.8, 1.2)) : 0
  const netPayable = Math.max(0, outputTax - itcClaimable + rcm)

  const invoiceCount = Math.max(
    4,
    Math.round(sales / ({ gym: 4200, transport: 26000, restaurant: 900, manufacturing: 118000, travel: 46000, salon: 1400, pharmacy: 640, contractor: 340000, clinic: 3800, agri: 88000, education: 22000, ecommerce: 1450 }[c.vertical] || 20000)),
  )

  const monthsAgo = monthsBetween(key, CURRENT_PERIOD)
  const cur = CURRENT_STATE[c.id]
  const isCurrent = monthsAgo === 0

  const r1Due = dueOn(key, 1, c.scheme === 'QRMP' || c.scheme === 'Composition' ? 13 : 11)
  const r3bDue = dueOn(key, 1, 20)

  let gstr1, gstr3b
  if (c.scheme === 'Unregistered') {
    gstr1 = { status: 'Not Applicable', due: null, filedOn: null, arn: null }
    gstr3b = { status: 'Not Applicable', due: null, filedOn: null, arn: null }
  } else if (isCurrent) {
    gstr1 = { status: cur.r1, due: r1Due, filedOn: cur.r1 === 'Filed' ? shiftDays(r1Due, -3) : null, arn: cur.r1 === 'Filed' ? arn(r, key) : null }
    gstr3b = { status: cur.r3b, due: r3bDue, filedOn: null, arn: null }
  } else {
    const lateOdds = autoBooks(c) ? 0.04 : 0.34
    const late1 = chance(r, lateOdds)
    const late3 = chance(r, lateOdds * 0.8)
    const na = (c.scheme === 'QRMP' || c.scheme === 'Composition') && !isQEnd(key)
    gstr1 = na
      ? { status: 'Not Applicable', due: null, filedOn: null, arn: null }
      : { status: late1 ? 'Filed Late' : 'Filed', due: r1Due, filedOn: shiftDays(r1Due, late1 ? iBetween(r, 3, 22) : -iBetween(r, 0, 5)), arn: arn(r, key) }
    gstr3b = na
      ? { status: 'Not Applicable', due: null, filedOn: null, arn: null }
      : { status: late3 ? 'Filed Late' : 'Filed', due: r3bDue, filedOn: shiftDays(r3bDue, late3 ? iBetween(r, 2, 15) : -iBetween(r, 0, 4)), arn: arn(r, key) }
  }

  const lateFee = gstr3b.status === 'Filed Late' ? 50 * iBetween(r, 3, 16) : 0
  const interest = gstr3b.status === 'Filed Late' ? Math.round((netPayable * 0.18 * iBetween(r, 4, 18)) / 365) : 0

  // Document readiness. Prior months are closed, so they read 100%.
  const salesDocs = isCurrent
    ? { captured: cur.sales[0], expected: cur.sales[1] }
    : { captured: invoiceCount, expected: invoiceCount }
  const purchDocs = isCurrent
    ? { captured: cur.purch[0], expected: cur.purch[1] }
    : { captured: Math.round(invoiceCount * 0.6) + 4, expected: Math.round(invoiceCount * 0.6) + 4 }
  const pct = isCurrent ? cur.readiness : 100

  const employees = { gym: 14, transport: 46, restaurant: 38, manufacturing: 112, travel: 9, salon: 22, pharmacy: 11, contractor: 34, clinic: 6, agri: 4, education: 17, ecommerce: 19 }[c.vertical] || 10
  const wages = Math.round(employees * between(r, 17000, 24000))

  return {
    clientId: c.id, period: key, t,
    sales, cash, purchases, invoiceCount,
    outputTax, igstOut, cgst, sgst: cgst,
    itcBooks, itc2B, itcClaimable, mismatch, mismatchCount,
    rcm, netPayable, lateFee, interest,
    gstr1, gstr3b,
    readiness: {
      pct,
      salesDocs, purchDocs,
      bankSyncedTill: isCurrent
        ? (autoBooks(c) ? '2026-09-09' : c.books.mode.startsWith('Tally') ? '2026-06-30' : '2026-08-14')
        : null,
      autoCaptured: autoBooks(c) ? Math.round(pct * between(r, 0.94, 0.99)) : Math.round(pct * between(r, 0.1, 0.3)),
    },
    tds: c.tdsApplicable
      ? {
          deducted: Math.round(purchases * 0.012 * between(r, 0.7, 1.4) / 10) * 10,
          due: dueOn(key, 1, 7),
          status: isCurrent ? (autoBooks(c) ? 'Paid' : 'Not Started') : chance(r, autoBooks(c) ? 0.03 : 0.2) ? 'Paid Late' : 'Paid',
          challan: 'CIN' + iBetween(r, 10000000, 99999999),
        }
      : null,
    payroll: c.pf || c.esi
      ? {
          employees, wages,
          pf: Math.round(wages * 0.24 / 10) * 10,
          esi: c.esi ? Math.round(wages * 0.0325 / 10) * 10 : 0,
          pt: c.pt ? employees * 200 : 0,
          due: dueOn(key, 1, 15),
          status: isCurrent ? (autoBooks(c) ? 'Ready to File' : 'Awaiting Data') : 'Filed',
        }
      : null,
  }
}

const arn = (r, key) => 'AA29' + key.slice(5, 7) + key.slice(2, 4) + iBetween(r, 100000, 999999) + 'W'
const isQEnd = (key) => quarterOf(key).last === key

// clientId -> period key -> row
export const LEDGER = {}
CLIENTS.forEach((c) => {
  LEDGER[c.id] = {}
  PERIOD_KEYS.forEach((k, i) => { LEDGER[c.id][k] = genPeriod(c, k, i, PERIOD_KEYS.length) })
})

export const rowFor = (clientId, key) => LEDGER[clientId]?.[key]
export const seriesFor = (clientId, keys = PERIOD_KEYS) => keys.map((k) => LEDGER[clientId][k])
export const currentRows = () => CLIENTS.map((c) => LEDGER[c.id][CURRENT_PERIOD])
