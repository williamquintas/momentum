# Type Contracts: Complete Goal

## Core Completion Types

```typescript
// Completion event types
type CompletionType = 'automatic' | 'manual' | 'early' | 'admin';

interface CompletionEvent {
  id: string;
  goalId: string;
  completedAt: number;
  completedBy: string; // user ID
  completionType: CompletionType;
  reason?: string; // for early or admin completions

  // Immutable snapshot of goal state at completion
  goalSnapshot: GoalSnapshot;

  // Calculated metrics
  metrics: CompletionMetrics;

  // Metadata
  version: string; // schema version for migrations
  createdAt: number;
  updatedAt: number;
}

// Goal snapshot for historical reference
interface GoalSnapshot {
  id: string;
  title: string;
  description?: string;
  type: GoalType;
  status: GoalStatus;
  createdAt: number;
  target: GoalTarget;
  current: GoalCurrent;
  settings: GoalSettings;
  tags: string[];
}

// Completion metrics
interface CompletionMetrics {
  // Time-based metrics
  totalTimeMs: number; // from creation to completion
  activeTimeMs: number; // time goal was active (excluding paused)

  // Progress metrics
  totalUpdates: number;
  averageUpdateFrequency: number; // updates per day
  progressRate: number; // units per day

  // Goal-specific metrics
  goalSpecificMetrics: GoalSpecificMetrics;

  // Achievement metrics
  overshootPercentage?: number; // for quantitative goals
  streakAtCompletion?: number; // for habit goals
  milestonesCompleted?: number; // for milestone goals
}

// Goal-specific metrics union
type GoalSpecificMetrics =
  | QuantitativeMetrics
  | BinaryMetrics
  | MilestoneMetrics
  | RecurringMetrics
  | HabitMetrics
  | QualitativeMetrics;
```

## Goal-Specific Completion Types

```typescript
// Quantitative goal completion
interface QuantitativeMetrics {
  targetValue: number;
  finalValue: number;
  overshootAmount: number;
  overshootPercentage: number;
  progressEfficiency: number; // actual progress / expected progress
}

interface QuantitativeCompletionCriteria {
  currentValue: number;
  targetValue: number;
  allowOvershoot: boolean;
  minimumThreshold?: number; // allow early completion
}

// Binary goal completion
interface BinaryMetrics {
  achievementDate: number;
  timeToAchievement: number;
}

interface BinaryCompletionCriteria {
  achieved: boolean;
}

// Milestone goal completion
interface MilestoneMetrics {
  totalMilestones: number;
  completedMilestones: number;
  averageTimePerMilestone: number;
  longestMilestoneStreak: number;
}

interface MilestoneCompletionCriteria {
  allMilestonesComplete: boolean;
  allowPartialCompletion: boolean;
  minimumCompletionPercentage?: number;
}

// Recurring goal completion
interface RecurringMetrics {
  totalOccurrences: number;
  completedOccurrences: number;
  completionRate: number;
  averageCompletionTime: number;
  bestStreak: number;
}

interface RecurringCompletionCriteria {
  scheduleComplete: boolean;
  minimumCompletionRate?: number;
  allowPartialCompletion: boolean;
}

// Habit goal completion
interface HabitMetrics {
  finalStreak: number;
  longestStreak: number;
  totalCompletions: number;
  averageFrequency: number;
  consistencyScore: number; // 0-100
}

interface HabitCompletionCriteria {
  currentStreak: number;
  targetStreak: number;
  allowEarlyCompletion: boolean;
}

// Qualitative goal completion
interface QualitativeMetrics {
  selfRating: number; // 1-10 scale
  reflectionWordCount: number;
  evidenceProvided: boolean;
}

interface QualitativeCompletionCriteria {
  selfAssessmentComplete: boolean;
  minimumReflectionLength?: number;
  evidenceRequired: boolean;
}
```

## Completion Validation Types

