# Common Task Workflows

## Adding a New Feature

### Step 1: Understand Context
1. Read **docs/ARCHITECTURE.md** for overall system context
2. Identify affected components from component tree
3. Determine if feature requires storage changes

### Step 2: Read Relevant Documentation
- **Frontend work:** Read docs/COMPONENT_GUIDE.md
- **State changes:** Read docs/STATE_MANAGEMENT.md
- **UI changes:** Read docs/UI_PATTERNS.md

### Step 3: Implement Component
1. Create component file: `src/components/NewFeature.tsx`
2. Define props interface following COMPONENT_GUIDE pattern
3. Implement with useState for local state
4. Add callback props if parent state updates needed
5. Follow styling patterns from UI_PATTERNS.md
6. Test with: `bun run dev`

### Step 4: Update Parent Component (if needed)
1. Import new component in parent
2. Add props following existing patterns
3. Update state handlers if callbacks provided

### Step 5: Test Navigation Flow
1. Start development server
2. Navigate through app
3. Verify feature appears in correct tab
4. Test interactions and state updates

### Step 6: Verify Storage (if needed)
1. Test data persists after reload
2. Check browser console for errors
3. Verify localStorage updated correctly

## Fixing a Bug

### Step 1: Identify Affected Component
1. Read docs/ARCHITECTURE.md to locate component
2. Understand component's role in system
3. Check component props and state

### Step 2: Read Component Guide
1. Read docs/COMPONENT_GUIDE.md for patterns
2. Check UI_PATTERNS.md if bug is visual
3. Check STATE_MANAGEMENT.md if bug is state-related

### Step 3: Debug
1. Use browser DevTools React Profiler
2. Check browser console for errors
3. Add console.log for state tracking

### Step 4: Fix Bug
1. Follow existing component patterns
2. Maintain consistency with similar code
3. Update types if needed

### Step 5: Test
1. Test bug scenario is fixed
2. Verify no regressions introduced
3. Test on mobile and desktop if responsive

## Refactoring a Component

### Step 1: Analyze Component
1. Check component line count
2. Identify mixed responsibilities
3. Look for prop drilling opportunities

### Step 2: Read Design Patterns
1. Review COMPONENT_GUIDE.md
2. Check for reusable patterns
3. Identify extraction opportunities

### Step 3: Plan Refactor
1. Create new smaller components
2. Extract shared logic to custom hooks
3. Maintain existing props interface

### Step 4: Implement Refactor
1. Replace large sections with new components
2. Update parent component imports
3. Test refactored functionality

### Step 5: Verify
1. Run: `bun run lint` to check for issues
2. Test all refactored features
3. Check React DevTools for state consistency

## Adding Storage for New Data Type

### Step 1: Define TypeScript Type
1. Open src/types.ts
2. Add interface following existing patterns

### Step 2: Add Storage Key
1. Open src/services/storageService.ts
2. Add key to STORAGE_KEYS object

### Step 3: Add Storage Methods
1. Add getter method (returns data or default)
2. Add setter method (saves to localStorage)

### Step 4: Update App.tsx
1. Add state for new data type
2. Add to initialization useEffect
3. Create update handler function

### Step 5: Test
1. Run: `bun run dev`
2. Test data persistence
3. Verify data survives page refresh

## Adding UI Feature

### Step 1: Read UI Patterns
1. Read docs/UI_PATTERNS.md
2. Identify relevant component patterns
3. Check design system colors and typography

### Step 2: Implement Component
1. Follow COMPONENT_GUIDE patterns
2. Use Tailwind utility classes
3. Ensure mobile-first responsive design

### Step 3: Add Interactions
1. Add onClick handlers
2. Implement state updates
3. Add animations per UI_PATTERNS

### Step 4: Test
1. Test on mobile viewport
2. Test on desktop viewport
3. Verify animations and transitions

## Adding Translation String

### Step 1: Open Translation File
1. Open src/translations.ts
2. Find relevant section
3. Add English translation

### Step 2: Add Chinese Translation
1. Add corresponding zh translation
2. Verify context matches
3. Check for existing similar patterns

### Step 3: Use in Component
1. Import translations: `import { translations } from '../translations';`
2. Destructure: `const t = translations[language];`
3. Use: `<span>{t.your_key}</span>`

## Diagnostics

### Run Linter
```bash
bun run lint
```

### Run Type Checker
```bash
bun run typecheck
# TypeScript errors will appear in output
```

### Run Full Static Check
```bash
bun run check
# Runs typecheck + lint + format check
```

### Browser Developer Tools
1. Right-click → Inspect
2. Check Console tab for errors
3. Check Application → Local Storage for data

## Common Commands

### Development
```bash
bun run dev          # Start Vite dev server
```

### Building
```bash
bun run build        # Build frontend
bun run preview      # Preview production build
```

### Code Quality
```bash
bun run lint         # Run ESLint
bun run lint:fix     # Run ESLint with auto-fix
bun run typecheck    # Run TypeScript type checker
bun run format       # Format code with Prettier
bun run format:check # Check code formatting
bun run check        # Run all checks (typecheck + lint + format)
```

## Git Workflow

### Commit Pattern
```bash
git add .
git commit -m "feature: add new feature description"
bun run check      # Verify checks before push
```

Note: Pre-commit hooks are configured to run linting and type checking automatically.

## Context Window Considerations

When context window is small (<32k tokens):
1. **ALWAYS read:** docs/ARCHITECTURE.md (~80 lines)
2. **THEN read:** One domain-specific doc (STATE_MANAGEMENT, COMPONENT_GUIDE, etc.)
3. **SKIP:** Other docs until needed

When context window is large (>64k tokens):
1. Read all architecture docs
2. Read 2-3 domain-specific docs
3. Reference: TASK_WORKFLOWS.md for workflow guidance

## Agent-Specific Reading Strategies

### Frontend/UI Agents
1. Read: ARCHITECTURE.md (context)
2. Read: COMPONENT_GUIDE.md (patterns)
3. Read: UI_PATTERNS.md (styling)
4. Optional: STATE_MANAGEMENT.md (if state work)

### State Management Agents
1. Read: ARCHITECTURE.md (context)
2. Read: STATE_MANAGEMENT.md (patterns)
3. Read: DATA_MODELS.md (types)

### Full-Stack Agents
1. Read: ARCHITECTURE.md (always first)
2. Read: All domain-specific docs as needed
3. Reference: TASK_WORKFLOWS.md for workflow guidance
