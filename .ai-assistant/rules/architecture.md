# Architecture

## System Architecture

### Core Principles

- **Component-based architecture** with feature-based organization
- **Separation of concerns**: UI, business logic, data layer
- **Unidirectional data flow**: Predictable state updates
- **Modular and scalable design**: Easy to extend and maintain
- **Type-safe development**: TypeScript throughout
- **Performance-first**: Code splitting, lazy loading, optimization

### Architectural Layers

```
┌─────────────────────────────────────┐
│   Presentation Layer (UI)            │
│   - React Components                │
│   - Ant Design Components           │
│   - Layout & Navigation             │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│   Business Logic Layer               │
│   - Custom Hooks                   │
│   - Utilities & Helpers             │
│   - Business Rules                  │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│   Data Layer                        │
│   - API Services                    │
│   - React Query                     │
│   - State Management                │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│   Infrastructure Layer              │
│   - HTTP Client                     │
│   - Error Handling                  │
│   - Logging & Monitoring            │
└─────────────────────────────────────┘
```

## Component Architecture

### Component Types

#### Presentational Components

- **Purpose**: Pure UI components, receive props, no business logic
- **Characteristics**: Stateless (or minimal local UI state), reusable, testable
- **Location**: `src/components/common/` or `src/components/{feature}/`
- **Example**:

  ```typescript
  // components/common/Button.tsx
  interface ButtonProps {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
    disabled?: boolean;
  }

  export const Button: React.FC<ButtonProps> = ({
    label,
    onClick,
    variant = 'primary',
    disabled
  }) => {
    return (
      <AntButton
        type={variant === 'primary' ? 'primary' : 'default'}
        onClick={onClick}
        disabled={disabled}
      >
        {label}
      </AntButton>
    );
  };
  ```

#### Container Components

- **Purpose**: Handle data fetching and state management
- **Characteristics**: Connect to data layer, manage side effects, orchestrate presentational components
- **Location**: `src/pages/` or `src/features/{feature}/components/`
- **Example**:

  ```typescript
  // pages/GoalsPage.tsx
  export const GoalsPage: React.FC = () => {
    const { data: goals, isLoading, error } = useGoals();
    const { mutate: createGoal } = useCreateGoal();

    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorDisplay error={error} />;

    return (
      <div>
        <GoalsHeader onCreateGoal={createGoal} />
        <GoalsList goals={goals} />
      </div>
    );
  };
  ```

#### Feature Components

- **Purpose**: Domain-specific components grouped by feature
- **Characteristics**: Feature-specific logic, may combine presentational and container patterns
- **Location**: `src/features/{feature}/components/`
- **Example**:

  ```typescript
  // features/goals/components/GoalCard.tsx
  export const GoalCard: React.FC<{ goal: Goal }> = ({ goal }) => {
    const { mutate: updateProgress } = useUpdateGoalProgress();
    const { mutate: deleteGoal } = useDeleteGoal();

    return (
      <Card>
        <GoalHeader goal={goal} />
        <ProgressIndicator progress={goal.progress} />
        <GoalActions
          onUpdateProgress={updateProgress}
          onDelete={deleteGoal}
        />
      </Card>
    );
  };
  ```

#### Layout Components

- **Purpose**: Page structure and navigation
- **Characteristics**: Define page layout, handle routing, provide navigation
- **Location**: `src/components/layout/` or `src/layouts/`
- **Example**:
  ```typescript
  // layouts/MainLayout.tsx
  export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
      <Layout>
        <Header>
          <Navigation />
        </Header>
        <Layout>
          <Sider>
            <Sidebar />
          </Sider>
          <Content>
            {children}
          </Content>
        </Layout>
        <Footer />
      </Layout>
    );
  };
  ```

#### Shared Components

- **Purpose**: Reusable UI components used across features
- **Characteristics**: Generic, configurable, well-documented
- **Location**: `src/components/common/`
- **Examples**: Button, Modal, LoadingSpinner, ErrorBoundary

### Component Composition Patterns

#### Compound Components

- Related components that work together
- Share implicit state through context
- Example:

  ```typescript
  // components/common/Accordion.tsx
  const AccordionContext = createContext<{ activeKey?: string }>({});

  export const Accordion: React.FC & {
    Panel: typeof AccordionPanel;
  } = ({ children }) => {
    const [activeKey, setActiveKey] = useState<string>();
    return (
      <AccordionContext.Provider value={{ activeKey }}>
        {children}
      </AccordionContext.Provider>
    );
  };

  const AccordionPanel: React.FC<{ title: string; key: string }> = ({ title, key }) => {
    const { activeKey } = useContext(AccordionContext);
    return <div>{/* Panel content */}</div>;
  };

  Accordion.Panel = AccordionPanel;
  ```

#### Render Props

