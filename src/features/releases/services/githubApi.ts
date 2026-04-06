/**
 * GitHub Releases API Service
 *
 * Service for fetching release information from GitHub API.
 */
import axios from 'axios';

import type { GitHubRelease } from '../types';

const GITHUB_API_BASE = 'https://api.github.com';
const REPO_OWNER = 'williamquintas';
const REPO_NAME = 'momentum';

/**
 * Fetches all releases from the GitHub repository
 */
export const fetchReleases = async (): Promise<GitHubRelease[]> => {
  try {
    const response = await axios.get<GitHubRelease[]>(`${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/releases`, {
      params: {
        per_page: 20,
      },
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error('Repository not found');
      }
      if (error.response?.status === 403) {
        throw new Error('API rate limit exceeded');
      }
      throw new Error(`Failed to fetch releases: ${error.message}`);
    }
    throw new Error('Failed to fetch releases');
  }
};

/**
 * Fetches the latest release from the GitHub repository
 */
export const fetchLatestRelease = async (): Promise<GitHubRelease | null> => {
  try {
    const response = await axios.get<GitHubRelease>(
      `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`,
      {
        timeout: 10000,
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        return null;
      }
      if (error.response?.status === 403) {
        throw new Error('API rate limit exceeded');
      }
      throw new Error(`Failed to fetch latest release: ${error.message}`);
    }
    throw new Error('Failed to fetch latest release');
  }
};

/**
 * Fetches a specific release by tag
 */
export const fetchReleaseByTag = async (tag: string): Promise<GitHubRelease | null> => {
  try {
    const response = await axios.get<GitHubRelease>(
      `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/releases/tags/${tag}`,
      {
        timeout: 10000,
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch release: ${error.message}`);
    }
    throw new Error('Failed to fetch release');
  }
};

/**
 * Get the repository URL for linking to releases
 */
export const getGitHubRepoUrl = (): string => {
  return `https://github.com/${REPO_OWNER}/${REPO_NAME}`;
};

/**
 * Get the releases page URL
 */
export const getReleasesPageUrl = (): string => {
  return `${getGitHubRepoUrl()}/releases`;
};
