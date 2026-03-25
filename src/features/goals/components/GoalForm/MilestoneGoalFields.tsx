import React from 'react';

import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Form, Input, DatePicker, Button, Space, Row, Col, Switch } from 'antd';

export const MilestoneGoalFields: React.FC = () => (
  <>
    <Form.List name="milestones" initialValue={[{ title: '', order: 0, status: 'pending' }]}>
      {(fields, { add, remove }) => (
        <>
          {fields.map((field, index) => (
            <Space key={field.key} align="start" style={{ display: 'flex', marginBottom: 8 }}>
              <Row gutter={16} style={{ width: '100%' }}>
                <Col xs={24} md={6}>
                  <Form.Item
                    {...field}
                    name={[field.name, 'title']}
                    fieldKey={[field.fieldKey ?? field.name, 'title']}
                    label={`Milestone ${index + 1} Title`}
                    rules={[{ required: true, message: 'Milestone title is required' }]}
                  >
                    <Input placeholder="Title" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={10}>
                  <Form.Item
                    {...field}
                    name={[field.name, 'description']}
                    fieldKey={[field.fieldKey ?? field.name, 'description']}
                    label="Description"
                  >
                    <Input placeholder="Optional description" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={4}>
                  <Form.Item
                    {...field}
                    name={[field.name, 'dueDate']}
                    fieldKey={[field.fieldKey ?? field.name, 'dueDate']}
                    label="Due Date"
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={4} style={{ display: 'flex', alignItems: 'center', marginTop: 30 }}>
                  <MinusCircleOutlined onClick={() => remove(field.name)} style={{ color: 'red' }} />
                </Col>
              </Row>
              <Form.Item
                {...field}
                name={[field.name, 'order']}
                fieldKey={[field.fieldKey ?? field.name, 'order']}
                hidden
                initialValue={index}
              >
                <Input type="hidden" />
              </Form.Item>
            </Space>
          ))}
          <Form.Item>
            <Button
              type="dashed"
              onClick={() => add({ id: '', title: '', status: 'pending', order: fields.length, dependencies: [] })}
              block
              icon={<PlusOutlined />}
            >
              Add Milestone
            </Button>
          </Form.Item>
        </>
      )}
    </Form.List>

    <Form.Item name="allowMilestoneReordering" valuePropName="checked" label="Allow Milestone Reordering">
      <Switch defaultChecked={false} />
    </Form.Item>

    <Form.Item name="requireSequentialCompletion" valuePropName="checked" label="Require Sequential Completion">
      <Switch defaultChecked={false} />
    </Form.Item>
  </>
);
