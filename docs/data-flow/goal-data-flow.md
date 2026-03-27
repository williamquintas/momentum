# Momentum - Data Flow Specifications

This document describes how data flows through the system for key operations, including Local Storage operations, state management, and UI updates.

**Note**: This system uses Local Storage for persistence instead of a backend API. The data flow patterns remain the same, but storage operations use browser Local Storage with a normalized structure for optimal performance.

---

## 1. Create Goal Data Flow

### Components Involved

- **UI Component**: CreateGoalForm
- **State Management**: Goal Store (Redux/Zustand)
- **Storage Service**: Goal Storage Service (Local Storage)
- **Local Storage**: Browser Local Storage (normalized structure)
- **Validation**: Zod Schema Validation (client-side only)

### Data Flow Diagram

```
[User Input]
    │
    ▼
[CreateGoalForm Component]
    │
    ├─> Validate with Zod Schema (client-side)
    │   ├─ Invalid → Show errors → User fixes → Retry
    │   └─ Valid → Continue
    │
    ▼
[Optimistic Update to Store]
    │
    ├─> Dispatch: createGoalPending()
    │   └─> Store: Add temporary goal with loading state
    │
    ▼
[Storage Service: createGoal()]
    │
    ├─> Transform data for storage
    │   ├─ Convert dates to ISO strings (for Local Storage)
    │   ├─ Set defaults (progress: 0, timestamps)
    │   └─ Generate: id (UUID), createdAt, updatedAt
    │
    ├─> Set defaults:
    │   ├─ progress: 0
    │   ├─ progressHistory: []
    │   ├─ notes: []
    │   ├─ attachments: []
    │   └─ relatedGoals: []
    │
    ▼
[Local Storage: Save Goal]
    │
    ├─> Load current storage structure
    │
    ├─> Add goal to goals index: goals[goalId] = goal
    │
    ├─> Update indexes:
    │   ├─ Add to goals_index array
    │   ├─ Add to goals_by_type[type] array
    │   ├─ Add to goals_by_status[status] array
    │   ├─ Add to goals_by_category[category] array
    │   ├─ Add to goals_by_tag[tag] arrays (for each tag)
    │   └─ Add to date range indexes if applicable
    │
    ├─> Serialize data (dates to ISO strings)
    │
    ├─> Save to Local Storage atomically
    │
    ├─> Return: Created goal with all fields
    │
    ▼
[Storage Service: Transform Response]
    │
    ├─> Convert dates from ISO strings to Date objects
    │
    ├─> Add computed fields (if needed)
    │
    ▼
[State Management: Update Store]
    │
    ├─> Dispatch: createGoalSuccess(goal)
    │   ├─> Remove temporary goal
    │   ├─> Add real goal to store
    │   └─> Update goal list cache
    │
    ▼
[UI Component: Update View]
    │
    ├─> Show success message
    │
    ├─> Navigate to goal detail page
    │   └─> OR: Add goal to list view
    │
    └─> Clear form (if staying on page)
```

### Error Flow

```
[Storage Error]
    │
    ▼
[Storage Service: Handle Error]
    │
    ├─> Parse error
    │   ├─ Validation errors → Extract field errors
    │   ├─ Quota exceeded → Show storage limit error
    │   ├─ Corrupted data → Show data error, attempt recovery
    │   └─ Storage unavailable → Show storage error
    │
    ▼
[State Management: Error Handling]
    │
    ├─> Dispatch: createGoalError(error)
    │   ├─> Remove temporary goal
    │   └─> Set error state
    │
    ▼
[UI Component: Display Error]
    │
    ├─> Show error message
    │
    ├─> Show field-level errors (if validation)
    │
    └─> Allow user to retry or cancel
```

### Data Transformations

**Client → Storage:**

- Dates: `Date` → ISO string (Local Storage stores strings)
- Enums: TypeScript enum → string
- Optional fields: `undefined` → omitted or null

**Storage → Client:**

- Dates: ISO string → `Date`
- Enums: string → TypeScript enum
- Defaults: Applied if missing

---

## 2. Update Progress Data Flow

### Components Involved

- **UI Component**: ProgressUpdateForm / GoalDetail
- **State Management**: Goal Store
- **Storage Service**: Goal Storage Service
- **Local Storage**: Browser Local Storage
- **Calculation Service**: Progress Calculator

### Data Flow Diagram

