# Type Contracts: Goal Status Management

## Overview

This document defines all TypeScript interfaces, API contracts, and type definitions for the Goal Status Management feature. These contracts ensure type safety across the entire system and provide clear API boundaries.

## Core Type Definitions

### Status Types

```typescript
// Status enum with all possible goal states
export enum GoalStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

// Status transition metadata
export interface StatusTransition {
  from: GoalStatus;
  to: GoalStatus;
  allowed: boolean;
  requiresReason: boolean;
  permissions: StatusPermission[];
}

// Status change reasons enum
export enum StatusChangeReason {
  USER_REQUEST = 'USER_REQUEST',
  TIME_LIMIT_EXCEEDED = 'TIME_LIMIT_EXCEEDED',
  DEPENDENCY_COMPLETED = 'DEPENDENCY_COMPLETED',
  PRIORITY_CHANGED = 'PRIORITY_CHANGED',
  RESOURCE_UNAVAILABLE = 'RESOURCE_UNAVAILABLE',
  GOAL_RESTRUCTURED = 'GOAL_RESTRUCTURED',
  OTHER = 'OTHER',
}
```

### Permission Types

```typescript
// Permission levels for status operations
export enum StatusPermission {
  CAN_VIEW = 'CAN_VIEW',
  CAN_PAUSE = 'CAN_PAUSE',
  CAN_RESUME = 'CAN_RESUME',
  CAN_CANCEL = 'CAN_CANCEL',
  CAN_REACTIVATE = 'CAN_REACTIVATE',
  CAN_BULK_CHANGE = 'CAN_BULK_CHANGE',
  CAN_VIEW_HISTORY = 'CAN_VIEW_HISTORY',
  CAN_EXPORT_HISTORY = 'CAN_EXPORT_HISTORY',
}

// User permissions for a specific goal
export interface GoalStatusPermissions {
  goalId: string;
  userId: string;
  permissions: StatusPermission[];
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
}

// Permission check result
export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  requiredPermissions: StatusPermission[];
  missingPermissions: StatusPermission[];
}
```

## Data Model Interfaces

### Status Change Entity

```typescript
// Core status change record
export interface StatusChange {
  id: string;
  goalId: string;
  userId: string;
  oldStatus: GoalStatus;
  newStatus: GoalStatus;
  reason?: string;
  reasonType?: StatusChangeReason;
  metadata: StatusChangeMetadata;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

// Extended metadata for status changes
export interface StatusChangeMetadata {
  // Transition context
  transitionType: 'USER_INITIATED' | 'SYSTEM_INITIATED' | 'BULK_OPERATION';
  bulkOperationId?: string;

  // Business context
  businessReason?: string;
  relatedGoalIds?: string[];
  dependencyChanges?: DependencyChange[];

  // System context
  triggeredBy?: string;
  automationRuleId?: string;
  externalSystemId?: string;

  // Audit context
  previousChangeId?: string;
  changeSequence: number;
  validationResults?: ValidationResult[];
}

// Dependency change tracking
export interface DependencyChange {
  dependencyId: string;
  dependencyType: 'BLOCKING' | 'RELATED' | 'CHILD';
  impact: 'NONE' | 'MINOR' | 'MAJOR' | 'CRITICAL';
  description: string;
}

// Validation result for status changes
export interface ValidationResult {
  rule: string;
  passed: boolean;
  severity: 'INFO' | 'WARNING' | 'ERROR';
  message: string;
  details?: any;
}
```

### Bulk Operation Types

```typescript
// Bulk status change operation
export interface BulkStatusOperation {
  id: string;
  userId: string;
  operationType: 'PAUSE' | 'RESUME' | 'CANCEL' | 'REACTIVATE';
  goalIds: string[];
  newStatus: GoalStatus;
  reason?: string;
  reasonType?: StatusChangeReason;

  // Operation state
  status: BulkOperationStatus;
  progress: BulkOperationProgress;
  results: BulkOperationResult;

  // Metadata
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  estimatedDuration?: number;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
}

// Bulk operation status
export enum BulkOperationStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  ROLLED_BACK = 'ROLLED_BACK',
}

// Operation progress tracking
export interface BulkOperationProgress {
  totalGoals: number;
  processedGoals: number;
  successfulChanges: number;
  failedChanges: number;
  skippedGoals: number;
  currentGoalId?: string;
  estimatedTimeRemaining?: number;
  throughput: number; // goals per second
}

// Operation results
export interface BulkOperationResult {
  successful: StatusChange[];
  failed: BulkOperationFailure[];
  skipped: BulkOperationSkip[];
  summary: BulkOperationSummary;
}

// Individual failure details
export interface BulkOperationFailure {
  goalId: string;
  error: string;
  errorCode: string;
  retryable: boolean;
  retryCount: number;
}

// Skip reason details
export interface BulkOperationSkip {
  goalId: string;
  reason: string;
  reasonCode: string;
  currentStatus: GoalStatus;
}

// Operation summary
export interface BulkOperationSummary {
  totalProcessed: number;
  successRate: number;
  averageProcessingTime: number;
  errorBreakdown: Record<string, number>;
  mostCommonError: string;
}
```

