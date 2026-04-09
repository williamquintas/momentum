/**
 * Release Notifications Hook
 *
 * Custom hook for managing release notifications with React Query.
 */
import { useCallback, useEffect, useMemo } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchReleases } from '../services/githubApi';
import {
  loadNotifications,
  saveNotifications,
  saveLastChecked,
  markAsRead as markAsReadStorage,
  markAllAsRead as markAllAsReadStorage,
  hasBeenNotified,
} from '../services/notificationStorage';
import type { GitHubRelease, ReleaseNotification } from '../types';

// Query keys
export const releaseQueryKeys = {
  releases: ['releases'] as const,
  latest: ['releases', 'latest'] as const,
};

// Polling interval in milliseconds (1 hour)
const POLLING_INTERVAL = 60 * 60 * 1000;

interface UseReleaseNotificationsOptions {
  autoCheck?: boolean;
  pollInterval?: number;
  onNewRelease?: (release: GitHubRelease) => void;
}

interface UseReleaseNotificationsReturn {
  notifications: ReleaseNotification[];
  unreadCount: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  lastChecked: string | null;
  refetch: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissNotification: (id: string) => void;
  latestRelease: GitHubRelease | undefined;
}

/**
 * Hook for managing release notifications
 */
export const useReleaseNotifications = ({
  autoCheck = true,
  pollInterval = POLLING_INTERVAL,
  onNewRelease,
}: UseReleaseNotificationsOptions = {}): UseReleaseNotificationsReturn => {
  const queryClient = useQueryClient();

  // Load initial notification state
  const initialState = useMemo(() => loadNotifications(), []);

  // Query for fetching releases from GitHub
  const {
    data: releases = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: releaseQueryKeys.releases,
    queryFn: fetchReleases,
    staleTime: pollInterval,
    refetchInterval: pollInterval,
    enabled: autoCheck,
  });

  // Update notifications when releases are fetched
  useEffect(() => {
    if (!releases.length) return;

    const currentNotifications =
      queryClient.getQueryData<ReleaseNotification[]>(['notifications']) || initialState.notifications;
    const newNotifications: ReleaseNotification[] = [];

    for (const release of releases) {
      if (!hasBeenNotified(currentNotifications, release.id)) {
        newNotifications.push({
          id: `release-${release.id}`,
          release,
          isRead: false,
          viewedAt: null,
          createdAt: new Date().toISOString(),
        });

        // Call onNewRelease callback for unread releases
        if (onNewRelease) {
          onNewRelease(release);
        }
      }
    }

    // Always update cache with latest notifications (even if no new ones)
    const allNotifications = [...currentNotifications, ...newNotifications].slice(0, 20);
    saveNotifications(allNotifications);
    queryClient.setQueryData(['notifications'], allNotifications);

    // Save last checked time
    const now = new Date().toISOString();
    saveLastChecked(now);
    queryClient.setQueryData(['lastChecked'], now);
  }, [releases, initialState.notifications, onNewRelease, queryClient]);

  // Get notifications from query cache or initial state
  const notifications = useMemo(() => {
    const cached = queryClient.getQueryData<ReleaseNotification[]>(['notifications']);
    return cached || initialState.notifications;
  }, [queryClient, initialState.notifications]);

  // Calculate unread count
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  // Get last checked time
  const lastChecked = useMemo(() => {
    const cached = queryClient.getQueryData<string>(['lastChecked']);
    return cached || initialState.lastChecked;
  }, [queryClient, initialState.lastChecked]);

  // Get latest release
  const latestRelease = useMemo(() => {
    return releases[0];
  }, [releases]);

  // Mark notification as read - get fresh notifications from cache to avoid stale closure
  const markAsRead = useCallback(
    (id: string) => {
      const currentNotifications = queryClient.getQueryData<ReleaseNotification[]>(['notifications']) || [];
      const updatedNotifications = markAsReadStorage(currentNotifications, id);
      saveNotifications(updatedNotifications);
      queryClient.setQueryData(['notifications'], updatedNotifications);
    },
    [queryClient]
  );

  // Mark all as read - get fresh notifications from cache to avoid stale closure
  const markAllAsRead = useCallback(() => {
    const currentNotifications = queryClient.getQueryData<ReleaseNotification[]>(['notifications']) || [];
    const updatedNotifications = markAllAsReadStorage(currentNotifications);
    saveNotifications(updatedNotifications);
    queryClient.setQueryData(['notifications'], updatedNotifications);
  }, [queryClient]);

  // Dismiss a notification (remove it) - get fresh notifications from cache
  const dismissNotification = useCallback(
    (id: string) => {
      const currentNotifications = queryClient.getQueryData<ReleaseNotification[]>(['notifications']) || [];
      const updatedNotifications = currentNotifications.filter((n) => n.id !== id);
      saveNotifications(updatedNotifications);
      queryClient.setQueryData(['notifications'], updatedNotifications);
    },
    [queryClient]
  );

  return {
    notifications,
    unreadCount,
    isLoading,
    isError,
    error: error,
    lastChecked,
    refetch: async (): Promise<void> => {
      await refetch();
    },
    markAsRead,
    markAllAsRead,
    dismissNotification,
    latestRelease,
  };
};
