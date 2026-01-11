export type MuscleGroup =
  | 'Chest'
  | 'Back'
  | 'Legs'
  | 'Shoulders'
  | 'Arms'
  | 'Core'
  | 'Full Body'
  | 'Cardio'

export type Language = 'zh' | 'en'

export interface Exercise {
  id: string
  name: string
  muscleGroup: MuscleGroup
  equipment: string
  notes?: string
  personalBest?: number
}

export interface WorkoutSet {
  id: string
  weight: number
  reps?: number
  timeMinutes?: number
  distance?: number
  rpe?: number
  notes?: string
  completed?: boolean
}

export interface WorkoutPlan {
  id: string
  date: string
  title: string
  tags: string[]
  exercises: {
    exerciseId: string
    sets: WorkoutSet[]
  }[]
  isCompleted?: boolean
  createdAt?: string
}

export interface WorkoutEntry {
  id: string
  date: string
  exerciseId: string
  workoutType: string
  sets: WorkoutSet[]
  planId?: string // Link to the plan if applicable
}

export const TabType = {
  DASHBOARD: 'DASHBOARD',
  WORKOUT_LOG: 'WORKOUT_LOG',
  PLAN: 'PLAN',
  AI_COACH: 'AI_COACH',
} as const

export type TabType = (typeof TabType)[keyof typeof TabType]

export interface NavigationParams {
  date?: string
  [key: string]: unknown
}

// AI Settings
export type AIProvider = 'openai' | 'anthropic' | 'gemini' | 'deepseek'

export interface AISettings {
  provider: AIProvider
  apiKey: string
  model?: string
}

export interface AIRequestMessage {
  role: 'user' | 'assistant'
  content: string
}

export const AI_MODELS: Record<AIProvider, string[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
  anthropic: ['claude-sonnet-4-20250514', 'claude-3-5-haiku-20241022'],
  gemini: ['gemini-2.0-flash', 'gemini-2.5-pro-preview-06-05'],
  deepseek: ['deepseek-chat', 'deepseek-reasoner'],
}

export const DEFAULT_MODELS: Record<AIProvider, string> = {
  openai: 'gpt-4o-mini',
  anthropic: 'claude-3-5-haiku-20241022',
  gemini: 'gemini-2.0-flash',
  deepseek: 'deepseek-chat',
}
