/**
 * Data Import Service
 *
 * Handles importing goals from JSON format with Zod validation
 * and duplicate handling (latest-wins strategy).
 */

import { z } from 'zod';

import type { Goal } from '@/types/goal.types';

import { getAllGoals, restoreGoals, deserializeRestoredGoal } from './goalStorageService';
import type { SerializedGoal } from './storageTypes';

/**
 * Import validation error
 */
export class ImportValidationError extends Error {
  constructor(
    public errors: z.ZodError['issues'],
    message: string
  ) {
    super(message);
    this.name = 'ImportValidationError';
  }
}

/**
 * Duplicate handling strategy
 */
export type DuplicateStrategy = 'latest-wins' | 'skip' | 'replace';

/**
 * Result of an import operation
 */
export interface ImportResult {
  success: boolean;
  imported: number;
  updated: number;
  skipped: number;
  errors: string[];
}

/**
 * Parsed import data before validation
 */
export interface ParsedImportData {
  version?: string;
  exportedAt?: string;
  appVersion?: string;
  goals: unknown[];
}

/**
 * Zod schema for validating a serialized goal
 */
const dateSchema = z.string().datetime({ offset: true });
const completionStatsSchema = z.object({
  totalOccurrences: z.number().int().nonnegative(),
  completedOccurrences: z.number().int().nonnegative(),
  completionRate: z.number().min(0).max(100),
  streak: z.object({
    current: z.number().int().nonnegative(),
    longest: z.number().int().nonnegative(),
    lastCompletedDate: dateSchema.optional(),
    startDate: dateSchema.optional(),
  }),
  lastCompletedDate: dateSchema.optional(),
  firstCompletedDate: dateSchema.optional(),
});

