/**
 * Local Storage Service
 *
 * Core wrapper for Local Storage operations with error handling,
 * quota management, and data validation.
 */

import {
  STORAGE_KEYS,
  CURRENT_STORAGE_VERSION,
  StorageError,
  StorageErrorType,
  type StorageStructure,
} from './storageTypes';

/**
 * Check if Local Storage is available
 */
export const isStorageAvailable = (): boolean => {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get item from Local Storage with error handling
 */
export const getStorageItem = <T>(key: string): T | null => {
  if (!isStorageAvailable()) {
    throw new StorageError(
      StorageErrorType.STORAGE_UNAVAILABLE,
      'Local Storage is not available in this browser'
    );
  }

  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return null;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new StorageError(
        StorageErrorType.CORRUPTED_DATA,
        `Corrupted data in Local Storage key: ${key}`,
        error as Error
      );
    }
    throw new StorageError(
      StorageErrorType.UNKNOWN,
      `Failed to read from Local Storage: ${key}`,
      error as Error
    );
  }
};

/**
 * Set item in Local Storage with error handling
 */
export const setStorageItem = <T>(key: string, value: T): void => {
  if (!isStorageAvailable()) {
    throw new StorageError(
      StorageErrorType.STORAGE_UNAVAILABLE,
      'Local Storage is not available in this browser'
    );
  }

  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      throw new StorageError(
        StorageErrorType.QUOTA_EXCEEDED,
        'Local Storage quota exceeded. Please free up space or export/archive old goals.',
        error
      );
    }
    throw new StorageError(
      StorageErrorType.UNKNOWN,
      `Failed to write to Local Storage: ${key}`,
      error as Error
    );
  }
};

/**
 * Remove item from Local Storage
 */
export const removeStorageItem = (key: string): void => {
  if (!isStorageAvailable()) {
    return; // Silently fail if storage unavailable
  }

  try {
    localStorage.removeItem(key);
  } catch (error) {
    // Log but don't throw for remove operations
    console.error(`Failed to remove item from Local Storage: ${key}`, error);
  }
};

/**
 * Clear all goal-related data from Local Storage
 */
export const clearGoalsStorage = (): void => {
  Object.values(STORAGE_KEYS).forEach((key) => {
    if (key !== STORAGE_KEYS.STORAGE_VERSION) {
      removeStorageItem(key);
    }
  });
};

/**
 * Initialize storage structure if it doesn't exist
 */
export const initializeStorage = (): StorageStructure => {
  const existingVersion = getStorageItem<number>(STORAGE_KEYS.STORAGE_VERSION);

  // Check if migration is needed
  if (existingVersion !== null && existingVersion !== CURRENT_STORAGE_VERSION) {
    // TODO: Implement migration logic in future versions
    console.warn(`Storage version mismatch: ${existingVersion} vs ${CURRENT_STORAGE_VERSION}`);
  }

  // Initialize if not exists
  const goalsIndex = getStorageItem<StorageStructure['goalsIndex']>(STORAGE_KEYS.GOALS_INDEX) || {
    ids: [],
    lastUpdated: new Date().toISOString(),
  };

  const goalsData = getStorageItem<StorageStructure['goalsData']>(STORAGE_KEYS.GOALS_DATA) || {};

  const goalsByType = getStorageItem<StorageStructure['goalsByType']>(STORAGE_KEYS.GOALS_BY_TYPE) || {};

  const goalsByStatus =
    getStorageItem<StorageStructure['goalsByStatus']>(STORAGE_KEYS.GOALS_BY_STATUS) || {};

  const goalsByCategory =
    getStorageItem<StorageStructure['goalsByCategory']>(STORAGE_KEYS.GOALS_BY_CATEGORY) || {};

  const goalsByTag = getStorageItem<StorageStructure['goalsByTag']>(STORAGE_KEYS.GOALS_BY_TAG) || {};

  // Save version
  setStorageItem(STORAGE_KEYS.STORAGE_VERSION, CURRENT_STORAGE_VERSION);

  return {
    version: CURRENT_STORAGE_VERSION,
    goalsIndex,
    goalsData,
    goalsByType,
    goalsByStatus,
    goalsByCategory,
    goalsByTag,
  };
};

/**
 * Get storage size estimate (approximate)
 */
export const getStorageSize = (): { used: number; available: number } => {
  if (!isStorageAvailable()) {
    return { used: 0, available: 0 };
  }

  let used = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      if (value) {
        used += key.length + value.length;
      }
    }
  }

  // Most browsers have ~5-10MB limit, estimate 5MB as available
  const available = 5 * 1024 * 1024; // 5MB in bytes

  return { used, available };
};

/**
 * Check if storage is getting full (warn at 80% usage)
 */
export const isStorageNearLimit = (): boolean => {
  const { used, available } = getStorageSize();
  return available > 0 && used / available > 0.8;
};

