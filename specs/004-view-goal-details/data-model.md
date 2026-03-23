# Data Model: View Goal Details

## Overview

The View Goal Details feature requires comprehensive data structures to support displaying goal information, progress history, milestones, and metadata. This document defines the data models and validation schemas needed for goal detail views.

## Core Data Structures

### Goal Detail View Model

```typescript
interface GoalDetailView {
  // Core goal information
  goal: Goal;

  // Computed display properties
  display: GoalDisplayProperties;

  // Progress information
  progress: GoalProgressView;

  // History and analytics
  history: ProgressHistoryView;

  // Type-specific data
  typeSpecific: GoalTypeSpecificView;

  // Metadata and relationships
  metadata: GoalMetadataView;

  // UI state
  ui: GoalDetailUIState;
}
```

### Goal Display Properties

```typescript
interface GoalDisplayProperties {
  // Formatted display values
  title: string;
  description?: string;
  formattedDescription: string; // HTML-safe

  // Status display
  statusText: string;
  statusColor: string;
  statusIcon: string;

  // Type display
  typeDisplayName: string;
  typeIcon: string;
  typeColor: string;

  // Dates
  createdAtFormatted: string;
  updatedAtFormatted: string;
  completedAtFormatted?: string;

  // Progress display
  progressPercentage: number;
  progressText: string;
  progressColor: string;

  // Priority display
  priorityText: string;
  priorityColor: string;
}
```

### Progress View Model

```typescript
interface GoalProgressView {
  // Current progress
  current: GoalCurrent;
  target: GoalTarget;

  // Computed values
  percentage: number;
  remaining: number | null; // null for non-quantitative
  isComplete: boolean;
  isEligibleForCompletion: boolean;

  // Progress indicators
  trend: 'increasing' | 'decreasing' | 'stable' | 'unknown';
  velocity: number; // units per day
  estimatedCompletionDate?: Date;

  // Visual representation
  progressBar: ProgressBarData;
  progressChart: ProgressChartData;
}

interface ProgressBarData {
  value: number;
  max: number;
  color: string;
  showPercentage: boolean;
  animated: boolean;
}

interface ProgressChartData {
  dataPoints: ProgressDataPoint[];
  chartType: 'line' | 'bar' | 'area';
  timeRange: '7d' | '30d' | '90d' | 'all';
}
```

### Progress History View

```typescript
interface ProgressHistoryView {
  // History data
  updates: ProgressUpdateView[];
  totalUpdates: number;
  hasMore: boolean;

  // Pagination
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
  };

  // Filtering and sorting
  filters: ProgressHistoryFilters;
  sort: ProgressHistorySort;

  // Summary statistics
  summary: ProgressHistorySummary;
}

interface ProgressUpdateView {
  id: string;
  timestamp: number;
  formattedDate: string;
  formattedTime: string;

  // Update data
  previousValue: any;
  newValue: any;
  change: number | null; // null for non-quantitative

  // Metadata
  notes?: string;
  source: 'manual' | 'automatic' | 'import';
  userId: string;

  // Display properties
  changeText: string;
  changeColor: string;
  changeIcon: string;
}

interface ProgressHistoryFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  source?: ProgressUpdateSource[];
  hasNotes?: boolean;
}

interface ProgressHistorySort {
  field: 'timestamp' | 'change' | 'value';
  direction: 'asc' | 'desc';
}

interface ProgressHistorySummary {
  totalUpdates: number;
  averageChange: number;
  largestIncrease: number;
  largestDecrease: number;
  mostActiveDay: string;
  streakCurrent: number;
  streakLongest: number;
}
```

## Type-Specific View Models

### Quantitative Goal View

```typescript
interface QuantitativeGoalView {
  // Progress display
  currentValue: number;
  targetValue: number;
  unit: string;
  unitDisplay: string;

  // Formatting
  formattedCurrent: string;
  formattedTarget: string;
  formattedRemaining: string;

  // Visual elements
  progressBar: ProgressBarData;
  trendChart: TrendChartData;
}

interface TrendChartData {
  points: Array<{
    date: string;
    value: number;
    formattedValue: string;
  }>;
  trend: 'up' | 'down' | 'flat';
  color: string;
}
```

### Milestone Goal View

```typescript
interface MilestoneGoalView {
  // Milestone hierarchy
  milestones: MilestoneView[];
  totalMilestones: number;
  completedMilestones: number;
  inProgressMilestones: number;

  // Progress
  overallProgress: number;
  nextMilestone?: MilestoneView;

  // Dependencies
  dependencyGraph: MilestoneDependencyGraph;
}

interface MilestoneView {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';

  // Progress
  progress: number; // 0-100
  completedAt?: number;

  // Dependencies
  dependsOn: string[]; // milestone IDs
  blocks: string[]; // milestone IDs

  // Display
  statusColor: string;
  statusIcon: string;
  isOverdue: boolean;
  dueDateFormatted?: string;
}

interface MilestoneDependencyGraph {
  nodes: Array<{
    id: string;
    label: string;
    status: string;
  }>;
  edges: Array<{
    from: string;
    to: string;
    type: 'dependency' | 'block';
  }>;
}
```

