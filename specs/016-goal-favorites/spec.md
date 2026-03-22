# Feature Specification: Goal Favorites

**Feature Branch**: `018-goal-favorites`
**Created**: 2026-03-22
**Status**: Draft
**Input**: Extracted from @bkp/features/goal-features.md Feature 16

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Mark Favorites (Priority: P1)

As a user, I want to mark important goals as favorites.

**Acceptance Scenarios**:

1. **Given** goal, **When** user marks as favorite, **Then** star indicator shows
2. **Given** favorites list, **When** viewed, **Then** only favorite goals appear
3. **Given** favorite goal, **When** unfavorited, **Then** removed from favorites

## Requirements *(mandatory)*

- **FR-001**: Toggle favorite status
- **FR-002**: Filter favorite goals
- **FR-003**: Display favorites prominently
- **FR-004**: Persist favorite status

## Success Criteria *(mandatory)*

- **SC-001**: Toggle works consistently
- **SC-002**: Filtering accurate

## Dependencies

- favorite field from @bkp/types/goal.types.ts