## API Contract Interfaces

### REST API Contracts

#### Status Change API

```typescript
// POST /api/goals/{goalId}/status
export interface ChangeStatusRequest {
  newStatus: GoalStatus;
  reason?: string;
  reasonType?: StatusChangeReason;
  metadata?: Partial<StatusChangeMetadata>;
}

export interface ChangeStatusResponse {
  success: boolean;
  statusChange: StatusChange;
  goal: GoalSummary;
  notificationsSent: string[];
  warnings?: string[];
}

// GET /api/goals/{goalId}/status
export interface GetStatusResponse {
  goalId: string;
  currentStatus: GoalStatus;
  lastChanged: Date;
  changedBy: string;
  canChangeTo: GoalStatus[];
  permissions: GoalStatusPermissions;
}
```

#### Status History API

```typescript
// GET /api/goals/{goalId}/status-history
export interface GetStatusHistoryRequest {
  page?: number;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  status?: GoalStatus;
  sortBy?: 'timestamp' | 'status' | 'user';
  sortOrder?: 'asc' | 'desc';
}

export interface GetStatusHistoryResponse {
  items: StatusChange[];
  pagination: PaginationInfo;
  summary: HistorySummary;
}

// Pagination information
export interface PaginationInfo {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  nextCursor?: string;
  prevCursor?: string;
}

// History summary statistics
export interface HistorySummary {
  totalChanges: number;
  statusDistribution: Record<GoalStatus, number>;
  userActivity: Record<string, number>;
  averageTimeBetweenChanges: number;
  mostFrequentTransition: {
    from: GoalStatus;
    to: GoalStatus;
    count: number;
  };
}
```

#### Bulk Operations API

```typescript
// POST /api/goals/bulk-status
export interface BulkStatusChangeRequest {
  goalIds: string[];
  newStatus: GoalStatus;
  reason?: string;
  reasonType?: StatusChangeReason;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  options?: BulkOperationOptions;
}

export interface BulkOperationOptions {
  continueOnError?: boolean;
  maxConcurrency?: number;
  timeout?: number;
  dryRun?: boolean;
}

export interface BulkStatusChangeResponse {
  operationId: string;
  status: BulkOperationStatus;
  estimatedDuration: number;
  progress: BulkOperationProgress;
}

// GET /api/bulk-operations/{operationId}
export interface GetBulkOperationResponse {
  operation: BulkStatusOperation;
  progress: BulkOperationProgress;
  results?: BulkOperationResult;
}

// POST /api/bulk-operations/{operationId}/cancel
export interface CancelBulkOperationResponse {
  success: boolean;
  operationId: string;
  cancelledAt: Date;
  rollbackStarted: boolean;
}
```

#### Validation API

```typescript
// POST /api/goals/{goalId}/status/validate
export interface ValidateStatusChangeRequest {
  newStatus: GoalStatus;
  userId?: string;
}

export interface ValidateStatusChangeResponse {
  valid: boolean;
  reason?: string;
  allowedTransitions: StatusTransition[];
  requiredPermissions: StatusPermission[];
  missingPermissions: StatusPermission[];
  warnings?: string[];
  suggestions?: StatusSuggestion[];
}

// Status change suggestions
export interface StatusSuggestion {
  suggestedStatus: GoalStatus;
  reason: string;
  confidence: number;
  basedOn: string[];
}
```

### GraphQL Schema Types

#### GraphQL Types

