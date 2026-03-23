# Momentum - AI Assistant Rules Index

This directory contains comprehensive guidelines for developing Momentum, aimed at all AI coding assistants. Each file covers a specific aspect of development.

## Project Tech Stack

### Core Development

- **[Code Standards](./.ai-assistant/rules/code-standards.md)** - TypeScript, React patterns, component structure, naming conventions, and code quality
- **[File Organization](./.ai-assistant/rules/file-organization.md)** - Directory structure and naming conventions
- **[Architecture](./.ai-assistant/rules/architecture.md)** - System architecture, component architecture, and design patterns

### Data & State

- **[State Management](./.ai-assistant/rules/state-management.md)** - Zustand/Redux patterns and React Query usage
- **[API & Data Handling](./.ai-assistant/rules/api-data-handling.md)** - API service patterns, data transformation, and error handling

### UI & Components

- **[UI Component Guidelines](./.ai-assistant/rules/ui-component-guidelines.md)** - Component guidelines, Ant Design usage, spacing, theming, and responsive design
- **[Accessibility](./.ai-assistant/rules/accessibility.md)** - HTML semantics, ARIA, keyboard navigation, and visual accessibility

### Implementation

- **[Common Patterns](./.ai-assistant/rules/common-patterns.md)** - Reusable patterns for common workflows
- **[Error Handling](./.ai-assistant/rules/error-handling.md)** - Comprehensive error handling strategies

### Quality & Testing

- **[Testing Considerations](./.ai-assistant/rules/testing.md)** - Unit, component, and integration testing guidelines
- **[Linting & Formatting](./.ai-assistant/rules/linting-formatting.md)** - ESLint, Prettier, and TypeScript configuration
- **[Performance Optimization](./.ai-assistant/rules/performance-optimization.md)** - Rendering, data loading, and bundle optimization

### Operations

- **[Observability & Logging](./.ai-assistant/rules/observability-logging.md)** - Monitoring, metrics, error tracking, structured logging, and best practices
- **[Deployment](./.ai-assistant/rules/deployment.md)** - CI/CD, build process, and deployment strategies
- **[Environment Configuration](./.ai-assistant/rules/environment-config.md)** - Environment variables and configuration management

### Security & Workflow

- **[Security](./.ai-assistant/rules/security.md)** - Authentication, authorization, data protection, and security best practices
- **[Git Workflow](./.ai-assistant/rules/git-workflow.md)** - Branching strategy, commit messages, and PR process
- **[Dependencies](./.ai-assistant/rules/dependencies.md)** - Package management, updates, and security audits

### Specifications & Requirements

- **[Business Rules](./specs/business-rules/goal-business-rules.md)** - All business rules, constraints, and validation policies for goals
- **[Data Flow](./specs/data-flow/goal-data-flow.md)** - Detailed data flow specifications for API calls, state management, and UI updates
- **[Decision Trees](./specs/decision-trees/goal-decision-trees.md)** - Decision trees and flow charts for key processes and decision points
- **[Feature Specifications](./specs/features/goal-features.md)** - Detailed feature specs with acceptance criteria for all goal features
- **[Test Specifications](./specs/tests/goal-test-specs.md)** - Comprehensive test specifications organized by test type and feature
- **[Type Definitions](./specs/types/goal.types.ts)** - TypeScript type definitions for all goal-related data structures
- **[Validation Schemas](./specs/validation/goal.schemas.ts)** - Zod validation schemas for runtime data validation
- **[Workflow Charts](./specs/workflows/goal-workflows.md)** - Detailed workflow charts for key user journeys and system processes

## How to Use

When working on a specific aspect of the project, refer to the relevant file:

### Getting Started

- **Starting a new feature?** → Check [File Organization](./.ai-assistant/rules/file-organization.md), [Architecture](./.ai-assistant/rules/architecture.md), and [UI Component Guidelines](./.ai-assistant/rules/ui-component-guidelines.md)
- **Setting up the project?** → See [Environment Configuration](./.ai-assistant/rules/environment-config.md) and [Dependencies](./.ai-assistant/rules/dependencies.md)

### Development

- **Working with goals?** → See [Common Patterns](./.ai-assistant/rules/common-patterns.md), [State Management](./.ai-assistant/rules/state-management.md), and [Business Rules](./specs/business-rules/goal-business-rules.md)
- **Building components?** → Review [Code Standards](./.ai-assistant/rules/code-standards.md), [UI Component Guidelines](./.ai-assistant/rules/ui-component-guidelines.md), and [Feature Specifications](./specs/features/goal-features.md)
- **Setting up state?** → Check [State Management](./.ai-assistant/rules/state-management.md) and [Data Flow](./specs/data-flow/goal-data-flow.md)
- **Implementing API calls?** → See [API & Data Handling](./.ai-assistant/rules/api-data-handling.md), [Error Handling](./.ai-assistant/rules/error-handling.md), and [Data Flow](./specs/data-flow/goal-data-flow.md)
- **Following common workflows?** → Review [Common Patterns](./.ai-assistant/rules/common-patterns.md) and [Workflow Charts](./specs/workflows/goal-workflows.md)
- **Understanding business logic?** → Check [Business Rules](./specs/business-rules/goal-business-rules.md) and [Decision Trees](./specs/decision-trees/goal-decision-trees.md)
- **Defining types?** → Use [Type Definitions](./specs/types/goal.types.ts) and [Validation Schemas](./specs/validation/goal.schemas.ts)

### Quality & Operations

- **Writing tests?** → See [Testing Considerations](./.ai-assistant/rules/testing.md) and [Test Specifications](./specs/tests/goal-test-specs.md)
- **Setting up linting?** → Check [Linting & Formatting](./.ai-assistant/rules/linting-formatting.md)
- **Optimizing performance?** → Review [Performance Optimization](./.ai-assistant/rules/performance-optimization.md)
- **Ensuring accessibility?** → Check [Accessibility](./.ai-assistant/rules/accessibility.md)
- **Setting up monitoring?** → See [Observability & Logging](./.ai-assistant/rules/observability-logging.md)
- **Verifying feature completeness?** → Check [Feature Specifications](./specs/features/goal-features.md) for acceptance criteria

### Deployment & Security

- **Deploying the app?** → Check [Deployment](./.ai-assistant/rules/deployment.md) and [Environment Configuration](./.ai-assistant/rules/environment-config.md)
- **Security concerns?** → Review [Security](./.ai-assistant/rules/security.md)
- **Git workflow?** → See [Git Workflow](./.ai-assistant/rules/git-workflow.md)

```bash
npm test             # Run all tests (Vitest)
npm run test:watch   # Watch mode for development
npm run test:ui      # Vitest UI browser
npm run test:coverage # With coverage report

Momentum is a comprehensive goals tracking management system built with:

- React + TypeScript
- Ant Design (antd)
- Zustand or Redux Toolkit for state management
- React Query for server state
- Support for multiple goal types: quantitative, qualitative, binary, milestone, recurring, and habit goals

For the complete system plan, see [GOALS_TRACKING_SYSTEM_PLAN.md](./GOALS_TRACKING_SYSTEM_PLAN.md).
