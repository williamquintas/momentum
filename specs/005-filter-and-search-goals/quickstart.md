# Developer Quickstart: Filter and Search Goals

## Overview

This guide provides developers with the essential information needed to implement and extend the filter and search goals feature. It includes code examples, testing strategies, and common patterns.

## Architecture Overview

### Core Components

```typescript
// Main search and filter hook
const useGoalSearch = () => {
  const [state, actions] = useSearchStore();

  return {
    // State
    query: state.query,
    filters: state.filters,
    results: state.results,
    loading: state.loading,

    // Actions
    search: actions.search,
    updateFilters: actions.updateFilters,
    clearFilters: actions.clearFilters,
    loadMore: actions.loadMore,
  };
};
```

### State Management Structure

```typescript
interface SearchState {
  // Search input
  query: string;

  // Applied filters
  filters: GoalFilters;

  // Results and pagination
  results: SearchResults;
  pagination: SearchPagination;

  // UI state
  loading: boolean;
  error: string | null;
}
```

## Implementation Examples

### Basic Search Implementation

```typescript
import React, { useState, useEffect } from 'react';
import { Input, List, Card } from 'antd';
import { useGoalSearch } from '../hooks/useGoalSearch';
import { GoalSearchResult } from '../types/search';

const GoalSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { query, results, loading, search } = useGoalSearch();

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== query) {
        search(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, query, search]);

  return (
    <div>
      <Input
        placeholder="Search goals..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        loading={loading}
      />

      <List
        dataSource={results.items}
        renderItem={(item: GoalSearchResult) => (
          <Card>
            <div dangerouslySetInnerHTML={{ __html: item.highlights.title }} />
            <p>{item.goal.description}</p>
          </Card>
        )}
      />
    </div>
  );
};
```

### Filter Panel Implementation

```typescript
import React from 'react';
import { Select, DatePicker, Slider, Button } from 'antd';
import { useGoalFilters } from '../hooks/useGoalFilters';
import { GoalType, GoalStatus, GoalPriority } from '../types/goal';

const { RangePicker } = DatePicker;
const { Option } = Select;

const FilterPanel: React.FC = () => {
  const { filters, updateFilters, clearFilters } = useGoalFilters();

  const handleTypeChange = (types: GoalType[]) => {
    updateFilters({ types });
  };

  const handleStatusChange = (statuses: GoalStatus[]) => {
    updateFilters({ statuses });
  };

  const handleProgressChange = (range: [number, number]) => {
    updateFilters({
      progress: {
        ...filters.progress,
        percentageRange: { min: range[0], max: range[1] }
      }
    });
  };

  return (
    <div className="filter-panel">
      <Select
        mode="multiple"
        placeholder="Filter by type"
        value={filters.types}
        onChange={handleTypeChange}
      >
        <Option value="quantitative">Quantitative</Option>
        <Option value="binary">Binary</Option>
        <Option value="milestone">Milestone</Option>
        <Option value="recurring">Recurring</Option>
        <Option value="habit">Habit</Option>
        <Option value="qualitative">Qualitative</Option>
      </Select>

      <Select
        mode="multiple"
        placeholder="Filter by status"
        value={filters.statuses}
        onChange={handleStatusChange}
      >
        <Option value="active">Active</Option>
        <Option value="completed">Completed</Option>
        <Option value="paused">Paused</Option>
        <Option value="archived">Archived</Option>
      </Select>

      <div>
        <label>Progress Range: {filters.progress.percentageRange.min}% - {filters.progress.percentageRange.max}%</label>
        <Slider
          range
          min={0}
          max={100}
          value={[filters.progress.percentageRange.min, filters.progress.percentageRange.max]}
          onChange={handleProgressChange}
        />
      </div>

      <RangePicker
        placeholder={['Created after', 'Created before']}
        value={filters.dateRange.created ? [
          filters.dateRange.created.start,
          filters.dateRange.created.end
        ] : undefined}
        onChange={(dates) => {
          updateFilters({
            dateRange: {
              ...filters.dateRange,
              created: dates ? {
                start: dates[0]!.toDate(),
                end: dates[1]!.toDate()
              } : undefined
            }
          });
        }}
      />

      <Button onClick={clearFilters}>Clear All Filters</Button>
    </div>
  );
};
```

