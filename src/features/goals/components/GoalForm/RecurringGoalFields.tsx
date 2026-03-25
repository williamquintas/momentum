import React from 'react';

import { Form, InputNumber, Select, DatePicker, Space } from 'antd';

const { Option } = Select;

export const RecurringGoalFields: React.FC = () => (
  <>
    <Form.Item
      name={['recurrence', 'frequency']}
      label="Recurrence Frequency"
      rules={[{ required: true, message: 'Recurrence frequency is required' }]}
    >
      <Select placeholder="Select frequency">
        <Option value="daily">Daily</Option>
        <Option value="weekly">Weekly</Option>
        <Option value="monthly">Monthly</Option>
        <Option value="yearly">Yearly</Option>
      </Select>
    </Form.Item>

    <Form.Item
      name={['recurrence', 'interval']}
      label="Interval"
      rules={[{ required: true, message: 'Interval is required' }]}
    >
      <InputNumber style={{ width: '100%' }} min={1} placeholder="Interval (e.g., every 2 weeks)" />
    </Form.Item>

    <Form.Item name={['recurrence', 'endDate']} label="End Date">
      <DatePicker style={{ width: '100%' }} />
    </Form.Item>

    <Form.Item name={['recurrence', 'daysOfWeek']} label="Days of Week">
      <Select mode="multiple" placeholder="Select weekly days (0=Sunday)">
        <Option value={0}>Sunday</Option>
        <Option value={1}>Monday</Option>
        <Option value={2}>Tuesday</Option>
        <Option value={3}>Wednesday</Option>
        <Option value={4}>Thursday</Option>
        <Option value={5}>Friday</Option>
        <Option value={6}>Saturday</Option>
      </Select>
    </Form.Item>

    <Form.Item name={['recurrence', 'dayOfMonth']} label="Day of Month">
      <InputNumber style={{ width: '100%' }} min={1} max={31} placeholder="Day of month" />
    </Form.Item>

    <Form.Item name={['recurrence', 'dayOfYear']} label="Day of Year">
      <InputNumber style={{ width: '100%' }} min={1} max={365} placeholder="Day of year" />
    </Form.Item>

    <Form.Item style={{ marginTop: 8 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Form.Item name={['completionStats', 'totalOccurrences']} hidden initialValue={0}>
          <InputNumber />
        </Form.Item>
        <Form.Item name={['completionStats', 'completedOccurrences']} hidden initialValue={0}>
          <InputNumber />
        </Form.Item>
        <Form.Item name={['completionStats', 'completionRate']} hidden initialValue={0}>
          <InputNumber />
        </Form.Item>
      </Space>
    </Form.Item>
  </>
);
