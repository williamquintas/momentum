/**
 * CreateGoalForm Component
 *
 * Main form component for creating new goals. Supports all 6 goal types with
 * conditional rendering of type-specific fields.
 */

import React from 'react';

import { Form, Input, Select, Button, Space, Row, Col, DatePicker, FormInstance } from 'antd';
import dayjs from 'dayjs';

import type { CreateGoalInput } from '@/features/goals/types';
import {
  GoalType as GoalTypeEnum,
  Priority as PriorityEnum,
  GoalStatus as GoalStatusEnum,
} from '@/features/goals/types';

import {
  QuantitativeGoalFields,
  QualitativeGoalFields,
  BinaryGoalFields,
  MilestoneGoalFields,
  RecurringGoalFields,
  HabitGoalFields,
} from './GoalForm';

const { TextArea } = Input;
const { Option } = Select;

export interface CreateGoalFormProps {
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
   * Form instance for external control
   */
  form?: FormInstance<CreateGoalInput>;
}

/**
 * CreateGoalForm Component
 */
export const CreateGoalForm: React.FC<CreateGoalFormProps> = ({
  onSubmit,
  onCancel,
  loading = false,
  form: externalForm,
}) => {
  const [form] = Form.useForm<CreateGoalInput>(externalForm);
  const goalType = Form.useWatch('type', form);

  const handleSubmit = async (values: CreateGoalInput) => {
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission failed:', error);
      // Error handling is done by parent component
    }
  };

  const handleFinish = (values: CreateGoalInput) => {
    void handleSubmit(values);
  };

  const handleFinishFailed = (errorInfo: { errorFields: Array<{ name: (string | number)[]; errors: string[] }> }) => {
    console.error('Form validation failed:', errorInfo);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      onFinishFailed={handleFinishFailed}
      initialValues={{
        status: GoalStatusEnum.ACTIVE,
        priority: PriorityEnum.MEDIUM,
        tags: [],
        relatedGoals: [],
      }}
    >
      {/* Common Fields */}
      <Form.Item
        name="title"
        label="Title"
        rules={[
          { required: true, message: 'Title is required' },
          { min: 1, message: 'Title cannot be empty' },
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
        <TextArea rows={3} placeholder="Enter goal description (optional)" />
      </Form.Item>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item name="type" label="Goal Type" rules={[{ required: true, message: 'Goal type is required' }]}>
            <Select placeholder="Select goal type">
              <Option value={GoalTypeEnum.QUANTITATIVE}>Quantitative</Option>
              <Option value={GoalTypeEnum.QUALITATIVE}>Qualitative</Option>
              <Option value={GoalTypeEnum.BINARY}>Binary</Option>
              <Option value={GoalTypeEnum.MILESTONE}>Milestone</Option>
              <Option value={GoalTypeEnum.RECURRING}>Recurring</Option>
              <Option value={GoalTypeEnum.HABIT}>Habit</Option>
            </Select>
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item
            name="category"
            label="Category"
            rules={[
              { required: true, message: 'Category is required' },
              { min: 1, message: 'Category cannot be empty' },
              { max: 100, message: 'Category must be 100 characters or less' },
            ]}
          >
            <Input placeholder="Enter category" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item name="priority" label="Priority" rules={[{ required: true, message: 'Priority is required' }]}>
            <Select placeholder="Select priority">
              <Option value={PriorityEnum.HIGH}>High</Option>
              <Option value={PriorityEnum.MEDIUM}>Medium</Option>
              <Option value={PriorityEnum.LOW}>Low</Option>
            </Select>
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Status is required' }]}>
            <Select placeholder="Select status">
              <Option value={GoalStatusEnum.ACTIVE}>Active</Option>
              <Option value={GoalStatusEnum.PAUSED}>Paused</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item name="startDate" label="Start Date (optional)">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item
            name="deadline"
            label="Deadline (optional)"
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value: dayjs.Dayjs | string | Date | null | undefined) {
                  const startDate = getFieldValue('startDate') as dayjs.Dayjs | undefined;
                  if (startDate && value && dayjs(value).isBefore(dayjs(startDate))) {
                    return Promise.reject(new Error('Deadline must be after start date'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      {/* Type-Specific Fields */}
      {goalType === GoalTypeEnum.QUANTITATIVE && <QuantitativeGoalFields />}
      {goalType === GoalTypeEnum.QUALITATIVE && <QualitativeGoalFields />}
      {goalType === GoalTypeEnum.BINARY && <BinaryGoalFields />}
      {goalType === GoalTypeEnum.MILESTONE && <MilestoneGoalFields />}
      {goalType === GoalTypeEnum.RECURRING && <RecurringGoalFields />}
      {goalType === GoalTypeEnum.HABIT && <HabitGoalFields />}

      {/* Form Actions */}
      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            Create Goal
          </Button>
          {onCancel && <Button onClick={onCancel}>Cancel</Button>}
        </Space>
      </Form.Item>
    </Form>
  );
};
