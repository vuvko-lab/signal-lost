// === MAIN ENTRY POINT ===

import {
  createWorld, createVessel, load, tick, checkGlobalEvent,
  getState, getVessel, setCallbacks, boostVessel, pingVessel, injectCommand,
  checkSatDecay, getSatHealth, checkWorldThreats,
} from './game.js';

import {
  renderBootScreen, hideBootScreen, showGameUI,
  createVesselColumn, appendLogEntry, updateStats, updatePhase,
  updateSatelliteHealth, showGlobalEvent, setupVesselSelection,
  getSelectedVesselId, setupTooltips, updateObjective,
  addVesselTab, switchToVesselTab, setupMobileResize,
  updateDarkMode, removeVesselColumn, removeVesselTab,
  gameAlert, gameConfirm, gamePrompt,
  updateBootLoadProgress, finishBootLoading, continueBootAfterLoad,
} from './ui.js';

import { initAudio, preloadAudio } from './audio.js';

import {
  initTableConfig, getTable, setTable, resetTable, resetAllTables,
  exportTables, importTables, getTableList, getTableVersion,
} from './config.js';

import {
  DESIGNATIONS, CHASSIS_SIZES, CHASSIS_LOCOMOTION, CHASSIS_TYPES,
  CULTURES, CULTURE_KEYS, FACTION_DESIRES, DIRECTIVES, GLITCHES,
  ZONE_TYPES, ZONE_NAMES, LOOT, NPCS, WEATHER, OBSTACLES,
  PHASE_TEMPLATES, PHENOMENA, CULTURE_DESCRIPTIONS,
  PHASE_DESCRIPTIONS, STAT_DESCRIPTIONS, SKILL_LOOT, PHASE_OBJECTIVES,
  RELAY_TEMPLATES, RELAY_OBJECTIVES, RELAY_LOOT, INTERACTION_TEMPLATES,
  WORLD_THREATS, ARC_STRUCTURES, ARC_MODIFIERS, ENCOUNTER_THEMES, DIRECTIONS,
  INJECT_MANIFESTATIONS, INJECT_RELAY_MANIFESTATIONS,
} from './data.js';

// === GAME LOOP ===

let tickInterval = null;
let globalEventInterval = null;
let satDecayInterval = null;

function startGameLoop() {
  // Vessel ticks — check every second, fire when due
  tickInterval = setInterval(() => {
    const state = getState();
    if (!state) return;

    const now = Date.now();
    for (const vessel of [...state.vessels]) {
      if (now >= vessel.nextTick) {
        tick(vessel);
      }
    }
  }, 1000);

  // Global event check — every 5 seconds
  globalEventInterval = setInterval(() => {
    checkGlobalEvent();
    checkWorldThreats();
  }, 5000);

  // SAT natural decay — every 90-120 seconds
  scheduleSatDecay();
}

function scheduleSatDecay() {
  const delay = (180 + Math.random() * 120) * 1000; // 180-300s (3-5 min)
  satDecayInterval = setTimeout(() => {
    checkSatDecay();
    updateSatelliteHealth();
    updateDarkMode();
    scheduleSatDecay(); // schedule next
  }, delay);
}

// === CALLBACKS ===

setCallbacks({
  onLog: (vesselId, entry) => {
    appendLogEntry(vesselId, entry);
  },
  onPhase: (vesselId) => {
    updatePhase(vesselId);
    updateObjective(vesselId);
  },
  onStats: (vesselId) => {
    updateStats(vesselId);
    updateSatelliteHealth();
    updateDarkMode();
  },
  onEvent: (phenomenon) => {
    showGlobalEvent(phenomenon);
    updateSatelliteHealth();
    updateDarkMode();
    // Update all vessel phases/stats in UI
    const state = getState();
    for (const v of state.vessels) {
      updateStats(v.id);
      updatePhase(v.id);
    }
  },
  onDestroyed: (vesselId) => {
    removeVesselColumn(vesselId);
    removeVesselTab(vesselId);
    // Select another vessel if the destroyed one was selected
    const state = getState();
    const remaining = state.vessels;
    if (remaining.length > 0) {
      switchToVesselTab(remaining[0].id);
    } else {
      const targetEl = document.getElementById('cmd-target');
      if (targetEl) {
        targetEl.textContent = 'TARGET: none';
        targetEl.classList.add('dim');
      }
    }
  },
});

// === OPERATOR COMMANDS ===

const cooldowns = { boost: 0, ping: 0, inject: 0 };

