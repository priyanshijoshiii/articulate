'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'

interface Session {
  _id: string
  topic: string
  overallScore: number
  wpm: number
  wordCount: number
  speakingDuration: number
  targetDuration: number
  fillerWords: { count: number; instances: string[] }
  clarity: number
  coherence: number
  suggestions: string[]
  topicClarity: string
  articulationReport: string
  knowledgeGaps: string[]
  transcript: string
  createdAt: string
}

export default function HistoryPage() {
  const { data: session, status } = useSession()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  if (status === 'loading') return (
    <main className="min-h-screen bg-ink flex items-center justify-center">
      <div className="w-4 h-4 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
    </main>
  )

  if (!session) {
    redirect('/login')
    return null
  }

  useEffect(() => {
    fetch('/api/sessions')
      .then(res => res.json())
      .then(data => {
        setSessions(data.sessions ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const avgScore = sessions.length
    ? Math.round(sessions.reduce((a, s) => a + s.overallScore, 0) / sessions.length)
    : 0

  const avgWpm = sessions.length
    ? Math.round(sessions.reduce((a, s) => a + s.wpm, 0) / sessions.length)
    : 0

  const bestScore = sessions.length
    ? Math.max(...sessions.map(s => s.overallScore))
    : 0

  function formatDate(iso: string) {
    const d = new Date(iso)
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function formatDuration(secs: number) {
    const m = Math.floor(secs / 60)
    const s = Math.round(secs % 60)
    return `${m}m ${s}s`
  }

  function scoreColor(score: number) {
    if (score >= 8) return 'text-green-400'
    if (score >= 6) return 'text-gold'
    return 'text-red-400'
  }

  return (
    <main className="min-h-screen bg-ink p-8 flex justify-center">
      <div className="w-full max-w-2xl space-y-8">

        {/* Header */}
        <div className="border-b border-gold/10 pb-6 flex justify-between items-end">
          <div>
            <h1 className="font-serif text-xl text-gold font-semibold">
              Artic<span className="italic font-normal">ulate</span>
            </h1>
            <p className="font-mono text-[10px] text-white/30 tracking-widest uppercase mt-1">
              Session History
            </p>
          </div>
          <Link
            href="/train"
            className="font-mono text-[9px] tracking-widest uppercase text-white/20 hover:text-white/40 transition-colors"
          >
            ← Back to trainer
          </Link>
        </div>

        {/* Stats overview */}
        {sessions.length > 0 && (
          <div className="grid grid-cols-3 border border-gold/10">
            {[
              { label: 'Total Sessions', value: sessions.length.toString() },
              { label: 'Avg Score', value: `${avgScore}/10` },
              { label: 'Best Score', value: `${bestScore}/10` },
            ].map((cell, i) => (
              <div
                key={i}
                className={`px-4 py-3 ${i < 2 ? 'border-r border-gold/10' : ''}`}
              >
                <p className="font-mono text-[9px] tracking-widest uppercase text-white/25 mb-1">
                  {cell.label}
                </p>
                <p className="font-mono text-lg font-medium text-white/70">
                  {cell.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Session list */}
        <div className="space-y-3">
          <p className="font-mono text-[9px] text-white/25 tracking-[0.14em] uppercase flex items-center gap-3">
            Past Sessions
            <span className="flex-1 h-px bg-gold/10" />
          </p>

          {loading && (
            <div className="flex items-center gap-3 py-8 justify-center">
              <div className="w-4 h-4 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
              <span className="font-mono text-[11px] text-white/30">Loading sessions...</span>
            </div>
          )}

          {!loading && sessions.length === 0 && (
            <div className="border border-white/5 px-5 py-8 text-center">
              <p className="font-mono text-[11px] text-white/20">
                No sessions yet. Complete your first session to see it here.
              </p>
            </div>
          )}

          {sessions.map(s => (
            <div key={s._id} className="border border-white/8 bg-white/[0.02]">

          {/* Session header — always visible */}
          <div
            className="p-4 cursor-pointer hover:bg-white/[0.03] transition-all"
            onClick={() => setExpanded(expanded === s._id ? null : s._id)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-serif text-sm text-white/80 leading-snug truncate">
                  {s.topic}
                </p>
                <p className="font-mono text-[10px] text-white/25 mt-1">
                  {formatDate(s.createdAt)} · {formatDuration(s.speakingDuration)} spoken · {s.wpm} WPM
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`font-mono text-lg font-medium ${scoreColor(s.overallScore)}`}>
                  {s.overallScore}/10
                </span>
                {/* Retake button */}
                <Link
                  href={`/train?topic=${encodeURIComponent(s.topic)}`}
                  onClick={e => e.stopPropagation()}
                  className="font-mono text-[9px] tracking-widest uppercase text-white/20 hover:text-gold/60 transition-colors border border-white/10 hover:border-gold/30 px-2 py-1"
                >
                  Retake
                </Link>
                <span className="font-mono text-[10px] text-white/20">
                  {expanded === s._id ? '↑' : '↓'}
                </span>
              </div>
            </div>
          </div>

              {/* Expanded details */}
              {expanded === s._id && (
                <div className="border-t border-white/5 p-4 space-y-4">

                  {/* Metrics row */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Clarity', value: `${s.clarity}/10` },
                      { label: 'Coherence', value: `${s.coherence}/10` },
                      { label: 'Filler Words', value: s.fillerWords?.count ?? 0 },
                    ].map((m, i) => (
                      <div key={i} className="border border-white/5 p-3">
                        <p className="font-mono text-[9px] uppercase tracking-widest text-white/25 mb-1">
                          {m.label}
                        </p>
                        <p className="font-mono text-base text-white/60">{m.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Topic clarity */}
                  {s.topicClarity && (
                    <div className="space-y-1">
                      <p className="font-mono text-[9px] uppercase tracking-widest text-white/25">
                        Topic Clarity
                      </p>
                      <p className="text-sm text-white/50 leading-relaxed">{s.topicClarity}</p>
                    </div>
                  )}

                  {/* Articulation report */}
                  {s.articulationReport && (
                    <div className="space-y-1">
                      <p className="font-mono text-[9px] uppercase tracking-widest text-white/25">
                        Articulation
                      </p>
                      <p className="text-sm text-white/50 leading-relaxed">{s.articulationReport}</p>
                    </div>
                  )}

                  {/* Suggestions */}
                  {s.suggestions?.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-mono text-[9px] uppercase tracking-widest text-white/25">
                        Suggestions
                      </p>
                      {s.suggestions.map((sug, i) => (
                        <div key={i} className="flex gap-2 text-sm text-white/40 leading-relaxed">
                          <span className="text-gold/50 flex-shrink-0">◉</span>
                          <span>{sug}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Transcript */}
                  {s.transcript && (
                    <div className="space-y-1">
                      <p className="font-mono text-[9px] uppercase tracking-widest text-white/25">
                        Transcript
                      </p>
                      <p className="text-sm text-white/30 leading-relaxed font-sans">
                        {s.transcript}
                      </p>
                    </div>
                  )}

                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </main>
  )
}