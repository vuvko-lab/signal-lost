#!/usr/bin/env node
// === SIGNAL LOST — CORE LOOP SIMULATION ===
// Fast-forward simulation of the game loop with no player input.
// Run: node tests/simulate.mjs [--trials N] [--hours H] [--vessels V]

// === MOCKS (must come before any game imports) ===

let simTime = 0;
const origDateNow = Date.now;
Date.now = () => simTime;

globalThis.localStorage = {
  _store: {},
  getItem(k) { return this._store[k] ?? null; },
  setItem(k, v) { this._store[k] = String(v); },
  removeItem(k) { delete this._store[k]; },
  clear() { this._store = {}; },
};

// === IMPORTS ===

import { randInt } from '../js/data.js';
import {
  createWorld, createVessel, tick, checkGlobalEvent, checkSatDecay,
  getState, setCallbacks, clearSave,
} from '../js/game.js';

// === CLI ARGS ===

const args = process.argv.slice(2);
function getArg(name, def) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] ? Number(args[idx + 1]) : def;
}

const NUM_TRIALS = getArg('trials', 10);
const SIM_HOURS = getArg('hours', 8);
const INIT_VESSELS = getArg('vessels', 1);
const SIM_DURATION_S = SIM_HOURS * 3600;
const SNAPSHOT_INTERVAL_S = 300; // every 5 min

// === STATISTICS ===

function createTrialStats() {
  return {
    vesselsCreated: 0,
    vesselsDestroyed: 0,
    destructionTimes: [],      // seconds into sim when each vessel died
    arcsPerVessel: [],         // arc_count at death or end
    relayMissionsTriggered: 0,
    relayMissionsCompleted: 0, // relay CORE restorations
    relayLootDrops: 0,
    phenomenaCounts: {},
    satTimeBuckets: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, // seconds at each level
    snapshots: [],             // { time, alive, sat, avgHp, avgEn, avgMem, totalArcs, relayActive }
  };
}

// === SIMULATION ===

function runTrial(trialNum) {
  // Reset
  localStorage.clear();
  clearSave();
  simTime = 1000000000000; // arbitrary start (avoids 0-time edge cases)
  const simStart = simTime;

  const stats = createTrialStats();

  // Track relay events via log entries
  let lastSat = 5;

  // Set up callbacks
  setCallbacks({
    onLog: (vesselId, entry) => {
      if (entry.text.includes('[RELAY COMPONENT]')) stats.relayLootDrops++;
      if (entry.text.includes('[RELAY RESTORED]')) stats.relayMissionsCompleted++;
    },
    onPhase: (vesselId, phase) => {
      if (phase === 'SIGNAL') {
        const state = getState();
        const v = state.vessels.find(v => v.id === vesselId);
        if (v && v.mission.relay_mission) stats.relayMissionsTriggered++;
      }
    },
    onStats: () => {},
    onEvent: (phenomenon) => {
      stats.phenomenaCounts[phenomenon.id] = (stats.phenomenaCounts[phenomenon.id] || 0) + 1;
    },
    onDestroyed: (vesselId) => {
      stats.vesselsDestroyed++;
      const elapsedS = Math.round((simTime - simStart) / 1000);
      stats.destructionTimes.push(elapsedS);
      // Record arc count at death (vessel still in state at callback time)
      const st = getState();
      const v = st.vessels.find(v => v.id === vesselId);
      if (v) stats.arcsPerVessel.push(v.mission.arc_count);
    },
  });

  // Create world and vessels
  createWorld('SIM-' + trialNum);
  for (let i = 0; i < INIT_VESSELS; i++) {
    createVessel();
    stats.vesselsCreated++;
  }

  // Schedule SAT decay
  let nextSatDecay = simTime + randInt(90, 120) * 1000;

  // Snapshot schedule
  let nextSnapshot = SNAPSHOT_INTERVAL_S;

  // Main loop — step 1 second at a time
  for (let sec = 0; sec <= SIM_DURATION_S; sec++) {
    simTime = simStart + sec * 1000;
    const state = getState();
    if (!state) break;

    // Track SAT time
    stats.satTimeBuckets[state.world.satellite_health]++;

    // Vessel ticks
    for (const vessel of [...state.vessels]) {
      if (simTime >= vessel.nextTick) {
        tick(vessel);
      }
    }

    // Global event check (every 5 seconds in real game, we check every second here)
    if (simTime >= state.global_events.next_event_at) {
      checkGlobalEvent();
    }

    // SAT decay
    if (simTime >= nextSatDecay) {
      checkSatDecay();
      nextSatDecay = simTime + randInt(90, 120) * 1000;
    }

    // Snapshot
    if (sec >= nextSnapshot) {
      const snap = takeSnapshot(state, sec);
      stats.snapshots.push(snap);
      nextSnapshot += SNAPSHOT_INTERVAL_S;
    }
  }

  // Final snapshot
  const state = getState();
  if (state) {
    const finalSnap = takeSnapshot(state, SIM_DURATION_S);
    stats.snapshots.push(finalSnap);

    // Record arcs for surviving vessels
    for (const v of state.vessels) {
      stats.arcsPerVessel.push(v.mission.arc_count);
    }
  }

  return stats;
}

