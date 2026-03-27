import React from 'react';

import { Form, InputNumber, Input, Switch, Row, Col } from 'antd';

export const QuantitativeGoalFields: React.FC = () => (
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
);
