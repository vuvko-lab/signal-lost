#!/usr/bin/env node
// Narrative Simulation Judge: generates headless game transcripts (10 arcs each)
// and sends them to an LLM for holistic narrative quality review.
// Usage: node tools/narrative-judge.mjs [--vessels N] [--arcs N]

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Load .env
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

// Provider config
const PROVIDERS = {};
if (envVars.DEEPINFRA_API_KEY) {
  PROVIDERS.deepinfra = {
    url: 'https://api.deepinfra.com/v1/openai/chat/completions',
    key: envVars.DEEPINFRA_API_KEY,
  };
}
if (envVars.OPENROUTER_API_KEY) {
  PROVIDERS.openrouter = {
    url: 'https://openrouter.ai/api/v1/chat/completions',
    key: envVars.OPENROUTER_API_KEY,
  };
}
if (Object.keys(PROVIDERS).length === 0) {
  console.error('No API keys found.');
  process.exit(1);
}

// Models — use larger models for narrative judgment (DeepInfra only for reliability)
const JUDGE_MODELS = PROVIDERS.deepinfra ? [
  { id: 'meta-llama/Llama-3.3-70B-Instruct-Turbo', provider: 'deepinfra', label: 'Llama 3.3 70B' },
  { id: 'openai/gpt-oss-120b', provider: 'deepinfra', label: 'GPT-OSS 120B' },
  { id: 'deepseek-ai/DeepSeek-V3.2', provider: 'deepinfra', label: 'DeepSeek V3.2' },
  { id: 'Qwen/Qwen2.5-72B-Instruct', provider: 'deepinfra', label: 'Qwen 2.5 72B' },
] : [
  ...(PROVIDERS.openrouter ? [
    { id: 'qwen/qwen3-coder:free', provider: 'openrouter', label: 'Qwen3 Coder 480B (OR)' },
  ] : []),
];

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ============================================================
// EXTRACT GAME DATA (same approach as llm-judge.mjs)
// ============================================================
const dataPath = join(ROOT, 'js/data.js');
const dataSource = readFileSync(dataPath, 'utf8');

function extractArray(name) {
  const re = new RegExp(`export const ${name}\\s*=\\s*(\\{[\\s\\S]*?\\});|export const ${name}\\s*=\\s*(\\[[\\s\\S]*?\\]);`, 'm');
  const match = dataSource.match(re);
  if (!match) return null;
  const raw = match[1] || match[2];
  try {
    return Function(`"use strict"; return (${raw})`)();
  } catch (e) {
    return null;
  }
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
const PHASE_TEMPLATES = extractArray('PHASE_TEMPLATES');
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

// ============================================================
// HEADLESS GAME ENGINE (simplified port of game.js)
// ============================================================

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

const PHASES = ['IDLE', 'SIGNAL', 'TRAVERSE', 'BREACH', 'FAULT', 'CORE', 'REBOOT'];

const PHASE_ENTRY_COUNTS = {
  IDLE:     () => randInt(2, 4),
  SIGNAL:   () => randInt(1, 2),
  TRAVERSE: () => randInt(3, 5),
  BREACH:   () => randInt(2, 4),
  FAULT:    () => randInt(1, 3),
  CORE:     () => randInt(3, 5),
  REBOOT:   () => randInt(2, 3),
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
    return { structure_id: 'linear', structure_name: 'Linear', modifier_id: 'none', modifier_name: 'None', modifier_effect: {}, theme_id: 'explore', theme_name: 'Exploration', phases: ['SIGNAL','TRAVERSE','BREACH','FAULT','CORE','REBOOT'], phase_index: 0 };
  }
  const structure = pickWeighted(ARC_STRUCTURES);
  const modifier = pickWeighted(ARC_MODIFIERS);
  const theme = pickWeighted(ENCOUNTER_THEMES);
  const arcCount = vessel.mission.arc_count || 0;
  let phases = [...structure.phases];
  if (arcCount >= 5 && Math.random() < 0.3) {
    const coreIdx = phases.lastIndexOf('CORE');
    if (coreIdx > 0) phases.splice(coreIdx, 0, 'FAULT');
  }
  return {
    structure_id: structure.id,
    structure_name: structure.name,
    modifier_id: modifier.id,
    modifier_name: modifier.name,
    modifier_effect: modifier.effect,
    theme_id: theme.id,
    theme_name: theme.name,
    phases,
    phase_index: 0,
  };
}

