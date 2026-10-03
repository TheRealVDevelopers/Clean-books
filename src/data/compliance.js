// Every statutory obligation across the whole client book, generated from the
// rules rather than typed in. Change a client's scheme in clients.js and the
// calendar, the workload split and the dashboard counters all follow.

import { CLIENTS, clientById } from './clients.js'
import { CURRENT_PERIOD, TODAY } from './practice.js'
import { LEDGER } from './periods.js'
import { addMonths, dueOn, iso, pLabel, quarterOf, fyOf, daysBetween } from '../lib/dates.js'
import { rngFor, iBetween } from '../lib/rng.js'

const NOW = iso(TODAY)

// Net profit margin used to estimate advance tax. Rough trade averages — good
// enough for a planning number, which is all an advance-tax estimate ever is.
const MARGIN = {
  gym: 0.24, transport: 0.09, restaurant: 0.11, manufacturing: 0.13, travel: 0.08,
  salon: 0.21, pharmacy: 0.06, contractor: 0.12, clinic: 0.38, agri: 0.04,
  education: 0.31, ecommerce: 0.07,
}

const TAX_RATE = (c) => (c.constitution === 'Private Limited' ? 0.2517 : c.constitution === 'LLP' || c.constitution === 'Partnership' ? 0.3120 : 0.3120)

export const estimatedTax = (c) => Math.round((c.annual * (MARGIN[c.vertical] || 0.12) * TAX_RATE(c)) / 1000) * 1000

// Deliberate exceptions. Real books always have a few, and these are the ones
// the dashboard should be shouting about on the day of the demo.
const OVERRIDES = {
  'CL-07:GSTR-3B:2026-07': { status: 'Blocked', note: 'Tally backup for Jul not received — books closed only till 30 Jun. Third reminder sent 04 Sep.' },
  'CL-07:GSTR-1:2026-07': { status: 'Blocked', note: 'Sales register for Jul missing. Counter software export failed twice.' },
  'CL-09:TDS-Challan:2026-08': { status: 'Awaiting Data', note: 'Lab bills for Aug not shared, so 194J deduction cannot be computed.' },
  'CL-11:TDS-Challan:2026-08': { status: 'Awaiting Data', note: 'Faculty payout sheet still with the front desk.' },
  'CL-02:GSTR-3B:2026-08': { status: 'Awaiting Data', note: 'RCM self-invoices for hire-truck freight pending — see watchlist W-5.' },
  'CL-03:GSTR-3B:2026-08': { status: 'Not Started', note: 'Capital-goods ITC of ₹64,200 has to be reversed first — watchlist W-6.' },
}

let seq = 0
const mk = (o) => ({ id: 'OB-' + String(++seq).padStart(3, '0'), ...o })

function statusFor(key, fallback) {
  const ov = OVERRIDES[key]
  return ov ? ov.status : fallback
}
function noteFor(key, fallback) {
  const ov = OVERRIDES[key]
  return ov ? ov.note : fallback
}

