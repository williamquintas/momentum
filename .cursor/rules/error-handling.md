# Error Handling

## Error Types

- **Network Errors**: API failures, timeouts, connection issues
- **Validation Errors**: Form validation, input validation
- **Business Logic Errors**: Invalid operations, business rule violations
- **System Errors**: Unexpected errors, bugs
- **User Errors**: Invalid user actions

## Error Handling Strategy

- Handle errors at appropriate levels
- Provide user-friendly error messages
- Log errors with context
- Recover gracefully when possible
- Guide users to resolution

## Custom Error Classes

### Base Error Class

- Create a base `AppError` class that all custom errors extend
- Include error codes for categorization
- Support context/metadata for debugging
- Example:

  ```typescript
  // utils/errors/AppError.ts
  export class AppError extends Error {
    public readonly code: string;
    public readonly statusCode?: number;
    public readonly context?: Record<string, unknown>;
    public readonly isOperational: boolean;

    constructor(
      message: string,
      code: string,
      statusCode?: number,
      context?: Record<string, unknown>,
      isOperational = true
    ) {
      super(message);
      this.name = this.constructor.name;
      this.code = code;
      this.statusCode = statusCode;
      this.context = context;
      this.isOperational = isOperational;

      Error.captureStackTrace(this, this.constructor);
    }
  }
  ```

### Specific Error Classes

- Create specific error classes for different error types
- Example:

  ```typescript
  // utils/errors/NotFoundError.ts
  export class NotFoundError extends AppError {
    constructor(resource: string, id?: string) {
      super(`${resource}${id ? ` with id ${id}` : ''} was not found`, 'NOT_FOUND', 404, { resource, id });
    }
  }

  // utils/errors/ValidationError.ts
  export class ValidationError extends AppError {
    public readonly fieldErrors: Record<string, string[]>;

    constructor(message: string, fieldErrors: Record<string, string[]> = {}) {
      super(message, 'VALIDATION_ERROR', 400, { fieldErrors });
      this.fieldErrors = fieldErrors;
    }
  }

  // utils/errors/BusinessRuleError.ts
  export class BusinessRuleError extends AppError {
    constructor(message: string, ruleCode: string, context?: Record<string, unknown>) {
      super(message, 'BUSINESS_RULE_VIOLATION', 400, { ruleCode, ...context });
    }
  }

  // utils/errors/NetworkError.ts
  export class NetworkError extends AppError {
    constructor(message: string = 'Network request failed', context?: Record<string, unknown>) {
      super(message, 'NETWORK_ERROR', undefined, context, false);
    }
  }

  // utils/errors/ServerError.ts
  export class ServerError extends AppError {
    constructor(message: string = 'Server error occurred', context?: Record<string, unknown>) {
      super(message, 'SERVER_ERROR', 500, context, false);
    }
  }

  // utils/errors/UnauthorizedError.ts
  export class UnauthorizedError extends AppError {
    constructor(message: string = 'Authentication required') {
      super(message, 'UNAUTHORIZED', 401);
    }
  }

  // utils/errors/ForbiddenError.ts
  export class ForbiddenError extends AppError {
    constructor(message: string = 'You do not have permission to perform this action') {
      super(message, 'FORBIDDEN', 403);
    }
  }
  ```

### Error Code System

- Use consistent error codes for categorization
- Map error codes to user-friendly messages
- Example:

  ```typescript
  // utils/errors/errorCodes.ts
  export const ERROR_CODES = {
    // Network errors
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT: 'TIMEOUT',
    CONNECTION_LOST: 'CONNECTION_LOST',

    // API errors
    NOT_FOUND: 'NOT_FOUND',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    SERVER_ERROR: 'SERVER_ERROR',
    BAD_REQUEST: 'BAD_REQUEST',

    // Validation errors
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INVALID_INPUT: 'INVALID_INPUT',

    // Business logic errors
    BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
    INVALID_STATE: 'INVALID_STATE',
    INVALID_OPERATION: 'INVALID_OPERATION',

    // System errors
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
  } as const;

  export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
  ```

