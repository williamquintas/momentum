import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { checkReleaseCommit } from './check-release-commit.js';

test('release commit requires exact existing tag and integration into main', () => {
  const directory = mkdtempSync(join(tmpdir(), 'momentum-release-policy-'));
  const git = (...args) =>
    execFileSync('git', args, { cwd: directory, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  try {
    git('init', '--initial-branch=main');
    git('config', 'user.name', 'Synthetic policy test');
    git('config', 'user.email', 'policy@example.invalid');
    git('-c', 'commit.gpgsign=false', 'commit', '--allow-empty', '-m', 'initial');
    const main = git('rev-parse', 'HEAD');
    git('update-ref', 'refs/remotes/origin/main', main);
    git('tag', 'v1.0.0');
    git('-c', 'tag.gpgsign=false', 'tag', '-a', 'v1.0.0-rc.1', '-m', 'annotated prerelease');
    assert.equal(checkReleaseCommit('v1.0.0', directory), main);
    assert.equal(checkReleaseCommit('v1.0.0-rc.1', directory), main);
    assert.throws(() => checkReleaseCommit('v9.0.0', directory));
    for (const invalid of [undefined, 'main', '--help', 'v1.0.0;echo', 'v01.0.0']) {
      assert.throws(() => checkReleaseCommit(invalid, directory));
    }

    git('checkout', '-b', 'release/unintegrated');
    git('-c', 'commit.gpgsign=false', 'commit', '--allow-empty', '-m', 'candidate');
    git('tag', 'v1.1.0');
    const candidate = git('rev-parse', 'HEAD');
    assert.throws(() => checkReleaseCommit('v1.1.0', directory), /integrated/);
    assert.throws(() => checkReleaseCommit('v1.0.0', directory), /HEAD must equal/);

    git('checkout', 'main');
    git('merge', '--ff-only', 'release/unintegrated');
    git('update-ref', 'refs/remotes/origin/main', 'HEAD');
    assert.equal(checkReleaseCommit('v1.1.0', directory), candidate);

    // An older tag remains publishable after main has advanced.
    git('checkout', '--detach', 'v1.0.0');
    assert.equal(checkReleaseCommit('v1.0.0', directory), main);
    git('update-ref', '-d', 'refs/remotes/origin/main');
    assert.throws(() => checkReleaseCommit('v1.0.0', directory), /integrated/);
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