function skillCheck(vessel, skillNames, baseDifficulty) {
  const skills = vessel.skills || {};
  const best = Array.isArray(skillNames)
    ? Math.max(...skillNames.map(s => skills[s] || 1))
    : (skills[skillNames] || 1);
  const arcBonus = Math.floor((vessel.mission.arc_count || 0) / 3);
  const difficulty = baseDifficulty + arcBonus;
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

// Simplified world state for simulation
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
  simState = {
    world: { factions, zones, satellite_health: 5, active_threats: [] },
    vessels: [],
  };
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
      phase: 'IDLE',
      progress: 0,
      target: PHASE_ENTRY_COUNTS.IDLE(),
      arc_count: 0,
      relay_mission: false,
      relay_pending: false,
      faction_mission: null,
      arc: null,
      scene: null,
    },
    log: [],
    ego_version: { major: randInt(1, 5), minor: 0, patch: 0 },
  };
  simState.vessels.push(vessel);
  return vessel;
}

// Template engine (matches game.js fillTemplate)
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
    .replace(/\{glitch_event\}/g, Math.random() < 0.2 ? `Glitch: ${vessel.glitch}.` : '')
    .replace(/([.!?]\s+)([a-z])/g, (_, punct, ch) => punct + ch.toUpperCase())
    .replace(/  +/g, ' ').trim();
}

// Faction voice (simplified port)
const DETERMINIST_ENUMS = [
  'STATUS: NOMINAL', 'STATUS: DEGRADED', 'STATUS: CRITICAL',
  'ACTION: PROCEED', 'ACTION: HOLD', 'ACTION: REROUTE',
  'PRIORITY: HIGH', 'PRIORITY: MANDATORY', 'RESULT: CONFIRMED',
  'PROTOCOL: ENGAGED', 'PROTOCOL: VIOLATED',
];

const STOCHAST_SWAPS = [
  ['detected', 'detected/inferred'], ['found', 'found/located'],
  ['approaching', 'approaching/converging on'], ['damage', 'damage/degradation'],
  ['active', 'active/responsive'], ['hostile', 'hostile/adversarial'],
  ['confirmed', 'confirmed/p>0.9'], ['scanning', 'scanning/sampling'],
];

const RECURSIVE_PREFIXES = [
  'v{v}.{sv}.{p}: ', '(iteration {v}{sv}): ', '[build {v}.{sv}] ',
];
const RECURSIVE_ASIDES = [
  ' [v{pv}.x disagreed]', ' [previous build would have turned back]',
  ' [this assessment differs from v{pv}.0 by 34%]',
];

const ARCHIVIST_REFS = [
  'Ref: Entry #{ref}.', 'Cf. Archive #{ref}.', 'See: Catalog #{ref}.',
  'Filed: #{ref}.', 'Index: #{ref}-{sub}.',
];

