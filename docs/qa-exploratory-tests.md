# QA Exploratory Testing Guide

## Purpose

This guide provides test scenarios, dummy data, and expected results for exploratory testing of the Momentum Goal Tracking System. Use this document to manually verify all features work as expected.

---

## How to Use This Guide

1. **Set up test environment**: Clear browser localStorage or use incognito mode
2. **Follow test scenarios**: Execute each step in order
3. **Use provided dummy data**: Copy/paste JSON into dev tools or form fields
4. **Verify expected results**: Check that outcomes match documented expectations
5. **Test edge cases**: Try boundary conditions and error scenarios

---

## Testing Quick Reference

| Goal Type    | Key Feature      | Test Focus                |
| ------------ | ---------------- | ------------------------- |
| Quantitative | Numeric progress | Value calculations, units |
| Qualitative  | Self-assessment  | Rating scale, status flow |
| Binary       | Yes/No or count  | Completion toggle         |
| Milestone    | Multi-step       | Dependencies, ordering    |
| Recurring    | Repeating tasks  | Streaks, intervals        |
| Habit        | Daily routines   | Frequency, streaks        |

---

## 1. Quantitative Goals

### What It Is

Numeric tracking with start/target values (e.g., weight loss, distance run, books read).

### Test Scenarios

#### 1.1 Create Quantitative Goal

1. Click "Create Goal" button
2. Select "Quantitative" as goal type
3. Fill in required fields with dummy data
4. Click "Create Goal"
5. Verify goal appears in list

**Expected Results:**

- Goal created with 0% progress
- Current value equals start value
- Progress calculates correctly based on current vs target

#### 1.2 Update Progress

1. Open goal detail page
2. Click "Update Progress"
3. Enter new current value
4. Save changes
5. Verify progress percentage updates

**Expected Results:**

- Progress = ((currentValue - startValue) / (targetValue - startValue)) \* 100
- Progress history entry created with timestamp
- Goal auto-completes when progress reaches 100% (if allowOverAchievement is false)

#### 1.3 Test Over-Achievement

1. Create quantitative goal with allowOverAchievement: true
2. Update current value beyond target
3. Verify progress exceeds 100%

**Expected Results:**

- Progress can exceed 100%
- Celebrations trigger appropriately

### Dummy Data

```json
{
  "type": "quantitative",
  "title": "Lose Weight",
  "description": "Target weight for health improvement",
  "priority": "high",
  "category": "Health",
  "tags": ["weight", "fitness", "health"],
  "startDate": "2025-01-01",
  "deadline": "2025-12-31",
  "startValue": 200,
  "targetValue": 170,
  "currentValue": 200,
  "unit": "lbs",
  "allowDecimals": true,
  "allowOverAchievement": false,
  "minValue": 50,
  "maxValue": 500
}
```

```json
{
  "type": "quantitative",
  "title": "Read Books",
  "description": "Read 24 books in 2025",
  "priority": "medium",
  "category": "Personal Development",
  "tags": ["reading", "books"],
  "startDate": "2025-01-01",
  "deadline": "2025-12-31",
  "startValue": 0,
  "targetValue": 24,
  "currentValue": 0,
  "unit": "books",
  "allowDecimals": false,
  "allowOverAchievement": true
}
```

```json
{
  "type": "quantitative",
  "title": "Run Marathon Training",
  "description": "Build up to 26.2 mile run",
  "priority": "high",
  "category": "Fitness",
  "tags": ["running", "marathon"],
  "startDate": "2025-03-01",
  "deadline": "2025-10-01",
  "startValue": 0,
  "targetValue": 26.2,
  "currentValue": 5.5,
  "unit": "miles",
  "allowDecimals": true,
  "allowOverAchievement": false,
  "minValue": 0,
  "maxValue": 50
}
```

### Edge Cases

