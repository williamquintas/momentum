/**
 * PwaInstallButton Component Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PwaInstallButton } from '@/components/common/PwaInstallButton';
import { PwaInstallProvider } from '@/contexts/PwaInstallContext';
import { ThemeContextProvider } from '@/contexts/ThemeContext';

describe.skip('PwaInstallButton', () => {
  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeContextProvider>
      <PwaInstallProvider>{children}</PwaInstallProvider>
    </ThemeContextProvider>
  );

  it('renders button', () => {
    render(
      <TestWrapper>
        <PwaInstallButton />
      </TestWrapper>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('button is in the document', () => {
    render(
      <TestWrapper>
        <PwaInstallButton />
      </TestWrapper>
    );

    expect(screen.getByRole('button', { name: /install/i })).toBeInTheDocument();
  });
});
