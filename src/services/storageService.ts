
import { Exercise, WorkoutEntry, WorkoutPlan } from '../types';
import { INITIAL_EXERCISES, INITIAL_LOGS, INITIAL_PLANS } from '../constants';

const STORAGE_KEYS = {
  EXERCISES: 'titan_track_exercises',
  LOGS: 'titan_track_logs',
  PLANS: 'titan_track_plans',
};

export const storageService = {
  getExercises: (): Exercise[] => {
    const data = localStorage.getItem(STORAGE_KEYS.EXERCISES);
    return data ? JSON.parse(data) : INITIAL_EXERCISES;
  },
  saveExercises: (exercises: Exercise[]) => {
    localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises));
  },
  getLogs: (): WorkoutEntry[] => {
    const data = localStorage.getItem(STORAGE_KEYS.LOGS);
    return data ? JSON.parse(data) : INITIAL_LOGS;
  },
  saveLogs: (logs: WorkoutEntry[]) => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  },
  getPlans: (): WorkoutPlan[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PLANS);
    return data ? JSON.parse(data) : INITIAL_PLANS;
  },
  savePlans: (plans: WorkoutPlan[]) => {
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
  },
};
