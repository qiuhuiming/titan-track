# Tauri Backend Guide

## Storage Architecture

### AppStorage Structure
```rust
// Location: src-tauri/src/storage.rs, lines 14-19
pub struct AppStorage {
    pub exercises: Mutex<Vec<Exercise>>,
    pub logs: Mutex<Vec<WorkoutEntry>>,
    pub plans: Mutex<Vec<WorkoutPlan>>,
    data_dir: PathBuf,
}
```

### Thread Safety Pattern
```rust
// Use Mutex for thread-safe in-memory cache
pub fn get_exercises(&self) -> Result<Vec<Exercise>, String> {
    let exercises = self.exercises.lock()  // Acquire lock
        .map_err(|e| format!("Lock error: {}", e))?;
    Ok(exercises.clone())  // Clone to release lock immediately
}
```

## Adding New Storage Operation

### Step 1: Define Data Model in models.rs
```rust
#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]  // CRITICAL for TypeScript compatibility
pub struct NewDataType {
    pub id: String,
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub notes: Option<String>,
}
```

### Step 2: Add Storage Methods in storage.rs
```rust
impl AppStorage {
    // Get operation
    pub fn get_new_data(&self) -> Result<Vec<NewDataType>, String> {
        let data = self.new_data.lock()
            .map_err(|e| format!("Lock error: {}", e))?;
        Ok(data.clone())
    }
    
    // Save operation
    pub fn save_new_data(&self, new_data: Vec<NewDataType>) -> Result<(), String> {
        let mut data = self.new_data.lock()
            .map_err(|e| format!("Lock error: {}", e))?;
        *data = new_data;
        Self::save_json(&self.data_dir.join("new_data.json"), &data)
    }
}
```

### Step 3: Create Tauri Command in commands.rs
```rust
#[tauri::command]
pub fn get_new_data(storage: State<AppStorage>) -> Result<Vec<NewDataType>, String> {
    storage.get_new_data()
}

#[tauri::command]
pub fn save_new_data(storage: State<AppStorage>, data: Vec<NewDataType>) -> Result<(), String> {
    storage.save_new_data(data)
}
```

### Step 4: Register Command in lib.rs
```rust
// Location: src-tauri/src/lib.rs, lines 26-33
.invoke_handler(tauri::generate_handler![
    // ... existing commands
    commands::get_new_data,    // Add here
    commands::save_new_data,    // Add here
])
```

### Step 5: Add Frontend Service Method
```typescript
// Location: src/services/tauriStorageService.ts
export const tauriStorageService = {
  // ... existing methods
  
  getNewData: async (): Promise<NewDataType[]> => {
    try {
      const data = await invoke<NewDataType[]>('get_new_data');
      if (data.length === 0) {
        await tauriStorageService.saveNewData(INITIAL_NEW_DATA);
        return INITIAL_NEW_DATA;
      }
      return data;
    } catch (error) {
      console.error('Failed to get new data:', error);
      return INITIAL_NEW_DATA;
    }
  },
  
  saveNewData: async (data: NewDataType[]): Promise<void> => {
    try {
      await invoke('save_new_data', { data });
    } catch (error) {
      console.error('Failed to save new data:', error);
      throw error;
    }
  },
};
```

## Type Mapping (TypeScript ↔ Rust)

### Field Name Conversion
```rust
// TypeScript: camelCase
interface Exercise {
  muscleGroup: string;
  exerciseId: string;
}

// Rust: snake_case + serde attribute
#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]  // Auto-convert
pub struct Exercise {
    pub muscle_group: String,  // muscleGroup ↔ muscle_group
    pub exercise_id: String,   // exerciseId ↔ exercise_id
}
```

### Optional Fields
```rust
// TypeScript: optional field
interface Exercise {
  notes?: string;
  personalBest?: number;
}

// Rust: Option type with serde skip
#[derive(Serialize, Deserialize)]
pub struct Exercise {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub notes: Option<String>,
    
    #[serde(skip_serializing_if = "Option::is_none")]
    pub personal_best: Option<f64>,
}
```

### Type Mappings
| TypeScript | Rust | Notes |
|-----------|------|-------|
| `string` | `String` | Direct mapping |
| `number` | `f64` | Float precision |
| `boolean` | `bool` | Direct mapping |
| `string[]` | `Vec<String>` | Array mapping |
| `Type?` | `Option<Type>` | Optional fields |
| `Type \| null` | `Option<Type>` | Null handling |

## Error Handling Pattern

### Rust Error Handling
```rust
// Return Result<T, String> for all operations
pub fn get_exercises(&self) -> Result<Vec<Exercise>, String> {
    let exercises = self.exercises.lock()
        .map_err(|e| format!("Lock error: {}", e))?;  // Convert errors to String
    Ok(exercises.clone())
}
```

### Frontend Error Handling
```typescript
// Try/catch with fallback
getExercises: async (): Promise<Exercise[]> => {
  try {
    const exercises = await invoke<Exercise[]>('get_exercises');
    return exercises;
  } catch (error) {
    console.error('Failed to get exercises:', error);
    return INITIAL_EXERCISES;  // Fallback to initial data
  }
}
```

## File Operations

### Load JSON
```rust
fn load_json<T: DeserializeOwned>(path: &PathBuf) -> Result<Vec<T>, String> {
    if !path.exists() {
        return Ok(Vec::new());
    }
    let content = fs::read_to_string(path)
        .map_err(|e| format!("Failed to read file: {}", e))?;
    serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse JSON: {}", e))
}
```

### Save JSON
```rust
fn save_json<T: Serialize>(path: &PathBuf, data: &[T]) -> Result<(), String> {
    let content = serde_json::to_string_pretty(data)
        .map_err(|e| format!("Failed to serialize JSON: {}", e))?;
    fs::write(path, content)
        .map_err(|e| format!("Failed to write file: {}", e))
}
```

## Storage Initialization
```rust
pub fn new(app_handle: &AppHandle) -> Result<Self, String> {
    let data_dir = app_handle.path().app_data_dir()?;
    fs::create_dir_all(&data_dir)?;  // Ensure directory exists
    
    let exercises = Self::load_json(&data_dir.join("exercises.json"))
        .unwrap_or_default();  // Return empty Vec if file doesn't exist
    
    Ok(Self {
        exercises: Mutex::new(exercises),
        logs: Mutex::new(Self::load_json(&data_dir.join("logs.json"))
            .unwrap_or_default()),
        plans: Mutex::new(Self::load_json(&data_dir.join("plans.json"))
            .unwrap_or_default()),
        data_dir,
    })
}
```

## Best Practices

### ✅ Always Use Mutex for Shared State
- Prevents race conditions in multi-threaded Tauri runtime
- Clone data after lock to release quickly

### ✅ Always Return Result<T, String>
- Consistent error handling pattern
- String error messages are easy to log and debug

### ✅ Always Use Serde for JSON
- Automatic serialization/deserialization
- Type-safe JSON handling

### ✅ Always Handle File I/O Errors
- Directory creation, file read/write can fail
- Provide meaningful error messages

### ❌ Don't Block on Lock for Long Operations
- Clone data, release lock, then process
- Prevents deadlock scenarios
