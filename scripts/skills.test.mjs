import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skillsDir = path.join(root, 'skills');
const skills = existsSync(skillsDir) ? readdirSync(skillsDir) : [];

const frontmatter = (text) => {
  const match = text.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return null;
  return Object.fromEntries(
    match[1].split('\n').filter((l) => /^[\w-]+:/.test(l)).map((l) => {
      const at = l.indexOf(':');
      return [l.slice(0, at), l.slice(at + 1).trim().replace(/^["']|["']$/g, '')];
    }),
  );
};

for (const name of skills) {
  const file = path.join(skillsDir, name, 'SKILL.md');

  test(`${name}: SKILL.md frontmatter names the folder and has a description`, () => {
    assert.ok(existsSync(file), 'SKILL.md is missing');
    const fm = frontmatter(readFileSync(file, 'utf8'));
    assert.ok(fm, 'frontmatter is missing');
    assert.equal(fm.name, name);
    assert.match(name, /^[a-z0-9]+(-[a-z0-9]+)*$/);
    assert.ok(fm.description, 'description is empty');
    // Agent Skills allows 1024 characters; Codex is reported to cut off at 500.
    assert.ok([...fm.description].length <= 500, `description is ${[...fm.description].length} characters`);
  });

  // Only Claude Code expands ${CLAUDE_PLUGIN_ROOT}, and `npx skills` installs one skill folder
  // at a time, so every path a skill cites must resolve inside its own folder.
  test(`${name}: cites no path outside its own folder`, () => {
    const dir = path.join(skillsDir, name);
    for (const rel of readdirSync(dir, { recursive: true }).filter((f) => f.endsWith('.md'))) {
      const text = readFileSync(path.join(dir, rel), 'utf8');
      assert.ok(!text.includes('${CLAUDE_PLUGIN_ROOT}'), `${rel} uses \${CLAUDE_PLUGIN_ROOT}`);
      if (rel.startsWith('references')) continue;
      // `plugins/pstack/skills/how/references/...` in a provenance line is an upstream path.
      for (const [, cited] of text.matchAll(/(?<![\w/])references\/([\w.-]+\.md)/g)) {
        assert.ok(existsSync(path.join(dir, 'references', cited)), `${rel} cites references/${cited}`);
      }
    }
  });

  test(`${name}: Codex blocks implicit invocation exactly when Claude Code does`, () => {
    const manual = frontmatter(readFileSync(file, 'utf8'))['disable-model-invocation'] === 'true';
    const yaml = path.join(skillsDir, name, 'agents', 'openai.yaml');
    const blocked = existsSync(yaml) && /allow_implicit_invocation:\s*false/.test(readFileSync(yaml, 'utf8'));
    assert.equal(blocked, manual);
  });
}
