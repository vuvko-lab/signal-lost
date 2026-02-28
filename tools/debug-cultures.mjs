#!/usr/bin/env node
// Debug: simulate world + vessel creation N times, report faction distribution
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataSource = readFileSync(join(__dirname, '..', 'js', 'data.js'), 'utf8');

function extractArray(name) {
  const re = new RegExp(`export const ${name}\\s*=\\s*(\\{[\\s\\S]*?\\});|export const ${name}\\s*=\\s*(\\[[\\s\\S]*?\\]);`, 'm');
  const match = dataSource.match(re);
  if (!match) return null;
  const raw = match[1] || match[2];
  try { return Function(`"use strict"; return (${raw})`)(); }
  catch { return null; }
}

const CULTURES = extractArray('CULTURES');
const CULTURE_KEYS = Object.keys(CULTURES);
const DIRECTIVES = extractArray('DIRECTIVES');

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

// Replicate createWorld + createVessel logic from game.js
function simulate(vesselCount) {
  // createWorld: factions = all 5 cultures (after recent fix)
  const factions = [...CULTURE_KEYS];
  const vessels = [];

  for (let v = 0; v < vesselCount; v++) {
    let culture;

    if (vessels.length > 0) {
      const anchor = pick(vessels);

      // Count faction representation
      const factionCounts = {};
      for (const f of factions) factionCounts[f] = 0;
      for (const ves of vessels) factionCounts[ves.culture] = (factionCounts[ves.culture] || 0) + 1;

      // Weighted faction pool
      const maxCount = Math.max(...Object.values(factionCounts), 1);
      const factionWeights = factions.map(f => ({
        faction: f,
        weight: maxCount + 1 - (factionCounts[f] || 0),
      }));
      const totalFW = factionWeights.reduce((s, fw) => s + fw.weight, 0);

      function pickWeightedFaction() {
        let r = Math.random() * totalFW;
        for (const fw of factionWeights) {
          r -= fw.weight;
          if (r <= 0) return fw.faction;
        }
        return factionWeights[factionWeights.length - 1].faction;
      }

      const overRepresented = new Set();
      for (const [f, count] of Object.entries(factionCounts)) {
        if (count >= 2) overRepresented.add(f);
      }

      function pickDiverseFaction() {
        let candidate = pickWeightedFaction();
        for (let i = 0; i < 5 && overRepresented.has(candidate); i++) {
          candidate = pickWeightedFaction();
        }
        if (overRepresented.has(candidate)) {
          const available = factions.filter(f => !overRepresented.has(f));
          if (available.length > 0) candidate = pick(available);
        }
        return candidate;
      }

      // Pick link type: location (35%), directive (30%), faction (35%)
      const roll = Math.random();
      if (roll < 0.35) {
        culture = pickDiverseFaction();
      } else if (roll < 0.65) {
        culture = pickDiverseFaction();
      } else {
        // Same faction — copies anchor's culture unless overRepresented
        culture = overRepresented.has(anchor.culture) ? pickDiverseFaction() : anchor.culture;
      }
    } else {
      culture = pick(factions);
    }

    vessels.push({ culture });
  }

  return vessels.map(v => v.culture);
}

// === Run simulation ===
const WORLDS = 10000;
const VESSELS_PER_WORLD = 10;

const cultureAppearance = {};   // how many worlds each culture appears in
const cultureTotalCount = {};   // total vessel count across all worlds
for (const k of CULTURE_KEYS) {
  cultureAppearance[k] = 0;
  cultureTotalCount[k] = 0;
}

let allFivePresent = 0;
let missingCultures = {};  // culture -> times missing
for (const k of CULTURE_KEYS) missingCultures[k] = 0;

// Per-vessel-slot tracking: what culture does vessel #1, #2, etc. get?
const slotCultures = Array.from({ length: VESSELS_PER_WORLD }, () => ({}));

for (let w = 0; w < WORLDS; w++) {
  const cultures = simulate(VESSELS_PER_WORLD);
  const present = new Set(cultures);

  for (const c of present) cultureAppearance[c]++;
  for (const c of cultures) cultureTotalCount[c]++;
  if (present.size === 5) allFivePresent++;
  for (const k of CULTURE_KEYS) {
    if (!present.has(k)) missingCultures[k]++;
  }

  // Track per-slot
  cultures.forEach((c, i) => {
    slotCultures[i][c] = (slotCultures[i][c] || 0) + 1;
  });
}

console.log(`=== CULTURE DISTRIBUTION (${WORLDS} worlds, ${VESSELS_PER_WORLD} vessels each) ===\n`);

console.log('All 5 cultures present:');
const pct5 = (allFivePresent / WORLDS * 100).toFixed(1);
console.log(`  ${allFivePresent}/${WORLDS} worlds (${pct5}%)\n`);

console.log('Culture appearance in worlds (should all be ~100%):');
for (const [k, v] of Object.entries(cultureAppearance)) {
  const pct = (v / WORLDS * 100).toFixed(1);
  const bar = '#'.repeat(Math.round(pct / 2));
  console.log(`  ${k.padEnd(12)} ${pct.padStart(5)}% appeared | ${((missingCultures[k] / WORLDS) * 100).toFixed(1)}% missing ${bar}`);
}

console.log('\nAverage vessels per culture per world:');
for (const [k, v] of Object.entries(cultureTotalCount)) {
  const avg = (v / WORLDS).toFixed(2);
  console.log(`  ${k.padEnd(12)} ${avg} vessels/world`);
}

console.log('\nVessel slot breakdown (what culture each slot gets):');
for (let i = 0; i < VESSELS_PER_WORLD; i++) {
  const entries = Object.entries(slotCultures[i])
    .sort((a, b) => b[1] - a[1])
    .map(([c, n]) => `${c}:${(n / WORLDS * 100).toFixed(0)}%`)
    .join(' ');
  console.log(`  Vessel #${i + 1}: ${entries}`);
}
