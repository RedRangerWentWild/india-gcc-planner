import type { ReactNode } from 'react'

export const Eyebrow = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <p className={`font-mono text-xs uppercase tracking-[0.14em] ${className}`}>{children}</p>
)

export const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`rounded-2xl border border-line p-6 ${className.includes('bg-') ? '' : 'bg-white'} ${className}`}>{children}</div>
)

type BtnProps = {
  children: ReactNode
  onClick?: () => void
  variant?: 'lime' | 'dark' | 'ghost'
  disabled?: boolean
  type?: 'button' | 'submit'
}

export function Button({ children, onClick, variant = 'lime', disabled, type = 'button' }: BtnProps) {
  const styles = {
    lime: 'bg-lime text-forest hover:brightness-95',
    dark: 'bg-forest text-white hover:bg-forest/90',
    ghost: 'border border-forest/20 text-forest hover:bg-forest/5',
  }[variant]
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${styles}`}
    >
      {children}
    </button>
  )
}

// Small source marker shown next to every figure.
export const Source = ({ href, label }: { href: string; label: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    title={`Source: ${label}`}
    aria-label={`Source: ${label}`}
    className="ml-1 inline-flex align-super font-mono text-[10px] underline decoration-dotted underline-offset-2 hover:decoration-solid"
  >
    src
  </a>
)

// What renders in place of a missing value. Never a guess.
export const NotPublished = ({ text = 'Not published' }: { text?: string }) => (
  <span className="text-sm italic text-muted">{text}</span>
)

export const Tag = ({ children, tone = 'mint' }: { children: ReactNode; tone?: 'mint' | 'lime' | 'grey' | 'amber' }) => {
  const styles = {
    mint: 'bg-mint text-forest',
    lime: 'bg-lime text-forest',
    grey: 'bg-paper text-ink-2',
    amber: 'bg-amber-100 text-amber-900',
  }[tone]
  return <span className={`inline-block whitespace-nowrap rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-wider ${styles}`}>{children}</span>
}
