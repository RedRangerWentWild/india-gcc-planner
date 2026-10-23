import { getCities, getMarket, getPolicies, getSetupRules } from '../lib/flexipleData'
import { formatLakh, formatUsd, type DataMode, type Incentive, type Plan, type Team } from '../lib/plan'
import { Button, Card, Eyebrow, NotPublished, Source, Tag } from '../components/ui'

type Props = { team: Team; plan: Plan; mode: DataMode; onBack: () => void; onNext: () => void }

export default function StepPlan({ team, plan, mode, onBack, onNext }: Props) {
  const setup = getSetupRules()
  const cities = getCities()
  const policies = getPolicies()
  const [teamRule, entityRule, breakEvenRule, directorRule] = setup.rules
  const toEntity = plan.model.kind === 'managed-then-entity'

  return (
    <div className="space-y-6">
      {/* Model */}
      <Card className="bg-forest p-6 text-white sm:p-8">
        <Eyebrow className="text-lime">Step 2 · Your plan · Model</Eyebrow>
        <h2 className="mt-2 text-3xl sm:text-4xl">{plan.model.title}</h2>
        <p className="mt-3 max-w-2xl text-white/80">
          Your team is {plan.people} {plan.people === 1 ? 'person' : 'people'}. Flexiple's rule: break-even at {setup.breakEvenHeadcount} people
          <Source href={setup.sources.rules} label="flexiple.com/gcc/india, section 05" />.{' '}
          {toEntity
            ? 'You are past it, so start under managed employment and move to your own entity while the team works.'
            : `Below ${setup.breakEvenHeadcount}, managed employment costs less than running your own entity. Revisit when you pass ${setup.breakEvenHeadcount}.`}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[teamRule, ...(toEntity ? [entityRule] : []), breakEvenRule, directorRule].map((r) => (
            <div key={r.title} className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
              <p className="font-serif text-lg font-bold text-lime">
                {r.title}
                <Source href={setup.sources.rules} label="flexiple.com/gcc/india, section 05" />
              </p>
              <p className="mt-2 text-sm text-white/75">{r.text}</p>
            </div>
          ))}
        </div>

        {toEntity && (
          <p className="mt-6 text-sm text-white/80">
            You need the team in {team.needIn} months. The entity takes 4 to 6 months, so hiring starts under managed employment either way.
          </p>
        )}

        <div className="mt-8 grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-2">
          <div>
            <Eyebrow className="text-white/60">Managed fee, while on managed employment</Eyebrow>
            <p className="mt-2 font-serif text-3xl font-bold">
              {formatUsd(plan.managedFeeUsd)}
              <span className="font-sans text-base font-normal text-white/70"> / month</span>
              <Source href={setup.sources.pricing} label="flexiple.com/gcc pricing" />
            </p>
            <p className="mt-1 text-sm text-white/70">
              {formatUsd(setup.managedFeeUsdPerPersonPerMonth)} × {plan.people} people, plus salary at cost.
            </p>
          </div>
          <div>
            <Eyebrow className="text-white/60">Entity setup cost</Eyebrow>
            <p className="mt-2 font-serif text-3xl font-bold">Scoped on a strategy call</p>
            <p className="mt-1 text-sm text-white/70">
              {setup.entitySetupCostLabel}
              <Source href={setup.sources.pricing} label="flexiple.com/gcc pricing" />
            </p>
          </div>
        </div>
      </Card>

      {/* Cities */}
      <Card className="p-6 sm:p-8">
        <Eyebrow className="text-muted">City comparison</Eyebrow>
        <h3 className="mt-2 text-2xl">Talent and salary cost, side by side</h3>
        <p className="mt-2 text-sm text-ink-2">
          {cities.unit}. Source: <a className="underline" href={cities.sourceUrl} target="_blank" rel="noreferrer">{cities.source}</a>, {cities.asOf}.
        </p>

        <div className="mt-6 -mx-6 overflow-x-auto px-6 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-line font-mono text-[11px] uppercase tracking-wider text-muted">
                <th className="py-3 pr-4 font-medium">City</th>
                <th className="py-3 pr-4 font-medium">Tracked professionals</th>
                <th className="py-3 pr-4 font-medium">Companies with 25+</th>
                <th className="py-3 pr-4 font-medium">Verified GCCs here</th>
                <th className="py-3 pr-4 font-medium">SWE median</th>
                <th className="py-3 pr-4 font-medium">Senior median</th>
                <th className="py-3 font-medium">Est. annual salary cost, your team</th>
              </tr>
            </thead>
            <tbody>
              {plan.rows.map((c) => {
                const lowest = c.costL != null && c.costL === plan.lowestCostL
                return (
                  <tr key={c.city} className={`border-b border-line last:border-0 ${lowest ? 'bg-mint/40' : ''}`}>
                    <td className="py-4 pr-4">
                      <a href={c.cityPage} target="_blank" rel="noreferrer" className="font-semibold text-forest underline-offset-2 hover:underline">
                        {c.city}
                      </a>
                      <p className="text-xs text-muted">{c.state}</p>
                    </td>
                    <td className="py-4 pr-4">{c.trackedProfessionals}<Source href={c.cityPage} label={`Flexiple ${c.city} page`} /></td>
                    <td className="py-4 pr-4">{c.companies25plus}<Source href={c.cityPage} label={`Flexiple ${c.city} page`} /></td>
                    <td className="py-4 pr-4">
                      {c.verifiedGccs != null ? <>{c.verifiedGccs}<Source href={c.cityPage} label={`Flexiple ${c.city} page, verified directory`} /></> : <NotPublished />}
                    </td>
                    <td className="py-4 pr-4">
                      {c.sweMedianL != null ? <>₹{c.sweMedianL}L<Source href={cities.sourceUrl} label={cities.source} /></> : <NotPublished text="Withheld (under Flexiple's publish gate)" />}
                    </td>
                    <td className="py-4 pr-4">
                      {c.seniorMedianL != null ? <>₹{c.seniorMedianL}L<Source href={cities.sourceUrl} label={cities.source} /></> : <NotPublished text="Withheld (under Flexiple's publish gate)" />}
                    </td>
                    <td className="py-4">
                      {c.costL != null ? (
                        <span className="font-serif text-lg font-bold">{formatLakh(c.costL)}<Source href={cities.sourceUrl} label="Computed from Flexiple medians" /></span>
                      ) : (
                        <NotPublished text={team.swe + team.senior === 0 ? 'Not estimated' : 'Not published'} />
                      )}
                      {lowest && <div className="mt-1"><Tag tone="lime">Lowest salary cost for your team</Tag></div>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-6 space-y-2 rounded-2xl bg-paper p-5 text-sm text-ink-2">
          <p>
            <strong className="text-ink">Estimate from Flexiple medians, all levels. Not a quote.</strong> {team.swe} × SWE median + {team.senior} × senior median.
          </p>
          {team.other > 0 && (
            <p>
              Other roles ({team.other}{team.otherLabel ? `, ${team.otherLabel}` : ''}): Not estimated, see role pages on each city page.
            </p>
          )}
          {cities.caveats.map((c) => (
            <p key={c}>{c}</p>
          ))}
        </div>
      </Card>

      {mode === 'all' && <MarketContext cityNames={plan.rows.map((r) => r.city)} />}

      {/* Incentives */}
      <Card className="p-6 sm:p-8">
        <Eyebrow className="text-muted">State incentives</Eyebrow>
        <h3 className="mt-2 text-2xl">Only policies Flexiple could source</h3>
        <p className="mt-2 text-sm text-ink-2">
          {policies.note}
          <Source href={policies.sourceUrl} label={policies.source} />
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {plan.incentives.map((i) => (
            <IncentiveCard key={i.state} i={i} sourceUrl={policies.sourceUrl} source={policies.source} />
          ))}
        </div>
      </Card>

      {/* Could not verify */}
      <Card className="border-dashed bg-paper p-6 sm:p-8">
        <Eyebrow className="text-muted">What we could not verify</Eyebrow>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-ink-2">
          {setup.couldNotVerify.map((c) => (
            <li key={c}>{c}</li>
          ))}
          <li>Entity setup cost: {setup.entitySetupCostLabel.toLowerCase()}.</li>
          <li>Salary cost for roles other than software and senior engineers.</li>
        </ul>
        <p className="mt-4 text-xs text-muted">
          From Flexiple's own "What we could not verify" notes
          <Source href={setup.sources.rules} label="flexiple.com/gcc/india" />.
        </p>
      </Card>

      <div className="flex flex-wrap justify-between gap-4">
        <Button variant="ghost" onClick={onBack}>← Edit team</Button>
        <Button onClick={onNext}>See companies like you →</Button>
      </div>
    </div>
  )
}

function IncentiveCard({ i, sourceUrl, source }: { i: Incentive; sourceUrl: string; source: string }) {
  if (i.status === 'none') {
    return (
      <div className="rounded-2xl border border-line p-5">
        <p className="font-semibold">{i.state}</p>
        <p className="mt-2 text-sm text-muted">No policy Flexiple could verify.</p>
      </div>
    )
  }
  const tag = {
    published: <Tag tone="mint">Policy published</Tag>,
    limited: <Tag tone="amber">Limited for your cities</Tag>,
    'likely-not-eligible': <Tag tone="amber">Likely not eligible</Tag>,
  }[i.status]
  return (
    <div className="rounded-2xl border border-line p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold">{i.state}</p>
        {tag}
      </div>
      <p className="mt-2 text-sm font-medium text-forest">{i.policy.policy}</p>
      <p className="mt-1 text-sm text-ink-2">
        {i.policy.summary}
        <Source href={i.policy.originalUrl ?? sourceUrl} label={i.policy.originalUrl ? i.policy.originalSource : source} />
      </p>
      {i.reason && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{i.reason}</p>}
      <p className="mt-3 text-xs text-muted">Original source: {i.policy.originalSource}</p>
    </div>
  )
}

function MarketContext({ cityNames }: { cityNames: string[] }) {
  const market = getMarket()
  const cities = getCities()
  return (
    <Card className="border-amber-300 p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Eyebrow className="text-muted">Market context</Eyebrow>
        <Tag tone="amber">Third-party · not verified by Flexiple</Tag>
      </div>
      <h3 className="mt-2 text-2xl">What other publishers say</h3>
      <p className="mt-2 text-sm text-ink-2">
        Somebody else's research, cited on Flexiple's pages with the publisher and the page it was read on
        <Source href={market.sourceUrl} label="flexiple.com/gcc/statistics" />. These count centres and square feet; Flexiple's own numbers above count people.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {cityNames.map((name) => {
          const figs = market.byCity.filter((f) => f.city === name)
          return (
            <div key={name} className="rounded-2xl border border-line p-5">
              <p className="font-semibold">{name}</p>
              {figs.length === 0 ? (
                <p className="mt-2 text-sm italic text-muted">No third-party figure Flexiple could source.</p>
              ) : (
                figs.map((f) => (
                  <p key={f.figure} className="mt-2 text-sm text-ink-2">
                    {f.figure} <span className="text-muted">({f.period}, {f.publisher})</span>
                    <Source href={f.url} label={f.publisher} />
                  </p>
                ))
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-6">
        <p className="font-mono text-[11px] uppercase tracking-wider text-muted">India, national</p>
        <ul className="mt-3 space-y-2 text-sm text-ink-2">
          {market.national.map((f) => (
            <li key={f.figure}>
              <strong className="text-ink">{f.figure}</strong>, {f.detail} <span className="text-muted">({f.period}, {f.publisher})</span>
              <Source href={f.url} label={f.publisher} />
            </li>
          ))}
        </ul>
      </div>

      {market.disagreements.map((d) => (
        <div key={d.what} className="mt-6 grid gap-3 rounded-2xl bg-paper p-5 sm:grid-cols-[1fr_1fr_2fr] sm:items-center">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted">{d.what} · {d.theirSource}</p>
            <p className="font-serif text-2xl font-bold">{d.theirs}</p>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted">{d.what} · Flexiple</p>
            <p className="font-serif text-2xl font-bold text-forest">
              {d.flexiple}
              <Source href={cities.sourceUrl} label="flexiple.com/gcc/statistics" />
            </p>
          </div>
          <p className="text-sm text-ink-2">Sources disagree. {d.note}</p>
        </div>
      ))}
    </Card>
  )
}
