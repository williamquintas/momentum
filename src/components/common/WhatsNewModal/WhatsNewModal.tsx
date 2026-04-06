/**
 * WhatsNewModal Component
 *
 * Modal dialog displaying details of a single release with changelog content.
 */
import React from 'react';

import { LinkOutlined } from '@ant-design/icons';
import { Button, Modal, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import { getReleasesPageUrl } from '@/features/releases/services/githubApi';
import type { GitHubRelease } from '@/features/releases/types';
import { extractVersion, parseReleaseNotes } from '@/features/releases/utils/parseReleaseNotes';

import './WhatsNewModal.css';

const { Title, Text, Paragraph } = Typography;

/**
 * Props for WhatsNewModal component
 */
export interface WhatsNewModalProps {
  /** The release to display */
  release: GitHubRelease | null;
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
}

/**
 * WhatsNewModal Component
 *
 * Displays a modal with detailed release information including changelog.
 */
export const WhatsNewModal: React.FC<WhatsNewModalProps> = ({ release, open, onClose }) => {
  const { t } = useTranslation();

  if (!open || !release) return null;

  const version = extractVersion(release.tag_name);
  const parsed = parseReleaseNotes(release.body || '', version);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="changelog" href={getReleasesPageUrl()} target="_blank" icon={<LinkOutlined />}>
          {t('whatsNew.viewAllReleases')}
        </Button>,
        <Button key="close" type="primary" onClick={onClose}>
          {t('whatsNew.gotIt')}
        </Button>,
      ]}
      width={700}
      centered
      className="whats-new-modal"
    >
      <div className="whats-new-content">
        <div className="whats-new-header">
          <Title level={4} className="whats-new-title">
            {t('whatsNew.titleWithVersion', { version })}
          </Title>
        </div>

        {parsed.categories.length > 0 && (
          <div className="whats-new-changelog">
            {parsed.categories.map((category) => (
              <div key={category.type} className="changelog-section">
                <ul className="changelog-changes">
                  {category.changes.map((change, index) => (
                    <li key={index}>
                      <Text>{change}</Text>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {!parsed.categories.length && release.body && (
          <div className="whats-new-raw">
            <Paragraph>
              <pre className="release-body">{release.body}</pre>
            </Paragraph>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default WhatsNewModal;
