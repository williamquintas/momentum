# Type Contracts: Filter and Search Goals

## Core Search Types

### Search Query Types

```typescript
export interface SearchQuery {
  /** The search text entered by the user */
  text: string;
  /** Minimum character length before search executes */
  minLength: number;
  /** Debounce delay in milliseconds */
  debounceMs: number;
  /** Whether to include fuzzy matching */
  fuzzy: boolean;
  /** Fuzzy matching threshold (0-1) */
  threshold: number;
}

export interface SearchSuggestion {
  /** Suggested search text */
  text: string;
  /** Type of suggestion (history, popular, correction) */
  type: 'history' | 'popular' | 'correction' | 'completion';
  /** Confidence score for the suggestion */
  confidence: number;
  /** Usage count for history/popular suggestions */
  count?: number;
}

export interface SearchHistory {
  /** Unique identifier for the search */
  id: string;
  /** The search query text */
  query: string;
  /** Timestamp when search was performed */
  timestamp: Date;
  /** Number of results returned */
  resultCount: number;
  /** Filters applied during search */
  filters: GoalFilters;
  /** User who performed the search */
  userId: string;
}
```

### Filter Types

```typescript
export interface GoalFilters {
  /** Filter by goal status */
  status?: GoalStatus[];
  /** Filter by goal type */
  type?: GoalType[];
  /** Filter by priority level */
  priority?: GoalPriority[];
  /** Filter by date ranges */
  dateRange?: DateRangeFilter;
  /** Filter by progress range */
  progressRange?: ProgressRangeFilter;
  /** Filter by tags */
  tags?: string[];
  /** Filter by assigned user */
  assigneeId?: string;
  /** Custom filter predicates */
  custom?: CustomFilter[];
}

export interface DateRangeFilter {
  /** Field to filter on */
  field: 'created' | 'updated' | 'due' | 'completed';
  /** Start date (inclusive) */
  start?: Date;
  /** End date (inclusive) */
  end?: Date;
  /** Quick date presets */
  preset?: 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'custom';
}

export interface ProgressRangeFilter {
  /** Minimum progress percentage (0-100) */
  min?: number;
  /** Maximum progress percentage (0-100) */
  max?: number;
  /** Whether to include completed goals */
  includeCompleted?: boolean;
}

export interface CustomFilter {
  /** Unique identifier for the filter */
  id: string;
  /** Human-readable name */
  name: string;
  /** Filter predicate function */
  predicate: (goal: Goal) => boolean;
  /** Whether the filter is active */
  active: boolean;
}
```

### Sort and Pagination Types

```typescript
export type SearchSortField = 'relevance' | 'created' | 'updated' | 'due' | 'priority' | 'progress' | 'title';

export type SearchSortDirection = 'asc' | 'desc';

export interface SearchSort {
  /** Field to sort by */
  field: SearchSortField;
  /** Sort direction */
  direction: SearchSortDirection;
  /** Custom sort function for complex sorting */
  customSorter?: (a: Goal, b: Goal) => number;
}

export interface SearchPagination {
  /** Current page number (1-based) */
  page: number;
  /** Number of items per page */
  pageSize: number;
  /** Total number of items */
  total: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there are more pages */
  hasNext: boolean;
  /** Whether there are previous pages */
  hasPrev: boolean;
}

export type SearchViewMode = 'grid' | 'list' | 'table';
```

## Search State Management

### Search State Interface

