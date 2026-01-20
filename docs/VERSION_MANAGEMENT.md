# Version Management Guide

This document describes the version management system for Momentum, including automated versioning, release workflows, and CI/CD integration.

## Overview

Momentum uses **Semantic Versioning** (SemVer) following the `MAJOR.MINOR.PATCH` format:

- **MAJOR**: Breaking changes that are not backward compatible
- **MINOR**: New features that are backward compatible
- **PATCH**: Bug fixes that are backward compatible

### Version Format

The system supports the full SemVer 2.0.0 specification:

- **Stable versions**: `1.0.0`, `1.2.3`, `2.0.0`
- **Prerelease versions**: `1.0.0-rc.1`, `1.0.0-alpha.1`, `1.0.0-beta.2`
- **Build metadata**: `1.0.0+20240115`, `1.0.0-rc.1+build.123`

**Examples:**

- `1.0.0` - Stable release
- `1.0.0-rc.1` - Release candidate 1
- `1.0.0-alpha.1` - Alpha release 1
- `1.0.0-beta.2` - Beta release 2
- `1.0.0-rc.1+build.123` - RC 1 with build metadata

## Automated Version Management

### Tools

- **standard-version**: Automatically bumps version, generates changelog, and creates git tags based on conventional commits
- **GitHub Actions**: Automated release workflows for version bumping and GitHub releases

### Version Scripts

The following npm scripts are available for version management:

```bash
# Bump patch version (0.1.0 -> 0.1.1)
npm run version:patch

# Bump minor version (0.1.0 -> 0.2.0)
npm run version:minor

# Bump major version (0.1.0 -> 1.0.0)
npm run version:major

# Create a prerelease version (default: rc)
npm run version:prerelease

# Dry run to see what would change
npm run version:dry-run

# Quick release (patch bump + push)
npm run release
```

## Release Workflow

### Manual Release via GitHub Actions

1. Go to **Actions** → **Release** workflow
2. Click **Run workflow**
3. Select version bump type:
   - **patch**: Bug fixes (0.1.0 → 0.1.1)
   - **minor**: New features (0.1.0 → 0.2.0)
   - **major**: Breaking changes (0.1.0 → 1.0.0)
   - **prerelease**: Pre-release version (0.1.0 → 0.1.1-rc.0)
4. Optionally skip changelog generation
5. Click **Run workflow**

The workflow will:

- Bump the version in `package.json`
- Generate/update `CHANGELOG.md`
- Create a git tag (e.g., `v1.0.0` or `v1.0.0-rc.1`)
- Push changes to the main branch
- Create a GitHub release with release notes (marked as prerelease if applicable)
- Upload build artifacts

**Note**: Prerelease versions (e.g., `1.0.0-rc.1`, `1.0.0-alpha.1`, `1.0.0-beta.1`) are automatically detected and marked as prereleases in GitHub.

### Automated Release via Git Tags

When you push a tag starting with `v` (e.g., `v1.0.0`), the release workflow will:

- Extract version from the tag
- Build the application with version information
- Create a GitHub release
- Upload build artifacts

```bash
# Create and push a tag
git tag v1.0.0
git push origin v1.0.0
```

### Local Release Process

For local releases (requires manual git operations):

```bash
# 1. Bump version and generate changelog
npm run version:patch  # or minor/major

# 2. Review changes
git status
git diff

# 3. Commit and push (standard-version creates a commit)
git push --follow-tags origin main

# Or use the release script
npm run release
```

## Prerelease Versions

The system fully supports prerelease versions following semantic versioning:

- **Release Candidate (RC)**: `1.0.0-rc.1`, `1.0.0-rc.2`, etc.

### Creating Prereleases

**Via GitHub Actions:**

1. Select **prerelease** as version type
2. The workflow will create a prerelease version and mark the GitHub release as a prerelease

**Via Command Line:**

```bash
# Create alpha prerelease
npm run version:prerelease:alpha

# Create beta prerelease
npm run version:prerelease:beta

# Create RC prerelease
npm run version:prerelease:rc

# Generic prerelease (defaults to rc)
npm run version:prerelease
```

**Via Git Tags:**

```bash
# Create and push a prerelease tag
git tag v1.0.0-rc.1
git push origin v1.0.0-rc.1
```

### Prerelease Workflow

1. Start with a base version (e.g., `1.0.0`)
2. Create first RC: `1.0.0-rc.1`
3. Continue with more RCs: `1.0.0-rc.2`, `1.0.0-rc.3`
4. When ready, promote to stable: `1.0.0`

**Note**: When promoting from prerelease to stable, use the appropriate version bump type (patch, minor, or major) based on the changes.

## Conventional Commits

