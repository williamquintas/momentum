# Feature Specification: Deadline Management

**Feature Branch**: `016-deadline-management`  
**Created**: 2026-03-22  
**Status**: Draft  
**Input**: Extracted from @bkp/features/goal-features.md Feature 14

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Set Deadlines (Priority: P1)

As a user, I want to set and manage deadlines.

**Acceptance Scenarios**:

1. **Given** goal creation, **When** user sets deadline, **Then** countdown displays
2. **Given** approaching deadline, **When** viewed, **Then** alert shows urgency
3. **Given** overdue goal, **When** viewed, **Then** status indicates overdue

## Requirements *(mandatory)*

- **FR-001**: Set/update deadlines
- **FR-002**: Display countdown
- **FR-003**: Alert for approaching deadlines
- **FR-004**: Mark overdue status

## Success Criteria *(mandatory)*

- **SC-001**: Accurate countdown
- **SC-002**: Timely alerts

## Dependencies

- deadline field from @bkp/types/goal.types.ts
