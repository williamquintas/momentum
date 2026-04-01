/**
 * WhatsNewModal Component
 *
 * Modal dialog displaying details of releases with changelog content.
 * Supports navigating between multiple versions.
 */
import React, { useEffect, useMemo, useState } from 'react';

import { LeftOutlined, LinkOutlined, RightOutlined } from '@ant-design/icons';
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
  /** Array of releases to display (already filtered - no RC/pre-release) */
  releases: GitHubRelease[];
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Initial release to show when modal opens (optional) */
  initialRelease?: GitHubRelease | null;
}

/**
 * Category metadata for release types
 */
interface CategoryConfig {
  color: string;
  label: string;
  description: string;
}

const categoryConfig: Record<'major' | 'minor' | 'patch', CategoryConfig> = {
  major: {
    color: '#f5222d',
    label: 'Major Release',
    description: 'This release contains significant new features and may include breaking changes.',
  },
  minor: {
    color: '#fa8c16',
    label: 'Minor Release',
    description: 'This release introduces new features and improvements.',
  },
  patch: {
    color: '#52c41a',
    label: 'Patch Update',
    description: 'This release includes bug fixes and performance improvements.',
  },
};

const getCategoryConfig = (type: string): CategoryConfig => {
  if (type === 'major' || type === 'minor' || type === 'patch') {
    return categoryConfig[type];
  }
  return categoryConfig.patch;
};

/**
 * WhatsNewModal Component
 *
 * Displays a modal with detailed release information including changelog.
 * Shows a version list on the left side for navigation between releases.
 */
export const WhatsNewModal: React.FC<WhatsNewModalProps> = ({ releases, open, onClose, initialRelease }) => {
  // Determine initial selected index based on initialRelease prop
  const initialIndex = useMemo(() => {
    if (initialRelease) {
      const idx = releases.findIndex((r) => r.id === initialRelease.id);
      return idx >= 0 ? idx : 0;
    }
    return 0;
  }, [initialRelease, releases]);

  const [selectedIndex, setSelectedIndex] = useState(initialIndex);

  // Reset selected index when modal opens with a new initialRelease
  useEffect(() => {
    if (open) {
      if (initialRelease) {
        const idx = releases.findIndex((r) => r.id === initialRelease.id);
        setSelectedIndex(idx >= 0 ? idx : 0);
      } else {
        setSelectedIndex(0);
      }
    }
  }, [open, initialRelease, releases]);

  const currentRelease = releases[selectedIndex];

  const handlePrevious = () => {
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedIndex < releases.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handleVersionClick = (index: number) => {
    setSelectedIndex(index);
  };

  if (!open || !currentRelease) return null;

  const version = extractVersion(currentRelease.tag_name);
  const releaseType = getReleaseType(currentRelease.tag_name);
  const parsed = parseReleaseNotes(currentRelease.body || '', version);
  const config = getCategoryConfig(releaseType);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="changelog" href={getReleasesPageUrl()} target="_blank" icon={<LinkOutlined />}>
          View Full Changelog
        </Button>,
        <Button key="close" type="primary" onClick={onClose}>
          Got it!
        </Button>,
      ]}
      width={800}
      centered
      className="whats-new-modal"
    >
      <div className="whats-new-container">
        {/* Version List Sidebar */}
        <div className="whats-new-sidebar">
          <div className="whats-new-sidebar-header">
            <Text strong className="whats-new-sidebar-title">
              Versions
            </Text>
          </div>
          <div className="whats-new-version-list">
            {releases.map((release, index) => {
              const releaseVersion = extractVersion(release.tag_name);
              const releaseType = getReleaseType(release.tag_name);
              const isSelected = index === selectedIndex;

              return (
                <div
                  key={release.id}
                  className={`whats-new-version-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleVersionClick(index)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleVersionClick(index);
                    }
                  }}
                >
                  <div className="whats-new-version-info">
                    <Text strong className="whats-new-version-number">
                      v{releaseVersion}
                    </Text>
                    <Tag color={getCategoryConfig(releaseType).color} className="whats-new-version-tag">
                      {releaseType}
                    </Tag>
                  </div>
                  <Text type="secondary" className="whats-new-version-date">
                    {formatReleaseDate(release.published_at)}
                  </Text>
                </div>
              );
            })}
          </div>
        </div>

        {/* Release Details */}
        <div className="whats-new-content">
          <div className="whats-new-navigation">
            <Button
              type="text"
              icon={<LeftOutlined />}
              onClick={handlePrevious}
              disabled={selectedIndex === 0}
              className="whats-new-nav-btn"
              aria-label="Previous version"
            />
            <span className="whats-new-nav-indicator">
              {selectedIndex + 1} / {releases.length}
            </span>
            <Button
              type="text"
              icon={<RightOutlined />}
              onClick={handleNext}
              disabled={selectedIndex === releases.length - 1}
              className="whats-new-nav-btn"
              aria-label="Next version"
            />
          </div>

          <div className="whats-new-header">
            <Title level={4} className="whats-new-title">
              {"What's"} New in v{version}
            </Title>
            <div className="whats-new-meta">
              <Tag color={config.color}>{config.label}</Tag>
              <Text type="secondary">Released {formatReleaseDate(currentRelease.published_at)}</Text>
            </div>
          </div>

          <div className="whats-new-description">
            <Text>{config.description}</Text>
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

          {!parsed.categories.length && currentRelease.body && (
            <div className="whats-new-raw">
              <Paragraph>
                <pre className="release-body">{currentRelease.body}</pre>
              </Paragraph>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default WhatsNewModal;
