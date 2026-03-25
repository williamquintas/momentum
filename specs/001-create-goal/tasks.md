# Tasks: Create Goal

**Input**: Design documents from `/specs/001-create-goal/`
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

- [x] T001 [P] Setup CreateGoalForm directory structure in src/features/goals/components/
- [x] T002 [P] Create goalForm.types.ts for form-specific types in src/features/goals/components/types/
- [x] T003 [P] Verify Zod dependency is installed (npm list zod)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete. Although tasks are marked [P], they are logically sequential in rollout and must be completed before Phase 3 starts.

- [x] T004 [P] Create useCreateGoal hook in src/features/goals/hooks/useCreateGoal.ts
- [x] T005 [P] Create useGoalForm hook in src/features/goals/hooks/useGoalForm.ts for form state
- [x] T006 [P] Create goalValidation.ts in src/features/goals/utils/ with validation utilities
- [x] T007 [P] Create goalInitialization.ts in src/features/goals/utils/ with default values per type
- [x] T008 [P] Extend goalStorageService.ts in src/services/storage/ with createGoal method
- [x] T009 [P] Extend goalStore.ts in src/stores/ with creation state
- [x] T048 [x] Implement goal initialization logic (UUID/timestamps/progress default 0%, empty milestone/occurrence arrays) in creation pipeline

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create Basic Goal (Priority: P1) 🎯 MVP

**Purpose**: Core goal creation with basic fields

- [x] T010 [P] [US1] Create CreateGoalForm.tsx main component in src/features/goals/components/
- [x] T011 [P] [US1] Add basic fields (title, type selector, priority, category) in CreateGoalForm.tsx
- [x] T012 [P] [US1] Implement form submission handler in CreateGoalForm.tsx
- [x] T013 [P] [US1] Add success navigation to goal detail page
- [x] T014 [P] [US1] Add error display and handling
- [x] T015 [P] [US1] Create component tests for CreateGoalForm in src/**tests**/features/goals/CreateGoalForm.test.tsx
- [x] T016 [P] [US1] Create integration test for basic creation flow

**Definition of Done**: CreateGoalForm works for basic goals, validation shows errors, success navigates to detail page

---

## Phase 4: User Story 2 - Create Type-Specific Goals (Priority: P1) 🎯 MVP

**Purpose**: Support all 6 goal types with type-specific fields

- [x] T017 [P] [US2] Create QuantitativeGoalFields.tsx in src/features/goals/components/
- [x] T018 [P] [US2] Create QualitativeGoalFields.tsx in src/features/goals/components/
- [x] T019 [P] [US2] Create BinaryGoalFields.tsx in src/features/goals/components/
- [x] T020 [P] [US2] Create MilestoneGoalFields.tsx in src/features/goals/components/ with milestone array management
- [x] T021 [P] [US2] Create RecurringGoalFields.tsx in src/features/goals/components/ with recurrence config
- [x] T022 [P] [US2] Create HabitGoalFields.tsx in src/features/goals/components/ with frequency selector
- [x] T023 [P] [US2] Integrate type-specific fields into CreateGoalForm with conditional rendering
- [x] T024 [P] [US2] Add type guard functions in goalValidation.ts for each type
- [x] T025 [P] [US2] Create unit tests for each type-specific field component
- [x] T026 [P] [US2] Create integration tests for each goal type creation flow

**Definition of Done**: All 6 goal types creatable with correct fields, validation per type, data persists

---

## Phase 5: User Story 3 - Validation and Error Handling (Priority: P2)

**Purpose**: Clear validation with actionable error messages

- [x] T027 [P] [US3] Add title validation (1-200 chars per BR-001) in goalValidation.ts
- [x] T028 [P] [US3] Add type validation (BR-002) in goalValidation.ts
- [x] T029 [P] [US3] Add category validation (BR-004) in goalValidation.ts
- [x] T030 [P] [US3] Add quantitative-specific validation (BR-005) in goalValidation.ts
- [x] T031 [P] [US3] Add milestone-specific validation (BR-006) in goalValidation.ts
- [x] T032 [P] [US3] Add recurring-specific validation (BR-007) in goalValidation.ts
- [x] T033 [P] [US3] Add habit-specific validation (BR-008) in goalValidation.ts
- [x] T034 [P] [US3] Add deadline validation (deadline > startDate if both set)
- [x] T035 [P] [US3] Add cyclic dependency detection for milestone dependencies
- [x] T036 [P] [US3] Implement error display in CreateGoalForm with field-level feedback
- [x] T037 [P] [US3] Add warning for past deadlines with override option
- [x] T038 [P] [US3] Create validation unit tests in src/**tests**/features/goals/goalValidation.test.ts
- [x] T039 [P] [US3] Create error scenario integration tests

**Definition of Done**: All validation rules enforced, error messages clear and actionable, users can correct and retry

---

## Phase 6: Testing and QA

- [x] T049 [x] Add automated success-rate validation test for creation path (assert >=99% valid input success for seed data)
- [x] T050 [x] Add automated creation latency test (assert average goal creation < 2s in test harness)
- [x] T040 [P] Run all tests: npm run test -- --testPathPattern=goals
- [x] T041 [P] Manual testing: Create one goal of each type
- [x] T042 [P] Manual testing: Attempt invalid inputs and verify error messages
- [x] T043 [P] Accessibility testing: Tab navigation, screen reader, ARIA labels
- [x] T044 [P] Performance testing: Form load time, creation time < 2s

---

## Phase 7: Documentation

- [x] T045 Add code comments for complex validation logic
- [x] T046 Update quickstart.md with usage examples
- [x] T047 Update developer guide with testing instructions
