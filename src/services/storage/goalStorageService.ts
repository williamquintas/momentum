/**
 * Goal Storage Service
 *
 * Handles goal-specific CRUD operations with index management
 * for efficient querying by type, status, category, and tags.
 */

/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import type { Goal, CreateGoalInput, UpdateGoalInput, GoalFilters } from '../../../specs/types/goal.types';

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
import {
  setStorageItem,
  initializeStorage,
} from './localStorageService';
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
} from './storageTypes';

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
    progressHistory: serialized.progressHistory.map((entry) => ({
      id: entry.id,
      date: new Date(entry.date),
      value: entry.value,
      note: entry.note,
      metadata: entry.metadata,
    })),
  } as Goal;

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
 * Save all storage structures atomically
 */
const saveStorage = (
  goalsIndex: GoalsIndex,
  goalsData: GoalsData,
  goalsByType: GoalsByType,
  goalsByStatus: GoalsByStatus,
  goalsByCategory: GoalsByCategory,
  goalsByTag: GoalsByTag
): void => {
  try {
    goalsIndex.lastUpdated = new Date().toISOString();
    setStorageItem(STORAGE_KEYS.GOALS_INDEX, goalsIndex);
    setStorageItem(STORAGE_KEYS.GOALS_DATA, goalsData);
    setStorageItem(STORAGE_KEYS.GOALS_BY_TYPE, goalsByType);
    setStorageItem(STORAGE_KEYS.GOALS_BY_STATUS, goalsByStatus);
    setStorageItem(STORAGE_KEYS.GOALS_BY_CATEGORY, goalsByCategory);
    setStorageItem(STORAGE_KEYS.GOALS_BY_TAG, goalsByTag);
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    throw new StorageError(
      StorageErrorType.UNKNOWN,
      'Failed to save goals to storage',
      error as Error
    );
  }
};

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
      // Filter by archived
      if (filters.archived !== undefined && goal.archived !== filters.archived) {
        return false;
      }

      // Filter by favorite
      if (filters.favorite !== undefined && goal.favorite !== filters.favorite) {
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

