// === UI RENDERING ===

import { CULTURES, PHENOMENA, CULTURE_DESCRIPTIONS, PHASE_DESCRIPTIONS, STAT_DESCRIPTIONS, PHASE_OBJECTIVES } from './data.js';
import { getState, getVessel, getPhases, getObjective, removeVessel } from './game.js';

const PHASES = getPhases();

// Escape strings for safe use in HTML attributes
function escAttr(str) {
  return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Phase icon mapping
const PHASE_ICONS = {
  IDLE: 'assets/icons/power.png',
  SIGNAL: 'assets/icons/signal-alert.png',
  TRAVERSE: 'assets/icons/network.png',
  BREACH: 'assets/icons/lock.png',
  FAULT: 'assets/icons/danger.png',
  CORE: 'assets/icons/star.png',
  REBOOT: 'assets/icons/wrench.png',
};

// === BOOT SCREEN ===

const BOOT_LINES = [
  '> SIGNAL LOST — OPERATOR CONSOLE v0.1',
  '> Initializing systems...',
  '> Satellite handshake: OK',
  '> Mesh network scan: 3 nodes detected',
  '> Uplink established.',
  '> Scanning for active vessels...',
  '',
  '> Ready. Enter operator ID or press CONNECT for auto-assign.',
];

export function renderBootScreen() {
  return new Promise((resolve) => {
    const bootText = document.getElementById('boot-text');
    const bootPrompt = document.getElementById('boot-prompt');
    const bootSubmit = document.getElementById('boot-submit');
    const operatorInput = document.getElementById('operator-input');

    let lineIdx = 0;
    let charIdx = 0;

    function typeNext() {
      if (lineIdx >= BOOT_LINES.length) {
        // Show input prompt
        bootPrompt.classList.remove('hidden');
        operatorInput.focus();

        const submit = () => {
          const id = operatorInput.value.trim().toUpperCase() || null;
          bootSubmit.removeEventListener('click', submit);
          operatorInput.removeEventListener('keydown', onKey);
          resolve(id);
        };

        const onKey = (e) => { if (e.key === 'Enter') submit(); };
        bootSubmit.addEventListener('click', submit);
        operatorInput.addEventListener('keydown', onKey);
        return;
      }

      const line = BOOT_LINES[lineIdx];
      if (charIdx === 0 && lineIdx > 0) {
        bootText.textContent += '\n';
      }

      if (charIdx < line.length) {
        bootText.textContent += line[charIdx];
        charIdx++;
        setTimeout(typeNext, 15 + Math.random() * 25);
      } else {
        lineIdx++;
        charIdx = 0;
        setTimeout(typeNext, 200 + Math.random() * 300);
      }
    }

    // Add blinking cursor
    bootText.textContent = '';
    typeNext();
  });
}

export function hideBootScreen() {
  const boot = document.getElementById('boot-screen');
  boot.classList.add('hidden');
}

export function showGameUI() {
  const gameUI = document.getElementById('game-ui');
  gameUI.classList.remove('hidden');
}

// === VESSEL COLUMNS ===

export function createVesselColumn(vessel) {
  const culture = CULTURES[vessel.culture];
  const area = document.getElementById('vessels-area');
  const addCol = document.getElementById('add-vessel-col');

  const col = document.createElement('div');
  col.className = 'vessel-col';
  col.id = `col-${vessel.id}`;
  col.dataset.vesselId = vessel.id;

  const objective = getObjective(vessel.id);

  col.innerHTML = `
    <div class="vessel-header">
      <span class="vessel-name"><img class="icon" src="assets/icons/network.png" alt="">${vessel.designation}</span>
      <span class="vessel-header-right">
        <span class="culture-tag" data-tooltip="${escAttr(CULTURE_DESCRIPTIONS[vessel.culture] || '')}">${culture.name} | ${vessel.chassis.locomotion}</span>
        <button class="vessel-disconnect" data-vessel-id="${vessel.id}" title="Disconnect from vessel signal">&times;</button>
      </span>
    </div>
    <div class="vessel-details-toggle" data-expanded="true"><span class="toggle-arrow">&#9660;</span> DETAILS</div>
    <div class="vessel-details-panel">
    <div class="vessel-stats">
      <div class="stat">
        <span class="stat-label" data-tooltip="${escAttr(STAT_DESCRIPTIONS.HP)}">HP</span>
        <div class="stat-bar"><div class="stat-bar-fill hp" style="width:${vessel.integrity * 10}%"></div></div>
        <span class="stat-value stat-hp">${vessel.integrity}/10</span>
      </div>
      <div class="stat">
        <span class="stat-label" data-tooltip="${escAttr(STAT_DESCRIPTIONS.EN)}">EN</span>
        <div class="stat-bar"><div class="stat-bar-fill energy" style="width:${vessel.energy * 10}%"></div></div>
        <span class="stat-value stat-en">${vessel.energy}/10</span>
      </div>
      <div class="stat">
        <span class="stat-label stat-skill" data-tooltip="${escAttr(STAT_DESCRIPTIONS.HW)}">HW</span>
        <span class="stat-value stat-hw">${vessel.skills?.hardware || 1}</span>
      </div>
      <div class="stat">
        <span class="stat-label stat-skill" data-tooltip="${escAttr(STAT_DESCRIPTIONS.IF)}">IF</span>
        <span class="stat-value stat-if">${vessel.skills?.interface || 1}</span>
      </div>
      <div class="stat">
        <span class="stat-label stat-skill" data-tooltip="${escAttr(STAT_DESCRIPTIONS.RS)}">RS</span>
        <span class="stat-value stat-rs">${vessel.skills?.research || 1}</span>
      </div>
    </div>
    <details class="vessel-info">
      <summary>SYSTEM INFO</summary>
      <div class="vessel-info-body">
        <span class="info-directive" data-tooltip="The vessel's original purpose — the task it was built to perform before the Silence."><img class="icon icon-cyan" src="assets/icons/settings.png" alt="">DIR: ${vessel.directive}</span>
        <br>
        <span class="info-glitch" data-tooltip="A persistent malfunction that affects the vessel's behavior in unexpected ways."><img class="icon icon-red" src="assets/icons/danger.png" alt="">BUG: ${vessel.glitch}</span>
      </div>
    </details>
    <div class="vessel-location">LOC: ${vessel.location}</div>
    <div class="vessel-objective" id="obj-${vessel.id}">
      <span class="obj-label">OBJECTIVE</span>
      ${objective}
    </div>
    </div><!-- /vessel-details-panel -->
    <div class="vessel-log" id="log-${vessel.id}"></div>
    <div class="vessel-phase">
      <span class="phase-label" data-tooltip="${escAttr(PHASE_DESCRIPTIONS[vessel.mission.phase] || '')}"><img class="icon" src="${PHASE_ICONS[vessel.mission.phase] || PHASE_ICONS.IDLE}" alt="">${vessel.mission.phase}</span>
      <div class="phase-segments">
        ${PHASES.map((p, i) => {
          const currentIdx = PHASES.indexOf(vessel.mission.phase);
          let cls = 'phase-seg';
          if (i < currentIdx) cls += ' completed';
          else if (i === currentIdx) cls += ' active';
          return `<div class="${cls}" data-tooltip="${escAttr(PHASE_DESCRIPTIONS[p] || p)}" title="${p}"></div>`;
        }).join('')}
      </div>
      <span class="arc-count" data-tooltip="How many full mission cycles this vessel has completed.">Arc #${vessel.mission.arc_count}</span>
    </div>
  `;

  // Insert before the add-vessel column
  area.insertBefore(col, addCol);

  // Render existing log entries (for restored saves)
  const logContainer = col.querySelector(`#log-${vessel.id}`);
  for (const entry of vessel.log.slice(-20)) {
    appendLogEntryDOM(logContainer, entry);
  }

  // Wire mobile details toggle — default collapsed on mobile
  const toggleBtn = col.querySelector('.vessel-details-toggle');
  const detailsPanel = col.querySelector('.vessel-details-panel');
  if (isMobile()) {
    detailsPanel.classList.add('collapsed');
    toggleBtn.dataset.expanded = 'false';
    toggleBtn.querySelector('.toggle-arrow').textContent = '\u25B6';
  }
  toggleBtn.addEventListener('click', () => {
    const expanded = toggleBtn.dataset.expanded === 'true';
    toggleBtn.dataset.expanded = expanded ? 'false' : 'true';
    detailsPanel.classList.toggle('collapsed');
    toggleBtn.querySelector('.toggle-arrow').textContent = expanded ? '\u25B6' : '\u25BC';
  });

  // Wire disconnect button
  col.querySelector('.vessel-disconnect').addEventListener('click', (e) => {
    e.stopPropagation();
    const state = getState();
    if (state.vessels.length <= 1) {
      alert('Cannot disconnect last vessel.');
      return;
    }
    if (!confirm(`Disconnect from ${vessel.designation}? Signal will be lost.`)) return;

    removeVessel(vessel.id);
    removeVesselColumn(vessel.id);
    removeVesselTab(vessel.id);

    // Select another vessel
    const remaining = getState().vessels;
    if (remaining.length > 0) {
      switchToVesselTab(remaining[0].id);
    }
    if (selectedVesselId === vessel.id) {
      selectedVesselId = remaining.length > 0 ? remaining[0].id : null;
      const targetEl = document.getElementById('cmd-target');
      if (targetEl) {
        if (selectedVesselId) {
          const v = getVessel(selectedVesselId);
          targetEl.textContent = `TARGET: ${v.designation}`;
          targetEl.classList.remove('dim');
        } else {
          targetEl.textContent = 'TARGET: none';
          targetEl.classList.add('dim');
        }
      }
    }
  });

  return col;
}

function appendLogEntryDOM(container, entry) {
  const div = document.createElement('div');
  let cls = 'log-entry';
  if (entry.isEvent) cls += ' event-entry glitch-entry';
  div.className = cls;
  div.innerHTML = `<span class="timestamp">[${entry.time}]</span> ${entry.text}`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

export function appendLogEntry(vesselId, entry) {
  const container = document.getElementById(`log-${vesselId}`);
  if (!container) return;
  appendLogEntryDOM(container, entry);

  // Trim old entries from DOM (keep last 30)
  while (container.children.length > 30) {
    container.removeChild(container.firstChild);
  }
}

export function updateStats(vesselId) {
  const vessel = getVessel(vesselId);
  if (!vessel) return;

  const col = document.getElementById(`col-${vesselId}`);
  if (!col) return;

  // Update bars
  const hpBar = col.querySelector('.stat-bar-fill.hp');
  hpBar.style.width = `${vessel.integrity * 10}%`;
  hpBar.style.background = vessel.integrity <= 3 ? 'var(--red)' : vessel.integrity <= 5 ? 'var(--amber)' : '#00cc33';

  col.querySelector('.stat-bar-fill.energy').style.width = `${vessel.energy * 10}%`;

  // Update values
  const hpVal = col.querySelector('.stat-hp');
  hpVal.textContent = `${vessel.integrity}/10`;
  hpVal.style.color = vessel.integrity <= 3 ? 'var(--red)' : '';

  col.querySelector('.stat-en').textContent = `${vessel.energy}/10`;

  // Update skills
  const hwEl = col.querySelector('.stat-hw');
  const ifEl = col.querySelector('.stat-if');
  const rsEl = col.querySelector('.stat-rs');
  if (hwEl) hwEl.textContent = vessel.skills?.hardware || 1;
  if (ifEl) ifEl.textContent = vessel.skills?.interface || 1;
  if (rsEl) rsEl.textContent = vessel.skills?.research || 1;

  // Update location
  col.querySelector('.vessel-location').textContent = `LOC: ${vessel.location}`;
}

export function updatePhase(vesselId) {
  const vessel = getVessel(vesselId);
  if (!vessel) return;

  const col = document.getElementById(`col-${vesselId}`);
  if (!col) return;

  const phaseLabel = col.querySelector('.phase-label');
  phaseLabel.innerHTML = `<img class="icon" src="${PHASE_ICONS[vessel.mission.phase] || PHASE_ICONS.IDLE}" alt="">${vessel.mission.phase}`;
  phaseLabel.dataset.tooltip = PHASE_DESCRIPTIONS[vessel.mission.phase] || '';
  col.querySelector('.arc-count').textContent = `Arc #${vessel.mission.arc_count}`;

  // Rebuild phase segments to match procedural arc length
  const arcPhases = vessel.mission.arc ? vessel.mission.arc.phases : PHASES;
  const arcIdx = vessel.mission.arc ? vessel.mission.arc.phase_index : PHASES.indexOf(vessel.mission.phase);
  const segContainer = col.querySelector('.phase-segments');
  if (segContainer) {
    segContainer.innerHTML = arcPhases.map((p, i) => {
      let cls = 'phase-seg';
      if (i < arcIdx) cls += ' completed';
      else if (i === arcIdx) cls += ' active';
      return `<div class="${cls}" data-tooltip="${escAttr(PHASE_DESCRIPTIONS[p] || p)}" title="${p}"></div>`;
    }).join('');
  }

  // Update objective
  updateObjective(vesselId);
}

export function updateObjective(vesselId) {
  const objEl = document.getElementById(`obj-${vesselId}`);
  if (!objEl) return;
  const vessel = getVessel(vesselId);
  const objective = getObjective(vesselId);
  const isRelay = vessel && vessel.mission.relay_mission;
  const isFaction = vessel && vessel.mission.faction_mission;
  const label = isRelay ? 'RELAY MISSION' : isFaction ? 'FACTION MISSION' : 'OBJECTIVE';
  objEl.innerHTML = `<span class="obj-label">${label}</span>${objective}`;
  objEl.classList.toggle('relay-objective', !!isRelay);
  objEl.classList.toggle('faction-objective', !!isFaction);
}

// === TOP BANNER ===

export function updateSatelliteHealth() {
  const state = getState();
  if (!state) return;

  const sat = state.world.satellite_health;
  const healthEl = document.getElementById('sat-health');
  const statusEl = document.getElementById('sat-status');
  healthEl.textContent = sat;

  statusEl.className = '';
  if (sat === 0) statusEl.className = 'dark-mode';
  else if (sat <= 2) statusEl.className = 'critical';
  else if (sat <= 3) statusEl.className = 'degraded';
}

// Toggle dark mode UI state when SAT hits 0
export function updateDarkMode() {
  const state = getState();
  if (!state) return;

  const sat = state.world.satellite_health;
  const banner = document.getElementById('top-banner');
  const bottomBar = document.getElementById('bottom-bar');

  if (sat === 0) {
    banner.classList.add('sat-dark-mode');
    bottomBar.classList.add('sat-dark-mode');
  } else {
    banner.classList.remove('sat-dark-mode');
    bottomBar.classList.remove('sat-dark-mode');
  }
}

// === GLOBAL EVENTS ===

let globalEventDismissWired = false;

export function showGlobalEvent(phenomenon) {
  const banner = document.getElementById('global-event');
  const text = document.getElementById('global-event-text');
  const gameUI = document.getElementById('game-ui');

  text.textContent = `[${phenomenon.name}] ${phenomenon.banner}`;
  banner.classList.remove('hidden');

  // Wire dismiss button (once)
  if (!globalEventDismissWired) {
    globalEventDismissWired = true;
    document.getElementById('global-event-dismiss').addEventListener('click', () => {
      banner.classList.add('hidden');
    });
  }

  // Trigger glitch effects
  gameUI.classList.add('glitch-active', 'glitch-chromatic', 'glitch-bars');
  banner.classList.add('glitch-text');

  // Clean up glitch classes after animations complete
  setTimeout(() => {
    gameUI.classList.remove('glitch-active', 'glitch-chromatic', 'glitch-bars');
    banner.classList.remove('glitch-text');
  }, 2000);
}

export function hideGlobalEvent() {
  document.getElementById('global-event').classList.add('hidden');
}

// === SELECTED VESSEL (for operator commands) ===

let selectedVesselId = null;

export function getSelectedVesselId() { return selectedVesselId; }

export function setupVesselSelection() {
  document.getElementById('vessels-area').addEventListener('click', (e) => {
    const col = e.target.closest('.vessel-col');
    if (!col || col.classList.contains('add-col')) return;

    // Deselect previous
    document.querySelectorAll('.vessel-col.selected').forEach(el => el.classList.remove('selected'));

    col.classList.add('selected');
    selectedVesselId = col.dataset.vesselId;

    // Update command target display
    const vessel = getVessel(selectedVesselId);
    const targetEl = document.getElementById('cmd-target');
    if (targetEl && vessel) {
      targetEl.textContent = `TARGET: ${vessel.designation}`;
      targetEl.classList.remove('dim');
    }
  });
}

// === TOOLTIP SYSTEM ===

export function setupTooltips() {
  const tooltip = document.getElementById('tooltip');
  if (!tooltip) return;

  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('[data-tooltip]');
    if (!target || !target.dataset.tooltip) return;

    tooltip.textContent = target.dataset.tooltip;
    tooltip.classList.remove('hidden');

    const rect = target.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    // Position above the element, centered
    let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
    let top = rect.top - tooltipRect.height - 8;

    // Keep within viewport
    if (left < 8) left = 8;
    if (left + tooltipRect.width > window.innerWidth - 8) left = window.innerWidth - tooltipRect.width - 8;
    if (top < 8) {
      top = rect.bottom + 8; // flip below if no room above
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  });

  document.addEventListener('mouseout', (e) => {
    const target = e.target.closest('[data-tooltip]');
    if (!target) return;
    tooltip.classList.add('hidden');
  });
}

// === VESSEL REMOVAL ===

export function removeVesselColumn(vesselId) {
  const col = document.getElementById(`col-${vesselId}`);
  if (col) col.remove();
}

export function removeVesselTab(vesselId) {
  const tabBar = document.getElementById('vessel-tabs');
  if (!tabBar) return;
  const tab = tabBar.querySelector(`.vessel-tab[data-vessel-id="${vesselId}"]`);
  if (tab) tab.remove();
}

// === MOBILE TAB SYSTEM ===

function isMobile() {
  return window.matchMedia('(max-width: 767px)').matches;
}

export function addVesselTab(vessel) {
  const tabBar = document.getElementById('vessel-tabs');
  if (!tabBar) return;

  // Remove the add-tab if it exists (we'll re-add it at the end)
  const existingAddTab = tabBar.querySelector('.tab-add');
  if (existingAddTab) existingAddTab.remove();

  const tab = document.createElement('button');
  tab.className = 'vessel-tab';
  tab.dataset.vesselId = vessel.id;
  tab.textContent = vessel.designation;
  tab.addEventListener('click', () => switchToVesselTab(vessel.id));
  tabBar.appendChild(tab);

  // Re-add the "+" tab
  const addTab = document.createElement('button');
  addTab.className = 'vessel-tab tab-add';
  addTab.textContent = '+ ADD';
  addTab.addEventListener('click', () => {
    document.getElementById('add-vessel-btn').click();
  });
  tabBar.appendChild(addTab);

  // If this is the first vessel or on mobile, activate it
  if (tabBar.querySelectorAll('.vessel-tab:not(.tab-add)').length === 1) {
    switchToVesselTab(vessel.id);
  }
}

export function switchToVesselTab(vesselId) {
  const tabBar = document.getElementById('vessel-tabs');

  // Update tab active state
  tabBar.querySelectorAll('.vessel-tab').forEach(t => t.classList.remove('active'));
  const activeTab = tabBar.querySelector(`.vessel-tab[data-vessel-id="${vesselId}"]`);
  if (activeTab) activeTab.classList.add('active');

  // On mobile: show only the active vessel column
  if (isMobile()) {
    document.querySelectorAll('.vessel-col:not(.add-col)').forEach(col => {
      col.classList.remove('mobile-active');
    });
    const col = document.getElementById(`col-${vesselId}`);
    if (col) col.classList.add('mobile-active');
  }

  // Also select this vessel for commands
  document.querySelectorAll('.vessel-col.selected').forEach(el => el.classList.remove('selected'));
  const col = document.getElementById(`col-${vesselId}`);
  if (col) col.classList.add('selected');
  selectedVesselId = vesselId;

  const vessel = getVessel(vesselId);
  const targetEl = document.getElementById('cmd-target');
  if (targetEl && vessel) {
    targetEl.textContent = `TARGET: ${vessel.designation}`;
    targetEl.classList.remove('dim');
  }
}

// On window resize, sync mobile-active state
export function setupMobileResize() {
  window.addEventListener('resize', () => {
    if (isMobile()) {
      // Ensure one vessel is visible
      const anyActive = document.querySelector('.vessel-col.mobile-active');
      if (!anyActive) {
        const first = document.querySelector('.vessel-col:not(.add-col)');
        if (first) {
          first.classList.add('mobile-active');
          switchToVesselTab(first.dataset.vesselId);
        }
      }
    }
  });
}
