# Feature Specification: Goal Status Management

**Feature ID**: 006
**Feature Branch**: `006-goal-status-management`
**Created**: 2026-03-22
**Status**: Ready for Implementation
**Priority**: P2 (Essential Features)
**Input**: Extracted from @bkp/features/goal-features.md Feature 6, @bkp/decision-trees/goal-decision-trees.md

## Overview

The Goal Status Management feature enables users to control the lifecycle of their goals by allowing them to pause, resume, cancel, and reactivate goals as needed. This provides flexibility for changing circumstances while maintaining data integrity and preventing invalid state transitions.

## User Stories

### Primary User Stories

#### US-001: Pause Active Goals

**As a** goal-oriented user,  
**I want to** pause goals temporarily,  
**So that** I can focus on other priorities without losing progress.

**Acceptance Criteria**:

- Can pause any active goal
- Progress data is preserved
- Goal becomes invisible in active views
- Can resume paused goals later
- Optional pause reason/note can be added

#### US-002: Resume Paused Goals

**As a** goal-oriented user,  
**I want to** resume previously paused goals,  
**So that** I can continue working towards my objectives.

**Acceptance Criteria**:

- Can resume any paused goal
- Progress tracking continues from where it left off
- Goal reappears in active views
- Resume timestamp is recorded
- Optional resume note can be added

#### US-003: Cancel Unwanted Goals

**As a** goal-oriented user,  
**I want to** cancel goals I no longer want to pursue,  
**So that** I can remove them from my active tracking.

**Acceptance Criteria**:

- Can cancel active or paused goals
- Goal status changes to "cancelled"
- No further progress updates allowed
- Goal remains in history for reference
- Required cancellation reason/note
- Associated milestones/sub-goals are also cancelled

#### US-004: Reactivate Cancelled Goals

**As a** goal-oriented user,  
**I want to** reactivate previously cancelled goals,  
**So that** I can restart working towards objectives I reconsidered.

**Acceptance Criteria**:

- Can reactivate cancelled goals within 30 days
- Progress resets or continues based on user choice
- New activation timestamp recorded
- Optional reactivation reason/note
- Goal returns to active status

### Secondary User Stories

#### US-005: View Status History

**As a** goal-oriented user,  
**I want to** see the complete status history of a goal,  
**So that** I can understand its lifecycle and changes over time.

**Acceptance Criteria**:

- Status change timeline is visible
- Each change shows timestamp, old/new status, and reason
- Changes are logged automatically
- History is searchable and filterable

#### US-006: Bulk Status Operations

**As a** user managing multiple goals,  
**I want to** change status for multiple goals at once,  
**So that** I can efficiently manage goal portfolios.

**Acceptance Criteria**:

- Select multiple goals for bulk operations
- Apply same status change to all selected goals
- Individual confirmation for each goal
- Bulk operation can be cancelled mid-process

## Business Rules

### BR-001: Status Transition Validation

**Context**: Only valid status transitions are allowed to maintain data integrity.

**Rules**:

- Active → Paused: Always allowed
- Active → Cancelled: Always allowed
- Paused → Active: Always allowed
- Paused → Cancelled: Always allowed
- Cancelled → Active: Only within 30 days of cancellation
- Completed goals cannot change status
- Archived goals cannot change status

**Implementation**: Status transition matrix validation in business logic layer.

### BR-002: Progress Preservation

**Context**: Progress data must be preserved during status changes.

**Rules**:

- Pause: Progress frozen, time tracking paused
- Resume: Progress continues from previous state
- Cancel: Progress preserved for historical reference
- Reactivate: User chooses to reset or continue progress

**Implementation**: Progress state management with immutable history.

### BR-003: Reason Requirements

**Context**: Status changes require documentation for accountability.

**Rules**:

- Pause: Optional reason (recommended)
- Resume: Optional reason
- Cancel: Required reason (mandatory)
- Reactivate: Required reason explaining reconsideration

**Implementation**: Reason validation in status change workflows.

### BR-004: Time Windows

**Context**: Time-based restrictions prevent accidental or malicious changes.

**Rules**:

- Reactivation window: 30 days from cancellation
- Status change cooldown: 1 hour between changes (prevents spam)
- Bulk operations: Maximum 10 goals per operation

