/**
 * QuickProgressModal Component Tests
 *
 * Tests for the compact quick progress update modal
 */

import { render } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { QuickProgressModal } from '@/features/goals/components/QuickProgressModal/QuickProgressModal';
import type { Goal } from '@/features/goals/types';
import { GoalType, GoalStatus, Priority } from '@/features/goals/types';

const createMockQuantitativeGoal = (): Goal => ({
  id: 'test-goal-id',
  title: 'Test Goal',
  type: GoalType.QUANTITATIVE,
  status: GoalStatus.ACTIVE,
  priority: Priority.MEDIUM,
  category: 'Test',
  tags: ['test'],
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
  startValue: 0,
  targetValue: 100,
  currentValue: 50,
  unit: 'kg',
  allowDecimals: false,
});

describe('QuickProgressModal', () => {
  const mockOnCancel = vi.fn();
  const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render modal when open is false', () => {
    const goal = createMockQuantitativeGoal();
    const { container } = render(
      <QuickProgressModal open={false} goal={goal} onCancel={mockOnCancel} onSubmit={mockOnSubmit} />
    );
    expect(container.querySelector('.ant-modal')).not.toBeInTheDocument();
  });

  it('renders modal when open is true', async () => {
    const goal = createMockQuantitativeGoal();
    render(<QuickProgressModal open={true} goal={goal} onCancel={mockOnCancel} onSubmit={mockOnSubmit} />);
    // Use setTimeout to allow Ant Design Modal portal to render
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(document.querySelector('.ant-modal')).toBeInTheDocument();
  });
});