const serializedGoalSchema = z
  .object({
    // Required fields
    id: z.string().uuid(),
    title: z.string().min(1),
    type: z.enum(['quantitative', 'qualitative', 'binary', 'milestone', 'recurring', 'habit']),
    status: z.enum(['active', 'completed', 'paused', 'cancelled']),
    priority: z.enum(['high', 'medium', 'low']),
    category: z.string(),
    tags: z.array(z.string()),
    progress: z.number().min(0),
    progressHistory: z.array(
      z.object({
        id: z.string().uuid(),
        date: dateSchema,
        value: z.number(),
        note: z.string().optional(),
        metadata: z.record(z.string(), z.unknown()).optional(),
      })
    ),
    createdAt: dateSchema,
    updatedAt: dateSchema,
    notes: z.array(
      z.object({
        id: z.string().uuid(),
        content: z.string(),
        createdAt: dateSchema,
        updatedAt: dateSchema,
        createdBy: z.string(),
        tags: z.array(z.string()).optional(),
      })
    ),
    attachments: z.array(
      z.object({
        id: z.string().uuid(),
        filename: z.string(),
        url: z.string(),
        mimeType: z.string(),
        size: z.number(),
        uploadedAt: dateSchema,
        uploadedBy: z.string(),
      })
    ),
    relatedGoals: z.array(z.string()),

    // Optional fields
    description: z.string().optional(),
    startDate: dateSchema.optional(),
    deadline: dateSchema.optional(),
    completedDate: dateSchema.optional(),
    createdBy: z.string().optional(),
    assignee: z.string().optional(),
    archived: z.boolean().optional(),
    favorite: z.boolean().optional(),

    // Type-specific fields
    // Quantitative
    startValue: z.number().optional(),
    targetValue: z.number().optional(),
    currentValue: z.number().optional(),
    unit: z.string().optional(),
    allowDecimals: z.boolean().optional(),
    allowOverAchievement: z.boolean().optional(),
    minValue: z.number().optional(),
    maxValue: z.number().optional(),

    // Qualitative
    qualitativeStatus: z.enum(['not_started', 'in_progress', 'completed']).optional(),
    selfAssessments: z
      .array(
        z.object({
          id: z.string().uuid(),
          date: dateSchema,
          rating: z.number().min(1).max(10),
          comment: z.string().optional(),
          criteria: z.record(z.string(), z.number()).optional(),
        })
      )
      .optional(),
    improvementCriteria: z.array(z.string()).optional(),
    targetRating: z.number().optional(),

    // Binary
    targetCount: z.number().optional(),
    currentCount: z.number().optional(),
    items: z.array(z.string()).optional(),
    allowPartialCompletion: z.boolean().optional(),

    // Milestone
    milestones: z
      .array(
        z.object({
          id: z.string().uuid(),
          title: z.string(),
          description: z.string().optional(),
          status: z.enum(['pending', 'in_progress', 'completed', 'skipped']),
          dueDate: dateSchema.optional(),
          completedDate: dateSchema.optional(),
          order: z.number(),
          dependencies: z.array(z.string()).optional(),
          metadata: z.record(z.string(), z.unknown()).optional(),
        })
      )
      .optional(),
    allowMilestoneReordering: z.boolean().optional(),
    requireSequentialCompletion: z.boolean().optional(),

    // Recurring
    recurrence: z
      .object({
        frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
        interval: z.number().int().positive(),
        endDate: dateSchema.optional(),
        daysOfWeek: z.array(z.number()).optional(),
        dayOfMonth: z.number().optional(),
        dayOfYear: z.number().optional(),
      })
      .optional(),
    occurrences: z
      .array(
        z.object({
          id: z.string().uuid(),
          date: dateSchema,
          completed: z.boolean(),
          value: z.number().optional(),
          note: z.string().optional(),
          metadata: z.record(z.string(), z.unknown()).optional(),
        })
      )
      .optional(),

    // Habit
    targetFrequency: z.enum(['daily', 'every_other_day', 'weekly', 'custom']).optional(),
    customFrequency: z.number().optional(),
    entries: z
      .array(
        z.object({
          id: z.string().uuid(),
          date: dateSchema,
          completed: z.boolean(),
          value: z.number().optional(),
          note: z.string().optional(),
          metadata: z.record(z.string(), z.unknown()).optional(),
        })
      )
      .optional(),
    completionStats: completionStatsSchema.optional(),
    habitStrength: z.number().min(0).max(100).optional(),
  })
  .superRefine((goal, context) => {
    const requiredFields: Record<string, string[]> = {
      quantitative: ['startValue', 'targetValue', 'currentValue', 'unit', 'allowDecimals'],
      qualitative: ['qualitativeStatus', 'selfAssessments'],
      binary: ['currentCount', 'allowPartialCompletion'],
      milestone: ['milestones', 'allowMilestoneReordering', 'requireSequentialCompletion'],
      recurring: ['recurrence', 'occurrences', 'completionStats'],
      habit: ['targetFrequency', 'entries', 'completionStats'],
    };
    for (const field of requiredFields[goal.type] ?? []) {
      if ((goal as Record<string, unknown>)[field] === undefined) {
        context.addIssue({ code: 'custom', path: [field], message: `Missing ${field} for ${goal.type} goal` });
      }
    }
    if (goal.progress > 100 && !(goal.type === 'quantitative' && goal.allowOverAchievement)) {
      context.addIssue({ code: 'custom', path: ['progress'], message: 'Progress exceeds the allowed target' });
    }
    if (
      goal.type === 'habit' &&
      goal.targetFrequency === 'custom' &&
      !(goal.customFrequency && goal.customFrequency > 0)
    ) {
      context.addIssue({ code: 'custom', path: ['customFrequency'], message: 'Custom frequency must be positive' });
    }
    if (goal.type === 'milestone' && goal.milestones) {
      const milestones = new Map(goal.milestones.map((milestone) => [milestone.id, milestone]));
      if (milestones.size !== goal.milestones.length) {
        context.addIssue({ code: 'custom', path: ['milestones'], message: 'Duplicate milestone identity' });
      }
      const visiting = new Set<string>();
      const visited = new Set<string>();
      const hasInvalidDependency = (id: string): boolean => {
        if (visiting.has(id) || !milestones.has(id)) return true;
        if (visited.has(id)) return false;
        visiting.add(id);
        const invalid = (milestones.get(id)?.dependencies ?? []).some(hasInvalidDependency);
        visiting.delete(id);
        visited.add(id);
        return invalid;
      };
      if (goal.milestones.some((milestone) => hasInvalidDependency(milestone.id))) {
        context.addIssue({ code: 'custom', path: ['milestones'], message: 'Missing or cyclic milestone dependency' });
      }
    }
  });

/**
 * Zod schema for validating export data
 */
export const importDataSchema = z.object({
  version: z.literal('1.0'),
  exportedAt: dateSchema,
  appVersion: z.string().optional(),
  goals: z.array(serializedGoalSchema),
});

/**
 * Parse JSON string to raw object
 */
