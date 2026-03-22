# Feature Specification: Related Goals

**Feature Branch**: `014-related-goals`
**Created**: 2026-03-22
**Status**: Draft
**Input**: Extracted from @bkp/features/goal-features.md Feature 12

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Link Goals (Priority: P1)

As a user, I want to link related goals together.

**Acceptance Scenarios**:

1. **Given** two goals, **When** user links them, **Then** relationship saved
2. **Given** related goals, **When** viewed, **Then** links displayed with navigation
3. **Given** self-link attempted, **When** submitted, **Then** validation prevents it

## Requirements *(mandatory)*

- **FR-001**: Add/remove goal links
- **FR-002**: Display related goals
- **FR-003**: Prevent self-linking and duplicates
- **FR-004**: Navigate to related goals

## Success Criteria *(mandatory)*

- **SC-001**: Links persist
- **SC-002**: No invalid links created

## Dependencies

- relatedGoals field from @bkp/types/goal.types.ts
