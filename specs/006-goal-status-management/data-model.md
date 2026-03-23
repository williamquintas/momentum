# Data Model: Goal Status Management

## Overview

The Goal Status Management feature requires a robust data model to handle status transitions, maintain audit trails, and ensure data integrity across the goal lifecycle. This document defines the data structures, validation schemas, and relationships needed for comprehensive status management.

## Core Data Structures

### Status Types and Enums

```typescript
export enum GoalStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

export enum StatusChangeType {
  MANUAL = 'manual',
  AUTOMATIC = 'automatic',
  BULK = 'bulk',
  SYSTEM = 'system',
}

export enum StatusTransitionReason {
  USER_REQUEST = 'user_request',
  TIME_EXPIRED = 'time_expired',
  DEPENDENCY_FAILED = 'dependency_failed',
  SYSTEM_MAINTENANCE = 'system_maintenance',
  BULK_OPERATION = 'bulk_operation',
}
```

### Status Change Entity

```typescript
export interface StatusChange {
  /** Unique identifier for the status change */
  id: string;

  /** ID of the goal being modified */
  goalId: string;

  /** ID of the user making the change */
  userId: string;

  /** Previous status before the change */
  oldStatus: GoalStatus;

  /** New status after the change */
  newStatus: GoalStatus;

  /** Type of status change */
  changeType: StatusChangeType;

  /** Reason for the status change */
  reason?: string;

  /** Additional metadata about the change */
  metadata: StatusChangeMetadata;

  /** Timestamp when the change occurred */
  timestamp: Date;

  /** ID of the bulk operation if part of one */
  bulkOperationId?: string;

  /** Whether this change can be undone */
  isUndoable: boolean;

  /** ID of the change that undid this one (if applicable) */
  undoneBy?: string;
}

export interface StatusChangeMetadata {
  /** User agent string for audit purposes */
  userAgent?: string;

  /** IP address for security tracking */
  ipAddress?: string;

  /** Session ID for correlation */
  sessionId?: string;

  /** Additional context-specific data */
  context?: Record<string, any>;

  /** Whether the change was made offline */
  offline: boolean;

  /** Sync timestamp if offline change */
  syncedAt?: Date;
}
```

### Status Constraints and Permissions

```typescript
export interface StatusConstraints {
  /** Maximum time window for reactivation (in days) */
  reactivationWindowDays: number;

  /** Minimum time between status changes (in milliseconds) */
  minTimeBetweenChanges: number;

  /** Maximum number of goals in a bulk operation */
  maxBulkOperations: number;

  /** Whether bulk operations require individual confirmation */
  bulkRequiresConfirmation: boolean;

  /** Allowed status transitions matrix */
  allowedTransitions: Record<GoalStatus, GoalStatus[]>;
}

export interface StatusPermissions {
  /** Whether the user can pause goals */
  canPause: boolean;

  /** Whether the user can resume goals */
  canResume: boolean;

  /** Whether the user can cancel goals */
  canCancel: boolean;

  /** Whether the user can reactivate goals */
  canReactivate: boolean;

  /** Whether the user can perform bulk operations */
  canBulkChange: boolean;

  /** Whether the user can view status history */
  canViewHistory: boolean;

  /** Whether the user can export status history */
  canExportHistory: boolean;
}
```

## State Management Structures

### Status State

```typescript
export interface GoalStatusState {
  /** Current status of the goal */
  current: GoalStatus;

  /** When the current status was set */
  currentSince: Date;

  /** Complete history of status changes */
  history: StatusChange[];

  /** Current permissions for status operations */
  permissions: StatusPermissions;

  /** Current constraints */
  constraints: StatusConstraints;

  /** Pending status change (for confirmation flows) */
  pendingChange?: PendingStatusChange;

  /** Loading states for various operations */
  loading: StatusLoadingStates;

  /** Last error encountered */
  error?: StatusError;
}

export interface PendingStatusChange {
  /** New status being requested */
  newStatus: GoalStatus;

  /** Reason for the change */
  reason?: string;

  /** Timestamp when change was requested */
  requestedAt: Date;

  /** Whether confirmation is required */
  requiresConfirmation: boolean;

  /** Confirmation deadline */
  confirmationDeadline?: Date;
}

export interface StatusLoadingStates {
  /** Whether a status change is in progress */
  changing: boolean;

  /** Whether history is being loaded */
  loadingHistory: boolean;

  /** Whether bulk operation is in progress */
  bulkOperation: boolean;

  /** Whether permissions are being checked */
  checkingPermissions: boolean;
}

export interface StatusError {
  /** Error code */
  code: string;

  /** Human-readable error message */
  message: string;

  /** Error details for debugging */
  details?: any;

  /** Whether the error is recoverable */
  recoverable: boolean;

  /** Suggested recovery action */
  recoveryAction?: string;
}
```

