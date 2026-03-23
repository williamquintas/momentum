# Data Model: Update Goal Progress

## Overview

This document defines the data structures, validation rules, and storage patterns for the Update Goal Progress feature.

## Core Entities

### ProgressUpdate

```typescript
interface ProgressUpdate {
  goalId: string;
  timestamp: number;
  previousValue: number;
  currentValue: number;
  change: number;
  notes?: string;
  type: 'quantitative' | 'qualitative' | 'binary' | 'milestone' | 'recurring' | 'habit';
}
```

### QuantitativeProgressUpdate

```typescript
interface QuantitativeProgressUpdate extends ProgressUpdate {
  type: 'quantitative';
  unit: string;
  currentValue: number; // Must respect goal.targetValue
}
```

### QualitativeProgressUpdate

```typescript
interface QualitativeProgressUpdate extends ProgressUpdate {
  type: 'qualitative';
  description: string; // Rich text or markdown
  rating?: number; // 1-5 optional rating
}
```

### BinaryProgressUpdate

```typescript
interface BinaryProgressUpdate extends ProgressUpdate {
  type: 'binary';
  achieved: boolean;
}
```

### MilestoneProgressUpdate

```typescript
interface MilestoneProgressUpdate extends ProgressUpdate {
  type: 'milestone';
  milestoneId: string;
  completed: boolean;
}
```

### RecurringGoalOccurrence

```typescript
interface RecurringGoalOccurrence {
  goalId: string;
  occurrenceId: string;
  startDate: number;
  endDate: number;
  status: 'pending' | 'completed' | 'missed';
  progress: number; // 0-100
  completedAt?: number;
}
```

### HabitProgressUpdate

```typescript
interface HabitProgressUpdate extends ProgressUpdate {
  type: 'habit';
  date: string; // YYYY-MM-DD
  completed: boolean;
  streak?: number;
}
```

## Validation Rules

### BR-001: Progress Value Boundaries

- Quantitative: currentValue must not exceed targetValue for goals without overrun
- Binary: progress is always 0 or 100
- Milestone: progress = (completed count / total count) \* 100
- Recurring: each occurrence tracks independently
- Habit: daily binary tracking

### BR-009: Quantitative Progress Formula

```
progress = ((currentValue - startValue) / (targetValue - startValue)) * 100
```

- Clamp to [0, 100] unless goal allows negative progress or overrun
- Handle division by zero (targetValue === startValue)

### BR-010: Milestone Progress Formula

```
progress = (completedMilestones / totalMilestones) * 100
```

- Require at minimum 1 milestone
- Validate no cyclic dependencies before allowing completion

### BR-011: Binary Progress Formula

```
progress = (achieved ? 1 : 0) * 100
```

- Either 0% or 100%
- Can transition from 100 → 0 if goal reactivated

## Storage Strategy

### Progress History Table

```typescript
interface ProgressHistory {
  [goalId: string]: ProgressUpdate[];
}
```

### Goal Progress Cache

```typescript
interface GoalProgress {
  goalId: string;
  currentProgress: number;
  lastUpdated: number;
  updateCount: number;
}
```

### Storage Schema

- Store updates in chronological order
- Maintain normalized references to goals
- Enable time-range queries (last 7 days, month, year)
- Support duplicate detection (same value, same timestamp)

## Type Guards

```typescript
function isQuantitativeUpdate(update: ProgressUpdate): update is QuantitativeProgressUpdate {
  return update.type === 'quantitative';
}

function isQualitativeUpdate(update: ProgressUpdate): update is QualitativeProgressUpdate {
  return update.type === 'qualitative';
}

function isMilestoneUpdate(update: ProgressUpdate): update is MilestoneProgressUpdate {
  return update.type === 'milestone';
}

function isHabitUpdate(update: ProgressUpdate): update is HabitProgressUpdate {
  return update.type === 'habit';
}
```

## Relationships

- **Goal ← ProgressUpdate**: Many-to-one, cascading on goal deletion
- **ProgressUpdate → ProgressHistory**: Appended in chronological order
- **Milestone ← MilestoneProgressUpdate**: Many-to-one, dependent updates
- **RecurringGoal ← RecurringGoalOccurrence**: One-to-many occurrences per cycle

## Constraints

- Progress updates are **immutable** once created (no editing history)
- ProgressUpdate.timestamp must be ≤ current time
- Qualitative descriptions must be 1-5000 characters
- Binary progress updates cannot have partial states
- Milestone completion cannot be undone without archiving goal