```typescript
// Generic completion criteria
interface CompletionCriteria {
  goalId: string;
  goalType: GoalType;
  isEligible: boolean;
  criteria: GoalSpecificCriteria;
  validationErrors: string[];
  warnings: string[];
}

// Union of all goal-specific criteria
type GoalSpecificCriteria =
  | QuantitativeCompletionCriteria
  | BinaryCompletionCriteria
  | MilestoneCompletionCriteria
  | RecurringCompletionCriteria
  | HabitCompletionCriteria
  | QualitativeCompletionCriteria;

// Validation result
interface CompletionValidationResult {
  isValid: boolean;
  errors: CompletionValidationError[];
  warnings: CompletionValidationWarning[];
  criteria: CompletionCriteria;
}

interface CompletionValidationError {
  code: string;
  message: string;
  field?: string;
  value?: any;
}

interface CompletionValidationWarning {
  code: string;
  message: string;
  suggestion?: string;
}
```

## Celebration System Types

```typescript
// Celebration preferences
interface CelebrationPreferences {
  enableSound: boolean;
  enableAnimation: boolean;
  enableNotifications: boolean;
  celebrationStyle: CelebrationStyle;
  favoriteCelebrations: CelebrationType[];
  customMessage?: string;
}

type CelebrationStyle = 'subtle' | 'moderate' | 'enthusiastic' | 'custom';

type CelebrationType =
  | 'confetti'
  | 'fireworks'
  | 'badge'
  | 'trophy'
  | 'stars'
  | 'hearts'
  | 'checkmark'
  | 'progress-bar'
  | 'custom';

// Celebration data
interface CelebrationData {
  type: CelebrationType;
  duration: number; // milliseconds
  sound?: CelebrationSound;
  animation?: CelebrationAnimation;
  message: string;
  metadata?: Record<string, any>;
}

interface CelebrationSound {
  enabled: boolean;
  volume: number; // 0-100
  type: 'success' | 'achievement' | 'celebration' | 'custom';
  url?: string;
}

interface CelebrationAnimation {
  enabled: boolean;
  intensity: 'low' | 'medium' | 'high';
  colors: string[];
  particles?: number;
}
```

## API Contract Types

```typescript
// Completion request
interface CompleteGoalRequest {
  goalId: string;
  completionType: CompletionType;
  reason?: string;
  celebrationPreferences?: Partial<CelebrationPreferences>;
  metadata?: Record<string, any>;
}

// Completion response
interface CompleteGoalResponse {
  success: boolean;
  completion: CompletionEvent;
  celebration?: CelebrationData;
  nextSteps?: CompletionNextStep[];
  errors?: ApiError[];
}

interface CompletionNextStep {
  type: 'create_new_goal' | 'view_analytics' | 'share_achievement';
  title: string;
  description: string;
  actionUrl?: string;
}

// Completion eligibility check
interface CompletionEligibilityRequest {
  goalId: string;
}

interface CompletionEligibilityResponse {
  isEligible: boolean;
  criteria: CompletionCriteria;
  estimatedMetrics?: Partial<CompletionMetrics>;
  canCompleteEarly: boolean;
}

// Bulk completion operations
interface BulkCompleteRequest {
  goalIds: string[];
  completionType: CompletionType;
  reason?: string;
}

interface BulkCompleteResponse {
  results: BulkCompleteResult[];
  summary: {
    successful: number;
    failed: number;
    total: number;
  };
}

interface BulkCompleteResult {
  goalId: string;
  success: boolean;
  completion?: CompletionEvent;
  error?: ApiError;
}
```

## State Management Types

```typescript
// Completion state in store
interface CompletionState {
  completions: Record<string, CompletionEvent>;
  eligibilityCache: Record<string, CompletionEligibilityResponse>;
  pendingCompletions: Record<string, PendingCompletion>;
  preferences: CelebrationPreferences;
}

// Pending completion (for optimistic updates)
interface PendingCompletion {
  goalId: string;
  request: CompleteGoalRequest;
  startedAt: number;
  timeoutId?: number;
}

// Completion actions
type CompletionAction =
  | { type: 'COMPLETE_GOAL_START'; payload: { goalId: string; request: CompleteGoalRequest } }
  | { type: 'COMPLETE_GOAL_SUCCESS'; payload: { completion: CompletionEvent } }
  | { type: 'COMPLETE_GOAL_FAILURE'; payload: { goalId: string; error: ApiError } }
  | { type: 'CHECK_ELIGIBILITY_SUCCESS'; payload: { goalId: string; eligibility: CompletionEligibilityResponse } }
  | { type: 'UPDATE_CELEBRATION_PREFERENCES'; payload: { preferences: CelebrationPreferences } }
  | { type: 'CLEAR_COMPLETION_CACHE'; payload: { goalId?: string } };
```

