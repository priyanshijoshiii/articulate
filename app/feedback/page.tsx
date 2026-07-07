'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default function FeedbackPage() {
  const { data: session, status } = useSession()
  const [feedback, setFeedback] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  if (status === 'loading') return (
    <main className="min-h-screen bg-ink flex items-center justify-center">
      <div className="w-4 h-4 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
    </main>
  )

  if (!session) {
    redirect('/login')
    return null
  }

  async function handleSubmit() {
    if (!feedback.trim()) return
    setSubmitting(true)
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      })
      setSubmitted(true)
      setFeedback('')
    } catch {
      alert('Could not submit. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-ink flex flex-col">
      <nav className="px-6 sm:px-10 py-5 flex justify-between items-center">
        <Link href="/">
          <h1 className="font-serif text-lg text-gold font-semibold">
            Artic<span className="italic font-normal">ulate</span>
          </h1>
        </Link>
        <Link
          href="/"
          className="font-mono text-[10px] tracking-widest uppercase text-white/30 hover:text-white/50 transition-colors"
        >
          ← Back
        </Link>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center space-y-8 max-w-md mx-auto w-full">
        <div className="space-y-2">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-gold/60">
            Feedback
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl text-white/80 font-normal">
            Help make Articulate better.
          </h2>
          <p className="font-mono text-[11px] text-white/30 tracking-wide">
            I read every response personally.
          </p>
        </div>

        {submitted ? (
          <div className="space-y-3">
            <p className="font-serif text-xl text-white/70">
              Thank you.
            </p>
            <p className="font-mono text-[11px] text-gold/60 tracking-wide">
              Your feedback has been received.
            </p>
            <Link
              href="/"
              className="inline-block font-mono text-[10px] tracking-widest uppercase py-3 px-8 border border-white/10 text-white/40 hover:border-gold/40 hover:text-gold/60 transition-all mt-4"
            >
              Back to home
            </Link>
          </div>
        ) : (
          <div className="w-full space-y-3">
            <textarea
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="What would make Articulate better? Any bugs, missing features, or general thoughts..."
              rows={5}
              className="w-full bg-white/[0.03] border border-white/10 px-4 py-3 font-mono text-[11px] text-white/70 placeholder:text-white/20 focus:outline-none focus:border-gold/40 transition-colors resize-none"
            />
            <button
              onClick={handleSubmit}
              disabled={!feedback.trim() || submitting}
              className="w-full font-mono text-[11px] tracking-[0.15em] uppercase py-3.5 bg-gold text-ink font-medium hover:bg-gold/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {submitting ? 'Sending...' : 'Send Feedback'}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}