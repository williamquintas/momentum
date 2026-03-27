/**
 * GoalForm Component
 *
 * Form for creating goals. Supports quantitative, qualitative, and binary goal types.
 * Uses Ant Design Form with Zod validation.
 */

import React, { useEffect, useState } from 'react';

import { InfoCircleOutlined } from '@ant-design/icons';
import { Form, Input, Select, DatePicker, InputNumber, Switch, Button, Space, Row, Col, Tooltip, Modal } from 'antd';
import type { FormInstance } from 'antd';
import dayjs from 'dayjs';

import type { CreateGoalInput } from '@/features/goals/types';
import { GoalType, GoalStatus, Priority, QualitativeStatus } from '@/features/goals/types';
import { goalTypeTooltips } from '@/features/goals/utils/goalTypeTooltips';
import { CreateGoalInputSchema, applyZodErrorsToForm } from '@/features/goals/utils/validation';
import { getAvailableGoalTypes } from '@/utils/featureFlags';

import { MilestoneGoalFields, RecurringGoalFields, HabitGoalFields } from './index';

const { TextArea } = Input;
const { Option } = Select;

export interface GoalFormProps {
  /**
   * Initial form values (for editing)
   */
  initialValues?: Partial<CreateGoalInput>;

  /**
   * Callback when form is submitted
   */
  onSubmit: (values: CreateGoalInput) => void | Promise<void>;

  /**
   * Callback when form is cancelled
   */
  onCancel?: () => void;

  /**
   * Loading state
   */
  loading?: boolean;

  /**
   * Form instance (optional, for external control)
   */
  form?: FormInstance<CreateGoalInput>;
}

/**
 * GoalForm Component
 */
