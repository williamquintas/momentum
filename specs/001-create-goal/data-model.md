# Data Model: Create Goal

**Feature**: Create Goal | **Date**: 2026-03-22
**Purpose**: Define data structures for goal creation

## Entities

### Goal (Base and Type-Specific)
See @bkp/types/goal.types.ts for full definitions:
- **BaseGoal**: Common fields for all goals
  - id: string (UUID)
  - title: string (1-200 chars per BR-001)
  - description: string (max 5000 chars)
  - type: GoalType
  - status: GoalStatus (defaults to 'active' per BR-003)
  - priority: Priority
  - category: string (required per BR-004)
  - tags: string[]
  - createdAt, updatedAt: Date
  - progress: number (0-100%)
  - progressHistory: ProgressEntry[]
  - notes: Note[]
  - attachments: Attachment[]
  - relatedGoals: string[]

- **QuantitativeGoal**: Extends BaseGoal
  - startValue: number
  - targetValue: number
  - currentValue: number
  - unit: string
  - allowDecimals: boolean
  - minValue?, maxValue?: number

- **QualitativeGoal**: Extends BaseGoal
  - qualitativeStatus: QualitativeStatus
  - selfAssessments: SelfAssessment[]
  - targetRating?: number

- **BinaryGoal**: Extends BaseGoal
  - targetCount?: number
  - currentCount: number
  - items?: string[]
  - allowPartialCompletion: boolean

- **MilestoneGoal**: Extends BaseGoal
  - milestones: Milestone[]
  - allowMilestoneReordering: boolean
  - requireSequentialCompletion: boolean

- **RecurringGoal**: Extends BaseGoal
  - recurrence: Recurrence
  - completionStats: CompletionStats
  - occurrences: HabitEntry[]

- **HabitGoal**: Extends BaseGoal
  - targetFrequency: 'daily' | 'every_other_day' | 'weekly' | 'custom'
  - customFrequency?: number
  - completionStats: CompletionStats
  - entries: HabitEntry[]

### CreateGoalInput
Partial Goal structure for input validation (omits id, timestamps, progress fields):
- Includes all required type-specific fields per type

## Data Flow

1. User provides input → Validate with Zod schemas (@bkp/validation/goal.schemas.ts)
2. Generate UUID and timestamps
3. Initialize progress to 0%, notes [], attachments [], relatedGoals []
4. Save to Local Storage with indexes (@bkp/services/storage/goalStorageService.ts)
5. Update UI state and navigate to goal detail

## Storage Strategy

### Local Storage
- Uses normalized structure with indexes for type, status, category, tags
- Indexes enable efficient filtering and search
- See @bkp/services/storage/goalStorageService.ts

## Validation Rules

### Input Validation (from Business Rules)

- **Title (BR-001)**: 1-200 characters
- **Type (BR-002)**: Exactly one type required
- **Status (BR-003)**: Default to 'active' or 'paused' on creation
- **Category (BR-004)**: Required, non-empty
- **Quantitative (BR-005)**: startValue, targetValue, currentValue, unit required; values within ranges
- **Milestone (BR-006)**: At least one milestone required
- **Recurring (BR-007)**: Valid recurrence config (frequency, interval, daysOfWeek for weekly)
- **Habit (BR-008)**: targetFrequency required; customFrequency required if targetFrequency is 'custom'

### Additional Validation
- Dates: deadline after startDate if both provided
- Dependencies: No cyclic dependencies in milestone milestones
- Numeric: Respect allowDecimals setting

## Schema Evolution

Based on @bkp/types/goal.types.ts versioning.
