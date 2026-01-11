# Component Development Guide

## Component Pattern

### Standard Props Interface
```typescript
interface ComponentProps {
  // Data props (from App.tsx)
  exercises: Exercise[];
  logs: WorkoutEntry[];
  plans: WorkoutPlan[];
  language: Language;
  
  // Callback props
  onUpdateLogs?: (logs: WorkoutEntry[]) => void;
  onUpdatePlans?: (plans: WorkoutPlan[]) => void;
  onUpdateExercises?: (exercises: Exercise[]) => void;
  onNavigate?: (tab: TabType, params?: NavigationParams) => void;
  
  // Optional params
  initialParams?: NavigationParams | null;
}

const Component: React.FC<ComponentProps> = ({ 
  exercises, 
  logs, 
  onUpdateLogs,
  language 
}) => {
  // Component implementation
};
```

### Component Template
```typescript
import React, { useState } from 'react';
import { WorkoutEntry, Exercise, Language } from '../types';
import { translations } from '../translations';

const Component: React.FC<ComponentProps> = ({ logs, exercises, onUpdateLogs, language }) => {
  const t = translations[language];
  
  // Local state
  const [isAdding, setIsAdding] = useState(false);
  
  // Handlers
  const handleSubmit = () => {
    // Logic here
  };
  
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Component content */}
    </div>
  );
};

export default Component;
```

## Styling Patterns

### Card Pattern
```tsx
<div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6">
  {/* Card content */}
</div>
```

### Section Header Pattern
```tsx
<div className="flex items-center justify-between mb-4 px-2">
  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
    {t.section_title}
  </h4>
  {/* Optional action button */}
</div>
```

## Button Patterns

### Primary Button
```tsx
<button className="bg-indigo-600 text-white font-black py-4 px-6 rounded-2xl 
                shadow-lg shadow-indigo-100 active:scale-95 
                transition-all uppercase tracking-widest text-sm">
  {t.primary_action}
</button>
```

### Secondary Button
```tsx
<button className="bg-slate-100 text-slate-600 font-black p-4 rounded-2xl 
                hover:bg-slate-200 transition-colors uppercase text-xs">
  {t.secondary_action}
</button>
```

### Danger Button
```tsx
<button onClick={handleDelete} className="text-rose-500 hover:text-rose-600 
                hover:bg-rose-50 transition-colors">
  <Trash2 size={18} />
</button>
```

## Form Input Pattern

```tsx
<div className="space-y-1">
  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
    {t.field_label}
  </label>
  <input 
    type="text"
    value={formData.field}
    onChange={e => setFormData({...formData, field: e.target.value})}
    className="w-full bg-slate-50 p-4 rounded-2xl border-none 
               font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
  />
</div>
```

## Responsive Design Patterns

### Mobile-First Base Styles
- Use base styles for mobile (default)
- Enhance with `md:`, `lg:`, `xl:` breakpoints for larger screens

### Safe Area Handling
```tsx
// Mobile bottom padding
<div className="pb-[calc(70px+env(safe-area-inset-bottom))]">

// Mobile top padding
<header className="pt-safe sticky top-0 bg-white/80 backdrop-blur-xl z-40">
```

### Navigation Patterns
```tsx
{/* Desktop: Sidebar */}
<aside className="hidden md:flex w-72 bg-white border-r border-slate-200 p-6">
  {/* Desktop nav */}
</aside>

{/* Mobile: Bottom nav */}
<nav className="md:hidden fixed bottom-0 left-0 right-0 
             bg-white/90 backdrop-blur-xl px-6 pt-3 
             pb-[calc(12px+env(safe-area-inset-bottom))]">
  {/* Mobile nav */}
</nav>
```

## Conditional Rendering Patterns

### Tab-Based Routing
```tsx
{activeTab === TabType.DASHBOARD && (
  <Dashboard {...dashboardProps} />
)}
{activeTab === TabType.WORKOUT_LOG && (
  <WorkoutLog {...workoutLogProps} />
)}
```

### Conditional Content
```tsx
{isAdding && (
  <ModalForm onSubmit={handleSubmit} onCancel={() => setIsAdding(false)} />
)}
```

## Animation Patterns

### Entrance Animation
```tsx
<div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
  {/* Content */}
</div>
```

### Modal Animation
```tsx
<div className="animate-in zoom-in-95 duration-300">
  {/* Modal content */}
</div>
```

## When to Create New Component

### ✅ Create Separate Component When:
- Component will be used in multiple places
- Component has complex logic (>100 lines)
- Component represents distinct UI element (cards, modals, forms)

### ❌ Keep Inline When:
- Simple, one-off UI element (<50 lines)
- Component-specific helper functions
- Presentation-only changes

## Component Size Guidelines

- **Small (<200 lines):** Simple components, single responsibility
- **Medium (200-400 lines):** Moderate complexity, consider extraction
- **Large (>400 lines):** High complexity, should be decomposed

Current Large Components:
- WorkoutLog.tsx (446 lines) - Consider splitting
- Dashboard.tsx (373 lines) - Consider splitting
- PlanManager.tsx (417 lines) - Consider splitting

## Icons (lucide-react)
```tsx
import { Calendar, Plus, Trash2, CheckCircle } from 'lucide-react';

<Calendar size={20} className="text-indigo-600" />
<Plus size={24} />
<Trash2 size={18} className="text-rose-500" />
<CheckCircle size={20} />
```

## Export Pattern
```typescript
// Always use named export for consistency
const Component: React.FC<ComponentProps> = (...) => { ... };
export default Component;
```
