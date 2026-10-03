import { useMemo, useState, useEffect, useRef } from 'react'
import { ChevronDown, ChevronUp, Search, X, ArrowRight, Inbox } from 'lucide-react'
import { TONE, DOT } from '../lib/status.js'
import { initials } from '../lib/format.js'

/* ------------------------------------------------------------------ layout */
export function Card({ className = '', children, ...rest }) {
  return <div className={'card ' + className} {...rest}>{children}</div>
}

export function CardHead({ title, sub, right, icon: Icon, className = '' }) {
  return (
    <div className={'flex items-start justify-between gap-3 px-4 py-3 border-b border-line ' + className}>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={15} className="text-brand-600 shrink-0" />}
          <h3 className="text-[13px] font-bold text-ink truncate">{title}</h3>
        </div>
        {sub && <p className="text-[11.5px] text-mute mt-0.5 truncate">{sub}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  )
}

export function PageHead({ title, sub, actions, chips }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
      <div>
        <h1 className="text-[22px] font-extrabold tracking-tight text-ink">{title}</h1>
        {sub && <p className="text-[13px] text-mute mt-0.5">{sub}</p>}
        {chips && <div className="flex flex-wrap gap-1.5 mt-2">{chips}</div>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

/* ------------------------------------------------------------------- atoms */
export function Pill({ tone = 'mute', children, dot = false, className = '' }) {
  return (
    <span className={'chip border ' + (TONE[tone] || TONE.mute) + ' ' + className}>
      {dot && <span className={'w-1.5 h-1.5 rounded-full ' + (DOT[tone] || DOT.mute)} />}
      {children}
    </span>
  )
}

export function Avatar({ name, size = 32, tone = 'brand' }) {
  const bg = { brand: 'bg-brand-100 text-brand-700', ok: 'bg-ok-100 text-ok-700', warn: 'bg-warn-100 text-warn-700', mute: 'bg-soft text-mute' }[tone]
  return (
    <span className={'inline-flex items-center justify-center rounded-full font-bold shrink-0 ' + bg}
      style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {initials(name)}
    </span>
  )
}

export function Bar({ value, max = 100, tone = 'brand', height = 6, className = '' }) {
  const pct = Math.max(0, Math.min(100, max ? (value / max) * 100 : 0))
  const col = { brand: 'bg-brand-500', ok: 'bg-ok-500', warn: 'bg-warn-500', bad: 'bg-bad-500', info: 'bg-info-500', mute: 'bg-faint' }[tone]
  return (
    <div className={'w-full rounded-full bg-soft overflow-hidden ' + className} style={{ height }}>
      <div className={'h-full rounded-full transition-all duration-700 ' + col} style={{ width: pct + '%' }} />
    </div>
  )
}

export function Delta({ value, suffix = '%', invert = false }) {
  if (value == null || !isFinite(value)) return null
  const good = invert ? value < 0 : value > 0
  const tone = value === 0 ? 'text-mute' : good ? 'text-ok-600' : 'text-bad-600'
  return (
    <span className={'text-[11.5px] font-bold ' + tone}>
      {value > 0 ? '▲' : value < 0 ? '▼' : '—'} {Math.abs(value).toFixed(1)}{suffix}
    </span>
  )
}

export function Empty({ label = 'Nothing here', sub, icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon size={26} className="text-faint mb-2" />
      <p className="text-[13px] font-semibold text-mute">{label}</p>
      {sub && <p className="text-[12px] text-faint mt-0.5">{sub}</p>}
    </div>
  )
}

/* ------------------------------------------------------------------- stats */
export function Kpi({ label, value, sub, tone = 'mute', icon: Icon, foot, onClick, accent }) {
  const ring = {
    brand: 'text-brand-600 bg-brand-50', ok: 'text-ok-600 bg-ok-50', warn: 'text-warn-600 bg-warn-50',
    bad: 'text-bad-600 bg-bad-50', info: 'text-info-600 bg-info-50', mute: 'text-mute bg-soft',
  }[tone]
  return (
    <div
      onClick={onClick}
      className={'card p-4 relative overflow-hidden ' + (onClick ? 'cursor-pointer hover:border-brand-300 transition-colors' : '')}
    >
      {accent && <span className={'absolute left-0 top-0 bottom-0 w-1 ' + accent} />}
      <div className="flex items-start justify-between gap-2">
        <p className="label">{label}</p>
        {Icon && <span className={'w-7 h-7 rounded-lg grid place-items-center shrink-0 ' + ring}><Icon size={15} /></span>}
      </div>
      <p className="text-[24px] leading-tight font-extrabold tracking-tight text-ink mt-2 num">{value}</p>
      {sub && <p className="text-[12px] text-mute mt-0.5">{sub}</p>}
      {foot && <div className="mt-2.5 pt-2.5 border-t border-line">{foot}</div>}
    </div>
  )
}

export function MiniStat({ label, value, tone = 'mute' }) {
  const col = { ok: 'text-ok-600', warn: 'text-warn-600', bad: 'text-bad-600', brand: 'text-brand-600', info: 'text-info-600', mute: 'text-ink' }[tone]
  return (
    <div className="min-w-0">
      <p className="label truncate">{label}</p>
      <p className={'text-[16px] font-extrabold num mt-0.5 ' + col}>{value}</p>
    </div>
  )
}

/* ------------------------------------------------------------------ charts */
export function Spark({ data, width = 92, height = 26, tone = '#4F46E5', fill = true }) {
  if (!data || data.length < 2) return null
  const min = Math.min(...data), max = Math.max(...data)
  const span = max - min || 1
  const pts = data.map((v, i) => [(i / (data.length - 1)) * width, height - ((v - min) / span) * (height - 3) - 1.5])
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ')
  return (
    <svg width={width} height={height} className="overflow-visible">
      {fill && <path d={d + ` L${width},${height} L0,${height} Z`} fill={tone} opacity="0.10" />}
      <path d={d} fill="none" stroke={tone} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.4" fill={tone} />
    </svg>
  )
}

export function Donut({ segments, size = 132, thickness = 15, center }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1
  const r = (size - thickness) / 2
  const c = 2 * Math.PI * r
  let acc = 0
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={thickness} className="stroke-soft" />
        {segments.map((s, i) => {
          const len = (s.value / total) * c
          const el = (
            <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color}
              strokeWidth={thickness} strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-acc}
              strokeLinecap="butt" className="transition-all duration-700" />
          )
          acc += len
          return el
        })}
      </svg>
      {center && (
        <div className="absolute inset-0 grid place-items-center text-center">
          {center}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------- table */
export function Table({
  columns, rows, keyFn, empty = 'No records', onRowClick, initialSort, pageSize = 12,
  searchable = false, searchKeys = [], toolbar, dense = false, maxHeight,
}) {
  const [sort, setSort] = useState(initialSort || null)
  const [page, setPage] = useState(0)
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    if (!q.trim()) return rows
    const s = q.toLowerCase()
    return rows.filter((r) => searchKeys.some((k) => String(k(r) ?? '').toLowerCase().includes(s)))
  }, [rows, q, searchKeys])

  const sorted = useMemo(() => {
    if (!sort) return filtered
    const col = columns.find((c) => c.key === sort.key)
    if (!col || !col.sortValue) return filtered
    const dir = sort.dir === 'asc' ? 1 : -1
    return [...filtered].sort((a, b) => {
      const av = col.sortValue(a), bv = col.sortValue(b)
      if (typeof av === 'string') return av.localeCompare(bv) * dir
      return ((av ?? 0) - (bv ?? 0)) * dir
    })
  }, [filtered, sort, columns])

  useEffect(() => { setPage(0) }, [q, rows.length])

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const view = pageSize ? sorted.slice(page * pageSize, page * pageSize + pageSize) : sorted

  const toggle = (key) =>
    setSort((s) => (s && s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' }))

  return (
    <div>
      {(searchable || toolbar) && (
        <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 border-b border-line">
          {searchable && (
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-faint" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…"
                className="input pl-8 w-56" />
            </div>
          )}
          {toolbar}
          <span className="ml-auto text-[12px] text-mute">{sorted.length} records</span>
        </div>
      )}
      <div className="overflow-x-auto" style={maxHeight ? { maxHeight, overflowY: 'auto' } : undefined}>
        <table className="w-full border-collapse">
          <thead className="bg-soft/70 sticky top-0 z-10">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={'th ' + (c.align === 'right' ? 'text-right' : '') + (c.sortValue ? ' cursor-pointer select-none hover:text-ink' : '')}
                  onClick={() => c.sortValue && toggle(c.key)} style={c.width ? { width: c.width } : undefined}>
                  <span className={'inline-flex items-center gap-1 ' + (c.align === 'right' ? 'flex-row-reverse' : '')}>
                    {c.label}
                    {sort && sort.key === c.key && (sort.dir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {view.map((r, i) => (
              <tr key={keyFn ? keyFn(r) : i}
                className={'row-hover ' + (onRowClick ? 'cursor-pointer' : '')}
                onClick={onRowClick ? () => onRowClick(r) : undefined}>
                {columns.map((c) => (
                  <td key={c.key} className={'td ' + (dense ? '!py-1.5 ' : '') + (c.align === 'right' ? 'text-right ' : '') + (c.cellClass || '')}>
                    {c.render(r, i)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {!view.length && <Empty label={empty} />}
      </div>
      {pageSize > 0 && pages > 1 && (
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-line">
          <span className="text-[12px] text-mute">
            {page * pageSize + 1}–{Math.min(sorted.length, (page + 1) * pageSize)} of {sorted.length}
          </span>
          <div className="flex items-center gap-1">
            <button className="btn-quiet !h-7 !px-2 disabled:opacity-40" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Prev</button>
            <span className="text-[12px] text-mute px-1 num">{page + 1} / {pages}</span>
            <button className="btn-quiet !h-7 !px-2 disabled:opacity-40" disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ drawer */
export function Drawer({ open, onClose, title, sub, children, width = 560, footer }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose()
    if (open) window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="bg-card border-l border-line shadow-pop h-full flex flex-col animate-slidein"
        style={{ width: 'min(' + width + 'px, 100vw)' }}>
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-line">
          <div className="min-w-0">
            <h3 className="text-[15px] font-bold text-ink truncate">{title}</h3>
            {sub && <p className="text-[12px] text-mute mt-0.5 truncate">{sub}</p>}
          </div>
          <button onClick={onClose} className="btn-quiet !h-8 !w-8 !px-0 justify-center"><X size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <div className="border-t border-line p-4 bg-soft/50">{footer}</div>}
      </div>
    </div>
  )
}

export function Field({ label, value, mono = false, tone }) {
  const col = tone ? { ok: 'text-ok-600', bad: 'text-bad-600', warn: 'text-warn-600', brand: 'text-brand-600' }[tone] : 'text-ink'
  return (
    <div className="min-w-0">
      <p className="label">{label}</p>
      <p className={'text-[13px] font-semibold mt-0.5 ' + col + (mono ? ' num' : '')}>{value ?? '—'}</p>
    </div>
  )
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-soft border border-line w-fit">
      {tabs.map((t) => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className={'px-3 h-7 rounded-md text-[12.5px] font-semibold transition-colors ' +
            (active === t.id ? 'bg-card text-ink shadow-card' : 'text-mute hover:text-ink')}>
          {t.label}{t.count != null && <span className="ml-1.5 text-[11px] opacity-70 num">{t.count}</span>}
        </button>
      ))}
    </div>
  )
}

export function Segmented({ options, value, onChange }) {
  return (
    <div className="flex items-center rounded-lg border border-line overflow-hidden">
      {options.map((o) => (
        <button key={o.value} onClick={() => onChange(o.value)}
          className={'px-2.5 h-8 text-[12px] font-semibold transition-colors ' +
            (value === o.value ? 'bg-brand-600 text-white' : 'bg-card text-mute hover:bg-soft')}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function LinkRow({ children, onClick }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between gap-2 px-4 py-2.5 hover:bg-soft transition-colors text-left border-t border-line first:border-t-0">
      {children}
      <ArrowRight size={13} className="text-faint shrink-0" />
    </button>
  )
}

export function useCountUp(target, ms = 700) {
  const [v, setV] = useState(target)
  const prev = useRef(target)
  useEffect(() => {
    const from = prev.current
    const start = performance.now()
    let raf
    const step = (t) => {
      const p = Math.min(1, (t - start) / ms)
      setV(from + (target - from) * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(step)
      else prev.current = target
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, ms])
  return v
}