```typescript
export interface SearchState {
  /** Current search query */
  query: SearchQuery;
  /** Active filters */
  filters: GoalFilters;
  /** Current sort configuration */
  sort: SearchSort;
  /** Pagination state */
  pagination: SearchPagination;
  /** UI state */
  ui: SearchUIState;
  /** Search results */
  results: SearchResults;
  /** Search history */
  history: SearchHistory[];
  /** Saved searches */
  savedSearches: SavedSearch[];
  /** Loading and error states */
  status: SearchStatus;
}

export interface SearchUIState {
  /** Whether search panel is open */
  isSearchOpen: boolean;
  /** Whether filter panel is open */
  isFilterOpen: boolean;
  /** Whether suggestions are visible */
  showSuggestions: boolean;
  /** Current view mode */
  viewMode: SearchViewMode;
  /** Selected result items */
  selectedItems: string[];
  /** Expanded result items */
  expandedItems: string[];
}

export interface SearchResults {
  /** Array of goal IDs matching the search */
  items: string[];
  /** Total number of matching items */
  total: number;
  /** Relevance scores for each result */
  scores: Record<string, number>;
  /** Facets for drill-down filtering */
  facets: SearchFacets;
  /** Search execution metadata */
  metadata: SearchMetadata;
}

export interface SearchFacets {
  /** Status distribution */
  status: Record<GoalStatus, number>;
  /** Type distribution */
  type: Record<GoalType, number>;
  /** Priority distribution */
  priority: Record<GoalPriority, number>;
  /** Tag distribution */
  tags: Record<string, number>;
  /** Date range facets */
  dateRanges: DateFacet[];
  /** Progress range facets */
  progressRanges: ProgressFacet[];
}

export interface DateFacet {
  /** Facet label */
  label: string;
  /** Start date */
  start: Date;
  /** End date */
  end: Date;
  /** Count of items in this range */
  count: number;
}

export interface ProgressFacet {
  /** Facet label (e.g., "0-25%", "25-50%") */
  label: string;
  /** Minimum progress */
  min: number;
  /** Maximum progress */
  max: number;
  /** Count of items in this range */
  count: number;
}

export interface SearchMetadata {
  /** Search execution time in milliseconds */
  executionTime: number;
  /** Timestamp when search was executed */
  executedAt: Date;
  /** Search strategy used */
  strategy: 'client' | 'server' | 'hybrid';
  /** Cache hit status */
  cacheHit: boolean;
  /** Index version used */
  indexVersion: string;
}

export interface SearchStatus {
  /** Whether search is currently executing */
  isSearching: boolean;
  /** Whether filters are being applied */
  isFiltering: boolean;
  /** Whether results are being loaded */
  isLoading: boolean;
  /** Last error that occurred */
  error: SearchError | null;
  /** Progress of long-running operations */
  progress: number;
}

export interface SearchError {
  /** Error code */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Error details for debugging */
  details?: any;
  /** Whether the error is recoverable */
  recoverable: boolean;
}
```

### Saved Search Types

```typescript
export interface SavedSearch {
  /** Unique identifier */
  id: string;
  /** User-defined name */
  name: string;
  /** Search query */
  query: SearchQuery;
  /** Applied filters */
  filters: GoalFilters;
  /** Sort configuration */
  sort: SearchSort;
  /** View mode */
  viewMode: SearchViewMode;
  /** Creation timestamp */
  createdAt: Date;
  /** Last used timestamp */
  lastUsedAt: Date;
  /** Usage count */
  usageCount: number;
  /** Whether this is a favorite */
  isFavorite: boolean;
  /** Tags for organization */
  tags: string[];
  /** Sharing permissions */
  sharing: SearchSharing;
}

export interface SearchSharing {
  /** Whether search is public */
  isPublic: boolean;
  /** Allowed user IDs */
  allowedUsers: string[];
  /** Allowed team IDs */
  allowedTeams: string[];
  /** Sharing permissions */
  permissions: 'view' | 'edit' | 'admin';
}
```

## API Contracts

### Search API Request/Response

```typescript
export interface SearchRequest {
  /** Search query parameters */
  query: SearchQuery;
  /** Filter parameters */
  filters: GoalFilters;
  /** Sort parameters */
  sort: SearchSort;
  /** Pagination parameters */
  pagination: {
    page: number;
    pageSize: number;
  };
  /** Additional options */
  options?: SearchOptions;
}

export interface SearchOptions {
  /** Whether to include facets */
  includeFacets: boolean;
  /** Whether to include suggestions */
  includeSuggestions: boolean;
  /** Maximum number of suggestions */
  maxSuggestions: number;
  /** Whether to use cache */
  useCache: boolean;
  /** Search timeout in milliseconds */
  timeout: number;
}

export interface SearchResponse {
  /** Search results */
  results: SearchResults;
  /** Search suggestions */
  suggestions: SearchSuggestion[];
  /** Execution metadata */
  metadata: SearchMetadata;
  /** Whether more results are available */
  hasMore: boolean;
}

export interface BatchSearchRequest {
  /** Array of search requests */
  searches: SearchRequest[];
  /** Whether to execute in parallel */
  parallel: boolean;
  /** Maximum concurrency for parallel execution */
  maxConcurrency: number;
}

export interface BatchSearchResponse {
  /** Array of search responses */
  responses: SearchResponse[];
  /** Overall execution metadata */
  metadata: {
    totalExecutionTime: number;
    successfulSearches: number;
    failedSearches: number;
  };
}
```

