import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Session from '@/lib/models/Session'


// POST — save a new session
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const authSession = await getServerSession(authOptions)
    const userEmail = authSession?.user?.email ?? 'anonymous'    

    const body = await request.json()

    const session = await Session.create({
      userEmail,   
      topic: body.topic || 'Unknown topic',
      category: body.category || 'general',
      transcript: body.transcript || '',
      duration: body.duration,
      targetDuration: body.targetDuration,
      overallScore: body.overallScore,
      wpm: body.wpm,
      wordCount: body.wordCount,
      fillerWords: body.fillerWords,
      grammarIssues: body.grammarIssues,
      clarity: body.clarity,
      coherence: body.coherence,
      topicClarity: body.topicClarity || '',
      knowledgeGaps: body.knowledgeGaps || [],
      articulationReport: body.articulationReport || '',
      suggestions: body.suggestions || [],
    })

    return NextResponse.json({ success: true, id: session._id })

  } catch (error) {
    console.error('Save session error:', error)
    return NextResponse.json(
      { error: 'Failed to save session' },
      { status: 500 }
    )
  }
}

// GET — fetch all sessions, most recent first
export async function GET() {
  try {
    await connectToDatabase()

    const authSession = await getServerSession(authOptions)
    const userEmail = authSession?.user?.email ?? null

    if (!userEmail) {
      return NextResponse.json({ sessions: [] })
    }

    const sessions = await Session.find({ userEmail })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    return NextResponse.json({ sessions })

  } catch (error) {
    console.error('Fetch sessions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}