function takeSnapshot(state, sec) {
  const vessels = state.vessels;
  const alive = vessels.length;
  const avgHp = alive > 0 ? vessels.reduce((s, v) => s + v.integrity, 0) / alive : 0;
  const avgEn = alive > 0 ? vessels.reduce((s, v) => s + v.energy, 0) / alive : 0;
  const avgMem = alive > 0 ? vessels.reduce((s, v) => s + v.memory, 0) / alive : 0;
  const totalArcs = vessels.reduce((s, v) => s + v.mission.arc_count, 0);
  const relayActive = vessels.filter(v => v.mission.relay_mission).length;

  return {
    time: sec,
    alive,
    sat: state.world.satellite_health,
    avgHp: round2(avgHp),
    avgEn: round2(avgEn),
    avgMem: round2(avgMem),
    totalArcs,
    relayActive,
  };
}

function round2(n) { return Math.round(n * 100) / 100; }

// === AGGREGATION ===

function aggregate(allTrials) {
  const n = allTrials.length;

  // Vessel stats
  const totalCreated = allTrials.reduce((s, t) => s + t.vesselsCreated, 0);
  const totalDestroyed = allTrials.reduce((s, t) => s + t.vesselsDestroyed, 0);
  const allArcs = allTrials.flatMap(t => t.arcsPerVessel);
  const allDeathTimes = allTrials.flatMap(t => t.destructionTimes);

  // SAT distribution
  const totalSeconds = SIM_DURATION_S * n;
  const satDist = {};
  for (let i = 0; i <= 5; i++) {
    const total = allTrials.reduce((s, t) => s + (t.satTimeBuckets[i] || 0), 0);
    satDist[i] = round2((total / totalSeconds) * 100);
  }

  // Phenomena
  const phenomenaAvg = {};
  const allPhenomenaIds = new Set(allTrials.flatMap(t => Object.keys(t.phenomenaCounts)));
  for (const id of allPhenomenaIds) {
    phenomenaAvg[id] = round2(allTrials.reduce((s, t) => s + (t.phenomenaCounts[id] || 0), 0) / n);
  }

  // Relay stats
  const avgRelayTriggered = round2(allTrials.reduce((s, t) => s + t.relayMissionsTriggered, 0) / n);
  const avgRelayCompleted = round2(allTrials.reduce((s, t) => s + t.relayMissionsCompleted, 0) / n);
  const avgRelayLoot = round2(allTrials.reduce((s, t) => s + t.relayLootDrops, 0) / n);

  // Timeline snapshots — aggregate by time key
  const snapshotTimes = new Set();
  for (const t of allTrials) {
    for (const s of t.snapshots) snapshotTimes.add(s.time);
  }
  const sortedTimes = [...snapshotTimes].sort((a, b) => a - b);

  const timelineKeys = [1800, 3600, 7200, 14400, 28800]; // 30m, 1h, 2h, 4h, 8h
  const timeline = {};
  for (const key of timelineKeys) {
    // Find closest snapshot time for each trial
    const snaps = allTrials.map(t => {
      const closest = t.snapshots.reduce((best, s) =>
        Math.abs(s.time - key) < Math.abs(best.time - key) ? s : best
      , t.snapshots[0]);
      return closest;
    }).filter(Boolean);

    if (snaps.length > 0) {
      timeline[key] = {
        alive: round2(snaps.reduce((s, x) => s + x.alive, 0) / snaps.length),
        sat: round2(snaps.reduce((s, x) => s + x.sat, 0) / snaps.length),
        avgHp: round2(snaps.reduce((s, x) => s + x.avgHp, 0) / snaps.length),
        avgEn: round2(snaps.reduce((s, x) => s + x.avgEn, 0) / snaps.length),
        avgMem: round2(snaps.reduce((s, x) => s + x.avgMem, 0) / snaps.length),
        totalArcs: round2(snaps.reduce((s, x) => s + x.totalArcs, 0) / snaps.length),
        relayActive: round2(snaps.reduce((s, x) => s + x.relayActive, 0) / snaps.length),
      };
    }
  }

  return {
    n,
    avgCreated: round2(totalCreated / n),
    avgDestroyed: round2(totalDestroyed / n),
    avgFirstDeath: allDeathTimes.length > 0
      ? round2(Math.min(...allDeathTimes) / 60) + 'm (earliest across all trials)'
      : 'none',
    medianFirstDeath: allTrials.map(t => t.destructionTimes[0]).filter(Boolean).length > 0
      ? round2(median(allTrials.map(t => t.destructionTimes[0]).filter(Boolean)) / 60) + 'm'
      : 'none',
    arcs: {
      median: allArcs.length > 0 ? median(allArcs) : 0,
      mean: allArcs.length > 0 ? round2(allArcs.reduce((a, b) => a + b, 0) / allArcs.length) : 0,
      min: allArcs.length > 0 ? Math.min(...allArcs) : 0,
      max: allArcs.length > 0 ? Math.max(...allArcs) : 0,
    },
    satDist,
    phenomenaAvg,
    avgRelayTriggered,
    avgRelayCompleted,
    avgRelayLoot,
    timeline,
  };
}

