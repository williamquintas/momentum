---
name: momentum-context
description: Map Momentum task scope, applicable rules, current code and verification needs when starting or resuming repository work.
---

# Context and impact

Inputs: the requested outcome, relevant issue/spec and base revision when known.
Work from the repository root; paths below are repository-relative.

## Procedure

1. Record `git rev-parse HEAD`, branch and `git status --short`. Preserve unrelated
   edits, including a missing lockfile; do not restore or regenerate it implicitly.
2. Read `AGENTS.md` and the relevant parts of `package.json`. Treat manifest ranges
   as declared versions, not proof of installed versions or deployed behavior.
3. Locate affected code with `rg`. Follow the actual path from page/component to
   hook, `src/services/api/goalService.ts` and storage when applicable. Goals are
   currently stored locally; do not invent backend requirements.
4. Read only pertinent `.ai-assistant/rules/`, `specs/`, `.specify/adr/` and business
   rules in `docs/`. Distinguish implemented behavior from proposed specifications.
5. Map effects on schemas/types, six goal types, progress history, persistence,
   translations, UI and tests. Surface conflicting product rules with evidence.
6. Select checks from existing scripts and relevant tests. For local npm execution,
   apply `docs/dependency-maintenance.md`: approved personal installation, isolated
   from corporate configuration; never enable blocked global npm or bypass policy.

## Result

Return a compact brief containing:

- Revision and relevant dirty state.
- Acceptance criteria and affected paths.
- Applicable rules, unresolved decisions and material risks.
- Proposed checks and environment prerequisites.

Do not load the entire `.opencode` catalog or all specs. Reuse existing guidance
instead of building a second planning system. This skill is read-only; the brief
does not authorize publication, dependency installation or unrelated changes.
