'use client'

import { useState, useCallback } from 'react'

import TopicCard from '@/components/TopicCard'
import Timer from '@/components/Timer'
import Recorder from '@/components/Recorder'
import FeedbackPanel, { FeedbackData } from '@/components/FeedbackPanel'
// add useCallback to the import



type Phase = 'idle' | 'thinking' | 'speaking' | 'done'

export default function Home() {
  // Shared state — lives here, passed down as props
  const [phase, setPhase] = useState<Phase>('idle')
  const [duration, setDuration] = useState(120)
  const [thinkTime, setThinkTime] = useState(10)
  const [sessionCount, setSessionCount] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentTopic, setCurrentTopic] = useState<string>('')

  //handler function
  async function handleRecordingComplete(blob: Blob, duration: number) {
  setAudioBlob(blob)
  setRecordingDuration(duration)
  setIsAnalyzing(true)

  try {
    // Step 1 — transcribe audio
    const formData = new FormData()
    formData.append('audio', blob, 'recording.webm')

    const transcribeRes = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData,
    })

    if (!transcribeRes.ok) throw new Error('Transcription failed')
    const { transcript } = await transcribeRes.json()

    // Step 2 — analyze transcript
    const analyzeRes = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript,
        duration,
        targetDuration: duration,
        topic: currentTopic,
      }),
    })

    if (!analyzeRes.ok) throw new Error('Analysis failed')
    const feedbackData = await analyzeRes.json()
    console.log('Feedback data received:', feedbackData)
    setFeedbackData(feedbackData)
    await saveSession(feedbackData, currentTopic)
    
    

  } catch (err) {
    console.error('Pipeline error:', err)
    // Fall back to mock if something goes wrong
    generateMockFeedback(duration)
  } finally {
    setIsAnalyzing(false)
  }
}

function generateMockFeedback(duration: number) {
  setIsAnalyzing(true)

  // Simulate API delay
  setTimeout(() => {
    const wpm = Math.floor(110 + Math.random() * 60)
    const words = Math.floor(wpm * (duration / 60))
    const fillerCount = Math.floor(Math.random() * 8)
    const score = Math.floor(6 + Math.random() * 3.5)

    setFeedbackData({
      overallScore: score,
      wpm,
      wordCount: words,
      fillerWords: {
        count: fillerCount,
        instances: ['um', 'like', 'basically'].slice(0, Math.min(fillerCount, 3)),
      },
      grammarIssues: Math.floor(Math.random() * 5),
      clarity: Math.floor(6 + Math.random() * 4),
      coherence: Math.floor(5 + Math.random() * 4),
      speakingDuration: duration,
      targetDuration: duration,
      suggestions: [
        'Try pausing silently instead of using filler words — a confident pause is more powerful than "um".',
        'Vary your sentence length. Mix short punchy statements with longer explanations to keep listeners engaged.',
        'End with a clear conclusion. Your final sentence should signal you are done, not trail off.',
      ],
      transcript: 'Transcript will appear here once Groq integration is complete in Phase 5.',
    })

    setIsAnalyzing(false)
  }, 2000)
}

  // wrap the function
  const handlePhaseChange = useCallback((newPhase: Phase) => {
  setPhase(newPhase)
  if (newPhase === 'done') {
    setSessionCount(prev => prev + 1)
  }
  }, [])

  function handleStart() {
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


  // to save sessions after analysis
  async function saveSession(
  feedbackData: FeedbackData,
  topic: string,
) {
  try {
    await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...feedbackData,
        topic,
      }),
    })
  } catch (err) {
    console.error('Failed to save session:', err)
    // Non-critical — don't show error to user
  }
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
              Impromptu Speaking Trainer — v0.2
            </p>
          </div>
          <p className="font-mono text-[10px] text-white/25">
            {sessionCount} sessions today
          </p>
        </div>

        {/* Status bar */}
        <div className="grid grid-cols-4 border border-gold/10">
          {[
            { label: 'Phase', value: phase.toUpperCase() },
            { label: 'Duration', value: `${duration / 60}:00` },
            { label: 'Prep', value: thinkTime === 0 ? 'None' : `${thinkTime}s` },
            { label: 'Sessions', value: sessionCount.toString() },
          ].map((cell, i) => (
            <div
              key={i}
              className={`px-4 py-2.5 ${i < 3 ? 'border-r border-gold/10' : ''}`}
            >
              <p className="font-mono text-[9px] tracking-widest uppercase text-white/25 mb-0.5">
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
          <TopicCard onTopicChange={(t) => setCurrentTopic(t.text)} />
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
        <section>
          <SectionLabel>Recording</SectionLabel>
          <Recorder
            phase={phase}
            onRecordingComplete={handleRecordingComplete}
          />
        </section>

        {/* Controls */}
        <div className="flex gap-2">
          <button
            onClick={handleStart}
            disabled={phase !== 'idle'}
            className="flex-1 font-mono text-[11px] tracking-widest uppercase py-3 bg-gold text-ink font-medium hover:bg-gold/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ▶ Start Session
          </button>
          <button
            onClick={handleStop}
            disabled={phase === 'idle' || phase === 'done'}
            className="flex-1 font-mono text-[11px] tracking-widest uppercase py-3 border border-white/10 text-white/50 hover:border-gold/50 hover:text-gold/70 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ■ Stop
          </button>
          <button
            onClick={handleReset}
            className="flex-1 font-mono text-[11px] tracking-widest uppercase py-3 border border-white/10 text-white/50 hover:border-gold/50 hover:text-gold/70 transition-all"
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

// Reusable section label
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[9px] text-white/30 tracking-[0.14em] uppercase mb-3 flex items-center gap-3">
      {children}
      <span className="flex-1 h-px bg-gold/10" />
    </p>
  )
}