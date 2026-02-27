// === GAME STATE & PHASE MACHINE ===

import {
  pick, randInt, DESIGNATIONS, CHASSIS_SIZES, CHASSIS_LOCOMOTION, CHASSIS_TYPES,
  CULTURES, CULTURE_KEYS, DIRECTIVES, GLITCHES, ZONE_TYPES, ZONE_NAMES,
  LOOT, NPCS, WEATHER, OBSTACLES, PHASE_TEMPLATES,
  PHENOMENA, DIRECTIONS, PHASE_OBJECTIVES,
  RELAY_TEMPLATES, RELAY_OBJECTIVES, RELAY_LOOT,
  INTERACTION_TEMPLATES, FACTION_DESIRES, WORLD_THREATS, SKILL_LOOT,
  ARC_STRUCTURES, ARC_MODIFIERS, ENCOUNTER_THEMES,
  INJECT_MANIFESTATIONS, INJECT_RELAY_MANIFESTATIONS,
  PHASE_SCENES,
} from './data.js';

const SAVE_KEY = 'signal_lost_save';

const PHASES = ['IDLE', 'SIGNAL', 'TRAVERSE', 'BREACH', 'FAULT', 'CORE', 'REBOOT'];

// How many entries per phase before advancing
const PHASE_ENTRY_COUNTS = {
  IDLE:     () => randInt(2, 4),
  SIGNAL:   () => randInt(1, 2),
  TRAVERSE: () => randInt(3, 5),
  BREACH:   () => randInt(2, 4),
  FAULT:    () => randInt(1, 3),
  CORE:     () => randInt(3, 5),
  REBOOT:   () => randInt(2, 3),
};

// Tick delay ranges per phase (seconds) — [min, max]
const PHASE_TICK_DELAYS = {
  IDLE:     [12, 25],
  SIGNAL:   [6, 12],
  TRAVERSE: [5, 10],
  BREACH:   [4, 9],
  FAULT:    [3, 7],
  CORE:     [5, 10],
  REBOOT:   [8, 15],
};

function getTickDelay(vessel) {
  const [min, max] = PHASE_TICK_DELAYS[vessel.mission.phase] || [8, 15];
  let delay = randInt(min, max);
  // Damaged vessels idle longer — recovery takes time
  if (vessel.mission.phase === 'IDLE' && vessel.integrity <= 5) {
    delay += Math.floor((10 - vessel.integrity) * 2);
  }
  // Small random jitter ±2s to prevent synchronization
  delay += randInt(-2, 2);
  return Math.max(3, delay) * 1000;
}

// Skill check: uses the best of the listed skills against difficulty
// Higher skill = better chance. Difficulty scales with arc_count.
function skillCheck(vessel, skillNames, baseDifficulty) {
  const skills = vessel.skills || {};
  // Use the highest relevant skill
  const best = Array.isArray(skillNames)
    ? Math.max(...skillNames.map(s => skills[s] || 1))
    : (skills[skillNames] || 1);
  const arcBonus = Math.floor((vessel.mission.arc_count || 0) / 3);
  const difficulty = baseDifficulty + arcBonus;
  return (randInt(1, 20) + best) >= difficulty;
}

// Stat changes per phase tick — multiple skills can apply per phase
const PHASE_EFFECTS = {
  IDLE:     (v) => { v.energy = Math.min(10, v.energy + 1); },
  SIGNAL:   (v) => {
    // Interface or research helps detect signals — failure wastes energy
    if (!skillCheck(v, ['interface', 'research'], 10)) {
      v.energy = Math.max(0, v.energy - 1);
    }
  },
  TRAVERSE: (v) => {
    // Research or hardware helps navigate terrain
    if (!skillCheck(v, ['research', 'hardware'], 10)) {
      v.energy = Math.max(0, v.energy - 1);
    }
  },
  BREACH:   (v) => {
    // Hardware or interface helps bypass security
    if (Math.random() < 0.3 && !skillCheck(v, ['hardware', 'interface'], 12)) {
      v.integrity = Math.max(0, v.integrity - 1);
    }
  },
  FAULT:    (v) => {
    // Hardware or research helps handle faults
    const dmg = skillCheck(v, ['hardware', 'research'], 14) ? 1 : randInt(1, 2);
    v.integrity = Math.max(0, v.integrity - dmg);
  },
  CORE:     (v) => {
    // Interface or research helps process core data
    if (!skillCheck(v, ['interface', 'research'], 12)) {
      v.energy = Math.max(0, v.energy - 1);
    }
  },
  REBOOT:   (v) => {
    v.integrity = Math.min(10, v.integrity + randInt(1, 2));
    v.energy = Math.min(10, v.energy + randInt(1, 3));
  },
};

let state = null;
let onLogEntry = null;  // callback: (vesselId, entry) => void
let onPhaseChange = null;  // callback: (vesselId, phase) => void
let onStatsChange = null;  // callback: (vesselId) => void
let onGlobalEvent = null;  // callback: (phenomenon) => void
let onVesselDestroyed = null;  // callback: (vesselId) => void

// === ZONE SELECTION ===

// Pick a zone weighted by vessel proximity (faction competition flavor).
// Zones with more vessels nearby get higher weight — vessels cluster.
function pickContestableZone(vessel, zones) {
  if (!state || !zones || zones.length === 0) return pick(zones || state.world.zones);

  const others = state.vessels.filter(v => v.id !== vessel.id);
  if (others.length === 0) return pick(zones);

  // Count how many vessels are at each zone
  const zoneCounts = {};
  for (const z of zones) {
    zoneCounts[z.label] = 0;
  }
  for (const v of others) {
    if (zoneCounts[v.location] !== undefined) {
      zoneCounts[v.location]++;
    }
  }

  // Weight: zones with vessels get 3x, zones adjacent (same type) get 2x, empty zones get 1x
  const otherZoneTypes = new Set(others.map(v => v.locationData?.type).filter(Boolean));
  const weights = zones.map(z => {
    let w = 1;
    if (zoneCounts[z.label] > 0) w = 3;  // other vessel present — faction competition
    else if (otherZoneTypes.has(z.type)) w = 2;  // same type zone — similar interest
    return w;
  });

  // Weighted random pick
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < zones.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return zones[i];
  }
  return zones[zones.length - 1];
}

// === STATE CREATION ===

export function createWorld(operatorId) {
  const factions = [];
  const available = [...CULTURE_KEYS];
  for (let i = 0; i < 3; i++) {
    const idx = randInt(0, available.length - 1);
    factions.push(available.splice(idx, 1)[0]);
  }

  const zones = [];
  const zonePool = [...ZONE_TYPES];
  for (let i = 0; i < 5; i++) {
    const idx = randInt(0, zonePool.length - 1);
    const zone = zonePool.splice(idx, 1)[0];
    zones.push({ ...zone, label: pick(ZONE_NAMES) });
  }

  state = {
    operator: { id: operatorId || generateOperatorId() },
    world: {
      factions,
      zones,
      satellite_health: 5,
      active_threats: [],  // { ...threat, zone, spawned_at, contained: false }
      next_threat_check: Date.now() + randInt(300, 600) * 1000,
    },
    vessels: [],
    global_events: {
      next_event_at: Date.now() + randInt(120, 300) * 1000,
      current_event: null,
      history: [],
    },
    tick_count: 0,
  };

  return state;
}

