# Goal Tracking System - Business Rules

This document defines all business rules, constraints, and policies that govern the Goals Tracking Management System.

---

## 1. Goal Creation Rules

### BR-001: Goal Title Requirements

- **Rule**: Goal title must be between 1 and 200 characters
- **Rationale**: Ensures titles are meaningful but not excessively long
- **Enforcement**: Client-side and server-side validation
- **Error Message**: "Title must be between 1 and 200 characters"

### BR-002: Goal Type Selection

- **Rule**: Every goal must have exactly one type
- **Rationale**: Type determines available features and calculations
- **Enforcement**: Required field, cannot be null/undefined
- **Allowed Values**: quantitative, qualitative, binary, milestone, recurring, habit

### BR-003: Goal Status Initialization

- **Rule**: New goals must be created with status 'active' or 'paused'
- **Rationale**: Goals cannot be created as 'completed' or 'cancelled'
- **Enforcement**: Default to 'active', allow user to set 'paused' during creation
- **Exception**: None

### BR-004: Category Requirement

- **Rule**: Every goal must have a category
- **Rationale**: Enables organization and filtering
- **Enforcement**: Required field, cannot be empty
- **Default**: User must select or create category

### BR-005: Quantitative Goal Value Requirements

- **Rule**: Quantitative goals require startValue, targetValue, currentValue, and unit
- **Rationale**: All values needed for progress calculation
- **Enforcement**: All fields required, validation on create/update
- **Constraints**:
  - startValue and targetValue cannot be equal (unless special case)
  - currentValue must be between minValue and maxValue if specified
  - currentValue must respect allowDecimals setting

### BR-006: Milestone Goal Minimum Milestones

- **Rule**: Milestone goals must have at least one milestone
- **Rationale**: Goal type requires milestones to function
- **Enforcement**: Validation on create, cannot save with 0 milestones
- **Error Message**: "Milestone goals must have at least one milestone"

### BR-007: Recurring Goal Recurrence Configuration

- **Rule**: Recurring goals must have valid recurrence configuration
- **Rationale**: Recurrence defines when goal should be completed
- **Enforcement**:
  - frequency is required
  - interval must be positive integer
  - Weekly frequency requires daysOfWeek array
  - Monthly frequency can specify dayOfMonth
  - Yearly frequency can specify dayOfYear

### BR-008: Habit Goal Frequency Requirement

- **Rule**: Habit goals must specify targetFrequency
- **Rationale**: Frequency determines tracking schedule
- **Enforcement**: Required field
- **Special Case**: If targetFrequency is 'custom', customFrequency is required

---

## 2. Progress Calculation Rules

### BR-009: Quantitative Progress Formula

- **Rule**: Progress = ((currentValue - startValue) / (targetValue - startValue)) \* 100
- **Rationale**: Standard percentage calculation
- **Edge Cases**:
  - If startValue === targetValue: Progress = 100% if currentValue >= targetValue, else 0%
  - If currentValue < startValue: Progress = 0% (clamped)
  - If currentValue > targetValue: Progress = 100% (clamped) or >100% if over-achievement allowed
- **Enforcement**: Automatic calculation on currentValue update

### BR-010: Milestone Progress Calculation

- **Rule**: Progress = (completedMilestones / totalMilestones) \* 100
- **Rationale**: Linear progress based on milestone completion
- **Special Cases**:
  - Skipped milestones: Excluded from calculation (optional policy)
  - Dependencies: Milestones with unmet dependencies not counted as "available"
- **Enforcement**: Automatic recalculation on milestone status change

### BR-011: Binary Goal Progress Calculation

- **Rule**: If targetCount set: Progress = (currentCount / targetCount) \* 100
- **Rule**: If no targetCount: Progress = 100% if currentCount > 0, else 0%
- **Rationale**: Count-based progress tracking
- **Enforcement**: Automatic calculation on count update

### BR-012: Qualitative Goal Progress Calculation

