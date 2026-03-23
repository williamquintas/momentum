# Implementation Plan: Create Goal

**Branch**: `003-create-goal` | **Date**: 2026-03-22 | **Spec**: [specs/003-create-goal/spec.md](specs/003-create-goal/spec.md)
**Input**: Feature specification from `/specs/003-create-goal/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement goal creation functionality supporting all goal types (quantitative, qualitative, binary, milestone, recurring, habit) with comprehensive validation, Local Storage persistence, and proper error handling. Built using React with Ant Design components, leveraging existing UI patterns and validation schemas.

## Technical Context

**Language/Version**: TypeScript 5.3.3, React 18.2.0  
**Primary Dependencies**: React, Ant Design 5.12.8, Zustand 4.4.7, React Query 5.17.9, React Router 6.21.1, Zod 3.x  
**Storage**: Local storage for goal persistence with normalized indexes  
**Testing**: Vitest with React Testing Library  
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge)  
**Project Type**: Single-page web application (SPA) built with Vite  
**Performance Goals**: Form load < 1s, goal creation validation < 500ms  
**Constraints**: WCAG 2.1 AA accessibility, responsive design, Local Storage quota limits  
**Scale/Scope**: Support creation of all 6 goal types with type-specific validations

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Quality-First Engineering ✅

- TypeScript strict mode enforced via tsconfig
- Validation: All business rules (BR-001 to BR-008) enforced via Zod schemas
- Testing: Unit tests for validation, component tests for form, integration tests for creation flow
- Error handling: Clear, actionable validation messages for users

### User Experience and Performance ✅

- Performance: Form interactive < 1s, creation complete < 2s
- Accessibility: Keyboard navigation for all form fields, ARIA labels for inputs
- Responsive: Form adapts to mobile and desktop viewports
- Intuitive: Type selection guides user through type-specific fields

### Clean Architecture and Componentization ✅

- Components: CreateGoalForm component in src/features/goals/components/
- Hooks: useCreateGoal hook in src/features/goals/hooks/
- Utilities: Validation utilities in src/features/goals/utils/
- Modularity: Separate logic for each goal type

### Observability, DevOps, and Infrastructure ✅

- Error handling: Creation failures logged with context
- Monitoring: Goal creation events tracked for analytics

### Documentation and Governance ✅

- Documentation: Creation flow documented in spec.md
- Code: Type-safe code with TypeScript and Zod validation
- Governance: Follows existing goals feature patterns

## Project Structure

### Source Code Layout

```
src/
├── components/
│   └── features/
│       └── goals/
│           ├── CreateGoalForm.tsx          # NEW: Main form component
│           ├── CreateGoalForm.module.css   # NEW: Form styling
│           └── types/
│               └── goalForm.types.ts       # NEW: Form-specific types
├── features/
│   └── goals/
│       ├── hooks/
│       │   ├── useCreateGoal.ts           # NEW: Creation hook
│       │   └── useGoalForm.ts             # NEW: Form state hook
│       ├── components/
│       │   ├── QuantitativeGoalFields.tsx # NEW: Type-specific fields
│       │   ├── QualitativeGoalFields.tsx  # NEW: Type-specific fields
│       │   ├── BinaryGoalFields.tsx       # NEW: Type-specific fields
│       │   ├── MilestoneGoalFields.tsx    # NEW: Type-specific fields
│       │   ├── RecurringGoalFields.tsx    # NEW: Type-specific fields
│       │   └── HabitGoalFields.tsx        # NEW: Type-specific fields
│       └── utils/
│           ├── goalValidation.ts          # NEW: Validation utilities
│           └── goalInitialization.ts      # NEW: Default values per type
├── services/
│   └── storage/
│       └── goalStorageService.ts          # EXTEND: Add creation logic
└── stores/
    └── goalStore.ts                       # EXTEND: Add creation state
```

**Structure Decision**: New components and hooks in src/features/goals/ to extend existing goal module. Validation utilities in utils/ folder for reusability.

## Complexity Tracking

**Complexity Estimate**: Medium

- 6 goal types with different field requirements
- Form state management (11+ input types)
- Validation with 8+ business rules
- Local Storage persistence with indexes

**Mitigation**: Reuse existing form patterns from 001-onboarding-tutorial, leverage Ant Design Form component for state management, use Zod for centralized validation.

## Decision Log

1. **Form Component Strategy**: Single CreateGoalForm with conditional type-specific field rendering (vs. separate forms per type)
   - **Rationale**: Reduces duplication, maintains consistent UX flow
2. **Validation Approach**: Zod schemas with type guards per goal type
   - **Rationale**: Type-safe, matches existing @bkp/validation/goal.schemas.ts patterns

3. **State Management**: React Form state + Zustand for creation context
   - **Rationale**: Aligns with existing state management patterns
