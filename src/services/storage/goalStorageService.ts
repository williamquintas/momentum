/**
 * Goal Storage Service
 *
 * Handles goal-specific CRUD operations with index management
 * for efficient querying by type, status, category, and tags.
 */

/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import type { Goal, CreateGoalInput, UpdateGoalInput, GoalFilters, ProgressEntry } from '@/types/goal.types';

/**
 * Generate a UUID v4
 */
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
import { setStorageItem, initializeStorage as initializeStorageStructure } from './localStorageService';
import {
  STORAGE_KEYS,
  StorageError,
  StorageErrorType,
  type SerializedGoal,
  type SerializedMilestone,
  type SerializedHabitEntry,
  type GoalsIndex,
  type GoalsData,
  type GoalsByType,
  type GoalsByStatus,
  type GoalsByCategory,
  type GoalsByTag,
  type SerializedCompletionEvent,
  type CompletionsData,
  type StorageStructure,
} from './storageTypes';

interface StorageSnapshot {
  key: string;
  value: string | null;
}

interface RestoreJournal {
  owner: string;
  expiresAt: number;
  snapshot: StorageSnapshot[];
}

// Synchronous restores normally take milliseconds. An active writer must not be mistaken for a crashed tab.
const RESTORE_LEASE_MS = 60_000;

const recoverStorageTransaction = (rollbackOwner?: string): void => {
  const journal = localStorage.getItem(STORAGE_KEYS.GOALS_TRANSACTION);
  if (journal === null) return;

  let recovery: RestoreJournal | undefined;
  try {
    const parsed: unknown = JSON.parse(journal);
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('owner' in parsed) ||
      typeof parsed.owner !== 'string' ||
      !('expiresAt' in parsed) ||
      typeof parsed.expiresAt !== 'number' ||
      !Number.isFinite(parsed.expiresAt) ||
      !('snapshot' in parsed)
    )
      throw new Error('Invalid storage recovery journal');
    const snapshot: unknown = parsed.snapshot;
    const goalKeys: string[] = [
      STORAGE_KEYS.GOALS_INDEX,
      STORAGE_KEYS.GOALS_DATA,
      STORAGE_KEYS.GOALS_BY_TYPE,
      STORAGE_KEYS.GOALS_BY_STATUS,
      STORAGE_KEYS.GOALS_BY_CATEGORY,
      STORAGE_KEYS.GOALS_BY_TAG,
    ];
    if (
      !Array.isArray(snapshot) ||
      snapshot.length !== goalKeys.length ||
      !snapshot.every(
        (entry: unknown, index: number): entry is StorageSnapshot =>
          typeof entry === 'object' &&
          entry !== null &&
          'key' in entry &&
          entry.key === goalKeys[index] &&
          'value' in entry &&
          (entry.value === null || typeof entry.value === 'string')
      )
    ) {
      throw new Error('Invalid storage recovery journal');
    }
    if (parsed.expiresAt > Date.now() && parsed.owner !== rollbackOwner) {
      throw new StorageError(
        StorageErrorType.STORAGE_UNAVAILABLE,
        'A backup restore is in progress in another tab. Please retry shortly.'
      );
    }
    recovery = { owner: rollbackOwner ?? generateUUID(), expiresAt: Date.now() + RESTORE_LEASE_MS, snapshot };
    localStorage.setItem(STORAGE_KEYS.GOALS_TRANSACTION, JSON.stringify(recovery));
    for (const entry of snapshot) {
      if (entry.value === null) localStorage.removeItem(entry.key);
      else localStorage.setItem(entry.key, entry.value);
    }
    localStorage.removeItem(STORAGE_KEYS.GOALS_TRANSACTION);
  } catch (error) {
    if (error instanceof StorageError) throw error;
    if (recovery) {
      // Allow a later read to retry a failed rollback, but never claim the saved snapshot is current data.
      try {
        localStorage.setItem(STORAGE_KEYS.GOALS_TRANSACTION, JSON.stringify({ ...recovery, expiresAt: 0 }));
      } catch {
        /* Keep the original leased journal if storage itself remains unavailable. */
      }
    }
    throw new StorageError(
      StorageErrorType.CORRUPTED_DATA,
      'An interrupted save could not be recovered. Existing data has been retained for recovery.',
      error instanceof Error ? error : undefined
    );
  }
};

