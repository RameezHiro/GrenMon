import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';

const serverPath = fileURLToPath(new URL('../server.mjs', import.meta.url));

function listenOnRandomPort() {
  return new Promise((resolve, reject) => {
    const holder = createServer();
    holder.once('error', reject);
    holder.listen(0, '0.0.0.0', () => resolve({ holder, port: holder.address().port }));
  });
}

function runServer(port) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [serverPath], {
      env: { ...process.env, PORT: String(port) },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.once('error', reject);
    child.once('close', (code, signal) => resolve({ code, signal, stdout, stderr }));
  });
}

test('server reports a recoverable message when its port is already in use', async () => {
  const { holder, port } = await listenOnRandomPort();
  try {
    const result = await runServer(port);
    assert.equal(result.code, 1);
    assert.match(result.stderr, new RegExp(`port ${port} is already in use`));
    assert.match(result.stderr, /npm start -- --port 4174/);
  } finally {
    await new Promise((resolve, reject) => holder.close((error) => error ? reject(error) : resolve()));
  }
});
