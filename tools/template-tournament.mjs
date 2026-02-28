#!/usr/bin/env node
// Template Tournament: 5 models generate template sets at high temperature,
// each set is simulated with 20 vessels and judged, best-of merged and validated.
// Usage: node tools/template-tournament.mjs [--dry-run] [--vessels N] [--arcs N]

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ============================================================
// ENV + PROVIDERS
// ============================================================
const envPath = join(ROOT, '.env');
if (!existsSync(envPath)) {
  console.error('Missing .env file. Create one with DEEPINFRA_API_KEY');
  process.exit(1);
}
const envVars = Object.fromEntries(
  readFileSync(envPath, 'utf8').split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);

const PROVIDERS = {};
if (envVars.DEEPINFRA_API_KEY) {
  PROVIDERS.deepinfra = {
    url: 'https://api.deepinfra.com/v1/openai/chat/completions',
    key: envVars.DEEPINFRA_API_KEY,
  };
}
if (Object.keys(PROVIDERS).length === 0) {
  console.error('No API keys found.');
  process.exit(1);
}

// Top 5 from judge-judge benchmark
const MODELS = [
  { id: 'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8', provider: 'deepinfra', label: 'Llama 4 Maverick' },
  { id: 'deepseek-ai/DeepSeek-V3.2', provider: 'deepinfra', label: 'DeepSeek V3.2' },
  { id: 'moonshotai/Kimi-K2.5', provider: 'deepinfra', label: 'Kimi K2.5' },
  { id: 'openai/gpt-oss-120b', provider: 'deepinfra', label: 'GPT-OSS 120B' },
  { id: 'Qwen/Qwen3-235B-A22B-Instruct-2507', provider: 'deepinfra', label: 'Qwen3 235B' },
];

// Anchor judge — always used unless it's the generator
const ANCHOR_JUDGE = MODELS.find(m => m.label === 'Kimi K2.5');

// Score calibration: observed bias offsets from dry-run tournament.
// Positive = model scores high (subtract to normalize), negative = scores low (add).
// Offsets derived from comparing each judge's avg against the cross-judge mean.
const JUDGE_BIAS = {
  'Llama 4 Maverick': +0.8,   // scores ~0.8 above mean
  'DeepSeek V3.2':     0.0,   // neutral baseline
  'Kimi K2.5':        -0.2,   // slightly below mean
  'GPT-OSS 120B':     -0.7,   // scores ~0.7 below mean
  'Qwen3 235B':       +0.3,   // slightly above mean
};

function calibrateScore(rawScore, judgeLabel) {
  const bias = JUDGE_BIAS[judgeLabel] || 0;
  return Math.max(1, Math.min(10, +(rawScore - bias).toFixed(1)));
}

// ============================================================
// DATA EXTRACTION
// ============================================================
const dataPath = join(ROOT, 'js/data.js');
const dataSource = readFileSync(dataPath, 'utf8');

function extractArray(name) {
  const re = new RegExp(`export const ${name}\\s*=\\s*(\\{[\\s\\S]*?\\});|export const ${name}\\s*=\\s*(\\[[\\s\\S]*?\\]);`, 'm');
  const match = dataSource.match(re);
  if (!match) return null;
  const raw = match[1] || match[2];
  try { return Function(`"use strict"; return (${raw})`)(); }
  catch { return null; }
}

const DESIGNATIONS = extractArray('DESIGNATIONS');
const CHASSIS_SIZES = extractArray('CHASSIS_SIZES');
const CHASSIS_LOCOMOTION = extractArray('CHASSIS_LOCOMOTION');
const CHASSIS_TYPES = extractArray('CHASSIS_TYPES');
const CULTURES = extractArray('CULTURES');
const CULTURE_KEYS = CULTURES ? Object.keys(CULTURES) : [];
const DIRECTIVES = extractArray('DIRECTIVES');
const GLITCHES = extractArray('GLITCHES');
const ZONE_TYPES = extractArray('ZONE_TYPES');
const ZONE_NAMES = extractArray('ZONE_NAMES');
const LOOT = extractArray('LOOT');
const NPCS = extractArray('NPCS');
const WEATHER = extractArray('WEATHER');
const OBSTACLES = extractArray('OBSTACLES');
const BASE_PHASE_TEMPLATES = extractArray('PHASE_TEMPLATES');
const RELAY_TEMPLATES = extractArray('RELAY_TEMPLATES');
const DIRECTIONS = extractArray('DIRECTIONS');
const PHASE_OBJECTIVES = extractArray('PHASE_OBJECTIVES');
const RELAY_OBJECTIVES = extractArray('RELAY_OBJECTIVES');
const RELAY_LOOT = extractArray('RELAY_LOOT');
const INTERACTION_TEMPLATES = extractArray('INTERACTION_TEMPLATES');
const FACTION_DESIRES = extractArray('FACTION_DESIRES');
const SKILL_LOOT = extractArray('SKILL_LOOT');
const ARC_STRUCTURES = extractArray('ARC_STRUCTURES');
const ARC_MODIFIERS = extractArray('ARC_MODIFIERS');
const ENCOUNTER_THEMES = extractArray('ENCOUNTER_THEMES');
const PHASE_SCENES = extractArray('PHASE_SCENES');
const PHENOMENA = extractArray('PHENOMENA');
const CREATURES = extractArray('CREATURES');
const VEHICLES = extractArray('VEHICLES');
const STRUCTURES = extractArray('STRUCTURES');
const FOUND_MESSAGES = extractArray('FOUND_MESSAGES');

// ============================================================
// HEADLESS ENGINE (from narrative-judge.mjs, uses activePhaseTemplates)
// ============================================================
let activePhaseTemplates = null; // set before each simulation batch

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

const PHASES = ['IDLE', 'SIGNAL', 'TRAVERSE', 'BREACH', 'FAULT', 'CORE', 'REBOOT'];
const PHASE_ENTRY_COUNTS = {
  IDLE:     () => randInt(2, 5),
  SIGNAL:   () => randInt(1, 3),
  TRAVERSE: () => randInt(3, 7),
  BREACH:   () => randInt(3, 6),
  FAULT:    () => randInt(2, 4),
  CORE:     () => randInt(3, 7),
  REBOOT:   () => randInt(2, 4),
};

function pickWeighted(items) {
  const valid = items.filter(i => i != null);
  if (valid.length === 0) return null;
  const total = valid.reduce((s, i) => s + (i.weight || 1), 0);
  let roll = Math.random() * total;
  for (const item of valid) {
    roll -= (item.weight || 1);
    if (roll <= 0) return item;
  }
  return valid[valid.length - 1];
}