## Error Classification & Severity

### Error Severity Levels

- **Critical**: System failures, data loss risks
- **High**: Business logic violations, authentication failures
- **Medium**: Validation errors, user input issues
- **Low**: Warnings, non-blocking issues

### Error Categorization Matrix

- Classify errors by type and severity
- Determine appropriate handling strategy based on category
- Example:
  ```typescript
  // utils/errors/errorClassification.ts
  export const getErrorSeverity = (error: AppError): 'critical' | 'high' | 'medium' | 'low' => {
    if (error instanceof ServerError || error instanceof NetworkError) {
      return 'critical';
    }
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      return 'high';
    }
    if (error instanceof ValidationError || error instanceof BusinessRuleError) {
      return 'medium';
    }
    return 'low';
  };
  ```

## React Error Boundaries

### Modern Error Boundary (Hooks-based)

- Use `react-error-boundary` library for better error boundary support
- Implement error boundaries at appropriate component tree levels
- Example:

  ```typescript
  // components/ErrorBoundary.tsx
  import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
  import { Result, Button } from 'antd';
  import { logger } from '@/utils/logger';

  interface ErrorFallbackProps {
    error: Error;
    resetErrorBoundary: () => void;
  }

  function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
    return (
      <Result
        status="error"
        title="Something went wrong"
        subTitle={process.env.NODE_ENV === 'development' ? error.message : undefined}
        extra={[
          <Button type="primary" key="retry" onClick={resetErrorBoundary}>
            Try Again
          </Button>,
          <Button key="home" onClick={() => window.location.href = '/'}>
            Go Home
          </Button>,
        ]}
      />
    );
  }

  interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ComponentType<ErrorFallbackProps>;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  }

  export function ErrorBoundary({
    children,
    fallback = ErrorFallback,
    onError
  }: ErrorBoundaryProps) {
    const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
      // Log error
      logger.error('Error boundary caught error', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });

      // Send to error tracking service
      if (window.Sentry) {
        window.Sentry.captureException(error, {
          contexts: { react: { componentStack: errorInfo.componentStack } },
        });
      }

      // Call custom error handler
      onError?.(error, errorInfo);
    };

    return (
      <ReactErrorBoundary
        FallbackComponent={fallback}
        onError={handleError}
        onReset={() => {
          // Reset app state if needed
        }}
      >
        {children}
      </ReactErrorBoundary>
    );
  }
  ```

### Error Boundary Placement Strategy

- **App-level**: Wrap entire app to catch critical errors
- **Route-level**: Wrap route components to handle route-specific errors
- **Feature-level**: Wrap feature components to isolate errors
- **Component-level**: Wrap risky components (third-party, complex logic)
- Example:
  ```typescript
  // App.tsx
  <ErrorBoundary>
    <Router>
      <Routes>
        <Route path="/goals" element={
          <ErrorBoundary fallback={GoalErrorFallback}>
            <GoalsPage />
          </ErrorBoundary>
        } />
      </Routes>
    </Router>
  </ErrorBoundary>
  ```

### Route-Level Error Handling

- Create route-specific error boundaries
- Handle 404 errors with dedicated components
- Example:

  ```typescript
  // components/RouteErrorBoundary.tsx
  import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
  import { Result, Button } from 'antd';
  import { useNavigate } from 'react-router-dom';

  export function RouteErrorBoundary() {
    const error = useRouteError();
    const navigate = useNavigate();

    if (isRouteErrorResponse(error)) {
      if (error.status === 404) {
        return (
          <Result
            status="404"
            title="404"
            subTitle="The page you're looking for doesn't exist"
            extra={
              <Button type="primary" onClick={() => navigate('/')}>
                Go Home
              </Button>
            }
          />
        );
      }
    }

    return (
      <Result
        status="500"
        title="500"
        subTitle="Something went wrong"
        extra={
          <Button type="primary" onClick={() => navigate('/')}>
            Go Home
          </Button>
        }
      />
    );
  }
  ```

