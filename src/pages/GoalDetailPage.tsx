/**
 * GoalDetailPage Component
 *
 * Page for displaying detailed information about a single goal.
 * Full implementation for Step 9 with comprehensive goal detail view.
 */

import React, { useState } from 'react';

import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  InboxOutlined,
  MoreOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { MenuProps } from 'antd';
import { Affix, Button, Card, Col, Dropdown, Grid, message, Row, Spin, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

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
  const [showProgressModal, setShowProgressModal] = useState(false);
  const screens = Grid.useBreakpoint();
  const isDesktop = screens.lg;

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

  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();
  const updateProgress = useUpdateProgress();

  const relatedGoalIds = goal?.relatedGoals ?? [];
  const { data: relatedGoals = [] } = useQuery({
    queryKey: queryKeys.goals.list({ ids: relatedGoalIds }),
    queryFn: async () => {
      const allGoals = await goalService.getAll();
      return allGoals.filter((g) => relatedGoalIds.includes(g.id));
    },
    enabled: relatedGoalIds.length > 0,
  });

  const { isEligible, canComplete } = useCompletionDetection(goal);

  const completeGoalMutation = useMutation({
    mutationFn: async (options: CompletionOptions) => {
      if (!goal || !id) {
        throw new Error('Goal is required');
      }

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

  usePageTitle(goal?.title || t('goals.goalDetails'), 'Details');

  useMetaTags({
    title: goal?.title || t('goals.goalDetails'),
    description: goal?.description || t('goals.goalDetails'),
    url: `/goals/${id}`,
    type: 'article',
    keywords: goal?.tags || ['goal', 'tracking', 'progress'],
  });

  const handleBack = () => {
    navigate('/goals');
  };

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

  const handleUpdateProgress = async (input: Parameters<typeof updateProgress.mutateAsync>[0]) => {
    try {
      await updateProgress.mutateAsync(input);
      void message.success(t('goals.progressUpdatedSuccessfully'));
    } catch (error) {
      void message.error(t('goals.failedToUpdateProgress'));
      console.error('Error updating progress:', error);
    }
  };

  const moreMenuItems: MenuProps['items'] = [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: t('goals.editGoal'),
      onClick: handleEdit,
    },
    {
      key: 'archive',
      icon: <InboxOutlined />,
      label: goal?.archived ? t('goals.unarchive') : t('goals.archive'),
      onClick: () => {
        if (goal) {
          void handleToggleArchive(goal.id);
        }
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: t('goals.deleteGoal'),
      danger: true,
      onClick: () => {
        if (goal) {
          handleDelete(goal.id);
        }
      },
    },
  ];

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
    <div style={{ paddingBottom: 0 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
          {t('goals.backToGoals')}
        </Button>

        <Dropdown menu={{ items: moreMenuItems }} trigger={['click']}>
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      </div>

      {isDesktop ? (
        <Row gutter={24}>
          <Col xs={24} lg={16}>
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
              showProgressModal={showProgressModal}
              onProgressModalClose={() => setShowProgressModal(false)}
            />
            {goal.status === GoalStatus.ACTIVE && canComplete && (
              <div style={{ marginTop: 16 }}>
                <Button type="default" block onClick={() => setCompleteDialogOpen(true)}>
                  {isEligible ? t('goals.completeGoal') : t('goals.completeAnyway')}
                </Button>
              </div>
            )}
          </Col>
          <Col xs={24} lg={8}>
            <div style={{ position: 'sticky', top: 24 }}>
              <Button
                type="primary"
                size="large"
                block
                icon={<RiseOutlined />}
                onClick={() => setShowProgressModal(true)}
                style={{ marginBottom: 16 }}
              >
                {t('goals.updateProgress.title')}
              </Button>
            </div>
          </Col>
        </Row>
      ) : (
        <>
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
            showProgressModal={showProgressModal}
            onProgressModalClose={() => setShowProgressModal(false)}
          />

          {goal.status === GoalStatus.ACTIVE && canComplete && (
            <div style={{ marginTop: 16 }}>
              <Button type="default" block onClick={() => setCompleteDialogOpen(true)}>
                {isEligible ? t('goals.completeGoal') : t('goals.completeAnyway')}
              </Button>
            </div>
          )}

          <Affix
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '16px 24px',
              background: 'var(--ant-color-bg-container)',
              borderTop: '1px solid var(--ant-color-border)',
              zIndex: 100,
            }}
          >
            <Button
              type="primary"
              size="large"
              block
              onClick={() => setShowProgressModal(true)}
              icon={<RiseOutlined />}
            >
              {t('goals.updateProgress.title')}
            </Button>
          </Affix>
        </>
      )}

      <EditGoalModal
        open={editModalOpen}
        goal={goal}
        onCancel={() => setEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        loading={updateGoal.isPending}
      />

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
