# Performance Optimization

## Rendering Optimization

### React.memo for Expensive Components
- Use `React.memo` to prevent unnecessary re-renders
- Only memoize components that are expensive to render
- Provide custom comparison function when needed
- Example:
  ```typescript
  // components/GoalCard.tsx
  import React from 'react';
  import { Card } from 'antd';
  import type { Goal } from '@/types';
  
  interface GoalCardProps {
    goal: Goal;
    onUpdate: (id: string) => void;
  }
  
  export const GoalCard = React.memo<GoalCardProps>(({ goal, onUpdate }) => {
    return (
      <Card onClick={() => onUpdate(goal.id)}>
        <h3>{goal.title}</h3>
        <p>Progress: {goal.progress}%</p>
      </Card>
    );
  }, (prevProps, nextProps) => {
    // Custom comparison: only re-render if goal data changed
    return prevProps.goal.id === nextProps.goal.id &&
           prevProps.goal.progress === nextProps.goal.progress &&
           prevProps.goal.title === nextProps.goal.title;
  });
  ```

### useMemo for Expensive Calculations
- Memoize expensive computations that depend on props/state
- Don't overuse - only for truly expensive operations
- Include all dependencies in dependency array
- Example:
  ```typescript
  // components/GoalList.tsx
  import { useMemo } from 'react';
  import type { Goal } from '@/types';
  
  interface GoalListProps {
    goals: Goal[];
    filter: string;
  }
  
  export const GoalList = ({ goals, filter }: GoalListProps) => {
    const filteredGoals = useMemo(() => {
      // Expensive filtering operation
      return goals.filter(goal => 
        goal.title.toLowerCase().includes(filter.toLowerCase())
      ).sort((a, b) => b.priority - a.priority);
    }, [goals, filter]);
    
    return (
      <div>
        {filteredGoals.map(goal => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </div>
    );
  };
  ```

### useCallback for Stable Function References
- Use `useCallback` to prevent child re-renders from function recreation
- Only when passing functions to memoized children
- Include all dependencies in dependency array
- Example:
  ```typescript
  // components/GoalForm.tsx
  import { useCallback } from 'react';
  import { Button } from 'antd';
  
  interface GoalFormProps {
    onSubmit: (data: GoalData) => void;
  }
  
  export const GoalForm = ({ onSubmit }: GoalFormProps) => {
    const handleSubmit = useCallback((values: GoalData) => {
      onSubmit(values);
    }, [onSubmit]);
    
    // Memoized child won't re-render unless handleSubmit reference changes
    return <Form onSubmit={handleSubmit} />;
  };
  ```

### Optimize Dependency Arrays
- Include all values from component scope used in effect/memo/callback
- Use ESLint `exhaustive-deps` rule
- Extract stable values outside component when possible
- Example:
  ```typescript
  // ❌ Bad: Missing dependency
  useEffect(() => {
    fetchGoals(filters);
  }, []); // Missing 'filters' dependency
  
  // ✅ Good: All dependencies included
  useEffect(() => {
    fetchGoals(filters);
  }, [filters, fetchGoals]);
  
  // ✅ Better: Stable function reference
  const fetchGoals = useCallback((filters: GoalFilters) => {
    // fetch logic
  }, []);
  
  useEffect(() => {
    fetchGoals(filters);
  }, [filters, fetchGoals]);
  ```

### Virtual Scrolling for Long Lists
- Use virtual scrolling for lists with 100+ items
- Implement with libraries like `react-window` or `react-virtualized`
- Only render visible items
- Example:
  ```typescript
  // components/VirtualizedGoalList.tsx
  import { FixedSizeList } from 'react-window';
  import { GoalCard } from './GoalCard';
  
  interface VirtualizedGoalListProps {
    goals: Goal[];
    height: number;
  }
  
  export const VirtualizedGoalList = ({ goals, height }: VirtualizedGoalListProps) => {
    const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
      <div style={style}>
        <GoalCard goal={goals[index]} />
      </div>
    );
    
    return (
      <FixedSizeList
        height={height}
        itemCount={goals.length}
        itemSize={120}
        width="100%"
      >
        {Row}
      </FixedSizeList>
    );
  };
  ```

