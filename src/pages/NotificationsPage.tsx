/**
 * NotificationsPage Component
 *
 * Page displaying all release notifications with read/unread status.
 * Users can view, mark as read, and access full release details.
 */

import { useState } from 'react';

import { Button, Card, Empty, List, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import { WhatsNewModal } from '@/components/common/WhatsNewModal';
import { useReleaseNotifications } from '@/features/releases/hooks/useReleaseNotifications';
import type { GitHubRelease } from '@/features/releases/types';
import { formatReleaseDate, isPrerelease } from '@/features/releases/utils/parseReleaseNotes';

const { Title, Text, Paragraph } = Typography;

/**
 * NotificationsPage Component
 *
 * Displays a list of all release notifications with filtering and actions.
 */
export const NotificationsPage = (): React.ReactElement => {
  const { t } = useTranslation();
  const { notifications, markAsRead, markAllAsRead } = useReleaseNotifications({ autoCheck: true });
  const [selectedRelease, setSelectedRelease] = useState<GitHubRelease | null>(null);
  const [whatsNewOpen, setWhatsNewOpen] = useState(false);

  const stableNotifications = notifications
    .filter((n) => !isPrerelease(n.release.tag_name))
    .sort((a, b) => {
      const tagA = a.release.tag_name;
      const tagB = b.release.tag_name;
      const partsA = tagA
        .replace(/[^\d.]/g, '')
        .split('.')
        .map(Number);
      const partsB = tagB
        .replace(/[^\d.]/g, '')
        .split('.')
        .map(Number);
      const maxLen = Math.max(partsA.length, partsB.length);
      for (let i = 0; i < maxLen; i++) {
        const numA = partsA[i] ?? 0;
        const numB = partsB[i] ?? 0;
        if (numA !== numB) {
          return numB - numA;
        }
      }
      return 0;
    });
  const unreadCount = stableNotifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = (notification: (typeof notifications)[number]) => {
    markAsRead(notification.id);
    setSelectedRelease(notification.release);
    setWhatsNewOpen(true);
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  const handleWhatsNewClose = () => {
    setWhatsNewOpen(false);
    setSelectedRelease(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>{t('notifications.title')}</Title>
        {unreadCount > 0 && (
          <Button type="primary" onClick={handleMarkAllRead}>
            {t('notifications.markAllRead')}
          </Button>
        )}
      </div>

      {stableNotifications.length === 0 ? (
        <Empty description={t('notifications.empty')}>
          <Text type="secondary">{t('notifications.emptyDescription')}</Text>
        </Empty>
      ) : (
        <List
          dataSource={stableNotifications}
          renderItem={(item) => {
            return (
              <List.Item
                className={`notification-list-item ${item.isRead ? 'read' : 'unread'}`}
                onClick={() => handleNotificationClick(item)}
                style={{ cursor: 'pointer', padding: 0, borderBlockEnd: 0, marginBottom: 4 }}
              >
                <Card
                  size="small"
                  style={{
                    width: '100%',
                    backgroundColor: item.isRead ? 'rgba(24, 144, 255, 0.01)' : 'rgba(24, 144, 255, 0.04)',
                    borderColor: item.isRead ? 'rgba(24, 144, 255, 0.1)' : 'rgba(24, 144, 255, 0.3)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        {!item.isRead && (
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: '#1890ff',
                            }}
                          />
                        )}
                        <Text strong={!item.isRead} style={{ fontSize: 16 }}>
                          {item.release.name || item.release.tag_name}
                        </Text>
                      </div>
                      <Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ marginBottom: 4, fontSize: 13 }}>
                        {item.release.body?.replace(/[#*`_]/g, '') || 'No description'}
                      </Paragraph>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {formatReleaseDate(item.release.published_at)}
                      </Text>
                    </div>
                  </div>
                </Card>
              </List.Item>
            );
          }}
        />
      )}

      <WhatsNewModal release={selectedRelease} open={whatsNewOpen} onClose={handleWhatsNewClose} />
    </div>
  );
};

export default NotificationsPage;
