// Two working queues that eat most of an auditor's month:
//   1. ITC that does not agree between the books and GSTR-2B
//   2. documents still to be prised out of the client
//
// Both are generated per client so the volumes track the client's size and
// whether their books arrive automatically.

import { CLIENTS, clientById } from './clients.js'
import { CURRENT_PERIOD } from './practice.js'
import { LEDGER } from './periods.js'
import { pLabel, addMonths } from '../lib/dates.js'
import { rngFor, pick, iBetween, between, chance } from '../lib/rng.js'

const VENDORS = {
  gym: ['Fitline Equipment Co', 'Gold Standard Nutrition', 'Cool Air Services', 'Pixel Print Media', 'Sundar Housekeeping'],
  transport: ['Sri Venkateshwara Tyres', 'Bharath Lubricants', 'Highway Body Works', 'Nagashree Diesel', 'Karnataka Toll Systems', 'Ravi Transport Hire'],
  restaurant: ['Metro Cash & Carry', 'Fresh Farm Vegetables', 'Karnataka Milk Federation', 'Rekha Packaging', 'Bharath Gas Agency', 'Coolberg Beverages'],
  manufacturing: ['Jindal Steel Traders', 'Bosch Tooling India', 'Suraksha Industrial Gases', 'Anand CNC Spares', 'Prakash Heat Treatment', 'Vishwa Logistics'],
  travel: ['Marriott Whitefield', 'IndiGo Airlines', 'Kerala Backwater Resorts', 'Sagar Cab Services', 'Global Visa Assist'],
  salon: ['Loreal Professionnel India', 'Wella Distributors', 'HSR Property Rentals', 'Shine Laundry Services', 'Beauty Basket Wholesale'],
  pharmacy: ['Alkem Distributors', 'Cipla Stockist Bengaluru', 'Sun Pharma Depot', 'Abbott Healthcare', 'MedPlus Wholesale'],
  contractor: ['Century Plyboards', 'Asian Paints Dealer', 'Hafele Hardware', 'Saint Gobain Glass', 'Kumar Labour Contractor', 'Pragati Electricals'],
  clinic: ['Dentsply Sirona India', 'Bengaluru Dental Lab', '3M ESPE Products', 'Medisafe Disposables'],
  agri: ['APMC Commission Agents', 'Nandi Gunny Bags', 'Krishna Cold Storage', 'Mysore Transport Lines'],
  education: ['Sapna Book House', 'Xerox Bulk Printing', 'Vijayanagar Property', 'EduTest Software'],
  ecommerce: ['Delhivery Courier', 'Shiprocket Logistics', 'Packman Cartons', 'Meta Platforms Ireland', 'Google Ads India', 'Shopify Commerce'],
}

const REASONS = [
  { kind: 'In books, not in 2B', tone: 'bad', action: 'Vendor has not filed GSTR-1 — hold the credit and chase' },
  { kind: 'In 2B, not in books', tone: 'warn', action: 'Bill missing from books — collect and record' },
  { kind: 'Taxable value differs', tone: 'warn', action: 'Compare invoice copy; raise debit note if short-billed' },
  { kind: 'Tax amount differs', tone: 'warn', action: 'Rate or rounding error — reconcile line-wise' },
  { kind: 'GSTIN mismatch', tone: 'bad', action: 'Vendor billed to the wrong GSTIN — ask for an amendment' },
  { kind: 'Filed in a later period', tone: 'info', action: 'Credit lands next month — no action, just track' },
]

