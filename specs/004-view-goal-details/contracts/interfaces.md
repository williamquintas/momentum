# Type Contracts: View Goal Details

## Core Interfaces

### Goal Detail View Models

```typescript
export interface GoalDetailView {
  /** Unique identifier for the goal */
  id: string;

  /** Basic goal information */
  basic: GoalBasicInfo;

  /** Current progress information */
  progress: GoalProgressInfo;

  /** Goal-specific details based on type */
  details: GoalTypeDetails;

  /** Metadata and timestamps */
  metadata: GoalMetadata;

  /** User permissions for this goal */
  permissions: GoalPermissions;
}

export interface GoalBasicInfo {
  /** Goal title */
  title: string;

  /** Goal description */
  description?: string;

  /** Goal type identifier */
  type: GoalType;

  /** Current goal status */
  status: GoalStatus;

  /** Goal priority level */
  priority: GoalPriority;

  /** Associated tags */
  tags: string[];

  /** Goal category */
  category?: string;

  /** Color theme for UI */
  color?: string;
}

export interface GoalProgressInfo {
  /** Current progress value */
  current: number;

  /** Target progress value */
  target: number;

  /** Progress percentage (0-100) */
  percentage: number;

  /** Progress trend direction */
  trend: ProgressTrend;

  /** Velocity (progress per unit time) */
  velocity?: ProgressVelocity;

  /** Estimated completion date */
  estimatedCompletion?: Date;

  /** Last progress update timestamp */
  lastUpdated: Date;
}

export interface GoalMetadata {
  /** Goal creation timestamp */
  createdAt: Date;

  /** Last modification timestamp */
  updatedAt: Date;

  /** Goal creation source */
  source: GoalSource;

  /** Associated project or context */
  project?: string;

  /** Custom metadata fields */
  customFields: Record<string, any>;

  /** Goal version for optimistic updates */
  version: number;
}

export interface GoalPermissions {
  /** Can view goal details */
  canView: boolean;

  /** Can edit goal information */
  canEdit: boolean;

  /** Can update progress */
  canUpdateProgress: boolean;

  /** Can delete goal */
  canDelete: boolean;

  /** Can share goal */
  canShare: boolean;

  /** Can export goal data */
  canExport: boolean;
}
```

### Goal Type Details

```typescript
export type GoalTypeDetails =
  | QuantitativeGoalDetails
  | BinaryGoalDetails
  | MilestoneGoalDetails
  | RecurringGoalDetails
  | HabitGoalDetails
  | QualitativeGoalDetails;

export interface QuantitativeGoalDetails {
  type: 'quantitative';

  /** Unit of measurement */
  unit: string;

  /** Minimum possible value */
  minValue?: number;

  /** Maximum possible value */
  maxValue?: number;

  /** Decimal precision for display */
  precision: number;

  /** Progress visualization type */
  visualization: 'bar' | 'circle' | 'line';
}

export interface BinaryGoalDetails {
  type: 'binary';

  /** Completion state */
  completed: boolean;

  /** Completion timestamp */
  completedAt?: Date;

  /** Binary goal subtype */
  subtype: 'task' | 'achievement' | 'milestone';
}

export interface MilestoneGoalDetails {
  type: 'milestone';

  /** Hierarchical milestone structure */
  milestones: MilestoneNode[];

  /** Total number of milestones */
  totalMilestones: number;

  /** Completed milestones count */
  completedMilestones: number;

  /** Current milestone being worked on */
  currentMilestone?: string;
}

export interface RecurringGoalDetails {
  type: 'recurring';

  /** Recurrence pattern */
  recurrence: RecurrencePattern;

  /** Total occurrences */
  totalOccurrences: number;

  /** Completed occurrences */
  completedOccurrences: number;

  /** Current streak */
  currentStreak: number;

  /** Longest streak */
  longestStreak: number;

  /** Completion rate percentage */
  completionRate: number;
}

export interface HabitGoalDetails {
  type: 'habit';

  /** Habit frequency */
  frequency: HabitFrequency;

  /** Calendar heatmap data */
  calendarData: HabitCalendarData;

  /** Current streak information */
  streak: HabitStreak;

  /** Habit tracking mode */
  trackingMode: 'manual' | 'automatic' | 'reminder';
}

export interface QualitativeGoalDetails {
  type: 'qualitative';

  /** Self-assessment scale */
  scale: QualitativeScale;

  /** Current self-assessment */
  currentAssessment?: QualitativeAssessment;

  /** Assessment history */
  assessmentHistory: QualitativeAssessment[];

  /** Reflection prompts */
  reflectionPrompts: string[];
}
```

