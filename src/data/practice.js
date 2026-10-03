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

// "Today" for the whole demo. Fixed so the filing calendar always tells the
// same story on stage — Aug-2026 GST is live, GSTR-1 falls due tomorrow.
export const TODAY = new Date('2026-09-10T10:30:00+05:30')
export const CURRENT_PERIOD = '2026-08'
export const FY = { label: 'FY 2026-27', from: '2026-04-01', to: '2027-03-31' }
export const LAST_FY = { label: 'FY 2025-26', from: '2025-04-01', to: '2026-03-31' }
