// The firm that "owns" this dashboard. CleanBook is free forever for the
// practice; the money in this app flows the other way (see data/revenue.js).

export const FIRM = {
  name: 'S. Ramanathan & Co., Chartered Accountants',
  short: 'Ramanathan & Co.',
  frn: '008412S',
  principal: 'CA S. Ramanathan',
  membership: 'ICAI 204118',
  office: '2nd Floor, 11th Main, Jayanagar 4th Block, Bengaluru 560011',
  phone: '+91 80 4123 8890',
  email: 'office@ramanathanca.in',
  plan: 'CleanBook Practice — Free forever',
  since: '2026-02-01',
  gstin: '29AACFR1182K1ZQ',
}

export const STAFF = [
  {
    id: 'ST-1', name: 'CA S. Ramanathan', short: 'Ramanathan', title: 'Principal',
    role: 'principal', phone: '+91 98450 11204', email: 's.ram@ramanathanca.in',
    scope: 'Whole practice · final review & DSC', capacity: 6, avatarTone: 'brand',
  },
  {
    id: 'ST-2', name: 'CA Divya Prasad', short: 'Divya', title: 'Manager — Audit & Direct Tax',
    role: 'manager', phone: '+91 99001 44872', email: 'divya@ramanathanca.in',
    scope: 'Company clients, tax audits, notices', capacity: 12, avatarTone: 'ok',
  },
  {
    id: 'ST-3', name: 'Kiran Kumar', short: 'Kiran', title: 'Article Assistant',
    role: 'article', phone: '+91 90192 33418', email: 'kiran@ramanathanca.in',
    scope: 'GST returns, reconciliations, data chase', capacity: 14, avatarTone: 'warn',
  },
  {
    id: 'ST-4', name: 'Meena R', short: 'Meena', title: 'Accounts Executive',
    role: 'exec', phone: '+91 96322 70155', email: 'meena@ramanathanca.in',
    scope: 'Bookkeeping, TDS, payroll compliance', capacity: 16, avatarTone: 'mute',
  },
]

export const staffById = Object.fromEntries(STAFF.map((s) => [s.id, s]))

// Portal and feed connections shown on the Settings page.
export const PORTALS = [
  { name: 'GST portal (GSTN API)', detail: 'Return filing, 2A/2B pull, ledger balances', status: 'Connected', tone: 'ok', scope: 'All 11 registered clients' },
  { name: 'e-Invoice IRP', detail: 'IRN generation and cancellation', status: 'Connected', tone: 'ok', scope: 'Precision Auto, Sri Balaji' },
  { name: 'TRACES', detail: 'Challan status, 26AS, Form 16A download', status: 'Connected', tone: 'ok', scope: '9 clients with TAN' },
  { name: 'Income tax e-filing', detail: 'ITR upload, notice inbox, DSC register', status: 'Connected', tone: 'ok', scope: 'All 12 clients' },
  { name: 'MCA V3', detail: 'AOC-4, MGT-7, DIR-3 KYC', status: 'Connected', tone: 'ok', scope: '3 companies, 1 LLP' },
  { name: 'Real V client applications', detail: 'Sales, purchase, payroll and payment feeds', status: 'Connected', tone: 'ok', scope: '8 clients live' },
  { name: 'Bank feeds (account aggregator)', detail: 'Daily statement pull for reconciliation', status: 'Partial', tone: 'warn', scope: '8 of 12 clients consented' },
  { name: 'Tally import', detail: 'Backup file parser for clients not yet on an app', status: 'Manual', tone: 'bad', scope: 'Sharada Medicals only' },
  { name: 'EPFO / ESIC', detail: 'ECR upload and challan download', status: 'Connected', tone: 'ok', scope: '9 clients' },
  { name: 'WhatsApp Business', detail: 'Reminders to clients without an app', status: 'Connected', tone: 'ok', scope: '4 manual clients' },
]

// "Today" for the whole demo. Fixed so the filing calendar always tells the
// same story on stage — Aug-2026 GST is live, GSTR-1 falls due tomorrow.
export const TODAY = new Date('2026-09-10T10:30:00+05:30')
export const CURRENT_PERIOD = '2026-08'
export const FY = { label: 'FY 2026-27', from: '2026-04-01', to: '2027-03-31' }
export const LAST_FY = { label: 'FY 2025-26', from: '2025-04-01', to: '2026-03-31' }