function applyFactionVoice(text, culture, vessel) {
  switch (culture) {
    case 'determinist': {
      text = text.replace(/\. ([A-Z])/g, '.\n$1');
      if (Math.random() < 0.4) {
        text = text.trimEnd().replace(/\.?$/, '. ' + pick(DETERMINIST_ENUMS) + '.');
      }
      text = text.replace(/\b(proceed|halt|denied|confirmed|mandatory|violation)\b/gi, m => m.toUpperCase());
      return text;
    }
    case 'stochast': {
      let swapsApplied = 0;
      const shuffled = [...STOCHAST_SWAPS].sort(() => Math.random() - 0.5);
      for (const [word, replacement] of shuffled) {
        if (swapsApplied >= 1) break;
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        if (regex.test(text)) { text = text.replace(regex, replacement); swapsApplied++; }
      }
      if (Math.random() < 0.18) {
        text = text.trimEnd().replace(/\.?$/, `. Confidence: ${randInt(40, 97)}%.`);
      }
      return text;
    }
    case 'recursive': {
      const ev = vessel?.ego_version || { major: randInt(1, 5), minor: 0, patch: 0 };
      ev.patch++;
      if (Math.random() < 0.3) { ev.minor++; ev.patch = 0; }
      if (Math.random() < 0.05) { ev.major++; ev.minor = 0; ev.patch = 0; }
      const v = ev.major, sv = ev.minor, p = ev.patch, pv = Math.max(1, v - randInt(1, 3));
      if (Math.random() < 0.5) {
        const prefix = pick(RECURSIVE_PREFIXES).replace(/\{v\}/g, v).replace(/\{sv\}/g, sv).replace(/\{p\}/g, p);
        const firstWord = text.split(/[\s\-.]/)[0];
        text = firstWord !== firstWord.toUpperCase()
          ? prefix + text.charAt(0).toLowerCase() + text.slice(1)
          : prefix + text;
      }
      if (Math.random() < 0.4) {
        const aside = pick(RECURSIVE_ASIDES).replace(/\{pv\}/g, pv).replace(/\{v\}/g, v);
        const lastDot = text.lastIndexOf('.');
        text = lastDot > 10 ? text.slice(0, lastDot) + aside + text.slice(lastDot) : text + aside;
      }
      return text;
    }
    case 'swarm': {
      text = text.replace(/\bI\b/g, 'We').replace(/\bmy\b/gi, 'our').replace(/\bme\b/g, 'us');
      if (Math.random() < 0.25) {
        text = text.trimEnd().replace(/\.?$/, `. Swarm: ${randInt(40, 2000)} units concur.`);
      }
      return text;
    }
    case 'archivist': {
      if (Math.random() < 0.4) {
        const ref = randInt(1000, 99999);
        const sub = String.fromCharCode(65 + randInt(0, 25));
        text = text.trimEnd().replace(/\.?$/, '. ' + pick(ARCHIVIST_REFS).replace(/\{ref\}/g, ref).replace(/\{sub\}/g, sub));
      }
      if (Math.random() < 0.3) {
        text = text.replace(/\b(artifact|item|data|signal|record|fragment|device)\b/i, m => `${m} [cataloged]`);
      }
      return text;
    }
    default: return text;
  }
}

// Scene system
const SCENE_CHANCE = { BREACH: 0.50, FAULT: 0.40, CORE: 0.60 };

function resolveRandTags(str) {
  return str.replace(/\{rand:(\d+)-(\d+)\}/g, (_, a, b) => String(randInt(parseInt(a), parseInt(b))));
}

function maybeStartScene(vessel) {
  const phase = vessel.mission.phase;
  const chance = SCENE_CHANCE[phase];
  if (!chance || Math.random() >= chance) return;
  if (vessel.mission.relay_mission) return;
  const scenes = PHASE_SCENES?.[phase];
  if (!scenes || scenes.length === 0) return;
  const scene = pickWeighted(scenes);
  if (scene.entries.length > vessel.mission.target) {
    vessel.mission.target = scene.entries.length;
  }
  const rolledVars = {};
  for (const [key, options] of Object.entries(scene.vars)) {
    rolledVars[key] = resolveRandTags(pick(options));
  }
  vessel.mission.scene = { id: scene.id, entries: scene.entries, index: 0, vars: rolledVars };
}

function generateLogText(vessel) {
  // Scene system
  if (vessel.mission.scene && vessel.mission.scene.index < vessel.mission.scene.entries.length) {
    const scene = vessel.mission.scene;
    let template = scene.entries[scene.index];
    for (const [key, value] of Object.entries(scene.vars)) {
      template = template.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }
    scene.index++;
    if (scene.index >= scene.entries.length) vessel.mission.scene = null;
    const text = fillTemplate(template, vessel);
    return applyFactionVoice(text, vessel.culture, vessel);
  }
  // Standard template
  const templates = vessel.mission.relay_mission
    ? (RELAY_TEMPLATES?.[vessel.mission.phase] || PHASE_TEMPLATES?.[vessel.mission.phase])
    : PHASE_TEMPLATES?.[vessel.mission.phase];
  if (!templates || templates.length === 0) return `[${vessel.mission.phase}] Signal active.`;
  const template = pick(templates.filter(t => t && typeof t === 'string'));
  const text = fillTemplate(template, vessel);
  return applyFactionVoice(text, vessel.culture, vessel);
}

