# Local Table System

All content generation uses local JS tables defined in `js/data.js`. No external API needed.

## Utilities

- `pick(arr)` — select a random element from an array
- `randInt(min, max)` — random integer in range

## Table Inventory

### Vessel Generation

| Export | Purpose |
|--------|---------|
| `DESIGNATIONS` | Vessel names (CALC-7, FERRO-9, etc.) |
| `CHASSIS_SIZES` | small, medium, large |
| `CHASSIS_LOCOMOTION` | walker, tracked, hover, wheeled |
| `CHASSIS_TYPES` | utility, combat, recon, science |
| `CULTURES` | 5 AI cultures with name, basis, traits, speech patterns, reaction prefix |
| `CULTURE_KEYS` | Culture key list |
| `FACTION_DESIRES` | Per-culture goals and priority missions |
| `DIRECTIVES` | Original programming purposes |
| `GLITCHES` | Defining malfunctions |

### World / Locations

| Export | Purpose |
|--------|---------|
| `ZONE_TYPES` | Location categories |
| `ZONE_NAMES` | Generated zone name parts |

### Loot / Items

| Export | Purpose |
|--------|---------|
| `LOOT` | Scavenged items and artifacts |
| `SKILL_LOOT` | Items with mechanical effects |

### NPCs / Encounters

| Export | Purpose |
|--------|---------|
| `NPCS` | NPC encounter templates |
| `OBSTACLES` | Travel hazards |

### Environment

| Export | Purpose |
|--------|---------|
| `WEATHER` | Environmental conditions |

### Narrative

| Export | Purpose |
|--------|---------|
| `CS_SNIPPETS` | Per-phase CS educational fragments |
| `PHASE_TEMPLATES` | Log entry templates per mission phase |
| `PHASE_OBJECTIVES` | Objectives per phase |
| `PHENOMENA` | 8 global event types with culture-specific reactions |

### UI / Descriptions

| Export | Purpose |
|--------|---------|
| `CULTURE_DESCRIPTIONS` | UI text for cultures |
| `PHASE_DESCRIPTIONS` | UI text for phases |
| `STAT_DESCRIPTIONS` | UI text for stats |

### Relay Missions

| Export | Purpose |
|--------|---------|
| `RELAY_TEMPLATES` | Multi-vessel relay mission templates |
| `RELAY_OBJECTIVES` | Relay mission objectives |
| `RELAY_LOOT` | Relay mission rewards |

### Vessel Interactions

| Export | Purpose |
|--------|---------|
| `INTERACTION_TEMPLATES` | Vessel-to-vessel interaction patterns |

### World Threats

| Export | Purpose |
|--------|---------|
| `WORLD_THREATS` | Escalating global threat events |

### Procedural Arcs

| Export | Purpose |
|--------|---------|
| `ARC_STRUCTURES` | Mission arc shape templates |
| `ARC_MODIFIERS` | Modifiers applied to arcs |
| `ENCOUNTER_THEMES` | Thematic encounter flavors |

### Misc

| Export | Purpose |
|--------|---------|
| `DIRECTIONS` | Cardinal and ordinal directions |

---

## Generation Flow per Log Entry

```
1. Check Vessel's current mission phase
2. Select template set for that phase + Vessel's AI culture
3. Fill template with picks from local tables
4. Apply operator boost if active
5. Weave in CS educational fragment (contextual)
6. Format as timestamped log entry
7. Update Vessel state (integrity, energy, inventory, location, phase)
8. Check for cross-Vessel interactions (same location)
9. Push to UI column
```

### Global Phenomena Generation

```
1. Timer fires (120-300s random interval)
2. Filter available phenomena by world state (factions, satellite health, vessel locations)
3. Exclude last 3 events from pool
4. Select phenomenon, weighted by context
5. Generate banner text
6. For each active Vessel:
   a. Select culture-specific reaction template
   b. Roll for mechanical effect (damage, loot, energy, etc.)
   c. Apply location modifiers (underground = safe from solar flare, etc.)
   d. Inject reaction entry into Vessel's feed
7. Update global state (satellite_health, etc.)
```

---

## Import / Export

Tables can be extended by editing `js/data.js` directly. The file uses ES module exports — all tables are plain arrays or objects, no special format required.
