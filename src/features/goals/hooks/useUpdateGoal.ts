/**
 * useUpdateGoal Hook
 *
 * React Query mutation hook for updating existing goals.
 * Implements optimistic updates for better UX.
 *
 * Architecture:
 * - Uses React Query's useMutation
 * - Implements optimistic updates
 * - Updates both list and detail caches
 * - Handles error rollback
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { goalService } from '@/services/api/goalService';
import { queryKeys } from '@/utils/queryKeys';
import type { UpdateGoalInput, Goal } from '@/features/goals/types';

/**
 * Hook to update an existing goal
 *
 * @returns Mutation object with mutate function and mutation state
 *
 * @example
 * ```tsx
 * const updateGoal = useUpdateGoal();
 *
 * const handleUpdate = (goalId: string) => {
 *   updateGoal.mutate({
 *     id: goalId,
 *     updates: {
 *       title: 'Updated Title',
 *       status: GoalStatus.COMPLETED,
 *     },
 *   });
 * };
 * ```
 */
export const useUpdateGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateGoalInput }) =>
      goalService.update(id, updates),
    onMutate: async ({ id, updates }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.goals.detail(id) });
      await queryClient.cancelQueries({ queryKey: queryKeys.goals.lists() });

      // Snapshot previous values for rollback
      const previousGoal = queryClient.getQueryData<Goal>(queryKeys.goals.detail(id));
      const previousGoals = queryClient.getQueryData<Goal[]>(queryKeys.goals.lists());

      // Optimistically update the detail cache
      if (previousGoal) {
        queryClient.setQueryData<Goal>(queryKeys.goals.detail(id), {
          ...previousGoal,
          ...updates,
          updatedAt: new Date(),
        });
      }

      // Optimistically update the list cache
      queryClient.setQueryData<Goal[]>(queryKeys.goals.lists(), (old = []) => {
        return old.map((goal) => {
          if (goal.id === id) {
            return {
              ...goal,
              ...updates,
              updatedAt: new Date(),
            };
          }
          return goal;
        };
      });

      // Return context for rollback
      return { previousGoal, previousGoals };
    },
    onError: (error, variables, context) => {
      // Rollback optimistic updates on error
      if (context?.previousGoal) {
        queryClient.setQueryData(queryKeys.goals.detail(variables.id), context.previousGoal);
      }
      if (context?.previousGoals) {
        queryClient.setQueryData(queryKeys.goals.lists(), context.previousGoals);
      }
    },
    onSuccess: (data, variables) => {
      // Update both detail and list caches with real data
      queryClient.setQueryData(queryKeys.goals.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.lists() });
    },
  });
};

