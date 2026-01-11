/**
 * useDeleteGoal Hook
 *
 * React Query mutation hook for deleting goals.
 * Implements optimistic updates for better UX.
 *
 * Architecture:
 * - Uses React Query's useMutation
 * - Implements optimistic updates
 * - Removes goal from cache on success
 * - Handles error rollback
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Goal } from '@/features/goals/types';
import { goalService } from '@/services/api/goalService';
import { queryKeys } from '@/utils/queryKeys';

/**
 * Hook to delete a goal
 *
 * @returns Mutation object with mutate function and mutation state
 *
 * @example
 * ```tsx
 * const deleteGoal = useDeleteGoal();
 *
 * const handleDelete = (goalId: string) => {
 *   deleteGoal.mutate(goalId);
 * };
 * ```
 */
export const useDeleteGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => goalService.delete(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.goals.detail(id) });
      await queryClient.cancelQueries({ queryKey: queryKeys.goals.lists() });

      // Snapshot previous values for rollback
      const previousGoal = queryClient.getQueryData<Goal>(queryKeys.goals.detail(id));
      const previousGoals = queryClient.getQueryData<Goal[]>(queryKeys.goals.lists());

      // Optimistically remove from list cache
      queryClient.setQueryData<Goal[]>(queryKeys.goals.lists(), (old = []) => {
        return old.filter((goal) => goal.id !== id);
      });

      // Optimistically remove from detail cache
      queryClient.removeQueries({ queryKey: queryKeys.goals.detail(id) });

      // Return context for rollback
      return { previousGoal, previousGoals };
    },
    onError: (_error, id, context) => {
      // Rollback optimistic update on error
      if (context?.previousGoal) {
        queryClient.setQueryData(queryKeys.goals.detail(id), context.previousGoal);
      }
      if (context?.previousGoals) {
        queryClient.setQueryData(queryKeys.goals.lists(), context.previousGoals);
      }
    },
    onSuccess: (_, id) => {
      // Remove from detail cache (already done in onMutate, but ensure it's removed)
      queryClient.removeQueries({ queryKey: queryKeys.goals.detail(id) });

      // Invalidate list queries to ensure consistency
      void queryClient.invalidateQueries({ queryKey: queryKeys.goals.lists() });
    },
  });
};