- **Rule**: Progress based on qualitativeStatus and self-assessments
- **Formula**:
  - not_started: 0%
  - in_progress: 50% (or based on self-assessment ratings)
  - completed: 100%
- **Alternative**: If self-assessments exist: Average rating / 10 \* 100
- **Rationale**: Status-based with optional rating refinement
- **Enforcement**: Automatic calculation on status/rating update

### BR-013: Recurring Goal Progress

- **Rule**: Progress = (completedOccurrences / totalOccurrences) \* 100
- **Rationale**: Based on completion rate
- **Time Window**: totalOccurrences calculated for current period (e.g., last 30 days, all time)
- **Enforcement**: Automatic calculation on occurrence completion

### BR-014: Habit Goal Progress

- **Rule**: Progress = (completedDays / totalDaysInPeriod) \* 100
- **Rationale**: Daily consistency tracking
- **Time Window**: Configurable (last 7, 30, 90 days, or all time)
- **Enforcement**: Automatic calculation on habit entry update

### BR-015: Progress Clamping

- **Rule**: Progress must be between 0% and 100%
- **Rationale**: Standard percentage range
- **Exception**: Over-achievement goals may allow >100% (configurable)
- **Enforcement**: Clamp values outside range

---

## 3. Goal Completion Rules

### BR-016: Completion Validation

- **Rule**: Goal can only be marked completed if progress = 100%
- **Rationale**: Ensures goals are actually achieved
- **Enforcement**:
  - Check progress before allowing status change to 'completed'
  - Show confirmation if progress < 100%
  - Allow manual override with admin permission or user confirmation
- **Exception**: Manual override for edge cases (e.g., goal no longer relevant)

### BR-017: Quantitative Goal Completion

- **Rule**: Quantitative goal complete when currentValue >= targetValue
- **Rationale**: Target achieved or exceeded
- **Enforcement**: Automatic status update when currentValue reaches targetValue (optional)
- **Manual Override**: User can mark complete even if currentValue < targetValue (with confirmation)

### BR-018: Binary Goal Completion

- **Rule**: Binary goal complete when currentCount >= targetCount (if targetCount set)
- **Rationale**: Target count achieved
- **Enforcement**: Automatic when count reaches target
- **No Target Count**: User manually marks complete

### BR-019: Milestone Goal Completion

- **Rule**: Milestone goal complete when all milestones are completed
- **Rationale**: All sub-goals must be achieved
- **Enforcement**:
  - Check all milestones have status 'completed'
  - Allow skipping milestones if configured
  - Recalculate progress automatically

### BR-020: Completion Date Setting

- **Rule**: When goal marked completed, set completedDate to current date/time
- **Rationale**: Track when goal was achieved
- **Enforcement**: Automatic on status change to 'completed'
- **Exception**: Can set custom completedDate for historical data

### BR-021: Recurring Goal Completion Behavior

- **Rule**: Recurring goals remain active after occurrence completion
- **Rationale**: Goal repeats, individual occurrences complete, not the goal itself
- **Enforcement**: Status remains 'active', occurrence marked complete
- **Completion**: Goal only completes if manually marked or recurrence ends

### BR-022: Habit Goal Completion Behavior

- **Rule**: Habit goals remain active, individual days marked complete
- **Rationale**: Habits are ongoing, not one-time achievements
- **Enforcement**: Status remains 'active', daily entries tracked
- **Completion**: Goal only completes if manually marked or habit discontinued

---

## 4. Status Transition Rules

### BR-023: Valid Status Transitions

- **Rule**: Status transitions must follow allowed paths
- **Allowed Transitions**:
  - active → paused ✓
  - active → cancelled ✓
  - active → completed ✓ (if progress = 100%)
  - paused → active ✓
  - paused → cancelled ✓
  - paused → completed ✓ (if progress = 100%)
  - completed → (no transitions, final state)
  - cancelled → (no transitions, final state)
- **Rationale**: Prevents invalid state changes
- **Enforcement**: Validate transition before allowing status change

### BR-024: Pause Goal Rules