function genItc() {
  const rows = []
  let n = 0
  CLIENTS.forEach((c) => {
    if (c.scheme === 'Unregistered' || c.scheme === 'Composition') return
    const row = LEDGER[c.id][CURRENT_PERIOD]
    if (!row.mismatch) return
    const r = rngFor('itc:' + c.id)
    const pool = VENDORS[c.vertical] || VENDORS.manufacturing
    // Bigger clients and messier books throw up more lines to chase.
    const count = Math.max(2, Math.min(9, Math.round(row.mismatchCount / (c.books.mode === 'CleanBook Auto' ? 1.6 : 8))))
    let left = row.mismatch
    for (let i = 0; i < count; i++) {
      const reason = REASONS[iBetween(r, 0, REASONS.length - 1)]
      const share = i === count - 1 ? left : Math.round(left * between(r, 0.18, 0.52))
      left -= share
      const tax = Math.max(180, share)
      const taxable = Math.round((tax / (c.gstRate / 100)) / 10) * 10
      rows.push({
        id: 'IT-' + String(++n).padStart(3, '0'),
        clientId: c.id, period: CURRENT_PERIOD, periodLabel: pLabel(CURRENT_PERIOD),
        vendor: pick(r, pool),
        gstin: '29' + String.fromCharCode(65 + iBetween(r, 0, 25)) + String.fromCharCode(65 + iBetween(r, 0, 25)) + 'CP' + iBetween(r, 1000, 9999) + 'K1Z' + iBetween(r, 1, 9),
        invoiceNo: pick(r, ['INV', 'BILL', 'GST', 'TI']) + '/' + iBetween(r, 26, 27) + '-' + iBetween(r, 100, 990),
        date: '2026-08-' + String(iBetween(r, 1, 28)).padStart(2, '0'),
        taxable, tax,
        reason: reason.kind, tone: reason.tone, action: reason.action,
        status: chance(r, c.books.mode === 'CleanBook Auto' ? 0.62 : 0.22) ? 'Vendor contacted' : 'Open',
        assignee: c.staffId,
      })
    }
  })
  return rows
}

export const ITC_ROWS = genItc()

export const itcForClient = (id) => ITC_ROWS.filter((r) => r.clientId === id)
export const itcTotals = (rows = ITC_ROWS) => ({
  count: rows.length,
  tax: rows.reduce((s, r) => s + r.tax, 0),
  atRisk: rows.filter((r) => r.reason === 'In books, not in 2B').reduce((s, r) => s + r.tax, 0),
  missingBills: rows.filter((r) => r.reason === 'In 2B, not in books').length,
})

/* ------------------------------------------------------------ document chase */
// What is still missing, who was asked, and what it is blocking. Clients on a
// Real V app get the request pushed into their own app — which is why those
// rows come back in hours instead of weeks.

