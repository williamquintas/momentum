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
          habitDate: new Date(),
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
          void message.error('Current value is required');
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
          void message.error('Status is required');
          return;
        }
        typeSpecificUpdates = {
          qualitativeStatus: values.qualitativeStatus,
        };
      } else if (isMilestoneGoal(goal)) {
        if (values.milestoneId === undefined) {
          void message.error('Please select a milestone');
          return;
        }

        if (values.milestoneCompleted) {
          const canComplete = canCompleteMilestone(
            values.milestoneId,
            goal.milestones,
            goal.requireSequentialCompletion
          );
          if (!canComplete.canComplete) {
            void message.error(canComplete.reason || 'Cannot complete milestone');
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
          void message.error('Please select an occurrence');
          return;
        }
        typeSpecificUpdates = {
          occurrences: goal.occurrences.map((o) =>
            o.id === values.occurrenceId ? { ...o, completed: values.occurrenceStatus === 'completed' } : o
          ),
        } as Partial<RecurringGoal>;
      } else if (isHabitGoal(goal)) {
        if (!values.habitDate) {
          void message.error('Please select a date');
          return;
        }
        typeSpecificUpdates = {
          entries: [
            ...goal.entries,
            {
              id: `temp-${Date.now()}`,
              date: values.habitDate,
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
    <Modal title="Update Progress" open={open} onCancel={handleCancel} footer={null} width={600} destroyOnClose>
      <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
        {/* Quantitative Goal Form */}
        {isQuantitativeGoal(goal) && (
          <>
            <Form.Item
              label="Current Value"
              name="currentValue"
              rules={[
                { required: true, message: 'Current value is required' },
                {
                  type: 'number',
                  min: goal.minValue ?? undefined,
                  max: goal.maxValue ?? undefined,
                  message: `Value must be between ${goal.minValue ?? 'N/A'} and ${goal.maxValue ?? 'N/A'}`,
                },
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={goal.minValue}
                max={goal.maxValue}
                precision={goal.allowDecimals ? 2 : 0}
                addonAfter={goal.unit}
                placeholder={`Enter current value (${goal.startValue} - ${goal.targetValue} ${goal.unit})`}
              />
            </Form.Item>
            <Form.Item label="Current Progress">
              <div>
                Start: {goal.startValue} {goal.unit} → Target: {goal.targetValue} {goal.unit}
              </div>
            </Form.Item>
          </>
        )}

        {/* Binary Goal Form */}
        {isBinaryGoal(goal) && (
          <>
            {goal.items && goal.items.length > 0 ? (
              <Form.Item label="Check Completed Items" name="checkedItems">
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
                label="Current Count"
                name="currentCount"
                rules={[
                  { required: true, message: 'Current count is required' },
                  {
                    type: 'number',
                    min: 0,
                    max: goal.targetCount,
                    message: `Count must be between 0 and ${goal.targetCount ?? 'N/A'}`,
                  },
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  max={goal.targetCount}
                  precision={0}
                  placeholder={`Enter current count${goal.targetCount ? ` (0 - ${goal.targetCount})` : ''}`}
                />
              </Form.Item>
            )}
            {goal.targetCount !== undefined && (
              <Form.Item label="Progress">
                <div>
                  Current: {goal.currentCount} / Target: {goal.targetCount}
                </div>
              </Form.Item>
            )}
          </>
        )}

        {/* Qualitative Goal Form */}
        {isQualitativeGoal(goal) && (
          <>
            <Form.Item
              label="Status"
              name="qualitativeStatus"
              rules={[{ required: true, message: 'Status is required' }]}
            >
              <Select placeholder="Select status">
                <Option value={QualitativeStatus.NOT_STARTED}>Not Started</Option>
                <Option value={QualitativeStatus.IN_PROGRESS}>In Progress</Option>
                <Option value={QualitativeStatus.COMPLETED}>Completed</Option>
              </Select>
            </Form.Item>
            {goal.selfAssessments && goal.selfAssessments.length > 0 && (
              <Form.Item label="Previous Assessments">
                <div>
                  {goal.selfAssessments.slice(-3).map((assessment, index) => (
                    <div key={index} style={{ marginBottom: 8 }}>
                      Rating: {assessment.rating}/10 - {new Date(assessment.date).toLocaleDateString()}
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
              label="Select Milestone"
              name="milestoneId"
              rules={[{ required: true, message: 'Please select a milestone' }]}
            >
              <Select
                placeholder="Choose a milestone to update"
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
                      : `Blocked: ${canComplete.reason?.split(':')[0] || 'Dependencies not met'}`;
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
                    <Form.Item label="Dependencies">
                      <div style={{ color: '#ff4d4f' }}>
                        Cannot complete: Complete these milestones first: {depTitles}
                      </div>
                    </Form.Item>
                  );
                }
                return null;
              }}
            </Form.Item>
            <Form.Item label="Mark as Completed" name="milestoneCompleted" valuePropName="checked">
              <Checkbox>Complete this milestone</Checkbox>
            </Form.Item>
            <Form.Item label="Progress">
              <div>
                {goal.milestones.filter((m) => m.status === 'completed').length} / {goal.milestones.length} milestones
                completed
              </div>
            </Form.Item>
          </>
        )}

        {/* Recurring Goal Form */}
        {isRecurringGoal(goal) && (
          <>
            <Form.Item
              label="Select Occurrence"
              name="occurrenceId"
              rules={[{ required: true, message: 'Please select an occurrence' }]}
            >
              <Select placeholder="Choose an occurrence to update">
                {goal.occurrences
                  .filter((o) => {
                    const now = new Date();
                    return new Date(o.date) <= now;
                  })
                  .slice(-10)
                  .map((occurrence) => (
                    <Option key={occurrence.id} value={occurrence.id}>
                      {new Date(occurrence.date).toLocaleDateString()} -{' '}
                      {occurrence.completed ? 'Completed' : 'Pending'}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="Status"
              name="occurrenceStatus"
              rules={[{ required: true, message: 'Status is required' }]}
            >
              <Radio.Group>
                <Radio value="completed">Completed</Radio>
                <Radio value="missed">Missed</Radio>
                <Radio value="pending">Pending</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item label="Current Progress">
              <div>Completion Rate: {Math.round(goal.completionStats.completionRate)}%</div>
            </Form.Item>
          </>
        )}

        {/* Habit Goal Form */}
        {isHabitGoal(goal) && (
          <>
            <Form.Item label="Date" name="habitDate" rules={[{ required: true, message: 'Please select a date' }]}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="Completion Status" name="habitCompleted" valuePropName="checked">
              <Checkbox>Mark as completed</Checkbox>
            </Form.Item>
            <Form.Item label="Current Streak">
              <div>Current streak: {goal.completionStats.streak.current} days</div>
              <div>Longest streak: {goal.completionStats.streak.longest} days</div>
            </Form.Item>
            <Form.Item label="Completion Rate">
              <div>{Math.round(goal.completionStats.completionRate)}%</div>
            </Form.Item>
          </>
        )}

        {/* Note Field (for all types) */}
        <Form.Item label="Note (Optional)" name="note">
          <TextArea rows={3} placeholder="Add a note about this progress update..." />
        </Form.Item>

        {/* Form Actions */}
        <Form.Item>
          <Space>
            <Button onClick={handleCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Update Progress
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};
