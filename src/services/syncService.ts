import type { Exercise, WorkoutEntry, WorkoutPlan } from '../types'
import { apiService } from './apiService'
import { authService } from './authService'

const STORAGE_KEYS = {
  SYNC_METADATA: 'titan_track_sync_metadata',
  PENDING_CHANGES: 'titan_track_pending_changes',
  EXERCISES: 'titan_track_exercises',
  LOGS: 'titan_track_logs',
  PLANS: 'titan_track_plans',
}

interface SyncMetadata {
  lastSyncAt: string | null
  deviceId: string
}

interface SyncRequest {
  device_id: string
  last_sync_at: string | null
  exercises: Exercise[]
  workout_plans: WorkoutPlan[]
  workout_entries: WorkoutEntry[]
}

interface SyncResponse {
  server_time: string
  exercises: Exercise[]
  workout_plans: WorkoutPlan[]
  workout_entries: WorkoutEntry[]
  conflicts: Array<{
    entity_type: string
    id: string
    resolution: string
  }>
}

class SyncService {
  private deviceId: string
  private syncInProgress = false
  private syncDebounceTimer: ReturnType<typeof setTimeout> | null = null

  constructor() {
    this.deviceId = this.getOrCreateDeviceId()
  }

  private getOrCreateDeviceId(): string {
    const metadata = localStorage.getItem(STORAGE_KEYS.SYNC_METADATA)
    if (metadata) {
      try {
        const parsed = JSON.parse(metadata) as SyncMetadata
        return parsed.deviceId
      } catch {
        // Fall through to create new
      }
    }
    const deviceId = crypto.randomUUID()
    this.saveMetadata({ deviceId, lastSyncAt: null })
    return deviceId
  }

  private getMetadata(): SyncMetadata {
    const metadata = localStorage.getItem(STORAGE_KEYS.SYNC_METADATA)
    if (metadata) {
      try {
        return JSON.parse(metadata) as SyncMetadata
      } catch {
        // Fall through to default
      }
    }
    return { deviceId: this.deviceId, lastSyncAt: null }
  }

  private saveMetadata(metadata: SyncMetadata): void {
    localStorage.setItem(STORAGE_KEYS.SYNC_METADATA, JSON.stringify(metadata))
  }

  private getLocalExercises(): Exercise[] {
    const data = localStorage.getItem(STORAGE_KEYS.EXERCISES)
    return data ? (JSON.parse(data) as Exercise[]) : []
  }

  private getLocalPlans(): WorkoutPlan[] {
    const data = localStorage.getItem(STORAGE_KEYS.PLANS)
    return data ? (JSON.parse(data) as WorkoutPlan[]) : []
  }

  private getLocalEntries(): WorkoutEntry[] {
    const data = localStorage.getItem(STORAGE_KEYS.LOGS)
    return data ? (JSON.parse(data) as WorkoutEntry[]) : []
  }

  private saveLocalExercises(exercises: Exercise[]): void {
    localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises))
  }

  private saveLocalPlans(plans: WorkoutPlan[]): void {
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans))
  }

  private saveLocalEntries(entries: WorkoutEntry[]): void {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(entries))
  }

  /**
   * Schedule a sync after a debounce period
   */
  scheduleSync(delayMs = 5000): void {
    if (this.syncDebounceTimer) {
      clearTimeout(this.syncDebounceTimer)
    }
    this.syncDebounceTimer = setTimeout(() => {
      void this.sync()
    }, delayMs)
  }

  /**
   * Perform a full sync with the server
   */
  async sync(): Promise<{ success: boolean; conflicts: number }> {
    // Check if user is authenticated
    const token = await authService.getAccessToken()
    if (!token) {
      console.log('Not authenticated, skipping sync')
      return { success: false, conflicts: 0 }
    }

    // Check if online
    if (!navigator.onLine) {
      console.log('Offline, skipping sync')
      return { success: false, conflicts: 0 }
    }

    // Prevent concurrent syncs
    if (this.syncInProgress) {
      console.log('Sync already in progress')
      return { success: false, conflicts: 0 }
    }

    this.syncInProgress = true

    try {
      const metadata = this.getMetadata()

      const request: SyncRequest = {
        device_id: this.deviceId,
        last_sync_at: metadata.lastSyncAt,
        exercises: this.getLocalExercises(),
        workout_plans: this.getLocalPlans(),
        workout_entries: this.getLocalEntries(),
      }

      const response = await apiService.post<SyncResponse>('/api/v1/sync', request)

      // Apply server changes to localStorage
      this.saveLocalExercises(response.exercises)
      this.saveLocalPlans(response.workout_plans)
      this.saveLocalEntries(response.workout_entries)

      // Update sync metadata
      this.saveMetadata({
        deviceId: this.deviceId,
        lastSyncAt: response.server_time,
      })

      console.log(`Sync complete. ${String(response.conflicts.length)} conflicts resolved.`)

      return { success: true, conflicts: response.conflicts.length }
    } catch (error) {
      console.error('Sync failed:', error)
      return { success: false, conflicts: 0 }
    } finally {
      this.syncInProgress = false
    }
  }

  /**
   * Check if sync is needed (e.g., first time or stale data)
   */
  needsSync(): boolean {
    const metadata = this.getMetadata()
    if (!metadata.lastSyncAt) return true

    // Sync if last sync was more than 5 minutes ago
    const lastSync = new Date(metadata.lastSyncAt)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    return lastSync < fiveMinutesAgo
  }

  /**
   * Get the last sync timestamp
   */
  getLastSyncAt(): string | null {
    return this.getMetadata().lastSyncAt
  }

  /**
   * Clear sync metadata (for logout)
   */
  clearSyncData(): void {
    localStorage.removeItem(STORAGE_KEYS.SYNC_METADATA)
    localStorage.removeItem(STORAGE_KEYS.PENDING_CHANGES)
  }
}

export const syncService = new SyncService()
