/**
 * useUpdateProgress Hook
 *
 * React Query mutation hook for updating goal progress.
 * Implements optimistic updates for better UX.
 *
 * Architecture:
 * - Uses React Query's useMutation
 * - Implements optimistic updates
 * - Updates both list and detail caches
 * - Handles error rollback
 * - Automatically recalculates progress based on goal type
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Goal } from '@/features/goals/types';
import { calculateProgress } from '@/features/goals/utils/calculateProgress';
import { goalService } from '@/services/api/goalService';
import { queryKeys } from '@/utils/queryKeys';

export interface UpdateProgressInput {
  /**
   * Goal ID to update
   */
  goalId: string;

  /**
   * New progress value (0-100)
   * If not provided, will be calculated automatically based on type-specific updates
   */
  progressValue?: number;

  /**
   * Optional note for the progress entry
   */
  note?: string;

  /**
   * Type-specific updates (e.g., currentValue for quantitative goals)
   */
  typeSpecificUpdates?: Partial<Goal>;
}

/**
 * Hook to update goal progress
 *
 * @returns Mutation object with mutate function and mutation state
 *
 * @example
 * ```tsx
 * const updateProgress = useUpdateProgress();
 *
 * const handleUpdate = () => {
 *   updateProgress.mutate({
 *     goalId: 'goal-id',
 *     typeSpecificUpdates: {
 *       currentValue: 50, // For quantitative goals
 *     },
 *     note: 'Weekly update',
 *   });
 * };
 * ```
 */
export const useUpdateProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ goalId, progressValue, note, typeSpecificUpdates }: UpdateProgressInput) => {
      // Get current goal to calculate progress if needed
      const currentGoal = queryClient.getQueryData<Goal>(queryKeys.goals.detail(goalId));

      if (!currentGoal) {
        throw new Error('Goal not found in cache');
      }

      // Apply type-specific updates to create updated goal
      const updatedGoal = {
        ...currentGoal,
        ...typeSpecificUpdates,
      } as Goal;

      // Calculate progress if not provided
      const calculatedProgress = progressValue ?? calculateProgress(updatedGoal);

      // Update progress
      return goalService.updateProgress(goalId, calculatedProgress, note, typeSpecificUpdates);
    },
    onMutate: async ({ goalId, typeSpecificUpdates, progressValue, note }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.goals.detail(goalId) });
      await queryClient.cancelQueries({ queryKey: queryKeys.goals.lists() });

      // Snapshot previous values for rollback
      const previousGoal = queryClient.getQueryData<Goal>(queryKeys.goals.detail(goalId));
      const previousGoals = queryClient.getQueryData<Goal[]>(queryKeys.goals.lists());

      if (!previousGoal) {
        return { previousGoal, previousGoals };
      }

      // Apply type-specific updates
      const updatedGoal = {
        ...previousGoal,
        ...typeSpecificUpdates,
        updatedAt: new Date(),
      } as Goal;

      // Calculate progress if not provided
      const calculatedProgress = progressValue ?? calculateProgress(updatedGoal);
      updatedGoal.progress = calculatedProgress;

      // Add progress history entry optimistically
      const progressEntry = {
        id: `temp-${Date.now()}`,
        date: new Date(),
        value: calculatedProgress,
        note,
        metadata: {},
      };
      updatedGoal.progressHistory = [...previousGoal.progressHistory, progressEntry];

      // Optimistically update the detail cache
      queryClient.setQueryData<Goal>(queryKeys.goals.detail(goalId), updatedGoal);

      // Optimistically update the list cache
      queryClient.setQueryData<Goal[]>(queryKeys.goals.lists(), (old = []) => {
        return old.map((goal) => {
          if (goal.id === goalId) {
            return updatedGoal;
          }
          return goal;
        });
      });

      // Return context for rollback
      return { previousGoal, previousGoals };
    },
    onError: (_error, variables, context) => {
      // Rollback optimistic updates on error
      if (context?.previousGoal) {
        queryClient.setQueryData(queryKeys.goals.detail(variables.goalId), context.previousGoal);
      }
      if (context?.previousGoals) {
        queryClient.setQueryData(queryKeys.goals.lists(), context.previousGoals);
      }
    },
    onSuccess: (data, variables) => {
      // Update both detail and list caches with real data
      queryClient.setQueryData(queryKeys.goals.detail(variables.goalId), data);
      void queryClient.invalidateQueries({ queryKey: queryKeys.goals.lists() });
    },
  });
};
