// === MAIN ENTRY POINT ===

import {
  createWorld, createVessel, load, tick, checkGlobalEvent,
  getState, getVessel, setCallbacks, boostVessel, pingVessel, injectCommand,
  checkSatDecay, getSatHealth,
} from './game.js';

import {
  renderBootScreen, hideBootScreen, showGameUI,
  createVesselColumn, appendLogEntry, updateStats, updatePhase,
  updateSatelliteHealth, showGlobalEvent, setupVesselSelection,
  getSelectedVesselId, setupTooltips, updateObjective,
  addVesselTab, switchToVesselTab, setupMobileResize,
  updateDarkMode, removeVesselColumn, removeVesselTab,
} from './ui.js';

import { initAudio } from './audio.js';

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
  }, 5000);

  // SAT natural decay — every 90-120 seconds
  scheduleSatDecay();
}

function scheduleSatDecay() {
  const delay = (90 + Math.random() * 30) * 1000; // 90-120s
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

  injectBtn.addEventListener('click', () => {
    const vid = getTargetVessel();
    if (!vid || cooldowns.inject > Date.now()) return;
    if (getSatHealth() === 0) {
      flashSatFailure();
      return;
    }
    const msg = prompt('Enter transmission message:');
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

// === CRT TOGGLE ===

function setupCRTToggle() {
  const btn = document.getElementById('crt-toggle-btn');
  const overlay = document.getElementById('crt-overlay');

  // Restore saved preference
  if (localStorage.getItem('signal_lost_crt') === 'off') {
    overlay.classList.add('crt-off');
    btn.classList.add('crt-off');
  }

  btn.addEventListener('click', () => {
    overlay.classList.toggle('crt-off');
    btn.classList.toggle('crt-off');
    localStorage.setItem('signal_lost_crt', overlay.classList.contains('crt-off') ? 'off' : 'on');
  });
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
  document.getElementById('add-vessel-btn').addEventListener('click', () => {
    const state = getState();
    if (state.vessels.length >= 4) {
      alert('Maximum 4 vessel feeds.');
      return;
    }
    const vessel = createVessel();
    createVesselColumn(vessel);
    addVesselTab(vessel);
    switchToVesselTab(vessel.id);

    // Add initial log entry
    const entry = {
      time: new Date().toTimeString().slice(0, 8),
      text: `New signal acquired. ${vessel.designation} — ${vessel.chassis.size} ${vessel.chassis.locomotion} ${vessel.chassis.type}. Culture: ${vessel.culture}. Directive: "${vessel.directive}" Glitch: ${vessel.glitch}.`,
      phase: 'IDLE',
      isEvent: false,
    };
    vessel.log.push(entry);
    appendLogEntry(vessel.id, entry);
  });
}

// === INIT ===

async function init() {
  const savedState = load();

  if (savedState) {
    // Restore from save
    hideBootScreen();
    showGameUI();
    initAudio();

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
    setupCRTToggle();
    setupFontSize();
    setupTooltips();
    setupMobileResize();
    startGameLoop();
  } else {
    // Fresh start — boot sequence
    const operatorId = await renderBootScreen();
    hideBootScreen();
    showGameUI();
    initAudio();

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
    setupCRTToggle();
    setupFontSize();
    setupTooltips();
    setupMobileResize();
    startGameLoop();
  }
}

init();
