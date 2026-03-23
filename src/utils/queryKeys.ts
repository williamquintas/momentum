/**
 * Query Key Factory
 *
 * Provides a consistent, type-safe way to generate React Query cache keys.
 * This ensures all query keys follow the same structure and are easy to invalidate.
 *
 * Architecture:
 * - Hierarchical key structure: ['goals', 'list', filters] or ['goals', 'detail', id]
 * - Type-safe key generation
 * - Easy invalidation patterns
 *
 * Usage:
 *   queryKeys.goals.all() // ['goals']
 *   queryKeys.goals.lists() // ['goals', 'list']
 *   queryKeys.goals.list(filters) // ['goals', 'list', filters]
 *   queryKeys.goals.detail(id) // ['goals', 'detail', id]
 */

import type { GoalFilters } from '@specs/bkp/types/goal.types';

/**
 * Query key factory for goals
 */
export const queryKeys = {
  goals: {
    /**
     * Base key for all goal queries
     */
    all: ['goals'] as const,

    /**
     * Base key for all list queries
     */
    lists: () => [...queryKeys.goals.all, 'list'] as const,

    /**
     * Key for a specific list query with filters
     */
    list: (filters?: GoalFilters) => [...queryKeys.goals.lists(), filters] as const,

    /**
     * Base key for all detail queries
     */
    details: () => [...queryKeys.goals.all, 'detail'] as const,

    /**
     * Key for a specific goal detail query
     */
    detail: (id: string) => [...queryKeys.goals.details(), id] as const,
  },
} as const;
