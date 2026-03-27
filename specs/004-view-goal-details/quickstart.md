# Quickstart Guide: View Goal Details

## Overview

This guide provides developers with everything needed to implement and test the View Goal Details feature. It includes code examples, testing strategies, and common implementation patterns.

## Getting Started

### Prerequisites

- React 18+ with TypeScript
- Ant Design 5.x components
- Zustand for state management
- React Query for data fetching
- React Router for navigation

### Installation

```bash
npm install @ant-design/icons recharts date-fns
# or
yarn add @ant-design/icons recharts date-fns
```

## Basic Implementation

### 1. Goal Detail Page Setup

```typescript
// src/pages/GoalDetailPage.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { GoalDetailContainer } from '../features/goals/components/GoalDetailContainer';

export const GoalDetailPage: React.FC = () => {
  const { goalId } = useParams<{ goalId: string }>();

  if (!goalId) {
    return <div>Goal ID is required</div>;
  }

  return <GoalDetailContainer goalId={goalId} />;
};
```

### 2. Core Data Fetching Hook

```typescript
// src/features/goals/hooks/useGoalDetail.ts
import { useQuery } from '@tanstack/react-query';
import { goalService } from '../services/goalService';
import { useGoalDetailCache } from '../stores/goalDetailCache';

export function useGoalDetail(goalId: string) {
  const cache = useGoalDetailCache();

  return useQuery({
    queryKey: ['goal-detail', goalId],
    queryFn: async () => {
      // Check cache first
      const cached = cache.get(goalId);
      if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
        return cached.data;
      }

      // Fetch from API
      const goal = await goalService.getGoal(goalId);
      const progress = await goalService.getGoalProgress(goalId);
      const history = await goalService.getProgressHistory(goalId, { limit: 20 });

      const data = {
        goal,
        progress,
        history,
        // ... other data
      };

      // Cache the result
      cache.set(goalId, data, 5 * 60 * 1000); // 5 minutes

      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
```

### 3. Main Container Component

```typescript
// src/features/goals/components/GoalDetailContainer.tsx
import React, { useState } from 'react';
import { Tabs, Spin, Alert } from 'antd';
import { useGoalDetail } from '../hooks/useGoalDetail';
import { GoalDetailHeader } from './GoalDetailHeader';
import { GoalOverviewTab } from './tabs/GoalOverviewTab';
import { GoalProgressTab } from './tabs/GoalProgressTab';
import { GoalHistoryTab } from './tabs/GoalHistoryTab';

const { TabPane } = Tabs;

interface GoalDetailContainerProps {
  goalId: string;
}

export const GoalDetailContainer: React.FC<GoalDetailContainerProps> = ({
  goalId
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { data, isLoading, error } = useGoalDetail(goalId);

  if (isLoading) {
    return (
      <div className="goal-detail-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error loading goal"
        description={error.message}
        type="error"
        showIcon
      />
    );
  }

  if (!data) {
    return (
      <Alert
        message="Goal not found"
        description="The requested goal could not be found."
        type="warning"
        showIcon
      />
    );
  }

  return (
    <div className="goal-detail-container">
      <GoalDetailHeader goal={data.goal} />

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        className="goal-detail-tabs"
      >
        <TabPane tab="Overview" key="overview">
          <GoalOverviewTab goal={data.goal} />
        </TabPane>

        <TabPane tab="Progress" key="progress">
          <GoalProgressTab
            goal={data.goal}
            progress={data.progress}
          />
        </TabPane>

        <TabPane tab="History" key="history">
          <GoalHistoryTab
            goalId={goalId}
            initialHistory={data.history}
          />
        </TabPane>
      </Tabs>
    </div>
  );
};
```

## Component Examples

### Goal Header Component