### Lazy Loading Routes
- Use React.lazy for route-level code splitting
- Wrap with Suspense for loading states
- Example:
  ```typescript
  // App.tsx
  import { lazy, Suspense } from 'react';
  import { Spin } from 'antd';
  
  const GoalsPage = lazy(() => import('./pages/GoalsPage'));
  const GoalDetailPage = lazy(() => import('./pages/GoalDetailPage'));
  
  function App() {
    return (
      <Suspense fallback={<Spin size="large" />}>
        <Routes>
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/goals/:id" element={<GoalDetailPage />} />
        </Routes>
      </Suspense>
    );
  }
  ```

### Lazy Load Heavy Components
- Lazy load components that aren't immediately visible
- Use for modals, charts, heavy third-party components
- Example:
  ```typescript
  // components/GoalChart.tsx
  import { lazy, Suspense } from 'react';
  
  const Chart = lazy(() => import('@ant-design/charts').then(mod => ({ default: mod.Column })));
  
  export const GoalChart = ({ data }: { data: ChartData[] }) => {
    return (
      <Suspense fallback={<div>Loading chart...</div>}>
        <Chart data={data} />
      </Suspense>
    );
  };
  ```

## Data Loading Optimization

### Debouncing Search/Filter Inputs
- Debounce user input to reduce API calls
- Use debounce delay of 300-500ms for search
- Example:
  ```typescript
  // hooks/useDebounce.ts
  import { useState, useEffect } from 'react';
  
  export const useDebounce = <T>(value: T, delay: number = 300): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    
    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      
      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);
    
    return debouncedValue;
  };
  
  // Usage
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  const { data } = useGoals({ search: debouncedSearch });
  ```

### Pagination for Large Datasets
- Implement server-side pagination for large lists
- Use Ant Design Table pagination
- Example:
  ```typescript
  // hooks/usePaginatedGoals.ts
  import { useQuery } from '@tanstack/react-query';
  import { goalService } from '@/services/goalService';
  
  export const usePaginatedGoals = (page: number, pageSize: number = 10) => {
    return useQuery({
      queryKey: ['goals', 'paginated', page, pageSize],
      queryFn: () => goalService.getPaginated({ page, pageSize }),
      keepPreviousData: true, // Smooth pagination transitions
    });
  };
  ```

### Infinite Scroll
- Use infinite scroll for continuous content loading
- Implement with React Query's `useInfiniteQuery`
- Example:
  ```typescript
  // hooks/useInfiniteGoals.ts
  import { useInfiniteQuery } from '@tanstack/react-query';
  import { goalService } from '@/services/goalService';
  
  export const useInfiniteGoals = (filters?: GoalFilters) => {
    return useInfiniteQuery({
      queryKey: ['goals', 'infinite', filters],
      queryFn: ({ pageParam = 1 }) => 
        goalService.getPaginated({ page: pageParam, pageSize: 20 }),
      getNextPageParam: (lastPage, pages) => 
        lastPage.hasNext ? pages.length + 1 : undefined,
    });
  };
  ```

### Prefetching Data
- Prefetch data before user navigation
- Use React Query's `prefetchQuery` or `prefetchInfiniteQuery`
- Example:
  ```typescript
  // Prefetch goal detail on hover
  const queryClient = useQueryClient();
  
  const handleGoalHover = (goalId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['goal', goalId],
      queryFn: () => goalService.getById(goalId),
      staleTime: 5 * 60 * 1000,
    });
  };
  ```

## React Query Optimization

### Query Configuration
- Set appropriate `staleTime` based on data freshness requirements
- Configure `gcTime` (cacheTime) for memory management
- Use `refetchOnWindowFocus: false` for non-critical data
- Example:
  ```typescript
  // hooks/useGoals.ts
  export const useGoals = (filters?: GoalFilters) => {
    return useQuery({
      queryKey: ['goals', filters],
      queryFn: () => goalService.getAll(filters),
      staleTime: 5 * 60 * 1000, // 5 minutes - data fresh for 5 min
      gcTime: 10 * 60 * 1000, // 10 minutes - cache kept for 10 min
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnMount: true, // Refetch when component mounts
    });
  };
  ```

### Selective Query Invalidation
- Only invalidate queries that actually need refreshing
- Use specific query keys instead of broad invalidation
- Example:
  ```typescript
  // ❌ Bad: Invalidates all queries
  queryClient.invalidateQueries();
  
  // ✅ Good: Only invalidates goal-related queries
  queryClient.invalidateQueries({ queryKey: ['goals'] });
  
  // ✅ Better: Only invalidates specific goal
  queryClient.invalidateQueries({ queryKey: ['goal', goalId] });
  ```