## Error Types

```typescript
// Completion-specific errors
type CompletionErrorCode =
  | 'GOAL_NOT_FOUND'
  | 'GOAL_ALREADY_COMPLETED'
  | 'GOAL_ARCHIVED'
  | 'INSUFFICIENT_PERMISSIONS'
  | 'VALIDATION_FAILED'
  | 'CRITERIA_NOT_MET'
  | 'CONCURRENT_MODIFICATION'
  | 'STORAGE_ERROR'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

interface CompletionError extends ApiError {
  code: CompletionErrorCode;
  goalId?: string;
  criteria?: CompletionCriteria;
  validationErrors?: CompletionValidationError[];
}

// API error base
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: number;
  requestId?: string;
}
```

## Hook Types

```typescript
// Completion hook return type
interface UseCompletionReturn {
  completeGoal: (request: CompleteGoalRequest) => Promise<CompleteGoalResponse>;
  checkEligibility: (goalId: string) => Promise<CompletionEligibilityResponse>;
  isCompleting: boolean;
  eligibility: CompletionEligibilityResponse | null;
  lastCompletion: CompletionEvent | null;
  error: CompletionError | null;
}

// Completion detection hook
interface UseCompletionDetectionReturn {
  isEligible: boolean;
  criteria: CompletionCriteria | null;
  showPrompt: boolean;
  dismissPrompt: () => void;
  lastChecked: number | null;
}

// Celebration hook
interface UseCelebrationReturn {
  preferences: CelebrationPreferences;
  updatePreferences: (prefs: Partial<CelebrationPreferences>) => void;
  celebrate: (data: CelebrationData) => void;
  isCelebrating: boolean;
}
```

## Component Prop Types

```typescript
// Completion dialog props
interface CompletionDialogProps {
  goal: Goal;
  open: boolean;
  onClose: () => void;
  onComplete: (request: CompleteGoalRequest) => void;
  eligibility: CompletionEligibilityResponse;
  isCompleting?: boolean;
}

// Completion criteria display props
interface CompletionCriteriaDisplayProps {
  criteria: CompletionCriteria;
  showValidationErrors?: boolean;
  showWarnings?: boolean;
}

// Celebration selector props
interface CelebrationSelectorProps {
  preferences: CelebrationPreferences;
  onChange: (prefs: Partial<CelebrationPreferences>) => void;
  previewMode?: boolean;
}

// Completion metrics display props
interface CompletionMetricsDisplayProps {
  metrics: CompletionMetrics;
  goal: Goal;
  showComparison?: boolean;
  compact?: boolean;
}
```

## Storage Types

```typescript
// Completion storage interface
interface CompletionStorage {
  saveCompletion: (completion: CompletionEvent) => Promise<void>;
  getCompletion: (goalId: string) => Promise<CompletionEvent | null>;
  getCompletionsByUser: (userId: string, options?: CompletionQueryOptions) => Promise<CompletionEvent[]>;
  updateCompletion: (goalId: string, updates: Partial<CompletionEvent>) => Promise<void>;
  deleteCompletion: (goalId: string) => Promise<void>;
}

interface CompletionQueryOptions {
  limit?: number;
  offset?: number;
  dateRange?: {
    start: number;
    end: number;
  };
  goalTypes?: GoalType[];
  completionTypes?: CompletionType[];
  sortBy?: 'completedAt' | 'createdAt' | 'metrics.totalTimeMs';
  sortOrder?: 'asc' | 'desc';
}

// Local storage schema
interface CompletionLocalStorage {
  completions: Record<string, CompletionEvent>;
  eligibilityCache: Record<string, {
    data: CompletionEligibilityResponse;
    expiresAt: number;
  }>;
  preferences: CelebrationPreferences;
  lastSync: number;
}
```

