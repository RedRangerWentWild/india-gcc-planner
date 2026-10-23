// Swap these for Flexiple's internal API; the UI does not change.
// Every record here is read from a published flexiple.com page and carries its sourceUrl.
import cities from '../../data/cities.json'
import policies from '../../data/policies.json'
import peers from '../../data/peers.json'
import setup from '../../data/setup.json'
import market from '../../data/market.json'

export type City = {
  city: string
  state: string
  trackedProfessionals: string
  companies25plus: string
  verifiedGccs: number | null
  sweMedianL: number | null
  seniorMedianL: number | null
  cityPage: string
}

export type CitiesData = {
  asOf: string
  unit: string
  source: string
  sourceUrl: string
  totals: { trackedProfessionals: string; companies25plus: string; verifiedGccs: number }
  cities: City[]
  caveats: string[]
}

export type Policy = {
  state: string
  policy: string
  summary: string
  eligibilityNote: string | null
  originalSource: string
  originalUrl?: string
}

export type PoliciesData = {
  source: string
  sourceUrl: string
  note: string
  verified: Policy[]
  couldNotVerify: string[]
}

export type Peer = {
  company: string
  city: string
  date: string
  announced: string | null
  headcountForFilter: number | null
  what: string
  caveat?: string
  sourceUrl: string
}

export type PeersData = {
  source: string
  sourceUrl: string
  asOf: string
  verifiedGccTotal: number
  announcementsTotal: number
  peers: Peer[]
}

export type SetupRules = {
  sources: { pricing: string; rules: string }
  paths: string[]
  managedFeeUsdPerPersonPerMonth: number
  managedFeeLabel: string
  entitySetupCost: number | null
  entitySetupCostLabel: string
  breakEvenHeadcount: number
  rules: { title: string; text: string }[]
  cta: string
  couldNotVerify: string[]
}

// Third-party research Flexiple cites on its pages. Not Flexiple's own numbers: shown only in "All sources" mode.
export type MarketFigure = { figure: string; detail?: string; period: string; publisher: string; url: string; city?: string }

export type MarketData = {
  source: string
  sourceUrl: string
  asOf: string
  national: MarketFigure[]
  disagreements: { what: string; theirs: string; theirSource: string; flexiple: string; note: string }[]
  byCity: (MarketFigure & { city: string })[]
  noCityFigure: string
}

export const getCities = (): CitiesData => cities
export const getPolicies = (): PoliciesData => policies
export const getPeers = (): PeersData => peers
export const getSetupRules = (): SetupRules => setup
export const getMarket = (): MarketData => market
