// Everything the screens read is derived here, so the dashboard, the calendar
// and the client page can never disagree about a number.

import { CLIENTS, clientById, WATCHLIST } from '../data/clients.js'
import { STAFF, CURRENT_PERIOD, TODAY } from '../data/practice.js'
import { LEDGER, PERIOD_KEYS } from '../data/periods.js'
import {
  OBLIGATIONS, openObligations, overdueObligations, dueWithin, isDone, daysLeft, forClient, sortByDue,
} from '../data/compliance.js'
import { ITC_ROWS, DOC_REQUESTS } from '../data/recon.js'
import { NOTICES, openNotices } from '../data/notices.js'
import { CURRENT_MONTH, LIFETIME } from '../data/revenue.js'
import { pLabel, iso, daysBetween } from './dates.js'

const NOW = iso(TODAY)

/* --------------------------------------------------------------- practice KPIs */
// `docStatus` lets the caller pass the session's live document state, so an
// upload made in a client's own app immediately moves the practice counters.
export function practiceKpis(docStatus = (d) => d.status) {
  const rows = CLIENTS.map((c) => LEDGER[c.id][CURRENT_PERIOD])
  const gstRows = rows.filter((r) => clientById[r.clientId].scheme !== 'Unregistered')

  const open = openObligations()
  const overdue = overdueObligations()
  const week = dueWithin(7)

  const readiness = Math.round(rows.reduce((s, r) => s + r.readiness.pct, 0) / rows.length)
  const taxToPay = gstRows.reduce((s, r) => s + (r.gstr3b.status === 'Filed' || r.gstr3b.status === 'Filed Late' ? 0 : r.netPayable), 0)

  return {
    clients: CLIENTS.length,
    onAuto: CLIENTS.filter((c) => c.books.mode === 'CleanBook Auto').length,
    turnoverMonth: rows.reduce((s, r) => s + r.sales, 0),
    turnoverFy: CLIENTS.reduce((s, c) => s + c.annual, 0),
    readiness,
    openCount: open.length,
    overdueCount: overdue.length,
    weekCount: week.length,
    taxToPay,
    itcAtRisk: ITC_ROWS.filter((r) => r.reason === 'In books, not in 2B').reduce((s, r) => s + r.tax, 0),
    itcLines: ITC_ROWS.length,
    docsOpen: DOC_REQUESTS.filter((d) => docStatus(d) !== 'Received').length,
    docsOverdue: DOC_REQUESTS.filter((d) => docStatus(d) === 'Overdue').length,
    noticesOpen: openNotices().length,
    noticeExposure: NOTICES.reduce((s, n) => s + (n.amount || 0), 0),
    shareMonth: CURRENT_MONTH.gross,
    sharePaid: LIFETIME.paid,
  }
}

/* ------------------------------------------------------------- filing board */
// One row per client for a given period: can this return go out today?
export function filingBoard(period = CURRENT_PERIOD, docStatus = (d) => d.status) {
  return CLIENTS.map((c) => {
    const row = LEDGER[c.id][period]
    const obs = forClient(c.id).filter((o) => o.period === period)
    const blocked = obs.filter((o) => ['Blocked', 'Awaiting Data'].includes(o.status))
    return {
      client: c,
      row,
      gstr1: row.gstr1,
      gstr3b: row.gstr3b,
      readiness: row.readiness,
      netPayable: row.netPayable,
      mismatch: row.mismatch,
      mismatchCount: row.mismatchCount,
      blockers: blocked.length,
      docs: DOC_REQUESTS.filter((d) => d.clientId === c.id && docStatus(d) !== 'Received'),
      obligations: obs,
    }
  })
}

/* ------------------------------------------------------------------- trends */
export function turnoverSeries(keys = PERIOD_KEYS.slice(-12)) {
  return keys.map((k) => {
    const total = CLIENTS.reduce((s, c) => s + LEDGER[c.id][k].sales, 0)
    const tax = CLIENTS.reduce((s, c) => s + LEDGER[c.id][k].outputTax, 0)
    const itc = CLIENTS.reduce((s, c) => s + LEDGER[c.id][k].itcClaimable, 0)
    return { period: k, label: pLabel(k), short: pLabel(k).slice(0, 3), turnover: total, outputTax: tax, itc, net: Math.max(0, tax - itc) }
  })
}

