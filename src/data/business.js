// The client side. Everything an owner-operator sees in the application Real V
// built for their specific business.
//
// The point of this file is that a gym and a transport company do not get the
// same screens. The People and Money spines are common — every business has
// staff and cash — but the operations module is built around how that one
// business actually runs. Eight clients, eight different apps.

import { CLIENTS } from './clients.js'
import { CURRENT_PERIOD } from './practice.js'
import { LEDGER } from './periods.js'
import { rngFor, pick, iBetween, between, chance } from '../lib/rng.js'

/* ------------------------------------------------------------------ identity */
// Each application gets its own accent, so flipping between two clients on the
// same laptop makes it obvious these are not the same product with a new logo.
export const BRAND = {
  'CL-01': { accent: '#DC2626', tagline: 'Members, trainers and renewals — Indiranagar' },
  'CL-02': { accent: '#0F766E', tagline: '34 trucks, 12 on hire — Peenya to anywhere' },
  'CL-03': { accent: '#B45309', tagline: 'Two kitchens, one central store — Malleshwaram' },
  'CL-04': { accent: '#0891B2', tagline: 'Job cards, dispatch and e-invoice — Bommasandra' },
  'CL-05': { accent: '#0EA5E9', tagline: 'Enquiry to itinerary to voucher — Jayanagar' },
  'CL-06': { accent: '#DB2777', accentIsPink: true, tagline: 'Three branches, one chair calendar — HSR' },
  'CL-07': { accent: '#059669', tagline: 'Proposed — counter billing for two stores' },
  'CL-08': { accent: '#65A30D', tagline: 'Nine sites, labour and RA bills — Koramangala' },
  'CL-09': { accent: '#7C3AED', tagline: 'Scoped — appointments, recall and lab work' },
  'CL-10': { accent: '#4D7C0F', tagline: 'Not built — still on the bill book' },
  'CL-11': { accent: '#4F46E5', tagline: 'Building — batches, fees and faculty payout' },
  'CL-12': { accent: '#7C3AED', tagline: 'Orders, returns and three warehouses — HSR' },
}

/* -------------------------------------------------------------------- people */
const FIRST = ['Manjunath', 'Shivakumar', 'Ravi', 'Prakash', 'Girish', 'Nagaraj', 'Suresh', 'Lokesh', 'Deepak', 'Basavaraj', 'Chethan', 'Mahesh', 'Naveen', 'Santhosh', 'Vinay', 'Yogesh', 'Anil', 'Kiran', 'Praveen', 'Umesh', 'Lakshmi', 'Sunitha', 'Roopa', 'Kavya', 'Divya', 'Shwetha', 'Anitha', 'Pooja', 'Rekha', 'Bhavya', 'Sowmya', 'Nandini', 'Asha', 'Meghana', 'Sridevi']
const LAST = ['Gowda', 'Hegde', 'Shetty', 'Rao', 'Naik', 'Patil', 'Reddy', 'Kumar', 'Achar', 'Bhat', 'Murthy', 'Prasad', 'Nayak', 'Kulkarni', 'Desai', 'Iyer', 'Shastri', 'Jain']

const ROLES = {
  gym: [['Gym Manager', 34000], ['Personal Trainer', 26000], ['Floor Trainer', 19000], ['Front Desk', 16000], ['Housekeeping', 13000]],
  transport: [['Driver', 21000], ['Cleaner', 13000], ['Loading Supervisor', 19000], ['Dispatch Manager', 32000], ['Mechanic', 24000], ['Accounts Assistant', 22000]],
  restaurant: [['Head Chef', 42000], ['Cook', 24000], ['Captain', 20000], ['Server', 16000], ['Cashier', 19000], ['Kitchen Helper', 14000]],
  manufacturing: [['Shift Supervisor', 38000], ['CNC Operator', 26000], ['Fitter', 23000], ['Quality Inspector', 28000], ['Store Keeper', 21000], ['Helper', 15000]],
  travel: [['Travel Consultant', 28000], ['Ticketing Executive', 22000], ['Operations Executive', 24000], ['Accounts', 25000]],
  salon: [['Senior Stylist', 32000], ['Stylist', 22000], ['Beautician', 20000], ['Receptionist', 17000], ['Housekeeping', 13000]],
  pharmacy: [['Store Manager', 28000], ['Pharmacist', 24000], ['Counter Assistant', 16000]],
  contractor: [['Site Supervisor', 34000], ['Carpenter', 24000], ['Electrician', 25000], ['Painter', 20000], ['Helper', 15000], ['Store In-charge', 22000]],
  clinic: [['Dental Assistant', 20000], ['Receptionist', 17000], ['Housekeeping', 12000]],
  education: [['Faculty — Physics', 46000], ['Faculty — Maths', 44000], ['Counsellor', 24000], ['Front Desk', 17000]],
  ecommerce: [['Ops Manager', 36000], ['Warehouse Executive', 21000], ['Packer', 16000], ['Customer Support', 19000], ['Marketing Executive', 28000]],
  agri: [['Loader', 14000], ['Accounts', 20000]],
}

const HEADCOUNT = { gym: 14, transport: 46, restaurant: 38, manufacturing: 112, travel: 9, salon: 22, pharmacy: 11, contractor: 34, clinic: 6, education: 17, ecommerce: 19, agri: 4 }

const t = (h, m) => String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0')

function genPeople(c) {
  const r = rngFor('emp:' + c.id)
  const total = HEADCOUNT[c.vertical] || 10
  const shown = Math.min(total, 13)
  const roles = ROLES[c.vertical] || ROLES.ecommerce
  const rows = []
  for (let i = 0; i < shown; i++) {
    const [role, base] = roles[i % roles.length]
    const name = pick(r, FIRST) + ' ' + pick(r, LAST)
    // On-trip drivers never punch out at the gate, which is exactly the kind of
    // thing a generic attendance app gets wrong.
    const onTrip = c.vertical === 'transport' && role === 'Driver' && chance(r, 0.55)
    const state = onTrip ? 'On trip' : chance(r, 0.06) ? 'On leave' : chance(r, 0.05) ? 'Absent' : chance(r, 0.14) ? 'Late' : 'Present'
    const inH = state === 'Late' ? iBetween(r, 10, 11) : iBetween(r, 7, 9)
    const inM = iBetween(r, 0, 59)
    const out = ['Absent', 'On leave'].includes(state) ? null : onTrip ? null : chance(r, 0.35) ? t(iBetween(r, 17, 20), iBetween(r, 0, 59)) : null
    rows.push({
      id: c.id + '-E' + (i + 1),
      name, role,
      salary: Math.round(base * between(r, 0.92, 1.14) / 500) * 500,
      phone: '+91 9' + iBetween(r, 1000000, 9999999) + iBetween(r, 10, 99),
      since: iBetween(r, 2019, 2026) + '-' + String(iBetween(r, 1, 12)).padStart(2, '0') + '-01',
      state,
      inAt: ['Absent', 'On leave'].includes(state) ? null : t(inH, inM),
      outAt: out,
      onDutyNow: !out && !['Absent', 'On leave'].includes(state),
      daysThisMonth: iBetween(r, 22, 26),
      otHours: chance(r, 0.4) ? iBetween(r, 2, 18) : 0,
      advance: chance(r, 0.3) ? iBetween(r, 1, 8) * 1000 : 0,
    })
  }
  return { total, rows }
}

