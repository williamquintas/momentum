/**
 * Goal Completion Types
 *
 * Type definitions for goal completion functionality including
 * completion events, criteria, metrics, and celebration data.
 */

import { GoalType } from '@/types/goal.types';

/**
 * Type of completion trigger
 */
export type CompletionType = 'manual' | 'automatic' | 'override';

/**
 * Completion criteria for a specific goal type
 */
export interface CompletionCriteria {
  goalType: GoalType;
  requirements: string[];
  met: boolean;
  partialMet?: string[];
}

/**
 * Base metrics calculated at completion time
 */
export interface CompletionMetrics {
  totalTime: number;
  totalUpdates: number;
  averageProgressRate: number;
  calculatedAt: number;
  version: string;
}

/**
 * Type-specific completion metrics
 */
export interface QuantitativeMetrics extends CompletionMetrics {
  progressVelocity: number;
  overshootPercentage: number;
  updateFrequency: number;
}

export interface MilestoneMetrics extends CompletionMetrics {
  completionOrder: number[];
  timePerMilestone: number[];
  milestoneEfficiency: number;
}

export interface HabitMetrics extends CompletionMetrics {
  longestStreak: number;
  completionConsistency: number;
  dailyCompletionRate: number;
}

export interface RecurringMetrics extends CompletionMetrics {
  occurrenceCompletionRate: number;
  onTimeCompletionPercentage: number;
  patternAdherence: number;
}

/**
 * Union of all type-specific metrics
 */
export type GoalCompletionMetrics =
  | CompletionMetrics
  | QuantitativeMetrics
  | MilestoneMetrics
  | HabitMetrics
  | RecurringMetrics;

/**
 * Celebration data for completion feedback
 */
export interface CelebrationData {
  type: 'subtle' | 'moderate' | 'enthusiastic';
  message: string;
  badge?: string;
  animation: boolean;
  sound: boolean;
}

/**
 * Completion event - immutable record of goal completion
 */
export interface CompletionEvent {
  id: string;
  goalId: string;
  completedAt: number;
  completionType: CompletionType;
  finalProgress: number;
  metrics: GoalCompletionMetrics;
  celebration: CelebrationData;
  note?: string;
  overrideReason?: string;
}

/**
 * Validation result for completion eligibility
 */
export interface CompletionValidationResult {
  valid: boolean;
  reason?: string;
  criteria?: CompletionCriteria;
}

/**
 * Completion state for UI
 */
export interface CompletionState {
  isComplete: boolean;
  canComplete: boolean;
  criteria: CompletionCriteria;
  isLoading: boolean;
  error?: string;
}

/**
 * Completion options for programmatic completion
 */
export interface CompletionOptions {
  manual?: boolean;
  force?: boolean;
  overrideReason?: string;
  celebration?: Partial<CelebrationData>;
  note?: string;
}
