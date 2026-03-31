/**
 * Header PWA Install Integration Tests
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

const mockBase = {
  dismissed: false,
  promptInstall: vi.fn().mockResolvedValue(undefined),
  dismiss: vi.fn(),
  resetDismiss: vi.fn(),
};

describe('Header PWA Install Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders install icon in header when canInstall and dismissed', () => {
    vi.mocked(usePwaInstall).mockReturnValue({ ...mockBase, canInstall: true, dismissed: true });

    render(<Header />);

    expect(screen.getByRole('button', { name: /install momentum app/i })).toBeInTheDocument();
  });

  it('does not render install icon when canInstall is false', () => {
    vi.mocked(usePwaInstall).mockReturnValue({ ...mockBase, canInstall: false, dismissed: true });

    render(<Header />);

    expect(screen.queryByRole('button', { name: /install momentum app/i })).not.toBeInTheDocument();
  });

  it('does not render install icon when banner is showing (dismissed = false)', () => {
    vi.mocked(usePwaInstall).mockReturnValue({ ...mockBase, canInstall: true, dismissed: false });

    render(<Header />);

    expect(screen.queryByRole('button', { name: /install momentum app/i })).not.toBeInTheDocument();
  });

  it('renders ThemeToggle alongside install icon', () => {
    vi.mocked(usePwaInstall).mockReturnValue({ ...mockBase, canInstall: true, dismissed: true });

    render(<Header />);

    expect(screen.getByRole('button', { name: /install momentum app/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /switch theme/i })).toBeInTheDocument();
  });

  it('displays app logo and title', () => {
    vi.mocked(usePwaInstall).mockReturnValue({ ...mockBase, canInstall: false, dismissed: false });

    render(<Header />);

    expect(screen.getByText('Momentum')).toBeInTheDocument();
    expect(screen.getByAltText(/momentum logo/i)).toBeInTheDocument();
  });
});
