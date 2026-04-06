/**
 * NotificationBell Component
 *
 * Notification bell icon with unread badge counter.
 * Clicking navigates to the notifications page.
 */
import React from 'react';

import { BellOutlined } from '@ant-design/icons';
import { Badge, Button, Grid, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useReleaseNotifications } from '@/features/releases/hooks/useReleaseNotifications';
import { isPrerelease } from '@/features/releases/utils/parseReleaseNotes';

import './NotificationBell.css';

/**
 * Props for NotificationBell component
 */
export interface NotificationBellProps {
  /** Custom class name */
  className?: string;
}

/**
 * NotificationBell Component
 *
 * Displays a bell icon with unread notification count.
 * Clicking navigates to the notifications page.
 */
export const NotificationBell: React.FC<NotificationBellProps> = ({ className }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = Grid.useBreakpoint().md;

  const { notifications } = useReleaseNotifications({
    autoCheck: true,
  });

  const stableNotifications = notifications.filter((n) => !isPrerelease(n.release.tag_name));
  const unreadCount = stableNotifications.filter((n) => !n.isRead).length;

  const handleClick = () => {
    navigate('/notifications');
  };

  return (
    <Tooltip title={t('notifications.tooltip')}>
      <Button
        type="text"
        icon={
          <Badge count={unreadCount} size="small">
            <BellOutlined />
          </Badge>
        }
        className={`notification-bell ${className || ''}`}
        onClick={handleClick}
        aria-label={`${t('notifications.tooltip')}${unreadCount > 0 ? `, ${t('notifications.unread', { count: unreadCount })}` : ''}`}
      >
        {isMobile ? null : t('notifications.title')}
      </Button>
    </Tooltip>
  );
};

export default NotificationBell;
