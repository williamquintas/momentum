/**
 * Date Formatting and Deadline Utilities
 *
 * Provides utilities for formatting dates and checking deadline status
 * according to the mockup specifications.
 */

import { format } from 'date-fns';

/**
 * Format date for display (e.g., "Aug 30, 2022")
 * Matches mockup format requirements
 */
export const formatDate = (date: Date | undefined | null): string => {
  if (!date) {
    return '';
  }
  return format(date, 'MMM d, yyyy');
};

/**
 * Format date in short format (e.g., "Aug 30")
 * Used when year is not needed
 */
export const formatDateShort = (date: Date | undefined | null): string => {
  if (!date) {
    return '';
  }
  return format(date, 'MMM d');
};

/**
 * Check if a deadline is overdue
 */
export const isOverdue = (deadline: Date | undefined | null): boolean => {
  if (!deadline) {
    return false;
  }
  const now = new Date();
  // Compare dates without time
  const deadlineDate = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return deadlineDate < today;
};

/**
 * Check if deadline is due soon (within 7 days)
 */
export const isDueSoon = (deadline: Date | undefined | null): boolean => {
  if (!deadline || isOverdue(deadline)) {
    return false;
  }
  const now = new Date();
  const deadlineDate = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 7 && diffDays > 0;
};

/**
 * Calculate days until deadline (positive) or days overdue (negative)
 */
export const getDaysUntilDeadline = (deadline: Date | undefined | null): number | null => {
  if (!deadline) {
    return null;
  }
  const now = new Date();
  const deadlineDate = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Get deadline status text for display
 * Returns "Overdue by X days", "In X days", or "Due Soon"
 */
export const getDeadlineStatusText = (deadline: Date | undefined | null): string | null => {
  if (!deadline) {
    return null;
  }
  const days = getDaysUntilDeadline(deadline);
  if (days === null) {
    return null;
  }
  if (days < 0) {
    return `Overdue by ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''}`;
  }
  if (days === 0) {
    return 'Due today';
  }
  if (days <= 7) {
    return `In ${days} day${days !== 1 ? 's' : ''}`;
  }
  return null;
};

/**
 * Get detailed countdown text for deadline
 * Shows hours/minutes for deadlines within 24 hours
 * Shows days for deadlines further out
 */
export const getDeadlineCountdown = (deadline: Date | undefined | null): string | null => {
  if (!deadline) {
    return null;
  }
  const now = new Date();
  const deadlineTime = deadline.getTime();
  const nowTime = now.getTime();
  const diffMs = deadlineTime - nowTime;

  if (diffMs < 0) {
    // Overdue
    const daysOverdue = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60 * 24));
    const hoursOverdue = Math.floor((Math.abs(diffMs) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (daysOverdue > 0) {
      return `Overdue by ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''}${hoursOverdue > 0 ? ` ${hoursOverdue}h` : ''}`;
    }
    return `Overdue by ${hoursOverdue}h`;
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 7) {
    return `${days} days remaining`;
  }
  if (days > 0) {
    return `${days} day${days !== 1 ? 's' : ''}${hours > 0 ? ` ${hours}h` : ''} remaining`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }
  if (minutes > 0) {
    return `${minutes}m remaining`;
  }
  return 'Due now';
};
