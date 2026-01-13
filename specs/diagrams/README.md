# Goal Tracking System - Visual Diagrams

This directory contains machine-readable diagrams for the Goals Tracking Management System, created using Mermaid syntax.

## Diagram Organization

- **data-flow/**: Data flow diagrams showing how data moves through the system
- **decision-trees/**: Decision trees and flow charts for key decision points
- **workflows/**: User journey workflow diagrams
- **architecture/**: System architecture, type relationships, and state diagrams
- **business-rules/**: Visual representations of key business rules

## Viewing Diagrams

These Mermaid diagrams can be viewed in:

- GitHub (renders automatically in markdown files)
- VS Code (with Mermaid extension)
- Mermaid Live Editor: https://mermaid.live/
- Documentation tools (Docusaurus, GitBook, etc.)
- Many other markdown renderers

## Diagram Types

- **Flowcharts**: Process flows and decision trees
- **Sequence Diagrams**: Interactions between components
- **State Diagrams**: Status transitions and state machines
- **Entity Relationship Diagrams**: Type relationships
- **Gantt Charts**: Timeline views (if applicable)

## Usage

These diagrams should be:

1. Referenced during development
2. Used in code reviews
3. Updated when specifications change
4. Included in documentation

## Files

### Data Flow Diagrams

- `data-flow/create-goal-flow.mmd` - Complete flow for creating a goal
- `data-flow/update-progress-flow.mmd` - Flow for updating goal progress
- `data-flow/filter-search-flow.mmd` - Flow for filtering and searching goals

### Decision Trees

- `decision-trees/goal-creation-decision-tree.mmd` - Decision tree for goal creation
- `decision-trees/progress-update-decision-tree.mmd` - Decision tree for progress updates
- `decision-trees/status-transition-decision-tree.mmd` - Decision tree for status changes

### Workflows

- `workflows/create-quantitative-goal-workflow.mmd` - Sequence diagram for creating quantitative goals
- `workflows/update-progress-workflow.mmd` - Sequence diagram for updating progress
- `workflows/milestone-completion-workflow.mmd` - Sequence diagram for completing milestones

### Architecture

- `architecture/goal-type-relationships.mmd` - ER diagram showing goal type relationships
- `architecture/status-transition-state-diagram.mmd` - State diagram for status transitions

### Business Rules

- `business-rules/milestone-dependency-validation.mmd` - Flowchart for dependency validation
- `business-rules/progress-calculation-rules.mmd` - Flowchart for progress calculation logic
