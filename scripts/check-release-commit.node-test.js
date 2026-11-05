import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { checkReleaseCommit, runGit } from './check-release-commit.js';

test('release commit requires exact existing tag and integration into main', () => {
  const directory = mkdtempSync(join(tmpdir(), 'momentum-release-policy-'));
  const git = (...args) => runGit(args, directory);
  const setPackageVersion = (version) => writeFileSync(join(directory, 'package.json'), JSON.stringify({ version }));
  try {
    setPackageVersion('1.0.0');
    git('init', '--initial-branch=main');
    git('config', 'user.name', 'Synthetic policy test');
    git('config', 'user.email', 'policy@example.invalid');
    git('-c', 'commit.gpgsign=false', 'commit', '--allow-empty', '-m', 'initial');
    const main = git('rev-parse', 'HEAD');
    git('update-ref', 'refs/remotes/origin/main', main);
    git('-c', 'tag.gpgsign=false', 'tag', 'v1.0.0');
    git('-c', 'tag.gpgsign=false', 'tag', '-a', 'v1.0.0-rc.1', '-m', 'annotated prerelease');
    assert.equal(checkReleaseCommit(directory), main);
    setPackageVersion('1.0.0-rc.1');
    assert.equal(checkReleaseCommit(directory), main);
    setPackageVersion('1.0.0-nested');
    git('-c', 'tag.gpgsign=false', 'tag', '-a', 'inner-tag', '-m', 'inner annotated tag');
    git('-c', 'tag.gpgsign=false', 'tag', '-a', 'v1.0.0-nested', 'inner-tag', '-m', 'outer annotated tag');
    assert.equal(checkReleaseCommit(directory), main);
    setPackageVersion('9.0.0');
    assert.throws(() => checkReleaseCommit(directory));
    setPackageVersion('1;echo');
    assert.throws(() => checkReleaseCommit(directory), /Invalid SemVer/);

    setPackageVersion('1.1.0');
    git('checkout', '-b', 'release/unintegrated');
    git('-c', 'commit.gpgsign=false', 'commit', '--allow-empty', '-m', 'candidate');
    git('-c', 'tag.gpgsign=false', 'tag', 'v1.1.0');
    const candidate = git('rev-parse', 'HEAD');
    assert.throws(() => checkReleaseCommit(directory), /integrated/);
    setPackageVersion('1.0.0');
    assert.throws(() => checkReleaseCommit(directory), /HEAD must equal/);

    setPackageVersion('1.1.0');
    git('checkout', 'main');
    git('merge', '--ff-only', 'release/unintegrated');
    git('update-ref', 'refs/remotes/origin/main', 'HEAD');
    assert.equal(checkReleaseCommit(directory), candidate);

    // An older tag remains publishable after main has advanced.
    setPackageVersion('1.0.0');
    git('checkout', '--detach', 'v1.0.0');
    assert.equal(checkReleaseCommit(directory), main);
    git('update-ref', '-d', 'refs/remotes/origin/main');
    assert.throws(() => checkReleaseCommit(directory), /integrated/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('release workflow cannot bump or push main and publishes only after validation', () => {
  const workflow = readFileSync(new URL('../.github/workflows/release.yml', import.meta.url), 'utf8');
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(pkg.scripts.release, undefined);
  assert.doesNotMatch(workflow, /npm version|git push|git commit|git tag /);
  assert.match(workflow, /git merge-base --is-ancestor HEAD origin\/main/);
  assert.match(workflow, /needs: validate/);
  assert.match(workflow, /--verify-tag/);
  assert.match(workflow, /GITHUB_SHA: \$\{\{ steps\.release\.outputs\.sha \}\}/);
  assert.ok(workflow.includes('node scripts/check-version.js tag "$RELEASE_TAG"'));
  assert.ok(workflow.includes('node scripts/check-release-commit.js\n'));
  for (const check of [
    'npm ci',
    'npm run validate',
    'npm run validate:translations',
    'npm test -- --run',
    'npm audit --audit-level=high',
    'npm run build',
  ]) {
    assert.ok(workflow.includes(check), `${check} is required before publication`);
  }
});
