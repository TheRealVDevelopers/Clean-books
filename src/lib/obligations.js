// Questions every screen asks of a list of obligations. Shared by the demo and
// live repositories, so both answer them the same way.

import { iso, daysBetween } from './dates.js'

export const DONE = ['Filed', 'Filed Late', 'Not Applicable']
export const isDone = (o) => DONE.includes(o.status)

export const KINDS = ['GST', 'TDS', 'Payroll', 'Direct Tax', 'ROC', 'Internal']

export const sortByDue = (list) => [...list].sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : 0))

// Queries that depend on the book of obligations and on what "today" is.
export function obligationQueries(OBLIGATIONS, today, clientById) {
  const NOW = iso(today)
  const daysLeft = (o) => daysBetween(NOW, o.due)
  const openObligations = () => OBLIGATIONS.filter((o) => !isDone(o))
  return {
    daysLeft,
    openObligations,
    overdueObligations: () => openObligations().filter((o) => daysLeft(o) < 0),
    dueWithin: (days) => openObligations().filter((o) => daysLeft(o) <= days && daysLeft(o) >= 0),
    forClient: (id) => OBLIGATIONS.filter((o) => o.clientId === id),
    forStaff: (id) => OBLIGATIONS.filter((o) => o.assignee === id),
    withClient: (list) => list.map((o) => ({ ...o, client: clientById[o.clientId] })),
  }
}
