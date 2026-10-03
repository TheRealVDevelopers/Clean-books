import { Link } from 'react-router-dom'
import {
  Dumbbell, Truck, UtensilsCrossed, Factory, Plane, Scissors, Pill as PillIcon,
  Hammer, Stethoscope, Wheat, GraduationCap, ShoppingBag, Building2, CheckCircle2,
  AlertTriangle, Info, X, Sparkles,
} from 'lucide-react'
import { Pill, Bar } from './ui.jsx'
import { FILING_TONE, dueTone, dueLabel, READINESS_TONE } from '../lib/status.js'
import { daysBetween } from '../lib/dates.js'
import { TODAY } from '../data/practice.js'
import { iso } from '../lib/dates.js'
import { useApp } from '../lib/store.jsx'

const ICONS = {
  Dumbbell, Truck, UtensilsCrossed, Factory, Plane, Scissors, Pill: PillIcon,
  Hammer, Stethoscope, Wheat, GraduationCap, ShoppingBag,
}

const NOW = iso(TODAY)

export function VerticalIcon({ client, size = 16, className = '' }) {
  const I = ICONS[client?.icon] || Building2
  return <I size={size} className={className} />
}

// A client's identity, used in every table so rows are scannable by trade.
export function ClientChip({ client, sub, link = true, size = 30 }) {
  const inner = (
    <span className="flex items-center gap-2.5 min-w-0">
      <span
        className={'rounded-lg grid place-items-center shrink-0 ' +
          (client.realv.status === 'Live & Billing' ? 'bg-brand-50 text-brand-600' : 'bg-soft text-mute')}
        style={{ width: size, height: size }}
      >
        <VerticalIcon client={client} size={size * 0.52} />
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-bold text-ink truncate">{client.short}</span>
        <span className="block text-[11px] text-mute truncate">{sub ?? client.verticalLabel}</span>
      </span>
    </span>
  )
  return link
    ? <Link to={'/clients/' + client.id} className="hover:opacity-80 transition-opacity">{inner}</Link>
    : inner
}

export function StatusPill({ status, dot = true }) {
  return <Pill tone={FILING_TONE[status] || 'mute'} dot={dot}>{status}</Pill>
}

export function DueCell({ due, done, showDate = true }) {
  if (!due) return <span className="text-faint">—</span>
  const d = daysBetween(NOW, due)
  return (
    <span className="inline-flex items-center gap-2">
      {showDate && <span className="num text-[12.5px] text-mute">{due.slice(8, 10)}/{due.slice(5, 7)}</span>}
      <Pill tone={dueTone(d, done)}>{dueLabel(d, done)}</Pill>
    </span>
  )
}

export function Readiness({ pct, width = 90, showPct = true }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span style={{ width }}><Bar value={pct} tone={READINESS_TONE(pct)} height={6} /></span>
      {showPct && <span className={'num text-[12px] font-bold ' + (pct >= 95 ? 'text-ok-600' : pct >= 80 ? 'text-info-600' : pct >= 60 ? 'text-warn-600' : 'text-bad-600')}>{pct}%</span>}
    </span>
  )
}

export function SectionTitle({ children, sub, right }) {
  return (
    <div className="flex items-end justify-between gap-3 mb-2.5 mt-1">
      <div>
        <h2 className="text-[15px] font-extrabold tracking-tight text-ink">{children}</h2>
        {sub && <p className="text-[12px] text-mute mt-0.5">{sub}</p>}
      </div>
      {right}
    </div>
  )
}

export function Note({ tone = 'info', title, children, icon: Icon }) {
  const map = {
    info: 'bg-info-50 border-info-500/25 text-info-700',
    warn: 'bg-warn-50 border-warn-500/25 text-warn-700',
    bad: 'bg-bad-50 border-bad-500/25 text-bad-700',
    ok: 'bg-ok-50 border-ok-500/25 text-ok-700',
    brand: 'bg-brand-50 border-brand-500/25 text-brand-700',
    mute: 'bg-soft border-line text-mute',
  }[tone]
  const I = Icon || (tone === 'bad' || tone === 'warn' ? AlertTriangle : tone === 'ok' ? CheckCircle2 : Info)
  return (
    <div className={'rounded-xl border p-3.5 flex items-start gap-2.5 ' + map}>
      <I size={15} className="shrink-0 mt-0.5" />
      <div className="min-w-0">
        {title && <p className="text-[12.5px] font-bold">{title}</p>}
        <div className="text-[12.5px] leading-relaxed opacity-90">{children}</div>
      </div>
    </div>
  )
}

// Small "this came in by itself" marker. Used wherever data arrived from a
// client's own application rather than from a human being chased.
export function AutoTag({ children = 'Auto from client app' }) {
  return (
    <span className="chip border bg-ok-50 text-ok-700 border-ok-500/25">
      <Sparkles size={10} /> {children}
    </span>
  )
}

export function Toasts() {
  const { toasts } = useApp()
  if (!toasts.length) return null
  return (
    <div className="fixed bottom-4 right-4 z-[70] flex flex-col gap-2 w-[330px]">
      {toasts.map((t) => (
        <div key={t.id} className="card shadow-pop p-3.5 animate-slidein flex items-start gap-2.5">
          <span className={'w-7 h-7 rounded-lg grid place-items-center shrink-0 ' +
            (t.tone === 'ok' ? 'bg-ok-50 text-ok-600' : t.tone === 'warn' ? 'bg-warn-50 text-warn-600' : t.tone === 'brand' ? 'bg-brand-50 text-brand-600' : 'bg-soft text-mute')}>
            {t.tone === 'warn' ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
          </span>
          <div className="min-w-0">
            <p className="text-[12.5px] font-bold text-ink">{t.title}</p>
            {t.detail && <p className="text-[11.5px] text-mute mt-0.5">{t.detail}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}

export function CloseButton({ onClick }) {
  return <button onClick={onClick} className="btn-quiet !h-8 !w-8 !px-0 justify-center"><X size={16} /></button>
}
