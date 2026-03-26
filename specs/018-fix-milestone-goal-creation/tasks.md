---
description: 'Task list for Fix Milestone Goal Creation bugfix'
---

# Tasks: Fix Milestone Goal Creation

**Input**: Design documents from `/specs/018-fix-milestone-goal-creation/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md

**Tests**: Not explicitly requested - existing tests can be run to verify

**Organization**: This is a bugfix - minimal task structure needed

## Phase 1: Fix Implementation

**Purpose**: Fix the missing MilestoneGoalFields in GoalForm.tsx

- [x] T001 [P] [US1] Import MilestoneGoalFields in src/features/goals/components/GoalForm/GoalForm.tsx
- [x] T002 [US1] Add conditional rendering for Milestone goal type in src/features/goals/components/GoalForm/GoalForm.tsx
- [x] T003 Add RecurringGoalFields rendering in GoalForm.tsx
- [x] T004 Add HabitGoalFields rendering in GoalForm.tsx
- [x] T005 Initialize milestones array with default value in form
- [x] T006 Add transform for Milestone-specific fields

---

## Phase 2: Verification

**Purpose**: Verify the fix works correctly

- [x] T007 Run existing MilestoneGoalFields unit tests
- [x] T008 Type check passes
- [x] T009 Lint passes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Fix Implementation (Phase 1)**: No dependencies - can start immediately
- **Verification (Phase 2)**: Depends on Phase 1 completion

### Parallel Opportunities

- T001 and T002 must be sequential (same file)
- T003, T004, T005, T006 can run in parallel after Phase 1 completes

---

## Implementation Strategy

### Quick Fix (Recommended)

1. Complete Phase 1: Fix Implementation
2. **STOP and VALIDATE**: Run tests to verify fix
3. Deploy if tests pass

### Verification Commands

```bash
# Run existing tests
npm test -- --run src/__tests__/features/goals/components/MilestoneGoalFields.test.tsx

# Run type check
npm run type-check

# Run lint
npm run lint
```

---

## Notes

- Fixed Recurring and Habit goal type fields (were also missing)
- Added default milestones array initialization for form submission
- Added Milestone-specific field transforms in form data
- Unit tests pass for MilestoneGoalFields component