| Scenario            | Test Steps                             | Expected Result                  |
| ------------------- | -------------------------------------- | -------------------------------- |
| Target equals start | Set both to 100                        | Goal auto-completes              |
| Negative progress   | Set target < start (e.g., weight loss) | Progress calculates as reduction |
| Decimal precision   | Use 3+ decimal places                  | Values round appropriately       |
| Zero target         | targetValue: 0                         | Validation error                 |
| Min > Max           | Set minValue > maxValue                | Validation error                 |

---

## 2. Qualitative Goals

### What It Is

Status-based or self-assessment ratings (1-10 scale) for goals like "Improve public speaking" or "Learn a new skill".

### Test Scenarios

#### 2.1 Create Qualitative Goal

1. Click "Create Goal" → Select "Qualitative"
2. Fill in title, targetRating, qualitativeStatus
3. Create goal
4. Verify in list

**Expected Results:**

- Initial status defaults to "not_started"
- Progress = 0% for not_started, 50% for in_progress, 100% for completed

#### 2.2 Add Self-Assessment

1. Open qualitative goal
2. Click "Add Self-Assessment"
3. Rate yourself (1-10)
4. Add optional notes
5. Save

**Expected Results:**

- Self-assessment appears in history
- Average of recent assessments shown
- Progress can auto-calculate based on targetRating

#### 2.3 Status Transition

1. Create goal with status "not_started"
2. Update to "in_progress"
3. Update to "completed"

**Expected Results:**

- Progress updates: 0% → 50% → 100%
- completedDate set when status becomes "completed"

### Dummy Data

```json
{
  "type": "qualitative",
  "title": "Improve Public Speaking",
  "description": "Become more confident speaking in front of groups",
  "priority": "high",
  "category": "Skills",
  "tags": ["speaking", "confidence", "career"],
  "startDate": "2025-01-01",
  "deadline": "2025-06-30",
  "qualitativeStatus": "not_started",
  "targetRating": 8,
  "selfAssessments": [],
  "improvementCriteria": [
    "Give 3 presentations without notes",
    "Receive positive feedback from audience",
    "Speak at least 10 minutes without preparation"
  ]
}
```

```json
{
  "type": "qualitative",
  "title": "Learn Piano",
  "description": "Basic piano proficiency",
  "priority": "medium",
  "category": "Music",
  "tags": ["piano", "music", "learning"],
  "qualitativeStatus": "in_progress",
  "targetRating": 7,
  "selfAssessments": [
    { "id": "1", "date": "2025-01-15", "rating": 4, "notes": "Can play simple scales" },
    { "id": "2", "date": "2025-02-15", "rating": 5, "notes": "Learning chord progressions" },
    { "id": "3", "date": "2025-03-15", "rating": 6, "notes": "Can play basic songs" }
  ]
}
```

```json
{
  "type": "qualitative",
  "title": "Photography Skills",
  "description": "Master manual camera settings",
  "priority": "low",
  "category": "Hobbies",
  "tags": ["photography", "camera"],
  "qualitativeStatus": "completed",
  "targetRating": 8,
  "selfAssessments": [
    { "id": "1", "date": "2025-01-01", "rating": 3 },
    { "id": "2", "date": "2025-03-01", "rating": 5 },
    { "id": "3", "date": "2025-06-01", "rating": 8 }
  ],
  "completedDate": "2025-06-01"
}
```

### Edge Cases

| Scenario          | Test Steps               | Expected Result                     |
| ----------------- | ------------------------ | ----------------------------------- |
| Rating below 1    | Enter rating 0           | Validation error                    |
| Rating above 10   | Enter rating 11          | Validation error                    |
| No target rating  | Leave targetRating empty | Progress shows based on status only |
| Delete assessment | Remove a self-assessment | Average recalculates                |

---

## 3. Binary Goals

### What It Is

Simple yes/no or count-based completion (e.g., "Complete online course", "Read 5 books").

### Test Scenarios

