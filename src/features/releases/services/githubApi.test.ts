/**
 * GitHub API Service Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  fetchReleases,
  fetchLatestRelease,
  fetchReleaseByTag,
  getGitHubRepoUrl,
  getReleasesPageUrl,
} from '../services/githubApi';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    isAxiosError: vi.fn((error) => error instanceof Error && 'response' in error),
  },
  isAxiosError: vi.fn((error) => error instanceof Error && 'response' in error),
}));

describe('githubApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchReleases', () => {
    it('should fetch releases successfully', async () => {
      const mockReleases = [
        {
          id: 1,
          name: 'v1.0.0',
          tag_name: 'v1.0.0',
          body: 'Test release',
          html_url: 'https://github.com/test/release/1',
          published_at: '2026-01-01T00:00:00Z',
          author: { login: 'testuser', avatar_url: 'https://example.com/avatar.png' },
          assets: [],
          prerelease: false,
          draft: false,
        },
      ];

      (axios.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: mockReleases });

      const releases = await fetchReleases();

      expect(releases).toEqual(mockReleases);
    });

    it('should throw error when repository not found', async () => {
      const error = new Error('Not Found');
      (error as typeof error & { response: { status: number } }).response = { status: 404 };
      (axios.get as ReturnType<typeof vi.fn>).mockRejectedValueOnce(error);
      (axios.isAxiosError as ReturnType<typeof vi.fn>).mockReturnValueOnce(true);

      await expect(fetchReleases()).rejects.toThrow('Repository not found');
    });

    it('should throw error when rate limit exceeded', async () => {
      const error = new Error('Rate limit exceeded');
      (error as typeof error & { response: { status: number } }).response = { status: 403 };
      (axios.get as ReturnType<typeof vi.fn>).mockRejectedValueOnce(error);
      (axios.isAxiosError as ReturnType<typeof vi.fn>).mockReturnValueOnce(true);

      await expect(fetchReleases()).rejects.toThrow('API rate limit exceeded');
    });
  });

  describe('fetchLatestRelease', () => {
    it('should fetch latest release successfully', async () => {
      const mockRelease = {
        id: 1,
        name: 'v1.0.0',
        tag_name: 'v1.0.0',
        body: 'Test release',
        html_url: 'https://github.com/test/release/1',
        published_at: '2026-01-01T00:00:00Z',
        author: { login: 'testuser', avatar_url: 'https://example.com/avatar.png' },
        assets: [],
        prerelease: false,
        draft: false,
      };

      (axios.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: mockRelease });

      const release = await fetchLatestRelease();

      expect(release).toEqual(mockRelease);
    });

    it('should return null when no releases found', async () => {
      const error = new Error('Not Found');
      (error as typeof error & { response: { status: number } }).response = { status: 404 };
      (axios.get as ReturnType<typeof vi.fn>).mockRejectedValueOnce(error);
      (axios.isAxiosError as ReturnType<typeof vi.fn>).mockReturnValueOnce(true);

      const release = await fetchLatestRelease();

      expect(release).toBeNull();
    });
  });

  describe('fetchReleaseByTag', () => {
    it('should fetch release by tag successfully', async () => {
      const mockRelease = {
        id: 1,
        name: 'v1.0.0',
        tag_name: 'v1.0.0',
        body: 'Test release',
        html_url: 'https://github.com/test/release/1',
        published_at: '2026-01-01T00:00:00Z',
        author: { login: 'testuser', avatar_url: 'https://example.com/avatar.png' },
        assets: [],
        prerelease: false,
        draft: false,
      };

      (axios.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: mockRelease });

      const release = await fetchReleaseByTag('v1.0.0');

      expect(release).toEqual(mockRelease);
    });

    it('should return null when release not found', async () => {
      const error = new Error('Not Found');
      (error as typeof error & { response: { status: number } }).response = { status: 404 };
      (axios.get as ReturnType<typeof vi.fn>).mockRejectedValueOnce(error);
      (axios.isAxiosError as ReturnType<typeof vi.fn>).mockReturnValueOnce(true);

      const release = await fetchReleaseByTag('v0.0.0');

      expect(release).toBeNull();
    });
  });

  describe('getGitHubRepoUrl', () => {
    it('should return correct repository URL', () => {
      expect(getGitHubRepoUrl()).toBe('https://github.com/williamquintas/momentum');
    });
  });

  describe('getReleasesPageUrl', () => {
    it('should return correct releases page URL', () => {
      expect(getReleasesPageUrl()).toBe('https://github.com/williamquintas/momentum/releases');
    });
  });
});