### Bulk Operation State

```typescript
export interface BulkStatusOperation {
  /** Unique identifier for the bulk operation */
  id: string;

  /** User who initiated the operation */
  userId: string;

  /** Goal IDs included in the operation */
  goalIds: string[];

  /** New status to apply to all goals */
  newStatus: GoalStatus;

  /** Reason for the bulk change */
  reason?: string;

  /** Current operation status */
  status: BulkOperationStatus;

  /** Progress information */
  progress: BulkOperationProgress;

  /** Results of individual goal operations */
  results: BulkOperationResult[];

  /** Timestamp when operation started */
  startedAt: Date;

  /** Timestamp when operation completed */
  completedAt?: Date;

  /** Whether the operation can be cancelled */
  cancellable: boolean;
}

export enum BulkOperationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

export interface BulkOperationProgress {
  /** Number of goals processed */
  processed: number;

  /** Number of goals successfully changed */
  successful: number;

  /** Number of goals that failed */
  failed: number;

  /** Total number of goals to process */
  total: number;

  /** Estimated completion time */
  estimatedCompletion?: Date;
}

export interface BulkOperationResult {
  /** Goal ID */
  goalId: string;

  /** Whether the operation succeeded */
  success: boolean;

  /** New status if successful */
  newStatus?: GoalStatus;

  /** Error if operation failed */
  error?: StatusError;

  /** Processing timestamp */
  processedAt: Date;
}
```

## Validation Schemas

### Status Change Validation

```typescript
import { z } from 'zod';

// Status Change Request Schema
export const StatusChangeRequestSchema = z
  .object({
    goalId: z.string().uuid('Invalid goal ID'),
    newStatus: z.nativeEnum(GoalStatus, {
      errorMap: () => ({ message: 'Invalid status value' }),
    }),
    reason: z.string().max(500, 'Reason must be less than 500 characters').optional(),
    changeType: z.nativeEnum(StatusChangeType).default(StatusChangeType.MANUAL),
    metadata: z
      .object({
        userAgent: z.string().optional(),
        sessionId: z.string().uuid().optional(),
        context: z.record(z.any()).optional(),
        offline: z.boolean().default(false),
      })
      .optional(),
  })
  .refine(
    (data) => {
      // Require reason for cancellation and reactivation
      if ([GoalStatus.CANCELLED].includes(data.newStatus) && !data.reason?.trim()) {
        return false;
      }
      return true;
    },
    {
      message: 'Reason is required when cancelling goals',
      path: ['reason'],
    }
  );

// Status Transition Validation Schema
export const StatusTransitionSchema = z
  .object({
    currentStatus: z.nativeEnum(GoalStatus),
    newStatus: z.nativeEnum(GoalStatus),
    userPermissions: z.object({
      canPause: z.boolean(),
      canResume: z.boolean(),
      canCancel: z.boolean(),
      canReactivate: z.boolean(),
    }),
  })
  .refine(
    (data) => {
      const allowedTransitions: Record<GoalStatus, GoalStatus[]> = {
        [GoalStatus.ACTIVE]: [GoalStatus.PAUSED, GoalStatus.CANCELLED],
        [GoalStatus.PAUSED]: [GoalStatus.ACTIVE, GoalStatus.CANCELLED],
        [GoalStatus.CANCELLED]: [GoalStatus.ACTIVE], // Within time window
        [GoalStatus.COMPLETED]: [], // No transitions allowed
        [GoalStatus.ARCHIVED]: [], // No transitions allowed
      };

      return allowedTransitions[data.currentStatus]?.includes(data.newStatus) ?? false;
    },
    {
      message: 'Invalid status transition',
      path: ['newStatus'],
    }
  )
  .refine(
    (data) => {
      // Check permissions
      const permissionChecks = {
        [GoalStatus.PAUSED]: data.userPermissions.canPause,
        [GoalStatus.ACTIVE]: data.userPermissions.canResume,
        [GoalStatus.CANCELLED]: data.userPermissions.canCancel,
      };

      return permissionChecks[data.newStatus] ?? true;
    },
    {
      message: 'Insufficient permissions for this status change',
      path: ['newStatus'],
    }
  );
```

### Bulk Operation Validation

