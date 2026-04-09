/**
 * QuickProgressModal Component
 *
 * Compact modal for quick progress updates from the list view.
 * Simplified version of UpdateProgressModal focused on quick value input.
 */

import React, { useEffect } from 'react';

import { Modal, Form, InputNumber, Button, Space, message } from 'antd';
import { useTranslation } from 'react-i18next';

import type { UpdateProgressInput } from '@/features/goals/hooks/useUpdateProgress';
import { type Goal, isQuantitativeGoal, isBinaryGoal, isQualitativeGoal } from '@/features/goals/types';
import { calculateProgress } from '@/features/goals/utils/calculateProgress';

export interface QuickProgressModalProps {
  open: boolean;
  goal: Goal;
  onCancel: () => void;
  onSubmit: (input: UpdateProgressInput) => void | Promise<void>;
  loading?: boolean;
}

export const QuickProgressModal: React.FC<QuickProgressModalProps> = ({
  open,
  goal,
  onCancel,
  onSubmit,
  loading = false,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<{ currentValue?: number; currentCount?: number }>();

  useEffect(() => {
    if (open && goal) {
      if (isQuantitativeGoal(goal)) {
        form.setFieldsValue({ currentValue: goal.currentValue });
      } else if (isBinaryGoal(goal)) {
        form.setFieldsValue({ currentCount: goal.currentCount });
      }
    }
  }, [open, goal, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      let typeSpecificUpdates: Partial<Goal> = {};

      if (isQuantitativeGoal(goal)) {
        if (values.currentValue === undefined) {
          void message.error(t('updateProgress.currentValueRequired'));
          return;
        }
        typeSpecificUpdates = { currentValue: values.currentValue };
      } else if (isBinaryGoal(goal)) {
        if (values.currentCount !== undefined) {
          typeSpecificUpdates = { currentCount: values.currentCount };
        }
      } else if (isQualitativeGoal(goal)) {
        void message.error(t('updateProgress.qualitativeRequiresDetail'));
        return;
      }

      const updatedGoal = { ...goal, ...typeSpecificUpdates } as Goal;
      const calculatedProgress = calculateProgress(updatedGoal);

      await onSubmit({
        goalId: goal.id,
        progressValue: calculatedProgress,
        typeSpecificUpdates,
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleFormSubmit = () => {
    void handleSubmit();
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={t('quickProgressModal.title')}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={400}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
        {isQuantitativeGoal(goal) && (
          <Form.Item
            label={t('updateProgress.currentValueLabel')}
            name="currentValue"
            rules={[
              { required: true, message: t('updateProgress.currentValueRequired') },
              {
                type: 'number',
                min: goal.minValue ?? 0,
                max: goal.maxValue ?? undefined,
              },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={goal.minValue}
              max={goal.maxValue}
              precision={goal.allowDecimals ? 2 : 0}
              addonAfter={goal.unit}
            />
          </Form.Item>
        )}

        {isBinaryGoal(goal) && goal.targetCount !== undefined && (
          <Form.Item
            label={t('updateProgress.currentCountLabel')}
            name="currentCount"
            rules={[
              { required: true, message: t('updateProgress.currentCountRequired') },
              { type: 'number', min: 0, max: goal.targetCount },
            ]}
          >
            <InputNumber style={{ width: '100%' }} min={0} max={goal.targetCount} />
          </Form.Item>
        )}

        {isBinaryGoal(goal) && goal.targetCount === undefined && (
          <Form.Item
            label={t('updateProgress.currentCountLabel')}
            name="currentCount"
            rules={[{ required: true, message: t('updateProgress.currentCountRequired') }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        )}

        {(!isQuantitativeGoal(goal) || !isBinaryGoal(goal)) && !isQualitativeGoal(goal) && (
          <Form.Item label={t('quickProgressModal.complexGoal')}>
            <div style={{ color: '#8c8c8c', fontSize: 12 }}>{t('quickProgressModal.useDetailPage')}</div>
          </Form.Item>
        )}

        <Form.Item>
          <Space>
            <Button onClick={handleCancel}>{t('updateProgress.cancel')}</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {t('quickProgressModal.save')}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};
