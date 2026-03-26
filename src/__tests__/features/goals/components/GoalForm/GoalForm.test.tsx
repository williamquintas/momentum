/**
 * GoalForm Component Tests
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { GoalForm } from '@/features/goals/components/GoalForm/GoalForm';

describe('GoalForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders the form with all common fields', () => {
    render(<GoalForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/goal type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create goal/i })).toBeInTheDocument();
  });

  it('renders Quantitative goal fields when type is selected', async () => {
    const user = userEvent.setup();
    render(<GoalForm onSubmit={mockOnSubmit} />);

    const goalTypeSelect = screen.getByLabelText(/goal type/i);
    await user.click(goalTypeSelect);
    await user.click(screen.getByText('Quantitative'));

    await waitFor(() => {
      expect(screen.getByLabelText(/start value/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/target value/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/unit/i)).toBeInTheDocument();
    });
  });

  it('renders Binary goal fields when type is selected', async () => {
    const user = userEvent.setup();
    render(<GoalForm onSubmit={mockOnSubmit} />);

    const goalTypeSelect = screen.getByLabelText(/goal type/i);
    await user.click(goalTypeSelect);
    await user.click(screen.getByText('Binary'));

    await waitFor(() => {
      expect(screen.getByLabelText(/target count/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/allow partial completion/i)).toBeInTheDocument();
    });
  });

  it('renders Milestone goal fields when type is selected', async () => {
    const user = userEvent.setup();
    render(<GoalForm onSubmit={mockOnSubmit} />);

    const goalTypeSelect = screen.getByLabelText(/goal type/i);
    await user.click(goalTypeSelect);
    await user.click(screen.getByText('Milestone'));

    await waitFor(() => {
      expect(screen.getByLabelText(/milestone 1 title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/allow milestone reordering/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/require sequential completion/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add milestone/i })).toBeInTheDocument();
    });
  });
});
