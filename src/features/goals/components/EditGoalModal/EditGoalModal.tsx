/**
 * EditGoalModal Component
 *
 * Modal dialog for editing existing goals.
 * Wraps GoalForm component in an Ant Design Modal with initial values.
 */

import React from 'react';

import { Modal } from 'antd';
import { useTranslation } from 'react-i18next';

import type { Goal, CreateGoalInput } from '@/features/goals/types';

import { GoalForm } from '../GoalForm';

export interface EditGoalModalProps {
  /**
   * Whether the modal is open
   */
  open: boolean;

  /**
   * The goal to edit
   */
  goal: Goal | null;

  /**
   * Callback when modal is cancelled
   */
  onCancel: () => void;

  /**
   * Callback when form is submitted
   */
  onSubmit: (values: CreateGoalInput) => void | Promise<void>;

  /**
   * Loading state
   */
  loading?: boolean;
}

/**
 * Convert Goal to CreateGoalInput for editing
 */
const goalToCreateInput = (goal: Goal): CreateGoalInput => {
  // Extract all fields from goal that are valid for CreateGoalInput
  const {
    id: _id,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    progress: _progress,
    progressHistory: _progressHistory,
    notes: _notes,
    attachments: _attachments,
    ...rest
  } = goal;

  return rest as CreateGoalInput;
};

/**
 * EditGoalModal Component
 */
export const EditGoalModal: React.FC<EditGoalModalProps> = ({ open, onCancel, onSubmit, goal, loading = false }) => {
  const { t } = useTranslation();
  const handleSubmit = (values: CreateGoalInput) => {
    void onSubmit(values);
  };

  const initialValues = goal ? goalToCreateInput(goal) : undefined;

  return (
    <Modal title={t('editGoalModal.title')} open={open} onCancel={onCancel} footer={null} width={800} destroyOnClose>
      {goal && <GoalForm initialValues={initialValues} onSubmit={handleSubmit} onCancel={onCancel} loading={loading} />}
    </Modal>
  );
};