function setupCommands() {
  const boostBtn = document.getElementById('cmd-boost');
  const pingBtn = document.getElementById('cmd-ping');
  const injectBtn = document.getElementById('cmd-inject');

  function getTargetVessel() {
    const vid = getSelectedVesselId();
    if (!vid) {
      // Flash the target indicator to hint the user should select a vessel
      const targetEl = document.getElementById('cmd-target');
      targetEl.style.color = 'var(--red)';
      setTimeout(() => { targetEl.style.color = ''; }, 1000);
      return null;
    }
    return vid;
  }

  boostBtn.addEventListener('click', () => {
    const vid = getTargetVessel();
    if (!vid || cooldowns.boost > Date.now()) return;
    // SAT 0: commands disabled
    if (getSatHealth() === 0) {
      flashSatFailure();
      return;
    }
    const result = boostVessel(vid);
    cooldowns.boost = Date.now() + 60000;
    startCooldownDisplay(boostBtn, 60);
    if (result && !result.success && result.reason === 'sat') flashSatFailure();
  });

  pingBtn.addEventListener('click', () => {
    const vid = getTargetVessel();
    if (!vid || cooldowns.ping > Date.now()) return;
    if (getSatHealth() === 0) {
      flashSatFailure();
      return;
    }
    const result = pingVessel(vid);
    cooldowns.ping = Date.now() + 90000;
    startCooldownDisplay(pingBtn, 90);
    if (result && !result.success && result.reason === 'sat') flashSatFailure();
  });

  injectBtn.addEventListener('click', async () => {
    const vid = getTargetVessel();
    if (!vid || cooldowns.inject > Date.now()) return;
    if (getSatHealth() === 0) {
      flashSatFailure();
      return;
    }
    const msg = await gamePrompt('Enter transmission message:', 'Message text...');
    if (msg === null) return;
    const result = injectCommand(vid, msg);
    cooldowns.inject = Date.now() + 120000;
    startCooldownDisplay(injectBtn, 120);
    if (result && !result.success && result.reason === 'sat') flashSatFailure();
  });
}

function flashSatFailure() {
  const satStatus = document.getElementById('sat-status');
  const targetEl = document.getElementById('cmd-target');
  satStatus.classList.add('sat-flash-fail');
  if (targetEl) {
    targetEl.textContent = 'SIGNAL LOST — command failed';
    targetEl.style.color = 'var(--red)';
  }
  setTimeout(() => {
    satStatus.classList.remove('sat-flash-fail');
    if (targetEl) {
      targetEl.style.color = '';
      const vid = getSelectedVesselId();
      const v = vid ? getVessel(vid) : null;
      targetEl.textContent = v ? `TARGET: ${v.designation}` : 'TARGET: none';
    }
  }, 2000);
}

function startCooldownDisplay(btn, seconds) {
  btn.disabled = true;
  const originalHTML = btn.innerHTML;
  const label = btn.textContent.trim();
  let remaining = seconds;

  const icon = btn.querySelector('.icon');
  const iconHTML = icon ? icon.outerHTML : '';

  const interval = setInterval(() => {
    remaining--;
    btn.innerHTML = `${iconHTML}${label} (${remaining}s)`;
    if (remaining <= 0) {
      clearInterval(interval);
      btn.innerHTML = originalHTML;
      btn.disabled = false;
    }
  }, 1000);
}


// === FONT SIZE ===

const FONT_SCALES = [0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4];
const DEFAULT_SCALE_IDX = 2; // 1.0

function setupFontSize() {
  const downBtn = document.getElementById('font-down-btn');
  const upBtn = document.getElementById('font-up-btn');

  // Restore saved preference
  const saved = localStorage.getItem('signal_lost_font_scale');
  let idx = saved !== null ? FONT_SCALES.indexOf(parseFloat(saved)) : DEFAULT_SCALE_IDX;
  if (idx === -1) idx = DEFAULT_SCALE_IDX;

  applyFontScale(FONT_SCALES[idx]);

  downBtn.addEventListener('click', () => {
    if (idx > 0) {
      idx--;
      applyFontScale(FONT_SCALES[idx]);
      localStorage.setItem('signal_lost_font_scale', FONT_SCALES[idx]);
    }
  });

  upBtn.addEventListener('click', () => {
    if (idx < FONT_SCALES.length - 1) {
      idx++;
      applyFontScale(FONT_SCALES[idx]);
      localStorage.setItem('signal_lost_font_scale', FONT_SCALES[idx]);
    }
  });
}

function applyFontScale(scale) {
  document.documentElement.style.setProperty('--font-scale', scale);
}

// === ADD VESSEL ===

