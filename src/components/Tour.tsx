import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { markTourSeen } from '../lib/tourSeen'

// First-visit walkthrough. Steps point at elements tagged data-tour="<id>"; a step without a target renders centred.
const STEPS: { target?: string; title: string; body: string }[] = [
  {
    title: 'Plan India in about a minute',
    body: 'Tell us your team, get a sourced plan for model, city and cost, see companies like you that already built here, then book a call with the plan attached. Here is how it works.',
  },
  {
    target: 'mode',
    title: 'Choose what data you see',
    body: 'Flexiple-verified only uses Flexiple’s own measured numbers. All sources adds third-party research Flexiple cites, clearly labelled.',
  },
  {
    target: 'stepper',
    title: 'Four steps',
    body: 'Your team, your plan, companies like you, book a strategy call. You can jump back to any step you have reached.',
  },
  {
    target: 'team',
    title: 'Start with your team',
    body: 'Enter how many engineers you need. Salary cost is estimated per city from Flexiple medians. All six metros are selected by default.',
  },
  {
    target: 'next',
    title: 'Then see your plan',
    body: 'Every number on the plan has a small “src” link to the Flexiple page it came from. Missing values say so instead of guessing.',
  },
]

type Rect = { top: number; left: number; width: number; height: number }
const PAD = 8

export default function Tour({ onClose }: { onClose: () => void }) {
  const [i, setI] = useState(0)
  const [rect, setRect] = useState<Rect | null>(null)
  const [cardH, setCardH] = useState(240)
  const cardRef = useRef<HTMLDivElement>(null)
  const step = STEPS[i]
  const last = i === STEPS.length - 1

  const close = useCallback(() => {
    markTourSeen()
    onClose()
  }, [onClose])

  const measure = useCallback(() => {
    if (cardRef.current) setCardH(cardRef.current.offsetHeight)
    const el = step.target ? document.querySelector(`[data-tour="${step.target}"]`) : null
    if (!el) return setRect(null)
    const r = el.getBoundingClientRect()
    setRect({ top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 })
  }, [step.target])

  // Bring the target into view, then measure once scrolling settles.
  useLayoutEffect(() => {
    const el = step.target ? document.querySelector(`[data-tour="${step.target}"]`) : null
    // Park the target just under the sticky nav so the card has room below it, even on phones.
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 96, behavior: 'instant' as ScrollBehavior })
    // Reading layout after render is what a layout effect is for.
    // oxlint-disable-next-line react/set-state-in-effect
    measure()
    cardRef.current?.focus()
  }, [i, step.target, measure])

  useEffect(() => {
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [measure])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') setI((n) => Math.min(n + 1, STEPS.length - 1))
      if (e.key === 'ArrowLeft') setI((n) => Math.max(n - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  // Card goes below the target, else above, else pinned to the bottom edge; centred when there is no target.
  const vw = window.innerWidth
  const vh = window.innerHeight
  const cardW = Math.min(380, vw - 32)
  let cardStyle: CSSProperties = { width: cardW, left: (vw - cardW) / 2, top: '50%', transform: 'translateY(-50%)' }
  if (rect) {
    const left = Math.min(Math.max(16, rect.left + rect.width / 2 - cardW / 2), vw - cardW - 16)
    const below = rect.top + rect.height + 12
    if (below + cardH + 16 <= vh) cardStyle = { width: cardW, left, top: below }
    else if (rect.top - 12 - cardH >= 72) cardStyle = { width: cardW, left, top: rect.top - 12 - cardH }
    else cardStyle = { width: cardW, left, bottom: 16 }
  }

  return (
    <div className="fixed inset-0 z-50" aria-live="polite">
      {/* Click-catcher, so the page cannot be used mid-tour */}
      <div className="absolute inset-0" onClick={close} aria-hidden="true" />
      {rect ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute rounded-2xl ring-2 ring-lime"
          style={{ ...rect, boxShadow: '0 0 0 9999px rgba(8, 44, 28, 0.65)' }}
        />
      ) : (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-forest/65" />
      )}

      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        tabIndex={-1}
        className="absolute rounded-2xl bg-white p-6 shadow-2xl outline-none"
        style={cardStyle}
      >
        <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
          Quick tour · {i + 1} of {STEPS.length}
        </p>
        <h2 id="tour-title" className="mt-2 text-2xl text-forest">{step.title}</h2>
        <p className="mt-2 text-sm text-ink-2">{step.body}</p>
        <div className="mt-6 flex items-center justify-between gap-3">
          <button type="button" onClick={close} className="py-2 text-sm text-muted underline-offset-2 hover:text-forest hover:underline">
            Skip tour
          </button>
          <div className="flex gap-2">
            {i > 0 && (
              <button type="button" onClick={() => setI(i - 1)} className="rounded-full border border-forest/20 px-4 py-2 text-sm font-semibold text-forest hover:bg-forest/5">
                Back
              </button>
            )}
            <button
              type="button"
              onClick={() => (last ? close() : setI(i + 1))}
              className="rounded-full bg-lime px-5 py-2 text-sm font-semibold text-forest hover:brightness-95"
            >
              {last ? 'Start planning' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
