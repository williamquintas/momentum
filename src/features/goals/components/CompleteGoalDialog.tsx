/**
 * Complete Goal Dialog
 *
 * Modal dialog for completing a goal with criteria display,
 * metrics preview, and confirmation.
 */

import { useState } from 'react';

import { CheckCircleOutlined, TrophyOutlined, FireOutlined } from '@ant-design/icons';
import { Modal, Button, Space, Divider, Alert, Progress, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import { useCompletionDetection } from '@/features/goals/hooks/useCompletionDetection';
import type { CompletionOptions, CelebrationData } from '@/features/goals/types/completion';
import type { Goal } from '@/types/goal.types';

const { Text, Title } = Typography;

export interface CompleteGoalDialogProps {
  goal: Goal;
  open: boolean;
  onClose: () => void;
  onComplete: (options: CompletionOptions) => Promise<void>;
  isLoading?: boolean;
}

export function CompleteGoalDialog({ goal, open, onClose, onComplete, isLoading = false }: CompleteGoalDialogProps) {
  const { t } = useTranslation();
  const { isEligible, canComplete, criteria, summary, isPartial, isFullCompletion } = useCompletionDetection(goal);

  const [showOverride, setShowOverride] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [selectedCelebration, setSelectedCelebration] = useState<CelebrationData['type']>('moderate');

  const handleComplete = () => {
    const options: CompletionOptions = {
      manual: true,
      force: !isEligible,
      overrideReason: !isEligible ? overrideReason : undefined,
      celebration: {
        type: selectedCelebration,
      },
    };

    void onComplete(options).then(() => {
      onClose();
    });
  };

  const renderCriteriaStatus = () => {
    if (criteria.met) {
      return (
        <Alert
          message={t('completeDialog.readyToComplete')}
          description={t('completeDialog.allCriteriaMet')}
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
        />
      );
    }

    if (showOverride) {
      return (
        <>
          <Alert
            message={t('completeDialog.overrideRequired')}
            description={t('completeDialog.criteriaNotMet')}
            type="warning"
            showIcon
          />
          <div style={{ marginTop: 16 }}>
            <Text>{t('completeDialog.overrideReasonLabel')}</Text>
            <textarea
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder={t('completeDialog.overrideReasonPlaceholder')}
              style={{
                width: '100%',
                marginTop: 8,
                padding: 8,
                borderRadius: 4,
                border: '1px solid #d9d9d9',
              }}
              rows={3}
            />
          </div>
        </>
      );
    }

    return (
      <>
        <Alert message={t('completeDialog.criteriaNotMetTitle')} description={summary} type="error" showIcon />
        <div style={{ marginTop: 16 }}>
          <Button type="link" onClick={() => setShowOverride(true)}>
            {t('completeDialog.overrideAndComplete')}
          </Button>
        </div>
      </>
    );
  };

  const renderGoalTypeSpecificContent = () => {
    switch (goal.type) {
      case 'quantitative':
        return (
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">
              {t('completeDialog.currentProgress', {
                current: goal.currentValue,
                target: goal.targetValue,
                unit: goal.unit,
              })}
            </Text>
            <Progress
              percent={Math.round(goal.progress)}
              status={goal.progress >= 100 ? 'success' : 'active'}
              style={{ marginTop: 8 }}
            />
          </div>
        );

      case 'milestone':
        if (goal.milestones) {
          const completed = goal.milestones.filter((m) => m.status === 'completed').length;
          return (
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">
                {t('completeDialog.milestonesProgress', { completed, total: goal.milestones.length })}
              </Text>
              <Progress
                percent={Math.round((completed / goal.milestones.length) * 100)}
                status={completed === goal.milestones.length ? 'success' : 'active'}
                style={{ marginTop: 8 }}
              />
            </div>
          );
        }
        return null;

      case 'recurring':
      case 'habit':
        return (
          <div style={{ marginTop: 16 }}>
            <Alert
              message={isPartial ? t('completeDialog.partialCompletion') : t('completeDialog.completion')}
              description={
                isPartial
                  ? t('completeDialog.partialCompletionDesc', { type: goal.type })
                  : t('completeDialog.fullCompletionDesc')
              }
              type="info"
              showIcon
            />
          </div>
        );

      default:
        return null;
    }
  };

  const renderCelebrationSelector = () => (
    <div style={{ marginTop: 16 }}>
      <Text strong>{t('completeDialog.celebrationStyle')}</Text>
      <Space style={{ marginTop: 8 }}>
        <Button
          type={selectedCelebration === 'subtle' ? 'primary' : 'default'}
          onClick={() => setSelectedCelebration('subtle')}
          size="small"
        >
          {t('completeDialog.subtle')}
        </Button>
        <Button
          type={selectedCelebration === 'moderate' ? 'primary' : 'default'}
          onClick={() => setSelectedCelebration('moderate')}
          size="small"
        >
          <TrophyOutlined /> {t('completeDialog.moderate')}
        </Button>
        <Button
          type={selectedCelebration === 'enthusiastic' ? 'primary' : 'default'}
          onClick={() => setSelectedCelebration('enthusiastic')}
          size="small"
        >
          <FireOutlined /> {t('completeDialog.enthusiastic')}
        </Button>
      </Space>
    </div>
  );

  const getCompletionTitle = () => {
    if (isPartial) {
      return t('completeDialog.markTypeComplete', { type: goal.type });
    }
    return t('completeDialog.completeGoal');
  };

  return (
    <Modal
      title={getCompletionTitle()}
      open={open}
      onCancel={onClose}
      width={500}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={isLoading}>
          {t('completeDialog.cancel')}
        </Button>,
        <Button key="complete" type="primary" onClick={handleComplete} loading={isLoading} disabled={!canComplete}>
          {isPartial ? t('completeDialog.markCompleteBtn') : t('completeDialog.completeGoal')}
        </Button>,
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <div>
          <Title level={5} style={{ marginBottom: 8 }}>
            {goal.title}
          </Title>
          <Text type="secondary">
            {isPartial ? t('completeDialog.markActivePartial') : t('completeDialog.markCompleted')}
          </Text>
        </div>

        <Divider style={{ margin: '12px 0' }} />

        {renderCriteriaStatus()}

        {renderGoalTypeSpecificContent()}

        {isFullCompletion && renderCelebrationSelector()}

        {isEligible && (
          <Alert
            message={t('completeDialog.readyTitle')}
            description={t('completeDialog.readyDesc')}
            type="success"
            showIcon
          />
        )}
      </Space>
    </Modal>
  );
}
