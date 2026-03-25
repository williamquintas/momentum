/**
 * HabitGoalFields Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { Form } from 'antd';
import { describe, it, expect } from 'vitest';

import { HabitGoalFields } from '@/features/goals/components/GoalForm/HabitGoalFields';

describe('HabitGoalFields', () => {
  it('renders target frequency selector', () => {
    render(
      <Form>
        <HabitGoalFields />
      </Form>
    );

    expect(screen.getByLabelText(/target frequency/i)).toBeInTheDocument();
  });

  it('shows all frequency options', async () => {
    render(
      <Form>
        <HabitGoalFields />
      </Form>
    );

    const frequencySelect = screen.getByLabelText(/target frequency/i);
    fireEvent.mouseDown(frequencySelect);

    expect(screen.getByText('Daily')).toBeInTheDocument();
    expect(screen.getByText('Every Other Day')).toBeInTheDocument();
    expect(screen.getByText('Weekly')).toBeInTheDocument();
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });

  it('renders frequency options in dropdown', async () => {
    render(
      <Form>
        <HabitGoalFields />
      </Form>
    );

    const frequencySelect = screen.getByLabelText(/target frequency/i);
    fireEvent.mouseDown(frequencySelect);

    expect(screen.getByText('Daily')).toBeInTheDocument();
  });

  it('selects daily frequency option', async () => {
    render(
      <Form>
        <HabitGoalFields />
      </Form>
    );

    const frequencySelect = screen.getByLabelText(/target frequency/i);
    fireEvent.mouseDown(frequencySelect);
    fireEvent.click(screen.getByText('Daily'));

    expect(frequencySelect).toBeInTheDocument();
  });

  it('selects weekly frequency option', async () => {
    render(
      <Form>
        <HabitGoalFields />
      </Form>
    );

    const frequencySelect = screen.getByLabelText(/target frequency/i);
    fireEvent.mouseDown(frequencySelect);
    fireEvent.click(screen.getByText('Weekly'));

    expect(frequencySelect).toBeInTheDocument();
  });
});
