# Momentum - Agent Guidelines

This file provides essential guidelines for AI coding assistants working in this repository.

## Project Tech Stack

- React 18.2.0, TypeScript 5.3.3, Ant Design 5.12.8; Zustand 4, React Query 5, React Router 6, Zod 3
- Vite 6 with vite-plugin-pwa, Vitest 4 and Testing Library
- Node.js >=24 and npm >=10; use the approved personal installation described in `docs/dependency-maintenance.md`
- `package.json` is authoritative for declared versions and commands; `package-lock.json` records resolved versions when present. Do not treat historical specs as installed-version evidence.
- Goal hooks use React Query through `src/services/api/goalService.ts`, backed by localStorage services. Zustand stores live in `src/stores/`; do not assume a backend API or IndexedDB implementation.

## Commands

### Development

```bash
npm run dev          # Start dev server
npm run build        # Production build (tsc + vite)
npm run preview      # Preview production build
```

### Testing

```bash
npm test -- --run     # Run all tests once (Vitest)
npm run test:watch   # Watch mode for development
npm run test:ui      # Vitest UI browser
npm run test:coverage -- --run # Run once with coverage report

# Run a single test file
npx vitest run src/features/goals/utils/__tests__/completionValidation.test.ts

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
npm run validate:translations # Validate locale keys
```

### Versioning & Release

```bash
npm run version:patch # Patch release
npm run version:minor # Minor release
npm run version:major # Major release
node scripts/check-version.js maintenance # Validate package/lockfile version consistency
node --test scripts/check-version.node-test.js # Test version policy without dependencies
```

Version commands modify files and may create commits/tags. Prepare and verify a release before obtaining authorization for publication; see `docs/dependency-maintenance.md` and the release-readiness skill below. Do not use `npm run release` as a validation command.

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
import { format } from 'date-fns';

// 3. Internal absolute imports (@/)
import { useGoals } from '@/features/goals/hooks/useGoals';
import { GoalCard } from '@/features/goals/components/GoalCard';

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
  stores/                   # Zustand stores
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

- Prefer co-located tests for new coverage; preserve existing suites in `src/__tests__/` and feature/service `__tests__/` directories.
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
- `.specify/memory/constitution.md` and `.specify/adr/` - Engineering principles and architectural decisions

## Codex Workflows

Load only the skill relevant to the task; avoid loading the whole catalog or duplicating existing rules:

- [Context and impact](.agents/skills/momentum-context/SKILL.md): establish applicable rules, affected layers and acceptance criteria.
- [Verification](.agents/skills/momentum-verify/SKILL.md): select checks and report evidence for the current revision.
- [Release readiness](.agents/skills/momentum-release-readiness/SKILL.md): prepare a release and identify publication blockers.
- [Specification delivery](.agents/skills/momentum-spec-delivery/SKILL.md): reuse Spec Kit templates and connect requirements to implementation and tests.
- [UI acceptance](.agents/skills/momentum-ui-acceptance/SKILL.md): check responsive UX, accessibility, locales and PWA behavior when affected.
- [Dependency triage](.agents/skills/momentum-dependency-triage/SKILL.md): assess existing update PRs and compatible maintenance batches.

Use [agent governance](docs/agent-system/governance.md) for specialist responsibilities, autonomy limits, human approvals and effectiveness metrics. Reuse `.opencode` guidance selectively; its agent definitions and permissions are not automatically Codex registrations.

## Mobile UX Guidelines (Phase 0 - 025-mobile-ux)

These guidelines apply to mobile-first design.

### Navigation

- **Bottom Tab Bar**: Use for Goals, Notifications, Settings on mobile; hide at lg+ breakpoints.
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

- Centralize Export/Import in Settings page only on both mobile and desktop (remove from Goals page).

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

- **Structured Header**: Title left; right: Segmented (Table/List) + Create (primary). Export/Import stays in Settings.
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

## PWA and Historical Specifications

PWA support is implemented through `vite-plugin-pwa` in `vite.config.ts` and the hooks in `src/hooks/`. Verify offline and update behavior against a production build when changing caching or service-worker behavior. Historical technology lists in feature specs describe their original planning context; use the project stack above and the current implementation for maintenance decisions.
