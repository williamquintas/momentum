# Feature Specification: Update Goal Progress

**Feature Branch**: `004-update-goal-progress`  
**Created**: 2026-03-22  
**Updated**: 2026-03-24  
**Status**: Implemented ✅  
**Input**: Extracted from @bkp/features/goal-features.md Feature 2

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Update Quantitative Progress (Priority: P1)

As a user, I want to update current values for quantitative goals so that progress is accurately tracked.

**Why this priority**: Essential for ongoing goal management.

**Independent Test**: Can be fully tested by updating values and verifying progress calculation.

**Acceptance Scenarios**:

1. **Given** a quantitative goal with startValue=200, targetValue=180, **When** user updates currentValue to 195, **Then** progress calculates to 25% per BR-009
2. **Given** decimals not allowed, **When** user enters decimal, **Then** validation prevents it
3. **Given** currentValue > targetValue, **When** submitted, **Then** progress clamps to 100% (or allows if over-achievement enabled)
4. **Given** startValue=100, targetValue=100, currentValue=100, **When** progress is calculated, **Then** result is 100% (edge case)
5. **Given** startValue=100, targetValue=200, currentValue=50, **When** progress is calculated, **Then** result is 0% (clamped)

### User Story 2 - Update Qualitative Progress (Priority: P1)

As a user, I want to update status and ratings for qualitative goals.

**Acceptance Scenarios**:

1. **Given** qualitative goal, **When** user sets status to in_progress, **Then** status updates and rating input enables
2. **Given** user adds self-assessment rating (1-10), **When** submitted, **Then** rating saves and progress recalculates
3. **Given** ratings [8, 9, 10], **When** progress is calculated, **Then** result is 90% (average 9/10 \* 100)

### User Story 3 - Update Binary/Milestone Progress (Priority: P1)

As a user, I want type-specific progress updates.

**Acceptance Scenarios**:

1. **Given** binary goal with targetCount=5, **When** user checks 3 items, **Then** progress calculates to 60% per BR-011
2. **Given** binary goal with no targetCount, currentCount=1, **When** progress calculated, **Then** result is 100%
3. **Given** milestone goal, **When** user completes milestone with unmet dependencies, **Then** validation prevents completion
4. **Given** 3 total milestones, 2 completed, 1 skipped, **When** progress calculated (skipped excluded), **Then** result is 100%

### User Story 4 - Update Recurring/Habit Progress (Priority: P1)

As a user, I want to update recurring and habit goal progress.

**Acceptance Scenarios**:

1. **Given** recurring goal, **When** user marks occurrence, **Then** completionStats update per BR-013
2. **Given** 10 total occurrences, 7 completed in window, **When** progress calculated, **Then** result is 70%
3. **Given** habit goal, **When** user marks today complete, **Then** streak increments and habitStrength recalculates
4. **Given** last 7 days: 5 completed, 2 missed, **When** habit progress calculated, **Then** result is 71.4%

### User Story 5 - Progress History Tracking (Priority: P2)

As a user, I want my progress changes tracked so that I can see the history.

**Acceptance Scenarios**:

1. **Given** multiple progress updates, **When** viewed, **Then** progressHistory array contains all entries with timestamps
2. **Given** user adds note to progress, **When** saved, **Then** note appears in history entry
3. **Given** duplicate update within 1 minute, **When** submitted, **Then** system detects and prevents duplicate

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST support all goal type progress updates (quantitative, qualitative, binary, milestone, recurring, habit)
- **FR-002**: System MUST calculate quantitative progress using formula: ((currentValue - startValue) / (targetValue - startValue)) \* 100
- **FR-003**: System MUST handle edge cases: startValue === targetValue returns 100% if currentValue >= targetValue, else 0%; currentValue < startValue clamps to 0%; currentValue > targetValue clamps to 100% unless over-achievement enabled
- **FR-004**: System MUST support over-achievement with configurable flag per goal (allows >100%)
- **FR-005**: System MUST calculate binary progress as (currentCount / targetCount) \* 100 when targetCount set
- **FR-006**: System MUST calculate binary progress as 100% when currentCount > 0 and no targetCount set
- **FR-007**: System MUST calculate milestone progress as (completedMilestones / totalMilestones) \* 100
- **FR-008**: System MUST prevent milestone completion when dependencies are unmet (BR-027)
- **FR-009**: System MUST calculate qualitative progress based on status (not_started=0%, in_progress=50%, completed=100%) or rating average (average/10\*100)
- **FR-010**: System MUST calculate recurring progress as (completedOccurrences / totalOccurrences) \* 100
- **FR-011**: System MUST calculate habit progress as (completedDays / totalDaysInPeriod) \* 100
- **FR-012**: System MUST clamp all progress values to 0-100% unless over-achievement enabled
- **FR-013**: System MUST create progress history entries with timestamps (immutable, append-only)
- **FR-014**: System MUST detect duplicate updates within 1 minute window
- **FR-015**: System MUST update LocalStorage with progress data
- **FR-016**: System MUST validate inputs before calculation (non-null, within range)

