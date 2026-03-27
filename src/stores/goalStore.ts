import { create } from 'zustand';

export interface GoalStoreState {
  isCreating: boolean;
  createError?: string;
  setCreating: (value: boolean) => void;
  setCreateError: (error?: string) => void;
}

export const useGoalStore = create<GoalStoreState>((set) => ({
  isCreating: false,
  createError: undefined,
  setCreating: (value: boolean) => set({ isCreating: value }),
  setCreateError: (error?: string) => set({ createError: error }),
}));
