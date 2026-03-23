# Feature Specification: Update Goal Progress

**Feature Branch**: `004-update-goal-progress`  
**Created**: 2026-03-22  
**Status**: Draft  
**Input**: Extracted from @bkp/features/goal-features.md Feature 2

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Update Quantitative Progress (Priority: P1)

As a user, I want to update current values for quantitative goals so that progress is accurately tracked.

**Why this priority**: Essential for ongoing goal management.

**Independent Test**: Can be fully tested by updating values and verifying progress calculation.

**Acceptance Scenarios**:

1. **Given** a quantitative goal with startValue=200, targetValue=180, **When** user updates currentValue to 195, **Then** progress calculates to 25% per BR-009
2. **Given** decimals not allowed, **When** user enters decimal, **Then** validation prevents it
3. **Given** currentValue > targetValue, **When** submitted, **Then** progress clamps to 100% (or allows if over-achievement enabled)

### User Story 2 - Update Qualitative Progress (Priority: P1)

As a user, I want to update status and ratings for qualitative goals.

**Acceptance Scenarios**:

1. **Given** qualitative goal, **When** user sets status to in_progress, **Then** status updates and rating input enables
2. **Given** user adds self-assessment rating (1-10), **When** submitted, **Then** rating saves and progress recalculates

### User Story 3 - Update Binary/Milestone/Recurring/Habit Progress (Priority: P1)

As a user, I want type-specific progress updates.

**Acceptance Scenarios**:

1. **Given** binary goal with targetCount=5, **When** user checks 3 items, **Then** progress calculates to 60% per BR-011
2. **Given** milestone goal, **When** user completes milestone with unmet dependencies, **Then** validation prevents completion
3. **Given** recurring goal, **When** user marks occurrence, **Then** completionStats update per BR-010
4. **Given** habit goal, **When** user marks today complete, **Then** streak increments and habitStrength recalculates

### User Story 4 - Progress History Tracking (Priority: P2)

As a user, I want my progress changes tracked so that I can see the history.

**Acceptance Scenarios**:

1. **Given** multiple progress updates, **When** viewed, **Then** progressHistory array contains all entries with timestamps
2. **Given** user adds note to progress, **When** saved, **Then** note appears in history entry

## Requirements _(mandatory)_

- **FR-001**: System MUST support all goal type progress updates
- **FR-002**: System MUST validate inputs and calculate progress per BR-009 to BR-011
- **FR-003**: System MUST create progress history entries
- **FR-004**: System MUST update Local Storage and indexes
- **FR-005**: System MUST handle edge cases (over-achievement, past dates, etc.)

## Success Criteria _(mandatory)_

- **SC-001**: Progress updates in < 500ms
- **SC-002**: Calculations accurate for all types
- **SC-003**: History tracks all changes with timestamps

## Assumptions

- Follows @bkp/business-rules/progress-calculation-rules.mmd
- Uses @bkp/services/storage/goalStorageService.ts
- Real-time progress calculations

## Dependencies

- Goal types from @bkp/types/goal.types.ts
- Progress calculation rules from @bkp/business-rules/progress-calculation-rules.mmd
- Storage service from @bkp/services/storage/goalStorageService.ts