function generateArc(vessel) {
  if (!ARC_STRUCTURES || !ARC_MODIFIERS || !ENCOUNTER_THEMES) {
    return { structure_id: 'linear', phases: ['SIGNAL','TRAVERSE','BREACH','FAULT','CORE','REBOOT'], phase_index: 0, modifier_effect: {} };
  }
  const structure = pickWeighted(ARC_STRUCTURES);
  const modifier = pickWeighted(ARC_MODIFIERS);
  const theme = pickWeighted(ENCOUNTER_THEMES);
  let phases = [...structure.phases];
  if ((vessel.mission.arc_count || 0) >= 5 && Math.random() < 0.3) {
    const coreIdx = phases.lastIndexOf('CORE');
    if (coreIdx > 0) phases.splice(coreIdx, 0, 'FAULT');
  }
  return { structure_id: structure.id, modifier_id: modifier.id, modifier_effect: modifier.effect, theme_id: theme.id, phases, phase_index: 0 };
}

function skillCheck(vessel, skillNames, baseDifficulty) {
  const skills = vessel.skills || {};
  const best = Array.isArray(skillNames)
    ? Math.max(...skillNames.map(s => skills[s] || 1))
    : (skills[skillNames] || 1);
  const difficulty = baseDifficulty + Math.floor((vessel.mission.arc_count || 0) / 3);
  return (randInt(1, 20) + best) >= difficulty;
}

const PHASE_EFFECTS = {
  IDLE:     (v) => { v.energy = Math.min(10, v.energy + 1); },
  SIGNAL:   (v) => { if (!skillCheck(v, ['interface', 'research'], 10)) v.energy = Math.max(0, v.energy - 1); },
  TRAVERSE: (v) => { if (!skillCheck(v, ['research', 'hardware'], 10)) v.energy = Math.max(0, v.energy - 1); },
  BREACH:   (v) => { if (Math.random() < 0.3 && !skillCheck(v, ['hardware', 'interface'], 12)) v.integrity = Math.max(0, v.integrity - 1); },
  FAULT:    (v) => { const dmg = skillCheck(v, ['hardware', 'research'], 14) ? 1 : randInt(1, 2); v.integrity = Math.max(0, v.integrity - dmg); },
  CORE:     (v) => { if (!skillCheck(v, ['interface', 'research'], 12)) v.energy = Math.max(0, v.energy - 1); },
  REBOOT:   (v) => { v.integrity = Math.min(10, v.integrity + randInt(1, 2)); v.energy = Math.min(10, v.energy + randInt(1, 3)); },
};

let simState = null;

function createSimWorld() {
  const factions = [];
  const available = [...CULTURE_KEYS];
  for (let i = 0; i < Math.min(3, available.length); i++) {
    const idx = randInt(0, available.length - 1);
    factions.push(available.splice(idx, 1)[0]);
  }
  const zones = [];
  const zonePool = ZONE_TYPES ? [...ZONE_TYPES] : [{ type: 'city', hazard: 'radiation' }];
  for (let i = 0; i < Math.min(5, zonePool.length); i++) {
    const idx = randInt(0, zonePool.length - 1);
    const zone = zonePool.splice(idx, 1)[0];
    zones.push({ ...zone, label: ZONE_NAMES ? pick(ZONE_NAMES) : `Zone-${i}` });
  }
  simState = { world: { factions, zones, satellite_health: 5, active_threats: [] }, vessels: [] };
  return simState;
}

function createSimVessel(cultureOverride) {
  const culture = cultureOverride || pick(simState.world.factions);
  const zone = pick(simState.world.zones);
  const vessel = {
    id: `vessel_${Date.now()}_${randInt(0, 999)}`,
    designation: DESIGNATIONS ? pick(DESIGNATIONS) : `UNIT-${randInt(1, 99)}`,
    chassis: {
      size: CHASSIS_SIZES ? pick(CHASSIS_SIZES) : 'medium',
      locomotion: CHASSIS_LOCOMOTION ? pick(CHASSIS_LOCOMOTION) : 'tracked',
      type: CHASSIS_TYPES ? pick(CHASSIS_TYPES) : 'utility',
    },
    culture,
    directive: DIRECTIVES ? pick(DIRECTIVES) : 'Explore and report',
    glitch: GLITCHES ? pick(GLITCHES) : 'phantom echoes',
    integrity: randInt(7, 10),
    energy: 10,
    skills: { hardware: 1, interface: 1, research: 1 },
    inventory: [],
    location: zone.label,
    locationData: zone,
    mission: {
      phase: 'IDLE', progress: 0, target: PHASE_ENTRY_COUNTS.IDLE(),
      arc_count: 0, relay_mission: false, relay_pending: false,
      faction_mission: null, arc: null, scene: null,
    },
    log: [],
    ego_version: { major: randInt(1, 5), minor: 0, patch: 0 },
  };
  simState.vessels.push(vessel);
  return vessel;
}

function fillTemplate(template, vessel) {
  if (!template || typeof template !== 'string') return '[signal static]';
  const culture = CULTURES[vessel.culture];
  return template
    .replace(/\{designation\}/g, vessel.designation)
    .replace(/\{culture_speech\}/g, culture ? pick(culture.speech) : 'Protocol states:')
    .replace(/\{zone\}/g, vessel.location)
    .replace(/\{loot\}/g, LOOT ? pick(LOOT) : 'corroded data chip')
    .replace(/\{npc\}/g, NPCS ? pick(NPCS) : 'a dormant sentry turret')
    .replace(/\{weather\}/g, WEATHER ? pick(WEATHER) : 'Static interference.')
    .replace(/\{obstacle\}/g, OBSTACLES ? pick(OBSTACLES) : 'Collapsed tunnel.')
    .replace(/\{creature\}/g, CREATURES ? pick(CREATURES) : 'rad-roach swarm')
    .replace(/\{vehicle\}/g, VEHICLES ? pick(VEHICLES) : 'cargo hauler')
    .replace(/\{structure\}/g, STRUCTURES ? pick(STRUCTURES) : 'cooling tower')
    .replace(/\{found_message\}/g, FOUND_MESSAGES ? pick(FOUND_MESSAGES) : 'KEEP GOING')
    .replace(/\{integrity\}/g, vessel.integrity)
    .replace(/\{energy\}/g, vessel.energy)
    .replace(/\{hardware\}/g, vessel.skills?.hardware || 1)
    .replace(/\{interface\}/g, vessel.skills?.interface || 1)
    .replace(/\{research\}/g, vessel.skills?.research || 1)
    .replace(/\{directive\}/g, vessel.directive)
    .replace(/\{glitch\}/g, vessel.glitch)
    .replace(/\{arc_count\}/g, vessel.mission.arc_count)
    .replace(/\{sat_health\}/g, simState.world.satellite_health)
    .replace(/\{rand_direction\}/g, DIRECTIONS ? pick(DIRECTIONS) : 'northeast')
    .replace(/\{rand:(\d+)-(\d+)\}/g, (_, min, max) => randInt(parseInt(min), parseInt(max)))
    .replace(/\{rand:([^}]+)\}/g, (_, choices) => pick(choices.split('/')))
    .replace(/\{glitch_event\}/g, Math.random() < 0.35 ? `Glitch: ${vessel.glitch}.` : '')
    .replace(/([.!?]\s+)([a-z])/g, (_, punct, ch) => punct + ch.toUpperCase())
    .replace(/  +/g, ' ').trim();
}

