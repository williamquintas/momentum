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
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      void message.success(t('goals.goalCompletedSuccessfully'));
    },
    onError: () => {
      void message.error(t('goals.failedToCompleteGoal'));
    },
  });

  // Set page title dynamically based on goal title
  usePageTitle(goal?.title || t('goals.goalDetails'), 'Details');

  // Set meta tags dynamically based on goal data
  useMetaTags({
    title: goal?.title || t('goals.goalDetails'),
    description: goal?.description || t('goals.goalDetails'),
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
      void message.error(t('goals.goalIdMissing'));
      return;
    }

    const updateInput = createInputToUpdateInput(values);
    try {
      await updateGoal.mutateAsync({ id, updates: updateInput });
      void message.success(t('goals.goalUpdatedSuccessfully'));
      setEditModalOpen(false);
    } catch (error) {
      void message.error(t('goals.failedToUpdateGoal'));
      console.error('Error updating goal:', error);
    }
  };

  // Handle delete
  const handleDelete = (goalId: string) => {
    void (async () => {
      try {
        await deleteGoal.mutateAsync(goalId);
        void message.success(t('goals.goalDeletedSuccessfully'));
        navigate('/goals');
      } catch (error) {
        void message.error(t('goals.failedToDeleteGoal'));
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
        void message.success(currentGoal.favorite ? t('goals.removedFromFavorites') : t('goals.addedToFavorites'));
      } catch (error) {
        void message.error(t('goals.failedToUpdateFavorite'));
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
        void message.success(currentGoal.archived ? t('goals.goalUnarchived') : t('goals.goalArchived'));
      } catch (error) {
        void message.error(t('goals.failedToUpdateArchiveStatus'));
        console.error('Error toggling archive:', error);
      }
    }
  };

  // Handle progress update
  const handleUpdateProgress = async (input: Parameters<typeof updateProgress.mutateAsync>[0]) => {
    try {
      await updateProgress.mutateAsync(input);
      void message.success(t('goals.progressUpdatedSuccessfully'));
    } catch (error) {
      void message.error(t('goals.failedToUpdateProgress'));
      console.error('Error updating progress:', error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Paragraph>{t('goals.loadingGoalDetails')}</Paragraph>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !goal) {
    return (
      <div>
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack} style={{ marginBottom: 16 }}>
          {t('goals.backToGoals')}
        </Button>
        <Card>
          <Typography.Title level={3}>{t('goals.goalNotFound')}</Typography.Title>
          <Paragraph>{error ? t('goals.errorLoadingGoal') : t('goals.goalDoesNotExist')}</Paragraph>
          <Button type="primary" onClick={handleBack}>
            {t('goals.backToGoalsList')}
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
          {t('goals.backToGoals')}
        </Button>

        {goal.status === GoalStatus.ACTIVE && canComplete && (
          <Button type="primary" onClick={() => setCompleteDialogOpen(true)} size="large">
            {isEligible ? t('goals.completeGoal') : t('goals.completeAnyway')}
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