### Supporting Types

```typescript
export type GoalType = 'quantitative' | 'binary' | 'milestone' | 'recurring' | 'habit' | 'qualitative';

export type GoalStatus = 'active' | 'completed' | 'paused' | 'archived' | 'cancelled';

export type GoalPriority = 'low' | 'medium' | 'high' | 'critical';

export type GoalSource = 'manual' | 'template' | 'import' | 'api';

export type ProgressTrend = 'increasing' | 'decreasing' | 'stable' | 'volatile';

export interface ProgressVelocity {
  /** Progress per day */
  perDay: number;

  /** Progress per week */
  perWeek: number;

  /** Progress per month */
  perMonth: number;

  /** Unit of time for velocity */
  unit: string;
}

export interface MilestoneNode {
  /** Milestone unique identifier */
  id: string;

  /** Milestone title */
  title: string;

  /** Milestone description */
  description?: string;

  /** Completion status */
  completed: boolean;

  /** Completion timestamp */
  completedAt?: Date;

  /** Due date */
  dueDate?: Date;

  /** Child milestones */
  children: MilestoneNode[];

  /** Parent milestone ID */
  parentId?: string;

  /** Milestone priority */
  priority: GoalPriority;

  /** Associated progress value */
  progressValue?: number;
}

export interface RecurrencePattern {
  /** Recurrence type */
  type: 'daily' | 'weekly' | 'monthly' | 'custom';

  /** Interval (every N units) */
  interval: number;

  /** Days of week for weekly recurrence */
  daysOfWeek?: number[];

  /** Days of month for monthly recurrence */
  daysOfMonth?: number[];

  /** Time of day for occurrence */
  timeOfDay?: string;

  /** Timezone for recurrence */
  timezone: string;
}

export interface HabitFrequency {
  /** Frequency type */
  type: 'daily' | 'weekly' | 'custom';

  /** Target occurrences per period */
  targetOccurrences: number;

  /** Period length in days */
  periodDays: number;

  /** Specific days of week */
  daysOfWeek?: number[];
}

export interface HabitCalendarData {
  /** Year for the calendar */
  year: number;

  /** Month for the calendar */
  month: number;

  /** Daily completion data */
  days: HabitDayData[];
}

export interface HabitDayData {
  /** Date for this day */
  date: Date;

  /** Completion status */
  completed: boolean;

  /** Number of occurrences on this day */
  occurrences: number;

  /** Notes for this day */
  notes?: string;
}

export interface HabitStreak {
  /** Current streak length */
  current: number;

  /** Longest streak ever */
  longest: number;

  /** Last completion date */
  lastCompleted?: Date;

  /** Streak start date */
  startDate?: Date;
}

export interface QualitativeScale {
  /** Scale type */
  type: 'numeric' | 'likert' | 'custom';

  /** Minimum value */
  min: number;

  /** Maximum value */
  max: number;

  /** Scale labels */
  labels: Record<number, string>;

  /** Custom scale values */
  customValues?: string[];
}

export interface QualitativeAssessment {
  /** Assessment value */
  value: number;

  /** Assessment timestamp */
  timestamp: Date;

  /** Assessment notes */
  notes?: string;

  /** Assessment context */
  context?: string;
}
```

## API Contracts

### Request/Response Types

