import type { CreateGoalInput, Milestone, Recurrence, CompletionStats, HabitEntry } from '@/types/goal.types';

/**
 * Form values used by GoalForm (supports both create and edit flows)
 */
export interface GoalFormValues extends Omit<CreateGoalInput, 'startDate' | 'deadline'> {
  startDate?: Date | string;
  deadline?: Date | string;
  milestones?: Milestone[];
  recurrence?: Recurrence;
  completionStats?: CompletionStats;
  occurrences?: HabitEntry[];
  entries?: HabitEntry[];
}

export interface GoalTypeSpecificFields {
  quantitative?: {
    startValue?: number;
    targetValue?: number;
    currentValue?: number;
    unit?: string;
    allowDecimals?: boolean;
    minValue?: number;
    maxValue?: number;
  };
  qualitative?: {
    qualitativeStatus?: string;
    selfAssessments?: unknown[];
    improvementCriteria?: string[];
    targetRating?: number;
  };
  binary?: {
    targetCount?: number;
    currentCount?: number;
    items?: string[];
    allowPartialCompletion?: boolean;
  };
  milestone?: {
    milestones?: Milestone[];
    allowMilestoneReordering?: boolean;
    requireSequentialCompletion?: boolean;
  };
  recurring?: {
    recurrence?: Recurrence;
    completionStats?: CompletionStats;
    occurrences?: HabitEntry[];
  };
  habit?: {
    targetFrequency?: string;
    customFrequency?: number;
    completionStats?: CompletionStats;
    entries?: HabitEntry[];
    habitStrength?: number;
  };
}
