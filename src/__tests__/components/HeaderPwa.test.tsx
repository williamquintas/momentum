/**
 * Header PWA Install Integration Tests
 * Tests User Story 4 - Accessible Install Button
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { Header } from '@/components/layout/Header';
import { ThemeContextProvider } from '@/contexts/ThemeContext';

describe('Header PWA Install Integration', () => {
  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <ThemeContextProvider>{children}</ThemeContextProvider>
    </BrowserRouter>
  );

  it('renders install icon in header when canInstall and dismissed', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );

    expect(screen.getByRole('button', { name: 'Install App' })).toBeInTheDocument();
  });

  it('does not render install icon when canInstall is false', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );

    expect(screen.queryByRole('button', { name: /install/i })).not.toBeInTheDocument();
  });

  it('displays app logo and title', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );

    expect(screen.getByText('Momentum')).toBeInTheDocument();
    expect(screen.getByAltText(/momentum logo/i)).toBeInTheDocument();
  });
});
