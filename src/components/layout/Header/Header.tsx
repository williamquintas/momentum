import React, { useState } from 'react';

import { DownloadOutlined, MenuOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Dropdown, Layout, Space, Tooltip, Typography, theme, Grid } from 'antd';
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
 * - Responsive design with extensible right side
 */
export const Header = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const { canInstall, dismissed, promptInstall } = usePwaInstall();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const screens = Grid.useBreakpoint();

  const handleLogoClick = () => {
    navigate('/');
  };

  const isMobile = !screens.md;

  // Mobile menu items with labels for each header action
  const mobileMenuConfig = [
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: t('header.settings'),
      onClick: () => navigate('/settings'),
    },
    {
      key: 'notifications',
      icon: null, // NotificationBell is complex, show as-is
      label: null,
      render: () => <NotificationBell />,
    },
    canInstall &&
      dismissed && {
        key: 'install-app',
        icon: <DownloadOutlined />,
        label: t('header.installApp'),
        onClick: () => void promptInstall(),
      },
  ].filter(Boolean) as Array<{
    key: string;
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
    render?: () => React.ReactNode;
  }>;

  const mobileMenuItems = mobileMenuConfig.map((item) => ({
    key: item.key,
    label: (
      <div className="mobile-menu-item">
        {item.icon && <span className="mobile-menu-icon">{item.icon}</span>}
        {item.render ? (
          <span className="mobile-menu-component">{item.render()}</span>
        ) : (
          <span className="mobile-menu-label">{item.label}</span>
        )}
      </div>
    ),
    onClick: item.onClick,
  }));

  const headerRightItems = [
    <LanguageSwitcher key="language" />,
    canInstall && dismissed ? (
      <Tooltip key="install" title={t('header.installApp')}>
        <Button
          icon={<DownloadOutlined />}
          onClick={() => void promptInstall()}
          type="text"
          aria-label={t('header.installMomentumApp')}
        />
      </Tooltip>
    ) : null,
    <Tooltip key="settings" title={t('header.settings')}>
      <Button
        icon={<SettingOutlined />}
        onClick={() => navigate('/settings')}
        type="text"
        aria-label={t('header.goToSettings')}
      />
    </Tooltip>,
    <NotificationBell key="notifications" />,
    <ThemeToggle key="theme" />,
  ].filter(Boolean);

  return (
    <AntHeader
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '0 16px' : '0 24px',
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
        <div
          className="logo-container"
          style={{
            borderColor: token.colorBorder,
            backgroundColor: '#fff',
          }}
        >
          <img src="/logo.png" alt={`${APP_NAME} Logo`} />
        </div>
        {!isMobile && (
          <Text strong className="header-title" style={{ fontSize: '18px', userSelect: 'none' }}>
            {APP_NAME}
          </Text>
        )}
      </div>

      {isMobile ? (
        <Dropdown
          menu={{ items: mobileMenuItems }}
          trigger={['click']}
          placement="bottomRight"
          open={mobileMenuOpen}
          onOpenChange={setMobileMenuOpen}
        >
          <Button type="text" icon={<MenuOutlined />} aria-label="Open menu" className="header-mobile-menu-btn" />
        </Dropdown>
      ) : (
        <Space className="header-right" size={isMobile ? 8 : 12}>
          {headerRightItems}
        </Space>
      )}
    </AntHeader>
  );
};
