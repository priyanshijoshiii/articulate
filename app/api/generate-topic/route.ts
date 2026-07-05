import Groq from 'groq-sdk'
import { NextRequest, NextResponse } from 'next/server'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { input, difficulty = 'intermediate' } = await request.json()

    if (!input || input.trim().length < 2) {
      return NextResponse.json(
        { error: 'Input too short' },
        { status: 400 }
      )
    }

    // Gibberish detection
    const cleaned = input.trim().toLowerCase()

    // Check for repeated characters — "aaaa", "asdfgh"
    const hasRepeatedPattern = /^(.)\1+$/.test(cleaned)

    // Check for no vowels in a long word — likely gibberish
    const words = cleaned.split(/\s+/)
    const hasNoVowels = words.some(
    (word: string) => word.length > 3 && !/[aeiou]/.test(word)
    )

    // Check for keyboard mashing patterns
    const keyboardMash = /^[qwertasdfgzxcvb]{4,}$/i.test(cleaned.replace(/\s/g, ''))

    if (hasRepeatedPattern || hasNoVowels || keyboardMash) {
    return NextResponse.json(
        { error: 'Gibberish', message: 'Please enter a real subject — try "cricket", "climate", or "leadership".' },
        { status: 400 }
    )
    }    

    const completion = await groq.chat.completions.create({
      model: 'qwen/qwen3.6-27b',
      temperature: 0.9,
      messages: [
        {
            role: 'system',
            content: `You are an expert debate coach and public speaking trainer.
            Your job is to generate ONE impromptu speaking topic based on the user's input.

            Difficulty level: ${difficulty}

            Difficulty guidelines:
            - beginner: Simple, descriptive, personal questions. No strong position needed. Easy vocabulary. Example style: "What do you use X for and why do you enjoy it?"
            - intermediate: Requires forming an argument and some reasoning. Moderate complexity. Example style: "Has X changed society more positively or negatively?"
            - advanced: Abstract, complex, demands structured thinking. Requires deep knowledge or strong position. Example style: "Is X a symptom of a larger systemic issue in modern society?"

            Rules:
            - Return ONLY the topic question, nothing else
            - No preamble, no explanation, no quotation marks
            - Make it specific and genuinely challenging for the given difficulty
            - One sentence ending with a question mark`,
        },
        {
          role: 'user',
          content: `Generate an impromptu speaking topic about: ${input.trim()}`,
        },
      ],
      max_tokens: 100,
    })

    const topic = completion.choices[0].message.content?.trim() ?? ''

    if (!topic) {
      return NextResponse.json(
        { error: 'Failed to generate topic' },
        { status: 500 }
      )
    }

    return NextResponse.json({ topic })

  } catch (error) {
    console.error('Topic generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate topic' },
      { status: 500 }
    )
  }
}