# Tasks: Update Goal Progress

## Implementation Checklist

Organized by implementation phase and priority. Track status with [TODO], [IN PROGRESS], [BLOCKED], [COMPLETED].

## Phase 1: Setup & Foundation (2-3 days)

### Type Definitions & Validation

- [ ] Create `/src/features/goals/types/progress.ts`
  - [ ] Define ProgressUpdate base interface
  - [ ] Define type-specific update interfaces (Quantitative, Qualitative, Binary, Milestone, Recurring, Habit)
  - [ ] Define type guards
- [ ] Create `/src/features/goals/validation/progressSchemas.ts`
  - [ ] Zod schema for QuantitativeProgressUpdate
  - [ ] Zod schema for QualitativeProgressUpdate
  - [ ] Zod schema for BinaryProgressUpdate
  - [ ] Zod schema for MilestoneProgressUpdate
  - [ ] Zod schema for HabitProgressUpdate
  - [ ] Composite update validator that uses goal type to select schema

- [ ] Create `/src/features/goals/utils/progressValidation.ts`
  - [ ] Function: validateQuantitativeUpdate(goalId, value, history)
  - [ ] Function: validateQualitativeUpdate(goalId, description, rating)
  - [ ] Function: validateBinaryUpdate(goalId, achieved)
  - [ ] Function: validateMilestoneUpdate(goalId, milestoneId, completed)
  - [ ] Function: validateHabitUpdate(goalId, date, completed)
  - [ ] Function: detectDuplicateUpdate(goalId, update, history, timeWindow = 60000ms)
  - [ ] Function: validateUpdateTimestamp(timestamp)

### Calculation Engine

- [ ] Create `/src/features/goals/utils/progressCalculation.ts`
  - [ ] Function: calculateQuantitativeProgress(startValue, currentValue, targetValue)
    - [ ] Handle division by zero
    - [ ] Clamp to [0, 100]
    - [ ] Add unit parameter
  - [ ] Function: calculateMilestoneProgress(completedCount, totalCount)
    - [ ] Validate minimum 1 milestone
    - [ ] Return percentage
  - [ ] Function: calculateBinaryProgress(achieved)
    - [ ] Return 0 or 100
  - [ ] Function: calculateHabitStreaks(goalId, updates)
    - [ ] Count consecutive completed days from today backwards
    - [ ] Return { currentStreak, longestStreak, bestDate }
  - [ ] Function: recalculateProgress(goalId, allUpdates)
    - [ ] Use update history to recompute current progress
    - [ ] Return updated progress value

- [ ] Create `/src/features/goals/utils/progressFormatters.ts`
  - [ ] Function: formatQuantitativeDisplay(value, unit, targetValue)
  - [ ] Function: formatProgressBar(progress, status)
  - [ ] Function: formatUpdateTimestamp(timestamp)

## Phase 2: State Management (1-2 days)

### Zustand Store Integration

- [ ] Create `/src/features/goals/store/progressStore.ts`
  - [ ] State interface: ProgressState
    - [ ] updates: Map<goalId, ProgressUpdate[]>
    - [ ] progressCache: Map<goalId, { value: number; lastUpdated: number }>
    - [ ] loading: boolean
    - [ ] error?: Error
  - [ ] Action: addProgressUpdate(goalId, update)
    - [ ] Validate update
    - [ ] Check duplicates
    - [ ] Append to history
    - [ ] Invalidate cache
    - [ ] Persist to localStorage
    - [ ] Return success/error
  - [ ] Action: getProgressHistory(goalId)
    - [ ] Load from store or localStorage
    - [ ] Return updates array
  - [ ] Action: getCurrentProgress(goalId)
    - [ ] Check cache first
    - [ ] Recalculate if stale or missing
    - [ ] Return cached value
  - [ ] Action: invalidateProgressCache(goalId)

### Hook Integration

- [ ] Create `/src/features/goals/hooks/useProgressUpdate.ts`
  - [ ] Hook: useProgressUpdate(goalId)
  - [ ] Returns: { progress, history, addUpdate, loading, error }
  - [ ] Integrates with Zustand store
  - [ ] Provides loading/error states

- [ ] Create `/src/features/goals/hooks/useProgressForm.ts`
  - [ ] Hook: useProgressForm(goalId, goalType)
  - [ ] Returns: { form, onSubmit, isLoading, validationErrors }
  - [ ] Uses Ant Design Form internally
  - [ ] Triggers validation before submit

## Phase 3: Form Components (2-3 days)

### Base Form Component

- [ ] Create `/src/features/goals/components/ProgressUpdateForm.tsx`
  - [ ] Props interface: ProgressUpdateFormProps
  - [ ] Accepts goalId, goalType, goal data
  - [ ] Renders type-specific fields conditionally
  - [ ] Has submit button with loading state
  - [ ] Displays validation errors
  - [ ] Calls onSuccess callback

### Type-Specific Form Fields

