/**
 * Progress Calculation Utilities
 *
 * Implements all progress calculation logic according to business rules.
 * Each goal type has its own calculation method following the specifications.
 *
 * Business Rules Implemented:
 * - BR-009: Quantitative Progress Formula
 * - BR-010: Milestone Progress Calculation
 * - BR-011: Binary Goal Progress Calculation
 * - BR-012: Qualitative Goal Progress Calculation
 * - BR-013: Recurring Goal Progress
 * - BR-014: Habit Goal Progress
 * - BR-015: Progress Clamping
 */

import type {
  Goal,
  QuantitativeGoal,
  QualitativeGoal,
  BinaryGoal,
  MilestoneGoal,
  RecurringGoal,
  HabitGoal,
} from '@/features/goals/types';
import {
  isQuantitativeGoal,
  isQualitativeGoal,
  isBinaryGoal,
  isMilestoneGoal,
  isRecurringGoal,
  isHabitGoal,
  QualitativeStatus,
} from '@/features/goals/types';

/**
 * Clamp progress value between 0 and 100
 * Implements BR-015: Progress Clamping
 *
 * @param progress - Progress value to clamp
 * @param allowOverAchievement - If true, allow values > 100% (default: false)
 * @returns Clamped progress value (0-100, or >100 if over-achievement allowed)
 */
export const clampProgress = (progress: number, allowOverAchievement = false): number => {
  if (allowOverAchievement && progress > 100) {
    return progress; // Allow over-achievement
  }
  return Math.max(0, Math.min(100, progress));
};

/**
 * Calculate progress for quantitative goals
 * Implements BR-009: Quantitative Progress Formula
 *
 * Formula: ((currentValue - startValue) / (targetValue - startValue)) * 100
 *
 * Edge Cases:
 * - If startValue === targetValue: Progress = 100% if currentValue >= targetValue, else 0%
 * - If currentValue < startValue: Progress = 0% (clamped)
 * - If currentValue > targetValue: Progress = 100% (clamped) or >100% if over-achievement allowed
 *
 * @param goal - Quantitative goal
 * @returns Progress percentage (0-100, or >100 if over-achievement)
 */
export const calculateQuantitativeProgress = (goal: QuantitativeGoal): number => {
  const { startValue, targetValue, currentValue } = goal;

  // Edge case: startValue === targetValue
  if (startValue === targetValue) {
    return currentValue >= targetValue ? 100 : 0;
  }

  // Calculate progress
  const progress = ((currentValue - startValue) / (targetValue - startValue)) * 100;

  // Clamp to 0-100 (or allow over-achievement)
  return clampProgress(progress, false); // Over-achievement not typically allowed for quantitative goals
};

/**
 * Calculate progress for binary goals
 * Implements BR-011: Binary Goal Progress Calculation
 *
 * Rules:
 * - If targetCount set: Progress = (currentCount / targetCount) * 100
 * - If no targetCount: Progress = 100% if currentCount > 0, else 0%
 *
 * @param goal - Binary goal
 * @returns Progress percentage (0-100)
 */
export const calculateBinaryProgress = (goal: BinaryGoal): number => {
  const { targetCount, currentCount } = goal;

  if (targetCount !== undefined && targetCount > 0) {
    // Progress based on count ratio
    const progress = (currentCount / targetCount) * 100;
    return clampProgress(progress);
  }

  // No target count: binary completion (0% or 100%)
  return currentCount > 0 ? 100 : 0;
};

/**
 * Calculate progress for qualitative goals
 * Implements BR-012: Qualitative Goal Progress Calculation
 *
 * Formula:
 * - not_started: 0%
 * - in_progress: 50% (or based on self-assessment ratings)
 * - completed: 100%
 *
 * Alternative: If self-assessments exist: Average rating / 10 * 100
 *
 * @param goal - Qualitative goal
 * @returns Progress percentage (0-100)
 */
