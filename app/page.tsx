'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { redirect, useRouter } from 'next/navigation'
import Link from 'next/link'
import Footer from '@/components/Footer'

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
        <nav className="px-6 sm:px-10 py-5 flex justify-between items-center">
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
            <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="font-mono text-[10px] tracking-widest uppercase text-white/30 hover:text-white/50 transition-colors"
            >
            Sign out
            </button>
        </div>
        </nav>

        {/* Hero */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center space-y-7 pt-8">

        {/* Headline */}
        <div className="space-y-2">
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-gold/60">
            Impromptu Speaking Trainer
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl text-white/80 font-normal leading-snug">
            Think on your feet.<br />
            <span className="italic text-white/40">Get better every time.</span>
            </h2>
        </div>

        {/* Trainer link */}
        <p className="font-mono text-[11px] text-white/30 tracking-wide leading-loose">
          Pick a topic → speak → get feedback on exactly how you spoke
        </p>

        {/* CTA */}
        <div className="space-y-3">
          <Link
            href="/train"
            className="inline-block font-mono text-[11px] tracking-[0.15em] uppercase py-4 px-12 bg-gold text-ink font-medium hover:bg-gold/90 transition-all"
          >
            Get Started
          </Link>
            <p className="font-mono text-[10px] text-white/20 tracking-wide italic">
            ( remember you're a rockstar — you got this )
            </p>
        </div>

        </div>
        <Footer />
    </main>
    )
}