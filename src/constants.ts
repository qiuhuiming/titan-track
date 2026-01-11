import type { Exercise, WorkoutEntry, WorkoutPlan } from './types';

export const INITIAL_EXERCISES: Exercise[] = [
  { id: 'squat', name: '深蹲', muscleGroup: 'Legs', equipment: 'Barbell' },
  { id: 'deadlift', name: '传统硬拉', muscleGroup: 'Back', equipment: 'Barbell' },
  { id: 'bench-press', name: '卧推', muscleGroup: 'Chest', equipment: 'Barbell' },
  { id: 'overhead-press', name: '推举', muscleGroup: 'Shoulders', equipment: 'Barbell' },
  { id: 'barbell-row', name: '杠铃划船', muscleGroup: 'Back', equipment: 'Barbell' },
  { id: 'pull-up', name: '引体向上', muscleGroup: 'Back', equipment: 'Bodyweight' },
  { id: 'dip', name: '双杠臂屈伸', muscleGroup: 'Chest', equipment: 'Bodyweight' },
  { id: 'lunge', name: '弓步', muscleGroup: 'Legs', equipment: 'Bodyweight' },
  { id: 'bicep-curl', name: '二头弯举', muscleGroup: 'Arms', equipment: 'Dumbbell' },
  { id: 'plank', name: '平板支撑', muscleGroup: 'Core', equipment: 'Bodyweight' }
];
export const INITIAL_PLANS: WorkoutPlan[] = [];
export const INITIAL_LOGS: WorkoutEntry[] = [];
