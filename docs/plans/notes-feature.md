---
plan name: notes-feature
plan description: Notes CRUD with tags
plan status: active
---

## Idea

Implement notes management for goals: create, edit, delete notes with optional tags. Attachments deferred.

## Implementation

- 1. Update feature flag: enable notes by default (change default to true in src/utils/featureFlags.ts)
- 2. Add note operation types: create NoteInput, AddNoteInput, UpdateNoteInput in src/features/goals/types/index.ts
- 3. Add note mutations: useAddNote, useUpdateNote, useDeleteNote hooks in src/features/goals/hooks/
- 4. Create NoteEditor component: form for adding/editing notes with optional tags in src/features/goals/components/NoteEditor/
- 5. Update GoalDetail: integrate NoteEditor with add/edit/delete actions, replace read-only Timeline display
- 6. Add i18n keys: note.add, note.edit, note.delete, note.placeholder, note.tags in src/locales/en/translation.json
- 7. Add tests: NoteEditor.test.tsx, note hooks tests
- 8. Run validation: npm run validate to check types, lint, format

## Required Specs

<!-- SPECS_START -->

- goal-notes
- notes-feature-spec
<!-- SPECS_END -->
