# Code Standards

## TypeScript

- Use strict TypeScript configuration
- Prefer interfaces over types for object shapes
- Use enums for fixed sets of values (goal types, statuses, priorities)
- Always type function parameters and return values
- Use type guards for runtime type checking
- Avoid `any` - use `unknown` if type is truly unknown
- Use utility types (Pick, Omit, Partial, Required, Readonly) when appropriate
- Prefer discriminated unions for type-safe state management
- Use generics for reusable, type-safe functions and components
- Leverage type narrowing with `typeof`, `instanceof`, and custom type guards
- Use `const assertions` for literal types: `as const`
- Prefer type aliases for complex union/intersection types
- Use `satisfies` operator when you need type checking without widening types

## React Patterns

- Use functional components with hooks
- Prefer named exports for components
- Use React.memo for expensive components (only when profiling shows it's needed)
- Implement proper error boundaries
- Use custom hooks for reusable logic
- Follow the single responsibility principle
- Always include all dependencies in hook dependency arrays
- Use `useCallback` for functions passed as props to memoized components
- Use `useMemo` for expensive computations (not for simple value assignments)
- Clean up effects: return cleanup functions from `useEffect`
- Extract complex state logic into custom hooks or reducers
- Use `useReducer` for complex state with multiple sub-values
- Prefer composition over prop drilling (use Context sparingly)
- Keep components pure: avoid side effects in render

## Component Structure

- One component per file
- File names: PascalCase (e.g., `GoalCard.tsx`)
- Component names match file names
- Place components in appropriate feature folders. Only move to common/shared if more than a feature use it
- Use index files for clean imports
- Define Props interfaces with descriptive names (e.g., `GoalCardProps`)
- Use default props sparingly; prefer default parameters in function signatures
- Split large components when they exceed ~200 lines or have multiple responsibilities
- Keep component files focused: co-locate related types, utilities, and hooks when they're only used by that component

## Ant Design Usage

- Import components directly: `import { Card, Button } from 'antd'`
- Use Ant Design's built-in types (e.g., `FormInstance`, `TableColumnsType`)
- Follow Ant Design's design patterns and spacing
- Use Ant Design's theme customization for consistent styling
- Leverage Ant Design's Form validation rules
- Use appropriate Ant Design components as specified in the plan

## Naming Conventions

- Components: PascalCase (`GoalCard`)
- Functions: camelCase (`calculateProgress`)
- Constants: UPPER_SNAKE_CASE (`MAX_GOAL_COUNT`)
- Types/Interfaces: PascalCase (`Goal`, `GoalStatus`)
- Files: Match export (component files = PascalCase)
- Boolean variables: Use `is`, `has`, `should` prefix (`isActive`, `hasProgress`)

## Comments & Documentation

- Only keep necessary comments
- Use JSDoc for function documentation
- Explain complex logic
- Document non-obvious decisions
- Keep comments up to date
- Remove commented-out code
- Example:
  ```typescript
  /**
   * Calculates the progress percentage for a quantitative goal
   * @param current - Current value
   * @param start - Starting value
   * @param target - Target value
   * @returns Progress percentage (0-100)
   */
  function calculateProgress(current: number, start: number, target: number): number {
    // ...
  }
  ```

## Code Organization

- Keep functions small and focused
- Extract complex logic into utilities
- Avoid deep nesting
- Use early returns
- Group related code together
- Organize imports: external libraries → internal modules → relative imports
- Use absolute imports for internal modules (configure path aliases in tsconfig)
- Group imports: React/React-related → Ant Design → other libraries → types → utilities → relative
- Separate concerns: business logic in hooks/utils, presentation in components

## Refactoring

- Remove dead code
- Extract repeated code
- Simplify complex expressions
- Improve variable names
- Update types as code evolves

## Error Handling

- For comprehensive error handling guidelines, see [Error Handling](./error-handling.md)
- Always handle async errors with try/catch or .catch()
- Use error boundaries for component tree error isolation
- Provide meaningful error messages for debugging

## Async/Await Patterns

- Prefer async/await over Promise chains for readability
- Always handle errors in async functions
- Use Promise.all() for parallel operations, Promise.allSettled() when some failures are acceptable
- Avoid async functions in useEffect cleanup (use regular functions)
- Consider loading states and error states in async operations

## Null Safety

- Use optional chaining (`?.`) for safe property access
- Use nullish coalescing (`??`) for default values (prefer over `||` for null/undefined checks)
- Explicitly handle null/undefined cases rather than relying on truthy/falsy checks
- Use type guards to narrow types before accessing properties
- Consider using non-null assertion (`!`) only when you're certain a value exists (prefer type guards)

## Constants & Configuration

- Define constants at the top of files or in dedicated constants files
- Use `const` assertions for immutable constant objects
- Group related constants together
- Export constants from feature folders when shared
- Use environment variables for configuration (see [Environment Configuration](./environment-config.md))

## Performance Optimization

- Profile before optimizing (use React DevTools Profiler)
- Memoize expensive computations with `useMemo`
- Memoize callback functions with `useCallback` when passed to memoized children
- Use `React.memo` only when components re-render frequently with same props
- Lazy load routes and heavy components with `React.lazy()` and `Suspense`
- Avoid creating objects/arrays in render (move to useMemo or outside component)
- Debounce/throttle expensive operations (user input, API calls)

## Testing Standards

- Write tests for utilities, hooks, and complex business logic
- Test user interactions, not implementation details
- Use descriptive test names: `describe('ComponentName', () => { it('should do X when Y', ...) })`
- Follow AAA pattern: Arrange, Act, Assert
- Mock external dependencies (APIs, services)
- Test error cases and edge cases
- For comprehensive testing guidelines, see [Testing Considerations](./testing.md)
