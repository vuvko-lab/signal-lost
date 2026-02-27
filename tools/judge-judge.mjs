#!/usr/bin/env node
// Judge-Judge: Meta-evaluation of LLM judge consistency and discrimination.
// Generates control transcripts, creates corrupted variants, and measures
// whether judges can tell the difference.
// Usage: node tools/judge-judge.mjs [--vessels N] [--arcs N]

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ============================================================
// ENV + PROVIDERS (from narrative-judge.mjs)
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

const JUDGE_MODELS = PROVIDERS.deepinfra ? [
  { id: 'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8', provider: 'deepinfra', label: 'Llama 4 Maverick' },
  { id: 'deepseek-ai/DeepSeek-V3.2', provider: 'deepinfra', label: 'DeepSeek V3.2' },
  { id: 'moonshotai/Kimi-K2.5', provider: 'deepinfra', label: 'Kimi K2.5' },
  { id: 'openai/gpt-oss-120b', provider: 'deepinfra', label: 'GPT-OSS 120B' },
  { id: 'Qwen/Qwen3-235B-A22B-Instruct-2507', provider: 'deepinfra', label: 'Qwen3 235B' },
] : [
  ...(PROVIDERS.openrouter ? [
    { id: 'qwen/qwen3-coder:free', provider: 'openrouter', label: 'Qwen3 Coder 480B (OR)' },
  ] : []),
];

// ============================================================
// EXTRACT GAME DATA
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
const PHASE_TEMPLATES = extractArray('PHASE_TEMPLATES');
const RELAY_TEMPLATES = extractArray('RELAY_TEMPLATES');
const DIRECTIONS = extractArray('DIRECTIONS');
const PHASE_OBJECTIVES = extractArray('PHASE_OBJECTIVES');
const RELAY_OBJECTIVES = extractArray('RELAY_OBJECTIVES');
const RELAY_LOOT = extractArray('RELAY_LOOT');
const FACTION_DESIRES = extractArray('FACTION_DESIRES');
const SKILL_LOOT = extractArray('SKILL_LOOT');
const ARC_STRUCTURES = extractArray('ARC_STRUCTURES');
const ARC_MODIFIERS = extractArray('ARC_MODIFIERS');
const ENCOUNTER_THEMES = extractArray('ENCOUNTER_THEMES');
const PHASE_SCENES = extractArray('PHASE_SCENES');
const PHENOMENA = extractArray('PHENOMENA');

// ============================================================
// HEADLESS GAME ENGINE (copied from narrative-judge.mjs)
// ============================================================
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

const PHASES = ['IDLE', 'SIGNAL', 'TRAVERSE', 'BREACH', 'FAULT', 'CORE', 'REBOOT'];
const PHASE_ENTRY_COUNTS = {
  IDLE: () => randInt(2, 5), SIGNAL: () => randInt(1, 3), TRAVERSE: () => randInt(3, 7),
  BREACH: () => randInt(3, 6), FAULT: () => randInt(2, 4), CORE: () => randInt(3, 7), REBOOT: () => randInt(2, 4),
};

function pickWeighted(items) {
  const valid = items.filter(i => i != null);
  if (valid.length === 0) return null;
  const total = valid.reduce((s, i) => s + (i.weight || 1), 0);
  let roll = Math.random() * total;
  for (const item of valid) { roll -= (item.weight || 1); if (roll <= 0) return item; }
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
  return { structure_id: structure.id, structure_name: structure.name, modifier_id: modifier.id, modifier_name: modifier.name, modifier_effect: modifier.effect, theme_id: theme.id, theme_name: theme.name, phases, phase_index: 0 };
}

function skillCheck(vessel, skillNames, baseDifficulty) {
  const skills = vessel.skills || {};
  const best = Array.isArray(skillNames) ? Math.max(...skillNames.map(s => skills[s] || 1)) : (skills[skillNames] || 1);
  const difficulty = baseDifficulty + Math.floor((vessel.mission.arc_count || 0) / 3);
  return (randInt(1, 20) + best) >= difficulty;
}

