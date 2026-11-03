import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { checkVersion, validateVersion } from './check-version.js';

const manifest = { version: '0.2.2', lockVersion: '0.2.2', rootLockVersion: '0.2.2' };

test('maintenance accepts the published version without consulting remote tags', () => {
  assert.equal(
    checkVersion(manifest, () => {
      throw new Error('Remote must not be called');
    }),
    '0.2.2'
  );
});

test('validates stable, prerelease and build metadata versions', () => {
  for (const version of ['0.2.2', '1.0.0-rc.0', '1.0.0-rc.10+build.01', '0.0.0', '1.0.0-alpha-beta']) {
    assert.equal(validateVersion(version), version);
  }
});

test('rejects invalid SemVer including leading zeroes and empty identifiers', () => {
  for (const version of [
    'v0.2.2',
    '1.2',
    '01.2.3',
    '1.02.3',
    '1.2.03',
    '1.2.3-01',
    '1.2.3-',
    '1.2.3+',
    '1.2.3-a..b',
    '1.2.3+a..b',
    '1.2.3+foo+bar',
    '1.2.3 rc',
    '',
    null,
  ]) {
    assert.throws(() => validateVersion(version));
  }
});

test('rejects an inconsistent lockfile', () => {
  assert.throws(() => checkVersion({ ...manifest, lockVersion: '0.2.1' }), /must match/);
  assert.throws(() => checkVersion({ ...manifest, rootLockVersion: undefined }), /must match/);
});

test('new release rejects both lightweight and annotated existing tags', () => {
  for (const ref of ['refs/tags/v0.2.2', 'refs/tags/v0.2.2^{}']) {
    assert.throws(() => checkVersion({ ...manifest, mode: 'release' }, () => `abc123\t${ref}\n`), /already exists/);
  }
});

test('new release accepts an absent tag and does not confuse similar versions', () => {
  for (const tags of ['', 'abc123\trefs/tags/v0.2.20\n']) {
    assert.equal(
      checkVersion({ ...manifest, mode: 'release' }, () => tags),
      '0.2.2'
    );
  }
});

test('remote lookup failure stops release preparation', () => {
  assert.throws(
    () =>
      checkVersion({ ...manifest, mode: 'release' }, () => {
        throw new Error('Network unavailable');
      }),
    /Network unavailable/
  );
});

test('tag-triggered release requires exact agreement with the manifest', () => {
  assert.equal(checkVersion({ ...manifest, mode: 'tag', tag: 'v0.2.2' }), '0.2.2');
  assert.throws(() => checkVersion({ ...manifest, mode: 'tag', tag: 'v0.2.3' }), /does not match/);
  assert.throws(() => checkVersion({ ...manifest, mode: 'tag', tag: '0.2.2' }), /does not match/);
});

test('rejects unknown modes rather than bypassing release checks', () => {
  assert.throws(() => checkVersion({ ...manifest, mode: 'unknown' }), /Unknown/);
});

test('the CLI reads manifests and returns failure for an invalid package', () => {
  const directory = mkdtempSync(join(tmpdir(), 'momentum-version-'));
  const script = fileURLToPath(new URL('./check-version.js', import.meta.url));
  try {
    writeFileSync(join(directory, 'package.json'), JSON.stringify({ version: '0.2.2' }));
    writeFileSync(
      join(directory, 'package-lock.json'),
      JSON.stringify({ version: '0.2.2', packages: { '': { version: '0.2.2' } } })
    );
    assert.match(
      execFileSync(process.execPath, [script, 'maintenance'], { cwd: directory, encoding: 'utf8' }),
      /passed/
    );
    writeFileSync(join(directory, 'package.json'), JSON.stringify({ version: '01.2.2' }));
    assert.throws(
      () => execFileSync(process.execPath, [script, 'maintenance'], { cwd: directory, stdio: 'pipe' }),
      (error) => {
        assert.equal(error.status, 1);
        assert.match(error.stderr.toString(), /Invalid SemVer/);
        return true;
      }
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
