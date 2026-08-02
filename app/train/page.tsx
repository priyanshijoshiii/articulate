'use client'

import { useState, useCallback, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { redirect } from 'next/navigation'
import TopicCard from '@/components/TopicCard'
import Timer from '@/components/Timer'
import Recorder from '@/components/Recorder'
import FeedbackPanel, { FeedbackData } from '@/components/FeedbackPanel'
import Link from 'next/link'
import Footer from '@/components/Footer'

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
  const [previousScore, setPreviousScore] = useState<number | null>(null)
  const [previousTranscript, setPreviousTranscript] = useState<string | null>(null)
  const [isRetake, setIsRetake] = useState(false)
  const [comparisonData, setComparisonData] = useState<{
    improvement: string
    stillNeeds: string
    verdict: string
  } | null>(null)

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

      if (!transcribeRes.ok) {
        const { message } = await transcribeRes.json()
        throw new Error(message || 'Transcription failed')
      }
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

    if (!analyzeRes.ok) {
      const { message } = await analyzeRes.json()
      throw new Error(message || 'Analysis failed')
    }
      const feedbackData = await analyzeRes.json()

      if (!feedbackData.wpm || !feedbackData.duration) {
        throw new Error('Incomplete feedback data')
      }

      setFeedbackData(feedbackData)
      await saveSession(feedbackData, currentTopic)

      //if this was a retake, run comparison
      if (isRetake && previousTranscript && previousScore !== null) {
      try {
        const compareRes = await fetch('/api/compare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            originalTranscript: previousTranscript,
            newTranscript: feedbackData.transcript,
            originalScore: previousScore,
            newScore: feedbackData.overallScore,
            topic: currentTopic,
          }),
        })
        if (compareRes.ok) {
          const comparison = await compareRes.json()
          setComparisonData(comparison)
        }
      } catch (err) {
        console.error('Comparison error:', err)
      }
    }


      } catch (err: unknown) {
        console.error('Pipeline error:', err)
        const message = err instanceof Error && err.message.includes('rate')
          ? 'High demand right now — please try again in a moment.'
          : 'Something went wrong. Please try again.'
        alert(message)
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
    setComparisonData(null)
  }

  function handleRetake(){
    //save previous session data before resetting
    if(feedbackData){
      setPreviousScore(feedbackData.overallScore)
      setPreviousTranscript(feedbackData.transcript)
    }
    setIsRetake(true)
    setPhase('idle')
    setFeedbackData(null)
    setIsAnalyzing(false)
    setComparisonData(null)
    //topic is the same dont reset the topic
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

    {/* Nav */}
    <div className="border-b border-white/[0.06] px-4 sm:px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Link href="/">
          <h1 className="font-serif text-lg text-gold font-semibold">
            Artic<span className="italic font-normal">ulate</span>
          </h1>
        </Link>
      </div>
      <div className="flex items-center gap-4">

        <Link
          href="/history"
          className="font-mono text-[10px] tracking-widest uppercase text-white/30 hover:text-white/50 transition-colors"
        >
          History
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="font-mono text-[10px] tracking-widest uppercase text-white/30 hover:text-white/50 transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>

    <div className="max-w-2xl mx-auto px-4 sm:px-8 py-8 space-y-10">

      {/* Phase indicator — quiet, not a grid */}
      <div className="flex items-center justify-between">
        <span className={`font-mono text-[11px] tracking-widest uppercase font-medium ${
          phase === 'speaking' ? 'text-red-400' :
          phase === 'thinking' ? 'text-gold' :
          phase === 'done' ? 'text-green-400' :
          'text-white/25'
        }`}>
          {phase}
        </span>
        <span className="font-mono text-[11px] text-white/25">
          {sessionCount} session{sessionCount !== 1 ? 's' : ''} today
        </span>
      </div>

      {/* Topic — dominant element */}
      <div className="space-y-4">
        <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-white/30">
          Topic Prompt
        </p>
        <TopicCard
          onTopicChange={(t) => setCurrentTopic(t.text)}
          disabled={phase !== 'idle'}
          initialTopic={currentTopic || undefined}
        />
      </div>

      {/* Timer */}
      <div className="space-y-4">
        <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-white/30">
          Timer
        </p>
        <Timer
          phase={phase}
          onPhaseChange={handlePhaseChange}
          duration={duration}
          thinkTime={thinkTime}
          onDurationChange={setDuration}
          onThinkTimeChange={setThinkTime}
        />
      </div>

      {/* Recorder */}
      <Recorder
        phase={phase}
        onRecordingComplete={handleRecordingComplete}
      />

      {/* Controls */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={handleStart}
          disabled={phase !== 'idle'}
          className="font-mono text-[11px] tracking-widest uppercase py-4 bg-gold text-ink font-medium hover:bg-gold/90 transition-all disabled:opacity-25 disabled:cursor-not-allowed"
        >
          ▶ Start
        </button>
        <button
          onClick={handleStop}
          disabled={phase === 'idle' || phase === 'done'}
          className="font-mono text-[11px] tracking-widest uppercase py-4 border border-white/10 text-white/40 hover:border-white/20 hover:text-white/60 transition-all disabled:opacity-25 disabled:cursor-not-allowed"
        >
          ■ Stop
        </button>
        <button
          onClick={handleReset}
          className="font-mono text-[11px] tracking-widest uppercase py-4 border border-white/10 text-white/40 hover:border-white/20 hover:text-white/60 transition-all"
        >
          ↺ Reset
        </button>
      </div>

      {/* Feedback */}
      {(isAnalyzing || feedbackData) && (
        <div className="space-y-4">
          <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-white/30">
           Analysis
          </p>
          <FeedbackPanel
            data={feedbackData}
            isLoading={isAnalyzing}
            onRetake={handleRetake}
            previousScore={previousScore}
            comparisonData={comparisonData}
          />
        </div>
      )}

    </div>
    <Footer />
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