```
[User Action: Update Progress]
    │
    ├─> Quantitative: User enters new currentValue
    ├─> Qualitative: User updates status/rating
    ├─> Binary: User checks/unchecks item
    ├─> Milestone: User completes milestone
    ├─> Recurring: User marks occurrence complete
    └─> Habit: User marks day complete
    │
    ▼
[UI Component: Capture Input]
    │
    ├─> Validate input (client-side)
    │   ├─ Invalid → Show error → User fixes
    │   └─ Valid → Continue
    │
    ▼
[Optimistic Update]
    │
    ├─> Dispatch: updateProgressPending(goalId, newValue)
    │   ├─> Update goal in store immediately
    │   └─> Show loading state
    │
    ▼
[Progress Calculation Service]
    │
    ├─> Calculate new progress based on type:
    │   │
    │   ├─ Quantitative:
    │   │   progress = ((currentValue - startValue) /
    │   │              (targetValue - startValue)) * 100
    │   │
    │   ├─ Milestone:
    │   │   progress = (completedMilestones / totalMilestones) * 100
    │   │
    │   ├─ Binary:
    │   │   progress = (currentCount / targetCount) * 100
    │   │
    │   ├─ Qualitative:
    │   │   progress = status-based or rating-based
    │   │
    │   ├─ Recurring:
    │   │   progress = (completedOccurrences / totalOccurrences) * 100
    │   │
    │   └─ Habit:
    │       progress = (completedDays / totalDays) * 100
    │
    ├─> Clamp progress: 0-100 (or allow >100)
    │
    └─> Return: { progress, isComplete, message }
    │
    ▼
[Storage Service: updateProgress()]
    │
    ├─> Prepare update:
    │   ├─ goalId: string
    │   ├─ progress: number
    │   ├─ progressEntry: {
    │   │     date: Date,
    │   │     value: number,
    │   │     note?: string
    │   │   }
    │   └─ type-specific updates (e.g., currentValue)
    │
    ▼
[Local Storage: Load and Update Goal]
    │
    ├─> Load goal from Local Storage
    │   └─> goals[goalId]
    │
    ├─> Validate update:
    │   ├─ Validate progress value (0-100)
    │   ├─ Validate type-specific fields
    │   └─ Check dependencies (for milestones)
    │
    ├─> Recalculate progress (client-side validation)
    │
    ├─> Create progress history entry
    │
    ├─> Update goal:
    │   ├─ progress: new value
    │   ├─ currentValue/currentCount/etc.: updated
    │   ├─ updatedAt: now
    │   └─ progressHistory: append new entry
    │
    ├─> Check completion:
    │   ├─ If progress = 100%: Suggest completion
    │   └─ If type-specific completion met: Suggest completion
    │
    ├─> Update indexes if needed (status change, etc.)
    │
    ├─> Serialize and save to Local Storage
    │
    ├─> Return: Updated goal
    │
    ▼
[State Management: Update Store]
    │
    ├─> Dispatch: updateProgressSuccess(goal)
    │   ├─> Replace optimistic update with real data
    │   ├─> Update goal in store
    │   └─> Update goal list cache (if applicable)
    │
    ▼
[UI Component: Update View]
    │
    ├─> Update progress bar: progress%
    │
    ├─> Update progress percentage display
    │
    ├─> Add entry to progress history timeline
    │
    ├─> Update type-specific displays:
    │   ├─ Quantitative: currentValue, progress bar
    │   ├─ Milestone: Steps component, milestone status
    │   ├─ Recurring/Habit: Calendar heatmap, streak
    │   └─ etc.
    │
    └─> Show success message (optional)
```

### Batch Update Flow (Multiple Changes)

```
[User: Multiple Progress Updates]
    │
    ▼
[UI: Batch Updates]
    │
    ├─> Collect all updates
    │
    ├─> Optimistic updates to store
    │
    ▼
[Storage Service: Batch Update]
    │
    ├─> Load goal from Local Storage
    │
    ├─> Validate all updates
    │
    ├─> Calculate progress for each date
    │
    ├─> Append all progress entries to progressHistory
    │
    ├─> Recalculate overall progress
    │
    ├─> Save updated goal to Local Storage
    │
    └─> Return updated goal
```

---

## 3. Filter and Search Data Flow

### Components Involved

- **UI Component**: GoalList, FilterPanel, SearchBar
- **State Management**: Goal Store, Filter State
- **Storage Service**: Goal Storage Service
- **Local Storage**: Browser Local Storage (with normalized indexes)
- **Cache**: React Query Cache

### Data Flow Diagram

