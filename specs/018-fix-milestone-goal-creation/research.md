# Research: Fix Milestone Goal Creation

## Issue Summary

The "Create Goal" button does nothing when attempting to create a Milestone goal. No error is displayed and the form doesn't submit.

## Root Cause Analysis

**Decision**: Missing MilestoneGoalFields component in GoalForm.tsx

**Rationale**:

- `CreateGoalModal` uses `GoalForm` component (not `CreateGoalForm`)
- `GoalForm.tsx` (line 14-16 in imports) does NOT import `MilestoneGoalFields`
- The Type-Specific Fields section (lines 270-376) only handles: QUANTITATIVE, BINARY, QUALITATIVE
- No rendering exists for `goalType === GoalType.MILESTONE`
- The validation schema (`CreateGoalInputSchema`) DOES support Milestone type
- The type definition (`GoalType` enum) DOES include MILESTONE

**Alternative approaches evaluated**:

1. Use `CreateGoalForm` instead of `GoalForm` in CreateGoalModal - Rejected because GoalForm has better validation (Zod) and is more complete
2. Fix GoalForm.tsx to include Milestone support - Selected as cleanest fix

## Fix Implementation

### Required Changes

1. **Import MilestoneGoalFields** in `src/features/goals/components/GoalForm/GoalForm.tsx`:

   ```typescript
   import {
     QuantitativeGoalFields,
     QualitativeGoalFields,
     BinaryGoalFields,
     MilestoneGoalFields, // ADD THIS
     RecurringGoalFields,
     HabitGoalFields,
   } from './GoalForm';
   ```

2. **Add conditional rendering** in GoalForm.tsx after the Qualitative section:
   ```typescript
   {goalType === GoalType.MILESTONE && <MilestoneGoalFields />}
   ```

### Verification

- Unit test: Create goal with Milestone type should include milestones array
- Integration test: Full flow from modal open to goal creation