```typescript
// src/features/goals/components/GoalDetailHeader.tsx
import React from 'react';
import { Row, Col, Button, Tag, Space } from 'antd';
import {
  EditOutlined,
  CheckCircleOutlined,
  PauseCircleOutlined
} from '@ant-design/icons';
import { Goal } from '../types/goal';
import { getGoalStatusColor, getGoalTypeIcon } from '../utils/goalDisplayUtils';

interface GoalDetailHeaderProps {
  goal: Goal;
  onEdit?: () => void;
  onComplete?: () => void;
  onPause?: () => void;
}

export const GoalDetailHeader: React.FC<GoalDetailHeaderProps> = ({
  goal,
  onEdit,
  onComplete,
  onPause
}) => {
  const statusColor = getGoalStatusColor(goal.status);
  const typeIcon = getGoalTypeIcon(goal.type);

  return (
    <div className="goal-detail-header">
      <Row gutter={[16, 16]} align="middle">
        <Col flex="auto">
          <Space direction="vertical" size="small">
            <Space>
              {typeIcon}
              <h1 className="goal-title">{goal.title}</h1>
              <Tag color={statusColor}>{goal.status}</Tag>
            </Space>

            {goal.description && (
              <p className="goal-description">{goal.description}</p>
            )}

            <Space>
              <span>Created: {new Date(goal.createdAt).toLocaleDateString()}</span>
              {goal.tags.map(tag => (
                <Tag key={tag.id} color="blue">{tag.name}</Tag>
              ))}
            </Space>
          </Space>
        </Col>

        <Col flex="none">
          <Space>
            {onEdit && (
              <Button icon={<EditOutlined />} onClick={onEdit}>
                Edit
              </Button>
            )}
            {goal.status === 'active' && onComplete && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={onComplete}
              >
                Complete
              </Button>
            )}
            {goal.status === 'active' && onPause && (
              <Button
                icon={<PauseCircleOutlined />}
                onClick={onPause}
              >
                Pause
              </Button>
            )}
          </Space>
        </Col>
      </Row>
    </div>
  );
};
```

### Progress Visualization Component

```typescript
// src/features/goals/components/ProgressVisualization.tsx
import React from 'react';
import { Progress, Card, Statistic, Row, Col } from 'antd';
import { TrendingUpOutlined, TrendingDownOutlined } from '@ant-design/icons';
import { Goal, GoalProgress } from '../types/goal';

interface ProgressVisualizationProps {
  goal: Goal;
  progress: GoalProgress;
}

export const ProgressVisualization: React.FC<ProgressVisualizationProps> = ({
  goal,
  progress
}) => {
  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return '#52c41a';
    if (percentage >= 50) return '#1890ff';
    return '#faad14';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUpOutlined style={{ color: '#52c41a' }} />;
      case 'decreasing': return <TrendingDownOutlined style={{ color: '#ff4d4f' }} />;
      default: return null;
    }
  };

  return (
    <Card title="Progress Overview" className="progress-visualization">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Progress
            percent={progress.percentage}
            strokeColor={getProgressColor(progress.percentage)}
            status={progress.isComplete ? 'success' : 'active'}
            format={(percent) => `${percent}% Complete`}
          />
        </Col>

        <Col span={8}>
          <Statistic
            title="Current Progress"
            value={progress.current}
            suffix={goal.type === 'quantitative' ? goal.target.unit : ''}
          />
        </Col>

        <Col span={8}>
          <Statistic
            title="Target"
            value={goal.target}
            suffix={goal.type === 'quantitative' ? goal.target.unit : ''}
          />
        </Col>

        <Col span={8}>
          <Statistic
            title="Trend"
            value={progress.velocity}
            prefix={getTrendIcon(progress.trend)}
            suffix="per day"
            precision={2}
          />
        </Col>
      </Row>

      {progress.estimatedCompletionDate && (
        <div className="estimated-completion">
          <span>Estimated completion: </span>
          <strong>{progress.estimatedCompletionDate.toLocaleDateString()}</strong>
        </div>
      )}
    </Card>
  );
};
```

### History Tab Component