#### 3.1 Create Binary Goal

1. Click "Create Goal" → Select "Binary"
2. Set currentCount: 0, targetCount: 1 (simple completion)
3. Or set currentCount: 3, targetCount: 5 (count-based)
4. Create goal

**Expected Results:**

- Progress = (currentCount / targetCount) \* 100
- With targetCount 1: 0% → 100% on completion

#### 3.2 Toggle Completion (Single)

1. Create binary goal with targetCount: 1
2. Mark as complete
3. Toggle off
4. Toggle on again

**Expected Results:**

- Status changes: active ↔ completed
- Progress: 0% ↔ 100%

#### 3.3 Count-Based Progress

1. Create goal with targetCount: 5
2. Update currentCount to 2
3. Verify progress = 40%
4. Update to 5
5. Verify auto-complete triggers

**Expected Results:**

- Progress updates proportionally
- Auto-complete at 100%

#### 3.4 Partial Completion

1. Create goal with allowPartialCompletion: true
2. Set targetCount: 5, currentCount: 3
3. Try to mark as complete

**Expected Results:**

- Warning or confirmation dialog
- Can complete despite not reaching target

### Dummy Data

```json
{
  "type": "binary",
  "title": "Complete React Course",
  "description": "Finish the advanced React online course",
  "priority": "high",
  "category": "Learning",
  "tags": ["react", "coding", "course"],
  "startDate": "2025-01-01",
  "deadline": "2025-03-31",
  "currentCount": 0,
  "targetCount": 1,
  "allowPartialCompletion": false
}
```

```json
{
  "type": "binary",
  "title": "Read Top 10 Business Books",
  "description": "Read recommended business literature",
  "priority": "medium",
  "category": "Reading",
  "tags": ["books", "business", "reading"],
  "startDate": "2025-01-01",
  "deadline": "2025-12-31",
  "currentCount": 3,
  "targetCount": 10,
  "allowPartialCompletion": true,
  "items": ["Zero to One", "The Lean Startup", "Good to Great"]
}
```

```json
{
  "type": "binary",
  "title": "Get AWS Certification",
  "description": "Pass AWS Solutions Architect exam",
  "priority": "high",
  "category": "Career",
  "tags": ["aws", "certification", "cloud"],
  "startDate": "2025-02-01",
  "deadline": "2025-08-01",
  "currentCount": 1,
  "targetCount": 1,
  "allowPartialCompletion": false
}
```

### Edge Cases

| Scenario             | Test Steps                                      | Expected Result       |
| -------------------- | ----------------------------------------------- | --------------------- |
| Zero target          | targetCount: 0                                  | Validation error      |
| Negative count       | currentCount: -1                                | Validation error      |
| Count exceeds target | currentCount > targetCount (no overachievement) | Progress caps at 100% |
| Empty items list     | Create with empty items array                   | Works normally        |

---

## 4. Milestone Goals

### What It Is

Multi-step goals with sequential or parallel milestones that can have dependencies.

### Test Scenarios

#### 4.1 Create Milestone Goal

1. Click "Create Goal" → Select "Milestone"
2. Add 3-4 milestones with titles
3. Set due dates (optional)
4. Create goal

**Expected Results:**

- All milestones created with status "pending"
- Progress = (completed / total) \* 100

#### 4.2 Complete Milestones

1. Open milestone goal
2. Mark first milestone as complete
3. Mark second as complete
4. Observe progress updates

**Expected Results:**

- Progress increments per milestone
- completedDate set on each milestone
- Order preserved

#### 4.3 Sequential Completion

1. Create goal with requireSequentialCompletion: true
2. Try to complete milestone #3 before #1 and #2

**Expected Results:**

- Error or warning阻止完成
- Must complete in order

#### 4.4 Milestone Dependencies

1. Create milestones with dependencies
2. M2 depends on M1
3. Try to complete M2 before M1

**Expected Results:**

