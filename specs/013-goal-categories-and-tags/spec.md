# Feature Specification: Goal Categories and Tags

**Feature Branch**: `015-goal-categories-and-tags`
**Created**: 2026-03-22
**Status**: Draft
**Input**: Extracted from @bkp/features/goal-features.md Feature 13

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Organize Goals (Priority: P1)

As a user, I want to assign categories and tags to goals.

**Acceptance Scenarios**:

1. **Given** goal, **When** user selects category, **Then** category saves per BR-004
2. **Given** tags, **When** user adds tags, **Then** they save and enable filtering
3. **Given** tags, **When** searched, **Then** matching goals appear

## Requirements *(mandatory)*

- **FR-001**: Assign predefined or custom categories
- **FR-002**: Add/remove tags
- **FR-003**: Auto-suggest tags
- **FR-004**: Filter by category/tags

## Success Criteria *(mandatory)*

- **SC-001**: Organization persists
- **SC-002**: Filtering works with categories/tags

## Dependencies

- category and tags fields from @bkp/types/goal.types.ts