- **Rule**: Paused goals preserve all data and progress
- **Rationale**: Goals can be resumed exactly as paused
- **Enforcement**:
  - No data modification on pause
  - Deadline countdown paused (optional)
  - Progress calculations paused
- **Resume**: Can resume to 'active' status

### BR-025: Cancel Goal Rules

- **Rule**: Cancelled goals are final and cannot be reactivated
- **Rationale**: Cancellation is permanent decision
- **Enforcement**:
  - Require confirmation before cancelling
  - Allow cancellation reason/note
  - Prevent status change from 'cancelled'
  - Preserve data for historical purposes
- **Exception**: Admin override to reactivate (if needed)

### BR-026: Completed Goal Rules

- **Rule**: Completed goals cannot change status (except archive/unarchive)
- **Rationale**: Completion is final achievement state
- **Enforcement**:
  - Prevent status change from 'completed'
  - Allow data viewing but not modification
  - Allow archiving/unarchiving
- **Exception**: Admin override to modify (if needed)

---

## 5. Milestone Rules

### BR-027: Milestone Dependency Rules

- **Rule**: Milestones cannot be completed if dependencies are incomplete
- **Rationale**: Ensures proper sequence and prerequisites
- **Enforcement**:
  - Check all dependencies have status 'completed' before allowing completion
  - Disable completion UI if dependencies unmet
  - Show clear message about unmet dependencies
- **Exception**: Can skip dependencies if milestone skipped

### BR-028: Circular Dependency Prevention

- **Rule**: Milestone dependencies cannot form cycles
- **Rationale**: Prevents impossible completion scenarios
- **Enforcement**:
  - Validate on milestone create/update
  - Use cycle detection algorithm
  - Reject changes that create cycles
- **Error Message**: "Milestone dependencies cannot form cycles"

### BR-029: Sequential Milestone Completion

- **Rule**: If requireSequentialCompletion = true, milestones must complete in order
- **Rationale**: Enforces strict sequence
- **Enforcement**:
  - Check previous milestone (by order) is completed
  - Prevent completing milestone N if N-1 not completed
  - Show message about required sequence
- **Exception**: Can skip milestones if allowed

### BR-030: Milestone Reordering

- **Rule**: Milestones can be reordered only if allowMilestoneReordering = true
- **Rationale**: Some goals require fixed sequence
- **Enforcement**:
  - Show reorder UI only if enabled
  - Update order field for all affected milestones
  - Validate dependencies still valid after reorder
- **Constraint**: Reordering cannot break dependencies

---

## 6. Recurring Goal Rules

### BR-031: Recurrence Schedule Calculation

- **Rule**: System calculates next occurrence based on frequency and interval
- **Rationale**: Determines when goal should be completed
- **Examples**:
  - Daily, interval 1: Every day
  - Weekly, interval 2: Every 2 weeks
  - Monthly, interval 1, dayOfMonth 15: 15th of each month
- **Enforcement**: Automatic calculation, display next occurrence date

### BR-032: Recurrence End Date

- **Rule**: If endDate specified, goal stops recurring after that date
- **Rationale**: Allows finite recurring goals
- **Enforcement**:
  - Check endDate when calculating next occurrence
  - Mark goal as completed when endDate passed and all occurrences complete
- **No End Date**: Goal continues indefinitely

### BR-033: Weekly Recurrence Days

- **Rule**: Weekly recurrence requires daysOfWeek array with at least one day
- **Rationale**: Specifies which days of week goal occurs
- **Enforcement**:
  - Validate daysOfWeek provided for weekly frequency
  - Validate day values are 0-6 (Sunday-Saturday)
  - Reject if empty array
- **Error Message**: "Weekly recurrence must specify at least one day of week"

### BR-034: Completion Rate Calculation

- **Rule**: Completion rate = (completedOccurrences / totalOccurrences) \* 100
- **Rationale**: Measures consistency
- **Time Window**:
  - All time (default)
  - Last 30 days
  - Last 90 days
  - Custom period
- **Enforcement**: Automatic calculation on occurrence update

---

