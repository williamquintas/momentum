/**
 * WhatsNewModal Component
 *
 * Modal dialog displaying details of a new release with changelog content.
 */
import React from 'react';

import { LinkOutlined } from '@ant-design/icons';
import { Button, Modal, Tag, Typography } from 'antd';

import { getReleasesPageUrl } from '@/features/releases/services/githubApi';
import type { GitHubRelease } from '@/features/releases/types';
import {
  formatReleaseDate,
  getReleaseType,
  parseReleaseNotes,
  extractVersion,
} from '@/features/releases/utils/parseReleaseNotes';

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
  if (!release) return null;

  const version = extractVersion(release.tag_name);
  const releaseType = getReleaseType(release.tag_name);
  const parsed = parseReleaseNotes(release.body || '', version);

  const categoryColors: Record<string, string> = {
    major: '#f5222d',
    minor: '#fa8c16',
    patch: '#52c41a',
  };

  const categoryLabels: Record<string, string> = {
    major: 'Major Release',
    minor: 'Minor Release',
    patch: 'Patch Update',
  };

  const categoryDescriptions: Record<string, string> = {
    major: 'This release contains significant new features and may include breaking changes.',
    minor: 'This release introduces new features and improvements.',
    patch: 'This release includes bug fixes and performance improvements.',
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="changelog" href={`${getReleasesPageUrl()}`} target="_blank" icon={<LinkOutlined />}>
          View Full Changelog
        </Button>,
        <Button key="close" type="primary" onClick={onClose}>
          Got it!
        </Button>,
      ]}
      width={600}
      centered
      className="whats-new-modal"
    >
      <div className="whats-new-content">
        <div className="whats-new-header">
          <Title level={4} className="whats-new-title">
            {"What's"} New in {version}
          </Title>
          <div className="whats-new-meta">
            <Tag color={categoryColors[releaseType]}>{categoryLabels[releaseType]}</Tag>
            <Text type="secondary">Released {formatReleaseDate(release.published_at)}</Text>
          </div>
        </div>

        <div className="whats-new-description">
          <Text>{categoryDescriptions[releaseType]}</Text>
        </div>

        {parsed.categories.length > 0 && (
          <div className="whats-new-changelog">
            {parsed.categories.map((category) => (
              <div key={category.type} className="changelog-section">
                <Text strong className="changelog-category">
                  {category.type === 'feat' && '✨ '}
                  {category.type === 'fix' && '🐛 '}
                  {category.type === 'perf' && '⚡ '}
                  {category.type === 'breaking' && '⚠️ '}
                  {category.type === 'refactor' && '♻️ '}
                  {category.type === 'docs' && '📝 '}
                  {category.type === 'chore' && '🔧 '}
                  {category.type.charAt(0).toUpperCase() + category.type.slice(1)}
                </Text>
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
