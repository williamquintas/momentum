/**
 * Goal Tracking System - Validation Schemas
 * 
 * This file contains Zod validation schemas for all goal-related data structures.
 * These schemas ensure data integrity and type safety at runtime.
 * 
 * @requires zod
 */

import { z } from 'zod';

// ============================================================================
// Base Enums and Primitives
// ============================================================================

export const GoalTypeSchema = z.enum([
  'quantitative',
  'qualitative',
  'binary',
  'milestone',
  'recurring',
  'habit',
]);

export const GoalStatusSchema = z.enum(['active', 'completed', 'paused', 'cancelled']);

export const PrioritySchema = z.enum(['high', 'medium', 'low']);

export const RecurrenceFrequencySchema = z.enum(['daily', 'weekly', 'monthly', 'yearly']);

export const QualitativeStatusSchema = z.enum(['not_started', 'in_progress', 'completed']);

// ============================================================================
// Date Validation Helpers
// ============================================================================

const dateSchema = z.union([z.date(), z.string().datetime()]).transform((val) => {
  if (typeof val === 'string') {
    return new Date(val);
  }
  return val;
});

// ============================================================================
// Nested Schemas
// ============================================================================

/**
 * Recurrence configuration schema
 */
export const RecurrenceSchema = z
  .object({
    frequency: RecurrenceFrequencySchema,
    interval: z.number().int().positive().default(1),
    endDate: dateSchema.optional(),
    daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(), // 0 = Sunday, 6 = Saturday
    dayOfMonth: z.number().int().min(1).max(31).optional(),
    dayOfYear: z.number().int().min(1).max(365).optional(),
  })
  .refine(
    (data) => {
      if (data.frequency === 'weekly' && data.daysOfWeek) {
        return data.daysOfWeek.length > 0;
      }
      return true;
    },
    { message: 'Weekly recurrence must specify at least one day of week' }
  );

/**
 * Milestone schema
 */
