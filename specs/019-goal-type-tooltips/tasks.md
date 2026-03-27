# Tasks: Goal Type Tooltips Feature

**Feature**: 019-goal-type-tooltips  
**Generated**: 2026-03-26  
**Approach**: TDD (Test-Driven Development)

## Overview

This feature adds tooltip help to the Goal Type dropdown in the goal creation form. Tasks follow TDD approach: write tests first, then implement.

## Task Summary

| Phase   | Description                            | Tasks            |
| ------- | -------------------------------------- | ---------------- |
| Phase 1 | Setup & Tooltip Content                | 2                |
| Phase 2 | User Story 1 - Tooltip Implementation  | 4                |
| Phase 3 | User Story 2 - Distinguishing Tooltips | (covered by US1) |
| Phase 4 | User Story 3 - Selection Confidence    | (covered by US1) |
| Phase 5 | Polish & Accessibility                 | 2                |

**Total Tasks**: 8

---

## Phase 1: Setup & Tooltip Content

### Goal: Prepare tooltip content data structure

- [x] T001 Import Tooltip component in GoalForm.tsx  
       **File**: `src/features/goals/components/GoalForm/GoalForm.tsx`  
       **Description**: Add Ant Design Tooltip import to the existing imports from 'antd'

- [x] T002 Create goal type tooltip content helper  
       **File**: `src/features/goals/utils/goalTypeTooltips.ts` (new file)  
       **Description**: Create utility file exporting tooltip content for all 6 goal types with description and example

---

## Phase 2: User Story 1 - Tooltip Implementation

### Goal: Display tooltip for each goal type option (Priority: P1)

**Independent Test**: Open goal creation, hover over goal type dropdown, verify all 6 tooltips appear with accurate descriptions

- [x] T003 [P] [US1] Write unit tests for goal type tooltip rendering  
       **File**: `src/features/goals/components/GoalForm/GoalForm.tooltip.test.tsx` (new)  
       **Description**: Test that Tooltip component renders for each goal type option with correct title content

- [x] T004 [US1] Implement tooltips on Quantitative option  
       **File**: `src/features/goals/components/GoalForm/GoalForm.tsx` (lines ~269-270)  
       **Description**: Wrap Quantitative Option with Tooltip component using content from goalTypeTooltips.ts

- [x] T005 [US1] Implement tooltips on Qualitative, Binary, Milestone options  
       **File**: `src/features/goals/components/GoalForm/GoalForm.tsx` (lines ~272-276)  
       **Description**: Wrap Qualitative, Binary, and Milestone Options with Tooltip components

- [x] T006 [US1] Implement tooltips on Recurring, Habit options  
       **File**: `src/features/goals/components/GoalForm/GoalForm.tsx` (lines ~277-278)  
       **Description**: Wrap Recurring and Habit Options with Tooltip components

---

## Phase 3: User Story 2 - Distinguishing Tooltips

### Goal: Ensure each tooltip clearly distinguishes its goal type

**Note**: This is achieved by having distinct, descriptive content for each tooltip from Phase 2. No additional tasks needed as all 6 tooltips with unique descriptions are implemented in US1.

---

## Phase 4: User Story 3 - Informed Selection

### Goal: Provide examples that help users select correct type

**Note**: This is achieved through the example text in each tooltip from Phase 2. No additional tasks needed.

---

## Phase 5: Polish & Accessibility

### Goal: Final verification and accessibility compliance

- [x] T007 [P] Verify keyboard accessibility for tooltips  
       **File**: `src/features/goals/components/GoalForm/GoalForm.tsx`  
       **Description**: Ensure tooltips can be triggered via keyboard (Ant Design Tooltip supports this by default)

- [x] T008 Run full test suite and type-check  
       **Files**: All modified files  
       **Description**: Run `npm test` and `npm run type-check` to verify no regressions

---

## Dependencies

```
T001 ──┬─> T003 ──> T004 ──> T005 ──> T006 ──> T007 ──> T008
       │
T002 ──┘
```

## Parallel Execution

The following tasks can run in parallel:

- **T001 + T002**: Setup tasks (no dependencies between them)
- **T004, T005, T006**: Tooltip implementations (can be done in any order)
- **T007**: Polish task can run after all implementations

## Implementation Strategy

**MVP Scope**: User Story 1 (Phase 2) - This delivers the core value: tooltip help for each goal type. Users can immediately understand the difference between goal types when creating a goal.

**Incremental Delivery**:

1. First deliver all tooltips (Phase 2) - users can see help immediately
2. Then verify accessibility (Phase 5)

## Test Strategy (TDD)

- **Unit Tests**: Test Tooltip renders with correct content for each goal type
- **Integration Tests**: Test tooltip appears on hover/tap interaction
- **Accessibility Tests**: Verify keyboard navigation works

Run tests: `npm test` or `npx vitest run src/features/goals/components/GoalForm/GoalForm.tooltip.test.tsx`
