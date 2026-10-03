// What the auditor sees of the client's actual business.
//
// This is the part no filing portal can give you. Because Real V built the
// application the business runs on, the operating numbers land in CleanBook
// next to the tax numbers — so the auditor can tell the owner something he
// did not already know, instead of asking him for bills.

export const SNAPSHOTS = {
  'CL-01': {
    headline: 'Renewals are the whole business — 41 memberships lapse this month',
    tiles: [
      { label: 'Active members', value: '612', sub: '+38 this month', tone: 'ok' },
      { label: 'Lapsing in 30d', value: '41', sub: '₹3.28 L at risk', tone: 'warn' },
      { label: 'PT sessions (Aug)', value: '486', sub: '9 trainers', tone: 'mute' },
      { label: 'Fees outstanding', value: '₹2.14 L', sub: '29 members', tone: 'bad' },
      { label: 'UPI share', value: '82%', sub: 'cash down from 34%', tone: 'ok' },
      { label: 'Avg ticket', value: '₹1,714', sub: 'per member / month', tone: 'mute' },
    ],
    flags: [
      'Two locker deposits totalling ₹18,000 are sitting in suspense — they are liabilities, not income.',
      'Annual plans collected upfront in Apr need spreading across 12 months for accrual.',
    ],
  },
  'CL-02': {
    headline: '34 trucks, 12 on hire — the hire freight is where the RCM risk lives',
    tiles: [
      { label: 'Trips (Aug)', value: '418', sub: '31 own + 12 hired trucks', tone: 'mute' },
      { label: 'On road now', value: '19', sub: 'live GPS', tone: 'brand' },
      { label: 'POD pending', value: '27', sub: 'blocks ₹14.2 L billing', tone: 'bad' },
      { label: 'Freight billed', value: '₹41.9 L', sub: 'Aug 2026', tone: 'ok' },
      { label: 'Receivables', value: '₹68.4 L', sub: '₹22 L over 90 days', tone: 'bad' },
      { label: 'Docs expiring', value: '6', sub: 'FC, insurance, permit', tone: 'warn' },
    ],
    flags: [
      'Hire-truck freight of ₹15.3 L over Jun–Aug has no RCM self-invoice against it.',
      'Driver bhatta paid in cash averages ₹2.1 L a month — this is what keeps the 44AB threshold at ₹1 Cr.',
      '27 pending PODs mean revenue is recognised in the books before the invoice can legally be raised.',
    ],
  },
  'CL-03': {
    headline: 'Aggregators are 46% of covers and settle nine days late',
    tiles: [
      { label: 'Covers (Aug)', value: '11,240', sub: 'dine-in + delivery', tone: 'mute' },
      { label: 'Aggregator share', value: '46%', sub: 'Swiggy 27% · Zomato 19%', tone: 'info' },
      { label: 'Payout unmatched', value: '₹1.86 L', sub: '14 settlement lines', tone: 'warn' },
      { label: 'Food cost', value: '31.4%', sub: 'target 29%', tone: 'warn' },
      { label: 'Wastage (Aug)', value: '₹94,200', sub: '2.8% of sales', tone: 'bad' },
      { label: 'Staff on roll', value: '38', sub: '6 on probation', tone: 'mute' },
    ],
    flags: [
      'TCS credit of ₹41,800 from aggregators has to be claimed in the Aug 3B.',
      'Kitchen equipment ITC of ₹64,200 was claimed — under the 5% scheme this must be reversed.',
      'Central kitchen transfers to the second outlet need delivery challans, not invoices.',
    ],
  },
  'CL-04': {
    headline: 'The clean one. e-invoice IRNs push straight into the books',
    tiles: [
      { label: 'Dispatches (Aug)', value: '284', sub: 'all e-invoiced', tone: 'ok' },
      { label: 'IRN failures', value: '0', sub: '31 days clean', tone: 'ok' },
      { label: 'WIP value', value: '₹1.42 Cr', sub: '9 job cards open', tone: 'mute' },
      { label: 'Scrap %', value: '1.9%', sub: 'down from 2.6%', tone: 'ok' },
      { label: 'Machine downtime', value: '38 hrs', sub: 'CNC-3 the worst', tone: 'warn' },
      { label: 'Employees', value: '112', sub: 'PF + ESI current', tone: 'ok' },
    ],
    flags: [
      'Three-way match on vendor bills runs inside PlantOps, so purchase ITC is already invoice-matched before 2B arrives.',
      'Scrap sales of ₹3.8 L for the quarter are taxable at 18% — often missed by plants.',
    ],
  },
  'CL-05': {
    headline: 'Two revenue models in one business — margin scheme and pure commission',
    tiles: [
      { label: 'Bookings (Aug)', value: '164', sub: '58 outbound tours', tone: 'mute' },
      { label: 'Gross billings', value: '₹1.58 Cr', sub: 'net revenue ₹19.4 L', tone: 'info' },
      { label: 'Vendor payable', value: '₹42.6 L', sub: '₹8.1 L overdue', tone: 'warn' },
      { label: 'Forex remitted', value: '₹64.2 L', sub: 'TCS 5% applies', tone: 'warn' },
      { label: 'Vouchers unbilled', value: '38', sub: 'Aug hotel stays', tone: 'bad' },
      { label: 'Refunds pending', value: '₹3.4 L', sub: '7 cancellations', tone: 'warn' },
    ],
    flags: [
      'Tour packages go on the margin scheme; air ticketing is pure commission at 18%. Two invoice series, two GST treatments.',
      'LRS remittances of ₹64.2 L attract TCS — needs a 27EQ line every quarter.',
      '38 unbilled hotel vouchers are the reason Aug data readiness is stuck at 61%.',
    ],
  },
  'CL-06': {
    headline: 'Prepaid packages are a liability, not turnover',
    tiles: [
      { label: 'Appointments (Aug)', value: '2,864', sub: '3 branches', tone: 'mute' },
      { label: 'Package wallet', value: '₹11.4 L', sub: 'unearned revenue', tone: 'warn' },
      { label: 'Stylist payout', value: '₹4.62 L', sub: 'commission slabs', tone: 'mute' },
      { label: 'Best branch', value: 'HSR', sub: '₹3.1 L · 38% margin', tone: 'ok' },
      { label: 'Retail products', value: '₹86,400', sub: '18% GST line', tone: 'mute' },
      { label: 'No-show rate', value: '7.2%', sub: 'down 2.1pt', tone: 'ok' },
    ],
    flags: [
      '₹11.4 L of prepaid package money has not been earned yet — recognising it as income would overstate turnover and tax.',
      'On QRMP, so cash goes out monthly via PMT-06 but the return is quarterly.',
    ],
  },
  'CL-07': {
    headline: 'No live data. Everything here is two months old',
    tiles: [
      { label: 'Books closed till', value: '30 Jun', sub: '72 days behind', tone: 'bad' },
      { label: 'Data source', value: 'Pen drive', sub: 'Tally backup', tone: 'bad' },
      { label: 'Counter cash', value: '44%', sub: 'of receipts', tone: 'bad' },
      { label: 'Stores', value: '2', sub: 'no stock link', tone: 'mute' },
      { label: 'Reminders sent', value: '3', sub: 'since 22 Aug', tone: 'warn' },
      { label: 'Est. turnover', value: '₹2.6 Cr', sub: 'from last filing', tone: 'mute' },
    ],
    flags: [
      'Jul and Aug GST returns cannot be filed at all until the backup arrives. Late fee is already running.',
      'Expiry-batch write-offs are not being recorded, so closing stock is overstated.',
      'This is the client to convert — a counter app would remove the entire chase.',
    ],
  },
  'CL-08': {
    headline: 'Nine live sites — retention and advances distort every month',
    tiles: [
      { label: 'Live projects', value: '9', sub: '3 closing this month', tone: 'mute' },
      { label: 'RA bills raised', value: '₹46.2 L', sub: 'Aug 2026', tone: 'ok' },
      { label: 'Retention held', value: '₹18.4 L', sub: 'across 14 projects', tone: 'warn' },
      { label: 'Mobilisation adv.', value: '₹9.6 L', sub: 'unadjusted', tone: 'warn' },
      { label: 'Site labour', value: '148', sub: 'attendance app', tone: 'mute' },
      { label: 'Subcontractor TDS', value: '₹62,400', sub: '194C — Aug', tone: 'info' },
    ],
    flags: [
      'Mobilisation advances of ₹9.6 L are liabilities until adjusted against RA bills — GST is still payable on receipt.',
      'Retention money is taxable when the RA bill is raised, not when it is released.',
      '34% growth puts the ₹5 Cr e-invoicing line in reach by Jan 2027.',
    ],
  },
  'CL-09': {
    headline: 'Exempt healthcare — no GST, but TDS and 44ADA still bite',
    tiles: [
      { label: 'Appointments (Aug)', value: '431', sub: '2 chairs', tone: 'mute' },
      { label: 'Collections', value: '₹7.86 L', sub: '79% digital', tone: 'ok' },
      { label: 'Lab work out', value: '₹1.24 L', sub: '194J TDS due', tone: 'warn' },
      { label: 'Insurance claims', value: '14', sub: '₹64,000 pending', tone: 'warn' },
      { label: 'Recalls due', value: '86', sub: '6-month checkups', tone: 'info' },
      { label: 'GST status', value: 'Exempt', sub: 'healthcare services', tone: 'ok' },
    ],
    flags: [
      'Healthcare service is exempt, so no GST registration is needed — but the moment retail products are sold, that changes.',
      'Lab and associate payments cross the 194J threshold; TDS for Aug is not deducted yet.',
    ],
  },
  'CL-10': {
    headline: 'Composition dealer walking into the ₹1.5 Cr wall',
    tiles: [
      { label: 'Run-rate', value: '₹1.40 Cr', sub: 'limit ₹1.50 Cr', tone: 'bad' },
      { label: 'Headroom', value: '₹10.2 L', sub: 'about 11 weeks', tone: 'bad' },
      { label: 'Cash receipts', value: '52%', sub: 'APMC trade', tone: 'warn' },
      { label: 'Data source', value: 'Bill book', sub: 'no software', tone: 'bad' },
      { label: 'Books closed till', value: '30 Jun', sub: 'manual entry', tone: 'warn' },
      { label: 'CMP-08 due', value: '18 Oct', sub: 'Q2 FY 26-27', tone: 'warn' },
    ],
    flags: [
      'Crossing ₹1.5 Cr forces an immediate exit from composition — monthly returns, ITC records and 18% output tax on a business with 4% margins.',
      'Better to plan a voluntary switch from 01 Oct than to be pushed out mid-quarter.',
    ],
  },
  'CL-11': {
    headline: 'Fee instalments across two financial years — and cash at the desk',
    tiles: [
      { label: 'Students', value: '486', sub: '14 batches', tone: 'mute' },
      { label: 'Fee collected (Aug)', value: '₹9.4 L', sub: '67% digital', tone: 'warn' },
      { label: 'Advance fee held', value: '₹27.6 L', sub: 'spans two FYs', tone: 'warn' },
      { label: 'Overdue instalments', value: '₹4.18 L', sub: '61 students', tone: 'bad' },
      { label: 'Faculty payout', value: '₹3.86 L', sub: '194J applies', tone: 'info' },
      { label: 'App go-live', value: '01 Oct', sub: 'build 70% done', tone: 'brand' },
    ],
    flags: [
      '₹27.6 L of advance fee has to be split between FY 26-27 and FY 27-28 — GST is payable on receipt, income tax on accrual.',
      'Cash at the front desk keeps digital receipts at 67%, which is the tax-audit exposure on the watchlist.',
    ],
  },
  'CL-12': {
    headline: 'Returns eat 14% of orders — and the TCS credits need chasing',
    tiles: [
      { label: 'Orders (Aug)', value: '1,960', sub: '+46% YoY', tone: 'ok' },
      { label: 'RTO / returns', value: '14.2%', sub: '278 orders', tone: 'warn' },
      { label: 'Marketplace TCS', value: '₹38,600', sub: '194-O credit', tone: 'info' },
      { label: 'Courier claims', value: '₹41,200', sub: '18 lost parcels', tone: 'warn' },
      { label: 'Stock across 3 WH', value: '₹34.8 L', sub: '46 days cover', tone: 'mute' },
      { label: 'Repeat rate', value: '31%', sub: '90-day cohort', tone: 'ok' },
    ],
    flags: [
      'Credit notes for returns must go into GSTR-1 in the same month, or output tax is overstated.',
      'TCS under 194-O collected by the marketplaces has to be matched to 26AS every quarter.',
      'Courier loss claims are income when received, not a reduction of freight expense.',
    ],
  },
}

