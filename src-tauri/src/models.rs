use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct AISettings {
    pub provider: String,
    pub api_key: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub model: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Exercise {
    pub id: String,
    pub name: String,
    pub muscle_group: String,
    pub equipment: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub notes: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub personal_best: Option<f64>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct WorkoutSet {
    pub id: String,
    pub weight: f64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reps: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub time_minutes: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub distance: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub rpe: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub notes: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub completed: Option<bool>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct WorkoutPlanExercise {
    pub exercise_id: String,
    pub sets: Vec<WorkoutSet>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct WorkoutPlan {
    pub id: String,
    pub date: String,
    pub title: String,
    pub tags: Vec<String>,
    pub exercises: Vec<WorkoutPlanExercise>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_completed: Option<bool>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct WorkoutEntry {
    pub id: String,
    pub date: String,
    pub exercise_id: String,
    pub workout_type: String,
    pub sets: Vec<WorkoutSet>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub plan_id: Option<String>,
}
