import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-ink flex flex-col items-center justify-center px-6 text-center space-y-8">

      <div className="space-y-3">
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-gold/60">
          404
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl text-white/80 font-normal">
          Lost your train of thought?
        </h1>
        <p className="font-mono text-[11px] text-white/30 tracking-wide">
          This page doesn't exist.
        </p>
      </div>

      <Link
        href="/"
        className="font-mono text-[11px] tracking-[0.15em] uppercase py-3.5 px-10 bg-gold text-ink font-medium hover:bg-gold/90 transition-all"
      >
        Go home
      </Link>

    </main>
  )
}