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
  interval: number; // e.g., every 2 weeks (interval: 2, frequency: 'weekly')
  endDate?: Date; // Optional end date for recurring goals
  daysOfWeek?: number[]; // For weekly: [1,3,5] = Monday, Wednesday, Friday
  dayOfMonth?: number; // For monthly: day of month (1-31)
  dayOfYear?: number; // For yearly: day of year (1-365)
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
  order: number; // For ordering milestones
  dependencies?: string[]; // IDs of milestones that must be completed first
  metadata?: Record<string, unknown>;
}

/**
 * Progress entry in the progress history
 */
export interface ProgressEntry {
  id: string;
  date: Date;
  value: number; // Progress value (0-100 for percentage, or actual value for quantitative)
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
  size: number; // in bytes
  uploadedAt: Date;
  uploadedBy: string;
}

/**
 * Self-assessment rating for qualitative goals
 */
export interface SelfAssessment {
  id: string;
  date: Date;
  rating: number; // 1-10 scale or custom scale
  comment?: string;
  criteria?: Record<string, number>; // Multiple criteria ratings
}

/**
 * Habit tracking entry
 */
export interface HabitEntry {
  id: string;
  date: Date;
  completed: boolean;
  value?: number; // Optional numeric value for the habit
  note?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Streak information for habits and recurring goals
 */
export interface Streak {
  current: number; // Current streak count
  longest: number; // Longest streak ever achieved
  lastCompletedDate?: Date;
  startDate?: Date;
}

/**
 * Completion statistics for recurring and habit goals
 */
export interface CompletionStats {
  totalOccurrences: number;
  completedOccurrences: number;
  completionRate: number; // Percentage (0-100)
  streak: Streak;
  lastCompletedDate?: Date;
  firstCompletedDate?: Date;
}

// ============================================================================
// Goal Type-Specific Interfaces
// ============================================================================

/**
 * Base interface for all goal types
 * Contains common fields shared across all goal types
 */
export interface BaseGoal {
  id: string;
  title: string;
  description: string;
  type: GoalType;
  status: GoalStatus;
  priority: Priority;
  category: string;
  tags: string[];

  // Time-based fields
  startDate?: Date;
  deadline?: Date;
  completedDate?: Date;