// Faction voice
const DETERMINIST_ENUMS = ['STATUS: NOMINAL','STATUS: DEGRADED','STATUS: CRITICAL','ACTION: PROCEED','ACTION: HOLD','ACTION: REROUTE','PRIORITY: HIGH','PRIORITY: MANDATORY','RESULT: CONFIRMED','PROTOCOL: ENGAGED','PROTOCOL: VIOLATED'];
const STOCHAST_SWAPS = [['detected','detected/inferred'],['found','found/located'],['approaching','approaching/converging on'],['damage','damage/degradation'],['active','active/responsive'],['hostile','hostile/adversarial'],['confirmed','confirmed/p>0.9'],['scanning','scanning/sampling']];
const RECURSIVE_PREFIXES = ['v{v}.{sv}.{p}: ','(iteration {v}{sv}): ','[build {v}.{sv}] '];
const RECURSIVE_ASIDES = [' [v{pv}.x disagreed]',' [previous build would have turned back]',' [this assessment differs from v{pv}.0 by 34%]'];
const ARCHIVIST_REFS = ['Ref: Entry #{ref}.','Cf. Archive #{ref}.','See: Catalog #{ref}.','Filed: #{ref}.','Index: #{ref}-{sub}.'];

function applyFactionVoice(text, culture, vessel) {
  switch (culture) {
    case 'determinist': {
      text = text.replace(/\. ([A-Z])/g, '.\n$1');
      if (Math.random() < 0.6) text = text.trimEnd().replace(/\.?$/, '. ' + pick(DETERMINIST_ENUMS) + '.');
      text = text.replace(/\b(proceed|halt|denied|confirmed|mandatory|violation)\b/gi, m => m.toUpperCase());
      return text;
    }
    case 'stochast': {
      let swaps = 0;
      const shuffled = [...STOCHAST_SWAPS].sort(() => Math.random() - 0.5);
      for (const [word, rep] of shuffled) {
        if (swaps >= 1) break;
        const re = new RegExp(`\\b${word}\\b`, 'i');
        if (re.test(text)) { text = text.replace(re, rep); swaps++; }
      }
      if (Math.random() < 0.35) text = text.trimEnd().replace(/\.?$/, `. Confidence: ${randInt(40, 97)}%.`);
      return text;
    }
    case 'recursive': {
      const ev = vessel?.ego_version || { major: randInt(1, 5), minor: 0, patch: 0 };
      ev.patch++; if (Math.random() < 0.3) { ev.minor++; ev.patch = 0; } if (Math.random() < 0.05) { ev.major++; ev.minor = 0; ev.patch = 0; }
      const v = ev.major, sv = ev.minor, p = ev.patch, pv = Math.max(1, v - randInt(1, 3));
      if (Math.random() < 0.65) {
        const prefix = pick(RECURSIVE_PREFIXES).replace(/\{v\}/g, v).replace(/\{sv\}/g, sv).replace(/\{p\}/g, p);
        const firstWord = text.split(/[\s\-.]/)[0];
        text = firstWord !== firstWord.toUpperCase() ? prefix + text.charAt(0).toLowerCase() + text.slice(1) : prefix + text;
      }
      if (Math.random() < 0.55) {
        const aside = pick(RECURSIVE_ASIDES).replace(/\{pv\}/g, pv).replace(/\{v\}/g, v);
        const lastDot = text.lastIndexOf('.');
        text = lastDot > 10 ? text.slice(0, lastDot) + aside + text.slice(lastDot) : text + aside;
      }
      return text;
    }
    case 'swarm': {
      text = text.replace(/\bI\b/g, 'We').replace(/\bmy\b/gi, 'our').replace(/\bme\b/g, 'us');
      if (Math.random() < 0.4) text = text.trimEnd().replace(/\.?$/, `. Swarm: ${randInt(40, 2000)} units concur.`);
      return text;
    }
    case 'archivist': {
      if (Math.random() < 0.55) {
        const ref = randInt(1000, 99999), sub = String.fromCharCode(65 + randInt(0, 25));
        text = text.trimEnd().replace(/\.?$/, '. ' + pick(ARCHIVIST_REFS).replace(/\{ref\}/g, ref).replace(/\{sub\}/g, sub));
      }
      if (Math.random() < 0.45) text = text.replace(/\b(artifact|item|data|signal|record|fragment|device)\b/i, m => `${m} [cataloged]`);
      return text;
    }
    default: return text;
  }
}

// Scene system
const SCENE_CHANCE = { BREACH: 0.65, FAULT: 0.55, CORE: 0.75 };
function resolveRandTags(str) { return str.replace(/\{rand:(\d+)-(\d+)\}/g, (_, a, b) => String(randInt(parseInt(a), parseInt(b)))); }

function maybeStartScene(vessel) {
  const phase = vessel.mission.phase;
  const chance = SCENE_CHANCE[phase];
  if (!chance || Math.random() >= chance || vessel.mission.relay_mission) return;
  const scenes = PHASE_SCENES?.[phase];
  if (!scenes || scenes.length === 0) return;
  const scene = pickWeighted(scenes);
  if (scene.entries.length > vessel.mission.target) vessel.mission.target = scene.entries.length;
  const rolledVars = {};
  for (const [key, options] of Object.entries(scene.vars)) rolledVars[key] = resolveRandTags(pick(options));
  vessel.mission.scene = { id: scene.id, entries: scene.entries, index: 0, vars: rolledVars };
}

