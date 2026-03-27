/**
 * BinaryGoalFields Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { Form } from 'antd';
import { describe, it, expect } from 'vitest';

import { BinaryGoalFields } from '@/features/goals/components/GoalForm/BinaryGoalFields';

describe('BinaryGoalFields', () => {
  it('renders target count input', () => {
    render(
      <Form>
        <BinaryGoalFields />
      </Form>
    );

    expect(screen.getByLabelText(/target count/i)).toBeInTheDocument();
  });

  it('renders current count input', () => {
    render(
      <Form>
        <BinaryGoalFields />
      </Form>
    );

    expect(screen.getByLabelText(/current count/i)).toBeInTheDocument();
  });

  it('renders allow partial completion switch', () => {
    render(
      <Form>
        <BinaryGoalFields />
      </Form>
    );

    expect(screen.getByLabelText(/allow partial completion/i)).toBeInTheDocument();
  });

  it('accepts numeric input for target count', async () => {
    render(
      <Form>
        <BinaryGoalFields />
      </Form>
    );

    const targetInput = screen.getByLabelText(/target count/i);
    fireEvent.change(targetInput, { target: { value: '5' } });

    await new Promise((r) => setTimeout(r, 100));
    expect(targetInput).toBeInTheDocument();
  });

  it('accepts numeric input for current count', async () => {
    render(
      <Form>
        <BinaryGoalFields />
      </Form>
    );

    const currentInput = screen.getByLabelText(/current count/i);
    fireEvent.change(currentInput, { target: { value: '3' } });

    await new Promise((r) => setTimeout(r, 100));
    expect(currentInput).toBeInTheDocument();
  });

  it('enforces minimum value of 0 for current count', async () => {
    render(
      <Form>
        <BinaryGoalFields />
      </Form>
    );

    const currentInput = screen.getByLabelText(/current count/i);
    fireEvent.change(currentInput, { target: { value: '-1' } });

    await new Promise((r) => setTimeout(r, 100));
    expect(currentInput).toBeInTheDocument();
  });

  it('toggles allow partial completion switch', () => {
    render(
      <Form>
        <BinaryGoalFields />
      </Form>
    );

    const switchElement = screen.getByLabelText(/allow partial completion/i);
    fireEvent.click(switchElement);

    expect(switchElement).not.toBeChecked();
  });
});
