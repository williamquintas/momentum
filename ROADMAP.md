# Implementation Roadmap - Goals Tracking System

## Overview

This document provides a step-by-step implementation guide based on:

- **GOALS_TRACKING_SYSTEM_PLAN.md** - Phase 1 requirements
- **specs/** - Complete specifications (types, validation, business rules, features)
- **.cursor/rules/** - Architecture, file organization, and coding standards

## Implementation Strategy

### Phase 1: Foundation (Start Here) ⭐

**Goal**: Build the core infrastructure and basic CRUD operations

#### Step 1: Local Storage Service Layer ✅

**Priority**: 🔴 Critical - Everything depends on this
**Status**: ✅ **COMPLETED**

**Files Created**:

- ✅ `src/services/storage/localStorageService.ts` - Core Local Storage wrapper
- ✅ `src/services/storage/goalStorageService.ts` - Goal-specific storage operations
- ✅ `src/services/storage/storageTypes.ts` - Storage data structures
- ✅ `src/services/storage/index.ts` - Service exports

**Implemented**:

- ✅ Normalized storage structure (goals index, individual goal storage)
- ✅ CRUD operations (create, read, update, delete)
- ✅ Index management (by type, status, category, tags)
- ✅ Error handling for storage quota, corrupted data
- ✅ Data migration support (version tracking)
- ✅ Date serialization/deserialization for Local Storage
- ✅ Query functionality with filters

**Why Start Here**: All data operations depend on this layer. It's the foundation.

---

#### Step 2: Type System Setup ✅

**Priority**: 🔴 Critical - Type safety foundation
**Status**: ✅ **COMPLETED**

**Files Created**:

- ✅ `src/features/goals/types/index.ts` - Re-export from specs
- ✅ Updated `tsconfig.json` to include specs directory

**Implemented**:

- ✅ Import and re-export all types from `specs/types/goal.types.ts`
- ✅ Re-export enums (GoalType, GoalStatus, Priority, etc.)
- ✅ Re-export all type interfaces (BaseGoal, QuantitativeGoal, etc.)
- ✅ Re-export type guards (isQuantitativeGoal, isQualitativeGoal, etc.)
- ✅ Re-export DTO types (CreateGoalInput, UpdateGoalInput, etc.)
- ✅ Updated tsconfig.json to include specs directory for type resolution

**Why Start Here**: TypeScript types are needed for all subsequent work.

---

#### Step 3: Validation Setup ✅

**Priority**: 🔴 Critical - Data integrity
**Status**: ✅ **COMPLETED**

**Files Created**:

- ✅ `src/features/goals/utils/validation.ts` - Validation utilities

**Implemented**:

- ✅ Re-exported all Zod schemas from `specs/validation/goal.schemas.ts`
- ✅ Created validation helper functions (validate, safeValidate)
- ✅ Implemented validation for Goal, CreateGoalInput, UpdateGoalInput, GoalFilters, UpdateProgressInput
- ✅ Created error handling utilities (zodErrorToFieldErrors, formatZodError, getFieldError)
- ✅ Set up Ant Design Form integration utilities (zodToAntdErrors, applyZodErrorsToForm, zodValidator)
- ✅ Created type guards (isValidGoal, isValidCreateGoalInput, isValidUpdateGoalInput)

**Why Start Here**: Validation is needed before storing any data.

---

#### Step 4: React Query Setup for Local Storage ✅

**Priority**: 🟡 High - State management
**Status**: ✅ **COMPLETED**

**Files Created**:

- ✅ `src/services/api/goalService.ts` - Service layer (wraps storage)
- ✅ `src/features/goals/hooks/useGoals.ts` - React Query hooks
- ✅ `src/features/goals/hooks/useCreateGoal.ts`
- ✅ `src/features/goals/hooks/useUpdateGoal.ts`
- ✅ `src/features/goals/hooks/useDeleteGoal.ts`
- ✅ `src/utils/queryKeys.ts` - Query key factory

**Implemented**:

- ✅ Service functions that call Local Storage service
- ✅ React Query hooks for CRUD operations
- ✅ Query key factory for consistent cache keys
- ✅ Optimistic updates for create, update, and delete operations
- ✅ Error handling with rollback on mutation errors
- ✅ Cache invalidation strategies
- ✅ Cache updates for both list and detail views

**Why Start Here**: React Query provides caching and state management for Local Storage data.

---

#### Step 5: Progress Calculation Utilities ✅

**Priority**: 🟡 High - Core business logic
**Status**: ✅ **COMPLETED**

**Files Created**:

- ✅ `src/features/goals/utils/calculateProgress.ts` - Progress calculation functions

**Implemented**:

- ✅ Quantitative goal progress calculation (BR-009)
- ✅ Binary goal progress calculation (BR-011)
- ✅ Qualitative goal progress calculation (BR-012)
- ✅ Milestone goal progress calculation (BR-010)
- ✅ Recurring goal progress calculation (BR-013)
- ✅ Habit goal progress calculation (BR-014)
- ✅ Progress clamping utility (BR-015)
- ✅ Main calculateProgress function that routes to type-specific calculators
- ✅ Type-safe implementation using type guards

**Why Start Here**: Progress calculation is needed for displaying goals and updating progress.

---

#### Step 6: Basic Goal Components ✅

**Priority**: 🟡 High - UI foundation
**Status**: ✅ **COMPLETED**

**Files Created**:

- ✅ `src/features/goals/components/GoalCard/GoalCard.tsx` - Display single goal
- ✅ `src/features/goals/components/GoalCard/index.ts`
- ✅ `src/features/goals/components/GoalCard/GoalCard.css` - Component styles
- ✅ `src/features/goals/components/GoalList/GoalList.tsx` - Display list of goals
- ✅ `src/features/goals/components/GoalList/index.ts`
- ✅ `src/features/goals/components/GoalForm/GoalForm.tsx` - Create/edit form
- ✅ `src/features/goals/components/GoalForm/index.ts`

**Implemented**:

- ✅ GoalCard: Display goal title, type, status, progress bar with Ant Design Card
- ✅ GoalList: Display multiple goals with Ant Design List component
- ✅ GoalForm: Basic form for creating goals (quantitative, qualitative, binary)
- ✅ Type-specific form fields that show/hide based on selected goal type
- ✅ Form validation using Zod schemas integrated with Ant Design Form
- ✅ Progress calculation integration in GoalCard
- ✅ Loading and empty states in GoalList
- ✅ Responsive layout using Ant Design Grid system
- ✅ Proper TypeScript typing throughout

**Why Start Here**: These are the core UI components users interact with.

---

#### Step 7: Goal List Page ✅

**Priority**: 🟡 High - Main user interface
**Status**: ✅ **COMPLETED**

**Files Created**:

- ✅ `src/pages/GoalsPage.tsx` - Main goals list page
- ✅ `src/features/goals/components/CreateGoalModal/CreateGoalModal.tsx` - Create goal modal
- ✅ `src/features/goals/components/CreateGoalModal/index.ts` - Modal exports
- ✅ Updated `src/App.tsx` to include `/goals` route

**Implemented**:

- ✅ Page layout with Ant Design Layout and Card components
- ✅ Goal list display using GoalList component
- ✅ Basic filtering (by status, type, priority, category)
- ✅ Search functionality with Input component
- ✅ View mode toggle (table/list) integration
- ✅ Create goal button that opens modal
- ✅ CreateGoalModal component wrapping GoalForm
- ✅ Empty state when no goals (handled by GoalList)
- ✅ Loading state (handled by GoalList)
- ✅ Filter clearing functionality
- ✅ Navigation to goal detail page on click
- ✅ Success/error messages for goal creation

**Why Start Here**: This is the main entry point for users.

---

#### Step 8: Goal Creation Flow ✅

**Priority**: 🟡 High - Core feature
**Status**: ✅ **COMPLETED**

**Files Created**:

- ✅ `src/pages/GoalDetailPage.tsx` - Goal detail page (placeholder for Step 9)
- ✅ Updated `src/pages/GoalsPage.tsx` - Enhanced goal creation flow with navigation
- ✅ Updated `src/App.tsx` - Added goal detail route

**Implemented**:

- ✅ Single form for goal creation (using existing CreateGoalModal and GoalForm)
- ✅ Support for quantitative, qualitative, binary goals (already implemented in Step 6)
- ✅ Form validation using Zod schemas (already implemented in Step 3)
- ✅ Success handling: Navigate to goal detail page after successful creation
- ✅ Error handling: User-friendly error messages and proper error state management
- ✅ Basic goal detail page placeholder with goal information display
- ✅ Route setup for goal detail page (`/goals/:id`)
- ✅ Loading and error states in goal detail page
- ✅ Type-specific information display (quantitative, binary, qualitative)

**Why Start Here**: Users need to create goals to use the system.

---

#### Step 9: Goal Detail Page

**Priority**: 🟢 Medium - View individual goals

**Files to Create**:

- `src/pages/GoalDetailPage.tsx` - Goal detail view
- `src/features/goals/components/GoalDetail/GoalDetail.tsx`
- Update routes

**What to Implement**:

- Display all goal information
- Progress visualization
- Edit goal button
- Delete goal button
- Type-specific display (quantitative shows values, binary shows checklist, etc.)

**Why Start Here**: Users need to view and manage individual goals.

---

#### Step 10: Progress Update Functionality

**Priority**: 🟢 Medium - Core tracking feature

**Files to Create**:

- `src/features/goals/components/UpdateProgressModal/UpdateProgressModal.tsx`
- `src/features/goals/hooks/useUpdateProgress.ts`

**What to Implement**:

- Modal/form for updating progress
- Type-specific update forms:
  - Quantitative: Update currentValue
  - Binary: Check/uncheck items
  - Qualitative: Update status
- Automatic progress calculation
- Progress history entry creation

**Why Start Here**: Progress tracking is a core feature.

---

### Phase 2: Enhanced Features (After Phase 1)

- Milestone-based goals
- Progress history visualization
- Calendar view
- Advanced filtering and search
- Dashboard overview

---

## Recommended Implementation Order

### Week 1: Foundation

1. ✅ **Local Storage Service Layer** (Step 1) - **COMPLETED**
2. ✅ **Type System Setup** (Step 2) - **COMPLETED**
3. ✅ **Validation Setup** (Step 3) - **COMPLETED**
4. ✅ **React Query Setup** (Step 4) - **COMPLETED**
5. ✅ **Progress Calculation** (Step 5) - **COMPLETED**

### Week 2: Basic UI

6. ✅ **Basic Goal Components** (Step 6) - **COMPLETED**
7. ✅ **Goal List Page** (Step 7) - **COMPLETED**
8. ✅ **Goal Creation Flow** (Step 8) - **COMPLETED**

### Week 3: Core Features

9. ✅ **Goal Detail Page** (Step 9)
10. ✅ **Progress Update** (Step 10)

---

## Key Files Structure

```
src/
├── services/
│   ├── storage/
│   │   ├── localStorageService.ts      # Step 1
│   │   ├── goalStorageService.ts        # Step 1
│   │   └── storageTypes.ts              # Step 1
│   └── api/
│       └── goalService.ts               # Step 4
├── features/
│   └── goals/
│       ├── types/
│       │   └── index.ts                 # Step 2
│       ├── utils/
│       │   ├── validation.ts            # Step 3
│       │   └── calculateProgress.ts     # Step 5
│       ├── hooks/
│       │   ├── useGoals.ts              # Step 4
│       │   ├── useCreateGoal.ts         # Step 4
│       │   ├── useUpdateGoal.ts         # Step 4
│       │   ├── useDeleteGoal.ts         # Step 4
│       │   └── useUpdateProgress.ts     # Step 10
│       └── components/
│           ├── GoalCard/                # Step 6
│           ├── GoalList/                # Step 6
│           ├── GoalForm/                # Step 6
│           ├── GoalDetail/              # Step 9
│           └── UpdateProgressModal/     # Step 10
├── pages/
│   ├── GoalsPage.tsx                    # Step 7
│   ├── GoalDetailPage.tsx               # Step 8 (placeholder), Step 9 (full implementation)
└── utils/
    └── queryKeys.ts                      # Step 4
```

---

## Important Considerations

### 1. Local Storage vs Backend API

- **This project uses Local Storage** (per specs)
- React Query is still used for caching and state management
- Service layer abstracts storage operations
- Future migration to API: Only change service layer

### 2. Type Safety

- All types are already defined in `specs/types/goal.types.ts`
- Use these types throughout the application
- Don't duplicate type definitions

### 3. Validation

- All validation schemas are in `specs/validation/goal.schemas.ts`
- Use Zod for runtime validation
- Validate before storing in Local Storage

### 4. Business Rules

- All business rules are in `specs/business-rules/goal-business-rules.md`
- Reference these when implementing logic
- Progress calculations must follow BR-009 through BR-015

### 5. Architecture

- Follow feature-based organization
- Use React Query for server state (even though it's Local Storage)
- Use Zustand for UI state (filters, modals, etc.)
- Keep components presentational when possible

---

## Testing Strategy

### Unit Tests

- Storage service functions
- Progress calculation utilities
- Validation functions
- Business rule implementations

### Component Tests

- GoalCard rendering
- GoalForm validation
- GoalList display

### Integration Tests

- Create goal flow
- Update progress flow
- Filter/search functionality

---

## Next Steps

1. **Start with Step 1**: Create the Local Storage service layer
2. **Follow the order**: Each step builds on previous steps
3. **Test as you go**: Write tests for each component
4. **Reference specs**: Always check specs for business rules and requirements
5. **Follow architecture rules**: Maintain clean separation of concerns

---

## Questions to Answer Before Starting

- ✅ Types defined? → Yes, in `specs/types/goal.types.ts`
- ✅ Validation schemas ready? → Yes, in `specs/validation/goal.schemas.ts`
- ✅ Business rules documented? → Yes, in `specs/business-rules/goal-business-rules.md`
- ✅ Architecture defined? → Yes, in `.cursor/rules/architecture.md`
- ✅ File organization clear? → Yes, in `.cursor/rules/file-organization.md`

**You're ready to start! Begin with Step 1: Local Storage Service Layer.**