## API Error Handling

### Error Transformation

- Transform API errors to custom error classes
- Extract field-specific validation errors
- Handle different HTTP status codes consistently
- Example:

  ```typescript
  // utils/errorHandler.ts
  import axios from 'axios';
  import {
    AppError,
    NotFoundError,
    ValidationError,
    UnauthorizedError,
    ForbiddenError,
    ServerError,
    NetworkError,
  } from './errors';

  export const transformApiError = (error: unknown): AppError => {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error
        const status = error.response.status;
        const data = error.response.data as { message?: string; errors?: Record<string, string[]> };

        switch (status) {
          case 400:
            if (data.errors) {
              return new ValidationError(data.message || 'Validation failed', data.errors);
            }
            return new AppError(data.message || 'Bad request', 'BAD_REQUEST', 400);
          case 401:
            return new UnauthorizedError(data.message);
          case 403:
            return new ForbiddenError(data.message);
          case 404:
            return new NotFoundError('Resource', error.config?.url);
          case 500:
          case 502:
          case 503:
            return new ServerError(data.message);
          default:
            return new AppError(data.message || 'An error occurred', 'API_ERROR', status);
        }
      } else if (error.request) {
        // Request made but no response
        if (error.code === 'ECONNABORTED') {
          return new NetworkError('Request timed out', { code: 'TIMEOUT' });
        }
        return new NetworkError('Unable to connect to server');
      }
    }

    // Unknown error
    if (error instanceof AppError) {
      return error;
    }

    return new AppError(error instanceof Error ? error.message : 'An unexpected error occurred', 'UNKNOWN_ERROR');
  };

  export const extractFieldErrors = (error: unknown): Record<string, string[]> => {
    if (error instanceof ValidationError) {
      return error.fieldErrors;
    }
    if (axios.isAxiosError(error) && error.response?.data?.errors) {
      return error.response.data.errors;
    }
    return {};
  };
  ```

### API Service Error Handling

- Handle errors in API service methods
- Transform errors before throwing
- Example:

  ```typescript
  // services/goalService.ts
  import { apiClient } from './apiClient';
  import { transformApiError } from '@/utils/errorHandler';
  import type { Goal } from '@/types';

  export const goalService = {
    getById: async (id: string): Promise<Goal> => {
      try {
        const response = await apiClient.get<Goal>(`/goals/${id}`);
        return response.data;
      } catch (error) {
        throw transformApiError(error);
      }
    },
  };
  ```

## React Query Error Handling

### Query Error Handling

- Handle errors in `useQuery` hooks
- Transform errors to user-friendly messages
- Provide error recovery options
- Example:

  ```typescript
  // hooks/useGoals.ts
  import { useQuery } from '@tanstack/react-query';
  import { goalService } from '@/services/goalService';
  import { transformApiError } from '@/utils/errorHandler';
  import { logger } from '@/utils/logger';

  export const useGoals = (filters?: GoalFilters) => {
    const query = useQuery({
      queryKey: ['goals', filters],
      queryFn: async () => {
        try {
          return await goalService.getAll(filters);
        } catch (error) {
          const appError = transformApiError(error);
          logger.error('Failed to fetch goals', { error: appError, filters });
          throw appError;
        }
      },
      onError: (error) => {
        // Additional error handling if needed
        logger.error('Query error in useGoals', { error });
      },
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof AppError && error.statusCode && error.statusCode < 500) {
          return false;
        }
        return failureCount < 3;
      },
    });

    return {
      ...query,
      error: query.error ? transformApiError(query.error) : null,
      errorMessage: query.error instanceof AppError ? query.error.message : 'Failed to load goals',
    };
  };
  ```

### Mutation Error Handling

