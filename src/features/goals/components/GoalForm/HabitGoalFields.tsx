import React from 'react';

import { Form, Select, InputNumber } from 'antd';

const { Option } = Select;

export const HabitGoalFields: React.FC = () => (
  <>
    <Form.Item
      name="targetFrequency"
      label="Target Frequency"
      rules={[{ required: true, message: 'Target frequency is required' }]}
    >
      <Select placeholder="Select frequency">
        <Option value="daily">Daily</Option>
        <Option value="every_other_day">Every Other Day</Option>
        <Option value="weekly">Weekly</Option>
        <Option value="custom">Custom</Option>
      </Select>
    </Form.Item>

    <Form.Item
      noStyle
      shouldUpdate={(prev, curr) => {
        const prevFreq = (prev as Record<string, unknown>)?.targetFrequency as string | undefined;
        const currFreq = (curr as Record<string, unknown>)?.targetFrequency as string | undefined;
        return prevFreq !== currFreq;
      }}
    >
      {({ getFieldValue }) => {
        const targetFrequency = (getFieldValue('targetFrequency') as string) ?? '';
        if (targetFrequency === 'custom') {
          return (
            <Form.Item
              name="customFrequency"
              label="Custom Days Between"
              rules={[{ required: true, message: 'Custom frequency is required' }]}
            >
              <InputNumber style={{ width: '100%' }} min={1} placeholder="Number of days" />
            </Form.Item>
          );
        }
        return null;
      }}
    </Form.Item>
  </>
);