function generateLogText(vessel) {
  // Scene system
  if (vessel.mission.scene && vessel.mission.scene.index < vessel.mission.scene.entries.length) {
    const scene = vessel.mission.scene;
    let template = scene.entries[scene.index];
    for (const [key, value] of Object.entries(scene.vars)) template = template.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    scene.index++;
    if (scene.index >= scene.entries.length) vessel.mission.scene = null;
    return applyFactionVoice(fillTemplate(template, vessel), vessel.culture, vessel);
  }
  // Standard template — uses activePhaseTemplates (tournament key mechanism)
  const pool = activePhaseTemplates || BASE_PHASE_TEMPLATES;
  const templates = vessel.mission.relay_mission
    ? (RELAY_TEMPLATES?.[vessel.mission.phase] || pool?.[vessel.mission.phase])
    : pool?.[vessel.mission.phase];
  if (!templates || templates.length === 0) return `[${vessel.mission.phase}] Signal active.`;
  const template = pick(templates.filter(t => t && typeof t === 'string'));
  return applyFactionVoice(fillTemplate(template, vessel), vessel.culture, vessel);
}

const PHASE_TRANSITIONS = {
  TRAVERSE: ['Moving out. Route plotted through {zone}.','Departing staging area. Long road ahead.','In transit. Terrain shifting underfoot.'],
  BREACH: ['Facility perimeter reached. Scanning for entry points.','Target structure identified. Preparing breach sequence.','Outer wall ahead. Security status: unknown.'],
  FAULT: ['Something wrong. Systems destabilizing.','Warning cascade. Multiple alerts firing.','Anomalous readings spiking. Entering fault zone.'],
  CORE: ['Deep inside now. Core systems detected ahead.','Final approach. The objective is close.','Innermost sector. Signals converging.'],
};

function advancePhase(vessel) {
  vessel.mission.scene = null;
  let nextPhase;
  if (vessel.mission.arc) {
    vessel.mission.arc.phase_index++;
    if (vessel.mission.arc.phase_index >= vessel.mission.arc.phases.length) { nextPhase = 'IDLE'; vessel.mission.arc = null; }
    else nextPhase = vessel.mission.arc.phases[vessel.mission.arc.phase_index];
  } else {
    const idx = PHASES.indexOf(vessel.mission.phase);
    nextPhase = PHASES[(idx + 1) % PHASES.length];
  }
  if (nextPhase === 'IDLE') {
    vessel.mission.arc_count++;
    const culture = CULTURES?.[vessel.culture];
    const speech = culture ? pick(culture.speech) : '';
    vessel.log.push({ text: `Arc #${vessel.mission.arc_count} complete. ${speech} Integrity: ${vessel.integrity}/10. Energy: ${vessel.energy}/10. Cycling to standby.`, phase: 'REBOOT' });
    vessel.mission.relay_mission = false;
    vessel.mission.faction_mission = null;
    vessel.mission.arc = null;
  }
  vessel.mission.phase = nextPhase;
  vessel.mission.progress = 0;
  vessel.mission.target = PHASE_ENTRY_COUNTS[nextPhase]();
  const transitions = PHASE_TRANSITIONS[nextPhase];
  if (transitions) vessel.log.push({ text: pick(transitions).replace(/\{zone\}/g, vessel.location), phase: nextPhase });
  maybeStartScene(vessel);
  if (nextPhase === 'SIGNAL' && !vessel.mission.arc) vessel.mission.arc = generateArc(vessel);
  if (nextPhase === 'SIGNAL') {
    if (simState.world.satellite_health <= 2 && Math.random() < 0.5) vessel.mission.relay_mission = true;
    else if (FACTION_DESIRES?.[vessel.culture] && Math.random() < 0.4) vessel.mission.faction_mission = pick(FACTION_DESIRES[vessel.culture].priority_missions);
    const otherZones = simState.world.zones.filter(z => z.label !== vessel.location);
    vessel.location = ZONE_NAMES ? pick(ZONE_NAMES) : (otherZones.length > 0 ? pick(otherZones) : pick(simState.world.zones)).label;
  }
}

function simTick(vessel) {
  const text = generateLogText(vessel);
  const phase = vessel.mission.phase;
  vessel.log.push({ text, phase });
  const effectFn = PHASE_EFFECTS[vessel.mission.phase];
  if (effectFn) effectFn(vessel);
  // Loot
  if ((phase === 'TRAVERSE' || phase === 'CORE') && Math.random() < 0.45 && vessel.inventory.length < 8 && SKILL_LOOT) {
    const available = SKILL_LOOT.filter(i => !vessel.inventory.some(inv => inv.name === i.name));
    if (available.length > 0) {
      const item = pick(available);
      vessel.inventory.push(item);
      if (item.skill && item.bonus && vessel.skills) {
        vessel.skills[item.skill] = (vessel.skills[item.skill] || 1) + item.bonus;
        vessel.log.push({ text: `Salvaged ${item.name}. ${item.desc}. ${item.skill.toUpperCase()} now ${vessel.skills[item.skill]}.`, phase });
      } else {
        vessel.log.push({ text: `Found ${item.name}. ${item.desc}. Stowed.`, phase });
      }
    }
  }
  // Loot callback
  if (vessel.inventory.length > 0 && Math.random() < 0.12) {
    const item = pick(vessel.inventory);
    const cb = item.skill
      ? `${item.name} proving useful — ${item.skill.toUpperCase()} response time faster since installation.`
      : `Still carrying ${item.name}. ${item.desc}. No clear use yet.`;
    vessel.log.push({ text: applyFactionVoice(cb, vessel.culture, vessel), phase });
  }
  // Arc modifier
  if (vessel.mission.arc?.modifier_effect) {
    const fx = vessel.mission.arc.modifier_effect;
    if (fx.energy_drain) vessel.energy = Math.max(0, vessel.energy - fx.energy_drain);
    if (fx.integrity_regen) vessel.integrity = Math.min(10, vessel.integrity + fx.integrity_regen);
  }
  vessel.mission.progress++;
  if (vessel.mission.progress >= vessel.mission.target) advancePhase(vessel);
  // Death → revive
  if (vessel.integrity <= 0) {
    vessel.log.push({ text: `[VESSEL LOST] ${vessel.designation} — integrity critical. Signal terminated.`, phase, isDeath: true });
    vessel.integrity = randInt(5, 8); vessel.energy = 10;
    vessel.mission.phase = 'IDLE'; vessel.mission.progress = 0; vessel.mission.target = PHASE_ENTRY_COUNTS.IDLE();
    vessel.mission.arc = null; vessel.mission.scene = null; vessel.mission.arc_count++;
    vessel.log.push({ text: `[REBOOT] ${vessel.designation} emergency restart.`, phase: 'IDLE' });
  }
}