```typescript
export interface GoalDetailRequest {
  /** Goal ID to fetch */
  goalId: string;

  /** Include progress history */
  includeHistory?: boolean;

  /** Include milestone details */
  includeMilestones?: boolean;

  /** Include related goals */
  includeRelated?: boolean;

  /** Requested data freshness */
  freshness?: 'cache' | 'fresh' | 'realtime';
}

export interface GoalDetailResponse {
  /** Goal detail data */
  goal: GoalDetailView;

  /** Related goals */
  relatedGoals?: GoalSummary[];

  /** Response metadata */
  metadata: ResponseMetadata;
}

export interface GoalHistoryRequest {
  /** Goal ID */
  goalId: string;

  /** Pagination cursor */
  cursor?: string;

  /** Page size */
  limit?: number;

  /** Date range filter */
  dateRange?: DateRange;

  /** History type filter */
  type?: ProgressUpdateType[];
}

export interface GoalHistoryResponse {
  /** Progress updates */
  updates: ProgressUpdate[];

  /** Pagination information */
  pagination: PaginationInfo;

  /** Summary statistics */
  summary: HistorySummary;
}

export interface ProgressUpdateRequest {
  /** Goal ID */
  goalId: string;

  /** New progress value */
  value: number;

  /** Update notes */
  notes?: string;

  /** Update timestamp */
  timestamp?: Date;

  /** Update type */
  type: ProgressUpdateType;
}

export interface ProgressUpdateResponse {
  /** Updated goal data */
  goal: GoalDetailView;

  /** Update confirmation */
  update: ProgressUpdate;

  /** Success status */
  success: boolean;
}
```

### Supporting API Types

```typescript
export interface GoalSummary {
  /** Goal ID */
  id: string;

  /** Goal title */
  title: string;

  /** Goal type */
  type: GoalType;

  /** Current progress percentage */
  progress: number;

  /** Goal status */
  status: GoalStatus;

  /** Last updated timestamp */
  lastUpdated: Date;
}

export interface ResponseMetadata {
  /** Response timestamp */
  timestamp: Date;

  /** Data freshness indicator */
  freshness: 'cache' | 'fresh' | 'realtime';

  /** Request processing time */
  processingTime: number;

  /** Cache expiry time */
  expiresAt?: Date;
}

export interface DateRange {
  /** Start date */
  start: Date;

  /** End date */
  end: Date;
}

export type ProgressUpdateType = 'manual' | 'automatic' | 'milestone' | 'completion' | 'reset';

export interface ProgressUpdate {
  /** Update unique identifier */
  id: string;

  /** Goal ID */
  goalId: string;

  /** Previous value */
  previousValue: number;

  /** New value */
  newValue: number;

  /** Change amount */
  change: number;

  /** Update timestamp */
  timestamp: Date;

  /** Update type */
  type: ProgressUpdateType;

  /** Update notes */
  notes?: string;

  /** Update source */
  source: UpdateSource;

  /** Associated milestone ID */
  milestoneId?: string;
}

export interface PaginationInfo {
  /** Next page cursor */
  nextCursor?: string;

  /** Previous page cursor */
  prevCursor?: string;

  /** Total items available */
  totalItems?: number;

  /** Items in current page */
  currentItems: number;

  /** Has more items */
  hasMore: boolean;
}

export interface HistorySummary {
  /** Total number of updates */
  totalUpdates: number;

  /** Average change per update */
  averageChange: number;

  /** Largest single change */
  largestChange: number;

  /** Most recent update */
  lastUpdate: Date;

  /** Update frequency (updates per day) */
  frequency: number;
}

export type UpdateSource = 'user' | 'system' | 'api' | 'import' | 'automation';
```

## State Management Contracts

### Zustand Store Interfaces

