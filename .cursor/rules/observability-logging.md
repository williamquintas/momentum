# Observability & Logging

## Monitoring
- Track application performance metrics
- Monitor API response times
- Track error rates and types
- Monitor user interactions and feature usage
- Set up performance budgets

## Metrics to Track
- **Performance Metrics**:
  - Page load times
  - Component render times
  - API response times
  - Bundle sizes
- **Business Metrics**:
  - Goals created per user
  - Progress update frequency
  - Goal completion rates
  - Feature adoption rates
  - Goal type distribution (quantitative, qualitative, binary, etc.)
  - Average goals per user
  - Goals with milestones completion rate
  - Recurring goals adherence rate
  - Habit goals streak lengths
  - Goals abandoned vs completed
  - Time to goal completion
  - Progress update patterns (daily, weekly, etc.)
  - Goal modification frequency
  - Goal sharing/visibility usage
  - Daily/Weekly/Monthly active users
  - Session duration
  - Pages per session
  - User retention rates
  - Onboarding completion rates
  - Feature discovery rates
- **Error Metrics**:
  - Error frequency by type
  - Error rate by feature
  - Failed API calls
  - User-reported issues

## Error Tracking

### Error Tracking Service Integration
- Use error tracking service (e.g., Sentry, LogRocket, Rollbar)
- Capture unhandled errors globally
- Track React error boundaries
- Monitor API errors
- Include user context in error reports
- Track error trends over time
- Log errors with full context
- Include stack traces
- Add user context (if available)
- Include request/response data (sanitized)
- Log to error tracking service

### React Error Boundary Implementation
- Create error boundary component with logging
- Capture component errors and log with context
- Provide user-friendly fallback UI
- Example:
  ```typescript
  // components/ErrorBoundary.tsx
  import React, { Component, ErrorInfo, ReactNode } from 'react';
  import { Alert } from 'antd';
  import { logger } from '../utils/logger';
  
  interface Props {
    children: ReactNode;
    fallback?: ReactNode;
  }
  
  interface State {
    hasError: boolean;
    error: Error | null;
  }
  
  export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
      super(props);
      this.state = { hasError: false, error: null };
    }
    
    static getDerivedStateFromError(error: Error): State {
      return { hasError: true, error };
    }
    
    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
      logger.error('React Error Boundary caught error', error, {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
      });
    }
    
    render() {
      if (this.state.hasError) {
        return this.props.fallback || (
          <Alert
            message="Something went wrong"
            description="An unexpected error occurred. Please refresh the page."
            type="error"
            showIcon
          />
        );
      }
      
      return this.props.children;
    }
  }
  ```

### Global Error Handlers
- Set up global error handlers for unhandled errors
- Capture unhandled promise rejections
- Log window errors
- Example:
  ```typescript
  // utils/errorHandlers.ts
  import { logger } from './logger';
  
  export const setupGlobalErrorHandlers = () => {
    // Unhandled errors
    window.addEventListener('error', (event) => {
      logger.error('Unhandled error', event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });
    
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      logger.error('Unhandled promise rejection', event.reason, {
        promise: event.promise,
      });
    });
  };
  ```

## Performance Monitoring

### Core Web Vitals
- Monitor Core Web Vitals (LCP, FID, CLS)
- Track and report Web Vitals to analytics
- Set performance budgets
- Example:
  ```typescript
  // utils/webVitals.ts
  import { onCLS, onFID, onLCP } from 'web-vitals';
  import { logger } from './logger';
  
  export const reportWebVitals = () => {
    onCLS((metric) => {
      logger.info('Web Vital: CLS', {
        value: metric.value,
        rating: metric.rating,
        id: metric.id,
        name: metric.name,
      });
    });
    
    onFID((metric) => {
      logger.info('Web Vital: FID', {
        value: metric.value,
        rating: metric.rating,
        id: metric.id,
        name: metric.name,
      });
    });
    
    onLCP((metric) => {
      logger.info('Web Vital: LCP', {
        value: metric.value,
        rating: metric.rating,
        id: metric.id,
        name: metric.name,
      });
    });
  };
  ```

### React Performance Monitoring
- Use React DevTools Profiler
- Track component re-renders with useWhyDidYouRender or custom hooks
- Monitor memory usage
- Track network requests
- Identify performance bottlenecks
- Log slow API calls (>1s)
- Log slow component renders
- Track operation durations
- Log bundle load times
- Example performance hook:
  ```typescript
  // hooks/usePerformanceMonitor.ts
  import { useEffect, useRef } from 'react';
  import { logger } from '../utils/logger';
  
  export const usePerformanceMonitor = (componentName: string) => {
    const renderStart = useRef<number>(0);
    
    useEffect(() => {
      renderStart.current = performance.now();
      
      return () => {
        const renderTime = performance.now() - renderStart.current;
        if (renderTime > 16) { // Slower than one frame
          logger.warn('Slow component render', {
            component: componentName,
            renderTime,
          });
        }
      };
    });
  };
  ```

