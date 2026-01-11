import { INITIAL_EXERCISES } from '../constants';
import type { Exercise, WorkoutEntry, WorkoutPlan } from '../types';

const STORAGE_KEYS = {
  EXERCISES: 'titan_track_exercises',
  LOGS: 'titan_track_logs',
  PLANS: 'titan_track_plans',
};

export const storageService = {
  getExercises: (): Exercise[] => {
    const data = localStorage.getItem(STORAGE_KEYS.EXERCISES);
    if (data) return JSON.parse(data);
    localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(INITIAL_EXERCISES));
    return INITIAL_EXERCISES;
  },
  saveExercises: (exercises: Exercise[]) => {
    localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises));
  },
  getLogs: (): WorkoutEntry[] => {
    const data = localStorage.getItem(STORAGE_KEYS.LOGS);
    return data ? JSON.parse(data) : [];
  },
  saveLogs: (logs: WorkoutEntry[]) => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  },
  getPlans: (): WorkoutPlan[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PLANS);
    return data ? JSON.parse(data) : [];
  },
  savePlans: (plans: WorkoutPlan[]) => {
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
  },
};
