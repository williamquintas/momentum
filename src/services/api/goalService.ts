/**
 * Goal Service
 *
 * Service layer that wraps the Local Storage service.
 * This abstraction allows us to easily switch from Local Storage to a backend API
 * in the future by only changing this service layer.
 *
 * Architecture:
 * - This service wraps the storage service functions
 * - React Query hooks will use this service
 * - All goal operations go through this service
 */

import {
  createGoal,
  getGoal,
  getAllGoals,
  updateGoal,
  deleteGoal,
  queryGoals,
} from '../storage/goalStorageService';
import type {
  Goal,
  CreateGoalInput,
  UpdateGoalInput,
  GoalFilters,
} from '@specs/types/goal.types';

/**
 * Goal Service API
 *
 * Provides a consistent interface for goal operations.
 * All methods return Promises to match React Query's expectations,
 * even though Local Storage operations are synchronous.
 */
export const goalService = {
  /**
   * Get all goals
   * @param filters - Optional filters to apply
   * @returns Promise resolving to array of goals
   */
  getAll: async (filters?: GoalFilters): Promise<Goal[]> => {
    if (filters) {
      return queryGoals(filters);
    }
    return getAllGoals();
  },

  /**
   * Get a single goal by ID
   * @param id - Goal ID
   * @returns Promise resolving to goal or null if not found
   */
  getById: async (id: string): Promise<Goal | null> => {
    return getGoal(id);
  },

  /**
   * Create a new goal
   * @param input - Goal creation input
   * @returns Promise resolving to created goal
   */
  create: async (input: CreateGoalInput): Promise<Goal> => {
    return createGoal(input);
  },

  /**
   * Update an existing goal
   * @param id - Goal ID
   * @param updates - Partial goal updates
   * @returns Promise resolving to updated goal
   */
  update: async (id: string, updates: UpdateGoalInput): Promise<Goal> => {
    return updateGoal(id, updates);
  },

  /**
   * Delete a goal
   * @param id - Goal ID
   * @returns Promise resolving when deletion is complete
   */
  delete: async (id: string): Promise<void> => {
    deleteGoal(id);
  },

  /**
   * Query goals with filters
   * @param filters - Filters to apply
   * @returns Promise resolving to filtered goals
   */
  query: async (filters: GoalFilters): Promise<Goal[]> => {
    return queryGoals(filters);
  },
};