- Handle errors in `useMutation` hooks
- Rollback optimistic updates on error
- Show appropriate error messages
- Example:

  ```typescript
  // hooks/useCreateGoal.ts
  import { useMutation, useQueryClient } from '@tanstack/react-query';
  import { goalService } from '@/services/goalService';
  import { transformApiError } from '@/utils/errorHandler';
  import { message } from 'antd';
  import type { Goal, CreateGoalDto } from '@/types';

  export const useCreateGoal = () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: goalService.create,
      onMutate: async (newGoal) => {
        // Cancel outgoing queries
        await queryClient.cancelQueries({ queryKey: ['goals'] });

        // Snapshot previous value
        const previousGoals = queryClient.getQueryData<Goal[]>(['goals']);

        // Optimistically update
        queryClient.setQueryData<Goal[]>(['goals'], (old = []) => [...old, { ...newGoal, id: 'temp-id' } as Goal]);

        return { previousGoals };
      },
      onError: (error, newGoal, context) => {
        // Rollback on error
        if (context?.previousGoals) {
          queryClient.setQueryData(['goals'], context.previousGoals);
        }

        // Transform and display error
        const appError = transformApiError(error);

        if (appError instanceof ValidationError) {
          // Show field-specific errors
          Object.entries(appError.fieldErrors).forEach(([field, errors]) => {
            message.error(`${field}: ${errors.join(', ')}`);
          });
        } else {
          message.error(appError.message);
        }
      },
      onSuccess: (data) => {
        message.success('Goal created successfully');
        queryClient.invalidateQueries({ queryKey: ['goals'] });
        queryClient.setQueryData(['goal', data.id], data);
      },
    });
  };
  ```

### Global Query Error Handling

- Configure global error handling in QueryClient
- Handle errors consistently across all queries
- Example:

  ```typescript
  // lib/queryClient.ts
  import { QueryClient } from '@tanstack/react-query';
  import { message } from 'antd';
  import { transformApiError } from '@/utils/errorHandler';
  import { AppError, UnauthorizedError } from '@/utils/errors';

  export const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          const appError = transformApiError(error);

          // Don't retry on 4xx errors
          if (appError.statusCode && appError.statusCode < 500) {
            return false;
          }

          // Retry up to 3 times for server errors
          return failureCount < 3;
        },
        retryDelay: (attemptIndex) => {
          // Exponential backoff: 1s, 2s, 4s
          return Math.min(1000 * 2 ** attemptIndex, 30000);
        },
        onError: (error) => {
          const appError = transformApiError(error);

          // Handle authentication errors globally
          if (appError instanceof UnauthorizedError) {
            // Redirect to login
            window.location.href = '/login';
            return;
          }

          // Log error for debugging
          console.error('Query error:', appError);
        },
      },
      mutations: {
        retry: 1,
        onError: (error) => {
          const appError = transformApiError(error);

          // Don't show error message here - let individual mutations handle it
          // This is just for logging
          console.error('Mutation error:', appError);
        },
      },
    },
  });
  ```

## Error Notification Systems

### Ant Design Message (Inline Errors)

- Use `message` for non-blocking, transient errors
- Show inline feedback for form submissions
- Auto-dismiss after 3-5 seconds
- Example:

  ```typescript
  import { message } from 'antd';

  // Success message
  message.success('Goal created successfully', 3);

  // Error message
  message.error('Failed to create goal', 3);

  // Warning message
  message.warning('Goal deadline is approaching', 3);

  // Info message
  message.info('Goal saved as draft', 3);
  ```

### Ant Design Notification (Persistent Errors)

- Use `notification` for important, persistent errors
- Show detailed error information
- Require user action to dismiss
- Example:

  ```typescript
  import { notification } from 'antd';

  notification.error({
    message: 'Failed to Save Goal',
    description: 'There was an error saving your goal. Please try again.',
    duration: 0, // Don't auto-dismiss
    placement: 'topRight',
    btn: (
      <Button type="primary" onClick={() => handleRetry()}>
        Retry
      </Button>
    ),
  });
  ```

### Error Notification Utility

