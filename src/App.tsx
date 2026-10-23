import { useEffect, useRef, useState } from 'react'
import { getCities, getPolicies, getSetupRules } from './lib/flexipleData'
import { buildPlan, type DataMode, type Team } from './lib/plan'
import { Button, Eyebrow } from './components/ui'
import StepTeam from './steps/StepTeam'
import StepPlan from './steps/StepPlan'
import StepPeers from './steps/StepPeers'
import StepCall from './steps/StepCall'
import Tour from './components/Tour'
import { hasSeenTour } from './lib/tourSeen'

const STEPS = ['Your team', 'Your plan', 'Companies like you', 'Book a strategy call']

const initialTeam = (): Team => ({
  swe: 12,
  senior: 4,
  other: 0,
  otherLabel: '',
  needIn: 6,
  hqCountry: '',
  sector: 'Technology',
  cities: getCities().cities.map((c) => c.city),
})

export default function App() {
  const [team, setTeam] = useState<Team>(initialTeam)
  const [step, setStep] = useState(0)
  const [maxStep, setMaxStep] = useState(0)
  const [mode, setMode] = useState<DataMode>('flexiple')
  const [touring, setTouring] = useState(() => !hasSeenTour())
  const planRef = useRef<HTMLDivElement>(null)

  const plan = buildPlan(team, { cities: getCities().cities, policies: getPolicies().verified, setup: getSetupRules() })

  const go = (s: number) => {
    setStep(s)
    setMaxStep((m) => Math.max(m, s))
    setScrollTick((t) => t + 1)
  }

  // Scroll after the new step renders, so page height is final.
  const [scrollTick, setScrollTick] = useState(0)
  useEffect(() => {
    if (scrollTick) planRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [scrollTick])

  return (
    <>
      <p className="bg-mint px-4 py-2 text-center text-[13px] text-forest sm:text-sm">
        Concept prototype by Aadi Kalra · not an official Flexiple page
      </p>
      <Nav
        onTour={() => {
          setStep(0)
          setTouring(true)
        }}
      />
      <Hero onStart={() => go(0)} />

      <main ref={planRef} className="scroll-mt-16 bg-paper px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <ModeToggle mode={mode} setMode={setMode} />
          <Stepper step={step} maxStep={maxStep} onJump={go} />
          <div className="mt-8">
            {step === 0 && <StepTeam team={team} setTeam={setTeam} onNext={() => go(1)} />}
            {step === 1 && <StepPlan team={team} plan={plan} mode={mode} onBack={() => go(0)} onNext={() => go(2)} />}
            {step === 2 && <StepPeers team={team} onBack={() => go(1)} onNext={() => go(3)} />}
            {step === 3 && (
              <StepCall
                team={team}
                plan={plan}
                mode={mode}
                onBack={() => go(2)}
                onRestart={() => {
                  setTeam(initialTeam())
                  setMaxStep(0)
                  go(0)
                }}
              />
            )}
          </div>
        </div>
      </main>

      <About />
      <Footer />
      {touring && <Tour onClose={() => setTouring(false)} />}
    </>
  )
}

function Nav({ onTour }: { onTour: () => void }) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-forest text-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <a href="#" className="font-serif text-2xl font-bold tracking-tight">
          flexiple<span className="text-lime">.</span>
        </a>
        <nav className="flex items-center gap-6 text-sm">
          <a href="https://flexiple.com/gcc" target="_blank" rel="noreferrer" className="hidden py-2 text-white/80 hover:text-white sm:inline">GCC</a>
          <a href="https://flexiple.com/gcc/statistics" target="_blank" rel="noreferrer" className="hidden py-2 text-white/80 hover:text-white sm:inline">Statistics</a>
          <button type="button" onClick={onTour} className="py-2 text-white/80 hover:text-white">Take the tour</button>
          <a href="#about" className="hidden py-2 text-white/80 hover:text-white sm:inline">About</a>
          <a href="#plan" onClick={(e) => { e.preventDefault(); document.querySelector('main')?.scrollIntoView({ behavior: 'smooth' }) }} className="rounded-full bg-lime px-4 py-2 font-semibold text-forest">
            Planner
          </a>
        </nav>
      </div>
    </header>
  )
}

function Hero({ onStart }: { onStart: () => void }) {
  return (
    <section className="bg-forest px-4 pb-20 pt-16 text-white sm:pb-28 sm:pt-24">
      <div className="mx-auto max-w-5xl">
        <Eyebrow className="text-lime">GCC · Planner</Eyebrow>
        <h1 className="mt-5 max-w-3xl text-4xl leading-[1.05] sm:text-6xl">Plan India on facts, not referrals.</h1>
        <p className="mt-6 max-w-2xl text-lg text-white/80">
          A sourced first plan for model, city and cost, plus the companies like you that already built here.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-5">
          <Button onClick={onStart}>Start your plan →</Button>
          <p className="font-mono text-xs uppercase tracking-wider text-white/60">Built on Flexiple's talent graph · updated Aug 2026</p>
        </div>
      </div>
    </section>
  )
}

