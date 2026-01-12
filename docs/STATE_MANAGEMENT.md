# State Management Guide

## Global State (App.tsx)
```typescript
// Location: src/App.tsx
const [activeTab, setActiveTab] = useState<TabType>(TabType.DASHBOARD);
const [activeTabParams, setActiveTabParams] = useState<NavigationParams | null>(null);
const [exercises, setExercises] = useState<Exercise[]>([]);
const [logs, setLogs] = useState<WorkoutEntry[]>([]);
const [plans, setPlans] = useState<WorkoutPlan[]>([]);
const [language, setLanguage] = useState<Language>('zh');
const [isLoading, setIsLoading] = useState(true);
const [isSettingsOpen, setIsSettingsOpen] = useState(false);
const [isExerciseManagerOpen, setIsExerciseManagerOpen] = useState(false);
const [aiSettings, setAISettings] = useState<AISettings | null>(null);
```

## State Update Pattern

### Component Calls Parent
```typescript
// In child component
const { onUpdateLogs, logs } = props;
const handleAddLog = (newLog: WorkoutEntry) => {
  onUpdateLogs([...logs, newLog]);
};
```

### Parent Updates State + Persists
```typescript
// Location: src/App.tsx
const handleUpdateLogs = (newLogs: WorkoutEntry[]) => {
  setLogs(newLogs);  // React state update
  storageService.saveLogs(newLogs);  // Persist to localStorage
};
```

## When to Use What

### Global Data State (Managed in App.tsx)
Use when:
- Data is shared across multiple components
- Data persists to localStorage
- Examples: exercises, logs, plans, aiSettings

### Local UI State (Managed in Components)
Use when:
- State is specific to component
- Not persisted to storage
- Examples: modals (isAdding), form inputs, calendar view (viewDate), preview (previewDay)

### User Preferences (localStorage)
Use when:
- Small, user-specific settings
- Examples: language preference, UI preferences

## State Initialization Flow
```typescript
// Location: src/App.tsx
useEffect(() => {
  try {
    setIsLoading(true);
    setExercises(storageService.getExercises());
    setLogs(storageService.getLogs());
    setPlans(storageService.getPlans());
    setAISettings(storageService.getAISettings());
  } catch (error) {
    console.error('Failed to load data:', error);
  } finally {
    setIsLoading(false);
  }

  // Load language preference from localStorage
  const savedLang = localStorage.getItem('titan_track_lang');
  if (savedLang === 'zh' || savedLang === 'en') setLanguage(savedLang);
}, []);
```

## Language State Management
```typescript
// Toggle handler in App.tsx
const handleLanguageToggle = () => {
  const nextLang = language === 'zh' ? 'en' : 'zh';
  setLanguage(nextLang);
  localStorage.setItem('titan_track_lang', nextLang);  // Persist to localStorage
};

// Usage in components
const t = translations[language];
```

## Settings & Modal State
```typescript
// Settings menu state
const [isSettingsOpen, setIsSettingsOpen] = useState(false);
const [isExerciseManagerOpen, setIsExerciseManagerOpen] = useState(false);
const [isAISettingsOpen, setIsAISettingsOpen] = useState(false);

// ESC key and click-outside handlers are set up via useEffect
// Body scroll is disabled when modals are open
```

## Anti-Patterns to Avoid

### ❌ Don't Modify Props Directly
```typescript
// Wrong
props.logs.push(newLog);

// Correct
onUpdateLogs([...props.logs, newLog]);
```

### ❌ Don't Mix UI and Data State
- UI state (modals, forms) should be local to component
- Data state (exercises, logs, plans) should be managed in App.tsx

### ❌ Don't Skip Loading States
- Always provide feedback during async operations
- Use spinners, progress indicators, or skeleton screens

### ❌ Don't Ignore Errors
- Always handle try/catch blocks
- Log errors for debugging
- Provide user feedback when possible

## Common State Update Scenarios

### Adding a New Item
```typescript
// Pattern: immutable spread with callback
onUpdateLogs([...logs, newEntry]);
onUpdatePlans([...plans, newPlan]);
onUpdateExercises([...exercises, newExercise]);
```

### Updating an Item
```typescript
// Pattern: map with immutable update
const updatedLogs = logs.map(log =>
  log.id === logId ? { ...log, ...updates } : log
);
onUpdateLogs(updatedLogs);
```

### Deleting an Item
```typescript
// Pattern: filter with immutable update
const updatedLogs = logs.filter(log => log.id !== logId);
onUpdateLogs(updatedLogs);
```

## Loading State Management

### Global Loading (App.tsx)
```typescript
if (isLoading) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
          Loading...
        </p>
      </div>
    </div>
  );
}
```

### Component-Specific Loading
```typescript
// Example: AICoach.tsx
const [loading, setLoading] = useState(false);

<button onClick={handleSend} disabled={loading}>
  {loading ? <Loader2 className="animate-spin" /> : <Send />}
  {loading ? 'Sending...' : 'Send'}
</button>
```
