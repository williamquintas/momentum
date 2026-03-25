# Feature Specification: Fix Duplicate Progress Update Error

**Feature Branch**: `017-fix-duplicate-progress-error`  
**Created**: 2026-03-25  
**Status**: Draft  
**Input**: User description: "Bugfix for https://github.com/williamquintas/momentum/issues/18"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - First-time Progress Update (Priority: P1)

As a user with a quantitative goal, I want to update my progress for the first time so that I can track my advancement toward my goal.

**Why this priority**: This is the primary user flow that is currently broken. Users cannot update progress without receiving a false duplicate error.

**Independent Test**: Can be tested by creating a new quantitative goal and attempting the first progress update. The update should succeed without any error messages.

**Acceptance Scenarios**:

1. **Given** a quantitative goal with no previous progress updates, **When** the user enters a new current value and saves, **Then** the progress percentage should update correctly based on the formula: ((currentValue - startValue) / (targetValue - startValue)) \* 100
2. **Given** a quantitative goal with no previous progress updates, **When** the user updates progress successfully, **Then** a progress history entry should be created with timestamp
3. **Given** a quantitative goal at 99% progress, **When** the user updates progress to reach 100% (and allowOverAchievement is false), **Then** the goal should auto-complete

---

### User Story 2 - Subsequent Progress Updates (Priority: P1)

As a user with an existing progress history, I want to update my progress again so that I can continue tracking my goal advancement.

**Why this priority**: The duplicate detection should correctly allow legitimate subsequent updates while still preventing actual duplicates.

**Independent Test**: Can be tested by making a progress update, waiting an appropriate time, and making another update. Both updates should succeed.

**Acceptance Scenarios**:

1. **Given** a goal with existing progress history, **When** the user updates progress after a reasonable time delay, **Then** the update should succeed
2. **Given** a goal with existing progress history, **When** the user attempts to submit duplicate updates within a short time window, **Then** the duplicate error should be displayed

---

### Edge Cases

- What happens when the user has multiple browser tabs open and attempts to update progress in each?
- How does the system handle rapid successive updates from the same user?
- What is the appropriate time window for duplicate detection (if any)?
- What happens when progress values are identical but submitted at different times?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST allow users to update progress on a quantitative goal for the first time without triggering a duplicate error
- **FR-002**: System MUST correctly calculate progress percentage using the formula: ((currentValue - startValue) / (targetValue - startValue)) \* 100
- **FR-003**: System MUST create a progress history entry with timestamp when progress is updated
- **FR-004**: System MUST auto-complete goals when progress reaches 100% (if allowOverAchievement is false)
- **FR-005**: System MUST NOT incorrectly flag legitimate first-time updates as duplicates

### Key Entities _(include if feature involves data)_

- **Progress Update**: Represents a user's progress update attempt, including timestamp, value, and validation state
- **Progress History**: Immutable record of all progress updates for a goal
- **Quantitative Goal**: A goal with numeric start, target, and current values

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can successfully update progress on a quantitative goal on their first attempt without receiving a duplicate error
- **SC-002**: Progress percentage is calculated correctly using the standard formula
- **SC-003**: Progress history entries are created with accurate timestamps
- **SC-004**: Goals auto-complete when progress reaches 100% (according to allowOverAchievement setting)
- **SC-005**: Legitimate duplicate updates (rapid submissions) are still correctly detected and prevented

## Assumptions

- The duplicate detection logic is checking some condition incorrectly (likely comparing against wrong state or having a logic error in the condition)
- The fix should maintain legitimate duplicate detection while fixing the false positive for first-time updates
- The time window for duplicate detection (if applicable) should be reasonable (industry standard is typically 1-5 seconds for form submissions)
