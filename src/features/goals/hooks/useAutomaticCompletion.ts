/**
 * Automatic Completion Hook
 *
 * Hook to monitor goals and automatically detect when they become
 * eligible for completion, with optional auto-completion.
 */

import { useCallback, useEffect, useMemo, useRef } from 'react';

import { validateCompletionEligibility } from '@/features/goals/utils/completionValidation';
import { useCompletionStore } from '@/stores/completionStore';
import type { Goal } from '@/types/goal.types';

export interface AutomaticCompletionConfig {
  autoComplete?: boolean;
  delayMs?: number;
  notifyOnAutoComplete?: boolean;
}

export interface UseAutomaticCompletionResult {
  eligibleGoals: Goal[];
  recentlyCompleted: Goal[];
  checkAndComplete: (goal: Goal, force?: boolean) => Promise<boolean>;
  checkAllGoals: (goals: Goal[]) => Goal[];
}

/**
 * Hook to automatically detect and complete eligible goals
 */
export function useAutomaticCompletion(
  goals: Goal[],
  config: AutomaticCompletionConfig = {}
): UseAutomaticCompletionResult {
  const { autoComplete = false, delayMs = 1000, notifyOnAutoComplete = true } = config;

  const completeGoal = useCompletionStore((state) => state.completeGoal);
  const completions = useCompletionStore((state) => state.completions);
  const checkEligibility = useCompletionStore((state) => state.checkEligibility);

  const recentlyCompletedRef = useRef<Goal[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const eligibleGoals = useMemo(() => {
    return goals.filter((goal) => {
      if (goal.status !== 'active') return false;
      if (completions.has(goal.id)) return false;
      return checkEligibility(goal);
    });
  }, [goals, completions, checkEligibility]);

  const checkAndComplete = useCallback(
    async (goal: Goal, force = false): Promise<boolean> => {
      const validation = validateCompletionEligibility(goal);

      if (!validation.valid && !force) {
        return false;
      }

      if (completions.has(goal.id)) {
        return false;
      }

      try {
        const result = await completeGoal(goal, {
          manual: false,
          force,
          celebration: notifyOnAutoComplete
            ? { type: 'moderate', message: 'Goal completed!', animation: true, sound: true }
            : { type: 'subtle', message: '', animation: false, sound: false },
        });

        if (result) {
          recentlyCompletedRef.current = [...recentlyCompletedRef.current, goal];
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [completeGoal, completions, notifyOnAutoComplete]
  );

  const checkAllGoals = useCallback(
    (goalsToCheck: Goal[]): Goal[] => {
      return goalsToCheck.filter((goal) => {
        if (goal.status !== 'active') return false;
        if (completions.has(goal.id)) return false;
        return validateCompletionEligibility(goal).valid;
      });
    },
    [completions]
  );

  useEffect(() => {
    if (!autoComplete || eligibleGoals.length === 0) {
      return;
    }

    const completeEligible = () => {
      eligibleGoals.forEach((goal) => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          void checkAndComplete(goal);
        }, delayMs);
      });
    };

    completeEligible();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps, @typescript-eslint/consistent-return
  }, [autoComplete, eligibleGoals, delayMs]);

  return {
    eligibleGoals,
    recentlyCompleted: recentlyCompletedRef.current,
    checkAndComplete,
    checkAllGoals,
  };
}

/**
 * Hook to get completion eligibility for multiple goals at once
 */
export function useBulkCompletionEligibility(goals: Goal[]): Map<string, boolean> {
  const checkEligibility = useCompletionStore((state) => state.checkEligibility);
  const completions = useCompletionStore((state) => state.completions);

  return useMemo(() => {
    const map = new Map<string, boolean>();
    goals.forEach((goal) => {
      if (completions.has(goal.id)) {
        map.set(goal.id, false);
        return;
      }
      map.set(goal.id, checkEligibility(goal));
    });
    return map;
  }, [goals, completions, checkEligibility]);
}