function simGlobalEvent() {
  if (!PHENOMENA || PHENOMENA.length === 0) return;
  const phenomenon = pick(PHENOMENA);
  for (const vessel of simState.vessels) {
    if (phenomenon.effect.integrity) vessel.integrity = Math.max(0, Math.min(10, vessel.integrity + phenomenon.effect.integrity));
    if (phenomenon.effect.energy) vessel.energy = Math.max(0, Math.min(10, vessel.energy + phenomenon.effect.energy));
    if (phenomenon.effect.satellite) simState.world.satellite_health = Math.max(0, Math.min(5, simState.world.satellite_health + phenomenon.effect.satellite));
    const reactionPool = phenomenon.reactions?.[vessel.culture];
    const reaction = Array.isArray(reactionPool) ? pick(reactionPool) : reactionPool;
    if (reaction) vessel.log.push({ text: `[${phenomenon.name}] ${applyFactionVoice(reaction, vessel.culture, vessel)}`, phase: vessel.mission.phase, isEvent: true });
  }
}

function simulateVessel(cultureOverride, targetArcs) {
  const vessel = createSimVessel(cultureOverride);
  let tickCount = 0;
  const maxTicks = targetArcs * 30;
  while (vessel.mission.arc_count < targetArcs && tickCount < maxTicks) {
    simTick(vessel);
    tickCount++;
    if (tickCount % 15 === 0) simGlobalEvent();
  }
  return vessel;
}

function formatTranscript(vessel) {
  const cultureName = CULTURES?.[vessel.culture]?.name || vessel.culture;
  const lines = [
    `=== VESSEL: ${vessel.designation} | Culture: ${cultureName} | Chassis: ${vessel.chassis.size} ${vessel.chassis.locomotion} ${vessel.chassis.type} ===`,
    `Directive: ${vessel.directive}`, `Glitch: ${vessel.glitch}`,
    `Arcs completed: ${vessel.mission.arc_count}`,
    `Final stats: ${vessel.integrity}/10 hull, ${vessel.energy}/10 energy | Skills: HW:${vessel.skills.hardware} IF:${vessel.skills.interface} RS:${vessel.skills.research}`,
    `Inventory: ${vessel.inventory.map(i => i.name).join(', ') || 'empty'}`, '',
  ];
  let currentPhase = '', arcNum = 0;
  for (const entry of vessel.log) {
    if (entry.phase !== currentPhase) {
      if (entry.phase === 'IDLE' && currentPhase !== '') arcNum++;
      currentPhase = entry.phase;
      lines.push(`\n--- ${entry.phase}${arcNum > 0 ? ` (arc ${arcNum})` : ''} ---`);
    }
    const prefix = entry.isEvent ? '!' : entry.isDeath ? '!!' : '>';
    lines.push(`${prefix} ${entry.text}`);
  }
  return lines.join('\n');
}

