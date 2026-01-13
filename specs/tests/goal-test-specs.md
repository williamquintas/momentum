# Goal Tracking System - Test Specifications

This document contains comprehensive test specifications for all goal-related functionality, organized by test type and feature area.

---

## Test Strategy

### Test Levels

1. **Unit Tests**: Individual functions, utilities, calculations
2. **Component Tests**: React components with React Testing Library
3. **Integration Tests**: API endpoints, database operations, state management
4. **E2E Tests**: Complete user workflows with Playwright/Cypress
5. **Performance Tests**: Load testing, response time validation

### Test Coverage Goals

- Unit tests: 90%+ code coverage
- Component tests: All user-facing components
- Integration tests: All API endpoints and critical workflows
- E2E tests: All primary user journeys

---

## 1. Unit Tests

### 1.1 Progress Calculation Utilities

#### Test: Calculate Quantitative Progress

```typescript
describe('calculateQuantitativeProgress', () => {
  it('should calculate progress correctly for normal case', () => {
    // startValue: 0, currentValue: 50, targetValue: 100
    // Expected: 50%
  });

  it('should handle startValue === targetValue', () => {
    // startValue: 100, currentValue: 100, targetValue: 100
    // Expected: 100% or error
  });

  it('should handle negative values', () => {
    // startValue: -10, currentValue: 0, targetValue: 10
    // Expected: 50%
  });

  it('should handle currentValue < startValue', () => {
    // startValue: 0, currentValue: -10, targetValue: 100
    // Expected: 0% (clamped)
  });

  it('should handle currentValue > targetValue', () => {
    // startValue: 0, currentValue: 150, targetValue: 100
    // Expected: 100% (clamped) or >100% if allowed
  });

  it('should handle decimal values when allowed', () => {
    // allowDecimals: true
    // startValue: 0, currentValue: 50.5, targetValue: 100
    // Expected: 50.5%
  });

  it('should reject decimal values when not allowed', () => {
    // allowDecimals: false
    // Should throw validation error
  });
});
```

#### Test: Calculate Milestone Progress

```typescript
describe('calculateMilestoneProgress', () => {
  it('should calculate progress from completed milestones', () => {
    // 3 completed out of 5 total
    // Expected: 60%
  });

  it('should handle all milestones completed', () => {
    // 5 completed out of 5 total
    // Expected: 100%
  });

  it('should handle no milestones completed', () => {
    // 0 completed out of 5 total
    // Expected: 0%
  });

  it('should exclude skipped milestones from calculation', () => {
    // 2 completed, 1 skipped, 2 pending out of 5 total
    // Expected: 40% (2/5) or 50% (2/4 excluding skipped)
  });
});
```

#### Test: Calculate Habit Strength

```typescript
describe('calculateHabitStrength', () => {
  it('should calculate strength based on consistency', () => {
    // 28/30 days completed in last 30 days
    // Expected: ~93% strength
  });

  it('should factor in current streak', () => {
    // Long current streak should boost strength
  });

  it('should factor in recency', () => {
    // Recent completions weighted more heavily
  });

  it('should handle new habits', () => {
    // < 7 days of data
    // Expected: Lower strength, more uncertainty
  });
});
```

#### Test: Calculate Streak

```typescript
describe('calculateStreak', () => {
  it('should calculate current streak from last completed date', () => {
    // Last completed: today, previous: yesterday, day before: missed
    // Expected: current streak = 2
  });

  it('should handle missed days breaking streak', () => {
    // Last completed: 2 days ago, yesterday: missed
    // Expected: current streak = 0
  });

  it('should handle grace period for missed days', () => {
    // Grace period: 1 day
    // Last completed: 2 days ago, yesterday: missed
    // Expected: current streak continues
  });

  it('should track longest streak', () => {
    // Current: 5, longest ever: 30
    // Expected: longest = 30
  });
});
```

### 1.2 Validation Utilities

#### Test: Validate Goal Data

```typescript
describe('validateGoal', () => {
  it('should validate required fields', () => {
    // Missing title should fail
  });

  it('should validate title length', () => {
    // Title > 200 chars should fail
  });

  it('should validate numeric ranges', () => {
    // currentValue outside minValue/maxValue should fail
  });

  it('should validate date relationships', () => {
    // deadline before startDate should fail
  });

  it('should validate milestone dependencies', () => {
    // Circular dependencies should fail
  });
});
```

