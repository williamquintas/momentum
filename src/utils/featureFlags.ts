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
}

/**
 * Get feature flag value from environment variable
 *
 * @param key - Environment variable key (with VITE_ prefix)
 * @param defaultValue - Default value if not set (defaults to false)
 * @returns Boolean value of the feature flag
 */
function getFeatureFlag(key: string, defaultValue = false): boolean {
  const value = import.meta.env[key];
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
};

/**
 * Get available goal types based on feature flags
 *
 * @param allTypes - Array of all available goal types (e.g., Object.values(GoalType))
 * @returns Filtered array of goal types based on feature flags
 */
export function getAvailableGoalTypes<T extends string>(allTypes: readonly T[]): T[] {
  if (featureFlags.enableQuantitativeOnly) {
    // Only return quantitative type if the flag is enabled
    // GoalType.QUANTITATIVE = 'quantitative'
    return allTypes.filter((type) => type === 'quantitative') as T[];
  }
  return [...allTypes];
}

