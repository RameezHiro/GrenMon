import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const entry of ['index.html', 'styles.css', 'src', 'public']) {
  await cp(resolve(root, entry), resolve(dist, entry), { recursive: true });
}

console.log(`Built static game into ${dist}`);
