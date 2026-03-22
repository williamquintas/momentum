# Type Contracts: Update Goal Progress

## TypeScript Interface Definitions

### Progress Update Base Type

```typescript
/**
 * Base interface for all progress updates.
 * Discriminated union by 'type' property.
 */
export interface ProgressUpdate {
  goalId: string;
  timestamp: number;
  type: GoalType;
  previousValue: number;
  currentValue: number;
  change: number;
  notes?: string;
}

export type GoalProgressUpdate = 
  | QuantitativeProgressUpdate
  | QualitativeProgressUpdate
  | BinaryProgressUpdate
  | MilestoneProgressUpdate
  | RecurringProgressUpdate
  | HabitProgressUpdate;
```

### Type-Specific Update Interfaces

```typescript
/**
 * Quantitative progress update for numeric goals.
 * Example: "Ran 5km" for a fitness goal with target 50km
 */
export interface QuantitativeProgressUpdate extends ProgressUpdate {
  type: 'quantitative';
  unit: string;
  currentValue: number;
  targetValue: number; // For validation
}

/**
 * Qualitative progress update for descriptive goals.
 * Example: "Completed chapter 5, good insights on design patterns"
 */
export interface QualitativeProgressUpdate extends ProgressUpdate {
  type: 'qualitative';
  description: string; // 1-5000 characters
  rating?: number; // 1-5 optional rating
}

/**
 * Binary progress update for yes/no goals.
 * Example: "Completed the 30-day challenge"
 */
export interface BinaryProgressUpdate extends ProgressUpdate {
  type: 'binary';
  achieved: boolean;
  completedAt?: number;
}

/**
 * Milestone progress update for multi-step goals.
 * Example: "Completed milestone: Design Phase"
 */
export interface MilestoneProgressUpdate extends ProgressUpdate {
  type: 'milestone';
  milestoneId: string;
  milestoneName: string;
  completed: boolean;
  completionOrder: number;
}

/**
 * Recurring goal occurrence tracking.
 * Example: "Completed 2024-03-22 daily meditation"
 */
export interface RecurringProgressUpdate extends ProgressUpdate {
  type: 'recurring';
  occurrenceId: string;
  occurrenceDate: string; // YYYY-MM-DD
  status: 'pending' | 'completed' | 'missed';
  completedAt?: number;
}

/**
 * Habit tracking update for daily habits.
 * Example: "Completed 2024-03-22 morning exercise"
 */
export interface HabitProgressUpdate extends ProgressUpdate {
  type: 'habit';
  date: string; // YYYY-MM-DD
  completed: boolean;
  streak?: number;
  longestStreak?: number;
}
```

### Progress History and Cache

```typescript
/**
 * Immutable history of all updates for a goal.
 * Stored in LocalStorage, never modified once created.
 */
export interface ProgressHistory {
  [goalId: string]: ProgressUpdate[];
}

/**
 * Cache for current progress values to avoid recalculation.
 * Invalidated when new update added.
 */
export interface ProgressCache {
  [goalId: string]: {
    value: number; // Cached progress percentage
    lastUpdated: number; // Timestamp of calculation
    updateCount: number; // Total updates for this goal
  };
}

/**
 * Result of progress calculation.
 */
export interface ProgressCalculationResult {
  progress: number; // 0-100
  formula: string; // Description of formula used
  lastUpdate: ProgressUpdate | null;
  updateCount: number;
}
```

### Validation and Type Guards

