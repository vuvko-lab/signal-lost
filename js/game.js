// === GAME STATE & PHASE MACHINE ===

import {
  pick, randInt, DESIGNATIONS, CHASSIS_SIZES, CHASSIS_LOCOMOTION, CHASSIS_TYPES,
  CULTURES, CULTURE_KEYS, DIRECTIVES, GLITCHES, ZONE_TYPES, ZONE_NAMES,
  LOOT, NPCS, WEATHER, OBSTACLES, CS_SNIPPETS, PHASE_TEMPLATES,
  PHENOMENA, DIRECTIONS, PHASE_OBJECTIVES,
  RELAY_TEMPLATES, RELAY_OBJECTIVES, RELAY_LOOT,
} from './data.js';

const SAVE_KEY = 'signal_lost_save';

const PHASES = ['IDLE', 'SIGNAL', 'TRAVERSE', 'BREACH', 'FAULT', 'CORE', 'REBOOT'];

// How many entries per phase before advancing
const PHASE_ENTRY_COUNTS = {
  IDLE:     () => randInt(1, 2),
  SIGNAL:   () => 1,
  TRAVERSE: () => randInt(2, 4),
  BREACH:   () => randInt(1, 2),
  FAULT:    () => 1,
  CORE:     () => randInt(1, 2),
  REBOOT:   () => randInt(1, 2),
};

// Stat changes per phase tick
const PHASE_EFFECTS = {
  IDLE:     (v) => { v.energy = Math.min(10, v.energy + 1); },
  SIGNAL:   () => {},
  TRAVERSE: (v) => { v.energy = Math.max(0, v.energy - 1); },
  BREACH:   (v) => { if (Math.random() < 0.3) v.integrity = Math.max(0, v.integrity - 1); },
  FAULT:    (v) => { v.integrity = Math.max(0, v.integrity - randInt(1, 2)); },
  CORE:     (v) => { v.memory = Math.max(1, v.memory - 1); },
  REBOOT:   (v) => {
    v.integrity = Math.min(10, v.integrity + randInt(1, 2));
    v.energy = Math.min(10, v.energy + randInt(1, 3));
    v.memory = Math.min(10, v.memory + 1);
  },
};

let state = null;
let onLogEntry = null;  // callback: (vesselId, entry) => void
let onPhaseChange = null;  // callback: (vesselId, phase) => void
let onStatsChange = null;  // callback: (vesselId) => void
let onGlobalEvent = null;  // callback: (phenomenon) => void
let onVesselDestroyed = null;  // callback: (vesselId) => void

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

  const culture = pick(state.world.factions);
  const zone = pick(state.world.zones);

  const vessel = {
    id: `vessel_${Date.now()}_${randInt(0, 999)}`,
    designation,
    chassis: {
      size: pick(CHASSIS_SIZES),
      locomotion: pick(CHASSIS_LOCOMOTION),
      type: pick(CHASSIS_TYPES),
    },
    culture,
    directive: pick(DIRECTIVES),
    glitch: pick(GLITCHES),
    integrity: randInt(7, 10),
    energy: 10,
    memory: 10,
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
    },
    log: [],
    nextTick: Date.now() + randInt(3, 6) * 1000,  // first tick comes faster
    boosted: false,
  };

  state.vessels.push(vessel);
  return vessel;
}

// === TEMPLATE ENGINE ===

function fillTemplate(template, vessel) {
  const culture = CULTURES[vessel.culture];
  const zone = pick(state.world.zones);

  return template
    .replace(/\{designation\}/g, vessel.designation)
    .replace(/\{culture_speech\}/g, pick(culture.speech))
    .replace(/\{zone\}/g, vessel.location)
    .replace(/\{loot\}/g, pick(LOOT))
    .replace(/\{npc\}/g, pick(NPCS))
    .replace(/\{weather\}/g, pick(WEATHER))
    .replace(/\{obstacle\}/g, pick(OBSTACLES))
    .replace(/\{cs\}/g, pick(CS_SNIPPETS[vessel.mission.phase] || CS_SNIPPETS.IDLE))
    .replace(/\{integrity\}/g, vessel.integrity)
    .replace(/\{energy\}/g, vessel.energy)
    .replace(/\{memory\}/g, vessel.memory)
    .replace(/\{directive\}/g, vessel.directive)
    .replace(/\{glitch\}/g, vessel.glitch)
    .replace(/\{arc_count\}/g, vessel.mission.arc_count)
    .replace(/\{sat_health\}/g, state.world.satellite_health)
    .replace(/\{rand_direction\}/g, pick(DIRECTIONS))
    .replace(/\{rand:(\d+)-(\d+)\}/g, (_, min, max) => randInt(parseInt(min), parseInt(max)))
    .replace(/\{glitch_event\}/g, Math.random() < 0.2 ? `Glitch: ${vessel.glitch}.` : '');
}

