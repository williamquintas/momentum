# Feature Specification: Complete Goal

**Feature Branch**: `005-complete-goal`  
**Created**: 2026-03-22  
**Status**: Draft  
**Input**: Extracted from @bkp/features/goal-features.md Feature 3

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Mark Goal Complete (Priority: P1)

As a user, I want to mark goals as completed when achieved so that I can celebrate accomplishments.

**Why this priority**: Closure and achievement recognition.

**Independent Test**: Can be tested by completing goals and verifying status change.

**Acceptance Scenarios**:

1. **Given** goal at 100% progress, **When** user marks complete, **Then** status changes to 'completed' and completedDate set
2. **Given** goal not at 100% progress, **When** user attempts completion, **Then** validation shows requirement and offers override option
3. **Given** user confirms override, **When** submitted, **Then** goal completes with warning note

### User Story 2 - Recurring/Habit Goal Completion (Priority: P1)

As a user, I want recurring and habit goals to handle completion differently.

**Acceptance Scenarios**:

1. **Given** recurring goal, **When** user marks complete, **Then** occurrence marked done, goal remains active
2. **Given** habit goal, **When** user marks today complete, **Then** daily entry recorded, goal remains active

### User Story 3 - Completion Actions (Priority: P2)

As a user, I want confirmation and actions when completing goals.

**Acceptance Scenarios**:

1. **Given** goal completing, **When** user confirms, **Then** celebration/confirmation displays
2. **Given** completion confirmed, **When** confirmed, **Then** user can add completion note
3. **Given** related goals exist, **When** goal completes, **Then** dependent goals notified

## Requirements *(mandatory)*

- **FR-001**: Validate progress is 100% before completion
- **FR-002**: Set status to 'completed' and completedDate
- **FR-003**: Handle recurring/habit goals as partial completions
- **FR-004**: Allow manual override with confirmation
- **FR-005**: Update related goals and statistics

## Success Criteria *(mandatory)*

- **SC-001**: Completion succeeds for valid goals
- **SC-002**: No data loss during completion
- **SC-003**: Recurring/habit goals remain trackable

## Assumptions

- Follows @bkp/workflows/goal-workflows.md
- Status transitions per @bkp/decision-trees/status-transition-decision-tree.mmd

## Dependencies

- Goal types from @bkp/types/goal.types.ts
- Workflows from @bkp/workflows/goal-workflows.md
- Storage service from @bkp/services/storage/goalStorageService.ts
