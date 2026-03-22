# Tasks: Complete Goal

## Implementation Checklist

Organized by implementation phase and priority. Track status with [TODO], [IN PROGRESS], [BLOCKED], [COMPLETED].

## Phase 1: Core Completion Logic (3-4 days)

### Completion Validation Engine
- [ ] Create `/src/features/goals/utils/completionValidation.ts`
  - [ ] Function: validateCompletionEligibility(goal)
    - [ ] Check goal status is 'active'
    - [ ] Validate type-specific completion criteria
    - [ ] Return validation result with error messages
  
  - [ ] Function: getCompletionCriteria(goal)
    - [ ] Extract completion requirements by goal type
    - [ ] Return structured criteria object
  
  - [ ] Function: isEligibleForCompletion(goal)
    - [ ] Wrapper for validateCompletionEligibility
    - [ ] Return boolean result

- [ ] Create `/src/features/goals/utils/completionEligibility.ts`
  - [ ] Function: checkQuantitativeCompletion(goal)
    - [ ] Verify currentValue >= targetValue
    - [ ] Handle edge cases (zero targets, negative values)
  
  - [ ] Function: checkBinaryCompletion(goal)
    - [ ] Verify achieved = true
  
  - [ ] Function: checkMilestoneCompletion(goal)
    - [ ] Verify all milestones completed
    - [ ] Check for circular dependencies
  
  - [ ] Function: checkRecurringCompletion(goal)
    - [ ] Verify all occurrences completed
    - [ ] Check occurrence deadlines
  
  - [ ] Function: checkHabitCompletion(goal)
    - [ ] Verify streak requirements met
    - [ ] Check habit frequency compliance

### Completion Metrics Calculator
- [ ] Create `/src/features/goals/utils/completionMetrics.ts`
  - [ ] Function: calculateCompletionMetrics(goal, history)
    - [ ] Calculate total time (creation to completion)
    - [ ] Count total progress updates
    - [ ] Calculate average progress rate
    - [ ] Extract goal-specific metrics
  
  - [ ] Function: calculateQuantitativeMetrics(goal, history)
    - [ ] Progress velocity (progress/day)
    - [ ] Overshoot percentage
    - [ ] Update frequency
  
  - [ ] Function: calculateMilestoneMetrics(goal, history)
    - [ ] Completion order analysis
    - [ ] Time per milestone
    - [ ] Milestone efficiency
  
  - [ ] Function: calculateHabitMetrics(goal, history)
    - [ ] Longest streak achieved
    - [ ] Completion consistency
    - [ ] Daily completion rate
  
  - [ ] Function: calculateRecurringMetrics(goal, history)
    - [ ] Occurrence completion rate
    - [ ] On-time completion percentage
    - [ ] Pattern adherence

### Completion Event Types
- [ ] Create `/src/features/goals/types/completion.ts`
  - [ ] Define CompletionEvent interface
  - [ ] Define CompletionCriteria interface
  - [ ] Define CompletionMetrics interface
  - [ ] Define CelebrationData interface
  - [ ] Add type guards and utility types

- [ ] Create `/src/features/goals/validation/completionSchemas.ts`
  - [ ] Zod schema for CompletionEvent
  - [ ] Zod schema for CompletionCriteria
  - [ ] Zod schema for CompletionMetrics
  - [ ] Validation functions for each schema

## Phase 2: State Management (2-3 days)

### Zustand Completion Store
- [ ] Create `/src/features/goals/store/completionStore.ts`
  - [ ] State interface: CompletionState
    - [ ] completions: Map<goalId, CompletionEvent>
    - [ ] pendingCompletions: Set<goalId>
    - [ ] loading: boolean
    - [ ] error: Error | null
  
  - [ ] Action: completeGoal(goalId, options)
    - [ ] Validate completion eligibility
    - [ ] Calculate completion metrics
    - [ ] Create completion event
    - [ ] Update goal status
    - [ ] Persist to localStorage
    - [ ] Trigger celebration
  
  - [ ] Action: checkCompletionEligibility(goalId)
    - [ ] Run eligibility checks
    - [ ] Update pending completions
    - [ ] Return eligibility status
  
  - [ ] Action: getCompletionHistory(goalId)
    - [ ] Retrieve completion event
    - [ ] Include goal snapshot
    - [ ] Return formatted history

### Goal Store Integration
- [ ] Update `/src/features/goals/store/goalStore.ts`
  - [ ] Add completion-related actions
  - [ ] Update goal status on completion
  - [ ] Add completion timestamp
  - [ ] Prevent updates to completed goals

### Completion Detection Hook
- [ ] Create `/src/features/goals/hooks/useCompletionDetection.ts`
  - [ ] Hook: useCompletionDetection(goalId)
  - [ ] Monitors goal progress for completion eligibility
  - [ ] Returns eligibility status and criteria
  - [ ] Triggers on progress updates

## Phase 3: Completion UI (2-3 days)

### Completion Dialog Component
- [ ] Create `/src/features/goals/components/CompleteGoalDialog.tsx`
  - [ ] Props interface: CompleteGoalDialogProps
  - [ ] Modal dialog with completion confirmation
  - [ ] Shows completion criteria and metrics
  - [ ] Includes celebration preferences
  - [ ] Handles completion submission

