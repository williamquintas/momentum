# Testing Considerations

## Test Strategy

### Test Levels
1. **Unit Tests**: Individual functions, utilities, calculations, hooks
2. **Component Tests**: React components with React Testing Library
3. **Integration Tests**: API endpoints, state management, feature workflows
4. **E2E Tests**: Complete user workflows with Playwright/Cypress
5. **Performance Tests**: Load testing, response time validation
6. **Accessibility Tests**: Keyboard navigation, screen readers, ARIA compliance

### Test Coverage Goals
- Unit tests: 90%+ code coverage on critical paths
- Component tests: All user-facing components
- Integration tests: All API endpoints and critical workflows
- E2E tests: All primary user journeys
- Accessibility tests: All interactive components

### Testing Tools
- **Unit/Component Testing**: Jest or Vitest
- **Component Testing Library**: React Testing Library
- **E2E Testing**: Playwright (recommended) or Cypress
- **API Mocking**: MSW (Mock Service Worker)
- **Accessibility Testing**: @axe-core/react, jest-axe
- **Visual Regression**: Percy, Chromatic, or Playwright screenshots
- **Coverage**: Istanbul/nyc

## Unit Testing

### What to Test
- Utility functions (calculations, transformations, validations)
- Custom hooks in isolation
- Data transformation functions
- Business logic (progress calculations, streak calculations, milestone logic)
- Date/time utilities
- Validation functions

### Testing Utilities
- Test pure functions with various inputs
- Test edge cases and boundary conditions
- Test error handling
- Use descriptive test names: `describe('functionName', () => { it('should do X when Y', ...) })`
- Example:
  ```typescript
  // utils/__tests__/progress.test.ts
  import { calculateQuantitativeProgress } from '../progress';
  
  describe('calculateQuantitativeProgress', () => {
    it('should calculate progress correctly for normal case', () => {
      const result = calculateQuantitativeProgress(0, 50, 100);
      expect(result).toBe(50);
    });
    
    it('should handle currentValue < startValue', () => {
      const result = calculateQuantitativeProgress(0, -10, 100);
      expect(result).toBe(0); // Clamped to 0%
    });
    
    it('should handle currentValue > targetValue', () => {
      const result = calculateQuantitativeProgress(0, 150, 100);
      expect(result).toBe(100); // Clamped to 100%
    });
  });
  ```

### Testing Custom Hooks
- Use `@testing-library/react-hooks` or `renderHook` from React Testing Library
- Test hook behavior in isolation
- Test hook dependencies and effects
- Test error states and edge cases
- Example:
  ```typescript
  // hooks/__tests__/useGoalProgress.test.ts
  import { renderHook, waitFor } from '@testing-library/react';
  import { useGoalProgress } from '../useGoalProgress';
  
  describe('useGoalProgress', () => {
    it('should calculate progress from goal data', () => {
      const { result } = renderHook(() => 
        useGoalProgress({ startValue: 0, currentValue: 50, targetValue: 100 })
      );
      expect(result.current.progress).toBe(50);
    });
  });
  ```

### Testing Async Code
- Use `waitFor` for async operations
- Use `act` when needed for state updates
- Test loading states
- Test error states
- Test cleanup functions
- Example:
  ```typescript
  it('should fetch and display goals', async () => {
    const { getByText } = render(<GoalList />);
    
    await waitFor(() => {
      expect(getByText('My Goal')).toBeInTheDocument();
    });
  });
  ```

## Component Testing

### What to Test
- Component rendering with different props
- User interactions (clicks, form submissions, keyboard events)
- Props and state changes
- Error states and error boundaries
- Loading states
- Empty states
- Conditional rendering
- Accessibility features

### React Testing Library Best Practices
- Test user behavior, not implementation details
- Use queries that reflect how users interact (getByRole, getByLabelText)
- Prefer user-facing queries over test IDs
- Use `screen` for queries when possible
- Example:
  ```typescript
  // components/__tests__/GoalCard.test.tsx
  import { render, screen, fireEvent } from '@testing-library/react';
  import { GoalCard } from '../GoalCard';
  
  describe('GoalCard', () => {
    it('should display goal information', () => {
      const goal = { id: '1', title: 'Test Goal', progress: 50 };
      render(<GoalCard goal={goal} />);
      
      expect(screen.getByText('Test Goal')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
    });
    
    it('should call onEdit when edit button is clicked', () => {
      const onEdit = jest.fn();
      render(<GoalCard goal={goal} onEdit={onEdit} />);
      
      fireEvent.click(screen.getByRole('button', { name: /edit/i }));
      expect(onEdit).toHaveBeenCalledWith(goal.id);
    });
  });
  ```

