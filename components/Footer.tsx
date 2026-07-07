import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/[0.06] px-4 sm:px-8 py-8">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <p className="font-mono text-[11px] text-white/40 tracking-wide">
          Built by{' '}
          <a
            href="https://linkedin.com/in/priyanshi-joshi-61258a344"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold/60 hover:text-gold transition-colors"
          >
            Priyanshi Joshi
          </a>
        </p>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/priyanshijoshiii"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[10px] tracking-widest uppercase text-white/30 hover:text-white/50 transition-colors"
          >
            GitHub
          </a>
          <Link
            href="/feedback"
            className="font-mono text-[10px] tracking-widest uppercase text-white/30 hover:text-white/50 transition-colors"
          >
            Feedback
          </Link>
        </div>
      </div>
    </footer>
  )
}