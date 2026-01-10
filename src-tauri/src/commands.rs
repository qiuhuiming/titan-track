use tauri::State;

use crate::models::{Exercise, WorkoutEntry, WorkoutPlan};
use crate::storage::AppStorage;

// ==================== EXERCISES ====================

#[tauri::command]
pub fn get_exercises(storage: State<AppStorage>) -> Result<Vec<Exercise>, String> {
    storage.get_exercises()
}

#[tauri::command]
pub fn save_exercises(storage: State<AppStorage>, exercises: Vec<Exercise>) -> Result<(), String> {
    storage.save_exercises(exercises)
}

// ==================== LOGS ====================

#[tauri::command]
pub fn get_logs(storage: State<AppStorage>) -> Result<Vec<WorkoutEntry>, String> {
    storage.get_logs()
}

#[tauri::command]
pub fn save_logs(storage: State<AppStorage>, logs: Vec<WorkoutEntry>) -> Result<(), String> {
    storage.save_logs(logs)
}

// ==================== PLANS ====================

#[tauri::command]
pub fn get_plans(storage: State<AppStorage>) -> Result<Vec<WorkoutPlan>, String> {
    storage.get_plans()
}

#[tauri::command]
pub fn save_plans(storage: State<AppStorage>, plans: Vec<WorkoutPlan>) -> Result<(), String> {
    storage.save_plans(plans)
}