**Implementation**: Timestamp validation and rate limiting.

### BR-005: Permission Model

**Context**: Users can only modify goals they own or have been granted access to.

**Rules**:

- Goal owner: Full status change permissions
- Shared users: Limited to pause/resume (no cancel/reactivate)
- Team goals: Role-based permissions apply
- Public goals: No status change permissions

**Implementation**: Authorization checks before status operations.

## Acceptance Criteria

### Functional Acceptance Criteria

#### AC-001: Status Change Operations

- [ ] All valid status transitions work correctly
- [ ] Invalid transitions are prevented with clear error messages
- [ ] Status changes are atomic (all-or-nothing)
- [ ] Changes are immediately reflected in UI
- [ ] Changes persist across sessions

#### AC-002: Data Integrity

- [ ] Progress data preserved during all transitions
- [ ] Historical data remains accessible
- [ ] No data loss during status changes
- [ ] Audit trail maintained for all changes
- [ ] Related goals updated appropriately

#### AC-003: User Experience

- [ ] Status change actions clearly visible
- [ ] Confirmation dialogs for destructive actions
- [ ] Progress indicators during operations
- [ ] Undo functionality for accidental changes
- [ ] Contextual help and guidance

#### AC-004: Performance

- [ ] Status changes complete within 2 seconds
- [ ] Bulk operations scale linearly
- [ ] No performance impact on other users
- [ ] Offline status changes sync correctly
- [ ] Memory usage remains bounded

### Non-Functional Acceptance Criteria

#### AC-005: Security

- [ ] Authorization enforced for all operations
- [ ] Input validation prevents injection attacks
- [ ] Rate limiting prevents abuse
- [ ] Audit logs cannot be modified
- [ ] Sensitive data properly encrypted

#### AC-006: Accessibility

- [ ] All status controls keyboard accessible
- [ ] Screen reader support for status changes
- [ ] High contrast support for status indicators
- [ ] Motion sensitivity considerations
- [ ] Multi-modal interaction support

#### AC-007: Compatibility

- [ ] Works across all supported browsers
- [ ] Mobile and desktop experiences consistent
- [ ] API backward compatibility maintained
- [ ] Data migration handles existing goals
- [ ] Third-party integrations unaffected

## Technical Specifications

### Architecture Overview

#### System Components

- **StatusManager**: Core business logic for status transitions
- **StatusValidator**: Validation engine for transition rules
- **StatusHistory**: Audit trail and history management
- **StatusUI**: User interface components
- **StatusAPI**: RESTful endpoints for status operations

#### Data Flow

```
User Action → UI Component → StatusManager → Validation → Persistence → UI Update
                                      ↓
                                StatusHistory → Audit Log
```

### API Specifications

#### Status Change Endpoint

```typescript
POST /api/goals/{goalId}/status
{
  "newStatus": "paused" | "active" | "cancelled",
  "reason": "Optional reason for change",
  "metadata": {
    "bulkOperationId": "uuid",
    "userAgent": "string"
  }
}
```

#### Bulk Status Change Endpoint

```typescript
POST /api/goals/bulk/status
{
  "goalIds": ["uuid1", "uuid2"],
  "newStatus": "paused",
  "reason": "Bulk operation reason",
  "confirmEach": true
}
```

#### Status History Endpoint

```typescript
GET /api/goals/{goalId}/status-history
Query: ?page=1&limit=20&sort=desc
Response: {
  "history": [
    {
      "id": "uuid",
      "timestamp": "2026-03-22T10:00:00Z",
      "oldStatus": "active",
      "newStatus": "paused",
      "reason": "Taking a break",
      "userId": "uuid",
      "metadata": {}
    }
  ],
  "pagination": { "total": 5, "page": 1, "limit": 20 }
}
```

### State Management

#### Status State Structure

