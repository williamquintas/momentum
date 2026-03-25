/**
 * MilestoneGoalFields Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { Form } from 'antd';
import { describe, it, expect } from 'vitest';

import { MilestoneGoalFields } from '@/features/goals/components/GoalForm/MilestoneGoalFields';

describe('MilestoneGoalFields', () => {
  it('renders initial milestone input', () => {
    render(
      <Form>
        <MilestoneGoalFields />
      </Form>
    );

    expect(screen.getByLabelText(/milestone 1 title/i)).toBeInTheDocument();
  });

  it('renders allow milestone reordering switch', () => {
    render(
      <Form>
        <MilestoneGoalFields />
      </Form>
    );

    expect(screen.getByLabelText(/allow milestone reordering/i)).toBeInTheDocument();
  });

  it('renders require sequential completion switch', () => {
    render(
      <Form>
        <MilestoneGoalFields />
      </Form>
    );

    expect(screen.getByLabelText(/require sequential completion/i)).toBeInTheDocument();
  });

  it('renders add milestone button', () => {
    render(
      <Form>
        <MilestoneGoalFields />
      </Form>
    );

    expect(screen.getByRole('button', { name: /add milestone/i })).toBeInTheDocument();
  });

  it('adds new milestone when add button is clicked', async () => {
    render(
      <Form>
        <MilestoneGoalFields />
      </Form>
    );

    const addButton = screen.getByRole('button', { name: /add milestone/i });
    fireEvent.click(addButton);

    expect(screen.getByLabelText(/milestone 2 title/i)).toBeInTheDocument();
  });

  it('accepts milestone title input', () => {
    render(
      <Form>
        <MilestoneGoalFields />
      </Form>
    );

    const titleInput = screen.getByLabelText(/milestone 1 title/i);
    fireEvent.change(titleInput, { target: { value: 'First Milestone' } });

    expect(titleInput).toHaveValue('First Milestone');
  });

  it('renders milestone form structure correctly', () => {
    render(
      <Form>
        <MilestoneGoalFields />
      </Form>
    );

    expect(screen.getByLabelText(/milestone 1 title/i)).toBeInTheDocument();
    expect(screen.getByText(/description/i)).toBeInTheDocument();
    expect(screen.getByText(/due date/i)).toBeInTheDocument();
  });

  it('toggles allow milestone reordering', () => {
    render(
      <Form>
        <MilestoneGoalFields />
      </Form>
    );

    const switchElement = screen.getByLabelText(/allow milestone reordering/i);
    fireEvent.click(switchElement);

    expect(switchElement).toBeChecked();
  });
});
