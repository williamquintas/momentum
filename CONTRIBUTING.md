# Contributing to Goals Tracking

Thank you for your interest in contributing to the Goals Tracking Management System! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Environment Setup](#development-environment-setup)
- [Code Style and Standards](#code-style-and-standards)
- [How to Submit PRs](#how-to-submit-prs)
- [Testing Requirements](#testing-requirements)
- [Commit Message Conventions](#commit-message-conventions)
- [Project Structure](#project-structure)
- [Documentation](#documentation)

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) before contributing.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/williamquintas/goals-tracking.git
   cd goals-tracking
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/goals-tracking.git
   ```
4. **Create a branch** for your contribution:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b bugfix/your-bugfix-name
   ```

## Development Environment Setup

### Prerequisites

- **Node.js**: v24.0.0 or higher (see `package.json` engines)
- **npm**: v10.0.0 or higher
- **Git**: Latest version recommended

### Installation Steps

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Set up environment variables**:

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start the development server**:

   ```bash
   npm run dev
   ```

4. **Verify the setup**:
   - Open [http://localhost:5173](http://localhost:5173) (or the port shown in terminal)
   - Run tests: `npm test`
   - Run linting: `npm run lint`
   - Run type checking: `npm run type-check`

### Development Tools

- **VS Code** (recommended): Install recommended extensions from `.vscode/extensions.json` (if available)
- **Browser DevTools**: Use React DevTools and Redux DevTools extensions
- **Git Hooks**: Husky is configured to run linting and formatting on commit

## Code Style and Standards

### TypeScript

- **Strict Mode**: TypeScript strict mode is enabled
- **Type Safety**: Always use explicit types, avoid `any`
- **Interfaces**: Prefer interfaces over types for object shapes
- **Naming**: Use PascalCase for types/interfaces, camelCase for variables/functions

```typescript
// Good
interface Goal {
  id: string;
  title: string;
}

function calculateProgress(goal: Goal): number {
  // ...
}

// Avoid
type Goal = {
  id: string;
  title: string;
};
```

### React

- **Functional Components**: Use functional components with hooks
- **Component Structure**: Follow the structure in [Code Standards](./.ai-assistant/rules/code-standards.md)
- **Props**: Define props interfaces above the component
- **Hooks**: Custom hooks should start with `use`

```typescript
// Good
interface GoalCardProps {
  goal: Goal;
  onUpdate: (goal: Goal) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onUpdate }) => {
  // ...
};
```

### File Organization

- **Feature-based structure**: Organize code by features, not by type
- **Barrel exports**: Use `index.ts` files for clean imports
- **Naming**: Use PascalCase for components, camelCase for utilities

```
src/
  features/
    goals/
      components/
        GoalCard/
          GoalCard.tsx
          index.ts
      hooks/
        useGoals.ts
      utils/
        calculateProgress.ts
```

### Code Quality

- **ESLint**: Follow ESLint rules (run `npm run lint` before committing)
- **Prettier**: Code is auto-formatted with Prettier (run `npm run format`)
- **Imports**: Organize imports (external, internal, relative)
- **Comments**: Add comments for complex logic, not obvious code

### Ant Design

- **Component Usage**: Use Ant Design components consistently
- **Theming**: Follow theme customization guidelines in [UI Component Guidelines](./.ai-assistant/rules/ui-component-guidelines.md)
- **Accessibility**: Ensure all components are accessible (see [Accessibility](./.ai-assistant/rules/accessibility.md))

## How to Submit PRs

### Before Creating a PR

1. **Update your branch**:

   ```bash
   git fetch upstream
   git rebase upstream/develop  # or main
   ```

2. **Run validation**:

   ```bash
   npm run validate  # Runs type-check, lint, and format:check
   ```

3. **Run tests**:

   ```bash
   npm test
   ```

4. **Check build**:
   ```bash
   npm run build
   ```

### Creating the PR

1. **Push your branch**:

   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create PR on GitHub**:
   - Use the PR template (automatically populated)
   - Link related issues using keywords: `Closes #123`, `Fixes #456`
   - Request reviews from maintainers
   - Ensure CI checks pass

3. **PR Checklist**:
   - [ ] Code follows style guidelines
   - [ ] Tests added/updated
   - [ ] Documentation updated
   - [ ] No console errors
   - [ ] Accessibility verified
   - [ ] Type checking passes
   - [ ] Linting passes
   - [ ] Build succeeds

### PR Review Process

- **Reviewers**: At least one maintainer must approve
- **CI Checks**: All CI checks must pass
- **Address Feedback**: Respond to all review comments
- **Update PR**: Push additional commits to address feedback
- **Squash Commits**: Maintainers may squash commits before merging

## Testing Requirements

### Test Coverage

- **New Features**: Must include tests
- **Bug Fixes**: Must include regression tests
- **Coverage**: Aim for >80% coverage on new code
- **Critical Paths**: 100% coverage for critical business logic

### Writing Tests

- **Unit Tests**: Test individual functions/components
- **Integration Tests**: Test feature workflows
- **Test Location**: Co-locate tests with code or in `__tests__` directories

```typescript
// Example test structure
describe('calculateProgress', () => {
  it('should calculate progress correctly for quantitative goals', () => {
    const goal = { type: 'quantitative', current: 50, target: 100 };
    expect(calculateProgress(goal)).toBe(50);
  });
});
```

### Running Tests

```bash
npm test              # Run tests once
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
npm run test:ui       # Run tests with UI (if available)
```

## Commit Message Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/) format.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes
- `build`: Build system changes
- `revert`: Revert a previous commit

### Examples

```bash
# Feature
feat(goals): add progress tracking for quantitative goals

# Bug fix
fix(api): handle timeout errors gracefully

# Documentation
docs(readme): update installation instructions

# Breaking change
feat(api)!: change authentication method

BREAKING CHANGE: Authentication now requires JWT tokens
```

### Commit Best Practices

- **Atomic commits**: One logical change per commit
- **Clear messages**: Describe what and why, not how
- **Reference issues**: Use `Closes #123` in footer
- **Limit length**: Keep subject line under 72 characters

## Project Structure

See [File Organization](./.ai-assistant/rules/file-organization.md) for detailed structure guidelines.

Key directories:

- `src/features/`: Feature-based modules
- `src/components/`: Shared components
- `src/services/`: API and service layers
- `src/utils/`: Utility functions
- `specs/`: Specifications and documentation

## Documentation

### When to Update Documentation

- **New Features**: Update README, add to relevant docs
- **API Changes**: Update API documentation
- **Configuration**: Update environment variable docs
- **Breaking Changes**: Document in CHANGELOG.md

### Documentation Files

- `README.md`: Project overview and quick start
- `CHANGELOG.md`: Version history
- `./.ai-assistant/rules/`: Development guidelines
- `specs/`: Feature specifications

## Getting Help

- **Questions**: Open a discussion or issue
- **Bugs**: Use the bug report template
- **Features**: Use the feature request template
- **Security**: See [SECURITY.md](./.github/SECURITY.md)

## Additional Resources

- [Code Standards](./.ai-assistant/rules/code-standards.md)
- [Architecture](./.ai-assistant/rules/architecture.md)
- [Git Workflow](./.ai-assistant/rules/git-workflow.md)
- [Testing Guidelines](./.ai-assistant/rules/testing.md)
- [System Plan](./GOALS_TRACKING_SYSTEM_PLAN.md)

Thank you for contributing! 🎉