export const PEOPLE = {}
CLIENTS.forEach((c) => { PEOPLE[c.id] = genPeople(c) })

export function attendanceSummary(clientId) {
  const rows = PEOPLE[clientId].rows
  const total = PEOPLE[clientId].total
  const sample = rows.length
  const scale = total / sample
  const count = (f) => Math.round(rows.filter(f).length * scale)
  return {
    total,
    present: count((e) => e.state === 'Present'),
    late: count((e) => e.state === 'Late'),
    onTrip: count((e) => e.state === 'On trip'),
    absent: count((e) => e.state === 'Absent'),
    leave: count((e) => e.state === 'On leave'),
    onDuty: count((e) => e.onDutyNow),
  }
}

/* --------------------------------------------------------------------- money */
export const MONEY = {}
CLIENTS.forEach((c) => {
  const r = rngFor('money:' + c.id)
  const row = LEDGER[c.id][CURRENT_PERIOD]
  const dayRate = row.sales / 30
  const collectedToday = Math.round(dayRate * between(r, 0.6, 1.5) / 100) * 100
  const receivables = c.vertical === 'gym' || c.vertical === 'salon' || c.vertical === 'restaurant'
    ? Math.round(row.sales * between(r, 0.04, 0.09))
    : Math.round(row.sales * between(r, 0.9, 2.1))
  const payroll = PEOPLE[c.id].rows.reduce((s, e) => s + e.salary, 0) * (PEOPLE[c.id].total / PEOPLE[c.id].rows.length)
  MONEY[c.id] = {
    collectedToday,
    collectedMonth: Math.round(row.sales * between(r, 0.72, 0.94)),
    billedMonth: row.sales,
    cashInHand: Math.round(row.sales * c.cashRatio * between(r, 0.05, 0.14) / 100) * 100,
    bank: Math.round(row.sales * between(r, 0.18, 0.64) / 1000) * 1000,
    receivables,
    ageing: [
      { label: '0–30 days', value: Math.round(receivables * 0.46), tone: 'ok' },
      { label: '31–60 days', value: Math.round(receivables * 0.27), tone: 'info' },
      { label: '61–90 days', value: Math.round(receivables * 0.15), tone: 'warn' },
      { label: 'Over 90 days', value: Math.round(receivables * 0.12), tone: 'bad' },
    ],
    payables: Math.round(row.purchases * between(r, 0.4, 1.1)),
    expensesMonth: Math.round(row.purchases * between(r, 0.85, 1.05)),
    payrollMonth: Math.round(payroll / 1000) * 1000,
    payrollDue: c.pf ? Math.round(payroll / 1000) * 1000 : 0,
    gstPayable: row.netPayable,
    profitMonth: Math.round((row.sales - row.purchases - payroll) * between(r, 0.85, 1.05)),
  }
})

/* ---------------------------------------------------------------- operations */
// One operations module per trade. Same generic table renderer, completely
// different content — which is the whole argument for building custom.

const CITIES = ['Hosur', 'Tumkur', 'Mysuru', 'Hubballi', 'Chennai', 'Hyderabad', 'Pune', 'Salem', 'Mangaluru', 'Belagavi', 'Nashik', 'Coimbatore']
const PLANS = [['Monthly', 1800], ['Quarterly', 4800], ['Half-yearly', 8400], ['Annual', 14000], ['Annual + PT', 32000]]

