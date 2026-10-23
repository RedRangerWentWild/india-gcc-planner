import { describe, expect, it } from 'vitest'
import { getCities, getMarket, getPeers, getPolicies, getSetupRules } from './flexipleData'
import { bandForTeam, formatLakh, headcount, inBand, incentiveFor, managedFeeUsdPerMonth, recommendModel, teamCostL } from './plan'

const setup = getSetupRules()

describe('break-even rule', () => {
  it('recommends a managed team below 25 people', () => {
    expect(recommendModel(24, setup.breakEvenHeadcount).kind).toBe('managed')
  })
  it('recommends managed then entity at 25 and above', () => {
    expect(recommendModel(25, setup.breakEvenHeadcount).kind).toBe('managed-then-entity')
    expect(recommendModel(80, setup.breakEvenHeadcount).kind).toBe('managed-then-entity')
  })
  it('counts other roles in headcount', () => {
    expect(headcount({ swe: 10, senior: 5, other: 10 })).toBe(25)
  })
})

describe('cost math', () => {
  it('managed fee is $299 per person per month', () => {
    expect(managedFeeUsdPerMonth(10, setup)).toBe(2990)
  })
  it('team cost = swe x swe median + senior x senior median', () => {
    const blr = getCities().cities.find((c) => c.city === 'Bangalore')!
    expect(teamCostL(blr, 10, 2)).toBe(10 * 15.7 + 2 * 32.5)
  })
  it('returns null instead of guessing when a median is missing', () => {
    expect(teamCostL({ sweMedianL: null, seniorMedianL: 20 }, 1, 0)).toBeNull()
    expect(teamCostL({ sweMedianL: null, seniorMedianL: 20 }, 0, 1)).toBe(20)
  })
  it('formats lakh and crore', () => {
    expect(formatLakh(45.6)).toBe('₹45.6L')
    expect(formatLakh(120)).toBe('₹1.2 Cr')
    expect(formatLakh(1234.5)).toBe('₹12.3 Cr')
  })
})

describe('incentives', () => {
  const policies = getPolicies().verified
  it('shows no verified policy for unsourced states', () => {
    expect(incentiveFor('Telangana', policies, ['Hyderabad'], 10).status).toBe('none')
  })
  it('marks Tamil Nadu as likely not eligible for mid-market', () => {
    expect(incentiveFor('Tamil Nadu', policies, ['Chennai'], 30).status).toBe('likely-not-eligible')
  })
})

describe('size bands', () => {
  it('pre-selects the band from team size', () => {
    expect(bandForTeam(16)).toBe('under250')
    expect(bandForTeam(249)).toBe('under250')
    expect(bandForTeam(250)).toBe('250to1000')
    expect(bandForTeam(999)).toBe('250to1000')
    expect(bandForTeam(1000)).toBe('1000plus')
  })
  it('excludes unannounced headcount from a specific band', () => {
    expect(inBand(null, 'under250')).toBe(false)
    expect(inBand(null, 'any')).toBe(true)
    expect(inBand(250, '250to1000')).toBe(true)
    expect(inBand(1000, '1000plus')).toBe(true)
  })
})

// Guardrail: 100% of numbers on a plan have a source.
describe('every record carries a source', () => {
  const url = /^https:\/\//
  it('cities have every figure and a flexiple.com page', () => {
    for (const c of getCities().cities) {
      expect(c.cityPage).toMatch(/^https:\/\/flexiple\.com\/gcc\//)
      expect(c.sweMedianL).toBeTypeOf('number')
      expect(c.seniorMedianL).toBeTypeOf('number')
      expect(c.verifiedGccs).toBeTypeOf('number')
    }
  })
  it('all announcements are present, each with its own citation', () => {
    const p = getPeers()
    expect(p.peers).toHaveLength(p.announcementsTotal)
    for (const x of p.peers) expect(x.sourceUrl).toMatch(url)
  })
  it('policies and third-party figures link to where they were read', () => {
    for (const x of getPolicies().verified) expect(x.originalUrl).toMatch(url)
    const m = getMarket()
    for (const x of [...m.national, ...m.byCity]) expect(x.url).toMatch(url)
  })
})
