# Articulate: Impromptu Speaking Trainer

> Impromptu speaking trainer with real-time speech analysis built using Next.js, TypeScript, Groq Whisper, and Qwen.

![Next.js](https://img.shields.io/badge/Next.js_14-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Groq](https://img.shields.io/badge/Groq_AI-F55036?style=flat)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)

---

## What it does

Articulate forces you to think and speak on the spot. You get a random topic, a few seconds to prepare, then you speak. When you're done, AI analyzes everything: your transcript, grammar, filler words, speaking pace, clarity, coherence, and whether you actually addressed the topic. Then it tells you exactly what to improve and what knowledge gaps to fill.

---

## Features

- **Google authentication** via NextAuth.js — sessions tied to your account
- **35 curated topics** across 5 categories — Society, Tech, Personal, Hypothetical, Debate
- **Configurable sessions** — 1, 2, 3, or 5 minute durations with optional 10-60 second prep time
- **Live voice recording** via MediaRecorder API with real-time waveform visualizer
- **Speech-to-text** powered by Groq Whisper Large v3 — transcribes 2 minutes of audio in ~2 seconds
- **Hallucination guard** — detects and rejects silent or too-short recordings before sending to AI
- **Personalized AI feedback** powered by Qwen on Groq:
  - Topic clarity — did you actually address the topic?
  - Knowledge gaps — what angles you missed
  - Articulation report — specific observations about your speech patterns
  - Grammar issues, filler word count, WPM, time coverage
- **Session persistence** — every session saved to MongoDB Atlas
- **Audio playback** — listen back to your recording after each session

---

## Tech stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 14 (App Router) | Pages, routing, API routes |
| UI | React + TypeScript | Component architecture, type safety |
| Styling | Tailwind CSS + CSS variables | Utility classes + custom design tokens |
| Auth | NextAuth.js + Google OAuth | User authentication |
| Speech-to-text | Groq — Whisper Large v3 | Fast, accurate audio transcription |
| AI analysis | Groq — Qwen QWQ 32B | Personalized speech feedback |
| Database | MongoDB Atlas + Mongoose | Session persistence |
| Deployment | Vercel | Automatic deploys from GitHub |

---

## Getting started

### Prerequisites

- Node.js 18 or higher
- A free [Groq API key](https://console.groq.com)
- A free [MongoDB Atlas](https://mongodb.com/atlas) cluster
- Google OAuth credentials from [Google Cloud Console](https://console.cloud.google.com)

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

Fill in `.env.local` with your credentials:

```
GROQ_API_KEY=your_groq_key
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
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
Hallucination guard — rejects if under 10 words
    ↓
POST /api/analyze — Qwen QWQ 32B + local calculations
    ↓
FeedbackData: score, WPM, filler words, topic clarity,
knowledge gaps, articulation report, suggestions
    ↓
POST /api/sessions — saved to MongoDB
    ↓
FeedbackPanel renders results
```

All Groq and database calls happen inside Next.js API routes — API keys are never exposed to the browser.

---

## Project structure

```
articulate/
├── app/
│   ├── page.tsx              # Main page — holds all shared state
│   ├── layout.tsx            # Root layout, font loading, session provider
│   ├── globals.css           # Global styles
│   ├── login/
│   │   └── page.tsx          # Google sign-in page
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts  # NextAuth configuration
│       ├── transcribe/
│       │   └── route.ts      # Groq Whisper endpoint
│       ├── analyze/
│       │   └── route.ts      # Qwen analysis endpoint
│       └── sessions/
│           └── route.ts      # MongoDB session save/fetch
├── components/
│   ├── TopicCard.tsx         # Topic generator with category filter
│   ├── Timer.tsx             # Countdown timer with think phase
│   ├── Recorder.tsx          # Voice recording + waveform visualizer
│   ├── FeedbackPanel.tsx     # AI feedback display
│   └── Providers.tsx         # NextAuth session provider wrapper
└── lib/
    ├── mongodb.ts            # Database connection with caching
    └── models/
        └── Session.ts        # Mongoose session schema
```

---

## Roadmap

- [x] Topic generator with category filter
- [x] Configurable timer with think phase
- [x] Voice recording with live waveform
- [x] Groq Whisper speech-to-text
- [x] Hallucination guard for silent recordings
- [x] Personalized AI feedback — topic clarity, knowledge gaps, articulation report
- [x] MongoDB session persistence
- [x] Google authentication
- [ ] Session history page — past sessions, score trends
- [ ] Progress tracking — WPM over time, streak counter
- [ ] Mobile app

---

## API reference

### POST `/api/transcribe`

Accepts `multipart/form-data` with an `audio` file field. Returns transcript or 422 if too short.

```json
{ "transcript": "I think social media has fundamentally changed..." }
```

### POST `/api/analyze`

Accepts JSON with `transcript`, `duration`, `targetDuration`, and `topic`. Returns full feedback.

```json
{
  "overallScore": 7,
  "wpm": 134,
  "wordCount": 268,
  "fillerWords": { "count": 3, "instances": ["um", "like"] },
  "grammarIssues": 2,
  "clarity": 8,
  "coherence": 7,
  "topicClarity": "The speaker addressed the core argument directly...",
  "knowledgeGaps": ["market concentration data", "historical precedents", "consumer impact studies"],
  "articulationReport": "Strong opening sentence. Repeated 'basically' three times...",
  "suggestions": ["...", "...", "..."],
  "transcript": "..."
}
```

### POST `/api/sessions`

Saves a completed session to MongoDB. GET returns last 50 sessions.

---

## License

MIT License

Copyright (c) 2025 Priyanshi Joshi

Permission is hereby granted, free of charge, to any person obtaining a copy of this software to use, copy, modify, merge, publish, distribute, and sublicense it, subject to the condition that the above copyright notice appears in all copies.

---

Built by [Priyanshi Joshi]