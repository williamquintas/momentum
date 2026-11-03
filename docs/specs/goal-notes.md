# Spec: goal-notes

Scope: feature

# Notes Feature Specification

## User Scenarios

### User Story 1 - Manage Notes (Priority: P1)

As a user, I want to add and edit notes on goals.

**Acceptance Scenarios**:

1. **Given** goal, **When** user adds note, **Then** it saves with timestamp
2. **Given** note created, **When** edited, **Then** changes persist
3. **Given** note created, **When** deleted, **Then** note is removed

### User Story 2 - Note Tags (Priority: P2)

As a user, I want to tag notes for organization.

**Acceptance Scenarios**:

1. **Given** note created, **When** tags added, **Then** tags persist
2. **Given** note with tags, **When** edited, **Then** tags can be modified

## Requirements

- **FR-001**: Create notes on goals
- **FR-002**: Edit existing notes
- **FR-003**: Delete notes
- **FR-004**: Add/remove tags on notes
- **FR-005**: Display notes in timeline

## Success Criteria

- **SC-001**: Notes persist with goal in storage
- **SC-002**: Timestamps recorded on creation/update
- **SC-003**: Tags filterable for note organization

## Dependencies

- Note type from `src/types/goal.types.ts`
- GoalDetail component for UI integration
- Feature flag `VITE_ENABLE_NOTES`
