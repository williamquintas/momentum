# State Management

## State Management Strategy

### When to Use What
- **Server State**: Use React Query for all server-side data (goals, user data, API responses)
- **Global Client State**: Use Zustand or Redux Toolkit for app-wide state (auth, UI preferences, filters)
- **Local Component State**: Use useState/useReducer for component-specific UI state
- **Form State**: Use React Hook Form or Formik for form state management
- **URL State**: Use React Router for shareable state (filters, selected items)

## Zustand (Recommended for Global Client State)
- Use Zustand for lightweight global state management
- Create feature-based stores (e.g., `useAuthStore`, `useUISettingsStore`)
- Use TypeScript for type-safe stores
- Implement middleware for logging, persistence, or devtools
- Keep stores focused and single-purpose
- Example:
  ```typescript
  // stores/authStore.ts
  import { create } from 'zustand';
  import { persist } from 'zustand/middleware';
  
  interface AuthState {
    user: User | null;
    token: string | null;
    setUser: (user: User) => void;
    setToken: (token: string) => void;
    logout: () => void;
  }
  
  export const useAuthStore = create<AuthState>()(
    persist(
      (set) => ({
        user: null,
        token: null,
        setUser: (user) => set({ user }),
        setToken: (token) => set({ token }),
        logout: () => set({ user: null, token: null }),
      }),
      { name: 'auth-storage' }
    )
  );
  ```

### Zustand Best Practices
- Use selectors to prevent unnecessary re-renders
- Split large stores into smaller, focused stores
- Use immer middleware for complex state updates
- Implement devtools middleware in development
- Use persist middleware for state that should survive page reloads
- Example selector usage:
  ```typescript
  // Good: Only re-renders when user changes
  const user = useAuthStore((state) => state.user);
  
  // Bad: Re-renders on any store change
  const { user } = useAuthStore();
  ```

## Redux Toolkit (Alternative for Global Client State)
- Use createSlice for feature-based reducers
- Use createAsyncThunk for async operations
- Keep actions and reducers colocated
- Use RTK Query for API calls if applicable
- Use TypeScript for type safety
- Example:
  ```typescript
  // slices/goalsSlice.ts
  import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
  
  export const fetchGoals = createAsyncThunk(
    'goals/fetchGoals',
    async (filters: GoalFilters) => {
      const response = await goalsApi.getGoals(filters);
      return response.data;
    }
  );
  
  const goalsSlice = createSlice({
    name: 'goals',
    initialState: { items: [], loading: false },
    reducers: {
      // sync reducers
    },
    extraReducers: (builder) => {
      builder.addCase(fetchGoals.pending, (state) => {
        state.loading = true;
      });
      // ... handle fulfilled/rejected
    },
  });
  ```

### Redux Best Practices
- Use RTK Query instead of manual API calls when possible
- Keep reducers pure and predictable
- Use selectors with reselect for derived state
- Normalize complex nested data structures
- Use Redux DevTools for debugging

## React Query (Server State)
- Use React Query for all server-side data fetching
- Implement proper cache invalidation strategies
- Use optimistic updates for better UX
- Handle loading and error states consistently
- Use query keys consistently with a clear structure
- Example query key structure: `['goals', filters]`, `['goal', id]`, `['goal', id, 'progress']`
- Example:
  ```typescript
  // hooks/useGoals.ts
  import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
  import { goalsApi } from '../services/goalsApi';
  
  export const useGoals = (filters: GoalFilters) => {
    return useQuery({
      queryKey: ['goals', filters],
      queryFn: () => goalsApi.getGoals(filters),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };
  
  export const useCreateGoal = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: goalsApi.createGoal,
      onSuccess: () => {
        // Invalidate and refetch goals list
        queryClient.invalidateQueries({ queryKey: ['goals'] });
      },
      onError: (error) => {
        // Handle error
      },
    });
  };
  ```

### React Query Best Practices
- Use consistent query key factories
- Set appropriate staleTime and cacheTime
- Use query invalidation strategically
- Implement optimistic updates for mutations
- Use query prefetching for better UX
- Handle errors at the query level and component level
- Use query cancellation for cleanup
- Example query key factory:
  ```typescript
  // utils/queryKeys.ts
  export const queryKeys = {
    goals: {
      all: ['goals'] as const,
      lists: () => [...queryKeys.goals.all, 'list'] as const,
      list: (filters: GoalFilters) => [...queryKeys.goals.lists(), filters] as const,
      details: () => [...queryKeys.goals.all, 'detail'] as const,
      detail: (id: string) => [...queryKeys.goals.details(), id] as const,
    },
  };
  ```