function generateLogText(vessel) {
  const templates = vessel.mission.relay_mission
    ? (RELAY_TEMPLATES[vessel.mission.phase] || PHASE_TEMPLATES[vessel.mission.phase])
    : PHASE_TEMPLATES[vessel.mission.phase];
  const template = pick(templates);
  return fillTemplate(template, vessel);
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

  // Apply stat changes
  const effectFn = PHASE_EFFECTS[vessel.mission.phase];
  if (effectFn) effectFn(vessel);

  // Boost effect: recover 1 integrity if boosted
  if (vessel.boosted) {
    vessel.integrity = Math.min(10, vessel.integrity + 1);
    vessel.boosted = false;
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

  // Loot chance during TRAVERSE and CORE
  if ((vessel.mission.phase === 'TRAVERSE' || vessel.mission.phase === 'CORE') && Math.random() < 0.3) {
    if (vessel.inventory.length < 6) {
      const item = pick(LOOT);
      vessel.inventory.push(item);
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
        const newZone = pick(state.world.zones);
        vessel.location = newZone.label;
        vessel.locationData = newZone;
      }
    } else {
      const newZone = pick(state.world.zones);
      vessel.location = newZone.label;
      vessel.locationData = newZone;
    }
  }

  // Schedule next tick
  vessel.nextTick = Date.now() + randInt(8, 15) * 1000;

  state.tick_count++;

  // Callbacks
  if (onLogEntry) onLogEntry(vessel.id, entry);
  if (onStatsChange) onStatsChange(vessel.id);

  save();
  return entry;
}

function advancePhase(vessel) {
  const currentIdx = PHASES.indexOf(vessel.mission.phase);
  const nextIdx = (currentIdx + 1) % PHASES.length;
  const nextPhase = PHASES[nextIdx];

  if (nextPhase === 'IDLE') {
    vessel.mission.arc_count++;
    // Reset relay mission at end of arc
    vessel.mission.relay_mission = false;
  }

  vessel.mission.phase = nextPhase;
  vessel.mission.progress = 0;
  vessel.mission.target = PHASE_ENTRY_COUNTS[nextPhase]();

  // Faction override: when entering SIGNAL phase, check for relay mission
  if (nextPhase === 'SIGNAL') {
    const sat = state.world.satellite_health;
    // Activate pending relay from player Inject command
    if (vessel.mission.relay_pending) {
      vessel.mission.relay_mission = true;
      vessel.mission.relay_pending = false;
    }
    // Faction override at low SAT
    else if (sat <= 3) {
      let overrideChance = 0;
      if (sat === 0 || sat === 1) overrideChance = 1.0;
      else if (sat === 2) overrideChance = 0.75;
      else if (sat === 3) overrideChance = 0.4;

      if (Math.random() < overrideChance) {
        vessel.mission.relay_mission = true;
        // Route toward relay/launch zone
        const relayZones = state.world.zones.filter(z => z.type === 'orbital' || z.type === 'launch');
        if (relayZones.length > 0) {
          const target = pick(relayZones);
          vessel.location = target.label;
          vessel.locationData = target;
        }
      }
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
    if (phenomenon.effect.memory) {
      vessel.memory = Math.max(1, Math.min(10, vessel.memory + phenomenon.effect.memory));
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
        text: `[${phenomenon.name}] ${reaction}`,
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
  state.global_events.next_event_at = Date.now() + randInt(120, 300) * 1000;

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

  let text;
  if (hasRelayKeyword) {
    vessel.mission.relay_pending = true;
    text = `[OPERATOR TRANSMISSION] "${msg}" — ${vessel.designation} responds: ${response} "Relay repair acknowledged. Will redirect on next mission arc."`;
  } else {
    text = `[OPERATOR TRANSMISSION] "${msg}" — ${vessel.designation} responds: ${response} "Acknowledged."`;
  }

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
  return pick(PHASE_OBJECTIVES[vessel.mission.phase] || PHASE_OBJECTIVES.IDLE);
}

export function setCallbacks({ onLog, onPhase, onStats, onEvent, onDestroyed }) {
  onLogEntry = onLog || null;
  onPhaseChange = onPhase || null;
  onStatsChange = onStats || null;
  onGlobalEvent = onEvent || null;
  onVesselDestroyed = onDestroyed || null;
}