- Create centralized error notification utility
- Standardize error message display
- Example:

  ```typescript
  // utils/errorNotifications.ts
  import { message, notification } from 'antd';
  import { AppError, ValidationError, NetworkError } from './errors';

  export const showError = (
    error: unknown,
    options?: {
      useNotification?: boolean;
      duration?: number;
    }
  ) => {
    const appError = error instanceof AppError ? error : new AppError('An unexpected error occurred', 'UNKNOWN_ERROR');

    const errorMessage = appError.message;

    if (appError instanceof ValidationError) {
      // Show field-specific errors
      Object.entries(appError.fieldErrors).forEach(([field, errors]) => {
        message.error(`${field}: ${errors.join(', ')}`, options?.duration);
      });
      return;
    }

    if (options?.useNotification) {
      notification.error({
        message: 'Error',
        description: errorMessage,
        duration: options.duration ?? 0,
      });
    } else {
      message.error(errorMessage, options?.duration ?? 3);
    }
  };
  ```

## Form Error Handling (Ant Design Specific)

### Field-Level Validation Errors

- Show validation errors inline using `Form.Item`
- Use `validateStatus` and `help` props
- Example:

  ```typescript
  // components/GoalForm.tsx
  import { Form, Input } from 'antd';
  import { ValidationError } from '@/utils/errors';

  export function GoalForm() {
    const [form] = Form.useForm();
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    const handleSubmit = async (values: CreateGoalDto) => {
      try {
        await goalService.create(values);
      } catch (error) {
        if (error instanceof ValidationError) {
          setFieldErrors(error.fieldErrors);

          // Set field errors in form
          Object.entries(error.fieldErrors).forEach(([field, errors]) => {
            form.setFields([
              {
                name: field.split('.'),
                errors: errors,
              },
            ]);
          });
        }
      }
    };

    return (
      <Form form={form} onFinish={handleSubmit}>
        <Form.Item
          name="title"
          label="Title"
          validateStatus={fieldErrors.title ? 'error' : ''}
          help={fieldErrors.title?.[0]}
        >
          <Input />
        </Form.Item>
      </Form>
    );
  }
  ```

### Server-Side Validation Error Mapping

- Map server validation errors to form fields
- Handle nested field errors
- Example:

  ```typescript
  // utils/formErrorMapper.ts
  import { FormInstance } from 'antd';
  import { ValidationError } from './errors';

  export const mapValidationErrorsToForm = (form: FormInstance, error: ValidationError) => {
    Object.entries(error.fieldErrors).forEach(([fieldPath, errors]) => {
      const fieldName = fieldPath.split('.');
      form.setFields([
        {
          name: fieldName,
          errors: errors,
        },
      ]);
    });
  };
  ```

### Form Error Summary

- Show summary of all form errors
- Display at top of form
- Example:

  ```typescript
  // components/FormErrorSummary.tsx
  import { Alert } from 'antd';
  import { ValidationError } from '@/utils/errors';

  interface FormErrorSummaryProps {
    error: ValidationError | null;
  }

  export function FormErrorSummary({ error }: FormErrorSummaryProps) {
    if (!error) return null;

    const errorCount = Object.values(error.fieldErrors).reduce(
      (sum, errors) => sum + errors.length,
      0
    );

    return (
      <Alert
        message={`Please fix ${errorCount} error${errorCount > 1 ? 's' : ''} below`}
        type="error"
        showIcon
        style={{ marginBottom: 16 }}
      />
    );
  }
  ```

## Error State Management

### Zustand Error State

- Store error state in Zustand stores when needed
- Clear errors on actions
- Example:

  ```typescript
  // stores/goalStore.ts
  import { create } from 'zustand';
  import { AppError } from '@/utils/errors';

  interface GoalStore {
    error: AppError | null;
    setError: (error: AppError | null) => void;
    clearError: () => void;
  }

  export const useGoalStore = create<GoalStore>((set) => ({
    error: null,
    setError: (error) => set({ error }),
    clearError: () => set({ error: null }),
  }));
  ```

### React Query Error State

