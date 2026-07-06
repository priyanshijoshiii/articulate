# Articulate: AI-Powered Impromptu Speaking Trainer

> Impromptu speaking trainer with real-time speech analysis built using Next.js, TypeScript, Groq Whisper, and Llama.

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

- **Google authentication** via NextAuth.js
- **85 curated topics** across 10 categories — Society, Tech, Personal, Hypothetical, Debate, Philosophy, Economics, Science, Leadership, India
- **AI topic generation** — type any subject and get a tailored, thought-provoking question with difficulty levels (Beginner, Intermediate, Advanced)
- **Gibberish filter** — detects and rejects keyboard mashing before hitting the API
- **Configurable sessions** — 1, 2, 3, or 5 minute durations with optional 10–60 second prep time
- **Topic freeze** — topic card locks during an active session, prevents mid-session shuffling
- **Live voice recording** via MediaRecorder API with real-time waveform visualizer
- **Speech-to-text** powered by Groq Whisper Large v3 — transcribes 2 minutes of audio in ~2 seconds
- **Hallucination guard** — rejects silent or too-short recordings before sending to AI
- **Personalized AI feedback** powered by Llama on Groq:
  - Topic clarity — did you actually address the topic?
  - Knowledge gaps — specific angles and facts you missed
  - Articulation report — observations about your actual speech patterns
  - Grammar issues, filler word count, WPM, time coverage score
- **Session history** — every session saved to MongoDB, viewable with full expandable details
- **Progress stats** — total sessions, average score, best score

---

## Tech stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 14 (App Router) | Pages, routing, API routes |
| UI | React + TypeScript | Component architecture, type safety |
| Styling | Tailwind CSS + CSS variables | Utility classes + custom design tokens |
| Auth | NextAuth.js + Google OAuth | User authentication |
| Speech-to-text | Groq — Whisper Large v3 | Fast, accurate audio transcription |
| AI analysis + topic gen | Groq — Llama 3.3 70B | Personalized speech feedback, topic generation |
| Database | MongoDB Atlas + Mongoose | Session persistence |
| Deployment | Vercel | Automatic deploys from GitHub |

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
POST /api/analyze — Llama 3.3 70B + local calculations
    ↓
FeedbackData: score, WPM, filler words, topic clarity,
knowledge gaps, articulation report, suggestions
    ↓
POST /api/sessions — saved to MongoDB with user email
    ↓
FeedbackPanel renders results
```

All Groq and database calls happen inside Next.js API routes — API keys never exposed to the browser.

---

## Project structure

```
articulate/
├── app/
│   ├── page.tsx              # Main trainer page
│   ├── layout.tsx            # Root layout, fonts, session provider
│   ├── globals.css           # Global styles
│   ├── login/
│   │   └── page.tsx          # Google sign-in page
│   ├── history/
│   │   └── page.tsx          # Session history page
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts  # NextAuth config
│       ├── transcribe/
│       │   └── route.ts      # Groq Whisper endpoint
│       ├── analyze/
│       │   └── route.ts      # Llama analysis endpoint
│       ├── generate-topic/
│       │   └── route.ts      # AI topic generation endpoint
│       └── sessions/
│           └── route.ts      # MongoDB session save/fetch
├── components/
│   ├── TopicCard.tsx         # Topic generator, category filter, AI generation
│   ├── Timer.tsx             # Countdown timer with think phase
│   ├── Recorder.tsx          # Voice recording + waveform visualizer
│   ├── FeedbackPanel.tsx     # AI feedback display
│   └── Providers.tsx         # NextAuth session provider wrapper
└── lib/
    ├── auth.ts               # NextAuth options
    ├── mongodb.ts            # Database connection with caching
    └── models/
        └── Session.ts        # Mongoose session schema
```

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | Yes | Groq API key from console.groq.com |
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `NEXTAUTH_URL` | Yes | Your app URL |
| `NEXTAUTH_SECRET` | Yes | Random secret for session encryption |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |

---

## Getting started

```bash
git clone https://github.com/priyanshijoshiii/articulate.git
cd articulate
npm install
cp .env.example .env.local
# fill in .env.local with your credentials
npm run dev
```

---

## Roadmap

- [x] Topic generator with category filter
- [x] AI topic generation with difficulty levels
- [x] Gibberish detection
- [x] Configurable timer with think phase
- [x] Voice recording with live waveform
- [x] Groq Whisper speech-to-text
- [x] Hallucination guard for silent recordings
- [x] Personalized AI feedback
- [x] MongoDB session persistence
- [x] Google authentication
- [x] Session history page
- [ ] Progress tracking — score trends, WPM over time
- [ ] Mobile app

---

## License

MIT License — Copyright (c) 2025 Priyanshi Joshi

---

Built by [Priyanshi Joshi](https://github.com/priyanshijoshiii)