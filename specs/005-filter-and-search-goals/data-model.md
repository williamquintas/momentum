# Data Model: Filter and Search Goals

## Core Data Structures

### Search and Filter State

```typescript
export interface SearchFilterState {
  /** Current search query */
  query: string;

  /** Active filters */
  filters: GoalFilters;

  /** Sort configuration */
  sort: SearchSort;

  /** Pagination state */
  pagination: SearchPagination;

  /** UI state */
  ui: SearchUIState;

  /** Saved filter presets */
  presets: FilterPreset[];
}

export interface GoalFilters {
  /** Goal type filters */
  types: GoalType[];

  /** Status filters */
  statuses: GoalStatus[];

  /** Priority filters */
  priorities: GoalPriority[];

  /** Tag filters */
  tags: string[];

  /** Category filters */
  categories: string[];

  /** Progress filters */
  progress: ProgressFilters;

  /** Date range filters */
  dateRange: DateRangeFilters;

  /** Custom filters */
  custom: Record<string, any>;
}

export interface ProgressFilters {
  /** Progress percentage range */
  percentageRange: NumberRange;

  /** Completion status */
  completionStatus: CompletionStatus;

  /** Progress trend */
  trend: ProgressTrend;

  /** Estimated completion date range */
  estimatedCompletionRange: DateRange;
}

export interface DateRangeFilters {
  /** Creation date range */
  created: DateRange;

  /** Last update date range */
  updated: DateRange;

  /** Completion date range */
  completed: DateRange;
}

export interface SearchSort {
  /** Sort field */
  field: SearchSortField;

  /** Sort direction */
  direction: 'asc' | 'desc';

  /** Secondary sort for tie-breaking */
  secondary?: {
    field: SearchSortField;
    direction: 'asc' | 'desc';
  };
}

export type SearchSortField =
  | 'relevance'
  | 'title'
  | 'created'
  | 'updated'
  | 'progress'
  | 'priority'
  | 'type'
  | 'status';

export interface SearchPagination {
  /** Current page (1-based) */
  page: number;

  /** Items per page */
  pageSize: number;

  /** Total items available */
  totalItems: number;

  /** Total pages */
  totalPages: number;

  /** Cursor for efficient pagination */
  cursor?: string;
}

export interface SearchUIState {
  /** Search input focus state */
  isSearchFocused: boolean;

  /** Filter panel expanded state */
  isFilterPanelOpen: boolean;

  /** Loading states */
  loading: {
    search: boolean;
    filters: boolean;
    results: boolean;
  };

  /** View mode */
  viewMode: 'list' | 'grid';

  /** Active preset ID */
  activePresetId?: string;
}
```

### Search Results Data

```typescript
export interface SearchResults {
  /** Search result items */
  items: GoalSearchResult[];

  /** Search metadata */
  metadata: SearchMetadata;

  /** Applied filters summary */
  appliedFilters: AppliedFiltersSummary;

  /** Performance metrics */
  performance: SearchPerformance;
}

export interface GoalSearchResult {
  /** Goal basic information */
  goal: GoalSummary;

  /** Search relevance score */
  relevanceScore: number;

  /** Matched fields and positions */
  matches: SearchMatch[];

  /** Highlighted text snippets */
  highlights: SearchHighlight[];

  /** Result ranking factors */
  ranking: SearchRanking;
}

export interface GoalSummary {
  /** Goal unique identifier */
  id: string;

  /** Goal title */
  title: string;

  /** Goal description */
  description?: string;

  /** Goal type */
  type: GoalType;

  /** Goal status */
  status: GoalStatus;

  /** Goal priority */
  priority: GoalPriority;

  /** Associated tags */
  tags: string[];

  /** Goal category */
  category?: string;

  /** Current progress percentage */
  progress: number;

  /** Creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;

  /** Completion timestamp */
  completedAt?: Date;

  /** Estimated completion date */
  estimatedCompletion?: Date;
}

export interface SearchMatch {
  /** Field that matched */
  field: 'title' | 'description' | 'tags';

  /** Match positions in the text */
  positions: TextPosition[];

  /** Match score */
  score: number;
}

export interface TextPosition {
  /** Start character position */
  start: number;

  /** End character position */
  end: number;

  /** Match term */
  term: string;
}

export interface SearchHighlight {
  /** Field being highlighted */
  field: string;

  /** Original text */
  original: string;

  /** Highlighted HTML */
  highlighted: string;

  /** Highlight markers */
  markers: HighlightMarker[];
}

export interface HighlightMarker {
  /** Marker type */
  type: 'match' | 'context';

  /** Start position */
  start: number;

  /** End position */
  end: number;

  /** CSS class for styling */
  className: string;
}

export interface SearchRanking {
  /** Primary ranking score */
  primaryScore: number;

  /** Secondary ranking factors */
  factors: RankingFactor[];

  /** Ranking algorithm version */
  algorithmVersion: string;
}

export interface RankingFactor {
  /** Factor name */
  name: string;

  /** Factor value */
  value: number;

  /** Factor weight */
  weight: number;

  /** Factor score contribution */
  contribution: number;
}
```