## Local State
- Use useState for simple component-specific UI state
- Use useReducer for complex local state with multiple sub-values
- Lift state up when shared between sibling components
- Consider context for deeply nested prop drilling (but prefer Zustand/Redux for global state)
- Example useReducer usage:
  ```typescript
  // For complex form state or multi-step flows
  const [state, dispatch] = useReducer(goalFormReducer, initialState);
  ```

### Local State Best Practices
- Keep state as close to where it's used as possible
- Avoid prop drilling beyond 2-3 levels
- Use composition over context when possible
- Extract complex state logic into custom hooks

## State Synchronization

### React Query + Zustand/Redux
- Use React Query for server state
- Use Zustand/Redux for derived client state
- Sync React Query cache with Zustand/Redux when needed
- Example:
  ```typescript
  // Sync React Query data to Zustand store
  const { data: goals } = useGoals(filters);
  const setGoals = useGoalsStore((state) => state.setGoals);
  
  useEffect(() => {
    if (goals) {
      setGoals(goals);
    }
  }, [goals, setGoals]);
  ```

## State Persistence
- Use Zustand persist middleware for client-side persistence
- Use React Query persistence for offline support
- Persist only necessary state (auth, preferences)
- Clear persisted state on logout
- Example:
  ```typescript
  // Persist UI preferences
  export const useUISettingsStore = create<UISettingsState>()(
    persist(
      (set) => ({
        theme: 'light',
        setTheme: (theme) => set({ theme }),
      }),
      { name: 'ui-settings' }
    )
  );
  ```

## State Management Patterns

### Optimistic Updates
- Update UI immediately, rollback on error
- Use React Query's optimistic updates
- Example:
  ```typescript
  const updateGoal = useMutation({
    mutationFn: goalsApi.updateGoal,
    onMutate: async (newGoal) => {
      await queryClient.cancelQueries({ queryKey: ['goal', newGoal.id] });
      const previousGoal = queryClient.getQueryData(['goal', newGoal.id]);
      queryClient.setQueryData(['goal', newGoal.id], newGoal);
      return { previousGoal };
    },
    onError: (err, newGoal, context) => {
      queryClient.setQueryData(['goal', newGoal.id], context?.previousGoal);
    },
  });
  ```

### Derived State
- Compute derived state in selectors or useMemo
- Avoid storing derived state in stores
- Example:
  ```typescript
  // Good: Compute in selector
  const completedGoals = useGoalsStore(
    (state) => state.goals.filter((g) => g.status === 'completed')
  );
  
  // Bad: Store derived state
  const completedGoals = useGoalsStore((state) => state.completedGoals);
  ```

## Performance Considerations
- Use selectors to prevent unnecessary re-renders
- Memoize expensive computations
- Use React.memo for components that receive stable props
- Split large stores into smaller stores
- Use React Query's select option to transform data
- Example:
  ```typescript
  // Only re-render when goal title changes
  const goalTitle = useQuery({
    queryKey: ['goal', id],
    queryFn: () => goalsApi.getGoal(id),
    select: (data) => data.title,
  });
  ```

## Testing State Management
- Test stores in isolation
- Mock React Query in component tests
- Test state transitions and edge cases
- Use testing utilities for Zustand/Redux
- Example:
  ```typescript
  // Test Zustand store
  import { renderHook, act } from '@testing-library/react';
  import { useAuthStore } from './authStore';
  
  test('logout clears user', () => {
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.setUser({ id: '1', name: 'Test' });
      result.current.logout();
    });
    expect(result.current.user).toBeNull();
  });
  ```

## URL State Management
- Use URL search params for shareable state (filters, search, sort, pagination)
- Sync URL state with store state for consistency
- Use React Router's `useSearchParams` for URL state
- Debounce URL updates to avoid excessive history entries
- Example:
  ```typescript
  // hooks/useGoalFilters.ts
  import { useSearchParams } from 'react-router-dom';
  import { useGoalFiltersStore } from '../stores/goalFiltersStore';
  
  export const useGoalFilters = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { filters, setFilters } = useGoalFiltersStore();
    
    // Sync URL to store on mount
    useEffect(() => {
      const urlFilters = parseFiltersFromURL(searchParams);
      setFilters(urlFilters);
    }, []);
    
    // Sync store to URL on filter change
    useEffect(() => {
      const newParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) newParams.set(key, String(value));
      });
      setSearchParams(newParams, { replace: true });
    }, [filters]);
    
    return { filters, setFilters };
  };
  ```