```typescript
interface GoalStatusState {
  current: GoalStatus;
  history: StatusChange[];
  permissions: StatusPermissions;
  constraints: StatusConstraints;
}

interface StatusChange {
  id: string;
  timestamp: Date;
  oldStatus: GoalStatus;
  newStatus: GoalStatus;
  reason?: string;
  userId: string;
  metadata: Record<string, any>;
}

interface StatusPermissions {
  canPause: boolean;
  canResume: boolean;
  canCancel: boolean;
  canReactivate: boolean;
  canBulkChange: boolean;
}

interface StatusConstraints {
  reactivationWindowDays: number;
  minTimeBetweenChanges: number;
  maxBulkOperations: number;
}
```

### Database Schema

#### Status Changes Table

```sql
CREATE TABLE goal_status_changes (
  id UUID PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES goals(id),
  user_id UUID NOT NULL REFERENCES users(id),
  old_status goal_status NOT NULL,
  new_status goal_status NOT NULL,
  reason TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_goal_status_changes_goal_id ON goal_status_changes(goal_id);
CREATE INDEX idx_goal_status_changes_user_id ON goal_status_changes(user_id);
CREATE INDEX idx_goal_status_changes_created_at ON goal_status_changes(created_at);
CREATE INDEX idx_goal_status_changes_old_new_status ON goal_status_changes(old_status, new_status);
```

## User Experience

### Interface Design

#### Status Change Dialog

- **Trigger**: Status dropdown or action button
- **Content**:
  - Current status indicator
  - Available transition options
  - Reason input field (required for cancel/reactivate)
  - Preview of consequences
  - Confirmation checkbox for destructive actions

#### Status History View

- **Layout**: Timeline view with status badges
- **Information**: Timestamp, status change, reason, user
- **Actions**: Filter by status type, search reasons
- **Export**: CSV/PDF export of history

#### Bulk Operations Interface

- **Selection**: Checkbox grid or multi-select
- **Preview**: Summary of changes before confirmation
- **Progress**: Real-time progress for large operations
- **Rollback**: Cancel mid-operation if needed

### Interaction Patterns

#### Status Transitions

1. **Click status indicator** → Opens status menu
2. **Select new status** → Shows confirmation dialog
3. **Enter reason (if required)** → Enables confirm button
4. **Confirm** → Shows loading state
5. **Success** → Updates UI and shows success message

#### Error Handling

- **Invalid transition** → Red error message with explanation
- **Network error** → Retry option with exponential backoff
- **Permission denied** → Clear message about access requirements
- **Rate limited** → Countdown timer until next attempt allowed

### Mobile Experience

#### Touch Interactions

- **Swipe gestures** for quick status changes
- **Long press** for status menu
- **Bottom sheet** for status options on mobile
- **Thumb-friendly** button sizes (44px minimum)

#### Responsive Design

- **Desktop**: Sidebar status panel
- **Tablet**: Modal dialogs
- **Mobile**: Full-screen overlays
- **Consistent** interaction patterns across devices

## Error Handling

### Validation Errors

#### Invalid Status Transitions

- **Error Code**: STATUS_TRANSITION_INVALID
- **Message**: "Cannot change status from {current} to {requested}"
- **Recovery**: Show valid transition options

#### Missing Required Reason

- **Error Code**: STATUS_CHANGE_REASON_REQUIRED
- **Message**: "A reason is required when {action}"
- **Recovery**: Focus reason input field

#### Time Window Expired

- **Error Code**: STATUS_CHANGE_WINDOW_EXPIRED
- **Message**: "Cannot reactivate goals cancelled more than 30 days ago"
- **Recovery**: Suggest creating new goal instead

### System Errors

#### Database Connection Failed

- **Error Code**: DATABASE_CONNECTION_ERROR
- **Message**: "Unable to save status change. Please try again."
- **Recovery**: Automatic retry with exponential backoff

#### Concurrent Modification

- **Error Code**: CONCURRENT_MODIFICATION
- **Message**: "Goal was modified by another user. Please refresh and try again."
- **Recovery**: Refresh data and allow user to retry

#### Permission Denied

- **Error Code**: INSUFFICIENT_PERMISSIONS
- **Message**: "You don't have permission to {action} this goal"
- **Recovery**: Show permission requirements or request access

### Network Errors

#### Offline Operation

- **Handling**: Queue status changes for later sync
- **Feedback**: Show offline indicator and queued changes count
- **Recovery**: Automatic sync when connection restored