### Parallel Queries
- Fetch independent data in parallel
- Use `useQueries` for dynamic parallel queries
- Example:
  ```typescript
  // hooks/useGoalDashboard.ts
  import { useQueries } from '@tanstack/react-query';
  
  export const useGoalDashboard = (goalIds: string[]) => {
    return useQueries({
      queries: goalIds.map(id => ({
        queryKey: ['goal', id],
        queryFn: () => goalService.getById(id),
        staleTime: 5 * 60 * 1000,
      })),
    });
  };
  ```

### Optimistic Updates
- Update UI immediately before API confirmation
- Rollback on error, confirm on success
- Example:
  ```typescript
  // hooks/useUpdateGoal.ts
  export const useUpdateGoal = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: ({ id, updates }: { id: string; updates: UpdateGoalDto }) =>
        goalService.update(id, updates),
      onMutate: async ({ id, updates }) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({ queryKey: ['goal', id] });
        
        // Snapshot previous value
        const previousGoal = queryClient.getQueryData<Goal>(['goal', id]);
        
        // Optimistically update
        queryClient.setQueryData<Goal>(['goal', id], (old) => ({
          ...old!,
          ...updates,
        }));
        
        return { previousGoal };
      },
      onError: (err, variables, context) => {
        // Rollback on error
        if (context?.previousGoal) {
          queryClient.setQueryData(['goal', variables.id], context.previousGoal);
        }
      },
      onSettled: (data, error, variables) => {
        // Refetch to ensure consistency
        queryClient.invalidateQueries({ queryKey: ['goal', variables.id] });
      },
    });
  };
  ```

## State Management Optimization

### Zustand Optimization
- Use selectors to prevent unnecessary re-renders
- Split stores by domain to reduce re-render scope
- Example:
  ```typescript
  // stores/goalStore.ts
  import { create } from 'zustand';
  import { shallow } from 'zustand/shallow';
  
  interface GoalStore {
    goals: Goal[];
    selectedGoalId: string | null;
    setGoals: (goals: Goal[]) => void;
    setSelectedGoalId: (id: string | null) => void;
  }
  
  export const useGoalStore = create<GoalStore>((set) => ({
    goals: [],
    selectedGoalId: null,
    setGoals: (goals) => set({ goals }),
    setSelectedGoalId: (id) => set({ selectedGoalId: id }),
  }));
  
  // ✅ Good: Use selector to prevent unnecessary re-renders
  const selectedGoalId = useGoalStore((state) => state.selectedGoalId);
  
  // ❌ Bad: Component re-renders on any store change
  const { selectedGoalId } = useGoalStore();
  ```

### Redux Optimization
- Use `useSelector` with equality function
- Memoize selectors with `reselect`
- Normalize state structure
- Example:
  ```typescript
  // selectors/goalSelectors.ts
  import { createSelector } from '@reduxjs/toolkit';
  import type { RootState } from '@/store';
  
  const selectGoals = (state: RootState) => state.goals.items;
  const selectGoalFilters = (state: RootState) => state.goals.filters;
  
  export const selectFilteredGoals = createSelector(
    [selectGoals, selectGoalFilters],
    (goals, filters) => {
      return goals.filter(goal => 
        goal.title.includes(filters.search || '')
      );
    }
  );
  
  // Usage with shallow equality
  const filteredGoals = useSelector(selectFilteredGoals, shallowEqual);
  ```

## Bundle Optimization

### Code Splitting by Route
- Split code at route boundaries
- Use React.lazy with Suspense
- Example:
  ```typescript
  // App.tsx
  import { lazy, Suspense } from 'react';
  
  const GoalsPage = lazy(() => import('./pages/GoalsPage'));
  const SettingsPage = lazy(() => import('./pages/SettingsPage'));
  ```

### Dynamic Imports for Heavy Dependencies
- Lazy load heavy libraries (charts, editors, etc.)
- Use dynamic imports with code splitting
- Example:
  ```typescript
  // components/GoalChart.tsx
  import { lazy, Suspense } from 'react';
  
  const Chart = lazy(() => 
    import('@ant-design/charts').then(mod => ({ default: mod.Column }))
  );
  
  export const GoalChart = ({ data }: { data: ChartData[] }) => (
    <Suspense fallback={<Spin />}>
      <Chart data={data} />
    </Suspense>
  );
  ```

