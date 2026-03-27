import { useEffect } from 'react';

import { Form } from 'antd';
import type { FormInstance } from 'antd';

import type { CreateGoalInput, GoalType } from '@/features/goals/types';
import { initializeGoalForType } from '@/features/goals/utils/goalInitialization';

export interface UseGoalFormOptions {
  initialValues?: Partial<CreateGoalInput>;
  onSubmit: (values: CreateGoalInput) => void | Promise<void>;
}

export interface UseGoalFormReturn {
  form: FormInstance<CreateGoalInput>;
  goalType?: GoalType;
  onValuesChange: (changed: Record<string, unknown>, all: Record<string, unknown>) => void;
  submitForm: (values: Record<string, unknown>) => Promise<void>;
}

export const useGoalForm = ({ initialValues, onSubmit }: UseGoalFormOptions): UseGoalFormReturn => {
  const [form] = Form.useForm<CreateGoalInput>();
  const goalType = Form.useWatch('type', form);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues as Parameters<typeof form.setFieldsValue>[0]);
    }
  }, [form, initialValues]);

  const onValuesChange = (changedValues: Record<string, unknown>, allValues: Record<string, unknown>) => {
    if (changedValues.type) {
      const typed = changedValues.type as GoalType;
      form.setFieldsValue(
        initializeGoalForType({ ...allValues, type: typed } as CreateGoalInput) as Parameters<
          typeof form.setFieldsValue
        >[0]
      );
    }
  };

  const submitForm = async (values: Record<string, unknown>) => {
    const payload = initializeGoalForType(values as CreateGoalInput);
    await onSubmit(payload);
  };

  return { form, goalType, onValuesChange, submitForm };
};
