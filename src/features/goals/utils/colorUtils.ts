/**
 * Color Utilities for Goals
 *
 * Provides consistent color mapping for status and priority tags
 * according to mockup specifications.
 */

import { GoalStatus, Priority } from '@/features/goals/types';

/**
 * Get color for status tag
 * Per AGENTS.md mobile UX guidelines:
 * - ACTIVE: Green
 * - COMPLETED: Blue
 * - PAUSED: Gray
 * - CANCELLED: Red
 */
export const getStatusColor = (status: GoalStatus): string => {
  switch (status) {
    case GoalStatus.ACTIVE:
      return 'green';
    case GoalStatus.COMPLETED:
      return 'blue';
    case GoalStatus.PAUSED:
      return 'default';
    case GoalStatus.CANCELLED:
      return 'red';
    default:
      return 'default';
  }
};

/**
 * Get color for priority tag
 * Per AGENTS.md mobile UX guidelines:
 * - HIGH: Red
 * - MEDIUM: Orange
 * - LOW: Blue
 */
export const getPriorityColor = (priority: Priority): string => {
  switch (priority) {
    case Priority.HIGH:
      return 'red';
    case Priority.MEDIUM:
      return 'orange';
    case Priority.LOW:
      return 'blue';
    default:
      return 'default';
  }
};
