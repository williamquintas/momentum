/**
 * CreateGoalModal Component
 *
 * Modal dialog for creating new goals.
 * Wraps GoalForm component in an Ant Design Modal.
 */

import React from 'react';

import { Modal } from 'antd';

import type { CreateGoalInput } from '@/features/goals/types';

import { GoalForm } from '../GoalForm';

export interface CreateGoalModalProps {
  /**
   * Whether the modal is open
   */
  open: boolean;

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
 * CreateGoalModal Component
 */
export const CreateGoalModal: React.FC<CreateGoalModalProps> = ({ open, onCancel, onSubmit, loading = false }) => {
  const handleSubmit = (values: CreateGoalInput) => {
    void onSubmit(values);
  };

  return (
    <Modal title="Create New Goal" open={open} onCancel={onCancel} footer={null} width={800} destroyOnClose>
      <GoalForm onSubmit={handleSubmit} onCancel={onCancel} loading={loading} />
    </Modal>
  );
};
