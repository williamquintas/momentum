# Dependency maintenance and releases

## Integration flow

Use Node 24 and the repository lockfile. Local execution requires an approved personal npm installation isolated from
the Meli environment and configuration; do not enable the blocked global npm or use the corporate npm for this project.
GitHub Actions uses its own Node/npm installation from setup-node. Ordinary npm and GitHub Actions updates target `develop`.
Patch/minor npm updates are grouped, with Vitest and TypeScript ESLint families grouped before the general production
and development groups. Major updates remain separate PRs and require migration review; there is no automatic merge.
For `0.x` packages, a minor update can still break compatibility and must receive the same checks.

Security updates target the default branch (`main`). The dedicated npm entry has `open-pull-requests-limit: 0` to disable
ordinary updates on that branch while retaining security updates. Updating the YAML does not enable repository security
settings; confirm generated PRs and settings on GitHub after publication. Preserve the Monday 09:00 UTC schedule.
See the [Dependabot options reference](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference).

For each small dependency batch:

1. Inspect its own head/base, advisories, peer dependencies and overlap with existing PRs.
2. Keep package.json and package-lock.json consistent; never force conflicting peers or suppress the security gate.
3. Run a clean `npm ci`, `npm audit --audit-level=high`, `npm run validate`, `npm run validate:translations`,
   `npm test -- --run` and `npm run build` before acceptance.
4. Backport accepted security updates from `main` into `develop`, retaining newer dependency fixes and integration features.
5. Record exact revisions and local/CI results separately. A closed PR or old successful CI is not current validation.

The update proposed by PR #124 supersedes #117 for React Router 6. Close #117 only after #124 or an equivalent result is
validated and integrated. Replace the mixed-major groups in #93/#129 with small compatible updates and separately reviewed
migrations (React 19, Ant Design 6, Router 7, Zod 4, Zustand 5, TypeScript 7 and other major development-tool migrations).
Keep React 18, Ant Design 5, Router 6, Zustand 4 and TypeScript 5 for this maintenance delivery. Zod 4 is already declared
and resolved in the current manifests; treat the earlier Zod 3 restriction as historical, not a downgrade instruction.

## Version and release policy

Maintenance PRs may retain an already published version. Run `node scripts/check-version.js maintenance` to check strict
SemVer and agreement between the package and both lockfile version fields. Test this policy without installed dependencies
with `node --test scripts/check-version.node-test.js`.

Prepare a release on `release/*` from the reviewed `develop` candidate. Use `npm version <version> --no-git-tag-version
--ignore-scripts` only during authorized release preparation; review package/lockfile changes and update the changelog in
that branch. Run the required checks, `node scripts/check-version.js maintenance` and
`node scripts/check-version.js release` before publication. The latter rejects existing remote version tags and fails closed
when the remote lookup fails. Open a `release/*` -> `main` PR; protected merges require explicit authorization.

After the reviewed commit is integrated into `main`, create and push its exact `v<package-version>` tag only with publication
authorization. Synchronize `main` back to `develop` through its own PR. Do not bump or push `main` using `npm run release`:
that shortcut was removed. Legacy `version:*` commands can create commits/tags and are not validation commands.

The Release workflow accepts a pushed `v*` tag or a manual dispatch naming an **existing** tag. It never creates a version
commit or tag and never pushes a branch. Checkout must equal that tag, match both manifest/lockfile versions and pass
`git merge-base --is-ancestor HEAD origin/main` against freshly fetched main before any project scripts are installed.
`scripts/check-release-commit.js` also verifies the exact tag/HEAD identity and ancestry; its tests use synthetic repositories.
Tags on unintegrated release branches are rejected. The workflow runs clean installation, validation, translations, policy
tests, application tests, audit and build before uploading the validated archive. A separate publish job receives write
permission, verifies that the tag still resolves to the validated SHA and publishes using `gh release create --verify-tag`.
Build metadata uses the checked-out commit, including on manual dispatch. The workflow cannot be used to publish historical
tags that lack these scripts without a separately reviewed compatibility change. A published Release is distinct from deployment.

Do not run release commands or dispatch the workflow merely to validate this local maintenance delivery. Inspect workflow
syntax and run the version-policy tests locally; validate the publication behavior only in a separately authorized release.