const initializeStorage = (): StorageStructure => {
  recoverStorageTransaction();
  return initializeStorageStructure();
};

/**
 * Serialize a goal for storage (convert dates to ISO strings)
 */
const serializeGoal = (goal: Goal): SerializedGoal => {
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
    progressHistory: progressHistory.map((entry) => ({
      id: entry.id,
      date: entry.date.toISOString(),
      value: entry.value,
      note: entry.note,
      metadata: entry.metadata,
    })),
  };

  // Serialize milestones if present
  if ('milestones' in goal && goal.milestones) {
    const serialized: SerializedGoal = {
      ...baseSerialized,
      milestones: goal.milestones.map((milestone) => ({
        id: milestone.id,
        title: milestone.title,
        description: milestone.description,
        status: milestone.status,
        dueDate: serializeDate(milestone.dueDate),
        completedDate: serializeDate(milestone.completedDate),
        order: milestone.order,
        dependencies: milestone.dependencies,
        metadata: milestone.metadata,
      })) as SerializedMilestone[],
    };
    return serialized;
  }

  // Serialize occurrences for recurring goals
  if ('occurrences' in goal && goal.occurrences) {
    const serialized: SerializedGoal = {
      ...baseSerialized,
      occurrences: goal.occurrences.map((entry) => ({
        id: entry.id,
        date: entry.date.toISOString(),
        completed: entry.completed,
        value: entry.value,
        note: entry.note,
        metadata: entry.metadata,
      })) as SerializedHabitEntry[],
    };
    return serialized;
  }

  // Serialize entries for habit goals
  if ('entries' in goal && goal.entries) {
    const serialized: SerializedGoal = {
      ...baseSerialized,
      entries: goal.entries.map((entry) => ({
        id: entry.id,
        date: entry.date.toISOString(),
        completed: entry.completed,
        value: entry.value,
        note: entry.note,
        metadata: entry.metadata,
      })) as SerializedHabitEntry[],
    };
    return serialized;
  }

  return baseSerialized as SerializedGoal;
};

/**
 * Deserialize a goal from storage (convert ISO strings to dates)
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
const deserializeGoal = (serialized: SerializedGoal): Goal => {
  const deserializeDate = (dateStr?: string): Date | undefined => {
    return dateStr ? new Date(dateStr) : undefined;
  };

  /* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
  const goal: Goal = {
    ...serialized,
    startDate: deserializeDate(serialized.startDate),
    deadline: deserializeDate(serialized.deadline),
    completedDate: deserializeDate(serialized.completedDate),
    createdAt: new Date(serialized.createdAt),
    updatedAt: new Date(serialized.updatedAt),
    notes: serialized.notes.map((note) => ({
      ...note,
      createdAt: new Date(note.createdAt),
      updatedAt: new Date(note.updatedAt),
    })),
    attachments: serialized.attachments.map((attachment) => ({
      ...attachment,
      uploadedAt: new Date(attachment.uploadedAt),
    })),
    progressHistory: serialized.progressHistory.map((entry) => ({
      id: entry.id,
      date: new Date(entry.date),
      value: entry.value,
      note: entry.note,
      metadata: entry.metadata,
    })),
  } as Goal;

  if (goal.type === 'qualitative' && goal.selfAssessments) {
    goal.selfAssessments = goal.selfAssessments.map((assessment) => ({
      ...assessment,
      date: new Date(assessment.date),
    }));
  }
  if (goal.type === 'recurring' && goal.recurrence) {
    goal.recurrence = { ...goal.recurrence, endDate: deserializeDate(goal.recurrence.endDate as unknown as string) };
  }
  if ((goal.type === 'recurring' || goal.type === 'habit') && goal.completionStats) {
    const stats = goal.completionStats;
    goal.completionStats = {
      ...stats,
      lastCompletedDate: deserializeDate(stats.lastCompletedDate as unknown as string),
      firstCompletedDate: deserializeDate(stats.firstCompletedDate as unknown as string),
      streak: {
        ...stats.streak,
        lastCompletedDate: deserializeDate(stats.streak?.lastCompletedDate as unknown as string),
        startDate: deserializeDate(stats.streak?.startDate as unknown as string),
      },
    };
  }

  // Deserialize milestones if present
  if (serialized.milestones && 'milestones' in goal) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    (goal as any).milestones = serialized.milestones.map((milestone) => ({
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
  /* eslint-enable @typescript-eslint/no-unsafe-enum-comparison */

  // Deserialize occurrences/entries
  if (serialized.occurrences && 'occurrences' in goal) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    (goal as any).occurrences = serialized.occurrences.map((entry) => ({
      id: entry.id,
      date: new Date(entry.date),
      completed: entry.completed,
      value: entry.value,
      note: entry.note,
      metadata: entry.metadata,
    }));
  }

  if (serialized.entries && 'entries' in goal) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    (goal as any).entries = serialized.entries.map((entry) => ({
      id: entry.id,
      date: new Date(entry.date),
      completed: entry.completed,
      value: entry.value,
      note: entry.note,
      metadata: entry.metadata,
    }));
  }

  return goal;
};

