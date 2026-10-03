// The referral share. This is the only money that moves in CleanBook, and it
// moves towards the practice: 20% of everything The Real V Developers collects
// from a client the practice introduced, every month, for as long as the client
// keeps paying.
//
// Nothing here is an estimate of what the practice might bill its own clients.
// It is a statement of what Real V collected and what 20% of it comes to.

import { CLIENTS, clientById } from './clients.js'
import { pLabel } from '../lib/dates.js'

export const TERMS = {
  sharePct: 20,
  basis: 'Gross monthly fee collected from the client — not profit, not net of costs',
  payoutDay: 7,
  payoutMode: 'NEFT to the firm’s current account',
  gstOnCommission: 18,
  tdsSection: '194H',
  tdsPct: 2,
  lockIn: 'None. The share continues as long as the client pays, and stops if they stop.',
  clawback: 'If a client refunds a month, that month’s share is adjusted in the next statement.',
  agreement: 'Referral & Introduction Agreement dated 01 Feb 2026, signed by both parties.',
  agreementNote:
    'The arrangement is documented as a referral fee for an introduction, invoiced by the firm with GST. Before signing an ongoing revenue-linked arrangement, a practising member should satisfy themselves on the position under the Chartered Accountants Act, 1949 (First Schedule, Part I) — clause 2 on sharing fees and clause 3 on receiving a share of profits of a business. If in doubt, the safer structures are a one-time introduction fee, or routing the arrangement through a separate non-practising entity.',
  contact: 'Vignesh · The Real V Developers · +91 96323 55571',
}

// Month-by-month: what Real V collected from this practice's referred clients,
// and the 20% that came back. Fees are pro-rated for the month a client starts.
const BILLED = [
  { month: '2026-02', lines: [['CL-04', 50000], ['CL-02', 15000]] },
  { month: '2026-03', lines: [['CL-04', 50000], ['CL-02', 30000], ['CL-01', 10000], ['CL-08', 14000]] },
  { month: '2026-04', lines: [['CL-04', 50000], ['CL-02', 30000], ['CL-01', 10000], ['CL-08', 28000], ['CL-03', 22000], ['CL-12', 10000]] },
  { month: '2026-05', lines: [['CL-04', 50000], ['CL-02', 30000], ['CL-01', 10000], ['CL-08', 28000], ['CL-03', 22000], ['CL-12', 20000], ['CL-05', 18000]] },
  { month: '2026-06', lines: [['CL-04', 50000], ['CL-02', 30000], ['CL-01', 10000], ['CL-08', 28000], ['CL-03', 22000], ['CL-12', 20000], ['CL-05', 18000], ['CL-06', 12000]] },
  { month: '2026-07', lines: [['CL-04', 50000], ['CL-02', 30000], ['CL-01', 10000], ['CL-08', 28000], ['CL-03', 22000], ['CL-12', 20000], ['CL-05', 18000], ['CL-06', 12000]] },
  { month: '2026-08', lines: [['CL-04', 50000], ['CL-02', 30000], ['CL-01', 10000], ['CL-08', 28000], ['CL-03', 22000], ['CL-12', 20000], ['CL-05', 18000], ['CL-06', 12000]] },
  { month: '2026-09', lines: [['CL-04', 50000], ['CL-02', 30000], ['CL-01', 10000], ['CL-08', 28000], ['CL-03', 22000], ['CL-12', 20000], ['CL-05', 18000], ['CL-06', 12000]] },
]

const UTR = ['UTIB0264188104', 'UTIB0264301992', 'UTIB0264447716', 'UTIB0264590233', 'UTIB0264738851', 'UTIB0264881470', 'UTIB0265024118']

export const MONTHS = BILLED.map((m, i) => {
  const realvRevenue = m.lines.reduce((s, l) => s + l[1], 0)
  const gross = Math.round(realvRevenue * TERMS.sharePct / 100)
  const gst = Math.round(gross * TERMS.gstOnCommission / 100)
  const tds = Math.round(gross * TERMS.tdsPct / 100)
  const accruing = i === BILLED.length - 1
  const payMonth = i + 3 // Feb share is paid on 07 Mar
  return {
    month: m.month,
    label: pLabel(m.month),
    clients: m.lines.length,
    realvRevenue,
    gross, gst, tds,
    net: gross + gst - tds,
    status: accruing ? 'Accruing' : 'Paid',
    invoiceNo: accruing ? null : 'RC/26-27/' + String(i + 1).padStart(2, '0'),
    paidOn: accruing ? null : '2026-' + String(payMonth).padStart(2, '0') + '-07',
    dueOn: accruing ? '2026-10-07' : null,
    utr: accruing ? null : UTR[i],
    lines: m.lines.map(([id, fee]) => ({ clientId: id, fee, share: Math.round(fee * TERMS.sharePct / 100) })),
  }
})

export const CURRENT_MONTH = MONTHS[MONTHS.length - 1]
export const PAID_MONTHS = MONTHS.filter((m) => m.status === 'Paid')

export const LIFETIME = {
  realvRevenue: MONTHS.reduce((s, m) => s + m.realvRevenue, 0),
  gross: MONTHS.reduce((s, m) => s + m.gross, 0),
  paid: PAID_MONTHS.reduce((s, m) => s + m.gross, 0),
  net: PAID_MONTHS.reduce((s, m) => s + m.net, 0),
  months: MONTHS.length,
}

