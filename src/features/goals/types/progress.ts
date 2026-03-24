/**
 * Progress Update Types
 *
 * Type definitions for progress updates across all goal types.
 * These types complement the goal.types.ts definitions.
 */

import type { Goal } from '@/features/goals/types';

/**
 * Base interface for all progress updates
 */
export interface BaseProgressUpdate {
  id: string;
  goalId: string;
  timestamp: number;
  note?: string;
  createdBy?: string;
}

/**
 * Quantitative progress update
 */
export interface QuantitativeProgressUpdate extends BaseProgressUpdate {
  type: 'quantitative';
  previousValue: number;
  newValue: number;
  unit: string;
  calculatedProgress: number;
}

/**
 * Binary progress update
 */
export interface BinaryProgressUpdate extends BaseProgressUpdate {
  type: 'binary';
  previousCount: number;
  newCount: number;
  targetCount?: number;
  calculatedProgress: number;
}

/**
 * Qualitative progress update
 */
export interface QualitativeProgressUpdate extends BaseProgressUpdate {
  type: 'qualitative';
  previousStatus: string;
  newStatus: string;
  rating?: number;
  calculatedProgress: number;
}

/**
 * Milestone progress update
 */
export interface MilestoneProgressUpdate extends BaseProgressUpdate {
  type: 'milestone';
  milestoneId: string;
  milestoneTitle: string;
  completed: boolean;
  calculatedProgress: number;
}

/**
 * Recurring progress update
 */
export interface RecurringProgressUpdate extends BaseProgressUpdate {
  type: 'recurring';
  occurrenceId: string;
  status: 'pending' | 'completed' | 'missed';
  completionDate?: Date;
  calculatedProgress: number;
}

/**
 * Habit progress update
 */
export interface HabitProgressUpdate extends BaseProgressUpdate {
  type: 'habit';
  date: Date;
  completed: boolean;
  streakUpdate?: {
    previousStreak: number;
    newStreak: number;
  };
  calculatedProgress: number;
}

/**
 * Union type for all progress updates
 */
export type ProgressUpdate =
  | QuantitativeProgressUpdate
  | BinaryProgressUpdate
  | QualitativeProgressUpdate
  | MilestoneProgressUpdate
  | RecurringProgressUpdate
  | HabitProgressUpdate;

/**
 * Progress history for a goal
 */
export interface ProgressHistory {
  goalId: string;
  updates: ProgressUpdate[];
  lastUpdated: number;
}

/**
 * Input for creating a progress update
 */
export interface CreateProgressUpdateInput {
  goalId: string;
  note?: string;
  typeSpecificData: TypeSpecificUpdateData;
}

export type TypeSpecificUpdateData =
  | { type: 'quantitative'; currentValue: number }
  | { type: 'binary'; currentCount: number }
  | { type: 'qualitative'; status: string; rating?: number }
  | { type: 'milestone'; milestoneId: string; completed: boolean }
  | { type: 'recurring'; occurrenceId: string; status: 'pending' | 'completed' | 'missed' }
  | { type: 'habit'; date: Date; completed: boolean };

/**
 * Validation result for progress updates
 */
export interface ProgressValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Duplicate detection result
 */
export interface DuplicateDetectionResult {
  isDuplicate: boolean;
  originalUpdate?: ProgressUpdate;
  timeDifference?: number;
}

/**
 * Progress update filters
 */
export interface ProgressUpdateFilters {
  goalId?: string;
  startDate?: Date;
  endDate?: Date;
  updateTypes?: ProgressUpdate['type'][];
}

/**
 * Type guards for progress updates
 */
export function isQuantitativeProgressUpdate(update: ProgressUpdate): update is QuantitativeProgressUpdate {
  return update.type === 'quantitative';
}

export function isBinaryProgressUpdate(update: ProgressUpdate): update is BinaryProgressUpdate {
  return update.type === 'binary';
}

export function isQualitativeProgressUpdate(update: ProgressUpdate): update is QualitativeProgressUpdate {
  return update.type === 'qualitative';
}

export function isMilestoneProgressUpdate(update: ProgressUpdate): update is MilestoneProgressUpdate {
  return update.type === 'milestone';
}

export function isRecurringProgressUpdate(update: ProgressUpdate): update is RecurringProgressUpdate {
  return update.type === 'recurring';
}

export function isHabitProgressUpdate(update: ProgressUpdate): update is HabitProgressUpdate {
  return update.type === 'habit';
}

/**
 * Get type-specific fields from a goal for progress update
 */
export function getProgressUpdateFields(goal: Goal): Record<string, unknown> {
  switch (goal.type) {
    case 'quantitative':
      return {
        currentValue: goal.currentValue,
        unit: goal.unit,
      };
    case 'binary':
      return {
        currentCount: goal.currentCount,
        targetCount: goal.targetCount,
      };
    case 'qualitative':
      return {
        status: goal.qualitativeStatus,
      };
    case 'milestone':
      return {
        milestones: goal.milestones,
        allowMilestoneReordering: goal.allowMilestoneReordering,
        requireSequentialCompletion: goal.requireSequentialCompletion,
      };
    case 'recurring':
      return {
        completionStats: goal.completionStats,
      };
    case 'habit':
      return {
        completionStats: goal.completionStats,
        entries: goal.entries,
      };
    default:
      return {};
  }
}
