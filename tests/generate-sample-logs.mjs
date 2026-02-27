#!/usr/bin/env node
// === SIGNAL LOST — SAMPLE LOG GENERATOR ===
// Generates sample log output for each faction, suitable for LLM review.
// Run: node tests/generate-sample-logs.mjs [--entries 30] [--output logs.txt]

// === MOCKS ===
let simTime = 0;
Date.now = () => simTime;

globalThis.localStorage = {
  _store: {},
  getItem(k) { return this._store[k] ?? null; },
  setItem(k, v) { this._store[k] = String(v); },
  removeItem(k) { delete this._store[k]; },
  clear() { this._store = {}; },
};

// === IMPORTS ===
import { writeFileSync } from 'fs';
import { CULTURE_KEYS, CULTURES, randInt } from '../js/data.js';
import {
  createWorld, createVessel, tick, checkGlobalEvent, checkSatDecay,
  getState, setCallbacks, clearSave,
} from '../js/game.js';

// === CLI ARGS ===
const args = process.argv.slice(2);
function getArg(name, def) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : def;
}

const MAX_ENTRIES = Number(getArg('entries', '40'));
const OUTPUT_FILE = getArg('output', null);

// === GENERATE LOGS PER FACTION ===

function generateFactionLog(targetCulture) {
  localStorage.clear();
  clearSave();
  simTime = 1000000000000;
  const simStart = simTime;

  const logs = [];

  setCallbacks({
    onLog: (vesselId, entry) => {
      const state = getState();
      const v = state.vessels.find(v => v.id === vesselId);
      if (v && v.culture === targetCulture) {
        logs.push({ ...entry, designation: v.designation, phase: v.mission.phase });
      }
    },
    onPhase: () => {},
    onStats: () => {},
    onEvent: () => {},
    onDestroyed: () => {},
  });

  // Create world and keep creating vessels until we get the target culture
  createWorld('LOG-GEN');
  let targetVessel = null;

  // Create up to 10 vessels to find one of the target culture
  for (let attempt = 0; attempt < 20; attempt++) {
    const state = getState();
    if (state.vessels.length >= 4) break;
    const v = createVessel();
    if (v.culture === targetCulture) {
      targetVessel = v;
      break;
    }
  }

  if (!targetVessel) {
    // Force-create by manipulating — just run with whatever we have
    const state = getState();
    targetVessel = state.vessels.find(v => v.culture === targetCulture);
    if (!targetVessel && state.vessels.length > 0) {
      // Override culture for testing
      state.vessels[0].culture = targetCulture;
      targetVessel = state.vessels[0];
    }
  }

  if (!targetVessel) return [];

  // Simulate until we have enough log entries (max 30 min sim time)
  let nextSatDecay = simTime + randInt(90, 120) * 1000;
  const maxSec = 1800; // 30 minutes

  for (let sec = 0; sec <= maxSec && logs.length < MAX_ENTRIES; sec++) {
    simTime = simStart + sec * 1000;
    const state = getState();
    if (!state) break;

    for (const vessel of [...state.vessels]) {
      if (simTime >= vessel.nextTick) {
        tick(vessel);
      }
    }

    if (simTime >= state.global_events.next_event_at) {
      checkGlobalEvent();
    }

    if (simTime >= nextSatDecay) {
      checkSatDecay();
      nextSatDecay = simTime + randInt(90, 120) * 1000;
    }
  }

  return logs.slice(0, MAX_ENTRIES);
}

// === MAIN ===

const sections = [];

sections.push('=== SIGNAL LOST — SAMPLE LOG OUTPUT ===');
sections.push(`Generated at: ${new Date().toISOString()}`);
sections.push(`Entries per faction: up to ${MAX_ENTRIES}`);
sections.push('');
sections.push('This output is for LLM review. Please evaluate:');
sections.push('1. Text style consistency within each faction voice');
sections.push('2. Template filling quality (no broken placeholders like {zone} or {loot})');
sections.push('3. Narrative coherence across sequential log entries');
sections.push('4. Faction personality distinctiveness');
sections.push('5. Grammatical correctness and natural flow');
sections.push('6. Repetitiveness — do entries feel varied enough?');
sections.push('7. Educational CS/AI content integration — natural or forced?');
sections.push('');

for (const cultureKey of CULTURE_KEYS) {
  const culture = CULTURES[cultureKey];
  const logs = generateFactionLog(cultureKey);

  sections.push('─'.repeat(60));
  sections.push(`FACTION: ${culture.name.toUpperCase()} (${cultureKey})`);
  sections.push(`Basis: ${culture.basis}`);
  sections.push(`Traits: ${culture.traits}`);
  sections.push('─'.repeat(60));
  sections.push('');

  if (logs.length === 0) {
    sections.push('(No log entries generated — vessel may not have spawned)');
    sections.push('');
    continue;
  }

  for (const entry of logs) {
    const tag = entry.isEvent ? 'EVENT' : entry.phase;
    sections.push(`[${entry.time}] [${tag}] ${entry.text}`);
  }
  sections.push('');
}

sections.push('─'.repeat(60));
sections.push('END OF SAMPLE LOGS');
sections.push('─'.repeat(60));

const output = sections.join('\n');

if (OUTPUT_FILE) {
  writeFileSync(OUTPUT_FILE, output, 'utf-8');
  console.log(`Written to ${OUTPUT_FILE}`);
} else {
  console.log(output);
}
