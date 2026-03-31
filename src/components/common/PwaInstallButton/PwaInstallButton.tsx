/**
 * PwaInstallButton Component
 *
 * Button component that triggers the PWA installation prompt.
 * Uses the usePwaInstall hook to determine if the app can be installed
 * and to handle the installation flow.
 */

import React from 'react';

import { DownloadOutlined } from '@ant-design/icons';
import { Button } from 'antd';

import { usePwaInstall } from '@/hooks/usePwaInstall';

/**
 * Props for the PwaInstallButton component
 */
export interface PwaInstallButtonProps {
  /**
   * Additional CSS class name
   */
  className?: string;
}

/**
 * PwaInstallButton Component
 *
 * Renders a button that allows users to install the app as a PWA.
 * The button is disabled when the app is not yet installable
 * (beforeinstallprompt event has not fired).
 */
export const PwaInstallButton: React.FC<PwaInstallButtonProps> = ({ className }) => {
  const { canInstall, promptInstall } = usePwaInstall();

  return (
    <Button
      type="default"
      icon={<DownloadOutlined />}
      onClick={() => void promptInstall()}
      disabled={!canInstall}
      className={className}
      aria-label="Install App"
    >
      Install App
    </Button>
  );
};
