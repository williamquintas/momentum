import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useAddNote, useDeleteNote, useUpdateNote } from '@/features/goals/hooks/useNoteMutations';
import { GoalStatus, GoalType, Priority, type Goal } from '@/features/goals/types';
import { getGoal, updateGoal } from '@/services/storage/goalStorageService';
import { queryKeys } from '@/utils/queryKeys';

vi.mock('@/services/storage/goalStorageService', () => ({ getGoal: vi.fn(), updateGoal: vi.fn() }));

const NOW = new Date('2026-11-04T12:00:00.000Z');
const CREATED = new Date('2026-11-01T12:00:00.000Z');
type Operation = 'add' | 'edit' | 'delete';

const makeGoal = (): Goal => ({
  id: 'goal-1',
  title: 'Practice piano',
  type: GoalType.BINARY,
  status: GoalStatus.ACTIVE,
  priority: Priority.MEDIUM,
  category: 'Music',
  tags: [],
  currentCount: 0,
  allowPartialCompletion: false,
  progress: 0,
  progressHistory: [],
  createdAt: CREATED,
  updatedAt: CREATED,
  attachments: [],
  relatedGoals: [],
  notes: ['note-1', 'note-2'].map((id) => ({
    id,
    content: `Original ${id}`,
    createdAt: CREATED,
    updatedAt: CREATED,
    createdBy: 'current-user',
    tags: ['practice'],
  })),
});

describe('note mutations', () => {
  let queryClient: QueryClient;
  let persistedGoal: Goal;
  const detailKey = queryKeys.goals.detail('goal-1');
  const listKey = queryKeys.goals.list();

  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
    persistedGoal = makeGoal();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } },
    });
    queryClient.setQueryData(detailKey, persistedGoal);
    queryClient.setQueryData(listKey, [persistedGoal]);
    vi.mocked(getGoal).mockImplementation(() => persistedGoal);
    vi.mocked(updateGoal).mockImplementation((_id, input) => {
      persistedGoal = { ...persistedGoal, ...input } as Goal;
      return persistedGoal;
    });
  });

  afterEach(() => {
    queryClient.clear();
    vi.useRealTimers();
  });

  const setup = () => {
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children);
    return renderHook(() => ({ add: useAddNote(), edit: useUpdateNote(), delete: useDeleteNote() }), { wrapper });
  };

  const mutate = (
    mutations: ReturnType<typeof setup>['result']['current'],
    operation: Operation,
    content = 'Revised practice plan'
  ): Promise<Goal> => {
    switch (operation) {
      case 'add':
        return mutations.add.mutateAsync({ goalId: 'goal-1', content, tags: ['lesson'] });
      case 'edit':
        return mutations.edit.mutateAsync({ goalId: 'goal-1', noteId: 'note-1', content, tags: ['lesson'] });
      case 'delete':
        return mutations.delete.mutateAsync({ goalId: 'goal-1', noteId: 'note-1' });
    }
    throw new Error('Unknown note operation');
  };

  it('adds content, tags and dates while preserving existing notes', async () => {
    const originalNotes = persistedGoal.notes;
    const { result } = setup();
    await act(async () => {
      await mutate(result.current, 'add');
    });

    expect(persistedGoal.notes).toHaveLength(3);
    expect(persistedGoal.notes.slice(0, 2)).toEqual(originalNotes);
    expect(persistedGoal.notes[2]?.id).toMatch(/^[0-9a-f-]{36}$/i);
    expect(persistedGoal.notes[2]).toEqual({
      id: persistedGoal.notes[2]?.id,
      content: 'Revised practice plan',
      tags: ['lesson'],
      createdAt: NOW,
      updatedAt: NOW,
      createdBy: 'current-user',
    });
    expect(queryClient.getQueryData(detailKey)).toEqual(persistedGoal);
    expect(queryClient.getQueryState(listKey)?.isInvalidated).toBe(true);
  });

  it('edits only the chosen note and preserves identity and creation date', async () => {
    const untouchedNote = persistedGoal.notes[1];
    const { result } = setup();
    await act(async () => {
      await mutate(result.current, 'edit');
    });

    expect(persistedGoal.notes).toHaveLength(2);
    expect(persistedGoal.notes[0]).toEqual({
      id: 'note-1',
      content: 'Revised practice plan',
      tags: ['lesson'],
      createdAt: CREATED,
      updatedAt: NOW,
      createdBy: 'current-user',
    });
    expect(persistedGoal.notes[1]).toEqual(untouchedNote);
    expect(queryClient.getQueryData(detailKey)).toEqual(persistedGoal);
    expect(queryClient.getQueryState(listKey)?.isInvalidated).toBe(true);
  });

  it('deletes only the chosen note and refreshes the cache', async () => {
    const remainingNote = persistedGoal.notes[1];
    const { result } = setup();
    await act(async () => {
      await mutate(result.current, 'delete');
    });

    expect(persistedGoal.notes).toEqual([remainingNote]);
    expect(queryClient.getQueryData(detailKey)).toEqual(persistedGoal);
    expect(queryClient.getQueryState(listKey)?.isInvalidated).toBe(true);
  });

  it.each<Operation>(['add', 'edit', 'delete'])(
    'rolls back optimistic %s when persistence fails',
    async (operation) => {
      const original = persistedGoal;
      const error = new Error('Storage quota exceeded');
      const { result } = setup();
      vi.mocked(updateGoal).mockImplementation(() => {
        expect(queryClient.getQueryData<Goal>(detailKey)?.notes).not.toEqual(original.notes);
        throw error;
      });

      await act(async () => {
        await expect(mutate(result.current, operation)).rejects.toThrow(error);
      });

      expect(updateGoal).toHaveBeenCalledOnce();
      expect(persistedGoal).toEqual(original);
      expect(queryClient.getQueryData(detailKey)).toEqual(original);
      expect(queryClient.getQueryData(listKey)).toEqual([original]);
      expect(queryClient.getQueryState(listKey)?.isInvalidated).toBe(false);
    }
  );

  it.each<Operation>(['add', 'edit', 'delete'])('does not write a missing goal during %s', async (operation) => {
    vi.mocked(getGoal).mockReturnValue(null);
    const original = persistedGoal;
    const { result } = setup();
    await act(async () => {
      await expect(mutate(result.current, operation)).rejects.toThrow('Goal not found');
    });

    expect(updateGoal).not.toHaveBeenCalled();
    expect(queryClient.getQueryData(detailKey)).toEqual(original);
  });

  it.each<Operation>(['add', 'edit'])('accepts a 5000-character note during %s', async (operation) => {
    const content = 'a'.repeat(5000);
    const { result } = setup();
    await act(async () => {
      await mutate(result.current, operation, content);
    });

    expect(persistedGoal.notes.some((note) => note.content === content)).toBe(true);
    expect(queryClient.getQueryData(detailKey)).toEqual(persistedGoal);
  });

  it.each(['', '   ', 'a'.repeat(5001)])('rejects invalid content without persisting changes (%#)', async (content) => {
    const original = persistedGoal;
    const { result } = setup();
    for (const operation of ['add', 'edit'] as const) {
      await act(async () => {
        await expect(mutate(result.current, operation, content)).rejects.toThrow();
      });
      expect(queryClient.getQueryData(detailKey)).toEqual(original);
    }
    expect(updateGoal).not.toHaveBeenCalled();
    expect(persistedGoal).toEqual(original);
  });
});