```graphql
# Enums
enum GoalStatus {
  ACTIVE
  PAUSED
  CANCELLED
  COMPLETED
  ARCHIVED
}

enum StatusChangeReason {
  USER_REQUEST
  TIME_LIMIT_EXCEEDED
  DEPENDENCY_COMPLETED
  PRIORITY_CHANGED
  RESOURCE_UNAVAILABLE
  GOAL_RESTRUCTURED
  OTHER
}

enum BulkOperationStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  CANCELLED
  ROLLED_BACK
}

# Core Types
type StatusChange {
  id: ID!
  goalId: ID!
  userId: ID!
  oldStatus: GoalStatus!
  newStatus: GoalStatus!
  reason: String
  reasonType: StatusChangeReason
  metadata: StatusChangeMetadata!
  timestamp: DateTime!
  ipAddress: String
  userAgent: String
  sessionId: String
}

type StatusChangeMetadata {
  transitionType: String!
  bulkOperationId: ID
  businessReason: String
  relatedGoalIds: [ID!]
  dependencyChanges: [DependencyChange!]
  triggeredBy: String
  automationRuleId: ID
  externalSystemId: String
  previousChangeId: ID
  changeSequence: Int!
  validationResults: [ValidationResult!]
}

type BulkStatusOperation {
  id: ID!
  userId: ID!
  operationType: String!
  goalIds: [ID!]!
  newStatus: GoalStatus!
  reason: String
  reasonType: StatusChangeReason
  status: BulkOperationStatus!
  progress: BulkOperationProgress!
  results: BulkOperationResult
  createdAt: DateTime!
  startedAt: DateTime
  completedAt: DateTime
  estimatedDuration: Int
  priority: String!
}

# Input Types
input ChangeStatusInput {
  newStatus: GoalStatus!
  reason: String
  reasonType: StatusChangeReason
  metadata: StatusChangeMetadataInput
}

input BulkStatusChangeInput {
  goalIds: [ID!]!
  newStatus: GoalStatus!
  reason: String
  reasonType: StatusChangeReason
  priority: String
  options: BulkOperationOptionsInput
}

input StatusHistoryFilter {
  startDate: DateTime
  endDate: DateTime
  userId: ID
  status: GoalStatus
  limit: Int
  cursor: String
}

# Response Types
type StatusChangeResult {
  success: Boolean!
  statusChange: StatusChange
  goal: Goal
  notificationsSent: [String!]
  warnings: [String!]
}

type BulkOperationResult {
  operationId: ID!
  status: BulkOperationStatus!
  progress: BulkOperationProgress!
}

type StatusHistoryResult {
  items: [StatusChange!]!
  pageInfo: PageInfo!
  summary: HistorySummary!
}
```

#### GraphQL Operations

```graphql
# Mutations
mutation ChangeGoalStatus($goalId: ID!, $input: ChangeStatusInput!) {
  changeGoalStatus(goalId: $goalId, input: $input) {
    success
    statusChange {
      id
      newStatus
      timestamp
      reason
    }
    warnings
  }
}

mutation BulkChangeGoalStatus($input: BulkStatusChangeInput!) {
  bulkChangeGoalStatus(input: $input) {
    operationId
    status
    progress {
      totalGoals
      processedGoals
    }
  }
}

# Queries
query GetGoalStatus($goalId: ID!) {
  goal(id: $goalId) {
    id
    status
    lastStatusChange {
      timestamp
      changedBy {
        id
        name
      }
    }
    availableTransitions
    permissions {
      canPause
      canResume
      canCancel
    }
  }
}

query GetStatusHistory($goalId: ID!, $filter: StatusHistoryFilter) {
  statusHistory(goalId: $goalId, filter: $filter) {
    items {
      id
      oldStatus
      newStatus
      reason
      timestamp
      userId
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    summary {
      totalChanges
      statusDistribution
    }
  }
}

# Subscriptions
subscription OnStatusChange($goalId: ID!) {
  statusChange(goalId: $goalId) {
    goalId
    oldStatus
    newStatus
    changedBy {
      id
      name
    }
    timestamp
  }
}

subscription OnBulkOperationProgress($operationId: ID!) {
  bulkOperationProgress(operationId: $operationId) {
    operationId
    status
    progress {
      processedGoals
      totalGoals
      successfulChanges
      failedChanges
    }
  }
}
```

## Frontend Type Definitions

### React Hook Types