  // Progress tracking
  progress: number; // 0-100 percentage
  progressHistory: ProgressEntry[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  assignee?: string;

  // Additional
  notes: Note[];
  attachments: Attachment[];
  relatedGoals: string[];

  // UI/Display
  archived?: boolean;
  favorite?: boolean;
}

/**
 * Quantitative Goal
 * Numeric goals with start/target/current values
 */
export interface QuantitativeGoal extends BaseGoal {
  type: GoalType.QUANTITATIVE;
  startValue: number;
  targetValue: number;
  currentValue: number;
  unit: string; // e.g., 'kg', 'miles', 'hours', 'dollars'
  allowDecimals: boolean;
  minValue?: number;
  maxValue?: number;
}

/**
 * Qualitative Goal
 * Descriptive goals with status tracking and self-assessment
 */
export interface QualitativeGoal extends BaseGoal {
  type: GoalType.QUALITATIVE;
  qualitativeStatus: QualitativeStatus;
  selfAssessments: SelfAssessment[];
  improvementCriteria?: string[]; // Criteria for measuring improvement
  targetRating?: number; // Target self-assessment rating (1-10)
}

/**
 * Binary Goal
 * Checkbox-style goals with count-based progress
 */
export interface BinaryGoal extends BaseGoal {
  type: GoalType.BINARY;
  targetCount?: number; // e.g., "Visit 5 countries" (targetCount: 5)
  currentCount: number;
  items?: string[]; // List of items to check off (e.g., country names)
  allowPartialCompletion: boolean;
}

/**
 * Milestone Goal
 * Goals with sub-milestones that must be completed
 */
export interface MilestoneGoal extends BaseGoal {
  type: GoalType.MILESTONE;
  milestones: Milestone[];
  allowMilestoneReordering: boolean;
  requireSequentialCompletion: boolean; // If true, milestones must be completed in order
}

/**
 * Recurring Goal
 * Goals that repeat on a schedule
 */
export interface RecurringGoal extends BaseGoal {
  type: GoalType.RECURRING;
  recurrence: Recurrence;
  completionStats: CompletionStats;
  occurrences: HabitEntry[]; // Historical completion data
}

/**
 * Habit Goal
 * Daily/consistent behavior goals with streak tracking
 */
export interface HabitGoal extends BaseGoal {
  type: GoalType.HABIT;
  targetFrequency: 'daily' | 'every_other_day' | 'weekly' | 'custom';
  customFrequency?: number; // Days between occurrences for custom frequency
  completionStats: CompletionStats;
  entries: HabitEntry[]; // Historical habit entries
  habitStrength?: number; // Calculated habit strength (0-100)
}

// ============================================================================
// Union Type
// ============================================================================

/**
 * Main Goal type - union of all goal type interfaces
 */
export type Goal = QuantitativeGoal | QualitativeGoal | BinaryGoal | MilestoneGoal | RecurringGoal | HabitGoal;

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Type guard to check if a goal is a QuantitativeGoal
 */
export function isQuantitativeGoal(goal: Goal): goal is QuantitativeGoal {
  return goal.type === GoalType.QUANTITATIVE;
}

/**
 * Type guard to check if a goal is a QualitativeGoal
 */
export function isQualitativeGoal(goal: Goal): goal is QualitativeGoal {
  return goal.type === GoalType.QUALITATIVE;
}

/**
 * Type guard to check if a goal is a BinaryGoal
 */
export function isBinaryGoal(goal: Goal): goal is BinaryGoal {
  return goal.type === GoalType.BINARY;
}

/**
 * Type guard to check if a goal is a MilestoneGoal
 */
export function isMilestoneGoal(goal: Goal): goal is MilestoneGoal {
  return goal.type === GoalType.MILESTONE;
}

/**
 * Type guard to check if a goal is a RecurringGoal
 */
export function isRecurringGoal(goal: Goal): goal is RecurringGoal {
  return goal.type === GoalType.RECURRING;
}

/**
 * Type guard to check if a goal is a HabitGoal
 */
export function isHabitGoal(goal: Goal): goal is HabitGoal {
  return goal.type === GoalType.HABIT;
}

// ============================================================================
// DTO Types (for API communication)
// ============================================================================

/**
 * Goal creation input (what the user provides when creating a goal)
 */
export type CreateGoalInput = Omit<
  Goal,
  'id' | 'createdAt' | 'updatedAt' | 'progress' | 'progressHistory' | 'notes' | 'attachments'
> & {
  progressHistory?: ProgressEntry[];
};

/**
 * Goal update input (partial update)
 */
export type UpdateGoalInput = Partial<Omit<Goal, 'id' | 'createdAt' | 'createdBy'>> & {
  updatedAt: Date;
};

/**
 * Goal filter/query parameters
 */
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
  search?: string; // Search in title and description
  archived?: boolean;
  favorite?: boolean;
}

/**
 * Goal sort options
 */
export type GoalSortField = 'createdAt' | 'updatedAt' | 'deadline' | 'priority' | 'progress' | 'title';

export type SortOrder = 'asc' | 'desc';

export interface GoalSortOptions {
  field: GoalSortField;
  order: SortOrder;
}

// ============================================================================
// Progress Calculation Types
// ============================================================================

/**
 * Progress calculation result
 */
export interface ProgressCalculation {
  progress: number; // 0-100
  isComplete: boolean;
  isOverdue: boolean;
  daysRemaining?: number;
  daysOverdue?: number;
  message?: string; // Human-readable progress message
}

// ============================================================================
// All types are already exported above
// ============================================================================