### Recurring Goal View

```typescript
interface RecurringGoalView {
  // Schedule information
  schedule: RecurringSchedule;
  totalOccurrences: number;
  completedOccurrences: number;

  // Current period
  currentPeriod: {
    start: Date;
    end: Date;
    completed: number;
    total: number;
  };

  // Streaks and patterns
  currentStreak: number;
  longestStreak: number;
  completionRate: number;

  // Calendar view
  calendarData: RecurringCalendarData;
}

interface RecurringCalendarData {
  months: Array<{
    month: string;
    year: number;
    days: Array<{
      date: string;
      status: 'completed' | 'missed' | 'pending' | 'future';
      count: number;
    }>;
  }>;
}
```

### Habit Goal View

```typescript
interface HabitGoalView {
  // Streak information
  currentStreak: number;
  longestStreak: number;
  targetStreak: number;

  // Completion tracking
  todayCompleted: boolean;
  yesterdayCompleted: boolean;
  completionRate: number;

  // Calendar heatmap
  heatmapData: HabitHeatmapData;

  // Recent activity
  recentActivity: HabitActivityEntry[];
}

interface HabitHeatmapData {
  weeks: Array<{
    weekStart: Date;
    days: Array<{
      date: Date;
      status: 'completed' | 'missed' | 'rest' | 'future';
      intensity: number; // 0-4 for color intensity
    }>;
  }>;
}

interface HabitActivityEntry {
  date: string;
  completed: boolean;
  notes?: string;
  streakContinued: boolean;
}
```

## Metadata and Relationships

### Goal Metadata View

```typescript
interface GoalMetadataView {
  // Tags and categories
  tags: TagView[];
  categories: CategoryView[];

  // Relationships
  relatedGoals: RelatedGoalView[];
  parentGoal?: RelatedGoalView;
  childGoals: RelatedGoalView[];

  // Settings and preferences
  settings: GoalSettingsView;

  // Audit information
  audit: GoalAuditView;
}

interface TagView {
  id: string;
  name: string;
  color: string;
  usageCount: number;
}

interface CategoryView {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  goalCount: number;
}

interface RelatedGoalView {
  id: string;
  title: string;
  type: GoalType;
  status: GoalStatus;
  progress: number;
  relationship: 'parent' | 'child' | 'related' | 'prerequisite';
}

interface GoalSettingsView {
  isPrivate: boolean;
  allowComments: boolean;
  showInPublicProfile: boolean;
  reminderFrequency: 'none' | 'daily' | 'weekly' | 'monthly';
  autoComplete: boolean;
}

interface GoalAuditView {
  createdBy: string;
  createdAt: number;
  lastModifiedBy: string;
  lastModifiedAt: number;
  version: number;
  changeHistory: AuditEntry[];
}

interface AuditEntry {
  timestamp: number;
  userId: string;
  action: 'created' | 'updated' | 'completed' | 'deleted';
  field?: string;
  oldValue?: any;
  newValue?: any;
}
```

## UI State Management

### Goal Detail UI State

```typescript
interface GoalDetailUIState {
  // Loading states
  loading: boolean;
  loadingHistory: boolean;
  loadingMilestones: boolean;

  // View state
  activeTab: GoalDetailTab;
  expandedSections: Set<string>;

  // Interaction state
  selectedMilestone?: string;
  selectedHistoryItem?: string;
  dateRangeFilter: DateRangeFilter;

  // Error state
  error?: GoalDetailError;

  // Permissions
  canEdit: boolean;
  canDelete: boolean;
  canComplete: boolean;
}

type GoalDetailTab = 'overview' | 'progress' | 'history' | 'milestones' | 'metadata';

interface DateRangeFilter {
  preset: '7d' | '30d' | '90d' | '1y' | 'all' | 'custom';
  customStart?: Date;
  customEnd?: Date;
}

interface GoalDetailError {
  type: 'loading' | 'permission' | 'not_found' | 'network';
  message: string;
  retryable: boolean;
}
```

## Validation Schemas

### View Model Validation