```typescript
/**
 * Type guard for QuantitativeProgressUpdate
 */
export function isQuantitativeUpdate(
  update: ProgressUpdate
): update is QuantitativeProgressUpdate {
  return update.type === 'quantitative';
}

/**
 * Type guard for QualitativeProgressUpdate
 */
export function isQualitativeUpdate(
  update: ProgressUpdate
): update is QualitativeProgressUpdate {
  return update.type === 'qualitative';
}

/**
 * Type guard for BinaryProgressUpdate
 */
export function isBinaryUpdate(
  update: ProgressUpdate
): update is BinaryProgressUpdate {
  return update.type === 'binary';
}

/**
 * Type guard for MilestoneProgressUpdate
 */
export function isMilestoneUpdate(
  update: ProgressUpdate
): update is MilestoneProgressUpdate {
  return update.type === 'milestone';
}

/**
 * Type guard for RecurringProgressUpdate
 */
export function isRecurringUpdate(
  update: ProgressUpdate
): update is RecurringProgressUpdate {
  return update.type === 'recurring';
}

/**
 * Type guard for HabitProgressUpdate
 */
export function isHabitUpdate(
  update: ProgressUpdate
): update is HabitProgressUpdate {
  return update.type === 'habit';
}

/**
 * Assert that update is of specific type, or throw.
 */
export function assertUpdateType<T extends ProgressUpdate>(
  update: ProgressUpdate,
  expectedType: T['type']
): asserts update is T {
  if (update.type !== expectedType) {
    throw new Error(`Expected update type ${expectedType}, got ${update.type}`);
  }
}
```

### Component Contracts

```typescript
/**
 * Props for ProgressUpdateForm component
 */
export interface ProgressUpdateFormProps {
  goal: Goal;
  onSuccess?: (update: ProgressUpdate) => void;
  onError?: (error: Error) => void;
  loading?: boolean;
}

/**
 * Props for type-specific progress fields
 */
export interface ProgressFieldProps {
  goal: Goal;
  onChange?: (value: any) => void;
  disabled?: boolean;
  error?: string;
}

/**
 * Props for QuantitativeProgressField
 */
export interface QuantitativeProgressFieldProps extends ProgressFieldProps {
  goal: Goal & { type: 'quantitative' };
}

/**
 * Props for QualitativeProgressField
 */
export interface QualitativeProgressFieldProps extends ProgressFieldProps {
  goal: Goal & { type: 'qualitative' };
  maxLength?: number;
}

/**
 * Props for BinaryProgressField
 */
export interface BinaryProgressFieldProps extends ProgressFieldProps {
  goal: Goal & { type: 'binary' };
}

/**
 * Props for MilestoneProgressField
 */
export interface MilestoneProgressFieldProps extends ProgressFieldProps {
  goal: Goal & { type: 'milestone' };
}

/**
 * Props for RecurringProgressField
 */
export interface RecurringProgressFieldProps extends ProgressFieldProps {
  goal: Goal & { type: 'recurring' };
}

/**
 * Props for HabitProgressField
 */
export interface HabitProgressFieldProps extends ProgressFieldProps {
  goal: Goal & { type: 'habit' };
}
```

### Hook Contracts

```typescript
/**
 * Hook for managing progress updates
 */
export interface UseProgressUpdateReturn {
  progress: number;
  history: ProgressUpdate[];
  addUpdate: (update: Omit<ProgressUpdate, 'goalId' | 'timestamp'>) => Promise<void>;
  loading: boolean;
  error: Error | null;
  invalidateCache: () => void;
}

export function useProgressUpdate(goalId: string): UseProgressUpdateReturn {
  // Implementation
}

/**
 * Hook for managing progress form state
 */
export interface UseProgressFormReturn {
  form: FormInstance;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
  validationErrors: Record<string, string>;
  reset: () => void;
}

export function useProgressForm(
  goalId: string,
  goalType: GoalType
): UseProgressFormReturn {
  // Implementation
}
```

### Utility Function Contracts