### Tree Shaking
- Use ES modules for better tree shaking
- Avoid default exports from barrel files
- Import only what you need
- Example:
  ```typescript
  // ❌ Bad: Imports entire library
  import * as antd from 'antd';
  
  // ✅ Good: Tree-shakeable imports
  import { Button, Card, Form } from 'antd';
  ```

### Image Optimization
- Use modern image formats (WebP, AVIF)
- Implement responsive images with srcset
- Lazy load images below the fold
- Use image CDN with automatic optimization
- Example:
  ```typescript
  // components/OptimizedImage.tsx
  import { LazyLoadImage } from 'react-lazy-load-image-component';
  
  export const OptimizedImage = ({ src, alt }: { src: string; alt: string }) => {
    return (
      <LazyLoadImage
        src={src}
        alt={alt}
        effect="blur"
        placeholderSrc="/placeholder.jpg"
        width="100%"
        height="auto"
      />
    );
  };
  ```

### Asset Optimization
- Minify CSS and JavaScript
- Compress assets (gzip/brotli)
- Use CDN for static assets
- Implement asset versioning for cache busting

## Network Optimization

### Request Batching
- Batch multiple API calls when possible
- Use GraphQL for complex data fetching
- Combine related requests
- Example:
  ```typescript
  // services/batchService.ts
  export const batchGoalRequests = async (goalIds: string[]) => {
    // Single request instead of multiple
    return apiClient.post('/goals/batch', { ids: goalIds });
  };
  ```

### Request Cancellation
- Cancel requests when component unmounts
- Cancel duplicate requests
- Use AbortController
- Example:
  ```typescript
  // hooks/useGoals.ts
  export const useGoals = (filters?: GoalFilters) => {
    return useQuery({
      queryKey: ['goals', filters],
      queryFn: ({ signal }) => goalService.getAll(filters, { signal }),
    });
  };
  
  // Service implementation
  export const goalService = {
    getAll: async (filters?: GoalFilters, options?: { signal?: AbortSignal }) => {
      return apiClient.get('/goals', {
        params: filters,
        signal: options?.signal,
      });
    },
  };
  ```

### Payload Size Optimization
- Request only needed fields
- Use field selection/field sets
- Compress large payloads
- Paginate large responses
- Example:
  ```typescript
  // Request only needed fields
  const { data } = useQuery({
    queryKey: ['goals', 'summary'],
    queryFn: () => goalService.getSummary({ fields: ['id', 'title', 'progress'] }),
  });
  ```

### HTTP/2 and HTTP/3
- Use HTTP/2 for multiplexing
- Consider HTTP/3 for better performance
- Enable server push for critical resources

## PWA Performance Optimization

### Service Worker Caching
- Cache static assets with Cache-First strategy
- Cache API responses with Network-First or Stale-While-Revalidate
- Implement cache versioning
- Example:
  ```typescript
  // service-worker.ts
  const CACHE_VERSION = 'v1';
  const STATIC_CACHE = `static-${CACHE_VERSION}`;
  const API_CACHE = `api-${CACHE_VERSION}`;
  
  // Cache-First for static assets
  self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('/static/')) {
      event.respondWith(
        caches.match(event.request).then(response => 
          response || fetch(event.request)
        )
      );
    }
    
    // Network-First for API calls
    if (event.request.url.includes('/api/')) {
      event.respondWith(
        fetch(event.request)
          .then(response => {
            const clone = response.clone();
            caches.open(API_CACHE).then(cache => {
              cache.put(event.request, clone);
            });
            return response;
          })
          .catch(() => caches.match(event.request))
      );
    }
  });
  ```

### IndexedDB for Large Data
- Use IndexedDB for offline data storage
- Cache large datasets locally
- Sync when online
- Example:
  ```typescript
  // utils/indexedDB.ts
  import { openDB } from 'idb';
  
  const dbPromise = openDB('goals-db', 1, {
    upgrade(db) {
      db.createObjectStore('goals', { keyPath: 'id' });
    },
  });
  
  export const cacheGoals = async (goals: Goal[]) => {
    const db = await dbPromise;
    const tx = db.transaction('goals', 'readwrite');
    await Promise.all(goals.map(goal => tx.store.put(goal)));
    await tx.done;
  };
  ```

## Memory Optimization