function setupAddVessel() {
  document.getElementById('add-vessel-btn').addEventListener('click', async () => {
    const state = getState();
    // if (state.vessels.length >= 8) {
    //   await gameAlert('Maximum 8 vessel feeds.');
    //   return;
    // }
    const vessel = createVessel();
    createVesselColumn(vessel);
    addVesselTab(vessel);
    switchToVesselTab(vessel.id);

    // Add initial log entry with recruitment context
    let recruitText = '';
    if (vessel.recruitLink) {
      const link = vessel.recruitLink;
      if (link.type === 'faction') {
        recruitText = ` Recruited via ${link.shared} cultural network — ${link.anchorName} flagged this ego on faction mesh.`;
      } else if (link.type === 'location') {
        recruitText = ` Detected near ${link.shared} — ${link.anchorName} reported secondary signal at same coordinates.`;
      } else if (link.type === 'directive') {
        recruitText = ` Shares directive with ${link.anchorName}: "${link.shared}" Parallel mission acknowledged.`;
      }
    }
    const entry = {
      time: new Date().toTimeString().slice(0, 8),
      text: `New signal acquired. ${vessel.designation} — ${vessel.chassis.size} ${vessel.chassis.locomotion} ${vessel.chassis.type}. Culture: ${vessel.culture}. Directive: "${vessel.directive}" Glitch: ${vessel.glitch}.${recruitText}`,
      phase: 'IDLE',
      isEvent: false,
    };
    vessel.log.push(entry);
    appendLogEntry(vessel.id, entry);
  });
}

// === ABOUT SCREEN ===

function setupAboutScreen() {
  const overlay = document.getElementById('about-overlay');
  const closeBtn = document.getElementById('about-close');
  const aboutBtn = document.getElementById('about-btn');
  const creditsLink = document.getElementById('credits-about-link');

  aboutBtn.addEventListener('click', () => overlay.classList.remove('hidden'));
  closeBtn.addEventListener('click', () => overlay.classList.add('hidden'));
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.add('hidden');
  });

  if (creditsLink) {
    creditsLink.addEventListener('click', (e) => {
      e.preventDefault();
      overlay.classList.remove('hidden');
    });
  }
}

// === TABLE CONFIG ===

function registerTables() {
  initTableConfig({
    DESIGNATIONS, CHASSIS_SIZES, CHASSIS_LOCOMOTION, CHASSIS_TYPES,
    CULTURES, CULTURE_KEYS, FACTION_DESIRES, DIRECTIVES, GLITCHES,
    ZONE_TYPES, ZONE_NAMES, LOOT, NPCS, WEATHER, OBSTACLES,
    PHASE_TEMPLATES, PHENOMENA, CULTURE_DESCRIPTIONS,
    PHASE_DESCRIPTIONS, STAT_DESCRIPTIONS, SKILL_LOOT, PHASE_OBJECTIVES,
    RELAY_TEMPLATES, RELAY_OBJECTIVES, RELAY_LOOT, INTERACTION_TEMPLATES,
    WORLD_THREATS, ARC_STRUCTURES, ARC_MODIFIERS, ENCOUNTER_THEMES, DIRECTIONS,
    INJECT_MANIFESTATIONS, INJECT_RELAY_MANIFESTATIONS,
  });
}