## Form State Management
- Use React Hook Form for form state (recommended) or Ant Design Form
- Keep form state separate from global state
- Persist form drafts to localStorage for recovery
- Clear form state on successful submission
- Example:
  ```typescript
  // hooks/useGoalForm.ts
  import { useForm } from 'react-hook-form';
  import { zodResolver } from '@hookform/resolvers/zod';
  import { goalSchema } from '../schemas/goal.schemas';
  
  export const useGoalForm = (initialData?: Partial<Goal>) => {
    const form = useForm<GoalInput>({
      resolver: zodResolver(goalSchema),
      defaultValues: initialData,
    });
    
    // Auto-save draft
    useEffect(() => {
      const subscription = form.watch((value) => {
        localStorage.setItem('goal-form-draft', JSON.stringify(value));
      });
      return () => subscription.unsubscribe();
    }, [form]);
    
    return form;
  };
  ```

## Error State Management
- Store error state separately from data state
- Use React Query's built-in error handling for server errors
- Store client-side errors in component state or error store
- Clear errors when user takes corrective action
- Example:
  ```typescript
  // stores/errorStore.ts
  interface ErrorState {
    errors: Map<string, Error>;
    addError: (key: string, error: Error) => void;
    removeError: (key: string) => void;
    clearAll: () => void;
  }
  
  export const useErrorStore = create<ErrorState>((set) => ({
    errors: new Map(),
    addError: (key, error) => set((state) => {
      const newErrors = new Map(state.errors);
      newErrors.set(key, error);
      return { errors: newErrors };
    }),
    removeError: (key) => set((state) => {
      const newErrors = new Map(state.errors);
      newErrors.delete(key);
      return { errors: newErrors };
    }),
    clearAll: () => set({ errors: new Map() }),
  }));
  ```

## Loading State Management
- Use React Query's `isLoading`, `isFetching`, `isPending` for server state
- Store UI-specific loading states in component state or UI store
- Show loading states per operation, not globally
- Example:
  ```typescript
  // stores/uiStore.ts
  interface UIState {
    loadingOperations: Set<string>;
    setLoading: (operation: string, loading: boolean) => void;
    isLoading: (operation: string) => boolean;
  }
  
  export const useUIStore = create<UIState>((set, get) => ({
    loadingOperations: new Set(),
    setLoading: (operation, loading) => set((state) => {
      const newSet = new Set(state.loadingOperations);
      if (loading) {
        newSet.add(operation);
      } else {
        newSet.delete(operation);
      }
      return { loadingOperations: newSet };
    }),
    isLoading: (operation) => get().loadingOperations.has(operation),
  }));
  ```

## State Normalization
- Normalize nested data structures for better performance
- Use entities pattern for lists with relationships
- Denormalize only when needed for display
- Example:
  ```typescript
  // Normalized state structure
  interface NormalizedGoalsState {
    entities: {
      goals: Record<string, Goal>;
      milestones: Record<string, Milestone>;
      progressEntries: Record<string, ProgressEntry>;
    };
    ids: string[];
    relationships: {
      goalMilestones: Record<string, string[]>; // goalId -> milestoneIds
      goalProgress: Record<string, string[]>; // goalId -> progressEntryIds
    };
  }
  ```

## State Migration
- Version persisted state for schema changes
- Migrate old state format to new format on load
- Handle missing or invalid persisted state gracefully
- Example:
  ```typescript
  // stores/authStore.ts with migration
  export const useAuthStore = create<AuthState>()(
    persist(
      (set) => ({ /* ... */ }),
      {
        name: 'auth-storage',
        version: 2,
        migrate: (persistedState: any, version: number) => {
          if (version < 2) {
            // Migrate from v1 to v2
            return {
              ...persistedState,
              // Add new fields, transform old fields
            };
          }
          return persistedState;
        },
      }
    )
  );
  ```

## Offline State Management
- Queue mutations when offline
- Sync queued mutations when connection restored
- Show offline indicator and queued operations count
- Use React Query's offline support
- Example:
  ```typescript
  // stores/offlineStore.ts
  interface OfflineState {
    isOnline: boolean;
    queuedMutations: QueuedMutation[];
    addQueuedMutation: (mutation: QueuedMutation) => void;
    processQueue: () => Promise<void>;
  }
  
  export const useOfflineStore = create<OfflineState>((set, get) => ({
    isOnline: navigator.onLine,
    queuedMutations: [],
    addQueuedMutation: (mutation) => set((state) => ({
      queuedMutations: [...state.queuedMutations, mutation],
    })),
    processQueue: async () => {
      const { queuedMutations } = get();
      for (const mutation of queuedMutations) {
        try {
          await mutation.execute();
          set((state) => ({
            queuedMutations: state.queuedMutations.filter(m => m !== mutation),
          }));
        } catch (error) {
          // Keep in queue for retry
        }
      }
    },
  }));
  ```