#### Timeout Errors

- **Handling**: Retry with increasing delays
- **Feedback**: Progress indicator with retry options
- **Recovery**: Manual retry button after max retries

## Testing Strategy

### Unit Testing

#### Business Logic Tests

- Status transition validation
- Permission checking logic
- Time window calculations
- Reason requirement enforcement

#### Component Tests

- Status change dialogs
- Status history displays
- Bulk operation interfaces
- Error state handling

### Integration Testing

#### API Integration

- Status change endpoints
- Bulk operation workflows
- History retrieval
- Permission enforcement

#### Database Integration

- Status change persistence
- History table operations
- Transaction handling
- Data integrity checks

### End-to-End Testing

#### User Journey Tests

- Complete status change workflow
- Bulk operations with multiple goals
- Error recovery scenarios
- Mobile and desktop experiences

#### Performance Tests

- Large bulk operations (100+ goals)
- Concurrent status changes
- Database load testing
- Memory usage monitoring

### Accessibility Testing

#### Screen Reader Tests

- Status change announcements
- Error message reading
- Form validation feedback
- Keyboard navigation

#### Visual Accessibility

- High contrast mode testing
- Color blindness simulation
- Font scaling validation
- Motion sensitivity checks

## Success Metrics

### User Engagement Metrics

#### Usage Metrics

- **Status Change Rate**: Percentage of goals that undergo status changes
- **Target**: > 25% of active goals changed quarterly
- **Bulk Operation Usage**: Percentage of users using bulk operations
- **Target**: > 15% of power users monthly

#### Feature Adoption

- **Feature Discovery**: Time to first status change
- **Target**: < 7 days for new users
- **Feature Retention**: Continued usage after first use
- **Target**: > 60% retention after 30 days

### Performance Metrics

#### Response Times

- **Status Change**: < 2 seconds average response time
- **Bulk Operations**: < 10 seconds for 50 goals
- **History Loading**: < 1 second for 100 history items
- **UI Updates**: < 500ms for status indicator changes

#### Reliability Metrics

- **Error Rate**: < 0.1% of status change operations fail
- **Uptime**: > 99.9% availability
- **Data Loss**: 0% data loss incidents
- **Recovery Time**: < 5 minutes for service restoration

### Quality Metrics

#### User Satisfaction

- **NPS Score**: > 7.5/10 for status management features
- **Usability Score**: > 85% positive feedback
- **Error Recovery**: > 90% successful error recoveries
- **Accessibility Score**: 100% WCAG 2.1 AA compliance

#### Business Impact

- **Goal Completion**: No negative impact on completion rates
- **User Retention**: Improved retention through flexibility
- **Support Tickets**: < 5% of tickets related to status issues
- **Feature Usage**: > 40% of active users use status changes weekly

### Monitoring and Analytics

#### Key Performance Indicators

- Status change success rate
- Average time between status changes
- Most common status transition patterns
- Error rates by status type
- Performance metrics by user segment

#### Alerting Thresholds

- Error rate > 1%: Immediate investigation
- Response time > 5 seconds: Performance alert
- Data inconsistency detected: Critical alert
- Permission violations > 0: Security alert

## Implementation Notes

### Phase 1: Core Status Transitions (Weeks 1-2)

- Implement basic status change functionality
- Add validation and error handling
- Create status change UI components

### Phase 2: Advanced Features (Weeks 3-4)

- Add bulk operations
- Implement status history
- Add reason/note requirements

### Phase 3: Polish and Optimization (Weeks 5-6)

- Performance optimization
- Accessibility improvements
- Mobile experience refinement

### Phase 4: Testing and Deployment (Weeks 7-8)

- Comprehensive testing
- Documentation completion
- Production deployment

### Dependencies

- Goal creation and management (001, 002)
- UI component library
- State management system
- Database schema updates

### Risks and Mitigations

- **Data Loss Risk**: Comprehensive backup and transaction handling
- **Performance Impact**: Caching and optimization strategies
- **User Confusion**: Clear UI design and help documentation
- **Security Issues**: Input validation and authorization checks

This specification provides a comprehensive foundation for implementing robust goal status management with proper validation, user experience, and technical architecture.