### Filter Presets and History

```typescript
export interface FilterPreset {
  /** Unique preset identifier */
  id: string;

  /** Preset name */
  name: string;

  /** Preset description */
  description?: string;

  /** Filter configuration */
  filters: GoalFilters;

  /** Sort configuration */
  sort: SearchSort;

  /** Creation timestamp */
  createdAt: Date;

  /** Last used timestamp */
  lastUsedAt: Date;

  /** Usage count */
  usageCount: number;

  /** Is default preset */
  isDefault: boolean;

  /** Is system preset */
  isSystem: boolean;
}

export interface SearchHistory {
  /** Search query */
  query: string;

  /** Applied filters at time of search */
  filters: GoalFilters;

  /** Search timestamp */
  timestamp: Date;

  /** Result count */
  resultCount: number;

  /** Search duration */
  duration: number;

  /** Was search successful */
  successful: boolean;
}

export interface RecentSearches {
  /** Recent search entries */
  searches: SearchHistory[];

  /** Maximum history size */
  maxSize: number;

  /** History retention period */
  retentionDays: number;
}
```

### Search Metadata and Performance

```typescript
export interface SearchMetadata {
  /** Total results found */
  totalResults: number;

  /** Results returned in this response */
  returnedResults: number;

  /** Search query that was executed */
  executedQuery: string;

  /** Search execution timestamp */
  executedAt: Date;

  /** Search algorithm version */
  algorithmVersion: string;

  /** Search parameters */
  parameters: SearchParameters;
}

export interface SearchParameters {
  /** Minimum term length */
  minTermLength: number;

  /** Maximum results to return */
  maxResults: number;

  /** Fuzzy matching enabled */
  fuzzyMatching: boolean;

  /** Fuzzy threshold */
  fuzzyThreshold: number;

  /** Field weights */
  fieldWeights: Record<string, number>;

  /** Ranking algorithm */
  rankingAlgorithm: string;
}

export interface AppliedFiltersSummary {
  /** Active filter count */
  activeCount: number;

  /** Filter categories with active filters */
  categories: FilterCategorySummary[];

  /** Quick filter indicators */
  quickFilters: QuickFilterIndicator[];
}

export interface FilterCategorySummary {
  /** Filter category name */
  category: string;

  /** Active filters in this category */
  activeFilters: string[];

  /** Total available options */
  totalOptions: number;

  /** Selected options count */
  selectedCount: number;
}

export interface QuickFilterIndicator {
  /** Filter type */
  type: string;

  /** Display label */
  label: string;

  /** Active state */
  active: boolean;

  /** Result count for this filter */
  count?: number;
}

export interface SearchPerformance {
  /** Total search time */
  totalTime: number;

  /** Time breakdown */
  breakdown: {
    indexing: number;
    filtering: number;
    sorting: number;
    highlighting: number;
  };

  /** Memory usage */
  memoryUsage: {
    peak: number;
    current: number;
  };

  /** Cache hit information */
  cache: {
    hit: boolean;
    key: string;
    age: number;
  };
}
```

## Search Index Data Structures

### Search Index Schema

