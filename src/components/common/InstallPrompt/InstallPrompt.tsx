import { DownloadOutlined } from '@ant-design/icons';
import { Alert, Button, Space } from 'antd';

import { usePwaInstall } from '@/hooks/usePwaInstall';

export const InstallPrompt = () => {
  const { canInstall, dismissed, promptInstall, dismiss } = usePwaInstall();

  if (!canInstall || dismissed) {
    return null;
  }

  return (
    <Alert
      message="Install Momentum"
      description={
        <div>
          <p style={{ marginBottom: 12 }}>Add Momentum to your home screen for quick access and offline support.</p>
          <Space>
            <Button type="primary" icon={<DownloadOutlined />} onClick={() => void promptInstall()}>
              Install App
            </Button>
            <Button onClick={dismiss}>Not now</Button>
          </Space>
        </div>
      }
      type="info"
      closable={false}
      showIcon
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: '600px',
        width: 'calc(100% - 48px)',
        zIndex: 1000,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      }}
    />
  );
};