// Everything that has landed in the practice inbox lately, newest first.
// "Auto" items came in without anyone asking — that is the product.
export const ACTIVITY = [
  { id: 'A-01', at: '2026-09-10T09:52:00+05:30', clientId: 'CL-04', kind: 'auto', title: '284 August dispatch invoices synced', detail: 'e-invoice IRNs matched 1:1. GSTR-1 for Aug already filed on 08 Sep.', icon: 'FileCheck2' },
  { id: 'A-02', at: '2026-09-10T09:14:00+05:30', clientId: 'CL-12', kind: 'auto', title: 'Amazon & Flipkart MTR files parsed', detail: '₹38,600 of 194-O TCS credit tagged for the Aug 3B.', icon: 'ShoppingBag' },
  { id: 'A-03', at: '2026-09-10T08:41:00+05:30', clientId: 'CL-02', kind: 'alert', title: 'RCM gap flagged on hire freight', detail: '₹15.3 L of unregistered-vendor freight across Jun–Aug with no self-invoice.', icon: 'AlertTriangle' },
  { id: 'A-04', at: '2026-09-09T18:26:00+05:30', clientId: 'CL-01', kind: 'client', title: 'Sandeep uploaded 6 trainer invoices', detail: 'Through the Iron Temple Studio app. 194J TDS auto-computed at ₹4,860.', icon: 'Upload' },
  { id: 'A-05', at: '2026-09-09T16:03:00+05:30', clientId: 'CL-07', kind: 'chase', title: 'Third reminder sent for Jul–Aug Tally backup', detail: 'Sent by Meena. No response since 22 Aug. Late fee now ₹1,850.', icon: 'BellRing' },
  { id: 'A-06', at: '2026-09-09T14:47:00+05:30', clientId: 'CL-03', kind: 'auto', title: 'Swiggy settlement for week 36 reconciled', detail: '11 of 14 lines matched. ₹1.86 L still unmatched across three payout batches.', icon: 'UtensilsCrossed' },
  { id: 'A-07', at: '2026-09-09T11:30:00+05:30', clientId: 'CL-10', kind: 'alert', title: 'Composition headroom under ₹11 L', detail: 'Run-rate ₹1.40 Cr. Limit breach projected for Dec 2026.', icon: 'TrendingUp' },
  { id: 'A-08', at: '2026-09-08T17:12:00+05:30', clientId: 'CL-04', kind: 'filing', title: 'GSTR-1 filed — Aug 2026', detail: 'ARN AA290826118842W. Filed by Divya, three days before the due date.', icon: 'CheckCircle2' },
  { id: 'A-09', at: '2026-09-08T15:38:00+05:30', clientId: 'CL-08', kind: 'client', title: 'Arvind approved the Aug RA bill batch', detail: '₹46.2 L across 9 sites, signed off in BuildRight Projects.', icon: 'Hammer' },
  { id: 'A-10', at: '2026-09-08T12:05:00+05:30', clientId: 'CL-05', kind: 'chase', title: '38 hotel vouchers requested from Wanderlust', detail: 'Request pushed into the client app; 12 uploaded so far.', icon: 'Plane' },
  { id: 'A-11', at: '2026-09-08T10:22:00+05:30', clientId: 'CL-06', kind: 'auto', title: 'Aug branch P&L closed for 3 branches', detail: 'Package wallet liability of ₹11.4 L carried forward, not booked as income.', icon: 'Scissors' },
  { id: 'A-12', at: '2026-09-07T19:44:00+05:30', clientId: 'CL-11', kind: 'note', title: 'Zenith Campus build at 70%', detail: 'Fee module and faculty payout done. Go-live 01 Oct, billing starts Oct.', icon: 'Wrench' },
  { id: 'A-13', at: '2026-09-07T16:15:00+05:30', clientId: 'CL-02', kind: 'auto', title: '27 PODs still pending against delivered trips', detail: '₹14.2 L of billing blocked. Driver app reminders sent automatically.', icon: 'Truck' },
  { id: 'A-14', at: '2026-09-07T11:02:00+05:30', clientId: 'CL-09', kind: 'chase', title: 'August lab bills requested from Dr. Shruti', detail: 'Needed to compute 194J TDS. Challan due 07 Sep — now overdue.', icon: 'Stethoscope' },
  { id: 'A-15', at: '2026-09-06T18:30:00+05:30', clientId: 'CL-04', kind: 'notice', title: 'ASMT-10 scrutiny notice received', detail: 'FY 2024-25, ITC mismatch of ₹2.14 L alleged. Reply due 06 Oct.', icon: 'ScrollText' },
]

export const ACTIVITY_TONE = {
  auto: 'ok', client: 'brand', chase: 'warn', alert: 'bad',
  filing: 'info', notice: 'bad', note: 'mute',
}

// How much of the month's document capture happened without a human asking.
export const AUTOMATION = {
  autoCaptured: 4218,
  totalDocs: 4610,
  hoursSaved: 96,
  chaseMessagesAvoided: 214,
  clientsOnAuto: 8,
  clientsManual: 4,
}
