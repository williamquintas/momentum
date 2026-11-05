import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { checkGitflow } from './check-gitflow.js';

function payload(source, target, overrides = {}) {
  return {
    repository: { id: 123 },
    pull_request: {
      head: { ref: source, repo: { id: 123 } },
      base: { ref: target, repo: { id: 123 } },
      user: { login: 'maintainer', type: 'User' },
      ...overrides,
    },
  };
}

for (const [source, target, route] of [
  ['feature/beta-committees', 'develop', 'maintenance'],
  ['fix/backup', 'develop', 'maintenance'],
  ['release/0.3.1', 'main', 'release'],
  ['main', 'develop', 'synchronize-main'],
]) {
  test(`accepts ${source} -> ${target}`, () => {
    assert.equal(checkGitflow(payload(source, target)), route);
  });
}

for (const [source, target] of [
  ['develop', 'main'],
  ['feature/dashboard', 'main'],
  ['fix/security', 'main'],
  ['release/0.3.1', 'develop'],
  ['feature/', 'develop'],
  ['main', 'main'],
  ['feature/dashboard', 'other'],
]) {
  test(`rejects ${source} -> ${target}`, () => {
    assert.throws(() => checkGitflow(payload(source, target)), /Invalid Gitflow/);
  });
}

test('rejects a fork spoofing main synchronization or a release', () => {
  for (const [source, target] of [
    ['main', 'develop'],
    ['release/0.3.1', 'main'],
  ]) {
    assert.throws(
      () => checkGitflow(payload(source, target, { head: { ref: source, repo: { id: 456 } } })),
      /Invalid Gitflow/
    );
  }
});

test('allows fork feature and fix contributions to develop', () => {
  for (const source of ['feature/dashboard', 'fix/backup']) {
    assert.equal(checkGitflow(payload(source, 'develop', { head: { ref: source, repo: { id: 456 } } })), 'maintenance');
  }
});

test('rejects missing/deleted repository identity and a mismatched base', () => {
  for (const event of [
    {},
    { repository: { id: undefined }, pull_request: payload('main', 'develop').pull_request },
    payload('main', 'develop', { head: { ref: 'main', repo: null } }),
    payload('main', 'develop', { base: { ref: 'develop', repo: { id: 456 } } }),
  ]) {
    assert.throws(() => checkGitflow(event), /repository identities/);
  }
});

test('accepts real Dependabot maintenance and configured npm security lane', () => {
  const user = { login: 'dependabot[bot]', type: 'Bot' };
  assert.equal(
    checkGitflow(payload('dependabot/github_actions/actions/checkout-6', 'develop', { user })),
    'dependabot-maintenance'
  );
  assert.equal(checkGitflow(payload('dependabot/npm_and_yarn/axios-1', 'main', { user })), 'dependabot-security-lane');
});

test('rejects fake bot identities and unsupported Dependabot main routes', () => {
  for (const [source, user] of [
    ['dependabot/npm_and_yarn/axios-1', { login: 'maintainer', type: 'User' }],
    ['dependabot/npm_and_yarn/axios-1', { login: 'dependabot[bot]', type: 'User' }],
    ['dependabot/github_actions/checkout-6', { login: 'dependabot[bot]', type: 'Bot' }],
    ['dependabot/npm_and_yarn/', { login: 'dependabot[bot]', type: 'Bot' }],
  ]) {
    assert.throws(() => checkGitflow(payload(source, 'main', { user })), /Invalid Gitflow/);
  }
});

test('CLI reads the event file safely and rejects wrong events and malformed payloads', () => {
  const directory = mkdtempSync(join(tmpdir(), 'momentum-gitflow-'));
  const eventPath = join(directory, 'pull request.json');
  const script = fileURLToPath(new URL('./check-gitflow.js', import.meta.url));
  const invoke = (name) =>
    spawnSync(process.execPath, [script], {
      env: { ...process.env, GITHUB_EVENT_NAME: name, GITHUB_EVENT_PATH: eventPath },
      encoding: 'utf8',
    });
  try {
    writeFileSync(eventPath, JSON.stringify(payload('feature/beta-committees', 'develop')));
    assert.equal(invoke('pull_request').status, 0);
    assert.equal(invoke('pull_request_target').status, 1);
    writeFileSync(eventPath, JSON.stringify(payload('$(echo malicious)', 'main')));
    assert.equal(invoke('pull_request').status, 1);
    writeFileSync(eventPath, '{invalid');
    assert.equal(invoke('pull_request').status, 1);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('trusted workflow bootstrap agrees with the guard during first adoption and release', () => {
  const workflow = readFileSync(new URL('../.github/workflows/gitflow.yml', import.meta.url), 'utf8');
  const match = workflow.match(/<<'NODE'\r?\n([\s\S]+?)\r?\n\s+NODE/);
  assert.ok(match, 'bootstrap is present in the workflow');
  const source = match[1].replace(/^ {10}/gm, '');
  const directory = mkdtempSync(join(tmpdir(), 'momentum-gitflow-bootstrap-'));
  const eventPath = join(directory, 'event.json');
  const bot = { login: 'dependabot[bot]', type: 'Bot' };
  const events = [
    payload('feature/beta-committees', 'develop'),
    payload('release/0.3.1', 'main'),
    payload('main', 'develop'),
    payload('dependabot/npm_and_yarn/axios-1', 'main', { user: bot }),
    payload('dependabot/github_actions/checkout-6', 'develop', { user: bot }),
    payload('feature/contribution', 'develop', {
      head: { ref: 'feature/contribution', repo: { id: 456 } },
    }),
    payload('main', 'develop', { head: { ref: 'main', repo: { id: 456 } } }),
    payload('release/fork', 'main', { head: { ref: 'release/fork', repo: { id: 456 } } }),
    payload('develop', 'main'),
    payload('dependabot/npm_and_yarn/axios-1', 'main'),
    {},
  ];
  try {
    for (const event of events) {
      let expectedStatus = 0;
      try {
        checkGitflow(event);
      } catch {
        expectedStatus = 1;
      }
      writeFileSync(eventPath, JSON.stringify(event));
      const result = spawnSync(process.execPath, ['--input-type=module', '-e', source], {
        env: { ...process.env, GITHUB_EVENT_NAME: 'pull_request', GITHUB_EVENT_PATH: eventPath },
        encoding: 'utf8',
      });
      assert.equal(result.status, expectedStatus, result.stderr);
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
