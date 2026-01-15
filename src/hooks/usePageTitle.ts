import { useEffect } from 'react';

import { APP_NAME } from '@/utils/constants';

/**
 * Hook to update the browser page title dynamically
 *
 * @param title - The page title (will be formatted as "{title} | {APP_NAME}")
 * @param suffix - Optional suffix to append after the app name
 *
 * @example
 * ```tsx
 * usePageTitle('Goals');
 * // Sets title to "Goals | Momentum"
 *
 * usePageTitle('Goals', 'List');
 * // Sets title to "Goals | Momentum - List"
 * ```
 */
export const usePageTitle = (title?: string, suffix?: string): void => {
  useEffect(() => {
    let pageTitle = APP_NAME;

    if (title) {
      pageTitle = `${title} | ${APP_NAME}`;
      if (suffix) {
        pageTitle = `${title} | ${APP_NAME} - ${suffix}`;
      }
    }

    document.title = pageTitle;
  }, [title, suffix]);
};

