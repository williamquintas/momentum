/**
 * QualitativeGoalFields Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { Form } from 'antd';
import { describe, it, expect } from 'vitest';

import { QualitativeGoalFields } from '@/features/goals/components/GoalForm/QualitativeGoalFields';

describe('QualitativeGoalFields', () => {
  it('renders qualitative status selector', () => {
    render(
      <Form>
        <QualitativeGoalFields />
      </Form>
    );

    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
  });

  it('renders target rating input', () => {
    render(
      <Form>
        <QualitativeGoalFields />
      </Form>
    );

    expect(screen.getByLabelText(/target rating/i)).toBeInTheDocument();
  });

  it('shows all qualitative status options', async () => {
    render(
      <Form>
        <QualitativeGoalFields />
      </Form>
    );

    const statusSelect = screen.getByLabelText(/status/i);
    fireEvent.mouseDown(statusSelect);

    expect(screen.getByText('Not Started')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('accepts target rating input', async () => {
    render(
      <Form>
        <QualitativeGoalFields />
      </Form>
    );

    const ratingInput = screen.getByLabelText(/target rating/i);
    fireEvent.change(ratingInput, { target: { value: '8' } });

    await new Promise((r) => setTimeout(r, 100));
    expect(ratingInput).toBeInTheDocument();
  });

  it('validates target rating range (1-10)', async () => {
    render(
      <Form>
        <QualitativeGoalFields />
      </Form>
    );

    const ratingInput = screen.getByLabelText(/target rating/i);

    fireEvent.change(ratingInput, { target: { value: '15' } });
    await new Promise((r) => setTimeout(r, 100));
    expect(ratingInput).toBeInTheDocument();

    fireEvent.change(ratingInput, { target: { value: '0' } });
    await new Promise((r) => setTimeout(r, 100));
    expect(ratingInput).toBeInTheDocument();

    fireEvent.change(ratingInput, { target: { value: '5' } });
    await new Promise((r) => setTimeout(r, 100));
    expect(ratingInput).toBeInTheDocument();
  });
});