- [ ] Create `/src/features/goals/components/QuantitativeProgressField.tsx`
  - [ ] Input: number with unit label
  - [ ] Shows current/target values
  - [ ] Validation: ensure ≤ target
  - [ ] On blur: calculate projected progress

- [ ] Create `/src/features/goals/components/QualitativeProgressField.tsx`
  - [ ] Rich text input or markdown editor
  - [ ] Optional rating (1-5)
  - [ ] Character count display (max 5000)
  - [ ] Preview pane

- [ ] Create `/src/features/goals/components/BinaryProgressField.tsx`
  - [ ] Toggle or radio button (Achieved/Not Achieved)
  - [ ] Visual confirmation

- [ ] Create `/src/features/goals/components/MilestoneProgressField.tsx`
  - [ ] Dropdown to select milestone
  - [ ] Checkbox to mark complete
  - [ ] Shows current milestone count

- [ ] Create `/src/features/goals/components/HabitProgressField.tsx`
  - [ ] Date picker (default today)
  - [ ] Toggle for completed/missed
  - [ ] Shows streak counter

- [ ] Create `/src/features/goals/components/RecurringProgressField.tsx`
  - [ ] Dropdown for occurrence selection
  - [ ] Status selector (pending/completed/missed)
  - [ ] Completion date picker

### Form Integration

- [ ] Update `/src/features/goals/pages/GoalDetailPage.tsx`
  - [ ] Add ProgressUpdateForm section
  - [ ] Wire form submission to store
  - [ ] Display success toast on update
  - [ ] Refresh goal data after update

## Phase 4: Storage & Persistence (1-2 days)

### LocalStorage Layer

- [ ] Update `/src/services/storage/goalStorageService.ts`
  - [ ] Method: saveProgressUpdate(goalId, update)
  - [ ] Method: getProgressHistory(goalId)
  - [ ] Method: loadAllProgressData()
  - [ ] Ensure immutability of history

- [ ] Create `/src/services/storage/progressStorageService.ts`
  - [ ] Function: persistProgressUpdate(goalId, update)
  - [ ] Function: retrieveProgressHistory(goalId)
  - [ ] Function: deleteProgressHistory(goalId)
  - [ ] Function: archiveOldUpdates(goalId, daysToKeep = 365)

### Goal Data Synchronization

- [ ] Update `/src/services/api/goalService.ts`
  - [ ] When progress updates, also update goal.progress field
  - [ ] When progress updates, update goal.lastUpdated
  - [ ] When progress updates, check if goal status should transition

## Phase 5: Integration Testing (2-3 days)

### Unit Tests

- [ ] Create `/src/features/goals/utils/__tests__/progressCalculation.test.ts`
  - [ ] Test quantitative formula with various inputs
  - [ ] Test milestone formula
  - [ ] Test binary formula
  - [ ] Test division by zero handling
  - [ ] Test clamping to [0, 100]

- [ ] Create `/src/features/goals/utils/__tests__/progressValidation.test.ts`
  - [ ] Test each validation function
  - [ ] Test duplicate detection
  - [ ] Test timestamp validation
  - [ ] Test edge cases (negative values, null, etc.)

- [ ] Create `/src/features/goals/store/__tests__/progressStore.test.ts`
  - [ ] Test addProgressUpdate action
  - [ ] Test cache invalidation
  - [ ] Test history retrieval
  - [ ] Test concurrent updates

### Component Tests

- [ ] Create `/src/features/goals/components/__tests__/ProgressUpdateForm.test.tsx`
  - [ ] Test form rendering by goal type
  - [ ] Test form submission
  - [ ] Test validation error display
  - [ ] Test all type-specific fields

- [ ] Create `/src/features/goals/hooks/__tests__/useProgressUpdate.test.ts`
  - [ ] Test hook initialization
  - [ ] Test update submission
  - [ ] Test error handling
  - [ ] Test loading states

### Integration Tests

- [ ] Create `/src/features/goals/__tests__/progress-integration.test.ts`
  - [ ] Test end-to-end update flow
  - [ ] Test localStorage persistence
  - [ ] Test progress recalculation
  - [ ] Test goal status transitions

## Phase 6: Documentation & Polish (1-2 days)

### Code Documentation

- [ ] Add JSDoc comments to all functions
- [ ] Document Zod schema purposes
- [ ] Add inline comments for complex logic
- [ ] Document calculation formulas

### Developer Documentation

- [ ] Update `research.md` with implementation notes
- [ ] Update `quickstart.md` with usage examples
- [ ] Add troubleshooting guide for common issues
- [ ] Document duplicate detection behavior

### Quality Checks

- [ ] Accessibility audit: form fields have labels, error messages announced
- [ ] Performance: measure form submission time
- [ ] Type safety: verify no `any` types in progress code
- [ ] Error scenarios: test all validation edge cases

## Summary Stats

- **Total Tasks**: 47
- **Estimated Duration**: 12-16 days
- **Priority Breakdown**: 32 P1 (MVP), 12 P2 (Polish), 3 P3 (Future)
- **Test Coverage Target**: 95%+
