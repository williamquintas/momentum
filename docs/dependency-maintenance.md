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
Keep React 18, Ant Design 5, Router 6, Zod 3, Zustand 4 and TypeScript 5 for this maintenance delivery.

## Version and release policy

Maintenance PRs may retain an already published version. Run `node scripts/check-version.js maintenance` to check strict
SemVer and agreement between the package and both lockfile version fields. Test this policy without installed dependencies
with `node --test scripts/check-version.node-test.js`.

For manual releases, the workflow checks out `main`, prepares the version using `npm version --no-git-tag-version`, then
checks the exact remote tag before generating a changelog, commit or tag. Changelog generation skips bump/commit/tag.
The publication step repeats the collision check, commits the version changes, tags that commit once and pushes the two
refs atomically. A failed remote lookup aborts release preparation; it does not prove a tag is absent. Branch protection can
still reject publication and must not be bypassed.

For releases triggered by an existing tag, the tag must equal `v` plus the package version, including prerelease or build
metadata. The workflow validates that correspondence and builds that checkout without creating another version commit/tag.
Patch, minor, major and `rc` prereleases remain available, with optional changelog generation.

Do not run release commands or dispatch the workflow merely to validate this local maintenance delivery. Inspect workflow
syntax and run the version-policy tests locally; validate the publication behavior only in a separately authorized release.
