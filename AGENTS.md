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

## Mobile UX Guidelines (Phase 0 - 025-mobile-ux)

These guidelines apply to mobile-first design.

### Navigation

- **Bottom Tab Bar**: Use for Goals, Notifications, Settings (mobile only, show on lg+ breakpoints)
- Hide bottom tabs on Goal Detail (use back navigation instead)
- Remove breadcrumbs when bottom tabs are used (redundant)

### UI Patterns

- **Filter Drawer**: Use `Drawer` with `placement="bottom"` for filters
- **FAB**: Use `FloatButton` for primary create action
- **Single Primary Action**: Only one primary button visible per screen; secondary actions in `Dropdown`
- **Sticky Bottom CTA**: Use `Affix` for primary action on Goal Detail
- **Infinite Scroll**: Replace pagination with `List` loadMore pattern

### Progress Formatting

- Always use integer percentages: `Math.round(progress)` not `13.3333333%`

### Tag Colors (Status/Priority)

- **Status**:
  - Active: green
  - Completed: blue
  - Paused: gray
  - Cancelled: red
- **Priority**:
  - High: red
  - Medium: orange
  - Low: blue

### Data Management

- Centralize Export/Import in Settings page only (remove from Goals page)

### Accessibility

- Minimum 44px touch targets
- Use `token.colorTextSecondary` for muted text
- WCAG AA contrast in dark mode

## Desktop UX Guidelines (Phase 1 - 026-desktop-ux)

These guidelines apply to desktop design (lg+ breakpoints). Desktop enhances mobile patterns.

### Global Layout

- **Max-width containers**: Main content 1200px, Settings/Notifications 800px, centered
- **Header**: Logo + App name left; grouped actions right (Notifications, Settings, Language, Theme)
- **Footer**: Reduce prominence (smaller text, lower contrast)
- **No breadcrumbs**: Redundant with navigation

### Goals List (Desktop)

- **Structured Header**: Title left; right: Segmented (Table/List) + Export (ghost) + Create (primary)
- **Filter Bar**: Single row with wrap, consistent width selects, active filters as removable Tags
- **List View**: 2-column responsive grid (Col span=12 on >=1024px), card hover states (shadow + border)
- **Table View**: `size="small"` for density, sticky header `scroll={{ y: 400 }}`, row hover highlight

### Goal Detail (Desktop)

- **2-Column Layout**: Left (span=16) main content, Right (span=8) metadata panel
- **Sticky Sidebar**: Right column with `position: sticky; top: 24px`
- **Single Primary Action**: "Update Progress" button
- **Secondary Actions**: Dropdown menu (Edit, Archive, Delete)

### Settings (Desktop)

- **Centered Container**: max-width 800px
- **Section Cards**: Grouped as Preferences, Data, About

### Notifications (Desktop)

- **Timeline Structure**: Group by date (Today, Yesterday, This Week, Earlier)
- Use `Timeline` component, version tag prominent per item

### Interaction & States

- **Hover States**: Cards (shadow + border highlight), Buttons (brightness), Table rows (background)
- **Loading States**: Use `Skeleton` for list/table content
- **Empty States**: Use `Empty` component
- **View Mode**: Persist Table/List choice in localStorage

### Component States

- Hover: Cards `shadow-lg` + border highlight; Buttons brightness increase; Segmented filled background
- Active: Segmented shows selected state
- Disabled: 40% opacity

## Active Technologies

- TypeScript 5.3.3 + React 18.2.0, Vite 6.1.6, vite-plugin-pwa (to be added) (020-pwa-support)
- N/A (browser-based caching via service worker) (020-pwa-support)

- TypeScript 5.3.3 + React 18.2.0, Ant Design 5.12.8, Zustand 4.4.7, React Query 5.17.9, Zod 3.22.4 (019-goal-type-tooltips)

- TypeScript 5.3.3 + React 18.2.0, Ant Design 5.12.8, Zustand 4.4.7, React Query 5.17.9 (018_fix-milestone-goal-creation)

- TypeScript 5.3.3, React 18.2.0 + React Query 5.17.9, Zustand 4.4.7, Ant Design 5.12.8 (017-fix-duplicate-progress-error)
- IndexedDB (via storage service layer) (017-fix-duplicate-progress-error)
