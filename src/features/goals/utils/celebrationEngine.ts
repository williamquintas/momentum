/**
 * Celebration Engine
 *
 * Functions to determine and trigger celebration feedback
 * when a goal is completed.
 */

import type { CelebrationData } from '@/features/goals/types/completion';
import type { Goal } from '@/types/goal.types';

/**
 * Get personalized celebration data for a goal
 */
export function getCelebrationForGoal(goal: Goal, userPreferences?: Partial<CelebrationData>): CelebrationData {
  // Determine celebration type based on goal characteristics
  const baseCelebration = getBaseCelebration(goal);

  // Apply user preferences if provided
  return applyPreferences(baseCelebration, userPreferences);
}

/**
 * Get the base celebration based on goal type and progress
 */
function getBaseCelebration(goal: Goal): CelebrationData {
  // High progress overshoot - more enthusiastic celebration
  if (goal.progress > 150) {
    return {
      type: 'enthusiastic',
      message: 'Outstanding! You exceeded your goal by more than 50%! 🎉',
      badge: 'overachiever',
      animation: true,
      sound: true,
    };
  }

  // Normal completion
  if (goal.progress >= 100) {
    return {
      type: 'moderate',
      message: 'Congratulations on completing your goal! 🎯',
      badge: 'goal-completer',
      animation: true,
      sound: false, // Default to no sound for accessibility
    };
  }

  // Edge case: override completion
  return {
    type: 'subtle',
    message: 'Goal marked as complete (with override)',
    animation: false,
    sound: false,
  };
}

/**
 * Apply user preferences to celebration
 */
function applyPreferences(celebration: CelebrationData, preferences?: Partial<CelebrationData>): CelebrationData {
  if (!preferences) {
    return celebration;
  }

  return {
    ...celebration,
    ...preferences,
    // Ensure type is always set
    type: preferences.type || celebration.type,
  };
}

/**
 * Trigger the celebration (show to user)
 * This is a placeholder - actual implementation would integrate with UI
 */
export function triggerCelebration(_celebration: CelebrationData): void {
  // In a real implementation, this would:
  // 1. Show a toast/notification
  // 2. Play sound if enabled
  // 3. Show animation if enabled
  // 4. Award badge if applicable
}

/**
 * Get available celebration types
 */
export function getCelebrationTypes(): Array<{
  type: CelebrationData['type'];
  label: string;
  description: string;
}> {
  return [
    {
      type: 'subtle',
      label: 'Subtle',
      description: 'Minimal celebration with just a message',
    },
    {
      type: 'moderate',
      label: 'Moderate',
      description: 'Message with light animation',
    },
    {
      type: 'enthusiastic',
      label: 'Enthusiastic',
      description: 'Full celebration with animation and sound',
    },
  ];
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get celebration data respecting accessibility preferences
 */
export function getAccessibleCelebration(goal: Goal): CelebrationData {
  const celebration = getCelebrationForGoal(goal);

  // Respect reduced motion preference
  if (prefersReducedMotion()) {
    return {
      ...celebration,
      animation: false,
    };
  }

  return celebration;
}
