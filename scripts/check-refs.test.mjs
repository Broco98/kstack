import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkSkills, findStaleRefs } from './check-refs.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('renamed Matt skills are stale wherever they appear', () => {
  const refs = findStaleRefs('Skill tool로 `code-review`를 부른다.\n/to-spec 다음에');
  assert.deepEqual(refs.map((r) => [r.line, r.name, r.hint]), [
    [1, 'code-review', 'kstack:inspect'],
    [2, 'to-spec', 'kstack:spec'],
  ]);
});

test('same-name skills must carry the kstack: namespace', () => {
  const refs = findStaleRefs('Skill tool로 `tdd`를 부른다. `/pr`을 친다. `kstack:tdd`와 `/kstack:pr`은 괜찮다.');
  assert.deepEqual(refs.map((r) => r.name), ['tdd', 'pr']);
});

test('label values and CLI subcommands that share a skill name are not skill references', () => {
  const text = [
    '라벨: `wayfinder:<type>`(`research`/`prototype`/`grilling`/`task`).',
    '`gh pr ...`과 같은 꼴이되 `pr` 자리에 `mr`을 쓴다.',
  ].join('\n');
  assert.deepEqual(findStaleRefs(text), []);
});

test('namespaced names, provenance lines, and CRLF are fine', () => {
  const text = '`kstack:inspect`를 부른다.\r\n> 원본: mattpocock/skills@59db609 · skills/engineering/code-review/SKILL.md · MIT';
  assert.deepEqual(findStaleRefs(text), []);
});

test('skills/ has no stale references', { skip: !existsSync(path.join(root, 'skills')) }, () => {
  const refs = checkSkills(path.join(root, 'skills'));
  assert.deepEqual(refs.map((r) => `${path.relative(root, r.file)}:${r.line} ${r.name}`), []);
});
