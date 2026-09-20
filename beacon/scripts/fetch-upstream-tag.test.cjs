// Maintenance-tool tests; all Git repositories below are disposable local fixtures.
const assert = require('node:assert/strict');
const { execFileSync, spawnSync } = require('node:child_process');
const { mkdtempSync, rmSync } = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');

const script = path.join(__dirname, 'fetch-upstream-tag.sh');
const env = {
  ...process.env,
  GIT_CONFIG_GLOBAL: '/dev/null',
  GIT_CONFIG_NOSYSTEM: '1',
  GIT_AUTHOR_NAME: 'Beacon fixture',
  GIT_AUTHOR_EMAIL: 'fixture@example.invalid',
  GIT_COMMITTER_NAME: 'Beacon fixture',
  GIT_COMMITTER_EMAIL: 'fixture@example.invalid',
};
function git(cwd, ...args) {
  return execFileSync('git', args, { cwd, env, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
}
function fixture(t) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'beacon-tag-test-'));
  const source = path.join(root, 'source.git');
  const local = path.join(root, 'local');
  t.after(() => {
    try {
      assert.equal(git(local, 'for-each-ref', '--format=%(refname)', 'refs/beacon-fetch/'), '');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
  git(root, 'init', '--bare', source);
  git(root, 'init', local);
  const tree = git(source, 'mktree');
  const first = git(source, 'commit-tree', tree, '-m', 'first');
  const second = git(source, 'commit-tree', tree, '-p', first, '-m', 'second');
  git(source, 'tag', 'v1.0.0', first);
  git(local, 'remote', 'add', 'upstream', source);
  // Deliberately retain the old unsafe mapping to verify --refmap= bypasses it.
  git(local, 'config', '--add', 'remote.upstream.fetch', 'refs/tags/*:refs/upstream-tags/*');
  const run = (tag, sha) => spawnSync('bash', [script, tag, sha], { cwd: local, env, encoding: 'utf8' });
  return { source, local, first, second, run };
}

test('fetch is pinned, idempotent and does not populate ordinary tags', t => {
  const f = fixture(t);
  assert.equal(f.run('v1.0.0', f.first).status, 0);
  assert.equal(f.run('v1.0.0', f.first).status, 0);
  assert.equal(git(f.local, 'rev-parse', 'refs/upstream-tags/v1.0.0'), f.first);
  assert.equal(git(f.local, 'tag', '--list'), '');
});

test('wrong expected SHA does not adopt the fetched tag', t => {
  const f = fixture(t);
  assert.notEqual(f.run('v1.0.0', f.second).status, 0);
  assert.equal(git(f.local, 'for-each-ref', '--format=%(refname)', 'refs/upstream-tags/'), '');
});

test('retagging is rejected even if the caller supplies the new commit', t => {
  const f = fixture(t);
  assert.equal(f.run('v1.0.0', f.first).status, 0);
  git(f.source, 'tag', '-f', 'v1.0.0', f.second);
  assert.notEqual(f.run('v1.0.0', f.second).status, 0);
  assert.equal(git(f.local, 'rev-parse', 'refs/upstream-tags/v1.0.0'), f.first);
});

test('annotated tag object changes are detected even with the same commit', t => {
  const f = fixture(t);
  git(f.source, 'tag', '-a', '-f', 'v1.0.0', f.first, '-m', 'original');
  assert.equal(f.run('v1.0.0', f.first).status, 0);
  const old = git(f.local, 'rev-parse', 'refs/upstream-tags/v1.0.0');
  git(f.source, 'tag', '-a', '-f', 'v1.0.0', f.first, '-m', 'rewritten');
  assert.notEqual(f.run('v1.0.0', f.first).status, 0);
  assert.equal(git(f.local, 'rev-parse', 'refs/upstream-tags/v1.0.0'), old);
});

test('missing tag and malformed inputs fail without adopting a reference', t => {
  const f = fixture(t);
  for (const [tag, sha] of [['v9.9.9', f.first], ['--all', f.first], ['v1.0.0', 'HEAD']]) {
    assert.notEqual(f.run(tag, sha).status, 0);
  }
  assert.equal(git(f.local, 'for-each-ref', '--format=%(refname)', 'refs/upstream-tags/'), '');
});
