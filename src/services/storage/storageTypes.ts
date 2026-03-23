/**
 * Local Storage Types and Structures
 *
 * This file defines the normalized storage structure for goals in Local Storage.
 * The structure uses indexes for efficient querying by type, status, category, and tags.
 */

import type { Goal } from '../../../specs/bkp/types/goal.types';

/**
 * Storage keys used in Local Storage
 */
export const STORAGE_KEYS = {
  GOALS_INDEX: 'goals_index',
  GOALS_DATA: 'goals_data',
  GOALS_BY_TYPE: 'goals_by_type',
  GOALS_BY_STATUS: 'goals_by_status',
  GOALS_BY_CATEGORY: 'goals_by_category',
  GOALS_BY_TAG: 'goals_by_tag',
  STORAGE_VERSION: 'goals_storage_version',
} as const;

/**
 * Current storage version for migration support
 */
export const CURRENT_STORAGE_VERSION = 1;

/**
 * Goals index - array of goal IDs for quick access
 */
export interface GoalsIndex {
  ids: string[];
  lastUpdated: string; // ISO date string
}

/**
 * Goals data - normalized storage of individual goals
 * Key: goal ID, Value: serialized goal (dates as ISO strings)
 */
export type GoalsData = Record<string, SerializedGoal>;

/**
 * Serialized goal - goal with dates converted to ISO strings for Local Storage
 */
export type SerializedGoal = Omit<
  Goal,
  'startDate' | 'deadline' | 'completedDate' | 'createdAt' | 'updatedAt' | 'progressHistory'
> & {
  startDate?: string; // ISO date string
  deadline?: string; // ISO date string
  completedDate?: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  // Serialize nested dates in progressHistory, milestones, etc.
  progressHistory: SerializedProgressEntry[];
  milestones?: SerializedMilestone[];
  occurrences?: SerializedHabitEntry[];
  entries?: SerializedHabitEntry[];
};

/**
 * Serialized progress entry
 */
export interface SerializedProgressEntry {
  id: string;
  date: string; // ISO date string
  value: number;
  note?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Serialized milestone
 */
export interface SerializedMilestone {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  dueDate?: string; // ISO date string
  completedDate?: string; // ISO date string
  order: number;
  dependencies?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Serialized habit entry
 */
export interface SerializedHabitEntry {
  id: string;
  date: string; // ISO date string
  completed: boolean;
  value?: number;
  note?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Index structures for efficient querying
 */
export interface GoalsByType {
  [GoalType: string]: string[]; // Array of goal IDs
}

export interface GoalsByStatus {
  [status: string]: string[]; // Array of goal IDs
}

export interface GoalsByCategory {
  [category: string]: string[]; // Array of goal IDs
}

export interface GoalsByTag {
  [tag: string]: string[]; // Array of goal IDs
}

/**
 * Complete storage structure
 */
export interface StorageStructure {
  version: number;
  goalsIndex: GoalsIndex;
  goalsData: GoalsData;
  goalsByType: GoalsByType;
  goalsByStatus: GoalsByStatus;
  goalsByCategory: GoalsByCategory;
  goalsByTag: GoalsByTag;
}

/**
 * Storage error types
 */
export enum StorageErrorType {
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  CORRUPTED_DATA = 'CORRUPTED_DATA',
  STORAGE_UNAVAILABLE = 'STORAGE_UNAVAILABLE',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Storage error
 */
export class StorageError extends Error {
  constructor(
    public type: StorageErrorType,
    message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'StorageError';
  }
}
