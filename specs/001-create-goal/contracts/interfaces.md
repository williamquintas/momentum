# Interface Contracts: Create Goal

**Feature**: Create Goal | **Date**: 2026-03-22
**Purpose**: Define TypeScript interfaces and component contracts for goal creation

## Core Type Definitions

### Goal Enums and Basic Types

```typescript
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
```

### Goal Type Interfaces (extends @bkp/types/goal.types.ts)

```typescript
// Base Goal interface
export interface BaseGoal {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly type: GoalType;
  readonly status: GoalStatus;
  readonly priority: Priority;
  readonly category: string;
  readonly tags: readonly string[];
  readonly startDate?: Date;
  readonly deadline?: Date;
  readonly completedDate?: Date;
  readonly progress: number;
  readonly progressHistory: readonly ProgressEntry[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly createdBy: string;
  readonly assignee?: string;
  readonly notes: readonly Note[];
  readonly attachments: readonly Attachment[];
  readonly relatedGoals: readonly string[];
  readonly archived?: boolean;
  readonly favorite?: boolean;
}

// Quantitative Goal
export interface QuantitativeGoal extends BaseGoal {
  readonly type: GoalType.QUANTITATIVE;
  readonly startValue: number;
  readonly targetValue: number;
  readonly currentValue: number;
  readonly unit: string;
  readonly allowDecimals: boolean;
  readonly minValue?: number;
  readonly maxValue?: number;
}

// Qualitative Goal
export interface QualitativeGoal extends BaseGoal {
  readonly type: GoalType.QUALITATIVE;
  readonly qualitativeStatus: QualitativeStatus;
  readonly selfAssessments: readonly SelfAssessment[];
  readonly improvementCriteria?: readonly string[];
  readonly targetRating?: number;
}

// Binary Goal
export interface BinaryGoal extends BaseGoal {
  readonly type: GoalType.BINARY;
  readonly targetCount?: number;
  readonly currentCount: number;
  readonly items?: readonly string[];
  readonly allowPartialCompletion: boolean;
}

// Milestone Goal
export interface MilestoneGoal extends BaseGoal {
  readonly type: GoalType.MILESTONE;
  readonly milestones: readonly Milestone[];
  readonly allowMilestoneReordering: boolean;
  readonly requireSequentialCompletion: boolean;
}

// Recurring Goal
export interface RecurringGoal extends BaseGoal {
  readonly type: GoalType.RECURRING;
  readonly recurrence: Recurrence;
  readonly completionStats: CompletionStats;
  readonly occurrences: readonly HabitEntry[];
}

// Habit Goal
export interface HabitGoal extends BaseGoal {
  readonly type: GoalType.HABIT;
  readonly targetFrequency: 'daily' | 'every_other_day' | 'weekly' | 'custom';
  readonly customFrequency?: number;
  readonly completionStats: CompletionStats;
  readonly entries: readonly HabitEntry[];
  readonly habitStrength?: number;
}

// Union type
export type Goal = 
  | QuantitativeGoal 
  | QualitativeGoal 
  | BinaryGoal 
  | MilestoneGoal 
  | RecurringGoal 
  | HabitGoal;
```

### Supporting Types

```typescript
export interface Milestone {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  readonly dueDate?: Date;
  readonly completedDate?: Date;
  readonly order: number;
  readonly dependencies?: readonly string[];
  readonly metadata?: Record<string, unknown>;
}

export interface ProgressEntry {
  readonly id: string;
  readonly date: Date;
  readonly value: number;
  readonly note?: string;
  readonly metadata?: Record<string, unknown>;
}

export interface Note {
  readonly id: string;
  readonly content: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly createdBy: string;
  readonly tags?: readonly string[];
}

export interface Attachment {
  readonly id: string;
  readonly filename: string;
  readonly url: string;
  readonly mimeType: string;
  readonly size: number;
  readonly uploadedAt: Date;
  readonly uploadedBy: string;
}

export interface Recurrence {
  readonly frequency: RecurrenceFrequency;
  readonly interval: number;
  readonly endDate?: Date;
  readonly daysOfWeek?: readonly number[];
  readonly dayOfMonth?: number;
  readonly dayOfYear?: number;
}

export interface CompletionStats {
  readonly totalOccurrences: number;
  readonly completedOccurrences: number;
  readonly completionRate: number;
  readonly streak: Streak;
  readonly lastCompletedDate?: Date;
  readonly firstCompletedDate?: Date;
}

export interface Streak {
  readonly current: number;
  readonly longest: number;
  readonly lastCompletedDate?: Date;
  readonly startDate?: Date;
}

export interface SelfAssessment {
  readonly id: string;
  readonly date: Date;
  readonly rating: number;
  readonly comment?: string;
  readonly criteria?: Record<string, number>;
}

export interface HabitEntry {
  readonly id: string;
  readonly date: Date;
  readonly completed: boolean;
  readonly value?: number;
  readonly note?: string;
  readonly metadata?: Record<string, unknown>;
}
```

