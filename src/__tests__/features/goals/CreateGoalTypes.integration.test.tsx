import React, { useState } from 'react';

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GoalForm } from '@/features/goals/components/GoalForm/GoalForm';
import { GoalType, type CreateGoalInput } from '@/features/goals/types';
import { exportGoals } from '@/services/storage/dataExportService';
import { createGoal, getAllGoals, getGoal } from '@/services/storage/goalStorageService';
import { STORAGE_KEYS } from '@/services/storage/storageTypes';

vi.mock('@/utils/featureFlags', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/utils/featureFlags')>();
  Object.assign(original.featureFlags, {
    enableQuantitativeOnly: false,
    enableMilestone: true,
    enableRecurring: true,
    enableHabit: true,
    enableAttachments: true,
    enableNotes: true,
  });
  return original;
});

const TYPE_LABELS: Record<GoalType, string> = {
  [GoalType.QUANTITATIVE]: 'Quantitative',
  [GoalType.QUALITATIVE]: 'Qualitative',
  [GoalType.BINARY]: 'Binary',
  [GoalType.MILESTONE]: 'Milestone',
  [GoalType.RECURRING]: 'Recurring',
  [GoalType.HABIT]: 'Habit',
};

const CreationScreen = ({ onCancel }: { onCancel?: () => void }): React.ReactElement => {
  const [error, setError] = useState('');
  const [createdId, setCreatedId] = useState('');
  const handleSubmit = (input: CreateGoalInput): void => {
    try {
      setCreatedId(createGoal(input).id);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Cannot create goal');
    }
  };
  return (
    <>
      <GoalForm onSubmit={handleSubmit} onCancel={onCancel} />
      {createdId && <output aria-label="Created goal ID">{createdId}</output>}
      {error && <p role="alert">{error}</p>}
    </>
  );
};

const setInput = (label: RegExp, value: string): void => {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
};

const click = async (element: HTMLElement): Promise<void> => {
  await act(async () => {
    await userEvent.click(element);
  });
};

const selectType = async (type: GoalType): Promise<void> => {
  await click(screen.getByLabelText(/^Goal Type/));
  await click(screen.getByText(TYPE_LABELS[type], { exact: true }));
};

const fillGoal = async (type: GoalType, includeTitle = true): Promise<void> => {
  if (includeTitle) setInput(/^Title$/, `Synthetic ${type}`);
  setInput(/^Category$/, 'Integration fixtures');
  await selectType(type);
  switch (type) {
    case GoalType.QUANTITATIVE:
      setInput(/^Start Value$/, '0');
      setInput(/^Target Value$/, '100');
      setInput(/^Current Value$/, '0');
      setInput(/^Unit$/, 'pages');
      break;
    case GoalType.QUALITATIVE:
      await click(screen.getAllByLabelText(/^Status$/)[1]);
      await click(screen.getByText('Not Started', { exact: true }));
      setInput(/^Target Rating/, '8');
      break;
    case GoalType.BINARY:
      setInput(/^Current Count$/, '0');
      setInput(/^Target Count/, '3');
      break;
    case GoalType.MILESTONE:
      setInput(/^Milestone 1 Title$/, 'Prepare outline');
      await click(screen.getByRole('button', { name: /add milestone/i }));
      setInput(/^Milestone 2 Title$/, 'Write draft');
      break;
    case GoalType.RECURRING:
      await click(screen.getByLabelText(/^Recurrence Frequency$/));
      await click(screen.getByText('Weekly', { exact: true }));
      setInput(/^Interval$/, '2');
      break;
    case GoalType.HABIT:
      await click(screen.getByLabelText(/^Target Frequency$/));
      await click(screen.getByText('Custom', { exact: true }));
      setInput(/^Custom Days Between$/, '3');
      break;
  }
};

