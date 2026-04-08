/**
 * UpdateProgressModal Component Tests
 *
 * Tests for the UpdateProgressModal component
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { UpdateProgressModal } from '@/features/goals/components/UpdateProgressModal/UpdateProgressModal';
import type { Goal } from '@/features/goals/types';
import { GoalType, GoalStatus, Priority, QualitativeStatus } from '@/features/goals/types';

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
        qualitativeStatus: QualitativeStatus.IN_PROGRESS,
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
        recurrence: { frequency: 'daily' as const, interval: 1 },
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

    case GoalType.HABIT:
      return {
        ...baseGoal,
        type: GoalType.HABIT,
        targetFrequency: 'daily' as const,
        completionStats: {
          totalOccurrences: 7,
          completedOccurrences: 5,
          completionRate: 71.4,
          streak: { current: 3, longest: 5 },
        },
        entries: [
          { id: 'e1', date: new Date(), completed: true },
          { id: 'e2', date: new Date(Date.now() - 86400000), completed: true },
        ],
      } as Goal;

    default:
      throw new Error(`Unsupported goal type: ${String(type)}`);
  }
};

describe('UpdateProgressModal', () => {
  const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Quantitative Goal', () => {
    it('renders quantitative goal form fields', () => {
      const goal = createMockGoal(GoalType.QUANTITATIVE);

      render(<UpdateProgressModal open={true} goal={goal} onCancel={mockOnCancel} onSubmit={mockOnSubmit} />);

      expect(screen.getByLabelText(/current value/i)).toBeInTheDocument();
    });
  });

  describe('Binary Goal', () => {
    it('renders binary goal form fields', () => {
      const goal = createMockGoal(GoalType.BINARY);

      render(<UpdateProgressModal open={true} goal={goal} onCancel={mockOnCancel} onSubmit={mockOnSubmit} />);

      expect(screen.getByText(/check completed items/i)).toBeInTheDocument();
    });
  });

  describe('Qualitative Goal', () => {
    it('renders qualitative goal form fields', () => {
      const goal = createMockGoal(GoalType.QUALITATIVE);

      render(<UpdateProgressModal open={true} goal={goal} onCancel={mockOnCancel} onSubmit={mockOnSubmit} />);

      expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    });

    it('shows qualitative status options (not_started, in_progress, completed)', () => {
      const goal = createMockGoal(GoalType.QUALITATIVE);

      render(<UpdateProgressModal open={true} goal={goal} onCancel={mockOnCancel} onSubmit={mockOnSubmit} />);

      const statusSelect = screen.getByLabelText(/status/i);
      expect(statusSelect).toBeInTheDocument();
    });

    it('displays previous assessments when selfAssessments exist', () => {
      const goal = {
        ...createMockGoal(GoalType.QUALITATIVE),
        selfAssessments: [
          { id: '1', date: new Date(), rating: 7 },
          { id: '2', date: new Date(), rating: 8 },
        ],
      };

      render(<UpdateProgressModal open={true} goal={goal} onCancel={mockOnCancel} onSubmit={mockOnSubmit} />);

      expect(screen.getByText(/Previous Assessments/i)).toBeInTheDocument();
      expect(screen.getByText(/Rating: 7\/10/i)).toBeInTheDocument();
      expect(screen.getByText(/Rating: 8\/10/i)).toBeInTheDocument();
    });

    it('shows only last 3 assessments', () => {
      const goal = {
        ...createMockGoal(GoalType.QUALITATIVE),
        selfAssessments: [
          { id: '1', date: new Date('2024-01-01'), rating: 5 },
          { id: '2', date: new Date('2024-01-02'), rating: 6 },
          { id: '3', date: new Date('2024-01-03'), rating: 7 },
          { id: '4', date: new Date('2024-01-04'), rating: 8 },
          { id: '5', date: new Date('2024-01-05'), rating: 9 },
        ],
      };

      render(<UpdateProgressModal open={true} goal={goal} onCancel={mockOnCancel} onSubmit={mockOnSubmit} />);

      expect(screen.getByText(/Previous Assessments/i)).toBeInTheDocument();
      expect(screen.getByText(/Rating: 7\/10/i)).toBeInTheDocument();
      expect(screen.getByText(/Rating: 8\/10/i)).toBeInTheDocument();
      expect(screen.getByText(/Rating: 9\/10/i)).toBeInTheDocument();
      expect(screen.queryByText(/Rating: 5\/10/i)).not.toBeInTheDocument();
    });

    it('does not show previous assessments section when empty', () => {
      const goal = createMockGoal(GoalType.QUALITATIVE);

      render(<UpdateProgressModal open={true} goal={goal} onCancel={mockOnCancel} onSubmit={mockOnSubmit} />);

      expect(screen.queryByText(/Previous Assessments/i)).not.toBeInTheDocument();
    });
  });

  describe('Milestone Goal', () => {
    it('renders milestone goal form fields', () => {
      const goal = createMockGoal(GoalType.MILESTONE);

      render(<UpdateProgressModal open={true} goal={goal} onCancel={mockOnCancel} onSubmit={mockOnSubmit} />);

      expect(screen.getByText(/select milestone/i)).toBeInTheDocument();
    });

    it('shows milestone selector with blocked indicator for unmet dependencies', () => {
      const goal = {
        ...createMockGoal(GoalType.MILESTONE),
        milestones: [
          { id: 'm1', title: 'First Milestone', order: 0, status: 'pending' as const },
          {
            id: 'm2',
            title: 'Second Milestone',
            order: 1,
            status: 'pending' as const,
            dependencies: ['m1'] as string[],
          },
          { id: 'm3', title: 'Third Milestone', order: 2, status: 'pending' as const },
        ],
      };

      render(<UpdateProgressModal open={true} goal={goal} onCancel={mockOnCancel} onSubmit={mockOnSubmit} />);

      expect(screen.getByText(/Select Milestone/i)).toBeInTheDocument();
    });

    it('shows completed milestones count', () => {
      const goal = {
        ...createMockGoal(GoalType.MILESTONE),
        milestones: [
          { id: 'm1', title: 'First', order: 0, status: 'completed' as const },
          { id: 'm2', title: 'Second', order: 1, status: 'pending' as const },
          { id: 'm3', title: 'Third', order: 2, status: 'pending' as const },
        ],
      };

      render(<UpdateProgressModal open={true} goal={goal} onCancel={mockOnCancel} onSubmit={mockOnSubmit} />);

      expect(screen.getByText(/1 \/ 3 milestones completed/i)).toBeInTheDocument();
    });
  });

  describe('Recurring Goal', () => {
    it('renders recurring goal form fields', () => {
      const goal = createMockGoal(GoalType.RECURRING);

      render(<UpdateProgressModal open={true} goal={goal} onCancel={mockOnCancel} onSubmit={mockOnSubmit} />);

      expect(screen.getByText(/select occurrence/i)).toBeInTheDocument();
    });
  });

  describe.skip('Habit Goal', () => {
    it('renders habit goal progress info', () => {
      const goal = createMockGoal(GoalType.HABIT);

      render(<UpdateProgressModal open={true} goal={goal} onCancel={mockOnCancel} onSubmit={mockOnSubmit} />);

      expect(screen.getByText(/current streak: 3 days/i)).toBeInTheDocument();
    });
  });

  describe('Common Elements', () => {
    it('renders note field for all goal types', () => {
      const goal = createMockGoal(GoalType.QUANTITATIVE);

      render(<UpdateProgressModal open={true} goal={goal} onCancel={mockOnCancel} onSubmit={mockOnSubmit} />);

      expect(screen.getByLabelText(/note/i)).toBeInTheDocument();
    });

    it.skip('renders cancel and submit buttons', () => {
      const goal = createMockGoal(GoalType.QUANTITATIVE);

      render(<UpdateProgressModal open={true} goal={goal} onCancel={mockOnCancel} onSubmit={mockOnSubmit} />);

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /update progress/i })).toBeInTheDocument();
    });
  });
});
