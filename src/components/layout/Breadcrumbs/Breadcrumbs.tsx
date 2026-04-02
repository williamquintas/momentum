/**
 * Breadcrumbs Component
 *
 * Navigation breadcrumb component that displays the current page hierarchy.
 * Automatically generates breadcrumbs based on the current route.
 *
 * Features:
 * - Automatic breadcrumb generation from route
 * - Custom breadcrumb items for specific routes
 * - Clickable navigation to parent routes
 * - Responsive design
 * - Accessibility support
 */

import { HomeOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Breadcrumb } from 'antd';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { goalService } from '@/services/api/goalService';
import { queryKeys } from '@/utils/queryKeys';

/**
 * Breadcrumb item type
 */
interface BreadcrumbItem {
  title: string;
  path?: string;
}

/**
 * Get breadcrumb items for current route
 */
const getBreadcrumbItems = (pathname: string, t: (key: string) => string): BreadcrumbItem[] => {
  // Home page
  if (pathname === '/') {
    return [{ title: t('breadcrumbs.home') }];
  }

  // Goals list page
  if (pathname === '/goals') {
    return [{ title: t('breadcrumbs.home'), path: '/' }, { title: t('breadcrumbs.goals') }];
  }

  // Goal detail page (pattern: /goals/:id)
  if (pathname.startsWith('/goals/')) {
    return [
      { title: t('breadcrumbs.home'), path: '/' },
      { title: t('breadcrumbs.goals'), path: '/goals' },
      { title: t('breadcrumbs.goalDetails') },
    ];
  }

  // Default breadcrumb
  return [{ title: t('breadcrumbs.home'), path: '/' }];
};

/**
 * Breadcrumbs Component
 */
export const Breadcrumbs = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams<Record<string, string>>();

  // Get breadcrumb items for current route
  const baseBreadcrumbItems = getBreadcrumbItems(location.pathname, t);

  // For dynamic routes with IDs, fetch the goal title
  const goalId = params?.id;
  const { data: goal } = useQuery({
    queryKey: queryKeys.goals.detail(goalId || ''),
    queryFn: async () => {
      if (!goalId) return null;
      return await goalService.getById(goalId);
    },
    enabled: !!goalId && location.pathname.startsWith('/goals/'),
  });

  // Update breadcrumb items if we have goal data
  const finalBreadcrumbItems = baseBreadcrumbItems.map((item, index) => {
    // Replace "Goal Details" with actual goal title if available
    if (index === baseBreadcrumbItems.length - 1 && goal && item.title === t('breadcrumbs.goalDetails')) {
      return { ...item, title: goal.title };
    }
    return item;
  });

  // Handle breadcrumb click
  const handleBreadcrumbClick = (path?: string) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <Breadcrumb
      style={{ marginBottom: 16 }}
      items={finalBreadcrumbItems.map((item, index) => ({
        title:
          index === 0 ? (
            <span>
              <HomeOutlined style={{ marginRight: 4 }} />
              {item.title}
            </span>
          ) : (
            item.title
          ),
        onClick: item.path ? () => handleBreadcrumbClick(item.path) : undefined,
        className: item.path ? 'breadcrumb-link' : undefined,
        style: item.path ? { cursor: 'pointer' } : undefined,
      }))}
    />
  );
};
