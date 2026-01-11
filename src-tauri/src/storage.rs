use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;

use serde::{de::DeserializeOwned, Serialize};
use tauri::{AppHandle, Manager};

use crate::models::{AISettings, Exercise, WorkoutEntry, WorkoutPlan};

const EXERCISES_FILE: &str = "exercises.json";
const LOGS_FILE: &str = "logs.json";
const PLANS_FILE: &str = "plans.json";
const AI_SETTINGS_FILE: &str = "ai_settings.json";

pub struct AppStorage {
    pub exercises: Mutex<Vec<Exercise>>,
    pub logs: Mutex<Vec<WorkoutEntry>>,
    pub plans: Mutex<Vec<WorkoutPlan>>,
    pub ai_settings: Mutex<Option<AISettings>>,
    data_dir: PathBuf,
}

impl AppStorage {
    pub fn new(app_handle: &AppHandle) -> Result<Self, String> {
        let data_dir = app_handle
            .path()
            .app_data_dir()
            .map_err(|e| format!("Failed to get app data dir: {}", e))?;

        // Ensure directory exists
        fs::create_dir_all(&data_dir)
            .map_err(|e| format!("Failed to create data dir: {}", e))?;

        let exercises = Self::load_json(&data_dir.join(EXERCISES_FILE)).unwrap_or_default();
        let logs = Self::load_json(&data_dir.join(LOGS_FILE)).unwrap_or_default();
        let plans = Self::load_json(&data_dir.join(PLANS_FILE)).unwrap_or_default();
        let ai_settings = Self::load_json_single(&data_dir.join(AI_SETTINGS_FILE)).ok();

        Ok(Self {
            exercises: Mutex::new(exercises),
            logs: Mutex::new(logs),
            plans: Mutex::new(plans),
            ai_settings: Mutex::new(ai_settings),
            data_dir,
        })
    }

    fn load_json<T: DeserializeOwned>(path: &PathBuf) -> Result<Vec<T>, String> {
        if !path.exists() {
            return Ok(Vec::new());
        }
        let content = fs::read_to_string(path)
            .map_err(|e| format!("Failed to read file: {}", e))?;
        if content.trim().is_empty() {
            return Ok(Vec::new());
        }
        serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse JSON: {}", e))
    }

    fn save_json<T: Serialize>(path: &PathBuf, data: &[T]) -> Result<(), String> {
        let content = serde_json::to_string_pretty(data)
            .map_err(|e| format!("Failed to serialize JSON: {}", e))?;
        fs::write(path, content)
            .map_err(|e| format!("Failed to write file: {}", e))
    }

    fn load_json_single<T: DeserializeOwned>(path: &PathBuf) -> Result<T, String> {
        if !path.exists() {
            return Err("File does not exist".to_string());
        }
        let content = fs::read_to_string(path)
            .map_err(|e| format!("Failed to read file: {}", e))?;
        if content.trim().is_empty() {
            return Err("File is empty".to_string());
        }
        serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse JSON: {}", e))
    }

    fn save_json_single<T: Serialize>(path: &PathBuf, data: &T) -> Result<(), String> {
        let content = serde_json::to_string_pretty(data)
            .map_err(|e| format!("Failed to serialize JSON: {}", e))?;
        fs::write(path, content)
            .map_err(|e| format!("Failed to write file: {}", e))
    }

    // Exercises
    pub fn get_exercises(&self) -> Result<Vec<Exercise>, String> {
        let exercises = self.exercises.lock()
            .map_err(|e| format!("Lock error: {}", e))?;
        Ok(exercises.clone())
    }

    pub fn save_exercises(&self, new_exercises: Vec<Exercise>) -> Result<(), String> {
        let mut exercises = self.exercises.lock()
            .map_err(|e| format!("Lock error: {}", e))?;
        *exercises = new_exercises;
        Self::save_json(&self.data_dir.join(EXERCISES_FILE), &exercises)
    }

    // Logs
    pub fn get_logs(&self) -> Result<Vec<WorkoutEntry>, String> {
        let logs = self.logs.lock()
            .map_err(|e| format!("Lock error: {}", e))?;
        Ok(logs.clone())
    }

    pub fn save_logs(&self, new_logs: Vec<WorkoutEntry>) -> Result<(), String> {
        let mut logs = self.logs.lock()
            .map_err(|e| format!("Lock error: {}", e))?;
        *logs = new_logs;
        Self::save_json(&self.data_dir.join(LOGS_FILE), &logs)
    }

    // Plans
    pub fn get_plans(&self) -> Result<Vec<WorkoutPlan>, String> {
        let plans = self.plans.lock()
            .map_err(|e| format!("Lock error: {}", e))?;
        Ok(plans.clone())
    }

    pub fn save_plans(&self, new_plans: Vec<WorkoutPlan>) -> Result<(), String> {
        let mut plans = self.plans.lock()
            .map_err(|e| format!("Lock error: {}", e))?;
        *plans = new_plans;
        Self::save_json(&self.data_dir.join(PLANS_FILE), &plans)
    }

    // AI Settings
    pub fn get_ai_settings(&self) -> Result<Option<AISettings>, String> {
        let ai_settings = self.ai_settings.lock()
            .map_err(|e| format!("Lock error: {}", e))?;
        Ok(ai_settings.clone())
    }

    pub fn save_ai_settings(&self, new_settings: AISettings) -> Result<(), String> {
        let mut ai_settings = self.ai_settings.lock()
            .map_err(|e| format!("Lock error: {}", e))?;
        *ai_settings = Some(new_settings.clone());
        Self::save_json_single(&self.data_dir.join(AI_SETTINGS_FILE), &new_settings)
    }
}
