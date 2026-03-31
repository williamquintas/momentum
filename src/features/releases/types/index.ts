/**
 * Release Notification Types
 *
 * Type definitions for the release notification system.
 */

export interface GitHubRelease {
  id: number;
  name: string;
  tag_name: string;
  body: string;
  html_url: string;
  published_at: string;
  author: {
    login: string;
    avatar_url: string;
  };
  assets: Array<{
    name: string;
    size: number;
    download_count: number;
  }>;
  prerelease: boolean;
  draft: boolean;
}

export interface ReleaseNotification {
  id: string;
  release: GitHubRelease;
  isRead: boolean;
  viewedAt: string | null;
  createdAt: string;
}

export interface ReleaseNotificationState {
  notifications: ReleaseNotification[];
  lastChecked: string | null;
  isLoading: boolean;
  error: string | null;
}

export type ReleaseType = 'major' | 'minor' | 'patch';

export interface ReleaseCategory {
  type: 'feat' | 'fix' | 'perf' | 'refactor' | 'docs' | 'style' | 'chore' | 'breaking';
  label: string;
  color: string;
}

export const RELEASE_CATEGORIES: Record<string, ReleaseCategory> = {
  feat: { type: 'feat', label: 'New Feature', color: '#52c41a' },
  fix: { type: 'fix', label: 'Bug Fix', color: '#fa541c' },
  perf: { type: 'perf', label: 'Performance', color: '#722ed1' },
  refactor: { type: 'refactor', label: 'Refactor', color: '#13c2c2' },
  docs: { type: 'docs', label: 'Documentation', color: '#eb2f96' },
  style: { type: 'style', label: 'Style', color: '#faad14' },
  chore: { type: 'chore', label: 'Maintenance', color: '#8c8c8c' },
  breaking: { type: 'breaking', label: 'Breaking Change', color: '#f5222d' },
};

export interface ReleaseParseResult {
  version: string;
  date: string;
  categories: Array<{ type: string; changes: string[] }>;
  isMajor: boolean;
}
