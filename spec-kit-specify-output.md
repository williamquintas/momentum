# Spec Kit /specify Output - Momentum Goals Tracking System

Generated on: March 22, 2026

This document contains the extracted features, user flows, domain entities, and constraints from the Momentum codebase analysis.

## Features

The following features are extracted from `specs/features/goal-features.md`:

1. **Create Goal**: Users can create new goals of any type (quantitative, qualitative, binary, milestone, recurring, habit) with all necessary configuration.
2. **Update Goal Progress**: Users can update the progress of their goals, with different mechanisms for each goal type.
3. **Complete Goal**: Users can mark goals as completed, triggering appropriate status changes and calculations.
4. **View Goal Details**: Users can view comprehensive details about any goal, including progress, history, and related information.
5. **Filter and Search Goals**: Users can filter and search goals by various criteria to find specific goals.
6. **Goal Status Management**: Users can change goal status (active, paused, cancelled) with appropriate validations.
7. **Milestone Management**: Users can add, edit, reorder, and complete milestones within milestone goals.
8. **Recurring Goal Occurrence Tracking**: Users can track individual occurrences of recurring goals.
9. **Habit Goal Tracking**: Users can track daily habit completion with streak counters and calendar views.
10. **Progress History and Analytics**: Users can view progress history, trends, and analytics for their goals.
11. **Notes and Attachments**: Users can add notes and file attachments to goals for additional context.
12. **Related Goals**: Users can link goals together to show relationships and dependencies.
13. **Goal Categories and Tags**: Users can organize goals using categories and tags for better management.
14. **Deadline Management**: Users can set and manage deadlines with notifications and overdue handling.
15. **Goal Archiving**: Users can archive completed or inactive goals to reduce clutter.
16. **Goal Favorites**: Users can mark goals as favorites for quick access.

## User Flows

The following user flows are extracted from `specs/workflows/goal-workflows.md`:

1. **Create and Track Quantitative Goal**: User creates a quantitative goal, updates progress, views progress bar.
2. **Update Progress for Quantitative Goal**: User updates current value, system calculates progress, creates history entry.
3. **Create and Complete Milestone Goal**: User creates milestone goal, completes milestones in order, goal completes when all milestones done.
4. **Track Daily Habit Goal**: User marks daily habit completion, system tracks streaks and consistency.
5. **Filter and Search Goals**: User applies filters (status, category, priority), searches by title/description.
6. **Complete Recurring Goal Occurrence**: User marks occurrence as completed, system updates completion stats.
7. **Pause and Resume Goal**: User pauses active goal, later resumes it, progress tracking continues.
8. **Add Note and Attachment to Goal**: User adds notes or uploads files to provide additional context.
9. **Link Related Goals**: User links goals to show dependencies or relationships.
10. **Archive and Unarchive Goal**: User archives completed goals, can later unarchive if needed.

## Domain Entities

The following domain entities are extracted from `specs/types/goal.types.ts`:

### Core Entities

- **Goal**: Main entity representing a goal, with subtypes:
  - QuantitativeGoal (numeric targets)
  - QualitativeGoal (descriptive with self-assessment)
  - BinaryGoal (checkbox-style with counts)
  - MilestoneGoal (sub-milestones)
  - RecurringGoal (repeating goals)
  - HabitGoal (daily habits with streaks)

### Supporting Entities

- **Milestone**: Individual sub-goals within milestone goals
- **ProgressEntry**: Records of progress updates with timestamps
- **Note**: Text notes attached to goals
- **Attachment**: File attachments for goals
- **SelfAssessment**: Ratings and comments for qualitative goals
- **HabitEntry**: Daily completion records for habits
- **Streak**: Current and longest streak information
- **CompletionStats**: Statistics for recurring and habit goals
- **Recurrence**: Configuration for recurring goals (frequency, interval, etc.)

### Enums

- GoalType, GoalStatus, Priority, RecurrenceFrequency, QualitativeStatus

## Constraints

The following constraints are extracted from `specs/business-rules/goal-business-rules.md` and `specs/validation/goal.schemas.ts`:

### Business Rules (BR-001 to BR-011+)

- BR-001: Goal title must be 1-200 characters
- BR-002: Goal must have exactly one type
- BR-003: New goals must start as 'active' or 'paused'
- BR-004: Every goal must have a category
- BR-005: Quantitative goals require startValue, targetValue, currentValue, unit
- BR-006: Milestone goals must have at least one milestone
- BR-007: Recurring goals must have valid recurrence configuration
- BR-008: Habit goals must specify targetFrequency
- BR-009: Quantitative progress formula: ((current - start) / (target - start)) \* 100
- BR-010: Milestone progress: (completedMilestones / totalMilestones) \* 100
- BR-011: Binary goal progress: (currentCount / targetCount) \* 100 if targetCount set

### Validation Schemas

- Title: min 1, max 200 characters
- Description: max 5000 characters
- Numeric values: within min/max if specified, respect allowDecimals
- Dates: deadline after startDate if both provided
- UUIDs for IDs
- Arrays: notes, attachments, relatedGoals
- Enums: restricted to defined values
- Recurrence: interval positive, daysOfWeek for weekly, etc.
- Milestones: dependencies don't create cycles
- Progress: 0-100 for percentage

### Additional Constraints

- Progress cannot exceed 100% unless over-achievement allowed
- Goals cannot be created as 'completed' or 'cancelled'
- Sequential completion for milestone goals if configured
- Streak calculations for habits and recurring goals
- Local Storage quota limits for persistence