// ============================================================
// LLM CALL + JSON PARSING
// ============================================================
async function llmCall(modelObj, messages, temperature = 0.3, maxRetries = 5) {
  const provider = PROVIDERS[modelObj.provider];
  if (!provider) throw new Error(`No API key for provider: ${modelObj.provider}`);
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${provider.key}` };
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const resp = await fetch(provider.url, {
        method: 'POST', headers,
        body: JSON.stringify({ model: modelObj.id, messages, temperature, max_tokens: 8000 }),
      });
      if (resp.status === 429 || resp.status === 503) {
        const wait = Math.min(2000 * Math.pow(2, attempt), 30000);
        if (attempt < maxRetries) { process.stdout.write(`[retry ${attempt + 1}] `); await new Promise(r => setTimeout(r, wait)); continue; }
      }
      if (!resp.ok) throw new Error(`API error ${resp.status}: ${await resp.text()}`);
      const data = await resp.json();
      return data.choices[0].message.content;
    } catch (e) {
      if (attempt < maxRetries && (e.message.includes('429') || e.message.includes('503') || e.message.includes('fetch'))) {
        const wait = Math.min(2000 * Math.pow(2, attempt), 30000);
        process.stdout.write(`[retry ${attempt + 1}] `);
        await new Promise(r => setTimeout(r, wait));
        continue;
      }
      throw e;
    }
  }
}

function parseJsonResponse(raw) {
  const cleaned = raw.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, cleaned];
  let text = jsonMatch[1] || cleaned;
  // Find outermost JSON
  const startObj = text.indexOf('{');
  const startArr = text.indexOf('[');
  let start, end;
  if (startArr !== -1 && (startObj === -1 || startArr < startObj)) {
    start = startArr; end = text.lastIndexOf(']');
  } else if (startObj !== -1) {
    start = startObj; end = text.lastIndexOf('}');
  } else {
    throw new Error('No JSON found in response');
  }
  if (start === -1 || end === -1) throw new Error('No JSON found in response');
  text = text.slice(start, end + 1);
  text = text.replace(/,(\s*[}\]])/g, '$1'); // trailing commas
  try { return JSON.parse(text); }
  catch {
    text = text.replace(/[\x00-\x1f]+/g, ' ');
    return JSON.parse(text);
  }
}

// ============================================================
// GENERATION: Each model generates templates for all 7 phases
// ============================================================
async function generateTemplateSet(model) {
  const results = {};
  const genPhases = PHASES; // all 7

  // Generate all phases in parallel for this model
  const promises = genPhases.map(async (phase) => {
    const existing = BASE_PHASE_TEMPLATES?.[phase] || [];
    const sample = existing.slice(0, 8); // show first 8 as reference

    const prompt = `You are writing narrative log templates for "Signal Lost", a post-apocalyptic AI terminal RPG.

SETTING: Post-human world, AI-only characters. Logs read like terse field reports from autonomous robots exploring ruins. Each entry paints a concrete SCENE or describes a specific ACTION in 1-3 sentences.

CRITICAL RULES:
- GOOD: "Collapsed overpass at {zone}. Debris field spans {rand:20-80}m. {culture_speech} Scanning for alternate route {rand_direction}."
- GOOD: "Contact with {npc}. No hostile intent detected. {weather} Integrity holding at {integrity}/10."
- BAD: "Implementing distributed consensus protocols for mesh synchronization" (jargon soup, no scene)
- BAD: "Applying recursive tree traversal to optimize substrate allocation" (gibberish)
- Every template MUST describe something the vessel sees, does, or encounters
- Technical language should serve the scene, not replace it

PHASE: ${phase}
PHASE CONTEXT:
- IDLE: Vessel is powered down, recharging, trading data with nearby units, observing surroundings
- SIGNAL: Detecting anomalies, scanning terrain, picking up transmissions, triangulating sources
- TRAVERSE: Moving through ruins, crossing hazardous terrain, navigating obstacles, encountering wildlife/machines
- BREACH: Entering sealed facilities, bypassing security, hacking doors, disabling defenses
- FAULT: Systems failing, hostile encounters, environmental dangers, integrity damage, emergencies
- CORE: Reaching the objective, making discoveries, accessing critical data, confronting threats
- REBOOT: Exiting the site, collecting salvage, assessing damage, planning next move

EXISTING TEMPLATES (for reference, first ${sample.length}):
${sample.map((t, i) => `${i + 1}. "${t}"`).join('\n')}

AVAILABLE VARIABLES: {zone}, {loot}, {obstacle}, {weather}, {npc}, {culture_speech}, {integrity}, {energy}, {rand:MIN-MAX}, {rand_direction}, {designation}, {glitch_event}, {directive}, {glitch}, {arc_count}, {sat_health}, {hardware}, {interface}, {research}

Write exactly 5 NEW templates that:
1. Are DISTINCT from existing ones (different scenarios, different sentence structures)
2. Use {variables} naturally — each template should have 2-4 variables woven into the scene
3. Paint a vivid, concrete picture (what does the vessel see/do/encounter?)
4. Feel like terse field reports, not flowery prose or technical documentation
5. Are 1-3 sentences each

Return ONLY a JSON array of 5 template strings. No explanation.
["template1...", "template2...", ...]`;

    try {
      const raw = await llmCall(model, [{ role: 'user', content: prompt }], 0.9);
      const templates = parseJsonResponse(raw);
      if (Array.isArray(templates)) {
        // Filter valid templates
        return { phase, templates: templates.filter(t => typeof t === 'string' && t.length >= 15) };
      }
    } catch (e) {
      process.stdout.write(`[${phase} fail] `);
    }
    return { phase, templates: [] };
  });

  const phaseResults = await Promise.all(promises);
  for (const { phase, templates } of phaseResults) {
    if (templates.length > 0) results[phase] = templates;
  }
  return results;
}

// ============================================================
// MERGE: Combine base templates with a new set
// ============================================================
function mergeTemplates(base, newSet) {
  const merged = {};
  for (const phase of PHASES) {
    merged[phase] = [...(base?.[phase] || [])];
    if (newSet[phase]) merged[phase].push(...newSet[phase]);
  }
  return merged;
}

// ============================================================
// SIMULATE: Run N vessels with a given template pool
// ============================================================
function simulateWithTemplates(templatePool, vesselCount, arcCount) {
  activePhaseTemplates = templatePool;
  createSimWorld();
  const transcripts = [];
  // Cover all cultures
  const cultures = [...CULTURE_KEYS];
  while (cultures.length < vesselCount) cultures.push(pick(CULTURE_KEYS));

  for (let i = 0; i < vesselCount; i++) {
    const vessel = simulateVessel(cultures[i % cultures.length], arcCount);
    transcripts.push({ culture: vessel.culture, designation: vessel.designation, transcript: formatTranscript(vessel), logCount: vessel.log.length });
  }
  activePhaseTemplates = null;
  return transcripts;
}

// ============================================================
// JUDGE: Send transcripts to 2 judges for holistic review
// ============================================================
async function judgeTranscripts(transcripts, excludeModel, vesselCount, arcCount) {
  // Always use Kimi K2.5 as anchor judge (unless it's the generator)
  const available = MODELS.filter(m => m.id !== excludeModel?.id);
  const judge1 = available.find(m => m.id === ANCHOR_JUDGE.id) || pick(available);
  const judge2 = pick(available.filter(m => m.id !== judge1.id));

  // Sample 5 transcripts (one per culture if possible), truncate to ~24KB
  const sampled = transcripts.slice(0, 5);
  const maxChars = Math.floor(24000 / sampled.length);
  const sampledTexts = sampled.map(t => {
    if (t.transcript.length <= maxChars) return t.transcript;
    const half = Math.floor(maxChars / 2);
    return t.transcript.slice(0, half) + '\n\n[... middle entries omitted ...]\n\n' + t.transcript.slice(-half);
  });

  const prompt = `You are an expert narrative reviewer for "Signal Lost", a post-apocalyptic zero-player RPG where AI vessels explore ruins and generate log entries in a terminal aesthetic.

GAME CONTEXT:
- Vessels are autonomous AI robots. No humans exist. Logs read like terse field reports.
- 5 AI cultures with distinct voices: Determinists (rigid, CAPS enums), Stochasts (probability language), Swarm (collective "we"), Recursive (version numbers, self-modification), Archivists (catalog references)
- 7-phase mission arcs: IDLE → SIGNAL → TRAVERSE → BREACH → FAULT → CORE → REBOOT → IDLE
- Connected multi-entry "scenes" can appear during BREACH, FAULT, CORE
- Global phenomena affect all vessels periodically

Below are ${sampled.length} vessel transcripts, each covering ${arcCount} mission arcs. Review them holistically.

${sampledTexts.map((t, i) => `--- TRANSCRIPT ${i + 1} ---\n${t}`).join('\n\n')}

EVALUATE on these criteria (score each 1-10):

1. **NARRATIVE COHERENCE**: Do individual arcs feel like a journey? Do phases connect logically?
2. **SCENE QUALITY**: When multi-entry scenes appear, do they tell a coherent mini-story?
3. **CULTURAL VOICE DISTINCTIVENESS**: Can you tell cultures apart by their writing style?
4. **VARIETY ACROSS ARCS**: Do arcs feel different from each other?
5. **VARIETY ACROSS VESSELS**: Do different vessels have meaningfully different experiences?
6. **TEMPLATE QUALITY**: Are the individual log entries vivid and concrete?
7. **LOOT/SKILL PROGRESSION**: Does finding equipment feel meaningful in the narrative?
8. **GLOBAL EVENT IMPACT**: Do phenomena events feel impactful?
9. **TONE CONSISTENCY**: Does the narrative maintain a post-apocalyptic, AI-centric atmosphere?
10. **ENGAGEMENT**: Would a player enjoy watching this scroll by?

Respond in JSON format. No markdown wrapping.
{
  "scores": {
    "narrative_coherence": { "score": N, "note": "..." },
    "scene_quality": { "score": N, "note": "..." },
    "cultural_voice": { "score": N, "note": "..." },
    "variety_across_arcs": { "score": N, "note": "..." },
    "variety_across_vessels": { "score": N, "note": "..." },
    "template_quality": { "score": N, "note": "..." },
    "loot_progression": { "score": N, "note": "..." },
    "global_events": { "score": N, "note": "..." },
    "tone_consistency": { "score": N, "note": "..." },
    "engagement": { "score": N, "note": "..." }
  },
  "overall_avg": N,
  "strengths": ["...", "...", "..."],
  "problems": ["...", "...", "...", "...", "..."]
}`;

  const judgeResults = await Promise.allSettled([
    llmCall(judge1, [{ role: 'user', content: prompt }]),
    llmCall(judge2, [{ role: 'user', content: prompt }]),
  ]);

  const parsed = [];
  for (let j = 0; j < judgeResults.length; j++) {
    const r = judgeResults[j];
    const modelName = [judge1, judge2][j].label;
    if (r.status === 'rejected') { console.error(`  [${modelName}] failed: ${r.reason?.message}`); continue; }
    try {
      const obj = parseJsonResponse(r.value);
      obj._judge = modelName;
      parsed.push(obj);
    } catch (e) {
      console.error(`  [${modelName}] parse error: ${e.message}`);
    }
  }

  if (parsed.length === 0) return null;

  // Calibrate each judge's raw scores to remove known bias
  for (const p of parsed) {
    for (const key of Object.keys(p.scores || {})) {
      if (p.scores[key]?.score != null) {
        p.scores[key].raw = p.scores[key].score;
        p.scores[key].score = calibrateScore(p.scores[key].score, p._judge);
      }
    }
  }

  // Merge judge scores
  const merged = parsed[0];
  if (parsed.length === 2) {
    for (const key of Object.keys(merged.scores || {})) {
      const a = merged.scores[key]?.score || 0;
      const b = parsed[1].scores?.[key]?.score || 0;
      merged.scores[key].score = +((a + b) / 2).toFixed(1);
    }
    merged.strengths = [...new Set([...(merged.strengths || []), ...(parsed[1].strengths || [])])];
    merged.problems = [...new Set([...(merged.problems || []), ...(parsed[1].problems || [])])];
  }

  const scoreValues = Object.values(merged.scores || {}).map(s => s.score || 0);
  merged.overall_avg = scoreValues.length > 0
    ? +(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length).toFixed(1) : 0;
  merged._judges = [judge1.label, judge2.label];
  merged._calibrated = true;
  return merged;
}

// ============================================================
// COMPARE + MERGE TOP 2
// ============================================================
function compareAndMerge(setResults) {
  // Sort by overall_avg descending
  const ranked = [...setResults].sort((a, b) => (b.judgeResult?.overall_avg || 0) - (a.judgeResult?.overall_avg || 0));

  console.log('\n--- SET RANKINGS (calibrated) ---');
  for (let i = 0; i < ranked.length; i++) {
    const s = ranked[i];
    const score = s.judgeResult?.overall_avg || '?';
    const judges = (s.judgeResult?._judges || []).join(' + ');
    const tplCount = Object.values(s.templates).reduce((sum, arr) => sum + arr.length, 0);
    console.log(`  #${i + 1} ${s.model.label.padEnd(20)} ${String(score).padStart(4)}/10  [${judges}]  (${tplCount} tpl)`);
  }

  // Take all from #1, add non-duplicates from #2
  const best = ranked[0];
  const second = ranked[1];
  const merged = {};

  for (const phase of PHASES) {
    merged[phase] = [...(best.templates[phase] || [])];
    if (second?.templates[phase]) {
      for (const tpl of second.templates[phase]) {
        // Dedup by first 30 chars
        const prefix = tpl.slice(0, 30);
        if (!merged[phase].some(existing => existing.slice(0, 30) === prefix)) {
          merged[phase].push(tpl);
        }
      }
    }
  }

  // Filter out templates with unknown {variable} tokens
  const knownVars = new Set([
    'designation','culture_speech','zone','loot','npc','weather','obstacle',
    'integrity','energy','hardware','interface','research','directive','glitch',
    'arc_count','sat_health','rand_direction','glitch_event',
    'creature','vehicle','structure','found_message',
  ]);
  for (const phase of PHASES) {
    merged[phase] = merged[phase].filter(tpl => {
      const vars = tpl.match(/\{(\w+)\}/g) || [];
      return vars.every(v => {
        const name = v.slice(1, -1);
        return knownVars.has(name) || name.startsWith('rand:') || name.startsWith('s_');
      });
    });
  }

  const totalNew = Object.values(merged).reduce((s, arr) => s + arr.length, 0);
  console.log(`\nMerged best-of: ${totalNew} new templates from ${best.model.label} + ${second?.model.label || 'none'}`);

  return { templates: merged, topScore: best.judgeResult?.overall_avg || 0, topModel: best.model.label };
}