#### Test: Validate Recurrence

```typescript
describe('validateRecurrence', () => {
  it('should validate weekly recurrence with daysOfWeek', () => {
    // Weekly frequency requires daysOfWeek
  });

  it('should validate interval is positive', () => {
    // interval <= 0 should fail
  });

  it('should validate dayOfMonth range', () => {
    // dayOfMonth must be 1-31
  });

  it('should validate dayOfYear range', () => {
    // dayOfYear must be 1-365
  });
});
```

### 1.3 Date/Time Utilities

#### Test: Timezone Handling

```typescript
describe('timezone utilities', () => {
  it('should convert dates to user timezone', () => {
    // UTC date should convert to user's local timezone
  });

  it('should handle deadline countdown across timezones', () => {
    // Countdown should be accurate regardless of timezone
  });

  it('should handle date comparisons correctly', () => {
    // Date comparisons should account for timezone
  });
});
```

---

## 2. Component Tests

### 2.1 Goal Form Component

#### Test: Create Goal Form

```typescript
describe('CreateGoalForm', () => {
  it('should render all required fields', () => {
    // Title, type, status, priority, category inputs visible
  });

  it('should show type-specific fields based on selected type', () => {
    // Selecting 'quantitative' shows startValue, targetValue, etc.
  });

  it('should validate form on submit', () => {
    // Empty required fields show validation errors
  });

  it('should submit valid form data', () => {
    // Mock API call, verify correct data sent
  });

  it('should handle submission errors', () => {
    // Display error message on API failure
  });

  it('should reset form after successful submission', () => {
    // Form clears after successful create
  });
});
```

#### Test: Update Goal Form

```typescript
describe('UpdateGoalForm', () => {
  it('should pre-populate with existing goal data', () => {
    // All fields show current goal values
  });

  it('should validate changes before submission', () => {
    // Invalid changes show errors
  });

  it('should submit only changed fields', () => {
    // Only modified fields sent in update request
  });
});
```

### 2.2 Progress Update Components

#### Test: Quantitative Progress Update

```typescript
describe('QuantitativeProgressUpdate', () => {
  it('should display current progress', () => {
    // Shows currentValue, targetValue, unit, percentage
  });

  it('should validate input value', () => {
    // Value outside min/max shows error
  });

  it('should update progress on value change', () => {
    // Changing currentValue updates progress calculation
  });

  it('should create progress history entry', () => {
    // Submitting update creates history entry
  });
});
```

#### Test: Milestone Progress Component

```typescript
describe('MilestoneProgress', () => {
  it('should display milestones with Ant Design Steps', () => {
    // Steps component shows all milestones
  });

  it('should highlight completed milestones', () => {
    // Completed milestones visually distinct
  });

  it('should disable milestones with unmet dependencies', () => {
    // Milestones with incomplete dependencies disabled
  });

  it('should enforce sequential completion if required', () => {
    // Cannot complete milestone 3 if 2 not completed
  });

  it('should allow reordering if enabled', () => {
    // Drag-and-drop or up/down buttons visible
  });
});
```

### 2.3 Goal List Component

#### Test: Goal List Display

```typescript
describe('GoalList', () => {
  it('should display goals in list format', () => {
    // Each goal shows title, status, progress, type
  });

  it('should apply filters correctly', () => {
    // Filtering by type shows only matching goals
  });

  it('should apply search correctly', () => {
    // Searching filters by title/description
  });

  it('should sort goals correctly', () => {
    // Sorting by deadline orders correctly
  });

  it('should paginate large lists', () => {
    // Shows pagination controls for >20 goals
  });

  it('should handle empty state', () => {
    // Shows message when no goals match filters
  });
});
```

### 2.4 Goal Detail Component

#### Test: Goal Detail Display

```typescript
describe('GoalDetail', () => {
  it('should display all goal information', () => {
    // Shows all fields, progress, history
  });

  it('should render type-specific visualizations', () => {
    // Quantitative shows progress bar, milestone shows steps
  });

  it('should display deadline countdown', () => {
    // Shows time remaining or overdue
  });

  it('should handle loading state', () => {
    // Shows loading spinner while fetching
  });

  it('should handle error state', () => {
    // Shows error message if fetch fails
  });
});
```

---

## 3. Integration Tests

### 3.1 API Endpoints

#### Test: Create Goal API