- Flexible component composition (use sparingly)
- Pass render function as prop
- Example:
  ```typescript
  <DataFetcher
    url="/api/goals"
    render={(data, loading, error) => {
      if (loading) return <Spinner />;
      if (error) return <Error error={error} />;
      return <GoalsList goals={data} />;
    }}
  />
  ```

## Design Patterns

### Custom Hooks

- **Purpose**: Extract reusable logic from components
- **Naming**: Always start with `use` prefix
- **Location**: `src/hooks/` (global) or `src/features/{feature}/hooks/` (feature-specific)
- **Example**:

  ```typescript
  // hooks/useGoalProgress.ts
  export const useGoalProgress = (goal: Goal) => {
    const [progress, setProgress] = useState(goal.currentProgress);
    const { mutate: updateProgress } = useUpdateGoalProgress();

    const handleProgressChange = (newProgress: number) => {
      setProgress(newProgress);
      updateProgress({ goalId: goal.id, progress: newProgress });
    };

    return {
      progress,
      handleProgressChange,
      percentage: calculatePercentage(goal, progress),
    };
  };
  ```

### Higher-Order Components (HOCs)

- **Use sparingly**: Prefer hooks for most cases
- **When to use**: Cross-cutting concerns that need component wrapping
- **Example**:

  ```typescript
  // HOC for authentication
  export const withAuth = <P extends object>(
    Component: React.ComponentType<P>
  ) => {
    return (props: P) => {
      const { isAuthenticated } = useAuth();

      if (!isAuthenticated) {
        return <Navigate to="/login" />;
      }

      return <Component {...props} />;
    };
  };
  ```

### Provider Pattern

- **Purpose**: Share context across component tree
- **Common uses**: Theme, authentication, notifications
- **Example**:

  ```typescript
  // providers/ThemeProvider.tsx
  export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    return (
      <ThemeContext.Provider value={{ theme, setTheme }}>
        <ConfigProvider theme={antdTheme[theme]}>
          {children}
        </ConfigProvider>
      </ThemeContext.Provider>
    );
  };
  ```

## Data Flow

### Unidirectional Data Flow

```
User Interaction
    ↓
Component Event Handler
    ↓
Custom Hook / Service Call
    ↓
API Service / State Update
    ↓
React Query / State Management
    ↓
State Change
    ↓
Component Re-render
```

### Detailed Flow Example

```typescript
// 1. User clicks "Update Progress" button
<Button onClick={handleProgressUpdate}>Update</Button>

// 2. Event handler calls custom hook
const handleProgressUpdate = () => {
  updateGoalProgress({ goalId, progress: newProgress });
};

// 3. Custom hook uses React Query mutation
const { mutate: updateGoalProgress } = useMutation({
  mutationFn: goalService.updateProgress,
  onSuccess: () => {
    queryClient.invalidateQueries(['goal', goalId]);
  },
});

// 4. Service makes API call
export const goalService = {
  updateProgress: async (params) => {
    return apiClient.patch(`/goals/${params.goalId}/progress`, params);
  },
};

// 5. React Query updates cache
// 6. Components using the query automatically re-render
```

## Layer Separation

### Presentation Layer

- **Responsibility**: UI rendering, user interactions, visual feedback
- **Technologies**: React, Ant Design, CSS
- **Should NOT**: Make direct API calls, contain business logic, manage global state
- **Example**: `components/`, `pages/`, `layouts/`

### Business Logic Layer

- **Responsibility**: Business rules, data transformation, validation
- **Technologies**: Custom hooks, utility functions, business logic services
- **Should NOT**: Handle HTTP requests directly, manage UI state
- **Example**: `hooks/`, `utils/`, `features/{feature}/utils/`

### Data Layer

- **Responsibility**: Data fetching, caching, state management
- **Technologies**: React Query, API services, state management (Redux/Zustand)
- **Should NOT**: Contain UI components, business logic
- **Example**: `services/`, `store/`, `features/{feature}/services/`

### Infrastructure Layer

- **Responsibility**: HTTP client, error handling, logging, monitoring
- **Technologies**: Axios, error tracking, logging services
- **Should NOT**: Contain business logic, UI components
- **Example**: `services/apiClient.ts`, error handlers, logging utilities

## Feature Modules

### Feature Structure

Each feature is self-contained with clear boundaries:

```
features/
  goals/
    components/        # Feature-specific components
      GoalCard.tsx
      GoalForm.tsx
      GoalList.tsx
    hooks/            # Feature-specific hooks
      useGoals.ts
      useGoalProgress.ts
    services/         # Feature API services (if not in global services)
      goalApi.ts
    types/            # Feature-specific types
      goal.types.ts
    utils/            # Feature-specific utilities
      calculateProgress.ts
      formatGoalDate.ts
    index.ts          # Public API (exports)
```

### Feature Principles

