# Momentum - Agent Guidelines

This file provides essential guidelines for AI coding assistants working in this repository.

## Project Tech Stack

- React 18.2.0, TypeScript 5.3.3, Ant Design 5.12.8, Zustand 4.4.7, React Query 5.17.9, React Router 6.21.1
- Vitest for testing, Vite for build tooling

## Commands

### Development

```bash
npm run dev          # Start dev server
npm run build        # Production build (tsc + vite)
npm run preview      # Preview production build
```

### Testing

```bash
npm test             # Run all tests (Vitest)
npm run test:watch   # Watch mode for development
npm run test:ui      # Vitest UI browser
npm run test:coverage # With coverage report

# Run a single test file
npx vitest run src/features/goals/components/GoalCard.test.tsx

# Run tests matching a pattern
npx vitest run -t "should display"
```

### Linting & Type Checking

```bash
npm run lint         # ESLint check
npm run lint:fix     # Auto-fix lint issues
npm run format       # Prettier format (write)
npm run format:check # Check formatting only
npm run type-check   # TypeScript compile check
npm run validate     # type-check + lint + format:check
```

### Versioning & Release

```bash
npm run version:patch # Patch release
npm run version:minor # Minor release
npm run version:major # Major release
```

## Code Style Guidelines

### TypeScript

- Strict TypeScript with `strict: true`
- Prefer `interface` over `type` for object shapes
- Use `unknown` instead of `any`; use `as const` for literal types
- Always type function parameters and return values
- Use utility types (`Pick`, `Omit`, `Partial`, `Readonly`) when appropriate
- Leverage discriminated unions for state management

### React Patterns

- Functional components with hooks only
- Named exports for components (PascalCase)
- One component per file
- Use `useCallback` for callbacks passed to memoized children
- Use `useMemo` for expensive computations only
- Clean up effects: return cleanup functions from `useEffect`
- Extract complex state logic into custom hooks or `useReducer`

### Naming Conventions

- Components/Files: `PascalCase` (e.g., `GoalCard.tsx`)
- Functions/Variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Types/Interfaces: `PascalCase`
- Boolean vars: `is`, `has`, `should` prefix

### Import Organization (order matters)

```typescript
// 1. React & React-related
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. External libraries
import { Card, Button } from 'antd';
import dayjs from 'date-fns';

// 3. Internal absolute imports (@/)
import { useGoals } from '@/hooks/useGoals';
import { GoalCard } from '@/features/goals';

// 4. Relative imports
import { calculateProgress } from './utils';
import type { Goal } from './types';
```

### File Structure

```
src/
  features/{feature}/        # Feature-based modules
    components/             # Feature-specific components
    hooks/                  # Feature-specific hooks
    types/                  # Feature-specific types
    utils/                  # Feature-specific utilities
  components/common/        # Shared reusable components
  pages/                    # Route-level components
  hooks/                    # Global custom hooks
  utils/                    # Global utilities
  store/                    # Zustand stores
  services/                 # API services
  types/                    # Global types
  constants/                # Constants and enums
```

### Error Handling

- Always wrap async code in try/catch
- Use error boundaries for component tree isolation
- Provide meaningful error messages
- Handle loading, success, and error states for async operations
- Use `??` for nullish coalescing, `?.` for optional chaining

### Testing Patterns

- Test files co-located: `GoalCard.test.tsx` next to `GoalCard.tsx`
- Follow AAA pattern: Arrange, Act, Assert
- Test user behavior, not implementation details
- Use `screen.getByRole()` over test IDs
- Describe tests clearly: `describe('GoalCard', () => { it('should show progress', ...) })`
- Mock external dependencies; test edge cases

### Component Guidelines

- Keep components focused (< 200 lines)
- Define Props interfaces with descriptive names (`GoalCardProps`)
- Use Ant Design components: `import { Card } from 'antd'`
- Use Ant Design's built-in types (`FormInstance`, `TableColumnsType`)

### Pre-commit

- Husky runs lint-staged on staged files
- ESLint auto-fixes, then Prettier formats

## Additional Resources

Detailed guidelines available in:

- `.ai-assistant/rules/` - Comprehensive development guidelines
- `specs/` - Business rules, data flows, feature specs, and test specs
- `GOALS_TRACKING_SYSTEM_PLAN.md` - System architecture overview

## Active Technologies

- TypeScript 5.3.3 + React 18.2.0, Vite 6.1.6, vite-plugin-pwa (to be added) (020-pwa-support)
- N/A (browser-based caching via service worker) (020-pwa-support)

- TypeScript 5.3.3 + React 18.2.0, Ant Design 5.12.8, Zustand 4.4.7, React Query 5.17.9, Zod 3.22.4 (019-goal-type-tooltips)

- TypeScript 5.3.3 + React 18.2.0, Ant Design 5.12.8, Zustand 4.4.7, React Query 5.17.9 (018-fix-milestone-goal-creation)

- TypeScript 5.3.3, React 18.2.0 + React Query 5.17.9, Zustand 4.4.7, Ant Design 5.12.8 (017-fix-duplicate-progress-error)
- IndexedDB (via storage service layer) (017-fix-duplicate-progress-error)

## Recent Changes

- 017-fix-duplicate-progress-error: Added TypeScript 5.3.3, React 18.2.0 + React Query 5.17.9, Zustand 4.4.7, Ant Design 5.12.8