```typescript
export const BulkStatusOperationSchema = z
  .object({
    goalIds: z.array(z.string().uuid()).min(1).max(100, 'Maximum 100 goals per bulk operation'),
    newStatus: z.nativeEnum(GoalStatus),
    reason: z.string().max(500).optional(),
    requiresConfirmation: z.boolean().default(true),
  })
  .refine(
    (data) => {
      // All goals must be in a valid state for the transition
      // This would be validated against current goal states
      return true; // Placeholder - actual validation in business logic
    },
    {
      message: 'Some goals are not in a valid state for this transition',
      path: ['goalIds'],
    }
  );
```

## Database Schema

### Status Changes Table

```sql
-- Status changes audit table
CREATE TABLE goal_status_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  old_status goal_status NOT NULL,
  new_status goal_status NOT NULL,
  change_type status_change_type NOT NULL DEFAULT 'manual',
  reason TEXT,
  metadata JSONB DEFAULT '{}',
  bulk_operation_id UUID REFERENCES bulk_status_operations(id),
  is_undoable BOOLEAN NOT NULL DEFAULT true,
  undone_by UUID REFERENCES goal_status_changes(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX CONCURRENTLY idx_goal_status_changes_goal_id ON goal_status_changes(goal_id);
CREATE INDEX CONCURRENTLY idx_goal_status_changes_user_id ON goal_status_changes(user_id);
CREATE INDEX CONCURRENTLY idx_goal_status_changes_created_at ON goal_status_changes(created_at DESC);
CREATE INDEX CONCURRENTLY idx_goal_status_changes_old_new_status ON goal_status_changes(old_status, new_status);
CREATE INDEX CONCURRENTLY idx_goal_status_changes_bulk_operation_id ON goal_status_changes(bulk_operation_id);
CREATE INDEX CONCURRENTLY idx_goal_status_changes_change_type ON goal_status_changes(change_type);

-- Partial index for recent changes
CREATE INDEX CONCURRENTLY idx_goal_status_changes_recent ON goal_status_changes(goal_id, created_at DESC)
WHERE created_at > NOW() - INTERVAL '30 days';
```

### Bulk Operations Table

```sql
-- Bulk status operations table
CREATE TABLE bulk_status_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_ids UUID[] NOT NULL,
  new_status goal_status NOT NULL,
  reason TEXT,
  status bulk_operation_status NOT NULL DEFAULT 'pending',
  progress JSONB DEFAULT '{"processed": 0, "successful": 0, "failed": 0, "total": 0}',
  results JSONB DEFAULT '[]',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  cancellable BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for bulk operations
CREATE INDEX CONCURRENTLY idx_bulk_status_operations_user_id ON bulk_status_operations(user_id);
CREATE INDEX CONCURRENTLY idx_bulk_status_operations_status ON bulk_status_operations(status);
CREATE INDEX CONCURRENTLY idx_bulk_status_operations_started_at ON bulk_status_operations(started_at DESC);
```

### Status Constraints Table

```sql
-- Status constraints configuration
CREATE TABLE status_constraints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  reactivation_window_days INTEGER NOT NULL DEFAULT 30,
  min_time_between_changes INTEGER NOT NULL DEFAULT 3600000, -- 1 hour in ms
  max_bulk_operations INTEGER NOT NULL DEFAULT 50,
  bulk_requires_confirmation BOOLEAN NOT NULL DEFAULT true,
  allowed_transitions JSONB NOT NULL DEFAULT '{
    "active": ["paused", "cancelled"],
    "paused": ["active", "cancelled"],
    "cancelled": ["active"],
    "completed": [],
    "archived": []
  }',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Insert default constraints
INSERT INTO status_constraints (name) VALUES ('default');
```

## API Data Transfer Objects

### Request DTOs

```typescript
export interface ChangeGoalStatusRequest {
  goalId: string;
  newStatus: GoalStatus;
  reason?: string;
  metadata?: {
    userAgent?: string;
    sessionId?: string;
    context?: Record<string, any>;
  };
}

export interface BulkChangeGoalStatusRequest {
  goalIds: string[];
  newStatus: GoalStatus;
  reason?: string;
  requiresConfirmation?: boolean;
}

export interface GetStatusHistoryRequest {
  goalId: string;
  page?: number;
  limit?: number;
  sort?: 'asc' | 'desc';
  filter?: {
    changeType?: StatusChangeType;
    userId?: string;
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
}
```

### Response DTOs

