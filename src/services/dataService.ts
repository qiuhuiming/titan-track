import type { Exercise, MuscleGroup, WorkoutEntry, WorkoutPlan } from '../types'
import { apiService } from './apiService'

// Backend API response types (snake_case)
interface ExerciseAPI {
  id: string
  user_id: string
  name: string
  muscle_group: string
  equipment: string
  notes: string | null
  personal_best: number | null
  updated_at: string
  created_at: string
  is_deleted: boolean
}

interface WorkoutPlanAPI {
  id: string
  user_id: string
  date: string
  title: string
  tags: string[]
  exercises: { exerciseId: string; sets: unknown[] }[]
  is_completed: boolean
  updated_at: string
  created_at: string
  is_deleted: boolean
}

interface WorkoutEntryAPI {
  id: string
  user_id: string
  date: string
  exercise_id: string
  workout_type: string
  sets: unknown[]
  plan_id: string | null
  updated_at: string
  created_at: string
  is_deleted: boolean
}

// Create/Update request types
interface ExerciseCreateAPI {
  id: string
  name: string
  muscle_group: string
  equipment: string
  notes?: string | null
  personal_best?: number | null
}

interface ExerciseUpdateAPI {
  name?: string
  muscle_group?: string
  equipment?: string
  notes?: string | null
  personal_best?: number | null
}

interface WorkoutPlanCreateAPI {
  id: string
  date: string
  title: string
  tags: string[]
  exercises: { exerciseId: string; sets: unknown[] }[]
  is_completed?: boolean
}

interface WorkoutPlanUpdateAPI {
  date?: string
  title?: string
  tags?: string[]
  exercises?: { exerciseId: string; sets: unknown[] }[]
  is_completed?: boolean
}

interface WorkoutEntryCreateAPI {
  id: string
  date: string
  exercise_id: string
  workout_type: string
  sets: unknown[]
  plan_id?: string | null
}

interface WorkoutEntryUpdateAPI {
  date?: string
  exercise_id?: string
  workout_type?: string
  sets?: unknown[]
  plan_id?: string | null
}

// Transform functions: API (snake_case) -> Frontend (camelCase)
function transformExercise(api: ExerciseAPI): Exercise {
  return {
    id: api.id,
    name: api.name,
    muscleGroup: api.muscle_group as MuscleGroup,
    equipment: api.equipment,
    notes: api.notes ?? undefined,
    personalBest: api.personal_best ?? undefined,
  }
}

function transformPlan(api: WorkoutPlanAPI): WorkoutPlan {
  return {
    id: api.id,
    date: api.date,
    title: api.title,
    tags: api.tags,
    exercises: api.exercises as WorkoutPlan['exercises'],
    isCompleted: api.is_completed,
    createdAt: api.created_at,
  }
}

function transformEntry(api: WorkoutEntryAPI): WorkoutEntry {
  return {
    id: api.id,
    date: api.date,
    exerciseId: api.exercise_id,
    workoutType: api.workout_type,
    sets: api.sets as WorkoutEntry['sets'],
    planId: api.plan_id ?? undefined,
  }
}