### Search Index Management

```typescript
import { SearchIndex } from '../types/search';

class GoalSearchIndex {
  private index: SearchIndex;

  constructor() {
    this.index = this.loadIndex();
  }

  // Add goal to index
  addGoal(goal: Goal): void {
    const terms = this.tokenizeGoal(goal);
    terms.forEach((term) => {
      if (!this.index.invertedIndex[term]) {
        this.index.invertedIndex[term] = { goals: [], totalFrequency: 0 };
      }

      const termEntry = this.index.invertedIndex[term];
      const goalEntry = termEntry.goals.find((g) => g.goalId === goal.id);

      if (goalEntry) {
        goalEntry.frequency += 1;
      } else {
        termEntry.goals.push({
          goalId: goal.id,
          frequency: 1,
          positions: this.findTermPositions(goal, term),
          field: 'title', // or 'description'
        });
      }

      termEntry.totalFrequency += 1;
    });

    this.index.goalIndex[goal.id] = {
      summary: goal,
      fields: this.indexFields(goal),
      indexedAt: new Date(),
      indexVersion: this.index.version,
    };

    this.saveIndex();
  }

  // Search the index
  search(query: string): SearchResult[] {
    const terms = this.tokenizeQuery(query);
    const goalScores = new Map<string, number>();

    terms.forEach((term) => {
      const termEntry = this.index.invertedIndex[term];
      if (termEntry) {
        termEntry.goals.forEach((goal) => {
          const currentScore = goalScores.get(goal.goalId) || 0;
          const score = this.calculateScore(goal, termEntry, terms.length);
          goalScores.set(goal.goalId, currentScore + score);
        });
      }
    });

    return Array.from(goalScores.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 100)
      .map(([goalId, score]) => ({
        goalId,
        score,
        goal: this.index.goalIndex[goalId].summary,
      }));
  }

  private tokenizeGoal(goal: Goal): string[] {
    const text = `${goal.title} ${goal.description || ''}`.toLowerCase();
    return text.match(/\b\w+\b/g) || [];
  }

  private tokenizeQuery(query: string): string[] {
    return query.toLowerCase().match(/\b\w+\b/g) || [];
  }

  private calculateScore(goal: GoalTermInfo, termEntry: TermEntry, totalTerms: number): number {
    const tf = goal.frequency;
    const idf = Math.log(this.index.goalCount / termEntry.documentFrequency);
    const fieldWeight = this.getFieldWeight(goal.field);

    return (tf * idf * fieldWeight) / totalTerms;
  }

  private getFieldWeight(field: string): number {
    const weights = { title: 3, description: 1, tags: 2 };
    return weights[field as keyof typeof weights] || 1;
  }

  private loadIndex(): SearchIndex {
    // Load from IndexedDB or create new
    return {
      version: '1.0',
      createdAt: new Date(),
      updatedAt: new Date(),
      goalCount: 0,
      statistics: { totalTerms: 0, uniqueTerms: 0, avgTermsPerGoal: 0, sizeBytes: 0, lastOptimized: new Date() },
      invertedIndex: {},
      goalIndex: {},
      fieldIndexes: {},
    };
  }

  private saveIndex(): void {
    // Save to IndexedDB
    // Implementation depends on your storage layer
  }
}
```

### Filter Cache Implementation

