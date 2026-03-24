import mongoose, { Schema, Document } from 'mongoose'

export interface ISession extends Document {
  topic: string
  category: string
  transcript: string
  duration: number
  targetDuration: number
  overallScore: number
  wpm: number
  wordCount: number
  fillerWords: {
    count: number
    instances: string[]
  }
  grammarIssues: number
  clarity: number
  coherence: number
  topicClarity: string
  knowledgeGaps: string[]
  articulationReport: string
  suggestions: string[]
  createdAt: Date
}

const SessionSchema = new Schema<ISession>(
  {
    topic: { type: String, required: true },
    category: { type: String, default: 'general' },
    transcript: { type: String, required: true },
    duration: { type: Number, required: true },
    targetDuration: { type: Number, required: true },
    overallScore: { type: Number, required: true },
    wpm: { type: Number, required: true },
    wordCount: { type: Number, required: true },
    fillerWords: {
      count: { type: Number, default: 0 },
      instances: [{ type: String }],
    },
    grammarIssues: { type: Number, default: 0 },
    clarity: { type: Number, required: true },
    coherence: { type: Number, required: true },
    topicClarity: { type: String, default: '' },
    knowledgeGaps: [{ type: String }],
    articulationReport: { type: String, default: '' },
    suggestions: [{ type: String }],
  },
  {
    timestamps: true, // auto adds createdAt and updatedAt
  }
)

// Prevent model recompilation during hot reload
export default mongoose.models.Session ||
  mongoose.model<ISession>('Session', SessionSchema)