### API Performance Monitoring
- Track API response times
- Log slow API calls with thresholds
- Monitor API error rates
- Track retry attempts
- Example:
  ```typescript
  // utils/apiInterceptor.ts
  import { logger } from './logger';
  
  export const setupApiInterceptors = (apiClient: AxiosInstance) => {
    // Request interceptor
    apiClient.interceptors.request.use((config) => {
      config.metadata = { startTime: performance.now() };
      logger.debug('API Request', {
        method: config.method,
        url: config.url,
        correlationId: config.headers['X-Correlation-ID'],
      });
      return config;
    });
    
    // Response interceptor
    apiClient.interceptors.response.use(
      (response) => {
        const duration = performance.now() - response.config.metadata.startTime;
        if (duration > 1000) {
          logger.warn('Slow API call', {
            url: response.config.url,
            method: response.config.method,
            duration,
          });
        }
        logger.debug('API Response', {
          url: response.config.url,
          status: response.status,
          duration,
        });
        return response;
      },
      (error) => {
        const duration = error.config?.metadata?.startTime
          ? performance.now() - error.config.metadata.startTime
          : 0;
        logger.error('API Error', error, {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          duration,
        });
        return Promise.reject(error);
      }
    );
  };
  ```

## User Analytics
- Track user flows
- Monitor feature usage
- Track conversion funnels
- Analyze user behavior patterns
- A/B testing support (if applicable)

## Real User Monitoring (RUM)
- Track real user performance
- Monitor different devices/browsers
- Track geographic performance
- Monitor network conditions
- Identify slow user experiences

## Synthetic Monitoring
- Automated tests for critical paths
- Scheduled health checks
- Performance regression detection
- Uptime monitoring

## Logging Strategy
- Use structured logging
- Include contextual information
- Log at appropriate levels
- Avoid logging sensitive data
- Use consistent log format

## Log Levels
- **ERROR**: Errors that need immediate attention
- **WARN**: Warnings about potential issues
- **INFO**: General informational messages
- **DEBUG**: Detailed debugging information (development only)
- **TRACE**: Very detailed tracing (development only)

## What to Log
- **API Requests/Responses**: Log request details and responses (sanitize sensitive data)
- **User Actions**: Important user interactions (goal creation, progress updates)
- **Errors**: All errors with stack traces and context
- **Performance**: Slow operations, render times
- **State Changes**: Critical state transitions
- **Authentication**: Login/logout events

## What NOT to Log
- Passwords or authentication tokens
- Credit card numbers or financial data
- Personal identifiable information (PII) unless necessary
- Full request/response bodies with sensitive data
- Excessive debug information in production

## Structured Logging
- Use consistent log format
- Include timestamp, level, message
- Add contextual fields (userId, goalId, etc.)
- Use JSON format for easy parsing
- Example:
  ```typescript
  logger.info('Goal progress updated', {
    userId: '123',
    goalId: '456',
    oldProgress: 50,
    newProgress: 75,
    timestamp: new Date().toISOString()
  });
  ```

## Logging in Different Environments
- **Development**: Verbose logging, console output
- **Staging**: Info level and above, structured format
- **Production**: Error and Warn only, send to logging service

## Logging Utilities

### Logger Implementation
- Create centralized logging utility with TypeScript types
- Support different log levels with type safety
- Format logs consistently across environments
- Send to logging service in production
- Support local console logging in development
- Include correlation IDs for request tracing
- Support log sampling for high-volume events
- Example implementation:
  ```typescript
  // utils/logger.ts
  type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace';
  
  interface LogContext {
    userId?: string;
    goalId?: string;
    correlationId?: string;
    [key: string]: unknown;
  }
  
  class Logger {
    private correlationId: string | null = null;
    
    setCorrelationId(id: string) {
      this.correlationId = id;
    }
    
    private log(level: LogLevel, message: string, context?: LogContext) {
      const logEntry = {
        level,
        message,
        timestamp: new Date().toISOString(),
        correlationId: this.correlationId,
        ...context,
      };
      
      // Development: console output
      if (process.env.NODE_ENV === 'development') {
        const consoleMethod = level === 'error' ? 'error' : 
                            level === 'warn' ? 'warn' : 'log';
        console[consoleMethod](`[${level.toUpperCase()}]`, message, context);
      }
      
      // Production: send to logging service
      if (process.env.NODE_ENV === 'production' && level !== 'debug' && level !== 'trace') {
        this.sendToLoggingService(logEntry);
      }
    }
    
    error(message: string, error?: Error, context?: LogContext) {
      this.log('error', message, {
        ...context,
        error: error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : undefined,
      });
    }
    
    warn(message: string, context?: LogContext) {
      this.log('warn', message, context);
    }
    
    info(message: string, context?: LogContext) {
      this.log('info', message, context);
    }
    
    debug(message: string, context?: LogContext) {
      if (process.env.NODE_ENV === 'development') {
        this.log('debug', message, context);
      }
    }
    
    private sendToLoggingService(logEntry: unknown) {
      // Send to your logging service (e.g., Datadog, LogRocket)
      // Use fetch or service-specific SDK
    }
  }
  
  export const logger = new Logger();
  ```