const DOCS = [
  { clientId: 'CL-05', what: '38 hotel & airline vouchers for Aug', period: '2026-08', requested: '2026-09-08', channel: 'Client app', status: 'Partly received', got: 12, need: 38, blocks: 'GSTR-1 Aug', value: 1840000 },
  { clientId: 'CL-05', what: 'Forex remittance advices (LRS) — 6 nos', period: '2026-08', requested: '2026-09-08', channel: 'Client app', status: 'Pending', got: 0, need: 6, blocks: 'TCS 27EQ Q2', value: 6420000 },
  { clientId: 'CL-07', what: 'Tally backup for Jul and Aug', period: '2026-07', requested: '2026-08-22', channel: 'WhatsApp', status: 'Overdue', got: 0, need: 1, blocks: 'GSTR-1 & 3B Jul, Aug', value: null },
  { clientId: 'CL-07', what: 'Purchase bills — Alkem, Cipla, Sun Pharma (Aug)', period: '2026-08', requested: '2026-09-02', channel: 'WhatsApp', status: 'Overdue', got: 0, need: 41, blocks: 'ITC claim Aug', value: 1980000 },
  { clientId: 'CL-07', what: 'Bank statement — Canara Bank, Jul to Aug', period: '2026-08', requested: '2026-09-02', channel: 'Email', status: 'Pending', got: 0, need: 2, blocks: 'Bank reconciliation', value: null },
  { clientId: 'CL-11', what: 'Faculty payout sheet for Aug', period: '2026-08', requested: '2026-09-04', channel: 'Email', status: 'Overdue', got: 0, need: 1, blocks: 'TDS challan Aug (194J)', value: 386000 },
  { clientId: 'CL-11', what: 'Front-desk cash collection register', period: '2026-08', requested: '2026-09-04', channel: 'WhatsApp', status: 'Partly received', got: 18, need: 31, blocks: 'GSTR-1 Aug', value: 940000 },
  { clientId: 'CL-09', what: 'Dental lab bills for Aug — 9 nos', period: '2026-08', requested: '2026-09-07', channel: 'WhatsApp', status: 'Overdue', got: 2, need: 9, blocks: 'TDS challan Aug (194J)', value: 124000 },
  { clientId: 'CL-03', what: 'Swiggy & Zomato payout statements, week 34-36', period: '2026-08', requested: '2026-09-06', channel: 'Client app', status: 'Partly received', got: 11, need: 14, blocks: 'GSTR-1 Aug', value: 186000 },
  { clientId: 'CL-03', what: 'Kitchen equipment invoice (for ITC reversal)', period: '2026-06', requested: '2026-09-06', channel: 'Client app', status: 'Received', got: 1, need: 1, blocks: 'Aug 3B reversal', value: 64200 },
  { clientId: 'CL-08', what: 'Subcontractor invoices — 4 sites', period: '2026-08', requested: '2026-09-05', channel: 'Client app', status: 'Partly received', got: 27, need: 33, blocks: 'GSTR-1 Aug', value: 1420000 },
  { clientId: 'CL-08', what: 'Signed RA bill acknowledgements — Prestige site', period: '2026-08', requested: '2026-09-05', channel: 'Client app', status: 'Received', got: 3, need: 3, blocks: null, value: 980000 },
  { clientId: 'CL-02', what: 'RCM self-invoices for hire freight, Jun to Aug', period: '2026-08', requested: '2026-09-09', channel: 'Client app', status: 'Pending', got: 0, need: 3, blocks: 'GSTR-3B Aug', value: 1530000 },
  { clientId: 'CL-02', what: '27 pending PODs against delivered trips', period: '2026-08', requested: '2026-09-07', channel: 'Client app', status: 'Partly received', got: 9, need: 27, blocks: 'Aug billing', value: 1420000 },
  { clientId: 'CL-10', what: 'Bill book for Jul and Aug (APMC office)', period: '2026-08', requested: '2026-09-01', channel: 'WhatsApp', status: 'Overdue', got: 0, need: 2, blocks: 'CMP-08 Q2', value: null },
  { clientId: 'CL-01', what: 'Trainer invoices for Aug — 6 nos', period: '2026-08', requested: '2026-09-08', channel: 'Client app', status: 'Received', got: 6, need: 6, blocks: null, value: 48600 },
  { clientId: 'CL-12', what: 'Courier loss claim settlements — 18 parcels', period: '2026-08', requested: '2026-09-06', channel: 'Client app', status: 'Received', got: 18, need: 18, blocks: null, value: 41200 },
  { clientId: 'CL-06', what: 'Branch rent agreements (renewed) — 2 nos', period: '2026-08', requested: '2026-09-03', channel: 'Client app', status: 'Received', got: 2, need: 2, blocks: '194I TDS rate check', value: null },
  { clientId: 'CL-04', what: 'Scrap sale invoices for Q1 — audit sample', period: '2026-06', requested: '2026-09-02', channel: 'Client app', status: 'Received', got: 14, need: 14, blocks: null, value: 380000 },
  { clientId: 'CL-04', what: 'Board minutes for the Aug dividend', period: '2026-08', requested: '2026-09-09', channel: 'Email', status: 'Pending', got: 0, need: 1, blocks: 'AOC-4 FY 25-26', value: null },
]

export const DOC_REQUESTS = DOCS.map((d, i) => {
  const c = clientById[d.clientId]
  return {
    id: 'DR-' + String(i + 1).padStart(2, '0'),
    ...d,
    periodLabel: pLabel(d.period),
    onApp: c.realv.status === 'Live & Billing',
    assignee: c.staffId,
    ageDays: Math.round((new Date('2026-09-10') - new Date(d.requested)) / 86400000),
  }
})

export const docsForClient = (id) => DOC_REQUESTS.filter((d) => d.clientId === id)
export const openDocs = () => DOC_REQUESTS.filter((d) => d.status !== 'Received')

// Turnaround by channel — the number that justifies building the client an app.
export const CHASE_STATS = [
  { channel: 'Pushed into the client’s own app', requests: 12, avgHours: 9, closed: '83%', tone: 'ok' },
  { channel: 'WhatsApp reminder', requests: 5, avgHours: 96, closed: '31%', tone: 'warn' },
  { channel: 'Email', requests: 3, avgHours: 142, closed: '22%', tone: 'bad' },
]

export const nextPeriod = addMonths(CURRENT_PERIOD, 1)
