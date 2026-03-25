/**
 * Goals Feature - Type System
 *
 * This file re-exports all goal-related types from the type definitions.
 * It serves as a convenience layer for type imports within the goals feature.
 *
 * Usage:
 *   import type { Goal, GoalType } from '@/features/goals/types';
 *   import { GoalType, isQuantitativeGoal } from '@/features/goals/types';
 */

// Re-export enums (as values - this also exports them as types)
export { GoalType, GoalStatus, Priority, RecurrenceFrequency, QualitativeStatus } from '@/types/goal.types';

// Re-export all types
export type {
  // Core Types
  Recurrence,
  Milestone,
  ProgressEntry,
  Note,
  Attachment,
  SelfAssessment,
  HabitEntry,
  Streak,
  CompletionStats,
  // Goal Type Interfaces
  BaseGoal,
  QuantitativeGoal,
  QualitativeGoal,
  BinaryGoal,
  MilestoneGoal,
  RecurringGoal,
  HabitGoal,
  // Union Type
  Goal,
  // DTO Types
  CreateGoalInput,
  UpdateGoalInput,
  GoalFilters,
  GoalSortField,
  SortOrder,
  GoalSortOptions,
  // Progress Calculation Types
  ProgressCalculation,
} from '@/types/goal.types';

// Re-export type guards
export {
  isQuantitativeGoal,
  isQualitativeGoal,
  isBinaryGoal,
  isMilestoneGoal,
  isRecurringGoal,
  isHabitGoal,
} from '@/types/goal.types';
