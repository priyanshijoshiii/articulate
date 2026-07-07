import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import mongoose from 'mongoose'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const FeedbackSchema = new mongoose.Schema({
  feedback: { type: String, required: true },
  userEmail: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
})

const Feedback = mongoose.models.Feedback || 
  mongoose.model('Feedback', FeedbackSchema)

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const authSession = await getServerSession(authOptions)
    const userEmail = authSession?.user?.email ?? ''

    const { feedback } = await request.json()

    if (!feedback?.trim()) {
      return NextResponse.json({ error: 'Empty feedback' }, { status: 400 })
    }

    if (feedback.length > 2000) {
      return NextResponse.json({ error: 'Feedback too long' }, { status: 400 })
    }

    await Feedback.create({ 
      feedback: feedback.trim(),
      userEmail,
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Feedback error:', error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}