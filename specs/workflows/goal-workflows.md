# Goal Tracking System - Workflow Charts

This document contains detailed workflow charts for key user journeys and system processes in the Goals Tracking Management System.

---

## Workflow 1: Create and Track Quantitative Goal

### Actors
- User

### Preconditions
- User is authenticated
- User has access to goal creation

### Main Flow
1. User navigates to "Create Goal" page
2. User selects goal type: "Quantitative"
3. System displays quantitative-specific form fields
4. User enters:
   - Title: "Lose 20 pounds"
   - Description: "Weight loss goal"
   - Category: "Health"
   - Priority: "High"
   - Start Value: 200
   - Target Value: 180
   - Current Value: 200
   - Unit: "pounds"
   - Allow Decimals: No
5. User optionally sets:
   - Start Date: Today
   - Deadline: 6 months from now
6. User clicks "Create Goal"
7. System validates all fields
8. System creates goal with:
   - Progress: 0%
   - Status: "active"
   - Generated ID, timestamps
9. System saves goal to database
10. System redirects to goal detail page
11. User views goal with progress bar showing 0%

### Alternative Flows

#### A1: Validation Error
- At step 7, if validation fails:
  - System displays field-level errors
  - User fixes errors
  - User resubmits form
  - Flow continues from step 7

#### A2: API Error
- At step 9, if API call fails:
  - System displays error message
  - User can retry or cancel
  - If retry: Flow continues from step 6
  - If cancel: Flow ends

### Postconditions
- Goal created in database
- Goal visible in user's goal list
- Goal detail page accessible

---

## Workflow 2: Update Progress for Quantitative Goal

### Actors
- User

### Preconditions
- Goal exists and is active
- User has permission to update goal

### Main Flow
1. User navigates to goal detail page
2. User views current progress: 15% (currentValue: 197)
3. User clicks "Update Progress" button
4. System displays progress update form
5. User enters new currentValue: 195
6. User optionally adds note: "Weekly weigh-in"
7. User clicks "Save"
8. System validates:
   - currentValue is within min/max (if set)
   - currentValue matches allowDecimals setting
9. System calculates new progress: ((195 - 200) / (180 - 200)) * 100 = 25%
10. System creates progress history entry:
    - Date: Today
    - Value: 25%
    - Note: "Weekly weigh-in"
11. System updates goal:
    - currentValue: 195
    - progress: 25%
    - updatedAt: Now
12. System saves to database
13. System updates UI:
    - Progress bar shows 25%
    - Progress percentage displays "25%"
    - Progress history shows new entry
14. User sees updated progress

### Alternative Flows

#### A1: Invalid Value
- At step 8, if validation fails:
  - System displays error message
  - User corrects value
  - Flow continues from step 5

#### A2: Value Exceeds Target
- At step 9, if currentValue >= targetValue:
  - System calculates progress: 100%
  - System suggests: "Goal target reached! Mark as complete?"
  - If user confirms: Follow "Complete Goal" workflow
  - If user declines: Continue with progress = 100%

### Postconditions
- Goal progress updated
- Progress history entry created
- UI reflects new progress

---

## Workflow 3: Create and Complete Milestone Goal

### Actors
- User

### Preconditions
- User is authenticated

### Main Flow
1. User creates milestone goal: "Launch Mobile App"
2. User adds milestones:
   - Milestone 1: "Design UI/UX" (order: 1)
   - Milestone 2: "Develop Backend API" (order: 2, depends on: Milestone 1)
   - Milestone 3: "Build Mobile App" (order: 3, depends on: Milestone 2)
   - Milestone 4: "Testing & QA" (order: 4, depends on: Milestone 3)
   - Milestone 5: "App Store Submission" (order: 5, depends on: Milestone 4)
3. User sets: requireSequentialCompletion = true
4. User saves goal
5. System creates goal with progress: 0%
6. User navigates to goal detail page
7. System displays milestones using Ant Design Steps component
8. All milestones show status: "pending"
9. User completes Milestone 1:
    - User clicks "Mark Complete" on Milestone 1
    - System validates: No dependencies (first milestone)
    - System updates: Milestone 1 status = "completed", completedDate = Now
    - System calculates progress: (1/5) * 100 = 20%
    - System updates UI: Milestone 1 shows as completed
10. User completes Milestone 2:
    - User clicks "Mark Complete" on Milestone 2
    - System validates: Milestone 1 is completed (dependency met)
    - System validates: Sequential order maintained
    - System updates: Milestone 2 status = "completed"
    - System calculates progress: (2/5) * 100 = 40%
11. User continues completing milestones 3, 4, 5
12. After Milestone 5 completion:
    - System calculates progress: (5/5) * 100 = 100%
    - System suggests: "All milestones completed! Mark goal as complete?"
