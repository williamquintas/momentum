/**
 * GoalList Component
 *
 * Displays a list of goals using Ant Design Table component (default) or List component.
 * Supports loading states, empty states, click handlers, sorting, and filtering.
 */

import React from 'react';
import { List, Empty, Spin, Table, Tag, Avatar, Progress, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Goal } from '@/features/goals/types';
import { GoalStatus, Priority } from '@/features/goals/types';
import { GoalCard } from '../GoalCard';
import { formatDate, isOverdue, isDueSoon, getDeadlineStatusText } from '@/features/goals/utils/dateUtils';
import { formatProgress, getProgressValue } from '@/features/goals/utils/progressUtils';
import { getStatusColor, getPriorityColor } from '@/features/goals/utils/colorUtils';

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
  className,
  viewMode = 'table',
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

  // Table view (default)
  if (viewMode === 'table') {
    const columns: ColumnsType<Goal> = [
      {
        title: 'Goal',
        dataIndex: 'title',
        key: 'title',
        sorter: (a, b) => a.title.localeCompare(b.title),
        render: (text: string, goal: Goal) => (
          <span
            style={{ cursor: onGoalClick ? 'pointer' : 'default' }}
            onClick={() => onGoalClick?.(goal)}
          >
            {text}
          </span>
        ),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        sorter: (a, b) => a.status.localeCompare(b.status),
        filters: Object.values(GoalStatus).map((status) => ({
          text: status,
          value: status,
        })),
        onFilter: (value, record) => record.status === value,
        render: (status: GoalStatus) => (
          <Tag color={getStatusColor(status)}>{status}</Tag>
        ),
      },
      {
        title: 'Priority',
        dataIndex: 'priority',
        key: 'priority',
        sorter: (a, b) => a.priority.localeCompare(b.priority),
        filters: Object.values(Priority).map((priority) => ({
          text: priority,
          value: priority,
        })),
        onFilter: (value, record) => record.priority === value,
        render: (priority: Priority) => (
          <Tag color={getPriorityColor(priority)}>{priority}</Tag>
        ),
      },
      {
        title: 'Progress',
        key: 'progress',
        sorter: (a, b) => getProgressValue(a) - getProgressValue(b),
        render: (_: unknown, goal: Goal) => {
          const progress = getProgressValue(goal);
          return (
            <div style={{ minWidth: 100 }}>
              <Progress
                percent={progress}
                format={() => formatProgress(goal)}
                size="small"
                showInfo
              />
            </div>
          );
        },
      },
      {
        title: 'Deadline',
        dataIndex: 'deadline',
        key: 'deadline',
        sorter: (a, b) => {
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return a.deadline.getTime() - b.deadline.getTime();
        },
        render: (deadline: Date | undefined, goal: Goal) => {
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
      {
        title: 'Assignee',
        dataIndex: 'assignee',
        key: 'assignee',
        filters: goals
          .filter((g) => g.assignee)
          .map((g) => g.assignee!)
          .filter((value, index, self) => self.indexOf(value) === index)
          .map((assignee) => ({
            text: assignee,
            value: assignee,
          })),
        onFilter: (value, record) => record.assignee === value,
        render: (assignee: string | undefined) => {
          if (!assignee) {
            return <Text type="secondary">-</Text>;
          }
          return (
            <Avatar size="small" style={{ backgroundColor: '#1890ff' }}>
              {assignee.charAt(0).toUpperCase()}
            </Avatar>
          );
        },
      },
    ];

    return (
      <Table
        className={className}
        columns={columns}
        dataSource={goals}
        rowKey="id"
        loading={loading}
        onRow={(record) => ({
          onClick: () => onGoalClick?.(record),
          style: { cursor: onGoalClick ? 'pointer' : 'default' },
        })}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} goals`,
        }}
      />
    );
  }

  // List view (card-based)
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