```typescript
export interface GoalDetailStore {
  // Current goal data
  currentGoal: GoalDetailView | null;
  loading: boolean;
  error: string | null;

  // History data
  history: ProgressUpdate[];
  historyLoading: boolean;
  historyPagination: PaginationInfo | null;

  // UI state
  activeTab: GoalDetailTab;
  expandedMilestones: Set<string>;
  showProgressChart: boolean;

  // Actions
  loadGoal: (goalId: string) => Promise<void>;
  updateProgress: (update: ProgressUpdateRequest) => Promise<void>;
  loadHistory: (request: GoalHistoryRequest) => Promise<void>;
  setActiveTab: (tab: GoalDetailTab) => void;
  toggleMilestoneExpansion: (milestoneId: string) => void;
  refreshGoal: () => Promise<void>;
  clearError: () => void;
}

export type GoalDetailTab = 'overview' | 'progress' | 'history' | 'milestones' | 'analytics';

export interface GoalDetailActions {
  /** Load goal details */
  loadGoal: (goalId: string, options?: LoadOptions) => Promise<void>;

  /** Update goal progress */
  updateProgress: (goalId: string, value: number, notes?: string) => Promise<void>;

  /** Load progress history */
  loadHistory: (goalId: string, cursor?: string, limit?: number) => Promise<void>;

  /** Refresh current goal data */
  refreshGoal: () => Promise<void>;

  /** Update UI preferences */
  updateUIPreferences: (preferences: UIPreferences) => void;

  /** Clear error state */
  clearError: () => void;
}

export interface LoadOptions {
  /** Include progress history */
  includeHistory?: boolean;

  /** Include milestone details */
  includeMilestones?: boolean;

  /** Force fresh data */
  forceRefresh?: boolean;

  /** Background loading */
  background?: boolean;
}

export interface UIPreferences {
  /** Default active tab */
  defaultTab: GoalDetailTab;

  /** Show progress chart by default */
  showChart: boolean;

  /** History page size */
  historyPageSize: number;

  /** Auto-expand milestones */
  autoExpandMilestones: boolean;

  /** Theme preferences */
  theme: 'light' | 'dark' | 'auto';
}
```

## Component Props Contracts

### GoalDetailPage Props

```typescript
export interface GoalDetailPageProps {
  /** Goal ID from route parameters */
  goalId: string;

  /** Initial tab to display */
  initialTab?: GoalDetailTab;

  /** Enable editing mode */
  editMode?: boolean;

  /** Custom CSS classes */
  className?: string;

  /** Loading component override */
  loadingComponent?: React.ComponentType;

  /** Error component override */
  errorComponent?: React.ComponentType<ErrorComponentProps>;
}

export interface ErrorComponentProps {
  /** Error message */
  error: string;

  /** Retry function */
  onRetry: () => void;

  /** Go back function */
  onGoBack: () => void;
}
```

### GoalDetailTabs Props

```typescript
export interface GoalDetailTabsProps {
  /** Current goal data */
  goal: GoalDetailView;

  /** Active tab */
  activeTab: GoalDetailTab;

  /** Tab change handler */
  onTabChange: (tab: GoalDetailTab) => void;

  /** Loading states per tab */
  loadingStates: Record<GoalDetailTab, boolean>;

  /** Tab content overrides */
  tabOverrides?: Partial<Record<GoalDetailTab, React.ReactNode>>;
}
```

### ProgressVisualization Props

```typescript
export interface ProgressVisualizationProps {
  /** Goal data */
  goal: GoalDetailView;

  /** Visualization type */
  type: 'bar' | 'circle' | 'line' | 'auto';

  /** Show trend indicators */
  showTrend?: boolean;

  /** Show velocity information */
  showVelocity?: boolean;

  /** Custom size */
  size?: 'small' | 'medium' | 'large';

  /** Animation enabled */
  animated?: boolean;

  /** Color theme */
  color?: string;

  /** Accessibility labels */
  ariaLabel?: string;
}
```

## Validation Schemas

### Zod Validation Schemas

