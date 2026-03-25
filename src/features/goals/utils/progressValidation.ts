/**
 * Progress Validation Utilities
 *
 * Validates progress updates according to business rules.
 * Implements FR-016 and duplicate detection per FR-014.
 */

import type {
  Goal,
  QuantitativeGoal,
  BinaryGoal,
  MilestoneGoal,
  HabitGoal,
  RecurringGoal,
  ProgressEntry,
} from '@/features/goals/types';
import {
  isQuantitativeGoal,
  isBinaryGoal,
  isMilestoneGoal,
  isRecurringGoal,
  isHabitGoal,
} from '@/features/goals/types';

import type { ProgressUpdate, DuplicateDetectionResult, ProgressValidationResult } from '../types/progress';

const DEFAULT_DUPLICATE_WINDOW_MS = 60000;

export interface ValidationContext {
  goal: Goal;
  value: number | undefined;
  history: ProgressEntry[];
}

/**
 * Validate a quantitative progress update
 */
export function validateQuantitativeUpdate(
  goal: QuantitativeGoal,
  newValue: number | undefined,
  _history: ProgressEntry[]
): ProgressValidationResult {
  const errors: string[] = [];

  if (newValue === undefined) {
    errors.push('Current value is required');
    return { isValid: false, errors };
  }

  if (goal.minValue !== undefined && newValue < goal.minValue) {
    errors.push(`Value must be at least ${goal.minValue}`);
  }

  if (goal.maxValue !== undefined && newValue > goal.maxValue) {
    errors.push(`Value must be at most ${goal.maxValue}`);
  }

  if (!goal.allowDecimals && !Number.isInteger(newValue)) {
    errors.push('This goal does not allow decimal values');
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate a binary progress update
 */
export function validateBinaryUpdate(
  goal: BinaryGoal,
  newCount: number | undefined,
  _history: ProgressEntry[]
): ProgressValidationResult {
  const errors: string[] = [];

  if (newCount === undefined) {
    errors.push('Current count is required');
    return { isValid: false, errors };
  }

  if (newCount < 0) {
    errors.push('Count cannot be negative');
  }

  if (goal.targetCount !== undefined && goal.targetCount > 0) {
    if (newCount > goal.targetCount && !goal.allowPartialCompletion) {
      errors.push(`Count cannot exceed target of ${goal.targetCount}`);
    }
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Check if milestone dependencies are met
 * Implements BR-027: Milestones cannot be completed if dependencies are incomplete
 */
export function getUnmetDependencies(
  milestone: MilestoneGoal['milestones'][0],
  allMilestones: MilestoneGoal['milestones']
): string[] {
  if (!milestone.dependencies || milestone.dependencies.length === 0) {
    return [];
  }

  return milestone.dependencies.filter((depId) => {
    const dep = allMilestones.find((m) => m.id === depId);
    return !dep || (dep.status !== 'completed' && dep.status !== 'skipped');
  });
}

/**
 * Check if a milestone can be completed
 * Implements BR-027: Validates dependencies and sequential completion rules
 */
export function canCompleteMilestone(
  milestoneId: string,
  milestones: MilestoneGoal['milestones'],
  requireSequentialCompletion: boolean
): { canComplete: boolean; reason?: string } {
  const milestone = milestones.find((m) => m.id === milestoneId);

  if (!milestone) {
    return { canComplete: false, reason: 'Milestone not found' };
  }

  if (milestone.status === 'completed') {
    return { canComplete: false, reason: 'Milestone is already completed' };
  }

  if (milestone.status === 'skipped') {
    return { canComplete: false, reason: 'Milestone is skipped' };
  }

  const unmetDeps = getUnmetDependencies(milestone, milestones);
  if (unmetDeps.length > 0) {
    const depTitles = unmetDeps.map((id) => milestones.find((m) => m.id === id)?.title || id).join(', ');
    return { canComplete: false, reason: `Unmet dependencies must be completed first: ${depTitles}` };
  }

  if (requireSequentialCompletion) {
    const milestoneIndex = milestones.findIndex((m) => m.id === milestoneId);
    const previousMilestone = milestones[milestoneIndex - 1];

    if (previousMilestone && previousMilestone.status !== 'completed' && previousMilestone.status !== 'skipped') {
      return { canComplete: false, reason: `Previous milestone "${previousMilestone.title}" must be completed first` };
    }
  }

  return { canComplete: true };
}

/**
 * Validate a milestone progress update
 */
export function validateMilestoneUpdate(
  goal: MilestoneGoal,
  milestoneId: string,
  completed: boolean,
  _history: ProgressEntry[]
): ProgressValidationResult {
  const errors: string[] = [];

  const milestone = goal.milestones.find((m) => m.id === milestoneId);
  if (!milestone) {
    errors.push('Milestone not found');
    return { isValid: false, errors };
  }

  if (completed && milestone.status === 'completed') {
    errors.push('Milestone is already completed');
  }

  if (completed && milestone.dependencies && milestone.dependencies.length > 0) {
    const unmetDependencies = milestone.dependencies.filter((depId) => {
      const dep = goal.milestones.find((m) => m.id === depId);
      return !dep || dep.status !== 'completed';
    });

    if (unmetDependencies.length > 0) {
      const depTitles = unmetDependencies.map((id) => goal.milestones.find((m) => m.id === id)?.title || id).join(', ');
      errors.push(`Unmet dependencies: ${depTitles}`);
    }
  }

  if (completed && goal.requireSequentialCompletion) {
    const milestoneIndex = goal.milestones.findIndex((m) => m.id === milestoneId);
    const previousMilestone = goal.milestones[milestoneIndex - 1];

    if (previousMilestone && previousMilestone.status !== 'completed' && previousMilestone.status !== 'skipped') {
      errors.push(`Previous milestone "${previousMilestone.title}" must be completed first`);
    }
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate a habit progress update
 */
export function validateHabitUpdate(
  _goal: HabitGoal,
  date: Date,
  _completed: boolean,
  _history: ProgressEntry[]
): ProgressValidationResult {
  const errors: string[] = [];

  if (!date || isNaN(date.getTime())) {
    errors.push('Valid date is required');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const updateDate = new Date(date);
  updateDate.setHours(0, 0, 0, 0);

  if (updateDate > today) {
    errors.push('Cannot mark future dates as completed');
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate a recurring goal progress update
 */
export function validateRecurringUpdate(
  _goal: RecurringGoal,
  _occurrenceId: string,
  status: 'pending' | 'completed' | 'missed',
  _history: ProgressEntry[]
): ProgressValidationResult {
  const errors: string[] = [];

  if (!['pending', 'completed', 'missed'].includes(status)) {
    errors.push('Invalid status value');
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Detect duplicate progress updates
 * Implements FR-014: detect duplicate updates within 1 minute window
 */
export function detectDuplicateUpdate(
  goalId: string,
  newUpdate: { value: number; timestamp: number },
  history: ProgressEntry[],
  timeWindow: number = DEFAULT_DUPLICATE_WINDOW_MS
): DuplicateDetectionResult {
  const recentUpdates = history.filter((entry) => {
    const timeDiff = Math.abs(newUpdate.timestamp - entry.date.getTime());
    return timeDiff <= timeWindow;
  });

  for (const entry of recentUpdates) {
    if (entry.value === newUpdate.value) {
      return {
        isDuplicate: true,
        originalUpdate: {
          id: entry.id,
          goalId,
          timestamp: entry.date.getTime(),
          note: entry.note,
          type: 'quantitative',
          previousValue: 0,
          newValue: entry.value,
          unit: '',
          calculatedProgress: entry.value,
        } as ProgressUpdate,
        timeDifference: Math.abs(newUpdate.timestamp - entry.date.getTime()),
      };
    }
  }

  return { isDuplicate: false };
}

/**
 * Validate update timestamp
 */
export function validateUpdateTimestamp(timestamp: number): ProgressValidationResult {
  const errors: string[] = [];

  if (!timestamp || isNaN(timestamp)) {
    errors.push('Invalid timestamp');
    return { isValid: false, errors };
  }

  const now = Date.now();
  const oneYearFromNow = now + 365 * 24 * 60 * 60 * 1000;
  const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000;

  if (timestamp > oneYearFromNow) {
    errors.push('Timestamp cannot be more than 1 year in the future');
  }

  if (timestamp < oneYearAgo) {
    errors.push('Timestamp cannot be more than 1 year in the past');
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Generic progress validation dispatcher
 */
export function validateProgressUpdate(
  goal: Goal,
  typeSpecificData: {
    type: 'quantitative' | 'binary' | 'milestone' | 'recurring' | 'habit' | 'qualitative';
    value?: number;
    milestoneId?: string;
    completed?: boolean;
    date?: Date;
    status?: string;
    occurrenceId?: string;
    occurrenceStatus?: 'pending' | 'completed' | 'missed';
  },
  history: ProgressEntry[]
): ProgressValidationResult {
  switch (typeSpecificData.type) {
    case 'quantitative':
      if (!isQuantitativeGoal(goal)) {
        return { isValid: false, errors: ['Goal is not a quantitative goal'] };
      }
      return validateQuantitativeUpdate(goal, typeSpecificData.value, history);

    case 'binary':
      if (!isBinaryGoal(goal)) {
        return { isValid: false, errors: ['Goal is not a binary goal'] };
      }
      return validateBinaryUpdate(goal, typeSpecificData.value, history);

    case 'milestone':
      if (!isMilestoneGoal(goal)) {
        return { isValid: false, errors: ['Goal is not a milestone goal'] };
      }
      if (!typeSpecificData.milestoneId || typeSpecificData.completed === undefined) {
        return { isValid: false, errors: ['Milestone ID and completion status required'] };
      }
      return validateMilestoneUpdate(goal, typeSpecificData.milestoneId, typeSpecificData.completed, history);

    case 'habit':
      if (!isHabitGoal(goal)) {
        return { isValid: false, errors: ['Goal is not a habit goal'] };
      }
      if (!typeSpecificData.date || typeSpecificData.completed === undefined) {
        return { isValid: false, errors: ['Date and completion status required'] };
      }
      return validateHabitUpdate(goal, typeSpecificData.date, typeSpecificData.completed, history);

    case 'recurring':
      if (!isRecurringGoal(goal)) {
        return { isValid: false, errors: ['Goal is not a recurring goal'] };
      }
      if (!typeSpecificData.occurrenceId || !typeSpecificData.occurrenceStatus) {
        return { isValid: false, errors: ['Occurrence ID and status required'] };
      }
      return validateRecurringUpdate(goal, typeSpecificData.occurrenceId, typeSpecificData.occurrenceStatus, history);

    default:
      return { isValid: false, errors: ['Unknown goal type'] };
  }
}
