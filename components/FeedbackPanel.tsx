'use client'

// --- Types --- (we'll reuse these when real AI data arrives)
export interface FeedbackData {
  overallScore: number        // 1–10
  wpm: number                 // words per minute
  wordCount: number           // total words
  fillerWords: {
    count: number
    instances: string[]       // e.g. ['um', 'like', 'basically']
  }
  grammarIssues: number
  clarity: number             // 1–10
  coherence: number           // 1–10
  speakingDuration: number    // seconds
  targetDuration: number      // seconds
  suggestions: string[]
  transcript: string
  topicClarity?: string
  knowledgeGaps?: string[]
  articulationReport?: string

}

interface FeedbackPanelProps {
  data: FeedbackData | null
  isLoading: boolean
}

// --- Helpers ---
function ScoreRing({ score }: { score: number }) {
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const filled = (score / 10) * circumference
  const color = score >= 8 ? '#4ade80' : score >= 6 ? '#C8922A' : '#f87171'

  return (
    <div className="relative flex items-center justify-center w-20 h-20">
      <svg width="80" height="80" className="-rotate-90">
        {/* Track */}
        <circle
          cx="40" cy="40" r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="3"
        />
        {/* Fill */}
        <circle
          cx="40" cy="40" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-mono text-xl font-medium" style={{ color }}>
          {score}
        </span>
        <span className="font-mono text-[8px] text-white/30 tracking-wide">/10</span>
      </div>
    </div>
  )
}