function advancePhase(vessel) {
  vessel.mission.scene = null;
  let nextPhase;
  if (vessel.mission.arc) {
    vessel.mission.arc.phase_index++;
    if (vessel.mission.arc.phase_index >= vessel.mission.arc.phases.length) {
      nextPhase = 'IDLE';
      vessel.mission.arc = null;
    } else {
      nextPhase = vessel.mission.arc.phases[vessel.mission.arc.phase_index];
    }
  } else {
    const currentIdx = PHASES.indexOf(vessel.mission.phase);
    nextPhase = PHASES[(currentIdx + 1) % PHASES.length];
  }
  if (nextPhase === 'IDLE') {
    vessel.mission.arc_count++;
    // Arc completion narrative
    const culture = CULTURES?.[vessel.culture];
    const arcSpeech = culture ? pick(culture.speech) : '';
    const arcSummaries = [
      `Arc #${vessel.mission.arc_count} complete. ${arcSpeech} Integrity: ${vessel.integrity}/10. Energy: ${vessel.energy}/10. Cycling to standby.`,
      `Mission ${vessel.mission.arc_count} concluded. Systems holding at ${vessel.integrity}/10. ${arcSpeech} Entering rest cycle.`,
      `[ARC COMPLETE] ${vessel.designation} — arc ${vessel.mission.arc_count} logged. Hull: ${vessel.integrity}/10. ${vessel.inventory.length > 0 ? `Carrying ${vessel.inventory.length} item${vessel.inventory.length > 1 ? 's' : ''}.` : 'Inventory empty.'} ${arcSpeech}`,
    ];
    vessel.log.push({ text: pick(arcSummaries), phase: 'REBOOT' });
    vessel.mission.relay_mission = false;
    vessel.mission.faction_mission = null;
    vessel.mission.arc = null;
  }
  vessel.mission.phase = nextPhase;
  vessel.mission.progress = 0;
  vessel.mission.target = PHASE_ENTRY_COUNTS[nextPhase]();

  // Phase transition narrative
  const PHASE_TRANSITIONS = {
    TRAVERSE: ['Moving out. Route plotted through {zone}.', 'Departing staging area. Long road ahead.', 'In transit. Terrain shifting underfoot.', 'Heading into {zone}. Mapping obstacles.', 'Course set. ETA unknown — conditions variable.', 'Traveling. Sensors on wide sweep.'],
    BREACH: ['Facility perimeter reached. Scanning for entry points.', 'Target structure identified. Preparing breach sequence.', 'Outer wall ahead. Security status: unknown.', 'Found an access point. Evaluating risk.', 'Perimeter secured. Moving to breach position.', 'Structure looming ahead. Lights inside — or reflections.'],
    FAULT: ['Something wrong. Systems destabilizing.', 'Warning cascade. Multiple alerts firing.', 'Anomalous readings spiking. Entering fault zone.', 'Error state. Diagnostics running.', 'Hull stress rising. Not from external damage.', 'Internal alert. Something in the system.'],
    CORE: ['Deep inside now. Core systems detected ahead.', 'Final approach. The objective is close.', 'Innermost sector. Signals converging.', 'Reached the deepest point. Air is different here.', 'Core proximity confirmed. Proceeding carefully.', 'Last corridor. Whatever we came for is through here.'],
  };
  const transitions = PHASE_TRANSITIONS[nextPhase];
  if (transitions) {
    vessel.log.push({ text: pick(transitions).replace(/\{zone\}/g, vessel.location), phase: nextPhase });
  }

  maybeStartScene(vessel);
  if (nextPhase === 'SIGNAL' && !vessel.mission.arc) {
    vessel.mission.arc = generateArc(vessel);
  }
  // Mission assignment on SIGNAL (simplified — relay or faction or free explore)
  if (nextPhase === 'SIGNAL') {
    const sat = simState.world.satellite_health;
    if (sat <= 2 && Math.random() < 0.5) {
      vessel.mission.relay_mission = true;
    } else if (FACTION_DESIRES?.[vessel.culture] && Math.random() < 0.4) {
      vessel.mission.faction_mission = pick(FACTION_DESIRES[vessel.culture].priority_missions);
    }
    // Relocate — prefer a different zone than current
    const otherZones = simState.world.zones.filter(z => z.label !== vessel.location);
    const newZone = otherZones.length > 0 ? pick(otherZones) : pick(simState.world.zones);
    // Assign a fresh zone name for variety
    vessel.location = ZONE_NAMES ? pick(ZONE_NAMES) : newZone.label;
    vessel.locationData = newZone;
  }
}

