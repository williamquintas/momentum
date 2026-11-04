---
name: momentum-dependency-triage
description: Assess existing Momentum dependency or GitHub Actions update PRs and security advisories for compatibility, integration order and required validation.
---

# Dependency triage

Inputs: update PR/advisory, exact head/base revisions and available validation.
All paths below are relative to the repository root.

## Procedure

1. Read `docs/dependency-maintenance.md`, `.github/dependabot.yml` and manifests.
   Inspect the actual PR head/base and overlap; old PR references in prose are
   historical context, not proof of current remote state.
2. Use connected GitHub tools when available for PRs and checks. Verify changeable
   advisory/compatibility claims against primary maintainer documentation. Separate
   direct findings from inference and unknown remote state.
3. Identify runtime/dev scope, peer constraints, lockfile changes and related package
   families. Keep Vitest and TypeScript ESLint families consistent. Treat potentially
   breaking `0.x` minor updates with migration-level scrutiny.
4. Ordinary maintenance targets `develop`; security updates follow the repository's
   default-branch policy and need a backport plan. Keep major migrations separate
   from maintenance and preserve compatible supported major versions unless the
   requested scope explicitly authorizes migration.
5. For an authorized validation run, use the approved personal Node/npm installation
   isolated from corporate configuration. Never enable blocked global npm, use
   corporate npm or bypass an execution block. Follow the full batch sequence in
   the maintenance policy: clean `npm ci`, high-level audit, validate, translations,
   tests in run mode and production build. Record unavailable checks as blocked.
6. Compare checks against the exact update revision. Recommend integration order,
   superseded PR handling and migration work without opening duplicate update PRs.

## Result and boundary

Return a compact recommendation: accept/request changes/defer, compatibility and
security evidence, head/base, validation status, risks and backport requirements.
Keep advisory severity separate from applicability to the app.

Do not merge, close PRs, alter repository settings, weaken audit gates, force peers
or run `npm audit fix --force` as part of triage. Propose changes within the user's
authorization; publishing and major migrations require their own explicit scope.
