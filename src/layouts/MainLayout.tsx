import { Layout, Tabs, Grid } from 'antd';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { OfflineIndicator } from '@/components/common/OfflineIndicator';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';

const { Content } = Layout;

/**
 * MainLayout Component
 *
 * Main application layout wrapper that provides consistent structure
 * across all pages. Includes header, content area, and footer.
 *
 * Features:
 * - Header with logo and navigation
 * - Bottom tab bar for mobile (lg+ breakpoints)
 * - Max-width container for desktop
 * - Reduced footer prominence on desktop
 * - Responsive design
 */
export const MainLayout = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const screens = Grid.useBreakpoint();
  const isDesktop = screens.lg;
  const isMobile = !screens.lg;

  const hideBottomTabs = location.pathname.startsWith('/goals/') && location.pathname !== '/goals';

  const bottomTabsItems = [
    {
      key: '/goals',
      label: t('nav.goals'),
    },
    {
      key: '/notifications',
      label: t('nav.notifications'),
    },
    {
      key: '/settings',
      label: t('nav.settings'),
    },
  ];

  const handleTabChange = (key: string) => {
    navigate(key);
  };

  return (
    <Layout style={{ minHeight: '100vh', paddingBottom: isMobile && !hideBottomTabs ? 60 : 0 }}>
      <OfflineIndicator />
      <Header />
      <Content
        style={{
          padding: '24px',
          maxWidth: isDesktop ? 1200 : undefined,
          margin: isDesktop ? '0 auto' : undefined,
          width: '100%',
        }}
      >
        <Breadcrumbs />
        <Outlet />
      </Content>
      {isMobile && !hideBottomTabs && (
        <div className="mobile-bottom-tabs">
          <Tabs
            centered
            activeKey={location.pathname.startsWith('/goals') ? '/goals' : location.pathname}
            items={bottomTabsItems}
            onChange={handleTabChange}
            style={{ maxWidth: 600, margin: '0 auto' }}
          />
        </div>
      )}
      <Footer />
    </Layout>
  );
};
