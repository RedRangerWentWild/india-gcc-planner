import { useState } from 'react'
import { getCities, getPeers } from '../lib/flexipleData'
import { SIZE_BANDS, bandForTeam, filterPeers, headcount, type SizeBand, type Team } from '../lib/plan'
import { Button, Card, Eyebrow, Source, Tag } from '../components/ui'

type Props = { team: Team; onBack: () => void; onNext: () => void }

export default function StepPeers({ team, onBack, onNext }: Props) {
  const data = getPeers()
  const allCities = getCities().cities.map((c) => c.city)
  const [cities, setCities] = useState(team.cities)
  const yourBand = bandForTeam(headcount(team))
  const [band, setBand] = useState<SizeBand>(yourBand)
  const shown = filterPeers(data.peers, cities, band)
  const outside = data.peers.filter((p) => !allCities.includes(p.city)).length
  const toggle = (c: string) => setCities(cities.includes(c) ? cities.filter((x) => x !== c) : [...cities, c])

  return (
    <div className="space-y-6">
      <Card className="p-6 sm:p-8">
        <Eyebrow className="text-muted">Step 3 · Companies like you</Eyebrow>
        <h2 className="mt-2 text-3xl">Who already built here</h2>
        <p className="mt-2 max-w-2xl text-ink-2">
          Recent centres Flexiple lists as new and upcoming, each traced to a company statement or named business publication.
          Proof from peers instead of referrals.
        </p>

        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 font-mono text-[11px] uppercase tracking-wider text-muted">City</span>
            {allCities.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={cities.includes(c)}
                onClick={() => toggle(c)}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${cities.includes(c) ? 'border-forest bg-mint text-forest' : 'border-line text-ink-2 hover:border-forest'}`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 font-mono text-[11px] uppercase tracking-wider text-muted">Announced headcount</span>
            {SIZE_BANDS.map((b) => (
              <button
                key={b.id}
                type="button"
                aria-pressed={band === b.id}
                onClick={() => setBand(b.id)}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${band === b.id ? 'border-forest bg-forest text-white' : 'border-line text-ink-2 hover:border-forest'}`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="text-sm text-ink-2">
        <p>
          {shown.length} of {data.peers.length} announcements shown
          {band === yourBand && ' · filtered to companies your size'}
        </p>
        {band !== 'any' && <p className="mt-1 text-xs text-muted">Centres with no announced headcount are hidden while a size is picked. Choose Any size to see all.</p>}
      </div>

      {shown.length === 0 ? (
        <Card className="text-center text-ink-2">No announcements match these filters. Try another city or size.</Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <a
              key={`${p.company}-${p.city}`}
              href={p.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col rounded-2xl border border-line bg-white p-5 transition hover:border-forest"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-serif text-xl font-bold text-forest">{p.company}</p>
                <Tag tone="grey">{p.date}</Tag>
              </div>
              <p className="mt-1 text-sm font-medium text-ink-2">{p.city}</p>
              <p className="mt-3 flex-1 text-sm text-ink-2">{p.what}</p>
              <div className="mt-4 border-t border-line pt-3 text-sm">
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted">Announced: </span>
                {p.announced ?? <span className="italic text-muted">Not announced</span>}
                {p.caveat && <p className="mt-1 text-xs text-amber-900">{p.caveat}</p>}
              </div>
              <p className="mt-2 text-xs text-muted group-hover:text-forest">
                Source: {new URL(p.sourceUrl).hostname.replace(/^www\./, '')} ↗ · cited by Flexiple
              </p>
            </a>
          ))}
        </div>
      )}

      <Card className="bg-paper text-sm text-ink-2">
        From Flexiple's directory of {data.verifiedGccTotal} verified GCCs
        <Source href={data.sourceUrl} label={data.source} />: all {data.announcementsTotal} new and upcoming announcements, {data.asOf}, each linked to the
        company statement or publication Flexiple cites. {outside > 0 && `${outside} ${outside === 1 ? 'is' : 'are'} outside the six metros. `}
        In production this would filter by sector, parent country and size.
      </Card>

      <div className="flex flex-wrap justify-between gap-4">
        <Button variant="ghost" onClick={onBack}>← Back to plan</Button>
        <Button onClick={onNext}>Book a strategy call →</Button>
      </div>
    </div>
  )
}
