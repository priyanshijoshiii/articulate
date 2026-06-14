import Groq from 'groq-sdk'
import { NextRequest, NextResponse } from 'next/server'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    // 1. Get the audio blob from the request
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    // 2. Send to Groq Whisper for transcription
    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-large-v3',
      response_format: 'json',
      language: 'en',
    })

    // Hallucination guard
    const text = transcription.text?.trim() ?? ''
    const wordCount = text.split(/\s+/).filter(Boolean).length

    if (wordCount < 10) {
      return NextResponse.json(
        { error: 'Too short', message: 'Not enough speech detected. Please speak for at least 15 seconds.' },
        { status: 422 }
      )
    }

    // 3. Return the transcript
    return NextResponse.json({
      transcript: transcription.text,
    })

  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json(
      { error: 'Transcription failed' },
      { status: 500 }
    )
  }
}