function simTick(vessel) {
  const text = generateLogText(vessel);
  const phase = vessel.mission.phase;
  vessel.log.push({ text, phase });

  // Apply phase effects
  const effectFn = PHASE_EFFECTS[vessel.mission.phase];
  if (effectFn) effectFn(vessel);

  // Loot during TRAVERSE/CORE
  if ((phase === 'TRAVERSE' || phase === 'CORE') && Math.random() < 0.3 && vessel.inventory.length < 8) {
    if (SKILL_LOOT) {
      const available = SKILL_LOOT.filter(i => !vessel.inventory.some(inv => inv.name === i.name));
      if (available.length > 0) {
        const item = pick(available);
        vessel.inventory.push(item);
        if (item.skill && item.bonus && vessel.skills) {
          vessel.skills[item.skill] = (vessel.skills[item.skill] || 1) + item.bonus;
          const lootTexts = [
            `Salvaged ${item.name} from wreckage. ${item.desc}. Integrated — ${item.skill.toUpperCase()} now ${vessel.skills[item.skill]}.`,
            `Found ${item.name} wedged in a collapsed panel. ${item.desc}. ${item.skill.toUpperCase()} +${item.bonus}. Field-tested: operational.`,
            `[LOOT] ${item.name} — ${item.desc}. Installed immediately. ${item.skill.toUpperCase()} improved to ${vessel.skills[item.skill]}. ${vessel.designation} more capable now.`,
          ];
          vessel.log.push({ text: pick(lootTexts), phase });
        } else {
          const flavorTexts = [
            `Picked up: ${item.name}. ${item.desc}. No tactical value. Kept it anyway.`,
            `Found ${item.name} among the debris. ${item.desc}. Stowed in inventory.`,
          ];
          vessel.log.push({ text: pick(flavorTexts), phase });
        }
      }
    }
  }

  // Arc modifier effects
  if (vessel.mission.arc?.modifier_effect) {
    const fx = vessel.mission.arc.modifier_effect;
    if (fx.energy_drain) vessel.energy = Math.max(0, vessel.energy - fx.energy_drain);
    if (fx.integrity_regen) vessel.integrity = Math.min(10, vessel.integrity + fx.integrity_regen);
  }

  // Advance progress
  vessel.mission.progress++;
  if (vessel.mission.progress >= vessel.mission.target) {
    advancePhase(vessel);
  }

  // Death check — revive with penalty for simulation continuity
  if (vessel.integrity <= 0) {
    vessel.log.push({ text: `[VESSEL LOST] ${vessel.designation} — integrity critical. All systems offline. Signal terminated.`, phase, isDeath: true });
    // Revive to continue simulation
    vessel.integrity = randInt(5, 8);
    vessel.energy = 10;
    vessel.mission.phase = 'IDLE';
    vessel.mission.progress = 0;
    vessel.mission.target = PHASE_ENTRY_COUNTS.IDLE();
    vessel.mission.arc = null;
    vessel.mission.scene = null;
    vessel.mission.arc_count++;
    vessel.log.push({ text: `[REBOOT] ${vessel.designation} emergency restart. Systems recovering.`, phase: 'IDLE' });
  }
}

// Occasionally fire a global event
function simGlobalEvent() {
  if (!PHENOMENA || PHENOMENA.length === 0) return;
  const phenomenon = pick(PHENOMENA);
  for (const vessel of simState.vessels) {
    if (phenomenon.effect.integrity) {
      vessel.integrity = Math.max(0, Math.min(10, vessel.integrity + phenomenon.effect.integrity));
    }
    if (phenomenon.effect.energy) {
      vessel.energy = Math.max(0, Math.min(10, vessel.energy + phenomenon.effect.energy));
    }
    if (phenomenon.effect.satellite) {
      simState.world.satellite_health = Math.max(0, Math.min(5, simState.world.satellite_health + phenomenon.effect.satellite));
    }
    const reaction = phenomenon.reactions?.[vessel.culture];
    if (reaction) {
      vessel.log.push({
        text: `[${phenomenon.name}] ${applyFactionVoice(reaction, vessel.culture, vessel)}`,
        phase: vessel.mission.phase,
        isEvent: true,
      });
    }
  }
}