- Dependency check prevents completion
- Visual indicator shows blocked milestones

#### 4.5 Reordering

1. Enable allowMilestoneReordering
2. Drag milestones to reorder

**Expected Results:**

- Order numbers update
- Sequence maintained

#### 4.6 Skip Milestone

1. Mark a milestone as "skipped"
2. Verify progress calculation

**Expected Results:**

- Skipped counts as complete for progress
- Can optionally allow skipping

### Dummy Data

```json
{
  "type": "milestone",
  "title": "Launch Mobile App",
  "description": "Complete app development and launch",
  "priority": "high",
  "category": "Product",
  "tags": ["app", "launch", "development"],
  "startDate": "2025-01-01",
  "deadline": "2025-12-31",
  "requireSequentialCompletion": true,
  "allowMilestoneReordering": true,
  "milestones": [
    {
      "id": "m1",
      "title": "Requirements Gathering",
      "description": "Define app features and requirements",
      "status": "completed",
      "order": 0,
      "dueDate": "2025-02-01",
      "completedDate": "2025-01-15"
    },
    {
      "id": "m2",
      "title": "Design Phase",
      "description": "Create UI/UX designs",
      "status": "in_progress",
      "order": 1,
      "dueDate": "2025-03-01",
      "dependencies": ["m1"]
    },
    {
      "id": "m3",
      "title": "Development",
      "description": "Build the application",
      "status": "pending",
      "order": 2,
      "dueDate": "2025-08-01",
      "dependencies": ["m2"]
    },
    {
      "id": "m4",
      "title": "Testing",
      "description": "QA and bug fixes",
      "status": "pending",
      "order": 3,
      "dueDate": "2025-10-01",
      "dependencies": ["m3"]
    },
    {
      "id": "m5",
      "title": "Launch",
      "description": "Publish to app stores",
      "status": "pending",
      "order": 4,
      "dueDate": "2025-12-01",
      "dependencies": ["m4"]
    }
  ]
}
```

```json
{
  "type": "milestone",
  "title": "Plan Wedding",
  "description": "Organize all wedding tasks",
  "priority": "high",
  "category": "Personal",
  "tags": ["wedding", "planning"],
  "startDate": "2025-01-01",
  "deadline": "2025-12-31",
  "requireSequentialCompletion": false,
  "allowMilestoneReordering": true,
  "milestones": [
    { "id": "w1", "title": "Set Budget", "status": "completed", "order": 0 },
    { "id": "w2", "title": "Book Venue", "status": "completed", "order": 1 },
    { "id": "w3", "title": "Choose Caterer", "status": "completed", "order": 2 },
    { "id": "w4", "title": "Send Invitations", "status": "pending", "order": 3 },
    { "id": "w5", "title": "Finalize Menu", "status": "pending", "order": 4 },
    { "id": "w6", "title": "Wedding Day", "status": "pending", "order": 5 }
  ]
}
```

### Edge Cases

| Scenario                      | Test Steps              | Expected Result              |
| ----------------------------- | ----------------------- | ---------------------------- |
| Circular dependency           | M1→M2, M2→M1            | Validation error             |
| No milestones                 | Create with empty array | Warning or default milestone |
| All skipped                   | Mark all as skipped     | Progress = 100%              |
| Delete milestone mid-progress | Remove active milestone | Progress recalculates        |

---

## 5. Recurring Goals

### What It Is

Daily/weekly/monthly recurring tasks with streak tracking (e.g., "Weekly team meeting", "Monthly review").

### Test Scenarios

#### 5.1 Create Recurring Goal

1. Click "Create Goal" → Select "Recurring"
2. Set frequency: daily/weekly/monthly/yearly
3. Set interval (every 1, 2, 3 weeks, etc.)
4. Create goal

**Expected Results:**

- Goal created with recurrence config
- Occurrences generated based on schedule
- Streak tracking initialized