## Validation Schema Types

```typescript
// Zod schemas for runtime validation
import { z } from 'zod';

// Completion event schema
const CompletionEventSchema = z.object({
  id: z.string().uuid(),
  goalId: z.string().uuid(),
  completedAt: z.number().positive(),
  completedBy: z.string(),
  completionType: z.enum(['automatic', 'manual', 'early', 'admin']),
  reason: z.string().optional(),
  goalSnapshot: GoalSnapshotSchema,
  metrics: CompletionMetricsSchema,
  version: z.string(),
  createdAt: z.number().positive(),
  updatedAt: z.number().positive(),
});

// Completion criteria validation
const CompletionCriteriaSchema = z.discriminatedUnion('goalType', [
  z.object({
    goalType: z.literal('quantitative'),
    currentValue: z.number(),
    targetValue: z.number().positive(),
    allowOvershoot: z.boolean(),
    minimumThreshold: z.number().optional(),
  }),
  z.object({
    goalType: z.literal('binary'),
    achieved: z.boolean(),
  }),
  // ... other goal types
]);

// API request validation
const CompleteGoalRequestSchema = z.object({
  goalId: z.string().uuid(),
  completionType: z.enum(['automatic', 'manual', 'early', 'admin']),
  reason: z.string().optional(),
  celebrationPreferences: CelebrationPreferencesSchema.optional(),
  metadata: z.record(z.any()).optional(),
});
```

## Event Types

```typescript
// Completion-related events
type CompletionEventType =
  | 'goal.completed'
  | 'goal.completion.eligible'
  | 'goal.completion.ineligible'
  | 'completion.celebration.shown'
  | 'completion.undo.requested'
  | 'completion.metrics.calculated';

interface CompletionDomainEvent {
  type: CompletionEventType;
  goalId: string;
  userId: string;
  timestamp: number;
  data: Record<string, any>;
  metadata?: {
    requestId?: string;
    userAgent?: string;
    ipAddress?: string;
  };
}

// Event handlers
type CompletionEventHandler = (event: CompletionDomainEvent) => void | Promise<void>;

interface CompletionEventBus {
  publish: (event: CompletionDomainEvent) => void;
  subscribe: (eventType: CompletionEventType, handler: CompletionEventHandler) => () => void;
  unsubscribe: (eventType: CompletionEventType, handler: CompletionEventHandler) => void;
}
```

## Migration Types

```typescript
// Schema migration support
interface CompletionMigration {
  version: string;
  description: string;
  up: (completion: any) => CompletionEvent;
  down?: (completion: CompletionEvent) => any;
}

// Migration registry
interface CompletionMigrationRegistry {
  register: (migration: CompletionMigration) => void;
  migrate: (completion: any) => CompletionEvent;
  getVersion: () => string;
  getMigrations: () => CompletionMigration[];
}
```

## Testing Types

```typescript
// Test data factories
interface CompletionTestData {
  validCompletion: CompletionEvent;
  invalidCompletion: Partial<CompletionEvent>;
  completionWithMetrics: CompletionEvent;
  earlyCompletion: CompletionEvent;
  adminCompletion: CompletionEvent;
}

// Mock implementations
interface CompletionMockStorage extends CompletionStorage {
  __reset: () => void;
  __getCalls: () => any[];
  __setMockData: (data: Record<string, CompletionEvent>) => void;
}

// Test utilities
interface CompletionTestUtils {
  createTestCompletion: (overrides?: Partial<CompletionEvent>) => CompletionEvent;
  createTestCriteria: (goalType: GoalType, overrides?: any) => CompletionCriteria;
  createTestMetrics: (goalType: GoalType, overrides?: any) => CompletionMetrics;
  validateCompletionContract: (completion: any) => boolean;
}
```