export const MilestoneSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'skipped']),
  dueDate: dateSchema.optional(),
  completedDate: dateSchema.optional(),
  order: z.number().int().nonnegative(),
  dependencies: z.array(z.string().uuid()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Progress entry schema
 */
export const ProgressEntrySchema = z.object({
  id: z.string().uuid(),
  date: dateSchema,
  value: z.number().min(0).max(100),
  note: z.string().max(500).optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Note schema
 */
export const NoteSchema = z.object({
  id: z.string().uuid(),
  content: z.string().min(1).max(5000),
  createdAt: dateSchema,
  updatedAt: dateSchema,
  createdBy: z.string().min(1),
  tags: z.array(z.string()).optional(),
});

/**
 * Attachment schema
 */
export const AttachmentSchema = z.object({
  id: z.string().uuid(),
  filename: z.string().min(1).max(255),
  url: z.string().url(),
  mimeType: z.string().min(1),
  size: z.number().int().nonnegative(),
  uploadedAt: dateSchema,
  uploadedBy: z.string().min(1),
});

/**
 * Self-assessment schema
 */
export const SelfAssessmentSchema = z.object({
  id: z.string().uuid(),
  date: dateSchema,
  rating: z.number().min(1).max(10),
  comment: z.string().max(1000).optional(),
  criteria: z.record(z.number().min(1).max(10)).optional(),
});

/**
 * Habit entry schema
 */
export const HabitEntrySchema = z.object({
  id: z.string().uuid(),
  date: dateSchema,
  completed: z.boolean(),
  value: z.number().optional(),
  note: z.string().max(500).optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Streak schema
 */
export const StreakSchema = z.object({
  current: z.number().int().nonnegative(),
  longest: z.number().int().nonnegative(),
  lastCompletedDate: dateSchema.optional(),
  startDate: dateSchema.optional(),
});

/**
 * Completion stats schema
 */
export const CompletionStatsSchema = z.object({
  totalOccurrences: z.number().int().nonnegative(),
  completedOccurrences: z.number().int().nonnegative(),
  completionRate: z.number().min(0).max(100),
  streak: StreakSchema,
  lastCompletedDate: dateSchema.optional(),
  firstCompletedDate: dateSchema.optional(),
});

// ============================================================================
// Base Goal Schema
// ============================================================================

const BaseGoalSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  type: GoalTypeSchema,
  status: GoalStatusSchema,
  priority: PrioritySchema,
  category: z.string().min(1).max(100),
  tags: z.array(z.string().max(50)).default([]),
  startDate: dateSchema.optional(),
  deadline: dateSchema.optional(),
  completedDate: dateSchema.optional(),
  progress: z.number().min(0).max(100),
  progressHistory: z.array(ProgressEntrySchema).default([]),
  createdAt: dateSchema,
  updatedAt: dateSchema,
  createdBy: z.string().min(1),
  assignee: z.string().min(1).optional(),
  notes: z.array(NoteSchema).default([]),
  attachments: z.array(AttachmentSchema).default([]),
  relatedGoals: z.array(z.string().uuid()).default([]),
  archived: z.boolean().default(false),
  favorite: z.boolean().default(false),
});

// ============================================================================
// Goal Type-Specific Schemas
// ============================================================================

/**
 * Quantitative Goal Schema
 */
export const QuantitativeGoalSchema = BaseGoalSchema.extend({
  type: z.literal('quantitative'),
  startValue: z.number(),
  targetValue: z.number(),
  currentValue: z.number(),
  unit: z.string().min(1).max(20),
  allowDecimals: z.boolean().default(false),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
})
  .refine(
    (data) => {
      if (data.minValue !== undefined && data.maxValue !== undefined) {
        return data.minValue <= data.maxValue;
      }
      return true;
    },
    { message: 'minValue must be less than or equal to maxValue' }
  )
  .refine(
    (data) => {
      if (data.minValue !== undefined) {
        return data.startValue >= data.minValue && data.currentValue >= data.minValue;
      }
      return true;
    },
    { message: 'startValue and currentValue must be >= minValue' }
  )
  .refine(
    (data) => {
      if (data.maxValue !== undefined) {
        return data.startValue <= data.maxValue && data.currentValue <= data.maxValue;
      }
      return true;
    },
    { message: 'startValue and currentValue must be <= maxValue' }
  )
  .refine(
    (data) => {
      if (!data.allowDecimals) {
        return (
          Number.isInteger(data.startValue) &&
          Number.isInteger(data.targetValue) &&
          Number.isInteger(data.currentValue)
        );
      }
      return true;
    },
    { message: 'Values must be integers when allowDecimals is false' }
  );

/**
 * Qualitative Goal Schema
 */
export const QualitativeGoalSchema = BaseGoalSchema.extend({
  type: z.literal('qualitative'),
  qualitativeStatus: QualitativeStatusSchema,
  selfAssessments: z.array(SelfAssessmentSchema).default([]),
  improvementCriteria: z.array(z.string().max(200)).optional(),
  targetRating: z.number().min(1).max(10).optional(),
});

/**
 * Binary Goal Schema
 */
export const BinaryGoalSchema = BaseGoalSchema.extend({
  type: z.literal('binary'),
  targetCount: z.number().int().positive().optional(),
  currentCount: z.number().int().nonnegative().default(0),
  items: z.array(z.string().min(1).max(200)).optional(),
  allowPartialCompletion: z.boolean().default(true),
}).refine(
  (data) => {
    if (data.targetCount !== undefined) {
      return data.currentCount <= data.targetCount;
    }
    return true;
  },
  { message: 'currentCount cannot exceed targetCount' }
);

/**
 * Milestone Goal Schema
 */
export const MilestoneGoalSchema = BaseGoalSchema.extend({
  type: z.literal('milestone'),
  milestones: z.array(MilestoneSchema).min(1),
  allowMilestoneReordering: z.boolean().default(false),
  requireSequentialCompletion: z.boolean().default(false),
}).refine(
  (data) => {
    // Ensure milestone IDs are unique
    const ids = data.milestones.map((m) => m.id);
    return new Set(ids).size === ids.length;
  },
  { message: 'Milestone IDs must be unique' }
)
  .refine(
    (data) => {
      // Validate dependencies reference existing milestones
      const milestoneIds = new Set(data.milestones.map((m) => m.id));
      for (const milestone of data.milestones) {
        if (milestone.dependencies) {
          for (const depId of milestone.dependencies) {
            if (!milestoneIds.has(depId)) {
              return false;
            }
          }
        }
      }
      return true;
    },
    { message: 'Milestone dependencies must reference existing milestones' }
  )
  .refine(
    (data) => {
      // Ensure no circular dependencies
      const visited = new Set<string>();
      const visiting = new Set<string>();

      const hasCycle = (milestoneId: string): boolean => {
        if (visiting.has(milestoneId)) {
          return true; // Circular dependency detected
        }
        if (visited.has(milestoneId)) {
          return false;
        }

        visiting.add(milestoneId);
        const milestone = data.milestones.find((m) => m.id === milestoneId);
        if (milestone?.dependencies) {
          for (const depId of milestone.dependencies) {
            if (hasCycle(depId)) {
              return true;
            }
          }
        }
        visiting.delete(milestoneId);
        visited.add(milestoneId);
        return false;
      };

      for (const milestone of data.milestones) {
        if (hasCycle(milestone.id)) {
          return false;
        }
      }
      return true;
    },
    { message: 'Milestone dependencies cannot form cycles' }
  );

/**
 * Recurring Goal Schema
 */
export const RecurringGoalSchema = BaseGoalSchema.extend({
  type: z.literal('recurring'),
  recurrence: RecurrenceSchema,
  completionStats: CompletionStatsSchema,
  occurrences: z.array(HabitEntrySchema).default([]),
});

/**
 * Habit Goal Schema
 */
export const HabitGoalSchema = BaseGoalSchema.extend({
  type: z.literal('habit'),
  targetFrequency: z.enum(['daily', 'every_other_day', 'weekly', 'custom']),
  customFrequency: z.number().int().positive().optional(),
  completionStats: CompletionStatsSchema,
  entries: z.array(HabitEntrySchema).default([]),
  habitStrength: z.number().min(0).max(100).optional(),
}).refine(
  (data) => {
    if (data.targetFrequency === 'custom') {
      return data.customFrequency !== undefined;
    }
    return true;
  },
  { message: 'customFrequency is required when targetFrequency is custom' }
);

// ============================================================================
// Union Goal Schema
// ============================================================================

/**
 * Main Goal schema - discriminated union of all goal types
 */
export const GoalSchema: z.ZodType<any> = z.discriminatedUnion('type', [
  QuantitativeGoalSchema,
  QualitativeGoalSchema,
  BinaryGoalSchema,
  MilestoneGoalSchema,
  RecurringGoalSchema,
  HabitGoalSchema,
]);

// ============================================================================
// Input/Output Schemas
// ============================================================================

/**
 * Create Goal Input Schema
 */
export const CreateGoalInputSchema = GoalSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  progressHistory: true,
  notes: true,
  attachments: true,
}).extend({
  progressHistory: z.array(ProgressEntrySchema).optional(),
});

/**
 * Update Goal Input Schema (partial)
 */
export const UpdateGoalInputSchema = GoalSchema.partial().extend({
  id: z.string().uuid(),
  updatedAt: dateSchema,
});

/**
 * Goal Filters Schema
 */
export const GoalFiltersSchema = z.object({
  type: z.array(GoalTypeSchema).optional(),
  status: z.array(GoalStatusSchema).optional(),
  priority: z.array(PrioritySchema).optional(),
  category: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  assignee: z.string().optional(),
  createdBy: z.string().optional(),
  startDateFrom: dateSchema.optional(),
  startDateTo: dateSchema.optional(),
  deadlineFrom: dateSchema.optional(),
  deadlineTo: dateSchema.optional(),
  search: z.string().optional(),
  archived: z.boolean().optional(),
  favorite: z.boolean().optional(),
});

/**
 * Goal Sort Options Schema
 */
export const GoalSortOptionsSchema = z.object({
  field: z.enum(['createdAt', 'updatedAt', 'deadline', 'priority', 'progress', 'title']),
  order: z.enum(['asc', 'desc']),
});

// ============================================================================
// Progress Calculation Validation
// ============================================================================

/**
 * Progress update input schema
 */
export const UpdateProgressInputSchema = z.object({
  goalId: z.string().uuid(),
  value: z.number().min(0).max(100),
  note: z.string().max(500).optional(),
  date: dateSchema.optional(),
});

/**
 * Quantitative goal value update schema
 */
export const UpdateQuantitativeValueSchema = z.object({
  goalId: z.string().uuid(),
  currentValue: z.number(),
  note: z.string().max(500).optional(),
});

// ============================================================================
// Export Types (inferred from schemas)
// ============================================================================

export type GoalType = z.infer<typeof GoalTypeSchema>;
export type GoalStatus = z.infer<typeof GoalStatusSchema>;
export type Priority = z.infer<typeof PrioritySchema>;
export type Recurrence = z.infer<typeof RecurrenceSchema>;
export type Milestone = z.infer<typeof MilestoneSchema>;
export type ProgressEntry = z.infer<typeof ProgressEntrySchema>;
export type Note = z.infer<typeof NoteSchema>;
export type Attachment = z.infer<typeof AttachmentSchema>;
export type SelfAssessment = z.infer<typeof SelfAssessmentSchema>;
export type HabitEntry = z.infer<typeof HabitEntrySchema>;
export type Streak = z.infer<typeof StreakSchema>;
export type CompletionStats = z.infer<typeof CompletionStatsSchema>;
export type Goal = z.infer<typeof GoalSchema>;
export type CreateGoalInput = z.infer<typeof CreateGoalInputSchema>;
export type UpdateGoalInput = z.infer<typeof UpdateGoalInputSchema>;
export type GoalFilters = z.infer<typeof GoalFiltersSchema>;
export type GoalSortOptions = z.infer<typeof GoalSortOptionsSchema>;
export type UpdateProgressInput = z.infer<typeof UpdateProgressInputSchema>;
export type UpdateQuantitativeValue = z.infer<typeof UpdateQuantitativeValueSchema>;

