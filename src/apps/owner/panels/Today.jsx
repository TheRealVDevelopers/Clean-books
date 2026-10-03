import { useMemo, useState } from 'react'
import {
  ArrowRight, Wallet, Users, Landmark, CheckCircle2, ShieldCheck, Activity,
  Target, Camera, Truck, ChevronDown, ChevronUp, Clock3,
} from 'lucide-react'
import { Card, CardHead, Pill } from '../../../components/ui.jsx'
import { SNAPSHOTS } from '../../../data/ops.js'
import { MONEY, ACTIONS, FEED, attendanceSummary } from '../../../data/business.js'
import { DOC_REQUESTS } from '../../../data/recon.js'
import { forClient, isDone } from '../../../data/compliance.js'
import { LEDGER } from '../../../data/periods.js'
import { CURRENT_PERIOD } from '../../../data/practice.js'
import { inr, inrShort } from '../../../lib/format.js'
import { useApp } from '../../../lib/store.jsx'

export default function Today({ client, accent, onGo }) {
  const [details, setDetails] = useState(false)
  const { docStatusOf, statusOf, ownerMissionDone, completeOwnerMission } = useApp()
  const money = MONEY[client.id]
  const attendance = useMemo(() => attendanceSummary(client.id), [client.id])
  const snapshot = SNAPSHOTS[client.id]
  const feed = FEED[client.id] || []
  const documents = DOC_REQUESTS.filter((doc) => doc.clientId === client.id && docStatusOf(doc) !== 'Received')
  const ledger = LEDGER[client.id][CURRENT_PERIOD]
  const nextDue = forClient(client.id).filter((item) => !isDone({ ...item, status: statusOf(item) })).sort((a, b) => a.due.localeCompare(b.due))[0]
  const missions = makeMissions(client, ACTIONS[client.id] || [], documents)
  const completed = missions.filter((mission) => ownerMissionDone(mission.id)).length
  const collectionScore = Math.min(100, Math.round((money.collectedMonth / Math.max(1, money.billedMonth)) * 100))
  const health = Math.round((ledger.readiness.pct * 0.4) + (collectionScore * 0.35) + ((attendance.onDuty / Math.max(1, attendance.total)) * 100 * 0.25))

  return <div className="space-y-5">
    <section className="rounded-2xl overflow-hidden text-white shadow-card" style={{ background: `linear-gradient(125deg, ${accent}, ${accent}CC 58%, #0F172A)` }}>
      <div className="p-5 lg:p-6 grid lg:grid-cols-[1.25fr_0.75fr] gap-6 items-center">
        <div>
          {nextDue && (
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="chip bg-white/15 text-white">
                <Clock3 size={11} /> {nextDue.form} due {nextDue.due.slice(8, 10)}/{nextDue.due.slice(5, 7)}
              </span>
            </div>
          )}
          <p className="text-white/70 text-[12px] font-semibold uppercase tracking-[0.16em]">Today’s focus</p>
          <h2 className="text-[25px] lg:text-[31px] font-extrabold tracking-tight mt-1">Complete {missions.length - completed} missions. Keep the business clean.</h2>
          <p className="text-white/75 text-[13px] mt-2 max-w-xl">You only need to act on what is shown below. CleanBook watches the rest.</p>
          <div className="flex flex-wrap gap-2 mt-4">
            <button onClick={() => onGo('money')} className="h-10 px-4 rounded-xl bg-white text-[13px] font-bold" style={{ color: accent }}><Camera size={14} className="inline mr-1.5" />Capture a bill</button>
            <button onClick={() => onGo('ops')} className="h-10 px-4 rounded-xl bg-white/15 hover:bg-white/20 text-[13px] font-bold"><Truck size={14} className="inline mr-1.5" />Open operations</button>
          </div>
        </div>
        <div className="flex justify-center lg:justify-end">
          <div className="relative w-44 h-44 rounded-full bg-white/10 grid place-items-center border border-white/15">
            <div className="absolute inset-3 rounded-full border-[10px] border-white/15" />
            <div className="text-center relative"><p className="text-[46px] leading-none font-extrabold">{health}</p><p className="text-[12px] text-white/75 mt-1">Business health</p><span className="chip mt-2 bg-white/15 text-white">{health >= 85 ? "Strong" : health >= 70 ? "Steady" : health >= 55 ? "Needs work" : "At risk"}</span></div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 border-t border-white/15 bg-black/10">
        <HeroStat label="Collected today" value={inrShort(money.collectedToday)} icon={Wallet} />
        <HeroStat label="Team active" value={attendance.onDuty + ' / ' + attendance.total} icon={Users} />
        <HeroStat label="Cash + bank" value={inrShort(money.cashInHand + money.bank)} icon={Landmark} />
      </div>
    </section>

    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <Card className="xl:col-span-2 overflow-hidden">
        <CardHead title="Today’s missions" sub="Small actions that keep the month clean. None of them takes more than a minute." icon={Target} right={<Pill tone={completed === missions.length ? 'ok' : 'brand'}>{completed}/{missions.length} done</Pill>} />
        <div className="p-4 grid md:grid-cols-2 gap-3">
          {missions.map((mission) => {
            const done = ownerMissionDone(mission.id)
            return <div key={mission.id} className={'rounded-xl border p-4 transition-all ' + (done ? 'border-ok-500/25 bg-ok-50/70' : 'border-line bg-card hover:border-brand-300')}>
              <div className="flex items-start gap-3">
                <button onClick={() => !done && completeOwnerMission(mission.id, mission.title)} className={'w-9 h-9 rounded-xl grid place-items-center shrink-0 ' + (done ? 'bg-ok-500 text-white' : 'bg-soft text-mute hover:bg-brand-50 hover:text-brand-600')}>
                  {done ? <CheckCircle2 size={18} /> : <mission.icon size={17} />}
                </button>
                <div className="min-w-0 flex-1"><p className={'text-[13.5px] font-bold ' + (done ? 'text-ok-700 line-through' : 'text-ink')}>{mission.title}</p><p className="text-[11.5px] text-mute mt-1 leading-relaxed">{mission.detail}</p></div>
              </div>
              {!done && <div className="flex justify-end mt-3"><button onClick={() => onGo(mission.go)} className="btn-quiet !h-7 text-[11.5px]">Do now <ArrowRight size={11} /></button></div>}
            </div>
          })}
        </div>
      </Card>

      <Card>
        <CardHead title="Your CA status" sub="One simple answer" icon={ShieldCheck} />
        <div className="p-4 space-y-4">
          <div className={'rounded-2xl p-4 text-center ' + (documents.length ? 'bg-warn-50 border border-warn-500/25' : 'bg-ok-50 border border-ok-500/25')}>
            {documents.length ? <Clock3 size={25} className="mx-auto text-warn-600" /> : <CheckCircle2 size={25} className="mx-auto text-ok-600" />}
            <p className={'text-[16px] font-extrabold mt-2 ' + (documents.length ? 'text-warn-700' : 'text-ok-700')}>{documents.length ? documents.length + ' item' + (documents.length > 1 ? 's' : '') + ' needed' : 'Everything is ready'}</p>
            <p className="text-[12px] text-mute mt-1">GST data is {ledger.readiness.pct}% complete</p>
            {documents.length > 0 && <button onClick={() => onGo('ca')} className="btn-primary w-full justify-center mt-3">Send now <ArrowRight size={13} /></button>}
          </div>
          {nextDue && <div className="flex items-center justify-between gap-3 rounded-xl bg-soft p-3"><div><p className="label">Next deadline</p><p className="font-bold text-[13px] mt-1">{nextDue.form}</p></div><div className="text-right"><p className="font-extrabold num" style={{ color: accent }}>{nextDue.due.slice(8, 10)}/{nextDue.due.slice(5, 7)}</p><p className="text-[10.5px] text-mute">{nextDue.amount ? inr(nextDue.amount) : 'No payment'}</p></div></div>}
        </div>
      </Card>
    </div>

    <Card>
      <button onClick={() => setDetails(!details)} className="w-full px-4 py-3.5 flex items-center gap-3 text-left"><span className="w-8 h-8 rounded-lg bg-soft text-mute grid place-items-center"><Activity size={15} /></span><div className="flex-1"><p className="font-bold text-[13.5px]">Business details</p><p className="text-[11.5px] text-mute">Open only when you need the numbers</p></div>{details ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>
      {details && <div className="border-t border-line p-4 space-y-4"><div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">{snapshot?.tiles.map((tile) => <div key={tile.label} className="rounded-xl bg-soft p-3"><p className="label truncate">{tile.label}</p><p className="text-[19px] font-extrabold num mt-1">{tile.value}</p><p className="text-[10.5px] text-mute mt-1 truncate">{tile.sub}</p></div>)}</div><div><p className="label mb-2">Latest activity</p><div className="grid md:grid-cols-2 gap-2">{feed.slice(0, 4).map((item) => <div key={item.id} className="flex gap-2 rounded-lg border border-line p-2.5"><span className="text-[10.5px] font-bold text-faint">{item.at}</span><div><p className="text-[12px] font-bold">{item.title}</p><p className="text-[10.5px] text-mute mt-0.5">{item.detail}</p></div></div>)}</div></div></div>}
    </Card>
  </div>
}

function HeroStat({ label, value, icon: Icon }) {
  return <div className="px-3 py-3.5 lg:px-5 flex items-center gap-2.5 border-r border-white/15 last:border-r-0"><Icon size={16} className="text-white/65 shrink-0" /><div className="min-w-0"><p className="text-[10px] uppercase tracking-wider text-white/60 font-semibold truncate">{label}</p><p className="text-[16px] lg:text-[20px] font-extrabold truncate">{value}</p></div></div>
}

function makeMissions(client, actions, documents) {
  const actionMissions = actions.slice(0, 2).map((action, index) => ({ id: client.id + ':action:' + index, title: action.title, detail: action.detail, icon: Target, go: action.cta.toLowerCase().includes('upload') ? 'ca' : action.cta.toLowerCase().match(/cash|collect|pay/) ? 'money' : 'ops' }))
  const documentMission = documents[0] ? [{ id: client.id + ':document:' + documents[0].id, title: 'Send ' + documents[0].what, detail: 'Your CA needs this to complete the current filing.', icon: ShieldCheck, go: 'ca' }] : []
  const daily = [{ id: client.id + ':daily-check', title: 'Review today’s operations', detail: 'Check exceptions once; CleanBook tracks the normal work for you.', icon: Activity, go: 'ops' }]
  return [...documentMission, ...actionMissions, ...daily].slice(0, 4)
}