describe('GoalForm creation with real local storage', () => {
  beforeEach(() => {
    localStorage.clear();
    // The shared setup reports every element as display:none. Keep actual inline
    // visibility here so semantic role queries can exercise the real form.
    vi.spyOn(window, 'getComputedStyle').mockImplementation((element) =>
      element instanceof HTMLElement ? element.style : document.documentElement.style
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('offers all six enabled types', async () => {
    render(<CreationScreen />);
    await click(screen.getByLabelText(/^Goal Type/));
    for (const label of Object.values(TYPE_LABELS)) {
      expect(screen.getByText(label, { exact: true })).toBeInTheDocument();
    }
  });

  it.each(Object.values(GoalType))('creates, reloads and exports a %s goal through the form', async (type) => {
    const { unmount } = render(<CreationScreen />);
    await fillGoal(type);
    await click(screen.getByRole('button', { name: /^Create Goal$/ }));

    const output = await screen.findByLabelText('Created goal ID');
    const id = output.textContent ?? '';
    unmount();
    const restored = getGoal(id);
    expect(restored).not.toBeNull();
    expect(restored?.title).toBe(`Synthetic ${type}`);
    expect(restored?.type).toBe(type);
    expect(restored?.category).toBe('Integration fixtures');
    expect(restored?.progress).toBe(0);
    expect(restored?.createdAt).toBeInstanceOf(Date);
    expect(getAllGoals()).toHaveLength(1);

    switch (restored?.type) {
      case GoalType.QUANTITATIVE:
        expect(restored.startValue).toBe(0);
        expect(restored.targetValue).toBe(100);
        expect(restored.currentValue).toBe(0);
        expect(restored.unit).toBe('pages');
        break;
      case GoalType.QUALITATIVE:
        expect(restored.qualitativeStatus).toBe('not_started');
        expect(restored.targetRating).toBe(8);
        break;
      case GoalType.BINARY:
        expect(restored.currentCount).toBe(0);
        expect(restored.targetCount).toBe(3);
        break;
      case GoalType.MILESTONE:
        expect(restored.milestones.map((milestone) => milestone.title)).toEqual(['Prepare outline', 'Write draft']);
        expect(new Set(restored.milestones.map((milestone) => milestone.id)).size).toBe(2);
        break;
      case GoalType.RECURRING:
        expect(restored.recurrence).toEqual({ frequency: 'weekly', interval: 2 });
        expect(restored.completionStats.totalOccurrences).toBe(0);
        break;
      case GoalType.HABIT:
        expect(restored.targetFrequency).toBe('custom');
        expect(restored.customFrequency).toBe(3);
        expect(restored.entries).toEqual([]);
        break;
    }

    const exported = exportGoals();
    expect(exported.success).toBe(true);
    expect(exported.data?.goals).toHaveLength(1);
    expect(exported.data?.goals[0]?.id).toBe(id);
    expect(exported.data?.goals[0]?.type).toBe(type);
    expect(exported.data?.goals[0]?.createdAt).toBe(restored?.createdAt.toISOString());
  });

  it('shows a required title error and writes nothing', async () => {
    render(<CreationScreen />);
    await fillGoal(GoalType.BINARY, false);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await click(screen.getByRole('button', { name: /^Create Goal$/ }));

    await waitFor(() => expect(screen.getByLabelText(/^Title$/)).toHaveAttribute('aria-invalid', 'true'));
    expect(await screen.findByText('This field is required')).toBeInTheDocument();
    expect(screen.queryByLabelText('Created goal ID')).not.toBeInTheDocument();
    expect(getAllGoals()).toEqual([]);
    consoleError.mockRestore();
  });

  it('cancels a filled draft without creating any goal', async () => {
    const onCancel = vi.fn();
    render(<CreationScreen onCancel={onCancel} />);
    await fillGoal(GoalType.HABIT);
    await click(screen.getByRole('button', { name: /^Cancel$/ }));

    expect(onCancel).toHaveBeenCalledOnce();
    expect(screen.queryByLabelText('Created goal ID')).not.toBeInTheDocument();
    expect(getAllGoals()).toEqual([]);
  });

  it('reports a storage write failure without reporting creation success', async () => {
    render(<CreationScreen />);
    await fillGoal(GoalType.BINARY);
    getAllGoals();
    const originalSetItem = Storage.prototype.setItem.bind(localStorage);
    let shouldFail = true;
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string): void => {
      if (key === STORAGE_KEYS.GOALS_DATA && shouldFail) {
        shouldFail = false;
        throw new DOMException('Storage quota exceeded', 'QuotaExceededError');
      }
      originalSetItem(key, value);
    });
    await click(screen.getByRole('button', { name: /^Create Goal$/ }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/quota|storage/i);
    expect(screen.queryByLabelText('Created goal ID')).not.toBeInTheDocument();
    expect(getAllGoals()).toEqual([]);
  });
});
