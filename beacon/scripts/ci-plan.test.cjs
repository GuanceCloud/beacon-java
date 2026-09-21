// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

const assert = require('node:assert/strict');
const { test } = require('node:test');
const { plan } = require('./ci-plan.cjs');

test('ordinary changes keep all four partitions and both instrumentation modes', () => {
  const result = plan(['README.md']);
  assert.equal(result.profile, 'pr');
  assert.deepEqual(result.matrix, { java: [21], indy: [false, true], partition: [0, 1, 2, 3] });
  assert.equal(result.muzzle, false);
});

test('instrumentation changes require Muzzle even without a baseline update', () => {
  assert.equal(plan(['instrumentation/jdbc/library/src/main/Test.java']).muzzle, true);
});

test('baseline, runtime, dependencies and CI changes expand regression', () => {
  for (const file of ['beacon/upstream.lock.json', 'version.gradle.kts', 'settings.gradle.kts',
    'dependencyManagement/build.gradle.kts', 'javaagent-tooling/src/main/Test.java',
    'instrumentation-api/src/main/Test.java', 'conventions/src/Test.kt',
    '.github/workflows/beacon-ci.yml', 'beacon/scripts/ci-plan.cjs',
    'beacon/agent.gradle.kts', 'beacon/version.properties', 'declarative-config-bridge/Test.java']) {
    const result = plan([file]);
    assert.equal(result.profile, 'upgrade', file);
    assert.deepEqual(result.matrix.java, [8, 17, 21]);
    assert.equal(result.muzzle, true);
  }
});

test('missing comparison base fails conservatively to upgrade coverage', () => {
  assert.equal(plan([], false, true).profile, 'upgrade');
});

test('manual full profile covers the expanded JDK matrix', () => {
  const result = plan([], true);
  assert.equal(result.profile, 'full');
  assert.equal(result.full, true);
  assert.equal(result.muzzle, true);
  assert.deepEqual(result.matrix.java, [8, 11, 17, 21, 25, 26]);
});