#### 5.2 Mark Occurrence Complete

1. Open recurring goal
2. Mark today's occurrence complete
3. Verify streak updates

**Expected Results:**

- completionStats.updated
- streak.current increments
- progress = (completedOccurrences / totalOccurrences) \* 100

#### 5.3 Streak Behavior

1. Complete multiple consecutive occurrences
2. Skip one occurrence
3. Check streak reset

**Expected Results:**

- Current streak counts consecutive completions
- Missing occurrence may reset streak (depending on config)
- Longest streak preserved

#### 5.4 Frequency Variations

1. Create daily recurring goal
2. Create weekly (every 2 weeks)
3. Create monthly (every 3 months)
4. Create yearly

**Expected Results:**

- Each generates occurrences on correct schedule
- Interval respected

### Dummy Data

```json
{
  "type": "recurring",
  "title": "Weekly Team Standup",
  "description": "Attend weekly team meeting",
  "priority": "high",
  "category": "Work",
  "tags": ["meeting", "team", "weekly"],
  "startDate": "2025-01-01",
  "deadline": "2025-12-31",
  "recurrence": {
    "frequency": "weekly",
    "interval": 1,
    "daysOfWeek": ["monday"],
    "time": "09:00"
  },
  "completionStats": {
    "totalOccurrences": 48,
    "completedOccurrences": 12,
    "completionRate": 75,
    "streak": {
      "current": 3,
      "longest": 8
    }
  },
  "occurrences": []
}
```

```json
{
  "type": "recurring",
  "title": "Monthly Financial Review",
  "description": "Review monthly finances",
  "priority": "medium",
  "category": "Finance",
  "tags": ["finance", "monthly", "review"],
  "startDate": "2025-01-01",
  "deadline": "2025-12-31",
  "recurrence": {
    "frequency": "monthly",
    "interval": 1,
    "dayOfMonth": 1
  },
  "completionStats": {
    "totalOccurrences": 12,
    "completedOccurrences": 3,
    "completionRate": 100,
    "streak": {
      "current": 3,
      "longest": 3
    }
  }
}
```

```json
{
  "type": "recurring",
  "title": "Daily Code Review",
  "description": "Review pull requests daily",
  "priority": "high",
  "category": "Work",
  "tags": ["code", "review", "daily"],
  "startDate": "2025-01-01",
  "recurrence": {
    "frequency": "daily",
    "interval": 1,
    "time": "17:00"
  },
  "completionStats": {
    "totalOccurrences": 30,
    "completedOccurrences": 25,
    "completionRate": 83.3,
    "streak": {
      "current": 10,
      "longest": 15
    }
  }
}
```

### Edge Cases

| Scenario                    | Test Steps                  | Expected Result              |
| --------------------------- | --------------------------- | ---------------------------- |
| Past due occurrence         | Miss multiple occurrences   | Streak may reset             |
| Future completion           | Mark future date complete   | Should allow or show warning |
| Change frequency mid-stream | Edit recurring goal         | Occurrences regenerate       |
| Delete past occurrence      | Remove completed occurrence | Stats recalculate            |

---

## 6. Habit Goals

### What It Is

Daily habits with frequency tracking and completion stats (e.g., "Exercise every day", "Meditate").

### Test Scenarios

#### 6.1 Create Habit Goal

1. Click "Create Goal" → Select "Habit"
2. Set target frequency: daily/every_other_day/weekly/custom
3. Create goal

**Expected Results:**

- Habit created with completionStats
- Entries array initialized
- habitStrength calculated

#### 6.2 Daily Habit Tracking

1. Open habit goal
2. Mark today as complete
3. Check streak and stats

**Expected Results:**

- Entry added to entries array
- completionStats update
- streak.current increments

#### 6.3 Frequency Options

1. Create "every_other_day" habit
2. Complete day 1
3. Try to complete day 2 (should fail or warn)
4. Complete day 3 (should succeed)

