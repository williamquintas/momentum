# ADR-002: Unified Progress Update Form

**Date**: 2026-03-24  
**Status**: Accepted  
**Feature**: 004-update-goal-progress  
**Feature Branch**: 017-progress-business-rules

## Context

Goal progress updates must support six distinct goal types:

- Quantitative (numeric values with units)
- Qualitative (status and ratings)
- Binary (achieved/not achieved toggles)
- Milestone (per-milestone completion)
- Recurring (occurrence tracking)
- Habit (daily tracking with streaks)

Each type has unique input requirements. We must decide between:

1. **Separate forms**: One form per goal type
2. **Unified form**: Single form with type-specific conditional rendering

## Decision

**Choice**: Single unified `ProgressUpdateForm` component with conditional rendering for type-specific fields.

## Rationale

### Benefits

1. **Consistent UX**: Users encounter the same interaction pattern regardless of goal type
2. **Code Reuse**: Shared form infrastructure (validation, submission, state management) benefits all types
3. **Extensibility**: Adding new goal types requires adding field components, not entire forms
4. **Easier Testing**: One component to test with varying props
5. **Reduced Boilerplate**: No need for type-based routing or form factories

### Trade-offs

1. **Form Complexity**: Conditional logic increases component complexity
2. **Bundle Size**: All field components loaded regardless of goal type
3. **Prop Explosion**: Form accepts many optional props for different types

## Consequences

### Positive

- Consistent user experience across all goal types
- Shared validation logic reduces bugs
- Future goal types can integrate with minimal effort

### Negative

- Larger component than single-purpose alternatives
- Requires discipline to keep conditional logic clean
- Slight bundle size increase

## Implementation

```
ProgressUpdateForm (unified)
├── QuantitativeProgressField
├── QualitativeProgressField
├── BinaryProgressField
├── MilestoneProgressField
├── RecurringProgressField
└── HabitProgressField
```

### Form Props Interface

```typescript
interface ProgressUpdateFormProps {
  goalId: string;
  goalType: GoalType;
  onSubmit: (update: ProgressUpdate) => Promise<void>;
  onCancel?: () => void;
  initialValues?: Partial<ProgressUpdate>;
}
```

### Type Discrimination

The form uses `goalType` prop to:

1. Select which sub-component to render
2. Choose the appropriate Zod validation schema
3. Configure field labels and units

## Alternatives Considered

### 1. Separate Forms per Type

- **Rejected**: Inconsistent UX, code duplication, harder to extend
- **Pro**: Simpler components, smaller bundle
- **Con**: Six separate components to maintain

### 2. Form Factory Pattern

- **Rejected**: Over-engineered abstraction
- **Complexity**: Routing logic移到 factory instead of form

### 3. Single Field Component with Polymorphism

- **Rejected**: Harder to type safely
- **Risk**: Props become "any"-typed

## References

- Feature plan: `specs/004-update-goal-progress/plan.md` (Decision 3)
- Type definitions: `src/features/goals/types/progress.ts`
- Validation schemas: `src/features/goals/validation/progressSchemas.ts`