### Testing Ant Design Components
- Ant Design components are already tested, focus on your integration
- Test form validation and submission
- Test table interactions (sorting, filtering, pagination)
- Test modal/drawer open/close behavior
- Test date picker interactions
- Example:
  ```typescript
  it('should submit form with valid data', async () => {
    const onSubmit = jest.fn();
    render(<GoalForm onSubmit={onSubmit} />);
    
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'New Goal' }
    });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'New Goal' })
      );
    });
  });
  ```

### Testing Forms
- Test form validation
- Test form submission
- Test field interactions
- Test error messages
- Test disabled states
- Example:
  ```typescript
  it('should show validation error for empty title', async () => {
    render(<GoalForm />);
    
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });
  });
  ```

### Testing Error Boundaries
- Test error boundary catches errors
- Test fallback UI rendering
- Test error logging
- Example:
  ```typescript
  it('should render fallback UI when error occurs', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };
    
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });
  ```

## Integration Testing

### What to Test
- Feature workflows end-to-end
- API integration with mocked services
- State management (Zustand/Redux) integration
- Navigation flows
- Form submissions with API calls
- React Query integration
- Multiple components working together

### Testing React Query
- Mock query client
- Test loading, success, and error states
- Test query invalidation
- Test mutations
- Example:
  ```typescript
  // components/__tests__/GoalList.integration.test.tsx
  import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
  import { render, screen, waitFor } from '@testing-library/react';
  import { server } from '../../mocks/server';
  import { rest } from 'msw';
  import { GoalList } from '../GoalList';
  
  describe('GoalList Integration', () => {
    it('should fetch and display goals', async () => {
      server.use(
        rest.get('/api/goals', (req, res, ctx) => {
          return res(ctx.json([{ id: '1', title: 'Test Goal' }]));
        })
      );
      
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } }
      });
      
      render(
        <QueryClientProvider client={queryClient}>
          <GoalList />
        </QueryClientProvider>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Test Goal')).toBeInTheDocument();
      });
    });
  });
  ```

### Testing State Management
- Test Zustand store actions
- Test Redux actions and reducers
- Test state updates
- Test selectors
- Example:
  ```typescript
  // stores/__tests__/goalStore.test.ts
  import { renderHook, act } from '@testing-library/react';
  import { useGoalStore } from '../goalStore';
  
  describe('useGoalStore', () => {
    it('should add goal to store', () => {
      const { result } = renderHook(() => useGoalStore());
      
      act(() => {
        result.current.addGoal({ id: '1', title: 'New Goal' });
      });
      
      expect(result.current.goals).toHaveLength(1);
      expect(result.current.goals[0].title).toBe('New Goal');
    });
  });
  ```

### Testing Navigation
- Test route changes
- Test protected routes
- Test query parameters
- Test navigation after actions
- Example:
  ```typescript
  import { render, screen } from '@testing-library/react';
  import { BrowserRouter } from 'react-router-dom';
  import { App } from '../App';
  
  it('should navigate to goal detail on click', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    fireEvent.click(screen.getByText('Goal Title'));
    expect(window.location.pathname).toBe('/goals/1');
  });
  ```

## End-to-End Testing

### E2E Testing with Playwright
- Test complete user workflows
- Test critical user journeys
- Test across different browsers
- Test responsive behavior
- Example:
  ```typescript
  // e2e/goal-creation.spec.ts
  import { test, expect } from '@playwright/test';
  
  test('should create a new goal', async ({ page }) => {
    await page.goto('/goals/new');
    
    await page.fill('[data-testid="goal-title"]', 'My New Goal');
    await page.selectOption('[data-testid="goal-type"]', 'quantitative');
    await page.fill('[data-testid="target-value"]', '100');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Goal created successfully')).toBeVisible();
    await expect(page.locator('text=My New Goal')).toBeVisible();
  });
  ```

