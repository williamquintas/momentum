# File Organization

## Directory Structure

```
src/
  components/          # Reusable UI components
    common/            # Shared components used across features
      Button/
        Button.tsx
        Button.test.tsx
        index.ts
      LoadingSpinner/
      ErrorBoundary/
    layout/            # Layout components (Header, Sidebar, Footer)
      MainLayout.tsx
      Header.tsx
      Sidebar.tsx
  features/            # Feature-based modules (self-contained)
    goals/             # Goal management feature
      components/      # Feature-specific components
        GoalCard/
          GoalCard.tsx
          GoalCard.test.tsx
          GoalCard.styles.ts
          index.ts
        GoalForm/
        GoalList/
      hooks/           # Feature-specific hooks
        useGoals.ts
        useGoalProgress.ts
      services/        # Feature API services (if not in global services)
        goalApi.ts
      types/           # Feature-specific types
        goal.types.ts
      utils/           # Feature-specific utilities
        calculateProgress.ts
        formatGoalDate.ts
      store/           # Feature-specific state (if using Redux slices)
        goalSlice.ts
      index.ts         # Public API (exports only what other features need)
  pages/               # Page-level components (route components)
    GoalsPage.tsx
    GoalDetailPage.tsx
    NotFoundPage.tsx
  layouts/             # Layout wrappers (alternative to components/layout)
    MainLayout.tsx
  providers/           # Context providers
    ThemeProvider.tsx
    AuthProvider.tsx
  hooks/               # Global custom hooks (used across features)
    useAuth.ts
    useLocalStorage.ts
  store/               # Global state management
    slices/           # Redux slices (if using Redux)
    index.ts          # Store configuration
  services/            # API services and HTTP client
    apiClient.ts      # HTTP client configuration
    goalService.ts    # Goal API service
    authService.ts    # Auth API service
  types/               # Global TypeScript types
    api.types.ts
    common.types.ts
  utils/               # Global utilities
    dateUtils.ts
    validation.ts
    formatters.ts
  constants/           # Constants and enums
    goalConstants.ts
    apiConstants.ts
  routes/              # Route definitions (if not using file-based routing)
    index.tsx
    protectedRoutes.tsx
  assets/              # Static assets
    images/
    icons/
    fonts/
  styles/              # Global styles (if not using CSS-in-JS)
    globals.css
    theme.css
  __tests__/           # Global test utilities and mocks
    setup.ts
    mocks/
    helpers/
```

## File Naming Conventions

### Components

- **Format**: PascalCase with matching directory name
- **Example**: `GoalCard.tsx` in `GoalCard/` directory
- **Test files**: `GoalCard.test.tsx` (co-located)
- **Style files**: `GoalCard.styles.ts` or `GoalCard.module.css` (if co-located)

### Utilities & Helpers

- **Format**: camelCase
- **Example**: `calculateProgress.ts`, `formatDate.ts`
- **Test files**: `calculateProgress.test.ts` (co-located)

### Constants

- **Format**: UPPER_SNAKE_CASE for file names, constants inside use UPPER_SNAKE_CASE
- **Example**: `MAX_GOAL_COUNT.ts`, `API_ENDPOINTS.ts`
- **Content**: `export const MAX_GOAL_COUNT = 100;`

### Types & Interfaces

- **Format**: PascalCase for files and types
- **Example**: `Goal.ts`, `GoalStatus.ts`, `api.types.ts`
- **Naming**: Types use PascalCase (`Goal`, `GoalStatus`)

### Hooks

- **Format**: camelCase with `use` prefix
- **Example**: `useGoalProgress.ts`, `useAuth.ts`
- **Test files**: `useGoalProgress.test.ts` (co-located)

### Services

- **Format**: camelCase with descriptive suffix (`Service`, `Api`, `Client`)
- **Example**: `goalService.ts`, `apiClient.ts`, `authApi.ts`

### Pages

- **Format**: PascalCase with `Page` suffix
- **Example**: `GoalsPage.tsx`, `GoalDetailPage.tsx`

### Test Files

