/**
 * useViewMode Hook
 *
 * Manages view mode preference (table/list) with localStorage persistence.
 * Provides state and setter for view mode, automatically saving to localStorage.
 */

import { useState, useEffect } from 'react';

import { getStorageItem, setStorageItem } from '@/services/storage/localStorageService';

const VIEW_MODE_STORAGE_KEY = 'goals_view_mode';

export type ViewMode = 'table' | 'list';

/**
 * Default view mode
 */
const DEFAULT_VIEW_MODE: ViewMode = 'table';

/**
 * Hook to manage view mode preference
 * Persists preference to localStorage
 */
export const useViewMode = () => {
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    // Initialize from localStorage or use default
    try {
      const saved = getStorageItem<ViewMode>(VIEW_MODE_STORAGE_KEY);
      return saved === 'table' || saved === 'list' ? saved : DEFAULT_VIEW_MODE;
    } catch {
      return DEFAULT_VIEW_MODE;
    }
  });

  // Save to localStorage whenever view mode changes
  useEffect(() => {
    try {
      setStorageItem(VIEW_MODE_STORAGE_KEY, viewMode);
    } catch (error) {
      // Silently fail if localStorage is unavailable
      console.warn('Failed to save view mode preference:', error);
    }
  }, [viewMode]);

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
  };

  const toggleViewMode = () => {
    setViewModeState((current) => (current === 'table' ? 'list' : 'table'));
  };

  return {
    viewMode,
    setViewMode,
    toggleViewMode,
  };
};

