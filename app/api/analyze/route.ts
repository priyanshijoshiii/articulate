import Groq from 'groq-sdk'
import { NextRequest, NextResponse } from 'next/server'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { transcript, duration, targetDuration, topic } = await request.json()

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
        content: `You are an expert speech coach and subject matter expert. You analyze impromptu speaking sessions and give brutally honest, highly personalized feedback.
    
    You will receive a transcript, the topic the speaker was given, and session stats. Return ONLY a valid JSON object — no explanation, no markdown, no backticks.
    
    Return exactly this shape:
    {
      "overallScore": <number 1-10>,
      "clarity": <number 1-10>,
      "coherence": <number 1-10>,
      "grammarIssues": <number>,
      "topicClarity": <string — 2-3 sentences: did they actually address the topic? what was their core argument?>,
      "knowledgeGaps": [<string>, <string>, <string>],
      "articulationReport": <string — 3-4 sentences: specific observations about HOW they spoke, not what they said. mention actual phrases they used, sentence patterns, vocabulary choices>,
      "suggestions": [<string>, <string>, <string>],
      "grammarCorrections": [<string>]
    }
    
    Rules:
    - topicClarity: be specific about what argument or point they made. quote their actual words if relevant.
    - knowledgeGaps: list 3 specific facts, angles, or perspectives they missed that would have strengthened their answer on THIS topic
    - articulationReport: reference actual phrases from their transcript. mention if they repeated words, used passive voice, had strong openings, weak conclusions etc.
    - suggestions: make each one a concrete action tied to something specific they said or missed — not generic advice
    - overallScore: be honest. a 7 means genuinely good. most first attempts are 4-6.`,
      },
      {
        role: 'user',
        content: `Topic given to speaker: "${topic || 'General impromptu speech'}"
    
    Transcript:
    "${transcript}"
    
    Session stats:
    - Speaking duration: ${Math.round(duration)} seconds
    - Target duration: ${targetDuration} seconds
    - Words per minute: ${wpm}
    - Filler words detected: ${fillerCount} (${foundFillers.join(', ') || 'none'})
    - Total words spoken: ${words}`,
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
      topicClarity: (aiData.topicClarity as string) || null,
      knowledgeGaps: (aiData.knowledgeGaps as string[])?.length ? aiData.knowledgeGaps : null,
      articulationReport: (aiData.articulationReport as string) || null,
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