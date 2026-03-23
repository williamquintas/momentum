# Data Model: Complete Goal

## Overview

This document defines the data structures, validation rules, and storage patterns for the Complete Goal feature.

## Core Entities

### CompletionEvent

```typescript
interface CompletionEvent {
  goalId: string;
  completedAt: number;
  completionType: 'manual' | 'automatic' | 'deadline';
  finalProgress: number;
  notes?: string;
  celebration?: CelebrationData;
}
```

### GoalCompletion

```typescript
interface GoalCompletion extends CompletionEvent {
  goalId: string;
  originalGoal: Goal; // Snapshot of goal at completion time
  completionCriteria: CompletionCriteria;
  metrics: CompletionMetrics;
}
```

### CompletionCriteria

```typescript
interface CompletionCriteria {
  type: GoalType;
  targetAchieved: boolean;
  deadlineMet?: boolean;
  milestonesCompleted?: boolean;
  recurringOccurrencesCompleted?: boolean;
  habitStreakAchieved?: boolean;
}
```

### CompletionMetrics

```typescript
interface CompletionMetrics {
  totalTime: number; // Days from creation to completion
  totalUpdates: number;
  averageProgressRate: number; // Progress per day
  longestStreak?: number; // For habit goals
  finalMilestoneCount?: number; // For milestone goals
}
```

### CelebrationData

```typescript
interface CelebrationData {
  type: 'achievement' | 'milestone' | 'streak' | 'deadline';
  message: string;
  badge?: string;
  sound?: boolean;
  animation?: boolean;
}
```

## Validation Rules

### BR-012: Completion Eligibility

- Goal must be in 'active' status
- For quantitative goals: currentValue >= targetValue
- For milestone goals: all milestones completed
- For binary goals: achieved = true
- For recurring goals: all scheduled occurrences completed
- For habit goals: streak requirement met (if any)

### BR-013: Completion Immutability

- Once completed, goal cannot be reactivated
- Completion event is immutable
- Progress updates blocked after completion
- Status permanently set to 'completed'

### BR-014: Automatic Completion Detection

- Quantitative: Trigger when currentValue >= targetValue
- Binary: Trigger when achieved = true
- Milestone: Trigger when all milestones completed
- Recurring: Trigger when all occurrences completed
- Habit: Trigger when streak target reached

## Storage Strategy

### Completion History Table

```typescript
interface CompletionHistory {
  [goalId: string]: GoalCompletion;
}
```

### Goal Status Transitions

```typescript
interface GoalStatusTransition {
  goalId: string;
  fromStatus: GoalStatus;
  toStatus: GoalStatus;
  timestamp: number;
  trigger: 'manual' | 'automatic' | 'deadline';
  metadata?: Record<string, any>;
}
```

### Storage Schema

- Store completion events separately from goals
- Maintain goal snapshots for historical accuracy
- Enable completion analytics and reporting
- Support completion undo (archive) for admin purposes

## Type Guards

```typescript
function isCompletedGoal(goal: Goal): boolean {
  return goal.status === 'completed';
}

function isEligibleForCompletion(goal: Goal): boolean {
  return goal.status === 'active' && validateCompletionCriteria(goal);
}

function canBeCompletedAutomatically(goal: Goal): boolean {
  switch (goal.type) {
    case 'quantitative':
      return goal.currentValue >= goal.targetValue;
    case 'binary':
      return goal.achieved === true;
    case 'milestone':
      return goal.milestones.every((m) => m.completed);
    case 'recurring':
      return goal.occurrences.every((o) => o.status === 'completed');
    case 'habit':
      return goal.streak >= (goal.streakTarget || 0);
    default:
      return false;
  }
}
```

## Relationships

- **Goal ← CompletionEvent**: One-to-one, created on completion
- **CompletionEvent → CompletionMetrics**: One-to-one, calculated at completion
- **Goal → CompletionCriteria**: One-to-one, validated before completion
- **CompletionEvent → CelebrationData**: Optional, for UI feedback

## Constraints

- Completion events are **append-only** (no deletion)
- Only one completion event per goal
- Completion must be validated before creation
- Automatic completion requires explicit user confirmation for major goals
- Completion metrics calculated from historical data (immutable after creation)
