# UI/UX Patterns Reference

## Design System

### Color Palette
```css
/* Primary - Indigo */
--primary-50: #eef2ff;
--primary-500: #6366f1;
--primary-600: #4f46e5;

/* Success - Emerald */
--success-500: #10b981;

/* Danger - Rose */
--danger-500: #f43f5e;

/* Neutral - Slate */
--neutral-50: #f8fafc;
--neutral-100: #f1f5f9;
--neutral-400: #94a3b8;
--neutral-600: #475569;
--neutral-900: #0f172a;
```

### Typography Scale
```css
/* Base */
text-xs: 0.75rem;   /* 12px - labels, captions */
text-sm: 0.875rem;  /* 14px - secondary text */
text-base: 1rem;    /* 16px - body text */
text-lg: 1.125rem;  /* 18px - headings */
text-xl: 1.25rem;   /* 20px - subheadings */
text-2xl: 1.5rem;   /* 24px - section headings */
text-3xl: 1.875rem; /* 30px - page headings */
```

### Border Radius
```css
rounded-xl: 0.75rem;      /* 12px - inputs, small cards */
rounded-2xl: 1rem;      /* 16px - standard cards */
rounded-[2.5rem]: 1.5rem; /* 24px - large cards, modals */
```

## Component Patterns

### Card Component Pattern
```tsx
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-[2rem] border border-slate-100 
                  shadow-sm p-6 ${className}`}>
    {children}
  </div>
);
```

### Button Component Pattern
```tsx
const Button = ({ 
  variant = 'primary', 
  children, 
  onClick, 
  disabled = false 
}: {
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) => {
  const baseStyles = "font-black active:scale-95 transition-all";
  const variants = {
    primary: "bg-indigo-600 text-white shadow-lg shadow-indigo-100 py-4 px-6 rounded-2xl",
    secondary: "bg-slate-100 text-slate-600 p-4 rounded-2xl hover:bg-slate-200",
    danger: "text-rose-500 hover:bg-rose-50"
  };
  
  return (
    <button onClick={onClick} disabled={disabled} 
            className={`${baseStyles} ${variants[variant]}`}>
      {children}
    </button>
  );
};
```

## Modal Patterns

### Full-Screen Portal Modal
```tsx
// Pattern: createPortal to document.body for z-index layering
const WorkoutModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  
  return createPortal(
    <div className="fixed inset-0 bg-white z-[60] flex flex-col 
                  animate-in slide-in-from-bottom-4 duration-300">
      {/* Modal content */}
      <div className="fixed bottom-0 left-0 right-0 p-6 
                      bg-white/80 backdrop-blur-lg pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        {/* Sticky action bar */}
      </div>
    </div>,
    document.body
  );
};
```

### Backdrop Modal (Fixed Positioning)
```tsx
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm 
                    z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl 
                      shadow-2xl p-8 animate-in zoom-in-95 duration-200">
        {children}
      </div>
    </div>
  );
};
```

### Preview Popup (Absolute Positioning)
```tsx
// Pattern: Long-press triggered popup with bounds checking
const PreviewPopup = ({ day, plan, logs, x, y, onClose }) => {
  return (
    <div 
      className="fixed z-[100] animate-in zoom-in-95 fade-in duration-300"
      style={{ 
        left: Math.min(window.innerWidth - 300, Math.max(20, x - 150)),
        top: Math.max(20, y - 220)
      }}
    >
      {/* Preview content */}
    </div>
  );
};
```

## Animation Patterns

### Entrance Animations
```tsx
<div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
  {/* Content fades in and slides up */}
</div>

<div className="animate-in zoom-in-95 duration-300">
  {/* Content scales up from 95% to 100% */}
</div>
```

### Hover Animations
```tsx
<button className="transition-all duration-200 hover:scale-110 hover:shadow-lg">
  {/* Scales up 10% on hover */}
</button>
```

### Loading Animations
```tsx
<div className="animate-spin">
  {/* Continuous rotation */}
</div>

