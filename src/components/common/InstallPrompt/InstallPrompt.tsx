import { DownloadOutlined } from '@ant-design/icons';
import { Alert, Button, Space } from 'antd';
import { useTranslation } from 'react-i18next';

import { usePwaInstall } from '@/hooks/usePwaInstall';

export const InstallPrompt = () => {
  const { canInstall, dismissed, promptInstall, dismiss } = usePwaInstall();
  const { t } = useTranslation();

  if (!canInstall || dismissed) {
    return null;
  }

  return (
    <Alert
      message={t('pwa.install.title')}
      description={
        <div>
          <p style={{ marginBottom: 12 }}>{t('pwa.install.description')}</p>
          <Space>
            <Button type="primary" icon={<DownloadOutlined />} onClick={() => void promptInstall()}>
              {t('pwa.install.installButton')}
            </Button>
            <Button onClick={dismiss}>{t('pwa.install.dismiss')}</Button>
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