/**
 * Update indexes when a goal is added
 */
const addToIndexes = (
  goalId: string,
  goal: Goal,
  goalsByType: GoalsByType,
  goalsByStatus: GoalsByStatus,
  goalsByCategory: GoalsByCategory,
  goalsByTag: GoalsByTag
): void => {
  // Add to type index
  if (!goalsByType[goal.type]) {
    goalsByType[goal.type] = [];
  }
  const typeArray = goalsByType[goal.type];
  if (typeArray && !typeArray.includes(goalId)) {
    typeArray.push(goalId);
  }

  // Add to status index
  if (!goalsByStatus[goal.status]) {
    goalsByStatus[goal.status] = [];
  }
  const statusArray = goalsByStatus[goal.status];
  if (statusArray && !statusArray.includes(goalId)) {
    statusArray.push(goalId);
  } else if (!statusArray) {
    goalsByStatus[goal.status] = [goalId];
  }

  // Add to category index
  if (!goalsByCategory[goal.category]) {
    goalsByCategory[goal.category] = [];
  }
  const categoryArray = goalsByCategory[goal.category];
  if (categoryArray && !categoryArray.includes(goalId)) {
    categoryArray.push(goalId);
  } else if (!categoryArray) {
    goalsByCategory[goal.category] = [goalId];
  }

  // Add to tag indexes
  goal.tags.forEach((tag: string) => {
    if (!goalsByTag[tag]) {
      goalsByTag[tag] = [];
    }
    const tagArray = goalsByTag[tag];
    if (tagArray && !tagArray.includes(goalId)) {
      tagArray.push(goalId);
    } else if (!tagArray) {
      goalsByTag[tag] = [goalId];
    }
  });
};

/**
 * Remove from indexes when a goal is deleted or updated
 */
const removeFromIndexes = (
  goalId: string,
  oldGoal: Goal | null,
  goalsByType: GoalsByType,
  goalsByStatus: GoalsByStatus,
  goalsByCategory: GoalsByCategory,
  goalsByTag: GoalsByTag
): void => {
  if (!oldGoal) return;

  // Remove from type index
  const typeArray = goalsByType[oldGoal.type];
  if (typeArray) {
    goalsByType[oldGoal.type] = typeArray.filter((id: string) => id !== goalId);
    if (goalsByType[oldGoal.type]?.length === 0) {
      delete goalsByType[oldGoal.type];
    }
  }

  // Remove from status index
  const statusArray = goalsByStatus[oldGoal.status];
  if (statusArray) {
    goalsByStatus[oldGoal.status] = statusArray.filter((id: string) => id !== goalId);
    if (goalsByStatus[oldGoal.status]?.length === 0) {
      delete goalsByStatus[oldGoal.status];
    }
  }

  // Remove from category index
  const categoryArray = goalsByCategory[oldGoal.category];
  if (categoryArray) {
    goalsByCategory[oldGoal.category] = categoryArray.filter((id: string) => id !== goalId);
    if (goalsByCategory[oldGoal.category]?.length === 0) {
      delete goalsByCategory[oldGoal.category];
    }
  }

  // Remove from tag indexes
  oldGoal.tags.forEach((tag: string) => {
    const tagArray = goalsByTag[tag];
    if (tagArray) {
      goalsByTag[tag] = tagArray.filter((id: string) => id !== goalId);
      if (goalsByTag[tag]?.length === 0) {
        delete goalsByTag[tag];
      }
    }
  });
};

