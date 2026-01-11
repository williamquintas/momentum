/**
 * useCreateGoal Hook
 *
 * React Query mutation hook for creating new goals.
 * Implements optimistic updates for better UX.
 *
 * Architecture:
 * - Uses React Query's useMutation
 * - Implements optimistic updates
 * - Invalidates related queries on success
 * - Handles error rollback
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { CreateGoalInput, Goal } from '@/features/goals/types';
import { goalService } from '@/services/api/goalService';
import { queryKeys } from '@/utils/queryKeys';

/**
 * Hook to create a new goal
 *
 * @returns Mutation object with mutate function and mutation state
 *
 * @example
 * ```tsx
 * const createGoal = useCreateGoal();
 *
 * const handleCreate = () => {
 *   createGoal.mutate({
 *     title: 'New Goal',
 *     type: GoalType.QUANTITATIVE,
 *     // ... other fields
 *   });
 * };
 * ```
 */
export const useCreateGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateGoalInput) => goalService.create(input),
    onMutate: async (newGoal) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.goals.lists() });

      // Snapshot the previous value for rollback
      const previousGoals = queryClient.getQueryData<Goal[]>(queryKeys.goals.lists());

      // Optimistically update the cache with the new goal
      // Note: The goal will have a temporary structure until the real one is returned
      queryClient.setQueryData<Goal[]>(queryKeys.goals.lists(), (old = []) => {
        // Create a temporary goal object for optimistic update
        // The service will create the proper goal structure, so we just add a placeholder
        // The real goal will replace this when the mutation succeeds
        const optimisticGoal = {
          ...newGoal,
          id: `temp-${Date.now()}`, // Temporary ID
          createdAt: new Date(),
          updatedAt: new Date(),
          progress: 0,
          progressHistory: newGoal.progressHistory || [],
          notes: [],
          attachments: [],
          relatedGoals: newGoal.relatedGoals || [],
          archived: newGoal.archived ?? false,
          favorite: newGoal.favorite ?? false,
        } as unknown as Goal; // Type assertion needed due to union type complexity

        return [...old, optimisticGoal];
      });

      // Return context for rollback
      return { previousGoals };
    },
    onError: (_error, _newGoal, context) => {
      // Rollback optimistic update on error
      if (context?.previousGoals) {
        queryClient.setQueryData(queryKeys.goals.lists(), context.previousGoals);
      }
    },
    onSuccess: (data) => {
      // Invalidate and refetch goals list to get the real data
      void queryClient.invalidateQueries({ queryKey: queryKeys.goals.lists() });

      // Set the individual goal in cache for detail view
      queryClient.setQueryData(queryKeys.goals.detail(data.id), data);
    },
  });
};

