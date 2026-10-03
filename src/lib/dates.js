// Period arithmetic for Indian tax periods. A "period key" is 'YYYY-MM'.
// Everything on the filing board is derived from these, so due dates never
// have to be typed in by hand.

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export const pKey = (y, m) => y + '-' + String(m + 1).padStart(2, '0')
export const pParts = (key) => [Number(key.slice(0, 4)), Number(key.slice(5, 7)) - 1]
export const pLabel = (key) => {
  const [y, m] = pParts(key)
  return MONTHS[m] + ' ' + y
}
export const pLabelLong = (key) => {
  const [y, m] = pParts(key)
  return MONTHS_LONG[m] + ' ' + y
}

export const addMonths = (key, n) => {
  const [y, m] = pParts(key)
  const t = y * 12 + m + n
  return pKey(Math.floor(t / 12), t % 12)
}

export const monthsBetween = (a, b) => {
  const [ay, am] = pParts(a), [by, bm] = pParts(b)
  return by * 12 + bm - (ay * 12 + am)
}

// Range of period keys, inclusive.
export function periodRange(from, to) {
  const out = []
  let k = from
  while (monthsBetween(k, to) >= 0) { out.push(k); k = addMonths(k, 1) }
  return out
}

export const iso = (d) => {
  const x = new Date(d)
  return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0')
}

// A due date expressed as "day D of the month N months after this period".
export function dueOn(key, monthsAfter, day) {
  const [y, m] = pParts(addMonths(key, monthsAfter))
  return iso(new Date(y, m, day))
}

export const shiftDays = (isoDate, n) => {
  const d = new Date(isoDate + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return iso(d)
}

// Indian FY runs Apr–Mar. Quarters are Apr-Jun (Q1) … Jan-Mar (Q4).
export function fyOf(key) {
  const [y, m] = pParts(key)
  const start = m >= 3 ? y : y - 1
  return { label: 'FY ' + start + '-' + String(start + 1).slice(2), start, from: start + '-04-01', to: start + 1 + '-03-31' }
}

export function quarterOf(key) {
  const [y, m] = pParts(key)
  const qi = Math.floor(((m + 9) % 12) / 3) // Apr->0
  const startMonth = (qi * 3 + 3) % 12
  const fy = fyOf(key)
  const first = pKey(qi === 3 ? fy.start + 1 : fy.start, startMonth)
  return {
    q: qi + 1,
    label: 'Q' + (qi + 1) + ' ' + fy.label,
    short: MONTHS[startMonth] + '–' + MONTHS[(startMonth + 2) % 12],
    months: [first, addMonths(first, 1), addMonths(first, 2)],
    last: addMonths(first, 2),
    fy,
  }
}

export const isQuarterEnd = (key) => quarterOf(key).last === key

export const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000)
