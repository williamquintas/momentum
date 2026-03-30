---
plan name: runtime-feature-flags
plan description: Runtime feature flags for goal types
plan status: done
---

## Idea

Add runtime-togglable feature flags to disable goal types (milestone, recurring, habit, attachment, notes) at runtime via environment variables

## Implementation

- Add goal-type-specific feature flags to featureFlags.ts (milestone, recurring, habit, attachment, notes)
- Create getGoalTypeAvailability() helper to check if a goal type is enabled
- Update GoalForm to hide disabled goal types from type selector
- Update goal creation validation to reject disabled types
- Update GoalList filters to hide disabled types
- Add environment variable definitions to vite-env.d.ts for type safety

## Required Specs

<!-- SPECS_START -->

- runtime-feature-flags
<!-- SPECS_END -->
