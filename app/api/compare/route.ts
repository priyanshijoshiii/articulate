import Groq from 'groq-sdk'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { originalTranscript, newTranscript, originalScore, newScore, topic } = await request.json()

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content: `You are a speech coach comparing two attempts at the same topic.
Return ONLY a valid JSON object with no markdown or backticks:
{
  "improvement": <string — 2-3 sentences specifically about what improved between attempt 1 and attempt 2>,
  "stillNeeds": <string — 1-2 sentences about what still needs work>,
  "verdict": <string — one punchy encouraging sentence>
}`,
        },
        {
          role: 'user',
          content: `Topic: "${topic}"

Attempt 1 (score ${originalScore}/10):
"${originalTranscript}"

Attempt 2 (score ${newScore}/10):
"${newTranscript}"`,
        },
      ],
    })

    const raw = completion.choices[0].message.content ?? '{}'
    const clean = raw.replace(/```json|```/g, '').trim()
    const jsonMatch = clean.match(/\{[\s\S]*\}/)
    const data = jsonMatch ? JSON.parse(jsonMatch[0]) : {}

    return NextResponse.json(data)

  } catch (error) {
    console.error('Compare error:', error)
    return NextResponse.json({ error: 'Comparison failed' }, { status: 500 })
  }
}