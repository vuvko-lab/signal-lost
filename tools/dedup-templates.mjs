#!/usr/bin/env node
// Remove duplicate template strings from js/data.js arrays.
// Normalizes whitespace before comparing. Preserves first occurrence.

import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = join(__dirname, '..', 'js', 'data.js');

const src = readFileSync(dataPath, 'utf8');
const lines = src.split('\n');

const out = [];
const seen = new Set();
let removed = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();

  // Reset seen set at array boundaries (lines starting with ] or containing key: [)
  if (/^\s*\]/.test(line) || /^\s*\w+:\s*\[/.test(line)) {
    seen.clear();
    out.push(line);
    continue;
  }

  // Check if this is a template string line (starts with ' or ")
  if (/^\s*['"]/.test(line)) {
    const normalized = trimmed.replace(/\s+/g, ' ');
    if (seen.has(normalized)) {
      removed++;
      // Also remove trailing comma from previous line if needed
      continue;
    }
    seen.add(normalized);
  }

  out.push(line);
}

if (removed > 0) {
  writeFileSync(dataPath, out.join('\n'));
  console.log(`Removed ${removed} duplicate templates from js/data.js`);
} else {
  console.log('No duplicates found.');
}
