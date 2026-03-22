# Feature Specification: Goal Archiving

**Feature Branch**: `017-goal-archiving`  
**Created**: 2026-03-22  
**Status**: Draft  
**Input**: Extracted from @bkp/features/goal-features.md Feature 15

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Archive Goals (Priority: P1)

As a user, I want to archive old goals to reduce clutter.

**Acceptance Scenarios**:

1. **Given** completed goal, **When** archived, **Then** it hides from main list
2. **Given** archived goal, **When** unarchived, **Then** it reappears
3. **Given** archived goals, **When** searched, **Then** they can still be found

## Requirements *(mandatory)*

- **FR-001**: Archive/unarchive goals
- **FR-002**: Separate archived view
- **FR-003**: Preserve all data
- **FR-004**: Search/filter archived goals

## Success Criteria *(mandatory)*

- **SC-001**: Archiving succeeds without data loss
- **SC-002**: Archived goals remain searchable

## Dependencies

- archived field from @bkp/types/goal.types.ts
