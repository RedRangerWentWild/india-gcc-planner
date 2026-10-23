// Re-fetches the live flexiple.com pages and checks every value in /data against them.
// Run: npm run verify. Exits 1 on any mismatch.
import { readFileSync } from 'node:fs'

const load = (f) => JSON.parse(readFileSync(new URL(`../data/${f}`, import.meta.url)))
const cities = load('cities.json')
const peers = load('peers.json')
const policies = load('policies.json')
const setup = load('setup.json')
const market = load('market.json')

const pages = new Map()
async function page(url) {
  if (!pages.has(url)) {
    const res = await fetch(url, { headers: { 'user-agent': 'india-gcc-planner-verify' } })
    if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`)
    const html = await res.text()
    const text = html
      .replace(/<script(?![^>]*ld\+json)[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&').replace(/&#x27;|&#39;|&rsquo;|’/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
    pages.set(url, { html: html.replace(/&amp;/g, '&'), text, lower: text.toLowerCase() })
  }
  return pages.get(url)
}

let pass = 0
const fails = []
async function check(label, url, needle, { inHtml = false } = {}) {
  const p = await page(url)
  const ok = inHtml ? p.html.includes(needle) : p.lower.includes(needle.toLowerCase())
  if (ok) pass++
  else fails.push(`${label}\n    expected "${needle}" on ${url}`)
}

const STATS = 'https://flexiple.com/gcc/statistics'
const INDIA = 'https://flexiple.com/gcc/india'
const GCC = 'https://flexiple.com/gcc'
const L = (n) => `₹${n}L`

// Cities: same row on the statistics page and the directory page, then each city page.
for (const c of cities.cities) {
  const row = `${c.city} ${c.trackedProfessionals} ${c.companies25plus} ${L(c.sweMedianL)} ${L(c.seniorMedianL)}`
  await check(`city row ${c.city} (statistics)`, STATS, row)
  await check(`city row ${c.city} (directory)`, INDIA, row)
  await check(`${c.city} verified GCCs`, c.cityPage, `${c.verifiedGccs} GCCs verified here`)
  await check(`${c.city} companies 25+`, c.cityPage, `${c.companies25plus} companies with 25+ people`)
  await check(`${c.city} SWE median`, c.cityPage, `${L(c.sweMedianL)} software engineer median`)
  // Exact live count on the city page must round down to the published "7.1M+" style figure.
  const live = (await page(c.cityPage)).text.match(/([\d,]{7,}) professionals tracked in/i)
  const exact = live ? Number(live[1].replace(/,/g, '')) : NaN
  const shown = Number(c.trackedProfessionals.replace(/[M+]/g, ''))
  if (Math.floor(exact / 1e5) / 10 === shown) pass++
  else fails.push(`${c.city} tracked: page says ${live?.[1]}, data says ${c.trackedProfessionals}`)
}
await check('total tracked', STATS, `${cities.totals.trackedProfessionals} tracked professionals`)
await check('total companies 25+', STATS, `${cities.totals.companies25plus.replace(',', '')} companies holding 25 or more`)
await check('total verified GCCs', STATS, `${cities.totals.verifiedGccs} verified global capability centres`)
for (const cav of cities.caveats) await check('city caveat', INDIA, cav)

// Peers: every announcement, its headcount and its citation link on the directory page.
await check('verified GCC count', INDIA, `${peers.verifiedGccTotal} GCCs verified`)
await check('announcement count', INDIA, `${peers.announcementsTotal} announcements`)
const MONTHS = { Jan: 'January', Feb: 'February', Mar: 'March', Apr: 'April', May: 'May', Jun: 'June', Jul: 'July', Aug: 'August', Sep: 'September', Oct: 'October', Nov: 'November', Dec: 'December' }
for (const p of peers.peers) {
  const [m, y] = p.date.split(' ')
  await check(`peer ${p.company} (${p.city})`, INDIA, `${p.company} [`)
  await check(`peer ${p.company} date/city`, INDIA, `${MONTHS[m]} ${y} · ${p.city}`)
  await check(`peer ${p.company} source link`, INDIA, `href="${p.sourceUrl}"`, { inHtml: true })
  if (p.announced) {
    const first = p.announced.split(' across')[0]
    await check(`peer ${p.company} headcount`, INDIA, first)
  }
  if (p.caveat) await check(`peer ${p.company} caveat`, INDIA, p.caveat)
}
if (peers.peers.length !== peers.announcementsTotal) fails.push(`peers: ${peers.peers.length} in data, ${peers.announcementsTotal} on page`)

// Policies.
for (const p of policies.verified) {
  await check(`policy ${p.state} name`, STATS, `${p.state}: ${p.policy}`)
  await check(`policy ${p.state} summary`, STATS, p.summary.split('.')[0])
  await check(`policy ${p.state} link`, STATS, `href="${p.originalUrl}"`, { inHtml: true })
  if (p.eligibilityNote && p.state === 'Tamil Nadu') await check('TN eligibility', STATS, 'Forbes Global 2000 and Fortune 1000 parents committing at least 200 direct jobs')
}
for (const s of policies.couldNotVerify) await check('policy could-not-verify', STATS, s)

// Setup rules and pricing.
await check('managed fee', GCC, `$${setup.managedFeeUsdPerPersonPerMonth}/person/month + salary at cost`)
await check('entity cost wording', GCC, setup.entitySetupCostLabel)
await check('CTA', GCC, setup.cta)
await check('break-even (gcc page)', GCC, `Past ${setup.breakEvenHeadcount} people, entity economics beat managed employment`)
await check('resident director', GCC, 'resident in India (182+ days a year)')
for (const r of setup.rules) {
  await check(`rule title ${r.title}`, INDIA, r.title)
  await check(`rule text ${r.title}`, INDIA, r.text.replace('Flexiple provides', 'We provide').replace('and helps', 'and help'))
}
// Our first line adds "Third-party" and a note on our own table; the part before " (" must still match Flexiple's wording.
for (const s of setup.couldNotVerify) await check('could-not-verify', STATS, s.replace(/^Third-party per-city/, 'Per city').split(' (')[0])

// Third-party figures Flexiple cites.
for (const f of market.national) {
  await check(`market ${f.figure}`, STATS, f.figure)
  await check(`market ${f.figure} link`, STATS, `href="${f.url}"`, { inHtml: true })
}
for (const f of market.byCity) {
  const c = cities.cities.find((x) => x.city === f.city)
  await check(`city market ${f.city}`, c.cityPage, f.figure.replace(/^Karnataka hosts/, 'The state hosts'))
}

console.log(`${pass} checks passed, ${fails.length} failed, ${pages.size} pages fetched`)
if (fails.length) {
  console.log('\nFailures:\n  ' + fails.join('\n  '))
  process.exit(1)
}
