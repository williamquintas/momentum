import { useEffect, useState, useCallback, useRef } from 'react';

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
 * Keep an installed update waiting until the user explicitly accepts a reload.
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
  const registrationRef = useRef<ServiceWorkerRegistration>();
  const shouldReloadRef = useRef(false);
  const updateAppliedRef = useRef(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return undefined;
    let disposed = false;
    let removeRegistrationListeners = (): void => {};
    const serviceWorker = navigator.serviceWorker;
    const wasControlled = Boolean(serviceWorker.controller);
    const handleControllerChange = (): void => {
      // Updating another tab must not discard this tab's edits.
      if (shouldReloadRef.current) {
        shouldReloadRef.current = false;
        globalThis.location.reload();
      } else if (wasControlled) {
        updateAppliedRef.current = true;
        setUpdateAvailable(true);
      }
    };
    serviceWorker.addEventListener('controllerchange', handleControllerChange);
    void serviceWorker.ready
      .then((registration) => {
        if (disposed) return;
        registrationRef.current = registration;
        const updateAvailability = (): void => {
          if (!disposed) setUpdateAvailable(Boolean(registration.waiting && serviceWorker.controller));
        };
        let installingWorker: ServiceWorker | null = null;
        const handleStateChange = (): void => updateAvailability();
        const handleUpdateFound = (): void => {
          installingWorker?.removeEventListener('statechange', handleStateChange);
          installingWorker = registration.installing;
          installingWorker?.addEventListener('statechange', handleStateChange);
          updateAvailability();
        };
        registration.addEventListener('updatefound', handleUpdateFound);
        handleUpdateFound();
        removeRegistrationListeners = (): void => {
          registration.removeEventListener('updatefound', handleUpdateFound);
          installingWorker?.removeEventListener('statechange', handleStateChange);
        };
      })
      .catch(() => {
        if (!disposed) setUpdateAvailable(false);
      });
    return () => {
      disposed = true;
      shouldReloadRef.current = false;
      updateAppliedRef.current = false;
      registrationRef.current = undefined;
      serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      removeRegistrationListeners();
    };
  }, []);

  /**
   * Reloads the page to apply the update
   * Called when user clicks "Update Now" button
   */
  const updatedApp = useCallback((): void => {
    const waitingWorker = registrationRef.current?.waiting;
    if (!waitingWorker) {
      if (updateAppliedRef.current) {
        updateAppliedRef.current = false;
        globalThis.location.reload();
      }
      return;
    }
    shouldReloadRef.current = true;
    try {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    } catch {
      shouldReloadRef.current = false;
    }
  }, []);

  return {
    updateAvailable,
    updatedApp,
  };
};
