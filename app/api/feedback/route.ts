import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import mongoose from 'mongoose'

const FeedbackSchema = new mongoose.Schema({
  feedback: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

const Feedback = mongoose.models.Feedback || 
  mongoose.model('Feedback', FeedbackSchema)

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    const { feedback } = await request.json()

    if (!feedback?.trim()) {
      return NextResponse.json({ error: 'Empty feedback' }, { status: 400 })
    }

    await Feedback.create({ feedback: feedback.trim() })
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Feedback error:', error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}