'use client'

import { useState, useRef, useEffect } from 'react'

// --- Types ---
type RecordingState = 'idle' | 'recording' | 'stopped'

interface RecorderProps {
  phase: 'idle' | 'thinking' | 'speaking' | 'done'
  onRecordingComplete: (blob: Blob, durationSeconds: number) => void
}

// --- Component ---
export default function Recorder({ phase, onRecordingComplete }: RecorderProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [volume, setVolume] = useState(0)

  // Refs — these hold values that DON'T trigger re-renders when they change
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animFrameRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)

  // --- Auto start/stop based on phase ---
  useEffect(() => {
    if (phase === 'speaking') {
      startRecording()
    }
    if ((phase === 'done' || phase === 'idle') && recordingState === 'recording') {
      stopRecording()
    }
  }, [phase])

  // --- Cleanup on unmount ---
  useEffect(() => {
    return () => {
      stopStream()
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [])

  // --- Core recording logic ---
  async function startRecording() {
    chunksRef.current = []
    setAudioUrl(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Set up audio analyser for the volume visualizer
      const audioCtx = new AudioContext()
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser
      trackVolume()

      // Set up MediaRecorder
      const recorder = new MediaRecorder(stream, { mimeType: getSupportedMimeType() })
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: getSupportedMimeType() })
        const url = URL.createObjectURL(blob)
        const duration = (Date.now() - startTimeRef.current) / 1000

        setAudioUrl(url)
        setRecordingState('stopped')
        onRecordingComplete(blob, duration)
        stopStream()
      }

      recorder.start(100) // collect data every 100ms
      startTimeRef.current = Date.now()
      setRecordingState('recording')
      setPermissionDenied(false)

    } catch (err) {
      setPermissionDenied(true)
      console.error('Microphone error:', err)
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop()
    }
  }

  function stopStream() {
    streamRef.current?.getTracks().forEach(track => track.stop())
    cancelAnimationFrame(animFrameRef.current)
    setVolume(0)
  }

  // --- Volume tracking for waveform bars ---
  function trackVolume() {
    const analyser = analyserRef.current
    if (!analyser) return

    const data = new Uint8Array(analyser.frequencyBinCount)

    function tick() {
      analyser.getByteFrequencyData(data)
      const avg = data.reduce((a, b) => a + b, 0) / data.length
      setVolume(Math.min(avg / 60, 1)) // normalize 0–1
      animFrameRef.current = requestAnimationFrame(tick)
    }

    tick()
  }

  // --- Pick the best supported audio format ---
  function getSupportedMimeType(): string {
    const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg', 'audio/mp4']
    return types.find(t => MediaRecorder.isTypeSupported(t)) ?? ''
  }

  return (
    <div className="space-y-4">

      {/* Permission denied warning */}
      {permissionDenied && (
        <div className="border border-red-500/30 bg-red-500/5 px-4 py-3">
          <p className="font-mono text-[11px] text-red-400 tracking-wide">
            Microphone access denied. Please allow microphone access in your browser settings and try again.
          </p>
        </div>
      )}

      {/* Recording indicator */}
      {recordingState === 'recording' && (
        <div className="border border-red-500/20 bg-red-500/5 px-4 py-3 flex items-center gap-4">

          {/* Pulsing dot */}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>

          <span className="font-mono text-[10px] tracking-widest uppercase text-red-400">
            Recording
          </span>

          {/* Live waveform bars */}
          <div className="flex items-center gap-[3px] h-4">
            {Array.from({ length: 9 }).map((_, i) => {
              // Each bar gets a slightly different height based on volume + offset
              const offset = Math.sin((Date.now() / 200) + i) * 0.3
              const height = recordingState === 'recording'
                ? Math.max(0.15, Math.min(1, volume + offset))
                : 0.15
              return (
                <div
                  key={i}
                  className="w-[2px] bg-red-400 rounded-full transition-all duration-75"
                  style={{ height: `${height * 16}px` }}
                />
              )
            })}
          </div>

        </div>
      )}

      {/* Audio playback — shown after recording stops */}
      {audioUrl && recordingState === 'stopped' && (
        <div className="space-y-2">
          <p className="font-mono text-[9px] tracking-widest uppercase text-white/30">
            Your Recording
          </p>
          <audio
            controls
            src={audioUrl}
            className="w-full h-8 opacity-60 hover:opacity-100 transition-opacity"
          />
        </div>
      )}

      {/* Idle state — only show when waiting */}
      {recordingState === 'idle' && !permissionDenied && (
        <div className="border border-white/5 px-4 py-3">
          <p className="font-mono text-[10px] text-white/20 tracking-wide">
            Recording will start automatically when session begins
          </p>
        </div>
      )}

    </div>
  )
}