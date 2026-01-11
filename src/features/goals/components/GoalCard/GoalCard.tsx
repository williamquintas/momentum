/**
 * GoalCard Component
 *
 * Displays a single goal with title, type, status, and progress bar.
 * Uses Ant Design Card component for consistent styling.
 */

import React from 'react';
import { Card, Progress, Tag, Space, Typography } from 'antd';
import type { Goal } from '@/features/goals/types';
import { GoalType, GoalStatus, Priority } from '@/features/goals/types';
import { calculateProgress } from '@/features/goals/utils/calculateProgress';
import './GoalCard.css';

const { Text, Title } = Typography;

export interface GoalCardProps {
  /**
   * The goal to display
   */
  goal: Goal;

  /**
   * Callback when card is clicked
   */
  onClick?: (goal: Goal) => void;

  /**
   * Additional CSS class name
   */
  className?: string;
}

/**
 * Get color for status tag
 */
const getStatusColor = (status: GoalStatus): string => {
  switch (status) {
    case GoalStatus.ACTIVE:
      return 'blue';
    case GoalStatus.COMPLETED:
      return 'green';
    case GoalStatus.PAUSED:
      return 'orange';
    case GoalStatus.CANCELLED:
      return 'red';
    default:
      return 'default';
  }
};

/**
 * Get color for priority tag
 */
const getPriorityColor = (priority: Priority): string => {
  switch (priority) {
    case Priority.HIGH:
      return 'red';
    case Priority.MEDIUM:
      return 'orange';
    case Priority.LOW:
      return 'blue';
    default:
      return 'default';
  }
};

/**
 * Format goal type for display
 */
const formatGoalType = (type: GoalType): string => {
  return type.charAt(0).toUpperCase() + type.slice(1);
};

/**
 * Get progress status for Progress component
 */
const getProgressStatus = (progress: number): 'success' | 'exception' | 'active' | 'normal' => {
  if (progress >= 100) {
    return 'success';
  }
  if (progress < 50) {
    return 'exception';
  }
  return 'active';
};

/**
 * GoalCard Component
 */
export const GoalCard: React.FC<GoalCardProps> = ({ goal, onClick, className }) => {
  const progress = calculateProgress(goal);
  const progressStatus = getProgressStatus(progress);

  const handleClick = () => {
    if (onClick) {
      onClick(goal);
    }
  };

  return (
    <Card
      className={`goal-card ${className || ''}`}
      hoverable={!!onClick}
      onClick={handleClick}
      style={{ marginBottom: 16 }}
    >
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        {/* Header: Title and Tags */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Title level={5} style={{ margin: 0, flex: 1 }}>
            {goal.title}
          </Title>
          <Space size="small">
            <Tag color={getStatusColor(goal.status)}>{goal.status}</Tag>
            <Tag color={getPriorityColor(goal.priority)}>{goal.priority}</Tag>
          </Space>
        </div>

        {/* Goal Type */}
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {formatGoalType(goal.type)}
        </Text>

        {/* Description (if available) */}
        {goal.description && (
          <Text type="secondary" ellipsis style={{ display: 'block' }}>
            {goal.description}
          </Text>
        )}

        {/* Progress Bar */}
        <div>
          <Progress
            percent={progress}
            status={progressStatus}
            format={(percent) => `${percent}%`}
            showInfo
          />
        </div>

        {/* Category and Tags */}
        <Space size="small" wrap>
          <Tag>{goal.category}</Tag>
          {goal.tags.slice(0, 3).map((tag) => (
            <Tag key={tag} color="default">
              {tag}
            </Tag>
          ))}
          {goal.tags.length > 3 && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              +{goal.tags.length - 3} more
            </Text>
          )}
        </Space>
      </Space>
    </Card>
  );
};