```
[User: Apply Filters/Search]
    │
    ├─> User selects filters:
    │   ├─ Type: [quantitative, binary]
    │   ├─ Status: [active]
    │   ├─ Priority: [high, medium]
    │   ├─ Category: ["Health"]
    │   ├─ Tags: ["fitness"]
    │   └─ Date range: startDateFrom, deadlineTo
    │
    ├─> User enters search: "weight loss"
    │
    ├─> User selects sort: deadline, ascending
    │
    ▼
[UI Component: Update Filter State]
    │
    ├─> Update local filter state
    │
    ├─> Debounce search input (300ms)
    │
    ├─> Build query parameters
    │
    ▼
[State Management: Update Filters]
    │
    ├─> Dispatch: setFilters(filters)
    │   └─> Store: Update filter state
    │
    ├─> Dispatch: setSearchQuery(query)
    │
    ├─> Dispatch: setSortOptions(sort)
    │
    ▼
[React Query: Check Cache]
    │
    ├─> Build cache key from filters/search/sort
    │
    ├─> Check if data exists in cache
    │   ├─ Found & Fresh → Return cached data
    │   └─ Not found or Stale → Fetch from API
    │
    ▼
[Storage Service: fetchGoals(filters, search, sort)]
    │
    ├─> Load all goals from Local Storage
    │   └─> goals index
    │
    ├─> Apply filters using indexes:
    │   ├─ Use goals_by_type[type] for type filter
    │   ├─ Use goals_by_status[status] for status filter
    │   ├─ Use goals_by_category[category] for category filter
    │   ├─ Use goals_by_tag[tag] for tag filter
    │   └─ Use date range indexes for date filters
    │
    ├─> Intersect filtered arrays to get matching goal IDs
    │
    ├─> Load goal objects for matching IDs
    │
    ├─> Apply text search (in-memory):
    │   ├─ Filter by title/description containing search term
    │   └─ Case-insensitive matching
    │
    ├─> Apply sorting (in-memory):
    │   ├─ Sort by specified field (deadline, createdAt, etc.)
    │   └─ Apply order (asc/desc)
    │
    ├─> Apply pagination:
    │   ├─ Slice array: limit and offset
    │   └─ Calculate hasMore
    │
    ├─> Return: {
    │     goals: Goal[],
    │     total: number,
    │     page: number,
    │     limit: number,
    │     hasMore: boolean
    │   }
    │
    ▼
[Storage Service: Transform Response]
    │
    ├─> Convert dates from ISO strings to Date objects
    │
    ├─> Add computed fields
    │
    ▼
[React Query: Update Cache]
    │
    ├─> Cache results with key
    │
    ├─> Set cache expiration (5 minutes)
    │
    ▼
[State Management: Update Store]
    │
    ├─> Dispatch: setGoals(goals)
    │   └─> Store: Update goals list
    │
    ▼
[UI Component: Render Results]
    │
    ├─> Display filtered goals
    │
    ├─> Show active filter badges
    │
    ├─> Show search term highlighted
    │
    ├─> Show pagination controls
    │
    └─> Show "X results found" message
```

### Cache Invalidation Flow

```
[User: Update Goal]
    │
    ▼
[Goal Updated in Local Storage]
    │
    ▼
[React Query: Invalidate Cache]
    │
    ├─> Invalidate all goal list queries
    │
    ├─> Invalidate specific goal detail query
    │
    ▼
[Next Filter/Search Request]
    │
    └─> Cache miss → Fetch fresh data from Local Storage
```

---

## 4. Milestone Completion Data Flow

### Components Involved

- **UI Component**: MilestoneSteps, GoalDetail
- **State Management**: Goal Store
- **Storage Service**: Goal Storage Service
- **Local Storage**: Browser Local Storage
- **Validation Service**: Dependency Validator

### Data Flow Diagram

