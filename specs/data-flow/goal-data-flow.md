# Goal Tracking System - Data Flow Specifications

This document describes how data flows through the system for key operations, including API calls, state management, database operations, and UI updates.

---

## 1. Create Goal Data Flow

### Components Involved
- **UI Component**: CreateGoalForm
- **State Management**: Goal Store (Redux/Zustand)
- **API Service**: Goal API Client
- **Backend API**: POST /api/goals
- **Database**: Goals Collection/Table
- **Validation**: Zod Schema Validation

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
[API Service: createGoal()]
    │
    ├─> Transform data to API format
    │   ├─ Convert dates to ISO strings
    │   ├─ Set defaults (progress: 0, timestamps)
    │   └─ Remove client-only fields
    │
    ▼
[HTTP Request: POST /api/goals]
    │
    ├─> Headers: Authorization, Content-Type
    │
    ├─> Body: {
    │     title: string,
    │     type: GoalType,
    │     status: 'active',
    │     priority: Priority,
    │     category: string,
    │     ...type-specific fields
    │   }
    │
    ▼
[Backend API Handler]
    │
    ├─> Validate with Zod Schema (server-side)
    │   ├─ Invalid → Return 400 with errors
    │   └─ Valid → Continue
    │
    ├─> Authorize: Check user permissions
    │   ├─ Unauthorized → Return 403
    │   └─ Authorized → Continue
    │
    ├─> Generate: id (UUID), createdAt, updatedAt
    │
    ├─> Set defaults:
    │   ├─ progress: 0
    │   ├─ progressHistory: []
    │   ├─ notes: []
    │   ├─ attachments: []
    │   └─ relatedGoals: []
    │
    ▼
[Database: INSERT Goal]
    │
    ├─> Transaction: Insert goal record
    │   ├─ Insert main goal fields
    │   ├─ Insert milestones (if milestone goal)
    │   └─ Insert initial progress entry
    │
    ├─> Return: Created goal with all fields
    │
    ▼
[API Response: 201 Created]
    │
    ├─> Body: {
    │     id: string,
    │     title: string,
    │     ...all goal fields
    │   }
    │
    ▼
[API Service: Transform Response]
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
[API Error]
    │
    ▼
[API Service: Handle Error]
    │
    ├─> Parse error response
    │   ├─ 400: Validation errors → Extract field errors
    │   ├─ 403: Permission denied → Show permission error
    │   ├─ 500: Server error → Show generic error
    │   └─ Network: Timeout/offline → Show network error
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

**Client → API:**
- Dates: `Date` → ISO string
- Enums: TypeScript enum → string
- Optional fields: `undefined` → omitted

**API → Client:**
- Dates: ISO string → `Date`
- Enums: string → TypeScript enum
- Defaults: Applied if missing

---

## 2. Update Progress Data Flow

### Components Involved
- **UI Component**: ProgressUpdateForm / GoalDetail
- **State Management**: Goal Store
- **API Service**: Goal API Client
- **Backend API**: PATCH /api/goals/:id/progress
- **Database**: Goals Collection, ProgressHistory Collection
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
[API Service: updateProgress()]
    │
    ├─> Prepare request:
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
[HTTP Request: PATCH /api/goals/:id/progress]
    │
    ├─> Body: {
    │     progress: number,
    │     currentValue?: number,  // for quantitative
    │     currentCount?: number,  // for binary
    │     milestoneId?: string,   // for milestone
    │     entryDate?: Date,       // for recurring/habit
    │     progressEntry: {
    │       date: Date,
    │       value: number,
    │       note?: string
    │     }
    │   }
    │
    ▼
[Backend API Handler]
    │
    ├─> Load goal from database
    │
    ├─> Validate update:
    │   ├─ Check user permissions
    │   ├─ Validate progress value (0-100)
    │   ├─ Validate type-specific fields
    │   └─ Check dependencies (for milestones)
    │
    ├─> Recalculate progress (server-side validation)
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
    ▼