### E2E Best Practices
- Test critical paths only (not every feature)
- Use data-testid sparingly (prefer semantic queries)
- Test user-visible behavior
- Keep tests independent
- Clean up test data
- Use page object model for complex flows

## Performance Testing

### What to Test
- Component render performance
- API response times
- Large list rendering
- Filter/search performance
- Bundle size

### Performance Test Examples
```typescript
it('should render 1000 goals efficiently', () => {
  const goals = Array.from({ length: 1000 }, (_, i) => ({
    id: `${i}`,
    title: `Goal ${i}`,
  }));
  
  const start = performance.now();
  render(<GoalList goals={goals} />);
  const end = performance.now();
  
  expect(end - start).toBeLessThan(100); // Render in < 100ms
});
```

## Accessibility Testing

### Automated Accessibility Testing
- Use `@axe-core/react` in tests
- Use `jest-axe` for assertions
- Test all interactive components
- Example:
  ```typescript
  import { axe, toHaveNoViolations } from 'jest-axe';
  expect.extend(toHaveNoViolations);
  
  it('should have no accessibility violations', async () => {
    const { container } = render(<GoalForm />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  ```

### Manual Accessibility Testing
- Test keyboard navigation
- Test with screen readers
- Test at 200% zoom
- Test in high contrast mode
- See [Accessibility](./accessibility.md) for detailed guidelines

## Mocking

### API Mocking with MSW
- Use MSW for API mocking in tests
- Create reusable mock handlers
- Mock different response scenarios (success, error, loading)
- Example:
  ```typescript
  // mocks/handlers.ts
  import { rest } from 'msw';
  
  export const handlers = [
    rest.get('/api/goals', (req, res, ctx) => {
      return res(ctx.json([{ id: '1', title: 'Test Goal' }]));
    }),
    rest.post('/api/goals', (req, res, ctx) => {
      return res(ctx.status(201), ctx.json({ id: '2', title: 'New Goal' }));
    }),
  ];
  ```

### Mocking External Dependencies
- Mock time/date functions (important for goal deadlines, streaks)
- Mock localStorage/sessionStorage
- Mock window APIs
- Mock third-party libraries when needed
- Example:
  ```typescript
  // Mock date
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2024-01-15'));
  
  // Mock localStorage
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn(),
  };
  global.localStorage = localStorageMock as any;
  ```

### Mocking Ant Design Components
- Only mock if necessary (Ant Design is well-tested)
- Mock complex components like DatePicker for time-dependent tests
- Keep mocks simple and maintainable

## Test Organization

### File Structure
- Co-locate tests with source files: `Component.tsx` and `Component.test.tsx`
- Or use `__tests__` directories: `Component.tsx` and `__tests__/Component.test.tsx`
- Group related tests in describe blocks
- Use descriptive test file names

### Test Naming
- Use descriptive test names: `it('should do X when Y', ...)`
- Use describe blocks to group related tests
- Follow AAA pattern (Arrange, Act, Assert)
- Example:
  ```typescript
  describe('GoalCard', () => {
    describe('when goal is active', () => {
      it('should display progress bar', () => {});
      it('should show edit button', () => {});
    });
    
    describe('when goal is completed', () => {
      it('should display completion badge', () => {});
      it('should hide edit button', () => {});
    });
  });
  ```

### Test Independence
- Each test should be independent
- Don't rely on test execution order
- Clean up after tests (reset mocks, clear state)
- Use beforeEach/afterEach for setup/teardown

### Test Utilities
- Create custom render functions with providers
- Create test helpers for common patterns
- Create test fixtures for sample data
- Example:
  ```typescript
  // test-utils.tsx
  import { render } from '@testing-library/react';
  import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
  import { BrowserRouter } from 'react-router-dom';
  
  export const renderWithProviders = (ui: React.ReactElement) => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });
    
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {ui}
        </BrowserRouter>
      </QueryClientProvider>
    );
  };
  ```

## Edge Cases

### What to Test
- Error states (network errors, API errors, validation errors)
- Empty states (no goals, no search results)
- Boundary conditions (min/max values, empty strings, null/undefined)
- Invalid inputs (wrong types, out of range values)
- Network failures (timeout, offline, 500 errors)
- Concurrent operations (multiple updates, race conditions)
- Extreme values (very large numbers, very long strings)

