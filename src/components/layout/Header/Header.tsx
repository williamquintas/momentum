import { HomeOutlined, AimOutlined } from '@ant-design/icons';
import { Layout, Menu, Space, Typography } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';

import { APP_NAME } from '@/utils/constants';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

/**
 * Header Component
 *
 * Main application header with logo and navigation menu.
 * Provides horizontal navigation on desktop and mobile-friendly layout.
 *
 * Features:
 * - Logo that navigates to home
 * - Navigation menu with active route highlighting
 * - Responsive design
 */
export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active menu key based on current path
  const getActiveKey = (): string => {
    const path = location.pathname;
    if (path === '/' || path === '/goals') {
      return path === '/' ? '/' : '/goals';
    }
    if (path.startsWith('/goals/')) {
      return '/goals';
    }
    return path;
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: 'Home',
    },
    {
      key: '/goals',
      icon: <AimOutlined />,
      label: 'Goals',
    },
  ];

  return (
    <AntHeader
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <Space
        style={{ cursor: 'pointer', height: '100%' }}
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
        {/* Logo - using SVG from public folder */}
        <img
          src="/logo.svg"
          alt={`${APP_NAME} Logo`}
          style={{
            height: '32px',
            width: 'auto',
            marginRight: '12px',
          }}
        />
        <Text strong style={{ fontSize: '18px', userSelect: 'none' }}>
          {APP_NAME}
        </Text>
      </Space>

      <Menu
        mode="horizontal"
        selectedKeys={[getActiveKey()]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          borderBottom: 'none',
          minWidth: 0,
        }}
      />
    </AntHeader>
  );
};

