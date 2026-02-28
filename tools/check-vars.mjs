#!/usr/bin/env node
// Quick check for unknown template variables in data.js strings
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(__dirname, '..', 'js', 'data.js'), 'utf8');

const known = new Set([
  'designation','culture_speech','zone','loot','npc','weather','obstacle',
  'integrity','energy','hardware','interface','research','directive','glitch',
  'arc_count','sat_health','rand_direction','glitch_event',
  'self','other','other_hp','other_arc','culture_speech_other',
  'creature','vehicle','structure','found_message',
]);

const lines = src.split('\n');
const broken = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // Only check template string lines
  if (!/^\s*'/.test(line)) continue;
  const vars = [...line.matchAll(/\{(\w+)\}/g)].map(m => m[1]);
  for (const v of vars) {
    if (!known.has(v) && !v.startsWith('rand:') && !v.startsWith('s_')) {
      broken.push({ line: i + 1, var: v, text: line.trim().slice(0, 100) });
    }
  }
}

if (broken.length === 0) {
  console.log('No broken variables found!');
} else {
  console.log(`Found ${broken.length} unknown variables:`);
  for (const b of broken) {
    console.log(`  L${b.line}: {${b.var}} in ${b.text}`);
  }
}