## 7. Habit Goal Rules

### BR-035: Habit Frequency Types

- **Rule**: Habit goals support: daily, every_other_day, weekly, custom
- **Rationale**: Different habits have different frequencies
- **Enforcement**:
  - Validate frequency selection
  - Require customFrequency if targetFrequency = 'custom'
- **Custom Frequency**: Number of days between occurrences

### BR-036: Habit Strength Calculation

- **Rule**: Habit strength calculated from multiple factors
- **Formula Components**:
  - Consistency (last 30 days): 40% weight
  - Current streak length: 30% weight
  - Completion rate (all time): 20% weight
  - Recency (last 7 days): 10% weight
- **Range**: 0-100
- **Enforcement**: Automatic calculation on habit entry update

### BR-037: Streak Calculation Rules

- **Rule**: Streak = consecutive days with completed = true
- **Rationale**: Measures consistency
- **Calculation**:
  - Start from last completed date
  - Count backwards consecutive completed days
  - Stop at first missed day
- **Grace Period**: Configurable (0-2 days) to allow missed days without breaking streak
- **Enforcement**: Automatic calculation on habit entry update

### BR-038: Streak Breaking Rules

- **Rule**: Streak breaks when day missed (unless grace period)
- **Rationale**: Encourages daily consistency
- **Grace Period Options**:
  - No grace: Any missed day breaks streak
  - 1 day grace: Can miss 1 day without breaking
  - 2 day grace: Can miss 2 days without breaking
- **Enforcement**: Check grace period when calculating streak

---

## 8. Date and Time Rules

### BR-039: Deadline Validation

- **Rule**: Deadline must be after startDate if both provided
- **Rationale**: Logical date relationship
- **Enforcement**:
  - Validate on create/update
  - Show error if deadline before startDate
- **Error Message**: "Deadline must be after start date"

### BR-040: Start Date Validation

- **Rule**: Start date can be in past, present, or future
- **Rationale**: Goals can be created retroactively or for future
- **Enforcement**:
  - Allow any date
  - Show warning if startDate in past (optional)
  - Default to today if not specified
- **Exception**: None

### BR-041: Timezone Handling

- **Rule**: All dates stored in UTC, displayed in user's timezone
- **Rationale**: Consistent storage, localized display
- **Enforcement**:
  - Convert to UTC on save
  - Convert to user timezone on display
  - Use user's timezone preference
- **Deadline Countdown**: Calculate in user's timezone

### BR-042: Deadline Countdown

- **Rule**: Countdown shows time remaining until deadline
- **Rationale**: Helps users stay on track
- **Display**:
  - Days remaining if > 7 days
  - Hours remaining if < 7 days
  - "Overdue" if deadline passed
- **Enforcement**: Calculate on each view, update in real-time

### BR-043: Deadline Alerts

- **Rule**: Alert user when deadline approaching
- **Thresholds**:
  - Warning: 7 days before deadline
  - Urgent: 3 days before deadline
  - Overdue: Deadline passed
- **Enforcement**:
  - Check on goal view
  - Send notifications (if enabled)
  - Show visual indicators (badges, colors)

---

## 9. Data Validation Rules

### BR-044: Numeric Value Validation

- **Rule**: Numeric values must be within specified ranges
- **Constraints**:
  - startValue, targetValue, currentValue: Any number (within min/max if specified)
  - Progress: 0-100
  - Ratings: 1-10
  - Interval: Positive integer
- **Enforcement**: Validate on input, show errors immediately

### BR-045: Decimal Value Handling

- **Rule**: Decimal values allowed only if allowDecimals = true
- **Rationale**: Some goals require whole numbers (e.g., "visit 5 countries")
- **Enforcement**:
  - Check allowDecimals before accepting decimal input
  - Round or reject decimal values if not allowed
  - Show clear error message
- **Error Message**: "This goal does not allow decimal values"

### BR-046: String Length Limits

- **Rule**: String fields have maximum lengths
- **Limits**:
  - Title: 200 characters
  - Description: 5000 characters
  - Category: 100 characters
  - Tags: 50 characters each
  - Notes: 5000 characters