```typescript
export interface SearchIndex {
  /** Index version */
  version: string;

  /** Creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;

  /** Indexed goals count */
  goalCount: number;

  /** Index statistics */
  statistics: IndexStatistics;

  /** Inverted index */
  invertedIndex: InvertedIndex;

  /** Goal metadata index */
  goalIndex: GoalIndex;

  /** Field-specific indexes */
  fieldIndexes: FieldIndexes;
}

export interface IndexStatistics {
  /** Total terms indexed */
  totalTerms: number;

  /** Unique terms count */
  uniqueTerms: number;

  /** Average terms per goal */
  avgTermsPerGoal: number;

  /** Index size in bytes */
  sizeBytes: number;

  /** Last optimization timestamp */
  lastOptimized: Date;
}

export interface InvertedIndex {
  /** Term to goal mappings */
  [term: string]: TermEntry;
}

export interface TermEntry {
  /** Goals containing this term */
  goals: GoalTermInfo[];

  /** Term frequency across all goals */
  totalFrequency: number;

  /** Document frequency */
  documentFrequency: number;
}

export interface GoalTermInfo {
  /** Goal ID */
  goalId: string;

  /** Term frequency in this goal */
  frequency: number;

  /** Term positions in the goal */
  positions: TermPosition[];

  /** Field containing the term */
  field: string;
}

export interface TermPosition {
  /** Character start position */
  start: number;

  /** Character end position */
  end: number;

  /** Field offset */
  fieldOffset: number;
}

export interface GoalIndex {
  /** Goal ID to metadata mapping */
  [goalId: string]: GoalIndexEntry;
}

export interface GoalIndexEntry {
  /** Goal basic information */
  summary: GoalSummary;

  /** Indexed fields */
  fields: IndexedField[];

  /** Index timestamp */
  indexedAt: Date;

  /** Index version */
  indexVersion: string;
}

export interface IndexedField {
  /** Field name */
  name: string;

  /** Original field value */
  value: any;

  /** Tokenized terms */
  terms: string[];

  /** Term frequencies */
  termFrequencies: Record<string, number>;
}

export interface FieldIndexes {
  /** Title field index */
  title: FieldIndex;

  /** Description field index */
  description: FieldIndex;

  /** Tags field index */
  tags: FieldIndex;

  /** Category field index */
  category: FieldIndex;
}

export interface FieldIndex {
  /** Field-specific inverted index */
  invertedIndex: InvertedIndex;

  /** Field statistics */
  statistics: FieldStatistics;
}

export interface FieldStatistics {
  /** Total goals with this field */
  totalGoals: number;

  /** Average field length */
  avgLength: number;

  /** Field-specific term counts */
  termCounts: Record<string, number>;
}
```

## Filter Cache Structures

### Filter Cache Schema

```typescript
export interface FilterCache {
  /** Cache version */
  version: string;

  /** Cache creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;

  /** Cache statistics */
  statistics: CacheStatistics;

  /** Cached filter results */
  results: CachedFilterResults;

  /** Filter dependency graph */
  dependencies: FilterDependencies;
}

export interface CacheStatistics {
  /** Total cached results */
  totalResults: number;

  /** Cache hit rate */
  hitRate: number;

  /** Average result size */
  avgResultSize: number;

  /** Cache size in bytes */
  sizeBytes: number;

  /** Cache efficiency score */
  efficiency: number;
}

export interface CachedFilterResults {
  /** Filter combination to results mapping */
  [filterKey: string]: CachedResult;
}

export interface CachedResult {
  /** Cached goal IDs */
  goalIds: string[];

  /** Result metadata */
  metadata: {
    count: number;
    timestamp: Date;
    ttl: number;
  };

  /** Cache key components */
  key: FilterKey;

  /** Result hash for validation */
  hash: string;
}

export interface FilterKey {
  /** Filter components */
  filters: GoalFilters;

  /** Sort configuration */
  sort: SearchSort;

  /** Data version */
  dataVersion: string;

  /** User context */
  userId: string;
}

export interface FilterDependencies {
  /** Filter dependency graph */
  graph: DependencyGraph;

  /** Invalidated cache keys */
  invalidated: string[];

  /** Dependency statistics */
  statistics: DependencyStatistics;
}

export interface DependencyGraph {
  /** Filter to dependent filters mapping */
  [filterKey: string]: string[];
}

export interface DependencyStatistics {
  /** Total dependencies */
  totalDependencies: number;

  /** Average dependencies per filter */
  avgDependencies: number;

  /** Most dependent filter */
  mostDependent: string;
}
```

## Supporting Types

### Utility Types

```typescript
export type NumberRange = {
  min: number;
  max: number;
};

export type DateRange = {
  start: Date;
  end: Date;
};

export type CompletionStatus = 'not-started' | 'in-progress' | 'completed' | 'overdue';

export type ProgressTrend = 'increasing' | 'decreasing' | 'stable' | 'volatile';

// Re-export from main types
export type GoalType = 'quantitative' | 'binary' | 'milestone' | 'recurring' | 'habit' | 'qualitative';
export type GoalStatus = 'active' | 'completed' | 'paused' | 'archived' | 'cancelled';
export type GoalPriority = 'low' | 'medium' | 'high' | 'critical';
```