### Example Edge Case Tests
```typescript
describe('Edge Cases', () => {
  it('should handle network timeout', async () => {
    server.use(
      rest.get('/api/goals', (req, res, ctx) => {
        return res(ctx.delay('infinite'));
      })
    );
    
    render(<GoalList />);
    await waitFor(() => {
      expect(screen.getByText(/timeout/i)).toBeInTheDocument();
    });
  });
  
  it('should handle empty goal list', () => {
    render(<GoalList goals={[]} />);
    expect(screen.getByText(/no goals found/i)).toBeInTheDocument();
  });
  
  it('should handle very large numbers', () => {
    const result = calculateProgress(0, Number.MAX_SAFE_INTEGER, 100);
    expect(result).toBe(100); // Should clamp to 100%
  });
});
```

## Snapshot Testing

### When to Use
- Use sparingly for stable UI components
- Test component structure, not styling
- Update snapshots when intentional changes are made
- Avoid for frequently changing components

### When NOT to Use
- Don't use for components with dynamic content
- Don't use for components with dates/timestamps
- Don't use as primary testing strategy
- Don't use for Ant Design components (they're already tested)

### Example
```typescript
it('should match snapshot', () => {
  const { container } = render(<GoalCard goal={mockGoal} />);
  expect(container).toMatchSnapshot();
});
```

## Visual Regression Testing

### Tools
- Playwright screenshots
- Percy
- Chromatic
- Use for critical UI components
- Test responsive breakpoints

## Test Data Management

### Test Fixtures
- Create reusable test data
- Use factories for generating test data
- Keep fixtures in `__fixtures__` or `test/fixtures`
- Example:
  ```typescript
  // test/fixtures/goals.ts
  export const createMockGoal = (overrides = {}) => ({
    id: '1',
    title: 'Test Goal',
    progress: 50,
    ...overrides,
  });
  ```

### Test Database
- Use separate test database
- Reset between test suites
- Seed with test data
- Cleanup after tests

## Test Execution Strategy

### Pre-commit Hooks
- Run unit tests
- Run component tests
- Run linting
- Fast feedback loop

### CI/CD Pipeline
- All unit tests
- All component tests
- Integration tests
- E2E tests (smoke tests)
- Performance tests (nightly)
- Coverage reporting

### Manual Testing
- Exploratory testing
- Usability testing
- Cross-browser testing
- Accessibility audit

## Code Coverage

### Coverage Goals
- Aim for 90%+ on critical paths
- Focus on business logic, not just lines
- Don't sacrifice test quality for coverage numbers
- Use coverage reports to find untested code

### Coverage Tools
- Istanbul/nyc for Jest
- Vitest built-in coverage
- Configure coverage thresholds
- Exclude test files and generated code

## Best Practices

### General
- Write tests before or alongside code (TDD when possible)
- Test user behavior, not implementation
- Keep tests simple and readable
- One assertion per test when possible
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests independent
- Clean up after tests

### Performance
- Keep tests fast (unit tests should be < 100ms)
- Use parallel test execution
- Mock expensive operations
- Avoid unnecessary renders

### Maintainability
- Refactor tests when code changes
- Remove obsolete tests
- Keep test code DRY (but readable)
- Document complex test scenarios
- Review test code in PRs

### Debugging
- Use meaningful error messages
- Use `screen.debug()` to see rendered output
- Use `logRoles()` to see available roles
- Use test.only/test.skip for debugging

## Common Testing Patterns

### Testing Forms
- Test validation
- Test submission
- Test field interactions
- Test error messages

### Testing Lists/Tables
- Test rendering
- Test filtering
- Test sorting
- Test pagination
- Test empty states

### Testing Modals/Dialogs
- Test open/close
- Test focus management
- Test keyboard navigation
- Test backdrop clicks

### Testing Async Operations
- Test loading states
- Test success states
- Test error states
- Test cleanup

## Resources

### Documentation
- [React Testing Library](https://testing-library.com/react)
- [Jest](https://jestjs.io/)
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)
- [MSW](https://mswjs.io/)
- [Testing Library Queries](https://testing-library.com/docs/queries/about/)

### Testing Guides
- [Common mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Testing Best Practices](https://kentcdodds.com/blog/testing-best-practices)