function ops(c) {
  const r = rngFor('ops:' + c.id)
  const name = () => pick(r, FIRST) + ' ' + pick(r, LAST)
  const v = c.vertical

  if (v === 'gym') {
    const rows = Array.from({ length: 16 }, (_, i) => {
      const [plan, fee] = pick(r, PLANS)
      const daysLeft = iBetween(r, -12, 90)
      const dues = chance(r, 0.22) ? Math.round(fee * between(r, 0.3, 1)) : 0
      return {
        member: name(), memberSub: 'M-' + iBetween(r, 1000, 9999),
        plan, planTone: plan.includes('PT') ? 'brand' : 'mute',
        fee,
        expiry: daysLeft < 0 ? 'Expired ' + -daysLeft + 'd ago' : daysLeft + ' days left',
        expiryTone: daysLeft < 0 ? 'bad' : daysLeft < 15 ? 'warn' : 'ok',
        dues,
        lastVisit: chance(r, 0.7) ? 'Today ' + t(iBetween(r, 6, 21), iBetween(r, 0, 59)) : iBetween(r, 2, 24) + ' days ago',
        visits: iBetween(r, 2, 26),
      }
    })
    return {
      label: 'Members', icon: 'Dumbbell',
      primary: {
        title: 'Members and renewals', sub: '612 active · 41 lapse this month · ₹3.28 L at risk',
        columns: [
          { key: 'member', label: 'Member', type: 'sub' },
          { key: 'plan', label: 'Plan', type: 'pill' },
          { key: 'fee', label: 'Plan value', type: 'money', align: 'right' },
          { key: 'expiry', label: 'Renewal', type: 'pill' },
          { key: 'dues', label: 'Dues', type: 'money', align: 'right' },
          { key: 'visits', label: 'Visits this month', type: 'num', align: 'right' },
          { key: 'lastVisit', label: 'Last check-in', type: 'text' },
        ],
        rows,
      },
      secondary: {
        title: 'Personal training today', sub: '9 trainers on the floor',
        columns: [
          { key: 'slot', label: 'Slot', type: 'text' },
          { key: 'trainer', label: 'Trainer', type: 'text' },
          { key: 'member', label: 'Member', type: 'text' },
          { key: 'focus', label: 'Focus', type: 'text' },
          { key: 'status', label: 'Status', type: 'pill' },
        ],
        rows: Array.from({ length: 8 }, (_, i) => {
          const done = i < 4
          return {
            slot: t(6 + i * 2, 0) + '–' + t(7 + i * 2, 0),
            trainer: name(), member: name(),
            focus: pick(r, ['Push day', 'Legs', 'Cardio + core', 'Deadlift form', 'Weight loss', 'Rehab — knee']),
            status: done ? 'Done' : i === 4 ? 'In progress' : 'Upcoming',
            statusTone: done ? 'ok' : i === 4 ? 'brand' : 'mute',
          }
        }),
      },
    }
  }

  if (v === 'transport') {
    const rows = Array.from({ length: 16 }, (_, i) => {
      const st = pick(r, ['On trip', 'On trip', 'On trip', 'Loading', 'Idle', 'In garage'])
      const exp = iBetween(r, -5, 180)
      return {
        vehicle: 'KA-' + iBetween(r, 1, 53) + '-' + pick(r, ['AB', 'AC', 'B', 'C', 'D']) + '-' + iBetween(r, 1000, 9999),
        vehicleSub: pick(r, ['Tata 1109', 'Ashok Leyland 1616', 'Eicher Pro 3015', 'Tata Signa 4923', 'BharatBenz 1917']),
        driver: name(),
        status: st,
        statusTone: st === 'On trip' ? 'brand' : st === 'Loading' ? 'info' : st === 'Idle' ? 'warn' : 'bad',
        where: st === 'On trip' ? 'NH-48 near ' + pick(r, CITIES) : st === 'In garage' ? 'Peenya workshop' : 'Peenya yard',
        lr: st === 'Idle' || st === 'In garage' ? '—' : 'LR-' + iBetween(r, 24000, 24999),
        freight: st === 'Idle' || st === 'In garage' ? 0 : iBetween(r, 18, 92) * 1000,
        docs: exp < 0 ? 'Expired' : exp + 'd',
        docsTone: exp < 0 ? 'bad' : exp < 30 ? 'warn' : 'ok',
      }
    })
    return {
      label: 'Fleet', icon: 'Truck',
      primary: {
        title: 'Where every truck is right now', sub: '19 on road · 27 PODs pending · ₹14.2 L of billing blocked',
        columns: [
          { key: 'vehicle', label: 'Vehicle', type: 'sub' },
          { key: 'driver', label: 'Driver', type: 'text' },
          { key: 'status', label: 'Status', type: 'pill' },
          { key: 'where', label: 'Last position', type: 'text' },
          { key: 'lr', label: 'LR', type: 'text' },
          { key: 'freight', label: 'Freight', type: 'money', align: 'right' },
          { key: 'docs', label: 'Papers expire', type: 'pill' },
        ],
        rows,
      },
      secondary: {
        title: 'Deliveries waiting on a POD', sub: 'Until the paper comes back, the invoice cannot go out',
        columns: [
          { key: 'lr', label: 'LR', type: 'text' },
          { key: 'party', label: 'Consignor', type: 'text' },
          { key: 'route', label: 'Route', type: 'text' },
          { key: 'delivered', label: 'Delivered', type: 'text' },
          { key: 'value', label: 'Freight', type: 'money', align: 'right' },
          { key: 'status', label: 'POD', type: 'pill' },
        ],
        rows: Array.from({ length: 10 }, () => {
          const d = iBetween(r, 1, 16)
          return {
            lr: 'LR-' + iBetween(r, 23800, 24200),
            party: pick(r, ['Precision Auto Components', 'Sundaram Fasteners', 'Bosch Adugodi', 'Toyota Bidadi', 'Wipro Consumer', 'ITC Foods']),
            route: 'Peenya → ' + pick(r, CITIES),
            delivered: d + ' days ago',
            value: iBetween(r, 22, 88) * 1000,
            status: d > 10 ? 'Chase driver' : 'Awaiting upload',
            statusTone: d > 10 ? 'bad' : 'warn',
          }
        }),
      },
    }
  }

  if (v === 'restaurant') {
    return {
      label: 'Service', icon: 'UtensilsCrossed',
      primary: {
        title: 'Today’s service', sub: 'Dine-in 214 covers · delivery 186 orders · ₹1.42 L so far',
        columns: [
          { key: 'slot', label: 'Hour', type: 'text' },
          { key: 'covers', label: 'Dine-in covers', type: 'num', align: 'right' },
          { key: 'delivery', label: 'Delivery orders', type: 'num', align: 'right' },
          { key: 'sales', label: 'Sales', type: 'money', align: 'right' },
          { key: 'avg', label: 'Average bill', type: 'money', align: 'right' },
          { key: 'wait', label: 'Kitchen wait', type: 'pill' },
        ],
        rows: ['07–09', '09–11', '11–13', '13–15', '15–17', '17–19', '19–21', '21–23'].map((slot, i) => {
          const peak = [1, 2, 6].includes(i)
          const covers = peak ? iBetween(r, 34, 58) : iBetween(r, 8, 26)
          const delivery = peak ? iBetween(r, 28, 46) : iBetween(r, 6, 22)
          const sales = (covers * iBetween(r, 240, 420)) + (delivery * iBetween(r, 280, 460))
          const w = peak ? iBetween(r, 18, 32) : iBetween(r, 6, 14)
          return {
            slot, covers, delivery, sales, avg: Math.round(sales / (covers + delivery)),
            wait: w + ' min', waitTone: w > 24 ? 'bad' : w > 16 ? 'warn' : 'ok',
          }
        }),
      },
      secondary: {
        title: 'Store and wastage', sub: 'Yesterday’s close · anything red needs an indent today',
        columns: [
          { key: 'item', label: 'Item', type: 'text' },
          { key: 'onHand', label: 'On hand', type: 'text' },
          { key: 'reorder', label: 'Reorder at', type: 'text' },
          { key: 'used', label: 'Used yesterday', type: 'text' },
          { key: 'waste', label: 'Wastage', type: 'money', align: 'right' },
          { key: 'status', label: 'Action', type: 'pill' },
        ],
        rows: [
          ['Dosa batter', '48 kg', '60 kg', '92 kg', 1240, 'Indent now', 'bad'],
          ['Paneer', '11 kg', '15 kg', '18 kg', 680, 'Indent now', 'bad'],
          ['Onion', '140 kg', '80 kg', '64 kg', 2100, 'Watch wastage', 'warn'],
          ['Refined oil', '90 L', '60 L', '38 L', 0, 'Fine', 'ok'],
          ['Milk (KMF)', '120 L', '100 L', '148 L', 420, 'Indent now', 'bad'],
          ['Coffee powder', '22 kg', '12 kg', '9 kg', 0, 'Fine', 'ok'],
          ['Tomato', '58 kg', '50 kg', '61 kg', 1860, 'Watch wastage', 'warn'],
        ].map(([item, onHand, reorder, used, waste, status, statusTone]) => ({ item, onHand, reorder, used, waste, status, statusTone })),
      },
    }
  }

  if (v === 'manufacturing') {
    return {
      label: 'Plant', icon: 'Factory',
      primary: {
        title: 'Job cards on the floor', sub: '9 open · WIP ₹1.42 Cr · scrap 1.9%',
        columns: [
          { key: 'job', label: 'Job card', type: 'sub' },
          { key: 'customer', label: 'Customer', type: 'text' },
          { key: 'qty', label: 'Qty', type: 'num', align: 'right' },
          { key: 'stage', label: 'Stage', type: 'pill' },
          { key: 'machine', label: 'Machine', type: 'text' },
          { key: 'progress', label: 'Progress', type: 'bar' },
          { key: 'due', label: 'Promised', type: 'pill' },
        ],
        rows: Array.from({ length: 12 }, (_, i) => {
          const stage = pick(r, ['Turning', 'Milling', 'Heat treatment', 'Grinding', 'Inspection', 'Ready to dispatch'])
          const prog = stage === 'Ready to dispatch' ? 100 : iBetween(r, 15, 92)
          const d = iBetween(r, -2, 12)
          return {
            job: 'JC-' + iBetween(r, 4400, 4499), jobSub: pick(r, ['Bracket 41-A', 'Shaft 22-B', 'Housing 09-C', 'Flange 77-D', 'Pin 14-E', 'Cover 31-F']),
            customer: pick(r, ['Bosch Adugodi', 'Toyota Bidadi', 'Sundaram Fasteners', 'Ashok Leyland', 'TVS Hosur', 'Wabco Chennai']),
            qty: iBetween(r, 200, 4000),
            stage, stageTone: stage === 'Ready to dispatch' ? 'ok' : stage === 'Inspection' ? 'info' : 'brand',
            machine: pick(r, ['CNC-1', 'CNC-2', 'CNC-3', 'VMC-1', 'Grinder-2', 'Lathe-4']),
            progress: prog,
            due: d < 0 ? -d + 'd late' : 'in ' + d + 'd',
            dueTone: d < 0 ? 'bad' : d < 3 ? 'warn' : 'ok',
          }
        }),
      },
      secondary: {
        title: 'Machines and downtime', sub: '38 hours lost this month — CNC-3 is most of it',
        columns: [
          { key: 'machine', label: 'Machine', type: 'text' },
          { key: 'state', label: 'Now', type: 'pill' },
          { key: 'util', label: 'Utilisation', type: 'bar' },
          { key: 'down', label: 'Downtime (Aug)', type: 'text' },
          { key: 'reason', label: 'Last stoppage', type: 'text' },
          { key: 'service', label: 'Next service', type: 'text' },
        ],
        rows: [
          ['CNC-1', 'Running', 'ok', 91, '3 hrs', 'Tool change', 'in 22 days'],
          ['CNC-2', 'Running', 'ok', 88, '5 hrs', 'Coolant top-up', 'in 9 days'],
          ['CNC-3', 'Breakdown', 'bad', 46, '21 hrs', 'Spindle bearing', 'overdue'],
          ['VMC-1', 'Running', 'ok', 84, '4 hrs', 'Power dip', 'in 31 days'],
          ['Grinder-2', 'Idle — no load', 'warn', 62, '2 hrs', 'Awaiting job', 'in 44 days'],
          ['Lathe-4', 'Running', 'ok', 79, '3 hrs', 'Operator break', 'in 17 days'],
        ].map(([machine, state, stateTone, util, down, reason, service]) => ({ machine, state, stateTone, util, down, reason, service })),
      },
    }
  }

  if (v === 'travel') {
    return {
      label: 'Bookings', icon: 'Plane',
      primary: {
        title: 'Live bookings', sub: '164 in August · ₹1.58 Cr billed gross · ₹19.4 L net revenue',
        columns: [
          { key: 'ref', label: 'Booking', type: 'sub' },
          { key: 'customer', label: 'Customer', type: 'text' },
          { key: 'package', label: 'Package', type: 'text' },
          { key: 'travel', label: 'Travel date', type: 'pill' },
          { key: 'value', label: 'Billed', type: 'money', align: 'right' },
          { key: 'payable', label: 'Vendor payable', type: 'money', align: 'right' },
          { key: 'status', label: 'Vouchers', type: 'pill' },
        ],
        rows: Array.from({ length: 14 }, () => {
          const d = iBetween(r, -20, 40)
          const value = iBetween(r, 42, 480) * 1000
          const vouchers = chance(r, 0.6)
          return {
            ref: 'WL-' + iBetween(r, 6100, 6299), refSub: pick(r, ['Family', 'Honeymoon', 'Corporate', 'Group of 14', 'Solo']),
            customer: pick(r, FIRST) + ' ' + pick(r, LAST),
            package: pick(r, ['Kerala 6N/7D', 'Dubai 4N/5D', 'Bali 5N/6D', 'Coorg weekend', 'Andaman 5N', 'Europe 9N', 'Ladakh 7N']),
            travel: d < 0 ? 'Travelled' : 'in ' + d + 'd', travelTone: d < 0 ? 'mute' : d < 7 ? 'warn' : 'info',
            value, payable: Math.round(value * between(r, 0.6, 0.82)),
            status: vouchers ? 'All in' : 'Missing',
            statusTone: vouchers ? 'ok' : 'bad',
          }
        }),
      },
      secondary: {
        title: 'Vendor payables', sub: '₹42.6 L outstanding · ₹8.1 L already overdue',
        columns: [
          { key: 'vendor', label: 'Vendor', type: 'text' },
          { key: 'kind', label: 'Type', type: 'pill' },
          { key: 'amount', label: 'Payable', type: 'money', align: 'right' },
          { key: 'due', label: 'Due', type: 'pill' },
          { key: 'bookings', label: 'Against bookings', type: 'num', align: 'right' },
        ],
        rows: [
          ['Marriott Whitefield', 'Hotel', 'info', 862000, '4d overdue', 'bad', 6],
          ['IndiGo Airlines', 'Air', 'brand', 1240000, 'in 3d', 'warn', 22],
          ['Kerala Backwater Resorts', 'Hotel', 'info', 486000, 'in 11d', 'ok', 4],
          ['Sagar Cab Services', 'Transport', 'mute', 214000, '9d overdue', 'bad', 18],
          ['Global Visa Assist', 'Visa', 'mute', 96000, 'in 18d', 'ok', 12],
        ].map(([vendor, kind, kindTone, amount, due, dueTone, bookings]) => ({ vendor, kind, kindTone, amount, due, dueTone, bookings })),
      },
    }
  }

  if (v === 'salon') {
    return {
      label: 'Chairs', icon: 'Scissors',
      primary: {
        title: 'Today’s chair calendar', sub: 'Three branches · 2,864 appointments in August · 7.2% no-show',
        columns: [
          { key: 'time', label: 'Time', type: 'text' },
          { key: 'customer', label: 'Customer', type: 'sub' },
          { key: 'service', label: 'Service', type: 'text' },
          { key: 'stylist', label: 'Stylist', type: 'text' },
          { key: 'branch', label: 'Branch', type: 'pill' },
          { key: 'amount', label: 'Bill', type: 'money', align: 'right' },
          { key: 'status', label: 'Status', type: 'pill' },
        ],
        rows: Array.from({ length: 15 }, (_, i) => {
          const hour = 9 + Math.floor(i * 0.8)
          const done = i < 6
          const wallet = chance(r, 0.35)
          const branch = pick(r, ['HSR', 'Indiranagar', 'Whitefield'])
          return {
            time: t(hour, i % 2 ? 30 : 0),
            customer: pick(r, FIRST) + ' ' + pick(r, LAST), customerSub: wallet ? 'Package member' : 'Walk-in',
            service: pick(r, ['Hair cut + wash', 'Global colour', 'Keratin', 'Facial — gold', 'Bridal trial', 'Pedicure', 'Beard styling']),
            stylist: pick(r, FIRST),
            branch, branchTone: branch === 'HSR' ? 'brand' : 'mute',
            amount: iBetween(r, 4, 68) * 100,
            status: done ? 'Billed' : i === 6 ? 'In chair' : chance(r, 0.12) ? 'No show' : 'Booked',
            statusTone: done ? 'ok' : i === 6 ? 'brand' : 'mute',
          }
        }),
      },
      secondary: {
        title: 'Prepaid packages', sub: '₹11.4 L of wallet money still to be served — this is a liability, not income',
        columns: [
          { key: 'customer', label: 'Customer', type: 'text' },
          { key: 'package', label: 'Package', type: 'text' },
          { key: 'paid', label: 'Paid upfront', type: 'money', align: 'right' },
          { key: 'used', label: 'Used', type: 'money', align: 'right' },
          { key: 'left', label: 'Balance', type: 'money', align: 'right' },
          { key: 'expiry', label: 'Valid till', type: 'pill' },
        ],
        rows: Array.from({ length: 8 }, () => {
          const paid = iBetween(r, 8, 40) * 1000
          const used = Math.round(paid * between(r, 0.1, 0.8))
          const d = iBetween(r, 10, 240)
          return {
            customer: pick(r, FIRST) + ' ' + pick(r, LAST),
            package: pick(r, ['Hair care 10+2', 'Bridal 6 sitting', 'Facial 8 pack', 'Colour 4 pack', 'Grooming annual']),
            paid, used, left: paid - used,
            expiry: d + ' days', expiryTone: d < 30 ? 'warn' : 'ok',
          }
        }),
      },
    }
  }

  if (v === 'contractor') {
    return {
      label: 'Sites', icon: 'Hammer',
      primary: {
        title: 'Nine live sites', sub: 'RA bills ₹46.2 L in August · retention held ₹18.4 L',
        columns: [
          { key: 'site', label: 'Site', type: 'sub' },
          { key: 'value', label: 'Order value', type: 'money', align: 'right' },
          { key: 'progress', label: 'Work done', type: 'bar' },
          { key: 'billed', label: 'Billed', type: 'money', align: 'right' },
          { key: 'retention', label: 'Retention held', type: 'money', align: 'right' },
          { key: 'labour', label: 'Labour today', type: 'num', align: 'right' },
          { key: 'milestone', label: 'Next milestone', type: 'pill' },
        ],
        rows: [
          ['Prestige Tech Park — 4th floor', 'Prestige Group', 8600000, 78, 6400000, 640000, 34, 'in 6d', 'warn'],
          ['Sobha Villa — Whitefield', 'Private owner', 4200000, 92, 3800000, 380000, 12, 'in 12d', 'ok'],
          ['Cafe Noir — Koramangala', 'Noir Hospitality', 1800000, 46, 800000, 80000, 9, 'in 21d', 'ok'],
          ['Manyata Block C — fit-out', 'Embassy', 12400000, 34, 4100000, 410000, 41, 'in 4d', 'bad'],
          ['Dental clinic — Rajajinagar', 'Kaveri Dental', 900000, 100, 900000, 45000, 0, 'Handover', 'ok'],
          ['RMZ Ecoworld — meeting rooms', 'RMZ', 6800000, 61, 4200000, 420000, 22, 'in 9d', 'warn'],
          ['Home — Sadashivanagar', 'Private owner', 3400000, 18, 600000, 60000, 14, 'in 30d', 'ok'],
          ['Bakery — Jayanagar', 'Crust & Crumb', 1200000, 84, 1000000, 100000, 6, 'in 8d', 'ok'],
          ['Office — MG Road', 'Zeta Systems', 2600000, 52, 1400000, 140000, 10, 'in 15d', 'warn'],
        ].map(([site, siteSub, value, progress, billed, retention, labour, milestone, milestoneTone]) =>
          ({ site, siteSub, value, progress, billed, retention, labour, milestone, milestoneTone })),
      },
      secondary: {
        title: 'Material issued to site', sub: 'Anything not returned or consumed is a leak',
        columns: [
          { key: 'item', label: 'Material', type: 'text' },
          { key: 'site', label: 'Issued to', type: 'text' },
          { key: 'issued', label: 'Issued', type: 'text' },
          { key: 'used', label: 'Consumed', type: 'text' },
          { key: 'back', label: 'Returned', type: 'text' },
          { key: 'gap', label: 'Unaccounted', type: 'pill' },
        ],
        rows: [
          ['Plywood 18mm', 'Prestige Tech Park', '140 sheets', '128', '6', '6 sheets', 'warn'],
          ['Laminate', 'Manyata Block C', '210 sheets', '196', '14', 'Nil', 'ok'],
          ['Emulsion paint', 'Sobha Villa', '46 buckets', '44', '2', 'Nil', 'ok'],
          ['Electrical conduit', 'RMZ Ecoworld', '820 m', '740 m', '20 m', '60 m', 'bad'],
          ['Hardware — hinges', 'Cafe Noir', '400 nos', '388', 'Nil', '12 nos', 'warn'],
        ].map(([item, site, issued, used, back, gap, gapTone]) => ({ item, site, issued, used, back, gap, gapTone })),
      },
    }
  }

  if (v === 'ecommerce') {
    return {
      label: 'Orders', icon: 'ShoppingBag',
      primary: {
        title: 'Orders today', sub: '1,960 in August · 14.2% RTO · repeat rate 31%',
        columns: [
          { key: 'order', label: 'Order', type: 'sub' },
          { key: 'customer', label: 'Customer', type: 'text' },
          { key: 'city', label: 'Ship to', type: 'text' },
          { key: 'value', label: 'Value', type: 'money', align: 'right' },
          { key: 'channel', label: 'Channel', type: 'pill' },
          { key: 'courier', label: 'Courier', type: 'text' },
          { key: 'status', label: 'Status', type: 'pill' },
        ],
        rows: Array.from({ length: 15 }, () => {
          const st = pick(r, ['Delivered', 'In transit', 'Out for delivery', 'Packed', 'RTO', 'RTO'])
          const ch = pick(r, ['Website', 'Website', 'Amazon', 'Flipkart', 'Instagram'])
          return {
            order: '#UK-' + iBetween(r, 41000, 41999), orderSub: iBetween(r, 1, 4) + ' item(s)',
            customer: pick(r, FIRST) + ' ' + pick(r, LAST),
            city: pick(r, ['Bengaluru', 'Mumbai', 'Delhi', 'Pune', 'Hyderabad', 'Kochi', 'Jaipur', 'Kolkata']),
            value: iBetween(r, 4, 74) * 100,
            channel: ch, channelTone: ch === 'Website' ? 'brand' : 'mute',
            courier: pick(r, ['Delhivery', 'Shiprocket', 'Bluedart', 'Ekart']),
            status: st, statusTone: st === 'Delivered' ? 'ok' : st === 'RTO' ? 'bad' : 'info',
          }
        }),
      },
      secondary: {
        title: 'Returns and courier claims', sub: '278 returns in August · ₹41,200 stuck in 18 lost-parcel claims',
        columns: [
          { key: 'reason', label: 'Return reason', type: 'text' },
          { key: 'count', label: 'Orders', type: 'num', align: 'right' },
          { key: 'value', label: 'Value', type: 'money', align: 'right' },
          { key: 'share', label: 'Share of returns', type: 'bar' },
          { key: 'action', label: 'What to fix', type: 'text' },
        ],
        rows: [
          ['Customer not available (RTO)', 96, 214000, 35, 'Confirm on WhatsApp before dispatch'],
          ['Size or fit wrong', 71, 168000, 26, 'Size chart on the product page'],
          ['Damaged in transit', 44, 104000, 16, 'Switch to double-wall cartons'],
          ['Changed mind', 38, 82000, 14, 'Nothing — cost of doing business'],
          ['Wrong item packed', 29, 61000, 9, 'Barcode scan at packing — this one is on us'],
        ].map(([reason, count, value, share, action]) => ({ reason, count, value, share, action })),
      },
    }
  }

  if (v === 'education') {
    return {
      label: 'Batches', icon: 'GraduationCap',
      primary: {
        title: 'Batches and fee collection', sub: '486 students · 14 batches · ₹4.18 L of instalments overdue',
        columns: [
          { key: 'batch', label: 'Batch', type: 'sub' },
          { key: 'students', label: 'Students', type: 'num', align: 'right' },
          { key: 'faculty', label: 'Faculty', type: 'text' },
          { key: 'collected', label: 'Collected', type: 'money', align: 'right' },
          { key: 'due', label: 'Overdue', type: 'money', align: 'right' },
          { key: 'attendance', label: 'Attendance', type: 'bar' },
        ],
        rows: Array.from({ length: 10 }, (_, i) => ({
          batch: pick(r, ['JEE Main', 'NEET', 'CET', 'Foundation IX', 'Foundation X']) + ' — ' + pick(r, ['Morning', 'Evening', 'Weekend']),
          batchSub: 'Room ' + (i + 1),
          students: iBetween(r, 18, 52),
          faculty: pick(r, FIRST) + ' ' + pick(r, LAST),
          collected: iBetween(r, 3, 22) * 100000,
          due: iBetween(r, 0, 8) * 10000,
          attendance: iBetween(r, 62, 96),
        })),
      },
    }
  }

  // Free-tier and not-yet-built clients have no operations module at all.
  return null
}

