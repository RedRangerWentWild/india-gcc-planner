// Plan logic as pure functions. Every input number comes from flexipleData.ts.
import type { City, Peer, Policy, SetupRules } from './flexipleData'

export type Team = {
  swe: number
  senior: number
  other: number
  otherLabel: string
  needIn: 3 | 6 | 12
  hqCountry: string
  sector: string
  cities: string[]
}

// 'flexiple' = Flexiple's own measured data and records it traced to a primary source.
// 'all' adds third-party research Flexiple cites, labelled as such.
export type DataMode = 'flexiple' | 'all'

export const SECTORS = [
  'Technology',
  'BFSI',
  'Professional & info services',
  'Engineering & industrial',
  'Healthcare & pharma',
  'Telecom & media',
  'Energy',
  'Other',
]

export const headcount = (t: Pick<Team, 'swe' | 'senior' | 'other'>) => t.swe + t.senior + t.other

export type Model = { kind: 'managed' | 'managed-then-entity'; title: string }

// Flexiple's break-even rule: past 25 people, entity economics beat managed employment.
export function recommendModel(people: number, breakEven: number): Model {
  return people < breakEven
    ? { kind: 'managed', title: 'Managed team' }
    : { kind: 'managed-then-entity', title: 'Start managed, move to your own entity' }
}

export const managedFeeUsdPerMonth = (people: number, setup: Pick<SetupRules, 'managedFeeUsdPerPersonPerMonth'>) =>
  people * setup.managedFeeUsdPerPersonPerMonth

// Annual salary cost in INR lakh from Flexiple medians. Null when a median is not published.
export function teamCostL(city: Pick<City, 'sweMedianL' | 'seniorMedianL'>, swe: number, senior: number): number | null {
  if ((swe > 0 && city.sweMedianL == null) || (senior > 0 && city.seniorMedianL == null)) return null
  const v = swe * (city.sweMedianL ?? 0) + senior * (city.seniorMedianL ?? 0)
  return Math.round(v * 10) / 10
}

// ₹ in Indian units: 45.6 -> "₹45.6L", 120 -> "₹1.2 Cr".
export function formatLakh(l: number): string {
  const fmt = (n: number) => (Math.round(n * 10) / 10).toLocaleString('en-IN', { maximumFractionDigits: 1 })
  return l >= 100 ? `₹${fmt(l / 100)} Cr` : `₹${fmt(l)}L`
}

export const formatUsd = (n: number) => `$${n.toLocaleString('en-US')}`

export type Incentive =
  | { state: string; status: 'none' }
  | { state: string; status: 'published' | 'limited' | 'likely-not-eligible'; policy: Policy; reason: string | null }

// Eligibility checks mirror each policy's published eligibilityNote, for a mid-market first-time user.
export function incentiveFor(state: string, policies: Policy[], cityNames: string[], people: number): Incentive {
  const policy = policies.find((p) => p.state === state)
  if (!policy) return { state, status: 'none' }
  if (state === 'Tamil Nadu') {
    const size = people < 200 ? ` Your plan has ${people} people.` : ''
    return {
      state,
      status: 'likely-not-eligible',
      policy,
      reason: `${policy.eligibilityNote} A mid-market parent is likely outside that list.${size}`,
    }
  }
  if (state === 'Maharashtra' && cityNames.some((c) => c === 'Mumbai' || c === 'Pune')) {
    return { state, status: 'limited', policy, reason: policy.eligibilityNote }
  }
  return { state, status: 'published', policy, reason: policy.eligibilityNote }
}

export function incentivesForCities(cities: City[], policies: Policy[], people: number): Incentive[] {
  const states = [...new Set(cities.map((c) => c.state))]
  return states.map((s) =>
    incentiveFor(
      s,
      policies,
      cities.filter((c) => c.state === s).map((c) => c.city),
      people,
    ),
  )
}

export type SizeBand = 'any' | 'under250' | '250to1000' | '1000plus'

export const SIZE_BANDS: { id: SizeBand; label: string }[] = [
  { id: 'any', label: 'Any size' },
  { id: 'under250', label: 'Under 250' },
  { id: '250to1000', label: '250 to 1,000' },
  { id: '1000plus', label: '1,000+' },
]

export function inBand(n: number | null, band: SizeBand): boolean {
  if (band === 'any') return true
  if (n == null) return false
  if (band === 'under250') return n < 250
  if (band === '250to1000') return n >= 250 && n < 1000
  return n >= 1000
}

// Pre-selects the "companies your size" filter in step 3 from the team size in step 1.
export const bandForTeam = (people: number): SizeBand => (people < 250 ? 'under250' : people < 1000 ? '250to1000' : '1000plus')

export const filterPeers = (peers: Peer[], cities: string[], band: SizeBand) =>
  peers.filter((p) => cities.includes(p.city) && inBand(p.headcountForFilter, band))

export type CityRow = City & { costL: number | null }

// Everything step 2 and step 4 show, derived from the team and Flexiple's data.
export function buildPlan(team: Team, data: { cities: City[]; policies: Policy[]; setup: SetupRules }) {
  const people = headcount(team)
  const rows: CityRow[] = data.cities
    .filter((c) => team.cities.includes(c.city))
    .map((c) => ({ ...c, costL: team.swe + team.senior > 0 ? teamCostL(c, team.swe, team.senior) : null }))
  const costs = rows.map((r) => r.costL).filter((v): v is number => v != null)
  return {
    people,
    model: recommendModel(people, data.setup.breakEvenHeadcount),
    managedFeeUsd: managedFeeUsdPerMonth(people, data.setup),
    rows,
    lowestCostL: costs.length > 1 ? Math.min(...costs) : null,
    incentives: incentivesForCities(rows, data.policies, people),
  }
}

export type Plan = ReturnType<typeof buildPlan>