```typescript
import { z } from 'zod';

// Goal Detail View Schema
const GoalDetailViewSchema = z.object({
  goal: GoalSchema,
  display: GoalDisplayPropertiesSchema,
  progress: GoalProgressViewSchema,
  history: ProgressHistoryViewSchema,
  typeSpecific: GoalTypeSpecificViewSchema,
  metadata: GoalMetadataViewSchema,
  ui: GoalDetailUIStateSchema,
});

// Progress View Schema
const GoalProgressViewSchema = z.object({
  current: GoalCurrentSchema,
  target: GoalTargetSchema,
  percentage: z.number().min(0).max(100),
  remaining: z.number().nullable(),
  isComplete: z.boolean(),
  isEligibleForCompletion: z.boolean(),
  trend: z.enum(['increasing', 'decreasing', 'stable', 'unknown']),
  velocity: z.number(),
  estimatedCompletionDate: z.date().optional(),
  progressBar: ProgressBarDataSchema,
  progressChart: ProgressChartDataSchema,
});

// History View Schema
const ProgressHistoryViewSchema = z.object({
  updates: z.array(ProgressUpdateViewSchema),
  totalUpdates: z.number().min(0),
  hasMore: z.boolean(),
  pagination: z.object({
    page: z.number().min(1),
    pageSize: z.number().min(1),
    totalPages: z.number().min(0),
  }),
  filters: ProgressHistoryFiltersSchema,
  sort: ProgressHistorySortSchema,
  summary: ProgressHistorySummarySchema,
});
```

## Data Transformation Functions

### View Model Builders

```typescript
// Build display properties from goal
function buildGoalDisplayProperties(goal: Goal): GoalDisplayProperties {
  return {
    title: goal.title,
    description: goal.description,
    formattedDescription: sanitizeHtml(goal.description || ''),
    statusText: getStatusDisplayText(goal.status),
    statusColor: getStatusColor(goal.status),
    statusIcon: getStatusIcon(goal.status),
    // ... other properties
  };
}

// Build progress view from goal and history
function buildGoalProgressView(goal: Goal, history: ProgressUpdate[]): GoalProgressView {
  const current = getCurrentProgress(goal, history);
  const percentage = calculateProgressPercentage(goal, current);

  return {
    current,
    target: goal.target,
    percentage,
    remaining: calculateRemaining(goal, current),
    isComplete: isGoalComplete(goal, current),
    isEligibleForCompletion: isEligibleForCompletion(goal, current),
    // ... other properties
  };
}

// Build history view with pagination
function buildProgressHistoryView(
  history: ProgressUpdate[],
  page: number = 1,
  pageSize: number = 20,
  filters?: ProgressHistoryFilters,
  sort?: ProgressHistorySort
): ProgressHistoryView {
  const filtered = applyFilters(history, filters);
  const sorted = applySort(filtered, sort);
  const paginated = paginate(sorted, page, pageSize);

  return {
    updates: paginated.items.map(buildProgressUpdateView),
    totalUpdates: filtered.length,
    hasMore: paginated.hasMore,
    pagination: paginated.info,
    // ... other properties
  };
}
```

## Performance Optimizations

### Data Loading Strategies

```typescript
// Progressive loading for large histories
interface ProgressiveHistoryLoader {
  loadInitial: (goalId: string) => Promise<ProgressHistoryView>;
  loadMore: (goalId: string, page: number) => Promise<ProgressUpdateView[]>;
  loadSummary: (goalId: string) => Promise<ProgressHistorySummary>;
}

// Caching strategies
interface GoalDetailCache {
  cache: Map<
    string,
    {
      data: GoalDetailView;
      timestamp: number;
      expiresAt: number;
    }
  >;

  get: (goalId: string) => GoalDetailView | null;
  set: (goalId: string, data: GoalDetailView, ttl: number) => void;
  invalidate: (goalId: string) => void;
  invalidatePattern: (pattern: string) => void;
}
```

## Error Handling

### View Model Errors

```typescript
type GoalDetailViewError =
  | { type: 'GOAL_NOT_FOUND'; goalId: string }
  | { type: 'PERMISSION_DENIED'; goalId: string }
  | { type: 'INVALID_GOAL_DATA'; goalId: string; field: string }
  | { type: 'HISTORY_LOAD_FAILED'; goalId: string; error: Error }
  | { type: 'NETWORK_ERROR'; goalId: string; retryable: boolean };

// Error recovery strategies
function handleGoalDetailError(error: GoalDetailViewError): GoalDetailView | null {
  switch (error.type) {
    case 'GOAL_NOT_FOUND':
      return buildNotFoundView(error.goalId);
    case 'PERMISSION_DENIED':
      return buildAccessDeniedView(error.goalId);
    case 'NETWORK_ERROR':
      if (error.retryable) {
        return buildRetryView(error.goalId);
      }
      return buildOfflineView(error.goalId);
    default:
      return buildErrorView(error);
  }
}
```

This data model provides comprehensive support for displaying goal details across all goal types, with optimized loading, caching, and error handling strategies.
