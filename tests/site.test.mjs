import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');

test('all seven CV sections occur in the planned reading order', () => {
  const ids = [...html.matchAll(/<(?:section|footer)\b[^>]*\bid="([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(ids, ['about', 'education', 'work', 'skills', 'projects', 'outside', 'contact']);
});

test('local resources and anchor destinations resolve', () => {
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
  for (const [, url] of html.matchAll(/\b(?:href|src|poster)="([^"]+)"/g)) {
    if (url.startsWith('#')) assert.ok(ids.has(url.slice(1)), `Missing anchor ${url}`);
    else if (!/^(?:https?:|mailto:|tel:|data:)/.test(url)) {
      assert.ok(existsSync(resolve(root, decodeURIComponent(url))), `Missing asset ${url}`);
    }
  }
});

test('all eight projects are readable through native disclosures', () => {
  assert.equal((html.match(/<details\b/g) || []).length, 8);
  assert.equal((html.match(/<summary\b/g) || []).length, 8);
});