function MetricBar({ label, value, max = 10 }: { label: string; value: number; max?: number }) {
  const pct = (value / max) * 100
  const color = pct >= 80 ? 'bg-green-400' : pct >= 60 ? 'bg-gold' : 'bg-red-400'

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="font-mono text-[10px] tracking-wide text-white/40 uppercase">{label}</span>
        <span className="font-mono text-[11px] text-white/60">{value}/{max}</span>
      </div>
      <div className="h-px bg-white/5">
        <div
          className={`h-full ${color} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function StatCell({
  label,
  value,
  sub,
  status,
}: {
  label: string
  value: string
  sub?: string
  status?: 'good' | 'warn' | 'bad' | 'neutral'
}) {
  const colors = {
    good: 'text-green-400',
    warn: 'text-gold',
    bad: 'text-red-400',
    neutral: 'text-white/70',
  }

  return (
    <div className="border border-white/8 bg-white/[0.02] p-4">
      <p className="font-mono text-[9px] tracking-widest uppercase text-white/25 mb-1">
        {label}
      </p>
      <p className={`font-mono text-2xl font-light tabular-nums ${colors[status ?? 'neutral']}`}>
        {value}
      </p>
      {sub && (
        <p className="font-mono text-[10px] text-white/25 mt-1">{sub}</p>
      )}
    </div>
  )
}

// --- Main component ---
export default function FeedbackPanel({ data, isLoading }: FeedbackPanelProps) {

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="border border-gold/20 bg-gold/5 px-5 py-4 flex items-center gap-4">
          <div className="w-4 h-4 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
          <div>
            <p className="font-mono text-[11px] text-gold tracking-wide">
              Analyzing your speech...
            </p>
            <p className="font-mono text-[10px] text-white/30 mt-0.5">
              Transcribing → checking grammar → scoring articulation
            </p>
          </div>
        </div>
        {/* Skeleton rows */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border border-white/5 p-4 animate-pulse">
            <div className="h-2 bg-white/10 rounded w-1/3 mb-3" />
            <div className="h-4 bg-white/5 rounded w-2/3" />
          </div>
        ))}
      </div>
    )
  }

  // Empty state
  if (!data) {
    return (
      <div className="border border-white/5 px-5 py-6 text-center">
        <p className="font-mono text-[11px] text-white/20 tracking-wide">
          Complete a session to see your analysis
        </p>
      </div>
    )
  }

  // Coverage percentage
  const coverage = Math.round((data.speakingDuration / data.targetDuration) * 100)
  const wpmStatus = data.wpm < 100 ? 'warn' : data.wpm > 170 ? 'warn' : 'good'
  const fillerStatus = data.fillerWords.count > 8 ? 'bad' : data.fillerWords.count > 3 ? 'warn' : 'good'
  const coverageStatus = coverage < 60 ? 'bad' : coverage < 80 ? 'warn' : 'good'

  return (
    <div className="space-y-6">

      {/* Header row — score + title */}
      <div className="flex items-center gap-6 border border-gold/15 bg-gold/5 p-5">
        <ScoreRing score={data.overallScore} />
        <div className="flex-1">
          <h2 className="font-serif text-lg text-white/90">Performance Report</h2>
          <p className="font-mono text-[10px] text-white/35 mt-1 tracking-wide">
            {data.wordCount} words · {data.wpm} WPM ·{' '}
            {Math.floor(data.speakingDuration / 60)}m {Math.round(data.speakingDuration % 60)}s recorded
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        <StatCell
          label="Words / min"
          value={data.wpm.toString()}
          sub="ideal range: 110–160"
          status={wpmStatus}
        />
        <StatCell
          label="Filler words"
          value={data.fillerWords.count.toString()}
          sub={data.fillerWords.instances.slice(0, 3).join(', ') || 'none detected'}
          status={fillerStatus}
        />
        <StatCell
          label="Time coverage"
          value={`${coverage}%`}
          sub={`${Math.round(data.speakingDuration)}s of ${data.targetDuration}s`}
          status={coverageStatus}
        />
        <StatCell
          label="Grammar issues"
          value={data.grammarIssues.toString()}
          status={data.grammarIssues === 0 ? 'good' : data.grammarIssues < 4 ? 'warn' : 'bad'}
        />
      </div>

      {/* Quality bars */}
      <div className="border border-white/8 bg-white/[0.02] p-5 space-y-4">
        <p className="font-mono text-[9px] tracking-widest uppercase text-white/25 mb-2">
          Quality Metrics
        </p>
        <MetricBar label="Clarity" value={data.clarity} />
        <MetricBar label="Coherence" value={data.coherence} />
        <MetricBar label="Overall" value={data.overallScore} />
      </div>

      {/* Topic clarity */}
      {data.topicClarity && (
        <div className="border border-white/8 bg-white/[0.02] p-5 space-y-2">
          <p className="font-mono text-[9px] tracking-widest uppercase text-white/25">
            Did you address the topic?
          </p>
          <p className="text-sm text-white/60 leading-relaxed">
            {data.topicClarity}
          </p>
        </div>
      )}

      {/* Knowledge gaps */}
      {data.knowledgeGaps && data.knowledgeGaps.length > 0 && (
        <div className="border border-white/8 bg-white/[0.02] p-5 space-y-3">
          <p className="font-mono text-[9px] tracking-widest uppercase text-white/25">
            What to add next time
          </p>
          {data.knowledgeGaps.map((gap, i) => (
            <div key={i} className="flex gap-3 text-sm text-white/50 leading-relaxed">
              <span className="text-gold/60 font-mono mt-0.5 flex-shrink-0">+</span>
              <span>{gap}</span>
            </div>
          ))}
        </div>
      )}

      {/* Articulation report */}
      {data.articulationReport && (
        <div className="border border-gold/15 bg-gold/5 p-5 space-y-2">
          <p className="font-mono text-[9px] tracking-widest uppercase text-white/25">
            Articulation report
          </p>
          <p className="text-sm text-white/60 leading-relaxed">
            {data.articulationReport}
          </p>
        </div>
      )}

      {/* Suggestions */}
      {data.suggestions.length > 0 && (
        <div className="border border-white/8 bg-white/[0.02] p-5 space-y-3">
          <p className="font-mono text-[9px] tracking-widest uppercase text-white/25">
            Suggestions
          </p>
          {data.suggestions.map((s, i) => (
            <div key={i} className="flex gap-3 text-sm text-white/50 leading-relaxed">
              <span className="text-gold/60 font-mono mt-0.5 flex-shrink-0">◉</span>
              <span>{s}</span>
            </div>
          ))}
        </div>
      )}

      {/* Transcript */}
      {data.transcript && (
        <div className="border border-white/8 bg-white/[0.02] p-5 space-y-3">
          <p className="font-mono text-[9px] tracking-widest uppercase text-white/25">
            Transcript
          </p>
          <p className="text-sm text-white/40 leading-relaxed font-sans">
            {data.transcript}
          </p>
        </div>
      )}

    </div>
  )
}