```typescript
describe('POST /api/goals', () => {
  it('should create quantitative goal successfully', () => {
    // Valid quantitative goal data
    // Verify response status 201
    // Verify goal created in database
  });

  it('should reject invalid goal data', () => {
    // Missing required fields
    // Verify response status 400
    // Verify validation errors in response
  });

  it('should validate type-specific fields', () => {
    // Quantitative goal without startValue
    // Verify response status 400
  });

  it('should set default values correctly', () => {
    // Goal without optional fields
    // Verify defaults applied (progress: 0, etc.)
  });
});
```

#### Test: Update Goal API

```typescript
describe('PATCH /api/goals/:id', () => {
  it('should update goal fields', () => {
    // Update title, description
    // Verify changes saved
  });

  it('should update progress correctly', () => {
    // Update currentValue for quantitative goal
    // Verify progress recalculated
  });

  it('should create progress history entry', () => {
    // Update progress
    // Verify history entry created
  });

  it('should reject invalid updates', () => {
    // Invalid data (e.g., currentValue > maxValue)
    // Verify response status 400
  });

  it('should handle concurrent updates', () => {
    // Two updates to same goal
    // Verify last write wins or conflict handling
  });
});
```

#### Test: Get Goals API

```typescript
describe('GET /api/goals', () => {
  it('should return all goals for user', () => {
    // Verify all user's goals returned
  });

  it('should filter by type', () => {
    // Query param: type=quantitative
    // Verify only quantitative goals returned
  });

  it('should filter by status', () => {
    // Query param: status=active
    // Verify only active goals returned
  });

  it('should search by title/description', () => {
    // Query param: search=keyword
    // Verify matching goals returned
  });

  it('should paginate results', () => {
    // Query params: page=2, limit=10
    // Verify correct page returned
  });

  it('should sort results', () => {
    // Query param: sort=deadline&order=asc
    // Verify goals sorted correctly
  });
});
```

### 3.2 Database Operations

#### Test: Goal Persistence

```typescript
describe('Goal Database Operations', () => {
  it('should persist goal with all fields', () => {
    // Create goal, verify all fields saved
  });

  it('should handle relationships correctly', () => {
    // Goal with relatedGoals, milestones
    // Verify relationships persisted
  });

  it('should maintain referential integrity', () => {
    // Delete goal referenced by relatedGoals
    // Verify cascade or constraint handling
  });

  it('should index for performance', () => {
    // Query by type, status, deadline
    // Verify indexes used (check query plan)
  });
});
```

### 3.3 State Management

#### Test: Goal Store (Redux/Zustand)

```typescript
describe('Goal Store', () => {
  it('should add goal to store on create', () => {
    // Create goal, verify in store
  });

  it('should update goal in store on edit', () => {
    // Update goal, verify store updated
  });

  it('should filter goals correctly', () => {
    // Apply filter, verify filtered list
  });

  it('should handle optimistic updates', () => {
    // Update goal optimistically
    // Verify UI updates immediately
    // Rollback on error
  });
});
```

---

## 4. End-to-End Tests

### 4.1 Goal Creation Workflow

#### Test: Create Quantitative Goal

```typescript
describe('E2E: Create Quantitative Goal', () => {
  it('should complete full creation workflow', async () => {
    // 1. Navigate to create goal page
    // 2. Fill in required fields
    // 3. Select quantitative type
    // 4. Enter startValue, targetValue, currentValue, unit
    // 5. Submit form
    // 6. Verify success message
    // 7. Verify goal appears in list
    // 8. Verify goal detail page shows correct data
  });
});
```

#### Test: Create Milestone Goal

```typescript
describe('E2E: Create Milestone Goal', () => {
  it('should create goal with multiple milestones', async () => {
    // 1. Create milestone goal
    // 2. Add 3 milestones
    // 3. Set dependencies between milestones
    // 4. Submit
    // 5. Verify milestones displayed correctly
    // 6. Verify dependencies enforced
  });
});
```

### 4.2 Progress Update Workflow

#### Test: Update Quantitative Progress

```typescript
describe('E2E: Update Progress', () => {
  it('should update progress and see changes', async () => {
    // 1. Open quantitative goal
    // 2. Update currentValue
    // 3. Submit update
    // 4. Verify progress bar updated
    // 5. Verify progress history entry created
    // 6. Verify progress percentage correct
  });
});
```

#### Test: Complete Milestone