function ModeToggle({ mode, setMode }: { mode: DataMode; setMode: (m: DataMode) => void }) {
  const opts: { id: DataMode; label: string }[] = [
    { id: 'flexiple', label: 'Flexiple-verified only' },
    { id: 'all', label: 'All sources' },
  ]
  return (
    <div data-tour="mode" className="mb-10 flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Eyebrow className="text-muted">Data mode</Eyebrow>
        <p className="mt-1 text-sm text-ink-2">
          {mode === 'flexiple'
            ? "Only Flexiple's own measured numbers and records it traced to a primary source."
            : 'Adds third-party research Flexiple cites (Zinnov, JLL, Colliers, state governments), labelled as not verified by Flexiple.'}
        </p>
      </div>
      <div role="radiogroup" aria-label="Data mode" className="flex shrink-0 rounded-full bg-paper p-1">
        {opts.map((o) => (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={mode === o.id}
            onClick={() => setMode(o.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${mode === o.id ? 'bg-forest text-white' : 'text-ink-2 hover:text-forest'}`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function Stepper({ step, maxStep, onJump }: { step: number; maxStep: number; onJump: (s: number) => void }) {
  return (
    <ol data-tour="stepper" className="grid grid-cols-4 gap-2">
      {STEPS.map((s, i) => {
        const active = i === step
        const reachable = i <= maxStep
        return (
          <li key={s}>
            <button
              type="button"
              disabled={!reachable}
              aria-current={active ? 'step' : undefined}
              onClick={() => onJump(i)}
              className="w-full text-left disabled:cursor-not-allowed"
            >
              <div className={`h-1 rounded-full ${i <= step ? 'bg-forest' : 'bg-line'}`} />
              <p className={`mt-3 font-mono text-[11px] uppercase tracking-wider ${active ? 'text-forest' : 'text-muted'}`}>0{i + 1}</p>
              <p className={`hidden text-sm sm:block ${active ? 'font-semibold text-ink' : 'text-ink-2'}`}>{s}</p>
            </button>
          </li>
        )
      })}
    </ol>
  )
}

function About() {
  const decisions = [
    ['First user', 'Mid-market companies setting up in India for the first time, Flexiple’s own target customer.'],
    ['Wedge', 'A plan, with proof: the setup decision tool and peer proof in one flow.'],
    ['Data', 'Flexiple-verified mode uses only Flexiple’s own published data. Every number links to its source, and a script re-checks each one against the live flexiple.com pages.'],
    ['No rankings', 'Cities are compared, never ranked “best”. No provider reviews: Flexiple is a provider itself.'],
    ['Peers, not referrals', 'Companies like you come from Flexiple’s verified directory and new-centre announcements.'],
    ['Hand-off', 'Entity setup cost is scoped on a strategy call. The plan travels with the booking.'],
  ]
  return (
    <section id="about" className="scroll-mt-16 bg-white px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <Eyebrow className="text-muted">About this prototype</Eyebrow>
        <h2 className="mt-3 max-w-3xl text-3xl sm:text-4xl">The gap isn't missing data. It's missing trust.</h2>
        <p className="mt-4 max-w-3xl text-ink-2">
          Companies entering India pick a model, city, cost and provider on referrals and public sources that disagree with each other.
          First-time, mid-market buyers have the least information and carry the full cost of a wrong call.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {decisions.map(([t, d]) => (
            <div key={t} className="rounded-2xl border border-line p-6">
              <p className="font-serif text-lg font-bold text-forest">{t}</p>
              <p className="mt-2 text-sm text-ink-2">{d}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-forest p-6 text-white sm:p-8">
            <Eyebrow className="text-lime">How we'd know it works</Eyebrow>
            <p className="mt-4 font-serif text-2xl font-bold">North star: strategy calls booked from the planner.</p>
            <ul className="mt-4 space-y-1 text-sm text-white/80">
              <li>Inputs: plan completion rate, clicks on “Companies like you”.</li>
              <li>Guardrail: 100% of numbers on a plan have a source.</li>
            </ul>
          </div>
          <div className="rounded-2xl bg-mint p-6 text-forest sm:p-8">
            <Eyebrow>What v1 leaves out</Eyebrow>
            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm">
              <li>Logins and saved accounts</li>
              <li>Provider reviews and city scores</li>
              <li>Unverified incentives</li>
              <li>PDF export and a backend</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-forest px-4 py-10 text-sm text-white/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-serif text-xl font-bold text-white">flexiple<span className="text-lime">.</span></p>
        <p>Prototype by Aadi Kalra for a Flexiple PM assignment. Data: flexiple.com/gcc pages, Aug 2026.</p>
      </div>
    </footer>
  )
}