```typescript
// src/features/goals/components/tabs/GoalHistoryTab.tsx
import React, { useState, useMemo } from 'react';
import { List, Card, Tag, Space, DatePicker, Select, Empty } from 'antd';
import { useProgressHistory } from '../../hooks/useProgressHistory';
import { ProgressUpdate } from '../../types/goal';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface GoalHistoryTabProps {
  goalId: string;
  initialHistory: ProgressUpdate[];
}

export const GoalHistoryTab: React.FC<GoalHistoryTabProps> = ({
  goalId,
  initialHistory
}) => {
  const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);
  const [sortBy, setSortBy] = useState<'timestamp' | 'change'>('timestamp');

  const { data: historyData, isLoading } = useProgressHistory(goalId, {
    dateRange: dateRange ? {
      start: dateRange[0].getTime(),
      end: dateRange[1].getTime()
    } : undefined,
    sortBy,
    initialData: initialHistory
  });

  const filteredHistory = useMemo(() => {
    if (!historyData?.updates) return [];
    return historyData.updates;
  }, [historyData]);

  const renderHistoryItem = (update: ProgressUpdate) => {
    const changeColor = update.change > 0 ? 'green' : update.change < 0 ? 'red' : 'default';
    const changeText = update.change > 0 ? `+${update.change}` :
                      update.change < 0 ? update.change.toString() : 'No change';

    return (
      <List.Item>
        <Card size="small" className="history-item">
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Space justify="space-between" style={{ width: '100%' }}>
              <span className="history-date">
                {new Date(update.timestamp).toLocaleString()}
              </span>
              <Tag color={changeColor}>{changeText}</Tag>
            </Space>

            <div>
              <strong>{update.previousValue || 0}</strong> → <strong>{update.newValue}</strong>
            </div>

            {update.notes && (
              <div className="history-notes">{update.notes}</div>
            )}
          </Space>
        </Card>
      </List.Item>
    );
  };

  if (!filteredHistory.length && !isLoading) {
    return (
      <Empty
        description="No progress history found"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <div className="goal-history-tab">
      <Card className="history-filters">
        <Space>
          <RangePicker
            onChange={(dates) => setDateRange(dates as [Date, Date] | null)}
            placeholder={['Start date', 'End date']}
          />
          <Select value={sortBy} onChange={setSortBy}>
            <Option value="timestamp">Sort by Date</Option>
            <Option value="change">Sort by Change</Option>
          </Select>
        </Space>
      </Card>

      <List
        dataSource={filteredHistory}
        renderItem={renderHistoryItem}
        loading={isLoading}
        pagination={{
          pageSize: 20,
          showSizeChanger: false,
          showQuickJumper: true,
        }}
      />
    </div>
  );
};
```

## Testing Strategies

### Unit Tests

```typescript
// src/features/goals/components/__tests__/GoalDetailHeader.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { GoalDetailHeader } from '../GoalDetailHeader';
import { createMockGoal } from '../../test-utils';

describe('GoalDetailHeader', () => {
  const mockGoal = createMockGoal({
    title: 'Test Goal',
    status: 'active',
    type: 'quantitative'
  });

  it('displays goal title and status', () => {
    render(<GoalDetailHeader goal={mockGoal} />);

    expect(screen.getByText('Test Goal')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const mockOnEdit = jest.fn();
    render(<GoalDetailHeader goal={mockGoal} onEdit={mockOnEdit} />);

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(mockOnEdit).toHaveBeenCalled();
  });

  it('shows complete button for active goals', () => {
    render(<GoalDetailHeader goal={mockGoal} onComplete={jest.fn()} />);

    expect(screen.getByRole('button', { name: /complete/i })).toBeInTheDocument();
  });
});
```

### Integration Tests

```typescript
// src/features/goals/components/__tests__/GoalDetailContainer.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoalDetailContainer } from '../GoalDetailContainer';
import { goalService } from '../../services/goalService';

// Mock the service
jest.mock('../../services/goalService');

const mockGoalService = goalService as jest.Mocked<typeof goalService>;

describe('GoalDetailContainer Integration', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  beforeEach(() => {
    mockGoalService.getGoal.mockResolvedValue({
      id: 'goal-1',
      title: 'Test Goal',
      status: 'active',
      type: 'quantitative',
      // ... other goal properties
    });
  });

  it('loads and displays goal data', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <GoalDetailContainer goalId="goal-1" />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Goal')).toBeInTheDocument();
    });

    expect(mockGoalService.getGoal).toHaveBeenCalledWith('goal-1');
  });

  it('handles loading state', () => {
    mockGoalService.getGoal.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(
      <QueryClientProvider client={queryClient}>
        <GoalDetailContainer goalId="goal-1" />
      </QueryClientProvider>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
```

### E2E Tests

