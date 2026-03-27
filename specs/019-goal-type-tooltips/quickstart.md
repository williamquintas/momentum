# Quickstart: Goal Type Tooltips Feature

## Overview

Add tooltip help to the Goal Type dropdown in `src/features/goals/components/GoalForm/GoalForm.tsx` to help users understand each goal type.

## Location

- **Main file**: `src/features/goals/components/GoalForm/GoalForm.tsx` (lines 267-280)
- **Goal types**: `src/features/goals/types/goal.types.ts`

## Changes Required

### 1. Import Tooltip

```typescript
import { Tooltip } from 'antd';
```

### 2. Add Tooltip to Each Option

Wrap each `<Option>` with `<Tooltip>` containing descriptive text:

```tsx
<Select placeholder="Select goal type">
  <Option value={GoalType.QUANTITATIVE}>
    <Tooltip title="Track numeric progress from a starting value to a target value. Example: Running 100 miles, losing 10 kg, reading 20 books">
      Quantitative
    </Tooltip>
  </Option>
  {/* ... repeat for each goal type */}
</Select>
```

### 3. Tooltip Content Reference

| Goal Type    | Description                                 | Example                                |
| ------------ | ------------------------------------------- | -------------------------------------- |
| Quantitative | Track numeric progress from start to target | Running 100 miles, losing 10 kg        |
| Qualitative  | Track progress using status levels          | Learning a skill, completing a project |
| Binary       | Simple done/not-done goals                  | Submit report, attend meeting          |
| Milestone    | Break large goals into smaller phases       | Launch product, complete certification |
| Recurring    | Goals that repeat on a regular schedule     | Weekly reports, monthly reviews        |
| Habit        | Daily habits with streak tracking           | Exercise daily, meditate               |

## Testing

- Run `npm test` to execute existing tests
- Add unit tests for tooltip content and rendering
- Verify accessibility with keyboard navigation

## Related

- Issue #17: Add help explaining each type of Goal
- Spec: `specs/019-goal-type-tooltips/spec.md`
