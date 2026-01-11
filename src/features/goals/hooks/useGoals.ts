/**
 * useGoals Hook
 *
 * React Query hook for fetching goals with optional filters.
 * Provides loading, error, and data states.
 *
 * Architecture:
 * - Uses React Query for caching and state management
 * - Wraps goalService.getAll() for fetching goals
 * - Supports filtering via GoalFilters
 */

import { useQuery } from '@tanstack/react-query';

import type { GoalFilters } from '@/features/goals/types';
import { goalService } from '@/services/api/goalService';
import { queryKeys } from '@/utils/queryKeys';

/**
 * Hook to fetch goals with optional filters
 *
 * @param filters - Optional filters to apply to the query
 * @returns React Query result with goals data, loading, and error states
 *
 * @example
 * ```tsx
 * const { data: goals, isLoading, error } = useGoals({ status: ['active'] });
 * ```
 */
export const useGoals = (filters?: GoalFilters) => {
  return useQuery({
    queryKey: queryKeys.goals.list(filters),
    queryFn: () => goalService.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes - cache persists for 10 minutes
  });
};
