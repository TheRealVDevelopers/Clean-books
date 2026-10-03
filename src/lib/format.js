// Indian-format money, dates and durations.

export const inr = (n) =>
  '₹' + Math.round(n || 0).toLocaleString('en-IN')

export const inrShort = (n) => {
  const v = Math.abs(n || 0)
  const s = n < 0 ? '-₹' : '₹'
  if (v >= 1e7) return s + (v / 1e7).toFixed(v / 1e7 >= 10 ? 1 : 2) + ' Cr'
  if (v >= 1e5) return s + (v / 1e5).toFixed(v / 1e5 >= 10 ? 1 : 2) + ' L'
  if (v >= 1000) return s + (v / 1000).toFixed(v / 1000 >= 10 ? 0 : 1) + 'K'
  return s + Math.round(v)
}

export const num = (n) => Math.round(n || 0).toLocaleString('en-IN')
export const km = (n) => num(n) + ' km'
export const pct = (n, d = 0) => (n || 0).toFixed(d) + '%'

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const d2 = (n) => String(n).padStart(2, '0')

export const dateShort = (d) => {
  if (!d) return '—'
  const x = new Date(d)
  return d2(x.getDate()) + ' ' + MON[x.getMonth()]
}
export const dateFull = (d) => {
  if (!d) return '—'
  const x = new Date(d)
  return d2(x.getDate()) + ' ' + MON[x.getMonth()] + ' ' + x.getFullYear()
}
export const timeShort = (d) => {
  if (!d) return '—'
  const x = new Date(d)
  let h = x.getHours()
  const ap = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return h + ':' + d2(x.getMinutes()) + ' ' + ap
}
export const dateTime = (d) => (d ? dateShort(d) + ', ' + timeShort(d) : '—')

// "3h ago" / "in 2 days"
export const rel = (d) => {
  if (!d) return '—'
  const ms = new Date(d) - new Date()
  const past = ms < 0
  const a = Math.abs(ms)
  const m = Math.round(a / 60000)
  let s
  if (m < 1) s = 'just now'
  else if (m < 60) s = m + 'm'
  else if (m < 1440) s = Math.round(m / 60) + 'h'
  else if (m < 43200) s = Math.round(m / 1440) + 'd'
  else s = Math.round(m / 43200) + 'mo'
  if (s === 'just now') return s
  return past ? s + ' ago' : 'in ' + s
}

export const daysTo = (d) => Math.ceil((new Date(d) - new Date()) / 86400000)
export const daysAgo = (d) => Math.floor((new Date() - new Date(d)) / 86400000)

export const dur = (hrs) => {
  if (hrs == null) return '—'
  const h = Math.round(hrs)
  if (h < 24) return h + 'h'
  return Math.floor(h / 24) + 'd ' + (h % 24) + 'h'
}

export const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()

export const csvEscape = (v) => {
  const s = String(v ?? '')
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
}

export function toCsv(rows, columns) {
  const head = columns.map((c) => csvEscape(c.label)).join(',')
  const body = rows.map((r) => columns.map((c) => csvEscape(c.value(r))).join(',')).join('\n')
  return head + '\n' + body
}

// Compact rupee ticks for chart axes: 0, 45K, 4L, 1.2Cr
export const axisMoney = (v) => {
  const n = Number(v) || 0
  if (n === 0) return '0'
  const a = Math.abs(n)
  const s = n < 0 ? '-' : ''
  if (a >= 1e7) return s + (a / 1e7).toFixed(1) + 'Cr'
  if (a >= 1e5) return s + Math.round(a / 1e5) + 'L'
  if (a >= 1000) return s + Math.round(a / 1000) + 'K'
  return s + Math.round(a)
}
