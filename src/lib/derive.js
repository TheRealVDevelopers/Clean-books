// Everything the screens read is derived here, so the dashboard, the calendar
// and the client page can never disagree about a number.
//
// makeDerive() is given one practice's data — the demo's or the live firm's —
// and returns the aggregates for that practice. src/repo builds it once per
// dataset, and screens reach these functions through useRepo().

import { pLabel, iso, daysBetween } from './dates.js'
import { isDone, sortByDue } from './obligations.js'

export function makeDerive(data) {
  const {
    CLIENTS, clientById, WATCHLIST, STAFF, CURRENT_PERIOD, TODAY, LEDGER, PERIOD_KEYS,
    OBLIGATIONS, openObligations, overdueObligations, dueWithin, daysLeft, forClient,
    ITC_ROWS, DOC_REQUESTS, NOTICES, openNotices, revenue,
  } = data

  const NOW = iso(TODAY)

  // Aggregates count only the figures that exist: a client with no month-end
  // ledger yet (every live client, for now) is left out rather than guessed at.
  const rowsFor = (period) => CLIENTS.map((c) => LEDGER[c.id]?.[period]).filter(Boolean)

  /* --------------------------------------------------------------- practice KPIs */
  // `docStatus` lets the caller pass the session's live document state, so an
  // upload made in a client's own app immediately moves the practice counters.
  function practiceKpis(docStatus = (d) => d.status) {
    const rows = rowsFor(CURRENT_PERIOD)
    const gstRows = rows.filter((r) => clientById[r.clientId].scheme !== 'Unregistered')

    const open = openObligations()
    const overdue = overdueObligations()
    const week = dueWithin(7)

    const readiness = Math.round(rows.reduce((s, r) => s + r.readiness.pct, 0) / rows.length)
    const taxToPay = gstRows.reduce((s, r) => s + (r.gstr3b.status === 'Filed' || r.gstr3b.status === 'Filed Late' ? 0 : r.netPayable), 0)

    return {
      clients: CLIENTS.length,
      onAuto: CLIENTS.filter((c) => c.books?.mode === 'CleanBook Auto').length,
      turnoverMonth: rows.reduce((s, r) => s + r.sales, 0),
      turnoverFy: CLIENTS.reduce((s, c) => s + (c.annual || 0), 0),
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
      // The referral share exists only where there is revenue data (the demo).
      shareMonth: revenue ? revenue.CURRENT_MONTH.gross : null,
      sharePaid: revenue ? revenue.LIFETIME.paid : null,
    }
  }

  /* ------------------------------------------------------------- filing board */
  // One row per client for a given period: can this return go out today?
  function filingBoard(period = CURRENT_PERIOD, docStatus = (d) => d.status) {
    return CLIENTS.filter((c) => LEDGER[c.id]?.[period]).map((c) => {
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
  function turnoverSeries(keys = PERIOD_KEYS.slice(-12)) {
    return keys.map((k) => {
      const rows = rowsFor(k)
      const total = rows.reduce((s, r) => s + r.sales, 0)
      const tax = rows.reduce((s, r) => s + r.outputTax, 0)
      const itc = rows.reduce((s, r) => s + r.itcClaimable, 0)
      return { period: k, label: pLabel(k), short: pLabel(k).slice(0, 3), turnover: total, outputTax: tax, itc, net: Math.max(0, tax - itc) }
    })
  }

  function clientSeries(clientId, keys = PERIOD_KEYS.slice(-12)) {
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
  function readinessBuckets() {
    const b = [
      { label: 'Ready (95%+)', tone: 'ok', color: '#10B981', clients: [] },
      { label: 'Nearly (80–94%)', tone: 'info', color: '#06B6D4', clients: [] },
      { label: 'Gaps (60–79%)', tone: 'warn', color: '#F59E0B', clients: [] },
      { label: 'Blocked (<60%)', tone: 'bad', color: '#EF4444', clients: [] },
    ]
    CLIENTS.forEach((c) => {
      if (!LEDGER[c.id]?.[CURRENT_PERIOD]) return
      const p = LEDGER[c.id][CURRENT_PERIOD].readiness.pct
      const i = p >= 95 ? 0 : p >= 80 ? 1 : p >= 60 ? 2 : 3
      b[i].clients.push(c)
    })
    return b.map((x) => ({ ...x, value: x.clients.length }))
  }

  function kindLoad() {
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
  function staffWorkload() {
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
  function alerts(docStatus = (d) => d.status) {
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
  function clientBrief(clientId) {
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
  function calendarMonth(year, month) {
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

  const monthTotals = (cells) => {
    const items = cells.filter(Boolean).flatMap((c) => c.items)
    return {
      total: items.length,
      open: items.filter((o) => !isDone(o)).length,
      overdue: items.filter((o) => !isDone(o) && o.due < NOW).length,
      amount: items.filter((o) => !isDone(o)).reduce((s, o) => s + (o.amount || 0), 0),
    }
  }

  return {
    practiceKpis, filingBoard, turnoverSeries, clientSeries, readinessBuckets, kindLoad,
    staffWorkload, alerts, clientBrief, calendarMonth, monthTotals,
  }
}
