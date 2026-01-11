/**
 * GoalDetailPage Component
 *
 * Page for displaying detailed information about a single goal.
 * This is a placeholder implementation for Step 8. Full implementation will be in Step 9.
 *
 * Features (to be implemented in Step 9):
 * - Display all goal information
 * - Progress visualization
 * - Edit goal button
 * - Delete goal button
 * - Type-specific display (quantitative shows values, binary shows checklist, etc.)
 */

import React from 'react';

import { ArrowLeftOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Card, Typography, Button, Space, Spin } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';

import { goalService } from '@/services/api/goalService';
import { queryKeys } from '@/utils/queryKeys';

const { Title, Paragraph } = Typography;

/**
 * GoalDetailPage Component
 */
export const GoalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch goal details
  const {
    data: goal,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.goals.detail(id ?? ''),
    queryFn: async () => {
      if (!id) {
        throw new Error('Goal ID is required');
      }
      const goalData = await goalService.getById(id);
      if (!goalData) {
        throw new Error('Goal not found');
      }
      return goalData;
    },
    enabled: !!id,
  });

  // Handle navigation back
  const handleBack = () => {
    navigate('/goals');
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Paragraph>Loading goal details...</Paragraph>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !goal) {
    return (
      <div>
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack} style={{ marginBottom: 16 }}>
          Back to Goals
        </Button>
        <Card>
          <Title level={3}>Goal Not Found</Title>
          <Paragraph>
            {error
              ? 'An error occurred while loading the goal. Please try again.'
              : 'The goal you are looking for does not exist.'}
          </Paragraph>
          <Button type="primary" onClick={handleBack}>
            Back to Goals List
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* Header with back button */}
      <div style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
          Back to Goals
        </Button>
      </div>

      {/* Goal Details Card */}
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Title level={2} style={{ margin: 0 }}>
              {goal.title}
            </Title>
            {goal.description && (
              <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>{goal.description}</Paragraph>
            )}
          </div>

          <div>
            <Title level={4}>Basic Information</Title>
            <Paragraph>
              <strong>Type:</strong> {goal.type}
            </Paragraph>
            <Paragraph>
              <strong>Status:</strong> {goal.status}
            </Paragraph>
            <Paragraph>
              <strong>Priority:</strong> {goal.priority}
            </Paragraph>
            {goal.category && (
              <Paragraph>
                <strong>Category:</strong> {goal.category}
              </Paragraph>
            )}
            <Paragraph>
              <strong>Progress:</strong> {goal.progress}%
            </Paragraph>
          </div>

          {/* Type-specific information will be added in Step 9 */}
          {goal.type === 'quantitative' && (
            <div>
              <Title level={4}>Quantitative Goal Details</Title>
              <Paragraph>
                <strong>Start Value:</strong> {goal.startValue} {goal.unit}
              </Paragraph>
              <Paragraph>
                <strong>Current Value:</strong> {goal.currentValue} {goal.unit}
              </Paragraph>
              <Paragraph>
                <strong>Target Value:</strong> {goal.targetValue} {goal.unit}
              </Paragraph>
            </div>
          )}

          {goal.type === 'binary' && (
            <div>
              <Title level={4}>Binary Goal Details</Title>
              {goal.targetCount && (
                <Paragraph>
                  <strong>Progress:</strong> {goal.currentCount} / {goal.targetCount}
                </Paragraph>
              )}
            </div>
          )}

          {goal.type === 'qualitative' && (
            <div>
              <Title level={4}>Qualitative Goal Details</Title>
              <Paragraph>
                <strong>Status:</strong> {goal.qualitativeStatus}
              </Paragraph>
            </div>
          )}

          {/* Dates */}
          <div>
            <Title level={4}>Timeline</Title>
            {goal.startDate && (
              <Paragraph>
                <strong>Start Date:</strong> {new Date(goal.startDate).toLocaleDateString()}
              </Paragraph>
            )}
            {goal.deadline && (
              <Paragraph>
                <strong>Deadline:</strong> {new Date(goal.deadline).toLocaleDateString()}
              </Paragraph>
            )}
            <Paragraph>
              <strong>Created:</strong> {new Date(goal.createdAt).toLocaleDateString()}
            </Paragraph>
            <Paragraph>
              <strong>Last Updated:</strong> {new Date(goal.updatedAt).toLocaleDateString()}
            </Paragraph>
          </div>

          {/* Placeholder for future features */}
          <div>
            <Title level={4}>Additional Features</Title>
            <Paragraph type="secondary">
              Full goal detail view with progress visualization, edit/delete actions, and
              type-specific displays will be implemented in Step 9.
            </Paragraph>
          </div>
        </Space>
      </Card>
    </div>
  );
};