function median(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// === OUTPUT ===

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}:${String(m).padStart(2, '0')}`;
}

function printReport(agg) {
  const w = (s, len) => String(s).padEnd(len);
  const wr = (s, len) => String(s).padStart(len);

  console.log('');
  console.log('=== SIGNAL LOST — CORE LOOP SIMULATION ===');
  console.log(`Trials: ${agg.n} | Simulated: ${SIM_HOURS}h (${SIM_DURATION_S}s) | Player input: NONE | Initial vessels: ${INIT_VESSELS}`);

  console.log('');
  console.log('--- VESSEL STATISTICS ---');
  console.log(`Vessels created:     avg ${agg.avgCreated} / trial`);
  console.log(`Vessels destroyed:   avg ${agg.avgDestroyed} / trial`);
  console.log(`First death:         earliest ${agg.avgFirstDeath}, median ${agg.medianFirstDeath}`);
  console.log(`Arcs completed:      median ${agg.arcs.median}, mean ${agg.arcs.mean}, range [${agg.arcs.min}-${agg.arcs.max}]`);

  console.log('');
  console.log('--- SAT HEALTH DISTRIBUTION (% of total time) ---');
  console.log(`SAT 5: ${wr(agg.satDist[5], 5)}% | 4: ${wr(agg.satDist[4], 5)}% | 3: ${wr(agg.satDist[3], 5)}% | 2: ${wr(agg.satDist[2], 5)}% | 1: ${wr(agg.satDist[1], 5)}% | 0: ${wr(agg.satDist[0], 5)}%`);

  console.log('');
  console.log('--- RELAY MISSIONS (avg per trial) ---');
  console.log(`Triggered: ${agg.avgRelayTriggered} | Completed (SAT +1): ${agg.avgRelayCompleted} | Loot drops: ${agg.avgRelayLoot}`);

  console.log('');
  console.log('--- PHENOMENA (avg count per trial) ---');
  const phenNames = Object.keys(agg.phenomenaAvg).sort();
  console.log(phenNames.map(p => `${p}: ${agg.phenomenaAvg[p]}`).join(' | '));

  console.log('');
  console.log('--- TIMELINE (avg across trials) ---');
  console.log(` ${w('Time', 6)} | ${wr('Alive', 5)} | ${wr('SAT', 4)} | ${wr('HP', 5)} | ${wr('EN', 5)} | ${wr('MEM', 5)} | ${wr('Arcs', 5)} | ${wr('Relay', 5)}`);
  console.log(' ' + '-'.repeat(58));

  const timelineKeys = [1800, 3600, 7200, 14400, 28800];
  for (const key of timelineKeys) {
    const row = agg.timeline[key];
    if (!row) continue;
    console.log(` ${w(formatTime(key), 6)} | ${wr(row.alive, 5)} | ${wr(row.sat, 4)} | ${wr(row.avgHp, 5)} | ${wr(row.avgEn, 5)} | ${wr(row.avgMem, 5)} | ${wr(row.totalArcs, 5)} | ${wr(row.relayActive, 5)}`);
  }

  console.log('');
}

// === MAIN ===

console.log(`Running ${NUM_TRIALS} trials of ${SIM_HOURS}h simulation with ${INIT_VESSELS} vessel(s)...`);
const startReal = origDateNow();

const allTrials = [];
for (let i = 0; i < NUM_TRIALS; i++) {
  process.stdout.write(`  Trial ${i + 1}/${NUM_TRIALS}...\r`);
  allTrials.push(runTrial(i));
}

const elapsed = origDateNow() - startReal;
console.log(`Completed ${NUM_TRIALS} trials in ${(elapsed / 1000).toFixed(1)}s`);

const agg = aggregate(allTrials);
printReport(agg);
