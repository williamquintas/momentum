# Spec: notes-feature-spec

Scope: feature

# Feature Specification: Goal Notes

## Overview

Full CRUD interface for notes on goals with tagging support.

## Status

- **Status**: Ready for Implementation
- **Priority**: P2
- **Branch**: `011-notes-and-attachments`

## User Stories

### US-001: Add Note

As a user, I want to add a note to a goal so I can document context or progress.

**Given** goal detail page, **When** user clicks "Add Note" and enters content, **Then** note saves with timestamp.

### US-002: Edit Note

As a user, I want to edit an existing note to update or correct information.

**Given** note exists, **When** user edits note content, **Then** changes persist with updated timestamp.

### US-003: Delete Note

As a user, I want to delete a note that is no longer relevant.

**Given** note exists, **When** user deletes note, **Then** note is removed from goal.

### US-004: Tag Notes

As a user, I want to add tags to notes for organization.

**Given** note, **When** user adds tags, **Then** tags persist and can be used for filtering.

## Requirements

- FR-001: Create notes with content (max 5000 chars)
- FR-002: Edit note content and tags
- FR-003: Delete notes with confirmation
- FR-004: Add optional tags (array of strings)
- FR-005: Display notes in Timeline component
- FR-006: Show created/updated timestamps
- FR-007: Feature flag VITE_ENABLE_NOTES controls visibility

## UI/UX Guidelines

- Primary action: "Add Note" button in notes section header
- Secondary actions per note: Edit, Delete in Dropdown menu
- Mobile: Bottom drawer for NoteEditor (Drawer placement="bottom")
- Desktop: Modal for NoteEditor
- Loading: Skeleton while saving
- Empty: Empty component with "Add your first note" CTA

## Data Model

```typescript
interface Note {
  id: string; // UUID
  content: string; // max 5000 chars
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tags?: string[]; // optional
}
```

## Implementation Notes

1. Use existing Note type from `src/types/goal.types.ts`
2. Create NoteInput, AddNoteInput, UpdateNoteInput types
3. Build useAddNote, useUpdateNote, useDeleteNote hooks
4. Create NoteEditor component in `src/features/goals/components/NoteEditor/`
5. Update GoalDetail notes section with interactive UI
6. Add i18n keys for all user-facing strings
7. Attachments feature deferred to future release
