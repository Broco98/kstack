import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Matt names that kstack renamed. Any mention inside a kstack skill is a stale reference.
export const RENAMED = {
  'to-spec': 'spec',
  'to-tickets': 'tickets',
  'implement-spec': 'implement',
  'code-review': 'inspect',
  'setup-matt-pocock-skills': 'setup',
  'request-refactor-plan': null,
};

// Translated under the same name. While Matt's copy is installed, the bare name resolves to Matt's.
export const SAME_NAME = [
  'grill-with-docs',
  'grilling',
  'domain-modeling',
  'tdd',
  'pr',
  'improve-codebase-architecture',
  'codebase-design',
  'teach',
  'wait-what',
];

// `/to-spec` is a command; `engineering/to-spec` is a path segment and is left alone.
const renamedPattern = new RegExp(`(?<![\\w:-])(?<!\\w/)(${Object.keys(RENAMED).join('|')})(?![\\w-])`, 'g');
const codeSpanPattern = /`([^`\s]+)`/g;

// Translated files end with a provenance line that names the Matt path on purpose.
const isProvenance = (line) => line.trimStart().startsWith('> 원본:');

// A bare `grilling` can be a label value and a bare `pr` a CLI subcommand.
// Count a bare span as a skill only when the line is talking about skills.
const talksAboutSkills = (line) => /Skill tool|스킬|\bskill\b/i.test(line);

export function findStaleRefs(text) {
  const found = [];
  text.replace(/\r\n/g, '\n').split('\n').forEach((line, i) => {
    if (isProvenance(line)) return;
    for (const [, name] of line.matchAll(renamedPattern)) {
      const to = RENAMED[name];
      found.push({ line: i + 1, name, hint: to ? `kstack:${to}` : 'retired upstream' });
    }
    for (const [, span] of line.matchAll(codeSpanPattern)) {
      const isCommand = span.startsWith('/');
      const name = span.replace(/^\//, '');
      if (SAME_NAME.includes(name) && (isCommand || talksAboutSkills(line))) {
        found.push({ line: i + 1, name, hint: `kstack:${name}` });
      }
    }
  });
  return found;
}

// Attribution files are copied verbatim and never read as instructions.
const isAttribution = (entry) => entry === 'CREDITS.md';

function markdownFiles(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) return markdownFiles(full);
    return entry.endsWith('.md') && !isAttribution(entry) ? [full] : [];
  });
}

export function checkSkills(skillsDir) {
  return markdownFiles(skillsDir).flatMap((file) =>
    findStaleRefs(readFileSync(file, 'utf8')).map((ref) => ({ file, ...ref })),
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const refs = checkSkills(path.join(root, 'skills'));
  for (const { file, line, name, hint } of refs) {
    console.log(`${path.relative(root, file)}:${line}: \`${name}\` -> ${hint}`);
  }
  process.exit(refs.length ? 1 : 0);
}