// Data Service - All API operations
export const dataService = {
  // ============ Exercises ============
  async getExercises(): Promise<Exercise[]> {
    const response = await apiService.get<ExerciseAPI[]>('/api/v1/exercises')
    return response.map(transformExercise)
  },

  async createExercise(exercise: Exercise): Promise<Exercise> {
    const payload: ExerciseCreateAPI = {
      id: exercise.id,
      name: exercise.name,
      muscle_group: exercise.muscleGroup,
      equipment: exercise.equipment,
      notes: exercise.notes,
      personal_best: exercise.personalBest,
    }
    const response = await apiService.post<ExerciseAPI>('/api/v1/exercises', payload)
    return transformExercise(response)
  },

  async updateExercise(id: string, updates: Partial<Omit<Exercise, 'id'>>): Promise<Exercise> {
    const payload: ExerciseUpdateAPI = {}
    if (updates.name !== undefined) payload.name = updates.name
    if (updates.muscleGroup !== undefined) payload.muscle_group = updates.muscleGroup
    if (updates.equipment !== undefined) payload.equipment = updates.equipment
    if (updates.notes !== undefined) payload.notes = updates.notes
    if (updates.personalBest !== undefined) payload.personal_best = updates.personalBest

    const response = await apiService.put<ExerciseAPI>(`/api/v1/exercises/${id}`, payload)
    return transformExercise(response)
  },

  async deleteExercise(id: string): Promise<void> {
    await apiService.delete(`/api/v1/exercises/${id}`)
  },

  // ============ Workout Plans ============
  async getPlans(): Promise<WorkoutPlan[]> {
    const response = await apiService.get<WorkoutPlanAPI[]>('/api/v1/plans')
    return response.map(transformPlan)
  },

  async createPlan(plan: WorkoutPlan): Promise<WorkoutPlan> {
    const payload: WorkoutPlanCreateAPI = {
      id: plan.id,
      date: plan.date,
      title: plan.title,
      tags: plan.tags,
      exercises: plan.exercises,
      is_completed: plan.isCompleted,
    }
    const response = await apiService.post<WorkoutPlanAPI>('/api/v1/plans', payload)
    return transformPlan(response)
  },

  async updatePlan(id: string, updates: Partial<Omit<WorkoutPlan, 'id'>>): Promise<WorkoutPlan> {
    const payload: WorkoutPlanUpdateAPI = {}
    if (updates.date !== undefined) payload.date = updates.date
    if (updates.title !== undefined) payload.title = updates.title
    if (updates.tags !== undefined) payload.tags = updates.tags
    if (updates.exercises !== undefined) payload.exercises = updates.exercises
    if (updates.isCompleted !== undefined) payload.is_completed = updates.isCompleted

    const response = await apiService.put<WorkoutPlanAPI>(`/api/v1/plans/${id}`, payload)
    return transformPlan(response)
  },

  async deletePlan(id: string): Promise<void> {
    await apiService.delete(`/api/v1/plans/${id}`)
  },

  // ============ Workout Entries ============
  async getEntries(): Promise<WorkoutEntry[]> {
    const response = await apiService.get<WorkoutEntryAPI[]>('/api/v1/entries')
    return response.map(transformEntry)
  },

  async createEntry(entry: WorkoutEntry): Promise<WorkoutEntry> {
    const payload: WorkoutEntryCreateAPI = {
      id: entry.id,
      date: entry.date,
      exercise_id: entry.exerciseId,
      workout_type: entry.workoutType,
      sets: entry.sets,
      plan_id: entry.planId,
    }
    const response = await apiService.post<WorkoutEntryAPI>('/api/v1/entries', payload)
    return transformEntry(response)
  },

  async updateEntry(id: string, updates: Partial<Omit<WorkoutEntry, 'id'>>): Promise<WorkoutEntry> {
    const payload: WorkoutEntryUpdateAPI = {}
    if (updates.date !== undefined) payload.date = updates.date
    if (updates.exerciseId !== undefined) payload.exercise_id = updates.exerciseId
    if (updates.workoutType !== undefined) payload.workout_type = updates.workoutType
    if (updates.sets !== undefined) payload.sets = updates.sets
    if (updates.planId !== undefined) payload.plan_id = updates.planId

    const response = await apiService.put<WorkoutEntryAPI>(`/api/v1/entries/${id}`, payload)
    return transformEntry(response)
  },

  async deleteEntry(id: string): Promise<void> {
    await apiService.delete(`/api/v1/entries/${id}`)
  },

  // ============ Bulk Fetch ============
  async fetchAllData(): Promise<{
    exercises: Exercise[]
    plans: WorkoutPlan[]
    entries: WorkoutEntry[]
  }> {
    const [exercises, plans, entries] = await Promise.all([
      dataService.getExercises(),
      dataService.getPlans(),
      dataService.getEntries(),
    ])
    return { exercises, plans, entries }
  },
}