export const calculateQualitativeProgress = (goal: QualitativeGoal): number => {
  const { qualitativeStatus, selfAssessments, targetRating } = goal;

  // If self-assessments exist, use average rating
  if (selfAssessments && selfAssessments.length > 0) {
    const averageRating =
      selfAssessments.reduce((sum, assessment) => sum + assessment.rating, 0) /
      selfAssessments.length;

    // If target rating is set, calculate progress relative to target
    if (targetRating !== undefined) {
      const progress = (averageRating / targetRating) * 100;
      return clampProgress(progress);
    }

    // Default: assume 10-point scale
    const progress = (averageRating / 10) * 100;
    return clampProgress(progress);
  }

  // Status-based progress
  switch (qualitativeStatus) {
    case QualitativeStatus.NOT_STARTED:
      return 0;
    case QualitativeStatus.IN_PROGRESS:
      return 50;
    case QualitativeStatus.COMPLETED:
      return 100;
    default:
      return 0;
  }
};

/**
 * Calculate progress for milestone goals
 * Implements BR-010: Milestone Progress Calculation
 *
 * Formula: Progress = (completedMilestones / totalMilestones) * 100
 *
 * Special Cases:
 * - Skipped milestones: Excluded from calculation (optional policy)
 * - Dependencies: Milestones with unmet dependencies not counted as "available"
 *
 * @param goal - Milestone goal
 * @returns Progress percentage (0-100)
 */
export const calculateMilestoneProgress = (goal: MilestoneGoal): number => {
  const { milestones } = goal;

  if (!milestones || milestones.length === 0) {
    return 0;
  }

  // Count completed milestones (excluding skipped)
  const completedCount = milestones.filter(
    (milestone) => milestone.status === 'completed'
  ).length;

  // Count total milestones (excluding skipped)
  const totalCount = milestones.filter((milestone) => milestone.status !== 'skipped').length;

  if (totalCount === 0) {
    return 0;
  }

  const progress = (completedCount / totalCount) * 100;
  return clampProgress(progress);
};

/**
 * Calculate progress for recurring goals
 * Implements BR-013: Recurring Goal Progress
 *
 * Formula: Progress = (completedOccurrences / totalOccurrences) * 100
 *
 * Time Window: totalOccurrences calculated for current period (e.g., last 30 days, all time)
 *
 * @param goal - Recurring goal
 * @returns Progress percentage (0-100)
 */
export const calculateRecurringProgress = (goal: RecurringGoal): number => {
  const { completionStats } = goal;

  if (!completionStats || completionStats.totalOccurrences === 0) {
    return 0;
  }

  const progress =
    (completionStats.completedOccurrences / completionStats.totalOccurrences) * 100;
  return clampProgress(progress);
};

/**
 * Calculate progress for habit goals
 * Implements BR-014: Habit Goal Progress
 *
 * Formula: Progress = (completedDays / totalDaysInPeriod) * 100
 *
 * Time Window: Configurable (last 7, 30, 90 days, or all time)
 * For this implementation, we use the completionStats which should reflect the desired time window.
 *
 * @param goal - Habit goal
 * @returns Progress percentage (0-100)
 */
export const calculateHabitProgress = (goal: HabitGoal): number => {
  const { completionStats } = goal;

  if (!completionStats || completionStats.totalOccurrences === 0) {
    return 0;
  }

  const progress =
    (completionStats.completedOccurrences / completionStats.totalOccurrences) * 100;
  return clampProgress(progress);
};

/**
 * Main progress calculation function
 * Routes to type-specific calculator based on goal type
 *
 * @param goal - Goal of any type
 * @returns Progress percentage (0-100)
 */
export const calculateProgress = (goal: Goal): number => {
  if (isQuantitativeGoal(goal)) {
    return calculateQuantitativeProgress(goal);
  }

  if (isBinaryGoal(goal)) {
    return calculateBinaryProgress(goal);
  }

  if (isQualitativeGoal(goal)) {
    return calculateQualitativeProgress(goal);
  }

  if (isMilestoneGoal(goal)) {
    return calculateMilestoneProgress(goal);
  }

  if (isRecurringGoal(goal)) {
    return calculateRecurringProgress(goal);
  }

  if (isHabitGoal(goal)) {
    return calculateHabitProgress(goal);
  }

  // Fallback: return 0 for unknown goal types
  return 0;
};