/**
 * Save normal CRUD through the existing storage wrapper. Backup restore uses its own journal below.
 */
const saveStorage = (
  goalsIndex: GoalsIndex,
  goalsData: GoalsData,
  goalsByType: GoalsByType,
  goalsByStatus: GoalsByStatus,
  goalsByCategory: GoalsByCategory,
  goalsByTag: GoalsByTag,
  isRestore = false
): void => {
  const entries: [string, unknown][] = [
    [STORAGE_KEYS.GOALS_INDEX, { ...goalsIndex, lastUpdated: new Date().toISOString() }],
    [STORAGE_KEYS.GOALS_DATA, goalsData],
    [STORAGE_KEYS.GOALS_BY_TYPE, goalsByType],
    [STORAGE_KEYS.GOALS_BY_STATUS, goalsByStatus],
    [STORAGE_KEYS.GOALS_BY_CATEGORY, goalsByCategory],
    [STORAGE_KEYS.GOALS_BY_TAG, goalsByTag],
  ];
  if (!isRestore) {
    for (const [key, value] of entries) setStorageItem(key, value);
    return;
  }
  const journal: RestoreJournal = {
    owner: generateUUID(),
    expiresAt: Date.now() + RESTORE_LEASE_MS,
    snapshot: entries.map(([key]) => ({ key, value: localStorage.getItem(key) })),
  };
  try {
    // Serialize first so a serialization error cannot leave a partial transaction.
    const serialized = entries.map(([key, value]) => [key, JSON.stringify(value)] as const);
    localStorage.setItem(STORAGE_KEYS.GOALS_TRANSACTION, JSON.stringify(journal));
    for (const [key, value] of serialized) {
      const active = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.GOALS_TRANSACTION) ?? 'null'
      ) as RestoreJournal | null;
      if (active?.owner !== journal.owner) {
        throw new StorageError(StorageErrorType.STORAGE_UNAVAILABLE, 'Backup restore ownership changed. Please retry.');
      }
      localStorage.setItem(key, value);
    }
    localStorage.removeItem(STORAGE_KEYS.GOALS_TRANSACTION);
  } catch (error) {
    recoverStorageTransaction(journal.owner);
    if (error instanceof StorageError) {
      throw error;
    }
    const isQuotaError = error instanceof DOMException && error.name === 'QuotaExceededError';
    throw new StorageError(
      isQuotaError ? StorageErrorType.QUOTA_EXCEEDED : StorageErrorType.UNKNOWN,
      isQuotaError
        ? 'Local Storage quota exceeded. The backup restore was not saved.'
        : 'Failed to restore goals to storage',
      error as Error
    );
  }
};

/** Restore a validated batch without applying new-goal defaults or rewriting identities. */
export const restoreGoals = (goals: Goal[]): void => {
  if (goals.length === 0) return;
  const storage = initializeStorage();
  for (const goal of goals) storage.goalsData[goal.id] = serializeGoal(goal);
  const goalsByType: GoalsByType = {};
  const goalsByStatus: GoalsByStatus = {};
  const goalsByCategory: GoalsByCategory = {};
  const goalsByTag: GoalsByTag = {};
  for (const serialized of Object.values(storage.goalsData)) {
    const goal = deserializeGoal(serialized);
    addToIndexes(goal.id, goal, goalsByType, goalsByStatus, goalsByCategory, goalsByTag);
  }
  saveStorage(
    { ...storage.goalsIndex, ids: Object.keys(storage.goalsData) },
    storage.goalsData,
    goalsByType,
    goalsByStatus,
    goalsByCategory,
    goalsByTag,
    true
  );
};

