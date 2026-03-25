/**
 * Completion Eligibility Checker
 *
 * Type-specific functions to check if a goal is eligible for completion.
 * These are the core validation functions used by the completion system.
 */

import type { Goal } from '@/types/goal.types';
import {
  isBinaryGoal,
  isHabitGoal,
  isMilestoneGoal,
  isQuantitativeGoal,
  isQualitativeGoal,
  isRecurringGoal,
} from '@/types/goal.types';

/**
 * Check if a quantitative goal can be completed
 */
export function checkQuantitativeCompletion(goal: Goal): boolean {
  if (!isQuantitativeGoal(goal)) return false;
  return goal.currentValue >= goal.targetValue;
}

/**
 * Check if a qualitative goal can be completed
 */
export function checkQualitativeCompletion(goal: Goal): boolean {
  if (!isQualitativeGoal(goal)) return false;
  return goal.qualitativeStatus === 'completed';
}

/**
 * Check if a binary goal can be completed
 */
export function checkBinaryCompletion(goal: Goal): boolean {
  if (!isBinaryGoal(goal)) return false;
  return goal.progress >= 100;
}

/**
 * Check if a milestone goal can be completed
 */
export function checkMilestoneCompletion(goal: Goal): boolean {
  if (!isMilestoneGoal(goal)) return false;
  if (!goal.milestones || goal.milestones.length === 0) return false;

  const allCompleted = goal.milestones.every((m) => m.status === 'completed');
  if (!allCompleted) return false;

  return !hasCircularDependencies(goal.milestones);
}

/**
 * Check if a recurring goal occurrence can be completed
 * Note: Recurring goals don't fully complete - this checks if current occurrence is done
 */
export function checkRecurringCompletion(goal: Goal): boolean {
  if (!isRecurringGoal(goal)) return false;
  return goal.completionStats?.completedOccurrences ? goal.completionStats.completedOccurrences > 0 : false;
}

/**
 * Check if a habit goal can be completed for today
 * Note: Habit goals don't fully complete - this checks if today is done
 */
export function checkHabitCompletion(goal: Goal): boolean {
  if (!isHabitGoal(goal)) return false;

  // Check if there's any progress or streak
  return goal.completionStats?.completedOccurrences ? goal.completionStats.completedOccurrences > 0 : goal.progress > 0;
}

/**
 * Check if a goal type supports "complete" action
 * (recurring/habit goals remain active after marking completion)
 */
export function isPartialCompletion(goal: Goal): boolean {
  return isRecurringGoal(goal) || isHabitGoal(goal);
}

/**
 * Check if goal is fully completable (status changes to completed)
 */
export function isFullyCompletable(goal: Goal): boolean {
  return !isRecurringGoal(goal) && !isHabitGoal(goal);
}

function hasCircularDependencies(milestones: { id: string; dependencies?: string[] }[]): boolean {
  const visited = new Set<string>();
  const stack = new Set<string>();

  function dfs(id: string): boolean {
    visited.add(id);
    stack.add(id);

    const milestone = milestones.find((m) => m.id === id);
    if (milestone?.dependencies) {
      for (const depId of milestone.dependencies) {
        if (!visited.has(depId)) {
          if (dfs(depId)) return true;
        } else if (stack.has(depId)) {
          return true;
        }
      }
    }

    stack.delete(id);
    return false;
  }

  for (const milestone of milestones) {
    if (!visited.has(milestone.id)) {
      if (dfs(milestone.id)) return true;
    }
  }

  return false;
}
