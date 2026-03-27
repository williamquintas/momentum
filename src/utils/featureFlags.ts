/**
 * Feature Flags Configuration
 *
 * Centralized feature flag management using environment variables.
 * Follows the environment-config.md guidelines for Vite projects.
 *
 * Feature flags use the VITE_* prefix for client-side variables.
 * All feature flags are boolean values that default to false (disabled).
 *
 * Usage:
 *   import { featureFlags } from '@/utils/featureFlags';
 *   if (featureFlags.enableQuantitativeOnly) {
 *     // Only show quantitative goals
 *   }
 */

import { GoalType } from '@/types/goal.types';

/**
 * Feature flags configuration interface
 */
export interface FeatureFlags {
  /**
   * Enable only quantitative goals.
   * When enabled, only quantitative goal type will be available for creation
   * and filtering. Other goal types will be hidden from the UI.
   *
   * Environment variable: VITE_ENABLE_QUANTITATIVE_ONLY
   * Default: false
   */
  enableQuantitativeOnly: boolean;

  /**
   * Enable milestone goals.
   * When disabled, milestone goal type will be hidden from UI and
   * new milestone goals cannot be created.
   *
   * Environment variable: VITE_ENABLE_MILESTONE
   * Default: true
   */
  enableMilestone: boolean;

  /**
   * Enable recurring goals.
   * When disabled, recurring goal type will be hidden from UI and
   * new recurring goals cannot be created.
   *
   * Environment variable: VITE_ENABLE_RECURRING
   * Default: true
   */
  enableRecurring: boolean;

  /**
   * Enable habit goals.
   * When disabled, habit goal type will be hidden from UI and
   * new habit goals cannot be created.
   *
   * Environment variable: VITE_ENABLE_HABIT
   * Default: true
   */
  enableHabit: boolean;

  /**
   * Enable file attachments for goals.
   * When disabled, attachment UI is hidden and uploads are prevented.
   *
   * Environment variable: VITE_ENABLE_ATTACHMENTS
   * Default: true
   */
  enableAttachments: boolean;

  /**
   * Enable goal notes.
   * When disabled, notes UI is hidden and new notes cannot be added.
   *
   * Environment variable: VITE_ENABLE_NOTES
   * Default: true
   */
  enableNotes: boolean;
}

/**
 * Get feature flag value from environment variable
 *
 * @param key - Environment variable key (with VITE_ prefix)
 * @param defaultValue - Default value if not set (defaults to false)
 * @returns Boolean value of the feature flag
 */
function getFeatureFlag(key: string, defaultValue = false): boolean {
  const value = import.meta.env[key] as string | undefined | boolean;
  if (value === undefined || value === null) {
    return defaultValue;
  }
  // Handle string values: 'true', '1', 'yes' -> true, everything else -> false
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1' || value.toLowerCase() === 'yes';
  }
  return Boolean(value);
}

/**
 * Feature flags configuration
 *
 * All feature flags are loaded from environment variables at build time.
 * Changes require a rebuild of the application.
 */
export const featureFlags: FeatureFlags = {
  enableQuantitativeOnly: getFeatureFlag('VITE_ENABLE_QUANTITATIVE_ONLY', false),
  enableMilestone: getFeatureFlag('VITE_ENABLE_MILESTONE', false),
  enableRecurring: getFeatureFlag('VITE_ENABLE_RECURRING', false),
  enableHabit: getFeatureFlag('VITE_ENABLE_HABIT', false),
  enableAttachments: getFeatureFlag('VITE_ENABLE_ATTACHMENTS', false),
  enableNotes: getFeatureFlag('VITE_ENABLE_NOTES', false),
};

/**
 * Check if a goal type is enabled based on feature flags
 *
 * @param type - The goal type to check
 * @returns true if the goal type is enabled, false otherwise
 */
export function isGoalTypeEnabled(type: GoalType): boolean {
  const flagMap: Record<GoalType, keyof FeatureFlags> = {
    [GoalType.QUANTITATIVE]: 'enableQuantitativeOnly',
    [GoalType.QUALITATIVE]: 'enableQuantitativeOnly',
    [GoalType.BINARY]: 'enableQuantitativeOnly',
    [GoalType.MILESTONE]: 'enableMilestone',
    [GoalType.RECURRING]: 'enableRecurring',
    [GoalType.HABIT]: 'enableHabit',
  };

  const flag = flagMap[type];
  if (!flag) return false;

  if (flag === 'enableQuantitativeOnly') {
    return !featureFlags.enableQuantitativeOnly;
  }

  return featureFlags[flag] ?? false;
}

/**
 * Check if a specific feature is enabled
 *
 * @param feature - The feature to check ('attachments' | 'notes')
 * @returns true if the feature is enabled, false otherwise
 */
export function isFeatureEnabled(feature: 'attachments' | 'notes'): boolean {
  if (feature === 'attachments') {
    return featureFlags.enableAttachments;
  }
  if (feature === 'notes') {
    return featureFlags.enableNotes;
  }
  return false;
}

/**
 * Get available goal types based on feature flags
 *
 * @param allTypes - Array of all available goal types (e.g., Object.values(GoalType))
 * @returns Filtered array of goal types based on feature flags
 */
export function getAvailableGoalTypes<T extends string>(allTypes: readonly T[]): T[] {
  if (featureFlags.enableQuantitativeOnly) {
    return allTypes.filter((type) => type === 'quantitative');
  }

  const goalTypeFlags: Record<string, keyof FeatureFlags> = {
    milestone: 'enableMilestone',
    recurring: 'enableRecurring',
    habit: 'enableHabit',
  };

  return allTypes.filter((type) => {
    const flag = goalTypeFlags[type];
    if (!flag) return true;
    return featureFlags[flag] ?? false;
  });
}
