# Common Patterns

## Creation Flow
1. Show form with validation
2. Handle submission with loading state
3. Optimistically update UI
4. Show success/error message
5. Navigate or refresh data
6. Clear form on success
7. Handle form state persistence (localStorage for draft recovery)
8. Validate on blur for better UX
9. Show field-level validation errors
10. Support keyboard shortcuts (Cmd/Ctrl+Enter to submit)

## Progress Update Flow
1. Allow manual or automatic updates
2. Validate new progress value (range, type-specific rules)
3. Update with optimistic UI
4. Save to backend
5. Update progress history
6. Show success feedback
7. Handle errors gracefully
8. Support batch progress updates
9. Validate against goal constraints (max value, completion status)
10. Auto-save draft progress values
11. Show progress change indicators (↑/↓ arrows, color coding)

## Filtering & Search
- Debounce search input (300ms recommended)
- Combine multiple filters
- Persist filter state in URL params
- Show active filter count
- Provide clear filter options
- Reset filters easily
- Save filter presets
- Support filter combinations (AND/OR logic)
- Show filter suggestions/autocomplete
- Highlight search matches in results
- Support advanced search syntax

## List Display
- Show key information at a glance
- Include quick actions
- Support bulk operations
- Show loading states
- Handle empty states
- Implement pagination or infinite scroll
- Support sorting (by date, priority, progress, name)
- Show selection state clearly
- Display status badges/indicators
- Support column customization
- Show last updated timestamps
- Group by categories when applicable

## Detail View
- Show comprehensive information
- Display progress history
- Show related goals (parent/child, similar goals)
- Include action buttons
- Support editing inline
- Show activity timeline
- Display goal metadata (created date, last updated, completion date)
- Show goal type-specific information
- Include quick action buttons (edit, delete, duplicate, archive)
- Support keyboard navigation
- Show completion percentage and visual progress
- Display upcoming milestones/deadlines

## Deletion & Archival Flow
1. Show confirmation dialog with goal details
2. Explain consequences (what data will be lost)
3. Handle soft delete (archive) vs hard delete
4. Show loading state during deletion
5. Optimistically remove from UI
6. Handle errors (restore on failure)
7. Show success message
8. Navigate away if on detail view
9. Support bulk deletion with confirmation
10. Provide undo option (within 5-10 seconds)

## Bulk Operations
- Show selection checkbox/select all
- Display count of selected items
- Provide bulk action toolbar
- Support bulk edit (change status, priority, tags)
- Handle bulk deletion with confirmation
- Show progress indicator for bulk operations
- Validate all items before bulk action
- Show summary of changes before applying
- Handle partial failures gracefully
- Provide undo for bulk operations

## Form Validation Patterns
- Validate on blur for better UX
- Show field-level errors inline
- Validate on submit (comprehensive check)
- Disable submit button when invalid
- Show validation summary at top if needed
- Support async validation (e.g., name uniqueness)
- Clear errors when user starts typing
- Use Ant Design Form validation rules
- Show required field indicators
- Validate dependent fields (e.g., end date after start date)

## Navigation Patterns
- Use Ant Design Breadcrumb for deep navigation
- Support browser back/forward buttons
- Persist scroll position when navigating back
- Use URL params for filter/search state
- Support deep linking to specific views
- Show navigation history when applicable
- Handle navigation during unsaved changes
- Use Ant Design Menu for main navigation

## Confirmation Dialogs
- Use Ant Design Modal.confirm for destructive actions
- Show clear action description
- Explain consequences
- Use appropriate icon (warning for delete, info for archive)
- Support keyboard shortcuts (Enter to confirm, Esc to cancel)
- Make destructive actions require explicit confirmation
- Show loading state during confirmation action
- Handle cancellation gracefully

## Optimistic Updates
- Update UI immediately for better perceived performance
- Show loading indicator on the specific item
- Revert on error with clear message
- Queue updates if offline
- Handle race conditions (last write wins or merge strategy)
- Show optimistic state visually (e.g., dimmed, loading spinner)
- Sync with server response when available

## Data Synchronization
- Use React Query for automatic refetching
- Implement stale-while-revalidate pattern
- Show sync status indicator
- Handle conflict resolution
- Support manual refresh
- Auto-refresh on window focus
- Poll for updates on active views
- Show last sync timestamp

## Offline Support
- Queue actions when offline
- Show offline indicator
- Sync when connection restored
- Handle offline data gracefully
- Cache critical data locally
- Show queued actions count
- Support offline viewing of cached data

## Error Handling Patterns
- Show user-friendly error messages
- Provide retry options
- Log errors for debugging
- Handle network failures
- Validate before submission
- Show validation errors inline
- Categorize errors (validation, network, server, permission)
- Show error boundaries for component crashes
- Provide error recovery paths
- Use Ant Design message/notification for errors
- Show error details in development mode

## Loading States
- Use Skeleton components for content
- Show Spinner for actions
- Use optimistic updates
- Show progress for long operations
- Disable actions during loading
- Show loading state per item in lists
- Use Ant Design Spin component
- Show loading percentage when available
- Prevent multiple simultaneous submissions

## Success Feedback
- Show success messages
- Use notifications for important actions
- Celebrate goal completions
- Provide undo options when appropriate
- Refresh data after success
- Use Ant Design message.success
- Show success duration (auto-dismiss after 3-5 seconds)
- Support action buttons in success messages (e.g., "View Goal")
- Use appropriate icons (checkmark, celebration)

## Goal-Specific Patterns

### Goal Type Switching
- Show confirmation when changing goal type
- Explain data loss implications
- Migrate compatible data when possible
- Validate new type constraints
- Show preview of changes

### Recurrence Handling
- Show recurrence pattern clearly
- Handle timezone considerations
- Show next occurrence date
- Support recurrence pattern editing
- Handle missed occurrences

### Milestone Progression
- Show milestone progress visually
- Highlight current milestone
- Show upcoming milestones
- Celebrate milestone completion
- Support milestone editing

### Habit Tracking
- Show streak information
- Display habit calendar/heatmap
- Support quick log entry
- Show habit frequency patterns
- Handle missed days gracefully

