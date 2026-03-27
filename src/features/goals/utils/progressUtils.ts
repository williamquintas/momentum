/**
 * Progress Formatting Utilities
 *
 * Provides utilities for formatting progress display according to mockup specifications.
 * Supports percentage format (e.g., "50%", "64%") and count format (e.g., "3/5" for binary goals).
 */

import type { Goal, BinaryGoal } from '@/features/goals/types';
import { isBinaryGoal } from '@/features/goals/types';

import { calculateProgress } from './calculateProgress';

/**
 * Format progress for display
 * - Binary goals with targetCount: "currentCount/targetCount" (e.g., "3/5")
 * - Other goal types: percentage (e.g., "50%", "64%")
 */
export const formatProgress = (goal: Goal): string => {
  if (isBinaryGoal(goal) && goal.targetCount !== undefined && goal.targetCount > 0) {
    return `${goal.currentCount}/${goal.targetCount}`;
  }
  const progress = calculateProgress(goal);
  return `${Math.round(progress)}%`;
};

/**
 * Get progress value for display (number or count)
 * Used for progress bars and calculations
 */
export const getProgressValue = (goal: Goal): number => {
  return calculateProgress(goal);
};

/**
 * Check if goal is a binary goal with count format
 */
export const shouldUseCountFormat = (goal: Goal): goal is BinaryGoal => {
  return isBinaryGoal(goal) && goal.targetCount !== undefined && goal.targetCount > 0;
};