/** Convert validated backup data using the same date handling as persisted goals. */
export const deserializeRestoredGoal = (goal: SerializedGoal): Goal => deserializeGoal(goal);

/**
 * Create a new goal
 */
export const createGoal = (input: CreateGoalInput): Goal => {
  const storage = initializeStorage();

  // Generate ID and timestamps
  const now = new Date();
  const goalId = generateUUID();

  // Create goal with defaults
  // CreateGoalInput already has all required fields except id, timestamps, and defaults
  const goal: Goal = {
    ...input,
    id: goalId,
    createdAt: now,
    updatedAt: now,
    progress: 0,
    progressHistory: input.progressHistory || [],
    notes: [],
    attachments: [],
    relatedGoals: input.relatedGoals || [],
    archived: input.archived ?? false,
    favorite: input.favorite ?? false,
  } as unknown as Goal; // Type assertion needed due to union type complexity

  // Serialize and store
  const serialized = serializeGoal(goal);
  storage.goalsData[goalId] = serialized;

  // Update indexes
  addToIndexes(goalId, goal, storage.goalsByType, storage.goalsByStatus, storage.goalsByCategory, storage.goalsByTag);

  // Update goals index
  if (!storage.goalsIndex.ids.includes(goalId)) {
    storage.goalsIndex.ids.push(goalId);
  }

  // Save all changes
  saveStorage(
    storage.goalsIndex,
    storage.goalsData,
    storage.goalsByType,
    storage.goalsByStatus,
    storage.goalsByCategory,
    storage.goalsByTag
  );

  return goal;
};

/**
 * Get a goal by ID
 */
export const getGoal = (goalId: string): Goal | null => {
  const storage = initializeStorage();
  const serialized = storage.goalsData[goalId];

  if (!serialized) {
    return null;
  }

  return deserializeGoal(serialized);
};

/**
 * Get all goals
 */
export const getAllGoals = (): Goal[] => {
  const storage = initializeStorage();
  return storage.goalsIndex.ids
    .map((id) => {
      const serialized = storage.goalsData[id];
      return serialized ? deserializeGoal(serialized) : null;
    })
    .filter((goal): goal is Goal => goal !== null);
};

/**
 * Update a goal
 */
export const updateGoal = (goalId: string, input: UpdateGoalInput): Goal => {
  const storage = initializeStorage();
  const existingSerialized = storage.goalsData[goalId];

  if (!existingSerialized) {
    throw new StorageError(StorageErrorType.NOT_FOUND, `Goal with ID ${goalId} not found`);
  }

  const existingGoal = deserializeGoal(existingSerialized);

  // Merge updates
  const updatedGoal: Goal = {
    ...existingGoal,
    ...input,
    id: goalId, // Ensure ID doesn't change
    updatedAt: new Date(),
  } as Goal;

  // Remove from old indexes
  removeFromIndexes(
    goalId,
    existingGoal,
    storage.goalsByType,
    storage.goalsByStatus,
    storage.goalsByCategory,
    storage.goalsByTag
  );

  // Add to new indexes
  addToIndexes(
    goalId,
    updatedGoal,
    storage.goalsByType,
    storage.goalsByStatus,
    storage.goalsByCategory,
    storage.goalsByTag
  );

  // Serialize and store
  const serialized = serializeGoal(updatedGoal);
  storage.goalsData[goalId] = serialized;

  // Save all changes
  saveStorage(
    storage.goalsIndex,
    storage.goalsData,
    storage.goalsByType,
    storage.goalsByStatus,
    storage.goalsByCategory,
    storage.goalsByTag
  );

  return updatedGoal;
};

/**
 * Delete a goal
 */
