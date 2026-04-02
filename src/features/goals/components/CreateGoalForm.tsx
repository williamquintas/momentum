/**
 * CreateGoalForm Component
 *
 * Main form component for creating new goals. Supports all 6 goal types with
 * conditional rendering of type-specific fields.
 */

import React from 'react';

import { Form, Input, Select, Button, Space, Row, Col, DatePicker, FormInstance } from 'antd';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
        label={t('goals.form.title')}
        rules={[
          { required: true, message: t('validation.required') },
          { min: 1, message: t('validation.minLength', { min: 1 }) },
          { max: 200, message: t('validation.maxLength', { max: 200 }) },
        ]}
      >
        <Input placeholder={t('goals.form.placeholders.title')} />
      </Form.Item>

      <Form.Item
        name="description"
        label={t('goals.form.description')}
        rules={[{ max: 5000, message: t('validation.maxLength', { max: 5000 }) }]}
      >
        <TextArea rows={3} placeholder={t('goals.form.placeholders.description')} />
      </Form.Item>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="type"
            label={t('goals.form.goalType')}
            rules={[{ required: true, message: t('validation.required') }]}
          >
            <Select placeholder={t('goals.form.placeholders.goalType')}>
              <Option value={GoalTypeEnum.QUANTITATIVE}>{t('goals.types.quantitative')}</Option>
              <Option value={GoalTypeEnum.QUALITATIVE}>{t('goals.types.qualitative')}</Option>
              <Option value={GoalTypeEnum.BINARY}>{t('goals.types.binary')}</Option>
              <Option value={GoalTypeEnum.MILESTONE}>{t('goals.types.milestone')}</Option>
              <Option value={GoalTypeEnum.RECURRING}>{t('goals.types.recurring')}</Option>
              <Option value={GoalTypeEnum.HABIT}>{t('goals.types.habit')}</Option>
            </Select>
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item
            name="category"
            label={t('goals.form.category')}
            rules={[
              { required: true, message: t('validation.required') },
              { min: 1, message: t('validation.minLength', { min: 1 }) },
              { max: 100, message: t('validation.maxLength', { max: 100 }) },
            ]}
          >
            <Input placeholder={t('goals.form.placeholders.category')} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="priority"
            label={t('goals.form.priority')}
            rules={[{ required: true, message: t('validation.required') }]}
          >
            <Select placeholder={t('goals.form.placeholders.priority')}>
              <Option value={PriorityEnum.HIGH}>{t('goals.priorities.high')}</Option>
              <Option value={PriorityEnum.MEDIUM}>{t('goals.priorities.medium')}</Option>
              <Option value={PriorityEnum.LOW}>{t('goals.priorities.low')}</Option>
            </Select>
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item
            name="status"
            label={t('goals.form.status')}
            rules={[{ required: true, message: t('validation.required') }]}
          >
            <Select placeholder={t('goals.form.placeholders.status')}>
              <Option value={GoalStatusEnum.ACTIVE}>{t('goals.status.active')}</Option>
              <Option value={GoalStatusEnum.PAUSED}>{t('goals.status.paused')}</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item name="startDate" label={`${t('goals.form.startDate')} (${t('common.optional')})`}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item
            name="deadline"
            label={`${t('goals.form.deadline')} (${t('common.optional')})`}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value: dayjs.Dayjs | string | Date | null | undefined) {
                  const startDate = getFieldValue('startDate') as dayjs.Dayjs | undefined;
                  if (startDate && value && dayjs(value).isBefore(dayjs(startDate))) {
                    return Promise.reject(new Error(t('goals.form.deadlineAfterStart')));
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
            {t('goals.form.buttons.createGoal')}
          </Button>
          {onCancel && <Button onClick={onCancel}>{t('common.cancel')}</Button>}
        </Space>
      </Form.Item>
    </Form>
  );
};
