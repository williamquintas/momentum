# Feature Specification: Notes and Attachments

**Feature Branch**: `013-notes-and-attachments`  
**Created**: 2026-03-22  
**Status**: Draft  
**Input**: Extracted from @bkp/features/goal-features.md Feature 11

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manage Notes (Priority: P1)

As a user, I want to add and edit notes on goals.

**Acceptance Scenarios**:

1. **Given** goal, **When** user adds note, **Then** it saves with timestamp
2. **Given** note created, **When** edited, **Then** changes persist

### User Story 2 - Manage Attachments (Priority: P1)

As a user, I want to upload file attachments.

**Acceptance Scenarios**:

1. **Given** goal detail page, **When** file uploaded, **Then** it stores and displays
2. **Given** attachment, **When** downloaded, **Then** file opens correctly

## Requirements *(mandatory)*

- **FR-001**: CRUD for notes
- **FR-002**: File upload/download
- **FR-003**: Display attachments list
- **FR-004**: Delete attachments

## Success Criteria *(mandatory)*

- **SC-001**: Notes and attachments persist
- **SC-002**: File size limits respected

## Dependencies

- Note and Attachment types from @bkp/types/goal.types.ts
