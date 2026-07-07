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
    // Mobile browsers may send different mime types
    // Rename to .wav as a fallback so Whisper accepts it
    const audioBuffer = await audioFile.arrayBuffer()
    const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' })
    const file = new File([audioBlob], 'recording.wav', { type: 'audio/wav' })

    const transcription = await groq.audio.transcriptions.create({
      file: file,
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
    console.error('Error:', error)
    const isRateLimit = error instanceof Error && 
      (error.message.includes('rate') || error.message.includes('429'))
    return NextResponse.json(
      { 
        error: isRateLimit ? 'rate_limit' : 'failed',
        message: isRateLimit 
          ? 'High demand right now — please try again in a moment.' 
          : 'Something went wrong.'
      },
      { status: isRateLimit ? 429 : 500 }
    )
  }
}