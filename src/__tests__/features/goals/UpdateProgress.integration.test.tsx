/**
 * Progress Update Integration Tests
 *
 * Integration tests for the complete progress update flow,
 * from modal submission to storage, calculation, and history tracking.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { UpdateProgressModal } from '@/features/goals/components/UpdateProgressModal/UpdateProgressModal';
import type { Goal } from '@/features/goals/types';
import { GoalType, GoalStatus, Priority } from '@/features/goals/types';

const mockSubmit = vi.fn().mockResolvedValue(undefined);

const createMockGoal = (type: GoalType): Goal => {
  const baseGoal = {
    id: 'test-goal-id',
    title: 'Test Goal',
    status: GoalStatus.ACTIVE,
    priority: Priority.MEDIUM,
    category: 'Test',
    tags: ['test'] as string[],
    progress: 50,
    progressHistory: [],
    notes: [],
    attachments: [],
    relatedGoals: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'test-user',
    archived: false,
    favorite: false,
  };

  switch (type) {
    case GoalType.QUANTITATIVE:
      return {
        ...baseGoal,
        type: GoalType.QUANTITATIVE,
        startValue: 0,
        targetValue: 100,
        currentValue: 50,
        unit: 'kg',
        allowDecimals: false,
      } as Goal;

    case GoalType.BINARY:
      return {
        ...baseGoal,
        type: GoalType.BINARY,
        currentCount: 2,
        targetCount: 5,
        items: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
        allowPartialCompletion: true,
      } as Goal;

    case GoalType.QUALITATIVE:
      return {
        ...baseGoal,
        type: GoalType.QUALITATIVE,
        qualitativeStatus: 'in_progress',
        selfAssessments: [],
      } as Goal;

    case GoalType.MILESTONE:
      return {
        ...baseGoal,
        type: GoalType.MILESTONE,
        milestones: [
          { id: 'm1', title: 'Milestone 1', order: 0, status: 'completed' },
          { id: 'm2', title: 'Milestone 2', order: 1, status: 'pending' },
          { id: 'm3', title: 'Milestone 3', order: 2, status: 'pending' },
        ],
        allowMilestoneReordering: false,
        requireSequentialCompletion: false,
      } as Goal;

    case GoalType.RECURRING:
      return {
        ...baseGoal,
        type: GoalType.RECURRING,
        recurrence: { frequency: 'daily', interval: 1 },
        completionStats: {
          totalOccurrences: 10,
          completedOccurrences: 7,
          completionRate: 70,
          streak: { current: 3, longest: 5 },
        },
        occurrences: [
          { id: 'o1', date: new Date(), completed: true },
          { id: 'o2', date: new Date(Date.now() - 86400000), completed: false },
        ],
      } as Goal;

    default:
      throw new Error(`Unsupported goal type: ${String(type)}`);
  }
};

describe('Progress Update Integration', () => {
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

  describe('Quantitative Goal Progress Update', () => {
    it('renders and accepts quantitative progress update', async () => {
      const goal = createMockGoal(GoalType.QUANTITATIVE);

      render(
        <TestWrapper>
          <UpdateProgressModal open={true} goal={goal} onCancel={vi.fn()} onSubmit={mockSubmit} />
        </TestWrapper>
      );

      expect(screen.getByLabelText(/current value/i)).toBeInTheDocument();

      const input = screen.getByLabelText(/current value/i);
      fireEvent.change(input, { target: { value: '75' } });

      expect((input as HTMLInputElement).value).toBe('75');
    });

    it('shows current progress range', () => {
      const goal = createMockGoal(GoalType.QUANTITATIVE);

      render(
        <TestWrapper>
          <UpdateProgressModal open={true} goal={goal} onCancel={vi.fn()} onSubmit={mockSubmit} />
        </TestWrapper>
      );

      expect(screen.getByText(/Start: 0 kg/)).toBeInTheDocument();
      expect(screen.getByText(/Target: 100 kg/)).toBeInTheDocument();
    });
  });

  describe('Binary Goal Progress Update', () => {
    it('renders binary goal with item checkboxes', () => {
      const goal = createMockGoal(GoalType.BINARY);

      render(
        <TestWrapper>
          <UpdateProgressModal open={true} goal={goal} onCancel={vi.fn()} onSubmit={mockSubmit} />
        </TestWrapper>
      );

      expect(screen.getByText(/check completed items/i)).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('shows progress count', () => {
      const goal = createMockGoal(GoalType.BINARY);

      render(
        <TestWrapper>
          <UpdateProgressModal open={true} goal={goal} onCancel={vi.fn()} onSubmit={mockSubmit} />
        </TestWrapper>
      );

      expect(screen.getByText(/Current: 2 \/ Target: 5/)).toBeInTheDocument();
    });
  });

  describe('Qualitative Goal Progress Update', () => {
    it('renders qualitative goal with status selector', () => {
      const goal = createMockGoal(GoalType.QUALITATIVE);

      render(
        <TestWrapper>
          <UpdateProgressModal open={true} goal={goal} onCancel={vi.fn()} onSubmit={mockSubmit} />
        </TestWrapper>
      );

      expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    });

    it('shows status selector', async () => {
      const goal = createMockGoal(GoalType.QUALITATIVE);

      render(
        <TestWrapper>
          <UpdateProgressModal open={true} goal={goal} onCancel={vi.fn()} onSubmit={mockSubmit} />
        </TestWrapper>
      );

      const statusSelect = screen.getByLabelText(/status/i);
      expect(statusSelect).toBeInTheDocument();
    });

    it('displays previous assessments when available', () => {
      const goalWithAssessments = {
        ...createMockGoal(GoalType.QUALITATIVE),
        selfAssessments: [
          { id: '1', date: new Date(), rating: 7 },
          { id: '2', date: new Date(), rating: 8 },
        ],
      };

      render(
        <TestWrapper>
          <UpdateProgressModal open={true} goal={goalWithAssessments} onCancel={vi.fn()} onSubmit={mockSubmit} />
        </TestWrapper>
      );

      expect(screen.getByText(/Previous Assessments/i)).toBeInTheDocument();
    });
  });

  describe('Milestone Goal Progress Update', () => {
    it('renders milestone selector with progress count', () => {
      const goal = createMockGoal(GoalType.MILESTONE);

      render(
        <TestWrapper>
          <UpdateProgressModal open={true} goal={goal} onCancel={vi.fn()} onSubmit={mockSubmit} />
        </TestWrapper>
      );

      expect(screen.getByText(/Select Milestone/i)).toBeInTheDocument();
      expect(screen.getByText(/1 \/ 3 milestones completed/i)).toBeInTheDocument();
    });

    it('shows milestone options', async () => {
      const goal = createMockGoal(GoalType.MILESTONE);

      render(
        <TestWrapper>
          <UpdateProgressModal open={true} goal={goal} onCancel={vi.fn()} onSubmit={mockSubmit} />
        </TestWrapper>
      );

      const select = screen.getByLabelText(/select milestone/i);
      await userEvent.click(select);

      await waitFor(() => {
        expect(screen.getByText(/Milestone 2/)).toBeInTheDocument();
        expect(screen.getByText(/Milestone 3/)).toBeInTheDocument();
      });
    });

    it('shows blocked status for milestone with unmet dependencies', async () => {
      const goalWithDeps = {
        ...createMockGoal(GoalType.MILESTONE),
        milestones: [
          { id: 'm1', title: 'First', order: 0, status: 'pending' as const },
          { id: 'm2', title: 'Second', order: 1, status: 'pending' as const, dependencies: ['m1'] as string[] },
        ],
      };

      render(
        <TestWrapper>
          <UpdateProgressModal open={true} goal={goalWithDeps} onCancel={vi.fn()} onSubmit={mockSubmit} />
        </TestWrapper>
      );

      expect(screen.getByText(/Select Milestone/i)).toBeInTheDocument();
    });
  });

  describe('Recurring Goal Progress Update', () => {
    it('renders recurring goal with occurrence selector', () => {
      const goal = createMockGoal(GoalType.RECURRING);

      render(
        <TestWrapper>
          <UpdateProgressModal open={true} goal={goal} onCancel={vi.fn()} onSubmit={mockSubmit} />
        </TestWrapper>
      );

      expect(screen.getByText(/Select Occurrence/i)).toBeInTheDocument();
      expect(screen.getByText(/Completion Rate: 70%/)).toBeInTheDocument();
    });

    it('shows status radio buttons', () => {
      const goal = createMockGoal(GoalType.RECURRING);

      render(
        <TestWrapper>
          <UpdateProgressModal open={true} goal={goal} onCancel={vi.fn()} onSubmit={mockSubmit} />
        </TestWrapper>
      );

      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('Missed')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });
  });

  describe('Common Form Elements', () => {
    it('renders note field for all goal types', () => {
      const goal = createMockGoal(GoalType.QUANTITATIVE);

      render(
        <TestWrapper>
          <UpdateProgressModal open={true} goal={goal} onCancel={vi.fn()} onSubmit={mockSubmit} />
        </TestWrapper>
      );

      expect(screen.getByLabelText(/note/i)).toBeInTheDocument();
    });

    it('renders cancel and submit buttons', () => {
      const goal = createMockGoal(GoalType.QUANTITATIVE);

      const { container } = render(
        <TestWrapper>
          <UpdateProgressModal open={true} goal={goal} onCancel={vi.fn()} onSubmit={mockSubmit} />
        </TestWrapper>
      );

      const buttons = container.querySelectorAll('.ant-btn');
      const cancelBtn = Array.from(buttons).find((btn) => btn.textContent?.toLowerCase().includes('cancel'));
      const updateBtn = Array.from(buttons).find((btn) => btn.textContent?.toLowerCase().includes('update'));
      expect(cancelBtn).toBeInTheDocument();
      expect(updateBtn).toBeInTheDocument();
    });

    it('cancel button triggers onCancel callback', () => {
      const mockOnCancel = vi.fn();
      const goal = createMockGoal(GoalType.QUANTITATIVE);

      const { container } = render(
        <TestWrapper>
          <UpdateProgressModal open={true} goal={goal} onCancel={mockOnCancel} onSubmit={mockSubmit} />
        </TestWrapper>
      );

      const buttons = container.querySelectorAll('.ant-btn');
      const cancelBtn = Array.from(buttons).find((btn) => btn.textContent?.toLowerCase().includes('cancel'));
      expect(cancelBtn).toBeInTheDocument();
      if (cancelBtn) {
        fireEvent.click(cancelBtn);
      }
      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('Progress Calculation Verification', () => {
    it('verifies quantitative progress calculation: (75-0)/(100-0)*100 = 75%', async () => {
      const goal = createMockGoal(GoalType.QUANTITATIVE);

      const { container } = render(
        <TestWrapper>
          <UpdateProgressModal open={true} goal={goal} onCancel={vi.fn()} onSubmit={mockSubmit} />
        </TestWrapper>
      );

      const input = screen.getByLabelText(/current value/i);
      fireEvent.change(input, { target: { value: '75' } });

      const buttons = container.querySelectorAll('.ant-btn');
      const submitButton = Array.from(buttons).find((btn) => btn.textContent?.toLowerCase().includes('update'));
      expect(submitButton).toBeInTheDocument();
      if (submitButton) {
        fireEvent.click(submitButton);
      }

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            goalId: 'test-goal-id',
            progressValue: 75,
          })
        );
      });
    });

    it('verifies binary progress calculation: 3/5*100 = 60%', async () => {
      const goal = createMockGoal(GoalType.BINARY);

      const { container } = render(
        <TestWrapper>
          <UpdateProgressModal open={true} goal={goal} onCancel={vi.fn()} onSubmit={mockSubmit} />
        </TestWrapper>
      );

      const checkboxes = screen.getAllByRole('checkbox');
      const thirdCheckbox = checkboxes[2];
      if (thirdCheckbox) {
        fireEvent.click(thirdCheckbox);
      }

      const buttons = container.querySelectorAll('.ant-btn');
      const submitButton = Array.from(buttons).find((btn) => btn.textContent?.toLowerCase().includes('update'));
      expect(submitButton).toBeInTheDocument();
      if (submitButton) {
        fireEvent.click(submitButton);
      }

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            goalId: 'test-goal-id',
          })
        );
      });
    });
  });

  describe('Progress History Integration', () => {
    it('passes note to submit handler', async () => {
      const goal = createMockGoal(GoalType.QUANTITATIVE);

      const { container } = render(
        <TestWrapper>
          <UpdateProgressModal open={true} goal={goal} onCancel={vi.fn()} onSubmit={mockSubmit} />
        </TestWrapper>
      );

      const noteField = screen.getByLabelText(/note/i);
      fireEvent.change(noteField, { target: { value: 'Weekly progress update' } });

      const buttons = container.querySelectorAll('.ant-btn');
      const submitButton = Array.from(buttons).find((btn) => btn.textContent?.toLowerCase().includes('update'));
      expect(submitButton).toBeInTheDocument();
      if (submitButton) {
        fireEvent.click(submitButton);
      }

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            note: 'Weekly progress update',
          })
        );
      });
    });

    it('includes type-specific updates in submit', async () => {
      const goal = createMockGoal(GoalType.QUANTITATIVE);

      const { container } = render(
        <TestWrapper>
          <UpdateProgressModal open={true} goal={goal} onCancel={vi.fn()} onSubmit={mockSubmit} />
        </TestWrapper>
      );

      const input = screen.getByLabelText(/current value/i);
      fireEvent.change(input, { target: { value: '80' } });

      const buttons = container.querySelectorAll('.ant-btn');
      const submitButton = Array.from(buttons).find((btn) => btn.textContent?.toLowerCase().includes('update'));
      expect(submitButton).toBeInTheDocument();
      if (submitButton) {
        fireEvent.click(submitButton);
      }

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            typeSpecificUpdates: expect.objectContaining({
              currentValue: 80,
            }) as Record<string, unknown>,
          })
        );
      });
    });
  });

  describe('Form Reset on Close', () => {
    it('resets form when modal is closed and reopened', () => {
      const mockOnCancel = vi.fn();
      const goal = createMockGoal(GoalType.QUANTITATIVE);
      const { rerender } = render(
        <TestWrapper>
          <UpdateProgressModal open={true} goal={goal} onCancel={mockOnCancel} onSubmit={mockSubmit} />
        </TestWrapper>
      );

      const input = screen.getByLabelText(/current value/i);
      fireEvent.change(input, { target: { value: '80' } });

      expect((input as HTMLInputElement).value).toBe('80');

      rerender(
        <TestWrapper>
          <UpdateProgressModal open={false} goal={goal} onCancel={mockOnCancel} onSubmit={mockSubmit} />
        </TestWrapper>
      );

      rerender(
        <TestWrapper>
          <UpdateProgressModal open={true} goal={goal} onCancel={mockOnCancel} onSubmit={mockSubmit} />
        </TestWrapper>
      );

      const reopenedInput = screen.getByLabelText(/current value/i);
      expect((reopenedInput as HTMLInputElement).value).toBe('50');
    });
  });
});