export const OPS = {}
CLIENTS.forEach((c) => { OPS[c.id] = ops(c) })

/* ----------------------------------------------------------- today's feed */
// What happened in the business today, in the owner's language.
const FEED_BY_VERTICAL = {
  gym: [
    ['07:12', 'Manjunath opened the floor', 'Shutter, lights and AC on. Biometric live.', 'ok'],
    ['08:40', '38 members checked in before 9', 'Morning batch is the busiest it has been this month.', 'ok'],
    ['11:05', 'Renewal collected — ₹14,000', 'Annual plan, paid by UPI. Receipt sent on WhatsApp.', 'ok'],
    ['13:22', '3 members crossed 15 days without a visit', 'Auto-nudge sent. Two replied.', 'info'],
    ['16:48', 'Treadmill 4 flagged by a trainer', 'Belt slipping. Service call raised with Fitline.', 'warn'],
    ['18:30', 'Peak hour — 74 on the floor', 'Two trainers on PT, one on floor duty.', 'info'],
  ],
  transport: [
    ['05:40', 'KA-51-AC-4412 loaded and left', 'Peenya → Hosur. LR-24188. Bosch consignment.', 'ok'],
    ['08:15', 'Driver Shivakumar took ₹4,000 bhatta', 'Against trip LR-24191. Auto-adjusted in his payout.', 'info'],
    ['10:02', 'Toll and diesel logged for 6 trucks', 'Fastag feed matched to trips automatically.', 'ok'],
    ['12:34', 'KA-01-AB-7781 broke down near Tumkur', 'Mechanic dispatched. ETA delayed by 5 hours; consignor informed.', 'bad'],
    ['15:20', '3 PODs uploaded from the driver app', 'LR-24162, 24170, 24177 — invoices can go out now.', 'ok'],
    ['17:55', 'Insurance for KA-41-C-2210 expires in 6 days', 'Renewal quote pulled. Needs your approval.', 'warn'],
  ],
  restaurant: [
    ['06:30', 'Kitchen opened, indent raised', 'Dosa batter, milk and paneer below reorder level.', 'warn'],
    ['09:15', 'Breakfast rush cleared — 96 covers', 'Average bill ₹212. Kitchen wait peaked at 14 minutes.', 'ok'],
    ['12:05', 'Swiggy went live for lunch', '46 orders in the first hour. One order cancelled by the rider.', 'info'],
    ['14:20', 'Wastage logged — ₹1,240', 'Dosa batter over-prepped. Third time this week.', 'bad'],
    ['16:00', 'Zomato payout received — ₹68,400', 'Matched against 11 of 14 settlement lines.', 'ok'],
    ['20:40', 'Dinner peak — 58 covers, 22 min wait', 'Two tables walked out. Consider one more captain on Fridays.', 'warn'],
  ],
  manufacturing: [
    ['06:00', 'A-shift started — 38 on the floor', 'Attendance synced to payroll. Two absent, both informed.', 'ok'],
    ['07:30', 'JC-4471 moved to inspection', '2,400 brackets for Bosch. Scrap 1.6% — under target.', 'ok'],
    ['09:45', 'CNC-3 stopped — spindle bearing', '21 hours lost this month on this machine alone.', 'bad'],
    ['11:20', '14 dispatches e-invoiced', 'All IRNs generated. No failures for 31 days.', 'ok'],
    ['14:10', 'Vendor bill mismatch held', 'Jindal Steel billed 4.2 T against a 4.0 T GRN. Payment blocked.', 'warn'],
    ['17:00', 'Scrap sale weighed — 1.8 T', '₹96,000. Taxable at 18% — flagged to the accounts team.', 'info'],
  ],
  travel: [
    ['09:10', 'Two new enquiries from the website', 'Kerala 6N and Dubai 4N. Assigned to Roopa.', 'ok'],
    ['10:45', 'Booking WL-6188 confirmed — ₹2.4 L', 'Family of five, Andaman. 40% advance received.', 'ok'],
    ['12:30', 'IndiGo payment due in 3 days', '₹12.4 L against 22 bookings. Cash position is tight.', 'warn'],
    ['14:15', 'Marriott payable now 4 days overdue', '₹8.62 L. They have stopped confirming new rooms.', 'bad'],
    ['16:20', '12 of 38 vouchers uploaded', 'Your CA needs the rest before the GST return.', 'warn'],
    ['18:05', 'Forex remitted — ₹6.4 L', 'TCS at 5% applies. Recorded for the quarterly 27EQ.', 'info'],
  ],
  salon: [
    ['09:00', 'All three branches opened', 'HSR 6 chairs, Indiranagar 4, Whitefield 4.', 'ok'],
    ['10:30', 'Two no-shows at HSR', 'Slots refilled from the waitlist within 20 minutes.', 'info'],
    ['12:15', 'Package sold — ₹32,000', 'Bridal 6-sitting. Wallet money, not income yet.', 'ok'],
    ['14:40', 'Stylist commission crossed slab 2', 'Nikita and Roopa both above ₹80,000 for the month.', 'ok'],
    ['16:10', 'Colour stock low at Whitefield', 'Wella 6.0 and 7.3 down to two tubes each.', 'warn'],
    ['19:20', 'Day closed at HSR — ₹41,800', '18 bills, average ₹2,322. Best day this week.', 'ok'],
  ],
  contractor: [
    ['07:15', '148 labour marked present across 9 sites', 'Manyata is 6 short — supervisor informed.', 'warn'],
    ['09:30', 'Material issued to Prestige Tech Park', '140 sheets of plywood, 18mm. Gate pass generated.', 'ok'],
    ['11:00', 'RA bill approved by Embassy', '₹41 L for Manyata Block C. Retention 10% held.', 'ok'],
    ['13:45', 'Conduit shortfall at RMZ Ecoworld', '60 m unaccounted. Supervisor asked to explain.', 'bad'],
    ['15:30', 'Client sign-off received — Sobha Villa', 'Snag list closed. Handover next week.', 'ok'],
    ['17:50', 'Subcontractor bill entered — ₹6.2 L', '194C TDS of ₹6,200 computed automatically.', 'info'],
  ],
  ecommerce: [
    ['08:00', '96 orders queued from overnight', 'All allocated across three warehouses.', 'ok'],
    ['10:20', 'Amazon MTR file parsed', '₹38,600 of TCS credit tagged for the GST return.', 'ok'],
    ['12:00', '68 orders packed and manifested', 'Delhivery pickup done. Bluedart running late.', 'info'],
    ['14:30', 'RTO spike from Mumbai pincodes', '11 returns today, 8 of them "customer not available".', 'bad'],
    ['16:15', 'Stock alert — 4 SKUs under 7 days cover', 'Reorder suggestion pushed to the buying sheet.', 'warn'],
    ['18:40', 'Courier claim settled — ₹11,400', '5 of 18 lost-parcel claims closed this month.', 'ok'],
  ],
  education: [
    ['07:30', 'Morning JEE batch — 41 of 48 present', 'Attendance SMS sent to absent students\' parents.', 'info'],
    ['09:00', 'Fee instalment collected — ₹48,000', 'Three students. Two paid cash at the front desk.', 'warn'],
    ['11:30', 'Faculty hours logged for August', '₹3.86 L of payout. 194J TDS applies.', 'info'],
    ['14:00', 'Mock test scores published', 'Parent portal notified for 132 students.', 'ok'],
    ['16:45', '61 students have overdue instalments', '₹4.18 L. Reminder queue ready to send.', 'bad'],
  ],
}

