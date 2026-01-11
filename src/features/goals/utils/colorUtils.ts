/**
 * Color Utilities for Goals
 *
 * Provides consistent color mapping for status and priority tags
 * according to mockup specifications.
 */

import { GoalStatus, Priority } from '@/features/goals/types';

/**
 * Get color for status tag
 * Aligned with mockup color scheme:
 * - COMPLETED: Blue
 * - ACTIVE (In Progress): Orange
 * - PAUSED: Orange
 * - CANCELLED: Red
 */
export const getStatusColor = (status: GoalStatus): string => {
  switch (status) {
    case GoalStatus.ACTIVE:
      return 'orange'; // "In Progress" shown as orange in mockup
    case GoalStatus.COMPLETED:
      return 'blue'; // Completed shown as blue in mockup
    case GoalStatus.PAUSED:
      return 'orange';
    case GoalStatus.CANCELLED:
      return 'red';
    default:
      return 'default';
  }
};

/**
 * Get color for priority tag
 * Aligned with mockup color scheme:
 * - HIGH: Green (shown as green bar in mockup)
 * - MEDIUM: Blue (shown as blue bar in mockup)
 * - LOW: Blue (or default)
 */
export const getPriorityColor = (priority: Priority): string => {
  switch (priority) {
    case Priority.HIGH:
      return 'green'; // High priority shown as green in mockup
    case Priority.MEDIUM:
      return 'blue'; // Medium priority shown as blue in mockup
    case Priority.LOW:
      return 'blue';
    default:
      return 'default';
  }
};