```typescript
import { z } from 'zod';

// Core validation schemas
export const GoalIdSchema = z.string().uuid('Invalid goal ID format');

export const GoalTypeSchema = z.enum(['quantitative', 'binary', 'milestone', 'recurring', 'habit', 'qualitative']);

export const GoalStatusSchema = z.enum(['active', 'completed', 'paused', 'archived', 'cancelled']);

export const GoalPrioritySchema = z.enum(['low', 'medium', 'high', 'critical']);

export const ProgressTrendSchema = z.enum(['increasing', 'decreasing', 'stable', 'volatile']);

// Goal detail validation
export const GoalBasicInfoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  type: GoalTypeSchema,
  status: GoalStatusSchema,
  priority: GoalPrioritySchema,
  tags: z.array(z.string().max(50)).max(20, 'Too many tags'),
  category: z.string().max(100).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Invalid color format')
    .optional(),
});

export const GoalProgressInfoSchema = z
  .object({
    current: z.number().min(0, 'Progress cannot be negative'),
    target: z.number().positive('Target must be positive'),
    percentage: z.number().min(0).max(100, 'Percentage must be 0-100'),
    trend: ProgressTrendSchema,
    velocity: z
      .object({
        perDay: z.number(),
        perWeek: z.number(),
        perMonth: z.number(),
        unit: z.string().min(1),
      })
      .optional(),
    estimatedCompletion: z.date().optional(),
    lastUpdated: z.date(),
  })
  .refine((data) => data.current <= data.target, {
    message: 'Current progress cannot exceed target',
    path: ['current'],
  });

// API request validation
export const GoalDetailRequestSchema = z.object({
  goalId: GoalIdSchema,
  includeHistory: z.boolean().optional(),
  includeMilestones: z.boolean().optional(),
  includeRelated: z.boolean().optional(),
  freshness: z.enum(['cache', 'fresh', 'realtime']).optional(),
});

export const ProgressUpdateRequestSchema = z.object({
  goalId: GoalIdSchema,
  value: z.number().min(0, 'Progress value cannot be negative'),
  notes: z.string().max(1000, 'Notes too long').optional(),
  timestamp: z.date().optional(),
  type: z.enum(['manual', 'automatic', 'milestone', 'completion', 'reset']),
});

// History request validation
export const GoalHistoryRequestSchema = z
  .object({
    goalId: GoalIdSchema,
    cursor: z.string().optional(),
    limit: z.number().min(1).max(100, 'Limit must be 1-100').optional(),
    dateRange: z
      .object({
        start: z.date(),
        end: z.date(),
      })
      .optional(),
    type: z.array(z.enum(['manual', 'automatic', 'milestone', 'completion', 'reset'])).optional(),
  })
  .refine((data) => !data.dateRange || data.dateRange.start <= data.dateRange.end, {
    message: 'Start date must be before end date',
    path: ['dateRange'],
  });
```

## Testing Utilities

### Test Data Factories

```typescript
export interface GoalTestData {
  /** Valid goal detail view */
  validGoal: GoalDetailView;

  /** Goal with minimum required fields */
  minimalGoal: GoalDetailView;

  /** Goal with all optional fields */
  completeGoal: GoalDetailView;

  /** Goal with progress history */
  goalWithHistory: GoalDetailView & { history: ProgressUpdate[] };

  /** Goal with complex milestones */
  goalWithMilestones: GoalDetailView;

  /** Goal with recurring pattern */
  recurringGoal: GoalDetailView;

  /** Goal with habit tracking */
  habitGoal: GoalDetailView;

  /** Goal with qualitative assessments */
  qualitativeGoal: GoalDetailView;
}

export interface ProgressUpdateTestData {
  /** Single progress update */
  singleUpdate: ProgressUpdate;

  /** Multiple updates for history */
  updateHistory: ProgressUpdate[];

  /** Update with notes */
  updateWithNotes: ProgressUpdate;

  /** Milestone completion update */
  milestoneUpdate: ProgressUpdate;

  /** Goal completion update */
  completionUpdate: ProgressUpdate;
}

export interface APIResponseTestData {
  /** Successful goal detail response */
  successResponse: GoalDetailResponse;

  /** Error response */
  errorResponse: { error: string; code: string };

  /** Loading state response */
  loadingResponse: { loading: true };

  /** Paginated history response */
  paginatedHistory: GoalHistoryResponse;
}
```

