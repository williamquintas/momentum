/**
 * Release Notification Storage Service
 *
 * Service for persisting release notification state to localStorage.
 */
import type { ReleaseNotification, ReleaseNotificationState } from '../types';

const STORAGE_KEY = 'momentum_release_notifications';
const LAST_CHECKED_KEY = 'momentum_last_checked';

/**
 * Load notifications from localStorage
 */
export const loadNotifications = (): ReleaseNotificationState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const lastChecked = localStorage.getItem(LAST_CHECKED_KEY);

    if (stored) {
      const parsed = JSON.parse(stored) as { notifications: ReleaseNotification[] };
      return {
        notifications: parsed.notifications || [],
        lastChecked,
        isLoading: false,
        error: null,
      };
    }
  } catch (error) {
    console.error('Failed to load notifications from storage:', error);
  }

  return {
    notifications: [],
    lastChecked: null,
    isLoading: false,
    error: null,
  };
};

/**
 * Save notifications to localStorage
 */
export const saveNotifications = (notifications: ReleaseNotification[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ notifications }));
  } catch (error) {
    console.error('Failed to save notifications to storage:', error);
  }
};

/**
 * Save last checked timestamp to localStorage
 */
export const saveLastChecked = (timestamp: string): void => {
  try {
    localStorage.setItem(LAST_CHECKED_KEY, timestamp);
  } catch (error) {
    console.error('Failed to save last checked timestamp:', error);
  }
};

/**
 * Get last checked timestamp from localStorage
 */
export const getLastChecked = (): string | null => {
  try {
    return localStorage.getItem(LAST_CHECKED_KEY);
  } catch {
    return null;
  }
};

/**
 * Mark notification as read
 */
export const markAsRead = (notifications: ReleaseNotification[], id: string): ReleaseNotification[] => {
  return notifications.map((notification) => {
    if (notification.id === id) {
      return {
        ...notification,
        isRead: true,
        viewedAt: new Date().toISOString(),
      };
    }
    return notification;
  });
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = (notifications: ReleaseNotification[]): ReleaseNotification[] => {
  return notifications.map((notification) => ({
    ...notification,
    isRead: true,
    viewedAt: new Date().toISOString(),
  }));
};

/**
 * Clear all notifications from storage
 */
export const clearNotifications = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LAST_CHECKED_KEY);
  } catch (error) {
    console.error('Failed to clear notifications from storage:', error);
  }
};

/**
 * Check if a release has already been notified
 */
export const hasBeenNotified = (notifications: ReleaseNotification[], releaseId: number): boolean => {
  return notifications.some((n) => n.release.id === releaseId);
};
