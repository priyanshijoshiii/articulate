'use client'

import { useState } from 'react'

type Category = 'all' | 'society' | 'tech' | 'personal' | 'hypothetical' | 'debate' | 'philosophy' | 'economics' | 'science' | 'leadership' | 'india'

interface Topic {
  text: string
  category: Exclude<Category, 'all'>
}

interface TopicCardProps {
  onTopicChange?: (topic: Topic) => void
  disabled?: boolean
  initialTopic?:string
}

const topics: Record<Exclude<Category, 'all'>, string[]> = {
  society: [
    'Is social media making us more connected or more isolated?',
    'Should voting be mandatory in a democracy?',
    'Has globalization done more harm than good?',
    'Is cancel culture a force for accountability or a threat to free speech?',
    'What is the biggest challenge facing your generation?',
    'Should university education be free for everyone?',
  ],
  tech: [
    'Will artificial intelligence create more jobs than it destroys?',
    'Should there be an international treaty governing autonomous weapons?',
    'Is our increasing dependence on smartphones a public health crisis?',
    'How should we regulate deepfakes and synthetic media?',
    'Is the metaverse the future of human interaction, or a distraction?',
    'Should tech companies be broken up to prevent monopolies?',
    'What is the ethical responsibility of an AI researcher?',
  ],
  personal: [
    'Describe a failure that ultimately made you stronger.',
    'What skill do you wish you had learned earlier in life?',
    'Talk about a time you had to change your mind about something important.',
    'What does success mean to you and has that definition changed?',
    'Describe the most important lesson you learned from someone unexpected.',
    'What habit has had the most positive impact on your life?',
    'If you could give your younger self one piece of advice, what would it be?',
  ],
  hypothetical: [
    'If you could eliminate one human emotion, which would you choose and why?',
    'Imagine a world without money. How would society function?',
    'If you had to live without the internet for one year, what would change?',
    'If you could speak to every person on Earth for five minutes, what would you say?',
    'If failure was impossible, what would you attempt?',
    'If you could go back in history and witness one event, which would it be?',
  ],
  debate: [
    'Zoos should be abolished entirely.',
    'Remote work is better for productivity than office work.',
    'Teenagers should be allowed to vote.',
    'Space exploration is a waste of resources.',
    'Humans are inherently selfish.',
    'Celebrities have a responsibility to be role models.',
    'Privacy is more important than security.',
  ],
  philosophy: [
    'Is free will an illusion?',
    'Can morality exist without religion?',
    'Is happiness a choice or a circumstance?',
    'What is the purpose of suffering?',
    'Do we have obligations to future generations?',
    'Is it ever justified to lie for a good outcome?',
    'Does absolute power always corrupt absolutely?',
  ],
  economics: [
    'Should there be a universal basic income?',
    'Is capitalism the best economic system we have?',
    'Should inheritance be taxed heavily?',
    'Does foreign aid do more harm than good?',
    'Is automation a threat or an opportunity for workers?',
    'Should the minimum wage be significantly higher?',
  ],
  science: [
    'Should human cloning be permitted for medical research?',
    'Is colonizing Mars a priority or a distraction?',
    'Should we pursue radical life extension?',
    'Is nuclear energy the solution to climate change?',
    'Should gene editing in human embryos be allowed?',
    'Is science moving faster than our ethical frameworks can handle?',
  ],
  leadership: [
    'What makes a great leader?',
    'Is hustle culture toxic or necessary?',
    'Should a four-day work week be standard?',
    'Can you be both ethical and successful in business?',
    'Is entrepreneurship overrated?',
    'Should CEOs be paid more than 100 times their average employee?',
  ],
  india: [
    'Should reservations in education be based on economic status rather than caste?',
    'Is India ready to be a global superpower?',
    'Should English be replaced as the medium of instruction in Indian schools?',
    'Is cricket given too much importance in India?',
    'Should startups be taxed differently than established corporations in India?',
    'Is brain drain a problem or an opportunity for India?',
  ],
}

const categories: Exclude<Category, 'all'>[] = [
  'society', 'tech', 'personal', 'hypothetical', 'debate',
  'philosophy', 'economics', 'science', 'leadership', 'india'
]