### Filter API Contracts

```typescript
export interface FilterRequest {
  /** Goals to filter */
  goals: Goal[];
  /** Filter criteria */
  filters: GoalFilters;
  /** Whether to apply filters progressively */
  progressive: boolean;
}

export interface FilterResponse {
  /** Filtered goals */
  filteredGoals: Goal[];
  /** Filter metadata */
  metadata: {
    totalGoals: number;
    filteredCount: number;
    executionTime: number;
    appliedFilters: string[];
  };
}

export interface FacetRequest {
  /** Goals to analyze */
  goals: Goal[];
  /** Facet configuration */
  config: FacetConfig;
}

export interface FacetConfig {
  /** Fields to facet on */
  fields: FacetField[];
  /** Maximum number of facet values */
  maxValues: number;
  /** Minimum count for facet inclusion */
  minCount: number;
}

export interface FacetField {
  /** Field name */
  name: string;
  /** Field type */
  type: 'string' | 'number' | 'date' | 'boolean';
  /** Custom facet function */
  customFacet?: (goals: Goal[]) => FacetValue[];
}

export interface FacetValue {
  /** Facet value */
  value: any;
  /** Count of items with this value */
  count: number;
  /** Display label */
  label: string;
}

export interface FacetResponse {
  /** Facet results */
  facets: Record<string, FacetValue[]>;
  /** Facet metadata */
  metadata: {
    totalGoals: number;
    executionTime: number;
  };
}
```

## State Management Contracts

### Zustand Store Contract

```typescript
export interface SearchStore {
  // State
  state: SearchState;

  // Actions
  setQuery: (query: Partial<SearchQuery>) => void;
  setFilters: (filters: Partial<GoalFilters>) => void;
  setSort: (sort: Partial<SearchSort>) => void;
  setPagination: (pagination: Partial<SearchPagination>) => void;
  setUIState: (ui: Partial<SearchUIState>) => void;

  // Search operations
  executeSearch: () => Promise<void>;
  clearSearch: () => void;
  loadSuggestions: (query: string) => Promise<SearchSuggestion[]>;

  // Filter operations
  applyFilters: (filters: GoalFilters) => void;
  clearFilters: () => void;
  toggleFilter: (filterType: keyof GoalFilters, value: any) => void;

  // History operations
  addToHistory: (search: Omit<SearchHistory, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  loadHistory: () => Promise<SearchHistory[]>;

  // Saved search operations
  saveSearch: (name: string) => Promise<SavedSearch>;
  loadSavedSearch: (id: string) => Promise<void>;
  deleteSavedSearch: (id: string) => Promise<void>;
  updateSavedSearch: (id: string, updates: Partial<SavedSearch>) => Promise<void>;

  // Utility actions
  reset: () => void;
  exportState: () => SearchState;
  importState: (state: SearchState) => void;
}

// Store selectors
export interface SearchSelectors {
  selectQuery: (state: SearchState) => SearchQuery;
  selectFilters: (state: SearchState) => GoalFilters;
  selectResults: (state: SearchState) => SearchResults;
  selectIsLoading: (state: SearchState) => boolean;
  selectError: (state: SearchState) => SearchError | null;
  selectHasActiveFilters: (state: SearchState) => boolean;
  selectActiveFilterCount: (state: SearchState) => number;
  selectCanLoadMore: (state: SearchState) => boolean;
}
```

### React Query Contracts