```typescript
import { GoalFilters, SearchResults } from '../types/search';

class FilterCache {
  private cache = new Map<string, CachedResult>();
  private readonly maxSize = 100;
  private readonly ttl = 5 * 60 * 1000; // 5 minutes

  get(filters: GoalFilters, sort: SearchSort): SearchResults | null {
    const key = this.generateKey(filters, sort);
    const cached = this.cache.get(key);

    if (!cached || this.isExpired(cached)) {
      return null;
    }

    return cached.results;
  }

  set(filters: GoalFilters, sort: SearchSort, results: SearchResults): void {
    const key = this.generateKey(filters, sort);

    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      results,
      timestamp: Date.now(),
      ttl: this.ttl,
    });
  }

  invalidate(filters?: Partial<GoalFilters>): void {
    if (!filters) {
      this.cache.clear();
      return;
    }

    const keysToDelete: string[] = [];

    for (const [key, cached] of this.cache.entries()) {
      if (this.matchesFilters(key, filters)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  private generateKey(filters: GoalFilters, sort: SearchSort): string {
    return JSON.stringify({ filters, sort });
  }

  private isExpired(cached: CachedResult): boolean {
    return Date.now() - cached.timestamp > cached.ttl;
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, cached] of this.cache.entries()) {
      if (cached.timestamp < oldestTime) {
        oldestTime = cached.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private matchesFilters(key: string, filters: Partial<GoalFilters>): boolean {
    try {
      const parsed = JSON.parse(key);
      // Check if the cached filters match the invalidation filters
      // Implementation depends on your filter matching logic
      return true; // Placeholder
    } catch {
      return false;
    }
  }
}

interface CachedResult {
  results: SearchResults;
  timestamp: number;
  ttl: number;
}
```

## Testing Strategies

### Unit Testing Examples

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GoalSearch } from '../components/GoalSearch';
import { searchGoals } from '../services/searchService';

// Mock the search service
jest.mock('../services/searchService');

const mockSearchGoals = searchGoals as jest.MockedFunction<typeof searchGoals>;

