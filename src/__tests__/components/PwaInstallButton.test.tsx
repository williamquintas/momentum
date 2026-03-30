/**
 * PwaInstallButton Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PwaInstallButton } from '@/components/common/PwaInstallButton';

// Mock the usePwaInstall hook
vi.mock('@/hooks/usePwaInstall', () => ({
  usePwaInstall: vi.fn(),
}));

// Import the mock function after vi.mock
import { usePwaInstall } from '@/hooks/usePwaInstall';

describe('PwaInstallButton', () => {
  const mockHandleInstall = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders button with correct text "Install App"', () => {
    // Arrange: Mock hook to return isInstallable = true
    vi.mocked(usePwaInstall).mockReturnValue({
      isInstallable: true,
      deferredPrompt: null,
      handleInstall: mockHandleInstall,
    });

    // Act
    render(<PwaInstallButton />);

    // Assert
    expect(screen.getByRole('button', { name: /install app/i })).toBeInTheDocument();
  });

  it('button is disabled when isInstallable is false', () => {
    // Arrange: Mock hook to return isInstallable = false
    vi.mocked(usePwaInstall).mockReturnValue({
      isInstallable: false,
      deferredPrompt: null,
      handleInstall: mockHandleInstall,
    });

    // Act
    render(<PwaInstallButton />);

    // Assert
    const button = screen.getByRole('button', { name: /install app/i });
    expect(button).toBeDisabled();
  });

  it('button is enabled when isInstallable is true', () => {
    // Arrange: Mock hook to return isInstallable = true
    vi.mocked(usePwaInstall).mockReturnValue({
      isInstallable: true,
      deferredPrompt: null,
      handleInstall: mockHandleInstall,
    });

    // Act
    render(<PwaInstallButton />);

    // Assert
    const button = screen.getByRole('button', { name: /install app/i });
    expect(button).toBeEnabled();
  });

  it('handleInstall is called when button is clicked (when enabled)', async () => {
    // Arrange: Mock hook to return isInstallable = true
    vi.mocked(usePwaInstall).mockReturnValue({
      isInstallable: true,
      deferredPrompt: null,
      handleInstall: mockHandleInstall,
    });

    // Act
    render(<PwaInstallButton />);
    const button = screen.getByRole('button', { name: /install app/i });
    fireEvent.click(button);

    // Wait for async handleInstall
    await new Promise((r) => setTimeout(r, 100));

    // Assert
    expect(mockHandleInstall).toHaveBeenCalledTimes(1);
  });
});
