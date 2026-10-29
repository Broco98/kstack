import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findDrift, syncRefs } from './sync-refs.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const write = (base, rel, text) => {
  mkdirSync(path.dirname(path.join(base, rel)), { recursive: true });
  writeFileSync(path.join(base, rel), text);
};

test('only skills that cite references/ get copies, and orphans are removed', () => {
  const fake = mkdtempSync(path.join(tmpdir(), 'kstack-sync-'));
  try {
    write(fake, 'references/door.md', 'door\n');
    write(fake, 'skills/inspect/SKILL.md', '`references/door.md`로 판정한다.\n');
    write(fake, 'skills/inspect/references/retired.md', 'old\n');
    write(fake, 'skills/grilling/SKILL.md', '참조 없음\n');

    const rel = (p) => p.split(path.sep).join('/');
    assert.deepEqual(findDrift(fake).map(rel).sort(), [
      'skills/inspect/references/door.md',
      'skills/inspect/references/retired.md',
    ]);

    syncRefs(fake);
    assert.deepEqual(findDrift(fake), []);
    assert.equal(readFileSync(path.join(fake, 'skills/inspect/references/door.md'), 'utf8'), 'door\n');
    assert.ok(!existsSync(path.join(fake, 'skills/grilling/references')));
  } finally {
    rmSync(fake, { recursive: true, force: true });
  }
});

test('skill copies match references/ (run `node scripts/sync-refs.mjs` after editing it)', () => {
  assert.deepEqual(findDrift(root), []);
});