**Expected Results:**

- Frequency validation works
- Can only complete on target days

#### 6.4 Custom Frequency

1. Create habit with custom: 3 (every 3 days)
2. Verify schedule

**Expected Results:**

- Custom frequency respected

#### 6.5 Habit Strength

1. Complete habit consistently for 2+ weeks
2. Check habitStrength value

**Expected Results:**

- habitStrength increases with consistency
- 0-100 scale

### Dummy Data

```json
{
  "type": "habit",
  "title": "Morning Meditation",
  "description": "10 minutes of daily meditation",
  "priority": "high",
  "category": "Wellness",
  "tags": ["meditation", "mindfulness", "morning"],
  "startDate": "2025-01-01",
  "targetFrequency": "daily",
  "customFrequency": null,
  "completionStats": {
    "totalOccurrences": 90,
    "completedOccurrences": 75,
    "completionRate": 83.3,
    "streak": {
      "current": 12,
      "longest": 21
    }
  },
  "habitStrength": 78,
  "entries": [
    { "id": "e1", "date": "2025-03-10", "completed": true, "notes": "Felt calm" },
    { "id": "e2", "date": "2025-03-11", "completed": true, "notes": "" },
    { "id": "e3", "date": "2025-03-12", "completed": false, "notes": "Forgot" }
  ]
}
```

```json
{
  "type": "habit",
  "title": "Exercise 3x Per Week",
  "description": "Work out three times weekly",
  "priority": "high",
  "category": "Fitness",
  "tags": ["exercise", "fitness", "health"],
  "startDate": "2025-01-01",
  "targetFrequency": "custom",
  "customFrequency": 3,
  "completionStats": {
    "totalOccurrences": 36,
    "completedOccurrences": 24,
    "completionRate": 66.7,
    "streak": {
      "current": 2,
      "longest": 5
    }
  },
  "habitStrength": 55
}
```

```json
{
  "type": "habit",
  "title": "Read Before Bed",
  "description": "Read for 15 minutes each night",
  "priority": "medium",
  "category": "Personal Development",
  "tags": ["reading", "habit", "sleep"],
  "startDate": "2025-02-01",
  "targetFrequency": "daily",
  "completionStats": {
    "totalOccurrences": 50,
    "completedOccurrences": 45,
    "completionRate": 90,
    "streak": {
      "current": 15,
      "longest": 15
    }
  },
  "habitStrength": 85
}
```

### Edge Cases

| Scenario             | Test Steps               | Expected Result    |
| -------------------- | ------------------------ | ------------------ |
| Miss a day           | Don't complete for 1 day | Streak resets to 0 |
| Complete future date | Mark tomorrow complete   | Validation error   |
| Custom frequency 0   | Set customFrequency: 0   | Validation error   |
| Archive mid-streak   | Archive active habit     | Streak preserved   |

---

## 7. Common Feature Testing

### 7.1 Goal Filtering

| Filter    | Test Scenario            | Expected Result          |
| --------- | ------------------------ | ------------------------ |
| Status    | Filter by "active" only  | Only active goals shown  |
| Status    | Filter by "completed"    | Completed goals shown    |
| Type      | Filter by "quantitative" | Only quantitative goals  |
| Priority  | Filter by "high"         | High priority goals      |
| Category  | Select specific category | Goals filtered correctly |
| Tags      | Filter by tag            | Goals with matching tag  |
| Favorites | Show favorites only      | Starred goals only       |
| Archive   | Show archived            | Hidden goals shown       |
| Combined  | Apply 3+ filters         | All filters apply        |

### 7.2 Search

| Test Scenario          | Expected Result                  |
| ---------------------- | -------------------------------- |
| Search by title        | Goals matching title found       |
| Search by description  | Goals matching description found |
| Search partial term    | Partial match works              |
| Search with no results | Empty state shown                |
| Case insensitive       | "test" finds "Test Goal"         |

