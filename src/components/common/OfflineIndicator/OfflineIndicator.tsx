/**
 * OfflineIndicator Component
 *
 * Shows a warning banner when the user is offline.
 * Uses Ant Design Alert component to display the offline message.
 */

import React, { useState } from 'react';

import { Alert } from 'antd';
import { useTranslation } from 'react-i18next';

import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export interface OfflineIndicatorProps {
  /**
   * Whether the alert can be dismissed by the user
   * @default true
   */
  dismissible?: boolean;
}

/**
 * OfflineIndicator Component
 *
 * Displays a warning message when the browser is offline.
 * Optionally allows the user to dismiss the warning.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <OfflineIndicator />
 *
 * // With dismiss disabled
 * <OfflineIndicator dismissible={false} />
 * ```
 */
export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ dismissible = true }) => {
  const { t } = useTranslation();
  const { isOffline } = useNetworkStatus();
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't render anything when online or dismissed
  if (!isOffline || isDismissed) {
    return null;
  }

  const handleClose = (): void => {
    setIsDismissed(true);
  };

  return (
    <Alert
      message={t('offline.message')}
      type="warning"
      showIcon
      closable={dismissible}
      onClose={handleClose}
      className="offline-indicator"
    />
  );
};
