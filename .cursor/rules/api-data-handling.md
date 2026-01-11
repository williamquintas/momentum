# API & Data Handling

## HTTP Client Setup

### Base Configuration

- Use **axios** or **fetch** with a configured instance
- Set base URL from environment variables
- Configure default headers (Content-Type, Accept)
- Set request timeout (recommended: 10-30 seconds)
- Example:

  ```typescript
  // services/apiClient.ts
  import axios from 'axios';

  export const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL || '/api',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });
  ```

### Request Interceptors

- Add authentication tokens to requests
- Add request IDs for tracing
- Log outgoing requests (in development)
- Transform request data if needed
- Example:
  ```typescript
  apiClient.interceptors.request.use(
    (config) => {
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      config.headers['X-Request-ID'] = generateRequestId();
      return config;
    },
    (error) => Promise.reject(error)
  );
  ```

### Response Interceptors

- Handle common response transformations
- Extract data from response wrapper
- Handle authentication errors globally
- Log responses (in development)
- Example:
  ```typescript
  apiClient.interceptors.response.use(
    (response) => {
      // Extract data from response wrapper if API uses one
      return response.data?.data ?? response.data;
    },
    async (error) => {
      if (error.response?.status === 401) {
        // Handle unauthorized - redirect to login
        handleUnauthorized();
      }
      return Promise.reject(error);
    }
  );
  ```

## API Service Pattern

### Service Structure

- Create service files for each resource (goals, milestones, etc.)
- Use consistent naming: `{resource}Service.ts`
- Group related operations together
- Keep services focused on API communication only
- Example:

  ```typescript
  // services/goalService.ts
  import { apiClient } from './apiClient';
  import type { Goal, CreateGoalDto, UpdateGoalDto, GoalFilters } from '@/types';

  export const goalService = {
    getAll: async (filters?: GoalFilters): Promise<Goal[]> => {
      const response = await apiClient.get<Goal[]>('/goals', { params: filters });
      return response.data;
    },

    getById: async (id: string): Promise<Goal> => {
      const response = await apiClient.get<Goal>(`/goals/${id}`);
      return response.data;
    },

    create: async (goal: CreateGoalDto): Promise<Goal> => {
      const response = await apiClient.post<Goal>('/goals', goal);
      return response.data;
    },

    update: async (id: string, updates: UpdateGoalDto): Promise<Goal> => {
      const response = await apiClient.patch<Goal>(`/goals/${id}`, updates);
      return response.data;
    },

    delete: async (id: string): Promise<void> => {
      await apiClient.delete(`/goals/${id}`);
    },

    updateProgress: async (id: string, progress: number): Promise<Goal> => {
      const response = await apiClient.patch<Goal>(`/goals/${id}/progress`, { progress });
      return response.data;
    },
  };
  ```

### Service Organization

- Place services in `src/services/` directory
- One service file per resource
- Export service object with methods
- Keep business logic out of services (use hooks/utils)
- Example structure:
  ```
  services/
    apiClient.ts          # HTTP client configuration
    goalService.ts        # Goal API operations
    milestoneService.ts  # Milestone API operations
    categoryService.ts   # Category API operations
  ```

## React Query Integration

### Query Hooks Pattern

- Create custom hooks that wrap React Query
- Use consistent query key structure
- Handle loading, error, and success states
- Example:

  ```typescript
  // hooks/useGoals.ts
  import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
  import { goalService } from '@/services/goalService';
  import type { GoalFilters } from '@/types';

  export const useGoals = (filters?: GoalFilters) => {
    return useQuery({
      queryKey: ['goals', filters],
      queryFn: () => goalService.getAll(filters),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    });
  };

  export const useGoal = (id: string) => {
    return useQuery({
      queryKey: ['goal', id],
      queryFn: () => goalService.getById(id),
      enabled: !!id, // Only fetch if id exists
      staleTime: 5 * 60 * 1000,
    });
  };
  ```

### Mutation Hooks Pattern