### Mock Data Generators

```typescript
export interface MockDataGenerators {
  /** Generate random goal ID */
  generateGoalId: () => string;

  /** Generate random goal data */
  generateGoal: (overrides?: Partial<GoalDetailView>) => GoalDetailView;

  /** Generate progress updates */
  generateProgressUpdates: (count: number, goalId: string) => ProgressUpdate[];

  /** Generate milestone hierarchy */
  generateMilestones: (depth: number, breadth: number) => MilestoneNode[];

  /** Generate habit calendar data */
  generateHabitCalendar: (year: number, month: number) => HabitCalendarData;
}
```

## Error Handling Contracts

### Error Types

```typescript
export class GoalDetailError extends Error {
  constructor(
    message: string,
    public code: GoalErrorCode,
    public details?: any
  ) {
    super(message);
    this.name = 'GoalDetailError';
  }
}

export type GoalErrorCode =
  | 'GOAL_NOT_FOUND'
  | 'GOAL_ACCESS_DENIED'
  | 'GOAL_LOAD_FAILED'
  | 'PROGRESS_UPDATE_FAILED'
  | 'HISTORY_LOAD_FAILED'
  | 'VALIDATION_ERROR'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

export interface ErrorRecoveryOptions {
  /** Can retry the operation */
  canRetry: boolean;

  /** Retry delay in milliseconds */
  retryDelay?: number;

  /** Maximum retry attempts */
  maxRetries?: number;

  /** Fallback data available */
  hasFallback: boolean;

  /** User-friendly error message */
  userMessage: string;
}
```

## Performance Contracts

### Performance Budgets

```typescript
export interface PerformanceBudgets {
  /** Initial page load time */
  initialLoadTime: 500; // ms

  /** Tab switching time */
  tabSwitchTime: 100; // ms

  /** History pagination load time */
  historyLoadTime: 200; // ms

  /** Bundle size limits */
  bundleSize: {
    initial: 200000; // bytes
    perTab: 50000; // bytes
  };

  /** Memory usage limits */
  memoryUsage: {
    typical: 50000000; // bytes (50MB)
    maximum: 100000000; // bytes (100MB)
  };
}

export interface PerformanceMetrics {
  /** Core Web Vitals */
  coreWebVitals: {
    lcp: number; // Largest Contentful Paint
    fid: number; // First Input Delay
    cls: number; // Cumulative Layout Shift
  };

  /** Custom metrics */
  customMetrics: {
    goalLoadTime: number;
    tabSwitchTime: number;
    historyLoadTime: number;
    memoryUsage: number;
  };
}
```

---

## Contract Compliance Checklist

### Type Safety

- [x] All interfaces properly typed with TypeScript
- [x] Zod schemas for runtime validation
- [x] Generic type constraints for extensibility
- [x] Union types for goal-specific variations
- [x] Optional chaining support throughout

### API Design

- [x] RESTful resource naming conventions
- [x] Consistent error response formats
- [x] Pagination support for large datasets
- [x] Request/response metadata contracts
- [x] Backward compatibility considerations

### State Management

- [x] Immutable update patterns
- [x] Action type definitions
- [x] State slice separation
- [x] Error state handling
- [x] Loading state management

### Component Architecture

- [x] Props interface definitions
- [x] Event handler contracts
- [x] Render prop patterns where needed
- [x] HOC compatibility interfaces
- [x] Accessibility prop contracts

### Testing Support

- [x] Test data factory interfaces
- [x] Mock data generator contracts
- [x] Test utility type definitions
- [x] Assertion helper interfaces

### Error Handling

- [x] Custom error class definitions
- [x] Error code enumerations
- [x] Recovery option interfaces
- [x] Error boundary contracts

### Performance

- [x] Performance budget definitions
- [x] Metrics collection interfaces
- [x] Monitoring contract specifications
- [x] Optimization guideline contracts
