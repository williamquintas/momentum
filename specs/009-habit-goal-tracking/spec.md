# Feature Specification: Habit Goal Tracking

**Feature Branch**: `011-habit-goal-tracking`  
**Created**: 2026-03-22  
**Status**: Draft  
**Input**: Extracted from @bkp/features/goal-features.md Feature 9

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Track Daily Habits (Priority: P1)

As a user, I want to mark daily habit completion and track streaks.

**Acceptance Scenarios**:

1. **Given** habit goal, **When** user marks today complete, **Then** entry recorded and streak increments
2. **Given** consecutive completions, **When** one missed, **Then** streak resets
3. **Given** habit calendar, **When** viewed, **Then** heatmap shows completion pattern

## Requirements _(mandatory)_

- **FR-001**: Daily marking UI
- **FR-002**: Streak and habit strength calculation
- **FR-003**: Calendar heatmap visualization
- **FR-004**: History tracking with missed days

## Success Criteria _(mandatory)_

- **SC-001**: Habit strength accurately reflects consistency
- **SC-002**: Streak calculations correct

## Dependencies

- HabitEntry and Streak types from @bkp/types/goal.types.ts