- **Format**: `{filename}.test.{ext}` or `{filename}.spec.{ext}`
- **Location**: Co-located with source files
- **Example**: `GoalCard.test.tsx` next to `GoalCard.tsx`

## Index Files (Barrel Exports)

### Purpose

- Create clean public APIs for modules
- Reduce import path complexity
- Control what's exported from a directory

### When to Use

- **Feature modules**: Always include `index.ts` in feature root
- **Component directories**: Include `index.ts` for multi-file components
- **Utility directories**: Optional, use when exporting multiple utilities

### Examples

```typescript
// features/goals/index.ts - Public API
export { GoalCard, GoalList, GoalForm } from './components';
export { useGoals, useGoal, useCreateGoal } from './hooks';
export type { Goal, GoalStatus, GoalType } from './types';
export { calculateProgress, formatGoalDate } from './utils';

// features/goals/components/GoalCard/index.ts
export { GoalCard } from './GoalCard';
export type { GoalCardProps } from './GoalCard';

// utils/index.ts (optional)
export { formatDate, parseDate } from './dateUtils';
export { validateEmail, validateUrl } from './validation';
```

### Rules

- **Only export what's needed**: Don't export internal implementation details
- **Re-export types explicitly**: Use `export type` for TypeScript types
- **Group related exports**: Organize exports logically
- **Avoid deep barrel exports**: Don't create index files more than 2 levels deep

## TypeScript Path Aliases

### Configuration