## Component Contracts

### CreateGoalForm Component

```typescript
interface CreateGoalFormProps {
  readonly onSubmit: (input: CreateGoalInput) => Promise<void>;
  readonly initialValues?: Partial<CreateGoalInput>;
  readonly isLoading?: boolean;
  readonly error?: string | null;
}

export const CreateGoalForm: React.FC<CreateGoalFormProps>;
```

### Type-Specific Field Components

```typescript
interface TypeSpecificFieldsProps {
  readonly form: FormInstance;
  readonly initialValues?: Partial<Goal>;
}

export const QuantitativeGoalFields: React.FC<TypeSpecificFieldsProps>;
export const QualitativeGoalFields: React.FC<TypeSpecificFieldsProps>;
export const BinaryGoalFields: React.FC<TypeSpecificFieldsProps>;
export const MilestoneGoalFields: React.FC<TypeSpecificFieldsProps>;
export const RecurringGoalFields: React.FC<TypeSpecificFieldsProps>;
export const HabitGoalFields: React.FC<TypeSpecificFieldsProps>;
```

## Hook Contracts

### useCreateGoal Hook

```typescript
interface UseCreateGoalReturn {
  readonly createGoal: (input: CreateGoalInput) => Promise<Goal>;
  readonly isLoading: boolean;
  readonly error: string | null;
}

export const useCreateGoal = (): UseCreateGoalReturn;
```

### useGoalForm Hook

```typescript
interface UseGoalFormReturn {
  readonly form: FormInstance;
  readonly values: CreateGoalInput;
  readonly errors: Record<string, string>;
  readonly isValid: boolean;
  readonly resetForm: () => void;
}

export const useGoalForm = (initialValues?: Partial<CreateGoalInput>): UseGoalFormReturn;
```

## Utility Function Contracts

### Validation Functions

```typescript
export const validateGoal = (input: Partial<Goal>): ValidationError[];
export const validateTitle = (title: string): string | null;
export const validateQuantitativeGoal = (goal: Partial<QuantitativeGoal>): ValidationError[];
export const validateMilestoneGoal = (goal: Partial<MilestoneGoal>): ValidationError[];
export const validateRecurringGoal = (goal: Partial<RecurringGoal>): ValidationError[];
export const validateHabitGoal = (goal: Partial<HabitGoal>): ValidationError[];
export const detectCyclicDependencies = (milestones: Milestone[]): boolean;
```

### Initialization Functions

```typescript
export const getDefaultGoal = (type: GoalType): Partial<Goal>;
export const initializeQuantitativeGoal = (): Partial<QuantitativeGoal>;
export const initializeMilestoneGoal = (): Partial<MilestoneGoal>;
export const initializeRecurringGoal = (): Partial<RecurringGoal>;
export const initializeHabitGoal = (): Partial<HabitGoal>;
```

## Service Contracts

### Goal Storage Service

```typescript
interface IGoalStorageService {
  readonly createGoal: (input: CreateGoalInput) => Promise<Goal>;
  readonly getGoal: (id: string) => Promise<Goal | null>;
  readonly updateGoal: (id: string, updates: Partial<Goal>) => Promise<Goal>;
  readonly deleteGoal: (id: string) => Promise<void>;
  readonly listGoals: (filters?: GoalFilters) => Promise<Goal[]>;
}

export const goalStorageService: IGoalStorageService;
```

## Type Guards

```typescript
export function isQuantitativeGoal(goal: Goal): goal is QuantitativeGoal;
export function isQualitativeGoal(goal: Goal): goal is QualitativeGoal;
export function isBinaryGoal(goal: Goal): goal is BinaryGoal;
export function isMilestoneGoal(goal: Goal): goal is MilestoneGoal;
export function isRecurringGoal(goal: Goal): goal is RecurringGoal;
export function isHabitGoal(goal: Goal): goal is HabitGoal;
```
