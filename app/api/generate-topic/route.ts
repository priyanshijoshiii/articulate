import Groq from 'groq-sdk'
import { NextRequest, NextResponse } from 'next/server'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { input } = await request.json()

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
      model: 'llama-3.1-8b-instant',
      temperature: 0.9,
      messages: [
        {
          role: 'system',
          content: `You are an expert debate coach and public speaking trainer. 
Your job is to generate ONE thought-provoking impromptu speaking topic based on the user's input.

Rules:
- Return ONLY the topic question, nothing else
- No preamble, no explanation, no quotation marks
- Make it specific, debatable, and genuinely challenging
- It should force the speaker to take a position and defend it
- Aim for topics that have no obvious right answer
- Keep it to one sentence ending with a question mark
- Make it relevant to the input but more nuanced and interesting than the obvious question`,
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