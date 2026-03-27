# Data Model: Goal Type Tooltips Feature

## Overview

This feature adds UI tooltips to the Goal Type dropdown in the goal creation form. No new data entities or storage changes required.

## Existing Entities

### GoalType Enum

Reused from existing `src/features/goals/types/goal.types.ts`:

| Value        | Description                                 |
| ------------ | ------------------------------------------- |
| QUANTITATIVE | Track numeric progress from start to target |
| QUALITATIVE  | Track progress using status levels          |
| BINARY       | Simple done/not-done goals                  |
| MILESTONE    | Break large goals into smaller phases       |
| RECURRING    | Goals that repeat on a regular schedule     |
| HABIT        | Daily habits with streak tracking           |

## Tooltip Content Structure

The tooltip content is static UI text, not stored data:

```typescript
interface TooltipContent {
  goalType: GoalType;
  title: string;
  description: string;
  example: string;
}
```

## State Management

No new state required. Tooltips are purely presentational UI components.

## Validation

Tooltips display static content - no validation needed.

## Notes

- This is a pure UI feature with no data model changes
- Tooltip content is defined in code (localization-ready for future i18n)
- No API or storage layer changes needed
