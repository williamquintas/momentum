# Developer Quickstart: Goal Status Management

## Overview

This guide provides developers with everything needed to implement and extend the Goal Status Management feature. It includes code examples, testing strategies, common patterns, performance optimization tips, and troubleshooting guidance.

## Getting Started

### Prerequisites
```bash
# Required dependencies
npm install zustand @tanstack/react-query zod antd
npm install --save-dev @types/node vitest @testing-library/react
```

### Basic Setup
```typescript
// 1. Import required types and hooks
import { useStatusManager } from '@/hooks/useStatusManager';
import { GoalStatus } from '@/types/goal';

// 2. Initialize in your component
const MyComponent = ({ goalId }: { goalId: string }) => {
  const { changeStatus, isLoading, error } = useStatusManager();

  const handlePause = async () => {
    try {
      await changeStatus(goalId, GoalStatus.PAUSED, 'Taking a break');
      // Status changed successfully
    } catch (err) {
      // Handle error
    }
  };

  return (
    <button onClick={handlePause} disabled={isLoading}>
      {isLoading ? 'Pausing...' : 'Pause Goal'}
    </button>
  );
};
```

## Core Implementation Patterns

### Status Change Hook
```typescript
// hooks/useStatusManager.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { statusApi } from '@/services/statusApi';
import { useNotification } from '@/hooks/useNotification';

export const useStatusManager = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();

  const changeStatusMutation = useMutation({
    mutationFn: ({ goalId, newStatus, reason }: StatusChangeParams) =>
      statusApi.changeStatus(goalId, newStatus, reason),
    onSuccess: (result) => {
      // Invalidate and refetch goal data
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['goal', result.goalId] });

      showSuccess(`Goal status changed to ${result.newStatus}`);
    },
    onError: (error: StatusError) => {
      showError(error.message);
    }
  });

  return {
    changeStatus: changeStatusMutation.mutateAsync,
    isLoading: changeStatusMutation.isPending,
    error: changeStatusMutation.error
  };
};
```

### Status Validation Service
```typescript
// services/statusValidation.ts
import { GoalStatus } from '@/types/goal';
import { StatusConstraints } from '@/types/status';

export class StatusValidationService {
  private constraints: StatusConstraints;

  constructor(constraints: StatusConstraints) {
    this.constraints = constraints;
  }

  validateTransition(
    currentStatus: GoalStatus,
    newStatus: GoalStatus,
    userPermissions: StatusPermissions
  ): { valid: boolean; reason?: string } {
    // Check if transition is allowed
    const allowedTransitions = this.constraints.allowedTransitions[currentStatus];
    if (!allowedTransitions?.includes(newStatus)) {
      return {
        valid: false,
        reason: `Cannot change status from ${currentStatus} to ${newStatus}`
      };
    }

    // Check permissions
    if (newStatus === GoalStatus.PAUSED && !userPermissions.canPause) {
      return { valid: false, reason: 'Insufficient permissions to pause goals' };
    }

    if (newStatus === GoalStatus.CANCELLED && !userPermissions.canCancel) {
      return { valid: false, reason: 'Insufficient permissions to cancel goals' };
    }

    // Check time constraints
    const timeSinceLastChange = this.getTimeSinceLastChange();
    if (timeSinceLastChange < this.constraints.minTimeBetweenChanges) {
      return {
        valid: false,
        reason: `Please wait before making another status change`
      };
    }

    return { valid: true };
  }

  private getTimeSinceLastChange(): number {
    // Implementation to check last status change timestamp
    return Date.now() - (localStorage.getItem('lastStatusChange') || 0);
  }
}
```

### Status History Component
```typescript
// components/StatusHistory.tsx
import React from 'react';
import { Timeline, Tag, Typography, Space } from 'antd';
import { useStatusHistory } from '@/hooks/useStatusHistory';
import { formatDistanceToNow } from 'date-fns';

const { Text } = Typography;

interface StatusHistoryProps {
  goalId: string;
}

export const StatusHistory: React.FC<StatusHistoryProps> = ({ goalId }) => {
  const { data: history, isLoading, error } = useStatusHistory(goalId);

  if (isLoading) return <div>Loading history...</div>;
  if (error) return <div>Error loading history</div>;
  if (!history?.length) return <div>No status changes yet</div>;

  return (
    <Timeline>
      {history.map((change) => (
        <Timeline.Item key={change.id}>
          <Space direction="vertical" size="small">
            <Space>
              <Tag color={getStatusColor(change.newStatus)}>
                {change.newStatus}
              </Tag>
              <Text type="secondary">
                {formatDistanceToNow(change.timestamp, { addSuffix: true })}
              </Text>
            </Space>
            {change.reason && (
              <Text italic>"{change.reason}"</Text>
            )}
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Changed by {change.userId}
            </Text>
          </Space>
        </Timeline.Item>
      ))}
    </Timeline>
  );
};

const getStatusColor = (status: GoalStatus): string => {
  const colors = {
    [GoalStatus.ACTIVE]: 'green',
    [GoalStatus.PAUSED]: 'orange',
    [GoalStatus.CANCELLED]: 'red',
    [GoalStatus.COMPLETED]: 'blue',
    [GoalStatus.ARCHIVED]: 'gray'
  };
  return colors[status] || 'default';
};
```

