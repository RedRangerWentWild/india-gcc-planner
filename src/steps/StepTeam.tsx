import { getCities } from '../lib/flexipleData'
import { SECTORS, headcount, type Team } from '../lib/plan'
import { Button, Card, Eyebrow } from '../components/ui'

const field = 'w-full rounded-xl border border-line bg-white px-4 py-3 text-ink focus:border-forest focus:outline-none'
const label = 'mb-2 block text-sm font-medium text-ink-2'

type Props = { team: Team; setTeam: (t: Team) => void; onNext: () => void }

export default function StepTeam({ team, setTeam, onNext }: Props) {
  const allCities = getCities().cities.map((c) => c.city)
  const set = <K extends keyof Team>(k: K, v: Team[K]) => setTeam({ ...team, [k]: v })
  const count = (v: string) => Math.max(0, Math.min(10000, Math.floor(Number(v) || 0)))
  const toggleCity = (c: string) =>
    set('cities', team.cities.includes(c) ? team.cities.filter((x) => x !== c) : allCities.filter((x) => x === c || team.cities.includes(x)))
  const people = headcount(team)
  const ready = people > 0 && team.cities.length > 0

  return (
    <Card className="p-6 sm:p-8">
      <Eyebrow className="text-muted">Step 1 · Your team</Eyebrow>
      <h2 className="mt-2 text-3xl">Who do you need in India?</h2>
      <p className="mt-2 text-ink-2">Tell us the roles. We use them to size the model and estimate salary cost per city.</p>

      <div data-tour="team" className="mt-8 grid gap-6 sm:grid-cols-3">
        <div>
          <label className={label} htmlFor="swe">Software engineers</label>
          <input id="swe" type="number" min={0} inputMode="numeric" className={field} value={team.swe} onChange={(e) => set('swe', count(e.target.value))} />
        </div>
        <div>
          <label className={label} htmlFor="senior">Senior engineers (6+ yrs)</label>
          <input id="senior" type="number" min={0} inputMode="numeric" className={field} value={team.senior} onChange={(e) => set('senior', count(e.target.value))} />
        </div>
        <div>
          <label className={label} htmlFor="other">Other roles</label>
          <div className="flex gap-2">
            <input id="other" type="number" min={0} inputMode="numeric" className={`${field} w-24`} value={team.other} onChange={(e) => set('other', count(e.target.value))} />
            <input aria-label="Other roles, label" placeholder="e.g. QA, design" className={field} value={team.otherLabel} onChange={(e) => set('otherLabel', e.target.value)} />
          </div>
        </div>
      </div>

      <fieldset className="mt-8">
        <legend className={label}>When do you need the team?</legend>
        <div className="flex flex-wrap gap-2">
          {([3, 6, 12] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={team.needIn === m}
              onClick={() => set('needIn', m)}
              className={`rounded-full border px-5 py-2 text-sm font-medium transition ${team.needIn === m ? 'border-forest bg-forest text-white' : 'border-line hover:border-forest'}`}
            >
              In {m} months
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="hq">Parent HQ country</label>
          <input id="hq" className={field} placeholder="e.g. United States" value={team.hqCountry} onChange={(e) => set('hqCountry', e.target.value)} />
        </div>
        <div>
          <label className={label} htmlFor="sector">Sector</label>
          <select id="sector" className={field} value={team.sector} onChange={(e) => set('sector', e.target.value)}>
            {SECTORS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <fieldset className="mt-8">
        <legend className={label}>Cities to consider</legend>
        <div className="flex flex-wrap gap-2">
          {allCities.map((c) => {
            const on = team.cities.includes(c)
            return (
              <button
                key={c}
                type="button"
                aria-pressed={on}
                onClick={() => toggleCity(c)}
                className={`rounded-full border px-5 py-2 text-sm font-medium transition ${on ? 'border-forest bg-mint text-forest' : 'border-line text-ink-2 hover:border-forest'}`}
              >
                {on ? '✓ ' : ''}
                {c}
              </button>
            )
          })}
        </div>
      </fieldset>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
        <p className="text-sm text-ink-2">
          {people} {people === 1 ? 'person' : 'people'} · {team.cities.length} {team.cities.length === 1 ? 'city' : 'cities'}
          {!ready && <span className="ml-2 text-muted">Add at least one role and one city.</span>}
        </p>
        <span data-tour="next">
          <Button onClick={onNext} disabled={!ready}>
            See your plan →
          </Button>
        </span>
      </div>
    </Card>
  )
}