export default function TopicCard({ onTopicChange, disabled = false, initialTopic }: TopicCardProps) {
  const [activeCategory, setActiveCategory] = useState<Category>('all')
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(
    initialTopic ? { text: initialTopic, category: 'society' } : null
  )
  const [isAIGenerated, setIsAIGenerated] = useState(!!initialTopic)
  const [lastSearchedSubject, setLastSearchedSubject] = useState<string>('')
  const [topicCount, setTopicCount] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate')
  

  function generateTopic() {
    if (disabled) return
    setIsAIGenerated(false)
    const pool: Topic[] =
      activeCategory === 'all'
        ? categories.flatMap(cat =>
            topics[cat].map(text => ({ text, category: cat }))
          )
        : topics[activeCategory].map(text => ({
            text,
            category: activeCategory as Exclude<Category, 'all'>,
          }))

    const picked = pool[Math.floor(Math.random() * pool.length)]

    setIsAnimating(true)
    setTimeout(() => {
      setCurrentTopic(picked)
      setTopicCount(prev => prev + 1)
      setIsAnimating(false)
      onTopicChange?.(picked)
    }, 150)
  }

  async function handleGenerateFromSearch() {
    if (disabled || !searchInput.trim() || isGenerating) return
    if (!searchInput.trim() || isGenerating) return
    setSearchError('')
    setIsGenerating(true)
    setLastSearchedSubject(searchInput.trim()) // save the subject

    try {
      const res = await fetch('/api/generate-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: searchInput.trim(), difficulty }),
      })

    if (!res.ok) {
      const { message } = await res.json()
      setSearchError(message || 'Could not generate topic. Try again.')
      setIsGenerating(false)
      return
    }
    const { topic } = await res.json()

    setIsAnimating(true)
    setTimeout(() => {
      const generated: Topic = { text: topic, category: 'society' }
      setCurrentTopic(generated)
      setIsAIGenerated(true)  
      setTopicCount(prev => prev + 1)
      setIsAnimating(false)
      onTopicChange?.(generated)
      setSearchInput('')
    }, 150)

    } catch (err) {
      setSearchError('Could not generate topic. Try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleGenerateFromSubject(subject: string) {
    setSearchError('')
    setIsGenerating(true)

    try {
      const res = await fetch('/api/generate-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: subject, difficulty }),
      })

      if (!res.ok) {
        const { message } = await res.json()
        setSearchError(message || 'Could not generate topic. Try again.')
        setIsGenerating(false)
        return
      }

      const data = await res.json()
      const generatedText: string = data.topic

      setIsAnimating(true)
      setTimeout(() => {
        const generated: Topic = { text: generatedText, category: 'society' }
        setCurrentTopic(generated)
        setIsAIGenerated(true)
        setTopicCount(prev => prev + 1)
        setIsAnimating(false)
        onTopicChange?.(generated)
      }, 150)

    } catch {
      setSearchError('Could not generate topic. Try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleGenerateFromSearch()
  }

  return (
    <div className="space-y-3">
      {/* Difficulty selector */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-[9px] text-white/25 tracking-widest uppercase">Level</span>
        <div className="flex gap-1.5">
          {(['beginner', 'intermediate', 'advanced'] as const).map(level => (
            <button
              key={level}
              onClick={() => setDifficulty(level)}
              className={`font-mono text-[9px] tracking-wide uppercase px-3 py-1.5 border transition-all ${
                difficulty === level
                  ? level === 'beginner'
                    ? 'border-green-500/50 text-green-400 bg-green-500/10'
                    : level === 'intermediate'
                    ? 'border-gold/50 text-gold bg-gold/10'
                    : 'border-red-500/50 text-red-400 bg-red-500/10'
                  : 'border-white/10 text-white/25 hover:border-white/20 hover:text-white/40'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Search bar */}
      <div className="flex gap-2">
        <input
          type="text"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type any subject — cricket, climate, leadership..."
          className="flex-1 bg-white/[0.03] border border-white/10 px-4 py-2.5 font-mono text-[11px] text-white/70 placeholder:text-white/20 focus:outline-none focus:border-gold/40 transition-colors"
        />
        <button
          onClick={handleGenerateFromSearch}
          disabled={!searchInput.trim() || isGenerating || disabled}
          className="font-mono text-[10px] tracking-widest uppercase px-4 py-2.5 bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {isGenerating ? 'Generating...' : 'Generate →'}
        </button>
      </div>

      {searchError && (
        <p className="font-mono text-[10px] text-red-400">{searchError}</p>
      )}

      {/* Category filter chips */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveCategory('all')}
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
            onClick={() => setActiveCategory(cat)}
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
          onClick={() => {
            if (disabled) return
            if (isAIGenerated && lastSearchedSubject) {
              // regenerate on same subject
              setSearchInput(lastSearchedSubject)
              handleGenerateFromSubject(lastSearchedSubject)
            } else if (!isAIGenerated) {
              generateTopic()
            }
          }}
          className={`relative border border-gold-border bg-gold-dim p-7 min-h-[100px] flex items-center transition-all ${
            disabled
              ? 'opacity-60 cursor-not-allowed'
              : isAIGenerated
              ? 'cursor-default'
              : 'cursor-pointer hover:bg-gold/20'
          }`}
        >



        <div className="absolute left-0 top-0 w-[3px] h-full bg-gold" />

        {topicCount > 0 && (
          <span className="absolute top-3 right-4 font-mono text-[10px] text-gold/50">
            #{topicCount}
          </span>
        )}

        <p
          className={`font-serif text-2xl sm:text-3xl leading-relaxed transition-opacity duration-150 ${
            isAnimating ? 'opacity-0' : 'opacity-100'
          } ${currentTopic ? 'text-white/90' : 'text-white/30 italic text-base'}`}
        >
          {currentTopic
            ? currentTopic.text
            : 'Click to generate a topic, or type a subject above →'}
        </p>
      </div>

      <p className="font-mono text-[10px] text-white/40 tracking-wide">
        {isAIGenerated && lastSearchedSubject
          ? `↑ click card to generate another topic on "${lastSearchedSubject}"`
          : '↑ click card to shuffle from library · type above to generate with AI'
        }
      </p>

    </div>
  )
}