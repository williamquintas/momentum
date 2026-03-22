# Feature Specification: Recurring Goal Occurrence Tracking

**Feature Branch**: `010-recurring-goal-occurrence-tracking`
**Created**: 2026-03-22
**Status**: Draft
**Input**: Extracted from @bkp/features/goal-features.md Feature 8

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Track Occurrences (Priority: P1)

As a user, I want to mark recurring goal occurrences as complete.

**Acceptance Scenarios**:

1. **Given** recurring goal with weekly frequency, **When** user marks occurrence, **Then** occurrence recorded
2. **Given** occurrences tracked, **When** stats viewed, **Then** completion rate calculates correctly
3. **Given** calendar view, **When** opened, **Then** heatmap shows completion history

## Requirements *(mandatory)*

- **FR-001**: Mark occurrences complete
- **FR-002**: Update completion statistics
- **FR-003**: Display calendar heatmap
- **FR-004**: Calculate completion rate

## Success Criteria *(mandatory)*

- **SC-001**: Accurate completion rate
- **SC-002**: Stats update in real-time

## Dependencies

- CompletionStats from @bkp/types/goal.types.ts