export const GoalForm: React.FC<GoalFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  loading = false,
  form: externalForm,
}) => {
  const [form] = Form.useForm<CreateGoalInput>(externalForm);
  const goalType = Form.useWatch('type', form);
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  // Get available goal types based on feature flags
  const availableGoalTypes = getAvailableGoalTypes(Object.values(GoalType));

  // Set default values
  useEffect(() => {
    if (initialValues) {
      const { progressHistory: _progressHistory, ...restValues } = initialValues;
      form.setFieldsValue({
        ...restValues,
        startDate: initialValues.startDate ? dayjs(initialValues.startDate) : undefined,
        deadline: initialValues.deadline ? dayjs(initialValues.deadline) : undefined,
      } as Parameters<typeof form.setFieldsValue>[0]);
    } else {
      // Set defaults for new goal
      form.setFieldsValue({
        status: GoalStatus.ACTIVE,
        priority: Priority.MEDIUM,
        tags: [],
        relatedGoals: [],
        archived: false,
        favorite: false,
        category: '',
        milestones: [{ title: '', status: 'pending', order: 0, dependencies: [] }],
      });
    }
  }, [form, initialValues]);

  // Transform form values to CreateGoalInput
  // Note: Form values may include dayjs objects for dates
  const transformFormValues = (values: Record<string, unknown>): CreateGoalInput => {
    // Remove fields that shouldn't be in CreateGoalInput (progress, id, createdAt, updatedAt, etc.)
    const {
      progress: _progress,
      id: _id,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      progressHistory: _progressHistory,
      notes: _notes,
      attachments: _attachments,
      ...valuesWithoutExcluded
    } = values;

    // Helper to convert dayjs to Date
    const toDate = (value: unknown): Date | undefined => {
      if (!value) return undefined;
      if (value instanceof Date) return value;
      if (typeof value === 'object' && value !== null && 'toDate' in value) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        return (value as { toDate: () => Date }).toDate();
      }
      return undefined;
    };

    const formData: CreateGoalInput = {
      ...valuesWithoutExcluded,
      startDate: toDate(values.startDate),
      deadline: toDate(values.deadline),
      // Type-specific defaults
      ...(values.type === GoalType.QUANTITATIVE && {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        currentValue: (values.currentValue as number | undefined) ?? (values.startValue as number | undefined) ?? 0,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        allowDecimals: (values.allowDecimals as boolean | undefined) ?? false,
      }),
      ...(values.type === GoalType.BINARY && {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        currentCount: (values.currentCount as number | undefined) ?? 0,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        allowPartialCompletion: (values.allowPartialCompletion as boolean | undefined) ?? true,
      }),
      ...(values.type === GoalType.QUALITATIVE && {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        qualitativeStatus: (values.qualitativeStatus as QualitativeStatus | undefined) ?? QualitativeStatus.NOT_STARTED,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        selfAssessments: (values.selfAssessments as unknown[] | undefined) ?? [],
      }),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      ...(values.type === GoalType.MILESTONE && {
        milestones: ((values.milestones as unknown[] | undefined) ?? []).map((m: unknown, idx: number) => ({
          ...(m as Record<string, unknown>),
          id: ((m as Record<string, unknown>)?.id as string) || crypto.randomUUID(),
          status: ((m as Record<string, unknown>)?.status as string) || 'pending',
          order: ((m as Record<string, unknown>)?.order as number) ?? idx,
          dependencies: ((m as Record<string, unknown>)?.dependencies as string[] | undefined) ?? [],
        })),
        allowMilestoneReordering: (values.allowMilestoneReordering as boolean | undefined) ?? false,
        requireSequentialCompletion: (values.requireSequentialCompletion as boolean | undefined) ?? false,
      }),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      ...(values.type === GoalType.RECURRING && {
        recurrence: (values.recurrence as Record<string, unknown> | undefined) ?? {
          frequency: 'daily',
          interval: 1,
        },
        completionStats: {
          totalOccurrences:
            ((values.completionStats as Record<string, unknown>)?.totalOccurrences as number | undefined) ?? 0,
          completedOccurrences:
            ((values.completionStats as Record<string, unknown>)?.completedOccurrences as number | undefined) ?? 0,
          completionRate:
            ((values.completionStats as Record<string, unknown>)?.completionRate as number | undefined) ?? 0,
          streak: {
            current:
              ((values.completionStats as Record<string, unknown>)?.streak as Record<string, number> | undefined)
                ?.current ?? 0,
            longest:
              ((values.completionStats as Record<string, unknown>)?.streak as Record<string, number> | undefined)
                ?.longest ?? 0,
          },
        },
      }),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      ...(values.type === GoalType.HABIT && {
        targetFrequency: (values.targetFrequency as string | undefined) ?? 'daily',
        customFrequency: values.customFrequency as number | undefined,
        completionStats: {
          totalOccurrences:
            ((values.completionStats as Record<string, unknown>)?.totalOccurrences as number | undefined) ?? 0,
          completedOccurrences:
            ((values.completionStats as Record<string, unknown>)?.completedOccurrences as number | undefined) ?? 0,
          completionRate:
            ((values.completionStats as Record<string, unknown>)?.completionRate as number | undefined) ?? 0,
          streak: {
            current:
              ((values.completionStats as Record<string, unknown>)?.streak as Record<string, number> | undefined)
                ?.current ?? 0,
            longest:
              ((values.completionStats as Record<string, unknown>)?.streak as Record<string, number> | undefined)
                ?.longest ?? 0,
          },
        },
        entries: [],
        habitStrength: 50,
      }),
    } as CreateGoalInput;

    return formData;
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      // Transform form values to CreateGoalInput
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formData = transformFormValues(values);

      // Validate with Zod (this will ensure progress is not included)
      const validated = CreateGoalInputSchema.parse(formData);

      // Type assertion needed because Zod validation ensures correct type
      await onSubmit(validated as CreateGoalInput);
    } catch (error) {
      // Handle Zod validation errors
      if (error && typeof error === 'object' && 'issues' in error) {
        // Type guard for ZodError
        applyZodErrorsToForm(form, error as Parameters<typeof applyZodErrorsToForm>[1]);
        return; // Don't re-throw validation errors
      }
      // Re-throw other errors so they can be handled by parent components
      throw error;
    }
  };

  const handleFinishFailed = (errorInfo: { errorFields: Array<{ name: (string | number)[]; errors: string[] }> }) => {
    console.error('Form validation failed:', errorInfo);
    // Ant Design will automatically display field-level errors
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={(values) => {
        void handleSubmit(values);
      }}
      onFinishFailed={handleFinishFailed}
      initialValues={{
        status: GoalStatus.ACTIVE,
        priority: Priority.MEDIUM,
        tags: [],
      }}
    >
      {/* Common Fields */}
      <Form.Item
        name="title"
        label="Title"
        rules={[
          { required: true, message: 'Title is required' },
          { max: 200, message: 'Title must be 200 characters or less' },
        ]}
      >
        <Input placeholder="Enter goal title" />
      </Form.Item>

      <Form.Item
        name="description"
        label="Description"
        rules={[{ max: 5000, message: 'Description must be 5000 characters or less' }]}
      >
        <TextArea rows={4} placeholder="Enter goal description (optional)" />
      </Form.Item>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="type"
            label={
              <span>
                Goal Type{' '}
                <Tooltip title="Click for help choosing the right goal type" trigger="click">
                  <InfoCircleOutlined
                    style={{ cursor: 'pointer', color: '#8c8c8c' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setHelpModalOpen(true);
                    }}
                  />
                </Tooltip>
              </span>
            }
            rules={[{ required: true, message: 'Goal type is required' }]}
          >
            <Select placeholder="Select goal type">
              {availableGoalTypes.includes(GoalType.QUANTITATIVE) && (
                <Option value={GoalType.QUANTITATIVE}>
                  <Tooltip
                    title={`${goalTypeTooltips[GoalType.QUANTITATIVE].description} ${goalTypeTooltips[GoalType.QUANTITATIVE].example}`}
                  >
                    Quantitative
                  </Tooltip>
                </Option>
              )}
              {availableGoalTypes.includes(GoalType.QUALITATIVE) && (
                <Option value={GoalType.QUALITATIVE}>
                  <Tooltip
                    title={`${goalTypeTooltips[GoalType.QUALITATIVE].description} ${goalTypeTooltips[GoalType.QUALITATIVE].example}`}
                  >
                    Qualitative
                  </Tooltip>
                </Option>
              )}
              {availableGoalTypes.includes(GoalType.BINARY) && (
                <Option value={GoalType.BINARY}>
                  <Tooltip
                    title={`${goalTypeTooltips[GoalType.BINARY].description} ${goalTypeTooltips[GoalType.BINARY].example}`}
                  >
                    Binary
                  </Tooltip>
                </Option>
              )}
              {availableGoalTypes.includes(GoalType.MILESTONE) && (
                <Option value={GoalType.MILESTONE}>
                  <Tooltip
                    title={`${goalTypeTooltips[GoalType.MILESTONE].description} ${goalTypeTooltips[GoalType.MILESTONE].example}`}
                  >
                    Milestone
                  </Tooltip>
                </Option>
              )}
              {availableGoalTypes.includes(GoalType.RECURRING) && (
                <Option value={GoalType.RECURRING}>
                  <Tooltip
                    title={`${goalTypeTooltips[GoalType.RECURRING].description} ${goalTypeTooltips[GoalType.RECURRING].example}`}
                  >
                    Recurring
                  </Tooltip>
                </Option>
              )}
              {availableGoalTypes.includes(GoalType.HABIT) && (
                <Option value={GoalType.HABIT}>
                  <Tooltip
                    title={`${goalTypeTooltips[GoalType.HABIT].description} ${goalTypeTooltips[GoalType.HABIT].example}`}
                  >
                    Habit
                  </Tooltip>
                </Option>
              )}
            </Select>
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Status is required' }]}>
            <Select placeholder="Select status">
              <Option value={GoalStatus.ACTIVE}>Active</Option>
              <Option value={GoalStatus.PAUSED}>Paused</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item name="priority" label="Priority" rules={[{ required: true, message: 'Priority is required' }]}>
            <Select placeholder="Select priority">
              <Option value={Priority.HIGH}>High</Option>
              <Option value={Priority.MEDIUM}>Medium</Option>
              <Option value={Priority.LOW}>Low</Option>
            </Select>
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item
            name="category"
            label="Category"
            rules={[
              { required: true, message: 'Category is required' },
              { max: 100, message: 'Category must be 100 characters or less' },
            ]}
          >
            <Input placeholder="Enter category" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item name="startDate" label="Start Date">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item name="deadline" label="Deadline">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      {/* Type-Specific Fields */}
      {goalType === GoalType.QUANTITATIVE && (
        <>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="startValue"
                label="Start Value"
                rules={[{ required: true, message: 'Start value is required' }]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="Start value" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item
                name="targetValue"
                label="Target Value"
                rules={[{ required: true, message: 'Target value is required' }]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="Target value" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item
                name="currentValue"
                label="Current Value"
                rules={[{ required: true, message: 'Current value is required' }]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="Current value" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="unit"
                label="Unit"
                rules={[
                  { required: true, message: 'Unit is required' },
                  { max: 20, message: 'Unit must be 20 characters or less' },
                ]}
              >
                <Input placeholder="e.g., kg, miles, hours" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item name="allowDecimals" valuePropName="checked" label="Allow Decimals">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </>
      )}

      {goalType === GoalType.BINARY && (
        <>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="targetCount" label="Target Count (optional)">
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  placeholder="Target count (leave empty for simple binary)"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="currentCount"
                label="Current Count"
                rules={[{ required: true, message: 'Current count is required' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} placeholder="Current count" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="allowPartialCompletion" valuePropName="checked" label="Allow Partial Completion">
            <Switch defaultChecked />
          </Form.Item>
        </>
      )}

      {goalType === GoalType.QUALITATIVE && (
        <>
          <Form.Item
            name="qualitativeStatus"
            label="Status"
            rules={[{ required: true, message: 'Status is required' }]}
          >
            <Select placeholder="Select status">
              <Option value={QualitativeStatus.NOT_STARTED}>Not Started</Option>
              <Option value={QualitativeStatus.IN_PROGRESS}>In Progress</Option>
              <Option value={QualitativeStatus.COMPLETED}>Completed</Option>
            </Select>
          </Form.Item>

          <Form.Item name="targetRating" label="Target Rating (1-10, optional)">
            <InputNumber style={{ width: '100%' }} min={1} max={10} placeholder="Target rating" />
          </Form.Item>
        </>
      )}

      {goalType === GoalType.MILESTONE && <MilestoneGoalFields />}

      {goalType === GoalType.RECURRING && <RecurringGoalFields />}

      {goalType === GoalType.HABIT && <HabitGoalFields />}

      {/* Hidden fields with defaults */}
      <Form.Item name="progress" hidden>
        <InputNumber />
      </Form.Item>

      <Form.Item name="tags" hidden>
        <Input />
      </Form.Item>

      <Form.Item name="relatedGoals" hidden>
        <Input />
      </Form.Item>

      <Form.Item name="archived" hidden>
        <Input />
      </Form.Item>

      <Form.Item name="favorite" hidden>
        <Input />
      </Form.Item>

      {/* Form Actions */}
      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {initialValues ? 'Update Goal' : 'Create Goal'}
          </Button>
          {onCancel && (
            <Button onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
          )}
        </Space>
      </Form.Item>

      {/* Goal Type Help Modal */}
      <Modal
        title="Goal Types Explained"
        open={helpModalOpen}
        onCancel={() => setHelpModalOpen(false)}
        footer={null}
        width={600}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {Object.values(GoalType).map((type) => {
            const data = goalTypeTooltips[type];
            if (!data || !availableGoalTypes.includes(type)) return null;
            return (
              <div
                key={type}
                style={{
                  padding: 12,
                  borderRadius: 8,
                  border: '1px solid',
                  borderColor: 'var(--ant-color-border)',
                  background: 'var(--ant-color-fill-quaternary)',
                }}
              >
                <strong style={{ color: 'var(--ant-color-text)' }}>{data.label}</strong>
                <p style={{ margin: '4px 0 0', color: 'var(--ant-color-text-secondary)' }}>{data.description}</p>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--ant-color-text-tertiary)' }}>
                  {data.example}
                </p>
              </div>
            );
          })}
        </div>
      </Modal>
    </Form>
  );
};