export const parseImportJson = (jsonString: string): ParsedImportData => {
  try {
    return JSON.parse(jsonString) as ParsedImportData;
  } catch {
    throw new ImportValidationError([], 'Invalid JSON format. Please ensure the file is valid JSON.');
  }
};

/**
 * Validate import data against schema
 */
export const validateImportData = (data: ParsedImportData): z.infer<typeof importDataSchema> => {
  const result = importDataSchema.safeParse(data);

  if (!result.success) {
    throw new ImportValidationError(
      result.error.issues,
      'Validation failed. The imported data does not match the expected format.'
    );
  }

  return result.data;
};

/**
 * Find duplicates in existing goals
 * Returns map of goal ID -> existing goal if duplicate found
 */
const findDuplicate = (
  importedGoal: { id?: string; title: string; type: string },
  existingGoals: Goal[]
): Goal | null => {
  // First try to match by ID
  if (importedGoal.id) {
    const existingById = existingGoals.find((g) => g.id === importedGoal.id);
    if (existingById) {
      return existingById;
    }
  }

  // Then try to match by title + type
  const existingByTitleType = existingGoals.find((g) => g.title === importedGoal.title && g.type === importedGoal.type);

  return existingByTitleType || null;
};

/**
 * Import goals from validated data
 */
export const importGoals = (
  validatedData: z.infer<typeof importDataSchema>,
  strategy: DuplicateStrategy = 'latest-wins'
): ImportResult => {
  try {
    // Validate again at the write boundary; callers cannot bypass validation accidentally.
    const data = validateImportData(validatedData);
    const existing = getAllGoals();
    const candidates = [...existing];
    const aliases = new Map<string, string>();
    const pending = new Map<string, Goal>();
    const existingIds = new Set(existing.map((goal) => goal.id));
    let skipped = 0;

    for (const serialized of data.goals) {
      const duplicate = findDuplicate({ ...serialized, id: aliases.get(serialized.id) ?? serialized.id }, candidates);
      const id = duplicate?.id ?? serialized.id;
      aliases.set(serialized.id, id);
      if (
        duplicate &&
        (strategy === 'skip' ||
          (strategy === 'latest-wins' && new Date(serialized.updatedAt).getTime() <= duplicate.updatedAt.getTime()))
      ) {
        skipped++;
        continue;
      }
      const goal = deserializeRestoredGoal({ ...serialized, id } as unknown as SerializedGoal);
      pending.set(id, goal);
      const index = candidates.findIndex((candidate) => candidate.id === id);
      if (index < 0) candidates.push(goal);
      else candidates[index] = goal;
    }

    const availableIds = new Set(candidates.map((goal) => goal.id));
    for (const goal of pending.values()) {
      goal.relatedGoals = goal.relatedGoals.map((id) => aliases.get(id) ?? id);
      if (goal.relatedGoals.some((id) => !availableIds.has(id))) {
        throw new ImportValidationError(
          [],
          `Goal "${goal.title}" refers to a goal that is not in the backup or storage.`
        );
      }
    }
    // The whole plan is persisted once. Counts describe committed identities, not attempted writes.
    restoreGoals([...pending.values()]);
    const updated = [...pending.keys()].filter((id) => existingIds.has(id)).length;
    return { success: true, imported: pending.size - updated, updated, skipped, errors: [] };
  } catch (error) {
    return {
      success: false,
      imported: 0,
      updated: 0,
      skipped: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error during import'],
    };
  }
};

/**
 * Preview import without actually importing
 * Returns summary of what would happen
 */
export const previewImport = (
  validatedData: z.infer<typeof importDataSchema>
): { newGoals: number; duplicates: number } => {
  const data = validateImportData(validatedData);
  const existingGoals = getAllGoals();
  const aliases = new Map<string, string>();
  let newGoals = 0;
  let duplicates = 0;

  for (const serializedGoal of data.goals) {
    const duplicate = findDuplicate(
      {
        id: aliases.get(serializedGoal.id) ?? serializedGoal.id,
        title: serializedGoal.title,
        type: serializedGoal.type,
      },
      existingGoals
    );
    aliases.set(serializedGoal.id, duplicate?.id ?? serializedGoal.id);

    if (duplicate) {
      duplicates++;
    } else {
      newGoals++;
      existingGoals.push(deserializeRestoredGoal(serializedGoal as unknown as SerializedGoal));
    }
  }

  return { newGoals, duplicates };
};
