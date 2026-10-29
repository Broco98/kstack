import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (rel) => JSON.parse(readFileSync(path.join(root, rel), 'utf8'));

const plugin = readJson('.claude-plugin/plugin.json');
const marketplace = readJson('.claude-plugin/marketplace.json');

test('marketplace lists exactly the kstack plugin', () => {
  assert.equal(plugin.name, 'kstack');
  assert.equal(marketplace.name, 'kstack');
  assert.deepEqual(marketplace.plugins.map((p) => p.name), ['kstack']);
});

// A version string pins every install until it changes; leaving it out follows commits.
test('plugin.json has no version', () => {
  assert.equal(plugin.version, undefined);
});

test('plugin sources are ./ paths with forward slashes', () => {
  for (const { name, source } of marketplace.plugins) {
    assert.match(source, /^\.\//, name);
    assert.ok(!source.includes('\\') && !source.includes('..'), `${name}: ${source}`);
  }
});