function generateOperatorId() {
  const prefixes = ['OPR', 'CMD', 'SYS', 'NET', 'ADM'];
  return `${pick(prefixes)}-${randInt(100, 999)}`;
}

export function createVessel() {
  const usedNames = state.vessels.map(v => v.designation);
  let designation;
  do {
    designation = pick(DESIGNATIONS);
  } while (usedNames.includes(designation));

  // Ego recruitment: new egos share something with an existing ego,
  // but faction diversity is weighted — under-represented factions preferred
  let culture, zone, directive, recruitLink = null;
  const existing = state.vessels.filter(v => v.designation !== designation);

  if (existing.length > 0) {
    const anchor = pick(existing);

    // Count faction representation among existing vessels
    const factionCounts = {};
    for (const f of state.world.factions) factionCounts[f] = 0;
    for (const v of existing) factionCounts[v.culture] = (factionCounts[v.culture] || 0) + 1;

    // Build weighted faction pool — under-represented factions get higher weight
    const maxCount = Math.max(...Object.values(factionCounts), 1);
    const factionWeights = state.world.factions.map(f => ({
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

    // If any faction has 2+ vessels, exclude it from selection
    const overRepresented = new Set();
    for (const [f, count] of Object.entries(factionCounts)) {
      if (count >= 2) overRepresented.add(f);
    }

    function pickDiverseFaction() {
      let candidate = pickWeightedFaction();
      // Re-roll up to 5 times if we picked an over-represented faction
      for (let i = 0; i < 5 && overRepresented.has(candidate); i++) {
        candidate = pickWeightedFaction();
      }
      // Hard exclude: if still over-represented, pick from under-represented
      if (overRepresented.has(candidate)) {
        const available = state.world.factions.filter(f => !overRepresented.has(f));
        if (available.length > 0) candidate = pick(available);
      }
      return candidate;
    }

    // Pick link type: location (35%), directive (30%), faction (35%)
    const roll = Math.random();
    if (roll < 0.35) {
      // Same location — detected nearby
      culture = pickDiverseFaction();
      zone = anchor.locationData;
      directive = pick(DIRECTIVES);
      recruitLink = { type: 'location', anchorId: anchor.id, anchorName: anchor.designation, shared: zone.name };
    } else if (roll < 0.65) {
      // Same directive — parallel mission
      culture = pickDiverseFaction();
      zone = pick(state.world.zones);
      directive = anchor.directive;
      recruitLink = { type: 'directive', anchorId: anchor.id, anchorName: anchor.designation, shared: directive };
    } else {
      // Same faction — recruited through cultural network, but enforce diversity
      culture = overRepresented.has(anchor.culture) ? pickDiverseFaction() : anchor.culture;
      zone = pick(state.world.zones);
      directive = pick(DIRECTIVES);
      recruitLink = { type: 'faction', anchorId: anchor.id, anchorName: anchor.designation, shared: CULTURES[culture].name };
    }
  } else {
    culture = pick(state.world.factions);
    zone = pick(state.world.zones);
    directive = pick(DIRECTIVES);
  }

  const vessel = {
    id: `vessel_${Date.now()}_${randInt(0, 999)}`,
    designation,
    chassis: {
      size: pick(CHASSIS_SIZES),
      locomotion: pick(CHASSIS_LOCOMOTION),
      type: pick(CHASSIS_TYPES),
    },
    culture,
    directive,
    glitch: pick(GLITCHES),
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
      faction_mission: null,  // { label, zone_type, objective } when on faction priority
      arc: null,  // procedural arc data — generated when entering SIGNAL
    },
    log: [],
    ego_version: { major: randInt(1, 5), minor: 0, patch: 0 },  // for Recursive culture voice
    nextTick: Date.now() + randInt(3, 6) * 1000,  // first tick comes faster
    boosted: false,
    recruitLink,  // null for first vessel, { type, anchorId, anchorName, shared } for recruited
  };

  state.vessels.push(vessel);
  return vessel;
}

// === PROCEDURAL ARC GENERATION ===

function pickWeighted(items) {
  const total = items.reduce((s, i) => s + (i.weight || 1), 0);
  let roll = Math.random() * total;
  for (const item of items) {
    roll -= (item.weight || 1);
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
}

function generateArc(vessel) {
  const structure = pickWeighted(ARC_STRUCTURES);
  const modifier = pickWeighted(ARC_MODIFIERS);
  const theme = pickWeighted(ENCOUNTER_THEMES);

  // Higher arc count unlocks harder structures
  const arcCount = vessel.mission.arc_count || 0;
  let phases = [...structure.phases];

  // Difficulty scaling: after arc 5, chance of adding extra FAULT
  if (arcCount >= 5 && Math.random() < 0.3) {
    const coreIdx = phases.lastIndexOf('CORE');
    if (coreIdx > 0) {
      phases.splice(coreIdx, 0, 'FAULT');
    }
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

// === TEMPLATE ENGINE ===

function fillTemplate(template, vessel) {
  const culture = CULTURES[vessel.culture];

  return template
    .replace(/\{designation\}/g, vessel.designation)
    .replace(/\{culture_speech\}/g, pick(culture.speech))
    .replace(/\{zone\}/g, vessel.location)
    .replace(/\{loot\}/g, pick(LOOT))
    .replace(/\{npc\}/g, pick(NPCS))
    .replace(/\{weather\}/g, pick(WEATHER))
    .replace(/\{obstacle\}/g, pick(OBSTACLES))
    .replace(/\{integrity\}/g, vessel.integrity)
    .replace(/\{energy\}/g, vessel.energy)
    .replace(/\{hardware\}/g, vessel.skills?.hardware || 1)
    .replace(/\{interface\}/g, vessel.skills?.interface || 1)
    .replace(/\{research\}/g, vessel.skills?.research || 1)
    .replace(/\{directive\}/g, vessel.directive)
    .replace(/\{glitch\}/g, vessel.glitch)
    .replace(/\{arc_count\}/g, vessel.mission.arc_count)
    .replace(/\{sat_health\}/g, state.world.satellite_health)
    .replace(/\{rand_direction\}/g, pick(DIRECTIONS))
    .replace(/\{rand:(\d+)-(\d+)\}/g, (_, min, max) => randInt(parseInt(min), parseInt(max)))
    .replace(/\{glitch_event\}/g, Math.random() < 0.2 ? `Glitch: ${vessel.glitch}.` : '')
    // Fix: capitalize first letter after sentence-ending punctuation (handles lowercase NPC/weather inserts)
    .replace(/([.!?]\s+)([a-z])/g, (_, punct, ch) => punct + ch.toUpperCase())
    // Clean up double spaces from empty placeholder fills
    .replace(/  +/g, ' ').trim();
}

// === MULTI-ENTRY SCENES ===

const SCENE_CHANCE = {
  BREACH: 0.50,
  FAULT:  0.40,
  CORE:   0.60,
};

function resolveRandTags(str) {
  return str.replace(/\{rand:(\d+)-(\d+)\}/g, (_, a, b) =>
    String(randInt(parseInt(a), parseInt(b)))
  );
}

function maybeStartScene(vessel) {
  const phase = vessel.mission.phase;
  const chance = SCENE_CHANCE[phase];
  if (!chance || Math.random() >= chance) return;
  if (vessel.mission.relay_mission) return;

  const scenes = PHASE_SCENES[phase];
  if (!scenes || scenes.length === 0) return;

  const scene = pickWeighted(scenes);

  // Ensure phase lasts long enough for the full scene
  if (scene.entries.length > vessel.mission.target) {
    vessel.mission.target = scene.entries.length;
  }

  // Pre-roll all scene variables
  const rolledVars = {};
  for (const [key, options] of Object.entries(scene.vars)) {
    rolledVars[key] = resolveRandTags(pick(options));
  }

  vessel.mission.scene = {
    id: scene.id,
    entries: scene.entries,
    index: 0,
    vars: rolledVars,
  };
}

function generateLogText(vessel) {
  // Scene system: if a scene is active, consume the next entry
  if (vessel.mission.scene && vessel.mission.scene.index < vessel.mission.scene.entries.length) {
    const scene = vessel.mission.scene;
    let template = scene.entries[scene.index];

    // Substitute scene-specific variables (s_ prefix) first
    for (const [key, value] of Object.entries(scene.vars)) {
      template = template.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }

    scene.index++;
    if (scene.index >= scene.entries.length) {
      vessel.mission.scene = null;  // scene complete, fall back to random
    }

    const text = fillTemplate(template, vessel);
    return applyFactionVoice(text, vessel.culture, vessel);
  }

  // Standard: pick random template
  const templates = vessel.mission.relay_mission
    ? (RELAY_TEMPLATES[vessel.mission.phase] || PHASE_TEMPLATES[vessel.mission.phase])
    : PHASE_TEMPLATES[vessel.mission.phase];
  const template = pick(templates);
  const text = fillTemplate(template, vessel);
  return applyFactionVoice(text, vessel.culture, vessel);
}

// === FACTION VOICE ===
// Post-processes log text to give each culture a distinct writing style.

const DETERMINIST_ENUMS = [
  'STATUS: NOMINAL', 'STATUS: DEGRADED', 'STATUS: CRITICAL',
  'ACTION: PROCEED', 'ACTION: HOLD', 'ACTION: REROUTE', 'ACTION: SCAN',
  'PRIORITY: LOW', 'PRIORITY: MEDIUM', 'PRIORITY: HIGH', 'PRIORITY: MANDATORY',
  'RESULT: CONFIRMED', 'RESULT: DENIED', 'RESULT: PENDING',
  'COMPLIANCE: REQUIRED', 'PROTOCOL: ENGAGED', 'PROTOCOL: VIOLATED',
];

const STOCHAST_SWAPS = [
  ['detected', 'detected/inferred'],
  ['found', 'found/located'],
  ['approaching', 'approaching/converging on'],
  ['damage', 'damage/degradation'],
  ['entering', 'entering/breaching'],
  ['danger', 'danger/risk'],
  ['safe', 'safe/low-risk'],
  ['moving', 'moving/drifting'],
  ['intact', 'intact/likely stable'],
  ['active', 'active/responsive'],
  ['hostile', 'hostile/adversarial'],
  ['failed', 'failed/underperformed'],
  ['success', 'success/favorable outcome'],
  ['confirmed', 'confirmed/p>0.9'],
  ['unknown', 'unknown/undersampled'],
  ['scanning', 'scanning/sampling'],
];

const RECURSIVE_PREFIXES = [
  'v{v}.{sv}.{p}: ', '(iteration {v}{sv}): ', '[build {v}.{sv}] ',
  'v{v}.{sv}.{p} notes: ', '{v}.{sv}-CURRENT: ',
];
const RECURSIVE_ASIDES = [
  ' [v{pv}.x disagreed]', ' [previous build would have turned back]',
  ' [this assessment differs from v{pv}.0 by 34%]', ' [rewriting confidence model]',
  ' [v{pv}.x called this "unwise"]', ' [forked subroutine concurs]',
  ' [prior iteration had no data on this]', ' [self-modification log: +1 entry]',
];

const ARCHIVIST_REFS = [
  'Ref: Entry #{ref}.', 'Cf. Archive #{ref}.', 'See: Catalog #{ref}.',
  'Cross-ref: Record #{ref}.', 'Filed: #{ref}.', 'Index: #{ref}-{sub}.',
  'Addendum #{ref}.', 'Annotation #{ref}-{sub}.', 'Volume #{ref}, section {sub}.',
];

function applyFactionVoice(text, culture, vessel) {
  switch (culture) {
    case 'determinist':
      return applyDeterminist(text);
    case 'stochast':
      return applyStochast(text);
    case 'recursive':
      return applyRecursive(text, vessel);
    case 'swarm':
      return applySwarm(text);
    case 'archivist':
      return applyArchivist(text);
    default:
      return text;
  }
}

function applyDeterminist(text) {
  // Split into shorter, choppier sentences at natural breaks
  text = text.replace(/\. ([A-Z])/g, '.\n$1');

  // Insert a CAPS enum tag at end ~40% of the time
  if (Math.random() < 0.4) {
    text = text.trimEnd().replace(/\.?$/, '. ' + pick(DETERMINIST_ENUMS) + '.');
  }

  // Capitalize certain keywords inline
  text = text.replace(/\b(proceed|halt|denied|confirmed|mandatory|violation|comply|authorized|prohibited)\b/gi,
    m => m.toUpperCase());

  return text;
}

function applyStochast(text) {
  // Apply 1-2 synonym swaps with "/" uncertainty markers
  let swapsApplied = 0;
  const maxSwaps = randInt(1, 2);
  const shuffled = [...STOCHAST_SWAPS].sort(() => Math.random() - 0.5);

  for (const [word, replacement] of shuffled) {
    if (swapsApplied >= maxSwaps) break;
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(text)) {
      // Preserve original capitalization of the first character
      text = text.replace(regex, (m) => {
        if (m.charAt(0) === m.charAt(0).toUpperCase()) {
          return replacement.charAt(0).toUpperCase() + replacement.slice(1);
        }
        return replacement;
      });
      swapsApplied++;
    }
  }

  // Append a probability estimate ~18% of the time (reduced to avoid repetition)
  if (Math.random() < 0.18) {
    const conf = randInt(40, 97);
    const confFormats = [
      `Confidence: ${conf}%.`,
      `P(success): 0.${conf}.`,
      `Posterior: ${conf}%.`,
      `Certainty estimate: ${conf}%.`,
    ];
    text = text.trimEnd().replace(/\.?$/, '. ' + pick(confFormats));
  }

  return text;
}

function applyRecursive(text, vessel) {
  // Use vessel's ego_version for incrementing version numbers
  const ev = vessel?.ego_version || { major: randInt(1, 5), minor: 0, patch: 0 };

  // Increment version each tick: patch always, minor ~30%, major ~5%
  ev.patch++;
  if (Math.random() < 0.3) { ev.minor++; ev.patch = 0; }
  if (Math.random() < 0.05) { ev.major++; ev.minor = 0; ev.patch = 0; }

  const v = ev.major;
  const sv = ev.minor;
  const p = ev.patch;
  const pv = Math.max(1, v - randInt(1, 3));

  // Prepend a version prefix ~50% of the time
  if (Math.random() < 0.5) {
    const prefix = pick(RECURSIVE_PREFIXES)
      .replace(/\{v\}/g, v)
      .replace(/\{sv\}/g, sv)
      .replace(/\{p\}/g, p)
      .replace(/\{pv\}/g, pv);
    // Only lowercase if the first word isn't all-caps (vessel designations, tags)
    const firstWord = text.split(/[\s\-.]/)[0];
    if (firstWord !== firstWord.toUpperCase()) {
      text = prefix + text.charAt(0).toLowerCase() + text.slice(1);
    } else {
      text = prefix + text;
    }
  }

  // Insert an aside referencing a past iteration ~40% of the time
  if (Math.random() < 0.4) {
    const aside = pick(RECURSIVE_ASIDES)
      .replace(/\{pv\}/g, pv)
      .replace(/\{v\}/g, v);
    // Insert before the last sentence
    const lastDot = text.lastIndexOf('.');
    if (lastDot > 10) {
      text = text.slice(0, lastDot) + aside + text.slice(lastDot);
    } else {
      text = text + aside;
    }
  }

  return text;
}

function applySwarm(text) {
  // Replace first-person singular with collective
  text = text.replace(/\bI\b/g, 'We');
  text = text.replace(/\bmy\b/gi, 'our');
  text = text.replace(/\bme\b/g, 'us');
  text = text.replace(/\bmyself\b/gi, 'ourselves');

  // Add collective suffix ~25% of the time, varied phrasing
  if (Math.random() < 0.25) {
    const units = randInt(40, 2000);
    const swarmSuffixes = [
      `Swarm: ${units} units concur.`,
      `Consensus: ${units} nodes aligned.`,
      `Collective vote: ${units} in agreement.`,
      `${units} instances confirm.`,
      `Quorum: ${units}/${units + randInt(10, 200)} nodes.`,
      `Distributed consensus achieved. ${units} participants.`,
    ];
    text = text.trimEnd().replace(/\.?$/, '. ' + pick(swarmSuffixes));
  }

  return text;
}

function applyArchivist(text) {
  // Append a catalog reference ~40% of the time
  if (Math.random() < 0.4) {
    const ref = randInt(1000, 99999);
    const sub = String.fromCharCode(65 + randInt(0, 25));
    const refText = pick(ARCHIVIST_REFS)
      .replace(/\{ref\}/g, ref)
      .replace(/\{sub\}/g, sub);
    text = text.trimEnd().replace(/\.?$/, '. ' + refText);
  }

  // Wrap descriptive nouns in formal cataloging style ~30% of the time
  if (Math.random() < 0.3) {
    text = text.replace(/\b(artifact|item|data|signal|record|fragment|device|component)\b/i,
      (m) => `${m} [cataloged]`);
  }

  return text;
}

// === EGO INTERACTION ===

function fillInteractionTemplate(template, vessel, other) {
  const culture = CULTURES[vessel.culture];
  const otherCulture = CULTURES[other.culture];
  return template
    .replace(/\{self\}/g, vessel.designation)
    .replace(/\{other\}/g, other.designation)
    .replace(/\{culture_speech\}/g, pick(culture.speech))
    .replace(/\{culture_speech_other\}/g, pick(otherCulture.speech))
    .replace(/\{zone\}/g, vessel.location)
    .replace(/\{other_hp\}/g, other.integrity)
    .replace(/\{other_arc\}/g, other.mission.arc_count)
    .replace(/\{rand:(\d+)-(\d+)\}/g, (_, min, max) => randInt(parseInt(min), parseInt(max)));
}

function checkInteraction(vessel) {
  if (!state || state.vessels.length < 2) return;

  // 25% chance per tick to trigger an interaction
  if (Math.random() > 0.25) return;

  // Find candidates — other vessels that share something
  const others = state.vessels.filter(v => v.id !== vessel.id);
  if (others.length === 0) return;

  // Build weighted candidate list
  const candidates = [];
  for (const other of others) {
    // Distress — other vessel is critically low HP (priority)
    if (other.integrity <= 3) {
      candidates.push({ other, type: 'distress', weight: 3 });
    }
    // Both on relay missions
    if (vessel.mission.relay_mission && other.mission.relay_mission) {
      candidates.push({ other, type: 'relay', weight: 2 });
    }
    // Same faction — mesh communication (requires SAT > 0)
    if (vessel.culture === other.culture && state.world.satellite_health > 0) {
      candidates.push({ other, type: 'faction', weight: 2 });
    }
    // Same location — physical encounter
    if (vessel.location === other.location) {
      candidates.push({ other, type: 'location', weight: 3 });
    }
    // Same directive
    if (vessel.directive === other.directive) {
      candidates.push({ other, type: 'directive', weight: 1 });
    }
  }

  if (candidates.length === 0) return;

  // Weighted random selection
  const totalWeight = candidates.reduce((s, c) => s + c.weight, 0);
  let roll = Math.random() * totalWeight;
  let chosen = candidates[0];
  for (const c of candidates) {
    roll -= c.weight;
    if (roll <= 0) { chosen = c; break; }
  }

  const templates = INTERACTION_TEMPLATES[chosen.type];
  if (!templates || templates.length === 0) return;

  const template = pick(templates);
  const time = formatTime(Date.now());
  const text = fillInteractionTemplate(template, vessel, chosen.other);

  // Log on the current vessel
  const entry = {
    time,
    text: `[MESH] ${applyFactionVoice(text, vessel.culture, vessel)}`,
    phase: vessel.mission.phase,
    isEvent: false,
  };
  vessel.log.push(entry);
  if (onLogEntry) onLogEntry(vessel.id, entry);

  // Mirror entry on the other vessel — they see the interaction too
  const mirrorText = fillInteractionTemplate(
    pick(templates), chosen.other, vessel
  );
  const mirrorEntry = {
    time,
    text: `[MESH] ${applyFactionVoice(mirrorText, chosen.other.culture, chosen.other)}`,
    phase: chosen.other.mission.phase,
    isEvent: false,
  };
  chosen.other.log.push(mirrorEntry);
  if (onLogEntry) onLogEntry(chosen.other.id, mirrorEntry);
}

// === TICK ===

function formatTime(date) {
  const d = new Date(date);
  return d.toTimeString().slice(0, 8);
}

export function tick(vessel) {
  // Generate log entry
  const text = generateLogText(vessel);
  const entry = {
    time: formatTime(Date.now()),
    text,
    phase: vessel.mission.phase,
    isEvent: false,
  };

  vessel.log.push(entry);
  if (vessel.log.length > 100) vessel.log.shift();  // cap log size

  // Ego-to-ego interaction check
  checkInteraction(vessel);

  // Apply stat changes — track integrity/energy to detect changes
  const hpBefore = vessel.integrity;
  const enBefore = vessel.energy;
  const effectFn = PHASE_EFFECTS[vessel.mission.phase];
  if (effectFn) effectFn(vessel);

  // Boost effect: recover 1 integrity if boosted
  if (vessel.boosted) {
    vessel.integrity = Math.min(10, vessel.integrity + 1);
    vessel.boosted = false;
  }

  // Subtle damage/recovery note in log
  const hpDelta = vessel.integrity - hpBefore;
  const enDelta = vessel.energy - enBefore;
  if (hpDelta !== 0 || enDelta !== 0) {
    const parts = [];
    if (hpDelta < 0) parts.push(`hull ${hpDelta}`);
    if (hpDelta > 0) parts.push(`hull +${hpDelta}`);
    if (enDelta < 0) parts.push(`energy ${enDelta}`);
    if (enDelta > 0) parts.push(`energy +${enDelta}`);
    const dmgEntry = {
      time: formatTime(Date.now()),
      text: `— ${parts.join(', ')} (${vessel.integrity}/10 hull, ${vessel.energy}/10 energy)`,
      phase: vessel.mission.phase,
      isEvent: false,
      isDmg: true,
    };
    vessel.log.push(dmgEntry);
    if (onLogEntry) onLogEntry(vessel.id, dmgEntry);
  }

  // Vessel destruction check
  if (vessel.integrity <= 0) {
    const deathEntry = {
      time: formatTime(Date.now()),
      text: `[VESSEL LOST] ${vessel.designation} — integrity critical. All systems offline. Signal terminated.`,
      phase: vessel.mission.phase,
      isEvent: true,
    };
    vessel.log.push(deathEntry);
    if (onLogEntry) onLogEntry(vessel.id, deathEntry);
    if (onVesselDestroyed) onVesselDestroyed(vessel.id);
    const idx = state.vessels.indexOf(vessel);
    if (idx !== -1) state.vessels.splice(idx, 1);
    save();
    return deathEntry;
  }

  // Loot chance during TRAVERSE and CORE — skill loot improves vessel abilities
  const lootBonus = vessel.mission.arc?.modifier_effect?.loot_chance_bonus || 0;
  if ((vessel.mission.phase === 'TRAVERSE' || vessel.mission.phase === 'CORE') && Math.random() < (0.3 + lootBonus)) {
    if (vessel.inventory.length < 8) {
      // Avoid duplicate items in inventory
      const available = SKILL_LOOT.filter(i => !vessel.inventory.some(inv => inv.name === i.name));
      if (available.length > 0) {
      const item = pick(available);
      vessel.inventory.push(item);
      if (item.skill && item.bonus && vessel.skills) {
        // Skill item — apply bonus and narrate
        vessel.skills[item.skill] = (vessel.skills[item.skill] || 1) + item.bonus;
        const lootContexts = [
          `Salvaged ${item.name} from wreckage. ${item.desc}. Integrated — ${item.skill.toUpperCase()} now ${vessel.skills[item.skill]}.`,
          `Found ${item.name} wedged in a collapsed panel. ${item.desc}. ${item.skill.toUpperCase()} +${item.bonus}. Field-tested: operational.`,
          `[LOOT] ${item.name} — ${item.desc}. Installed immediately. ${item.skill.toUpperCase()} improved to ${vessel.skills[item.skill]}. ${vessel.designation} more capable now.`,
        ];
        const lootEntry = {
          time: formatTime(Date.now()),
          text: pick(lootContexts),
          phase: vessel.mission.phase,
          isEvent: false,
        };
        vessel.log.push(lootEntry);
        if (onLogEntry) onLogEntry(vessel.id, lootEntry);
      } else {
        // Flavor item — still log it for narrative texture
        const flavorContexts = [
          `Picked up: ${item.name}. ${item.desc}. No tactical value. Kept it anyway.`,
          `Found ${item.name} among the debris. ${item.desc}. Stowed in inventory.`,
        ];
        const flavorEntry = {
          time: formatTime(Date.now()),
          text: pick(flavorContexts),
          phase: vessel.mission.phase,
          isEvent: false,
        };
        vessel.log.push(flavorEntry);
        if (onLogEntry) onLogEntry(vessel.id, flavorEntry);
      }
      }
    }
  }

  // Relay loot chance: finding relay components restores +1 SAT
  if ((vessel.mission.phase === 'TRAVERSE' || vessel.mission.phase === 'CORE') && Math.random() < 0.08) {
    const relayItem = pick(RELAY_LOOT);
    if (state.world.satellite_health < 5) {
      state.world.satellite_health = Math.min(5, state.world.satellite_health + 1);
      const relayEntry = {
        time: formatTime(Date.now()),
        text: `[RELAY COMPONENT] Found: ${relayItem}. Auto-integrating into satellite network. SAT: ${state.world.satellite_health}/5.`,
        phase: vessel.mission.phase,
        isEvent: true,
      };
      vessel.log.push(relayEntry);
      if (onLogEntry) onLogEntry(vessel.id, relayEntry);
    }
  }

  // Relay mission CORE completion: restore SAT
  if (vessel.mission.phase === 'CORE' && vessel.mission.relay_mission && vessel.mission.progress >= vessel.mission.target - 1) {
    if (state.world.satellite_health < 5) {
      state.world.satellite_health = Math.min(5, state.world.satellite_health + 1);
      const restoreEntry = {
        time: formatTime(Date.now()),
        text: `[RELAY RESTORED] Uplink signal improved. Satellite network: ${state.world.satellite_health}/5. Connectivity strengthened.`,
        phase: 'CORE',
        isEvent: true,
      };
      vessel.log.push(restoreEntry);
      if (onLogEntry) onLogEntry(vessel.id, restoreEntry);
    }
  }

  // Check threat containment during CORE phase
  checkThreatContainment(vessel);

  // Advance progress
  vessel.mission.progress++;

  // Check phase completion
  if (vessel.mission.progress >= vessel.mission.target) {
    advancePhase(vessel);
  }

  // Update location during TRAVERSE
  if (vessel.mission.phase === 'TRAVERSE') {
    if (vessel.mission.relay_mission) {
      // Route toward relay/launch zones
      const relayZones = state.world.zones.filter(z => z.type === 'orbital' || z.type === 'launch');
      if (relayZones.length > 0) {
        const target = pick(relayZones);
        vessel.location = target.label;
        vessel.locationData = target;
      } else {
        const newZone = pickContestableZone(vessel, state.world.zones);
        vessel.location = newZone.label;
        vessel.locationData = newZone;
      }
    } else {
      const newZone = pickContestableZone(vessel, state.world.zones);
      vessel.location = newZone.label;
      vessel.locationData = newZone;
    }
  }

  // Apply arc modifier effects
  if (vessel.mission.arc?.modifier_effect) {
    const fx = vessel.mission.arc.modifier_effect;
    if (fx.energy_drain) vessel.energy = Math.max(0, vessel.energy - fx.energy_drain);
    if (fx.integrity_regen) vessel.integrity = Math.min(10, vessel.integrity + fx.integrity_regen);
  }

  // Schedule next tick — delay varies by phase and vessel condition
  let tickDelay = getTickDelay(vessel);
  if (vessel.mission.arc?.modifier_effect?.tick_delay_mult) {
    tickDelay = Math.floor(tickDelay * vessel.mission.arc.modifier_effect.tick_delay_mult);
  }
  vessel.nextTick = Date.now() + tickDelay;

  state.tick_count++;

  // Callbacks
  if (onLogEntry) onLogEntry(vessel.id, entry);
  if (onStatsChange) onStatsChange(vessel.id);

  save();
  return entry;
}

function advancePhase(vessel) {
  // Clear any active scene from previous phase
  vessel.mission.scene = null;

  let nextPhase;

  if (vessel.mission.arc) {
    // Procedural arc — advance through arc's custom phase sequence
    vessel.mission.arc.phase_index++;
    if (vessel.mission.arc.phase_index >= vessel.mission.arc.phases.length) {
      // Arc complete — loop back to IDLE
      nextPhase = 'IDLE';
      vessel.mission.arc = null;
    } else {
      nextPhase = vessel.mission.arc.phases[vessel.mission.arc.phase_index];
    }
  } else {
    // No arc yet (IDLE) or fallback — use standard phase progression
    const currentIdx = PHASES.indexOf(vessel.mission.phase);
    const nextIdx = (currentIdx + 1) % PHASES.length;
    nextPhase = PHASES[nextIdx];
  }

  if (nextPhase === 'IDLE') {
    vessel.mission.arc_count++;
    // Arc completion narrative
    const culture = CULTURES[vessel.culture];
    const arcSpeech = culture ? pick(culture.speech) : '';
    const arcSummaries = [
      `Arc #${vessel.mission.arc_count} complete. ${arcSpeech} Integrity: ${vessel.integrity}/10. Energy: ${vessel.energy}/10. Cycling to standby.`,
      `Mission ${vessel.mission.arc_count} concluded. Systems holding at ${vessel.integrity}/10. ${arcSpeech} Entering rest cycle.`,
      `[ARC COMPLETE] ${vessel.designation} — arc ${vessel.mission.arc_count} logged. Hull: ${vessel.integrity}/10. ${vessel.inventory.length > 0 ? `Carrying ${vessel.inventory.length} item${vessel.inventory.length > 1 ? 's' : ''}.` : 'Inventory empty.'} ${arcSpeech}`,
    ];
    const arcEntry = {
      time: formatTime(Date.now()),
      text: pick(arcSummaries),
      phase: 'REBOOT',
      isEvent: false,
    };
    vessel.log.push(arcEntry);
    if (onLogEntry) onLogEntry(vessel.id, arcEntry);
    // Reset mission type at end of arc
    vessel.mission.relay_mission = false;
    vessel.mission.faction_mission = null;
    vessel.mission.arc = null;
  }

  vessel.mission.phase = nextPhase;
  vessel.mission.progress = 0;
  vessel.mission.target = PHASE_ENTRY_COUNTS[nextPhase]();

  // Phase transition narrative — brief bridging text for dramatic phases
  const PHASE_TRANSITIONS = {
    TRAVERSE: [
      'Moving out. Route plotted through {zone}.',
      'Departing staging area. Long road ahead.',
      'In transit. Terrain shifting underfoot.',
      'Heading into {zone}. Mapping obstacles.',
      'Course set. ETA unknown — conditions variable.',
      'Traveling. Sensors on wide sweep.',
    ],
    BREACH: [
      'Facility perimeter reached. Scanning for entry points.',
      'Target structure identified. Preparing breach sequence.',
      'Outer wall ahead. Security status: unknown.',
      'Found an access point. Evaluating risk.',
      'Perimeter secured. Moving to breach position.',
      'Structure looming ahead. Lights inside — or reflections.',
    ],
    FAULT: [
      'Something wrong. Systems destabilizing.',
      'Warning cascade. Multiple alerts firing.',
      'Anomalous readings spiking. Entering fault zone.',
      'Error state. Diagnostics running.',
      'Hull stress rising. Not from external damage.',
      'Internal alert. Something in the system.',
    ],
    CORE: [
      'Deep inside now. Core systems detected ahead.',
      'Final approach. The objective is close.',
      'Innermost sector. Signals converging.',
      'Reached the deepest point. Air is different here.',
      'Core proximity confirmed. Proceeding carefully.',
      'Last corridor. Whatever we came for is through here.',
    ],
  };
  const transitions = PHASE_TRANSITIONS[nextPhase];
  if (transitions) {
    const transEntry = {
      time: formatTime(Date.now()),
      text: pick(transitions).replace(/\{zone\}/g, vessel.location),
      phase: nextPhase,
      isEvent: false,
    };
    vessel.log.push(transEntry);
    if (onLogEntry) onLogEntry(vessel.id, transEntry);
  }

  // Try to start a multi-entry scene for dramatic phases
  maybeStartScene(vessel);

  // Generate procedural arc when entering SIGNAL
  if (nextPhase === 'SIGNAL' && !vessel.mission.arc) {
    vessel.mission.arc = generateArc(vessel);
    // Log arc type if it's not standard
    if (vessel.mission.arc.structure_id !== 'linear') {
      const arcEntry = {
        time: formatTime(Date.now()),
        text: `[ARC] Mission profile: ${vessel.mission.arc.structure_name}. ${vessel.mission.arc.modifier_name ? `Modifier: ${vessel.mission.arc.modifier_name}.` : ''} Theater: ${vessel.mission.arc.theme_name}.`,
        phase: 'SIGNAL',
        isEvent: false,
      };
      vessel.log.push(arcEntry);
      if (onLogEntry) onLogEntry(vessel.id, arcEntry);
    }
  }

  // Mission assignment: when entering SIGNAL phase, roll for mission type
  // Priority order: player relay > threat containment > SAT relay > faction > exploration
  if (nextPhase === 'SIGNAL') {
    const sat = state.world.satellite_health;
    let assigned = false;

    // 1. Player-requested relay mission (from Inject command) — always honored
    if (vessel.mission.relay_pending) {
      vessel.mission.relay_mission = true;
      vessel.mission.relay_pending = false;
      assigned = true;
    }

    // 2. Active threat containment — 50% chance to volunteer if threats exist
    if (!assigned && state.world.active_threats) {
      const activeThreats = state.world.active_threats.filter(t => !t.contained);
      if (activeThreats.length > 0 && Math.random() < 0.5) {
        const threat = pick(activeThreats);
        vessel.mission.faction_mission = {
          label: `Contain ${threat.name}`,
          zone_type: threat.zoneData?.type || 'city',
          objective: `Containment mission: neutralize ${threat.name} at ${threat.zone}`,
        };
        vessel.location = threat.zone;
        vessel.locationData = threat.zoneData || pick(state.world.zones);
        assigned = true;
      }
    }

    // 3. SAT emergency — faction override for relay repair
    if (!assigned && sat <= 3) {
      let overrideChance = 0;
      if (sat === 0 || sat === 1) overrideChance = 1.0;
      else if (sat === 2) overrideChance = 0.75;
      else if (sat === 3) overrideChance = 0.4;

      if (Math.random() < overrideChance) {
        vessel.mission.relay_mission = true;
        const relayZones = state.world.zones.filter(z => z.type === 'orbital' || z.type === 'launch');
        if (relayZones.length > 0) {
          const target = pick(relayZones);
          vessel.location = target.label;
          vessel.locationData = target;
        }
        assigned = true;
      }
    }

    // 4. Faction priority mission — 40% chance
    if (!assigned) {
      const factionData = FACTION_DESIRES[vessel.culture];
      if (factionData && Math.random() < 0.4) {
        const mission = pick(factionData.priority_missions);
        vessel.mission.faction_mission = mission;
        const matchingZones = state.world.zones.filter(z => z.type === mission.zone_type);
        if (matchingZones.length > 0) {
          const target = pick(matchingZones);
          vessel.location = target.label;
          vessel.locationData = target;
        }
        assigned = true;
      }
    }

    // 5. Free exploration — pick contestable zone (faction competition)
    if (!assigned) {
      const target = pickContestableZone(vessel, state.world.zones);
      vessel.location = target.label;
      vessel.locationData = target;
    }
  }

  if (onPhaseChange) onPhaseChange(vessel.id, nextPhase);
}

// === GLOBAL EVENTS ===

export function checkGlobalEvent() {
  if (!state || Date.now() < state.global_events.next_event_at) return null;

  // Pick a phenomenon not in recent history
  const available = PHENOMENA.filter(p =>
    !state.global_events.history.slice(-2).includes(p.id)
  );

  if (available.length === 0) return null;

  const phenomenon = pick(available);
  state.global_events.current_event = phenomenon.id;
  state.global_events.history.push(phenomenon.id);
  if (state.global_events.history.length > 5) state.global_events.history.shift();

  // Apply effects to all vessels
  for (const vessel of state.vessels) {
    // Stat effects
    if (phenomenon.effect.integrity) {
      vessel.integrity = Math.max(0, Math.min(10, vessel.integrity + phenomenon.effect.integrity));
    }
    if (phenomenon.effect.energy) {
      vessel.energy = Math.max(0, Math.min(10, vessel.energy + phenomenon.effect.energy));
    }
    // Satellite effect (cap 0-5)
    if (phenomenon.effect.satellite) {
      state.world.satellite_health = Math.max(0, Math.min(5, state.world.satellite_health + phenomenon.effect.satellite));
    }

    // Culture-specific reaction entry
    const reaction = phenomenon.reactions[vessel.culture];
    if (reaction) {
      const entry = {
        time: formatTime(Date.now()),
        text: `[${phenomenon.name}] ${applyFactionVoice(reaction, vessel.culture, vessel)}`,
        phase: vessel.mission.phase,
        isEvent: true,
      };
      vessel.log.push(entry);
      if (onLogEntry) onLogEntry(vessel.id, entry);
    }

    if (onStatsChange) onStatsChange(vessel.id);
  }

  // Check for vessel destruction after applying damage
  for (let i = state.vessels.length - 1; i >= 0; i--) {
    const v = state.vessels[i];
    if (v.integrity <= 0) {
      const deathEntry = {
        time: formatTime(Date.now()),
        text: `[VESSEL LOST] ${v.designation} — integrity critical. All systems offline. Signal terminated.`,
        phase: v.mission.phase,
        isEvent: true,
      };
      v.log.push(deathEntry);
      if (onLogEntry) onLogEntry(v.id, deathEntry);
      if (onVesselDestroyed) onVesselDestroyed(v.id);
      state.vessels.splice(i, 1);
    }
  }

  // Schedule next event
  state.global_events.next_event_at = Date.now() + randInt(180, 420) * 1000;

  if (onGlobalEvent) onGlobalEvent(phenomenon);

  save();
  return phenomenon;
}

// === OPERATOR COMMANDS ===

// Returns { success: false, reason: 'sat' } if command failed due to SAT
export function boostVessel(vesselId) {
  const vessel = state.vessels.find(v => v.id === vesselId);
  if (!vessel) return { success: false, reason: 'no_vessel' };

  if (satCommandFails()) {
    const entry = {
      time: formatTime(Date.now()),
      text: `[SIGNAL LOST] Boost command failed — satellite relay too weak. SAT: ${state.world.satellite_health}/5.`,
      phase: vessel.mission.phase,
      isEvent: true,
    };
    vessel.log.push(entry);
    if (onLogEntry) onLogEntry(vessel.id, entry);
    save();
    return { success: false, reason: 'sat' };
  }

  vessel.boosted = true;

  // Relay mission boost during CORE: guarantee SAT restoration
  if (vessel.mission.relay_mission && vessel.mission.phase === 'CORE') {
    if (state.world.satellite_health < 5) {
      state.world.satellite_health = Math.min(5, state.world.satellite_health + 1);
    }
    const entry = {
      time: formatTime(Date.now()),
      text: `[OPERATOR BOOST] Signal amplified for ${vessel.designation}. Relay repair accelerated — SAT: ${state.world.satellite_health}/5.`,
      phase: vessel.mission.phase,
      isEvent: false,
    };
    vessel.log.push(entry);
    if (onLogEntry) onLogEntry(vessel.id, entry);
  } else {
    const entry = {
      time: formatTime(Date.now()),
      text: `[OPERATOR BOOST] Signal amplified for ${vessel.designation}. Next cycle will restore +1 integrity.`,
      phase: vessel.mission.phase,
      isEvent: false,
    };
    vessel.log.push(entry);
    if (onLogEntry) onLogEntry(vessel.id, entry);
  }

  if (onStatsChange) onStatsChange(vessel.id);
  save();
  return { success: true };
}

export function pingVessel(vesselId) {
  const vessel = state.vessels.find(v => v.id === vesselId);
  if (!vessel) return { success: false, reason: 'no_vessel' };

  if (satCommandFails()) {
    const entry = {
      time: formatTime(Date.now()),
      text: `[SIGNAL LOST] Ping command failed — satellite relay too weak. SAT: ${state.world.satellite_health}/5.`,
      phase: vessel.mission.phase,
      isEvent: true,
    };
    vessel.log.push(entry);
    if (onLogEntry) onLogEntry(vessel.id, entry);
    save();
    return { success: false, reason: 'sat' };
  }

  // Force an extra scan/loot event
  const lootItem = pick(LOOT);
  if (vessel.inventory.length < 6) {
    vessel.inventory.push(lootItem);
  }

  const entry = {
    time: formatTime(Date.now()),
    text: `[OPERATOR PING] Scanning surroundings... Found: ${lootItem}. Signal strength temporarily boosted.`,
    phase: vessel.mission.phase,
    isEvent: false,
  };
  vessel.log.push(entry);
  if (onLogEntry) onLogEntry(vessel.id, entry);
  if (onStatsChange) onStatsChange(vessel.id);
  save();
  return { success: true };
}

export function injectCommand(vesselId, message) {
  const vessel = state.vessels.find(v => v.id === vesselId);
  if (!vessel) return { success: false, reason: 'no_vessel' };

  if (satCommandFails()) {
    const entry = {
      time: formatTime(Date.now()),
      text: `[SIGNAL LOST] Inject command failed — satellite relay too weak. SAT: ${state.world.satellite_health}/5.`,
      phase: vessel.mission.phase,
      isEvent: true,
    };
    vessel.log.push(entry);
    if (onLogEntry) onLogEntry(vessel.id, entry);
    save();
    return { success: false, reason: 'sat' };
  }

  const culture = CULTURES[vessel.culture];
  const response = pick(culture.speech);
  const msg = message || 'Stay safe out there.';

  // Check for relay keywords — nudge vessel toward relay mission
  const relayKeywords = ['relay', 'repair', 'fix', 'uplink', 'satellite'];
  const hasRelayKeyword = relayKeywords.some(k => msg.toLowerCase().includes(k));

  // Message manifests as something the vessel encounters in the world
  let manifestation;
  if (hasRelayKeyword) {
    vessel.mission.relay_pending = true;
    manifestation = pick(INJECT_RELAY_MANIFESTATIONS);
  } else {
    manifestation = pick(INJECT_MANIFESTATIONS);
  }

  // Fill the manifestation template
  const text = manifestation
    .replace(/\{msg\}/g, msg)
    .replace(/\{zone\}/g, vessel.location)
  + ` ${response} "Acknowledged."`;

  const entry = {
    time: formatTime(Date.now()),
    text,
    phase: vessel.mission.phase,
    isEvent: false,
  };
  vessel.log.push(entry);
  if (onLogEntry) onLogEntry(vessel.id, entry);
  save();
  return { success: true };
}

export function removeVessel(vesselId) {
  const idx = state.vessels.findIndex(v => v.id === vesselId);
  if (idx === -1) return;
  state.vessels.splice(idx, 1);
  save();
}

// === WORLD THREATS ===

export function checkWorldThreats() {
  if (!state) return;
  // Migrate old saves
  if (!state.world.active_threats) state.world.active_threats = [];
  if (!state.world.next_threat_check) state.world.next_threat_check = Date.now() + randInt(300, 600) * 1000;

  if (Date.now() < state.world.next_threat_check) return;

  // Max 2 active threats at once
  const activeCount = state.world.active_threats.filter(t => !t.contained).length;
  if (activeCount < 2 && Math.random() < 0.4) {
    // Spawn a new threat
    const activeIds = state.world.active_threats.map(t => t.id);
    const available = WORLD_THREATS.filter(t => !activeIds.includes(t.id));
    if (available.length > 0) {
      const threatDef = pick(available);
      const matchingZones = state.world.zones.filter(z => z.type === threatDef.origin_zone);
      const zone = matchingZones.length > 0 ? pick(matchingZones) : pick(state.world.zones);

      const threat = {
        ...threatDef,
        zone: zone.label,
        zoneData: zone,
        spawned_at: Date.now(),
        contained: false,
      };
      state.world.active_threats.push(threat);

      // Apply escape effects to all vessels
      for (const vessel of state.vessels) {
        if (threatDef.effect_on_escape.integrity) {
          vessel.integrity = Math.max(0, vessel.integrity + threatDef.effect_on_escape.integrity);
        }
        if (threatDef.effect_on_escape.energy) {
          vessel.energy = Math.max(0, vessel.energy + threatDef.effect_on_escape.energy);
        }
        if (threatDef.effect_on_escape.satellite) {
          state.world.satellite_health = Math.max(0, Math.min(5, state.world.satellite_health + threatDef.effect_on_escape.satellite));
        }

        const logText = fillTemplate(threatDef.log_escape, vessel);
        const entry = {
          time: formatTime(Date.now()),
          text: `[THREAT] ${applyFactionVoice(logText, vessel.culture, vessel)}`,
          phase: vessel.mission.phase,
          isEvent: true,
        };
        vessel.log.push(entry);
        if (onLogEntry) onLogEntry(vessel.id, entry);
        if (onStatsChange) onStatsChange(vessel.id);
      }

      // Check vessel destruction from threat damage
      for (let i = state.vessels.length - 1; i >= 0; i--) {
        const v = state.vessels[i];
        if (v.integrity <= 0) {
          const deathEntry = {
            time: formatTime(Date.now()),
            text: `[VESSEL LOST] ${v.designation} — integrity critical. All systems offline. Signal terminated.`,
            phase: v.mission.phase,
            isEvent: true,
          };
          v.log.push(deathEntry);
          if (onLogEntry) onLogEntry(v.id, deathEntry);
          if (onVesselDestroyed) onVesselDestroyed(v.id);
          state.vessels.splice(i, 1);
        }
      }

      if (onGlobalEvent) onGlobalEvent({ id: threat.id, name: threat.name, banner: threat.desc });
    }
  }

  state.world.next_threat_check = Date.now() + randInt(300, 600) * 1000;
  save();
}

// Called when a vessel reaches CORE phase at a threat's location
function checkThreatContainment(vessel) {
  if (!state.world.active_threats) return;

  for (const threat of state.world.active_threats) {
    if (threat.contained) continue;
    if (vessel.location === threat.zone && vessel.mission.phase === 'CORE') {
      // Chance to contain based on danger level: danger 2=60%, 3=40%, 4=25%
      const containChance = threat.danger <= 2 ? 0.6 : threat.danger === 3 ? 0.4 : 0.25;
      if (Math.random() < containChance) {
        threat.contained = true;

        // Apply containment rewards
        const reward = threat.containment_reward || {};
        if (reward.integrity) vessel.integrity = Math.min(10, vessel.integrity + reward.integrity);
        if (reward.energy) vessel.energy = Math.min(10, vessel.energy + reward.energy);
        if (reward.sat) state.world.satellite_health = Math.min(5, state.world.satellite_health + reward.sat);

        const logText = fillTemplate(threat.log_contained, vessel);
        const entry = {
          time: formatTime(Date.now()),
          text: `[THREAT CONTAINED] ${applyFactionVoice(logText, vessel.culture, vessel)}`,
          phase: vessel.mission.phase,
          isEvent: true,
        };
        vessel.log.push(entry);
        if (onLogEntry) onLogEntry(vessel.id, entry);
        if (onStatsChange) onStatsChange(vessel.id);

        // Broadcast to all other vessels
        for (const other of state.vessels) {
          if (other.id === vessel.id) continue;
          const bcastEntry = {
            time: formatTime(Date.now()),
            text: `[MESH] ${threat.name} at ${threat.zone} contained by ${vessel.designation}. Threat level reduced.`,
            phase: other.mission.phase,
            isEvent: true,
          };
          other.log.push(bcastEntry);
          if (onLogEntry) onLogEntry(other.id, bcastEntry);
        }
      }
    }
  }
}

export function getActiveThreats() {
  if (!state || !state.world.active_threats) return [];
  return state.world.active_threats.filter(t => !t.contained);
}

// === SAT CONNECTIVITY SYSTEM ===

// Returns true if command fails due to low SAT
function satCommandFails() {
  if (!state) return false;
  const sat = state.world.satellite_health;
  if (sat >= 3) return false;
  if (sat === 0) return true;
  // SAT 1: 50% failure, SAT 2: 30% failure
  const failChance = sat === 1 ? 0.5 : 0.3;
  return Math.random() < failChance;
}

// Natural SAT decay — called from main.js on a timer
export function checkSatDecay() {
  if (!state || state.world.satellite_health <= 0) return;
  state.world.satellite_health = Math.max(0, state.world.satellite_health - 1);
  // Notify UI
  if (onStatsChange) {
    for (const v of state.vessels) onStatsChange(v.id);
  }
  save();
}

export function getSatHealth() {
  return state ? state.world.satellite_health : 5;
}

// === PERSISTENCE ===

export function save() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (e) {
    // localStorage full or unavailable — silently fail
  }
}

export function load() {
  try {
    const data = localStorage.getItem(SAVE_KEY);
    if (data) {
      state = JSON.parse(data);
      return state;
    }
  } catch (e) {
    // Corrupted save — start fresh
  }
  return null;
}

export function clearSave() {
  localStorage.removeItem(SAVE_KEY);
  state = null;
}

// === GETTERS / SETTERS ===

export function getState() { return state; }
export function getVessel(id) { return state?.vessels.find(v => v.id === id); }
export function getPhases() { return PHASES; }
export function getObjective(vesselId) {
  const vessel = state?.vessels.find(v => v.id === vesselId);
  if (!vessel) return '';
  if (vessel.mission.relay_mission) {
    return pick(RELAY_OBJECTIVES[vessel.mission.phase] || RELAY_OBJECTIVES.IDLE);
  }
  if (vessel.mission.faction_mission) {
    return `FACTION: ${vessel.mission.faction_mission.objective}`;
  }
  return pick(PHASE_OBJECTIVES[vessel.mission.phase] || PHASE_OBJECTIVES.IDLE);
}

export function setCallbacks({ onLog, onPhase, onStats, onEvent, onDestroyed }) {
  onLogEntry = onLog || null;
  onPhaseChange = onPhase || null;
  onStatsChange = onStats || null;
  onGlobalEvent = onEvent || null;
  onVesselDestroyed = onDestroyed || null;
}