13. User confirms completion
14. System updates goal status to "completed"
15. System sets completedDate
16. Goal shows as completed

### Alternative Flows

#### A1: Try to Skip Milestone
- At step 10, if user tries to complete Milestone 3 before Milestone 2:
  - System validates: Milestone 2 not completed
  - System shows error: "Complete milestones in order. Milestone 2 must be completed first."
  - User cannot complete Milestone 3
  - Flow continues from step 9

#### A2: Dependency Not Met
- At step 10, if Milestone 1 was not completed:
  - System validates: Dependency not met
  - System shows error: "Complete Milestone 1 first"
  - User completes Milestone 1
  - Flow continues from step 9

### Postconditions
- All milestones completed
- Goal marked as completed
- Progress shows 100%

---

## Workflow 4: Track Daily Habit Goal

### Actors
- User

### Preconditions
- Habit goal exists: "Daily Meditation"
- Goal is active
- targetFrequency: "daily"

### Main Flow
1. User navigates to habit goal detail page
2. System displays:
   - Calendar heatmap showing past completions
   - Current streak: 5 days
   - Habit strength: 75%
   - Completion rate: 85%
3. User views today's entry (not yet completed)
4. User completes 10-minute meditation
5. User clicks "Mark Complete" for today
6. System creates HabitEntry:
   - date: Today
   - completed: true
   - value: 10 (optional, minutes)
7. System updates completionStats:
   - Increment completedOccurrences
   - Recalculate completionRate
   - Update streak: current = 6
8. System calculates habitStrength:
   - Consistency (last 30 days): 90% → 36 points
   - Current streak: 6 days → 18 points
   - Completion rate: 86% → 17.2 points
   - Recency: 100% → 10 points
   - Total: 81.2 → habitStrength = 81
9. System updates progress: (completedDays / totalDays) * 100
10. System updates UI:
    - Today's date marked as completed in calendar
    - Streak counter: 6 days
    - Habit strength: 81%
    - Progress updated
11. User sees updated habit tracking

### Alternative Flows

#### A1: Miss a Day
- User doesn't complete habit on Day 7:
  - System creates HabitEntry: completed = false
  - System checks grace period:
    - If grace period = 0: Streak breaks, current = 0
    - If grace period = 1: Streak continues, current = 6
  - System updates habitStrength (lower due to missed day)
  - Calendar shows missed day
  - Flow continues next day

#### A2: Break Streak
- If grace period = 0 and user misses day:
  - System resets current streak to 0
  - System preserves longest streak (if current was longer)
  - System shows message: "Streak broken. Start a new one!"
  - User can continue tracking

### Postconditions
- Habit entry created for today
- Streak updated
- Habit strength recalculated
- Calendar heatmap updated

---

## Workflow 5: Filter and Search Goals

### Actors
- User

### Preconditions
- User has multiple goals (various types, statuses, priorities)
- User is on goals list page

### Main Flow
1. User views goals list (shows all goals)
2. User wants to find active high-priority quantitative goals
3. User applies filters:
   - Type: "Quantitative" (checkbox selected)
   - Status: "Active" (checkbox selected)
   - Priority: "High" (checkbox selected)
4. System filters goals:
   - Keep only quantitative goals
   - Keep only active goals
   - Keep only high priority goals
5. System displays filtered list (e.g., 5 goals match)
6. User wants to search within filtered results
7. User enters search term: "weight"
8. System searches in title and description (case-insensitive)
9. System filters results: Keep only goals with "weight" in title/description
10. System displays filtered and searched results (e.g., 2 goals match)
11. User wants to sort by deadline
12. User selects sort: "Deadline" → "Ascending"
13. System sorts results by deadline (earliest first)
14. System displays sorted list
15. User views filtered, searched, sorted goals

### Alternative Flows

#### A1: No Results
- At step 5, if no goals match filters:
  - System displays: "No goals match your filters"
  - System shows "Clear Filters" button
  - User can adjust filters or clear all

#### A2: Clear Filters
- User clicks "Clear All Filters"
- System removes all filters
- System displays all goals again
- Flow continues from step 1

### Postconditions
- Goals list shows filtered, searched, sorted results
- Active filters displayed as badges
- User can further refine or clear filters

---

## Workflow 6: Complete Recurring Goal Occurrence

### Actors
- User

### Preconditions
- Recurring goal exists: "Weekly Team Meeting"
- Recurrence: Weekly, every Monday
- Goal is active

### Main Flow
1. User navigates to recurring goal detail page
2. System displays:
   - Next occurrence: Next Monday
   - Completion stats: 8/10 completed (80%)
   - Current streak: 3 weeks
   - Calendar heatmap showing past completions
