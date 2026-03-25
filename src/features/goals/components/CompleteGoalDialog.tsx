/**
 * Complete Goal Dialog
 *
 * Modal dialog for completing a goal with criteria display,
 * metrics preview, and confirmation.
 */

import { useState } from 'react';

import { CheckCircleOutlined, TrophyOutlined, FireOutlined } from '@ant-design/icons';
import { Modal, Button, Space, Divider, Alert, Progress, Typography } from 'antd';

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
          message="Ready to Complete"
          description="All completion criteria have been met."
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
            message="Override Required"
            description="The goal does not meet all completion criteria. You can still complete it with an override."
            type="warning"
            showIcon
          />
          <div style={{ marginTop: 16 }}>
            <Text>Reason for override (optional):</Text>
            <textarea
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder="Explain why this goal is being marked complete..."
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
        <Alert message="Criteria Not Met" description={summary} type="error" showIcon />
        <div style={{ marginTop: 16 }}>
          <Button type="link" onClick={() => setShowOverride(true)}>
            Override and complete anyway
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
              Current: {goal.currentValue} / {goal.targetValue} {goal.unit}
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
                Milestones: {completed} / {goal.milestones.length} completed
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
              message={isPartial ? 'Partial Completion' : 'Completion'}
              description={
                isPartial
                  ? `This ${goal.type} goal will remain active after marking this completion. The goal tracks ongoing progress.`
                  : 'This will mark the goal as fully completed.'
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
      <Text strong>Celebration Style:</Text>
      <Space style={{ marginTop: 8 }}>
        <Button
          type={selectedCelebration === 'subtle' ? 'primary' : 'default'}
          onClick={() => setSelectedCelebration('subtle')}
          size="small"
        >
          Subtle
        </Button>
        <Button
          type={selectedCelebration === 'moderate' ? 'primary' : 'default'}
          onClick={() => setSelectedCelebration('moderate')}
          size="small"
        >
          <TrophyOutlined /> Moderate
        </Button>
        <Button
          type={selectedCelebration === 'enthusiastic' ? 'primary' : 'default'}
          onClick={() => setSelectedCelebration('enthusiastic')}
          size="small"
        >
          <FireOutlined /> Enthusiastic
        </Button>
      </Space>
    </div>
  );

  const getCompletionTitle = () => {
    if (isPartial) {
      return `Mark ${goal.type} Complete`;
    }
    return 'Complete Goal';
  };

  return (
    <Modal
      title={getCompletionTitle()}
      open={open}
      onCancel={onClose}
      width={500}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>,
        <Button key="complete" type="primary" onClick={handleComplete} loading={isLoading} disabled={!canComplete}>
          {isPartial ? 'Mark Complete' : 'Complete Goal'}
        </Button>,
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <div>
          <Title level={5} style={{ marginBottom: 8 }}>
            {goal.title}
          </Title>
          <Text type="secondary">Goal will be marked as {isPartial ? "'active' (partial)" : "'completed'"}</Text>
        </div>

        <Divider style={{ margin: '12px 0' }} />

        {renderCriteriaStatus()}

        {renderGoalTypeSpecificContent()}

        {isFullCompletion && renderCelebrationSelector()}

        {isEligible && (
          <Alert
            message="Ready!"
            description="This goal is ready to be completed. Click the button below to finish."
            type="success"
            showIcon
          />
        )}
      </Space>
    </Modal>
  );
}
