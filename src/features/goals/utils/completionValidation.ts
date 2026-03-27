/**
 * Completion Validation Utilities
 *
 * Functions to validate if a goal is eligible for completion
 * and to extract completion criteria by goal type.
 */

import {
  GoalStatus,
  GoalType,
  isBinaryGoal,
  isHabitGoal,
  isMilestoneGoal,
  isQuantitativeGoal,
  isQualitativeGoal,
  isRecurringGoal,
  type Goal,
} from '@/features/goals/types';

import type { CompletionCriteria, CompletionValidationResult } from '../types/completion';

/**
 * Check if a goal is eligible for completion
 */
export function validateCompletionEligibility(goal: Goal): CompletionValidationResult {
  if (goal.status !== GoalStatus.ACTIVE) {
    return {
      valid: false,
      reason: `Goal status is '${goal.status}', must be 'active' to complete`,
    };
  }

  const criteria = getCompletionCriteria(goal);

  if (!criteria.met) {
    const partialMsg = criteria.partialMet?.length ? ` Partially met: ${criteria.partialMet.join(', ')}` : '';
    return {
      valid: false,
      reason: `Completion criteria not met. ${criteria.requirements.join('; ')}${partialMsg}`,
      criteria,
    };
  }

  return {
    valid: true,
    criteria,
  };
}

/**
 * Simple boolean check for eligibility
 */
export function isEligibleForCompletion(goal: Goal): boolean {
  return validateCompletionEligibility(goal).valid;
}

/**
 * Extract completion criteria for a goal based on its type
 */
export function getCompletionCriteria(goal: Goal): CompletionCriteria {
  if (isQuantitativeGoal(goal)) {
    return getQuantitativeCriteria(goal);
  }
  if (isQualitativeGoal(goal)) {
    return getQualitativeCriteria(goal);
  }
  if (isBinaryGoal(goal)) {
    return getBinaryCriteria(goal);
  }
  if (isMilestoneGoal(goal)) {
    return getMilestoneCriteria(goal);
  }
  if (isRecurringGoal(goal)) {
    return getRecurringCriteria(goal);
  }
  if (isHabitGoal(goal)) {
    return getHabitCriteria(goal);
  }

  // This should never be reached due to exhaustive type checking
  // Adding fallback for safety
  return {
    goalType: (goal as Goal).type,
    requirements: ['Unknown goal type'],
    met: false,
  };
}

function getQuantitativeCriteria(goal: Goal): CompletionCriteria {
  if (!isQuantitativeGoal(goal)) {
    return { goalType: goal.type, requirements: ['Invalid goal type'], met: false };
  }

  const met = goal.currentValue >= goal.targetValue;
  const requirements = [`Current value (${goal.currentValue}) must reach target value (${goal.targetValue})`];

  const partialMet: string[] = [];
  if (goal.progress > 0 && !met) {
    const progressPercent = Math.round((goal.currentValue / goal.targetValue) * 100);
    partialMet.push(`${progressPercent}% complete`);
  }

  return {
    goalType: GoalType.QUANTITATIVE,
    requirements,
    met,
    partialMet: partialMet.length > 0 ? partialMet : undefined,
  };
}

function getQualitativeCriteria(goal: Goal): CompletionCriteria {
  if (!isQualitativeGoal(goal)) {
    return { goalType: goal.type, requirements: ['Invalid goal type'], met: false };
  }

  const met = goal.qualitativeStatus === 'completed';
  const requirements = ['Qualitative status must be "completed"'];

  return {
    goalType: GoalType.QUALITATIVE,
    requirements,
    met,
    partialMet: goal.qualitativeStatus === 'in_progress' ? ['Status is in_progress'] : undefined,
  };
}

function getBinaryCriteria(goal: Goal): CompletionCriteria {
  if (!isBinaryGoal(goal)) {
    return { goalType: goal.type, requirements: ['Invalid goal type'], met: false };
  }

  const met = goal.progress >= 100;
  const requirements = ['Binary goal progress must be 100%'];

  const partialMet: string[] = [];
  if (goal.targetCount && goal.currentCount > 0 && !met) {
    partialMet.push(`${goal.currentCount}/${goal.targetCount} items completed`);
  }

  return {
    goalType: GoalType.BINARY,
    requirements,
    met,
    partialMet: partialMet.length > 0 ? partialMet : undefined,
  };
}

function getMilestoneCriteria(goal: Goal): CompletionCriteria {
  if (!isMilestoneGoal(goal)) {
    return { goalType: goal.type, requirements: ['Invalid goal type'], met: false };
  }

  if (!goal.milestones || goal.milestones.length === 0) {
    return {
      goalType: GoalType.MILESTONE,
      requirements: ['No milestones defined'],
      met: false,
    };
  }

  const completedCount = goal.milestones.filter((m) => m.status === 'completed').length;
  const totalCount = goal.milestones.length;
  const met = completedCount === totalCount;

  const requirements = [`All ${totalCount} milestones must be completed (${completedCount}/${totalCount} done)`];

  const hasCircularDeps = checkCircularDependencies(goal.milestones);
  if (hasCircularDeps) {
    requirements.push('Circular dependencies detected in milestones');
  }

  const partialMet: string[] = [];
  if (completedCount > 0 && !met) {
    partialMet.push(`${completedCount} of ${totalCount} milestones completed`);
  }

  return {
    goalType: GoalType.MILESTONE,
    requirements,
    met: met && !hasCircularDeps,
    partialMet: partialMet.length > 0 ? partialMet : undefined,
  };
}

function checkCircularDependencies(milestones: { id: string; dependencies?: string[] }[]): boolean {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function hasCycle(id: string): boolean {
    visited.add(id);
    recursionStack.add(id);

    const milestone = milestones.find((m) => m.id === id);
    if (milestone?.dependencies) {
      for (const depId of milestone.dependencies) {
        if (!visited.has(depId)) {
          if (hasCycle(depId)) return true;
        } else if (recursionStack.has(depId)) {
          return true;
        }
      }
    }

    recursionStack.delete(id);
    return false;
  }

  for (const milestone of milestones) {
    if (!visited.has(milestone.id)) {
      if (hasCycle(milestone.id)) return true;
    }
  }

  return false;
}

function getRecurringCriteria(goal: Goal): CompletionCriteria {
  if (!isRecurringGoal(goal)) {
    return { goalType: goal.type, requirements: ['Invalid goal type'], met: false };
  }

  const requirements = ['All scheduled occurrences must be completed'];

  const met = goal.completionStats?.completedOccurrences ? goal.completionStats.completedOccurrences > 0 : false;

  return {
    goalType: GoalType.RECURRING,
    requirements,
    met,
    partialMet: ['Recurring goals remain active after completion'],
  };
}

function getHabitCriteria(goal: Goal): CompletionCriteria {
  if (!isHabitGoal(goal)) {
    return { goalType: goal.type, requirements: ['Invalid goal type'], met: false };
  }

  const requirements = ['Streak requirements must be met'];

  const met = goal.completionStats?.streak?.current ? goal.completionStats.streak.current >= 1 : false;

  return {
    goalType: GoalType.HABIT,
    requirements,
    met,
    partialMet: ['Habit goals remain active after daily completion'],
  };
}

/**
 * Check if completion should be allowed with override
 */
export function canOverrideCompletion(_goal: Goal): boolean {
  return true;
}

/**
 * Get a human-readable summary of completion criteria
 */
export function getCompletionCriteriaSummary(goal: Goal): string {
  const criteria = getCompletionCriteria(goal);

  if (criteria.met) {
    return 'Goal is ready for completion';
  }

  return criteria.requirements.join('; ');
}
