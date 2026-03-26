# Implementation Plan: Fix Milestone Goal Creation

**Branch**: `018-fix-milestone-goal-creation` | **Date**: 2026-03-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/018-fix-milestone-goal-creation/spec.md`

## Summary

Fix the bug where clicking "Create Goal" does nothing when trying to create a Milestone goal. The root cause is that `GoalForm.tsx` doesn't import or render the `MilestoneGoalFields` component, unlike `CreateGoalForm.tsx` which does.

## Technical Context

**Language/Version**: TypeScript 5.3.3  
**Primary Dependencies**: React 18.2.0, Ant Design 5.12.8, Zustand 4.4.7, React Query 5.17.9  
**Storage**: IndexedDB (via storage service layer)  
**Testing**: Vitest  
**Target Platform**: Web browser  
**Project Type**: Web application (React SPA)  
**Performance Goals**: Initial page load < 1.5s  
**Constraints**: None specific  
**Scale/Scope**: Single-page goal tracking application

## Constitution Check

GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.

- [x] **TypeScript strict mode**: All code uses strict TypeScript
- [x] **No `any` types**: Using proper typing throughout
- [x] **Client-side validation**: Form has validation rules
- [x] **Accessibility**: Ant Design components provide base accessibility
- [x] **Component separation**: Feature-based module structure

## Project Structure

### Documentation (this feature)

```
specs/018-fix-milestone-goal-creation/
├── plan.md              # This file
├── research.md          # Root cause analysis
├── spec.md              # Feature specification
├── data-model.md        # Not needed - data model unchanged
├── quickstart.md        # Not needed - no new features
└── contracts/           # Not needed - no external interfaces
```

### Source Code (repository root)

```
src/
├── features/goals/
│   └── components/
│       └── GoalForm/
│           ├── GoalForm.tsx       # FIX: Add MilestoneGoalFields
│           ├── MilestoneGoalFields.tsx  # Already exists
│           └── index.ts           # Already exports MilestoneGoalFields
```

**Structure Decision**: Single React project - no changes to structure needed.

## Fix Implementation

### Files to Modify

1. **`src/features/goals/components/GoalForm/GoalForm.tsx`**
   - Add import for `MilestoneGoalFields`
   - Add conditional rendering for `goalType === GoalType.MILESTONE`

### No Changes Required

- `src/features/goals/components/GoalForm/MilestoneGoalFields.tsx` - Already complete
- `src/validation/goal.schemas.ts` - Already supports Milestone
- `src/types/goal.types.ts` - Already has GoalType.MILESTONE

### Testing

- Run existing unit tests for MilestoneGoalFields
- Verify form submission works end-to-end
- Test validation scenarios

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| None      | N/A        | N/A                                  |
