import { INITIAL_EXERCISES } from '../constants'
import type { AISettings, Exercise, WorkoutEntry, WorkoutPlan } from '../types'

const STORAGE_KEYS = {
  EXERCISES: 'titan_track_exercises',
  LOGS: 'titan_track_logs',
  PLANS: 'titan_track_plans',
  AI_SETTINGS: 'titan_track_ai_settings',
}

export const storageService = {
  getExercises: (): Exercise[] => {
    const data = localStorage.getItem(STORAGE_KEYS.EXERCISES)
    if (data) return JSON.parse(data) as Exercise[]
    localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(INITIAL_EXERCISES))
    return INITIAL_EXERCISES
  },
  saveExercises: (exercises: Exercise[]) => {
    localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises))
  },
  getLogs: (): WorkoutEntry[] => {
    const data = localStorage.getItem(STORAGE_KEYS.LOGS)
    return data ? (JSON.parse(data) as WorkoutEntry[]) : []
  },
  saveLogs: (logs: WorkoutEntry[]) => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs))
  },
  getPlans: (): WorkoutPlan[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PLANS)
    return data ? (JSON.parse(data) as WorkoutPlan[]) : []
  },
  savePlans: (plans: WorkoutPlan[]) => {
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans))
  },
  getAISettings: (): AISettings | null => {
    const data = localStorage.getItem(STORAGE_KEYS.AI_SETTINGS)
    return data ? (JSON.parse(data) as AISettings) : null
  },
  saveAISettings: (settings: AISettings) => {
    localStorage.setItem(STORAGE_KEYS.AI_SETTINGS, JSON.stringify(settings))
  },
}
