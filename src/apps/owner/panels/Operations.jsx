// The part that is different for every business. A gym gets members and PT
// slots; a transporter gets trucks and PODs; a factory gets job cards and
// machine downtime. Same shell, entirely different app.

import { Card, CardHead, Pill } from '../../../components/ui.jsx'
import { Note } from '../../../components/bits.jsx'
import { SNAPSHOTS } from '../../../data/ops.js'
import { OPS } from '../../../data/business.js'
import OwnerTable from '../OwnerTable.jsx'

export default function Operations({ client: c, accent }) {
  const ops = OPS[c.id]
  const snap = SNAPSHOTS[c.id]
  if (!ops) return <Note tone="warn" title="No operations module">This build does not include an operations module yet.</Note>

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden">
        <CardHead title={ops.primary.title} sub={ops.primary.sub}
          right={<Pill tone="mute">{ops.primary.rows.length} rows</Pill>} />
        <OwnerTable spec={ops.primary} />
      </Card>

      {ops.secondary && (
        <Card className="overflow-hidden">
          <CardHead title={ops.secondary.title} sub={ops.secondary.sub}
            right={<Pill tone="mute">{ops.secondary.rows.length} rows</Pill>} />
          <OwnerTable spec={ops.secondary} searchable={false} />
        </Card>
      )}

      {snap && snap.flags.length > 0 && (
        <Card>
          <CardHead title="Things worth knowing about your own numbers"
            sub="Written into the app by your CA, so you see them where the work happens" />
          <div className="p-4 space-y-2.5">
            {snap.flags.map((f, i) => (
              <div key={i} className="flex items-start gap-2.5 rounded-lg bg-soft p-3">
                <span className="w-5 h-5 rounded-md grid place-items-center shrink-0 text-[11px] font-extrabold num"
                  style={{ background: accent + '20', color: accent }}>{i + 1}</span>
                <p className="text-[12.5px] text-ink leading-relaxed">{f}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
