/**
 * Create Goal Integration Tests - Goal Types
 *
 * Integration tests for creating each goal type through the form.
 * These tests verify that each goal type option is available and
 * renders the expected fields.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CreateGoalForm } from '@/features/goals/components/CreateGoalForm';

const mockOnSubmit = vi.fn();

describe.skip('Create Goal Integration - Goal Types', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );

  describe('Goal Type Selection', () => {
    it('renders all 6 goal type options', async () => {
      render(
        <TestWrapper>
          <CreateGoalForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      const typeSelect = screen.getByLabelText(/goal type/i);
      fireEvent.mouseDown(typeSelect);

      await waitFor(() => {
        expect(screen.getByText('Quantitative')).toBeInTheDocument();
        expect(screen.getByText('Qualitative')).toBeInTheDocument();
        expect(screen.getByText('Binary')).toBeInTheDocument();
        expect(screen.getByText('Milestone')).toBeInTheDocument();
        expect(screen.getByText('Recurring')).toBeInTheDocument();
        expect(screen.getByText('Habit')).toBeInTheDocument();
      });
    });
  });

  describe('Binary Goal Selection', () => {
    it('renders binary goal fields when type is selected', async () => {
      render(
        <TestWrapper>
          <CreateGoalForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Test' } });
      fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'Test' } });

      const typeSelect = screen.getByLabelText(/goal type/i);
      await userEvent.click(typeSelect);
      await userEvent.click(screen.getByText('Binary'));

      await waitFor(() => {
        expect(screen.getByLabelText(/current count/i)).toBeInTheDocument();
      });
    });
  });

  describe('Milestone Goal Selection', () => {
    it('renders milestone goal fields when type is selected', async () => {
      render(
        <TestWrapper>
          <CreateGoalForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Test' } });
      fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'Test' } });

      const typeSelect = screen.getByLabelText(/goal type/i);
      await userEvent.click(typeSelect);
      await userEvent.click(screen.getByText('Milestone'));

      await waitFor(() => {
        expect(screen.getByLabelText(/milestone 1 title/i)).toBeInTheDocument();
      });
    });

    it('adds new milestone when add button is clicked', async () => {
      render(
        <TestWrapper>
          <CreateGoalForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Test' } });
      fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'Test' } });

      const typeSelect = screen.getByLabelText(/goal type/i);
      await userEvent.click(typeSelect);
      await userEvent.click(screen.getByText('Milestone'));

      await waitFor(() => {
        expect(screen.getByLabelText(/milestone 1 title/i)).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /add milestone/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/milestone 2 title/i)).toBeInTheDocument();
      });
    });
  });

  describe('Habit Goal Selection', () => {
    it('renders habit goal fields when type is selected', async () => {
      render(
        <TestWrapper>
          <CreateGoalForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Test' } });
      fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'Test' } });

      const typeSelect = screen.getByLabelText(/goal type/i);
      await userEvent.click(typeSelect);
      await userEvent.click(screen.getByText('Habit'));

      await waitFor(() => {
        expect(screen.getByLabelText(/target frequency/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('shows validation error for missing title', async () => {
      render(
        <TestWrapper>
          <CreateGoalForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'Test' } });

      const typeSelect = screen.getByLabelText(/goal type/i);
      await userEvent.click(typeSelect);
      await userEvent.click(screen.getByText('Quantitative'));

      await waitFor(() => {
        fireEvent.change(screen.getByLabelText(/start value/i), { target: { value: '10' } });
        fireEvent.change(screen.getByLabelText(/target value/i), { target: { value: '20' } });
        fireEvent.change(screen.getByLabelText(/current value/i), { target: { value: '10' } });
        fireEvent.change(screen.getByLabelText(/unit/i), { target: { value: 'kg' } });
      });

      const submitButton = screen.getByRole('button', { name: /create goal/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('handles creation failure gracefully', async () => {
      const failingOnSubmit = vi.fn().mockRejectedValueOnce(new Error('Storage unavailable'));

      render(
        <TestWrapper>
          <CreateGoalForm onSubmit={failingOnSubmit} />
        </TestWrapper>
      );

      fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Test' } });
      fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'Test' } });

      const typeSelect = screen.getByLabelText(/goal type/i);
      await userEvent.click(typeSelect);
      await userEvent.click(screen.getByText('Quantitative'));

      await waitFor(() => {
        fireEvent.change(screen.getByLabelText(/start value/i), { target: { value: '10' } });
        fireEvent.change(screen.getByLabelText(/target value/i), { target: { value: '20' } });
        fireEvent.change(screen.getByLabelText(/current value/i), { target: { value: '10' } });
        fireEvent.change(screen.getByLabelText(/unit/i), { target: { value: 'kg' } });
      });

      const submitButton = screen.getByRole('button', { name: /create goal/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(failingOnSubmit).toHaveBeenCalled();
      });
    });
  });
});
