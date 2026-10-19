import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootArgIndex = process.argv.indexOf('--root');
const root = resolve(rootArgIndex >= 0 ? process.argv[rootArgIndex + 1] : fileURLToPath(new URL('.', import.meta.url)));
const portArgIndex = process.argv.indexOf('--port');
const port = Number(portArgIndex >= 0 ? process.argv[portArgIndex + 1] : process.env.PORT || 4173);

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

const server = createServer(async (request, response) => {
  const requestPath = decodeURIComponent((request.url || '/').split('?')[0]);
  const normalizedPath = normalize(requestPath).replace(/^([.][.][\\/])+/, '');
  const relativePath = (normalizedPath === '/' || normalizedPath === '\\' ? 'index.html' : normalizedPath).replace(/^[/\\]+/, '');
  const filePath = resolve(root, relativePath);

  if (filePath !== root && !filePath.startsWith(`${root}${sep}`)) {
    response.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Forbidden');
    return;
  }

  try {
    const body = await readFile(filePath);
    response.writeHead(200, {
      'content-type': contentTypes[extname(filePath)] || 'application/octet-stream',
      'cache-control': 'no-cache',
    });
    response.end(body);
  } catch {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`GrenMon could not start because port ${port} is already in use.`);
    console.error(`Stop the existing server or choose another port, for example: npm start -- --port 4174`);
  } else {
    console.error(`GrenMon server error: ${error.message}`);
  }
  process.exitCode = 1;
});

server.listen(port, '0.0.0.0', () => {
  console.log(`GrenMon is running at http://localhost:${port}`);
});