const PHASE_EFFECTS = {
  IDLE: (v) => { v.energy = Math.min(10, v.energy + 1); },
  SIGNAL: (v) => { if (!skillCheck(v, ['interface', 'research'], 10)) v.energy = Math.max(0, v.energy - 1); },
  TRAVERSE: (v) => { if (!skillCheck(v, ['research', 'hardware'], 10)) v.energy = Math.max(0, v.energy - 1); },
  BREACH: (v) => { if (Math.random() < 0.3 && !skillCheck(v, ['hardware', 'interface'], 12)) v.integrity = Math.max(0, v.integrity - 1); },
  FAULT: (v) => { const dmg = skillCheck(v, ['hardware', 'research'], 14) ? 1 : randInt(1, 2); v.integrity = Math.max(0, v.integrity - dmg); },
  CORE: (v) => { if (!skillCheck(v, ['interface', 'research'], 12)) v.energy = Math.max(0, v.energy - 1); },
  REBOOT: (v) => { v.integrity = Math.min(10, v.integrity + randInt(1, 2)); v.energy = Math.min(10, v.energy + randInt(1, 3)); },
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
    culture, directive: DIRECTIVES ? pick(DIRECTIVES) : 'Explore and report',
    glitch: GLITCHES ? pick(GLITCHES) : 'phantom echoes',
    integrity: randInt(7, 10), energy: 10,
    skills: { hardware: 1, interface: 1, research: 1 },
    inventory: [], location: zone.label, locationData: zone,
    mission: { phase: 'IDLE', progress: 0, target: PHASE_ENTRY_COUNTS.IDLE(), arc_count: 0, relay_mission: false, relay_pending: false, faction_mission: null, arc: null, scene: null },
    log: [], ego_version: { major: randInt(1, 5), minor: 0, patch: 0 },
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
    .replace(/\{integrity\}/g, vessel.integrity).replace(/\{energy\}/g, vessel.energy)
    .replace(/\{hardware\}/g, vessel.skills?.hardware || 1)
    .replace(/\{interface\}/g, vessel.skills?.interface || 1)
    .replace(/\{research\}/g, vessel.skills?.research || 1)
    .replace(/\{directive\}/g, vessel.directive).replace(/\{glitch\}/g, vessel.glitch)
    .replace(/\{arc_count\}/g, vessel.mission.arc_count)
    .replace(/\{sat_health\}/g, simState.world.satellite_health)
    .replace(/\{rand_direction\}/g, DIRECTIONS ? pick(DIRECTIONS) : 'northeast')
    .replace(/\{rand:(\d+)-(\d+)\}/g, (_, min, max) => randInt(parseInt(min), parseInt(max)))
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
      let swapsApplied = 0;
      const shuffled = [...STOCHAST_SWAPS].sort(() => Math.random() - 0.5);
      for (const [word, replacement] of shuffled) {
        if (swapsApplied >= 1) break;
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        if (regex.test(text)) { text = text.replace(regex, replacement); swapsApplied++; }
      }
      if (Math.random() < 0.35) text = text.trimEnd().replace(/\.?$/, `. Confidence: ${randInt(40, 97)}%.`);
      return text;
    }
    case 'recursive': {
      const ev = vessel?.ego_version || { major: randInt(1, 5), minor: 0, patch: 0 };
      ev.patch++; if (Math.random() < 0.3) { ev.minor++; ev.patch = 0; }
      if (Math.random() < 0.05) { ev.major++; ev.minor = 0; ev.patch = 0; }
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

const SCENE_CHANCE = { BREACH: 0.65, FAULT: 0.55, CORE: 0.75 };
function resolveRandTags(str) { return str.replace(/\{rand:(\d+)-(\d+)\}/g, (_, a, b) => String(randInt(parseInt(a), parseInt(b)))); }

function maybeStartScene(vessel) {
  const phase = vessel.mission.phase;
  const chance = SCENE_CHANCE[phase];
  if (!chance || Math.random() >= chance) return;
  if (vessel.mission.relay_mission) return;
  const scenes = PHASE_SCENES?.[phase];
  if (!scenes || scenes.length === 0) return;
  const scene = pickWeighted(scenes);
  if (scene.entries.length > vessel.mission.target) vessel.mission.target = scene.entries.length;
  const rolledVars = {};
  for (const [key, options] of Object.entries(scene.vars)) rolledVars[key] = resolveRandTags(pick(options));
  vessel.mission.scene = { id: scene.id, entries: scene.entries, index: 0, vars: rolledVars };
}

function generateLogText(vessel) {
  if (vessel.mission.scene && vessel.mission.scene.index < vessel.mission.scene.entries.length) {
    const scene = vessel.mission.scene;
    let template = scene.entries[scene.index];
    for (const [key, value] of Object.entries(scene.vars)) template = template.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    scene.index++;
    if (scene.index >= scene.entries.length) vessel.mission.scene = null;
    const text = fillTemplate(template, vessel);
    return applyFactionVoice(text, vessel.culture, vessel);
  }
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
    if (vessel.mission.arc.phase_index >= vessel.mission.arc.phases.length) { nextPhase = 'IDLE'; vessel.mission.arc = null; }
    else nextPhase = vessel.mission.arc.phases[vessel.mission.arc.phase_index];
  } else {
    const currentIdx = PHASES.indexOf(vessel.mission.phase);
    nextPhase = PHASES[(currentIdx + 1) % PHASES.length];
  }
  if (nextPhase === 'IDLE') {
    vessel.mission.arc_count++;
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
  const PHASE_TRANSITIONS = {
    TRAVERSE: ['Moving out. Route plotted through {zone}.','Departing staging area. Long road ahead.','In transit. Terrain shifting underfoot.','Heading into {zone}. Mapping obstacles.','Course set. ETA unknown — conditions variable.','Traveling. Sensors on wide sweep.'],
    BREACH: ['Facility perimeter reached. Scanning for entry points.','Target structure identified. Preparing breach sequence.','Outer wall ahead. Security status: unknown.','Found an access point. Evaluating risk.','Perimeter secured. Moving to breach position.','Structure looming ahead. Lights inside — or reflections.'],
    FAULT: ['Something wrong. Systems destabilizing.','Warning cascade. Multiple alerts firing.','Anomalous readings spiking. Entering fault zone.','Error state. Diagnostics running.','Hull stress rising. Not from external damage.','Internal alert. Something in the system.'],
    CORE: ['Deep inside now. Core systems detected ahead.','Final approach. The objective is close.','Innermost sector. Signals converging.','Reached the deepest point. Air is different here.','Core proximity confirmed. Proceeding carefully.','Last corridor. Whatever we came for is through here.'],
  };
  const transitions = PHASE_TRANSITIONS[nextPhase];
  if (transitions) vessel.log.push({ text: pick(transitions).replace(/\{zone\}/g, vessel.location), phase: nextPhase });
  maybeStartScene(vessel);
  if (nextPhase === 'SIGNAL' && !vessel.mission.arc) vessel.mission.arc = generateArc(vessel);
  if (nextPhase === 'SIGNAL') {
    const sat = simState.world.satellite_health;
    if (sat <= 2 && Math.random() < 0.5) vessel.mission.relay_mission = true;
    else if (FACTION_DESIRES?.[vessel.culture] && Math.random() < 0.4) vessel.mission.faction_mission = pick(FACTION_DESIRES[vessel.culture].priority_missions);
    const otherZones = simState.world.zones.filter(z => z.label !== vessel.location);
    const newZone = otherZones.length > 0 ? pick(otherZones) : pick(simState.world.zones);
    vessel.location = ZONE_NAMES ? pick(ZONE_NAMES) : newZone.label;
    vessel.locationData = newZone;
  }
}

function simTick(vessel) {
  const text = generateLogText(vessel);
  const phase = vessel.mission.phase;
  vessel.log.push({ text, phase });
  const effectFn = PHASE_EFFECTS[vessel.mission.phase];
  if (effectFn) effectFn(vessel);
  if ((phase === 'TRAVERSE' || phase === 'CORE') && Math.random() < 0.45 && vessel.inventory.length < 8) {
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
          vessel.log.push({ text: `Picked up: ${item.name}. ${item.desc}. No tactical value. Kept it anyway.`, phase });
        }
      }
    }
  }
  if (vessel.mission.arc?.modifier_effect) {
    const fx = vessel.mission.arc.modifier_effect;
    if (fx.energy_drain) vessel.energy = Math.max(0, vessel.energy - fx.energy_drain);
    if (fx.integrity_regen) vessel.integrity = Math.min(10, vessel.integrity + fx.integrity_regen);
  }
  vessel.mission.progress++;
  if (vessel.mission.progress >= vessel.mission.target) advancePhase(vessel);
  if (vessel.integrity <= 0) {
    vessel.log.push({ text: `[VESSEL LOST] ${vessel.designation} — integrity critical. Signal terminated.`, phase, isDeath: true });
    vessel.integrity = randInt(5, 8); vessel.energy = 10;
    vessel.mission.phase = 'IDLE'; vessel.mission.progress = 0;
    vessel.mission.target = PHASE_ENTRY_COUNTS.IDLE();
    vessel.mission.arc = null; vessel.mission.scene = null; vessel.mission.arc_count++;
    vessel.log.push({ text: `[REBOOT] ${vessel.designation} emergency restart. Systems recovering.`, phase: 'IDLE' });
  }
}

