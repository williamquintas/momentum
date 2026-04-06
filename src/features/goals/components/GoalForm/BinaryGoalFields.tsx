import React from 'react';

import { Form, InputNumber, Switch } from 'antd';
import { useTranslation } from 'react-i18next';

export const BinaryGoalFields: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <Form.Item name="targetCount" label={t('binaryFields.targetCount')}>
        <InputNumber style={{ width: '100%' }} min={1} placeholder={t('binaryFields.targetCountPlaceholder')} />
      </Form.Item>

      <Form.Item
        name="currentCount"
        label={t('binaryFields.currentCount')}
        rules={[{ required: true, message: t('binaryFields.currentCountRequired') }]}
      >
        <InputNumber style={{ width: '100%' }} min={0} placeholder={t('binaryFields.currentCountPlaceholder')} />
      </Form.Item>

      <Form.Item name="allowPartialCompletion" valuePropName="checked" label={t('binaryFields.allowPartialCompletion')}>
        <Switch defaultChecked />
      </Form.Item>
    </>
  );
};
