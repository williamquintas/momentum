import React from 'react';

import { Form, InputNumber, Switch } from 'antd';

export const BinaryGoalFields: React.FC = () => (
  <>
    <Form.Item name="targetCount" label="Target Count (optional)">
      <InputNumber style={{ width: '100%' }} min={1} placeholder="Target count (optional)" />
    </Form.Item>

    <Form.Item
      name="currentCount"
      label="Current Count"
      rules={[{ required: true, message: 'Current count is required' }]}
    >
      <InputNumber style={{ width: '100%' }} min={0} placeholder="Current count" />
    </Form.Item>

    <Form.Item name="allowPartialCompletion" valuePropName="checked" label="Allow Partial Completion">
      <Switch defaultChecked />
    </Form.Item>
  </>
);