```typescript
// Status management hook
export interface UseStatusManagerResult {
  changeStatus: (goalId: string, newStatus: GoalStatus, reason?: string) => Promise<StatusChange>;
  isLoading: boolean;
  error: StatusError | null;
  reset: () => void;
}

// Status history hook
export interface UseStatusHistoryResult {
  data: StatusChange[] | undefined;
  isLoading: boolean;
  error: StatusError | null;
  hasNextPage: boolean;
  loadMore: () => void;
  refetch: () => void;
}

// Bulk operations hook
export interface UseBulkOperationsResult {
  startBulkOperation: (operation: BulkStatusChangeRequest) => Promise<string>;
  cancelBulkOperation: (operationId: string) => Promise<void>;
  getBulkOperation: (operationId: string) => Promise<BulkStatusOperation>;
  operations: BulkStatusOperation[];
  isLoading: boolean;
  error: StatusError | null;
}
```

### Component Prop Types

```typescript
// Status indicator component
export interface StatusIndicatorProps {
  status: GoalStatus;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  className?: string;
}

// Status change form
export interface StatusChangeFormProps {
  goalId: string;
  currentStatus: GoalStatus;
  availableTransitions: GoalStatus[];
  onStatusChange: (newStatus: GoalStatus, reason?: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

// Status history component
export interface StatusHistoryProps {
  goalId: string;
  initialLimit?: number;
  showFilters?: boolean;
  showExport?: boolean;
  className?: string;
}

// Bulk selection component
export interface BulkStatusSelectorProps {
  goals: GoalSummary[];
  selectedGoalIds: string[];
  onSelectionChange: (goalIds: string[]) => void;
  availableOperations: GoalStatus[];
  onBulkOperation: (operation: GoalStatus, reason?: string) => void;
  isLoading?: boolean;
}
```

### Form Validation Types

```typescript
// Status change form validation
export interface StatusChangeFormData {
  newStatus: GoalStatus;
  reason: string;
  reasonType: StatusChangeReason;
}

export interface StatusChangeValidation {
  newStatus: ValidationResult;
  reason: ValidationResult;
  overall: ValidationResult;
}

// Validation result
export interface ValidationResult {
  valid: boolean;
  message?: string;
  severity: 'error' | 'warning' | 'info';
}

// Form submission result
export interface StatusChangeSubmission {
  success: boolean;
  statusChange?: StatusChange;
  errors?: StatusError[];
  warnings?: string[];
}
```

## Service Layer Interfaces

### Status Manager Service

```typescript
// Main status management service
export interface IStatusManager {
  // Core operations
  changeStatus(request: ChangeStatusRequest): Promise<StatusChange>;
  validateStatusChange(goalId: string, newStatus: GoalStatus, userId: string): Promise<PermissionCheckResult>;

  // Bulk operations
  startBulkOperation(request: BulkStatusChangeRequest): Promise<string>;
  getBulkOperation(operationId: string): Promise<BulkStatusOperation>;
  cancelBulkOperation(operationId: string): Promise<void>;

  // History operations
  getStatusHistory(goalId: string, filter?: StatusHistoryFilter): Promise<StatusHistoryResult>;
  exportStatusHistory(goalId: string, format: 'csv' | 'json' | 'pdf'): Promise<Blob>;

  // Analytics
  getStatusAnalytics(goalId: string, period: DateRange): Promise<StatusAnalytics>;
}

// Status analytics
export interface StatusAnalytics {
  totalChanges: number;
  averageTimeInStatus: Record<GoalStatus, number>;
  mostFrequentTransitions: Array<{
    from: GoalStatus;
    to: GoalStatus;
    count: number;
    averageTime: number;
  }>;
  statusDistribution: Record<GoalStatus, number>;
  userActivity: Array<{
    userId: string;
    changes: number;
    lastActivity: Date;
  }>;
}
```

### Permission Service

```typescript
// Permission checking service
export interface IPermissionService {
  checkStatusPermissions(userId: string, goalId: string): Promise<GoalStatusPermissions>;
  validateBulkPermissions(userId: string, goalIds: string[], operation: GoalStatus): Promise<PermissionCheckResult>;
  grantPermissions(
    granteeId: string,
    goalId: string,
    permissions: StatusPermission[],
    granterId: string
  ): Promise<void>;
  revokePermissions(granteeId: string, goalId: string, permissions: StatusPermission[]): Promise<void>;
  getPermissionHistory(goalId: string): Promise<PermissionChange[]>;
}

// Permission change audit
export interface PermissionChange {
  id: string;
  goalId: string;
  userId: string;
  action: 'GRANT' | 'REVOKE';
  permissions: StatusPermission[];
  changedBy: string;
  timestamp: Date;
  reason?: string;
}
```

