// Fails if any color literal appears outside src/styles/theme.css.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname, normalize } from 'node:path';

const ALLOWED = normalize('src/styles/theme.css');
const EXTS = new Set(['.ts', '.tsx', '.css', '.html']);
const COLOR =
  /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\(|-\[#|-\[(?:rgb|hsl)/;

const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (EXTS.has(extname(p))) files.push(p);
  }
})('src');
files.push('index.html');

let bad = 0;
for (const f of files) {
  if (normalize(f) === ALLOWED) continue;
  readFileSync(f, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      if (COLOR.test(line)) {
        console.error(`${f}:${i + 1}: color outside theme.css: ${line.trim()}`);
        bad++;
      }
    });
}
if (bad) process.exit(1);
console.log('palette ok');