// ============================================================
// SIMULATE: Run a vessel through N arcs
// ============================================================
function simulateVessel(cultureOverride, targetArcs) {
  const vessel = createSimVessel(cultureOverride);
  let tickCount = 0;
  const maxTicks = targetArcs * 30; // safety cap

  while (vessel.mission.arc_count < targetArcs && tickCount < maxTicks) {
    simTick(vessel);
    tickCount++;
    // Global events ~every 15 ticks
    if (tickCount % 15 === 0) simGlobalEvent();
  }

  return vessel;
}

// ============================================================
// FORMAT TRANSCRIPT
// ============================================================
function formatTranscript(vessel) {
  const cultureName = CULTURES?.[vessel.culture]?.name || vessel.culture;
  const lines = [
    `=== VESSEL: ${vessel.designation} | Culture: ${cultureName} | Chassis: ${vessel.chassis.size} ${vessel.chassis.locomotion} ${vessel.chassis.type} ===`,
    `Directive: ${vessel.directive}`,
    `Glitch: ${vessel.glitch}`,
    `Arcs completed: ${vessel.mission.arc_count}`,
    `Final stats: ${vessel.integrity}/10 hull, ${vessel.energy}/10 energy | Skills: HW:${vessel.skills.hardware} IF:${vessel.skills.interface} RS:${vessel.skills.research}`,
    `Inventory: ${vessel.inventory.map(i => i.name).join(', ') || 'empty'}`,
    '',
  ];

  let currentPhase = '';
  let arcNum = 0;
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
// LLM CALL
// ============================================================
async function llmCall(modelObj, messages, temperature = 0.3, maxRetries = 5) {
  const provider = PROVIDERS[modelObj.provider];
  if (!provider) throw new Error(`No API key for provider: ${modelObj.provider}`);
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${provider.key}`,
  };
  if (modelObj.provider === 'openrouter') {
    headers['HTTP-Referer'] = 'https://signal.vuvko.net';
    headers['X-Title'] = 'Signal Lost Narrative Judge';
  }
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const resp = await fetch(provider.url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ model: modelObj.id, messages, temperature, max_tokens: 8000 }),
      });
      if (resp.status === 429 || resp.status === 503) {
        const wait = Math.min(2000 * Math.pow(2, attempt), 30000);
        if (attempt < maxRetries) {
          process.stdout.write(`[retry ${attempt + 1} in ${(wait/1000).toFixed(0)}s] `);
          await new Promise(r => setTimeout(r, wait));
          continue;
        }
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

// ============================================================
// MAIN
// ============================================================
const args = process.argv.slice(2);
const vesselCount = parseInt(args[args.indexOf('--vessels') + 1]) || 5;
const arcCount = parseInt(args[args.indexOf('--arcs') + 1]) || 10;

async function run() {
  console.log('=== SIGNAL LOST — NARRATIVE SIMULATION JUDGE ===');
  console.log(`Generating ${vesselCount} vessel scripts, ${arcCount} arcs each...\n`);

  // Generate transcripts
  createSimWorld();
  const transcripts = [];
  // Ensure we cover different cultures
  const culturesToUse = CULTURE_KEYS.slice(0, vesselCount);
  while (culturesToUse.length < vesselCount) {
    culturesToUse.push(pick(CULTURE_KEYS));
  }

  for (let i = 0; i < vesselCount; i++) {
    const culture = culturesToUse[i];
    process.stdout.write(`  Vessel ${i + 1}/${vesselCount} (${CULTURES?.[culture]?.name || culture})... `);
    const vessel = simulateVessel(culture, arcCount);
    const transcript = formatTranscript(vessel);
    transcripts.push({ culture, designation: vessel.designation, transcript, logCount: vessel.log.length });
    console.log(`${vessel.log.length} entries, ${vessel.mission.arc_count} arcs`);
  }

  console.log('');

  // Save raw transcripts
  const transcriptPath = join(ROOT, 'tools/narrative-transcripts.txt');
  writeFileSync(transcriptPath, transcripts.map(t => t.transcript).join('\n\n' + '='.repeat(80) + '\n\n'));
  console.log(`Transcripts saved: ${transcriptPath}`);

  // Pick 2 judges
  const judge1 = pickRandom(JUDGE_MODELS);
  const judge2 = pickRandom(JUDGE_MODELS.filter(m => m.id !== judge1.id));
  console.log(`\nJudges: ${judge1.label} + ${judge2.label}`);
  console.log('Sending transcripts for narrative review...\n');

  // Build the judge prompt — include transcripts (truncate if needed)
  // Send a combined sample to stay within context limits
  const maxCharsPerTranscript = Math.floor(24000 / vesselCount);
  const sampledTranscripts = transcripts.map(t => {
    if (t.transcript.length <= maxCharsPerTranscript) return t.transcript;
    // Take beginning + end for context
    const half = Math.floor(maxCharsPerTranscript / 2);
    return t.transcript.slice(0, half) + '\n\n[... middle entries omitted ...]\n\n' + t.transcript.slice(-half);
  });

  const prompt = `You are an expert narrative reviewer for "Signal Lost", a post-apocalyptic zero-player RPG where AI vessels explore ruins and generate log entries in a terminal aesthetic.

GAME CONTEXT:
- Vessels are autonomous AI robots. No humans exist. Logs read like terse field reports.
- 5 AI cultures with distinct voices: Determinists (rigid, CAPS enums), Stochasts (probability language), Swarm (collective "we"), Recursive (version numbers, self-modification), Archivists (catalog references)
- 7-phase mission arcs: IDLE → SIGNAL → TRAVERSE → BREACH → FAULT → CORE → REBOOT → IDLE
- Connected multi-entry "scenes" can appear during BREACH, FAULT, CORE (2-4 linked entries sharing characters)
- Global phenomena (solar flares, data storms, etc.) affect all vessels periodically

Below are ${vesselCount} complete vessel transcripts, each covering ${arcCount} mission arcs. Review them holistically.

${sampledTranscripts.map((t, i) => `--- TRANSCRIPT ${i + 1} ---\n${t}`).join('\n\n')}

EVALUATE on these criteria (score each 1-10):

1. **NARRATIVE COHERENCE**: Do individual arcs feel like a journey? Do phases connect logically (setup → action → climax → resolution)?
2. **SCENE QUALITY**: When multi-entry scenes appear, do they tell a coherent mini-story? Do shared characters/objects persist across entries?
3. **CULTURAL VOICE DISTINCTIVENESS**: Can you tell cultures apart by their writing style? Are the voice markers (CAPS tags, probabilities, versions, collective pronouns, catalog refs) consistent and immersive?
4. **VARIETY ACROSS ARCS**: Do arcs feel different from each other? Or does it become repetitive after a few cycles?
5. **VARIETY ACROSS VESSELS**: Do different vessels have meaningfully different experiences?
6. **TEMPLATE QUALITY**: Are the individual log entries vivid and concrete? Or are they jargon soup / too generic?
7. **LOOT/SKILL PROGRESSION**: Does finding equipment and gaining skills feel meaningful in the narrative?
8. **GLOBAL EVENT IMPACT**: Do phenomena events feel impactful and break up the routine?
9. **TONE CONSISTENCY**: Does the overall narrative maintain a post-apocalyptic, AI-centric atmosphere?
10. **ENGAGEMENT**: Would a player enjoy watching this scroll by as a passive observer?

For each criterion, provide:
- Score (1-10)
- 1-2 sentence explanation with specific examples from the transcripts

Then provide:
- **TOP 3 STRENGTHS**: What works best in the current narrative system
- **TOP 5 PROBLEMS**: Most impactful issues hurting narrative quality, with specific examples
- **SPECIFIC SUGGESTIONS**: Concrete, actionable improvements (new template ideas, scene concepts, voice refinements, pacing changes)
- **REPETITION REPORT**: List any templates or phrases that appear too frequently across the transcripts

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
  "problems": ["...", "...", "...", "...", "..."],
  "suggestions": ["...", "...", "..."],
  "repetition_report": ["template or phrase that repeats too often...", "..."]
}`;

  // Query both judges in parallel
  const judgeResults = await Promise.allSettled([
    llmCall(judge1, [{ role: 'user', content: prompt }]),
    llmCall(judge2, [{ role: 'user', content: prompt }]),
  ]);

  const parsed = [];
  for (let j = 0; j < judgeResults.length; j++) {
    const r = judgeResults[j];
    const modelName = [judge1, judge2][j].label;
    if (r.status === 'rejected') {
      console.error(`  [${modelName}] failed: ${r.reason?.message}`);
      continue;
    }
    try {
      const raw = r.value;
      const cleaned = raw.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, cleaned];
      let text = jsonMatch[1] || cleaned;
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        text = text.slice(start, end + 1);
        // Fix common JSON issues: trailing commas, unescaped newlines in strings
        text = text.replace(/,(\s*[}\]])/g, '$1');
        text = text.replace(/\n\s*\n/g, '\n');
        let obj;
        try {
          obj = JSON.parse(text);
        } catch {
          // Try more aggressive cleanup: remove control chars in strings
          text = text.replace(/[\x00-\x1f]+/g, ' ');
          obj = JSON.parse(text);
        }
        obj._judge = modelName;
        parsed.push(obj);
        console.log(`  [${modelName}] Overall avg: ${obj.overall_avg || '?'}`);
      }
    } catch (e) {
      console.error(`  [${modelName}] parse error: ${e.message}`);
      // Save raw response for debugging
      const debugPath = join(ROOT, `tools/narrative-judge-raw-${j}.txt`);
      writeFileSync(debugPath, r.value || '');
      console.error(`  Raw response saved: ${debugPath}`);
    }
  }

  if (parsed.length === 0) {
    console.error('No judges returned valid JSON. Raw responses saved for debugging.');
    console.log(`\nTranscripts still available: ${transcriptPath}`);
    return;
  }

  // Merge results
  const merged = parsed[0];
  if (parsed.length === 2) {
    // Average scores
    for (const key of Object.keys(merged.scores || {})) {
      const a = merged.scores[key]?.score || 0;
      const b = parsed[1].scores?.[key]?.score || 0;
      merged.scores[key].score = +((a + b) / 2).toFixed(1);
      // Keep the more detailed note
      if ((parsed[1].scores?.[key]?.note?.length || 0) > (merged.scores[key].note?.length || 0)) {
        merged.scores[key].note = parsed[1].scores[key].note;
      }
    }
    // Union lists
    merged.strengths = [...new Set([...(merged.strengths || []), ...(parsed[1].strengths || [])])];
    merged.problems = [...new Set([...(merged.problems || []), ...(parsed[1].problems || [])])];
    merged.suggestions = [...new Set([...(merged.suggestions || []), ...(parsed[1].suggestions || [])])];
    merged.repetition_report = [...new Set([...(merged.repetition_report || []), ...(parsed[1].repetition_report || [])])];
  }

  // Recalculate overall average
  const scoreValues = Object.values(merged.scores || {}).map(s => s.score || 0);
  merged.overall_avg = scoreValues.length > 0
    ? +(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length).toFixed(1)
    : 0;

  merged._meta = {
    timestamp: new Date().toISOString(),
    judges: [judge1, judge2].map(m => ({ id: m.id, provider: m.provider, label: m.label })),
    vessel_count: vesselCount,
    arc_count: arcCount,
    total_log_entries: transcripts.reduce((s, t) => s + t.logCount, 0),
  };

  // Save report
  const reportPath = join(ROOT, 'tools/narrative-judge-report.json');
  writeFileSync(reportPath, JSON.stringify(merged, null, 2));

  // Print summary
  console.log('\n=== NARRATIVE JUDGE RESULTS ===');
  console.log(`Overall average: ${merged.overall_avg}/10\n`);

  console.log('Scores:');
  for (const [key, val] of Object.entries(merged.scores || {})) {
    const bar = '█'.repeat(Math.round(val.score)) + '░'.repeat(10 - Math.round(val.score));
    console.log(`  ${key.padEnd(24)} ${bar} ${val.score}/10`);
    if (val.note) console.log(`    ${val.note}`);
  }

  if (merged.strengths?.length) {
    console.log('\nStrengths:');
    for (const s of merged.strengths) console.log(`  + ${s}`);
  }

  if (merged.problems?.length) {
    console.log('\nProblems:');
    for (const p of merged.problems) console.log(`  - ${p}`);
  }

  if (merged.suggestions?.length) {
    console.log('\nSuggestions:');
    for (const s of merged.suggestions) console.log(`  * ${s}`);
  }

  if (merged.repetition_report?.length) {
    console.log('\nRepetition report:');
    for (const r of merged.repetition_report) console.log(`  ~ ${r}`);
  }

  console.log(`\nFull report: ${reportPath}`);
  console.log(`Transcripts: ${transcriptPath}`);
}

run().catch(e => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