### Cleanup Effects
- Clean up subscriptions, timers, and event listeners
- Cancel in-flight requests on unmount
- Example:
  ```typescript
  useEffect(() => {
    const interval = setInterval(() => {
      // Polling logic
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  ```

### Avoid Memory Leaks
- Remove event listeners on unmount
- Clear timeouts/intervals
- Cancel pending requests
- Avoid closures capturing large objects

### Large List Optimization
- Virtualize long lists
- Implement pagination
- Lazy load off-screen content
- Use `key` prop correctly for efficient reconciliation

## Performance Monitoring

### Component Render Tracking
- Track component render times
- Identify slow renders
- Use React DevTools Profiler
- Example:
  ```typescript
  // hooks/useRenderTracking.ts
  import { useEffect, useRef } from 'react';
  import { logger } from '@/utils/logger';
  
  export const useRenderTracking = (componentName: string) => {
    const renderStart = useRef(performance.now());
    
    useEffect(() => {
      const renderTime = performance.now() - renderStart.current;
      if (renderTime > 16) { // Slower than one frame
        logger.warn('Slow render detected', {
          component: componentName,
          renderTime,
        });
      }
      renderStart.current = performance.now();
    });
  };
  ```

### Bundle Size Monitoring
- Monitor bundle sizes in CI/CD
- Set performance budgets
- Use webpack-bundle-analyzer
- Track bundle size over time

### API Performance Tracking
- Track API response times
- Log slow API calls (>1s)
- Monitor error rates
- Set up alerts for performance degradation

### Performance Budgets
- Set budgets for bundle size, load time, etc.
- Fail builds if budgets exceeded
- Example (webpack.config.js):
  ```javascript
  performance: {
    maxAssetSize: 250000, // 250KB
    maxEntrypointSize: 250000,
    hints: 'error',
  },
  ```

## Common Performance Pitfalls

### Over-Memoization
- Don't memoize everything - only expensive operations
- `useMemo`/`useCallback` have their own overhead
- Profile before optimizing

### Unnecessary Re-renders
- Avoid creating new objects/arrays in render
- Use stable references for context values
- Extract static values outside component

### Large Bundle Sizes
- Avoid importing entire libraries
- Use tree-shakeable imports
- Code split appropriately

### Inefficient Queries
- Don't fetch data you don't need
- Use proper query keys for caching
- Avoid over-fetching or under-fetching

## Performance Testing

### Lighthouse Audits
- Run Lighthouse regularly
- Target scores: Performance > 90, Accessibility > 90
- Monitor Core Web Vitals

### Load Testing
- Test with slow network conditions
- Test with low-end devices
- Use Chrome DevTools throttling

### Performance Regression Testing
- Set up performance budgets
- Monitor metrics in CI/CD
- Alert on performance degradation

## Implementation Checklist

### Initial Setup
- [ ] Set up code splitting by route
- [ ] Configure bundle size budgets
- [ ] Set up performance monitoring
- [ ] Implement React Query with proper caching
- [ ] Configure service worker caching strategy

### Component Optimization
- [ ] Add React.memo to expensive components
- [ ] Implement useMemo for expensive calculations
- [ ] Use useCallback for stable function references
- [ ] Add virtual scrolling for long lists
- [ ] Lazy load heavy components

### Data Loading
- [ ] Implement debouncing for search inputs
- [ ] Add pagination for large datasets
- [ ] Set up infinite scroll where appropriate
- [ ] Configure React Query staleTime and gcTime
- [ ] Implement optimistic updates

### Network Optimization
- [ ] Implement request cancellation
- [ ] Optimize payload sizes
- [ ] Set up request batching where applicable
- [ ] Configure HTTP caching headers

### Monitoring
- [ ] Set up performance tracking
- [ ] Configure bundle size monitoring
- [ ] Set up API performance tracking
- [ ] Implement Core Web Vitals monitoring
- [ ] Create performance dashboards

## Best Practices

- **Measure First**: Profile before optimizing
- **Optimize Incrementally**: Make one change at a time
- **Test Performance**: Verify improvements with metrics
- **Monitor Continuously**: Track performance over time
- **Set Budgets**: Define and enforce performance budgets
- **User Experience**: Prioritize perceived performance
- **Progressive Enhancement**: Optimize for critical path first
- **Cache Strategically**: Cache what makes sense
- **Lazy Load Wisely**: Don't lazy load above-the-fold content
- **Avoid Premature Optimization**: Optimize based on data, not assumptions

