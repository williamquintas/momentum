import { GoalType } from '@/types/goal.types';
import type {
  Milestone,
  Recurrence,
  CompletionStats,
  HabitEntry,
  RecurrenceFrequency,
  CreateGoalInput,
  QuantitativeGoal,
  QualitativeGoal,
  BinaryGoal,
  MilestoneGoal,
  RecurringGoal,
  HabitGoal,
} from '@/types/goal.types';

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

export const getDefaultCompletionStats = (): CompletionStats => ({
  totalOccurrences: 0,
  completedOccurrences: 0,
  completionRate: 0,
  streak: { current: 0, longest: 0 },
});

export const getDefaultMilestone = (): Milestone => ({
  id: generateUUID(),
  title: 'First milestone',
  description: '',
  status: 'pending',
  order: 0,
  dependencies: [],
  metadata: undefined,
});

export const getDefaultRecurrence = (): Recurrence => ({
  frequency: 'daily' as RecurrenceFrequency,
  interval: 1,
});

export const getDefaultHabitEntry = (): HabitEntry => ({
  id: generateUUID(),
  date: new Date(),
  completed: false,
});

export const initializeGoalForType = (input: CreateGoalInput): CreateGoalInput => {
  switch (input.type) {
    case GoalType.QUANTITATIVE: {
      const qInput = input as QuantitativeGoal;
      return {
        title: input.title,
        description: input.description,
        status: input.status || 'active',
        priority: input.priority || 'medium',
        category: input.category,
        tags: input.tags || [],
        startDate: input.startDate,
        deadline: input.deadline,
        relatedGoals: input.relatedGoals || [],
        archived: input.archived ?? false,
        favorite: input.favorite ?? false,
        progressHistory: input.progressHistory,
        type: GoalType.QUANTITATIVE,
        startValue: qInput.startValue ?? 0,
        targetValue: qInput.targetValue ?? 1,
        currentValue: qInput.currentValue ?? qInput.startValue ?? 0,
        unit: qInput.unit || 'units',
        allowDecimals: qInput.allowDecimals ?? false,
        minValue: qInput.minValue,
        maxValue: qInput.maxValue,
      };
    }

    case GoalType.QUALITATIVE: {
      const qInput = input as QualitativeGoal;
      return {
        title: input.title,
        description: input.description,
        status: input.status || 'active',
        priority: input.priority || 'medium',
        category: input.category,
        tags: input.tags || [],
        startDate: input.startDate,
        deadline: input.deadline,
        relatedGoals: input.relatedGoals || [],
        archived: input.archived ?? false,
        favorite: input.favorite ?? false,
        progressHistory: input.progressHistory,
        type: GoalType.QUALITATIVE,
        qualitativeStatus: qInput.qualitativeStatus || 'not_started',
        selfAssessments: qInput.selfAssessments || [],
        improvementCriteria: qInput.improvementCriteria,
        targetRating: qInput.targetRating,
      };
    }

    case GoalType.BINARY: {
      const bInput = input as BinaryGoal;
      return {
        title: input.title,
        description: input.description,
        status: input.status || 'active',
        priority: input.priority || 'medium',
        category: input.category,
        tags: input.tags || [],
        startDate: input.startDate,
        deadline: input.deadline,
        relatedGoals: input.relatedGoals || [],
        archived: input.archived ?? false,
        favorite: input.favorite ?? false,
        progressHistory: input.progressHistory,
        type: GoalType.BINARY,
        targetCount: bInput.targetCount,
        currentCount: bInput.currentCount ?? 0,
        items: bInput.items,
        allowPartialCompletion: bInput.allowPartialCompletion ?? true,
      };
    }

    case GoalType.MILESTONE: {
      const mInput = input as MilestoneGoal;
      return {
        title: input.title,
        description: input.description,
        status: input.status || 'active',
        priority: input.priority || 'medium',
        category: input.category,
        tags: input.tags || [],
        startDate: input.startDate,
        deadline: input.deadline,
        relatedGoals: input.relatedGoals || [],
        archived: input.archived ?? false,
        favorite: input.favorite ?? false,
        progressHistory: input.progressHistory,
        type: GoalType.MILESTONE,
        milestones: mInput.milestones && mInput.milestones.length > 0 ? mInput.milestones : [getDefaultMilestone()],
        allowMilestoneReordering: mInput.allowMilestoneReordering ?? false,
        requireSequentialCompletion: mInput.requireSequentialCompletion ?? false,
      };
    }

    case GoalType.RECURRING: {
      const rInput = input as RecurringGoal;
      return {
        title: input.title,
        description: input.description,
        status: input.status || 'active',
        priority: input.priority || 'medium',
        category: input.category,
        tags: input.tags || [],
        startDate: input.startDate,
        deadline: input.deadline,
        relatedGoals: input.relatedGoals || [],
        archived: input.archived ?? false,
        favorite: input.favorite ?? false,
        progressHistory: input.progressHistory,
        type: GoalType.RECURRING,
        recurrence: rInput.recurrence || getDefaultRecurrence(),
        completionStats: rInput.completionStats || getDefaultCompletionStats(),
        occurrences: rInput.occurrences || [],
      };
    }

    case GoalType.HABIT: {
      const hInput = input as HabitGoal;
      return {
        title: input.title,
        description: input.description,
        status: input.status || 'active',
        priority: input.priority || 'medium',
        category: input.category,
        tags: input.tags || [],
        startDate: input.startDate,
        deadline: input.deadline,
        relatedGoals: input.relatedGoals || [],
        archived: input.archived ?? false,
        favorite: input.favorite ?? false,
        progressHistory: input.progressHistory,
        type: GoalType.HABIT,
        targetFrequency: hInput.targetFrequency || 'daily',
        customFrequency: hInput.customFrequency,
        completionStats: hInput.completionStats || getDefaultCompletionStats(),
        entries: hInput.entries || [],
        habitStrength: hInput.habitStrength ?? 0,
      };
    }

    default:
      return input;
  }
};

export const isMilestoneDependencyCyclic = (milestones: Milestone[]): boolean => {
  const graph = new Map<string, string[]>();

  milestones.forEach((milestone) => {
    graph.set(milestone.id, milestone.dependencies || []);
  });

  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  const dfs = (id: string): boolean => {
    if (recursionStack.has(id)) return true;
    if (visited.has(id)) return false;

    visited.add(id);
    recursionStack.add(id);

    for (const neighbor of graph.get(id) ?? []) {
      if (dfs(neighbor)) return true;
    }

    recursionStack.delete(id);
    return false;
  };

  for (const id of graph.keys()) {
    if (dfs(id)) return true;
  }

  return false;
};
