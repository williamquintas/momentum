/**
 * GoalList Component
 *
 * Displays a list of goals using Ant Design Table component (default) or List component.
 * Supports loading states, empty states, click handlers, sorting, and filtering.
 */

import React, { useState, useMemo } from 'react';

import { List, Empty, Spin, Table, Tag, Progress, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';

import type { Goal } from '@/features/goals/types';
import { GoalStatus, Priority } from '@/features/goals/types';
import { getStatusColor, getPriorityColor } from '@/features/goals/utils/colorUtils';
import { formatDate, isOverdue, isDueSoon, getDeadlineStatusText } from '@/features/goals/utils/dateUtils';
import { formatProgress, getProgressValue } from '@/features/goals/utils/progressUtils';

import { GoalCard } from '../GoalCard';

const { Text } = Typography;

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
   * Callback when favorite is toggled
   */
  onToggleFavorite?: (goalId: string) => void;

  /**
   * Additional CSS class name
   */
  className?: string;

  /**
   * View mode: 'table' (default) or 'list'
   */
  viewMode?: 'list' | 'table';
}

/**
 * GoalList Component
 */
export const GoalList: React.FC<GoalListProps> = ({
  goals,
  loading = false,
  onGoalClick,
  onToggleFavorite,
  className,
  viewMode = 'table',
}) => {
  const { t } = useTranslation();
  const [pageSize, setPageSize] = useState(10);

  // Sort goals by favorite first (favorites appear at top by default)
  const sortedGoals = useMemo(() => {
    return [...goals].sort((a, b) => {
      if (a.favorite !== b.favorite) {
        return a.favorite ? -1 : 1;
      }
      return 0;
    });
  }, [goals]);

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
        description={t('goalList.noGoalsFound')}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        style={{ padding: '50px' }}
      />
    );
  }

  if (viewMode === 'table') {
    const columns: ColumnsType<Goal> = [
      {
        title: t('goalList.goal'),
        dataIndex: 'title',
        key: 'title',
        sorter: (a, b) => a.title.localeCompare(b.title),
        render: (text: string, goal: Goal) => (
          <span
            style={{ cursor: onGoalClick ? 'pointer' : 'default' }}
            onClick={() => onGoalClick?.(goal)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onGoalClick?.(goal);
              }
            }}
            role={onGoalClick ? 'button' : undefined}
            tabIndex={onGoalClick ? 0 : undefined}
          >
            {text}
          </span>
        ),
      },
      {
        title: t('goalList.status'),
        dataIndex: 'status',
        key: 'status',
        sorter: (a, b) => a.status.localeCompare(b.status),
        filters: Object.values(GoalStatus).map((status) => ({
          text: status,
          value: status,
        })),
        onFilter: (value, record) => record.status === value,
        render: (status: GoalStatus) => <Tag color={getStatusColor(status)}>{t(`goals.status.${status}`)}</Tag>,
      },
      {
        title: t('goalList.priority'),
        dataIndex: 'priority',
        key: 'priority',
        sorter: (a, b) => a.priority.localeCompare(b.priority),
        filters: Object.values(Priority).map((priority) => ({
          text: priority,
          value: priority,
        })),
        onFilter: (value, record) => record.priority === value,
        render: (priority: Priority) => (
          <Tag color={getPriorityColor(priority)}>{t(`goals.priorities.${priority}`)}</Tag>
        ),
      },
      {
        title: t('goalList.progress'),
        key: 'progress',
        sorter: (a, b) => getProgressValue(a) - getProgressValue(b),
        render: (_: unknown, goal: Goal) => {
          const progress = getProgressValue(goal);
          return (
            <div style={{ minWidth: 100 }}>
              <Progress percent={progress} format={() => formatProgress(goal)} size="small" showInfo />
            </div>
          );
        },
      },
      {
        title: t('goalList.deadline'),
        dataIndex: 'deadline',
        key: 'deadline',
        sorter: (a, b) => {
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return a.deadline.getTime() - b.deadline.getTime();
        },
        render: (deadline: Date | undefined) => {
          if (!deadline) {
            return <Text type="secondary">-</Text>;
          }
          return (
            <div>
              <div>{formatDate(deadline)}</div>
              {isOverdue(deadline) && (
                <Tag color="red" style={{ marginTop: 4, fontSize: '11px' }}>
                  {getDeadlineStatusText(deadline)}
                </Tag>
              )}
              {isDueSoon(deadline) && !isOverdue(deadline) && (
                <Tag color="orange" style={{ marginTop: 4, fontSize: '11px' }}>
                  {getDeadlineStatusText(deadline)}
                </Tag>
              )}
            </div>
          );
        },
      },
    ];

    return (
      <div style={{ overflowX: 'auto', width: '100%' }} className="goals-table-wrapper">
        <Table
          className={className}
          columns={columns}
          dataSource={sortedGoals}
          rowKey="id"
          loading={loading}
          onRow={(record) => ({
            onClick: () => onGoalClick?.(record),
            style: { cursor: onGoalClick ? 'pointer' : 'default' },
          })}
          pagination={{
            pageSize,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total) => t('goalList.totalGoals', { total }),
            onShowSizeChange: (_, size) => {
              setPageSize(size);
            },
          }}
          scroll={{ x: 'max-content' }}
        />
      </div>
    );
  }

  // List view (card-based)
  return (
    <List
      className={className}
      dataSource={sortedGoals}
      split={false}
      renderItem={(goal) => (
        <List.Item key={goal.id} style={{ padding: 0 }}>
          <GoalCard goal={goal} onClick={onGoalClick} onToggleFavorite={onToggleFavorite} />
        </List.Item>
      )}
    />
  );
};