// Per-client contribution across the whole relationship.
export const BY_CLIENT = CLIENTS.map((c) => {
  const rows = MONTHS.flatMap((m) => m.lines.filter((l) => l.clientId === c.id).map((l) => ({ ...l, month: m.month })))
  const lifetimeFee = rows.reduce((s, r) => s + r.fee, 0)
  return {
    clientId: c.id,
    client: c,
    active: c.realv.status === 'Live & Billing',
    monthlyFee: c.realv.fee,
    monthlyShare: Math.round(c.realv.fee * TERMS.sharePct / 100),
    monthsBilled: rows.length,
    lifetimeFee,
    lifetimeShare: Math.round(lifetimeFee * TERMS.sharePct / 100),
    since: c.realv.since,
    status: c.realv.status,
  }
}).sort((a, b) => b.lifetimeShare - a.lifetimeShare)

export const ACTIVE_BY_CLIENT = BY_CLIENT.filter((b) => b.active)

// What is not yet earning, and what it would add. This is the page's forward look.
export const PIPELINE = [
  {
    id: 'PL-1', clientId: 'CL-07', name: clientById['CL-07'].name, kind: 'Existing client',
    stage: 'Proposal Sent', fee: 15000, share: 3000, since: null,
    next: 'Proposal sent 02 Sep for a counter-billing app. Follow up after the Sep returns are cleared.',
    owner: 'ST-4', probability: 0.6, expected: '2026-10-15',
  },
  {
    id: 'PL-2', clientId: 'CL-11', name: clientById['CL-11'].name, kind: 'Existing client',
    stage: 'Build In Progress', fee: 14000, share: 2800, since: '2026-10-01',
    next: 'Zenith Campus build is 70% done. Go-live 01 Oct — first share lands in the Oct statement.',
    owner: 'ST-3', probability: 0.95, expected: '2026-10-01',
  },
  {
    id: 'PL-3', clientId: 'CL-09', name: clientById['CL-09'].name, kind: 'Existing client',
    stage: 'Discovery Done', fee: 9000, share: 1800, since: null,
    next: 'Discovery done 28 Aug. Doctor wants to see the appointment and recall module before committing.',
    owner: 'ST-4', probability: 0.45, expected: '2026-11-01',
  },
  {
    id: 'PL-4', clientId: 'CL-10', name: clientById['CL-10'].name, kind: 'Existing client',
    stage: 'Free Tier', fee: 8000, share: 1600, since: null,
    next: 'No appetite for software today. The forced exit from composition in Dec is the natural moment to raise it again.',
    owner: 'ST-3', probability: 0.2, expected: '2027-01-01',
  },
  {
    id: 'PL-5', clientId: null, name: 'Vidyaranya Pre-School', kind: 'Referral (not a client)',
    stage: 'Discovery Done', fee: 12000, share: 2400, since: null,
    next: 'Introduced by the principal at a Rotary meet. Admissions and fee tracking. Real V demo done 05 Sep.',
    owner: 'ST-1', probability: 0.5, expected: '2026-11-01',
  },
  {
    id: 'PL-6', clientId: null, name: 'Hegde Hardware Mart', kind: 'Referral (not a client)',
    stage: 'Proposal Sent', fee: 16000, share: 3200, since: null,
    next: 'Two-branch hardware retail. Wants counter billing plus a credit-customer ledger. Quote sent 08 Sep.',
    owner: 'ST-1', probability: 0.55, expected: '2026-10-20',
  },
]

export const PIPELINE_TOTALS = {
  count: PIPELINE.length,
  fee: PIPELINE.reduce((s, p) => s + p.fee, 0),
  share: PIPELINE.reduce((s, p) => s + p.share, 0),
  weighted: Math.round(PIPELINE.reduce((s, p) => s + p.share * p.probability, 0)),
}

// If everything in the pipeline closes, this is the run-rate.
export const PROJECTION = {
  todayFee: CURRENT_MONTH.realvRevenue,
  todayShare: CURRENT_MONTH.gross,
  potentialFee: CURRENT_MONTH.realvRevenue + PIPELINE_TOTALS.fee,
  potentialShare: CURRENT_MONTH.gross + PIPELINE_TOTALS.share,
  weightedShare: CURRENT_MONTH.gross + PIPELINE_TOTALS.weighted,
  annualToday: CURRENT_MONTH.gross * 12,
  annualPotential: (CURRENT_MONTH.gross + PIPELINE_TOTALS.share) * 12,
}

// The next twelve months, holding the current book and layering the pipeline
// in at its expected date. Used for the projection chart.
export const FORWARD = (() => {
  const out = []
  const start = ['2026-09', '2026-10', '2026-11', '2026-12', '2027-01', '2027-02', '2027-03', '2027-04', '2027-05', '2027-06', '2027-07', '2027-08']
  start.forEach((m) => {
    let base = CURRENT_MONTH.gross
    let added = 0
    PIPELINE.forEach((p) => { if (p.expected <= m + '-28') added += Math.round(p.share * p.probability) })
    out.push({ month: m, label: pLabel(m), base, added, total: base + added })
  })
  return out
})()

export const STATEMENTS = PAID_MONTHS.map((m) => ({
  id: m.invoiceNo,
  month: m.month, label: m.label,
  gross: m.gross, gst: m.gst, tds: m.tds, net: m.net,
  clients: m.clients, realvRevenue: m.realvRevenue,
  paidOn: m.paidOn, utr: m.utr,
})).reverse()
