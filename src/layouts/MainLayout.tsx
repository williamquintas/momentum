import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';

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
 * - Content area with padding
 * - Footer with links and copyright
 * - Responsive design
 */
export const MainLayout = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Content style={{ padding: '24px' }}>
        <Outlet />
      </Content>
      <Footer />
    </Layout>
  );
};