## Testing Strategies

### Unit Testing Examples
```typescript
// tests/unit/statusValidation.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { StatusValidationService } from '@/services/statusValidation';
import { GoalStatus } from '@/types/goal';

describe('StatusValidationService', () => {
  let service: StatusValidationService;
  const mockConstraints = {
    allowedTransitions: {
      [GoalStatus.ACTIVE]: [GoalStatus.PAUSED, GoalStatus.CANCELLED],
      [GoalStatus.PAUSED]: [GoalStatus.ACTIVE, GoalStatus.CANCELLED],
      [GoalStatus.CANCELLED]: [GoalStatus.ACTIVE],
      [GoalStatus.COMPLETED]: [],
      [GoalStatus.ARCHIVED]: []
    },
    minTimeBetweenChanges: 3600000 // 1 hour
  };

  beforeEach(() => {
    service = new StatusValidationService(mockConstraints);
  });

  it('should allow valid transitions', () => {
    const result = service.validateTransition(
      GoalStatus.ACTIVE,
      GoalStatus.PAUSED,
      { canPause: true, canResume: true, canCancel: true, canReactivate: true }
    );
    expect(result.valid).toBe(true);
  });

  it('should reject invalid transitions', () => {
    const result = service.validateTransition(
      GoalStatus.COMPLETED,
      GoalStatus.ACTIVE,
      { canPause: true, canResume: true, canCancel: true, canReactivate: true }
    );
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('Cannot change status');
  });

  it('should enforce permission checks', () => {
    const result = service.validateTransition(
      GoalStatus.ACTIVE,
      GoalStatus.PAUSED,
      { canPause: false, canResume: true, canCancel: true, canReactivate: true }
    );
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('Insufficient permissions');
  });
});
```

### Component Testing
```typescript
// tests/components/StatusHistory.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusHistory } from '@/components/StatusHistory';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

describe('StatusHistory', () => {
  it('should display loading state initially', () => {
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <StatusHistory goalId="test-goal" />
      </QueryClientProvider>
    );

    expect(screen.getByText('Loading history...')).toBeInTheDocument();
  });

  it('should display status changes when loaded', async () => {
    const queryClient = createTestQueryClient();
    const mockHistory = [
      {
        id: '1',
        goalId: 'test-goal',
        oldStatus: GoalStatus.ACTIVE,
        newStatus: GoalStatus.PAUSED,
        reason: 'Taking a break',
        timestamp: new Date(),
        userId: 'user1'
      }
    ];

    // Mock the API response
    queryClient.setQueryData(['status-history', 'test-goal'], mockHistory);

    render(
      <QueryClientProvider client={queryClient}>
        <StatusHistory goalId="test-goal" />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('PAUSED')).toBeInTheDocument();
      expect(screen.getByText('"Taking a break"')).toBeInTheDocument();
    });
  });
});
```

### Integration Testing
```typescript
// tests/integration/statusWorkflow.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { StatusManager } from '@/services/StatusManager';
import { createTestDatabase, cleanupTestDatabase } from '@/tests/utils';

describe('Status Change Workflow', () => {
  let statusManager: StatusManager;
  let testGoalId: string;

  beforeAll(async () => {
    await createTestDatabase();
    statusManager = new StatusManager();
    // Create test goal
    testGoalId = await createTestGoal();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  it('should complete full status change workflow', async () => {
    // 1. Change status from ACTIVE to PAUSED
    const result1 = await statusManager.changeStatus(testGoalId, GoalStatus.PAUSED, 'Test pause');
    expect(result1.newStatus).toBe(GoalStatus.PAUSED);

    // 2. Verify status was changed in database
    const goal = await getGoalById(testGoalId);
    expect(goal.status).toBe(GoalStatus.PAUSED);

    // 3. Check audit trail
    const history = await statusManager.getHistory(testGoalId);
    expect(history).toHaveLength(1);
    expect(history[0].newStatus).toBe(GoalStatus.PAUSED);
    expect(history[0].reason).toBe('Test pause');

    // 4. Change back to ACTIVE
    const result2 = await statusManager.changeStatus(testGoalId, GoalStatus.ACTIVE, 'Resuming');
    expect(result2.newStatus).toBe(GoalStatus.ACTIVE);

    // 5. Verify final state
    const finalGoal = await getGoalById(testGoalId);
    expect(finalGoal.status).toBe(GoalStatus.ACTIVE);

    const finalHistory = await statusManager.getHistory(testGoalId);
    expect(finalHistory).toHaveLength(2);
  });
});
```