## Data Flow Diagrams

### Search Request Flow
```
User Input → Debounce (300ms) → Query Processing → Index Lookup → Relevance Scoring → Result Filtering → Highlighting → Response
```

### Filter Application Flow
```
Filter Selection → Cache Check → Filter Computation → Result Intersection → Sorting → Pagination → UI Update
```

### Index Update Flow
```
Goal Change → Index Invalidation → Background Re-indexing → Cache Invalidation → Search Update
```

## Validation Schemas

### Search State Validation

```typescript
import { z } from 'zod';

export const SearchFilterStateSchema = z.object({
  query: z.string().max(500, 'Search query too long'),
  filters: GoalFiltersSchema,
  sort: SearchSortSchema,
  pagination: SearchPaginationSchema,
  ui: SearchUIStateSchema,
  presets: z.array(FilterPresetSchema),
});

export const GoalFiltersSchema = z.object({
  types: z.array(z.enum(['quantitative', 'binary', 'milestone', 'recurring', 'habit', 'qualitative'])),
  statuses: z.array(z.enum(['active', 'completed', 'paused', 'archived', 'cancelled'])),
  priorities: z.array(z.enum(['low', 'medium', 'high', 'critical'])),
  tags: z.array(z.string().max(50)),
  categories: z.array(z.string().max(100)),
  progress: ProgressFiltersSchema,
  dateRange: DateRangeFiltersSchema,
  custom: z.record(z.any()),
});

export const ProgressFiltersSchema = z.object({
  percentageRange: NumberRangeSchema,
  completionStatus: z.enum(['not-started', 'in-progress', 'completed', 'overdue']),
  trend: z.enum(['increasing', 'decreasing', 'stable', 'volatile']),
  estimatedCompletionRange: DateRangeSchema.optional(),
});

export const DateRangeFiltersSchema = z.object({
  created: DateRangeSchema.optional(),
  updated: DateRangeSchema.optional(),
  completed: DateRangeSchema.optional(),
});

export const NumberRangeSchema = z.object({
  min: z.number().min(0).max(100),
  max: z.number().min(0).max(100),
}).refine(data => data.min <= data.max, 'Min must be less than or equal to max');

export const DateRangeSchema = z.object({
  start: z.date(),
  end: z.date(),
}).refine(data => data.start <= data.end, 'Start date must be before end date');

export const SearchSortSchema = z.object({
  field: z.enum(['relevance', 'title', 'created', 'updated', 'progress', 'priority', 'type', 'status']),
  direction: z.enum(['asc', 'desc']),
  secondary: z.object({
    field: z.enum(['relevance', 'title', 'created', 'updated', 'progress', 'priority', 'type', 'status']),
    direction: z.enum(['asc', 'desc']),
  }).optional(),
});

export const SearchPaginationSchema = z.object({
  page: z.number().min(1),
  pageSize: z.number().min(1).max(100),
  totalItems: z.number().min(0),
  totalPages: z.number().min(0),
  cursor: z.string().optional(),
});

export const SearchUIStateSchema = z.object({
  isSearchFocused: z.boolean(),
  isFilterPanelOpen: z.boolean(),
  loading: z.object({
    search: z.boolean(),
    filters: z.boolean(),
    results: z.boolean(),
  }),
  viewMode: z.enum(['list', 'grid']),
  activePresetId: z.string().optional(),
});

export const FilterPresetSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  filters: GoalFiltersSchema,
  sort: SearchSortSchema,
  createdAt: z.date(),
  lastUsedAt: z.date(),
  usageCount: z.number().min(0),
  isDefault: z.boolean(),
  isSystem: z.boolean(),
});
```

## Performance Benchmarks

### Search Performance Targets
- **Query processing**: < 50ms for 10K goals
- **Index lookup**: < 20ms average
- **Relevance scoring**: < 30ms for 1K results
- **Result highlighting**: < 10ms for 100 results

### Filter Performance Targets
- **Simple filter application**: < 10ms
- **Complex filter combination**: < 50ms
- **Cache hit**: < 5ms
- **Cache miss computation**: < 100ms

### Index Performance Targets
- **Index build time**: < 5 seconds for 10K goals
- **Index size**: < 10MB for 10K goals
- **Index update time**: < 100ms per goal change
- **Memory usage**: < 50MB during indexing

### Cache Performance Targets
- **Cache hit rate**: > 80% for common filters
- **Cache size**: < 100MB for active cache
- **Cache invalidation**: < 50ms
- **Cache warmup**: < 2 seconds
