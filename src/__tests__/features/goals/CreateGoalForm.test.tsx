/**
 * CreateGoalForm Component Tests
 *
 * Tests for the CreateGoalForm component, covering form rendering,
 * validation, submission, and error handling.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { CreateGoalForm } from '@/features/goals/components/CreateGoalForm';
import { GoalType } from '@/features/goals/types';

describe('CreateGoalForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all basic form fields', () => {
    render(<CreateGoalForm {...defaultProps} />);

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/goal type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
  });

  it('renders all goal type options', async () => {
    render(<CreateGoalForm {...defaultProps} />);

    const typeSelect = screen.getByLabelText(/goal type/i);
    await userEvent.click(typeSelect);

    await waitFor(() => {
      expect(screen.getByText('Quantitative')).toBeInTheDocument();
      expect(screen.getByText('Qualitative')).toBeInTheDocument();
      expect(screen.getByText('Binary')).toBeInTheDocument();
      expect(screen.getByText('Milestone')).toBeInTheDocument();
      expect(screen.getByText('Recurring')).toBeInTheDocument();
      expect(screen.getByText('Habit')).toBeInTheDocument();
    });
  });

  it('shows quantitative fields when quantitative type is selected', async () => {
    render(<CreateGoalForm {...defaultProps} />);

    const typeSelect = screen.getByLabelText(/goal type/i);
    await userEvent.click(typeSelect);
    await userEvent.click(screen.getByText('Quantitative'));

    await waitFor(() => {
      expect(screen.getByLabelText(/start value/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/target value/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/current value/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/unit/i)).toBeInTheDocument();
    });
  });

  it.skip('validates required fields', async () => {
    render(<CreateGoalForm {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: /create goal/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      expect(screen.getByText(/goal type is required/i)).toBeInTheDocument();
      expect(screen.getByText(/category is required/i)).toBeInTheDocument();
    });
  });

  it.skip('submits form with valid data', async () => {
    render(<CreateGoalForm {...defaultProps} />);

    // Fill required fields
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Test Goal' } });
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'Test Category' } });

    const typeSelect = screen.getByLabelText(/goal type/i);
    await userEvent.click(typeSelect);
    await userEvent.click(screen.getByText('Quantitative'));

    // Fill quantitative fields
    await waitFor(() => {
      fireEvent.change(screen.getByLabelText(/start value/i), { target: { value: '10' } });
      fireEvent.change(screen.getByLabelText(/target value/i), { target: { value: '20' } });
      fireEvent.change(screen.getByLabelText(/current value/i), { target: { value: '10' } });
      fireEvent.change(screen.getByLabelText(/unit/i), { target: { value: 'kg' } });
    });

    const submitButton = screen.getByRole('button', { name: /create goal/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Goal',
          type: GoalType.QUANTITATIVE,
          category: 'Test Category',
          startValue: 10,
          targetValue: 20,
          currentValue: 10,
          unit: 'kg',
        })
      );
    });
  });

  it.skip('calls onCancel when cancel button is clicked', () => {
    render(<CreateGoalForm {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it.skip('shows loading state', () => {
    render(<CreateGoalForm {...defaultProps} loading={true} />);

    const submitButton = screen.getByRole('button', { name: /create goal/i });
    expect(submitButton).toHaveClass('ant-btn-loading');
  });
});
