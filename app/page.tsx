'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { redirect, useRouter } from 'next/navigation'
import Link from 'next/link'

const featuredTopics = [
  { text: 'Should social media platforms be held legally responsible for the content they host?', category: 'Society' },
  { text: 'Will artificial intelligence create more jobs than it destroys?', category: 'Tech' },
  { text: 'Describe a failure that ultimately made you stronger.', category: 'Personal' },
  { text: 'Is free will an illusion?', category: 'Philosophy' },
  { text: 'Should there be a universal basic income?', category: 'Economics' },
  { text: 'Is India ready to be a global superpower?', category: 'India' },
  { text: 'If failure was impossible, what would you attempt?', category: 'Hypothetical' },
  { text: 'Remote work is better for productivity than office work.', category: 'Debate' },
]

const prepOptions = [
  { label: 'No prep', value: 0 },
  { label: '10 seconds', value: 10 },
  { label: '30 seconds', value: 30 },
  { label: '60 seconds', value: 60 },
]

const durationOptions = [
  { label: '1 min', value: 60 },
  { label: '2 min', value: 120 },
  { label: '3 min', value: 180 },
  { label: '5 min', value: 300 },
]

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [topicIndex, setTopicIndex] = useState(0)
  const [prep, setPrep] = useState(10)
  const [duration, setDuration] = useState(120)
  const [isAnimating, setIsAnimating] = useState(false)

  if (status === 'loading') return (
    <main className="min-h-screen bg-ink flex items-center justify-center">
      <div className="w-4 h-4 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
    </main>
  )

  if (!session) {
    redirect('/login')
    return null
  }

  function shuffleTopic() {
    setIsAnimating(true)
    setTimeout(() => {
      setTopicIndex(prev => (prev + 1) % featuredTopics.length)
      setIsAnimating(false)
    }, 150)
  }

  function handleStart() {
    const topic = featuredTopics[topicIndex]
    const params = new URLSearchParams({
      topic: topic.text,
      category: topic.category,
      prep: prep.toString(),
      duration: duration.toString(),
    })
    router.push(`/train?${params.toString()}`)
  }

  const currentTopic = featuredTopics[topicIndex]

  return (
    <main className="min-h-screen bg-ink flex flex-col">

      {/* Nav */}
      <nav className="px-6 sm:px-10 py-5 flex justify-between items-center border-b border-white/[0.06]">
        <h1 className="font-serif text-lg text-gold font-semibold">
          Artic<span className="italic font-normal">ulate</span>
        </h1>
        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/history"
            className="font-mono text-[10px] tracking-widest uppercase text-white/30 hover:text-white/50 transition-colors"
          >
            History
          </Link>
          <span className="font-mono text-[10px] text-white/20 hidden sm:block">
            {session.user?.name?.split(' ')[0]}
          </span>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 py-12 sm:py-20">
        <div className="w-full max-w-xl space-y-10 sm:space-y-14">

          {/* Intro text */}
          <div className="space-y-3 text-center">
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-gold/60">
              Impromptu Speaking Trainer
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl text-white/80 font-normal leading-snug">
              Think on your feet.<br />
              <span className="italic text-white/40">Get better every time.</span>
            </h2>
          </div>

          {/* Topic display */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] tracking-[0.16em] uppercase text-white/25">
                Your topic
              </span>
              <span className="font-mono text-[9px] text-gold/40 tracking-wide">
                {currentTopic.category}
              </span>
            </div>

            <div
              onClick={shuffleTopic}
              className="cursor-pointer group"
            >
              <p className={`font-serif text-xl sm:text-2xl text-white/85 leading-relaxed transition-opacity duration-150 ${
                isAnimating ? 'opacity-0' : 'opacity-100'
              }`}>
                {currentTopic.text}
              </p>
              <p className="font-mono text-[9px] text-white/20 mt-3 tracking-wide group-hover:text-white/35 transition-colors">
                ↓ click to shuffle
              </p>
            </div>
          </div>

          {/* Config */}
          <div className="space-y-5">

            {/* Duration */}
            <div className="space-y-2">
              <p className="font-mono text-[9px] tracking-[0.16em] uppercase text-white/25">
                Speaking duration
              </p>
              <div className="flex gap-2 flex-wrap">
                {durationOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setDuration(opt.value)}
                    className={`font-mono text-[10px] tracking-wide px-4 py-2 border transition-all ${
                      duration === opt.value
                        ? 'border-gold bg-gold text-ink font-medium'
                        : 'border-white/10 text-white/35 hover:border-white/25 hover:text-white/55'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Prep time */}
            <div className="space-y-2">
              <p className="font-mono text-[9px] tracking-[0.16em] uppercase text-white/25">
                Preparation time
              </p>
              <div className="flex gap-2 flex-wrap">
                {prepOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setPrep(opt.value)}
                    className={`font-mono text-[10px] tracking-wide px-4 py-2 border transition-all ${
                      prep === opt.value
                        ? 'border-gold bg-gold text-ink font-medium'
                        : 'border-white/10 text-white/35 hover:border-white/25 hover:text-white/55'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* CTA */}
          <button
            onClick={handleStart}
            className="w-full font-mono text-[11px] tracking-[0.15em] uppercase py-4 bg-gold text-ink font-medium hover:bg-gold/90 transition-all"
          >
            Start Session →
          </button>

          <p className="font-mono text-[9px] text-white/15 text-center tracking-wide">
            Or go to the full trainer to choose from 85 topics and generate custom ones
            <Link href="/train" className="text-white/25 hover:text-white/40 ml-1 transition-colors">
              Open trainer →
            </Link>
          </p>

        </div>
      </div>

    </main>
  )
}