export const deleteGoal = (goalId: string): void => {
  const storage = initializeStorage();
  const existingSerialized = storage.goalsData[goalId];

  if (!existingSerialized) {
    throw new StorageError(StorageErrorType.NOT_FOUND, `Goal with ID ${goalId} not found`);
  }

  const existingGoal = deserializeGoal(existingSerialized);

  // Remove from indexes
  removeFromIndexes(
    goalId,
    existingGoal,
    storage.goalsByType,
    storage.goalsByStatus,
    storage.goalsByCategory,
    storage.goalsByTag
  );

  // Remove from goals data
  delete storage.goalsData[goalId];

  // Remove from goals index
  storage.goalsIndex.ids = storage.goalsIndex.ids.filter((id) => id !== goalId);

  // Save all changes
  saveStorage(
    storage.goalsIndex,
    storage.goalsData,
    storage.goalsByType,
    storage.goalsByStatus,
    storage.goalsByCategory,
    storage.goalsByTag
  );
};

/**
 * Update progress for a goal
 * Creates a progress history entry and recalculates progress
 */
export const updateProgress = (
  goalId: string,
  progressValue: number,
  note?: string,
  typeSpecificUpdates?: Partial<Goal>
): Goal => {
  const storage = initializeStorage();
  const existingSerialized = storage.goalsData[goalId];

  if (!existingSerialized) {
    throw new StorageError(StorageErrorType.NOT_FOUND, `Goal with ID ${goalId} not found`);
  }

  const existingGoal = deserializeGoal(existingSerialized);

  // Apply type-specific updates if provided
  const updatedGoal: Goal = {
    ...existingGoal,
    ...typeSpecificUpdates,
    id: goalId, // Ensure ID doesn't change
    updatedAt: new Date(),
  } as Goal;

  // Create progress history entry
  const progressEntry: ProgressEntry = {
    id: generateUUID(),
    date: new Date(),
    value: progressValue,
    note,
    metadata: {},
  };

  // Add to progress history
  updatedGoal.progressHistory = [...updatedGoal.progressHistory, progressEntry];

  // Update progress
  updatedGoal.progress = progressValue;

  // Remove from old indexes (in case status changed)
  removeFromIndexes(
    goalId,
    existingGoal,
    storage.goalsByType,
    storage.goalsByStatus,
    storage.goalsByCategory,
    storage.goalsByTag
  );

  // Add to new indexes
  addToIndexes(
    goalId,
    updatedGoal,
    storage.goalsByType,
    storage.goalsByStatus,
    storage.goalsByCategory,
    storage.goalsByTag
  );

  // Serialize and store
  const serialized = serializeGoal(updatedGoal);
  storage.goalsData[goalId] = serialized;

  // Save all changes
  saveStorage(
    storage.goalsIndex,
    storage.goalsData,
    storage.goalsByType,
    storage.goalsByStatus,
    storage.goalsByCategory,
    storage.goalsByTag
  );

  return updatedGoal;
};

/**
 * Query goals with filters
 */
