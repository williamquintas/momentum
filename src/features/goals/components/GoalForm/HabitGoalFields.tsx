import React from 'react';

import { Form, Select, InputNumber } from 'antd';
import { useTranslation } from 'react-i18next';

const { Option } = Select;

export const HabitGoalFields: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <Form.Item
        name="targetFrequency"
        label={t('habitFields.targetFrequency')}
        rules={[{ required: true, message: t('habitFields.targetFrequencyRequired') }]}
      >
        <Select placeholder={t('habitFields.selectFrequency')}>
          <Option value="daily">{t('habitFields.daily')}</Option>
          <Option value="every_other_day">{t('habitFields.everyOtherDay')}</Option>
          <Option value="weekly">{t('habitFields.weekly')}</Option>
          <Option value="custom">{t('habitFields.custom')}</Option>
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
                label={t('habitFields.customDays')}
                rules={[{ required: true, message: t('habitFields.customRequired') }]}
              >
                <InputNumber style={{ width: '100%' }} min={1} placeholder={t('habitFields.customPlaceholder')} />
              </Form.Item>
            );
          }
          return null;
        }}
      </Form.Item>
    </>
  );
};
