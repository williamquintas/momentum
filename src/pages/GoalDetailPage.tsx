/**
 * GoalDetailPage Component
 *
 * Page for displaying detailed information about a single goal.
 * Full implementation for Step 9 with comprehensive goal detail view.
 */

import React, { useState } from 'react';

import { ArrowLeftOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Typography, Spin, message } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';

import { CompleteGoalDialog } from '@/features/goals/components/CompleteGoalDialog';
import { EditGoalModal } from '@/features/goals/components/EditGoalModal';
import { GoalDetail } from '@/features/goals/components/GoalDetail';
import { useCompletionDetection } from '@/features/goals/hooks/useCompletionDetection';
import { useDeleteGoal } from '@/features/goals/hooks/useDeleteGoal';
import { useUpdateGoal } from '@/features/goals/hooks/useUpdateGoal';
import { useUpdateProgress } from '@/features/goals/hooks/useUpdateProgress';
import type { CreateGoalInput, UpdateGoalInput } from '@/features/goals/types';
import type { CompletionOptions } from '@/features/goals/types/completion';
import { useMetaTags } from '@/hooks/useMetaTags';
import { usePageTitle } from '@/hooks/usePageTitle';
import { goalService } from '@/services/api/goalService';
import { GoalStatus } from '@/types/goal.types';
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
  const queryClient = useQueryClient();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);

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

  // Fetch related goals
  const relatedGoalIds = goal?.relatedGoals ?? [];
  const { data: relatedGoals = [] } = useQuery({
    queryKey: queryKeys.goals.list({ ids: relatedGoalIds }),
    queryFn: async () => {
      const allGoals = await goalService.getAll();
      return allGoals.filter((g) => relatedGoalIds.includes(g.id));
    },
    enabled: relatedGoalIds.length > 0,
  });

  // Completion detection
  const { isEligible, canComplete } = useCompletionDetection(goal);

  // Completion mutation
  const completeGoalMutation = useMutation({
    mutationFn: async (options: CompletionOptions) => {
      if (!goal || !id) {
        throw new Error('Goal is required');
      }

      // Update goal status to completed
      await updateGoal.mutateAsync({
        id,
        updates: {
          status: GoalStatus.COMPLETED,
          completedDate: new Date(),
          progress: 100,
          updatedAt: new Date(),
        },
      });

      return options;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.goals.detail(id ?? '') });
      void message.success('Goal completed successfully! 🎉');
    },
    onError: () => {
      void message.error('Failed to complete goal');
    },
  });

  // Set page title dynamically based on goal title
  usePageTitle(goal?.title || 'Goal Details', 'Details');

  // Set meta tags dynamically based on goal data
  useMetaTags({
    title: goal?.title || 'Goal Details',
    description: goal?.description || `View details and track progress for ${goal?.title || 'this goal'}.`,
    url: `/goals/${id}`,
    type: 'article',
    keywords: goal?.tags || ['goal', 'tracking', 'progress'],
  });

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

  // Handle toggle favorite
  const handleToggleFavorite = async (goalId: string) => {
    const currentGoal = goal;
    if (currentGoal) {
      try {
        await updateGoal.mutateAsync({
          id: goalId,
          updates: { favorite: !currentGoal.favorite, updatedAt: new Date() },
        });
        void message.success(currentGoal.favorite ? 'Removed from favorites' : 'Added to favorites');
      } catch (error) {
        void message.error('Failed to update favorite status');
        console.error('Error toggling favorite:', error);
      }
    }
  };

  // Handle toggle archive
  const handleToggleArchive = async (goalId: string) => {
    const currentGoal = goal;
    if (currentGoal) {
      try {
        await updateGoal.mutateAsync({
          id: goalId,
          updates: { archived: !currentGoal.archived, updatedAt: new Date() },
        });
        void message.success(currentGoal.archived ? 'Goal unarchived' : 'Goal archived');
      } catch (error) {
        void message.error('Failed to update archive status');
        console.error('Error toggling archive:', error);
      }
    }
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
      {/* Header with back button and actions */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
          Back to Goals
        </Button>

        {goal.status === GoalStatus.ACTIVE && canComplete && (
          <Button type="primary" onClick={() => setCompleteDialogOpen(true)} size="large">
            {isEligible ? 'Complete Goal' : 'Complete Anyway'}
          </Button>
        )}
      </div>

      {/* Goal Detail Component */}
      <GoalDetail
        goal={goal}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onUpdateProgress={handleUpdateProgress}
        onToggleFavorite={handleToggleFavorite}
        onToggleArchive={handleToggleArchive}
        relatedGoals={relatedGoals}
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

      {/* Complete Goal Dialog */}
      <CompleteGoalDialog
        goal={goal}
        open={completeDialogOpen}
        onClose={() => setCompleteDialogOpen(false)}
        onComplete={async (options) => {
          await completeGoalMutation.mutateAsync(options);
        }}
        isLoading={completeGoalMutation.isPending}
      />
    </div>
  );
};
