import { invoke } from '@tauri-apps/api/core'
import { INITIAL_EXERCISES } from '../constants'
import type { AISettings, Exercise, WorkoutEntry, WorkoutPlan } from '../types'

const isTauri = () => {
  try {
    return typeof window !== 'undefined' && '__TAURI__' in window
  } catch {
    return false
  }
}

const getLocalStorageItem = <T>(key: string, fallback: T): T => {
  const data = localStorage.getItem(key)
  return data ? (JSON.parse(data) as T) : fallback
}

const getOrInitLocalStorage = <T>(key: string, initial: T): T => {
  const data = localStorage.getItem(key)
  if (data) return JSON.parse(data) as T
  localStorage.setItem(key, JSON.stringify(initial))
  return initial
}

export const tauriStorageService = {
  getExercises: async (): Promise<Exercise[]> => {
    try {
      if (isTauri()) {
        const exercises = await invoke<Exercise[]>('get_exercises')
        if (exercises.length === 0) {
          await tauriStorageService.saveExercises(INITIAL_EXERCISES)
          return INITIAL_EXERCISES
        }
        return exercises
      }
      return getOrInitLocalStorage('titan_track_exercises', INITIAL_EXERCISES)
    } catch (error) {
      console.error('Failed to get exercises:', error)
      if (!isTauri()) {
        return getOrInitLocalStorage('titan_track_exercises', INITIAL_EXERCISES)
      }
      return INITIAL_EXERCISES
    }
  },

  saveExercises: async (exercises: Exercise[]): Promise<void> => {
    try {
      if (isTauri()) {
        await invoke('save_exercises', { exercises })
      } else {
        localStorage.setItem('titan_track_exercises', JSON.stringify(exercises))
      }
    } catch (error) {
      console.error('Failed to save exercises:', error)
      throw error
    }
  },

  getLogs: async (): Promise<WorkoutEntry[]> => {
    try {
      if (isTauri()) {
        return await invoke<WorkoutEntry[]>('get_logs')
      }
      return getLocalStorageItem('titan_track_logs', [])
    } catch (error) {
      console.error('Failed to get logs:', error)
      if (!isTauri()) {
        return getLocalStorageItem('titan_track_logs', [])
      }
      return []
    }
  },

  saveLogs: async (logs: WorkoutEntry[]): Promise<void> => {
    try {
      if (isTauri()) {
        await invoke('save_logs', { logs })
      } else {
        localStorage.setItem('titan_track_logs', JSON.stringify(logs))
      }
    } catch (error) {
      console.error('Failed to save logs:', error)
      throw error
    }
  },

  getPlans: async (): Promise<WorkoutPlan[]> => {
    try {
      if (isTauri()) {
        return await invoke<WorkoutPlan[]>('get_plans')
      }
      return getLocalStorageItem('titan_track_plans', [])
    } catch (error) {
      console.error('Failed to get plans:', error)
      if (!isTauri()) {
        return getLocalStorageItem('titan_track_plans', [])
      }
      return []
    }
  },

  savePlans: async (plans: WorkoutPlan[]): Promise<void> => {
    try {
      if (isTauri()) {
        await invoke('save_plans', { plans })
      } else {
        localStorage.setItem('titan_track_plans', JSON.stringify(plans))
      }
    } catch (error) {
      console.error('Failed to save plans:', error)
      throw error
    }
  },

  getAISettings: async (): Promise<AISettings | null> => {
    try {
      if (isTauri()) {
        return await invoke<AISettings | null>('get_ai_settings')
      }
      return getLocalStorageItem<AISettings | null>('titan_track_ai_settings', null)
    } catch (error) {
      console.error('Failed to get AI settings:', error)
      return null
    }
  },

  saveAISettings: async (settings: AISettings): Promise<void> => {
    try {
      if (isTauri()) {
        await invoke('save_ai_settings', { settings })
      } else {
        localStorage.setItem('titan_track_ai_settings', JSON.stringify(settings))
      }
    } catch (error) {
      console.error('Failed to save AI settings:', error)
      throw error
    }
  },
}