The version management system uses [Conventional Commits](https://www.conventionalcommits.org/) to determine version bumps:

- `feat:` → Minor version bump
- `fix:` → Patch version bump
- `feat!:` or `BREAKING CHANGE:` → Major version bump
- `perf:`, `refactor:`, `docs:`, etc. → No version bump (unless configured)

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Examples:**

```
feat(goals): add progress tracking
fix(api): handle timeout errors
feat(api)!: change authentication method
```

## Version in Application

### Build-Time Version Injection

Version information is automatically injected at build time via Vite:

```typescript
// Available as global constants
console.log(__APP_VERSION__); // e.g., "1.0.0"
console.log(__BUILD_DATE__); // e.g., "2024-01-15T10:30:00.000Z"
console.log(__GIT_SHA__); // e.g., "abc123def456..."
```

### Environment Variables

Version information is also available via environment variables:

```typescript
// Available in production builds
const version = import.meta.env.VITE_APP_VERSION || 'dev';
const buildDate = import.meta.env.VITE_APP_BUILD_DATE;
const gitSha = import.meta.env.VITE_APP_GIT_SHA;
```

### Displaying Version in UI

You can display version information in your application:

```typescript
// Example: Display in footer or about page
const AppVersion = () => {
  const version = __APP_VERSION__ || import.meta.env.VITE_APP_VERSION || 'dev';
  const buildDate = __BUILD_DATE__ || import.meta.env.VITE_APP_BUILD_DATE;

  return (
    <div>
      <p>Version: {version}</p>
      {buildDate && <p>Built: {new Date(buildDate).toLocaleDateString()}</p>}
    </div>
  );
};
```

## CI/CD Integration

### Version Validation

The CI workflow includes automatic version validation:

- ✅ Validates semantic version format
- ✅ Checks version exists in CHANGELOG.md
- ✅ Verifies no conflicting git tags

### Version Check Workflow

A separate workflow (`version-check.yml`) runs on:

- Pull requests to `main` or `develop`
- Pushes to `main` or `develop`

This ensures version consistency before merging.

## CHANGELOG Management

### Automatic Generation

The `standard-version` tool automatically generates changelog entries from commit messages:

1. Analyzes commits since last release
2. Groups changes by type (feat, fix, perf, etc.)
3. Updates `CHANGELOG.md` with new version section
4. Moves `[Unreleased]` changes to the new version

### Manual Updates

You can manually update `CHANGELOG.md` in the `[Unreleased]` section:

```markdown
## [Unreleased]

### Added

- New feature description

### Changed

- Change description

### Fixed

- Bug fix description
```

When you run `npm run version:patch` (or similar), the `[Unreleased]` section will be moved to the new version.

## Release Checklist

Before creating a release:

- [ ] All tests passing
- [ ] Code review completed
- [ ] CHANGELOG.md updated (or use automatic generation)
- [ ] Version number appropriate for changes
- [ ] No breaking changes (or properly documented)
- [ ] Documentation updated if needed
- [ ] Build succeeds locally

## Best Practices

### Version Bumping

1. **Use appropriate version type**:
   - Patch for bug fixes
   - Minor for new features
   - Major for breaking changes

2. **Follow conventional commits**:
   - Use `feat:` for features
   - Use `fix:` for bug fixes
   - Use `feat!:` or `BREAKING CHANGE:` for breaking changes

3. **Review before releasing**:
   - Always review generated changelog
   - Verify version number is correct
   - Check that all changes are documented

### Release Timing

- **Patch releases**: Can be released frequently for bug fixes
- **Minor releases**: Typically released when new features are ready
- **Major releases**: Reserved for significant changes or breaking changes

### Tag Management

- Tags are automatically created by the release workflow
- Use annotated tags: `git tag -a v1.0.0 -m "Release v1.0.0"`
- Never delete or modify tags after they're pushed
- Use semantic versioning for all tags

## Troubleshooting

### Version Already Exists

If you get an error that a version tag already exists:

1. Check existing tags: `git tag -l`
2. Bump to the next appropriate version
3. Or delete the local tag if it was created by mistake: `git tag -d v1.0.0`

### Changelog Not Generated

If the changelog isn't generated:

1. Check that you have commits since the last release
2. Verify commits follow conventional commit format
3. Run `npm run version:dry-run` to see what would happen

### Version Not in Build

If version information isn't available in the build:

1. Check `vite.config.ts` for version injection
2. Verify environment variables are set
3. Rebuild the application: `npm run build`

## Related Documentation

- [Git Workflow](./.cursor/rules/git-workflow.md) - Branching strategy and commit conventions
- [Deployment](./.cursor/rules/deployment.md) - Deployment process and version management
- [Semantic Versioning](https://semver.org/) - Official SemVer specification
- [Conventional Commits](https://www.conventionalcommits.org/) - Commit message conventions
