/**
 * GoalList Component
 *
 * Displays a list of goals using Ant Design List component.
 * Supports loading states, empty states, and click handlers.
 */

import React from 'react';
import { List, Empty, Spin } from 'antd';
import type { Goal } from '@/features/goals/types';
import { GoalCard } from '../GoalCard';

export interface GoalListProps {
  /**
   * Array of goals to display
   */
  goals: Goal[];

  /**
   * Loading state
   */
  loading?: boolean;

  /**
   * Callback when a goal is clicked
   */
  onGoalClick?: (goal: Goal) => void;

  /**
   * Additional CSS class name
   */
  className?: string;
}

/**
 * GoalList Component
 */
export const GoalList: React.FC<GoalListProps> = ({
  goals,
  loading = false,
  onGoalClick,
  className,
}) => {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <Empty
        description="No goals found"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        style={{ padding: '50px' }}
      />
    );
  }

  return (
    <List
      className={className}
      dataSource={goals}
      renderItem={(goal) => (
        <List.Item key={goal.id} style={{ padding: 0 }}>
          <GoalCard goal={goal} onClick={onGoalClick} />
        </List.Item>
      )}
    />
  );
};

