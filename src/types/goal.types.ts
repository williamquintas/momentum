/**
 * Momentum - TypeScript Type Definitions
 *
 * This file contains all TypeScript type definitions for Momentum.
 * All types are designed to be type-safe and support multiple goal types with comprehensive tracking.
 */

// ============================================================================
// Enums
// ============================================================================

export enum GoalType {
  QUANTITATIVE = 'quantitative',
  QUALITATIVE = 'qualitative',
  BINARY = 'binary',
  MILESTONE = 'milestone',
  RECURRING = 'recurring',
  HABIT = 'habit',
}

export enum GoalStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
}

export enum Priority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum RecurrenceFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export enum QualitativeStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

// ============================================================================
// Core Types
// ============================================================================

/**
 * Recurrence configuration for recurring goals
 */
export interface Recurrence {
  frequency: RecurrenceFrequency;
  interval: number;
  endDate?: Date;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  dayOfYear?: number;
}

/**
 * Individual milestone within a milestone goal
 */
export interface Milestone {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  dueDate?: Date;
  completedDate?: Date;
  order: number;
  dependencies?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Progress entry in the progress history
 */
export interface ProgressEntry {
  id: string;
  date: Date;
  value: number;
  note?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Note attached to a goal
 */
export interface Note {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tags?: string[];
}

/**
 * File attachment for a goal
 */
export interface Attachment {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
  uploadedBy: string;
}

/**
 * Self-assessment rating for qualitative goals
 */
export interface SelfAssessment {
  id: string;
  date: Date;
  rating: number;
  comment?: string;
  criteria?: Record<string, number>;
}

/**
 * Habit tracking entry
 */
export interface HabitEntry {
  id: string;
  date: Date;
  completed: boolean;
  value?: number;
  note?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Streak information for habits and recurring goals
 */
export interface Streak {
  current: number;
  longest: number;
  lastCompletedDate?: Date;
  startDate?: Date;
}

/**
 * Completion statistics for recurring and habit goals
 */
export interface CompletionStats {
  totalOccurrences: number;
  completedOccurrences: number;
  completionRate: number;
  streak: Streak;
  lastCompletedDate?: Date;
  firstCompletedDate?: Date;
}

// ============================================================================
// Goal Type-Specific Interfaces
// ============================================================================

/**
 * Base interface for all goal types
 */
export interface BaseGoal {
  id: string;
  title: string;
  description?: string;
  type: GoalType;
  status: GoalStatus;
  priority: Priority;
  category: string;
  tags: string[];
  startDate?: Date;
  deadline?: Date;
  completedDate?: Date;
  progress: number;
  progressHistory: ProgressEntry[];
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  assignee?: string;
  notes: Note[];
  attachments: Attachment[];
  relatedGoals: string[];
  archived?: boolean;
  favorite?: boolean;
}

/**
 * Quantitative Goal
 */
export interface QuantitativeGoal extends BaseGoal {
  type: GoalType.QUANTITATIVE;
  startValue: number;
  targetValue: number;
  currentValue: number;
  unit: string;
  allowDecimals: boolean;
  allowOverAchievement?: boolean;
  minValue?: number;
  maxValue?: number;
}

/**
 * Qualitative Goal
 */
export interface QualitativeGoal extends BaseGoal {
  type: GoalType.QUALITATIVE;
  qualitativeStatus: QualitativeStatus;
  selfAssessments: SelfAssessment[];
  improvementCriteria?: string[];
  targetRating?: number;
}

/**
 * Binary Goal
 */
export interface BinaryGoal extends BaseGoal {
  type: GoalType.BINARY;
  targetCount?: number;
  currentCount: number;
  items?: string[];
  allowPartialCompletion: boolean;
}

/**
 * Milestone Goal
 */
export interface MilestoneGoal extends BaseGoal {
  type: GoalType.MILESTONE;
  milestones: Milestone[];
  allowMilestoneReordering: boolean;
  requireSequentialCompletion: boolean;
}

/**
 * Recurring Goal
 */
export interface RecurringGoal extends BaseGoal {
  type: GoalType.RECURRING;
  recurrence: Recurrence;
  completionStats: CompletionStats;
  occurrences: HabitEntry[];
}

/**
 * Habit Goal
 */
export interface HabitGoal extends BaseGoal {
  type: GoalType.HABIT;
  targetFrequency: 'daily' | 'every_other_day' | 'weekly' | 'custom';
  customFrequency?: number;
  completionStats: CompletionStats;
  entries: HabitEntry[];
  habitStrength?: number;
}

// ============================================================================
// Union Type
// ============================================================================

export type Goal = QuantitativeGoal | QualitativeGoal | BinaryGoal | MilestoneGoal | RecurringGoal | HabitGoal;

// ============================================================================
// Type Guards
// ============================================================================

export function isQuantitativeGoal(goal: Goal): goal is QuantitativeGoal {
  return goal.type === GoalType.QUANTITATIVE;
}

export function isQualitativeGoal(goal: Goal): goal is QualitativeGoal {
  return goal.type === GoalType.QUALITATIVE;
}

export function isBinaryGoal(goal: Goal): goal is BinaryGoal {
  return goal.type === GoalType.BINARY;
}

export function isMilestoneGoal(goal: Goal): goal is MilestoneGoal {
  return goal.type === GoalType.MILESTONE;
}

export function isRecurringGoal(goal: Goal): goal is RecurringGoal {
  return goal.type === GoalType.RECURRING;
}

export function isHabitGoal(goal: Goal): goal is HabitGoal {
  return goal.type === GoalType.HABIT;
}

// ============================================================================
// DTO Types
// ============================================================================

export type CreateGoalInput =
  | (Omit<
      QuantitativeGoal,
      'id' | 'createdAt' | 'updatedAt' | 'progress' | 'progressHistory' | 'notes' | 'attachments' | 'type'
    > & { type: GoalType.QUANTITATIVE; progressHistory?: ProgressEntry[] })
  | (Omit<
      QualitativeGoal,
      'id' | 'createdAt' | 'updatedAt' | 'progress' | 'progressHistory' | 'notes' | 'attachments' | 'type'
    > & { type: GoalType.QUALITATIVE; progressHistory?: ProgressEntry[] })
  | (Omit<
      BinaryGoal,
      'id' | 'createdAt' | 'updatedAt' | 'progress' | 'progressHistory' | 'notes' | 'attachments' | 'type'
    > & { type: GoalType.BINARY; progressHistory?: ProgressEntry[] })
  | (Omit<
      MilestoneGoal,
      'id' | 'createdAt' | 'updatedAt' | 'progress' | 'progressHistory' | 'notes' | 'attachments' | 'type'
    > & { type: GoalType.MILESTONE; progressHistory?: ProgressEntry[] })
  | (Omit<
      RecurringGoal,
      'id' | 'createdAt' | 'updatedAt' | 'progress' | 'progressHistory' | 'notes' | 'attachments' | 'type'
    > & { type: GoalType.RECURRING; progressHistory?: ProgressEntry[] })
  | (Omit<
      HabitGoal,
      'id' | 'createdAt' | 'updatedAt' | 'progress' | 'progressHistory' | 'notes' | 'attachments' | 'type'
    > & { type: GoalType.HABIT; progressHistory?: ProgressEntry[] });

export type UpdateGoalInput = Partial<Omit<Goal, 'id' | 'createdAt' | 'createdBy'>> & {
  updatedAt: Date;
};

export interface GoalFilters {
  type?: GoalType[];
  status?: GoalStatus[];
  priority?: Priority[];
  category?: string[];
  tags?: string[];
  assignee?: string;
  createdBy?: string;
  startDateFrom?: Date;
  startDateTo?: Date;
  deadlineFrom?: Date;
  deadlineTo?: Date;
  search?: string;
  archived?: boolean;
  favorite?: boolean;
}

export type GoalSortField = 'createdAt' | 'updatedAt' | 'deadline' | 'priority' | 'progress' | 'title';

export type SortOrder = 'asc' | 'desc';

export interface GoalSortOptions {
  field: GoalSortField;
  order: SortOrder;
}

export interface ProgressCalculation {
  progress: number;
  isComplete: boolean;
  isOverdue: boolean;
  daysRemaining?: number;
  daysOverdue?: number;
  message?: string;
}