export function clientSeries(clientId, keys = PERIOD_KEYS.slice(-12)) {
  return keys.map((k) => {
    const r = LEDGER[clientId][k]
    return {
      period: k, label: pLabel(k), short: pLabel(k).slice(0, 3),
      turnover: r.sales, outputTax: r.outputTax, itc: r.itcClaimable,
      net: r.netPayable, purchases: r.purchases,
    }
  })
}

/* ------------------------------------------------------------- distribution */
export function readinessBuckets() {
  const b = [
    { label: 'Ready (95%+)', tone: 'ok', color: '#10B981', clients: [] },
    { label: 'Nearly (80–94%)', tone: 'info', color: '#06B6D4', clients: [] },
    { label: 'Gaps (60–79%)', tone: 'warn', color: '#F59E0B', clients: [] },
    { label: 'Blocked (<60%)', tone: 'bad', color: '#EF4444', clients: [] },
  ]
  CLIENTS.forEach((c) => {
    const p = LEDGER[c.id][CURRENT_PERIOD].readiness.pct
    const i = p >= 95 ? 0 : p >= 80 ? 1 : p >= 60 ? 2 : 3
    b[i].clients.push(c)
  })
  return b.map((x) => ({ ...x, value: x.clients.length }))
}

export function kindLoad() {
  const open = openObligations()
  const kinds = ['GST', 'TDS', 'Payroll', 'Direct Tax', 'ROC', 'Internal']
  const colors = { GST: '#4F46E5', TDS: '#06B6D4', Payroll: '#10B981', 'Direct Tax': '#F59E0B', ROC: '#8B5CF6', Internal: '#94A3B8' }
  return kinds.map((k) => {
    const list = open.filter((o) => o.kind === k)
    return {
      kind: k, value: list.length, color: colors[k],
      hours: Math.round(list.reduce((s, o) => s + o.hours, 0)),
      overdue: list.filter((o) => daysLeft(o) < 0).length,
    }
  }).filter((x) => x.value)
}

/* ------------------------------------------------------------------ workload */
export function staffWorkload() {
  return STAFF.map((s) => {
    const mine = openObligations().filter((o) => o.assignee === s.id)
    const week = mine.filter((o) => daysLeft(o) <= 7)
    return {
      staff: s,
      open: mine.length,
      hours: Math.round(mine.reduce((a, o) => a + o.hours, 0) * 10) / 10,
      weekHours: Math.round(week.reduce((a, o) => a + o.hours, 0) * 10) / 10,
      overdue: mine.filter((o) => daysLeft(o) < 0).length,
      clients: CLIENTS.filter((c) => c.staffId === s.id),
      // Not clamped — a manager at 200% is exactly what the practice needs to see.
      load: Math.round((week.reduce((a, o) => a + o.hours, 0) / s.capacity) * 100),
    }
  })
}

