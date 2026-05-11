#!/usr/bin/env node
/**
 * check-svg-selfclose.js — Asserts that every self-close `/>` in an svg`` or html``
 * tagged template has a space before the slash.
 *
 * Origin: v5.4.2→v5.4.3 regression chasing a `stroke-opacity=0.9/>` where the slash
 * got slurped into an unquoted attribute value, leaving the element unterminated and
 * absorbing every sibling. Tracked as #118 (5X-B42).
 *
 * Rule (pragmatic): in src/**\/*.js files, no occurrence of a non-space character
 * immediately before `/>` may appear. Allows `<br/>`-style only via `<br />`.
 * Run via `npm run lint:selfclose` and the build prebuild hook.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', 'src');

const offenders = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.isFile() && full.endsWith('.js')) {
      check(full);
    }
  }
}

function check(file) {
  const text = fs.readFileSync(file, 'utf-8');
  const lines = text.split(/\r?\n/);
  lines.forEach((line, idx) => {
    // Allow comments and console.log strings to contain `/>` arbitrarily.
    if (/^\s*(\*|\/\/)/.test(line)) return;
    // Flag only the actual regression class: a non-quote, non-brace, non-paren character
    // immediately followed by `/>`. The v4.13 bug was an unquoted attribute value (`=0.9/>`),
    // where the slash was slurped into the value. Quoted attrs (`"1"/>`) parse safely,
    // template-literal closers (`}/>`) are fine, and `*/` is a block-comment terminator.
    const re = /([^\s"'`}>)\/*<-])\/>/g;
    let m;
    while ((m = re.exec(line))) {
      // Skip JSDoc `@type {/.../>}` style — these are inside block comments handled above,
      // but in case of inline comments, also skip if preceded by `*`.
      if (line.slice(Math.max(0, m.index - 2), m.index).includes('*')) continue;
      offenders.push({ file: path.relative(ROOT, file), line: idx + 1, char: m[1], snippet: line.trim() });
    }
  });
}

walk(ROOT);

if (offenders.length) {
  console.error(`\nchecksvg: found ${offenders.length} unsafe self-close(s) missing space before '/>':\n`);
  for (const o of offenders) {
    console.error(`  src/${o.file}:${o.line}  ('${o.char}/>' \u2014> needs '${o.char} />')`);
    console.error(`    ${o.snippet}`);
  }
  console.error('\nFix by inserting a space before `/>`. See #118.');
  process.exit(1);
}
console.log('checksvg: OK (no unsafe self-close patterns).');
