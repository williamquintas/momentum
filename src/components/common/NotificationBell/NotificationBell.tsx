/**
 * NotificationBell Component
 *
 * Notification bell icon with unread badge counter.
 * Displays a dropdown panel showing release notifications.
 */
import React, { useEffect, useState } from 'react';

import { BellOutlined } from '@ant-design/icons';
import { Badge, Button, Empty, List, Popover, Tag, Tooltip, Typography } from 'antd';

import { WhatsNewModal } from '@/components/common/WhatsNewModal';
import { useReleaseNotifications } from '@/features/releases/hooks/useReleaseNotifications';
import { getReleasesPageUrl } from '@/features/releases/services/githubApi';
import type { GitHubRelease, ReleaseNotification } from '@/features/releases/types';
import { formatReleaseDate, getReleaseType, isPrerelease } from '@/features/releases/utils/parseReleaseNotes';

import './NotificationBell.css';

const { Text } = Typography;

/**
 * Props for NotificationBell component
 */
export interface NotificationBellProps {
  /** Show What's New modal for major releases */
  showWhatsNew?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * NotificationBell Component
 *
 * Displays a bell icon with unread notification count.
 * Clicking opens a dropdown panel with release notifications.
 */
export const NotificationBell: React.FC<NotificationBellProps> = ({ showWhatsNew = true, className }) => {
  const [open, setOpen] = useState(false);
  const [whatsNewOpen, setWhatsNewOpen] = useState(false);
  const [selectedRelease, setSelectedRelease] = useState<GitHubRelease | null>(null);

  const { notifications, unreadCount, markAsRead, markAllAsRead, latestRelease } = useReleaseNotifications({
    autoCheck: true,
  });

  // Show What's New modal when a new major release is detected
  useEffect(() => {
    if (!showWhatsNew || !latestRelease || notifications.length === 0) return;

    // Check if there's a new unread major release
    const newestNotification = notifications[0];
    if (!newestNotification || newestNotification.isRead) return;

    const releaseType = getReleaseType(newestNotification.release.tag_name);
    if (releaseType === 'major') {
      setSelectedRelease(newestNotification.release);
      setWhatsNewOpen(true);
      markAsRead(newestNotification.id);
    }
  }, [latestRelease, notifications, showWhatsNew, markAsRead]);

  const handleNotificationClick = (notification: ReleaseNotification) => {
    markAsRead(notification.id);

    // Show What's New modal for major releases
    if (showWhatsNew) {
      const releaseType = getReleaseType(notification.release.tag_name);
      if (releaseType === 'major') {
        setSelectedRelease(notification.release);
        setWhatsNewOpen(true);
      }
    }
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  const handleWhatsNewClose = () => {
    setWhatsNewOpen(false);
    setSelectedRelease(null);
  };

  const renderNotificationContent = (): React.ReactNode => {
    if (notifications.length === 0) {
      return (
        <div className="notification-empty">
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No notifications yet" />
          <Text type="secondary" className="notification-empty-text">
            We&apos;ll notify you when new releases are available
          </Text>
        </div>
      );
    }

    return (
      <div className="notification-list-container">
        <div className="notification-header">
          <Text strong>Release Notifications</Text>
          {unreadCount > 0 && (
            <Button type="link" size="small" onClick={handleMarkAllRead} className="mark-all-read">
              Mark all read
            </Button>
          )}
        </div>
        <List
          className="notification-list"
          dataSource={notifications.filter((n) => !isPrerelease(n.release.tag_name)).slice(0, 10)}
          renderItem={(item) => {
            const releaseType = getReleaseType(item.release.tag_name);
            const categoryColors: Record<string, string> = {
              major: '#f5222d',
              minor: '#fa8c16',
              patch: '#52c41a',
            };

            return (
              <List.Item
                className={`notification-item ${item.isRead ? 'read' : 'unread'}`}
                onClick={() => handleNotificationClick(item)}
              >
                <List.Item.Meta
                  title={
                    <div className="notification-title">
                      <Text strong={!item.isRead}>{item.release.name || item.release.tag_name}</Text>
                      {!item.isRead && <span className="unread-dot" />}
                    </div>
                  }
                  description={
                    <div className="notification-description">
                      <Text type="secondary" className="notification-date">
                        {formatReleaseDate(item.release.published_at)}
                      </Text>
                      <Tag color={categoryColors[releaseType]} className="release-type-tag">
                        {releaseType}
                      </Tag>
                    </div>
                  }
                />
              </List.Item>
            );
          }}
        />
        <div className="notification-footer">
          <Button type="link" size="small" href={getReleasesPageUrl()} target="_blank">
            View all releases
          </Button>
        </div>
      </div>
    );
  };

  const popoverContent = <div className="notification-popover-content">{renderNotificationContent()}</div>;

  return (
    <>
      <Tooltip title="Release notifications">
        <Badge count={unreadCount} size="small" offset={[-2, 2]}>
          <Popover
            content={popoverContent}
            trigger="click"
            placement="bottomRight"
            open={open}
            onOpenChange={setOpen}
            overlayClassName="notification-popover"
            overlayStyle={{ maxHeight: '70vh', overflow: 'hidden' }}
          >
            <Button
              type="text"
              icon={<BellOutlined />}
              className={`notification-bell ${className || ''}`}
              aria-label={`Release notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
            />
          </Popover>
        </Badge>
      </Tooltip>
      <WhatsNewModal
        releases={notifications.filter((n) => !isPrerelease(n.release.tag_name)).map((n) => n.release)}
        open={whatsNewOpen}
        onClose={handleWhatsNewClose}
        initialRelease={selectedRelease}
      />
    </>
  );
};

export default NotificationBell;