```typescript
describe('E2E: Complete Milestone', () => {
  it('should complete milestone and update progress', async () => {
    // 1. Open milestone goal
    // 2. Complete first milestone
    // 3. Verify milestone marked complete
    // 4. Verify overall progress updated
    // 5. Verify can complete next milestone
    // 6. Verify cannot skip milestones if sequential required
  });
});
```

### 4.3 Filter and Search Workflow

#### Test: Filter Goals

```typescript
describe('E2E: Filter Goals', () => {
  it('should filter by multiple criteria', async () => {
    // 1. Navigate to goals list
    // 2. Filter by type: quantitative
    // 3. Filter by status: active
    // 4. Filter by priority: high
    // 5. Verify only matching goals shown
    // 6. Clear filters
    // 7. Verify all goals shown
  });
});
```

---

## 5. Performance Tests

### 5.1 Load Testing

#### Test: Goal List Performance

```typescript
describe('Performance: Goal List', () => {
  it('should load 1000 goals in < 2 seconds', async () => {
    // Create 1000 goals
    // Measure load time
    // Verify < 2 seconds
  });

  it('should handle filtering on large dataset', async () => {
    // 1000 goals
    // Apply filter
    // Verify response < 500ms
  });
});
```

#### Test: Progress Update Performance

```typescript
describe('Performance: Progress Update', () => {
  it('should save progress update in < 500ms', async () => {
    // Update progress
    // Measure save time
    // Verify < 500ms
  });
});
```

### 5.2 Stress Testing

#### Test: Concurrent Updates

```typescript
describe('Stress: Concurrent Operations', () => {
  it('should handle 100 concurrent progress updates', async () => {
    // 100 users update same goal simultaneously
    // Verify no data loss
    // Verify all updates processed
  });
});
```

---

## 6. Accessibility Tests

### 6.1 Keyboard Navigation

#### Test: Goal Form Accessibility

```typescript
describe('A11y: Goal Form', () => {
  it('should be fully keyboard navigable', async () => {
    // Tab through all fields
    // Verify focus indicators visible
    // Verify can submit with keyboard
  });

  it('should have proper ARIA labels', async () => {
    // Verify all inputs have labels
    // Verify error messages associated correctly
  });
});
```

### 6.2 Screen Reader Support

#### Test: Screen Reader Compatibility

```typescript
describe('A11y: Screen Reader', () => {
  it('should announce goal status changes', async () => {
    // Update goal status
    // Verify screen reader announces change
  });

  it('should announce progress updates', async () => {
    // Update progress
    // Verify screen reader announces new progress
  });
});
```

---

## 7. Edge Cases and Error Handling

### 7.1 Data Edge Cases

#### Test: Extreme Values

```typescript
describe('Edge Cases: Extreme Values', () => {
  it('should handle very large numbers', () => {
    // targetValue: Number.MAX_SAFE_INTEGER
    // Verify no overflow
  });

  it('should handle very small numbers', () => {
    // targetValue: 0.0001
    // Verify precision maintained
  });

  it('should handle very long strings', () => {
    // Description: 5000 characters
    // Verify truncation or handling
  });
});
```

### 7.2 Error Scenarios

#### Test: Network Errors

```typescript
describe('Error Handling: Network', () => {
  it('should handle network timeout', async () => {
    // Simulate timeout
    // Verify error message shown
    // Verify retry option available
  });

  it('should handle server errors', async () => {
    // Simulate 500 error
    // Verify error message shown
    // Verify user can retry
  });
});
```

#### Test: Validation Errors

```typescript
describe('Error Handling: Validation', () => {
  it('should show clear validation errors', async () => {
    // Submit invalid form
    // Verify specific error messages
    // Verify errors associated with fields
  });
});
```

---

## Test Data Management

### Test Fixtures

- Sample goals of each type
- Sample progress history entries
- Sample milestones with dependencies
- Sample recurring/habit entries

### Test Database

- Separate test database
- Reset between test suites
- Seed with test data
- Cleanup after tests

### Mock Services

- Mock API responses
- Mock authentication
- Mock file uploads
- Mock time/date functions

---

## Test Execution Strategy

### Pre-commit

- Run unit tests
- Run component tests
- Run linting

### CI/CD Pipeline

- All unit tests
- All component tests
- Integration tests
- E2E tests (smoke tests)
- Performance tests (nightly)

### Manual Testing

- Exploratory testing
- Usability testing
- Cross-browser testing
- Accessibility audit
