import { useEffect, useState, useCallback } from 'react';

/**
 * Return type for the usePwaUpdate hook
 */
interface UsePwaUpdateReturn {
  /**
   * Whether a new version of the app is available
   */
  updateAvailable: boolean;

  /**
   * Function to reload the app and apply the update
   */
  updatedApp: () => void;
}

/**
 * Hook to manage PWA automatic updates
 *
 * This hook listens for the 'swUpdated' event from vite-plugin-pwa
 * to detect when a new version of the app is available.
 *
 * @example
 * ```tsx
 * const { updateAvailable, updatedApp } = usePwaUpdate();
 *
 * if (updateAvailable) {
 *   // Show update notification
 * }
 * ```
 */
export const usePwaUpdate = (): UsePwaUpdateReturn => {
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);

  useEffect(() => {
    /**
     * Handler for the 'swUpdated' event from vite-plugin-pwa
     * Fired when a new service worker is available
     */
    const handleSwUpdated = (): void => {
      setUpdateAvailable(true);
    };

    // Listen for the service worker update event
    // This event is emitted by vite-plugin-pwa when a new SW is available
    window.addEventListener('swUpdated', handleSwUpdated);

    // Also listen for updatefound from the service worker registration
    // This provides a more direct way to detect updates
    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;

          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker is installed and ready
                setUpdateAvailable(true);
              }
            });
          }
        });
      });
    }

    // Cleanup on unmount
    return () => {
      window.removeEventListener('swUpdated', handleSwUpdated);
    };
  }, []);

  /**
   * Reloads the page to apply the update
   * Called when user clicks "Update Now" button
   */
  const updatedApp = useCallback((): void => {
    window.location.reload();
  }, []);

  return {
    updateAvailable,
    updatedApp,
  };
};