## Common Patterns

### Error Handling Pattern
```typescript
// patterns/errorHandling.ts
export class StatusError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
    public details?: any
  ) {
    super(message);
    this.name = 'StatusError';
  }
}

export const handleStatusError = (error: unknown): StatusError => {
  if (error instanceof StatusError) {
    return error;
  }

  if (error instanceof Error) {
    // Map common errors to StatusError
    if (error.message.includes('permission')) {
      return new StatusError(
        'You do not have permission to perform this action',
        'INSUFFICIENT_PERMISSIONS',
        403
      );
    }

    if (error.message.includes('transition')) {
      return new StatusError(
        'This status change is not allowed',
        'INVALID_TRANSITION',
        400
      );
    }
  }

  return new StatusError(
    'An unexpected error occurred',
    'UNKNOWN_ERROR',
    500,
    error
  );
};
```

### Caching Pattern
```typescript
// patterns/statusCache.ts
import { LRUCache } from 'lru-cache';

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

export class StatusCache {
  private cache: LRUCache<string, CacheEntry>;

  constructor(maxSize: number = 100) {
    this.cache = new LRUCache({
      max: maxSize,
      ttl: 1000 * 60 * 5, // 5 minutes default TTL
      allowStale: false
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry | undefined;
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlMs: number = 300000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }

  invalidate(pattern: string): void {
    // Invalidate all keys matching pattern
    const keys = this.cache.keys();
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

// Usage
export const statusCache = new StatusCache(200); // Cache up to 200 entries
```

### Permission Checking Pattern
```typescript
// patterns/permissions.ts
export interface StatusPermissions {
  canPause: boolean;
  canResume: boolean;
  canCancel: boolean;
  canReactivate: boolean;
  canBulkChange: boolean;
  canViewHistory: boolean;
}

export class PermissionChecker {
  static async checkStatusPermissions(
    userId: string,
    goalId: string
  ): Promise<StatusPermissions> {
    // Check user's role and relationship to goal
    const userRole = await getUserRole(userId);
    const goalOwner = await getGoalOwner(goalId);
    const isShared = await isGoalSharedWithUser(goalId, userId);

    const isOwner = goalOwner === userId;
    const isAdmin = userRole === 'admin';
    const canEdit = isOwner || isAdmin || (isShared && userRole === 'editor');

    return {
      canPause: canEdit,
      canResume: canEdit,
      canCancel: isOwner || isAdmin, // Only owner/admin can cancel
      canReactivate: isOwner || isAdmin, // Only owner/admin can reactivate
      canBulkChange: isAdmin || userRole === 'manager',
      canViewHistory: canEdit || isShared // Shared users can view history
    };
  }
}
```

## Performance Optimization Tips

### Database Optimizations
```sql
-- Add composite indexes for common queries
CREATE INDEX CONCURRENTLY idx_status_changes_goal_user_timestamp
ON goal_status_changes(goal_id, user_id, created_at DESC);

CREATE INDEX CONCURRENTLY idx_status_changes_bulk_operation
ON goal_status_changes(bulk_operation_id)
WHERE bulk_operation_id IS NOT NULL;

-- Use partial indexes for active data
CREATE INDEX CONCURRENTLY idx_recent_status_changes
ON goal_status_changes(goal_id, created_at DESC)
WHERE created_at > NOW() - INTERVAL '30 days';

-- Optimize bulk operations with temporary tables
CREATE TEMP TABLE temp_bulk_changes (
  goal_id UUID PRIMARY KEY,
  new_status goal_status NOT NULL,
  reason TEXT
) ON COMMIT DROP;
```

### Frontend Optimizations
```typescript
// Use React.memo for status components
export const StatusIndicator = React.memo<StatusIndicatorProps>(
  ({ status, size = 'medium' }) => {
    return (
      <Tag color={getStatusColor(status)} size={size}>
        {status}
      </Tag>
    );
  }
);

// Implement virtual scrolling for large history lists
import { FixedSizeList as List } from 'react-window';

const StatusHistoryVirtual: React.FC<StatusHistoryProps> = ({ history }) => {
  const itemHeight = 80; // Height of each history item

  return (
    <List
      height={400}
      itemCount={history.length}
      itemSize={itemHeight}
      itemData={history}
    >
      {({ index, style, data }) => (
        <div style={style}>
          <StatusHistoryItem change={data[index]} />
        </div>
      )}
    </List>
  );
};
```