Configure in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/features/*": ["src/features/*"],
      "@/hooks/*": ["src/hooks/*"],
      "@/services/*": ["src/services/*"],
      "@/utils/*": ["src/utils/*"],
      "@/types/*": ["src/types/*"],
      "@/constants/*": ["src/constants/*"]
    }
  }
}
```

### Usage

```typescript
// ✅ Good - Use aliases for imports beyond 2 levels
import { GoalCard } from '@/features/goals';
import { formatDate } from '@/utils/dateUtils';
import { useAuth } from '@/hooks/useAuth';

// ✅ Good - Relative imports for nearby files (within same feature)
import { GoalCard } from './GoalCard';
import { useGoalProgress } from '../hooks/useGoalProgress';

// ❌ Bad - Deep relative imports
import { GoalCard } from '../../../features/goals/components/GoalCard';
```

## Import Organization

### Order

1. **External libraries** (React, React DOM, third-party)
2. **Internal absolute imports** (using `@/` aliases)
3. **Relative imports** (same directory or parent)
4. **Type-only imports** (group separately if needed)

### Grouping

```typescript
// 1. External libraries
import React, { useState, useEffect } from 'react';
import { Card, Button, Form } from 'antd';
import { useQuery } from '@tanstack/react-query';

// 2. Internal absolute imports
import { GoalCard } from '@/features/goals';
import { formatDate } from '@/utils/dateUtils';
import { useAuth } from '@/hooks/useAuth';
import type { Goal } from '@/types/goal.types';

// 3. Relative imports
import { GoalHeader } from './GoalHeader';
import { useGoalProgress } from '../hooks/useGoalProgress';

// 4. Type-only imports (if not already included above)
import type { GoalCardProps } from './GoalCard.types';
```

### Rules

- **One import per line** for external libraries (easier to read and maintain)
- **Group related imports** together
- **Use absolute imports** (`@/`) for imports beyond 2 directory levels
- **Use relative imports** for files in the same feature/module
- **Separate type imports** when importing only types: `import type { ... }`

## Test File Organization

### Co-location Strategy

- **Preferred**: Co-locate test files with source files
- **Location**: Same directory as source file
- **Naming**: `{filename}.test.{ext}` or `{filename}.spec.{ext}`

### Structure

```
features/
  goals/
    components/
      GoalCard.tsx
      GoalCard.test.tsx        # Co-located
      GoalCard.styles.ts
    hooks/
      useGoals.ts
      useGoals.test.ts         # Co-located
    utils/
      calculateProgress.ts
      calculateProgress.test.ts # Co-located
```

### Test Utilities

- **Global test utilities**: `src/__tests__/helpers/`
- **Mock data**: `src/__tests__/mocks/`
- **Test setup**: `src/__tests__/setup.ts`

### E2E Tests

- **Location**: `e2e/` or `tests/e2e/` (root level)
- **Structure**: Mirror app structure or organize by user flows

## Asset Organization

### Images

```
src/assets/
  images/
    logos/
    icons/
    illustrations/
  icons/              # SVG icons
    common/
    goal/
```

### Naming

- **Format**: kebab-case
- **Example**: `goal-icon.svg`, `logo-primary.png`

### Usage

```typescript
// Import assets
import logo from '@/assets/images/logos/logo-primary.png';
import GoalIcon from '@/assets/icons/goal/goal-icon.svg';
```

## Decision Criteria: Where Does Code Belong?

### Feature-Specific vs Shared

**Feature-specific** (`features/{feature}/`):

- Used only within one feature
- Feature-specific business logic
- Feature-specific components
- Feature-specific types

**Shared** (`components/common/`, `utils/`, `hooks/`):

- Used by 2+ features
- Generic, reusable utilities
- Common UI components
- Cross-cutting concerns

### When to Move Code

**Move to shared when:**

- Code is used by 2+ features
- Code is generic and reusable
- Code represents a common pattern

**Keep in feature when:**

- Code is specific to one feature
- Moving would create unnecessary coupling
- Code is still evolving

### Component Location

**`components/common/`**:

- Generic UI components (Button, Modal, LoadingSpinner)
- Used across multiple features
- No business logic

**`features/{feature}/components/`**:

- Feature-specific components
- Contains feature business logic
- Used primarily within the feature

**`pages/`**:

- Route-level components
- Page composition and layout
- Data fetching orchestration

## File Size Guidelines

### Components

- **Target**: < 200 lines
- **Action**: Split if exceeding 300 lines or multiple responsibilities
- **Split strategy**: Extract sub-components, hooks, or utilities

### Utilities

- **Target**: < 150 lines per function
- **Action**: Split into smaller, focused functions

### Hooks

- **Target**: < 100 lines
- **Action**: Extract sub-hooks or utilities if complex

## Circular Dependency Prevention

### Rules

- **Features should NOT import from other features directly**
- **Use shared utilities** for cross-feature functionality
- **Import from feature public API** (`index.ts`) when absolutely necessary
- **Avoid**: Feature A → Feature B → Feature A

### Detection

- Use tools like `madge` to detect circular dependencies
- Review import graphs regularly
- Refactor when circular dependencies are detected

## Examples

### Good Structure

```typescript
// features/goals/components/GoalCard/GoalCard.tsx
import React from 'react';
import { Card } from 'antd';
import { useGoalProgress } from '../../hooks/useGoalProgress';
import { formatDate } from '@/utils/dateUtils';
import type { Goal } from '../../types';

export const GoalCard: React.FC<{ goal: Goal }> = ({ goal }) => {
  const { progress } = useGoalProgress(goal);
  return <Card>{/* ... */}</Card>;
};

// features/goals/components/GoalCard/index.ts
export { GoalCard } from './GoalCard';
export type { GoalCardProps } from './GoalCard';
```

### Bad Structure

```typescript
// ❌ Deep relative imports
import { GoalCard } from '../../../features/goals/components/GoalCard/GoalCard';

// ❌ Feature importing directly from another feature
// features/goals/components/GoalCard.tsx
import { UserProfile } from '@/features/users/components/UserProfile';

// ❌ No index file, exposing internal structure
import { GoalCard } from '@/features/goals/components/GoalCard/GoalCard';
```

## Migration Guidelines

### Moving Code Between Directories

1. **Update imports**: Use find/replace or IDE refactoring
2. **Update exports**: Update relevant `index.ts` files
3. **Update tests**: Move test files with source files
4. **Verify**: Run tests and check for broken imports
5. **Commit**: Make it a separate commit for clarity

### Refactoring Checklist

- [ ] All imports updated
- [ ] Index files updated
- [ ] Tests moved and passing
- [ ] No circular dependencies introduced
- [ ] Documentation updated (if needed)