<div className="animate-pulse">
  {/* Opacity pulsing */}
</div>
```

## Responsive Patterns

### Mobile-First Breakpoints
```css
/* Base styles (mobile) */
.container { padding: 1rem; }

/* Small tablets */
@media (min-width: 640px) {
  .container { padding: 1.5rem; }
}

/* Desktop */
@media (min-width: 768px) {
  .container { padding: 2rem; }
}

/* Large desktop */
@media (min-width: 1024px) {
  .container { padding: 3rem; }
}
```

### Navigation Responsive Pattern
```tsx
{/* Mobile bottom navigation */}
<nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90">
  {/* Mobile nav items */}
</nav>

{/* Desktop sidebar */}
<aside className="hidden md:flex w-72 bg-white">
  {/* Desktop nav items */}
</aside>
```

## Interaction Patterns

### Long-Press Pattern (Calendar Preview)
```tsx
const LongPressDay = ({ onLongPress, children }) => {
  const timer = useRef<number | null>(null);
  
  const handleStart = (e) => {
    timer.current = window.setTimeout(() => {
      onLongPress(e);
      navigator.vibrate(50);  // Haptic feedback
    }, 500);
  };
  
  const handleEnd = () => {
    if (timer.current) clearTimeout(timer.current);
  };
  
  return (
    <button
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
    >
      {children}
    </button>
  );
};
```

### Click-Outside-to-Close Pattern
```tsx
const Modal = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleClick = () => onClose();
    if (isOpen) {
      window.addEventListener('mousedown', handleClick);
      window.addEventListener('touchstart', handleClick);
    }
    return () => {
      window.removeEventListener('mousedown', handleClick);
      window.removeEventListener('touchstart', handleClick);
    };
  }, [isOpen, onClose]);
  
  // Modal content
};
```

## Form Patterns

### Controlled Input Pattern
```tsx
const [value, setValue] = useState('');

<input
  type="text"
  value={value}
  onChange={e => setValue(e.target.value)}
  className="w-full bg-slate-50 p-4 rounded-2xl border-none 
             font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
/>
```

### Number Input Pattern (Weight/Reps)
```tsx
<div className="bg-white p-3 rounded-2xl text-center shadow-sm">
  <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">
    KG
  </p>
  <input 
    type="number"
    value={weight}
    onChange={e => setWeight(parseFloat(e.target.value) || 0)}
    className="w-full text-center font-black text-slate-900 bg-transparent 
               outline-none text-lg"
  />
</div>
```

## Loading States

### Spinner Pattern
```tsx
const LoadingSpinner = () => (
  <div className="flex items-center justify-center">
    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
  </div>
);
```

### Skeleton Loading Pattern
```tsx
<div className="animate-pulse bg-slate-200 rounded-2xl h-20 w-full" />
```

## Icon Usage (lucide-react)
```tsx
import { Calendar, ChevronRight, CheckCircle, Trash2 } from 'lucide-react';

<Calendar size={20} className="text-indigo-600" />
<ChevronRight size={18} />
<CheckCircle size={20} className="text-emerald-500" />
<Trash2 size={18} className="text-rose-500" />
```

## Status Indicators

### Success Pattern
```tsx
<div className="flex items-center gap-2">
  <CheckCircle size={20} className="text-emerald-500" />
  <span className="text-xs font-black text-emerald-600 bg-emerald-50 
                px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-100">
    Completed
  </span>
</div>
```

### Error Pattern
```tsx
<div className="flex items-center gap-2">
  <XCircle size={20} className="text-rose-500" />
  <span className="text-xs font-black text-rose-600 bg-rose-50 
                px-3 py-1 rounded-full uppercase tracking-wider border border-rose-100">
    Error
  </span>
</div>
```

## Accessibility Patterns

### Keyboard Navigation
```tsx
<button
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // Handle activation
    }
  }}
>
  Accessible Button
</button>
```

### Screen Reader Support
```tsx
<button aria-label="Delete exercise" onClick={handleDelete}>
  <Trash2 size={18} />
</button>
```