- **Enforcement**:
  - Client-side: Character counter, disable submit if over
  - Server-side: Truncate or reject
- **Error Message**: "Field exceeds maximum length of X characters"

### BR-047: Required Field Validation

- **Rule**: Required fields must be provided
- **Required Fields**:
  - id, title, type, status, priority, category, createdAt, updatedAt, createdBy, progress
  - Type-specific required fields (e.g., startValue for quantitative)
- **Enforcement**:
  - Validate on form submit
  - Show errors for missing fields
  - Prevent submission until all required fields provided

---

## 10. User Permission Rules

### BR-048: Goal Ownership

- **Rule**: Users can only modify their own goals (unless shared/collaborative)
- **Rationale**: Data privacy and security
- **Enforcement**:
  - Check createdBy or assignee matches current user
  - Reject updates from unauthorized users
  - Show error: "You don't have permission to modify this goal"
- **Exception**: Admin users can modify any goal

### BR-049: Goal Viewing

- **Rule**: Users can view their own goals and goals assigned to them
- **Rationale**: Access control
- **Enforcement**:
  - Filter goals by createdBy or assignee
  - Hide goals user doesn't have access to
- **Exception**: Shared/collaborative goals visible to team members

### BR-050: Note Modification

- **Rule**: Users can only edit/delete their own notes
- **Rationale**: Prevents unauthorized modifications
- **Enforcement**:
  - Check note.createdBy matches current user
  - Hide edit/delete buttons for other users' notes
  - Reject unauthorized update/delete requests

---

## 11. Business Logic Rules

### BR-051: Progress History Entry Creation

- **Rule**: Progress history entry created on each progress update
- **Rationale**: Track progress over time
- **Enforcement**:
  - Automatic on progress value change
  - Include: date, value, optional note
  - Cannot be deleted (historical record)
- **Exception**: Admin can delete for data cleanup

### BR-052: Related Goals Linking

- **Rule**: Goals cannot be linked to themselves
- **Rationale**: Prevents circular self-reference
- **Enforcement**:
  - Validate goal ID not equal to current goal ID
  - Reject self-linking attempts
- **Error Message**: "A goal cannot be related to itself"

### BR-053: Category and Tag Creation

- **Rule**: Users can create custom categories and tags
- **Rationale**: Flexibility in organization
- **Enforcement**:
  - Allow creation on-the-fly
  - Validate format (no special characters for tags)
  - Suggest existing categories/tags
- **Limits**:
  - Categories: No limit (but suggest reuse)
  - Tags: Max 50 per goal

### BR-054: Goal Archiving

- **Rule**: Archived goals hidden from default views
- **Rationale**: Keep active list focused
- **Enforcement**:
  - Filter archived goals from default queries
  - Show in separate "Archived" view
  - Preserve all data
- **Unarchive**: Can unarchive to restore to active views

### BR-055: Goal Favorites

- **Rule**: Users can mark unlimited goals as favorites
- **Rationale**: Quick access to important goals
- **Enforcement**:
  - Toggle favorite status
  - Filter to show only favorites
  - Optional: Show favorites at top of list
- **Limit**: No limit on number of favorites

---

## 12. Performance and Scalability Rules

### BR-056: Pagination Requirement

- **Rule**: Goal lists with >20 items must be paginated
- **Rationale**: Performance and usability
- **Enforcement**:
  - Default page size: 20
  - Allow user to change page size (10, 20, 50, 100)
  - Show pagination controls
- **Exception**: Small lists (<20) can show all items

### BR-057: Search Performance

- **Rule**: Search must return results in <500ms
- **Rationale**: Responsive user experience
- **Enforcement**:
  - Index title and description fields
  - Use full-text search if available
  - Limit results to first 100 matches
  - Show "showing first 100 results" message if more exist

### BR-058: Progress Calculation Performance