[Database: UPDATE Goal + INSERT ProgressEntry]
    │
    ├─> Transaction:
    │   ├─ UPDATE goals SET progress=?, currentValue=?, updatedAt=?
    │   └─ INSERT INTO progress_history (goalId, date, value, note)
    │
    ├─> Return: Updated goal
    │
    ▼
[API Response: 200 OK]
    │
    ├─> Body: {
    │     ...updated goal with new progress
    │   }
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
[API: Batch Request]
    │
    ├─> POST /api/goals/:id/progress/batch
    │   Body: {
    │     updates: [
    │       { date, value, note },
    │       { date, value, note },
    │       ...
    │     ]
    │   }
    │
    ▼
[Backend: Process Batch]
    │
    ├─> Validate all updates
    │
    ├─> Calculate progress for each date
    │
    ├─> Insert all progress entries
    │
    ├─> Recalculate overall progress
    │
    └─> Return updated goal
```

---

## 3. Filter and Search Data Flow

### Components Involved
- **UI Component**: GoalList, FilterPanel, SearchBar
- **State Management**: Goal Store, Filter State
- **API Service**: Goal API Client
- **Backend API**: GET /api/goals (with query params)
- **Database**: Goals Collection (with indexes)
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
[API Service: fetchGoals(filters, search, sort)]
    │
    ├─> Build query string:
    │   ?type=quantitative,binary
    │   &status=active
    │   &priority=high,medium
    │   &category=Health
    │   &tags=fitness
    │   &startDateFrom=2024-01-01
    │   &deadlineTo=2024-12-31
    │   &search=weight%20loss
    │   &sort=deadline
    │   &order=asc
    │   &page=1
    │   &limit=20
    │
    ▼
[HTTP Request: GET /api/goals]
    │
    ├─> Headers: Authorization
    │
    ├─> Query Parameters: (as above)
    │
    ▼
[Backend API Handler]
    │
    ├─> Parse query parameters
    │
    ├─> Build database query:
    │   ├─ WHERE clauses from filters
    │   ├─ Full-text search on title/description
    │   ├─ ORDER BY from sort options
    │   └─ LIMIT/OFFSET from pagination
    │
    ├─> Use indexes:
    │   ├─ Index on: type, status, priority
    │   ├─ Index on: category, tags
    │   ├─ Index on: deadline, createdAt
    │   └─ Full-text index on: title, description
    │
    ▼
[Database: Execute Query]
    │
    ├─> SELECT goals WHERE ...
    │   AND (title LIKE '%weight loss%' OR description LIKE '%weight loss%')
    │   ORDER BY deadline ASC
    │   LIMIT 20 OFFSET 0
    │
    ├─> Return: Goals array + total count
    │
    ▼
[API Response: 200 OK]
    │
    ├─> Body: {
    │     goals: Goal[],
    │     total: number,
    │     page: number,
    │     limit: number,
    │     hasMore: boolean
    │   }
    │
    ▼
[API Service: Transform Response]
    │
    ├─> Convert dates
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
[Goal Updated in Database]
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
    └─> Cache miss → Fetch fresh data from API
```

---

## 4. Milestone Completion Data Flow

### Components Involved
- **UI Component**: MilestoneSteps, GoalDetail
- **State Management**: Goal Store
- **API Service**: Goal API Client
- **Backend API**: PATCH /api/goals/:id/milestones/:milestoneId
- **Database**: Goals Collection, Milestones nested/related table
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
[API Service: completeMilestone()]
    │
    ├─> Prepare request:
    │   ├─ goalId: string
    │   ├─ milestoneId: string
    │   └─ status: 'completed'
    │
    ▼
[HTTP Request: PATCH /api/goals/:id/milestones/:milestoneId]
    │
    ├─> Body: {
    │     status: 'completed',
    │     completedDate: Date
    │   }
    │
    ▼