- Use mutations for create, update, delete operations
- Implement optimistic updates for better UX
- Invalidate related queries after mutations
- Example:

  ```typescript
  export const useCreateGoal = () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: goalService.create,
      onMutate: async (newGoal) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({ queryKey: ['goals'] });

        // Snapshot previous value
        const previousGoals = queryClient.getQueryData<Goal[]>(['goals']);

        // Optimistically update
        queryClient.setQueryData<Goal[]>(['goals'], (old = []) => [...old, { ...newGoal, id: 'temp-id' } as Goal]);

        return { previousGoals };
      },
      onError: (err, newGoal, context) => {
        // Rollback on error
        if (context?.previousGoals) {
          queryClient.setQueryData(['goals'], context.previousGoals);
        }
      },
      onSuccess: (data) => {
        // Invalidate and refetch
        queryClient.invalidateQueries({ queryKey: ['goals'] });
        queryClient.setQueryData(['goal', data.id], data);
      },
    });
  };

  export const useUpdateGoal = () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ id, updates }: { id: string; updates: UpdateGoalDto }) => goalService.update(id, updates),
      onSuccess: (data, variables) => {
        // Update cache for both list and detail
        queryClient.setQueryData(['goal', variables.id], data);
        queryClient.invalidateQueries({ queryKey: ['goals'] });
      },
    });
  };

  export const useDeleteGoal = () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: goalService.delete,
      onSuccess: (_, deletedId) => {
        // Remove from cache
        queryClient.removeQueries({ queryKey: ['goal', deletedId] });
        queryClient.invalidateQueries({ queryKey: ['goals'] });
      },
    });
  };
  ```

### Query Key Structure

- Use consistent, hierarchical query keys
- Include all parameters that affect the query
- Use arrays for query keys
- Example:

  ```typescript
  // Good: Hierarchical and descriptive
  ['goals', { type: 'quantitative', status: 'active' }][('goal', id)][('goals', 'search', searchTerm)][
    ('goals', 'category', categoryId)
  ][
    // Avoid: Flat or unclear keys
    'goals-list'
  ]['goal-detail'];
  ```

### Cache Configuration

- Set appropriate `staleTime` based on data volatility
- Use `gcTime` (formerly `cacheTime`) to control cache retention
- Configure global defaults in QueryClient
- Example:
  ```typescript
  // QueryClient setup
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: 1,
      },
    },
  });
  ```

## Data Transformation

### Request Transformation

- Transform frontend types to API DTOs before sending
- Handle date serialization (ISO strings)
- Remove undefined/null values if API doesn't accept them
- Example:
  ```typescript
  // utils/transformGoal.ts
  export const transformGoalForAPI = (goal: CreateGoalDto): CreateGoalDto => {
    return {
      ...goal,
      deadline: goal.deadline?.toISOString(),
      startDate: goal.startDate?.toISOString(),
      // Remove undefined values
      ...Object.fromEntries(Object.entries(goal).filter(([_, value]) => value !== undefined)),
    };
  };
  ```

### Response Transformation

- Transform API responses to frontend types
- Parse dates from strings
- Add computed fields
- Normalize data structures
- Example:
  ```typescript
  // utils/transformGoal.ts
  export const transformGoalFromAPI = (apiGoal: ApiGoal): Goal => {
    return {
      ...apiGoal,
      deadline: apiGoal.deadline ? new Date(apiGoal.deadline) : undefined,
      startDate: apiGoal.startDate ? new Date(apiGoal.startDate) : undefined,
      createdAt: new Date(apiGoal.createdAt),
      updatedAt: new Date(apiGoal.updatedAt),
      // Add computed fields
      progress: calculateProgress(apiGoal),
      isOverdue: isGoalOverdue(apiGoal),
    };
  };
  ```

### Date Handling

- Always parse API date strings to Date objects
- Use ISO 8601 format for API communication
- Handle timezone considerations
- Use a date library (date-fns, dayjs) for consistency
- Example:

  ```typescript
  import { parseISO, formatISO } from 'date-fns';

  export const parseApiDate = (dateString: string | null): Date | null => {
    return dateString ? parseISO(dateString) : null;
  };

  export const formatDateForAPI = (date: Date | null): string | null => {
    return date ? formatISO(date) : null;
  };
  ```

### Data Validation