- **Self-contained**: All feature code in one directory
- **Clear boundaries**: Minimal dependencies on other features
- **Public API**: Export only what other features need via `index.ts`
- **Lazy loading**: Features can be code-split and lazy-loaded
- **Shared code**: Common utilities go in `src/utils/` or `src/components/common/`

### Feature Example

```typescript
// features/goals/index.ts - Public API
export { GoalCard, GoalList, GoalForm } from './components';
export { useGoals, useGoal, useCreateGoal } from './hooks';
export type { Goal, GoalStatus, GoalType } from './types';

// features/goals/components/GoalCard.tsx
import { useGoalProgress } from '../hooks/useGoalProgress';
import type { Goal } from '../types';

export const GoalCard: React.FC<{ goal: Goal }> = ({ goal }) => {
  const { progress, handleProgressChange } = useGoalProgress(goal);
  // Component implementation
};

// features/goals/hooks/useGoals.ts
import { useQuery } from '@tanstack/react-query';
import { goalService } from '@/services/goalService';

export const useGoals = (filters?: GoalFilters) => {
  return useQuery({
    queryKey: ['goals', filters],
    queryFn: () => goalService.getAll(filters),
  });
};
```

## State Management Strategy

### Server State (React Query)

- **Purpose**: API data, caching, synchronization
- **When to use**: All data fetched from APIs
- **Location**: `hooks/` or `features/{feature}/hooks/`
- **Example**:
  ```typescript
  // Server state - React Query
  const { data: goals, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => goalService.getAll(),
  });
  ```

### Client State (Redux)

- **Purpose**: UI state, user preferences, global app state
- **When to use**: State that needs to be shared across many components
- **Location**: `store/` or `src/features/{feature}/store/`
- **Example**:

  ```typescript
  // Client state - Zustand
  interface UIStore {
    sidebarOpen: boolean;
    toggleSidebar: () => void;
  }

  export const useUIStore = create<UIStore>((set) => ({
    sidebarOpen: false,
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  }));
  ```

### Form State (Ant Design Form)

- **Purpose**: Form-specific state, validation
- **When to use**: All forms
- **Location**: Component level
- **Example**:

  ```typescript
  // Form state - Ant Design Form
  const [form] = Form.useForm();

  <Form form={form} onFinish={handleSubmit}>
    <Form.Item name="title" rules={[{ required: true }]}>
      <Input />
    </Form.Item>
  </Form>
  ```

### URL State (React Router)

- **Purpose**: Navigation, filters, search params
- **When to use**: State that should be shareable via URL
- **Location**: Route definitions, component query params
- **Example**:

  ```typescript
  // URL state - React Router
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = searchParams.get('filter');

  const updateFilter = (newFilter: string) => {
    setSearchParams({ filter: newFilter });
  };
  ```

### Local Component State (useState)

- **Purpose**: Component-specific UI state
- **When to use**: State that doesn't need to be shared
- **Location**: Component level
- **Example**:
  ```typescript
  // Local state
  const [isExpanded, setIsExpanded] = useState(false);
  ```

## Routing Architecture

### Route Structure

- **File-based routing** (if using Next.js) or **component-based routing** (React Router)
- **Lazy loading** for route components
- **Protected routes** for authenticated pages
- **Example**:

  ```typescript
  // routes/index.tsx
  import { lazy } from 'react';
  import { Routes, Route } from 'react-router-dom';

  const GoalsPage = lazy(() => import('@/pages/GoalsPage'));
  const GoalDetailPage = lazy(() => import('@/pages/GoalDetailPage'));

  export const AppRoutes = () => (
    <Routes>
      <Route path="/goals" element={<GoalsPage />} />
      <Route path="/goals/:id" element={<GoalDetailPage />} />
    </Routes>
  );
  ```

### Route Organization

- Group related routes together
- Use route guards for authentication
- Handle 404 and error routes
- Example:
  ```typescript
  <Routes>
    <Route element={<ProtectedRoute />}>
      <Route path="/goals/*" element={<GoalsRoutes />} />
    </Route>
    <Route path="/login" element={<LoginPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
  ```

## API Architecture

### RESTful Design

- **Consistent endpoint naming**: `/api/goals`, `/api/goals/:id`
- **HTTP methods**: GET (read), POST (create), PATCH (update), DELETE (delete)
- **Standardized responses**: Consistent structure across all endpoints
- **Error handling**: Standardized error response format

### Endpoint Patterns

```typescript
// Resource endpoints
GET    /api/goals              # List goals
GET    /api/goals/:id          # Get goal by ID
POST   /api/goals              # Create goal
PATCH  /api/goals/:id          # Update goal
DELETE /api/goals/:id          # Delete goal

// Nested resources
GET    /api/goals/:id/milestones    # Get goal milestones
POST   /api/goals/:id/milestones    # Create milestone

// Actions
POST   /api/goals/:id/complete       # Complete goal
POST   /api/goals/:id/progress       # Update progress
```