[Backend API Handler]
    │
    ├─> Load goal from database
    │
    ├─> Find milestone by ID
    │
    ├─> Validate dependencies (server-side):
    │   ├─ Get all milestone dependencies
    │   ├─ Check each dependency status = 'completed'
    │   ├─ If any not completed → Return 400 error
    │   └─ All completed → Continue
    │
    ├─> Validate sequential completion:
    │   ├─ If requireSequentialCompletion = true
    │   ├─ Find previous milestone (order - 1)
    │   ├─ Check previous milestone status = 'completed'
    │   ├─ If not completed → Return 400 error
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
    ▼
[Database: UPDATE Goal]
    │
    ├─> Transaction:
    │   ├─ UPDATE goals SET progress=?, updatedAt=?, milestones=?
    │   └─ (or UPDATE milestones table if separate)
    │
    ├─> Return: Updated goal
    │
    ▼
[API Response: 200 OK]
    │
    ├─> Body: {
    │     ...updated goal with milestone completed
    │   }
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
- **API Service**: Goal API Client
- **Backend API**: POST /api/goals/:id/occurrences
- **Database**: Goals Collection, HabitEntries/Occurrences Collection
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
[API Service: markOccurrenceComplete()]
    │
    ├─> Prepare request:
    │   ├─ goalId: string
    │   ├─ entry: {
    │   │     date: Date,
    │   │     completed: true,
    │   │     value?: number,
    │   │     note?: string
    │   │   }
    │
    ▼
[HTTP Request: POST /api/goals/:id/occurrences]
    │
    ├─> Body: {
    │     date: "2024-01-15T00:00:00Z",
    │     completed: true,
    │     value: 10,
    │     note: "Morning meditation"
    │   }
    │
    ▼
[Backend API Handler]
    │
    ├─> Load goal from database
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
    ▼
[Database: UPDATE Goal + INSERT/UPDATE Entry]
    │
    ├─> Transaction:
    │   ├─ INSERT/UPDATE habit_entries
    │   └─ UPDATE goals SET completionStats=?, progress=?, updatedAt=?
    │
    ├─> Return: Updated goal
    │
    ▼
[API Response: 200 OK]
    │
    ├─> Body: {
    │     ...updated goal with new occurrence and stats
    │   }
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
- **API Service**: Goal API Client
- **Backend API**: Various endpoints
- **WebSocket/SSE**: Real-time updates (optional)
- **Cache**: React Query Cache, Local Storage

### Data Flow Diagram

```
[Application Start]
    │
    ▼
[Load Initial Data]
    │
    ├─> Check React Query cache
    │   ├─ Cache exists & fresh → Use cached data
    │   └─ Cache stale/missing → Fetch from API
    │
    ├─> Fetch goals from API
    │   └─> GET /api/goals?limit=50
    │
    ├─> Populate store with fetched data
    │
    └─> Display goals in UI
    │
[User Interactions]
    │
    ├─> Create/Update/Delete operations
    │   ├─> Optimistic update to store
    │   ├─> API call
    │   ├─> On success: Confirm update
    │   └─> On error: Rollback + show error
    │
    ├─> Filter/Search operations
    │   ├─> Check cache first
    │   ├─> Cache hit → Use cached data
    │   └─> Cache miss → Fetch from API
    │
[Background Sync]
    │
    ├─> React Query: Auto-refetch on:
    │   ├─ Window focus
    │   ├─ Network reconnect
    │   └─ Stale time expiration (5 minutes)
    │
    ├─> WebSocket/SSE (optional):
    │   ├─ Listen for goal updates from other users
    │   ├─ Receive real-time notifications
    │   └─ Update store automatically
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
    ├─> Network error:
    │   ├─ Show offline indicator
    │   ├─ Queue operations for retry
    │   └─ Retry on reconnect
    │
    ├─> API error:
    │   ├─ Show error message
    │   ├─ Rollback optimistic updates
    │   └─ Allow user to retry
```

