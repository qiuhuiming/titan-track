import { invoke } from '@tauri-apps/api/core';
import { Exercise, WorkoutEntry, WorkoutPlan } from '../types';
import { INITIAL_EXERCISES, INITIAL_LOGS, INITIAL_PLANS } from '../constants';

/**
 * Tauri Storage Service
 * Replaces localStorage with Tauri backend file-based storage
 */
export const tauriStorageService = {
  // ==================== EXERCISES ====================
  getExercises: async (): Promise<Exercise[]> => {
    try {
      const exercises = await invoke<Exercise[]>('get_exercises');
      // If empty, seed with initial data
      if (exercises.length === 0) {
        await tauriStorageService.saveExercises(INITIAL_EXERCISES);
        return INITIAL_EXERCISES;
      }
      return exercises;
    } catch (error) {
      console.error('Failed to get exercises:', error);
      return INITIAL_EXERCISES;
    }
  },

  saveExercises: async (exercises: Exercise[]): Promise<void> => {
    try {
      await invoke('save_exercises', { exercises });
    } catch (error) {
      console.error('Failed to save exercises:', error);
      throw error;
    }
  },

  // ==================== LOGS ====================
  getLogs: async (): Promise<WorkoutEntry[]> => {
    try {
      const logs = await invoke<WorkoutEntry[]>('get_logs');
      // If empty, seed with initial data
      if (logs.length === 0) {
        await tauriStorageService.saveLogs(INITIAL_LOGS);
        return INITIAL_LOGS;
      }
      return logs;
    } catch (error) {
      console.error('Failed to get logs:', error);
      return INITIAL_LOGS;
    }
  },

  saveLogs: async (logs: WorkoutEntry[]): Promise<void> => {
    try {
      await invoke('save_logs', { logs });
    } catch (error) {
      console.error('Failed to save logs:', error);
      throw error;
    }
  },

  // ==================== PLANS ====================
  getPlans: async (): Promise<WorkoutPlan[]> => {
    try {
      const plans = await invoke<WorkoutPlan[]>('get_plans');
      // If empty, seed with initial data
      if (plans.length === 0) {
        await tauriStorageService.savePlans(INITIAL_PLANS);
        return INITIAL_PLANS;
      }
      return plans;
    } catch (error) {
      console.error('Failed to get plans:', error);
      return INITIAL_PLANS;
    }
  },

  savePlans: async (plans: WorkoutPlan[]): Promise<void> => {
    try {
      await invoke('save_plans', { plans });
    } catch (error) {
      console.error('Failed to save plans:', error);
      throw error;
    }
  },
};
