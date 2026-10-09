import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Settings as SettingsIcon, Building2, Plug, BellRing, Users, ShieldCheck, RotateCcw,
  CheckCircle2, XCircle, Moon, Sun, Handshake,
} from 'lucide-react'
import { Card, CardHead, PageHead, Pill, Field, MiniStat, Avatar, Table } from '../components/ui.jsx'
import { Note, SectionTitle } from '../components/bits.jsx'
import { inr } from '../lib/format.js'
import { useApp } from '../lib/store.jsx'
import { useRepo } from '../repo/index.js'

export default function Settings() {
  const { theme, toggleTheme, resetDemo, actionCount, toast } = useApp()
  const { FIRM, STAFF, CLIENTS, PORTALS, revenue } = useRepo()
  const [prefs, setPrefs] = useState({
    dueIn7: true, dueTomorrow: true, overdue: true, noticeReceived: true,
    docUploaded: true, thresholdCrossed: true, payoutCredited: true, weeklyDigest: false,
  })
  const flip = (k) => setPrefs((p) => ({ ...p, [k]: !p[k] }))

  return (
    <div className="space-y-5">
      <PageHead
        title="Settings"
        sub="Firm profile, portal connections, alerts and the referral agreement"
        chips={[
          <Pill key="a" tone="ok" dot>{FIRM.plan}</Pill>,
          <Pill key="b" tone="mute">FRN {FIRM.frn}</Pill>,
        ]}
        actions={
          <>
            <button className="btn-ghost" onClick={toggleTheme}>
              {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />} {theme === 'light' ? 'Dark' : 'Light'} theme
            </button>
            {actionCount > 0 && <button className="btn-ghost" onClick={resetDemo}><RotateCcw size={14} /> Reset demo data</button>}
          </>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card>
          <CardHead title="Practice profile" sub="What appears on every filing and statement" icon={Building2} />
          <div className="p-4 space-y-3">
            <Field label="Firm name" value={FIRM.name} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Firm registration no." value={FIRM.frn} mono />
              <Field label="Membership" value={FIRM.membership} mono />
            </div>
            <Field label="Principal" value={FIRM.principal} />
            <Field label="Office" value={FIRM.office} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone" value={FIRM.phone} mono />
              <Field label="GSTIN" value={FIRM.gstin} mono />
            </div>
            <Field label="Email" value={FIRM.email} />
            <div className="pt-3 border-t border-line grid grid-cols-2 gap-3">
              <MiniStat label="Plan" value="Free forever" tone="ok" />
              <MiniStat label="On CleanBook since" value="Feb 2026" />
            </div>
          </div>
        </Card>

        <Card className="xl:col-span-2 overflow-hidden">
          <CardHead title="Connections" sub="Where the data comes from and where returns go out" icon={Plug}
            right={<Pill tone="ok">{PORTALS.filter((i) => i.status === 'Connected').length} of {PORTALS.length} live</Pill>} />
          <div className="divide-y divide-line max-h-[520px] overflow-y-auto">
            {PORTALS.map((i) => (
              <div key={i.name} className="px-4 py-3 flex items-start gap-3">
                <span className={'w-7 h-7 rounded-lg grid place-items-center shrink-0 ' +
                  (i.tone === 'ok' ? 'bg-ok-50 text-ok-600' : i.tone === 'warn' ? 'bg-warn-50 text-warn-600' : 'bg-bad-50 text-bad-600')}>
                  {i.tone === 'ok' ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[12.5px] font-bold text-ink">{i.name}</p>
                    <Pill tone={i.tone}>{i.status}</Pill>
                  </div>
                  <p className="text-[11.5px] text-mute mt-0.5">{i.detail}</p>
                  <p className="text-[11px] text-faint mt-0.5">{i.scope}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHead title="What the practice gets told about" sub="Alerts land in the bell, on WhatsApp and by email" icon={BellRing} />
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              ['dueTomorrow', 'A return falls due tomorrow', 'One message per client, every evening'],
              ['dueIn7', 'Anything due in the next seven days', 'Monday morning summary'],
              ['overdue', 'Something has gone past its date', 'Immediately, to the owner and the principal'],
              ['noticeReceived', 'A notice arrives on any portal', 'Within the hour of it appearing'],
              ['docUploaded', 'A client uploads a document', 'Batched hourly, so it is not noise'],
              ['thresholdCrossed', 'A client crosses a statutory threshold', 'Composition, e-invoicing, registration, 44AB'],
              ['payoutCredited', 'The revenue share is credited', 'With the statement attached'],
              ['weeklyDigest', 'Weekly practice digest', 'Turnover, filings, chase list, earnings'],
            ].map(([key, title, sub]) => (
              <button key={key} onClick={() => flip(key)}
                className={'text-left rounded-xl border p-3 transition-colors ' + (prefs[key] ? 'border-brand-300 bg-brand-50/40' : 'border-line hover:bg-soft')}>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[12.5px] font-bold text-ink">{title}</p>
                  <span className={'w-9 h-5 rounded-full shrink-0 relative transition-colors ' + (prefs[key] ? 'bg-brand-600' : 'bg-line')}>
                    <span className={'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ' + (prefs[key] ? 'left-[18px]' : 'left-0.5')} />
                  </span>
                </div>
                <p className="text-[11.5px] text-mute mt-1">{sub}</p>
              </button>
            ))}
          </div>
        </Card>

        {revenue && (
          <Card>
            <CardHead title="The referral agreement" sub="What CleanBook costs, and what it pays" icon={Handshake} />
            <div className="p-4 space-y-3">
              <div className="rounded-xl bg-ok-50 border border-ok-500/25 p-3.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-ok-700/70">Dashboard cost</p>
                <p className="text-[22px] font-extrabold text-ok-700 num leading-tight">₹0</p>
                <p className="text-[11.5px] text-ok-700/80 mt-0.5">Free forever, for every client in your book</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Your share" value={revenue.TERMS.sharePct + '% of gross'} />
                <Field label="Paid on" value={'The ' + revenue.TERMS.payoutDay + 'th'} />
              </div>
              <Field label="Earning right now" value={inr(revenue.CURRENT_MONTH.gross) + ' / month'} tone="ok" />
              <Field label="Agreement" value={revenue.TERMS.agreement} />
              <Note tone="warn" title="Professional-conduct check">
                An ongoing revenue-linked arrangement needs to be looked at against the Chartered Accountants Act, 1949
                before it is signed. See the note on the revenue share page.
              </Note>
              <Link to="/revenue" className="btn-ghost w-full justify-center">Open revenue share</Link>
            </div>
          </Card>
        )}
      </div>

      <Card className="overflow-hidden">
        <CardHead title="Team access" sub="Who can see and sign what" icon={Users}
          right={<Pill tone="mute">{STAFF.length} users · unlimited on the free plan</Pill>} />
        <Table
          columns={[
            { key: 'who', label: 'Member', render: (s) => (
              <div className="flex items-center gap-2.5">
                <Avatar name={s.name} size={30} tone={s.avatarTone} />
                <div>
                  <p className="text-[12.5px] font-bold text-ink">{s.name}</p>
                  <p className="text-[11px] text-mute">{s.title}</p>
                </div>
              </div>
            ) },
            { key: 'scope', label: 'Scope', render: (s) => <span className="text-[12px] text-mute">{s.scope}</span> },
            { key: 'clients', label: 'Clients', align: 'right', render: (s) => (
              <span className="num text-[12.5px] font-semibold">{CLIENTS.filter((c) => c.staffId === s.id).length || '—'}</span>
            ) },
            { key: 'cap', label: 'Weekly capacity', align: 'right', render: (s) => <span className="num text-[12.5px]">{s.capacity}h</span> },
            { key: 'sign', label: 'Can sign returns', render: (s) => s.role === 'principal'
              ? <Pill tone="ok" dot>Yes — DSC on file</Pill>
              : s.role === 'manager' ? <Pill tone="info">Prepare & review</Pill> : <Pill tone="mute">Prepare only</Pill> },
            { key: 'contact', label: 'Contact', render: (s) => <span className="num text-[11.5px] text-mute">{s.phone}</span> },
          ]}
          rows={STAFF}
          keyFn={(s) => s.id}
          pageSize={0}
        />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Note tone="info" title="Where the data sits" icon={ShieldCheck}>
          Client books stay in the client's own CleanBook space. The practice sees what it needs for compliance; Real V
          sees nothing of a client's books once the application is handed over.
        </Note>
        <Note tone="ok" title="Why the dashboard is free">
          The practice is the distribution channel, not the customer. Real V earns from the custom applications it
          builds for the clients — and pays the practice 20% of that for the introduction.
        </Note>
        <Note tone="mute" title="This is a prototype" icon={SettingsIcon}>
          Every number, client, notice and payout on this build is demonstration data. Filing actions change the screen
          for the session only — nothing is sent to any portal.
        </Note>
      </div>
    </div>
  )
}
