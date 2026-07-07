'use client'

import { useState } from 'react'

export default function Footer() {
  const [feedback, setFeedback] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

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
      alert('Could not submit feedback. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <footer className="border-t border-white/[0.06] mt-16 px-4 sm:px-8 py-10">
      <div className="max-w-2xl mx-auto space-y-8">

        <div className="space-y-3">
          <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-white/30">
            Feedback
          </p>
          {submitted ? (
            <p className="font-mono text-[11px] text-gold/60 tracking-wide">
              Thank you — I read every response.
            </p>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="What would make Articulate better?"
                className="flex-1 bg-white/[0.03] border border-white/10 px-4 py-2.5 font-mono text-[11px] text-white/70 placeholder:text-white/20 focus:outline-none focus:border-gold/40 transition-colors"
              />
              <button
                onClick={handleSubmit}
                disabled={!feedback.trim() || submitting}
                className="font-mono text-[10px] tracking-widest uppercase px-4 py-2.5 border border-white/10 text-white/40 hover:border-gold/40 hover:text-gold/70 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {submitting ? '...' : 'Send'}
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="font-mono text-[10px] text-white/25 tracking-wide">
              Built by Priyanshi Joshi
            </p>
            <p className="font-mono text-[9px] text-white/15 tracking-wide">
              Third-year ME student at NIT Hamirpur
            </p>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com/priyanshijoshiii" target="_blank" rel="noopener noreferrer" className="font-mono text-[9px] tracking-widest uppercase text-white/20 hover:text-white/40 transition-colors">
              GitHub
            </a>
            <a href="https://linkedin.com/in/priyanshi-joshi-61258a344" target="_blank" rel="noopener noreferrer" className="font-mono text-[9px] tracking-widest uppercase text-white/20 hover:text-white/40 transition-colors">
              LinkedIn
            </a>
          </div>
        </div>

      </div>
    </footer>
  )
}