---

## 7. Data Validation Flow

### Components Involved
- **UI Component**: Form components
- **Validation**: Zod schemas (client + server)
- **API Service**: Request validation
- **Backend API**: Server-side validation
- **Database**: Constraints

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
[API Request]
    │
    ├─> Transform data to API format
    │
    ▼
[Server-Side Validation: Zod Schema]
    │
    ├─> Parse request body with Zod schema
    │
    ├─> Validation result:
    │   ├─ Success → Continue to business logic
    │   └─ Error → Return 400 with error details
    │
    ▼
[Business Logic Validation]
    │
    ├─> Validate business rules:
    │   ├─ Dependencies met (for milestones)
    │   ├─ Progress calculations correct
    │   ├─ Status transitions valid
    │   └─ Permissions checked
    │
    ├─> Validation result:
    │   ├─ Success → Continue to database
    │   └─ Error → Return 400/403 with error message
    │
    ▼
[Database Constraints]
    │
    ├─> Database-level validation:
    │   ├─ Foreign key constraints
    │   ├─ Unique constraints
    │   ├─ Check constraints
    │   └─ Not null constraints
    │
    ├─> Validation result:
    │   ├─ Success → Data saved
    │   └─ Error → Return 500 with error details
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
- **API Service**: Export API Client
- **Backend API**: GET /api/goals/export
- **File Service**: File generation (CSV, JSON, PDF)

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
[API Service: exportGoals()]
    │
    ├─> Prepare request:
    │   ├─ format: 'csv' | 'json' | 'pdf'
    │   ├─ filters: (optional) Current filter state
    │   └─ dateRange: (optional) { from, to }
    │
    ▼
[HTTP Request: GET /api/goals/export]
    │
    ├─> Query params:
    │   ?format=csv
    │   &type=quantitative,binary
    │   &status=active,completed
    │   &from=2024-01-01
    │   &to=2024-12-31
    │
    ▼
[Backend API Handler]
    │
    ├─> Load goals matching filters
    │
    ├─> Generate export file:
    │   ├─ CSV: Convert goals to CSV format
    │   ├─ JSON: Serialize goals to JSON
    │   └─ PDF: Generate PDF report with charts
    │
    ├─> Set response headers:
    │   ├─ Content-Type: text/csv, application/json, application/pdf
    │   └─ Content-Disposition: attachment; filename="goals-export.csv"
    │
    ▼
[API Response: 200 OK]
    │
    ├─> Body: File content (binary or text)
    │
    ▼
[Browser: Download File]
    │
    ├─> Browser triggers download
    │
    ├─> File saved to user's downloads folder
    │
    └─> Show success message: "Export downloaded"
```

---

## Data Flow Summary

### Key Patterns

1. **Optimistic Updates**: Update UI immediately, confirm with API response
2. **Cache-First**: Check cache before API calls for performance
3. **Validation Layers**: Client-side → Server-side → Database constraints
4. **Error Handling**: Rollback optimistic updates, show clear errors
5. **Real-time Sync**: Background refetching, optional WebSocket updates
6. **Batch Operations**: Group multiple updates for efficiency

### Performance Considerations

- **Caching**: React Query cache reduces API calls
- **Pagination**: Limit data transfer for large lists
- **Indexing**: Database indexes speed up filtered queries
- **Debouncing**: Search input debounced to reduce API calls
- **Lazy Loading**: Load goal details on demand

### Security Considerations

- **Authentication**: All API calls require auth token
- **Authorization**: Server validates user permissions
- **Input Validation**: Both client and server validate inputs
- **SQL Injection**: Parameterized queries prevent injection
- **XSS Prevention**: Sanitize user inputs before display

---

These data flow specifications should be:
1. **Referenced during development** to ensure correct data handling
2. **Used in code reviews** to verify implementation matches specification
3. **Updated** when data structures or APIs change
4. **Tested** to ensure data flows correctly end-to-end