```typescript
export interface SearchQueries {
  // Search queries
  searchGoals: UseQueryResult<SearchResponse, SearchError>;
  searchSuggestions: UseQueryResult<SearchSuggestion[], SearchError>;
  searchHistory: UseQueryResult<SearchHistory[], SearchError>;

  // Filter queries
  filterGoals: UseQueryResult<FilterResponse, SearchError>;
  searchFacets: UseQueryResult<SearchFacets, SearchError>;

  // Saved search queries
  savedSearches: UseQueryResult<SavedSearch[], SearchError>;
  savedSearch: UseQueryResult<SavedSearch, SearchError>;
}

export interface SearchMutations {
  // Search mutations
  executeSearch: UseMutationResult<SearchResponse, SearchError, SearchRequest>;
  saveSearch: UseMutationResult<SavedSearch, SearchError, Omit<SavedSearch, 'id'>>;
  deleteSearch: UseMutationResult<void, SearchError, string>;

  // Filter mutations
  applyFilters: UseMutationResult<FilterResponse, SearchError, FilterRequest>;
  clearFilters: UseMutationResult<void, SearchError, void>;

  // History mutations
  addToHistory: UseMutationResult<SearchHistory, SearchError, Omit<SearchHistory, 'id'>>;
  clearHistory: UseMutationResult<void, SearchError, void>;
}
```

## Validation Schemas

### Zod Validation Schemas

```typescript
import { z } from 'zod';

// Search Query Schema
export const SearchQuerySchema = z.object({
  text: z.string().min(0).max(500),
  minLength: z.number().min(1).max(10).default(3),
  debounceMs: z.number().min(0).max(2000).default(300),
  fuzzy: z.boolean().default(true),
  threshold: z.number().min(0).max(1).default(0.4),
});

// Filter Schemas
export const DateRangeFilterSchema = z.object({
  field: z.enum(['created', 'updated', 'due', 'completed']),
  start: z.date().optional(),
  end: z.date().optional(),
  preset: z.enum(['today', 'yesterday', 'thisWeek', 'lastWeek', 'thisMonth', 'lastMonth', 'custom']).optional(),
});

export const ProgressRangeFilterSchema = z.object({
  min: z.number().min(0).max(100).optional(),
  max: z.number().min(0).max(100).optional(),
  includeCompleted: z.boolean().default(true),
});

export const GoalFiltersSchema = z.object({
  status: z.array(z.nativeEnum(GoalStatus)).optional(),
  type: z.array(z.nativeEnum(GoalType)).optional(),
  priority: z.array(z.nativeEnum(GoalPriority)).optional(),
  dateRange: DateRangeFilterSchema.optional(),
  progressRange: ProgressRangeFilterSchema.optional(),
  tags: z.array(z.string()).optional(),
  assigneeId: z.string().uuid().optional(),
  custom: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        predicate: z.function(), // Runtime validation only
        active: z.boolean(),
      })
    )
    .optional(),
});

// Sort and Pagination Schemas
export const SearchSortSchema = z.object({
  field: z.enum(['relevance', 'created', 'updated', 'due', 'priority', 'progress', 'title']),
  direction: z.enum(['asc', 'desc']),
  customSorter: z.function().optional(),
});

export const SearchPaginationSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(10).max(100).default(25),
  total: z.number().min(0).default(0),
  totalPages: z.number().min(0).default(0),
  hasNext: z.boolean().default(false),
  hasPrev: z.boolean().default(false),
});

// Complete Search State Schema
export const SearchStateSchema = z.object({
  query: SearchQuerySchema,
  filters: GoalFiltersSchema,
  sort: SearchSortSchema,
  pagination: SearchPaginationSchema,
  ui: z.object({
    isSearchOpen: z.boolean(),
    isFilterOpen: z.boolean(),
    showSuggestions: z.boolean(),
    viewMode: z.enum(['grid', 'list', 'table']),
    selectedItems: z.array(z.string()),
    expandedItems: z.array(z.string()),
  }),
  results: z.object({
    items: z.array(z.string()),
    total: z.number(),
    scores: z.record(z.number()),
    facets: z.object({
      status: z.record(z.number()),
      type: z.record(z.number()),
      priority: z.record(z.number()),
      tags: z.record(z.number()),
      dateRanges: z.array(
        z.object({
          label: z.string(),
          start: z.date(),
          end: z.date(),
          count: z.number(),
        })
      ),
      progressRanges: z.array(
        z.object({
          label: z.string(),
          min: z.number(),
          max: z.number(),
          count: z.number(),
        })
      ),
    }),
    metadata: z.object({
      executionTime: z.number(),
      executedAt: z.date(),
      strategy: z.enum(['client', 'server', 'hybrid']),
      cacheHit: z.boolean(),
      indexVersion: z.string(),
    }),
  }),
  history: z.array(
    z.object({
      id: z.string(),
      query: z.string(),
      timestamp: z.date(),
      resultCount: z.number(),
      filters: GoalFiltersSchema,
      userId: z.string(),
    })
  ),
  savedSearches: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      query: SearchQuerySchema,
      filters: GoalFiltersSchema,
      sort: SearchSortSchema,
      viewMode: z.enum(['grid', 'list', 'table']),
      createdAt: z.date(),
      lastUsedAt: z.date(),
      usageCount: z.number(),
      isFavorite: z.boolean(),
      tags: z.array(z.string()),
      sharing: z.object({
        isPublic: z.boolean(),
        allowedUsers: z.array(z.string()),
        allowedTeams: z.array(z.string()),
        permissions: z.enum(['view', 'edit', 'admin']),
      }),
    })
  ),
  status: z.object({
    isSearching: z.boolean(),
    isFiltering: z.boolean(),
    isLoading: z.boolean(),
    error: z
      .object({
        code: z.string(),
        message: z.string(),
        details: z.any().optional(),
        recoverable: z.boolean(),
      })
      .nullable(),
    progress: z.number().min(0).max(100),
  }),
});
```