### Notification Service

```typescript
// Status change notifications
export interface INotificationService {
  notifyStatusChange(statusChange: StatusChange, recipients: string[]): Promise<void>;
  notifyBulkOperationProgress(operation: BulkStatusOperation, recipients: string[]): Promise<void>;
  notifyBulkOperationComplete(operation: BulkStatusOperation, recipients: string[]): Promise<void>;
  subscribeToStatusChanges(goalId: string, subscriberId: string): Promise<void>;
  unsubscribeFromStatusChanges(goalId: string, subscriberId: string): Promise<void>;
}

// Notification types
export interface StatusChangeNotification {
  type: 'STATUS_CHANGED' | 'BULK_OPERATION_STARTED' | 'BULK_OPERATION_PROGRESS' | 'BULK_OPERATION_COMPLETED';
  goalId?: string;
  operationId?: string;
  oldStatus?: GoalStatus;
  newStatus?: GoalStatus;
  changedBy: string;
  timestamp: Date;
  metadata?: any;
}
```

## Database Schema Types

### PostgreSQL Table Definitions

```sql
-- Goals table extension
CREATE TABLE goals (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status goal_status NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL,
  last_status_change_at TIMESTAMP WITH TIME ZONE,
  last_status_changed_by UUID
);

-- Status changes audit table
CREATE TABLE goal_status_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  old_status goal_status,
  new_status goal_status NOT NULL,
  reason TEXT,
  reason_type status_change_reason,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  session_id UUID,

  -- Constraints
  CONSTRAINT valid_status_transition CHECK (
    (old_status IS NULL AND new_status = 'ACTIVE') OR
    (old_status != new_status)
  ),
  CONSTRAINT reason_required CHECK (
    (new_status IN ('PAUSED', 'CANCELLED') AND reason IS NOT NULL) OR
    (new_status NOT IN ('PAUSED', 'CANCELLED'))
  )
);

-- Bulk operations table
CREATE TABLE bulk_status_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  operation_type VARCHAR(50) NOT NULL,
  goal_ids UUID[] NOT NULL,
  new_status goal_status NOT NULL,
  reason TEXT,
  reason_type status_change_reason,
  status bulk_operation_status NOT NULL DEFAULT 'PENDING',
  progress JSONB NOT NULL DEFAULT '{}',
  results JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  estimated_duration INTEGER,
  priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL'
);

-- Permissions table
CREATE TABLE goal_status_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  permissions status_permission[] NOT NULL,
  granted_by UUID NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  revoked_by UUID,

  UNIQUE(goal_id, user_id)
);
```

### Database Types

```typescript
// PostgreSQL custom types
export type goal_status = 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'COMPLETED' | 'ARCHIVED';
export type status_change_reason =
  | 'USER_REQUEST'
  | 'TIME_LIMIT_EXCEEDED'
  | 'DEPENDENCY_COMPLETED'
  | 'PRIORITY_CHANGED'
  | 'RESOURCE_UNAVAILABLE'
  | 'GOAL_RESTRUCTURED'
  | 'OTHER';
export type bulk_operation_status = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'ROLLED_BACK';
export type status_permission =
  | 'CAN_VIEW'
  | 'CAN_PAUSE'
  | 'CAN_RESUME'
  | 'CAN_CANCEL'
  | 'CAN_REACTIVATE'
  | 'CAN_BULK_CHANGE'
  | 'CAN_VIEW_HISTORY'
  | 'CAN_EXPORT_HISTORY';

// Database row types
export interface GoalRow {
  id: string;
  title: string;
  description: string | null;
  status: goal_status;
  created_at: Date;
  updated_at: Date;
  created_by: string;
  last_status_change_at: Date | null;
  last_status_changed_by: string | null;
}

export interface StatusChangeRow {
  id: string;
  goal_id: string;
  user_id: string;
  old_status: goal_status | null;
  new_status: goal_status;
  reason: string | null;
  reason_type: status_change_reason | null;
  metadata: any;
  created_at: Date;
  ip_address: string | null;
  user_agent: string | null;
  session_id: string | null;
}

export interface BulkOperationRow {
  id: string;
  user_id: string;
  operation_type: string;
  goal_ids: string[];
  new_status: goal_status;
  reason: string | null;
  reason_type: status_change_reason | null;
  status: bulk_operation_status;
  progress: any;
  results: any;
  created_at: Date;
  started_at: Date | null;
  completed_at: Date | null;
  estimated_duration: number | null;
  priority: string;
}
```

