/**
 * RecurringGoalFields Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { Form } from 'antd';
import { describe, it, expect } from 'vitest';

import { RecurringGoalFields } from '@/features/goals/components/GoalForm/RecurringGoalFields';

describe('RecurringGoalFields', () => {
  it('renders recurrence frequency selector', () => {
    render(
      <Form>
        <RecurringGoalFields />
      </Form>
    );

    expect(screen.getByLabelText(/recurrence frequency/i)).toBeInTheDocument();
  });

  it('renders interval input', () => {
    render(
      <Form>
        <RecurringGoalFields />
      </Form>
    );

    expect(screen.getByLabelText(/interval/i)).toBeInTheDocument();
  });

  it('renders end date picker', () => {
    render(
      <Form>
        <RecurringGoalFields />
      </Form>
    );

    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
  });

  it('renders days of week selector', () => {
    render(
      <Form>
        <RecurringGoalFields />
      </Form>
    );

    expect(screen.getByLabelText(/days of week/i)).toBeInTheDocument();
  });

  it('renders day of month input', () => {
    render(
      <Form>
        <RecurringGoalFields />
      </Form>
    );

    expect(screen.getByLabelText(/day of month/i)).toBeInTheDocument();
  });

  it('renders day of year input', () => {
    render(
      <Form>
        <RecurringGoalFields />
      </Form>
    );

    expect(screen.getByLabelText(/day of year/i)).toBeInTheDocument();
  });

  it('shows all frequency options', async () => {
    render(
      <Form>
        <RecurringGoalFields />
      </Form>
    );

    const frequencySelect = screen.getByLabelText(/recurrence frequency/i);
    fireEvent.mouseDown(frequencySelect);

    expect(screen.getByText('Daily')).toBeInTheDocument();
    expect(screen.getByText('Weekly')).toBeInTheDocument();
    expect(screen.getByText('Monthly')).toBeInTheDocument();
    expect(screen.getByText('Yearly')).toBeInTheDocument();
  });

  it('accepts interval input', async () => {
    render(
      <Form>
        <RecurringGoalFields />
      </Form>
    );

    const intervalInput = screen.getByLabelText(/interval/i);
    fireEvent.change(intervalInput, { target: { value: '2' } });

    await new Promise((r) => setTimeout(r, 100));
    expect(intervalInput).toBeInTheDocument();
  });

  it('accepts interval input', () => {
    render(
      <Form>
        <RecurringGoalFields />
      </Form>
    );

    const intervalInput = screen.getByLabelText(/interval/i);
    fireEvent.change(intervalInput, { target: { value: '2' } });

    expect(intervalInput).toBeInTheDocument();
  });

  it('accepts day of month input', () => {
    render(
      <Form>
        <RecurringGoalFields />
      </Form>
    );

    const dayInput = screen.getByLabelText(/day of month/i);
    fireEvent.change(dayInput, { target: { value: '15' } });

    expect(dayInput).toBeInTheDocument();
  });

  it('accepts day of year input', () => {
    render(
      <Form>
        <RecurringGoalFields />
      </Form>
    );

    const dayInput = screen.getByLabelText(/day of year/i);
    fireEvent.change(dayInput, { target: { value: '200' } });

    expect(dayInput).toBeInTheDocument();
  });
});
