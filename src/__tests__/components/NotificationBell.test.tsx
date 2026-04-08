/**
 * NotificationBell Component Tests
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the hook before importing the component
vi.mock('@/features/releases/hooks/useReleaseNotifications', () => ({
  useReleaseNotifications: vi.fn(),
}));

vi.mock('@/components/common/WhatsNewModal', () => ({
  WhatsNewModal: vi.fn(() => null),
}));

vi.mock('@/features/releases/utils/parseReleaseNotes', () => ({
  formatReleaseDate: vi.fn(() => 'Jan 1, 2026'),
  getReleaseType: vi.fn((version: string) => {
    if (version.startsWith('v2')) return 'major';
    if (version.startsWith('v1.1')) return 'minor';
    return 'patch';
  }),
  isPrerelease: vi.fn((version: string) => version.includes('-rc.') || version.includes('rc-')),
}));

vi.mock('@/features/releases/services/githubApi', () => ({
  getReleasesPageUrl: vi.fn(() => 'https://github.com/test/releases'),
}));

// Now import the component
import { NotificationBell } from '@/components/common/NotificationBell';
import { useReleaseNotifications } from '@/features/releases/hooks/useReleaseNotifications';

const mockUseReleaseNotifications = vi.mocked(useReleaseNotifications);

const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  const QueryProvider = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  QueryProvider.displayName = 'QueryProvider';

  return QueryProvider;
};

describe.skip('NotificationBell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockNotifications = [
    {
      id: 'release-1',
      release: {
        id: 1,
        name: 'v2.0.0',
        tag_name: 'v2.0.0',
        body: 'Major release',
        html_url: 'https://example.com/release/1',
        published_at: '2026-01-01T00:00:00Z',
        author: { login: 'testuser', avatar_url: '' },
        assets: [],
        prerelease: false,
        draft: false,
      },
      isRead: false,
      viewedAt: null,
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'release-2',
      release: {
        id: 2,
        name: 'v1.0.0',
        tag_name: 'v1.0.0',
        body: 'Minor release',
        html_url: 'https://example.com/release/2',
        published_at: '2025-12-01T00:00:00Z',
        author: { login: 'testuser', avatar_url: '' },
        assets: [],
        prerelease: false,
        draft: false,
      },
      isRead: true,
      viewedAt: '2025-12-01T00:00:00Z',
      createdAt: '2025-12-01T00:00:00Z',
    },
  ];

  it('should render notification bell button', () => {
    mockUseReleaseNotifications.mockReturnValue({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      isError: false,
      error: null,
      lastChecked: null,
      refetch: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      dismissNotification: vi.fn(),
      latestRelease: undefined,
    });

    const TestWrapper = createTestWrapper();
    render(
      <TestWrapper>
        <NotificationBell />
      </TestWrapper>
    );

    expect(screen.getByRole('button', { name: /release notifications/i })).toBeInTheDocument();
  });

  it('should display unread badge when there are unread notifications', () => {
    mockUseReleaseNotifications.mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 1,
      isLoading: false,
      isError: false,
      error: null,
      lastChecked: null,
      refetch: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      dismissNotification: vi.fn(),
      latestRelease: mockNotifications[0]!.release,
    });

    const TestWrapper = createTestWrapper();
    render(
      <TestWrapper>
        <NotificationBell />
      </TestWrapper>
    );

    expect(screen.getByRole('button', { name: /release notifications, 1 unread/i })).toBeInTheDocument();
  });

  it('should show empty state when no notifications', async () => {
    mockUseReleaseNotifications.mockReturnValue({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      isError: false,
      error: null,
      lastChecked: null,
      refetch: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      dismissNotification: vi.fn(),
      latestRelease: undefined,
    });

    const TestWrapper = createTestWrapper();
    render(
      <TestWrapper>
        <NotificationBell />
      </TestWrapper>
    );

    // Click the bell to open popover
    const bellButton = screen.getByRole('button', { name: /release notifications/i });
    fireEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('No notifications yet')).toBeInTheDocument();
    });
  });

  it('should display notifications in popover when clicked', async () => {
    const markAsReadFn = vi.fn();
    const markAllAsReadFn = vi.fn();

    mockUseReleaseNotifications.mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 1,
      isLoading: false,
      isError: false,
      error: null,
      lastChecked: null,
      refetch: vi.fn(),
      markAsRead: markAsReadFn,
      markAllAsRead: markAllAsReadFn,
      dismissNotification: vi.fn(),
      latestRelease: mockNotifications[0]!.release,
    });

    const TestWrapper = createTestWrapper();
    render(
      <TestWrapper>
        <NotificationBell showWhatsNew={false} />
      </TestWrapper>
    );

    // Click the bell to open popover
    const bellButton = screen.getByRole('button', { name: /release notifications, 1 unread/i });
    fireEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('Release Notifications')).toBeInTheDocument();
      expect(screen.getByText('v2.0.0')).toBeInTheDocument();
      expect(screen.getByText('v1.0.0')).toBeInTheDocument();
    });
  });

  it('should call markAsRead when notification is clicked', async () => {
    const markAsReadFn = vi.fn();

    mockUseReleaseNotifications.mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 1,
      isLoading: false,
      isError: false,
      error: null,
      lastChecked: null,
      refetch: vi.fn(),
      markAsRead: markAsReadFn,
      markAllAsRead: vi.fn(),
      dismissNotification: vi.fn(),
      latestRelease: mockNotifications[0]!.release,
    });

    const TestWrapper = createTestWrapper();
    render(
      <TestWrapper>
        <NotificationBell showWhatsNew={false} />
      </TestWrapper>
    );

    // Click the bell to open popover
    const bellButton = screen.getByRole('button', { name: /release notifications, 1 unread/i });
    fireEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('v2.0.0')).toBeInTheDocument();
    });

    // Click on the first notification
    const firstNotification = screen.getByText('v2.0.0').closest('.ant-list-item');
    if (firstNotification) {
      fireEvent.click(firstNotification);
    }

    expect(markAsReadFn).toHaveBeenCalledWith('release-1');
  });

  it('should call markAllAsRead when "Mark all read" is clicked', async () => {
    const markAllAsReadFn = vi.fn();

    mockUseReleaseNotifications.mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 1,
      isLoading: false,
      isError: false,
      error: null,
      lastChecked: null,
      refetch: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: markAllAsReadFn,
      dismissNotification: vi.fn(),
      latestRelease: mockNotifications[0]!.release,
    });

    const TestWrapper = createTestWrapper();
    render(
      <TestWrapper>
        <NotificationBell showWhatsNew={false} />
      </TestWrapper>
    );

    // Click the bell to open popover
    const bellButton = screen.getByRole('button', { name: /release notifications, 1 unread/i });
    fireEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('Mark all read')).toBeInTheDocument();
    });

    // Click "Mark all read"
    const markAllReadButton = screen.getByText('Mark all read');
    fireEvent.click(markAllReadButton);

    expect(markAllAsReadFn).toHaveBeenCalled();
  });

  it('should render with custom className', () => {
    mockUseReleaseNotifications.mockReturnValue({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      isError: false,
      error: null,
      lastChecked: null,
      refetch: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      dismissNotification: vi.fn(),
      latestRelease: undefined,
    });

    const TestWrapper = createTestWrapper();
    render(
      <TestWrapper>
        <NotificationBell className="custom-class" />
      </TestWrapper>
    );

    const bellButton = screen.getByRole('button', { name: /release notifications/i });
    expect(bellButton.className).toContain('custom-class');
  });
});