```
[User: Complete Milestone]
    │
    ├─> User clicks "Mark Complete" on Milestone 3
    │
    ▼
[UI Component: Validate Client-Side]
    │
    ├─> Check: Dependencies met?
    │   ├─ Milestone 3 depends on: [Milestone 1, Milestone 2]
    │   ├─ Check: Milestone 1 status = 'completed' ✓
    │   ├─ Check: Milestone 2 status = 'completed' ✓
    │   └─ All dependencies met → Continue
    │
    ├─> Check: Sequential completion required?
    │   ├─ If yes: Check previous milestone (order 2) completed
    │   └─ If no: Skip check
    │
    ▼
[Optimistic Update]
    │
    ├─> Dispatch: completeMilestonePending(goalId, milestoneId)
    │   ├─> Update milestone status in store
    │   └─> Recalculate progress optimistically
    │
    ▼
[Storage Service: completeMilestone()]
    │
    ├─> Load goal from Local Storage
    │
    ├─> Find milestone by ID
    │
    ├─> Validate dependencies (client-side):
    │   ├─ Get all milestone dependencies
    │   ├─ Check each dependency status = 'completed'
    │   ├─ If any not completed → Return error
    │   └─ All completed → Continue
    │
    ├─> Validate sequential completion:
    │   ├─ If requireSequentialCompletion = true
    │   ├─ Find previous milestone (order - 1)
    │   ├─ Check previous milestone status = 'completed'
    │   ├─ If not completed → Return error
    │   └─ Completed → Continue
    │
    ├─> Update milestone:
    │   ├─ status: 'pending' → 'completed'
    │   ├─ completedDate: now
    │
    ├─> Recalculate overall progress:
    │   ├─ Count completed milestones
    │   ├─ progress = (completed / total) * 100
    │
    ├─> Check: All milestones completed?
    │   ├─ Yes → Set progress = 100%, suggest completion
    │   └─ No → Continue
    │
    ├─> Update goal:
    │   ├─ progress: new value
    │   ├─ updatedAt: now
    │   └─ milestones: updated array
    │
    ├─> Save updated goal to Local Storage
    │
    ├─> Return: Updated goal
    │
    ▼
[State Management: Update Store]
    │
    ├─> Dispatch: completeMilestoneSuccess(goal)
    │   ├─> Replace optimistic update
    │   ├─> Update goal in store
    │   └─> Update milestone status
    │
    ▼
[UI Component: Update View]
    │
    ├─> Update Steps component:
    │   ├─ Milestone 3 shows as completed
    │   └─ Next milestone (4) enabled
    │
    ├─> Update progress bar: new progress%
    │
    ├─> Update progress percentage
    │
    ├─> If all completed:
    │   └─> Show: "All milestones completed! Mark goal as complete?"
    │
    └─> Show success message
```

### Dependency Validation Flow

```
[Validate Dependencies]
    │
    ├─> Get milestone dependencies: [depId1, depId2]
    │
    ├─> For each dependency:
    │   ├─> Find milestone by depId
    │   ├─> Check: milestone.status === 'completed'
    │   ├─> If not completed:
    │   │   └─> Return error: "Complete {milestone.title} first"
    │   └─> If completed: Continue
    │
    └─> All dependencies met → Allow completion
```

---

## 5. Recurring Goal Occurrence Completion Data Flow

### Components Involved

- **UI Component**: RecurringGoalDetail, CalendarHeatmap
- **State Management**: Goal Store
- **Storage Service**: Goal Storage Service
- **Local Storage**: Browser Local Storage
- **Calculation Service**: Streak Calculator, Completion Stats Calculator

### Data Flow Diagram

```
[User: Mark Occurrence Complete]
    │
    ├─> User clicks "Mark Complete" for today (Monday)
    │
    ▼
[UI Component: Capture Input]
    │
    ├─> Get occurrence date: Today
    │
    ├─> Optional: Get value (e.g., minutes meditated: 10)
    │
    ├─> Optional: Get note
    │
    ▼
[Optimistic Update]
    │
    ├─> Dispatch: markOccurrenceCompletePending(goalId, date)
    │   ├─> Add entry to occurrences array
    │   └─> Update calendar heatmap
    │
    ▼
[Storage Service: markOccurrenceComplete()]
    │
    ├─> Load goal from Local Storage
    │
    ├─> Validate: Goal type is recurring
    │
    ├─> Validate: Date is valid occurrence date
    │   ├─ Check: Date matches recurrence schedule
    │   └─ (Optional: Allow marking past/future dates)
    │
    ├─> Check: Entry already exists for this date?
    │   ├─ Yes → Update existing entry
    │   └─ No → Create new entry
    │
    ├─> Create/Update HabitEntry:
    │   ├─ date: provided date
    │   ├─ completed: true
    │   ├─ value: provided value
    │   └─ note: provided note
    │
    ├─> Recalculate completion stats:
    │   ├─ Get all entries for time period
    │   ├─ Count: totalOccurrences, completedOccurrences
    │   ├─ Calculate: completionRate = (completed / total) * 100
    │
    ├─> Recalculate streak:
    │   ├─ Get entries sorted by date (descending)
    │   ├─ Find last completed entry
    │   ├─ Count consecutive completed days backwards
    │   ├─ Apply grace period if configured
    │   ├─ Update: current streak, longest streak
    │
    ├─> Calculate next occurrence:
    │   ├─ Based on recurrence frequency and interval
    │   └─ Return next occurrence date
    │
    ├─> Update goal:
    │   ├─ occurrences: append/update entry
    │   ├─ completionStats: updated stats
    │   ├─ progress: (completedOccurrences / totalOccurrences) * 100
    │   └─ updatedAt: now
    │
    ├─> Save updated goal to Local Storage
    │
    ├─> Return: Updated goal
    │
    ▼
[State Management: Update Store]
    │
    ├─> Dispatch: markOccurrenceCompleteSuccess(goal)
    │   ├─> Replace optimistic update
    │   ├─> Update goal in store
    │   └─> Update completion stats
    │
    ▼
[UI Component: Update View]
    │
    ├─> Update calendar heatmap:
    │   ├─ Today's date marked as completed
    │   └─ Color intensity based on completion rate
    │
    ├─> Update streak display:
    │   ├─ Current streak: X days
    │   └─ Longest streak: Y days
    │
    ├─> Update completion stats:
    │   ├─ Completion rate: X%
    │   ├─ Completed: X / Y occurrences
    │
    ├─> Update progress bar
    │
    └─> Update next occurrence date
```