describe('GoalSearch', () => {
  beforeEach(() => {
    mockSearchGoals.mockClear();
  });

  it('renders search input', () => {
    render(<GoalSearch />);
    expect(screen.getByPlaceholderText('Search goals...')).toBeInTheDocument();
  });

  it('calls search service on input change', async () => {
    mockSearchGoals.mockResolvedValue([]);

    render(<GoalSearch />);

    const input = screen.getByPlaceholderText('Search goals...');
    fireEvent.change(input, { target: { value: 'exercise' } });

    await waitFor(() => {
      expect(mockSearchGoals).toHaveBeenCalledWith('exercise');
    });
  });

  it('displays search results', async () => {
    const mockResults = [
      {
        id: '1',
        title: 'Exercise daily',
        description: 'Stay fit and healthy',
        highlights: { title: '<mark>Exercise</mark> daily' }
      }
    ];

    mockSearchGoals.mockResolvedValue(mockResults);

    render(<GoalSearch />);

    const input = screen.getByPlaceholderText('Search goals...');
    fireEvent.change(input, { target: { value: 'exercise' } });

    await waitFor(() => {
      expect(screen.getByText('Exercise daily')).toBeInTheDocument();
    });
  });

  it('shows loading state during search', () => {
    mockSearchGoals.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<GoalSearch />);

    const input = screen.getByPlaceholderText('Search goals...');
    fireEvent.change(input, { target: { value: 'exercise' } });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
```

### Integration Testing

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchAndFilterPage } from '../pages/SearchAndFilterPage';
import { server } from '../mocks/server';
import { rest } from 'msw';

// Establish API mocking before all tests
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Search and Filter Integration', () => {
  it('searches and filters goals end-to-end', async () => {
    // Mock API responses
    server.use(
      rest.get('/api/goals/search', (req, res, ctx) => {
        const query = req.url.searchParams.get('q');
        return res(ctx.json({
          items: [
            {
              goal: { id: '1', title: `${query} goal`, type: 'quantitative' },
              relevanceScore: 0.9,
              highlights: { title: `<mark>${query}</mark> goal` }
            }
          ],
          metadata: { totalResults: 1 }
        }));
      })
    );

    render(<SearchAndFilterPage />);

    // Search for goals
    const searchInput = screen.getByPlaceholderText('Search goals...');
    fireEvent.change(searchInput, { target: { value: 'exercise' } });

    await waitFor(() => {
      expect(screen.getByText('exercise goal')).toBeInTheDocument();
    });

    // Apply filter
    const typeFilter = screen.getByRole('combobox', { name: /filter by type/i });
    fireEvent.click(typeFilter);
    fireEvent.click(screen.getByText('Quantitative'));

    await waitFor(() => {
      expect(screen.getByText('exercise goal')).toBeInTheDocument();
    });
  });
});
```

### Performance Testing

```typescript
import { render } from '@testing-library/react';
import { GoalSearch } from '../components/GoalSearch';
import { SearchIndex } from '../utils/searchIndex';

// Performance test utilities
const createLargeDataset = (size: number) => {
  return Array.from({ length: size }, (_, i) => ({
    id: `goal-${i}`,
    title: `Goal ${i}`,
    description: `Description for goal ${i}`,
    type: 'quantitative' as const,
    status: 'active' as const
  }));
};

describe('Search Performance', () => {
  it('handles 10k goals within performance budget', async () => {
    const goals = createLargeDataset(10000);
    const index = new SearchIndex();

    // Index goals
    const indexStart = performance.now();
    goals.forEach(goal => index.addGoal(goal));
    const indexTime = performance.now() - indexStart;

    expect(indexTime).toBeLessThan(5000); // 5 seconds max

    // Search performance
    const searchStart = performance.now();
    const results = index.search('goal');
    const searchTime = performance.now() - searchStart;

    expect(searchTime).toBeLessThan(200); // 200ms max
    expect(results.length).toBeGreaterThan(0);
  });

  it('maintains UI responsiveness during search', () => {
    const goals = createLargeDataset(1000);
    const index = new SearchIndex();
    goals.forEach(goal => index.addGoal(goal));

    const { rerender } = render(<GoalSearch />);

    const startTime = performance.now();

    // Simulate rapid typing
    for (let i = 0; i < 10; i++) {
      rerender(<GoalSearch initialQuery={`query${i}`} />);
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    // Should handle rapid updates without blocking
    expect(totalTime).toBeLessThan(1000); // 1 second max for 10 updates
  });
});
```

## Common Patterns

### Custom Hook for Search State

```typescript
import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { searchGoals } from '../services/searchService';
import { SearchResults, SearchFilters } from '../types/search';

export const useGoalSearch = (initialFilters?: SearchFilters) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>(initialFilters || {});
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, 300);

  const performSearch = useCallback(async () => {
    if (!debouncedQuery.trim() && Object.keys(filters).length === 0) {
      setResults(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const searchResults = await searchGoals(debouncedQuery, filters);
      setResults(searchResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, filters]);

  useEffect(() => {
    performSearch();
  }, [performSearch]);

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  return {
    query,
    setQuery,
    filters,
    updateFilters,
    clearFilters,
    results,
    loading,
    error,
    performSearch,
  };
};
```

### Error Boundary for Search Components

```typescript
import React from 'react';
import { Result, Button } from 'antd';

interface SearchErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class SearchErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  SearchErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): SearchErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    console.error('Search component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="Search Unavailable"
          subTitle="Something went wrong with the search functionality."
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

### Search Result Component with Highlights

```typescript
import React from 'react';
import { Card, Tag } from 'antd';
import { GoalSearchResult } from '../types/search';

interface SearchResultItemProps {
  result: GoalSearchResult;
  onClick: (goalId: string) => void;
}

export const SearchResultItem: React.FC<SearchResultItemProps> = ({
  result,
  onClick
}) => {
  const { goal, relevanceScore, highlights } = result;

  return (
    <Card
      hoverable
      onClick={() => onClick(goal.id)}
      className="search-result-item"
    >
      <div className="search-result-header">
        <div
          className="search-result-title"
          dangerouslySetInnerHTML={{ __html: highlights.title }}
        />
        <Tag color="blue">{goal.type}</Tag>
        <Tag color={goal.status === 'completed' ? 'green' : 'orange'}>
          {goal.status}
        </Tag>
      </div>

      {highlights.description && (
        <div
          className="search-result-description"
          dangerouslySetInnerHTML={{ __html: highlights.description }}
        />
      )}

      <div className="search-result-meta">
        <span>Relevance: {Math.round(relevanceScore * 100)}%</span>
        <span>Progress: {goal.progress}%</span>
        <span>Updated: {goal.updatedAt.toLocaleDateString()}</span>
      </div>
    </Card>
  );
};
```

## Performance Optimization Tips

### 1. Debounced Search

```typescript
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

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
```

### 2. Virtual Scrolling for Large Lists

```typescript
import { FixedSizeList as List } from 'react-window';

const VirtualizedSearchResults: React.FC<{ results: SearchResult[] }> = ({ results }) => {
  return (
    <List
      height={400}
      itemCount={results.length}
      itemSize={100}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <SearchResultItem result={results[index]} />
        </div>
      )}
    </List>
  );
};
```

### 3. Search Index Optimization

```typescript
// Pre-compute common searches
const precomputeCommonSearches = (index: SearchIndex) => {
  const commonTerms = ['goal', 'project', 'task', 'daily', 'weekly'];
  const precomputed = new Map<string, SearchResult[]>();

  commonTerms.forEach((term) => {
    precomputed.set(term, index.search(term));
  });

  return precomputed;
};
```

## Troubleshooting

### Common Issues

1. **Search not returning expected results**
   - Check tokenization logic
   - Verify index is up to date
   - Review relevance scoring algorithm

2. **Filters not applying correctly**
   - Check filter combination logic
   - Verify cache invalidation
   - Review filter state management

3. **Performance degradation**
   - Check index size and memory usage
   - Review caching strategy
   - Optimize database queries

4. **Mobile responsiveness issues**
   - Test touch interactions
   - Check viewport breakpoints
   - Verify keyboard navigation

### Debug Tools

```typescript
// Debug search performance
const debugSearchPerformance = (query: string, results: SearchResult[], time: number) => {
  console.group(`Search Debug: "${query}"`);
  console.log(`Time: ${time}ms`);
  console.log(`Results: ${results.length}`);
  console.log('Top results:', results.slice(0, 3));
  console.groupEnd();
};

// Debug filter application
const debugFilterApplication = (filters: SearchFilters, results: SearchResult[]) => {
  console.group('Filter Debug');
  console.log('Applied filters:', filters);
  console.log(`Filtered results: ${results.length}`);
  console.log('Sample results:', results.slice(0, 2));
  console.groupEnd();
};
```

## Migration Guide

### Upgrading from Basic Search

1. **Install new dependencies**

   ```bash
   npm install fuse.js react-window @react-hook/debounce
   ```

2. **Update component imports**

   ```typescript
   // Before
   import { useSearch } from './old-search-hook';

   // After
   import { useGoalSearch } from './hooks/useGoalSearch';
   import { SearchResultItem } from './components/SearchResultItem';
   ```

3. **Migrate state management**

   ```typescript
   // Before
   const [results, setResults] = useState([]);

   // After
   const { results, loading, error, search } = useGoalSearch();
   ```

4. **Update rendering logic**

   ```typescript
   // Before
   {results.map(result => <div key={result.id}>{result.title}</div>)}

   // After
   {results?.items.map(result => (
     <SearchResultItem key={result.goal.id} result={result} />
   ))}
   ```

This quickstart guide provides the foundation for implementing and extending the filter and search goals feature. For more detailed information, refer to the full specification documents.