## Testing Utilities

### Test Data Factories

```typescript
export interface SearchTestData {
  mockGoals: Goal[];
  mockFilters: GoalFilters;
  mockSearchState: SearchState;
  mockSearchResponse: SearchResponse;
  mockFacets: SearchFacets;
}

export interface SearchTestFactories {
  createMockGoal: (overrides?: Partial<Goal>) => Goal;
  createMockFilters: (overrides?: Partial<GoalFilters>) => GoalFilters;
  createMockSearchState: (overrides?: Partial<SearchState>) => SearchState;
  createMockSearchResponse: (overrides?: Partial<SearchResponse>) => SearchResponse;
  createMockFacets: (overrides?: Partial<SearchFacets>) => SearchFacets;
  createMockSearchHistory: (count: number) => SearchHistory[];
  createMockSavedSearches: (count: number) => SavedSearch[];
}
```

### Test Helpers

```typescript
export interface SearchTestHelpers {
  // State setup helpers
  setupSearchStore: (initialState?: Partial<SearchState>) => SearchStore;
  setupSearchQuery: (overrides?: Partial<SearchQuery>) => SearchQuery;

  // Mock helpers
  mockSearchAPI: (response?: SearchResponse) => void;
  mockFilterAPI: (response?: FilterResponse) => void;
  mockFacetAPI: (response?: FacetResponse) => void;

  // Assertion helpers
  expectSearchResults: (results: SearchResults, expected: Partial<SearchResults>) => void;
  expectFiltersApplied: (goals: Goal[], filters: GoalFilters, expected: Goal[]) => void;
  expectFacetsCorrect: (goals: Goal[], facets: SearchFacets) => void;

  // Performance helpers
  measureSearchPerformance: (searchFn: () => Promise<SearchResponse>) => Promise<SearchPerformance>;
  measureFilterPerformance: (filterFn: () => FilterResponse) => FilterPerformance;
}

export interface SearchPerformance {
  executionTime: number;
  memoryUsage: number;
  resultCount: number;
  cacheHit: boolean;
}

export interface FilterPerformance {
  executionTime: number;
  goalsProcessed: number;
  filtersApplied: number;
  memoryUsage: number;
}
```

### Test Constants

