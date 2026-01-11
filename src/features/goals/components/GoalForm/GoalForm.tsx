/**
 * GoalForm Component
 *
 * Form for creating goals. Supports quantitative, qualitative, and binary goal types.
 * Uses Ant Design Form with Zod validation.
 */

import React, { useEffect } from 'react';

import { Form, Input, Select, DatePicker, InputNumber, Switch, Button, Space, Row, Col } from 'antd';
import type { FormInstance } from 'antd';
import dayjs from 'dayjs';

import type { CreateGoalInput } from '@/features/goals/types';
import { GoalType, GoalStatus, Priority, QualitativeStatus } from '@/features/goals/types';
import { CreateGoalInputSchema, applyZodErrorsToForm } from '@/features/goals/utils/validation';

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
        currentValue:
          (values.currentValue as number | undefined) ?? (values.startValue as number | undefined) ?? 0,
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
        qualitativeStatus:
          (values.qualitativeStatus as QualitativeStatus | undefined) ?? QualitativeStatus.NOT_STARTED,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        selfAssessments: (values.selfAssessments as unknown[] | undefined) ?? [],
      }),
    } as CreateGoalInput;

    return formData;
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      // Transform form values to CreateGoalInput
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formData = transformFormValues(values as Record<string, unknown>);

      // Validate with Zod (this will ensure progress is not included)
      const validated = CreateGoalInputSchema.parse(formData);

      // Type assertion needed because Zod validation ensures correct type
      await onSubmit(validated as CreateGoalInput);
    } catch (error) {
      // Handle Zod validation errors
      if (error && typeof error === 'object' && 'errors' in error && 'issues' in error) {
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
      onFinish={async (values) => {
        await handleSubmit(values);
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
          <Form.Item name="type" label="Goal Type" rules={[{ required: true, message: 'Goal type is required' }]}>
            <Select placeholder="Select goal type">
              <Option value={GoalType.QUANTITATIVE}>Quantitative</Option>
              <Option value={GoalType.QUALITATIVE}>Qualitative</Option>
              <Option value={GoalType.BINARY}>Binary</Option>
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
    </Form>
  );
};
