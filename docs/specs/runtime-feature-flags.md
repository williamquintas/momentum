# Spec: runtime-feature-flags

Scope: feature

# Runtime Feature Flags - Specification

## Overview

Add runtime-togglable feature flags to disable goal types (milestone, recurring, habit, attachment, notes) via environment variables at build/runtime.

## Environment Variables

| Variable                  | Type    | Default | Description             |
| ------------------------- | ------- | ------- | ----------------------- |
| `VITE_ENABLE_MILESTONE`   | boolean | true    | Enable milestone goals  |
| `VITE_ENABLE_RECURRING`   | boolean | true    | Enable recurring goals  |
| `VITE_ENABLE_HABIT`       | boolean | true    | Enable habit goals      |
| `VITE_ENABLE_ATTACHMENTS` | boolean | true    | Enable file attachments |
| `VITE_ENABLE_NOTES`       | boolean | true    | Enable goal notes       |

## Functionality

### 1. Feature Flag Configuration

- Extend `FeatureFlags` interface in `src/utils/featureFlags.ts`
- Add helper function `isGoalTypeEnabled(type: GoalType): boolean`
- Add helper function `isFeatureEnabled(feature: 'attachments' | 'notes'): boolean`

### 2. UI Filtering

- **GoalForm**: Hide disabled goal types from type selector dropdown
- **GoalList**: Hide disabled types from filter options
- **GoalCard**: Hide disabled features (attachments/notes sections)

### 3. Validation

- **useGoalForm**: Prevent selection of disabled goal types
- **useCreateGoal**: Reject creation of disabled goal types with error message
- **useUpdateGoal**: Prevent adding attachments/notes if disabled

## Acceptance Criteria

1. Setting `VITE_ENABLE_MILESTONE=false` removes milestone from goal type selector
2. Setting `VITE_ENABLE_ATTACHMENTS=false` hides attachment UI and prevents upload
3. All flags default to true (features enabled by default)
4. TypeScript compilation fails if non-boolean value passed to env vars
5. Disabled features are completely hidden from UI (no broken functionality)