### Streak Calculation Details

```
[Calculate Streak]
    │
    ├─> Get all entries, sort by date descending
    │
    ├─> Find last completed entry
    │   ├─ If none → streak = 0
    │   └─ If found → Continue
    │
    ├─> Initialize: streak = 0, checkDate = lastCompletedDate
    │
    ├─> Loop backwards:
    │   ├─> Get entry for checkDate
    │   ├─> If entry.completed === true:
    │   │   ├─> Increment streak
    │   │   └─> checkDate = checkDate - 1 day
    │   ├─> If entry.completed === false:
    │   │   ├─> Check grace period
    │   │   │   ├─ Grace allows → Continue (don't break)
    │   │   │   └─ No grace → BREAK
    │   └─> If no entry (missed day):
    │       ├─> Check grace period
    │       │   ├─ Grace allows → Continue
    │       │   └─ No grace → BREAK
    │
    ├─> Update streak:
    │   ├─ current: calculated streak
    │   ├─ longest: max(current, previous longest)
    │   └─ lastCompletedDate: last completed entry date
```

---

## 6. Data Synchronization Flow

### Components Involved

- **State Management**: Goal Store, React Query
- **Storage Service**: Goal Storage Service
- **Local Storage**: Browser Local Storage
- **Cache**: React Query Cache

### Data Flow Diagram

```
[Application Start]
    │
    ▼
[Load Initial Data]
    │
    ├─> Check React Query cache
    │   ├─ Cache exists & fresh → Use cached data
    │   └─ Cache stale/missing → Fetch from Local Storage
    │
    ├─> Load goals from Local Storage
    │   └─> Load all goals from goals index
    │
    ├─> Populate store with loaded data
    │
    └─> Display goals in UI
    │
[User Interactions]
    │
    ├─> Create/Update/Delete operations
    │   ├─> Optimistic update to store
    │   ├─> Save to Local Storage
    │   ├─> On success: Confirm update
    │   └─> On error: Rollback + show error
    │
    ├─> Filter/Search operations
    │   ├─> Check cache first
    │   ├─> Cache hit → Use cached data
    │   └─> Cache miss → Query Local Storage
    │
[Cache Invalidation]
    │
    ├─> On goal update:
    │   ├─ Invalidate goal detail cache
    │   ├─ Invalidate goal list cache
    │   └─ Trigger refetch if needed
    │
    ├─> On filter change:
    │   └─ Invalidate filtered list cache
    │
[Error Recovery]
    │
    ├─> Storage quota exceeded:
    │   ├─ Show storage limit error
    │   ├─ Suggest exporting/archiving old goals
    │   └─ Allow user to clear space
    │
    ├─> Corrupted data:
    │   ├─ Show data error
    │   ├─ Attempt data recovery
    │   └─ Allow user to reset if needed
    │
    ├─> Storage unavailable:
    │   ├─ Show storage error
    │   ├─ Rollback optimistic updates
    │   └─ Allow user to retry
```

---

## 7. Data Validation Flow

### Components Involved

- **UI Component**: Form components
- **Validation**: Zod schemas (client-side only)
- **Storage Service**: Data validation before storage
- **Local Storage**: Data integrity checks

