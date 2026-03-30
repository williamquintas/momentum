import { useEffect, useState, useCallback } from 'react';

/**
 * The BeforeInstallPromptEvent is fired at the Window when a user is
 * prompted to install a web application to their device.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/BeforeInstallPromptEvent
 */
interface BeforeInstallPromptEvent extends Event {
  /**
   * An array of platforms on which the user can install the app
   */
  readonly platforms: string[];

  /**
   * A Promise that resolves to a UserChoice object containing the user's
   * response to the prompt
   */
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;

  /**
   * Shows the install prompt to the user
   */
  prompt(): Promise<void>;
}

/**
 * Return type for the usePwaInstall hook
 */
interface UsePwaInstallReturn {
  /**
   * Whether the app can be installed (true when the beforeinstallprompt event has fired)
   */
  isInstallable: boolean;

  /**
   * The deferred prompt event, which can be used to show the install prompt
   * Contains the event from the beforeinstallprompt event listener
   */
  deferredPrompt: BeforeInstallPromptEvent | null;

  /**
   * Function to trigger the app installation prompt
   * Calls prompt() on the deferredPrompt if available
   */
  handleInstall: () => Promise<void>;
}

/**
 * Hook to manage PWA installation
 *
 * This hook listens for the beforeinstallprompt event to determine if the
 * app can be installed as a PWA, and provides a function to trigger the
 * installation prompt.
 *
 * @example
 * ```tsx
 * const { isInstallable, deferredPrompt, handleInstall } = usePwaInstall();
 *
 * if (isInstallable) {
 *   <button onClick={handleInstall}>Install App</button>
 * }
 * ```
 */
export const usePwaInstall = (): UsePwaInstallReturn => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    /**
     * Handler for the beforeinstallprompt event
     *
     * @param event - The beforeinstallprompt event
     */
    const handleBeforeInstallPrompt = (event: Event): void => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      event.preventDefault();

      // Store the event for later use
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  /**
   * Triggers the installation prompt
   * Only works when deferredPrompt is available (after beforeinstallprompt has fired)
   */
  const handleInstall = useCallback(async (): Promise<void> => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    await deferredPrompt.prompt();

    // Reset the deferred prompt after use (the prompt can only be shown once)
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  return {
    isInstallable: deferredPrompt !== null,
    deferredPrompt,
    handleInstall,
  };
};
