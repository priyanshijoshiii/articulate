import Groq from 'groq-sdk'
import { NextRequest, NextResponse } from 'next/server'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { transcript, duration, targetDuration } = await request.json()

    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json(
        { error: 'No transcript provided' },
        { status: 400 }
      )
    }

    // Filler word detection
    const fillerWordList = ['um', 'uh', 'like', 'basically', 'literally',
      'you know', 'kind of', 'sort of', 'right', 'okay so', 'so yeah']

    const lowerTranscript = transcript.toLowerCase()
    const foundFillers: string[] = []
    let fillerCount = 0

    fillerWordList.forEach(filler => {
      const regex = new RegExp(`\\b${filler}\\b`, 'g')
      const matches = lowerTranscript.match(regex)
      if (matches) {
        fillerCount += matches.length
        foundFillers.push(filler)
      }
    })

    // WPM calculation
    const words = transcript.trim().split(/\s+/).length
    const wpm = Math.round(words / (duration / 60))

    // Llama analysis
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content: `You are a professional speech coach analyzing an impromptu speaking session.
You will receive a transcript and return ONLY a valid JSON object — no explanation, no markdown, no backticks.

Return exactly this shape:
{
  "overallScore": <number 1-10>,
  "clarity": <number 1-10>,
  "coherence": <number 1-10>,
  "grammarIssues": <number, count of grammar mistakes>,
  "suggestions": [<string>, <string>, <string>],
  "grammarCorrections": [<string>]
}`,
        },
        {
          role: 'user',
          content: `Analyze this impromptu speech transcript:

"${transcript}"

Speaking duration: ${Math.round(duration)} seconds
Target duration: ${targetDuration} seconds`,
        },
      ],
    })

    // Parse response safely
    const rawResponse = completion.choices[0].message.content ?? '{}'
    console.log('Raw AI response:', rawResponse)

    let aiData: Record<string, unknown> = {}

    try {
      const clean = rawResponse
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim()

      const jsonMatch = clean.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        aiData = JSON.parse(jsonMatch[0])
      }
    } catch (parseError) {
      console.error('JSON parse failed. Raw was:', rawResponse)
    }

    // Build final response
    const feedbackData = {
      overallScore: (aiData.overallScore as number) ?? 6,
      wpm,
      wordCount: words,
      fillerWords: {
        count: fillerCount,
        instances: foundFillers,
      },
      grammarIssues: (aiData.grammarIssues as number) ?? 0,
      clarity: (aiData.clarity as number) ?? 6,
      coherence: (aiData.coherence as number) ?? 6,
      speakingDuration: duration,
      targetDuration,
      suggestions: (aiData.suggestions as string[]) ?? [],
      transcript,
    }

    return NextResponse.json(feedbackData)

  } catch (error) {
    console.error('Analysis error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Analysis failed', detail: message },
      { status: 500 }
    )
  }
}