- **Rule**: Progress calculations must complete in <100ms
- **Rationale**: Real-time updates should be instant
- **Enforcement**:
  - Cache calculations where possible
  - Optimize formulas
  - Batch updates if multiple changes

---

## 13. Data Integrity Rules

### BR-059: Referential Integrity

- **Rule**: Related goals must reference existing goals
- **Rationale**: Prevent broken references
- **Enforcement**:
  - Validate goal IDs exist before linking
  - Handle deleted goals (remove from relatedGoals or show as "deleted")
  - Cascade delete or prevent deletion if referenced
- **Policy**: Remove broken references on goal deletion

### BR-060: Data Consistency

- **Rule**: Calculated fields must match source data
- **Rationale**: Ensure data accuracy
- **Examples**:
  - Progress must match currentValue for quantitative goals
  - Completion stats must match actual entries
- **Enforcement**:
  - Recalculate on data changes
  - Validation checks in tests
  - Data integrity checks (optional background job)

### BR-061: Timestamp Management

- **Rule**: Timestamps must be set correctly
- **Rationale**: Track when events occurred
- **Rules**:
  - createdAt: Set once on creation, never change
  - updatedAt: Set on every update
  - completedDate: Set when status changes to 'completed'
- **Enforcement**:
  - Automatic timestamp setting
  - Prevent manual modification (except admin)

---

## 14. UI/UX Rules

### BR-062: Progress Visualization

- **Rule**: Progress must be shown visually (progress bar) and numerically (%)
- **Rationale**: Clear communication of progress
- **Enforcement**:
  - Always show progress bar
  - Always show percentage
  - Color-code based on progress (red/yellow/green)
- **Accessibility**: Progress bar must have ARIA labels

### BR-063: Error Message Display

- **Rule**: Errors must be clear, specific, and actionable
- **Rationale**: Help users fix issues
- **Requirements**:
  - Show field-level errors
  - Explain what's wrong
  - Suggest how to fix
  - Use plain language
- **Enforcement**: All validation errors follow this format

### BR-064: Confirmation Dialogs

- **Rule**: Destructive actions require confirmation
- **Actions Requiring Confirmation**:
  - Delete goal
  - Cancel goal
  - Archive goal
  - Unlink related goal
- **Enforcement**: Show confirmation dialog before action

### BR-065: Loading States

- **Rule**: Show loading indicators for async operations
- **Rationale**: Provide feedback during waits
- **Enforcement**:
  - Show spinner/skeleton for data fetching
  - Disable buttons during submission
  - Show progress for long operations
- **Threshold**: Show loading if operation >200ms

---

## 15. Compliance and Audit Rules

### BR-066: Data Retention

- **Rule**: Goal data retained indefinitely unless user deletes
- **Rationale**: Historical tracking and analytics
- **Enforcement**:
  - No automatic deletion
  - User can delete goals (with confirmation)
  - Deleted goals removed permanently (or soft-deleted)
- **Exception**: Legal/compliance requirements may override

### BR-067: Audit Logging

- **Rule**: Log all goal modifications (optional)
- **Rationale**: Track changes for debugging and compliance
- **Log Events**:
  - Goal created
  - Goal updated
  - Progress updated
  - Status changed
  - Goal deleted
- **Enforcement**: Optional feature, can be enabled/disabled

### BR-068: Data Export

- **Rule**: Users can export their goal data
- **Rationale**: Data portability and backup
- **Formats**: CSV, JSON, PDF
- **Enforcement**:
  - Provide export functionality
  - Include all goal data
  - Respect user permissions (only own data)

---

## Rule Enforcement Summary

### Validation Points

1. **Client-side**: Immediate feedback, better UX
2. **Server-side**: Security, data integrity
3. **Database**: Constraints, referential integrity

### Error Handling

- Clear error messages
- Field-level validation
- Prevent invalid state transitions
- Graceful degradation

### Performance

- Optimize calculations
- Index database fields
- Paginate large lists
- Cache where appropriate

### Security

- Validate user permissions
- Sanitize inputs
- Prevent unauthorized access
- Audit sensitive operations