```typescript
// e2e/goal-detail.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Goal Detail Page', () => {
  test('displays goal information correctly', async ({ page }) => {
    await page.goto('/goals/goal-1');

    // Check header information
    await expect(page.locator('h1')).toContainText('Test Goal');
    await expect(page.locator('.ant-tag')).toContainText('active');

    // Check tab navigation
    await expect(page.locator('.ant-tabs-tab').first()).toContainText('Overview');

    // Check progress display
    await expect(page.locator('.ant-progress')).toBeVisible();
  });

  test('navigates between tabs', async ({ page }) => {
    await page.goto('/goals/goal-1');

    // Click on Progress tab
    await page.click('text=Progress');
    await expect(page.locator('.progress-visualization')).toBeVisible();

    // Click on History tab
    await page.click('text=History');
    await expect(page.locator('.goal-history-tab')).toBeVisible();
  });

  test('handles mobile layout', async ({ page, isMobile }) => {
    if (!isMobile) test.skip();

    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/goals/goal-1');

    // Check responsive layout
    await expect(page.locator('.goal-detail-header')).toBeVisible();
    await expect(page.locator('.ant-tabs')).toBeVisible();
  });
});
```

## Performance Optimization

### Memoization Example

```typescript
// src/features/goals/components/ProgressVisualization.tsx
import React, { memo, useMemo } from 'react';

interface ProgressVisualizationProps {
  goal: Goal;
  progress: GoalProgress;
}

export const ProgressVisualization: React.FC<ProgressVisualizationProps> = memo(({ goal, progress }) => {
  const progressColor = useMemo(() => {
    if (progress.percentage >= 80) return '#52c41a';
    if (progress.percentage >= 50) return '#1890ff';
    return '#faad14';
  }, [progress.percentage]);

  const formattedStats = useMemo(
    () => ({
      current: formatValue(progress.current, goal),
      target: formatValue(goal.target, goal),
      velocity: progress.velocity.toFixed(2),
    }),
    [progress, goal]
  );

  // ... rest of component
});
```

### Lazy Loading Example

```typescript
// src/features/goals/components/tabs/GoalHistoryTab.tsx
import React, { Suspense, lazy } from 'react';
import { Spin } from 'antd';

// Lazy load heavy components
const HistoryChart = lazy(() => import('../HistoryChart'));
const HistoryFilters = lazy(() => import('../HistoryFilters'));

export const GoalHistoryTab: React.FC<GoalHistoryTabProps> = ({ goalId }) => {
  return (
    <div className="goal-history-tab">
      <Suspense fallback={<Spin />}>
        <HistoryFilters />
      </Suspense>

      <Suspense fallback={<div>Loading chart...</div>}>
        <HistoryChart goalId={goalId} />
      </Suspense>

      {/* Other content loads immediately */}
      <HistoryList goalId={goalId} />
    </div>
  );
};
```

## Common Patterns

### Error Boundary

```typescript
// src/features/goals/components/GoalDetailErrorBoundary.tsx
import React from 'react';
import { Result, Button } from 'antd';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class GoalDetailErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    console.error('Goal detail error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="Something went wrong"
          subTitle="We encountered an error while loading the goal details."
          extra={
            <Button
              type="primary"
              onClick={() => this.setState({ hasError: false })}
            >
              Try Again
            </Button>
          }
        />
      );
    }

    return this.props.children;
  }
}
```

### Custom Hook for Tab State

```typescript
// src/features/goals/hooks/useGoalDetailTabs.ts
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useGoalDetailTabs(defaultTab: string = 'overview') {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || defaultTab);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams, activeTab]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab }, { replace: true });
  };

  return {
    activeTab,
    setActiveTab: handleTabChange,
  };
}
```

## Troubleshooting

### Common Issues

1. **Goal not loading**: Check network tab for API errors, verify goal ID format
2. **Progress not updating**: Check if progress calculation logic matches goal type
3. **Tabs not switching**: Verify tab state management and URL parameters
4. **Performance issues**: Check for unnecessary re-renders, implement memoization
5. **Mobile layout broken**: Test responsive breakpoints and touch interactions

### Debug Tools

```typescript
// Add to development environment
if (process.env.NODE_ENV === 'development') {
  // Log goal detail state changes
  useEffect(() => {
    console.log('Goal detail state:', { goal, progress, history });
  }, [goal, progress, history]);

  // Add React Query devtools
  import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
  // Include in app: <ReactQueryDevtools />
}
```

This quickstart guide provides a solid foundation for implementing the View Goal Details feature. The examples can be adapted and extended based on specific project requirements and design patterns.