/* -------------------------------------------------------------------- alerts */
// One ranked feed for the bell and the dashboard. Statutory deadlines outrank
// advisory nudges, and anything already overdue goes to the top.
export function alerts(docStatus = (d) => d.status) {
  const out = []

  overdueObligations().forEach((o) => {
    out.push({
      id: 'AL-' + o.id, severity: 'critical', kind: o.kind,
      title: o.form + ' overdue — ' + clientById[o.clientId].short,
      detail: (o.note || o.formLabel) + ' · due ' + o.due,
      clientId: o.clientId, link: '/calendar', days: daysLeft(o),
    })
  })

  dueWithin(3).forEach((o) => {
    out.push({
      id: 'AL-' + o.id, severity: 'high', kind: o.kind,
      title: o.form + ' due ' + (daysLeft(o) === 0 ? 'today' : daysLeft(o) === 1 ? 'tomorrow' : 'in ' + daysLeft(o) + ' days') + ' — ' + clientById[o.clientId].short,
      detail: o.formLabel + (o.note ? ' · ' + o.note : ''),
      clientId: o.clientId, link: o.kind === 'GST' ? '/gst' : '/calendar', days: daysLeft(o),
    })
  })

  openNotices().forEach((n) => {
    const d = daysBetween(NOW, n.replyBy)
    if (d <= 21) {
      out.push({
        id: 'AL-' + n.id, severity: d <= 5 ? 'critical' : 'high', kind: 'Notice',
        title: n.form + ' reply due in ' + d + 'd — ' + clientById[n.clientId].short,
        detail: n.summary, clientId: n.clientId, link: '/notices', days: d,
      })
    }
  })

  DOC_REQUESTS.filter((d) => docStatus(d) === 'Overdue').forEach((d) => {
    out.push({
      id: 'AL-' + d.id, severity: 'high', kind: 'Chase',
      title: 'Waiting ' + d.ageDays + ' days — ' + clientById[d.clientId].short,
      detail: d.what + (d.blocks ? ' · blocks ' + d.blocks : ''),
      clientId: d.clientId, link: '/documents', days: -d.ageDays,
    })
  })

  WATCHLIST.forEach((w) => {
    out.push({
      id: 'AL-' + w.id, severity: w.severity === 'high' ? 'high' : 'medium', kind: 'Advisory',
      title: w.headline + ' — ' + clientById[w.clientId].short,
      detail: w.action, clientId: w.clientId, link: '/clients/' + w.clientId, days: daysBetween(NOW, w.by),
    })
  })

  const rank = { critical: 0, high: 1, medium: 2, low: 3 }
  return out.sort((a, b) => rank[a.severity] - rank[b.severity] || a.days - b.days)
}

/* ------------------------------------------------------------- client detail */
export function clientBrief(clientId) {
  const c = clientById[clientId]
  const row = LEDGER[clientId][CURRENT_PERIOD]
  const obs = sortByDue(forClient(clientId))
  const open = obs.filter((o) => !isDone(o))
  return {
    client: c,
    row,
    series: clientSeries(clientId),
    obligations: obs,
    open,
    nextDue: open[0] || null,
    overdue: open.filter((o) => daysLeft(o) < 0),
    itc: ITC_ROWS.filter((r) => r.clientId === clientId),
    docs: DOC_REQUESTS.filter((d) => d.clientId === clientId),
    notices: NOTICES.filter((n) => n.clientId === clientId),
    watch: WATCHLIST.filter((w) => w.clientId === clientId),
    fyTurnover: PERIOD_KEYS.filter((k) => k >= '2026-04').reduce((s, k) => s + LEDGER[clientId][k].sales, 0),
    taxPaidFy: PERIOD_KEYS.filter((k) => k >= '2026-04').reduce((s, k) => s + LEDGER[clientId][k].netPayable, 0),
  }
}

/* ------------------------------------------------------------------ calendar */
// Obligations grouped by date for a month grid.
export function calendarMonth(year, month) {
  const first = new Date(year, month, 1)
  const days = new Date(year, month + 1, 0).getDate()
  const lead = (first.getDay() + 6) % 7 // Monday-first grid
  const cells = []
  for (let i = 0; i < lead; i++) cells.push(null)
  for (let d = 1; d <= days; d++) {
    const key = iso(new Date(year, month, d))
    const items = OBLIGATIONS.filter((o) => o.due === key)
    cells.push({
      day: d, date: key, items,
      open: items.filter((o) => !isDone(o)).length,
      done: items.filter((o) => isDone(o)).length,
      amount: items.reduce((s, o) => s + (o.amount || 0), 0),
      isToday: key === NOW,
      isPast: key < NOW,
    })
  }
  return cells
}

export const monthTotals = (cells) => {
  const items = cells.filter(Boolean).flatMap((c) => c.items)
  return {
    total: items.length,
    open: items.filter((o) => !isDone(o)).length,
    overdue: items.filter((o) => !isDone(o) && o.due < NOW).length,
    amount: items.filter((o) => !isDone(o)).reduce((s, o) => s + (o.amount || 0), 0),
  }
}
