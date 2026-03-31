import { useEffect, useState } from 'react';

/**
 * Return type for the useNetworkStatus hook
 */
interface UseNetworkStatusReturn {
  /**
   * Whether the browser is currently online
   */
  isOnline: boolean;

  /**
   * Whether the browser is currently offline
   */
  isOffline: boolean;
}

/**
 * Hook to detect network connectivity status
 *
 * This hook listens to the browser's online/offline events and
 * provides real-time status of the network connection.
 *
 * @example
 * ```tsx
 * const { isOnline, isOffline } = useNetworkStatus();
 *
 * if (isOffline) {
 *   return <OfflineMessage />;
 * }
 * ```
 */
export const useNetworkStatus = (): UseNetworkStatusReturn => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    /**
     * Handler for the online event
     * Fired when the browser gains network connectivity
     */
    const handleOnline = (): void => {
      setIsOnline(true);
    };

    /**
     * Handler for the offline event
     * Fired when the browser loses network connectivity
     */
    const handleOffline = (): void => {
      setIsOnline(false);
    };

    // Add event listeners for network status changes
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
  };
};
