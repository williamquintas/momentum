/**
 * QuantitativeGoalFields Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { Form } from 'antd';
import { describe, it, expect } from 'vitest';

import { QuantitativeGoalFields } from '@/features/goals/components/GoalForm/QuantitativeGoalFields';

describe('QuantitativeGoalFields', () => {
  it('renders all quantitative fields', () => {
    render(
      <Form>
        <QuantitativeGoalFields />
      </Form>
    );

    expect(screen.getByLabelText(/start value/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/target value/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/current value/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/unit/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/allow decimals/i)).toBeInTheDocument();
  });

  it('accepts numeric input for values', () => {
    render(
      <Form>
        <QuantitativeGoalFields />
      </Form>
    );

    const startValueInput = screen.getByLabelText(/start value/i);
    const targetValueInput = screen.getByLabelText(/target value/i);
    const currentValueInput = screen.getByLabelText(/current value/i);

    fireEvent.change(startValueInput, { target: { value: '10' } });
    fireEvent.change(targetValueInput, { target: { value: '20' } });
    fireEvent.change(currentValueInput, { target: { value: '15' } });

    expect(startValueInput).toHaveValue('10');
    expect(targetValueInput).toHaveValue('20');
    expect(currentValueInput).toHaveValue('15');
  });

  it('accepts text input for unit', () => {
    render(
      <Form>
        <QuantitativeGoalFields />
      </Form>
    );

    const unitInput = screen.getByLabelText(/unit/i);
    fireEvent.change(unitInput, { target: { value: 'kg' } });

    expect(unitInput).toHaveValue('kg');
  });

  it('has allow decimals switch', () => {
    render(
      <Form>
        <QuantitativeGoalFields />
      </Form>
    );

    const allowDecimalsSwitch = screen.getByLabelText(/allow decimals/i);
    expect(allowDecimalsSwitch).toBeInTheDocument();
  });
});
