#!/usr/bin/env node
// Worf §16 BLOCKING (5X-F35e v5.7.2): no console.* call inside the medical sources or
// the shared anatomical silhouette may interpolate a value. PHI never leaves the closed
// shadow root, so it must never reach the JS console either.
//
// Rule (deliberately strict): inside the watched files, ANY `console.<method>` that
// contains a template literal (${...}) or string concatenation (+) on the same line is
// rejected. Plain string literals (`console.warn('Medical: consent revoked')`) are OK.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', 'src');
const WATCHED = [
  'lcars-medical-card.js',
  'lcars-medical-utils.js',
  'lcars-anatomical-silhouette.js',
];

let failed = false;
for (const f of WATCHED) {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) continue;
  const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/);
  lines.forEach((line, i) => {
    if (!/\bconsole\.[a-z]+\s*\(/.test(line)) return;
    if (/\$\{/.test(line) || /['"`]\s*\+|\+\s*['"`]/.test(line)) {
      console.error(`PHI lint: ${f}:${i + 1} — console call interpolates a value`);
      console.error(`  > ${line.trim()}`);
      failed = true;
    }
  });
}

if (failed) {
  console.error('\nPHI logging guard failed. Medical sources must not console-log values.');
  process.exit(1);
}
console.log('PHI logging guard: OK');
