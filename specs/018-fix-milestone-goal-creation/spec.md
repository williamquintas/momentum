# Feature Specification: Fix Milestone Goal Creation

**Feature Branch**: `018-fix-milestone-goal-creation`  
**Created**: 2026-03-25  
**Status**: Draft  
**Input**: User description: "bugfix https://github.com/williamquintas/momentum/issues/21"

## User Scenarios & Testing

### User Story 1 - Create Milestone Goal Successfully (Priority: P1)

As a user, I want to create a Milestone goal with multiple milestones so that I can track multi-step projects.

**Why this priority**: This is the core functionality that's currently broken - users cannot create Milestone goals at all, blocking the main use case.

**Independent Test**: Can be tested by clicking "Create Goal", selecting "Milestone" type, adding milestones with titles, and clicking "Create goal" - the goal should be created and appear in the goals list.

**Acceptance Scenarios**:

1. **Given** user is on the goal creation form, **When** they select "Milestone" goal type and fill in required fields, **Then** the "Create goal" button should submit the form and create the goal.

2. **Given** user has added 3-4 milestones with titles, **When** they click "Create goal", **Then** all milestones should be created with "pending" status and progress should calculate as (completed / total) \* 100.

3. **Given** user fills in optional due dates for milestones, **When** they create the goal, **Then** the due dates should be saved and displayed.

---

### User Story 2 - Form Validation Feedback (Priority: P2)

As a user, I want to receive clear feedback when there are validation errors so that I can correct my input.

**Why this priority**: Users need to understand what went wrong if their input is invalid, rather than experiencing silent failures.

**Independent Test**: Can be tested by attempting to create a Milestone goal with missing required fields and verifying error messages appear.

**Acceptance Scenarios**:

1. **Given** user tries to submit with empty required fields, **When** they click "Create goal", **Then** validation errors should be displayed inline next to the affected fields.

---

### Edge Cases

- What happens when the user adds no milestones before creating the goal?
- What happens when milestone titles are empty?
- How does the system handle duplicate milestone titles?
- What happens when network error occurs during submission?

## Requirements

### Functional Requirements

- **FR-001**: System MUST allow users to select "Milestone" as a goal type when creating a new goal.
- **FR-002**: System MUST allow users to add multiple milestones with titles to a Milestone goal.
- **FR-003**: System MUST submit the Milestone goal form when "Create goal" button is clicked.
- **FR-004**: System MUST create milestones with "pending" status by default.
- **FR-005**: System MUST calculate progress as (completed / total) \* 100.
- **FR-006**: System MUST display validation errors when required fields are missing.
- **FR-007**: System MUST support optional due dates for milestones.
- **FR-008**: System MUST support `requireSequentialCompletion` and `allowMilestoneReordering` properties.

### Key Entities

- **Milestone Goal**: A goal type containing multiple milestones with sequential completion options.
- **Milestone**: A sub-goal within a Milestone goal with title, status, order, and optional due date.
- **Goal Progress**: Calculated metric showing completion percentage.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can successfully create a Milestone goal with at least 3 milestones in under 2 minutes.
- **SC-002**: 100% of Milestone goal creation attempts that pass validation result in a created goal.
- **SC-003**: Users receive visible error feedback within 1 second when validation fails.
- **SC-004**: Created Milestone goals display correctly in the goals list with accurate progress calculations.