- Use React Query's built-in error state
- Access errors via query/mutation hooks
- Example:

  ```typescript
  const { data, error, isError } = useGoals();

  if (isError) {
    // Handle error
    showError(error);
  }
  ```

## Retry Strategies

### Automatic Retry Configuration

- Configure retries at QueryClient level
- Use exponential backoff
- Don't retry on 4xx errors
- Example (see Global Query Error Handling section above)

### Manual Retry Pattern

- Provide retry buttons in error UI
- Allow users to manually retry failed operations
- Example:

  ```typescript
  // components/ErrorRetry.tsx
  import { Button, Space } from 'antd';
  import { ReloadOutlined } from '@ant-design/icons';

  interface ErrorRetryProps {
    onRetry: () => void;
    isLoading?: boolean;
  }

  export function ErrorRetry({ onRetry, isLoading }: ErrorRetryProps) {
    return (
      <Space>
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={onRetry}
          loading={isLoading}
        >
          Retry
        </Button>
      </Space>
    );
  }
  ```

### Retry with Exponential Backoff

- Implement exponential backoff for retries
- Limit maximum retry attempts
- Example:

  ```typescript
  // utils/retry.ts
  export const retryWithBackoff = async <T>(fn: () => Promise<T>, maxRetries = 3, baseDelay = 1000): Promise<T> => {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  };
  ```

## Error Propagation Strategy

### When to Catch vs Propagate

- **Catch**: When you can handle the error meaningfully
- **Propagate**: When error should be handled at a higher level
- Transform errors at service layer, handle at UI layer
- Example:

  ```typescript
  // Service layer - transform and propagate
  export const goalService = {
    getById: async (id: string): Promise<Goal> => {
      try {
        const response = await apiClient.get(`/goals/${id}`);
        return response.data;
      } catch (error) {
        // Transform and propagate
        throw transformApiError(error);
      }
    },
  };

  // UI layer - catch and display
  const handleLoadGoal = async () => {
    try {
      const goal = await goalService.getById(id);
      setGoal(goal);
    } catch (error) {
      // Handle at UI level
      showError(error);
    }
  };
  ```

### Error Handling Hierarchy

1. **Service Layer**: Transform API errors to AppError
2. **Hook Layer**: Handle React Query errors, provide recovery
3. **Component Layer**: Display errors, provide user actions
4. **Error Boundary**: Catch unhandled errors

## Error Recovery

### Retry Failed Operations

- Provide retry buttons for failed operations
- Implement automatic retry for transient failures
- Show retry status to users
- Example (see Manual Retry Pattern section above)

### Save User Input Before Errors

- Persist form state to localStorage
- Restore form state after errors
- Example:

  ```typescript
  // utils/formPersistence.ts
  const FORM_STORAGE_KEY = 'goal-form-draft';

  export const saveFormDraft = (formData: CreateGoalDto) => {
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
  };

  export const loadFormDraft = (): CreateGoalDto | null => {
    const draft = localStorage.getItem(FORM_STORAGE_KEY);
    return draft ? JSON.parse(draft) : null;
  };

  export const clearFormDraft = () => {
    localStorage.removeItem(FORM_STORAGE_KEY);
  };
  ```

### Offline Error Handling

- Queue operations when offline
- Show offline indicator
- Sync when connection restored
- Example:

  ```typescript
  // utils/offlineQueue.ts
  interface QueuedOperation {
    id: string;
    operation: () => Promise<void>;
    timestamp: number;
  }

  class OfflineQueue {
    private queue: QueuedOperation[] = [];

    add(operation: QueuedOperation['operation']) {
      this.queue.push({
        id: crypto.randomUUID(),
        operation,
        timestamp: Date.now(),
      });
    }

    async process() {
      if (!navigator.onLine) return;

      while (this.queue.length > 0) {
        const item = this.queue.shift()!;
        try {
          await item.operation();
        } catch (error) {
          // Re-queue on failure
          this.queue.unshift(item);
          throw error;
        }
      }
    }
  }

  export const offlineQueue = new OfflineQueue();

  // Listen for online event
  window.addEventListener('online', () => {
    offlineQueue.process();
  });
  ```