```typescript
export const SEARCH_TEST_CONSTANTS = {
  // Performance thresholds
  MAX_SEARCH_TIME: 200, // ms
  MAX_FILTER_TIME: 150, // ms
  MAX_MEMORY_USAGE: 50 * 1024 * 1024, // 50MB

  // Test data sizes
  SMALL_DATASET: 100,
  MEDIUM_DATASET: 1000,
  LARGE_DATASET: 10000,

  // Common test queries
  QUERIES: {
    SIMPLE: 'exercise',
    COMPLEX: 'exercise daily fitness',
    FUZZY: 'exrcise', // typo
    EMPTY: '',
    LONG: 'a'.repeat(500),
  },

  // Common filter combinations
  FILTERS: {
    SINGLE_STATUS: { status: ['active'] },
    MULTIPLE_TYPES: { type: ['quantitative', 'binary'] },
    DATE_RANGE: {
      dateRange: {
        field: 'created' as const,
        preset: 'thisWeek' as const,
      },
    },
    COMPLEX: {
      status: ['active', 'paused'],
      type: ['quantitative'],
      priority: ['high', 'urgent'],
      progressRange: { min: 0, max: 75 },
    },
  },
} as const;
```

## Integration Contracts

### Component Props Interfaces

```typescript
export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (query: string) => void;
  placeholder?: string;
  disabled?: boolean;
  showSuggestions?: boolean;
  suggestions?: SearchSuggestion[];
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  loading?: boolean;
  error?: string;
  className?: string;
}

export interface FilterPanelProps {
  filters: GoalFilters;
  onFiltersChange: (filters: GoalFilters) => void;
  availableFacets?: SearchFacets;
  loading?: boolean;
  disabled?: boolean;
  layout?: 'sidebar' | 'modal' | 'inline';
  className?: string;
}

export interface SearchResultsProps {
  results: SearchResults;
  loading?: boolean;
  error?: SearchError | null;
  viewMode?: SearchViewMode;
  onViewModeChange?: (mode: SearchViewMode) => void;
  onItemSelect?: (itemId: string) => void;
  selectedItems?: string[];
  onLoadMore?: () => void;
  className?: string;
}

export interface SearchControlsProps {
  sort: SearchSort;
  onSortChange: (sort: SearchSort) => void;
  pagination: SearchPagination;
  onPaginationChange: (pagination: Partial<SearchPagination>) => void;
  viewMode: SearchViewMode;
  onViewModeChange: (mode: SearchViewMode) => void;
  totalResults: number;
  loading?: boolean;
  className?: string;
}
```

### Hook Interfaces

```typescript
export interface UseSearchResult {
  // State
  state: SearchState;

  // Actions
  setQuery: (query: Partial<SearchQuery>) => void;
  setFilters: (filters: Partial<GoalFilters>) => void;
  executeSearch: () => Promise<void>;
  clearSearch: () => void;

  // Computed values
  hasActiveFilters: boolean;
  activeFilterCount: number;
  canLoadMore: boolean;
  isLoading: boolean;
  error: SearchError | null;

  // Utilities
  exportState: () => SearchState;
  importState: (state: SearchState) => void;
}

export interface UseFilterResult {
  // State
  filters: GoalFilters;

  // Actions
  setFilters: (filters: GoalFilters) => void;
  applyFilter: (filterType: keyof GoalFilters, value: any) => void;
  removeFilter: (filterType: keyof GoalFilters) => void;
  clearFilters: () => void;
  toggleFilter: (filterType: keyof GoalFilters, value: any) => void;

  // Computed values
  activeFilters: Array<{ type: keyof GoalFilters; value: any }>;
  hasActiveFilters: boolean;
  filterCount: number;
}

export interface UseSearchIndexResult {
  // State
  isIndexing: boolean;
  indexVersion: string;
  lastIndexed: Date | null;

  // Actions
  rebuildIndex: () => Promise<void>;
  updateIndex: (goals: Goal[]) => Promise<void>;
  search: (query: SearchQuery) => Promise<SearchResults>;

  // Utilities
  getIndexStats: () => IndexStats;
  clearIndex: () => Promise<void>;
}

export interface IndexStats {
  totalGoals: number;
  indexSize: number; // bytes
  lastUpdate: Date;
  version: string;
  performance: {
    buildTime: number;
    averageSearchTime: number;
    memoryUsage: number;
  };
}
```

This comprehensive type contract provides a complete TypeScript interface definition for the filter and search goals feature, ensuring type safety, consistency, and maintainability across the entire implementation.