### Correlation IDs
- Generate unique correlation IDs for request tracing
- Include correlation ID in all logs for a request/operation
- Pass correlation ID through API calls
- Use correlation IDs to trace user journeys
- Example:
  ```typescript
  // utils/correlation.ts
  export const generateCorrelationId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };
  
  // Set correlation ID at request start
  const correlationId = generateCorrelationId();
  logger.setCorrelationId(correlationId);
  ```

## Log Aggregation
- Use logging service (e.g., LogRocket, Datadog, CloudWatch)
- Aggregate logs from all environments
- Enable log search and filtering
- Set up log retention policies
- Create log-based alerts

## Alerting
- Set up alerts for critical errors
- Monitor performance degradation
- Alert on high error rates
- Track system health metrics

## Tools & Integration
- Choose appropriate monitoring tools
- Integrate with CI/CD pipeline
- Set up dashboards
- Configure alerting rules
- Regular review of metrics

## React Query Observability

### React Query Error Logging
- Log React Query errors with query context
- Track query failures and retries
- Monitor cache hit rates
- Log slow queries
- Example:
  ```typescript
  // hooks/useQueryWithLogging.ts
  import { useQuery, UseQueryOptions } from '@tanstack/react-query';
  import { logger } from '../utils/logger';
  
  export const useQueryWithLogging = <TData, TError>(
    options: UseQueryOptions<TData, TError>
  ) => {
    return useQuery({
      ...options,
      onError: (error) => {
        logger.error('React Query error', error as Error, {
          queryKey: options.queryKey,
        });
        options.onError?.(error);
      },
      onSuccess: (data) => {
        logger.debug('React Query success', {
          queryKey: options.queryKey,
        });
        options.onSuccess?.(data);
      },
    });
  };
  ```

## State Management Observability

### Zustand Middleware
- Add logging middleware to Zustand stores
- Track state changes for debugging
- Log state mutations with context
- Example:
  ```typescript
  // utils/zustandLogger.ts
  import { StateCreator } from 'zustand';
  import { logger } from './logger';
  
  export const loggerMiddleware = <T>(
    config: StateCreator<T>
  ): StateCreator<T> => {
    return (set, get, api) => {
      return config(
        (...args) => {
          const result = set(...args);
          logger.debug('Zustand state changed', {
            state: get(),
          });
          return result;
        },
        get,
        api
      );
    };
  };
  ```

### Redux Middleware
- Use Redux middleware for action logging
- Track action dispatch and state changes
- Log slow actions
- Example:
  ```typescript
  // utils/reduxLogger.ts
  import { Middleware } from '@reduxjs/toolkit';
  import { logger } from './logger';
  
  export const reduxLogger: Middleware = (store) => (next) => (action) => {
    const startTime = performance.now();
    const result = next(action);
    const duration = performance.now() - startTime;
    
    if (duration > 10) {
      logger.warn('Slow Redux action', {
        action: action.type,
        duration,
      });
    }
    
    logger.debug('Redux action dispatched', {
      action: action.type,
      payload: action.payload,
    });
    
    return result;
  };
  ```

## Session Replay
- Use session replay tools for debugging user issues
- Record user interactions (with privacy considerations)
- Replay user sessions for error investigation
- Mask sensitive data in recordings
- Only enable for error scenarios or with user consent

## Log Sampling
- Implement sampling for high-volume events
- Sample debug/trace logs in production
- Always log errors (no sampling)
- Use consistent sampling strategy
- Example:
  ```typescript
  // utils/sampling.ts
  export const shouldSample = (level: LogLevel, sampleRate: number = 0.1): boolean => {
    if (level === 'error' || level === 'warn') {
      return true; // Always log errors and warnings
    }
    return Math.random() < sampleRate;
  };
  ```

