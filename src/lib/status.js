// One place that decides what colour a compliance state is, so every screen agrees.

export const TONE = {
  ok:   'bg-ok-50 text-ok-700 border-ok-500/25 dark:bg-ok-500/10 dark:text-ok-300',
  warn: 'bg-warn-50 text-warn-700 border-warn-500/25',
  bad:  'bg-bad-50 text-bad-700 border-bad-500/25',
  info: 'bg-info-50 text-info-700 border-info-500/25',
  brand:'bg-brand-50 text-brand-700 border-brand-500/25',
  mute: 'bg-soft text-mute border-line',
}

export const DOT = {
  ok: 'bg-ok-500', warn: 'bg-warn-500', bad: 'bg-bad-500',
  info: 'bg-info-500', brand: 'bg-brand-500', mute: 'bg-faint',
}

// Filing lifecycle used by every return type on the board.
export const FILING_TONE = {
  'Filed':        'ok',
  'Filed Late':   'warn',
  'Ready to File':'brand',
  'In Progress':  'info',
  'Awaiting Data':'warn',
  'Blocked':      'bad',
  'Not Started':  'mute',
  'Not Applicable':'mute',
}

export const READY_ORDER = [
  'Filed', 'Filed Late', 'Ready to File', 'In Progress', 'Awaiting Data', 'Blocked', 'Not Started', 'Not Applicable',
]

// A due date, coloured by how much runway is left.
export function dueTone(days, done) {
  if (done) return 'ok'
  if (days < 0) return 'bad'
  if (days <= 2) return 'bad'
  if (days <= 7) return 'warn'
  if (days <= 20) return 'info'
  return 'mute'
}

export function dueLabel(days, done) {
  if (done) return 'Filed'
  if (days < 0) return Math.abs(days) + 'd overdue'
  if (days === 0) return 'Due today'
  if (days === 1) return 'Due tomorrow'
  return 'in ' + days + 'd'
}

export const READINESS_TONE = (pct) => (pct >= 95 ? 'ok' : pct >= 80 ? 'info' : pct >= 60 ? 'warn' : 'bad')

export const RISK_TONE = { 'Low': 'ok', 'Medium': 'warn', 'High': 'bad' }

export const NOTICE_TONE = {
  'Open': 'bad', 'Reply Drafted': 'warn', 'Replied': 'info',
  'Hearing Fixed': 'warn', 'Closed': 'ok', 'Dropped': 'ok',
}

export const PAYOUT_TONE = { 'Paid': 'ok', 'Processing': 'info', 'Accruing': 'brand', 'On Hold': 'warn' }

export const PIPELINE_TONE = {
  'Free Tier': 'mute', 'Discovery Done': 'info', 'Proposal Sent': 'warn',
  'Build In Progress': 'brand', 'Live & Billing': 'ok', 'Declined': 'bad',
}

export const DOC_STATUS_TONE = {
  Received: 'ok', 'Partly received': 'warn', Pending: 'info', Overdue: 'bad',
}

export const AUTHORITY_TONE = {
  GST: 'brand', 'Income Tax': 'info', PF: 'warn', ESI: 'warn', MCA: 'mute',
}

export const ACTIVITY_TONE = {
  auto: 'ok', client: 'brand', chase: 'warn', alert: 'bad',
  filing: 'info', notice: 'bad', note: 'mute',
}
