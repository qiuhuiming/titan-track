# Data Models Reference

## Authentication Types

### AuthUser
```typescript
// Location: src/services/authService.ts
interface AuthUser {
  id: string;
  email: string;
}
```

### AuthState
```typescript
interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
}
```

### TokenResponse (Backend)
```typescript
interface TokenResponse {
  access_token: string;
  token_type: string;  // "bearer"
}
```

## Core Types (TypeScript)

### Exercise
```typescript
interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: string;
  notes?: string;
  personalBest?: number;
}
```

### WorkoutEntry
```typescript
interface WorkoutEntry {
  id: string;
  date: string;  // ISO format: "YYYY-MM-DD"
  exerciseId: string;
  workoutType: string;
  sets: WorkoutSet[];
  planId?: string;  // Links to WorkoutPlan if from plan execution
}
```

### WorkoutPlan
```typescript
interface WorkoutPlan {
  id: string;
  date: string;  // ISO format: "YYYY-MM-DD"
  title: string;
  tags: string[];  // Usually muscle groups
  exercises: {
    exerciseId: string;
    sets: WorkoutSet[];
  }[];
  isCompleted?: boolean;
  createdAt?: string;  // ISO format timestamp
}
```

### WorkoutSet
```typescript
interface WorkoutSet {
  id: string;
  weight: number;
  reps?: number;
  timeMinutes?: number;
  distance?: number;
  rpe?: number;  // Rate of Perceived Exertion (1-10)
  notes?: string;
  completed?: boolean;
}
```

### MuscleGroup
```typescript
type MuscleGroup = 
  | 'Chest' 
  | 'Back' 
  | 'Legs' 
  | 'Shoulders' 
  | 'Arms' 
  | 'Core' 
  | 'Full Body' 
  | 'Cardio';
```

### Language
```typescript
type Language = 'zh' | 'en';
```

### TabType
```typescript
const TabType = {
  DASHBOARD: 'DASHBOARD',
  WORKOUT_LOG: 'WORKOUT_LOG',
  PLAN: 'PLAN',
  AI_COACH: 'AI_COACH'
} as const;
```

### NavigationParams
```typescript
interface NavigationParams {
  date?: string;
  [key: string]: unknown;
}
```

## Muscle Groups List
| Value | Label (en) | Label (zh) |
|-------|-------------|-------------|
| Chest | Chest | 胸部 |
| Back | Back | 背部 |
| Legs | Legs | 腿部 |
| Shoulders | Shoulders | 肩部 |
| Arms | Arms | 手臂 |
| Core | Core | 核心 |
| Full Body | Full Body | 全身 |
| Cardio | Cardio | 有氧 |

## Set Grouping Pattern

### Plan Manager Set Grouping
```typescript
// Efficient representation: "60kg × 8 reps × 4 sets"
type PlanSetGroup = WorkoutSet & { count?: number };

// Group identical sets
const groupSets = (sets: WorkoutSet[]): PlanSetGroup[] => {
  return sets.reduce((acc, set) => {
    const last = acc[acc.length - 1];
    if (last && isSameSetGroup(last, set)) {
      last.count = (last.count ?? 1) + 1;
      return acc;
    }
    acc.push({ ...set, count: 1 });
    return acc;
  }, []);
};

// Expand when saving
const expandSetGroups = (groups: PlanSetGroup[]): WorkoutSet[] => {
  return groups.flatMap(group => {
    const { count = 1, ...set } = group;
    return Array.from({ length: count }, () => ({
      ...set,
      id: Math.random().toString()
    }));
  });
};
```

## RPE Scale
| Value | Description | Chinese |
|-------|-------------|----------|
| 10 | Max effort, 0 reps left | 极限 (0 次余力) |
| 9 | Very hard, 1 rep left | 非常吃力 (1 次余力) |
| 8 | Hard, 2 reps left | 吃力 (2 次余力) |
| 7 | Moderate, 3 reps left | 中等 (3 次余力) |
| 6-1 | Easy to moderate | 轻松到中等 |

## Initial Data

### INITIAL_EXERCISES
- Location: src/constants.ts, lines 3-14
- Count: 10 exercises (Chinese names)
- Categories: Legs (2), Back (3), Chest (2), Shoulders (1), Arms (1), Core (1)

### INITIAL_PLANS
- Location: src/constants.ts, line 15
- Count: 0 (empty array - user creates plans from scratch)

### INITIAL_LOGS
- Location: src/constants.ts, line 16
- Count: 0 (empty array - user logs workouts from scratch)

## ID Generation Pattern
```typescript
// Random string ID generation
const id = Math.random().toString(36).substr(2, 9);
// Example: "x7k2m5j8f"
```

## Date Format
- **Format:** ISO 8601 date string
- **Pattern:** "YYYY-MM-DD"
- **Example:** "2026-01-15"
- **Usage:** Compatible with input type="date" and new Date().toISOString()
