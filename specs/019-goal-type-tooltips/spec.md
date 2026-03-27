# Feature Specification: Add help explaining each type of Goal

**Feature Branch**: `019-goal-type-tooltips`  
**Created**: 2026-03-26  
**Status**: Draft  
**Input**: User description: "issue #17 - Add help explaining each type of Goal"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View tooltip guidance when selecting goal type (Priority: P1)

A user opening the goal creation form can hover over the Goal Type field to see a tooltip explaining each available goal type.

**Why this priority**: This is the primary value proposition - helping users understand goal types at the moment of selection.

**Independent Test**: Can be tested by opening goal creation, hovering over the Goal Type label, and verifying tooltips appear for each goal type with accurate descriptions.

**Acceptance Scenarios**:

1. **Given** the goal creation form is open, **When** the user hovers over the Goal Type label, **Then** a tooltip appears explaining what goal types are and how to use them
2. **Given** the goal creation form is open, **When** the user hovers over each goal type option in the dropdown, **Then** a tooltip shows the type name, description, and example use case

---

### User Story 2 - Understand difference between similar goal types (Priority: P2)

A user unsure about the difference between similar goal types (e.g., Recurring vs Habit) can quickly compare them through tooltips.

**Why this priority**: Tooltips prevent users from choosing the wrong goal type, which leads to poor goal tracking experience.

**Independent Test**: Can be tested by hovering over "Recurring" and "Habit" options and verifying each has a distinct, clear explanation.

**Acceptance Scenarios**:

1. **Given** the user is viewing the Goal Type dropdown, **When** they hover over "Recurring", **Then** tooltip clarifies it tracks completion over time on a regular schedule
2. **Given** the user is viewing the Goal Type dropdown, **When** they hover over "Habit", **Then** tooltip clarifies it focuses on daily consistency with streak tracking

---

### User Story 3 - Make informed goal type selection (Priority: P3)

A new user can confidently select the appropriate goal type for their specific need based on the tooltip information.

**Why this priority**: Reduces confusion and improves goal type selection accuracy on first attempt.

**Independent Test**: Can be tested by giving a new user a goal scenario and verifying they can select the correct type after reading tooltips.

**Acceptance Scenarios**:

1. **Given** a user wants to track "exercise every day", **When** they read the Habit tooltip, **Then** they can determine Habit is the correct type
2. **Given** a user wants to track "submit weekly report", **When** they read the Recurring tooltip, **Then** they can determine Recurring is the correct type

---

### Edge Cases

- What happens when the user is on a mobile device where hover is not available? (Tooltip should also be accessible via tap)
- How does the tooltip handle very long descriptions? (Should truncate with ellipsis or wrap gracefully)
- What happens if tooltip content fails to load? (Should show graceful fallback or hide tooltip)

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST display a tooltip when users hover over the Goal Type label in the goal creation form
- **FR-002**: System MUST display individual tooltips for each goal type option in the dropdown menu
- **FR-003**: Each goal type tooltip MUST include: type name, brief description (1-2 sentences), and a concrete example
- **FR-004**: Tooltip content MUST accurately describe all six goal types: Quantitative, Qualitative, Binary, Milestone, Recurring, Habit
- **FR-005**: Users MUST be able to access tooltip information without opening additional dialogs or navigating away

### Key Entities

- **Goal Type**: The category of goal being created (six possible values)
- **Tooltip Content**: The explanatory text displayed on hover, containing description and example for each goal type

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 90% of new users can correctly identify the appropriate goal type for their goal after reading tooltips
- **SC-002**: Users complete goal type selection in under 30 seconds on average
- **SC-003**: Support tickets related to "which goal type should I use?" decrease by 60% within 3 months
- **SC-004**: First-time goal creation success rate (no edits to goal type after initial selection) improves by 40%

### Success Conditions

- All six goal types have clear, accurate tooltip descriptions
- Tooltips are visible without additional user action (hover/tap only)
- Tooltip content is concise (maximum 3 sentences per type)
- Each tooltip includes at least one concrete, relatable example
- UI is accessible on both desktop (hover) and mobile (tap) platforms