## Real-time State Updates
- Integrate WebSocket/SSE for real-time updates
- Update React Query cache on real-time events
- Handle conflicts when local and remote updates collide
- Example:
  ```typescript
  // hooks/useRealtimeGoals.ts
  import { useQueryClient } from '@tanstack/react-query';
  import { useEffect } from 'react';
  
  export const useRealtimeGoals = () => {
    const queryClient = useQueryClient();
    
    useEffect(() => {
      const ws = new WebSocket(WS_URL);
      
      ws.onmessage = (event) => {
        const { type, data } = JSON.parse(event.data);
        
        switch (type) {
          case 'GOAL_UPDATED':
            queryClient.setQueryData(['goal', data.id], data);
            queryClient.invalidateQueries({ queryKey: ['goals'] });
            break;
          case 'GOAL_CREATED':
            queryClient.invalidateQueries({ queryKey: ['goals'] });
            break;
          case 'GOAL_DELETED':
            queryClient.removeQueries({ queryKey: ['goal', data.id] });
            queryClient.invalidateQueries({ queryKey: ['goals'] });
            break;
        }
      };
      
      return () => ws.close();
    }, [queryClient]);
  };
  ```

## State Management for Lists
- Handle pagination, infinite scroll, and filtering
- Cache list data with React Query
- Optimize for large lists with virtualization
- Example:
  ```typescript
  // hooks/useInfiniteGoals.ts
  export const useInfiniteGoals = (filters: GoalFilters) => {
    return useInfiniteQuery({
      queryKey: ['goals', 'infinite', filters],
      queryFn: ({ pageParam = 0 }) => goalsApi.getGoals({
        ...filters,
        page: pageParam,
        limit: 20,
      }),
      getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
      initialPageParam: 0,
    });
  };
  ```

## State Management for Filters & Search
- Debounce search input (300ms recommended)
- Sync filters with URL params
- Cache filtered results
- Example:
  ```typescript
  // hooks/useDebouncedSearch.ts
  export const useDebouncedSearch = (value: string, delay: number = 300) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    
    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      
      return () => clearTimeout(handler);
    }, [value, delay]);
    
    return debouncedValue;
  };
  ```

## State Management for Modals/Dialogs
- Use Zustand store for modal state (which modal is open, props)
- Keep modal content state separate from global state
- Example:
  ```typescript
  // stores/modalStore.ts
  interface ModalState {
    openModals: Map<string, any>;
    openModal: (id: string, props?: any) => void;
    closeModal: (id: string) => void;
    isOpen: (id: string) => boolean;
  }
  ```

## State Management for Notifications
- Use Zustand store for notification queue
- Auto-dismiss notifications after timeout
- Support different notification types (success, error, warning, info)
- Example:
  ```typescript
  // stores/notificationStore.ts
  interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
  }
  
  interface NotificationState {
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id'>) => void;
    removeNotification: (id: string) => void;
  }
  ```

## State Management for Complex Workflows
- Use useReducer for multi-step workflows
- Store workflow state separately from form state
- Example:
  ```typescript
  // For multi-step goal creation
  type GoalCreationStep = 'basic' | 'details' | 'milestones' | 'review';
  
  interface GoalCreationState {
    currentStep: GoalCreationStep;
    completedSteps: GoalCreationStep[];
    formData: Partial<GoalInput>;
  }
  
  const goalCreationReducer = (state: GoalCreationState, action: GoalCreationAction) => {
    // Handle step navigation, data updates, etc.
  };
  ```

## State DevTools
- Use Zustand DevTools middleware in development
- Use Redux DevTools for Redux stores
- Log state changes for debugging
- Example:
  ```typescript
  // stores/authStore.ts with devtools
  export const useAuthStore = create<AuthState>()(
    devtools(
      persist(
        (set) => ({ /* ... */ }),
        { name: 'auth-storage' }
      ),
      { name: 'AuthStore' }
    )
  );
  ```

## State Testing Patterns
- Test state transitions comprehensively
- Test error states and edge cases
- Mock external dependencies
- Example:
  ```typescript
  // Test React Query hook
  import { renderHook, waitFor } from '@testing-library/react';
  import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
  import { useGoals } from './useGoals';
  
  test('fetches goals successfully', async () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    
    const { result } = renderHook(() => useGoals({}), { wrapper });
    
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
  ```

## Common Pitfalls to Avoid
- Don't mix server state and client state in the same store
- Don't duplicate server state in client stores unnecessarily
- Don't use context for frequently changing values
- Don't store derived state when it can be computed
- Don't over-normalize simple data structures
- Don't forget to clean up subscriptions and queries
- Don't mutate state directly (use immer or immutable updates)
- Don't store sensitive data in client state (tokens should be in httpOnly cookies)
- Don't persist large objects to localStorage (use IndexedDB for large data)
- Don't forget to handle state migration when schema changes
- Don't create circular dependencies between stores
- Don't forget to handle race conditions in async state updates

