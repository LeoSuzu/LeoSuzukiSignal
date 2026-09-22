import { readFile, mkdir, copyFile, writeFile } from 'node:fs/promises';
import { resolve, dirname, sep } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'dist');
const html = await readFile(resolve(root, 'index.html'), 'utf8');
const files = new Set(['index.html', 'style.css', 'script.js']);
for (const [, url] of html.matchAll(/\b(?:src|href|poster)="([^"]+)"/g)) {
  if (/^(?:#|https?:|mailto:|tel:|data:)/.test(url)) continue;
  const path = decodeURIComponent(url);
  if (!resolve(root, path).startsWith(root + sep)) throw new Error(`Invalid asset path: ${path}`);
  files.add(path);
}
// Copy only the public files used by the page, never the legacy asset library.
for (const file of files) {
  const destination = resolve(output, file);
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(resolve(root, file), destination);
}
await writeFile(resolve(output, '.nojekyll'), '');
console.log(`Built dist/ with ${files.size} public files.`);
