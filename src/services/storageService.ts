import type { AISettings, Language } from '../types'

const STORAGE_KEYS = {
  AI_SETTINGS: 'titan_track_ai_settings',
  LANGUAGE: 'titan_track_lang',
}

/**
 * Storage service for local preferences only.
 * Data (exercises, plans, entries) now comes from API via dataService.
 */
export const storageService = {
  // Language preference
  getLanguage: (): Language => {
    const lang = localStorage.getItem(STORAGE_KEYS.LANGUAGE)
    if (lang === 'zh' || lang === 'en') {
      return lang
    }
    return 'zh'
  },

  saveLanguage: (language: Language): void => {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, language)
  },

  // AI settings (local-only, not synced)
  getAISettings: (): AISettings | null => {
    const data = localStorage.getItem(STORAGE_KEYS.AI_SETTINGS)
    return data ? (JSON.parse(data) as AISettings) : null
  },

  saveAISettings: (settings: AISettings): void => {
    localStorage.setItem(STORAGE_KEYS.AI_SETTINGS, JSON.stringify(settings))
  },

  // Clear old data keys (for migration from localStorage to API)
  clearLegacyData: (): void => {
    localStorage.removeItem('titan_track_exercises')
    localStorage.removeItem('titan_track_logs')
    localStorage.removeItem('titan_track_plans')
    localStorage.removeItem('titan_track_sync_metadata')
    localStorage.removeItem('titan_track_pending_changes')
  },
}
