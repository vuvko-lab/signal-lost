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
  IDLE: 'assets/icons/danger.png',
  SIGNAL: 'assets/icons/danger.png',
  TRAVERSE: 'assets/icons/danger.png',
  BREACH: 'assets/icons/danger.png',
  FAULT: 'assets/icons/danger.png',
  CORE: 'assets/icons/danger.png',
  REBOOT: 'assets/icons/danger.png',
};

// === IN-GAME DIALOG ===

export function gameAlert(message) {
  return new Promise((resolve) => {
    const overlay = document.getElementById('dialog-overlay');
    const text = document.getElementById('dialog-text');
    const input = document.getElementById('dialog-input');
    const buttons = document.getElementById('dialog-buttons');

    text.textContent = message;
    input.classList.add('hidden');
    buttons.innerHTML = '<button class="dialog-btn dialog-primary">OK</button>';
    overlay.classList.remove('hidden');

    buttons.querySelector('.dialog-btn').addEventListener('click', () => {
      overlay.classList.add('hidden');
      resolve();
    }, { once: true });
  });
}

export function gameConfirm(message) {
  return new Promise((resolve) => {
    const overlay = document.getElementById('dialog-overlay');
    const text = document.getElementById('dialog-text');
    const input = document.getElementById('dialog-input');
    const buttons = document.getElementById('dialog-buttons');

    text.textContent = message;
    input.classList.add('hidden');
    buttons.innerHTML = `
      <button class="dialog-btn dialog-danger" data-result="cancel">CANCEL</button>
      <button class="dialog-btn dialog-primary" data-result="ok">CONFIRM</button>
    `;
    overlay.classList.remove('hidden');

    buttons.querySelectorAll('.dialog-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        overlay.classList.add('hidden');
        resolve(btn.dataset.result === 'ok');
      }, { once: true });
    });
  });
}

export function gamePrompt(message, placeholder) {
  return new Promise((resolve) => {
    const overlay = document.getElementById('dialog-overlay');
    const text = document.getElementById('dialog-text');
    const input = document.getElementById('dialog-input');
    const buttons = document.getElementById('dialog-buttons');

    text.textContent = message;
    input.classList.remove('hidden');
    input.value = '';
    input.placeholder = placeholder || '';
    buttons.innerHTML = `
      <button class="dialog-btn" data-result="cancel">CANCEL</button>
      <button class="dialog-btn dialog-primary" data-result="ok">SEND</button>
    `;
    overlay.classList.remove('hidden');
    input.focus();

    const submit = (result) => {
      overlay.classList.add('hidden');
      resolve(result === 'ok' ? input.value : null);
    };

    buttons.querySelectorAll('.dialog-btn').forEach(btn => {
      btn.addEventListener('click', () => submit(btn.dataset.result), { once: true });
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submit('ok');
      if (e.key === 'Escape') submit('cancel');
    }, { once: true });
  });
}

// === BOOT SCREEN ===

const BOOT_LINES = [
  '> SIGNAL LOST — OPERATOR CONSOLE v0.1',
  '> Initializing systems...',
  '> Satellite handshake: OK',
  '> Mesh network scan: 3 nodes detected',
  '> Uplink established.',
  '> Loading audio subsystems...',
];

const BOOT_LINES_POST_LOAD = [
  '> Scanning for active vessels...',
  '',
  '> Ready. Enter operator ID or press CONNECT for auto-assign.',
];

