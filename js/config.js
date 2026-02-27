// === TABLE CONFIGURATION SYSTEM ===
// Allows viewing, editing, importing, and exporting game tables.
// Tables are versioned and stored in localStorage.

const TABLE_STORE_KEY = 'signal_lost_custom_tables';
const TABLE_VERSION_KEY = 'signal_lost_table_version';
const CURRENT_VERSION = '1.0.0';

// Table registry — maps table names to their default values from data.js
let tableRegistry = {};
let customOverrides = {};

export function initTableConfig(defaults) {
  tableRegistry = { ...defaults };
  loadCustomTables();
}

function loadCustomTables() {
  try {
    const stored = localStorage.getItem(TABLE_STORE_KEY);
    if (stored) {
      customOverrides = JSON.parse(stored);
    }
  } catch (e) {
    customOverrides = {};
  }
}

function saveCustomTables() {
  try {
    localStorage.setItem(TABLE_STORE_KEY, JSON.stringify(customOverrides));
    localStorage.setItem(TABLE_VERSION_KEY, CURRENT_VERSION);
  } catch (e) {
    // storage full
  }
}

// Get a table — returns custom override if exists, otherwise default
export function getTable(name) {
  return customOverrides[name] || tableRegistry[name];
}

// Set a custom override for a table
export function setTable(name, data) {
  customOverrides[name] = data;
  saveCustomTables();
}

// Reset a table to its default
export function resetTable(name) {
  delete customOverrides[name];
  saveCustomTables();
}

// Reset all tables to defaults
export function resetAllTables() {
  customOverrides = {};
  saveCustomTables();
}

// Export all tables (defaults + overrides) as JSON
export function exportTables() {
  const exportData = {
    version: CURRENT_VERSION,
    exported_at: new Date().toISOString(),
    tables: {},
  };
  for (const name of Object.keys(tableRegistry)) {
    exportData.tables[name] = customOverrides[name] || tableRegistry[name];
  }
  return JSON.stringify(exportData, null, 2);
}

// Import tables from JSON string
export function importTables(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (!data.tables || typeof data.tables !== 'object') {
      return { success: false, error: 'Invalid format: missing "tables" object' };
    }

    let imported = 0;
    for (const [name, value] of Object.entries(data.tables)) {
      if (tableRegistry[name] !== undefined) {
        customOverrides[name] = value;
        imported++;
      }
    }
    saveCustomTables();
    return { success: true, imported, version: data.version || 'unknown' };
  } catch (e) {
    return { success: false, error: `Parse error: ${e.message}` };
  }
}

// Get list of all table names and their status
export function getTableList() {
  return Object.keys(tableRegistry).map(name => ({
    name,
    isCustom: !!customOverrides[name],
    itemCount: Array.isArray(getTable(name)) ? getTable(name).length : Object.keys(getTable(name)).length,
  }));
}

export function getTableVersion() {
  return localStorage.getItem(TABLE_VERSION_KEY) || CURRENT_VERSION;
}
