'use client'

import { useState } from 'react'

// --- Types ---
type Category = 'all' | 'society' | 'tech' | 'personal' | 'hypothetical' | 'debate'

interface Topic {
  text: string
  category: Exclude<Category, 'all'>
}

interface TopicCardProps {
  onTopicChange?: (topic: Topic) => void
}

// --- Topic data ---
const topics: Record<Exclude<Category, 'all'>, string[]> = {
  society: [
    'Is social media making us more connected or more isolated?',
    'Should voting be mandatory in a democracy?',
    'Has globalization done more harm than good?',
  ],
  tech: [
    'Will AI create more jobs than it destroys?',
    'Is our dependence on smartphones a public health crisis?',
    'Should tech companies be broken up to prevent monopolies?',
  ],
  personal: [
    'Describe a failure that ultimately made you stronger.',
    'What skill do you wish you had learned earlier?',
    'What does success mean to you?',
  ],
  hypothetical: [
    'If you could eliminate one human emotion, which would you choose?',
    'Imagine a world without money. How would society function?',
    'If failure was impossible, what would you attempt?',
  ],
  debate: [
    'Zoos should be abolished entirely.',
    'Remote work is better for productivity than office work.',
    'Space exploration is a waste of resources.',
  ],
}

const categories: Exclude<Category, 'all'>[] = [
  'society', 'tech', 'personal', 'hypothetical', 'debate'
]

// --- Component ---
export default function TopicCard({ onTopicChange }: TopicCardProps) {
  const [activeCategory, setActiveCategory] = useState<Category>('all')
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null)
  const [topicCount, setTopicCount] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  function generateTopic() {
    // Build pool based on active category
    const pool: Topic[] =
      activeCategory === 'all'
        ? categories.flatMap(cat =>
            topics[cat].map(text => ({ text, category: cat }))
          )
        : topics[activeCategory].map(text => ({
            text,
            category: activeCategory as Exclude<Category, 'all'>,
          }))

    // Pick random topic
    const picked = pool[Math.floor(Math.random() * pool.length)]

    // Animate out → update → animate in
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentTopic(picked)
      setTopicCount(prev => prev + 1)
      setIsAnimating(false)
      onTopicChange?.(picked)
    }, 150)
  }

  function handleCategoryClick(cat: Category) {
    setActiveCategory(cat)
  }

  return (
    <div className="space-y-3">

      {/* Category filter chips */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => handleCategoryClick('all')}
          className={`font-mono text-[10px] tracking-widest uppercase px-3 py-1.5 border transition-all ${
            activeCategory === 'all'
              ? 'border-gold text-gold bg-gold-dim'
              : 'border-white/10 text-white/30 hover:border-gold/50 hover:text-gold/70'
          }`}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            className={`font-mono text-[10px] tracking-widest uppercase px-3 py-1.5 border transition-all ${
              activeCategory === cat
                ? 'border-gold text-gold bg-gold-dim'
                : 'border-white/10 text-white/30 hover:border-gold/50 hover:text-gold/70'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Topic card */}
      <div
        onClick={generateTopic}
        className="relative border border-gold-border bg-gold-dim p-7 cursor-pointer hover:bg-gold/20 transition-all group min-h-[100px] flex items-center"
      >
        {/* Left accent bar */}
        <div className="absolute left-0 top-0 w-[3px] h-full bg-gold" />

        {/* Topic number badge */}
        {topicCount > 0 && (
          <span className="absolute top-3 right-4 font-mono text-[10px] text-gold/50">
            #{topicCount}
          </span>
        )}

        {/* Topic text */}
        <p
          className={`font-serif text-xl leading-relaxed transition-opacity duration-150 ${
            isAnimating ? 'opacity-0' : 'opacity-100'
          } ${currentTopic ? 'text-white/90' : 'text-white/30 italic text-base'}`}
        >
          {currentTopic
            ? currentTopic.text
            : 'Click to generate your first topic →'}
        </p>
      </div>

      {/* Hint */}
      <p className="font-mono text-[10px] text-white/20 tracking-wide">
        ↑ click the card to shuffle · category filter above
      </p>

    </div>
  )
}