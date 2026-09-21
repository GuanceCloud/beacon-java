// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { mkdtempSync, rmSync, existsSync } = require('node:fs');
const { createServer } = require('node:http');
const { tmpdir } = require('node:os');
const { resolve, join } = require('node:path');

async function run(command, args) {
  await new Promise((resolveRun, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', timeout: 60000, killSignal: 'SIGKILL' });
    child.on('error', reject);
    child.on('exit', (code, signal) => code === 0 ? resolveRun() :
      reject(new Error(`${command} exited with ${code}, signal ${signal}`)));
  });
}

async function main() {
  assert(process.argv[2], 'Usage: node beacon/scripts/agent-smoke.cjs <agent.jar>');
  const agent = resolve(process.argv[2]);
  assert(existsSync(agent), `Missing agent: ${agent}`);
  const directory = mkdtempSync(join(tmpdir(), 'beacon-smoke-'));
  const exports = [];
  let traceparent;
  const server = createServer((request, response) => {
    if (request.url === '/beacon-smoke') {
      traceparent = request.headers.traceparent;
      response.end('ok');
    } else if (request.url === '/v1/traces' && request.method === 'POST') {
      const chunks = [];
      request.on('data', (chunk) => chunks.push(chunk));
      request.on('end', () => {
        exports.push({ type: request.headers['content-type'], body: Buffer.concat(chunks) });
        response.writeHead(200, { 'Content-Type': 'application/x-protobuf' });
        response.end();
      });
    } else {
      response.writeHead(404).end();
    }
  });
  try {
    await new Promise((resolveListen, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolveListen);
    });
    const endpoint = `http://127.0.0.1:${server.address().port}`;
    await run('javac', ['-d', directory, join(__dirname, 'fixtures/BeaconSmoke.java')]);
    await run('java', [
      `-javaagent:${agent}`, '-Dotel.service.name=beacon-ci-smoke',
      '-Dotel.traces.exporter=otlp', '-Dotel.metrics.exporter=none', '-Dotel.logs.exporter=none',
      '-Dotel.traces.sampler=always_on', '-Dotel.propagators=tracecontext',
      '-Dotel.exporter.otlp.protocol=http/protobuf', '-Dotel.exporter.otlp.compression=none',
      `-Dotel.exporter.otlp.traces.endpoint=${endpoint}/v1/traces`,
      '-Dotel.bsp.schedule.delay=100', '-cp', directory, 'BeaconSmoke', `${endpoint}/beacon-smoke`,
    ]);
    assert.match(traceparent || '', /^00-[0-9a-f]{32}-[0-9a-f]{16}-[0-9a-f]{2}$/);
    assert.equal(parseInt(traceparent.split('-')[3], 16) & 1, 1, 'Trace must be sampled');
    const traceId = Buffer.from(traceparent.split('-')[1], 'hex');
    assert(exports.some(({ type, body }) => type === 'application/x-protobuf' &&
      body.includes(traceId) && body.includes(Buffer.from('beacon-ci-smoke')) &&
      body.includes(Buffer.from('/beacon-smoke'))), 'Missing correlated HTTP span in OTLP export');
    console.log('PASS: packaged Agent starts, instruments HTTP, propagates context and exports OTLP traces.');
  } finally {
    server.closeAllConnections();
    await new Promise((done) => server.close(done));
    rmSync(directory, { recursive: true, force: true });
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
