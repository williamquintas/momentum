/**
 * GoalCard Component
 *
 * Displays a single goal with title, type, status, and progress bar.
 * Uses Ant Design Card component for consistent styling.
 */

import React from 'react';

import { StarFilled, StarOutlined } from '@ant-design/icons';
import { Card, Progress, Tag, Space, Typography, Avatar } from 'antd';
import { useTranslation } from 'react-i18next';

import type { Goal } from '@/features/goals/types';
import { GoalType } from '@/features/goals/types';
import { calculateProgress } from '@/features/goals/utils/calculateProgress';
import { getStatusColor, getPriorityColor } from '@/features/goals/utils/colorUtils';
import { formatDate, isOverdue, isDueSoon, getDeadlineStatusText } from '@/features/goals/utils/dateUtils';
import { formatProgress } from '@/features/goals/utils/progressUtils';
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
   * Callback when favorite is toggled
   */
  onToggleFavorite?: (goalId: string) => void;

  /**
   * Additional CSS class name
   */
  className?: string;
}

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
export const GoalCard: React.FC<GoalCardProps> = ({ goal, onClick, onToggleFavorite, className }) => {
  const { t } = useTranslation();
  const progress = calculateProgress(goal);
  const progressStatus = getProgressStatus(progress);

  const handleClick = () => {
    if (onClick) {
      onClick(goal);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(goal.id);
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
        {/* Header: Favorite and Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Space size="small" align="center">
            <span
              onClick={handleFavoriteClick}
              style={{ cursor: onToggleFavorite ? 'pointer' : 'default', fontSize: '16px', lineHeight: 1 }}
              role={onToggleFavorite ? 'button' : undefined}
              tabIndex={onToggleFavorite ? 0 : undefined}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleFavoriteClick(e as unknown as React.MouseEvent);
                }
              }}
            >
              {goal.favorite ? (
                <StarFilled style={{ color: '#faad14' }} />
              ) : (
                <StarOutlined style={{ color: '#d9d9d9' }} />
              )}
            </span>
            <Title level={5} style={{ margin: 0, flex: 1 }} ellipsis={{ tooltip: goal.title }}>
              {goal.title}
            </Title>
          </Space>
        </div>

        {/* Goal Type */}
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {formatGoalType(goal.type)}
        </Text>

        {/* Description (if available) */}
        {goal.description && (
          <Text type="secondary" ellipsis={{ tooltip: goal.description }} style={{ display: 'block', width: '100%' }}>
            {goal.description}
          </Text>
        )}

        {/* Progress Bar */}
        <div>
          <Progress percent={progress} status={progressStatus} format={() => formatProgress(goal)} showInfo />
        </div>

        {/* Deadline and Assignee */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Deadline */}
          {goal.deadline && (
            <Space size="small">
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {t('goals.dueDate')}: {formatDate(goal.deadline)}
              </Text>
              {isOverdue(goal.deadline) && <Tag color="red">{getDeadlineStatusText(goal.deadline)}</Tag>}
              {isDueSoon(goal.deadline) && !isOverdue(goal.deadline) && (
                <Tag color="orange">{getDeadlineStatusText(goal.deadline)}</Tag>
              )}
            </Space>
          )}

          {/* Assignee */}
          {goal.assignee && (
            <Avatar size="small" style={{ backgroundColor: '#1890ff' }}>
              {goal.assignee.charAt(0).toUpperCase()}
            </Avatar>
          )}
        </div>

        {/* Grouped Tags: Status | Priority | Category */}
        <Space size="small" wrap>
          {goal.archived && <Tag color="default">{t('goalList.archived')}</Tag>}
          <Tag color={getStatusColor(goal.status)}>{t(`goals.status.${goal.status}`)}</Tag>
          <Tag color={getPriorityColor(goal.priority)}>{t(`goals.priorities.${goal.priority}`)}</Tag>
          <Tag>{goal.category}</Tag>
        </Space>
      </Space>
    </Card>
  );
};