export const FEED = {}
CLIENTS.forEach((c) => {
  FEED[c.id] = (FEED_BY_VERTICAL[c.vertical] || []).map(([at, title, detail, tone], i) => ({
    id: c.id + '-F' + i, at, title, detail, tone,
  })).reverse()
})

/* ------------------------------------------------------- needs the owner now */
// The short list. If the owner reads nothing else, he reads this.
const OWNER_ACTIONS = {
  'CL-01': [
    { title: '41 memberships lapse this month', detail: '₹3.28 L of renewals. 18 of them have not visited in two weeks — call those first.', tone: 'bad', cta: 'See the renewal list' },
    { title: '₹2.14 L of fees outstanding', detail: '29 members. Auto-reminders have gone out three times.', tone: 'warn', cta: 'Open dues' },
    { title: 'Treadmill 4 out of service', detail: 'Flagged yesterday. Service call raised, no date confirmed.', tone: 'warn', cta: 'Chase Fitline' },
  ],
  'CL-02': [
    { title: '27 PODs pending — ₹14.2 L unbilled', detail: 'You cannot invoice until the paper is back. Nine are over ten days old.', tone: 'bad', cta: 'See the POD list' },
    { title: '6 vehicle papers expire within 30 days', detail: 'One insurance in 6 days. A truck stopped at a check post costs more than the premium.', tone: 'bad', cta: 'Renew papers' },
    { title: '₹22 L of receivables over 90 days', detail: 'Three consignors. Two have taken fresh loads since.', tone: 'warn', cta: 'Open receivables' },
    { title: 'Your CA needs RCM self-invoices', detail: 'Hire-truck freight for Jun to Aug. Blocks this month\'s GST return.', tone: 'warn', cta: 'Upload now' },
  ],
  'CL-03': [
    { title: 'Wastage at ₹94,200 this month', detail: '2.8% of sales against a 1.5% target. Dosa batter is over-prepped four days out of seven.', tone: 'bad', cta: 'See wastage' },
    { title: '₹1.86 L of aggregator payouts unmatched', detail: '14 settlement lines from Swiggy and Zomato. Money you have earned but not traced.', tone: 'warn', cta: 'Match payouts' },
    { title: 'Food cost at 31.4%', detail: 'Target is 29%. Onion and tomato purchase rates moved 22% this month.', tone: 'warn', cta: 'Open store' },
  ],
  'CL-04': [
    { title: 'CNC-3 down — 21 hours lost in August', detail: 'Spindle bearing. Utilisation on that machine is 46% against 88% for the rest.', tone: 'bad', cta: 'Open machines' },
    { title: 'JC-4482 is 2 days late', detail: 'Manyata order for Embassy. Customer has asked twice.', tone: 'warn', cta: 'See job cards' },
    { title: 'Jindal Steel bill held on 3-way match', detail: 'Billed 4.2 T against a 4.0 T goods receipt. ₹18,400 difference.', tone: 'warn', cta: 'Review bill' },
  ],
  'CL-05': [
    { title: 'Marriott payable 4 days overdue', detail: '₹8.62 L. They have stopped confirming new rooms until it clears.', tone: 'bad', cta: 'Open payables' },
    { title: '38 hotel vouchers not uploaded', detail: 'Your CA cannot file the GST return without them. 12 came in yesterday.', tone: 'bad', cta: 'Upload vouchers' },
    { title: 'IndiGo ₹12.4 L due in 3 days', detail: 'Bank balance will not cover both this and Marriott. One has to wait.', tone: 'warn', cta: 'See cash position' },
  ],
  'CL-06': [
    { title: '₹11.4 L of package money unserved', detail: 'Customers have paid for sittings they have not taken. Treat it as a liability, not profit.', tone: 'warn', cta: 'Open packages' },
    { title: 'Colour stock low at Whitefield', detail: 'Wella 6.0 and 7.3 down to two tubes. Saturday is fully booked.', tone: 'warn', cta: 'Raise indent' },
    { title: 'Whitefield margin down to 21%', detail: 'HSR is at 38%. Same services, same prices — the difference is chair utilisation.', tone: 'info', cta: 'Compare branches' },
  ],
  'CL-08': [
    { title: '60 m of conduit unaccounted at RMZ', detail: 'Issued 820 m, consumed 740, returned 20. This is the third site this quarter.', tone: 'bad', cta: 'Open material' },
    { title: 'Manyata milestone due in 4 days', detail: '34% complete against 50% planned. Labour is 6 short every day this week.', tone: 'bad', cta: 'Open site' },
    { title: '₹18.4 L of retention held across 14 projects', detail: 'Six are past their release date. Nobody has followed up.', tone: 'warn', cta: 'See retention' },
    { title: '₹9.6 L of mobilisation advance unadjusted', detail: 'GST was already paid on receipt. Adjust against the next RA bill.', tone: 'info', cta: 'Open advances' },
  ],
  'CL-12': [
    { title: 'RTO at 14.2% — ₹4.94 L this month', detail: '96 of the 278 returns are "customer not available". A WhatsApp confirm before dispatch fixes most of it.', tone: 'bad', cta: 'Open returns' },
    { title: '4 SKUs under 7 days of cover', detail: 'Festive season starts in three weeks. Reorder now or lose the October peak.', tone: 'warn', cta: 'Open stock' },
    { title: '18 courier claims worth ₹41,200', detail: 'Lost parcels. Only 5 settled this month — the rest need a follow-up.', tone: 'warn', cta: 'Open claims' },
  ],
  'CL-11': [
    { title: '61 students with overdue instalments', detail: '₹4.18 L. The reminder queue is built but has never been sent.', tone: 'bad', cta: 'Send reminders' },
    { title: '33% of fees still collected in cash', detail: 'It keeps you at the lower tax-audit threshold. UPI-only from October is the plan.', tone: 'warn', cta: 'See collections' },
  ],
}

export const ACTIONS = OWNER_ACTIONS

export const hasApp = (c) => c.realv.status === 'Live & Billing'
export const brandOf = (id) => BRAND[id] || { accent: '#4F46E5', tagline: '' }
export const ownerClients = () => CLIENTS.filter(hasApp)