3. Today is Monday (occurrence day)
4. User attends team meeting
5. User clicks "Mark Complete" for today's occurrence
6. System creates HabitEntry:
   - date: Today (Monday)
   - completed: true
7. System updates completionStats:
   - Increment completedOccurrences: 8 → 9
   - Recalculate completionRate: (9/10) * 100 = 90%
   - Update streak: current = 4 weeks
8. System calculates next occurrence:
   - Next Monday (7 days from today)
9. System updates progress: 90%
10. System updates UI:
    - Today's date marked in calendar
    - Completion rate: 90%
    - Streak: 4 weeks
    - Next occurrence: Next Monday
11. Goal remains active (recurring goal doesn't complete)
12. User sees updated statistics

### Alternative Flows

#### A1: Miss Occurrence
- User doesn't complete occurrence on Monday:
  - System creates HabitEntry: completed = false
  - System updates completionStats:
    - totalOccurrences increments
    - completionRate decreases
    - Streak breaks (if no grace period)
  - System calculates next occurrence: Following Monday
  - Calendar shows missed occurrence
  - Flow continues

#### A2: Recurrence Ends
- If endDate is set and passed:
  - System calculates: No more occurrences
  - System suggests: "Recurrence period ended. Mark goal as complete?"
  - If user confirms: Goal status → "completed"
  - If user declines: Goal remains active

### Postconditions
- Occurrence marked as completed
- Completion stats updated
- Streak updated
- Next occurrence calculated
- Goal remains active

---

## Workflow 7: Pause and Resume Goal

### Actors
- User

### Preconditions
- Goal exists and is active
- Goal has progress: 45%

### Main Flow
1. User navigates to goal detail page
2. User views active goal with 45% progress
3. User needs to pause goal (e.g., going on vacation)
4. User clicks "Pause Goal" button
5. System shows confirmation: "Pause this goal? Progress will be preserved."
6. User confirms
7. System updates goal:
   - status: "active" → "paused"
   - updatedAt: Now
   - All other data preserved (progress, values, etc.)
8. System pauses deadline countdown (if applicable)
9. System saves to database
10. System updates UI:
    - Status badge shows "Paused"
    - Deadline countdown paused
    - "Resume Goal" button appears
11. User sees goal is paused

### Resume Flow
12. User returns from vacation
13. User navigates to paused goal
14. User clicks "Resume Goal" button
15. System updates goal:
    - status: "paused" → "active"
    - updatedAt: Now
16. System resumes deadline countdown (if applicable)
17. System saves to database
18. System updates UI:
    - Status badge shows "Active"
    - Deadline countdown resumes
    - "Pause Goal" button appears again
19. User continues working on goal

### Alternative Flows

#### A1: Cancel Pause
- At step 6, if user cancels:
  - System does not change status
  - Goal remains active
  - Flow ends

#### A2: Pause Completed Goal
- User tries to pause completed goal:
  - System shows error: "Cannot pause completed goals"
  - Action prevented
  - Flow ends

### Postconditions
- Goal status changed to paused/resumed
- All data preserved
- Deadline countdown paused/resumed accordingly

---

## Workflow 8: Add Note and Attachment to Goal

### Actors
- User

### Preconditions
- Goal exists
- User has permission to modify goal

### Main Flow
1. User navigates to goal detail page
2. User views "Notes" section
3. User wants to add a note
4. User clicks "Add Note" button
5. System displays note input form
6. User enters note content: "Had a great workout today, feeling motivated!"
7. User optionally adds tags: ["motivation", "workout"]
8. User clicks "Save Note"
9. System validates: Content is 1-5000 characters
10. System creates Note:
    - id: Generated UUID
    - content: User's note
    - createdAt: Now
    - updatedAt: Now
    - createdBy: Current user
    - tags: ["motivation", "workout"]
11. System adds note to goal.notes array
12. System saves to database
13. System updates UI: Note appears in notes list
14. User views added note

### Attachment Flow
15. User wants to attach a file (e.g., progress photo)
16. User clicks "Attach File" button
17. System displays file upload dialog
18. User selects file: "progress-photo.jpg" (2MB)
19. System validates:
    - File type: Allowed (image)
    - File size: < 10MB ✓
20. System uploads file to storage
21. System creates Attachment:
    - id: Generated UUID
    - filename: "progress-photo.jpg"
    - url: Storage URL
    - mimeType: "image/jpeg"
    - size: 2097152 bytes
    - uploadedAt: Now
    - uploadedBy: Current user
22. System adds attachment to goal.attachments array
23. System saves to database
24. System updates UI: Attachment appears in attachments list
25. User can click attachment to view/download

### Alternative Flows

#### A1: Invalid File
- At step 19, if file validation fails:
  - System shows error: "File type not allowed" or "File too large"
  - User selects different file
  - Flow continues from step 18

#### A2: Upload Error
- At step 20, if upload fails:
  - System shows error: "Upload failed. Please try again."
  - User can retry or cancel
  - If retry: Flow continues from step 18

### Postconditions
- Note added to goal
- Attachment added to goal (if uploaded)
- UI updated to show new note/attachment

---

## Workflow 9: Link Related Goals

### Actors
- User

### Preconditions
- User has multiple goals
- Goal A exists: "Lose Weight"
- Goal B exists: "Exercise Daily"

### Main Flow
1. User navigates to Goal A detail page
2. User views "Related Goals" section (currently empty)
3. User wants to link Goal B as related
4. User clicks "Add Related Goal" button
5. System displays goal search/select dialog
6. User searches for "Exercise"
7. System shows matching goals: Goal B appears
8. User selects Goal B
9. System validates:
    - Goal B exists ✓
    - Goal B is not Goal A ✓ (prevent self-linking)
10. System adds Goal B ID to Goal A.relatedGoals array
11. System saves Goal A to database
12. System updates UI:
    - Goal B appears in related goals list
    - Shows Goal B title, status, progress
    - Clickable link to Goal B detail page
13. User views related goal link

### Bidirectional Linking (Optional)
14. If bidirectional linking enabled:
    - System also adds Goal A ID to Goal B.relatedGoals array
    - System saves Goal B to database
    - Both goals show each other as related

### Alternative Flows

#### A1: Self-Linking Attempt
- At step 9, if user tries to link goal to itself:
  - System shows error: "A goal cannot be related to itself"
  - Action prevented
  - Flow ends

#### A2: Goal Not Found
- At step 7, if no goals match search:
  - System shows: "No goals found"
  - User can adjust search or cancel
  - Flow continues from step 6

### Unlink Flow
15. User wants to remove related goal link
16. User clicks "Remove" next to Goal B in related goals list
17. System shows confirmation: "Remove this relationship?"
18. User confirms
19. System removes Goal B ID from Goal A.relatedGoals array
20. System saves to database
21. System updates UI: Goal B removed from related goals list

### Postconditions
- Goals linked (or unlinked)
- Related goals section updated
- Relationship visible on both goals (if bidirectional)

---

## Workflow 10: Archive and Unarchive Goal

### Actors
- User

### Preconditions
- Goal exists and is completed
- Goal is not archived

### Main Flow
1. User navigates to completed goal detail page
2. User views goal marked as "Completed"
3. User wants to archive goal to clean up active list
4. User clicks "Archive Goal" button
5. System shows confirmation: "Archive this goal? It will be hidden from default views."
6. User confirms
7. System updates goal:
    - archived: false → true
    - updatedAt: Now
8. System saves to database
9. System updates UI:
    - Goal removed from active goals list
    - "Archived" badge shown if viewing archived goals
10. User navigates to goals list
11. System filters out archived goals by default
12. User sees only active/non-archived goals

### View Archived Flow
13. User wants to view archived goals
14. User clicks "Show Archived" toggle/filter
15. System includes archived goals in query
16. System displays archived goals list
17. User views archived goal with "Archived" badge

### Unarchive Flow
18. User wants to restore archived goal
19. User navigates to archived goal detail page
20. User clicks "Unarchive Goal" button
21. System updates goal:
    - archived: true → false
    - updatedAt: Now
22. System saves to database
23. System updates UI:
    - "Archived" badge removed
    - Goal appears in active goals list again
24. User sees goal restored

### Alternative Flows

#### A1: Archive Active Goal
- At step 4, if goal is still active:
    - System shows warning: "This goal is still active. Archive anyway?"
    - User can confirm or cancel
    - If confirmed: Goal archived (status remains active)
    - If cancelled: Action prevented

### Postconditions
- Goal archived/unarchived
- Goal visibility updated in lists
- Archived status persisted

---

## Workflow Summary

These workflows cover the primary user journeys:
1. **Goal Creation**: Creating goals of different types
2. **Progress Tracking**: Updating progress for various goal types
3. **Milestone Management**: Completing milestones with dependencies
4. **Habit Tracking**: Daily habit completion and streak management
5. **Filtering/Searching**: Finding specific goals
6. **Recurring Goals**: Tracking recurring occurrences
7. **Status Management**: Pausing and resuming goals
8. **Content Management**: Adding notes and attachments
9. **Relationships**: Linking related goals
10. **Organization**: Archiving completed goals

Each workflow includes:
- Clear step-by-step process
- Alternative flows for error cases
- Preconditions and postconditions
- System validations and updates
- UI state changes

These workflows should be:
- **Implemented** as described in the application
- **Tested** through E2E tests
- **Documented** in user guides
- **Updated** when features change

