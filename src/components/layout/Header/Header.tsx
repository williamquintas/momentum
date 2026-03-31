import { DownloadOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Layout, Space, Tooltip, Typography, theme } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { NotificationBell } from '@/components/common/NotificationBell';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { usePwaInstall } from '@/hooks/usePwaInstall';
import { APP_NAME } from '@/utils/constants';

import './Header.css';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

/**
 * Header Component
 *
 * Main application header with logo.
 * Provides horizontal navigation on desktop and mobile-friendly layout.
 *
 * Features:
 * - Logo that navigates to home
 * - Responsive design
 */
export const Header = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const { canInstall, dismissed, promptInstall } = usePwaInstall();

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <AntHeader
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        background: token.colorBgContainer,
        borderBottom: `1px solid ${token.colorBorder}`,
      }}
    >
      <div
        className="logo-wrapper"
        style={{ cursor: 'pointer' }}
        onClick={handleLogoClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleLogoClick();
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={t('header.navigateToHome')}
      >
        {/* Logo with curved square container */}
        <div
          className="logo-container"
          style={{
            borderColor: token.colorBorder,
            backgroundColor: '#fff',
          }}
        >
          <img src="/logo.png" alt={`${APP_NAME} Logo`} />
        </div>
        <Text strong className="header-title" style={{ fontSize: '18px', userSelect: 'none' }}>
          {APP_NAME}
        </Text>
      </div>

      <Space>
        <LanguageSwitcher />
        {canInstall && dismissed && (
          <Tooltip title={t('header.installApp')}>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => void promptInstall()}
              type="text"
              aria-label={t('header.installMomentumApp')}
            />
          </Tooltip>
        )}
        <Tooltip title={t('header.settings')}>
          <Button
            icon={<SettingOutlined />}
            onClick={() => navigate('/settings')}
            type="text"
            aria-label={t('header.goToSettings')}
          />
        </Tooltip>
        <NotificationBell />
        <ThemeToggle />
      </Space>
    </AntHeader>
  );
};
