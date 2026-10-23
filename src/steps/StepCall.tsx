import { useState } from 'react'
import { getSetupRules } from '../lib/flexipleData'
import { formatLakh, formatUsd, type DataMode, type Plan, type Team } from '../lib/plan'
import { Button, Card, Eyebrow, Tag } from '../components/ui'

type Props = { team: Team; plan: Plan; mode: DataMode; onBack: () => void; onRestart: () => void }

const STATUS = {
  none: 'No policy Flexiple could verify',
  published: 'Policy published',
  limited: 'Limited for your cities',
  'likely-not-eligible': 'Likely not eligible',
}

export default function StepCall({ team, plan, mode, onBack, onRestart }: Props) {
  const setup = getSetupRules()
  const [booked, setBooked] = useState(false)

  if (booked) {
    return (
      <Card className="bg-forest p-8 text-center text-white sm:p-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-lime text-2xl text-forest">✓</div>
        <h2 className="mt-6 text-3xl sm:text-4xl">Your plan is on its way.</h2>
        <p className="mx-auto mt-3 max-w-xl text-white/80">
          In production, this plan goes straight to Flexiple's team, so the strategy call starts from your numbers, not from zero.
        </p>
        <p className="mt-2 text-sm text-white/60">Prototype: nothing was submitted.</p>
        <div className="mt-8">
          <Button onClick={onRestart}>Start a new plan</Button>
        </div>
      </Card>
    )
  }

  const people = `${team.swe} software, ${team.senior} senior${team.other ? `, ${team.other} ${team.otherLabel || 'other'}` : ''}`

  return (
    <div className="space-y-6">
      <Card className="p-6 sm:p-8">
        <Eyebrow className="text-muted">Step 4 · Book a strategy call</Eyebrow>
        <h2 className="mt-2 text-3xl">Your plan, ready to hand over</h2>
        <p className="mt-2 text-ink-2">This summary goes with your booking. Every figure links back to its Flexiple source in step 2.</p>
        <div className="mt-3">
          <Tag tone={mode === 'flexiple' ? 'lime' : 'amber'}>
            {mode === 'flexiple' ? 'Built on Flexiple-verified data only' : 'Includes third-party context'}
          </Tag>
        </div>

        <dl className="mt-8 grid gap-6 sm:grid-cols-2">
          <div>
            <dt className="font-mono text-[11px] uppercase tracking-wider text-muted">Team</dt>
            <dd className="mt-1">{plan.people} people ({people})</dd>
            <dd className="text-sm text-ink-2">
              Needed in {team.needIn} months · {team.sector}
              {team.hqCountry && ` · HQ ${team.hqCountry}`}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] uppercase tracking-wider text-muted">Model</dt>
            <dd className="mt-1 font-semibold text-forest">{plan.model.title}</dd>
            <dd className="text-sm text-ink-2">
              Managed fee {formatUsd(plan.managedFeeUsd)} / month + salary at cost. Entity setup: scoped on this call.
            </dd>
          </div>
        </dl>

        <div className="mt-8">
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted">Est. annual salary cost by city</p>
          <ul className="mt-3 divide-y divide-line rounded-2xl border border-line">
            {plan.rows.map((r) => (
              <li key={r.city} className="flex items-center justify-between gap-4 px-4 py-3">
                <span>{r.city}</span>
                <span className="font-semibold">{r.costL != null ? formatLakh(r.costL) : <span className="font-normal italic text-muted">Not estimated</span>}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted">Estimate from Flexiple medians, all levels. Not a quote.</p>
        </div>

        <div className="mt-8">
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted">Incentives</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {plan.incentives.map((i) => (
              <li key={i.state}>
                <Tag tone={i.status === 'published' ? 'mint' : i.status === 'none' ? 'grey' : 'amber'}>
                  {i.state}: {STATUS[i.status]}
                </Tag>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
          <Button variant="ghost" onClick={onBack}>← Back</Button>
          <Button onClick={() => setBooked(true)}>{setup.cta}</Button>
        </div>
      </Card>
    </div>
  )
}
