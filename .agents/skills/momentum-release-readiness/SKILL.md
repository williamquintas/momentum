---
name: momentum-release-readiness
description: Prepare an evidence-based Momentum release readiness assessment for a specified version and commit without publishing or dispatching a release.
---

# Release readiness

Inputs: intended version, candidate SHA, release mode and available CI evidence.
Paths and commands below are relative to the repository root.

## Procedure

1. Read `docs/dependency-maintenance.md`, `.github/workflows/release.yml`,
   `.github/workflows/ci.yml`, `scripts/check-version.js` and `.versionrc.json`.
   Reuse the existing policy rather than introducing another version mechanism.
2. Identify the candidate commit, branch and dirty state. Check package/lockfile
   agreement with `node scripts/check-version.js maintenance` and policy behavior
   with `node --test scripts/check-version.node-test.js` when runtime is available.
3. Check the exact tag and its target. For an existing tag, validate its match with
   `node scripts/check-version.js tag <tag>`. Remote lookup failures leave tag
   availability unknown; do not interpret them as absence. Inspect the script
   before using release mode because it performs a remote collision check.
4. Inspect CI evidence for the exact candidate, including tests, lint/type checks,
   translations, build and security. Old successful runs do not validate new code.
   Where evidence is missing, apply the existing verification procedure and report
   blocked checks. Local npm must use the approved personal installation isolated
   from corporate configuration, as required by the maintenance policy.
5. Review changelog content, artifact identity and build metadata. For affected
   persistence/PWA changes, include import/export compatibility and update risks.
6. Draft release notes and a recovery plan appropriate to the change. Distinguish
   GitHub Release creation from deployment; confirm the actual deployment mechanism
   and URL instead of assuming `wrangler.jsonc` establishes a live environment.

## Result and boundary

Return version/SHA, ready/not-ready assessment, evidence per check, unresolved
blockers, proposed notes and publication/recovery steps. Mark unknown remote state
explicitly. Keep secrets and real goal data out of reports.

This preparation skill does not run version bump commands, `npm run release`,
create tags, push, dispatch workflows, publish or roll back. Those actions require
separate explicit authorization and must respect branch protection. Stop on a tag
collision or failed remote lookup rather than retrying publication blindly.