- Validate API responses match expected types
- Use runtime validation (Zod, Yup) for API responses
- Handle malformed data gracefully
- Example:

  ```typescript
  import { z } from 'zod';

  const GoalSchema = z.object({
    id: z.string(),
    title: z.string(),
    type: z.enum(['quantitative', 'qualitative', 'binary']),
    // ... other fields
  });

  export const validateGoal = (data: unknown): Goal => {
    return GoalSchema.parse(data);
  };
  ```

## Request/Response Types

### DTOs (Data Transfer Objects)

- Define separate types for API requests and responses
- Use clear naming: `CreateGoalDto`, `UpdateGoalDto`, `GoalResponse`
- Keep DTOs separate from domain types
- Example:

  ```typescript
  // types/goal.dto.ts
  export interface CreateGoalDto {
    title: string;
    description?: string;
    type: GoalType;
    target?: number;
    deadline?: string; // ISO date string
    categoryId?: string;
    tags?: string[];
  }

  export interface UpdateGoalDto {
    title?: string;
    description?: string;
    target?: number;
    deadline?: string;
    status?: GoalStatus;
    // Only include updatable fields
  }

  export interface GoalResponse {
    id: string;
    title: string;
    description: string | null;
    type: GoalType;
    status: GoalStatus;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
    // ... other fields
  }
  ```

### Pagination Types

- Use consistent pagination response structure
- Include metadata (total, page, limit, hasMore)
- Example:

  ```typescript
  export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasMore: boolean;
    };
  }

  export interface PaginationParams {
    page?: number;
    limit?: number;
  }

  // Usage
  export const usePaginatedGoals = (params: PaginationParams & GoalFilters) => {
    return useQuery({
      queryKey: ['goals', 'paginated', params],
      queryFn: () => goalService.getPaginated(params),
    });
  };
  ```

### Generic Types

- Use generic types for reusable patterns
- Create utility types for common operations
- Example:

  ```typescript
  export type ApiResponse<T> = {
    data: T;
    message?: string;
    meta?: Record<string, unknown>;
  };

  export type ApiError = {
    message: string;
    code?: string;
    errors?: Record<string, string[]>;
  };

  export type QueryResult<T> = {
    data: T | undefined;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
  };
  ```

## Error Handling

### Error Transformation

- Transform API errors to user-friendly messages
- Extract field-specific validation errors
- Handle different error types consistently
- Example:

  ```typescript
  // utils/errorHandler.ts
  export const transformApiError = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error
        const apiError = error.response.data as ApiError;
        return apiError.message || 'An error occurred';
      } else if (error.request) {
        // Request made but no response
        return 'Unable to connect to server. Please check your internet connection.';
      }
    }
    return 'An unexpected error occurred';
  };

  export const extractFieldErrors = (error: unknown): Record<string, string> => {
    if (axios.isAxiosError(error) && error.response?.data?.errors) {
      return error.response.data.errors;
    }
    return {};
  };
  ```

### Error Handling in Hooks

- Use React Query's error handling
- Provide error recovery options
- Log errors for debugging
- Example:

  ```typescript
  export const useGoals = (filters?: GoalFilters) => {
    const query = useQuery({
      queryKey: ['goals', filters],
      queryFn: () => goalService.getAll(filters),
      onError: (error) => {
        // Log error
        console.error('Failed to fetch goals:', error);
        // Could also send to error tracking service
      },
    });

    return {
      ...query,
      error: query.error ? transformApiError(query.error) : null,
    };
  };
  ```

For comprehensive error handling guidelines, see [Error Handling](./error-handling.md).

## Retry Logic

### Retry Configuration

- Configure retries at QueryClient level
- Use exponential backoff
- Don't retry on 4xx errors (client errors)
- Retry on 5xx errors and network failures
- Example:
  ```typescript
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors
          if (axios.isAxiosError(error) && error.response?.status) {
            const status = error.response.status;
            if (status >= 400 && status < 500) {
              return false;
            }
          }
          // Retry up to 3 times for other errors
          return failureCount < 3;
        },
        retryDelay: (attemptIndex) => {
          // Exponential backoff: 1s, 2s, 4s
          return Math.min(1000 * 2 ** attemptIndex, 30000);
        },
      },
    },
  });
  ```