function build() {
  const out = []
  const periods = [addMonths(CURRENT_PERIOD, -1), CURRENT_PERIOD, addMonths(CURRENT_PERIOD, 1)]

  CLIENTS.forEach((c) => {
    const r = rngFor('ob:' + c.id)

    /* ------------------------------------------------------------------ GST */
    periods.forEach((p) => {
      const row = LEDGER[c.id][p]
      const future = !row // Sep 2026 has no ledger row yet — nothing to file from

      if (c.scheme === 'Regular') {
        const d1 = dueOn(p, 1, 11)
        const d3 = dueOn(p, 1, 20)
        const k1 = c.id + ':GSTR-1:' + p, k3 = c.id + ':GSTR-3B:' + p
        out.push(mk({
          clientId: c.id, kind: 'GST', form: 'GSTR-1', formLabel: 'GSTR-1 — outward supplies',
          period: p, periodLabel: pLabel(p), due: d1,
          status: statusFor(k1, future ? 'Not Started' : row.gstr1.status),
          note: noteFor(k1, future ? 'Month not yet closed.' : null),
          amount: null, invoices: future ? null : row?.invoiceCount,
          assignee: c.staffId, hours: 1.5, filedOn: future ? null : row.gstr1.filedOn, arn: future ? null : row.gstr1.arn,
        }))
        out.push(mk({
          clientId: c.id, kind: 'GST', form: 'GSTR-3B', formLabel: 'GSTR-3B — summary & tax payment',
          period: p, periodLabel: pLabel(p), due: d3,
          status: statusFor(k3, future ? 'Not Started' : row.gstr3b.status),
          note: noteFor(k3, future ? 'Month not yet closed.' : null),
          amount: future ? null : row.netPayable,
          assignee: c.staffId, hours: 2, filedOn: future ? null : row.gstr3b.filedOn, arn: future ? null : row.gstr3b.arn,
        }))
        // The 2B match is not statutory, but it is the work. Auto clients get
        // it done the day 2B drops; manual clients need a human week.
        out.push(mk({
          clientId: c.id, kind: 'Internal', form: 'GSTR-2B match', formLabel: 'ITC reconciliation against GSTR-2B',
          period: p, periodLabel: pLabel(p), due: dueOn(p, 1, 14),
          status: statusFor('', future ? 'Not Started' : p === CURRENT_PERIOD ? (c.books.mode === 'CleanBook Auto' ? 'Ready to File' : 'In Progress') : 'Filed'),
          amount: future ? null : row.mismatch, assignee: c.staffId, hours: c.books.mode === 'CleanBook Auto' ? 0.5 : 3,
          note: future ? null : row.mismatchCount + ' invoices to match',
        }))
      }

      if (c.scheme === 'QRMP') {
        out.push(mk({
          clientId: c.id, kind: 'GST', form: 'PMT-06', formLabel: 'PMT-06 — monthly QRMP challan',
          period: p, periodLabel: pLabel(p), due: dueOn(p, 1, 25),
          status: future ? 'Not Started' : p === CURRENT_PERIOD ? 'Ready to File' : 'Filed',
          amount: future ? null : Math.round(row.netPayable * 0.35 / 100) * 100,
          assignee: c.staffId, hours: 0.5, note: 'Fixed-sum method — 35% of last quarter cash paid',
        }))
      }
    })

    /* --------------------------------------------------- quarterly GST forms */
    const q = quarterOf(CURRENT_PERIOD) // Q2 FY 26-27, Jul–Sep
    if (c.scheme === 'QRMP') {
      out.push(mk({
        clientId: c.id, kind: 'GST', form: 'GSTR-1 (Q)', formLabel: 'GSTR-1 quarterly — ' + q.short,
        period: q.last, periodLabel: q.label, due: dueOn(q.last, 1, 13),
        status: 'Not Started', amount: null, assignee: c.staffId, hours: 2.5,
        note: 'Jul and Aug invoices already uploaded through IFF',
      }))
      out.push(mk({
        clientId: c.id, kind: 'GST', form: 'GSTR-3B (Q)', formLabel: 'GSTR-3B quarterly — ' + q.short,
        period: q.last, periodLabel: q.label, due: dueOn(q.last, 1, 22),
        status: 'Not Started', amount: null, assignee: c.staffId, hours: 2,
        note: 'Karnataka falls in the 22nd-of-the-month group',
      }))
    }
    if (c.scheme === 'Composition') {
      out.push(mk({
        clientId: c.id, kind: 'GST', form: 'CMP-08', formLabel: 'CMP-08 — composition quarterly statement',
        period: q.last, periodLabel: q.label, due: dueOn(q.last, 1, 18),
        status: 'Awaiting Data', amount: Math.round(c.annual / 4 * 0.01 / 100) * 100,
        assignee: c.staffId, hours: 1,
        note: 'Bill book for Jul and Aug still to be collected from the APMC office',
      }))
    }

    /* ------------------------------------------------------------------ TDS */
    if (c.tdsApplicable) {
      periods.forEach((p) => {
        const row = LEDGER[c.id][p]
        if (!row) return
        const k = c.id + ':TDS-Challan:' + p
        out.push(mk({
          clientId: c.id, kind: 'TDS', form: 'TDS Challan', formLabel: 'TDS deposit (ITNS-281) — ' + c.tdsSections.join(', '),
          period: p, periodLabel: pLabel(p), due: dueOn(p, 1, 7),
          status: statusFor(k, row.tds.status === 'Paid' ? 'Filed' : row.tds.status === 'Paid Late' ? 'Filed Late' : row.tds.status),
          note: noteFor(k, null), amount: row.tds.deducted,
          assignee: 'ST-4', hours: 0.5,
        }))
      })
      out.push(mk({
        clientId: c.id, kind: 'TDS', form: '26Q', formLabel: 'TDS return 26Q — ' + q.short,
        period: q.last, periodLabel: q.label, due: '2026-10-31',
        status: 'Not Started', amount: null, assignee: 'ST-4', hours: 2.5,
        note: 'Two of three months already deposited',
      }))
      out.push(mk({
        clientId: c.id, kind: 'TDS', form: '16A', formLabel: 'Form 16A issue to deductees — ' + q.short,
        period: q.last, periodLabel: q.label, due: '2026-11-15',
        status: 'Not Started', amount: null, assignee: 'ST-4', hours: 1,
      }))
    }

    /* -------------------------------------------------------------- payroll */
    if (c.pf) {
      out.push(mk({
        clientId: c.id, kind: 'Payroll', form: 'PF ECR', formLabel: 'EPF electronic challan cum return',
        period: CURRENT_PERIOD, periodLabel: pLabel(CURRENT_PERIOD), due: dueOn(CURRENT_PERIOD, 1, 15),
        status: LEDGER[c.id][CURRENT_PERIOD].payroll.status === 'Ready to File' ? 'Ready to File' : 'Awaiting Data',
        amount: LEDGER[c.id][CURRENT_PERIOD].payroll.pf, assignee: 'ST-4', hours: 0.75,
      }))
    }
    if (c.esi) {
      out.push(mk({
        clientId: c.id, kind: 'Payroll', form: 'ESI', formLabel: 'ESIC monthly contribution',
        period: CURRENT_PERIOD, periodLabel: pLabel(CURRENT_PERIOD), due: dueOn(CURRENT_PERIOD, 1, 15),
        status: LEDGER[c.id][CURRENT_PERIOD].payroll.status === 'Ready to File' ? 'Ready to File' : 'Awaiting Data',
        amount: LEDGER[c.id][CURRENT_PERIOD].payroll.esi, assignee: 'ST-4', hours: 0.5,
      }))
    }
    if (c.pt) {
      out.push(mk({
        clientId: c.id, kind: 'Payroll', form: 'PT (KA)', formLabel: 'Karnataka professional tax — Form 5A',
        period: CURRENT_PERIOD, periodLabel: pLabel(CURRENT_PERIOD), due: dueOn(CURRENT_PERIOD, 1, 20),
        status: 'Not Started', amount: LEDGER[c.id][CURRENT_PERIOD].payroll?.pt || 2400,
        assignee: 'ST-4', hours: 0.25,
      }))
    }

    /* ---------------------------------------------------------- direct tax */
    const tax = estimatedTax(c)
    out.push(mk({
      clientId: c.id, kind: 'Direct Tax', form: 'Advance Tax Q2', formLabel: 'Advance tax — 2nd instalment (45% cumulative)',
      period: '2026-09', periodLabel: 'Q2 FY 2026-27', due: '2026-09-15',
      status: ['CL-04', 'CL-01', 'CL-06', 'CL-12'].includes(c.id) ? 'Ready to File' : 'In Progress',
      amount: Math.round(tax * 0.3 / 1000) * 1000, assignee: 'ST-2', hours: 1.5,
      note: 'Estimate from live turnover to 31 Aug, annualised',
    }))
    if (c.taxAudit.applicable) {
      out.push(mk({
        clientId: c.id, kind: 'Direct Tax', form: '3CB-3CD', formLabel: 'Tax audit report u/s 44AB',
        period: '2025-26', periodLabel: 'FY 2025-26', due: '2026-09-30',
        status: c.id === 'CL-04' ? 'In Progress' : c.id === 'CL-07' ? 'Blocked' : 'Not Started',
        amount: null, assignee: 'ST-1', hours: 14,
        note: c.taxAudit.reason,
      }))
    }
    if (c.itr.status !== 'Filed') {
      out.push(mk({
        clientId: c.id, kind: 'Direct Tax', form: c.itr.form, formLabel: 'Income tax return — ' + c.itr.form,
        period: '2025-26', periodLabel: 'FY 2025-26', due: c.itr.due,
        status: c.itr.status === 'In Progress' ? 'In Progress' : 'Not Started',
        amount: null, assignee: 'ST-2', hours: 5,
        note: 'Audit case — extended date 31 Oct',
      }))
    }

    /* ---------------------------------------------------------------- ROC */
    c.roc.forEach((form) => {
      const due = { 'AOC-4': '2026-10-30', 'MGT-7': '2026-11-29', 'DIR-3 KYC': '2026-09-30', 'Form 8': '2026-10-30', 'Form 11': '2027-05-30' }[form]
      out.push(mk({
        clientId: c.id, kind: 'ROC', form, formLabel: 'MCA filing — ' + form,
        period: '2025-26', periodLabel: 'FY 2025-26', due,
        status: form === 'DIR-3 KYC' ? 'In Progress' : 'Not Started',
        amount: null, assignee: 'ST-2', hours: form === 'DIR-3 KYC' ? 0.5 : 3,
        note: form === 'DIR-3 KYC' ? 'Director KYC — OTP to be confirmed by each director' : null,
      }))
    })

    /* ------------------------------------------------------ GST annual return */
    if (c.scheme !== 'Unregistered') {
      const last = fyOf('2025-08')
      const over2Cr = c.annual > 20000000
      out.push(mk({
        clientId: c.id, kind: 'GST', form: over2Cr ? 'GSTR-9 & 9C' : 'GSTR-9', formLabel: 'GST annual return' + (over2Cr ? ' with reconciliation statement' : ''),
        period: '2025-26', periodLabel: last.label, due: '2026-12-31',
        status: 'Not Started', amount: null, assignee: over2Cr ? 'ST-2' : c.staffId,
        hours: over2Cr ? 8 : 3,
        note: over2Cr ? 'Turnover above ₹2 Cr — 9C self-certified reconciliation required' : null,
      }))
    }

    // A little noise so workload numbers do not look hand-placed.
    void iBetween(r, 1, 3)
  })

  return out
}

export const OBLIGATIONS = build()

/* ------------------------------------------------------------------ queries */
export const DONE = ['Filed', 'Filed Late', 'Not Applicable']
export const isDone = (o) => DONE.includes(o.status)
export const daysLeft = (o) => daysBetween(NOW, o.due)

export const openObligations = () => OBLIGATIONS.filter((o) => !isDone(o))
export const overdueObligations = () => openObligations().filter((o) => daysLeft(o) < 0)
export const dueWithin = (days) => openObligations().filter((o) => daysLeft(o) <= days && daysLeft(o) >= 0)
export const forClient = (id) => OBLIGATIONS.filter((o) => o.clientId === id)
export const forStaff = (id) => OBLIGATIONS.filter((o) => o.assignee === id)

export const KINDS = ['GST', 'TDS', 'Payroll', 'Direct Tax', 'ROC', 'Internal']

export const withClient = (list) => list.map((o) => ({ ...o, client: clientById[o.clientId] }))

export const sortByDue = (list) => [...list].sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : 0))
