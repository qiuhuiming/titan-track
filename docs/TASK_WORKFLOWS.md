# Common Task Workflows

## Adding a New Feature

### Step 1: Understand Context
1. Read **docs/ARCHITECTURE.md** for overall system context
2. Identify affected components from component tree
3. Determine if feature requires backend changes

### Step 2: Read Relevant Documentation
- **Frontend work:** Read docs/COMPONENT_GUIDE.md
- **State changes:** Read docs/STATE_MANAGEMENT.md
- **Backend work:** Read docs/TAURI_BACKEND.md
- **UI changes:** Read docs/UI_PATTERNS.md

### Step 3: Implement Component
1. Create component file: `src/components/NewFeature.tsx`
2. Define props interface following COMPONENT_GUIDE pattern
3. Implement with useState for local state
4. Add callback props if parent state updates needed
5. Follow styling patterns from UI_PATTERNS.md
6. Test with: `bun run tauri dev`

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
2. Check Tauri console for errors
3. Verify JSON files updated correctly

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
2. Check Tauri console: View → Toggle Developer Tools
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

## Adding Backend Storage

### Step 1: Define Model
1. Open src-tauri/src/models.rs
2. Add struct following existing patterns
3. Add serde attributes for TypeScript compatibility

### Step 2: Implement Storage
1. Open src-tauri/src/storage.rs
2. Add get/save methods following Mutex pattern
3. Add JSON file constant at top

### Step 3: Create Command
1. Open src-tauri/src/commands.rs
2. Add #tauri::command functions
3. Use State<AppStorage> parameter

### Step 4: Register Command
1. Open src-tauri/src/lib.rs
2. Add command to generate_handler! macro
3. Verify Tauri compiles

### Step 5: Add Frontend Service
1. Open src/services/tauriStorageService.ts
2. Add async method following existing patterns
3. Add error handling and fallback logic

### Step 6: Test
1. Build: `bun run build`
2. Run: `bun run tauri dev`
3. Test data persistence

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

### Tauri Developer Tools
1. Right-click app → Toggle Developer Tools
2. Check Console tab for errors
3. Check Network tab for Tauri invoke failures

## Common Commands

### Development
```bash
bun run dev          # Start Vite dev server
bun run tauri dev    # Run full Tauri app
```

### Building
```bash
bun run build        # Build frontend + Tauri
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

### iOS Development
```bash
bun run ios:init    # Initialize iOS platform
bun run ios:dev     # Run iOS dev build
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
1. **ALWAYS read:** docs/ARCHITECTURE.md (~150 lines)
2. **THEN read:** One domain-specific doc (STATE_MANAGEMENT, COMPONENT_GUIDE, etc.)
3. **SKIP:** Other docs until needed

When context window is large (>64k tokens):
1. Read all architecture docs
2. Read 2-3 domain-specific docs
3. Reference: TASK_WORKFLOWS.md for workflow guidance
```

## Agent-Specific Reading Strategies

### Frontend/UI Agents
1. Read: ARCHITECTURE.md (context)
2. Read: COMPONENT_GUIDE.md (patterns)
3. Read: UI_PATTERNS.md (styling)
4. Optional: STATE_MANAGEMENT.md (if state work)
5. Skip: TAURI_BACKEND.md

### Backend/Rust Agents
1. Read: ARCHITECTURE.md (context)
2. Read: TAURI_BACKEND.md (patterns)
3. Read: DATA_MODELS.md (types)
4. Optional: COMPONENT_GUIDE.md (if frontend integration needed)
5. Skip: UI_PATTERNS.md

### Full-Stack Agents
1. Read: ARCHITECTURE.md (always first)
2. Read: All domain-specific docs as needed
3. Reference: TASK_WORKFLOWS.md for workflow guidance
