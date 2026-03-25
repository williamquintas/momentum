import React from 'react';

import { Form, InputNumber, Select } from 'antd';

import { QualitativeStatus } from '@/features/goals/types';

const { Option } = Select;

export const QualitativeGoalFields: React.FC = () => (
  <>
    <Form.Item name="qualitativeStatus" label="Status" rules={[{ required: true, message: 'Status is required' }]}>
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
);
