import React from 'react';

import { Form, InputNumber, Select } from 'antd';
import { useTranslation } from 'react-i18next';

import { QualitativeStatus } from '@/features/goals/types';

const { Option } = Select;

export const QualitativeGoalFields: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <Form.Item
        name="qualitativeStatus"
        label={t('qualitativeFields.status')}
        rules={[{ required: true, message: t('qualitativeFields.statusRequired') }]}
      >
        <Select placeholder={t('qualitativeFields.selectStatus')}>
          <Option value={QualitativeStatus.NOT_STARTED}>{t('qualitativeFields.notStarted')}</Option>
          <Option value={QualitativeStatus.IN_PROGRESS}>{t('qualitativeFields.inProgress')}</Option>
          <Option value={QualitativeStatus.COMPLETED}>{t('qualitativeFields.completed')}</Option>
        </Select>
      </Form.Item>

      <Form.Item name="targetRating" label={t('qualitativeFields.targetRating')}>
        <InputNumber
          style={{ width: '100%' }}
          min={1}
          max={10}
          placeholder={t('qualitativeFields.targetRatingPlaceholder')}
        />
      </Form.Item>
    </>
  );
};