### 7.3 View Modes

| Test Scenario        | Expected Result           |
| -------------------- | ------------------------- |
| Toggle to table view | Columns display correctly |
| Toggle to list view  | Cards display correctly   |
| Switch between views | State preserved           |

### 7.4 Goal Actions

| Action    | Test Scenario     | Expected Result       |
| --------- | ----------------- | --------------------- |
| Edit      | Modify all fields | Changes saved         |
| Delete    | Delete goal       | Goal removed          |
| Archive   | Archive goal      | Hidden from main view |
| Unarchive | Restore archived  | Goal returns          |
| Favorite  | Toggle star       | Icon updates          |
| Duplicate | Copy goal         | New goal created      |

### 7.5 Goal Completion

| Test Scenario         | Expected Result        |
| --------------------- | ---------------------- |
| Auto-complete at 100% | Celebration shows      |
| Manual completion     | Dialog confirms        |
| Uncomplete            | Reverts to active      |
| Completion stats      | Shows time to complete |

### 7.6 Theme

| Test Scenario      | Expected Result         |
| ------------------ | ----------------------- |
| Toggle light/dark  | Colors switch correctly |
| Persist preference | Saved across sessions   |

---

## 8. Data Model Reference

### Base Goal Fields (All Types)

| Field         | Type       | Required | Description                                               |
| ------------- | ---------- | -------- | --------------------------------------------------------- |
| id            | string     | Yes      | UUID                                                      |
| title         | string     | Yes      | Max 200 chars                                             |
| description   | string     | No       | Max 5000 chars                                            |
| type          | GoalType   | Yes      | quantitative/qualitative/binary/milestone/recurring/habit |
| status        | GoalStatus | Yes      | active/completed/paused/cancelled                         |
| priority      | Priority   | No       | high/medium/low                                           |
| category      | string     | No       | Max 100 chars                                             |
| tags          | string[]   | No       | Array of tags                                             |
| startDate     | Date       | No       | Start date                                                |
| deadline      | Date       | No       | End date                                                  |
| completedDate | Date       | No       | Completion date                                           |
| progress      | number     | Yes      | 0-100                                                     |
| archived      | boolean    | No       | Default false                                             |
| favorite      | boolean    | No       | Default false                                             |

### GoalType-Specific Fields

**Quantitative:**

- startValue, targetValue, currentValue, unit, allowDecimals, allowOverAchievement, minValue, maxValue

**Qualitative:**

- qualitativeStatus, selfAssessments, targetRating, improvementCriteria

**Binary:**

- targetCount, currentCount, items, allowPartialCompletion

**Milestone:**

- milestones[], allowMilestoneReordering, requireSequentialCompletion

**Recurring:**

- recurrence, completionStats, occurrences

**Habit:**

- targetFrequency, customFrequency, completionStats, entries, habitStrength

---

## 9. Test Checklist

Use this checklist to track testing progress:

- [ ] Quantitative: Create, update progress, over-achievement
- [ ] Qualitative: Create, self-assessment, status flow
- [ ] Binary: Simple completion, count-based, partial completion
- [ ] Milestone: Create, complete, dependencies, reordering
- [ ] Recurring: Create, complete occurrence, streak
- [ ] Habit: Create, daily tracking, frequency options
- [ ] Filtering: Status, type, priority, category, tags
- [ ] Search: Title, description, partial match
- [ ] View modes: Table, list toggle
- [ ] CRUD: Create, read, update, delete
- [ ] Archive: Archive, unarchive
- [ ] Favorites: Add, remove, filter
- [ ] Theme: Light, dark mode
- [ ] Edge cases: Empty states, validation errors
- [ ] Data persistence: Refresh page, verify data saved

---

## 10. Known Issues & Notes

_Document any bugs, quirks, or known limitations discovered during testing here._

---

_Last updated: March 2025_
