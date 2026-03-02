# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What Is This

Signal Lost — a zero-player RPG (like Godville) set in a post-human world. AI-only characters, terminal/CRT aesthetic. The game plays itself — the player is a passive "operator" watching AI vessel log feeds. Built for the [AI Apocalyptic Dark Fantasy Jam](https://itch.io/jam/ai-apocalyptic-dark-fantasy-jam-) on itch.io.

## Development

**No build step.** Vanilla HTML/CSS/JS with ES modules loaded directly by the browser.

```bash
# Serve locally (any static server works, ES modules require HTTP)
python3 -m http.server 8000
# or
npx serve .

# Open in browser
open http://localhost:8000

# Ship to itch.io as HTML5 zip
zip -r signal-lost.zip index.html css/ js/ assets/ -x "assets/_unused/*"
```

**LLM-as-judge pipeline** (offline template quality assurance, requires DeepInfra API key):

```bash
node tools/judge-judge.mjs              # Meta-eval: pick reliable judge models
node tools/llm-judge.mjs --expand --apply  # Generate + inject new templates into data.js
node tools/narrative-judge.mjs          # Full simulation review (10 criteria)
node tools/template-tournament.mjs      # 5-model tournament for template improvement
node tools/dedup-templates.mjs          # Remove duplicate templates after expansion
node tools/check-vars.mjs              # Validate template variable references
```

See `tools/README.md` for full pipeline docs, scoring criteria, and judge calibration.

## Architecture

### Module Responsibilities

| File | Lines | Role |
|------|-------|------|
| `js/game.js` | ~1600 | Game state, phase machine, vessel logic, tick, save/load |
| `js/data.js` | ~1900 | All narrative content tables (templates, scenes, cultures, loot) |
| `js/ui.js` | ~800 | DOM rendering, boot screen, vessel columns, dialogs |
| `js/audio.js` | ~220 | Background music + ambient noise layers |
| `js/main.js` | ~440 | Entry point, game loop, operator commands, init |
| `css/style.css` | ~1300 | All styling, CRT effects, responsive layout |
| `index.html` | ~160 | Single HTML entry point |

### Data Flow

```text
main.js  ←→  game.js  ←→  data.js
  ↕            ↕
 ui.js      audio.js
```

- **main.js** registers callbacks with game.js via `setCallbacks()`, then starts interval-based game loop
- **game.js** runs `tick(vessel)` per vessel on individual timers, calls callbacks for log entries, phase changes, stat changes, global events, and vessel destruction
- **data.js** exports pure data tables and helper functions (`pick()`, `randInt()`) — no side effects
- **ui.js** receives events from main.js callbacks and updates the DOM
- **audio.js** manages ambient noise linked to vessel location tags, crossfading layers

### Phase Machine

7-phase mission arc per vessel: **IDLE → SIGNAL → TRAVERSE → BREACH → FAULT → CORE → REBOOT**

- Each phase has a random entry count (`PHASE_ENTRY_COUNTS`), tick delay range (`PHASE_TICK_DELAYS`), and stat effects (`PHASE_EFFECTS`)
- Phase templates come from `PHASE_TEMPLATES[phase]` arrays in data.js
- Procedural arc variety via `ARC_STRUCTURES × ARC_MODIFIERS × ENCOUNTER_THEMES`

### Template System

Templates in data.js use `{variable}` placeholders filled by `fillTemplate()` in game.js:

- `{designation}`, `{zone}`, `{zone_type}`, `{npc}`, `{loot}`, `{weather}`, `{obstacle}`, `{direction}`, `{creature}`, `{vehicle}`, `{structure}`, `{found_message}`
- `{rand:N-M}` — inline random integer generation
- Scene-specific variables use `s_` prefix (e.g., `{s_artifact}`, `{s_entity}`) — pre-rolled once per scene for continuity

### Scene System (Multi-Entry Stories)

`PHASE_SCENES[phase]` contains connected 2-4 tick mini-stories for BREACH/FAULT/CORE phases:

- Each scene has `vars` (pre-rolled from option arrays), `entries` (sequential templates), and optional `weight`
- Scene variables are substituted before standard template filling, ensuring consistency across entries

### Faction Voice Post-Processing

`applyFactionVoice()` transforms log text per culture after template filling:

- **Determinists**: Inject enum-style status codes, uppercase directives
- **Stochasts**: Add probability hedging, `/alternate` word forms
- **Swarm**: Replace singular pronouns with plural, add mesh references
- **Recursive**: Prepend version strings, inject self-modification asides
- **Archivists**: Add citation markers, cross-reference annotations

### 5 AI Cultures

Culture keys are **lowercase**: `determinist`, `stochast`, `swarm`, `recursive`, `archivist`. CSS classes use `.culture-{key}`.

Each has: distinct speech patterns, reaction prefixes, faction desires with priority missions, and a unique log font.

## Code Conventions

- No transpilation, no TypeScript — plain JS with ES modules
- Game state is a single JS object saved to localStorage (key: `signal_lost_save`)
- Content generation via local tables in `js/data.js` — no external API calls at runtime
- CSS custom properties for theming (terminal green/amber palette)
- Dark background (`#0a0a0f`), monospace everything
- No italic usage — color differentiation instead (`.hl-item=#ffd966`, `.hl-speech=#66aa77`)
- In-game dialogs via `gameAlert()`/`gameConfirm()`/`gamePrompt()` — never use browser `alert()`/`confirm()`/`prompt()`

## Font System

Three-tier hierarchy: pixel headers (Monogram Extended) > CRT narrative (VT323) > clean data (IBM Plex Mono)

Culture-specific log fonts applied via CSS classes:

- Determinists: IBM Plex Mono
- Stochasts: VT323
- Swarm: Monogram Extended
- Recursive: Share Tech Mono
- Archivists: Courier Prime

## Audio System

- **Background music**: 3 OGG tracks, random rotation, volume 0.5
- **Ambient noise**: 9 OGG loops tagged by location keywords, 2-3 selected per session, volumes 0.035-0.06, intermittent playback linked to vessel zones
- **Preloading**: During boot screen with progress indicator
- Audio source: GloryToTheMachine (CC BY 4.0), Freesound/OpenGameArt (CC0/CC BY)

## Asset Licenses

All assets are free/CC0/CC BY. See `design/assets.md` for full license table.

## Design Documents

The `design/` directory contains 8 game design docs covering setting, gameplay, phenomena, narrative phases, table system, technical spec, assets, and scope. Start with `design/README.md` for the index.
