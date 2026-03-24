# ADR-001: Immutable Progress History

**Date**: 2026-03-24  
**Status**: Accepted  
**Feature**: 004-update-goal-progress  
**Feature Branch**: 017-progress-business-rules

## Context

Goal progress tracking in Momentum requires storing user progress updates to enable:

- Audit trail of all changes
- Analytics on progress patterns
- Undo/redo functionality
- Recalculation of current progress from historical data

The key architectural decision is whether to mutate progress values in place or store each update as an immutable entry.

## Decision

**Choice**: Store all progress updates in an append-only log. Never mutate or delete existing entries.

## Rationale

### Benefits

1. **Audit Trail**: Complete history of all changes with timestamps enables debugging, compliance, and user transparency
2. **Analytics**: Historical data enables progress pattern analysis, trend detection, and reporting
3. **Undo/Redo**: With immutable entries, undo becomes trivial (remove last entry) and redo is possible
4. **Recalculation**: Current progress can always be recomputed from history, enabling data recovery
5. **Concurrency Safety**: Append-only operations are inherently thread-safe, preventing race conditions

### Trade-offs

1. **Storage Growth**: History grows indefinitely; requires periodic archival or cleanup strategy
2. **Recalculation Cost**: Computing current progress from history requires iterating all entries
3. **Query Complexity**: Historical queries require filtering/sorting in application layer

## Consequences

### Positive

- Data loss prevented; any intermediate state can be recovered
- Supports future analytics features (004-progress-history-and-analytics)
- Enables "time travel" to view goal state at any past date

### Negative

- Storage service must implement duplicate detection to prevent accidental double-submission
- Progress cache must be maintained for O(1) current progress lookups
- Archive policy required to manage storage growth

## Implementation Notes

### Required Components

1. **Progress Update Service**: Append-only method that validates, checks duplicates, then persists
2. **Progress Cache**: Maintains current progress value for O(1) reads, invalidated on new entries
3. **Duplicate Detection**: Check for same value + timestamp within 1 minute window
4. **Archive Strategy**: Configurable retention (default: 365 days), periodic cleanup job

### Data Model

```typescript
interface ProgressUpdate {
  id: string;
  goalId: string;
  timestamp: number;
  value: number;
  note?: string;
  createdBy: string;
}

interface ProgressHistory {
  goalId: string;
  updates: ProgressUpdate[];
}
```

### Duplicate Detection Rule

Two updates are considered duplicates if:

- Same goalId
- Same value
- Timestamp difference < 60 seconds

## Alternatives Considered

### 1. Mutate in Place

- **Rejected**: Loses history, no audit trail, no undo capability
- **Risk**: Data loss on bugs or user mistakes

### 2. Versioned Documents

- **Rejected**: Over-engineered for MVP
- **Complexity**: Requires version tracking, conflict resolution

### 3. Time-Series Database

- **Rejected**: Adds infrastructure dependency
- **Alternative**: Can migrate to InfluxDB later if needed

## References

- Constitution §IV: Architecture Decision Records required for major decisions
- Feature spec: `specs/004-update-goal-progress/spec.md`
- Implementation plan: `specs/004-update-goal-progress/plan.md` (Decision 1)
