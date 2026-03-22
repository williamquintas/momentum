# Implementation Plan: Update Goal Progress

## Context & Technical Foundation

### Project Context
- **Application**: Momentum - Goals Tracking System
- **Module**: Features/Goals/Progress Management
- **Technology Stack**: React 18.2.0, TypeScript 5.3.3, Ant Design 5.12.8, Zustand 4.4.7, Zod 3.x
- **State Management**: Zustand for progress state, React Query for server state
- **Storage**: LocalStorage with normalized indexes, immutable update log
- **Testing**: Vitest for unit/integration tests

### Dependency Chain
- **Depends on**: 003-create-goal (Goal CRUD foundation)
- **Feeds into**: 005-complete-goal, 012-progress-history-and-analytics
- **Related**: 010-recurring-goal-occurrence-tracking (for occurrence updates)

## Architecture Decisions

### 1. Update Patterns
- **Progress Entry Form Component**: Single unified form with conditional type-specific fields
- **Type Discrimination**: Use goal.type from context to render appropriate input
- **Validation Strategy**: Zod schemas per goal type with separate validation functions
- **State Management**: React form state + Zustand progress store

### 2. Progress Calculation Engine
- **Encapsulation**: Separate utility functions for each goal type formula
- **Immutability**: All updates stored as history, never mutate goal.progress directly
- **Caching**: Maintain ProgressCache for O(1) current progress lookups
- **Recalculation**: Support lazy recalculation from history when needed

### 3. Form Architecture
```
ProgressUpdateForm (unified)
├── QuantitativeInput (number input with unit display)
├── QualitativeInput (rich text editor or markdown)
├── BinaryInput (toggle or radio)
├── MilestoneSelector (dropdown with completion checkbox)
├── RecurringOccurrenceSelector (date picker + status)
└── HabitDatePicker (calendar or date list)
```

### 4. Storage & History
- **Immutable Append Log**: Never edit/delete progress updates
- **Normalized References**: goalId → updates array (not embedding in goal)
- **Time-Series Queries**: Enable range queries for analytics
- **Duplicate Detection**: Check for same value + timestamp within 1 minute

## Feature Scope

### MVP Scope (P1)
- ✅ Create quantitative progress updates with formula validation
- ✅ Create qualitative progress updates with rich text support
- ✅ Create binary progress updates (achieved/not achieved)
- ✅ Automatic progress calculation for all types
- ✅ Progress persistence to LocalStorage
- ✅ Form validation with user-friendly errors
- ✅ Update history appending
- ✅ Progress change notifications to goal

### Extended Scope (P2)
- ⚠️ Progress history timeline visualization
- ⚠️ Bulk milestone completion
- ⚠️ Auto-completion detection for recurring occurrences
- ⚠️ Duplicate update prevention with merge

## Implementation Phases

### Phase 1: Setup & Tooling (2-3 days)
- [ ] Create `/src/features/goals/hooks/useProgressUpdate.ts`
- [ ] Create `/src/features/goals/utils/progressCalculation.ts`
- [ ] Create `/src/features/goals/utils/progressValidation.ts`
- [ ] Create `/src/features/goals/types/progress.ts`
- [ ] Setup Zod schemas in `/src/features/goals/validation/`

### Phase 2: Core Update Logic (3-4 days)
- [ ] Implement quantitative formula engine
- [ ] Implement qualitative text storage
- [ ] Implement binary toggle logic
- [ ] Implement milestone progress aggregation
- [ ] Implement recurring occurrence tracking
- [ ] Implement habit streak calculation

### Phase 3: Form UI (2-3 days)
- [ ] Create `ProgressUpdateForm` base component
- [ ] Create type-specific form fields
- [ ] Wire form state with Zustand
- [ ] Add validation error display
- [ ] Add success notifications

### Phase 4: Integration & Persistence (2 days)
- [ ] Update goal store with progress methods
- [ ] Wire goal service to persist updates
- [ ] Add localStorage history retrieval
- [ ] Implement progress cache invalidation

### Phase 5: Testing (2-3 days)
- [ ] Unit tests for all calculation formulas
- [ ] Integration tests for form submission
- [ ] Storage layer tests
- [ ] Validation schema tests

### Phase 6: Documentation & Polish (1-2 days)
- [ ] Complete remaining spec files
- [ ] Add inline code documentation
- [ ] Create developer quickstart
- [ ] Add accessibility checks

## Technical Decisions

### Decision 1: Immutable Progress History
- **Choice**: Store all updates in append-only log, never mutate
- **Rationale**: Enables audit trail, analytics, and undo/redo functionality
- **Trade-off**: Requires recalculation for current progress (mitigated by cache)

### Decision 2: Type-Safe Progress Formulas
- **Choice**: Separate calculation functions per goal type with full type safety
- **Rationale**: Prevents formula mixing, enables testing each independently
- **Trade-off**: More code, but clearer logic and easier maintenance

### Decision 3: Form Unification
- **Choice**: Single form with conditional rendering vs. separate type-specific forms
- **Rationale**: Consistent UX, code reuse, easier to extend with new goal types
- **Trade-off**: Form complexity grows, but justifiable for MVP

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| Progress formula bugs | High | High | Comprehensive unit tests, formula documentation |
| History bloat from duplicates | Medium | Medium | Duplicate detection, optional history cleanup |
| Concurrent update conflicts | Low | Medium | Timestamp + ID uniqueness, conflict detection |
| Storage quota exceeded | Low | High | Periodic history archiving, audit retention policy |

## Success Criteria

- ✅ All progress updates persist correctly to localStorage
- ✅ Progress calculations match formulas in BR-009, BR-010, BR-011
- ✅ Form validation prevents invalid updates
- ✅ Updates complete in <500ms on average
- ✅ 95% unit test coverage for calculation functions
- ✅ Type safety enforced throughout (no `any` types)
- ✅ Zero progress data loss scenarios identified in testing
