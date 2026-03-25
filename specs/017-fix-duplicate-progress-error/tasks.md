---
description: 'TDD Task list for fixing duplicate progress update error'
---

# Tasks: Fix Duplicate Progress Update Error (TDD Workflow)

**Input**: Design documents from `/specs/017-fix-duplicate-progress-error/`
**Approach**: Test-Driven Development - Write tests FIRST, then implement

---

## Phase 1: Write Bugfix-Specific Test (User Story 1)

**Goal**: Add failing test that reproduces the bug - first-time progress update should NOT trigger duplicate error

### Tests - Write First (Should FAIL)

- [x] T001 [P] [US1] Add test case for first-time progress update in src/**tests**/features/goals/progressHistory.test.ts
  - Test: Given undefined progressHistory, when detectDuplicateUpdate is called, then isDuplicate should be false (test FAILS - bug confirmed)

---

## Phase 2: Run Existing Tests (Verify Baseline)

**Goal**: Confirm existing tests pass before making changes

- [x] T002 Run existing tests: `npm test -- --run src/__tests__/features/goals/progressHistory.test.ts` (23 pass, 1 fails - our new test)
- [x] T003 Run useUpdateProgress tests: `npm test -- --run src/__tests__/features/goals/useUpdateProgress.test.tsx` (4 pass)

---

## Phase 3: Implement Fix

**Goal**: Fix the duplicate detection logic

### Investigation

- [x] T004 [P] Add debug logging to trace history state in detectDuplicateUpdate in src/features/goals/utils/progressValidation.ts (root cause found: undefined history)

### Fix

- [x] T005 Fix detectDuplicateUpdate to properly handle edge cases in src/features/goals/utils/progressValidation.ts (added null/undefined check)
- [x] T006 Add defensive validation in useUpdateProgress.ts if needed (not needed - fix in validation function covers it)

---

## Phase 4: Verify Fix

**Goal**: Ensure bugfix works and doesn't break existing functionality

### Run Tests

- [x] T007 Run progressHistory tests: `npm test -- --run src/__tests__/features/goals/progressHistory.test.ts` (24 pass)
- [x] T008 Run useUpdateProgress tests: `npm test -- --run src/__tests__/features/goals/useUpdateProgress.test.tsx` (4 pass)

---

## Phase 5: Full Test Suite

**Goal**: Ensure ALL tests in the project pass

- [x] T009 [P] Run full test suite: `npm test -- --run` (229 pass, 3 fail - pre-existing failures in HabitGoalFields.test.tsx)
- [x] T010 [P] Run lint: `npm run lint` (pass)
- [x] T011 Run type-check: `npm run type-check` (pass)

---

## Phase 6: Commit

**Goal**: Commit changes with conventional commit message

- [x] T012 Commit changes: Committed as fix(goals): handle undefined history in duplicate detection

---

## Dependencies & Execution Order

### TDD Flow

1. Write failing test (T001)
2. Run existing tests to establish baseline (T002, T003)
3. Implement fix (T004, T005, T006)
4. Verify fix with tests (T007, T008)
5. Run full test suite (T009-T011)
6. Commit (T012)

### Parallel Opportunities

- T002, T003 can run in parallel
- T009, T010 can run in parallel

---

## Test Strategy

**Focus**: Only add one test case that reproduces the bug
**Goal**: All existing tests + new test must pass
**Coverage**: Existing tests already cover the logic; fix ensures edge case works
