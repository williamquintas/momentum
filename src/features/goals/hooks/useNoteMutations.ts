/**
 * Note Mutation Hooks
 *
 * Hooks for adding, updating, and deleting notes on goals.
 * Uses React Query mutations with optimistic updates.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Goal, Note } from '@/features/goals/types';
import { queryKeys } from '@/utils/queryKeys';

const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export interface AddNoteInput {
  goalId: string;
  content: string;
  tags?: string[];
}

export interface UpdateNoteInput {
  goalId: string;
  noteId: string;
  content: string;
  tags?: string[];
}

export interface DeleteNoteInput {
  goalId: string;
  noteId: string;
}

const goalService = {
  addNote: async (input: AddNoteInput): Promise<Goal> => {
    const storage = await import('@/services/storage/goalStorageService');
    const goal = storage.getGoal(input.goalId);
    if (!goal) throw new Error('Goal not found');

    const newNote: Note = {
      id: generateUUID(),
      content: input.content,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'current-user',
      tags: input.tags,
    };

    return storage.updateGoal(input.goalId, {
      notes: [...goal.notes, newNote],
      updatedAt: new Date(),
    });
  },

  updateNote: async (input: UpdateNoteInput): Promise<Goal> => {
    const storage = await import('@/services/storage/goalStorageService');
    const goal = storage.getGoal(input.goalId);
    if (!goal) throw new Error('Goal not found');

    const updatedNotes = goal.notes.map((note) => {
      if (note.id === input.noteId) {
        return {
          ...note,
          content: input.content,
          tags: input.tags,
          updatedAt: new Date(),
        };
      }
      return note;
    });

    return storage.updateGoal(input.goalId, {
      notes: updatedNotes,
      updatedAt: new Date(),
    });
  },

  deleteNote: async (input: DeleteNoteInput): Promise<Goal> => {
    const storage = await import('@/services/storage/goalStorageService');
    const goal = storage.getGoal(input.goalId);
    if (!goal) throw new Error('Goal not found');

    const filteredNotes = goal.notes.filter((note) => note.id !== input.noteId);

    return storage.updateGoal(input.goalId, {
      notes: filteredNotes,
      updatedAt: new Date(),
    });
  },
};

export const useAddNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddNoteInput) => goalService.addNote(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.goals.detail(input.goalId) });
      await queryClient.cancelQueries({ queryKey: queryKeys.goals.lists() });

      const previousGoal = queryClient.getQueryData<Goal>(queryKeys.goals.detail(input.goalId));

      if (previousGoal) {
        const newNote: Note = {
          id: generateUUID(),
          content: input.content,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'current-user',
          tags: input.tags,
        };

        queryClient.setQueryData<Goal>(queryKeys.goals.detail(input.goalId), {
          ...previousGoal,
          notes: [...previousGoal.notes, newNote],
          updatedAt: new Date(),
        });
      }

      return { previousGoal };
    },
    onError: (_error, variables, context) => {
      if (context?.previousGoal) {
        queryClient.setQueryData(queryKeys.goals.detail(variables.goalId), context.previousGoal);
      }
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(queryKeys.goals.detail(variables.goalId), data);
      void queryClient.invalidateQueries({ queryKey: queryKeys.goals.lists() });
    },
  });
};

export const useUpdateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateNoteInput) => goalService.updateNote(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.goals.detail(input.goalId) });
      await queryClient.cancelQueries({ queryKey: queryKeys.goals.lists() });

      const previousGoal = queryClient.getQueryData<Goal>(queryKeys.goals.detail(input.goalId));

      if (previousGoal) {
        const updatedNotes = previousGoal.notes.map((note) => {
          if (note.id === input.noteId) {
            return {
              ...note,
              content: input.content,
              tags: input.tags,
              updatedAt: new Date(),
            };
          }
          return note;
        });

        queryClient.setQueryData<Goal>(queryKeys.goals.detail(input.goalId), {
          ...previousGoal,
          notes: updatedNotes,
          updatedAt: new Date(),
        });
      }

      return { previousGoal };
    },
    onError: (_error, variables, context) => {
      if (context?.previousGoal) {
        queryClient.setQueryData(queryKeys.goals.detail(variables.goalId), context.previousGoal);
      }
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(queryKeys.goals.detail(variables.goalId), data);
      void queryClient.invalidateQueries({ queryKey: queryKeys.goals.lists() });
    },
  });
};

export const useDeleteNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DeleteNoteInput) => goalService.deleteNote(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.goals.detail(input.goalId) });
      await queryClient.cancelQueries({ queryKey: queryKeys.goals.lists() });

      const previousGoal = queryClient.getQueryData<Goal>(queryKeys.goals.detail(input.goalId));

      if (previousGoal) {
        const filteredNotes = previousGoal.notes.filter((note) => note.id !== input.noteId);

        queryClient.setQueryData<Goal>(queryKeys.goals.detail(input.goalId), {
          ...previousGoal,
          notes: filteredNotes,
          updatedAt: new Date(),
        });
      }

      return { previousGoal };
    },
    onError: (_error, variables, context) => {
      if (context?.previousGoal) {
        queryClient.setQueryData(queryKeys.goals.detail(variables.goalId), context.previousGoal);
      }
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(queryKeys.goals.detail(variables.goalId), data);
      void queryClient.invalidateQueries({ queryKey: queryKeys.goals.lists() });
    },
  });
};