### API Optimizations
```typescript
// Implement cursor-based pagination for history
export const getStatusHistory = async (
  goalId: string,
  cursor?: string,
  limit: number = 20
): Promise<PaginatedHistory> => {
  const query = `
    SELECT * FROM goal_status_changes
    WHERE goal_id = $1
    ${cursor ? 'AND created_at < $3' : ''}
    ORDER BY created_at DESC
    LIMIT $2
  `;

  const params = cursor
    ? [goalId, limit, new Date(cursor)]
    : [goalId, limit];

  const result = await db.query(query, params);

  return {
    items: result.rows,
    nextCursor: result.rows.length === limit
      ? result.rows[result.rows.length - 1].created_at.toISOString()
      : null,
    hasMore: result.rows.length === limit
  };
};
```

## Troubleshooting Guide

### Common Issues

#### Status Change Fails with "Invalid Transition"
**Symptoms**: Status change API returns 400 error
**Causes**:
- Attempting invalid status transition
- Insufficient permissions
- Goal in wrong current state
**Solutions**:
```typescript
// Check current goal state first
const goal = await goalApi.getGoal(goalId);
const validation = statusValidator.validateTransition(
  goal.status,
  newStatus,
  userPermissions
);

if (!validation.valid) {
  throw new Error(validation.reason);
}
```

#### History Loading is Slow
**Symptoms**: Status history takes > 2 seconds to load
**Causes**:
- Large number of status changes
- Missing database indexes
- Inefficient queries
**Solutions**:
- Add pagination to history queries
- Ensure proper database indexes
- Implement caching for recent history
- Use cursor-based pagination

#### Permission Errors in Bulk Operations
**Symptoms**: Bulk status change fails for some goals
**Causes**:
- Mixed permissions across selected goals
- Some goals owned by different users
- Permission checks not handling bulk operations
**Solutions**:
```typescript
// Pre-validate all goals before starting bulk operation
const validationResults = await Promise.all(
  goalIds.map(id => checkPermissions(userId, id))
);

const failedValidations = validationResults.filter(r => !r.valid);
if (failedValidations.length > 0) {
  throw new Error(`Cannot change status for ${failedValidations.length} goals due to permission issues`);
}
```

#### Memory Issues with Large History
**Symptoms**: Browser becomes slow with many history items
**Causes**:
- Loading all history items at once
- No virtualization for large lists
- Memory leaks in history components
**Solutions**:
- Implement virtual scrolling
- Load history in pages
- Clean up event listeners
- Use React.memo for history items

#### Cache Invalidation Problems
**Symptoms**: Status changes not reflected immediately
**Causes**:
- Cache not invalidated after changes
- Stale cache data served
- Cache keys not properly managed
**Solutions**:
```typescript
// Invalidate related caches after status change
queryClient.invalidateQueries({ queryKey: ['goals'] });
queryClient.invalidateQueries({ queryKey: ['goal', goalId] });
queryClient.invalidateQueries({ queryKey: ['status-history', goalId] });

// Clear local cache
statusCache.invalidate(`goal-${goalId}`);
```

### Debug Tools
```typescript
// Debug status validation
const debugValidation = (currentStatus: GoalStatus, newStatus: GoalStatus) => {
  console.group('Status Validation Debug');
  console.log('Current:', currentStatus);
  console.log('New:', newStatus);
  console.log('Allowed transitions:', constraints.allowedTransitions[currentStatus]);
  console.log('Is allowed:', constraints.allowedTransitions[currentStatus]?.includes(newStatus));
  console.groupEnd();
};

// Debug permission checks
const debugPermissions = async (userId: string, goalId: string) => {
  console.group('Permission Debug');
  const permissions = await PermissionChecker.checkStatusPermissions(userId, goalId);
  console.log('Permissions:', permissions);
  console.groupEnd();
};
```

### Monitoring Queries
```sql
-- Check status change frequency
SELECT
  DATE_TRUNC('day', created_at) as day,
  COUNT(*) as changes,
  COUNT(DISTINCT goal_id) as unique_goals
FROM goal_status_changes
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY day DESC;

-- Find slow status changes
SELECT
  goal_id,
  old_status,
  new_status,
  created_at,
  EXTRACT(EPOCH FROM (updated_at - created_at)) * 1000 as duration_ms
FROM goal_status_changes
WHERE EXTRACT(EPOCH FROM (updated_at - created_at)) > 2
ORDER BY duration_ms DESC
LIMIT 10;

-- Check bulk operation performance
SELECT
  id,
  goal_ids_count,
  EXTRACT(EPOCH FROM (completed_at - started_at)) as duration_seconds,
  successful,
  failed
FROM bulk_status_operations
WHERE completed_at IS NOT NULL
ORDER BY started_at DESC
LIMIT 20;
```

This comprehensive quickstart guide provides developers with the knowledge and tools needed to effectively implement and maintain the Goal Status Management feature.
