# Tasks: Create Goal

**Input**: Design documents from `/specs/003-create-goal/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included as they support the acceptance scenarios defined in the specification and align with quality-first engineering principles.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 [P] Setup CreateGoalForm directory structure in src/features/goals/components/
- [ ] T002 [P] Create goalForm.types.ts for form-specific types in src/features/goals/components/types/
- [ ] T003 [P] Verify Zod dependency is installed (npm list zod)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 [P] Create useCreateGoal hook in src/features/goals/hooks/useCreateGoal.ts
- [ ] T005 [P] Create useGoalForm hook in src/features/goals/hooks/useGoalForm.ts for form state
- [ ] T006 [P] Create goalValidation.ts in src/features/goals/utils/ with validation utilities
- [ ] T007 [P] Create goalInitialization.ts in src/features/goals/utils/ with default values per type
- [ ] T008 [P] Extend goalStorageService.ts in src/services/storage/ with createGoal method
- [ ] T009 [P] Extend goalStore.ts in src/stores/ with creation state

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create Basic Goal (Priority: P1) 🎯 MVP

**Purpose**: Core goal creation with basic fields

- [ ] T010 [P] [US1] Create CreateGoalForm.tsx main component in src/features/goals/components/
- [ ] T011 [P] [US1] Add basic fields (title, type selector, priority, category) in CreateGoalForm.tsx
- [ ] T012 [P] [US1] Implement form submission handler in CreateGoalForm.tsx
- [ ] T013 [P] [US1] Add success navigation to goal detail page
- [ ] T014 [P] [US1] Add error display and handling
- [ ] T015 [P] [US1] Create component tests for CreateGoalForm in src/__tests__/features/goals/CreateGoalForm.test.tsx
- [ ] T016 [P] [US1] Create integration test for basic creation flow

**Definition of Done**: CreateGoalForm works for basic goals, validation shows errors, success navigates to detail page

---

## Phase 4: User Story 2 - Create Type-Specific Goals (Priority: P1) 🎯 MVP

**Purpose**: Support all 6 goal types with type-specific fields

- [ ] T017 [P] [US2] Create QuantitativeGoalFields.tsx in src/features/goals/components/
- [ ] T018 [P] [US2] Create QualitativeGoalFields.tsx in src/features/goals/components/
- [ ] T019 [P] [US2] Create BinaryGoalFields.tsx in src/features/goals/components/
- [ ] T020 [P] [US2] Create MilestoneGoalFields.tsx in src/features/goals/components/ with milestone array management
- [ ] T021 [P] [US2] Create RecurringGoalFields.tsx in src/features/goals/components/ with recurrence config
- [ ] T022 [P] [US2] Create HabitGoalFields.tsx in src/features/goals/components/ with frequency selector
- [ ] T023 [P] [US2] Integrate type-specific fields into CreateGoalForm with conditional rendering
- [ ] T024 [P] [US2] Add type guard functions in goalValidation.ts for each type
- [ ] T025 [P] [US2] Create unit tests for each type-specific field component
- [ ] T026 [P] [US2] Create integration tests for each goal type creation flow

**Definition of Done**: All 6 goal types creatable with correct fields, validation per type, data persists

---

## Phase 5: User Story 3 - Validation and Error Handling (Priority: P2)

**Purpose**: Clear validation with actionable error messages

- [ ] T027 [P] [US3] Add title validation (1-200 chars per BR-001) in goalValidation.ts
- [ ] T028 [P] [US3] Add type validation (BR-002) in goalValidation.ts
- [ ] T029 [P] [US3] Add category validation (BR-004) in goalValidation.ts
- [ ] T030 [P] [US3] Add quantitative-specific validation (BR-005) in goalValidation.ts
- [ ] T031 [P] [US3] Add milestone-specific validation (BR-006) in goalValidation.ts
- [ ] T032 [P] [US3] Add recurring-specific validation (BR-007) in goalValidation.ts
- [ ] T033 [P] [US3] Add habit-specific validation (BR-008) in goalValidation.ts
- [ ] T034 [P] [US3] Add deadline validation (deadline > startDate if both set)
- [ ] T035 [P] [US3] Add cyclic dependency detection for milestone dependencies
- [ ] T036 [P] [US3] Implement error display in CreateGoalForm with field-level feedback
- [ ] T037 [P] [US3] Add warning for past deadlines with override option
- [ ] T038 [P] [US3] Create validation unit tests in src/__tests__/features/goals/goalValidation.test.ts
- [ ] T039 [P] [US3] Create error scenario integration tests

**Definition of Done**: All validation rules enforced, error messages clear and actionable, users can correct and retry

---

## Phase 6: Testing and QA

- [ ] T040 [P] Run all tests: npm run test -- --testPathPattern=goals
- [ ] T041 [P] Manual testing: Create one goal of each type
- [ ] T042 [P] Manual testing: Attempt invalid inputs and verify error messages
- [ ] T043 [P] Accessibility testing: Tab navigation, screen reader, ARIA labels
- [ ] T044 [P] Performance testing: Form load time, creation time < 2s

---

## Phase 7: Documentation

- [ ] T045 Add code comments for complex validation logic
- [ ] T046 Update quickstart.md with usage examples
- [ ] T047 Update developer guide with testing instructions
