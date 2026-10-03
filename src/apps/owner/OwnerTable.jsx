// One table renderer for eight different businesses.
//
// The operations module for each client declares its columns with a `type`, and
// this renders them. That is what makes a gym's member list and a factory's job
// card board the same amount of work to build.

import { Table, Pill, Bar } from '../../components/ui.jsx'
import { inr, num } from '../../lib/format.js'

function cell(col, row) {
  const v = row[col.key]
  const tone = row[col.key + 'Tone']

  switch (col.type) {
    case 'sub':
      return (
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-ink truncate max-w-[260px]">{v}</p>
          <p className="text-[11px] text-mute truncate max-w-[260px]">{row[col.key + 'Sub']}</p>
        </div>
      )
    case 'money':
      return v ? <span className="num text-[13px] font-semibold text-ink">{inr(v)}</span> : <span className="text-faint">—</span>
    case 'num':
      return <span className="num text-[13px] font-semibold text-ink">{num(v)}</span>
    case 'pill':
      return <Pill tone={tone || 'mute'} dot={!!tone && tone !== 'mute'}>{v}</Pill>
    case 'bar':
      return (
        <div className="w-[104px]">
          <Bar value={v} tone={v >= 90 ? 'ok' : v >= 60 ? 'brand' : v >= 40 ? 'warn' : 'bad'} height={6} />
          <p className="text-[10.5px] text-faint mt-1 num">{v}%</p>
        </div>
      )
    default:
      return <span className="text-[12.5px] text-mute">{v}</span>
  }
}

export default function OwnerTable({ spec, pageSize = 0, searchable = true }) {
  if (!spec) return null
  const searchKeys = spec.columns
    .filter((c) => ['sub', 'text'].includes(c.type || 'text'))
    .map((c) => (row) => row[c.key])

  return (
    <Table
      searchable={searchable}
      searchKeys={searchKeys}
      columns={spec.columns.map((c) => ({
        key: c.key,
        label: c.label,
        align: c.align,
        sortValue: ['money', 'num', 'bar'].includes(c.type) ? (row) => row[c.key] : undefined,
        render: (row) => cell(c, row),
      }))}
      rows={spec.rows}
      keyFn={(row) => spec.rows.indexOf(row)}
      pageSize={pageSize}
      empty="Nothing here today"
    />
  )
}