function setupConfigScreen() {
  const overlay = document.getElementById('config-overlay');
  const closeBtn = document.getElementById('config-close');
  const exportBtn = document.getElementById('config-export');
  const importBtn = document.getElementById('config-import');
  const importFile = document.getElementById('config-import-file');
  const resetAllBtn = document.getElementById('config-reset-all');
  const tableList = document.getElementById('config-table-list');
  const versionEl = document.getElementById('config-version');
  const editor = document.getElementById('config-editor');
  const editorName = document.getElementById('config-editor-name');
  const editorClose = document.getElementById('config-editor-close');
  const editorTextarea = document.getElementById('config-editor-textarea');
  const editorSave = document.getElementById('config-editor-save');
  const editorReset = document.getElementById('config-editor-reset');
  const editorStatus = document.getElementById('config-editor-status');

  let currentEditTable = null;

  // Open config
  document.getElementById('config-btn').addEventListener('click', () => {
    overlay.classList.remove('hidden');
    renderTableList();
    versionEl.textContent = `v${getTableVersion()}`;
    editor.classList.add('hidden');
    tableList.classList.remove('hidden');
  });

  // Close config
  closeBtn.addEventListener('click', () => {
    overlay.classList.add('hidden');
  });

  // Close on overlay background click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.add('hidden');
  });

  // Export
  exportBtn.addEventListener('click', () => {
    const json = exportTables();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `signal-lost-tables-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // Import
  importBtn.addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', () => {
    const file = importFile.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const result = importTables(reader.result);
      if (result.success) {
        renderTableList();
        await gameAlert(`Imported ${result.imported} tables (version: ${result.version})`);
      } else {
        await gameAlert(`Import failed: ${result.error}`);
      }
    };
    reader.readAsText(file);
    importFile.value = '';
  });

  // Reset all
  resetAllBtn.addEventListener('click', async () => {
    if (!await gameConfirm('Reset ALL tables to defaults? Custom changes will be lost.')) return;
    resetAllTables();
    renderTableList();
  });

  // Render table list
  function renderTableList() {
    const tables = getTableList();
    tableList.innerHTML = tables.map(t => `
      <div class="config-table-row">
        <span class="config-table-name">${t.name}</span>
        <span class="config-table-meta">${t.itemCount} items</span>
        ${t.isCustom ? '<span class="config-table-custom">CUSTOM</span>' : ''}
        <button class="config-table-edit" data-table="${t.name}">EDIT</button>
      </div>
    `).join('');

    // Wire edit buttons
    tableList.querySelectorAll('.config-table-edit').forEach(btn => {
      btn.addEventListener('click', () => openEditor(btn.dataset.table));
    });
  }

  // Open editor for a table
  function openEditor(name) {
    currentEditTable = name;
    editorName.textContent = name;
    editorTextarea.value = JSON.stringify(getTable(name), null, 2);
    editorStatus.textContent = '';
    tableList.classList.add('hidden');
    editor.classList.remove('hidden');
  }

  // Close editor
  editorClose.addEventListener('click', () => {
    editor.classList.add('hidden');
    tableList.classList.remove('hidden');
    renderTableList();
  });

  // Save editor
  editorSave.addEventListener('click', () => {
    try {
      const data = JSON.parse(editorTextarea.value);
      setTable(currentEditTable, data);
      editorStatus.textContent = 'Saved.';
      editorStatus.style.color = 'var(--green)';
      setTimeout(() => { editorStatus.textContent = ''; }, 2000);
    } catch (e) {
      editorStatus.textContent = `Error: ${e.message}`;
      editorStatus.style.color = 'var(--red)';
    }
  });

  // Reset single table
  editorReset.addEventListener('click', async () => {
    if (!await gameConfirm(`Reset ${currentEditTable} to default?`)) return;
    resetTable(currentEditTable);
    editorTextarea.value = JSON.stringify(getTable(currentEditTable), null, 2);
    editorStatus.textContent = 'Reset to default.';
    editorStatus.style.color = 'var(--amber)';
    setTimeout(() => { editorStatus.textContent = ''; }, 2000);
  });
}

// === INIT ===

async function init() {
  registerTables();
  const savedState = load();

  if (savedState) {
    // Restore from save — preload audio while restoring
    hideBootScreen();
    showGameUI();

    const preloaded = await preloadAudio();
    initAudio(preloaded);

    // Rebuild UI from state
    for (const vessel of savedState.vessels) {
      createVesselColumn(vessel);
      addVesselTab(vessel);
    }
    updateSatelliteHealth();
    updateDarkMode();

    // Fix tick timers and migrate old saves
    const now = Date.now();
    for (const vessel of savedState.vessels) {
      vessel.nextTick = now + Math.random() * 5000;
      // Migrate: add relay fields if missing (backward compat)
      if (vessel.mission.relay_mission === undefined) vessel.mission.relay_mission = false;
      if (vessel.mission.relay_pending === undefined) vessel.mission.relay_pending = false;
    }

    // Activate first vessel tab on mobile
    if (savedState.vessels.length > 0) {
      switchToVesselTab(savedState.vessels[0].id);
    }

    setupVesselSelection();
    setupCommands();
    setupAddVessel();
    setupFontSize();
    setupConfigScreen();
    setupAboutScreen();
    setupTooltips();
    setupMobileResize();
    startGameLoop();
  } else {
    // Fresh start — boot sequence with audio preloading
    await renderBootScreen(); // type initial boot lines

    // Preload audio — show progress in boot text
    const preloaded = await preloadAudio((loaded, total, label) => {
      updateBootLoadProgress(loaded, total, label);
    });
    finishBootLoading();

    // Continue boot sequence (remaining lines + operator prompt)
    const operatorId = await continueBootAfterLoad();
    hideBootScreen();
    showGameUI();
    initAudio(preloaded);

    // Create world and first vessel
    const state = createWorld(operatorId);
    const vessel = createVessel();
    createVesselColumn(vessel);
    addVesselTab(vessel);
    switchToVesselTab(vessel.id);

    // Initial log entry
    const entry = {
      time: new Date().toTimeString().slice(0, 8),
      text: `Signal acquired. ${vessel.designation} online. ${vessel.chassis.size} ${vessel.chassis.locomotion} ${vessel.chassis.type}. Culture: ${vessel.culture}. Directive: "${vessel.directive}" Glitch detected: ${vessel.glitch}. Monitoring feed.`,
      phase: 'IDLE',
      isEvent: false,
    };
    vessel.log.push(entry);
    appendLogEntry(vessel.id, entry);

    updateSatelliteHealth();
    setupVesselSelection();
    setupCommands();
    setupAddVessel();
    setupFontSize();
    setupConfigScreen();
    setupAboutScreen();
    setupTooltips();
    setupMobileResize();
    startGameLoop();
  }
}

init();
