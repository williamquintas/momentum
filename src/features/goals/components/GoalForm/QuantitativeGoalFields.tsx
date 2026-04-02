import React from 'react';

import { Form, InputNumber, Input, Switch, Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';

export const QuantitativeGoalFields: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Form.Item
            name="startValue"
            label={t('quantitativeFields.startValue')}
            rules={[{ required: true, message: t('quantitativeFields.startValueRequired') }]}
          >
            <InputNumber style={{ width: '100%' }} placeholder={t('quantitativeFields.startValuePlaceholder')} />
          </Form.Item>
        </Col>

        <Col xs={24} sm={8}>
          <Form.Item
            name="targetValue"
            label={t('quantitativeFields.targetValue')}
            rules={[{ required: true, message: t('quantitativeFields.targetValueRequired') }]}
          >
            <InputNumber style={{ width: '100%' }} placeholder={t('quantitativeFields.targetValuePlaceholder')} />
          </Form.Item>
        </Col>

        <Col xs={24} sm={8}>
          <Form.Item
            name="currentValue"
            label={t('quantitativeFields.currentValue')}
            rules={[{ required: true, message: t('quantitativeFields.currentValueRequired') }]}
          >
            <InputNumber style={{ width: '100%' }} placeholder={t('quantitativeFields.currentValuePlaceholder')} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="unit"
            label={t('quantitativeFields.unit')}
            rules={[
              { required: true, message: t('quantitativeFields.unitRequired') },
              { max: 20, message: t('quantitativeFields.unitMaxLength') },
            ]}
          >
            <Input placeholder={t('quantitativeFields.unitPlaceholder')} />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item name="allowDecimals" valuePropName="checked" label={t('quantitativeFields.allowDecimals')}>
            <Switch />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
};
