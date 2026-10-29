import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Every skill must stand alone. `npx skills` installs one skill folder at a time,
// and only Claude Code expands ${CLAUDE_PLUGIN_ROOT}. So root references/ is the
// source, and each skill that cites references/ carries a byte-identical copy.

// The copies cite each other («같은 폴더의 `evidence-ladder.md`»), so a skill gets all of them.
const sourceFiles = (root) => readdirSync(path.join(root, 'references')).filter((f) => f.endsWith('.md'));

// `plugins/pstack/skills/how/references/...` in a provenance line is an upstream path, not a citation.
const citation = /(?<![\w/])references\//;

const citesReferences = (dir) => readdirSync(dir).some((entry) => {
  const full = path.join(dir, entry);
  if (statSync(full).isDirectory()) return entry !== 'references' && citesReferences(full);
  return entry.endsWith('.md') && citation.test(readFileSync(full, 'utf8'));
});

export function consumers(root) {
  const skillsDir = path.join(root, 'skills');
  return readdirSync(skillsDir).filter((name) => citesReferences(path.join(skillsDir, name)));
}

// Copies that are missing, differ from the source, or no longer have a source.
export function findDrift(root) {
  const files = sourceFiles(root);
  return consumers(root).flatMap((name) => {
    const target = path.join(root, 'skills', name, 'references');
    const have = existsSync(target) ? readdirSync(target) : [];
    const stale = files.filter((f) => !have.includes(f)
      || !readFileSync(path.join(target, f)).equals(readFileSync(path.join(root, 'references', f))));
    const orphaned = have.filter((f) => !files.includes(f));
    return [...stale, ...orphaned].map((f) => path.join('skills', name, 'references', f));
  });
}

export function syncRefs(root) {
  const files = sourceFiles(root);
  for (const name of consumers(root)) {
    const target = path.join(root, 'skills', name, 'references');
    mkdirSync(target, { recursive: true });
    for (const f of readdirSync(target)) {
      if (!files.includes(f)) rmSync(path.join(target, f));
    }
    for (const f of files) {
      writeFileSync(path.join(target, f), readFileSync(path.join(root, 'references', f)));
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  if (process.argv.includes('--check')) {
    const drift = findDrift(root);
    for (const file of drift) console.log(`${file.split(path.sep).join('/')}: out of sync with references/`);
    process.exit(drift.length ? 1 : 0);
  }
  syncRefs(root);
}
