/**
 * UpdateProgressModal Component
 *
 * Modal dialog for updating goal progress.
 * Provides type-specific forms for different goal types:
 * - Quantitative: Update currentValue
 * - Binary: Check/uncheck items or update currentCount
 * - Qualitative: Update status
 * - Milestone: Complete individual milestones
 * - Recurring: Mark occurrences as completed/missed
 * - Habit: Mark daily entries as completed
 *
 * Architecture:
 * - Uses Ant Design Modal and Form
 * - Type-specific form fields based on goal type
 * - Automatic progress calculation
 * - Progress history entry creation
 */

import React, { useEffect } from 'react';

import { Modal, Form, InputNumber, Select, Input, Button, Space, Checkbox, DatePicker, Radio, message } from 'antd';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import type { UpdateProgressInput } from '@/features/goals/hooks/useUpdateProgress';
import {
  type Goal,
  type MilestoneGoal,
  type RecurringGoal,
  type HabitGoal,
  isQuantitativeGoal,
  isBinaryGoal,
  isQualitativeGoal,
  isMilestoneGoal,
  isRecurringGoal,
  isHabitGoal,
  QualitativeStatus,
} from '@/features/goals/types';
import { calculateProgress } from '@/features/goals/utils/calculateProgress';
import { canCompleteMilestone, getUnmetDependencies } from '@/features/goals/utils/progressValidation';

const { TextArea } = Input;
const { Option } = Select;

export interface UpdateProgressModalProps {
  /**
   * Whether the modal is open
   */
  open: boolean;

  /**
   * The goal to update progress for
   */
  goal: Goal;

  /**
   * Callback when modal is cancelled
   */
  onCancel: () => void;

  /**
   * Callback when form is submitted
   */
  onSubmit: (input: UpdateProgressInput) => void | Promise<void>;

  /**
   * Loading state
   */
  loading?: boolean;
}

/**
 * UpdateProgressModal Component
 */