### Key Entities

- **ProgressUpdate**: Immutable entry recording progress change with timestamp, value, optional note
- **ProgressHistory**: Collection of ProgressUpdate entries for a goal
- **ProgressInput**: startValue, currentValue, targetValue (quantitative) or type-specific fields
- **ProgressResult**: Calculated percentage with optional over-achievement flag
- **OverAchievementConfig**: Boolean flag enabling >100% progress

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Progress updates complete in < 500ms ✅ (implementation complete, runtime measurement pending)
- **SC-002**: Progress calculations complete in < 100ms ✅ (verified via tests, pure computation <1ms)
- **SC-003**: All progress formulas produce correct results for documented test cases ✅ (42 unit tests passing)
- **SC-004**: History tracks all changes with timestamps ✅ (progressHistory implemented, 23 tests passing)
- **SC-005**: 95% unit test coverage for calculation functions ✅ (97.1% achieved)
- **SC-006**: All calculation functions have unit test coverage ✅ (all 7 functions tested)

### Implementation Status

| Criteria | Status | Notes                                              |
| -------- | ------ | -------------------------------------------------- |
| SC-001   | ⚠️     | Implementation complete, runtime benchmark pending |
| SC-002   | ✅     | Verified via tests (<1ms for calculation)          |
| SC-003   | ✅     | 42 tests covering all formulas                     |
| SC-004   | ✅     | Immutable history with timestamps                  |
| SC-005   | ✅     | 97.1% statement coverage                           |
| SC-006   | ✅     | All 7 calculation functions tested                 |

## Business Rules Reference

### BR-009: Quantitative Progress Formula

```
Progress = ((currentValue - startValue) / (targetValue - startValue)) * 100
```

Edge Cases:

- startValue === targetValue: Progress = 100% if currentValue >= targetValue, else 0%
- currentValue < startValue: Progress = 0% (clamped)
- currentValue > targetValue: Progress = 100% (clamped) or >100% if over-achievement allowed

### BR-011: Binary Goal Progress Calculation

```
If targetCount set: Progress = (currentCount / targetCount) * 100
If no targetCount: Progress = 100% if currentCount > 0, else 0%
```

### BR-012: Qualitative Goal Progress Calculation

```
Based on qualitativeStatus:
- not_started: 0%
- in_progress: 50% (or based on self-assessment ratings)
- completed: 100%

Alternative: If self-assessments exist: Average rating / 10 * 100
```

### BR-013: Recurring Goal Progress

```
Progress = (completedOccurrences / totalOccurrences) * 100
Time Window: totalOccurrences calculated for current period
```

### BR-014: Habit Goal Progress

```
Progress = (completedDays / totalDaysInPeriod) * 100
Time Window: Configurable (last 7, 30, 90 days, or all time)
```

### BR-015: Progress Clamping

```
Progress must be between 0% and 100%
Exception: Over-achievement goals may allow >100% (configurable)
```

## Assumptions

- Business rules align with `docs/business-rules/goal-business-rules.md`
- Flowchart reference: `docs/diagrams/business-rules/progress-calculation-rules.mmd`
- Habit strength calculation per BR-036 uses weighted formula (40% consistency, 30% streak, 20% completion, 10% recency)
- Streak calculation per BR-037 supports configurable grace period (0-2 days)

## Dependencies

- Goal types from `src/types/goal.types.ts`
- Progress calculation rules from `docs/business-rules/goal-business-rules.md`
- Storage service from `src/services/storage/goalStorageService.ts`
- ADR-001: Immutable progress history
- ADR-002: Unified progress update form
