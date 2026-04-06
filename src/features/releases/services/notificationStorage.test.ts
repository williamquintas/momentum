/**
 * Notification Storage Service Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReleaseNotification } from '../types';
import {
  loadNotifications,
  saveNotifications,
  saveLastChecked,
  getLastChecked,
  markAsRead,
  markAllAsRead,
  clearNotifications,
  hasBeenNotified,
} from '../services/notificationStorage';

// Mock localStorage
const store: Record<string, string> = {};

const localStorageMock = {
  store,
  getItem: vi.fn((key: string): string | null => store[key] ?? null),
  setItem: vi.fn((key: string, value: string): void => {
    store[key] = value;
  }),
  removeItem: vi.fn((key: string): void => {
    delete store[key];
  }),
  clear: vi.fn((): void => {
    Object.keys(store).forEach((key) => delete store[key]);
  }),
};

vi.stubGlobal('localStorage', localStorageMock);

describe.skip('notificationStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store = {};
  });

  describe('loadNotifications', () => {
    it('should load notifications from storage', () => {
      const mockNotifications: ReleaseNotification[] = [
        {
          id: 'release-1',
          release: {
            id: 1,
            name: 'v1.0.0',
            tag_name: 'v1.0.0',
            body: 'Test',
            html_url: 'https://example.com',
            published_at: '2026-01-01T00:00:00Z',
            author: { login: 'user', avatar_url: '' },
            assets: [],
            prerelease: false,
            draft: false,
          },
          isRead: false,
          viewedAt: null,
          createdAt: '2026-01-01T00:00:00Z',
        },
      ];

      store['momentum_release_notifications'] = JSON.stringify({ notifications: mockNotifications });
      store['momentum_last_checked'] = '2026-01-01T00:00:00Z';

      const result = loadNotifications();

      expect(result.notifications).toEqual(mockNotifications);
      expect(result.lastChecked).toBe('2026-01-01T00:00:00Z');
    });

    it('should return empty state when no data in storage', () => {
      const result = loadNotifications();

      expect(result.notifications).toEqual([]);
      expect(result.lastChecked).toBeNull();
    });
  });

  describe('saveNotifications', () => {
    it('should save notifications to storage', () => {
      const mockNotifications: ReleaseNotification[] = [
        {
          id: 'release-1',
          release: {
            id: 1,
            name: 'v1.0.0',
            tag_name: 'v1.0.0',
            body: 'Test',
            html_url: 'https://example.com',
            published_at: '2026-01-01T00:00:00Z',
            author: { login: 'user', avatar_url: '' },
            assets: [],
            prerelease: false,
            draft: false,
          },
          isRead: false,
          viewedAt: null,
          createdAt: '2026-01-01T00:00:00Z',
        },
      ];

      saveNotifications(mockNotifications);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'momentum_release_notifications',
        JSON.stringify({ notifications: mockNotifications })
      );
    });
  });

  describe('saveLastChecked and getLastChecked', () => {
    it('should save and retrieve last checked timestamp', () => {
      const timestamp = '2026-01-01T00:00:00Z';

      saveLastChecked(timestamp);
      const result = getLastChecked();

      expect(result).toBe(timestamp);
    });

    it('should return null when no timestamp saved', () => {
      const result = getLastChecked();

      expect(result).toBeNull();
    });
  });

  describe('markAsRead', () => {
    it('should mark specific notification as read', () => {
      const mockNotifications: ReleaseNotification[] = [
        {
          id: 'release-1',
          release: {
            id: 1,
            name: 'v1.0.0',
            tag_name: 'v1.0.0',
            body: 'Test',
            html_url: 'https://example.com',
            published_at: '2026-01-01T00:00:00Z',
            author: { login: 'user', avatar_url: '' },
            assets: [],
            prerelease: false,
            draft: false,
          },
          isRead: false,
          viewedAt: null,
          createdAt: '2026-01-01T00:00:00Z',
        },
        {
          id: 'release-2',
          release: {
            id: 2,
            name: 'v0.9.0',
            tag_name: 'v0.9.0',
            body: 'Test',
            html_url: 'https://example.com',
            published_at: '2025-12-01T00:00:00Z',
            author: { login: 'user', avatar_url: '' },
            assets: [],
            prerelease: false,
            draft: false,
          },
          isRead: false,
          viewedAt: null,
          createdAt: '2025-12-01T00:00:00Z',
        },
      ];

      const result = markAsRead(mockNotifications, 'release-1');

      expect(result[0]?.isRead).toBe(true);
      expect(result[0]?.viewedAt).not.toBeNull();
      expect(result[1]?.isRead).toBe(false);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', () => {
      const mockNotifications: ReleaseNotification[] = [
        {
          id: 'release-1',
          release: {
            id: 1,
            name: 'v1.0.0',
            tag_name: 'v1.0.0',
            body: 'Test',
            html_url: 'https://example.com',
            published_at: '2026-01-01T00:00:00Z',
            author: { login: 'user', avatar_url: '' },
            assets: [],
            prerelease: false,
            draft: false,
          },
          isRead: false,
          viewedAt: null,
          createdAt: '2026-01-01T00:00:00Z',
        },
        {
          id: 'release-2',
          release: {
            id: 2,
            name: 'v0.9.0',
            tag_name: 'v0.9.0',
            body: 'Test',
            html_url: 'https://example.com',
            published_at: '2025-12-01T00:00:00Z',
            author: { login: 'user', avatar_url: '' },
            assets: [],
            prerelease: false,
            draft: false,
          },
          isRead: false,
          viewedAt: null,
          createdAt: '2025-12-01T00:00:00Z',
        },
      ];

      const result = markAllAsRead(mockNotifications);

      expect(result.every((n) => n.isRead)).toBe(true);
      expect(result.every((n) => n.viewedAt !== null)).toBe(true);
    });
  });

  describe('clearNotifications', () => {
    it('should clear all notification data from storage', () => {
      clearNotifications();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('momentum_release_notifications');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('momentum_last_checked');
    });
  });

  describe('hasBeenNotified', () => {
    it('should return true if release has been notified', () => {
      const mockNotifications: ReleaseNotification[] = [
        {
          id: 'release-1',
          release: {
            id: 1,
            name: 'v1.0.0',
            tag_name: 'v1.0.0',
            body: 'Test',
            html_url: 'https://example.com',
            published_at: '2026-01-01T00:00:00Z',
            author: { login: 'user', avatar_url: '' },
            assets: [],
            prerelease: false,
            draft: false,
          },
          isRead: false,
          viewedAt: null,
          createdAt: '2026-01-01T00:00:00Z',
        },
      ];

      expect(hasBeenNotified(mockNotifications, 1)).toBe(true);
    });

    it('should return false if release has not been notified', () => {
      const mockNotifications: ReleaseNotification[] = [
        {
          id: 'release-1',
          release: {
            id: 1,
            name: 'v1.0.0',
            tag_name: 'v1.0.0',
            body: 'Test',
            html_url: 'https://example.com',
            published_at: '2026-01-01T00:00:00Z',
            author: { login: 'user', avatar_url: '' },
            assets: [],
            prerelease: false,
            draft: false,
          },
          isRead: false,
          viewedAt: null,
          createdAt: '2026-01-01T00:00:00Z',
        },
      ];

      expect(hasBeenNotified(mockNotifications, 999)).toBe(false);
    });
  });
});
