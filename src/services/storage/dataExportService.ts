/**
 * Data Export Service
 *
 * Handles exporting goals data to JSON format with schema versioning
 * for backup and restore functionality.
 */

import type { Goal } from '@/types/goal.types';
import { APP_VERSION } from '@/utils/constants';

import { getAllGoals } from './goalStorageService';
import type {
  SerializedGoal,
  SerializedProgressEntry,
  SerializedMilestone,
  SerializedHabitEntry,
} from './storageTypes';

/**
 * Current schema version for export format
 */
export const EXPORT_SCHEMA_VERSION = '1.0';
export { APP_VERSION };

/**
 * Export data structure with schema versioning
 */
export interface ExportData {
  version: string;
  exportedAt: string;
  appVersion: string;
  goals: SerializedGoal[];
}

/**
 * Result of an export operation
 */
export interface ExportResult {
  success: boolean;
  data?: ExportData;
  error?: string;
}

/**
 * Serialize a goal for export (dates as ISO strings)
 */
const serializeGoalForExport = (goal: Goal): SerializedGoal => {
  const serializeDate = (date?: Date): string | undefined => {
    return date ? date.toISOString() : undefined;
  };

  const { progressHistory, ...goalWithoutProgressHistory } = goal;
  const baseSerialized: Omit<SerializedGoal, 'milestones' | 'occurrences' | 'entries'> = {
    ...goalWithoutProgressHistory,
    startDate: serializeDate(goal.startDate),
    deadline: serializeDate(goal.deadline),
    completedDate: serializeDate(goal.completedDate),
    createdAt: goal.createdAt.toISOString(),
    updatedAt: goal.updatedAt.toISOString(),
    progressHistory: progressHistory.map(
      (entry): SerializedProgressEntry => ({
        id: entry.id,
        date: entry.date.toISOString(),
        value: entry.value,
        note: entry.note,
        metadata: entry.metadata,
      })
    ),
  };

  // Serialize milestones if present
  if ('milestones' in goal && goal.milestones) {
    return {
      ...baseSerialized,
      milestones: goal.milestones.map(
        (milestone): SerializedMilestone => ({
          id: milestone.id,
          title: milestone.title,
          description: milestone.description,
          status: milestone.status,
          dueDate: serializeDate(milestone.dueDate),
          completedDate: serializeDate(milestone.completedDate),
          order: milestone.order,
          dependencies: milestone.dependencies,
          metadata: milestone.metadata,
        })
      ),
    };
  }

  // Serialize occurrences for recurring goals
  if ('occurrences' in goal && goal.occurrences) {
    return {
      ...baseSerialized,
      occurrences: goal.occurrences.map(
        (entry): SerializedHabitEntry => ({
          id: entry.id,
          date: entry.date.toISOString(),
          completed: entry.completed,
          value: entry.value,
          note: entry.note,
          metadata: entry.metadata,
        })
      ),
    };
  }

  // Serialize entries for habit goals
  if ('entries' in goal && goal.entries) {
    return {
      ...baseSerialized,
      entries: goal.entries.map(
        (entry): SerializedHabitEntry => ({
          id: entry.id,
          date: entry.date.toISOString(),
          completed: entry.completed,
          value: entry.value,
          note: entry.note,
          metadata: entry.metadata,
        })
      ),
    };
  }

  return baseSerialized;
};

/**
 * Export all goals to JSON
 */
export const exportGoals = (): ExportResult => {
  try {
    const goals = getAllGoals();

    const serializedGoals = goals.map(serializeGoalForExport);

    const exportData: ExportData = {
      version: EXPORT_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      appVersion: APP_VERSION,
      goals: serializedGoals,
    };

    return {
      success: true,
      data: exportData,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during export',
    };
  }
};

/**
 * Download export data as a JSON file
 */
export const downloadExport = (exportData: ExportData): void => {
  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `momentum-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Type for any goal input (used for import - will be cast to correct type after validation)
 */
export type AnyGoalInput = Record<string, unknown>;

/**
 * Create a goal input object from serialized import data
 * Note: The returned object needs to be properly typed based on goal type
 */
export const createGoalFromSerialized = (serialized: SerializedGoal): AnyGoalInput => {
  const deserializeDate = (dateStr?: string): Date | undefined => {
    return dateStr ? new Date(dateStr) : undefined;
  };

  const goalInput: AnyGoalInput = {
    ...serialized,
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
    goalInput.milestones = serialized.milestones.map((milestone) => ({
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

  // Handle occurrences
  if (serialized.occurrences) {
    goalInput.occurrences = serialized.occurrences.map((entry) => ({
      id: entry.id,
      date: new Date(entry.date),
      completed: entry.completed,
      value: entry.value,
      note: entry.note,
      metadata: entry.metadata,
    }));
  }

  // Handle entries
  if (serialized.entries) {
    goalInput.entries = serialized.entries.map((entry) => ({
      id: entry.id,
      date: new Date(entry.date),
      completed: entry.completed,
      value: entry.value,
      note: entry.note,
      metadata: entry.metadata,
    }));
  }

  return goalInput;
};
