/**
 * OfflineIndicator Component Tests
 *
 * Tests for the OfflineIndicator component that shows a warning banner when offline
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

// Mock the useNetworkStatus hook
vi.mock('@/hooks/useNetworkStatus', () => ({
  useNetworkStatus: vi.fn(),
}));

import { OfflineIndicator } from '@/components/common/OfflineIndicator/OfflineIndicator';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

// Type assertion for the mock
const mockUseNetworkStatus = useNetworkStatus as ReturnType<typeof vi.fn>;

describe('OfflineIndicator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('when online', () => {
    it('does not render when user is online', () => {
      mockUseNetworkStatus.mockReturnValue({
        isOnline: true,
        isOffline: false,
      });

      const { container } = render(<OfflineIndicator />);

      // The component should not render any alert when online
      expect(container.firstChild).toBeNull();
    });
  });

  describe('when offline', () => {
    beforeEach(() => {
      mockUseNetworkStatus.mockReturnValue({
        isOnline: false,
        isOffline: true,
      });
    });

    it('renders warning alert when user is offline', () => {
      const { container } = render(<OfflineIndicator />);

      // Should render an Alert component
      const alert = container.querySelector('.ant-alert');
      expect(alert).toBeInTheDocument();
    });

    it('displays correct offline message', () => {
      render(<OfflineIndicator />);

      const message = screen.getByText('You are currently offline. Some features may be unavailable.');
      expect(message).toBeInTheDocument();
    });

    it('shows warning type alert', () => {
      const { container } = render(<OfflineIndicator />);

      const alert = container.querySelector('.ant-alert');
      expect(alert).toHaveClass('ant-alert-warning');
    });
  });

  describe('dismiss functionality', () => {
    it('renders with dismiss button by default', () => {
      mockUseNetworkStatus.mockReturnValue({
        isOnline: false,
        isOffline: true,
      });

      const { container } = render(<OfflineIndicator />);

      // Should have a close button
      const closeButton = container.querySelector('.ant-alert-close-icon');
      expect(closeButton).toBeInTheDocument();
    });

    it('hides alert after dismiss button is clicked', () => {
      mockUseNetworkStatus.mockReturnValue({
        isOnline: false,
        isOffline: true,
      });

      const { container } = render(<OfflineIndicator />);

      // Find and click the close button
      const closeButton = container.querySelector('.ant-alert-close-icon');
      if (closeButton) {
        fireEvent.click(closeButton);
      }

      // After dismiss, component should not render
      const alert = container.querySelector('.ant-alert');
      expect(alert).not.toBeInTheDocument();
    });

    it('respects dismissible prop when set to false', () => {
      mockUseNetworkStatus.mockReturnValue({
        isOnline: false,
        isOffline: true,
      });

      const { container } = render(<OfflineIndicator dismissible={false} />);

      // Should not have a close button
      const closeButton = container.querySelector('.ant-alert-close');
      expect(closeButton).not.toBeInTheDocument();
    });
  });

  describe('useNetworkStatus integration', () => {
    it('uses the useNetworkStatus hook', () => {
      mockUseNetworkStatus.mockReturnValue({
        isOnline: true,
        isOffline: false,
      });

      render(<OfflineIndicator />);

      expect(mockUseNetworkStatus).toHaveBeenCalled();
    });
  });
});