### Completion Criteria Display
- [ ] Create `/src/features/goals/components/CompletionCriteriaDisplay.tsx`
  - [ ] Shows why goal can be completed
  - [ ] Type-specific criteria visualization
  - [ ] Progress indicators for each criterion
  - [ ] Clear messaging for requirements

### Completion Metrics Preview
- [ ] Create `/src/features/goals/components/CompletionMetricsPreview.tsx`
  - [ ] Shows final statistics before completion
  - [ ] Time elapsed, updates made, progress rate
  - [ ] Goal-specific metrics (streaks, milestones, etc.)
  - [ ] Formatted display with icons

### Completion Button Integration
- [ ] Update `/src/pages/GoalDetailPage.tsx`
  - [ ] Add completion button when eligible
  - [ ] Show completion eligibility indicator
  - [ ] Handle completion dialog opening
  - [ ] Update UI after completion

### Completion Success Feedback
- [ ] Create `/src/features/goals/components/CompletionSuccess.tsx`
  - [ ] Celebration animation component
  - [ ] Success message with metrics
  - [ ] Next steps suggestions
  - [ ] Social sharing options (future)

## Phase 4: Celebration System (1-2 days)

### Celebration Components
- [ ] Create `/src/features/goals/components/celebrations/`
  - [ ] AchievementBadge.tsx - Badge display
  - [ ] CelebrationAnimation.tsx - Animation wrapper
  - [ ] CelebrationSound.tsx - Audio feedback
  - [ ] CelebrationToast.tsx - Toast notifications

### Celebration Preferences
- [ ] Create `/src/features/goals/components/CelebrationSelector.tsx`
  - [ ] User preference controls
  - [ ] Celebration type selection
  - [ ] Accessibility options (sound, animation)
  - [ ] Save preferences to localStorage

### Celebration Engine
- [ ] Create `/src/features/goals/utils/celebrationEngine.ts`
  - [ ] Function: getCelebrationForGoal(goal)
    - [ ] Determine celebration type by goal characteristics
    - [ ] Respect user preferences
    - [ ] Return celebration configuration
  
  - [ ] Function: triggerCelebration(celebrationData)
    - [ ] Execute celebration sequence
    - [ ] Handle multiple celebration types
    - [ ] Respect timing and accessibility

## Phase 5: Integration & Testing (2-3 days)

### Storage Integration
- [ ] Update `/src/services/storage/goalStorageService.ts`
  - [ ] Method: saveCompletionEvent(goalId, event)
  - [ ] Method: getCompletionHistory(goalId)
  - [ ] Method: updateGoalStatusOnCompletion(goalId)
  - [ ] Ensure atomic operations

### Progress Update Integration
- [ ] Update `/src/features/goals/hooks/useProgressUpdate.ts`
  - [ ] Check completion eligibility after updates
  - [ ] Trigger completion detection
  - [ ] Show completion prompt when eligible

### Automatic Completion Detection
- [ ] Create `/src/features/goals/hooks/useAutomaticCompletion.ts`
  - [ ] Background monitoring for completion eligibility
  - [ ] Debounced checking to avoid performance issues
  - [ ] User notification when goal becomes completable

### Unit Tests
- [ ] Create `/src/features/goals/utils/__tests__/completionValidation.test.ts`
  - [ ] Test eligibility checks for all goal types
  - [ ] Test validation error messages
  - [ ] Test edge cases and boundary conditions

- [ ] Create `/src/features/goals/utils/__tests__/completionMetrics.test.ts`
  - [ ] Test metrics calculation accuracy
  - [ ] Test different goal types and scenarios
  - [ ] Test performance with large histories

- [ ] Create `/src/features/goals/store/__tests__/completionStore.test.ts`
  - [ ] Test completion actions
  - [ ] Test state transitions
  - [ ] Test error handling

### Component Tests
- [ ] Create `/src/features/goals/components/__tests__/CompleteGoalDialog.test.tsx`
  - [ ] Test dialog rendering and interactions
  - [ ] Test completion submission
  - [ ] Test validation error display

### Integration Tests
- [ ] Create `/src/features/goals/__tests__/completion-integration.test.ts`
  - [ ] Test end-to-end completion flow
  - [ ] Test automatic detection
  - [ ] Test storage persistence
  - [ ] Test goal status transitions

## Phase 6: Documentation & Polish (1-2 days)

### Code Documentation
- [ ] Add JSDoc comments to all completion functions
- [ ] Document completion criteria for each goal type
- [ ] Add inline comments for complex logic
- [ ] Document celebration system architecture

### Developer Documentation
- [ ] Update `research.md` with implementation decisions
- [ ] Update `quickstart.md` with completion examples
- [ ] Add troubleshooting guide for completion issues
- [ ] Document completion analytics

### Quality Checks
- [ ] Accessibility audit: completion dialogs WCAG compliant
- [ ] Performance: completion calculation <500ms
- [ ] Type safety: no `any` types in completion code
- [ ] Error scenarios: graceful handling of completion failures

## Summary Stats
- **Total Tasks**: 58
- **Estimated Duration**: 12-16 days
- **Priority Breakdown**: 38 P1 (MVP), 15 P2 (Enhanced), 5 P3 (Future)
- **Test Coverage Target**: 95%+
- **Key Dependencies**: 001-create-goal, 002-update-goal-progress
