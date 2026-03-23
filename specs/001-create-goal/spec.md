# Feature Specification: Create Goal

**Feature Branch**: `003-create-goal`  
**Created**: 2026-03-22  
**Status**: Draft  
**Input**: Extracted from @bkp/features/goal-features.md Feature 1

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Create Basic Goal (Priority: P1)

As a user, I want to create a goal with basic information so that I can start tracking my objectives.

**Why this priority**: Core functionality for the app's primary purpose.

**Independent Test**: Can be fully tested by creating a goal and verifying it appears in the list.

**Acceptance Scenarios**:

1. **Given** a user navigates to goal creation, **When** they provide title, type, status, priority, category, **Then** the goal is created successfully
2. **Given** a user creates a goal, **When** the system validates input, **Then** invalid data shows clear error messages
3. **Given** a goal is created, **When** the process completes, **Then** the user is redirected to the goal detail page

### User Story 2 - Create Type-Specific Goals (Priority: P1)

As a user, I want to create goals with type-specific configurations so that I can track different kinds of objectives accurately.

**Why this priority**: Supports diverse goal types for broad user needs.

**Independent Test**: Test each goal type creation independently.

**Acceptance Scenarios**:

1. **Given** a user selects quantitative goal, **When** they provide startValue, targetValue, unit, **Then** the goal is created with correct calculations
2. **Given** a user selects milestone goal, **When** they add milestones, **Then** the system validates dependencies and order
3. **Given** a user selects recurring goal, **When** they set recurrence, **Then** the system validates the configuration

### User Story 3 - Validation and Error Handling (Priority: P2)

As a user, I want clear validation feedback so that I can correct errors and create valid goals.

**Why this priority**: Improves user experience and data integrity.

**Independent Test**: Test validation rules with invalid inputs.

**Acceptance Scenarios**:

1. **Given** invalid title length, **When** user submits, **Then** error message shows "Title must be 1-200 characters" (BR-001)
2. **Given** past deadline, **When** user submits, **Then** warning allows override
3. **Given** cyclic milestone dependencies, **When** user submits, **Then** error prevents creation

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST allow creation of all goal types with required fields
- **FR-002**: System MUST validate all inputs according to type-specific rules (BR-001 to BR-008)
- **FR-003**: System MUST generate unique UUID and timestamps on creation
- **FR-004**: System MUST initialize progress to 0% and related arrays
- **FR-005**: System MUST save to Local Storage with indexes
- **FR-006**: System MUST handle success navigation and error display

### Key Entities _(include if feature involves data)_

- **Goal**: Core entity with type-specific extensions (see @bkp/types/goal.types.ts)
- **CreateGoalInput**: Input DTO for creation

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 99% of valid goal creation attempts succeed
- **SC-002**: Average creation time < 2 seconds
- **SC-003**: Validation error messages are clear and actionable
- **SC-004**: All goal types support creation without errors

## Assumptions

- Local Storage persistence as per @bkp/
- UI follows Ant Design patterns
- Validation uses Zod schemas from @bkp/validation/goal.schemas.ts

## Dependencies

- Goal types from @bkp/types/goal.types.ts
- Storage service from @bkp/services/storage/goalStorageService.ts
- Validation schemas from @bkp/validation/goal.schemas.ts