## Error Types

### Status-Specific Errors

```typescript
// Base status error
export class StatusError extends Error {
  constructor(
    message: string,
    public code: StatusErrorCode,
    public statusCode: number = 400,
    public details?: any
  ) {
    super(message);
    this.name = 'StatusError';
  }
}

// Error codes
export enum StatusErrorCode {
  INVALID_TRANSITION = 'INVALID_TRANSITION',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  GOAL_NOT_FOUND = 'GOAL_NOT_FOUND',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  BULK_OPERATION_FAILED = 'BULK_OPERATION_FAILED',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  CONCURRENT_MODIFICATION = 'CONCURRENT_MODIFICATION',
  SYSTEM_ERROR = 'SYSTEM_ERROR',
}

// Specific error types
export class InvalidTransitionError extends StatusError {
  constructor(currentStatus: GoalStatus, newStatus: GoalStatus) {
    super(`Cannot change status from ${currentStatus} to ${newStatus}`, StatusErrorCode.INVALID_TRANSITION, 400, {
      currentStatus,
      newStatus,
    });
  }
}

export class InsufficientPermissionsError extends StatusError {
  constructor(requiredPermissions: StatusPermission[], missingPermissions: StatusPermission[]) {
    super('Insufficient permissions for this operation', StatusErrorCode.INSUFFICIENT_PERMISSIONS, 403, {
      requiredPermissions,
      missingPermissions,
    });
  }
}

export class BulkOperationError extends StatusError {
  constructor(operationId: string, failures: BulkOperationFailure[]) {
    super(`Bulk operation ${operationId} failed`, StatusErrorCode.BULK_OPERATION_FAILED, 500, {
      operationId,
      failures,
    });
  }
}
```

## Configuration Types

### System Configuration

```typescript
// Status management configuration
export interface StatusConfig {
  // Transition rules
  allowedTransitions: Record<GoalStatus, GoalStatus[]>;
  requiredReasons: GoalStatus[];
  reactivationWindowDays: number;

  // Rate limiting
  maxStatusChangesPerHour: number;
  maxBulkOperationsPerHour: number;
  maxGoalsPerBulkOperation: number;

  // Performance
  defaultHistoryPageSize: number;
  maxHistoryPageSize: number;
  cacheTTL: {
    statusPermissions: number;
    statusHistory: number;
    bulkOperations: number;
  };

  // Features
  enableBulkOperations: boolean;
  enableStatusAnalytics: boolean;
  enableRealTimeUpdates: boolean;
  enableAuditExport: boolean;

  // Security
  requireReasonForPause: boolean;
  requireReasonForCancel: boolean;
  enableIPLogging: boolean;
  sessionTimeoutMinutes: number;
}

// Default configuration
export const defaultStatusConfig: StatusConfig = {
  allowedTransitions: {
    [GoalStatus.ACTIVE]: [GoalStatus.PAUSED, GoalStatus.CANCELLED, GoalStatus.COMPLETED],
    [GoalStatus.PAUSED]: [GoalStatus.ACTIVE, GoalStatus.CANCELLED],
    [GoalStatus.CANCELLED]: [GoalStatus.ACTIVE],
    [GoalStatus.COMPLETED]: [GoalStatus.ARCHIVED],
    [GoalStatus.ARCHIVED]: [],
  },
  requiredReasons: [GoalStatus.PAUSED, GoalStatus.CANCELLED],
  reactivationWindowDays: 30,
  maxStatusChangesPerHour: 10,
  maxBulkOperationsPerHour: 5,
  maxGoalsPerBulkOperation: 100,
  defaultHistoryPageSize: 20,
  maxHistoryPageSize: 100,
  cacheTTL: {
    statusPermissions: 300, // 5 minutes
    statusHistory: 600, // 10 minutes
    bulkOperations: 60, // 1 minute
  },
  enableBulkOperations: true,
  enableStatusAnalytics: true,
  enableRealTimeUpdates: true,
  enableAuditExport: true,
  requireReasonForPause: true,
  requireReasonForCancel: true,
  enableIPLogging: true,
  sessionTimeoutMinutes: 480, // 8 hours
};
```

This comprehensive type contract provides the foundation for type-safe implementation of the Goal Status Management feature across all layers of the application.