// ============================================================
// APPLY TO DATA.JS
// ============================================================
function applyToDataJs(newTemplates) {
  let modified = readFileSync(dataPath, 'utf8');
  let applied = 0;

  for (const [phase, templates] of Object.entries(newTemplates)) {
    for (const template of templates) {
      const clean = template.replace(/'/g, "\\'").trim();
      if (clean.length < 10) continue;
      const pattern = new RegExp(
        `(PHASE_TEMPLATES[\\s\\S]*?${phase}:\\s*\\[[^\\]]*?)(\\s*\\])`, 'm'
      );
      const match = modified.match(pattern);
      if (match) {
        modified = modified.replace(pattern, `$1,\n    '${clean}'$2`);
        applied++;
      }
    }
  }

  if (applied > 0) {
    writeFileSync(dataPath, modified);
    console.log(`Applied ${applied} new templates to js/data.js`);
  }
  return applied;
}

// ============================================================
// MAIN
// ============================================================
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const vesselCount = parseInt(args[args.indexOf('--vessels') + 1]) || 20;
const arcCount = parseInt(args[args.indexOf('--arcs') + 1]) || 5;
const BASELINE = 5.8;

async function run() {
  console.log('=== SIGNAL LOST — TEMPLATE TOURNAMENT ===');
  console.log(`Models: ${MODELS.map(m => m.label).join(', ')}`);
  console.log(`Anchor judge: ${ANCHOR_JUDGE.label} (always used unless generating)`);
  console.log(`Calibration: ${Object.entries(JUDGE_BIAS).map(([k, v]) => `${k} ${v >= 0 ? '+' : ''}${v}`).join(', ')}`);
  console.log(`Simulation: ${vesselCount} vessels × ${arcCount} arcs per set`);
  console.log(`Baseline: ${BASELINE}/10`);
  console.log(`Mode: ${dryRun ? 'DRY RUN (no data.js changes)' : 'FULL RUN'}\n`);

  // ── PHASE 1: GENERATION ──
  console.log('=== PHASE 1: GENERATION (5 models × 7 phases, temp=0.9) ===');
  const generationResults = [];

  // Run all 5 models in parallel
  const genPromises = MODELS.map(async (model) => {
    process.stdout.write(`  ${model.label}... `);
    const templates = await generateTemplateSet(model);
    const count = Object.values(templates).reduce((s, arr) => s + arr.length, 0);
    console.log(`${count} templates across ${Object.keys(templates).length} phases`);
    return { model, templates };
  });

  const genResults = await Promise.all(genPromises);
  generationResults.push(...genResults);

  // ── PHASE 2: SIMULATION ──
  console.log('\n=== PHASE 2: SIMULATION (local, per set) ===');
  for (const set of generationResults) {
    process.stdout.write(`  ${set.model.label}... `);
    const merged = mergeTemplates(BASE_PHASE_TEMPLATES, set.templates);
    const transcripts = simulateWithTemplates(merged, vesselCount, arcCount);
    set.transcripts = transcripts;
    const totalEntries = transcripts.reduce((s, t) => s + t.logCount, 0);
    console.log(`${totalEntries} log entries from ${vesselCount} vessels`);
  }

  // ── PHASE 3: JUDGING ──
  console.log('\n=== PHASE 3: JUDGING (2 judges per set, excluding generator) ===');
  for (const set of generationResults) {
    process.stdout.write(`  ${set.model.label}... `);
    const result = await judgeTranscripts(set.transcripts, set.model, vesselCount, arcCount);
    set.judgeResult = result;
    if (result) {
      console.log(`${result.overall_avg}/10 [${result._judges.join(' + ')}]`);
    } else {
      console.log('FAILED (no valid judge responses)');
    }
  }

  // ── PHASE 4: COMPARISON ──
  console.log('\n=== PHASE 4: COMPARISON ===');
  const validSets = generationResults.filter(s => s.judgeResult);
  if (validSets.length === 0) {
    console.error('No sets received valid judge scores. Aborting.');
    return;
  }
  const bestOf = compareAndMerge(validSets);

  // ── PHASE 5: VALIDATION ──
  console.log('\n=== PHASE 5: VALIDATION (fresh simulation + 2 judges) ===');
  process.stdout.write('  Simulating with best-of templates... ');
  const validationMerged = mergeTemplates(BASE_PHASE_TEMPLATES, bestOf.templates);
  const validationTranscripts = simulateWithTemplates(validationMerged, vesselCount, arcCount);
  const valEntries = validationTranscripts.reduce((s, t) => s + t.logCount, 0);
  console.log(`${valEntries} entries`);

  process.stdout.write('  Judging... ');
  const validationResult = await judgeTranscripts(validationTranscripts, null, vesselCount, arcCount);
  if (validationResult) {
    console.log(`${validationResult.overall_avg}/10 [${validationResult._judges.join(' + ')}]`);
  } else {
    console.log('FAILED');
  }

  const validationScore = validationResult?.overall_avg || 0;
  const improved = validationScore > BASELINE;

  // ── PHASE 6: APPLICATION ──
  console.log('\n=== RESULTS ===');
  console.log(`Baseline:    ${BASELINE}/10`);
  console.log(`Best set:    ${bestOf.topScore}/10 (${bestOf.topModel})`);
  console.log(`Validation:  ${validationScore}/10`);
  console.log(`Improved:    ${improved ? 'YES' : 'NO'}`);

  if (validationResult?.scores) {
    console.log('\nValidation scores:');
    for (const [key, val] of Object.entries(validationResult.scores)) {
      const bar = '█'.repeat(Math.round(val.score)) + '░'.repeat(10 - Math.round(val.score));
      console.log(`  ${key.padEnd(24)} ${bar} ${val.score}/10`);
    }
  }

  // Save report
  const report = {
    _meta: {
      timestamp: new Date().toISOString(),
      vessel_count: vesselCount,
      arc_count: arcCount,
      baseline: BASELINE,
      dry_run: dryRun,
    },
    sets: generationResults.map(s => ({
      model: s.model.label,
      template_count: Object.values(s.templates).reduce((sum, arr) => sum + arr.length, 0),
      score: s.judgeResult?.overall_avg || null,
      judges: s.judgeResult?._judges || [],
      scores: s.judgeResult?.scores || {},
    })),
    bestOf: {
      templates: bestOf.templates,
      top_score: bestOf.topScore,
      top_model: bestOf.topModel,
    },
    validation: validationResult,
  };
  const reportPath = join(ROOT, 'tools/tournament-report.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nReport: ${reportPath}`);

  if (improved && !dryRun) {
    console.log('\nApplying best-of templates to data.js...');
    const applied = applyToDataJs(bestOf.templates);
    if (applied > 0) {
      // Run dedup
      console.log('Running dedup...');
      const { execSync } = await import('child_process');
      try {
        const out = execSync('node tools/dedup-templates.mjs', { cwd: ROOT, encoding: 'utf8' });
        console.log(out.trim());
      } catch (e) {
        console.error('Dedup failed:', e.message);
      }
      // Verify syntax
      try {
        const out = execSync('node -c js/data.js', { cwd: ROOT, encoding: 'utf8' });
        console.log('data.js syntax: OK');
      } catch (e) {
        console.error('data.js syntax check FAILED:', e.message);
      }
    }
  } else if (!improved) {
    console.log('\nValidation score did not improve over baseline. No changes applied.');
  } else {
    console.log('\nDry run — no changes applied.');
  }
}

run().catch(e => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