### Request Cancellation

- Cancel requests when component unmounts
- Cancel duplicate requests
- Use AbortController for manual cancellation
- Example:

  ```typescript
  export const useGoals = (filters?: GoalFilters) => {
    return useQuery({
      queryKey: ['goals', filters],
      queryFn: ({ signal }) => goalService.getAll(filters, { signal }), // Pass AbortSignal
    });
  };

  // In service
  export const goalService = {
    getAll: async (filters?: GoalFilters, options?: { signal?: AbortSignal }) => {
      return apiClient.get('/goals', {
        params: filters,
        signal: options?.signal,
      });
    },
  };
  ```

## Optimistic Updates

### Implementation Pattern

- Update UI immediately before API confirmation
- Rollback on error
- Confirm update on success
- Example (see Mutation Hooks Pattern section above for full example):

  ```typescript
  onMutate: async (newGoal) => {
    // Cancel outgoing queries
    await queryClient.cancelQueries({ queryKey: ['goals'] });

    // Snapshot previous value
    const previousGoals = queryClient.getQueryData<Goal[]>(['goals']);

    // Optimistically update
    queryClient.setQueryData<Goal[]>(['goals'], (old = []) => [
      ...old,
      { ...newGoal, id: 'temp-id' } as Goal,
    ]);

    return { previousGoals };
  },
  onError: (err, newGoal, context) => {
    // Rollback
    if (context?.previousGoals) {
      queryClient.setQueryData(['goals'], context.previousGoals);
    }
  },
  ```

## API Versioning

### Version Strategy

- Include API version in base URL or headers
- Use environment variable for API version
- Handle version changes gracefully
- Example:
  ```typescript
  const apiClient = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}/v${process.env.REACT_APP_API_VERSION || '1'}`,
  });
  ```

## Request/Response Logging

### Development Logging

- Log requests and responses in development only
- Sanitize sensitive data (tokens, passwords)
- Use structured logging
- Example:

  ```typescript
  if (process.env.NODE_ENV === 'development') {
    apiClient.interceptors.request.use((config) => {
      console.log('[API Request]', {
        method: config.method?.toUpperCase(),
        url: config.url,
        params: config.params,
        data: sanitizeData(config.data),
      });
      return config;
    });

    apiClient.interceptors.response.use(
      (response) => {
        console.log('[API Response]', {
          status: response.status,
          url: response.config.url,
          data: sanitizeData(response.data),
        });
        return response;
      },
      (error) => {
        console.error('[API Error]', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message,
        });
        return Promise.reject(error);
      }
    );
  }
  ```

## Testing API Services

### Mocking Strategies

- Mock API client in tests
- Use MSW (Mock Service Worker) for integration tests
- Test error scenarios
- Example:

  ```typescript
  // __mocks__/apiClient.ts
  export const apiClient = {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };

  // Test example
  describe('goalService', () => {
    it('should fetch goals', async () => {
      const mockGoals: Goal[] = [
        /* ... */
      ];
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockGoals });

      const result = await goalService.getAll();

      expect(result).toEqual(mockGoals);
      expect(apiClient.get).toHaveBeenCalledWith('/goals', { params: undefined });
    });
  });
  ```

## Best Practices

### General Guidelines

- **Type safety**: Always type API requests and responses
- **Error handling**: Transform errors to user-friendly messages
- **Caching**: Use React Query's caching effectively
- **Optimistic updates**: Improve UX with optimistic updates
- **Request cancellation**: Cancel requests when appropriate
- **Data transformation**: Keep transformation logic in utilities
- **Separation of concerns**: Keep API logic separate from UI logic
- **Consistency**: Use consistent patterns across all services
- **Documentation**: Document API contracts and transformations

### Performance

- Use pagination for large datasets
- Implement request debouncing for search
- Cache frequently accessed data
- Use query invalidation strategically
- Avoid unnecessary refetches

### Security

- Never expose API keys in client code
- Use environment variables for API URLs
- Sanitize user inputs before sending
- Validate API responses
- Handle authentication errors gracefully
