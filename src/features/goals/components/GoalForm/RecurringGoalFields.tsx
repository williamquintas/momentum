import React from 'react';

import { Form, InputNumber, Select, DatePicker, Space } from 'antd';
import { useTranslation } from 'react-i18next';

const { Option } = Select;

export const RecurringGoalFields: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <Form.Item
        name={['recurrence', 'frequency']}
        label={t('recurringFields.frequency')}
        rules={[{ required: true, message: t('recurringFields.frequencyRequired') }]}
      >
        <Select placeholder={t('recurringFields.selectFrequency')}>
          <Option value="daily">{t('recurringFields.daily')}</Option>
          <Option value="weekly">{t('recurringFields.weekly')}</Option>
          <Option value="monthly">{t('recurringFields.monthly')}</Option>
          <Option value="yearly">{t('recurringFields.yearly')}</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name={['recurrence', 'interval']}
        label={t('recurringFields.interval')}
        rules={[{ required: true, message: t('recurringFields.intervalRequired') }]}
      >
        <InputNumber style={{ width: '100%' }} min={1} placeholder={t('recurringFields.intervalPlaceholder')} />
      </Form.Item>

      <Form.Item name={['recurrence', 'endDate']} label={t('recurringFields.endDate')}>
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item name={['recurrence', 'daysOfWeek']} label={t('recurringFields.daysOfWeek')}>
        <Select mode="multiple" placeholder={t('recurringFields.selectDays')}>
          <Option value={0}>{t('recurringFields.sunday')}</Option>
          <Option value={1}>{t('recurringFields.monday')}</Option>
          <Option value={2}>{t('recurringFields.tuesday')}</Option>
          <Option value={3}>{t('recurringFields.wednesday')}</Option>
          <Option value={4}>{t('recurringFields.thursday')}</Option>
          <Option value={5}>{t('recurringFields.friday')}</Option>
          <Option value={6}>{t('recurringFields.saturday')}</Option>
        </Select>
      </Form.Item>

      <Form.Item name={['recurrence', 'dayOfMonth']} label={t('recurringFields.dayOfMonth')}>
        <InputNumber
          style={{ width: '100%' }}
          min={1}
          max={31}
          placeholder={t('recurringFields.dayOfMonthPlaceholder')}
        />
      </Form.Item>

      <Form.Item name={['recurrence', 'dayOfYear']} label={t('recurringFields.dayOfYear')}>
        <InputNumber
          style={{ width: '100%' }}
          min={1}
          max={365}
          placeholder={t('recurringFields.dayOfYearPlaceholder')}
        />
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
};
