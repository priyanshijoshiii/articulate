# Articulate — AI-Powered Impromptu Speaking Trainer

> Practice thinking and speaking on the spot. Get real AI feedback on your articulation, grammar, clarity, and speaking habits.

![Next.js](https://img.shields.io/badge/Next.js_14-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/sTailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Groq](https://img.shields.io/badge/Groq_AI-F55036?style=flat)

---

## What it does

Articulate forces you to think and speak on the spot — the single most effective way to improve communication skills. You get a random topic, a few seconds to prepare, then you speak. When you're done, AI analyzes everything: your transcript, grammar, filler words, speaking pace, clarity, and coherence. Then it tells you exactly how to improve.

---

## Features

- **35 curated topics** across 5 categories — Society, Tech, Personal, Hypothetical, Debate
- **Configurable sessions** — 1, 2, 3, or 5 minute durations with optional 10–60 second prep time
- **Live voice recording** via the browser's MediaRecorder API with real-time waveform visualizer
- **Speech-to-text** powered by Groq's Whisper Large v3 — a 2-minute recording transcribes in ~2 seconds
- **AI feedback** powered by Llama 3.3 70B — grammar analysis, clarity score, coherence score, and 3 actionable suggestions
- **Calculated metrics** — words per minute, filler word detection, time coverage, word count
- **Audio playback** — listen back to your recording after each session

---

## Tech stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 14 (App Router) | Pages, routing, server components |
| UI | React + TypeScript | Component architecture, type safety |
| Styling | Tailwind CSS + CSS variables | Utility classes + custom design tokens |
| Speech-to-text | Groq — Whisper Large v3 | Fast, accurate audio transcription |
| AI analysis | Groq — Llama 3.3 70B | Grammar, clarity, feedback generation |
| Deployment | Vercel | Automatic deploys from GitHub |

---

## Getting started

### Prerequisites

- Node.js 18 or higher
- A free [Groq API key](https://console.groq.com)

### Installation

```bash
# Clone the repository
git clone https://github.com/priyanshijoshiii/articulate.git
cd articulate

# Install dependencies
npm install

# Create your environment file
cp .env.example .env.local
```

Open `.env.local` and add your Groq API key:

```
GROQ_API_KEY=your_key_here
```

```bash
# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## How it works

```
User speaks
    ↓
MediaRecorder API captures audio as .webm blob
    ↓
POST /api/transcribe — Groq Whisper Large v3
    ↓
Transcript text
    ↓
POST /api/analyze — Llama 3.3 70B + local calculations
    ↓
FeedbackData: score, WPM, filler words, grammar, suggestions
    ↓
FeedbackPanel renders results
```

The frontend never touches the API keys — all Groq calls happen inside Next.js API routes on the server.

---

## Project structure

```
articulate/
├── app/
│   ├── page.tsx              # Main page — holds all shared state
│   ├── layout.tsx            # Root layout, font loading
│   ├── globals.css           # Global styles
│   └── api/
│       ├── transcribe/
│       │   └── route.ts      # Groq Whisper endpoint
│       └── analyze/
│           └── route.ts      # Llama analysis endpoint
├── components/
│   ├── TopicCard.tsx         # Topic generator with category filter
│   ├── Timer.tsx             # Countdown timer with think phase
│   ├── Recorder.tsx          # Voice recording + waveform visualizer
│   └── FeedbackPanel.tsx     # AI feedback display
└── tailwind.config.ts        # Design tokens — gold, ink, custom fonts
```

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | Yes | Your Groq API key from console.groq.com |

---

## Roadmap

- [x] Topic generator with category filter
- [x] Configurable timer with think phase
- [x] Voice recording with live waveform
- [x] Groq Whisper speech-to-text
- [x] Llama 3.3 AI feedback — grammar, clarity, suggestions
- [ ] MongoDB session history
- [ ] Progress tracking — WPM trends, score over time
- [ ] User accounts
- [ ] Streak counter and gamification
- [ ] Mobile app

---

## API reference

### POST `/api/transcribe`

Accepts a `multipart/form-data` request with an `audio` file field. Returns the transcript.

```json
// Response
{
  "transcript": "I think social media has fundamentally changed..."
}
```

### POST `/api/analyze`

Accepts JSON with `transcript`, `duration`, and `targetDuration`. Returns full feedback.

```json
// Request
{
  "transcript": "I think social media...",
  "duration": 120,
  "targetDuration": 120
}

// Response
{
  "overallScore": 7,
  "wpm": 134,
  "wordCount": 268,
  "fillerWords": { "count": 3, "instances": ["um", "like"] },
  "grammarIssues": 2,
  "clarity": 8,
  "coherence": 7,
  "suggestions": ["..."],
  "transcript": "..."
}
```

---

## Design system

The UI follows a "Bloomberg terminal meets Moleskine notebook" aesthetic — built for focus, not decoration.

| Token | Value | Usage |
|---|---|---|
| `ink` | `#080808` | Page background |
| `gold` | `#C8922A` | Accents, active states, scores |
| `font-mono` | IBM Plex Mono | Labels, timers, data |
| `font-serif` | Playfair Display | Topic text, headings |
| `font-sans` | IBM Plex Sans | Body text |

---

## License

MIT — free to use, modify, and deploy.

---

Built by [Priyanshi Joshi](https://github.com/priyanshijoshiii)