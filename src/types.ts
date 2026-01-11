
export type MuscleGroup = 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Full Body' | 'Cardio';

export type Language = 'zh' | 'en';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: string;
  notes?: string;
  personalBest?: number;
}

export interface WorkoutSet {
  id: string;
  weight: number;
  reps?: number;
  timeMinutes?: number;
  distance?: number;
  rpe?: number;
  notes?: string;
  completed?: boolean;
}

export interface WorkoutPlan {
  id: string;
  date: string;
  title: string;
  tags: string[];
  exercises: {
    exerciseId: string;
    sets: WorkoutSet[];
  }[];
  isCompleted?: boolean;
  createdAt?: string;
}

export interface WorkoutEntry {
  id: string;
  date: string;
  exerciseId: string;
  workoutType: string;
  sets: WorkoutSet[];
  planId?: string; // Link to the plan if applicable
}

export const TabType = {
  DASHBOARD: 'DASHBOARD',
  WORKOUT_LOG: 'WORKOUT_LOG',
  PLAN: 'PLAN',
  AI_COACH: 'AI_COACH'
} as const;

export type TabType = typeof TabType[keyof typeof TabType];

export interface NavigationParams {
  date?: string;
  [key: string]: unknown;
}
