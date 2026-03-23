'use client'

import { useState, useEffect, useCallback } from 'react'

// --- Types ---
type Phase = 'idle' | 'thinking' | 'speaking' | 'done'

interface TimerProps {
  phase: Phase
  onPhaseChange: (phase: Phase) => void
  duration: number        // speaking duration in seconds
  thinkTime: number       // prep time in seconds
  onDurationChange: (value: number) => void
  onThinkTimeChange: (value: number) => void
}

// --- Helpers ---
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function getTimerColor(seconds: number, total: number): string {
  if (seconds <= 30) return 'text-red-400'
  if (seconds <= total * 0.33) return 'text-gold'
  return 'text-white/90'
}

// --- Component ---
export default function Timer({
  phase,
  onPhaseChange,
  duration,
  thinkTime,
  onDurationChange,
  onThinkTimeChange,
}: TimerProps) {
  const [remaining, setRemaining] = useState(duration)
  const [thinkRemaining, setThinkRemaining] = useState(thinkTime)
  const [elapsed, setElapsed] = useState(0)

  // Reset when duration prop changes (user picks 1min / 2min / 3min)
  useEffect(() => {
    setRemaining(duration)
  }, [duration])

  // Reset think timer when thinkTime changes
  useEffect(() => {
    setThinkRemaining(thinkTime)
  }, [thinkTime])

  // --- Think phase countdown ---
  useEffect(() => {
    if (phase !== 'thinking') return
 
    
    const id = setInterval(() => {
      setThinkRemaining(prev => {
        if (prev <= 1) {
          clearInterval(id)
          setTimeout(() => onPhaseChange('speaking'), 0)  // ← deferred, good
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(id)
  }, [phase, onPhaseChange])

  // --- Speaking phase countdown ---
  useEffect(() => {
    if (phase !== 'speaking') return

// AFTER
    const id = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(id)
          setTimeout(() => onPhaseChange('done'), 0)  // ← deferred, good
          return 0
        }
        return prev - 1
      })
      setElapsed(prev => prev + 1)
    }, 1000)

    return () => clearInterval(id)
  }, [phase, onPhaseChange])

  // Reset all when phase goes back to idle
  useEffect(() => {
    if (phase === 'idle') {
      setRemaining(duration)
      setThinkRemaining(thinkTime)
      setElapsed(0)
    }
  }, [phase, duration, thinkTime])

  // Progress bar percentage
  const progress = ((duration - remaining) / duration) * 100

  return (
    <div className="space-y-4">

      {/* Think overlay */}
      {phase === 'thinking' && (
        <div className="border border-gold/30 bg-gold/5 p-6 text-center space-y-2">
          <p className="font-mono text-[10px] tracking-widest uppercase text-white/40">
            Prepare your thoughts
          </p>
          <p className="font-mono text-7xl font-light text-gold tabular-nums">
            {thinkRemaining}
          </p>
        </div>
      )}

      {/* Main timer display */}
      <div className="flex gap-4 items-start">

        {/* Clock */}
        <div className="border border-white/8 bg-white/[0.02] p-5 flex flex-col items-center gap-2 min-w-[148px]">
          <span
            className={`font-mono text-5xl font-light tabular-nums transition-colors duration-300 ${
              phase === 'speaking'
                ? getTimerColor(remaining, duration)
                : 'text-white/50'
            }`}
          >
            {formatTime(remaining)}
          </span>
          <span className="font-mono text-[9px] tracking-widest uppercase text-white/25">
            {phase === 'idle' && 'Ready'}
            {phase === 'thinking' && 'Prep time'}
            {phase === 'speaking' && 'Speaking'}
            {phase === 'done' && 'Complete'}
          </span>

          {/* Progress bar */}
          <div className="w-full h-px bg-white/5 mt-1">
            <div
              className="h-full bg-gold transition-all duration-1000 linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Config panel */}
        <div className="flex-1 space-y-4">

          {/* Duration selector */}
          <div>
            <p className="font-mono text-[9px] tracking-widest uppercase text-white/30 mb-2">
              Speaking Duration
            </p>
            <DurationSelector
              options={[
                { label: '1 min', value: 60 },
                { label: '2 min', value: 120 },
                { label: '3 min', value: 180 },
                { label: '5 min', value: 300 },
              ]}
              selected={duration}
              disabled={phase !== 'idle'}
              onSelect={(v) => {
                onDurationChange(v)
                setRemaining(v)
              }}
            />
          </div>

          {/* Think time selector */}
          <div>
            <p className="font-mono text-[9px] tracking-widest uppercase text-white/30 mb-2">
              Prep Time
            </p>
            <DurationSelector
              options={[
                { label: 'None', value: 0 },
                { label: '10 s', value: 10 },
                { label: '30 s', value: 30 },
                { label: '60 s', value: 60 },
              ]}
              selected={thinkTime}
              disabled={phase !== 'idle'}
              onSelect={(v) => {
                onThinkTimeChange(v)
                setThinkRemaining(v)
              }}
            />
          </div>

        </div>
      </div>

      {/* Stats row — visible after session */}
      {phase === 'done' && (
        <div className="grid grid-cols-3 gap-2 mt-2">
          <StatCell label="Elapsed" value={formatTime(elapsed)} />
          <StatCell label="Target" value={formatTime(duration)} />
          <StatCell
            label="Coverage"
            value={`${Math.round((elapsed / duration) * 100)}%`}
            highlight={elapsed / duration >= 0.8}
          />
        </div>
      )}

    </div>
  )
}

// --- Sub-components ---
interface DurationSelectorProps {
  options: { label: string; value: number }[]
  selected: number
  disabled: boolean
  onSelect: (value: number) => void
}

function DurationSelector({ options, selected, disabled, onSelect }: DurationSelectorProps) {
  return (
    <div className="flex gap-1.5">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onSelect(opt.value)}
          disabled={disabled}
          className={`font-mono text-[10px] tracking-wide px-3 py-1.5 border transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
            selected === opt.value
              ? 'border-gold bg-gold text-ink font-medium'
              : 'border-white/10 text-white/40 hover:border-gold/50 hover:text-gold/70'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

interface StatCellProps {
  label: string
  value: string
  highlight?: boolean
}

function StatCell({ label, value, highlight }: StatCellProps) {
  return (
    <div className="border border-white/8 bg-white/[0.02] p-3">
      <p className="font-mono text-[9px] tracking-widest uppercase text-white/30 mb-1">
        {label}
      </p>
      <p className={`font-mono text-lg font-medium tabular-nums ${highlight ? 'text-gold' : 'text-white/70'}`}>
        {value}
      </p>
    </div>
  )
}