export const queryGoals = (filters: GoalFilters = {}): Goal[] => {
  const storage = initializeStorage();
  let candidateIds = new Set<string>(storage.goalsIndex.ids);

  // Filter by type
  if (filters.type && filters.type.length > 0) {
    const typeIds = new Set<string>();
    filters.type.forEach((type: string) => {
      const typeArray = storage.goalsByType[type];
      if (typeArray) {
        typeArray.forEach((id: string) => typeIds.add(id));
      }
    });
    candidateIds = new Set([...candidateIds].filter((id: string) => typeIds.has(id)));
  }

  // Filter by status
  if (filters.status && filters.status.length > 0) {
    const statusIds = new Set<string>();
    filters.status.forEach((status: string) => {
      const statusArray = storage.goalsByStatus[status];
      if (statusArray) {
        statusArray.forEach((id: string) => statusIds.add(id));
      }
    });
    candidateIds = new Set([...candidateIds].filter((id: string) => statusIds.has(id)));
  }

  // Filter by category
  if (filters.category && filters.category.length > 0) {
    const categoryIds = new Set<string>();
    filters.category.forEach((category: string) => {
      const categoryArray = storage.goalsByCategory[category];
      if (categoryArray) {
        categoryArray.forEach((id: string) => categoryIds.add(id));
      }
    });
    candidateIds = new Set([...candidateIds].filter((id: string) => categoryIds.has(id)));
  }

  // Filter by tags
  if (filters.tags && filters.tags.length > 0) {
    const tagIds = new Set<string>();
    filters.tags.forEach((tag: string) => {
      const tagArray = storage.goalsByTag[tag];
      if (tagArray) {
        tagArray.forEach((id: string) => tagIds.add(id));
      }
    });
    candidateIds = new Set([...candidateIds].filter((id: string) => tagIds.has(id)));
  }

  // Get goals and apply remaining filters
  const goals = Array.from(candidateIds)
    .map((id) => {
      const serialized = storage.goalsData[id];
      return serialized ? deserializeGoal(serialized) : null;
    })
    .filter((goal): goal is Goal => goal !== null)
    .filter((goal) => {
      // Filter by priority
      if (filters.priority && filters.priority.length > 0 && !filters.priority.includes(goal.priority)) {
        return false;
      }

      // Filter by archived
      if (filters.archived !== undefined && goal.archived !== filters.archived) {
        return false;
      }

      // Filter by favorite
      if (filters.favorite !== undefined && goal.favorite !== filters.favorite) {
        return false;
      }

      // Filter by IDs
      if (filters.ids && filters.ids.length > 0 && !filters.ids.includes(goal.id)) {
        return false;
      }

      // Filter by assignee
      if (filters.assignee && goal.assignee !== filters.assignee) {
        return false;
      }

      // Filter by createdBy
      if (filters.createdBy && goal.createdBy !== filters.createdBy) {
        return false;
      }

      // Filter by date ranges
      if (filters.startDateFrom && goal.startDate && goal.startDate < filters.startDateFrom) {
        return false;
      }
      if (filters.startDateTo && goal.startDate && goal.startDate > filters.startDateTo) {
        return false;
      }
      if (filters.deadlineFrom && goal.deadline && goal.deadline < filters.deadlineFrom) {
        return false;
      }
      if (filters.deadlineTo && goal.deadline && goal.deadline > filters.deadlineTo) {
        return false;
      }

      // Filter by search (title and description)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesTitle = goal.title.toLowerCase().includes(searchLower);
        const matchesDescription = goal.description?.toLowerCase().includes(searchLower) ?? false;
        if (!matchesTitle && !matchesDescription) {
          return false;
        }
      }

      return true;
    });

  return goals;
};

/**
 * Load completions from storage
 */
export const loadCompletions = (): CompletionsData => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.COMPLETIONS);
    if (!data) {
      return {};
    }
    return JSON.parse(data) as CompletionsData;
  } catch {
    return {};
  }
};

/**
 * Save completions to storage
 */
const saveCompletions = (completions: CompletionsData): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.COMPLETIONS, JSON.stringify(completions));
  } catch (error) {
    throw new StorageError(StorageErrorType.UNKNOWN, 'Failed to save completions to storage', error as Error);
  }
};

/**
 * Save a completion event for a goal
 */
export const saveCompletion = (completion: SerializedCompletionEvent): void => {
  const completions = loadCompletions();
  completions[completion.goalId] = completion;
  saveCompletions(completions);
};

/**
 * Get a completion for a specific goal
 */
export const getCompletion = (goalId: string): SerializedCompletionEvent | null => {
  const completions = loadCompletions();
  return completions[goalId] || null;
};

/**
 * Get all completions
 */
export const getAllCompletions = (): SerializedCompletionEvent[] => {
  const completions = loadCompletions();
  return Object.values(completions);
};

/**
 * Delete a completion (when goal is deleted)
 */
export const deleteCompletion = (goalId: string): void => {
  const completions = loadCompletions();
  delete completions[goalId];
  saveCompletions(completions);
};
