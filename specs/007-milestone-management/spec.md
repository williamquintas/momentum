# Feature Specification: Milestone Management

**Feature Branch**: `009-milestone-management`  
**Created**: 2026-03-22  
**Status**: Draft  
**Input**: Extracted from @bkp/features/goal-features.md Feature 7

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manage Milestones (Priority: P1)

As a user, I want to create, update, reorder, and complete milestones.

**Acceptance Scenarios**:

1. **Given** milestone goal, **When** user adds milestone, **Then** it saves with order
2. **Given** milestone with dependencies, **When** unmet dependencies exist, **Then** completion blocked
3. **Given** milestones, **When** reordered, **Then** sequence updates without cycles

## Requirements *(mandatory)*

- **FR-001**: CRUD operations for milestones
- **FR-002**: Dependency validation (no cycles)
- **FR-003**: Reordering support with order preservation
- **FR-004**: Progress recalculation on milestone completion

## Success Criteria *(mandatory)*

- **SC-001**: No cyclic dependencies allowed
- **SC-002**: Progress updates correctly

## Dependencies

- Validation rules from @bkp/business-rules/milestone-dependency-validation.mmd
