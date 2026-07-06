'use client'

import { useState, useCallback, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { redirect } from 'next/navigation'
import TopicCard from '@/components/TopicCard'
import Timer from '@/components/Timer'
import Recorder from '@/components/Recorder'
import FeedbackPanel, { FeedbackData } from '@/components/FeedbackPanel'
import Link from 'next/link'

type Phase = 'idle' | 'thinking' | 'speaking' | 'done'

import { useSearchParams } from 'next/navigation'

function Home() {
  const { data: session, status } = useSession()

  // ALL state hooks must come before any conditional returns
  const [phase, setPhase] = useState<Phase>('idle')
  const [duration, setDuration] = useState(120)
  const [thinkTime, setThinkTime] = useState(10)
  const [sessionCount, setSessionCount] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentTopic, setCurrentTopic] = useState<string>('')

  const searchParams = useSearchParams()

  useEffect(() => {
    const topic = searchParams.get('topic')
    const prep = searchParams.get('prep')
    const dur = searchParams.get('duration')

    if (topic) setCurrentTopic(topic)
    if (prep) setThinkTime(parseInt(prep))
    if (dur) setDuration(parseInt(dur))
  }, [])

  useEffect(() => {
    fetch('/api/sessions')
      .then(res => res.json())
      .then(data => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayCount = (data.sessions ?? []).filter((s: { createdAt: string }) => {
          return new Date(s.createdAt) >= today
        }).length
        setSessionCount(todayCount)
      })
      .catch(() => {})
  }, [])
    
  const handlePhaseChange = useCallback((newPhase: Phase) => {
    setPhase(newPhase)
    if (newPhase === 'done') {
      setSessionCount(prev => prev + 1)
    }
  }, [])

  // Conditional returns AFTER all hooks
  if (status === 'loading') return (
    <main className="min-h-screen bg-ink flex items-center justify-center">
      <div className="w-4 h-4 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
    </main>
  )

  if (!session) {
    redirect('/login')
    return null
  }

  async function handleRecordingComplete(blob: Blob, recordingDuration: number) {
    setAudioBlob(blob)
    setIsAnalyzing(true)

    try {
      const formData = new FormData()
      formData.append('audio', blob, 'recording.webm')

      const transcribeRes = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (transcribeRes.status === 422) {
        const { message } = await transcribeRes.json()
        alert(message)
        setIsAnalyzing(false)
        return
      }

      if (!transcribeRes.ok) throw new Error('Transcription failed')
      const { transcript } = await transcribeRes.json()

      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          duration: recordingDuration,
          targetDuration: duration,
          topic: currentTopic,
        }),
      })

      if (!analyzeRes.ok) throw new Error('Analysis failed')
      const feedbackData = await analyzeRes.json()

      if (!feedbackData.wpm || !feedbackData.duration) {
        throw new Error('Incomplete feedback data')
      }

      setFeedbackData(feedbackData)
      await saveSession(feedbackData, currentTopic)

    } catch (err) {
      console.error('Pipeline error:', err)
      alert('Something went wrong. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }


  function handleStart() {
    if (!currentTopic) {
      alert('Please select or generate a topic first.')
      return
    }
    setFeedbackData(null)
    if (thinkTime > 0) {
      setPhase('thinking')
    } else {
      setPhase('speaking')
    }
  }

  function handleStop() {
    setPhase('done')
  }

  function handleReset() {
    setPhase('idle')
    setFeedbackData(null)
    setIsAnalyzing(false)
  }

  async function saveSession(feedbackData: FeedbackData, topic: string) {
    try {
      await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...feedbackData, topic }),
      })
    } catch (err) {
      console.error('Failed to save session:', err)
    }
  }

return (
    <main className="min-h-screen bg-ink">

      {/* Top bar */}
      <div className="border-b border-gold/10 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-lg text-gold font-semibold">
            Artic<span className="italic font-normal">ulate</span>
          </h1>
          <p className="font-mono text-[9px] text-white/20 tracking-widest uppercase hidden sm:block">
            Impromptu Speaking Trainer
          </p>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="font-mono text-[10px] text-white/25 hidden sm:block">
            {sessionCount} sessions today
          </span>
          <Link
            href="/history"
            className="font-mono text-[9px] tracking-widest uppercase text-white/30 hover:text-white/50 transition-colors"
          >
            History
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="font-mono text-[9px] tracking-widest uppercase text-white/30 hover:text-white/50 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">

        {/* Status bar — 2 cols on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border border-gold/10">
          {[
            { label: 'Phase', value: phase.toUpperCase() },
            { label: 'Duration', value: `${duration / 60}:00` },
            { label: 'Prep', value: thinkTime === 0 ? 'None' : `${thinkTime}s` },
            { label: 'Sessions', value: sessionCount.toString() },
          ].map((cell, i) => (
            <div
              key={i}
              className={`px-3 py-2.5 ${
                i % 2 === 0 ? 'border-r border-gold/10' : ''
              } ${
                i < 2 ? 'border-b sm:border-b-0 border-gold/10' : ''
              } sm:border-r sm:last:border-r-0`}
            >
              <p className="font-mono text-[8px] tracking-widest uppercase text-white/25 mb-0.5">
                {cell.label}
              </p>
              <p className={`font-mono text-sm font-medium ${
                cell.label === 'Phase' && phase === 'speaking'
                  ? 'text-red-400'
                  : 'text-white/70'
              }`}>
                {cell.value}
              </p>
            </div>
          ))}
        </div>

        {/* Topic section */}
        <section>
          <SectionLabel>Topic Prompt</SectionLabel>
          <TopicCard
            onTopicChange={(t) => setCurrentTopic(t.text)}
            disabled={phase !== 'idle'}
          />
        </section>

        {/* Timer section */}
        <section>
          <SectionLabel>Timer</SectionLabel>
          <Timer
            phase={phase}
            onPhaseChange={handlePhaseChange}
            duration={duration}
            thinkTime={thinkTime}
            onDurationChange={setDuration}
            onThinkTimeChange={setThinkTime}
          />
        </section>

        {/* Recorder section */}
        <Recorder
          phase={phase}
          onRecordingComplete={handleRecordingComplete}
        />

        {/* Controls */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleStart}
            disabled={phase !== 'idle'}
            className="col-span-1 font-mono text-[10px] tracking-widest uppercase py-3.5 bg-gold text-ink font-medium hover:bg-gold/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ▶ Start
          </button>
          <button
            onClick={handleStop}
            disabled={phase === 'idle' || phase === 'done'}
            className="font-mono text-[10px] tracking-widest uppercase py-3.5 border border-white/10 text-white/50 hover:border-gold/50 hover:text-gold/70 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ■ Stop
          </button>
          <button
            onClick={handleReset}
            className="font-mono text-[10px] tracking-widest uppercase py-3.5 border border-white/10 text-white/50 hover:border-gold/50 hover:text-gold/70 transition-all"
          >
            ↺ Reset
          </button>
        </div>

        {/* Feedback section */}
        {(isAnalyzing || feedbackData) && (
          <section>
            <SectionLabel>Analysis</SectionLabel>
            <FeedbackPanel data={feedbackData} isLoading={isAnalyzing} />
          </section>
        )}

      </div>
    </main>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[9px] text-white/30 tracking-[0.14em] uppercase mb-3 flex items-center gap-3">
      {children}
      <span className="flex-1 h-px bg-gold/10" />
    </p>
  )
}

import { Suspense } from 'react'

// Wrap the existing export
export default function TrainPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-ink flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
      </main>
    }>
      <Home />
    </Suspense>
  )
}