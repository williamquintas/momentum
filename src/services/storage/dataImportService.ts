/**
 * Data Import Service
 *
 * Handles importing goals from JSON format with Zod validation
 * and duplicate handling (latest-wins strategy).
 */

import { z } from 'zod';

import { GoalType, GoalStatus, Priority, type CreateGoalInput, type Goal } from '@/types/goal.types';

import { getAllGoals, createGoal, updateGoal } from './goalStorageService';

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
const serializedGoalSchema = z.object({
  // Required fields
  id: z.string().uuid(),
  title: z.string().min(1),
  type: z.enum(['quantitative', 'qualitative', 'binary', 'milestone', 'recurring', 'habit']),
  status: z.enum(['active', 'completed', 'paused', 'cancelled']),
  priority: z.enum(['high', 'medium', 'low']),
  category: z.string(),
  tags: z.array(z.string()),
  progress: z.number().min(0).max(100),
  progressHistory: z.array(
    z.object({
      id: z.string().uuid(),
      date: z.string(),
      value: z.number(),
      note: z.string().optional(),
      metadata: z.record(z.string(), z.unknown()).optional(),
    })
  ),
  createdAt: z.string(),
  updatedAt: z.string(),
  notes: z.array(
    z.object({
      id: z.string().uuid(),
      content: z.string(),
      createdAt: z.string(),
      updatedAt: z.string(),
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
      uploadedAt: z.string(),
      uploadedBy: z.string(),
    })
  ),
  relatedGoals: z.array(z.string()),

  // Optional fields
  description: z.string().optional(),
  startDate: z.string().optional(),
  deadline: z.string().optional(),
  completedDate: z.string().optional(),
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
        date: z.string(),
        rating: z.number(),
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
        dueDate: z.string().optional(),
        completedDate: z.string().optional(),
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
      interval: z.number(),
      endDate: z.string().optional(),
      daysOfWeek: z.array(z.number()).optional(),
      dayOfMonth: z.number().optional(),
      dayOfYear: z.number().optional(),
    })
    .optional(),
  occurrences: z
    .array(
      z.object({
        id: z.string().uuid(),
        date: z.string(),
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
        date: z.string(),
        completed: z.boolean(),
        value: z.number().optional(),
        note: z.string().optional(),
        metadata: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .optional(),
});

/**
 * Zod schema for validating export data
 */
export const importDataSchema = z.object({
  version: z.string(),
  exportedAt: z.string(),
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
 * Convert string to GoalType enum
 */
const stringToGoalType = (type: string): GoalType => {
  return GoalType[type.toUpperCase() as keyof typeof GoalType] ?? GoalType.QUANTITATIVE;
};

/**
 * Convert string to GoalStatus enum
 */
const stringToGoalStatus = (status: string): GoalStatus => {
  return GoalStatus[status.toUpperCase() as keyof typeof GoalStatus] ?? GoalStatus.ACTIVE;
};

/**
 * Convert string to Priority enum
 */
const stringToPriority = (priority: string): Priority => {
  return Priority[priority.toUpperCase() as keyof typeof Priority] ?? Priority.MEDIUM;
};

/**
 * Create a CreateGoalInput from serialized data
 */
const convertToCreateGoalInput = (serialized: z.infer<typeof serializedGoalSchema>): CreateGoalInput => {
  const deserializeDate = (dateStr?: string): Date | undefined => {
    return dateStr ? new Date(dateStr) : undefined;
  };

  const baseInput = {
    ...serialized,
    type: stringToGoalType(serialized.type),
    status: stringToGoalStatus(serialized.status),
    priority: stringToPriority(serialized.priority),
    startDate: deserializeDate(serialized.startDate),
    deadline: deserializeDate(serialized.deadline),
    completedDate: deserializeDate(serialized.completedDate),
    createdAt: new Date(serialized.createdAt),
    updatedAt: new Date(serialized.updatedAt),
    progressHistory: serialized.progressHistory.map((entry) => ({
      id: entry.id,
      date: new Date(entry.date),
      value: entry.value,
      note: entry.note,
      metadata: entry.metadata,
    })),
  };

  // Handle milestones
  if (serialized.milestones) {
    (baseInput as Record<string, unknown>).milestones = serialized.milestones.map((milestone) => ({
      id: milestone.id,
      title: milestone.title,
      description: milestone.description,
      status: milestone.status,
      dueDate: deserializeDate(milestone.dueDate),
      completedDate: deserializeDate(milestone.completedDate),
      order: milestone.order,
      dependencies: milestone.dependencies,
      metadata: milestone.metadata,
    }));
  }

  // Handle occurrences (recurring goals)
  if (serialized.occurrences) {
    (baseInput as Record<string, unknown>).occurrences = serialized.occurrences.map((entry) => ({
      id: entry.id,
      date: new Date(entry.date),
      completed: entry.completed,
      value: entry.value,
      note: entry.note,
      metadata: entry.metadata,
    }));
  }

  // Handle entries (habit goals)
  if (serialized.entries) {
    (baseInput as Record<string, unknown>).entries = serialized.entries.map((entry) => ({
      id: entry.id,
      date: new Date(entry.date),
      completed: entry.completed,
      value: entry.value,
      note: entry.note,
      metadata: entry.metadata,
    }));
  }

  return baseInput as unknown as CreateGoalInput;
};

/**
 * Import goals from validated data
 */
export const importGoals = (
  validatedData: z.infer<typeof importDataSchema>,
  strategy: DuplicateStrategy = 'latest-wins'
): ImportResult => {
  const errors: string[] = [];
  let importedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  // Get existing goals for duplicate detection
  const existingGoals = getAllGoals();

  for (const serializedGoal of validatedData.goals) {
    try {
      // Find duplicate
      const duplicate = findDuplicate(
        { id: serializedGoal.id, title: serializedGoal.title, type: serializedGoal.type },
        existingGoals
      );

      const goalInput = convertToCreateGoalInput(serializedGoal);

      if (duplicate) {
        // Compare timestamps for latest-wins
        const importedDate = new Date(serializedGoal.updatedAt);
        const existingDate = new Date(duplicate.updatedAt);

        if (importedDate > existingDate) {
          // Import is newer, update existing
          if (strategy === 'replace' || strategy === 'latest-wins') {
            updateGoal(duplicate.id, { ...goalInput, updatedAt: new Date() });
            updatedCount++;
          } else {
            skippedCount++;
          }
        } else {
          // Existing is newer, skip
          skippedCount++;
        }
      } else {
        // No duplicate, create new goal
        createGoal(goalInput);
        importedCount++;
      }
    } catch (error) {
      const goalTitle = serializedGoal.title || 'Unknown';
      errors.push(`Failed to import "${goalTitle}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return {
    success: errors.length === 0,
    imported: importedCount,
    updated: updatedCount,
    skipped: skippedCount,
    errors,
  };
};

/**
 * Preview import without actually importing
 * Returns summary of what would happen
 */
export const previewImport = (
  validatedData: z.infer<typeof importDataSchema>
): { newGoals: number; duplicates: number } => {
  const existingGoals = getAllGoals();
  let newGoals = 0;
  let duplicates = 0;

  for (const serializedGoal of validatedData.goals) {
    const duplicate = findDuplicate(
      { id: serializedGoal.id, title: serializedGoal.title, type: serializedGoal.type },
      existingGoals
    );

    if (duplicate) {
      duplicates++;
    } else {
      newGoals++;
    }
  }

  return { newGoals, duplicates };
};
