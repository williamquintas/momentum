/**
 * Goals Feature - Type System
 *
 * This file re-exports all goal-related types from the specifications.
 * It serves as a convenience layer for type imports within the goals feature.
 *
 * Architecture Decision:
 * - Types are defined in `@specs/types/goal.types.ts` as the authoritative source
 * - The `specs/` directory contains specifications (types, validation schemas, business rules)
 * - This feature's `types/index.ts` provides a clean API for importing types
 * - This separation allows specs to be shared across documentation, validation, and implementation
 *
 * Usage:
 *   import type { Goal, GoalType } from '@/features/goals/types';
 *   import { GoalType, isQuantitativeGoal } from '@/features/goals/types';
 */

// Re-export enums (as values - this also exports them as types)
export { GoalType, GoalStatus, Priority, RecurrenceFrequency, QualitativeStatus } from '@specs/types/goal.types';

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
} from '@specs/types/goal.types';

// Re-export type guards
export {
  isQuantitativeGoal,
  isQualitativeGoal,
  isBinaryGoal,
  isMilestoneGoal,
  isRecurringGoal,
  isHabitGoal,
} from '@specs/types/goal.types';
