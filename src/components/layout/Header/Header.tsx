import { Layout, Space, Typography, theme } from 'antd';
import { useNavigate } from 'react-router-dom';

import { ThemeToggle } from '@/components/common/ThemeToggle';
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
  const { token } = theme.useToken();
  const navigate = useNavigate();

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
        aria-label="Navigate to home"
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
        <ThemeToggle />
      </Space>
    </AntHeader>
  );
};