export const UpdateProgressModal: React.FC<UpdateProgressModalProps> = ({
  open,
  goal,
  onCancel,
  onSubmit,
  loading = false,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<{
    currentValue?: number;
    currentCount?: number;
    qualitativeStatus?: QualitativeStatus;
    checkedItems?: string[];
    note?: string;
    milestoneId?: string;
    milestoneCompleted?: boolean;
    occurrenceId?: string;
    occurrenceStatus?: 'pending' | 'completed' | 'missed';
    habitDate?: Date;
    habitCompleted?: boolean;
  }>();

  // Reset form when modal opens or goal changes
  useEffect(() => {
    if (open && goal) {
      if (isQuantitativeGoal(goal)) {
        form.setFieldsValue({
          currentValue: goal.currentValue,
          note: '',
        });
      } else if (isBinaryGoal(goal)) {
        form.setFieldsValue({
          currentCount: goal.currentCount,
          checkedItems: goal.items?.slice(0, goal.currentCount) || [],
          note: '',
        });
      } else if (isQualitativeGoal(goal)) {
        form.setFieldsValue({
          qualitativeStatus: goal.qualitativeStatus,
          note: '',
        });
      } else if (isMilestoneGoal(goal)) {
        form.setFieldsValue({
          milestoneId: undefined,
          milestoneCompleted: false,
          note: '',
        });
      } else if (isRecurringGoal(goal)) {
        form.setFieldsValue({
          occurrenceId: undefined,
          occurrenceStatus: 'completed',
          note: '',
        });
      } else if (isHabitGoal(goal)) {
        form.setFieldsValue({
          habitDate: dayjs(),
          habitCompleted: true,
          note: '',
        });
      }
    }
  }, [open, goal, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const note = values.note;

      let typeSpecificUpdates: Partial<Goal> = {};

      if (isQuantitativeGoal(goal)) {
        if (values.currentValue === undefined) {
          void message.error(t('updateProgress.currentValueRequired'));
          return;
        }
        typeSpecificUpdates = {
          currentValue: values.currentValue,
        };
      } else if (isBinaryGoal(goal)) {
        if (values.currentCount !== undefined) {
          typeSpecificUpdates = {
            currentCount: values.currentCount,
          };
        } else if (values.checkedItems !== undefined && goal.items) {
          typeSpecificUpdates = {
            currentCount: values.checkedItems.length,
          };
        }
      } else if (isQualitativeGoal(goal)) {
        if (values.qualitativeStatus === undefined) {
          void message.error(t('updateProgress.statusRequired'));
          return;
        }
        typeSpecificUpdates = {
          qualitativeStatus: values.qualitativeStatus,
        };
      } else if (isMilestoneGoal(goal)) {
        if (values.milestoneId === undefined) {
          void message.error(t('updateProgress.selectMilestoneRequired'));
          return;
        }

        if (values.milestoneCompleted) {
          const canComplete = canCompleteMilestone(
            values.milestoneId,
            goal.milestones,
            goal.requireSequentialCompletion
          );
          if (!canComplete.canComplete) {
            void message.error(
              canComplete.reason || t('updateProgress.blocked', { reason: t('updateProgress.dependenciesNotMet') })
            );
            return;
          }
        }

        typeSpecificUpdates = {
          milestones: goal.milestones.map((m) =>
            m.id === values.milestoneId
              ? {
                  ...m,
                  status: values.milestoneCompleted ? 'completed' : 'in_progress',
                  completedDate: values.milestoneCompleted ? new Date() : undefined,
                }
              : m
          ),
        } as Partial<MilestoneGoal>;
      } else if (isRecurringGoal(goal)) {
        if (values.occurrenceId === undefined) {
          void message.error(t('updateProgress.selectOccurrenceRequired'));
          return;
        }
        typeSpecificUpdates = {
          occurrences: goal.occurrences.map((o) =>
            o.id === values.occurrenceId ? { ...o, completed: values.occurrenceStatus === 'completed' } : o
          ),
        } as Partial<RecurringGoal>;
      } else if (isHabitGoal(goal)) {
        const habitDateValue = values.habitDate;
        if (!habitDateValue) {
          void message.error(t('updateProgress.dateRequired'));
          return;
        }
        const date = (habitDateValue as unknown as { toDate?: () => Date })?.toDate?.() ?? habitDateValue;
        typeSpecificUpdates = {
          entries: [
            ...goal.entries,
            {
              id: `temp-${Date.now()}`,
              date: date,
              completed: values.habitCompleted ?? true,
            },
          ],
        } as Partial<HabitGoal>;
      }

      // Calculate progress with updated values
      const updatedGoal = {
        ...goal,
        ...typeSpecificUpdates,
      } as Goal;
      const calculatedProgress = calculateProgress(updatedGoal);

      await onSubmit({
        goalId: goal.id,
        progressValue: calculatedProgress,
        note,
        typeSpecificUpdates,
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const handleFormSubmit = () => {
    void handleSubmit();
  };

  return (
    <Modal
      title={t('updateProgress.title')}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
        {/* Quantitative Goal Form */}
        {isQuantitativeGoal(goal) && (
          <>
            <Form.Item
              label={t('updateProgress.currentValueLabel')}
              name="currentValue"
              rules={[
                { required: true, message: t('updateProgress.currentValueRequired') },
                {
                  type: 'number',
                  min: goal.minValue ?? undefined,
                  max: goal.maxValue ?? undefined,
                  message: t('updateProgress.valueRange', { min: goal.minValue ?? 'N/A', max: goal.maxValue ?? 'N/A' }),
                },
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={goal.minValue}
                max={goal.maxValue}
                precision={goal.allowDecimals ? 2 : 0}
                addonAfter={goal.unit}
                placeholder={t('updateProgress.currentValuePlaceholder', {
                  start: goal.startValue,
                  target: goal.targetValue,
                  unit: goal.unit,
                })}
              />
            </Form.Item>
            <Form.Item label={t('updateProgress.currentProgress')}>
              <div>
                {t('updateProgress.progressFromTo', {
                  start: goal.startValue,
                  target: goal.targetValue,
                  unit: goal.unit,
                })}
              </div>
            </Form.Item>
          </>
        )}

        {/* Binary Goal Form */}
        {isBinaryGoal(goal) && (
          <>
            {goal.items && goal.items.length > 0 ? (
              <Form.Item label={t('updateProgress.checkCompletedItems')} name="checkedItems">
                <Checkbox.Group>
                  <Space direction="vertical">
                    {goal.items.map((item, index) => (
                      <Checkbox key={index} value={item}>
                        {item}
                      </Checkbox>
                    ))}
                  </Space>
                </Checkbox.Group>
              </Form.Item>
            ) : (
              <Form.Item
                label={t('updateProgress.currentCountLabel')}
                name="currentCount"
                rules={[
                  { required: true, message: t('updateProgress.currentCountRequired') },
                  {
                    type: 'number',
                    min: 0,
                    max: goal.targetCount,
                    message: t('updateProgress.countRange', { max: goal.targetCount ?? 'N/A' }),
                  },
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  max={goal.targetCount}
                  precision={0}
                  placeholder={t('updateProgress.currentCountPlaceholder', {
                    range: goal.targetCount ? t('updateProgress.countRangeSuffix', { max: goal.targetCount }) : '',
                  })}
                />
              </Form.Item>
            )}
            {goal.targetCount !== undefined && (
              <Form.Item label={t('updateProgress.progressLabel')}>
                <div>
                  {t('updateProgress.currentToTarget', { current: goal.currentCount, target: goal.targetCount })}
                </div>
              </Form.Item>
            )}
          </>
        )}

        {/* Qualitative Goal Form */}
        {isQualitativeGoal(goal) && (
          <>
            <Form.Item
              label={t('updateProgress.statusLabel')}
              name="qualitativeStatus"
              rules={[{ required: true, message: t('updateProgress.statusRequired') }]}
            >
              <Select placeholder={t('updateProgress.selectStatus')}>
                <Option value={QualitativeStatus.NOT_STARTED}>{t('updateProgress.notStarted')}</Option>
                <Option value={QualitativeStatus.IN_PROGRESS}>{t('updateProgress.inProgress')}</Option>
                <Option value={QualitativeStatus.COMPLETED}>{t('updateProgress.completed')}</Option>
              </Select>
            </Form.Item>
            {goal.selfAssessments && goal.selfAssessments.length > 0 && (
              <Form.Item label={t('updateProgress.previousAssessments')}>
                <div>
                  {goal.selfAssessments.slice(-3).map((assessment, index) => (
                    <div key={index} style={{ marginBottom: 8 }}>
                      {t('updateProgress.rating', { rating: assessment.rating })} -{' '}
                      {new Date(assessment.date).toLocaleDateString()}
                    </div>
                  ))}
                </div>
              </Form.Item>
            )}
          </>
        )}

        {/* Milestone Goal Form */}
        {isMilestoneGoal(goal) && (
          <>
            <Form.Item
              label={t('updateProgress.selectMilestone')}
              name="milestoneId"
              rules={[{ required: true, message: t('updateProgress.selectMilestoneRequired') }]}
            >
              <Select
                placeholder={t('updateProgress.chooseMilestone')}
                onChange={() => {
                  form.setFieldsValue({ milestoneCompleted: false });
                }}
              >
                {goal.milestones
                  .filter((m) => m.status !== 'completed' && m.status !== 'skipped')
                  .map((milestone) => {
                    const canComplete = canCompleteMilestone(
                      milestone.id,
                      goal.milestones,
                      goal.requireSequentialCompletion
                    );
                    const statusText = canComplete.canComplete
                      ? milestone.status
                      : t('updateProgress.blocked', {
                          reason: canComplete.reason?.split(':')[0] || t('updateProgress.dependenciesNotMet'),
                        });
                    return (
                      <Option key={milestone.id} value={milestone.id}>
                        {milestone.title} ({statusText})
                      </Option>
                    );
                  })}
              </Select>
            </Form.Item>
            <Form.Item
              noStyle
              shouldUpdate={(prev: { milestoneId?: string }, curr: { milestoneId?: string }) =>
                prev.milestoneId !== curr.milestoneId
              }
            >
              {({ getFieldValue }) => {
                const selectedId = getFieldValue('milestoneId') as string | undefined;
                if (!selectedId) return null;

                const selectedMilestone = goal.milestones.find((m) => m.id === selectedId);
                if (!selectedMilestone) return null;

                const unmetDeps = getUnmetDependencies(selectedMilestone, goal.milestones);
                if (unmetDeps.length > 0) {
                  const depTitles = unmetDeps
                    .map((id) => goal.milestones.find((m) => m.id === id)?.title || id)
                    .join(', ');
                  return (
                    <Form.Item label={t('updateProgress.dependencies')}>
                      <div style={{ color: '#ff4d4f' }}>
                        {t('updateProgress.cannotCompleteDeps', { titles: depTitles })}
                      </div>
                    </Form.Item>
                  );
                }
                return null;
              }}
            </Form.Item>
            <Form.Item label={t('updateProgress.markAsCompleted')} name="milestoneCompleted" valuePropName="checked">
              <Checkbox>{t('updateProgress.completeThisMilestone')}</Checkbox>
            </Form.Item>
            <Form.Item label={t('updateProgress.progressLabel')}>
              <div>
                {t('updateProgress.milestonesCompleted', {
                  completed: goal.milestones.filter((m) => m.status === 'completed').length,
                  total: goal.milestones.length,
                })}
              </div>
            </Form.Item>
          </>
        )}

        {/* Recurring Goal Form */}
        {isRecurringGoal(goal) && (
          <>
            <Form.Item
              label={t('updateProgress.selectOccurrence')}
              name="occurrenceId"
              rules={[{ required: true, message: t('updateProgress.selectOccurrenceRequired') }]}
            >
              <Select placeholder={t('updateProgress.chooseOccurrence')}>
                {goal.occurrences
                  .filter((o) => {
                    const now = new Date();
                    return new Date(o.date) <= now;
                  })
                  .slice(-10)
                  .map((occurrence) => (
                    <Option key={occurrence.id} value={occurrence.id}>
                      {new Date(occurrence.date).toLocaleDateString()} -{' '}
                      {occurrence.completed ? t('updateProgress.completed') : t('updateProgress.pending')}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
            <Form.Item
              label={t('updateProgress.statusLabel')}
              name="occurrenceStatus"
              rules={[{ required: true, message: t('updateProgress.statusRequired') }]}
            >
              <Radio.Group>
                <Radio value="completed">{t('updateProgress.completed')}</Radio>
                <Radio value="missed">{t('updateProgress.missed')}</Radio>
                <Radio value="pending">{t('updateProgress.pending')}</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item label={t('updateProgress.currentProgress')}>
              <div>{t('updateProgress.completionRate', { rate: Math.round(goal.completionStats.completionRate) })}</div>
            </Form.Item>
          </>
        )}

        {/* Habit Goal Form */}
        {isHabitGoal(goal) && (
          <>
            <Form.Item
              label={t('updateProgress.dateLabel')}
              name="habitDate"
              rules={[{ required: true, message: t('updateProgress.dateRequired') }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label={t('updateProgress.completionStatus')} name="habitCompleted" valuePropName="checked">
              <Checkbox>{t('updateProgress.markAsCompletedLabel')}</Checkbox>
            </Form.Item>
            <Form.Item label={t('updateProgress.currentStreak')}>
              <div>{t('updateProgress.currentStreakDays', { count: goal.completionStats.streak.current })}</div>
              <div>{t('updateProgress.longestStreakDays', { count: goal.completionStats.streak.longest })}</div>
            </Form.Item>
            <Form.Item label={t('updateProgress.completionRate')}>
              <div>{Math.round(goal.completionStats.completionRate)}%</div>
            </Form.Item>
          </>
        )}

        {/* Note Field (for all types) */}
        <Form.Item label={t('updateProgress.noteOptional')} name="note">
          <TextArea rows={3} placeholder={t('updateProgress.notePlaceholder')} />
        </Form.Item>

        {/* Form Actions */}
        <Form.Item>
          <Space>
            <Button onClick={handleCancel}>{t('updateProgress.cancel')}</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {t('updateProgress.updateProgress')}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};