```typescript
export interface ChangeGoalStatusResponse {
  success: boolean;
  goalId: string;
  oldStatus: GoalStatus;
  newStatus: GoalStatus;
  changeId: string;
  timestamp: Date;
}

export interface BulkChangeGoalStatusResponse {
  operationId: string;
  totalGoals: number;
  processed: number;
  successful: number;
  failed: number;
  results: Array<{
    goalId: string;
    success: boolean;
    newStatus?: GoalStatus;
    error?: string;
  }>;
}

export interface StatusHistoryResponse {
  goalId: string;
  history: StatusChange[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  summary: {
    totalChanges: number;
    statusDistribution: Record<GoalStatus, number>;
    lastChanged: Date;
    mostFrequentTransition: {
      from: GoalStatus;
      to: GoalStatus;
      count: number;
    };
  };
}
```

## Migration Scripts

### Database Migration

```sql
-- Migration: Add status management tables
BEGIN;

-- Create custom types
CREATE TYPE goal_status AS ENUM ('active', 'paused', 'cancelled', 'completed', 'archived');
CREATE TYPE status_change_type AS ENUM ('manual', 'automatic', 'bulk', 'system');
CREATE TYPE bulk_operation_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled', 'failed');

-- Create tables
CREATE TABLE goal_status_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  old_status goal_status NOT NULL,
  new_status goal_status NOT NULL,
  change_type status_change_type NOT NULL DEFAULT 'manual',
  reason TEXT,
  metadata JSONB DEFAULT '{}',
  bulk_operation_id UUID,
  is_undoable BOOLEAN NOT NULL DEFAULT true,
  undone_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE bulk_status_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_ids UUID[] NOT NULL,
  new_status goal_status NOT NULL,
  reason TEXT,
  status bulk_operation_status NOT NULL DEFAULT 'pending',
  progress JSONB DEFAULT '{"processed": 0, "successful": 0, "failed": 0, "total": 0}',
  results JSONB DEFAULT '[]',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  cancellable BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE status_constraints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  reactivation_window_days INTEGER NOT NULL DEFAULT 30,
  min_time_between_changes INTEGER NOT NULL DEFAULT 3600000,
  max_bulk_operations INTEGER NOT NULL DEFAULT 50,
  bulk_requires_confirmation BOOLEAN NOT NULL DEFAULT true,
  allowed_transitions JSONB NOT NULL DEFAULT '{
    "active": ["paused", "cancelled"],
    "paused": ["active", "cancelled"],
    "cancelled": ["active"],
    "completed": [],
    "archived": []
  }',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX CONCURRENTLY idx_goal_status_changes_goal_id ON goal_status_changes(goal_id);
CREATE INDEX CONCURRENTLY idx_goal_status_changes_user_id ON goal_status_changes(user_id);
CREATE INDEX CONCURRENTLY idx_goal_status_changes_created_at ON goal_status_changes(created_at DESC);
CREATE INDEX CONCURRENTLY idx_bulk_status_operations_user_id ON bulk_status_operations(user_id);
CREATE INDEX CONCURRENTLY idx_bulk_status_operations_status ON bulk_status_operations(status);

-- Insert default constraints
INSERT INTO status_constraints (name) VALUES ('default');

-- Add foreign key constraint after table creation
ALTER TABLE goal_status_changes
ADD CONSTRAINT fk_bulk_operation_id
FOREIGN KEY (bulk_operation_id) REFERENCES bulk_status_operations(id) ON DELETE SET NULL;

COMMIT;
```

### Data Migration

```typescript
// Migration script to populate initial status changes for existing goals
export async function migrateExistingGoalStatuses(): Promise<void> {
  const goals = await db.goals.findMany({
    select: { id: true, status: true, createdAt: true, updatedAt: true },
  });

  const statusChanges = goals.map((goal) => ({
    goalId: goal.id,
    userId: 'system', // System user for migrations
    oldStatus: GoalStatus.ACTIVE, // Assume all existing goals were active
    newStatus: goal.status,
    changeType: StatusChangeType.SYSTEM,
    reason: 'Initial status migration',
    timestamp: goal.createdAt,
    metadata: { migration: true },
  }));

  await db.goalStatusChanges.createMany({ data: statusChanges });
}
```

## Performance Considerations

### Indexing Strategy

- Composite indexes on frequently queried columns
- Partial indexes for time-based queries
- JSONB indexes for metadata searches
- Foreign key indexes for referential integrity

### Caching Strategy

- Cache status constraints in memory
- Cache recent status changes for quick access
- Cache permission checks with TTL
- Invalidate caches on status changes

### Query Optimization

- Use pagination for history queries
- Implement cursor-based pagination for large datasets
- Use database views for complex aggregations
- Archive old status changes to separate table

This comprehensive data model provides the foundation for robust goal status management with proper validation, audit trails, and performance optimizations.
