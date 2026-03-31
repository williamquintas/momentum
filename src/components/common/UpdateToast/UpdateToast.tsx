/**
 * UpdateToast Component
 *
 * Shows a notification when a new version of the PWA is available.
 * Provides options to update now or dismiss the notification.
 */

import React, { useEffect, useState } from 'react';

import { Modal } from 'antd';

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
      title="Update Available"
      open={isModalVisible}
      onOk={handleUpdateNow}
      onCancel={handleLater}
      okText="Update Now"
      cancelText="Later"
      closable={false}
      maskClosable={false}
      centered
    >
      <p>A new version of the app is available. Would you like to update now?</p>
      <p style={{ color: '#666', fontSize: '14px' }}>
        Updating will refresh the page and load the latest features and fixes.
      </p>
    </Modal>
  );
};
