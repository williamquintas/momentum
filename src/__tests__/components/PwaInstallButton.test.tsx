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

const mockBase = {
  dismissed: false,
  dismiss: vi.fn(),
  resetDismiss: vi.fn(),
};

describe('PwaInstallButton', () => {
  const mockPromptInstall = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders button with correct text "Install App"', () => {
    vi.mocked(usePwaInstall).mockReturnValue({ ...mockBase, canInstall: true, promptInstall: mockPromptInstall });

    render(<PwaInstallButton />);

    expect(screen.getByRole('button', { name: /install app/i })).toBeInTheDocument();
  });

  it('button is disabled when canInstall is false', () => {
    vi.mocked(usePwaInstall).mockReturnValue({ ...mockBase, canInstall: false, promptInstall: mockPromptInstall });

    render(<PwaInstallButton />);

    expect(screen.getByRole('button', { name: /install app/i })).toBeDisabled();
  });

  it('button is enabled when canInstall is true', () => {
    vi.mocked(usePwaInstall).mockReturnValue({ ...mockBase, canInstall: true, promptInstall: mockPromptInstall });

    render(<PwaInstallButton />);

    expect(screen.getByRole('button', { name: /install app/i })).toBeEnabled();
  });

  it('promptInstall is called when button is clicked', async () => {
    vi.mocked(usePwaInstall).mockReturnValue({ ...mockBase, canInstall: true, promptInstall: mockPromptInstall });

    render(<PwaInstallButton />);
    fireEvent.click(screen.getByRole('button', { name: /install app/i }));

    await new Promise((r) => setTimeout(r, 100));

    expect(mockPromptInstall).toHaveBeenCalledTimes(1);
  });
});
