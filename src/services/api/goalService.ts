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

import type { Goal, CreateGoalInput, UpdateGoalInput, GoalFilters } from '@specs/bkp/types/goal.types';

import {
  createGoal,
  getGoal,
  getAllGoals,
  updateGoal,
  deleteGoal,
  queryGoals,
  updateProgress as updateProgressStorage,
} from '../storage/goalStorageService';

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
  getAll: (filters?: GoalFilters): Promise<Goal[]> => {
    if (filters) {
      return Promise.resolve(queryGoals(filters));
    }
    return Promise.resolve(getAllGoals());
  },

  /**
   * Get a single goal by ID
   * @param id - Goal ID
   * @returns Promise resolving to goal or null if not found
   */
  getById: (id: string): Promise<Goal | null> => {
    return Promise.resolve(getGoal(id));
  },

  /**
   * Create a new goal
   * @param input - Goal creation input
   * @returns Promise resolving to created goal
   */
  create: (input: CreateGoalInput): Promise<Goal> => {
    return Promise.resolve(createGoal(input));
  },

  /**
   * Update an existing goal
   * @param id - Goal ID
   * @param updates - Partial goal updates
   * @returns Promise resolving to updated goal
   */
  update: (id: string, updates: UpdateGoalInput): Promise<Goal> => {
    return Promise.resolve(updateGoal(id, updates));
  },

  /**
   * Delete a goal
   * @param id - Goal ID
   * @returns Promise resolving when deletion is complete
   */
  delete: (id: string): Promise<void> => {
    deleteGoal(id);
    return Promise.resolve();
  },

  /**
   * Query goals with filters
   * @param filters - Filters to apply
   * @returns Promise resolving to filtered goals
   */
  query: (filters: GoalFilters): Promise<Goal[]> => {
    return Promise.resolve(queryGoals(filters));
  },

  /**
   * Update progress for a goal
   * @param id - Goal ID
   * @param progressValue - New progress value (0-100)
   * @param note - Optional note for progress entry
   * @param typeSpecificUpdates - Optional type-specific updates (e.g., currentValue for quantitative)
   * @returns Promise resolving to updated goal
   */
  updateProgress: (
    id: string,
    progressValue: number,
    note?: string,
    typeSpecificUpdates?: Partial<Goal>
  ): Promise<Goal> => {
    return Promise.resolve(updateProgressStorage(id, progressValue, note, typeSpecificUpdates));
  },
};
