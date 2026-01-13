/**
 * GoalDetailPage Component
 *
 * Page for displaying detailed information about a single goal.
 * Full implementation for Step 9 with comprehensive goal detail view.
 */

import React, { useState } from 'react';

import { ArrowLeftOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Typography, Spin, message } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';

import { EditGoalModal } from '@/features/goals/components/EditGoalModal';
import { GoalDetail } from '@/features/goals/components/GoalDetail';
import { useDeleteGoal } from '@/features/goals/hooks/useDeleteGoal';
import { useUpdateGoal } from '@/features/goals/hooks/useUpdateGoal';
import { useUpdateProgress } from '@/features/goals/hooks/useUpdateProgress';
import type { CreateGoalInput, UpdateGoalInput } from '@/features/goals/types';
import { goalService } from '@/services/api/goalService';
import { queryKeys } from '@/utils/queryKeys';

const { Paragraph } = Typography;

/**
 * Convert CreateGoalInput to UpdateGoalInput
 */
const createInputToUpdateInput = (input: CreateGoalInput): UpdateGoalInput => {
  // Remove fields that shouldn't be in UpdateGoalInput
  const { progressHistory: _progressHistory, ...rest } = input;

  return {
    ...rest,
    updatedAt: new Date(),
  } as UpdateGoalInput;
};

/**
 * GoalDetailPage Component
 */
export const GoalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [editModalOpen, setEditModalOpen] = useState(false);

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

  // Update and delete mutations
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();
  const updateProgress = useUpdateProgress();

  // Handle navigation back
  const handleBack = () => {
    navigate('/goals');
  };

  // Handle edit
  const handleEdit = () => {
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (values: CreateGoalInput) => {
    if (!id) {
      void message.error('Goal ID is missing');
      return;
    }

    const updateInput = createInputToUpdateInput(values);
    try {
      await updateGoal.mutateAsync({ id, updates: updateInput });
      void message.success('Goal updated successfully');
      setEditModalOpen(false);
    } catch (error) {
      void message.error('Failed to update goal');
      console.error('Error updating goal:', error);
    }
  };

  // Handle delete
  const handleDelete = (goalId: string) => {
    void (async () => {
      try {
        await deleteGoal.mutateAsync(goalId);
        void message.success('Goal deleted successfully');
        navigate('/goals');
      } catch (error) {
        void message.error('Failed to delete goal');
        console.error('Error deleting goal:', error);
      }
    })();
  };

  // Handle progress update
  const handleUpdateProgress = async (input: Parameters<typeof updateProgress.mutateAsync>[0]) => {
    try {
      await updateProgress.mutateAsync(input);
      void message.success('Progress updated successfully');
    } catch (error) {
      void message.error('Failed to update progress');
      console.error('Error updating progress:', error);
    }
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
          <Typography.Title level={3}>Goal Not Found</Typography.Title>
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

      {/* Goal Detail Component */}
      <GoalDetail
        goal={goal}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onUpdateProgress={handleUpdateProgress}
        deleting={deleteGoal.isPending}
        updatingProgress={updateProgress.isPending}
      />

      {/* Edit Modal */}
      <EditGoalModal
        open={editModalOpen}
        goal={goal}
        onCancel={() => setEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        loading={updateGoal.isPending}
      />
    </div>
  );
};
