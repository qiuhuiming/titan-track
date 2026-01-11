import { invoke } from '@tauri-apps/api/core';
import { Exercise, WorkoutEntry, WorkoutPlan } from '../types';
import { INITIAL_EXERCISES, INITIAL_LOGS, INITIAL_PLANS } from '../constants';

const isTauri = () => {
  try {
    return typeof window !== 'undefined' && '__TAURI__' in window;
  } catch {
    return false;
  }
};

export const tauriStorageService = {
  getExercises: async (): Promise<Exercise[]> => {
    try {
      if (isTauri()) {
        const exercises = await invoke<Exercise[]>('get_exercises');
        if (exercises.length === 0) {
          await tauriStorageService.saveExercises(INITIAL_EXERCISES);
          return INITIAL_EXERCISES;
        }
        return exercises;
      } else {
        const data = localStorage.getItem('titan_track_exercises');
        return data ? JSON.parse(data) : INITIAL_EXERCISES;
      }
    } catch (error) {
      console.error('Failed to get exercises:', error);
      if (!isTauri()) {
        const data = localStorage.getItem('titan_track_exercises');
        return data ? JSON.parse(data) : INITIAL_EXERCISES;
      }
      return INITIAL_EXERCISES;
    }
  },

  saveExercises: async (exercises: Exercise[]): Promise<void> => {
    try {
      if (isTauri()) {
        await invoke('save_exercises', { exercises });
      } else {
        localStorage.setItem('titan_track_exercises', JSON.stringify(exercises));
      }
    } catch (error) {
      console.error('Failed to save exercises:', error);
      throw error;
    }
  },

  getLogs: async (): Promise<WorkoutEntry[]> => {
    try {
      if (isTauri()) {
        const logs = await invoke<WorkoutEntry[]>('get_logs');
        if (logs.length === 0) {
          await tauriStorageService.saveLogs(INITIAL_LOGS);
          return INITIAL_LOGS;
        }
        return logs;
      } else {
        const data = localStorage.getItem('titan_track_logs');
        return data ? JSON.parse(data) : INITIAL_LOGS;
      }
    } catch (error) {
      console.error('Failed to get logs:', error);
      if (!isTauri()) {
        const data = localStorage.getItem('titan_track_logs');
        return data ? JSON.parse(data) : INITIAL_LOGS;
      }
      return INITIAL_LOGS;
    }
  },

  saveLogs: async (logs: WorkoutEntry[]): Promise<void> => {
    try {
      if (isTauri()) {
        await invoke('save_logs', { logs });
      } else {
        localStorage.setItem('titan_track_logs', JSON.stringify(logs));
      }
    } catch (error) {
      console.error('Failed to save logs:', error);
      throw error;
    }
  },

  getPlans: async (): Promise<WorkoutPlan[]> => {
    try {
      if (isTauri()) {
        const plans = await invoke<WorkoutPlan[]>('get_plans');
        if (plans.length === 0) {
          await tauriStorageService.savePlans(INITIAL_PLANS);
          return INITIAL_PLANS;
        }
        return plans;
      } else {
        const data = localStorage.getItem('titan_track_plans');
        return data ? JSON.parse(data) : INITIAL_PLANS;
      }
    } catch (error) {
      console.error('Failed to get plans:', error);
      if (!isTauri()) {
        const data = localStorage.getItem('titan_track_plans');
        return data ? JSON.parse(data) : INITIAL_PLANS;
      }
      return INITIAL_PLANS;
    }
  },

  savePlans: async (plans: WorkoutPlan[]): Promise<void> => {
    try {
      if (isTauri()) {
        await invoke('save_plans', { plans });
      } else {
        localStorage.setItem('titan_track_plans', JSON.stringify(plans));
      }
    } catch (error) {
      console.error('Failed to save plans:', error);
      throw error;
    }
  },
};