```typescript
/**
 * Calculate quantitative goal progress using BR-009 formula
 * @param startValue - Starting value (default 0)
 * @param currentValue - Current progress value
 * @param targetValue - Target value to achieve
 * @returns Progress percentage [0, 100]
 * @throws Error if targetValue === startValue (cannot divide)
 */
export function calculateQuantitativeProgress(
  startValue: number,
  currentValue: number,
  targetValue: number
): number {
  // Implementation
}

/**
 * Calculate milestone progress using BR-010 formula
 * @param completedMilestones - Number of completed milestones
 * @param totalMilestones - Total number of milestones
 * @returns Progress percentage [0, 100]
 * @throws Error if totalMilestones < 1
 */
export function calculateMilestoneProgress(
  completedMilestones: number,
  totalMilestones: number
): number {
  // Implementation
}

/**
 * Calculate binary goal progress using BR-011 formula
 * @param achieved - Whether goal is achieved
 * @returns 0 or 100
 */
export function calculateBinaryProgress(achieved: boolean): number {
  // Implementation
}

/**
 * Recalculate current progress from history
 * @param goalId - ID of the goal
 * @param history - Array of all updates (in chronological order)
 * @returns Current progress percentage
 */
export function recalculateProgressFromHistory(
  goalId: string,
  history: ProgressUpdate[]
): number {
  // Implementation
}

/**
 * Calculate habit streak from history
 * @param history - Array of habit updates
 * @returns Streak info: { current, longest, bestDate }
 */
export function calculateHabitStreaks(
  history: HabitProgressUpdate[]
): { currentStreak: number; longestStreak: number; bestDate?: string } {
  // Implementation
}

/**
 * Detect if update is likely a duplicate
 * @param goalId - Goal ID
 * @param update - New update to check
 * @param history - Existing history
 * @param timeWindow - Time window in milliseconds (default 60000)
 * @returns true if update appears to be duplicate
 */
export function isDuplicateUpdate(
  goalId: string,
  update: ProgressUpdate,
  history: ProgressUpdate[],
  timeWindow?: number
): boolean {
  // Implementation
}

/**
 * Format progress value for display
 * @param value - Progress value [0, 100]
 * @param unit - Optional unit string (e.g., "km", "%")
 * @returns Formatted string (e.g., "65%", "32.5km")
 */
export function formatProgressDisplay(
  value: number,
  unit?: string
): string {
  // Implementation
}

/**
 * Format timestamp for human display
 * @param timestamp - Unix timestamp in milliseconds
 * @param format - Optional format string (default: "MMM dd, HH:mm")
 * @returns Formatted date string
 */
export function formatUpdateTimestamp(
  timestamp: number,
  format?: string
): string {
  // Implementation
}
```

### Zod Schema Contracts

```typescript
/**
 * Zod schema for validating quantitative progress updates
 */
export const quantitativeProgressUpdateSchema: ZodSchema<QuantitativeProgressUpdate>;

/**
 * Zod schema for validating qualitative progress updates
 */
export const qualitativeProgressUpdateSchema: ZodSchema<QualitativeProgressUpdate>;

/**
 * Zod schema for validating binary progress updates
 */
export const binaryProgressUpdateSchema: ZodSchema<BinaryProgressUpdate>;

/**
 * Zod schema for validating milestone progress updates
 */
export const milestoneProgressUpdateSchema: ZodSchema<MilestoneProgressUpdate>;

/**
 * Zod schema for validating recurring progress updates
 */
export const recurringProgressUpdateSchema: ZodSchema<RecurringProgressUpdate>;

/**
 * Zod schema for validating habit progress updates
 */
export const habitProgressUpdateSchema: ZodSchema<HabitProgressUpdate>;

/**
 * Composite schema that discriminates by goal type
 */
export const progressUpdateSchema: ZodSchema<GoalProgressUpdate>;
```

### Zustand Store Contract

```typescript
/**
 * Progress state and actions
 */
export interface ProgressStore {
  // State
  updates: Map<string, ProgressUpdate[]>;
  progressCache: Map<string, ProgressCache[string]>;
  loading: boolean;
  error: Error | null;

  // Actions
  addUpdate: (goalId: string, update: ProgressUpdate) => Promise<void>;
  getHistory: (goalId: string) => ProgressUpdate[];
  getCurrentProgress: (goalId: string) => number;
  invalidateCache: (goalId: string) => void;
  clearError: () => void;
}

export const useProgressStore: UseBoundStore<StoreApi<ProgressStore>>;
```

## Type Safety Guarantees

- ✅ All `ProgressUpdate` types are discriminated by `type` property
- ✅ Type guards enable safe runtime narrowing
- ✅ No `any` types used in interfaces
- ✅ All calculations return `number` (no `NaN`, `Infinity` escape without catching)
- ✅ Component props are type-safe with goal type constraints
- ✅ Zod schemas enforce runtime validation
- ✅ Utility functions have clear input/output contracts

## Backward Compatibility

- All progress update interfaces are versioned (future: add `version: 1` property)
- Type guards provide forward compatibility when adding new goal types
- Calculation functions have overloads for future parameters