### Request/Response Standards

- **Request**: JSON body, query parameters for filters
- **Response**: Consistent wrapper structure
- **Pagination**: Standard pagination format
- **Error responses**: Standardized error format
- See [API & Data Handling](./api-data-handling.md) for details

## Performance Architecture

### Code Splitting

- **Route-based splitting**: Each route is a separate chunk
- **Component-based splitting**: Lazy load heavy components
- **Example**:

  ```typescript
  // Lazy load route
  const GoalsPage = lazy(() => import('@/pages/GoalsPage'));

  // Lazy load component
  const HeavyChart = lazy(() => import('@/components/HeavyChart'));
  ```

### Caching Strategy

- **React Query**: Automatic caching for API data
- **Browser cache**: Static assets, API responses (via headers)
- **Local storage**: User preferences, offline data
- **Memory cache**: In-memory caching for computed values

### Rendering Optimization

- **React.memo**: Memoize expensive components
- **useMemo**: Memoize expensive computations
- **useCallback**: Memoize callback functions
- **Virtual scrolling**: For large lists (Ant Design Table supports this)

### Bundle Optimization

- **Tree shaking**: Remove unused code
- **Dynamic imports**: Load code on demand
- **Asset optimization**: Compress images, minify code
- **CDN**: Serve static assets from CDN

## Testing Architecture

### Testing Layers

```
┌─────────────────────────────────────┐
│   E2E Tests (Playwright/Cypress)    │
│   - Full user flows                 │
│   - Critical paths                  │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│   Integration Tests                  │
│   - Feature integration              │
│   - API integration                  │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│   Component Tests (React Testing)   │
│   - Component behavior               │
│   - User interactions               │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│   Unit Tests (Jest/Vitest)          │
│   - Utilities                        │
│   - Hooks                            │
│   - Services                         │
└─────────────────────────────────────┘
```

### Test Organization

- Mirror source structure in test files
- Co-locate tests with source files or in `__tests__` directories
- Use descriptive test names
- Example:
  ```
  src/
    features/
      goals/
        components/
          GoalCard.tsx
          GoalCard.test.tsx
        hooks/
          useGoals.ts
          useGoals.test.ts
  ```

## Dependency Management

### Dependency Layers

```
┌─────────────────────────────────────┐
│   External Dependencies             │
│   - React, React DOM                │
│   - Ant Design                      │
│   - React Query                     │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│   Internal Shared Dependencies       │
│   - Common components               │
│   - Global utilities                │
│   - Global hooks                    │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│   Feature Dependencies              │
│   - Feature components               │
│   - Feature hooks                    │
│   - Feature utilities                │
└─────────────────────────────────────┘
```

### Dependency Rules

- **Features should NOT depend on other features directly**
- **Use shared utilities** for cross-feature functionality
- **Import from feature public API** (`index.ts`) when needed
- **Avoid circular dependencies**

## Scalability Considerations

### Code Organization

- **Feature-based structure**: Scales well as features grow
- **Clear boundaries**: Easy to understand and maintain
- **Modular design**: Features can be developed independently

### Performance

- **Code splitting by route**: Load only needed code
- **Lazy loading**: Load components on demand
- **Virtual scrolling**: Handle large lists efficiently
- **Pagination**: Limit data transfer
- **Caching**: Reduce API calls

### Team Scalability

- **Clear ownership**: Each feature can be owned by a team
- **Consistent patterns**: Easy for new team members
- **Documentation**: Well-documented architecture
- **Code reviews**: Maintain quality as team grows

### Technical Scalability

- **Type safety**: Catch errors at compile time
- **Error boundaries**: Prevent cascading failures
- **Monitoring**: Track performance and errors
- **Logging**: Debug issues in production

## Best Practices

### Architecture Principles

1. **Separation of concerns**: Each layer has clear responsibility
2. **Single responsibility**: Components and functions do one thing
3. **DRY (Don't Repeat Yourself)**: Extract reusable code
4. **KISS (Keep It Simple)**: Prefer simple solutions
5. **YAGNI (You Aren't Gonna Need It)**: Don't over-engineer

### Code Organization

1. **Feature-first**: Organize by feature, not by type
2. **Public APIs**: Export only what's needed
3. **Clear naming**: Use descriptive names
4. **Consistent patterns**: Follow established patterns

### Performance

1. **Measure first**: Profile before optimizing
2. **Lazy load**: Load code on demand
3. **Cache wisely**: Cache expensive operations
4. **Optimize renders**: Use memoization appropriately

### Maintainability

1. **Type safety**: Use TypeScript strictly
2. **Documentation**: Document complex logic
3. **Testing**: Write tests for critical paths
4. **Code reviews**: Maintain code quality
