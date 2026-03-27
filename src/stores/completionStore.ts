/**
 * Completion Store
 *
 * Zustand store for managing goal completion state
 */

import { create } from 'zustand';

import type { CompletionEvent, CompletionOptions } from '@/features/goals/types/completion';
import { getCelebrationForGoal } from '@/features/goals/utils/celebrationEngine';
import { calculateCompletionMetrics } from '@/features/goals/utils/completionMetrics';
import { validateCompletionEligibility } from '@/features/goals/utils/completionValidation';
import {
  saveCompletion as persistCompletion,
  loadCompletions,
  deleteCompletion as removeCompletion,
} from '@/services/storage/goalStorageService';
import type { SerializedCompletionEvent } from '@/services/storage/storageTypes';
import type { Goal } from '@/types/goal.types';

const serializeCompletion = (completion: CompletionEvent): SerializedCompletionEvent => ({
  id: completion.id,
  goalId: completion.goalId,
  completedAt: completion.completedAt,
  completionType: completion.completionType,
  finalProgress: completion.finalProgress,
  metrics: completion.metrics as SerializedCompletionEvent['metrics'],
  celebration: completion.celebration as SerializedCompletionEvent['celebration'],
  note: completion.note,
  overrideReason: completion.overrideReason,
});

const deserializeCompletion = (data: Record<string, unknown>): CompletionEvent => ({
  id: data.id as string,
  goalId: data.goalId as string,
  completedAt: data.completedAt as number,
  completionType: data.completionType as 'manual' | 'automatic' | 'override',
  finalProgress: data.finalProgress as number,
  metrics: data.metrics as CompletionEvent['metrics'],
  celebration: data.celebration as CompletionEvent['celebration'],
  note: data.note as string | undefined,
  overrideReason: data.overrideReason as string | undefined,
});

const loadPersistedCompletions = (): Map<string, CompletionEvent> => {
  const map = new Map<string, CompletionEvent>();
  const data = loadCompletions();
  Object.entries(data).forEach(([goalId, serialized]) => {
    map.set(goalId, deserializeCompletion(serialized as unknown as Record<string, unknown>));
  });
  return map;
};

interface CompletionStoreState {
  completions: Map<string, CompletionEvent>;
  pendingCompletions: Set<string>;
  isLoading: boolean;
  error?: string;

  // Actions
  checkEligibility: (goal: Goal) => boolean;
  completeGoal: (goal: Goal, options?: CompletionOptions) => Promise<CompletionEvent | null>;
  deleteCompletion: (goalId: string) => void;
  getCompletion: (goalId: string) => CompletionEvent | undefined;
  getCompletionHistory: (goalId: string) => CompletionEvent[];
  clearError: () => void;
}

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

export const useCompletionStore = create<CompletionStoreState>((set, get) => ({
  completions: loadPersistedCompletions(),
  pendingCompletions: new Set(),
  isLoading: false,
  error: undefined,

  checkEligibility: (goal: Goal) => {
    const validation = validateCompletionEligibility(goal);
    return validation.valid;
  },

  completeGoal: async (goal: Goal, options: CompletionOptions = {}) => {
    set({ isLoading: true, error: undefined });

    try {
      // Validate eligibility
      const validation = validateCompletionEligibility(goal);
      if (!validation.valid && !options.force) {
        throw new Error(validation.reason || 'Goal is not eligible for completion');
      }

      // Calculate metrics
      const history = goal.progressHistory || [];
      const metrics = calculateCompletionMetrics(goal, history);

      // Get celebration data
      const celebration = getCelebrationForGoal(goal, options.celebration);

      // Create completion event
      const completion: CompletionEvent = {
        id: generateUUID(),
        goalId: goal.id,
        completedAt: Date.now(),
        completionType: options.manual ? 'manual' : options.force ? 'override' : 'automatic',
        finalProgress: goal.progress,
        metrics,
        celebration,
        note: options.note,
        overrideReason: options.overrideReason,
      };

      // Persist to storage
      persistCompletion(serializeCompletion(completion));

      // Update completions map
      set((state) => {
        const newCompletions = new Map(state.completions);
        newCompletions.set(goal.id, completion);
        return { completions: newCompletions, isLoading: false };
      });

      return completion;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown error completing goal';
      set({ error, isLoading: false });
      return null;
    }
  },

  getCompletion: (goalId: string) => {
    return get().completions.get(goalId);
  },

  getCompletionHistory: (goalId: string) => {
    const completion = get().completions.get(goalId);
    return completion ? [completion] : [];
  },

  deleteCompletion: (goalId: string) => {
    removeCompletion(goalId);
    set((state) => {
      const newCompletions = new Map(state.completions);
      newCompletions.delete(goalId);
      return { completions: newCompletions };
    });
  },

  clearError: () => set({ error: undefined }),
}));

/**
 * Hook to check if a goal can be completed
 */
export function useCompletionEligibility(goalId: string | undefined) {
  const checkEligibility = useCompletionStore((state) => state.checkEligibility);
  const pendingCompletions = useCompletionStore((state) => state.pendingCompletions);

  // This would be connected to actual goal data in real implementation
  // For now, return a placeholder
  const isPending = goalId ? pendingCompletions.has(goalId) : false;

  return {
    isPending,
    canComplete: false, // Would be determined by checking actual goal
    checkEligibility,
  };
}

/**
 * Hook to get completion data for a goal
 */
export function useGoalCompletion(goalId: string | undefined) {
  const getCompletion = useCompletionStore((state) => state.getCompletion);
  const getCompletionHistory = useCompletionStore((state) => state.getCompletionHistory);

  if (!goalId) {
    return {
      completion: undefined,
      history: [],
      hasCompletion: false,
    };
  }

  const completion = getCompletion(goalId);
  const history = getCompletionHistory(goalId);

  return {
    completion,
    history,
    hasCompletion: !!completion,
  };
}