## Privacy & Compliance
- Comply with GDPR, CCPA, and other privacy regulations
- Obtain user consent for analytics where required
- Anonymize or pseudonymize user data
- Provide opt-out mechanisms
- Document data retention policies
- Implement data deletion requests
- Mask PII in logs automatically
- Example:
  ```typescript
  // utils/privacy.ts
  export const sanitizeLogData = (data: Record<string, unknown>): Record<string, unknown> => {
    const sensitiveFields = ['email', 'phone', 'ssn', 'creditCard'];
    const sanitized = { ...data };
    
    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });
    
    return sanitized;
  };
  ```

## PWA Observability
- Monitor service worker registration and updates
- Track offline/online state changes
- Monitor cache hit rates
- Track background sync events
- Log push notification delivery
- Monitor install prompts and installations
- Example:
  ```typescript
  // utils/pwaObservability.ts
  import { logger } from './logger';
  
  export const monitorServiceWorker = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        logger.info('Service Worker message', {
          data: event.data,
        });
      });
      
      navigator.serviceWorker.ready.then((registration) => {
        logger.info('Service Worker ready', {
          scope: registration.scope,
        });
      });
    }
  };
  ```

## Implementation Checklist

### Initial Setup
- [ ] Set up centralized logger utility
- [ ] Configure error tracking service (Sentry, LogRocket, etc.)
- [ ] Implement React Error Boundary
- [ ] Set up global error handlers
- [ ] Configure API interceptors for logging
- [ ] Set up Web Vitals monitoring
- [ ] Implement correlation ID generation
- [ ] Configure log sampling strategy
- [ ] Set up data sanitization utilities

### React Integration
- [ ] Wrap app with Error Boundary
- [ ] Add React Query error logging
- [ ] Implement performance monitoring hooks
- [ ] Add Zustand/Redux logging middleware
- [ ] Set up component render monitoring

### Production Setup
- [ ] Configure production log levels
- [ ] Set up log aggregation service
- [ ] Configure alerting rules
- [ ] Set up dashboards
- [ ] Configure log retention policies
- [ ] Test error reporting in staging
- [ ] Document logging standards

## Common Tool Integrations

### Sentry Integration
```typescript
// utils/sentry.ts
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% of transactions
  beforeSend(event) {
    // Sanitize sensitive data
    if (event.request?.cookies) {
      delete event.request.cookies;
    }
    return event;
  },
});
```

### LogRocket Integration
```typescript
// utils/logRocket.ts
import LogRocket from 'logrocket';

if (process.env.NODE_ENV === 'production') {
  LogRocket.init(process.env.REACT_APP_LOGROCKET_APP_ID);
  
  // Identify user (when authenticated)
  LogRocket.identify(userId, {
    name: userName,
    email: userEmail,
  });
}
```

### Datadog RUM Integration
```typescript
// utils/datadog.ts
import { datadogRum } from '@datadog/browser-rum';

datadogRum.init({
  applicationId: process.env.REACT_APP_DATADOG_APP_ID,
  clientToken: process.env.REACT_APP_DATADOG_CLIENT_TOKEN,
  site: 'datadoghq.com',
  service: 'goals-tracking-app',
  env: process.env.NODE_ENV,
  version: process.env.REACT_APP_VERSION,
  sampleRate: 100,
  trackInteractions: true,
});
```

## Testing Observability

### Testing Error Logging
- Test error boundary catches and logs errors
- Verify error context is captured correctly
- Test error sanitization
- Verify errors are sent to tracking service
- Test correlation ID propagation

### Testing Performance Monitoring
- Test Web Vitals reporting
- Verify slow API call detection
- Test component render monitoring
- Verify performance metrics are collected

### Testing in Different Environments
- Verify development logging (verbose)
- Test staging logging (info level)
- Verify production logging (error/warn only)
- Test log sampling behavior
- Verify sensitive data masking

## Best Practices
- Use appropriate log levels
- Include relevant context
- Keep log messages concise but informative
- Use consistent naming conventions
- Review and clean up logs regularly
- Don't log in tight loops
- Use conditional logging for expensive operations
- Generate correlation IDs for request tracing
- Implement log sampling for high-volume events
- Sanitize sensitive data before logging
- Use structured logging format (JSON)
- Include timestamps in all logs
- Set up log retention policies
- Monitor log volume and costs
- Use feature flags to control logging verbosity
- Test error logging in staging environment
- Document logging standards for the team
- Regularly review and optimize log levels