## Error States in UI

### Error Display Components

- Use Ant Design `Result` for error states
- Show appropriate error messages
- Provide recovery actions
- Example:

  ```typescript
  // components/ErrorState.tsx
  import { Result, Button } from 'antd';
  import { AppError } from '@/utils/errors';

  interface ErrorStateProps {
    error: AppError;
    onRetry?: () => void;
  }

  export function ErrorState({ error, onRetry }: ErrorStateProps) {
    return (
      <Result
        status="error"
        title="Error"
        subTitle={error.message}
        extra={
          onRetry && (
            <Button type="primary" onClick={onRetry}>
              Retry
            </Button>
          )
        }
      />
    );
  }
  ```

### Inline Error Display

- Show errors inline without breaking UI
- Use Ant Design `Alert` for inline errors
- Maintain navigation and functionality
- Example:

  ```typescript
  import { Alert } from 'antd';

  {error && (
    <Alert
      message="Error"
      description={error.message}
      type="error"
      showIcon
      closable
      onClose={() => clearError()}
      style={{ marginBottom: 16 }}
    />
  )}
  ```

## Error Logging

### Structured Error Logging

- Log all errors with context
- Include stack traces
- Add user context
- Include request/response data (sanitized)
- Send to error tracking service
- Example:

  ```typescript
  // utils/logger.ts
  import { AppError } from './errors';

  export const logger = {
    error: (message: string, context?: Record<string, unknown>) => {
      const logEntry = {
        level: 'error',
        message,
        timestamp: new Date().toISOString(),
        ...context,
      };

      // Console in development
      if (process.env.NODE_ENV === 'development') {
        console.error(logEntry);
      }

      // Send to error tracking service
      if (window.Sentry) {
        window.Sentry.captureException(new Error(message), {
          extra: context,
        });
      }
    },
  };
  ```

### Error Context Collection

- Collect relevant context for errors
- Include user information, route, component stack
- Sanitize sensitive data
- Example:
  ```typescript
  // utils/errorContext.ts
  export const collectErrorContext = (error: AppError): Record<string, unknown> => {
    return {
      errorCode: error.code,
      errorMessage: error.message,
      statusCode: error.statusCode,
      context: error.context,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      // Add user context if available
      // userId: getCurrentUserId(),
    };
  };
  ```

## Error Testing

### Testing Error Boundaries

- Test error boundary fallback rendering
- Test error logging
- Test error recovery
- Example:

  ```typescript
  // __tests__/ErrorBoundary.test.tsx
  import { render, screen } from '@testing-library/react';
  import { ErrorBoundary } from '@/components/ErrorBoundary';

  const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) throw new Error('Test error');
    return <div>No error</div>;
  };

  test('renders fallback on error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });
  ```

### Testing Error States

- Test error display in components
- Test error recovery flows
- Test error message display
- Example:

  ```typescript
  // __tests__/GoalForm.test.tsx
  import { render, screen, waitFor } from '@testing-library/react';
  import { GoalForm } from '@/components/GoalForm';
  import { ValidationError } from '@/utils/errors';

  test('displays validation errors', async () => {
    const mockCreate = jest.fn().mockRejectedValue(
      new ValidationError('Validation failed', {
        title: ['Title is required'],
      })
    );

    render(<GoalForm onSubmit={mockCreate} />);

    // Submit form
    // ...

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });
  });
  ```

### Mocking Errors in Tests

- Mock API errors in tests
- Test error handling paths
- Example:

  ```typescript
  // __tests__/useGoals.test.ts
  import { renderHook, waitFor } from '@testing-library/react';
  import { useGoals } from '@/hooks/useGoals';
  import { NotFoundError } from '@/utils/errors';

  test('handles not found error', async () => {
    jest.spyOn(goalService, 'getAll').mockRejectedValue(new NotFoundError('Goal', '123'));

    const { result } = renderHook(() => useGoals());

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBeInstanceOf(NotFoundError);
    });
  });
  ```

