/**
 * Goals Feature - Type System
 *
 * This file re-exports all goal-related types from the specifications.
 * It serves as the single source of truth for type imports within the goals feature.
 *
 * All types are defined in `specs/types/goal.types.ts` to maintain consistency
 * across the application and ensure type safety.
 */

// Re-export enums (as values - this also exports them as types)
export {
  GoalType,
  GoalStatus,
  Priority,
  RecurrenceFrequency,
  QualitativeStatus,
} from '../../../../specs/types/goal.types';

// Re-export all types from specs
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
} from '../../../../specs/types/goal.types';

// Re-export type guards
export {
  isQuantitativeGoal,
  isQualitativeGoal,
  isBinaryGoal,
  isMilestoneGoal,
  isRecurringGoal,
  isHabitGoal,
} from '../../../../specs/types/goal.types';