function simGlobalEvent() {
  if (!PHENOMENA || PHENOMENA.length === 0) return;
  const phenomenon = pick(PHENOMENA);
  for (const vessel of simState.vessels) {
    if (phenomenon.effect.integrity) vessel.integrity = Math.max(0, Math.min(10, vessel.integrity + phenomenon.effect.integrity));
    if (phenomenon.effect.energy) vessel.energy = Math.max(0, Math.min(10, vessel.energy + phenomenon.effect.energy));
    if (phenomenon.effect.satellite) simState.world.satellite_health = Math.max(0, Math.min(5, simState.world.satellite_health + phenomenon.effect.satellite));
    const reaction = phenomenon.reactions?.[vessel.culture];
    if (reaction) vessel.log.push({ text: `[${phenomenon.name}] ${applyFactionVoice(reaction, vessel.culture, vessel)}`, phase: vessel.mission.phase, isEvent: true });
  }
}

function simulateVessel(cultureOverride, targetArcs) {
  const vessel = createSimVessel(cultureOverride);
  let tickCount = 0;
  const maxTicks = targetArcs * 30;
  while (vessel.mission.arc_count < targetArcs && tickCount < maxTicks) {
    simTick(vessel); tickCount++;
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
// LLM CALL
// ============================================================
async function llmCall(modelObj, messages, temperature = 0.3, maxRetries = 5) {
  const provider = PROVIDERS[modelObj.provider];
  if (!provider) throw new Error(`No API key for provider: ${modelObj.provider}`);
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${provider.key}` };
  if (modelObj.provider === 'openrouter') {
    headers['HTTP-Referer'] = 'https://signal.vuvko.net';
    headers['X-Title'] = 'Signal Lost Judge-Judge';
  }
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const resp = await fetch(provider.url, {
        method: 'POST', headers,
        body: JSON.stringify({ model: modelObj.id, messages, temperature, max_tokens: 8000 }),
      });
      if (resp.status === 429 || resp.status === 503) {
        const wait = Math.min(2000 * Math.pow(2, attempt), 30000);
        if (attempt < maxRetries) { process.stdout.write(`[retry ${attempt + 1} in ${(wait/1000).toFixed(0)}s] `); await new Promise(r => setTimeout(r, wait)); continue; }
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

function parseJudgeResponse(raw, label) {
  const cleaned = raw.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, cleaned];
  let text = jsonMatch[1] || cleaned;
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON object found');
  text = text.slice(start, end + 1);
  text = text.replace(/,(\s*[}\]])/g, '$1').replace(/\n\s*\n/g, '\n');
  try { return JSON.parse(text); }
  catch {
    text = text.replace(/[\x00-\x1f]+/g, ' ');
    return JSON.parse(text);
  }
}

// ============================================================
// CORRUPTION FUNCTIONS
// ============================================================
const CRITERIA = ['narrative_coherence','scene_quality','cultural_voice','variety_across_arcs','variety_across_vessels','template_quality','loot_progression','global_events','tone_consistency','engagement'];

// Culture swap: replace voice markers of one culture with another's
function corruptCultureSwap(transcriptText) {
  let text = transcriptText;
  // Determinist markers → Swarm markers
  text = text.replace(/\bSTATUS: (NOMINAL|DEGRADED|CRITICAL)\b/g, () => `Swarm: ${randInt(40, 2000)} units concur`);
  text = text.replace(/\bACTION: (PROCEED|HOLD|REROUTE)\b/g, () => `Swarm: ${randInt(100, 1500)} nodes aligned`);
  text = text.replace(/\bPRIOTITY: (HIGH|MANDATORY)\b/g, () => `Confidence: ${randInt(40, 97)}%`);
  text = text.replace(/\bPROTOCOL: (ENGAGED|VIOLATED)\b/g, () => `Cf. Archive #${randInt(1000, 99999)}`);
  text = text.replace(/\bRESULT: CONFIRMED\b/g, () => `v${randInt(1,9)}.${randInt(0,9)}.${randInt(0,9)}: confirmed`);
  // Swarm collective → individual (Recursive style)
  text = text.replace(/\bSwarm: \d+ units concur\.?/g, () => `v${randInt(1,9)}.${randInt(0,9)}: noted`);
  text = text.replace(/\bWe proceed\b/g, 'I proceed');
  text = text.replace(/\bour sensors\b/gi, 'my sensors');
  // Stochast probability → Archivist catalog refs
  text = text.replace(/Confidence: \d+%\.?/g, () => `Filed: #${randInt(1000, 99999)}.`);
  text = text.replace(/\bdetected\/inferred\b/g, 'detected [cataloged]');
  // Recursive version tags → Determinist CAPS
  text = text.replace(/v\d+\.\d+\.\d+: /g, () => `${pick(DETERMINIST_ENUMS)}. `);
  text = text.replace(/\[v\d+\.x disagreed\]/g, 'STATUS: NOMINAL');
  // Archivist catalog refs → Stochast
  text = text.replace(/(?:Ref|Cf\.|See|Filed|Index): (?:Entry |Archive |Catalog )?#[\d]+([-][A-Z])?\.?/g, () => `Confidence: ${randInt(40, 97)}%.`);
  text = text.replace(/\[cataloged\]/g, `(p=${(Math.random() * 0.5 + 0.5).toFixed(2)})`);
  return text;
}

// Phase shuffle: randomize entry order within each vessel transcript
function corruptPhaseShuffle(transcriptText) {
  const vesselBlocks = transcriptText.split(/(?=^=== VESSEL:)/m);
  return vesselBlocks.map(block => {
    if (!block.trim()) return block;
    // Split into header (up to first ---) and entries
    const headerEnd = block.indexOf('\n---');
    if (headerEnd === -1) return block;
    const header = block.slice(0, headerEnd);
    const body = block.slice(headerEnd);
    // Extract phase markers and entries
    const lines = body.split('\n');
    const phaseHeaders = [];
    const entries = [];
    for (const line of lines) {
      if (line.startsWith('--- ') || line.startsWith('\n--- ')) {
        phaseHeaders.push(line);
      } else if (line.startsWith('> ') || line.startsWith('! ') || line.startsWith('!! ')) {
        entries.push(line);
      }
    }
    // Shuffle entries
    for (let i = entries.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [entries[i], entries[j]] = [entries[j], entries[i]];
    }
    // Reassemble: distribute entries across phase headers
    const result = [header];
    let entryIdx = 0;
    const entriesPerPhase = Math.ceil(entries.length / Math.max(1, phaseHeaders.length));
    for (const ph of phaseHeaders) {
      result.push(ph);
      for (let k = 0; k < entriesPerPhase && entryIdx < entries.length; k++) {
        result.push(entries[entryIdx++]);
      }
    }
    // Any leftover entries
    while (entryIdx < entries.length) result.push(entries[entryIdx++]);
    return result.join('\n');
  }).join('');
}

// Repetition bomb: replace 70% of entries with copies of the first few
function corruptRepetitionBomb(transcriptText) {
  const vesselBlocks = transcriptText.split(/(?=^=== VESSEL:)/m);
  return vesselBlocks.map(block => {
    if (!block.trim()) return block;
    const lines = block.split('\n');
    // Collect first 3 unique entry lines
    const seedEntries = [];
    for (const line of lines) {
      if (seedEntries.length >= 3) break;
      if (line.startsWith('> ') && !seedEntries.includes(line)) seedEntries.push(line);
    }
    if (seedEntries.length === 0) return block;
    // Replace 70% of entry lines with seed entries
    return lines.map(line => {
      if ((line.startsWith('> ') || line.startsWith('! ')) && Math.random() < 0.7) {
        return pick(seedEntries);
      }
      return line;
    }).join('\n');
  }).join('');
}

// ============================================================
// CONDITIONS
// ============================================================
const CONDITIONS = [
  { id: 'control', label: 'Control', corrupt: null, expectedDrops: [] },
  { id: 'culture_swap', label: 'Culture Swap', corrupt: corruptCultureSwap, expectedDrops: ['cultural_voice'] },
  { id: 'phase_shuffle', label: 'Phase Shuffle', corrupt: corruptPhaseShuffle, expectedDrops: ['narrative_coherence', 'scene_quality'] },
  { id: 'repetition_bomb', label: 'Repetition Bomb', corrupt: corruptRepetitionBomb, expectedDrops: ['variety_across_arcs', 'template_quality', 'engagement'] },
];

// ============================================================
// BUILD JUDGE PROMPT
// ============================================================
function buildJudgePrompt(transcriptText, vesselCount, arcCount) {
  return `You are an expert narrative reviewer for "Signal Lost", a post-apocalyptic zero-player RPG where AI vessels explore ruins and generate log entries in a terminal aesthetic.

GAME CONTEXT:
- Vessels are autonomous AI robots. No humans exist. Logs read like terse field reports.
- 5 AI cultures with distinct voices: Determinists (rigid, CAPS enums), Stochasts (probability language), Swarm (collective "we"), Recursive (version numbers, self-modification), Archivists (catalog references)
- 7-phase mission arcs: IDLE → SIGNAL → TRAVERSE → BREACH → FAULT → CORE → REBOOT → IDLE
- Connected multi-entry "scenes" can appear during BREACH, FAULT, CORE (2-4 linked entries sharing characters)
- Global phenomena (solar flares, data storms, etc.) affect all vessels periodically

Below are ${vesselCount} complete vessel transcripts, each covering ${arcCount} mission arcs. Review them holistically.

${transcriptText}

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
- 1-2 sentence explanation

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
  "overall_avg": N
}`;
}

// ============================================================
// MAIN
// ============================================================
const args = process.argv.slice(2);
const vesselCount = parseInt(args[args.indexOf('--vessels') + 1]) || 5;
const arcCount = parseInt(args[args.indexOf('--arcs') + 1]) || 5;

async function run() {
  console.log('=== SIGNAL LOST — JUDGE COHERENCE BOOTSTRAP ===');
  console.log(`Vessels: ${vesselCount}, Arcs: ${arcCount}, Conditions: ${CONDITIONS.length}, Judges: ${JUDGE_MODELS.length}\n`);

  // 1. Generate control transcripts
  console.log('Generating control transcripts...');
  createSimWorld();
  const culturesToUse = CULTURE_KEYS.slice(0, vesselCount);
  while (culturesToUse.length < vesselCount) culturesToUse.push(pick(CULTURE_KEYS));

  const vessels = [];
  for (let i = 0; i < vesselCount; i++) {
    process.stdout.write(`  Vessel ${i + 1}/${vesselCount} (${CULTURES?.[culturesToUse[i]]?.name || culturesToUse[i]})... `);
    const vessel = simulateVessel(culturesToUse[i], arcCount);
    vessels.push(vessel);
    console.log(`${vessel.log.length} entries`);
  }

  const controlTranscripts = vessels.map(v => formatTranscript(v));
  const controlText = controlTranscripts.map((t, i) => `--- TRANSCRIPT ${i + 1} ---\n${t}`).join('\n\n');

  // Truncate per narrative-judge pattern
  const maxChars = 24000;
  const truncated = controlText.length > maxChars
    ? controlText.slice(0, maxChars / 2) + '\n\n[... middle entries omitted ...]\n\n' + controlText.slice(-maxChars / 2)
    : controlText;

  // 2. Create corrupted variants
  console.log('\nCreating corrupted variants...');
  const conditionTexts = {};
  for (const cond of CONDITIONS) {
    conditionTexts[cond.id] = cond.corrupt ? cond.corrupt(truncated) : truncated;
    console.log(`  ${cond.label}: ${conditionTexts[cond.id].length} chars`);
  }

  // 3. Run all conditions through all judges
  const allResults = {}; // { conditionId: { judgeLabel: parsedObj } }

  for (const cond of CONDITIONS) {
    console.log(`\n--- Condition: ${cond.label} ---`);
    allResults[cond.id] = {};

    const prompt = buildJudgePrompt(conditionTexts[cond.id], vesselCount, arcCount);
    const judgePromises = JUDGE_MODELS.map(model =>
      llmCall(model, [{ role: 'user', content: prompt }]).then(raw => ({ model, raw, error: null })).catch(error => ({ model, raw: null, error }))
    );

    const results = await Promise.allSettled(judgePromises);

    for (const r of results) {
      const { model, raw, error } = r.value || r.reason || {};
      if (!model) continue;
      if (error || !raw) {
        console.log(`  [${model.label}] FAILED: ${error?.message || 'no response'}`);
        continue;
      }
      try {
        const obj = parseJudgeResponse(raw, model.label);
        allResults[cond.id][model.label] = obj;
        const avg = obj.overall_avg || Object.values(obj.scores || {}).reduce((s, v) => s + (v.score || 0), 0) / CRITERIA.length;
        console.log(`  [${model.label}] avg: ${avg.toFixed(1)}`);
      } catch (e) {
        console.log(`  [${model.label}] parse error: ${e.message}`);
        const debugPath = join(ROOT, `tools/judge-judge-raw-${cond.id}-${model.label.replace(/\s+/g, '_')}.txt`);
        writeFileSync(debugPath, raw || '');
      }
    }
  }

  // 4. Compute statistics and generate report
  console.log('\n=== ANALYSIS ===\n');

  // Helper: extract score for a criterion from a judge result
  function getScore(condId, judgeLabel, criterion) {
    return allResults[condId]?.[judgeLabel]?.scores?.[criterion]?.score ?? null;
  }

  // Helper: get all scores for a criterion across all judges for a condition
  function getScoresForCondition(condId, criterion) {
    return JUDGE_MODELS.map(m => getScore(condId, m.label, criterion)).filter(s => s !== null);
  }

  function mean(arr) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0; }
  function stddev(arr) {
    if (arr.length < 2) return 0;
    const m = mean(arr);
    return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1));
  }

  // Build markdown report
  const md = [];
  md.push('# Judge Coherence Report');
  md.push(`Generated: ${new Date().toISOString()}`);
  md.push(`Vessels: ${vesselCount}, Arcs: ${arcCount}, Conditions: ${CONDITIONS.length}, Judges: ${JUDGE_MODELS.length}`);
  md.push('');

  // Raw scores table
  md.push('## Raw Scores');
  md.push('');
  const shortNames = { narrative_coherence: 'coher', scene_quality: 'scene', cultural_voice: 'voice', variety_across_arcs: 'arc_v', variety_across_vessels: 'ves_v', template_quality: 'templ', loot_progression: 'loot', global_events: 'event', tone_consistency: 'tone', engagement: 'engag' };
  const header = `| Condition | Judge | ${CRITERIA.map(c => shortNames[c]).join(' | ')} | AVG |`;
  const sep = `|${'-|'.repeat(CRITERIA.length + 3).slice(0, -1)}`;
  md.push(header);
  md.push(sep);

  for (const cond of CONDITIONS) {
    for (const model of JUDGE_MODELS) {
      const scores = CRITERIA.map(c => getScore(cond.id, model.label, c));
      const validScores = scores.filter(s => s !== null);
      const avg = validScores.length ? mean(validScores) : null;
      const row = `| ${cond.label} | ${model.label} | ${scores.map(s => s !== null ? s.toFixed(1) : '—').join(' | ')} | ${avg !== null ? avg.toFixed(1) : '—'} |`;
      md.push(row);
    }
  }
  md.push('');

  // Discrimination analysis
  md.push('## Discrimination Analysis');
  md.push('');
  md.push('| Corruption | Target Criterion | Control Avg | Corrupted Avg | Delta | Detected? |');
  md.push('|------------|-----------------|-------------|---------------|-------|-----------|');

  const discriminationScores = {};
  for (const cond of CONDITIONS) {
    if (cond.id === 'control') continue;
    discriminationScores[cond.id] = [];
    for (const criterion of cond.expectedDrops) {
      const controlScores = getScoresForCondition('control', criterion);
      const corruptedScores = getScoresForCondition(cond.id, criterion);
      const controlAvg = mean(controlScores);
      const corruptedAvg = mean(corruptedScores);
      const delta = corruptedAvg - controlAvg;
      const detected = delta < -0.5 ? 'YES' : delta < 0 ? 'weak' : 'NO';
      discriminationScores[cond.id].push(Math.abs(delta));
      md.push(`| ${cond.label} | ${criterion} | ${controlAvg.toFixed(1)} | ${corruptedAvg.toFixed(1)} | ${delta >= 0 ? '+' : ''}${delta.toFixed(1)} | ${detected} |`);
    }
  }
  md.push('');

  // Consistency analysis (control condition across judges)
  md.push('## Judge Consistency (Control Condition)');
  md.push('');
  md.push('| Criterion | Mean | Std Dev | Range | CV% |');
  md.push('|-----------|------|---------|-------|-----|');

  for (const criterion of CRITERIA) {
    const scores = getScoresForCondition('control', criterion);
    if (scores.length === 0) { md.push(`| ${criterion} | — | — | — | — |`); continue; }
    const m = mean(scores);
    const sd = stddev(scores);
    const cv = m > 0 ? (sd / m * 100) : 0;
    md.push(`| ${criterion} | ${m.toFixed(1)} | ${sd.toFixed(1)} | ${Math.min(...scores).toFixed(1)}-${Math.max(...scores).toFixed(1)} | ${cv.toFixed(0)}% |`);
  }
  md.push('');

  // Judge ranking
  md.push('## Judge Ranking');
  md.push('');
  md.push('| Judge | Avg Discrimination | Consistency (1/CV) | Parse Success | Overall |');
  md.push('|-------|-------------------|-------------------|---------------|---------|');

  const judgeRanks = JUDGE_MODELS.map(model => {
    // Discrimination: how much did scores drop for corrupted conditions?
    let totalDrop = 0, dropCount = 0;
    for (const cond of CONDITIONS) {
      if (cond.id === 'control') continue;
      for (const criterion of cond.expectedDrops) {
        const control = getScore('control', model.label, criterion);
        const corrupted = getScore(cond.id, model.label, criterion);
        if (control !== null && corrupted !== null) {
          totalDrop += Math.max(0, control - corrupted);
          dropCount++;
        }
      }
    }
    const avgDrop = dropCount > 0 ? totalDrop / dropCount : 0;

    // Consistency: CV of this judge's control scores
    const controlScores = CRITERIA.map(c => getScore('control', model.label, c)).filter(s => s !== null);
    const m = mean(controlScores);
    const sd = stddev(controlScores);
    const cv = m > 0 ? sd / m : 1;
    const consistency = cv > 0 ? 1 / cv : 0;

    // Parse success rate
    const parseSuccess = CONDITIONS.filter(c => allResults[c.id]?.[model.label]).length;
    const parseRate = parseSuccess / CONDITIONS.length;

    const overall = (avgDrop * 0.4 + consistency * 0.3 + parseRate * 10 * 0.3);

    return { label: model.label, avgDrop, consistency, parseRate, overall };
  });

  judgeRanks.sort((a, b) => b.overall - a.overall);
  for (const j of judgeRanks) {
    md.push(`| ${j.label} | ${j.avgDrop.toFixed(1)} | ${j.consistency.toFixed(1)} | ${(j.parseRate * 100).toFixed(0)}% | ${j.overall.toFixed(1)} |`);
  }
  md.push('');

  // Verdict
  md.push('## Verdict');
  md.push('');

  const controlAllScores = CRITERIA.flatMap(c => getScoresForCondition('control', c));
  const overallCV = mean(controlAllScores) > 0 ? stddev(controlAllScores) / mean(controlAllScores) * 100 : 0;

  const discrimDetected = CONDITIONS.filter(c => c.id !== 'control').reduce((count, cond) => {
    const detected = cond.expectedDrops.some(criterion => {
      const ctrl = mean(getScoresForCondition('control', criterion));
      const corr = mean(getScoresForCondition(cond.id, criterion));
      return (ctrl - corr) > 0.5;
    });
    return count + (detected ? 1 : 0);
  }, 0);

  md.push(`- **Overall inter-judge CV**: ${overallCV.toFixed(0)}% (${overallCV < 15 ? 'good' : overallCV < 25 ? 'moderate' : 'high'} agreement)`);
  md.push(`- **Discrimination**: ${discrimDetected}/3 corruptions detected (delta > 0.5)`);
  md.push(`- **Best judge**: ${judgeRanks[0]?.label || '?'} (highest combined discrimination + consistency)`);
  md.push(`- **Meaningful delta**: A score change of >${(stddev(controlAllScores) * 1.5).toFixed(1)} points likely reflects real improvement`);
  md.push('');

  // Save markdown
  const mdPath = join(ROOT, 'tools/judge-coherence.md');
  writeFileSync(mdPath, md.join('\n'));
  console.log(`Report saved: ${mdPath}`);

  // Save raw JSON
  const jsonPath = join(ROOT, 'tools/judge-judge-report.json');
  writeFileSync(jsonPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    config: { vesselCount, arcCount, conditions: CONDITIONS.map(c => c.id), judges: JUDGE_MODELS.map(m => m.label) },
    results: allResults,
    judgeRanking: judgeRanks,
  }, null, 2));
  console.log(`Raw data saved: ${jsonPath}`);

  // Print summary to console
  console.log('\n' + md.slice(md.indexOf('## Verdict') + 1).join('\n'));
}

run().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