## Error Analytics & Monitoring

### Error Metrics to Track

- Error frequency by type
- Error rate by feature
- Failed API calls
- User-reported issues
- Error trends over time
- See [Observability & Logging](./observability-logging.md) for details

### Error Grouping

- Group similar errors together
- Identify error patterns
- Prioritize fixes based on impact

### Error Alerting

- Set up alerts for critical errors
- Monitor error rates
- Alert on error spikes
- See [Observability & Logging](./observability-logging.md) for details

## Error Message Localization

### i18n Error Messages

- Use i18n keys for error messages
- Support multiple languages
- Provide context-aware messages
- Example:

  ```typescript
  // utils/errorMessages.ts
  import { useTranslation } from 'react-i18next';
  import { AppError } from './errors';

  export const getLocalizedErrorMessage = (error: AppError, t: (key: string) => string): string => {
    const key = `errors.${error.code}`;
    const defaultMessage = error.message;

    return t(key, { defaultMessage, ...error.context });
  };
  ```

## Error Types & Messages

### Standard Error Messages

- **404 Not Found**: "The requested resource was not found"
- **403 Forbidden**: "You don't have permission to access this"
- **500 Server Error**: "Something went wrong. Please try again"
- **Network Error**: "Unable to connect. Please check your internet"
- **Validation Error**: Show specific field errors
- **Timeout**: "Request timed out. Please try again"
- **401 Unauthorized**: "Please sign in to continue"
- **429 Too Many Requests**: "Too many requests. Please try again later"

## Async Error Handling

### Promise Error Handling

- Use try-catch for async/await
- Handle promise rejections
- Use error callbacks
- Example:

  ```typescript
  // Async/await
  try {
    const result = await asyncOperation();
  } catch (error) {
    handleError(error);
  }

  // Promise chains
  asyncOperation()
    .then((result) => handleSuccess(result))
    .catch((error) => handleError(error));

  // Promise.all error handling
  Promise.all([promise1, promise2])
    .then((results) => handleSuccess(results))
    .catch((error) => handleError(error));
  ```

### Unhandled Promise Rejections

- Catch unhandled promise rejections globally
- Log and report unhandled errors
- Example:

  ```typescript
  // App.tsx
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection', {
      reason: event.reason,
      promise: event.promise,
    });

    // Prevent default browser error handling
    event.preventDefault();
  });
  ```

## Error Prevention

### Input Validation

- Validate inputs before submission
- Use Zod schemas for validation
- Show validation errors early
- See [Validation Schemas](../specs/validation/goal.schemas.ts)

### Type Safety

- Use TypeScript for type safety
- Catch type errors at compile time
- Use strict TypeScript settings

### Edge Case Handling

- Handle edge cases explicitly
- Test edge case scenarios
- Provide fallbacks for edge cases

### User Guidance

- Provide clear user guidance
- Show helpful error messages
- Guide users to resolution

## Best Practices

### Error Handling Principles

- Handle errors at the right level
- Don't swallow errors silently
- Provide actionable error messages
- Log errors for debugging
- Test error scenarios
- Monitor error rates
- Transform errors at service layer
- Handle errors at UI layer
- Use error boundaries for unhandled errors
- Provide error recovery options

### Error Message Guidelines

- Avoid technical jargon
- Explain what went wrong
- Suggest how to fix the issue
- Provide actionable guidance
- Use appropriate tone
- Be specific about the error
- Include relevant context

### Error Logging Guidelines

- Log all errors with context
- Include stack traces
- Add user context (when available)
- Include request/response data (sanitized)
- Send to error tracking service
- Don't log sensitive information
- Use structured logging

### Error Recovery Guidelines

- Retry failed operations when appropriate
- Provide retry buttons
- Save user input before errors
- Allow users to continue after errors
- Implement offline error handling
- Queue operations when offline
- Sync when connection restored