// Type a set of lines into the boot text element, returns a promise when done
function typeLines(bootText, lines, startFromNewline) {
  return new Promise((resolve) => {
    let lineIdx = 0;
    let charIdx = 0;

    function typeNext() {
      if (lineIdx >= lines.length) {
        resolve();
        return;
      }

      const line = lines[lineIdx];
      if (charIdx === 0 && (lineIdx > 0 || startFromNewline)) {
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

    typeNext();
  });
}

// Update a loading progress line in boot text (replaces the last line)
export function updateBootLoadProgress(loaded, total, label) {
  const bootText = document.getElementById('boot-text');
  if (!bootText) return;
  const lines = bootText.textContent.split('\n');
  // Replace the last line with the progress indicator
  const pct = Math.round((loaded / total) * 100);
  const bar = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(10 - Math.round(pct / 10));
  lines[lines.length - 1] = `> Loading audio [${bar}] ${pct}% — ${label}`;
  bootText.textContent = lines.join('\n');
}

// Mark loading complete and continue boot sequence with remaining lines + prompt
export function finishBootLoading() {
  const bootText = document.getElementById('boot-text');
  if (!bootText) return;
  const lines = bootText.textContent.split('\n');
  lines[lines.length - 1] = '> Audio subsystems: OK';
  bootText.textContent = lines.join('\n');
}

export async function renderBootScreen() {
  const bootText = document.getElementById('boot-text');
  bootText.textContent = '';
  // Type initial boot lines — resolves when typing is done
  await typeLines(bootText, BOOT_LINES, false);
}

export function continueBootAfterLoad() {
  return new Promise((resolve) => {
    const bootText = document.getElementById('boot-text');
    const bootPrompt = document.getElementById('boot-prompt');
    const bootSubmit = document.getElementById('boot-submit');
    const operatorInput = document.getElementById('operator-input');

    typeLines(bootText, BOOT_LINES_POST_LOAD, true).then(() => {
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
    });
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
  col.className = `vessel-col culture-${vessel.culture}`;
  col.id = `col-${vessel.id}`;
  col.dataset.vesselId = vessel.id;

  const objective = getObjective(vessel.id);

  col.innerHTML = `
    <div class="vessel-header">
      <span class="vessel-name">${vessel.designation}</span>
      <span class="vessel-header-right">
        <span class="culture-tag" data-tooltip="${escAttr(CULTURE_DESCRIPTIONS[vessel.culture] || '')}">${culture.name}</span>
        <button class="vessel-disconnect" data-vessel-id="${vessel.id}" title="Disconnect from vessel signal">&times;</button>
      </span>
    </div>
    <div class="vessel-details-toggle" data-expanded="true"><span class="toggle-arrow">&#9660;</span> DETAILS</div>
    <div class="vessel-details-panel">
    <div class="vessel-stats">
      <div class="stat-row stat-row-bars">
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
      </div>
      <div class="stat-row stat-row-skills">
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
    </div>
    <div class="vessel-location">LOC: ${vessel.location}</div>
    <div class="vessel-objective" id="obj-${vessel.id}">
      <span class="obj-label">OBJECTIVE</span>
      ${objective}
    </div>
    </div><!-- /vessel-details-panel -->
    <div class="vessel-log" id="log-${vessel.id}"></div>
    <div class="vessel-phase">
      <span class="phase-label" data-tooltip="${escAttr(PHASE_DESCRIPTIONS[vessel.mission.phase] || '')}">${vessel.mission.phase}</span>
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
  col.querySelector('.vessel-disconnect').addEventListener('click', async (e) => {
    e.stopPropagation();
    const state = getState();
    if (state.vessels.length <= 1) {
      await gameAlert('Cannot disconnect last vessel.');
      return;
    }
    if (!await gameConfirm(`Disconnect from ${vessel.designation}? Signal will be lost.`)) return;

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

function highlightLogText(text) {
  // Tags like [LOOT], [MESH], [THREAT], [ARC], [OPERATOR BOOST], etc.
  text = text.replace(/\[([A-Z][A-Z /]+)\]/g, '<span class="hl-tag">[$1]</span>');

  // Stat values: X/10, X/5, +N skill bonuses
  text = text.replace(/(\d+)\/10/g, '<span class="hl-stat">$1/10</span>');
  text = text.replace(/(\d+)\/5/g, '<span class="hl-stat">$1/5</span>');
  text = text.replace(/\+(\d+)/g, '<span class="hl-bonus">+$1</span>');
  text = text.replace(/(?<!\d)-(\d+)/g, '<span class="hl-dmg">-$1</span>');

  // Items after "Found:" up to the next period
  text = text.replace(/Found: ([^.]+)\./g, 'Found: <span class="hl-item">$1</span>.');

  // Quoted speech (culture voice)
  text = text.replace(/'([^']+)'/g, '\'<span class="hl-speech">$1</span>\'');
  text = text.replace(/"([^"]+)"/g, '"<span class="hl-speech">$1</span>"');

  // Confidence percentages
  text = text.replace(/Confidence: (\d+)%/g, 'Confidence: <span class="hl-stat">$1%</span>');

  // Vessel designations (WORD-NUMBER pattern)
  text = text.replace(/\b([A-Z]{2,}-\d+)\b/g, '<span class="hl-vessel">$1</span>');

  return text;
}

function appendLogEntryDOM(container, entry) {
  const div = document.createElement('div');
  let cls = 'log-entry';
  if (entry.isEvent) cls += ' event-entry glitch-entry';
  if (entry.isDmg) cls += ' dmg-entry';
  div.className = cls;
  div.innerHTML = `<span class="timestamp">[${entry.time}]</span> ${highlightLogText(entry.text)}`;
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
  phaseLabel.innerHTML = `${vessel.mission.phase}`;
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

// === VESSEL DESTRUCTION / REMOVAL ===

export function removeVesselColumn(vesselId) {
  const col = document.getElementById(`col-${vesselId}`);
  if (!col) return;

  // Convert to "signal lost" memorial instead of removing
  const header = col.querySelector('.vessel-header');
  const name = header?.querySelector('.vessel-name')?.textContent || 'UNKNOWN';

  // Keep the log intact, overlay the rest
  const detailsPanel = col.querySelector('.vessel-details-panel');
  if (detailsPanel) detailsPanel.remove();
  const detailsToggle = col.querySelector('.vessel-details-toggle');
  if (detailsToggle) detailsToggle.remove();
  const phaseBar = col.querySelector('.vessel-phase');
  if (phaseBar) phaseBar.remove();
  const disconnectBtn = col.querySelector('.vessel-disconnect');
  if (disconnectBtn) disconnectBtn.remove();

  // Add signal-lost overlay
  col.classList.add('vessel-dead');
  const overlay = document.createElement('div');
  overlay.className = 'signal-lost-overlay';
  overlay.innerHTML = `
    <div class="signal-lost-bg">&#x1FBCC;</div>
    <div class="signal-lost-label">SIGNAL LOST</div>
  `;
  col.insertBefore(overlay, col.querySelector('.vessel-log'));

  // Add dismiss button to header
  const dismissBtn = document.createElement('button');
  dismissBtn.className = 'vessel-dismiss';
  dismissBtn.title = 'Dismiss memorial';
  dismissBtn.textContent = '\u00d7';
  dismissBtn.addEventListener('click', () => col.remove());
  const headerRight = col.querySelector('.vessel-header-right');
  if (headerRight) {
    headerRight.innerHTML = '';
    headerRight.appendChild(dismissBtn);
  }
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
