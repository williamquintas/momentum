---
name: momentum-spec-delivery
description: Refine a Momentum feature or behavior-changing bug into acceptance criteria, an incremental plan and requirement-to-test evidence using existing Spec Kit artifacts.
---

# Specification to delivery

Inputs: user need or bug reproduction, related spec/issue and known constraints.
All paths below are relative to the repository root.

## Procedure

1. Find the existing feature in `specs/GOALS_INDEX.md`, `specs/`, `docs/specs/`
   and affected code before creating a new document. Avoid parallel backlogs.
2. Read relevant sections of `.specify/memory/constitution.md`, templates under
   `.specify/templates/`, ADRs under `.specify/adr/`, and domain rules under
   `docs/business-rules/`. Load only the sources that affect this request.
3. Separate the desired behavior, current behavior, constraints and unresolved
   decisions. Resolve routine implementation choices from evidence; ask only when
   a product or architectural choice would materially change the authorized scope.
4. Define observable acceptance criteria with failure/edge cases. For domain work,
   identify affected goal types, progress/conclusion rules and data compatibility.
   Include UI, accessibility, translation and PWA implications when applicable.
5. Use existing spec/plan/task templates at the established feature location.
   Markdown prompts under `.github/prompts/speckit.*` are routing artifacts, not
   proof their named agents are installed in Codex. Follow the underlying workflow
   directly when the corresponding command is unavailable.
6. Break delivery into independently verifiable changes with paths, dependencies
   and checks. Maintain a compact requirement -> code -> test/evidence mapping.
7. After implementation, reconcile the spec and task status against actual results;
   record deferred or blocked criteria rather than marking unverified work complete.

## Result and boundary

Return or update the requested spec/plan with acceptance criteria, affected paths,
implementation sequence, verification mapping and remaining decisions. Keep ADRs
for durable decisions rather than routine edits.

This skill does not authorize new product scope, external issue creation, major
migrations or release publication. Keep task-specific authorization intact and
reuse existing rules instead of copying them into every document.
