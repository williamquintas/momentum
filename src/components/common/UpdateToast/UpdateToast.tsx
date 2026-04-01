/**
 * UpdateToast Component
 *
 * Shows a notification when a new version of the PWA is available.
 * Provides options to update now or dismiss the notification.
 */

import React, { useEffect, useState } from 'react';

import { Modal } from 'antd';
import { useTranslation } from 'react-i18next';

import { usePwaUpdate } from '@/hooks/usePwaUpdate';

export interface UpdateToastProps {
  /**
   * Whether the toast should be visible (for testing purposes)
   * @default true
   */
  testMode?: boolean;
}

/**
 * UpdateToast Component
 *
 * Displays a modal notification when a PWA update is available.
 * Allows users to either update immediately or dismiss the notification.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <UpdateToast />
 * ```
 */
export const UpdateToast: React.FC<UpdateToastProps> = ({ testMode = false }) => {
  const { updateAvailable, updatedApp } = usePwaUpdate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { t } = useTranslation();

  // Show modal when update is available
  useEffect(() => {
    if (updateAvailable || testMode) {
      setIsModalVisible(true);
    }
  }, [updateAvailable, testMode]);

  /**
   * Handle the "Update Now" button click
   * Reloads the page to apply the update
   */
  const handleUpdateNow = (): void => {
    setIsModalVisible(false);
    updatedApp();
  };

  /**
   * Handle the "Later" button click
   * Dismisses the notification without updating
   */
  const handleLater = (): void => {
    setIsModalVisible(false);
  };

  return (
    <Modal
      title={t('pwa.update.title')}
      open={isModalVisible}
      onOk={handleUpdateNow}
      onCancel={handleLater}
      okText={t('pwa.update.updateNow')}
      cancelText={t('pwa.update.later')}
      closable={false}
      maskClosable={false}
      centered
    >
      <p>{t('pwa.update.description')}</p>
      <p style={{ color: '#666', fontSize: '14px' }}>{t('pwa.update.refreshInfo')}</p>
    </Modal>
  );
};
