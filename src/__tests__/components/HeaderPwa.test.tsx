/**
 * Header with PwaInstallButton Integration Tests
 * Tests User Story 4 - Accessible Install Button
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Header } from '@/components/layout/Header';

// Mock the usePwaInstall hook
vi.mock('@/hooks/usePwaInstall', () => ({
  usePwaInstall: vi.fn(),
}));

// Import the mock function after vi.mock
import { usePwaInstall } from '@/hooks/usePwaInstall';

describe('Header with PwaInstallButton Integration', () => {
  const mockHandleInstall = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders PwaInstallButton in header when installable', () => {
    // Arrange: Mock hook to return isInstallable = true
    vi.mocked(usePwaInstall).mockReturnValue({
      isInstallable: true,
      deferredPrompt: null,
      handleInstall: mockHandleInstall,
    });

    // Act
    render(<Header />);

    // Assert - button should be rendered
    const installButton = screen.getByRole('button', { name: /install app/i });
    expect(installButton).toBeInTheDocument();
  });

  it('renders disabled PwaInstallButton when not installable', () => {
    // Arrange: Mock hook to return isInstallable = false
    vi.mocked(usePwaInstall).mockReturnValue({
      isInstallable: false,
      deferredPrompt: null,
      handleInstall: mockHandleInstall,
    });

    // Act
    render(<Header />);

    // Assert - button should be disabled
    const installButton = screen.getByRole('button', { name: /install app/i });
    expect(installButton).toBeDisabled();
  });

  it('renders ThemeToggle alongside PwaInstallButton', () => {
    // Arrange: Mock hook to return isInstallable = true
    vi.mocked(usePwaInstall).mockReturnValue({
      isInstallable: true,
      deferredPrompt: null,
      handleInstall: mockHandleInstall,
    });

    // Act
    render(<Header />);

    // Assert - both buttons should be present
    expect(screen.getByRole('button', { name: /install app/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /switch theme/i })).toBeInTheDocument();
  });

  it('displays app logo and title', () => {
    // Arrange
    vi.mocked(usePwaInstall).mockReturnValue({
      isInstallable: true,
      deferredPrompt: null,
      handleInstall: mockHandleInstall,
    });

    // Act
    render(<Header />);

    // Assert
    expect(screen.getByText('Momentum')).toBeInTheDocument();
    expect(screen.getByAltText(/momentum logo/i)).toBeInTheDocument();
  });
});