### Data Flow Diagram

```
[User Input]
    │
    ▼
[Client-Side Validation: Zod Schema]
    │
    ├─> Parse input with Zod schema
    │
    ├─> Validation result:
    │   ├─ Success → Continue to API
    │   └─ Error → Show field errors → User fixes
    │
    ▼
[Storage Service: Prepare Data]
    │
    ├─> Transform data for storage
    │
    ▼
[Client-Side Validation: Zod Schema (Re-validation)]
    │
    ├─> Parse data with Zod schema
    │
    ├─> Validation result:
    │   ├─ Success → Continue to business logic
    │   └─ Error → Return validation error
    │
    ▼
[Business Logic Validation]
    │
    ├─> Validate business rules:
    │   ├─ Dependencies met (for milestones)
    │   ├─ Progress calculations correct
    │   ├─ Status transitions valid
    │   └─ Data integrity checks
    │
    ├─> Validation result:
    │   ├─ Success → Continue to storage
    │   └─ Error → Return validation error
    │
    ▼
[Storage Integrity Checks]
    │
    ├─> Storage-level validation:
    │   ├─ Check for duplicate IDs
    │   ├─ Validate data structure
    │   ├─ Check storage quota
    │   └─ Validate indexes consistency
    │
    ├─> Validation result:
    │   ├─ Success → Data saved
    │   └─ Error → Return storage error
    │
    ▼
[Response]
    │
    ├─> Success: Return created/updated data
    │
    └─> Error: Return error response with details
```

---

## 8. Data Export Flow

### Components Involved

- **UI Component**: ExportButton, ExportDialog
- **Storage Service**: Goal Storage Service
- **Export Service**: File generation (CSV, JSON, PDF)
- **Local Storage**: Source data for export

### Data Flow Diagram

```
[User: Request Export]
    │
    ├─> User clicks "Export Goals" button
    │
    ├─> User selects:
    │   ├─ Format: CSV / JSON / PDF
    │   ├─ Filters: (optional) Apply current filters
    │   └─ Date range: (optional) Specific period
    │
    ▼
[UI Component: Show Export Dialog]
    │
    ├─> Display export options
    │
    ├─> User confirms export
    │
    ▼
[Export Service: exportGoals()]
    │
    ├─> Load goals from Local Storage
    │
    ├─> Apply filters (if provided):
    │   ├─ Filter by type, status, priority, etc.
    │   └─ Filter by date range
    │
    ├─> Generate export file (client-side):
    │   ├─ CSV: Convert goals to CSV format
    │   ├─ JSON: Serialize goals to JSON
    │   └─ PDF: Generate PDF report with charts (using client library)
    │
    ▼
[Browser: Download File]
    │
    ├─> Create Blob from file content
    │
    ├─> Create download link
    │
    ├─> Trigger download
    │
    ├─> File saved to user's downloads folder
    │
    └─> Show success message: "Export downloaded"
```

---

## Data Flow Summary

### Key Patterns

1. **Optimistic Updates**: Update UI immediately, confirm with storage operation
2. **Cache-First**: Check React Query cache before Local Storage reads for performance
3. **Validation Layers**: Client-side validation → Business logic validation → Storage integrity checks
4. **Error Handling**: Rollback optimistic updates, show clear errors
5. **Normalized Storage**: Use indexes for fast filtering and querying
6. **Batch Operations**: Group multiple updates for efficiency

### Performance Considerations

- **Caching**: React Query cache reduces Local Storage reads
- **Normalized Indexes**: Pre-built indexes (by type, status, category, tags) for O(1) filtering
- **In-Memory Operations**: Filtering, searching, and sorting done in-memory after index lookup
- **Debouncing**: Search input debounced to reduce storage queries
- **Lazy Loading**: Load goal details on demand
- **Storage Optimization**: Batch writes, serialize efficiently, minimize storage operations

### Storage Considerations

- **Storage Limits**: Local Storage has ~5-10MB limit (sufficient for thousands of goals)
- **Data Integrity**: Validate data on read/write, maintain index consistency
- **Schema Versioning**: Support data migration for schema changes
- **Error Recovery**: Handle corrupted data gracefully, provide recovery mechanisms
- **XSS Prevention**: Sanitize user inputs before display and storage

---

These data flow specifications should be:

1. **Referenced during development** to ensure correct data handling
2. **Used in code reviews** to verify implementation matches specification
3. **Updated** when data structures or APIs change
4. **Tested** to ensure data flows correctly end-to-end
