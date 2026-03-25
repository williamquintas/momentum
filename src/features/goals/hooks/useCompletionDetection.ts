/**
 * Completion Detection Hook
 *
 * Hook to monitor goal progress and detect when a goal becomes
 * eligible for completion.
 */

import { useMemo } from 'react';

import { isPartialCompletion, isFullyCompletable } from '@/features/goals/utils/completionEligibility';
import {
  validateCompletionEligibility,
  getCompletionCriteria,
  getCompletionCriteriaSummary,
} from '@/features/goals/utils/completionValidation';
import { GoalType, type Goal } from '@/types/goal.types';

export interface UseCompletionDetectionResult {
  isEligible: boolean;
  canComplete: boolean;
  criteria: ReturnType<typeof getCompletionCriteria>;
  summary: string;
  isPartial: boolean;
  isFullCompletion: boolean;
}

/**
 * Hook to detect if a goal is eligible for completion
 */
export function useCompletionDetection(goal: Goal | undefined): UseCompletionDetectionResult {
  return useMemo(() => {
    if (!goal) {
      return {
        isEligible: false,
        canComplete: false,
        criteria: { goalType: 'quantitative', requirements: [] as string[], met: false },
        summary: 'No goal provided',
        isPartial: false,
        isFullCompletion: false,
      } as UseCompletionDetectionResult;
    }

    const validation = validateCompletionEligibility(goal);
    const criteria = getCompletionCriteria(goal);
    const summary = getCompletionCriteriaSummary(goal);

    return {
      isEligible: validation.valid,
      canComplete: validation.valid || goal.status === 'active',
      criteria,
      summary,
      isPartial: isPartialCompletion(goal),
      isFullCompletion: isFullyCompletable(goal),
    };
  }, [goal]);
}

/**
 * Hook to check completion eligibility based on goal ID
 * This is a simplified version that would be connected to actual goal data
 */
export function useGoalCompletionDetection(_goalId: string | undefined): UseCompletionDetectionResult {
  return {
    isEligible: false,
    canComplete: false,
    criteria: { goalType: GoalType.QUANTITATIVE, requirements: [] as string[], met: false },
    summary: 'Loading...',
    isPartial: false,
    isFullCompletion: false,
  };
}
