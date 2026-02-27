# Signal Lost — Project Guide

## What Is This

A zero-player RPG (like Godville) for the [AI Apocalyptic Dark Fantasy Jam](https://itch.io/jam/ai-apocalyptic-dark-fantasy-jam-) on itch.io. Post-human world, AI-only characters, terminal/CRT aesthetic. The game plays itself — player is a passive "operator" watching AI vessel log feeds.

**Deadline:** Feb 28, 2026
**Status:** Playable MVP with audio, fonts, and UI

## Project Structure

```
design/           # Game design documents (8 files)
  README.md       # Index, concept, sources
  setting.md      # World lore, 5 AI cultures, locations
  gameplay.md     # User journey, game loop, multi-vessel UI
  phenomena.md    # 8 global event types, mechanics
  narrative.md    # 7 mission phases with examples
  tables.md       # Local table system, generation flow
  technical.md    # Tech stack, game state schema, visual direction
  assets.md       # Audio/visual/font inventory and licenses
  scope.md        # MVP priorities, open questions
assets/           # Game assets (only used files tracked)
  ambient/                # 9 OGG ambient noise loops
  GloryToTheMachine/      # 3 OGG background music tracks
  icons/                  # 7 PNG UI icons
  favicon.png             # Browser tab icon
tools/            # LLM judge, narrative simulation, cover GIF, dedup
```

## Tech Stack

- **Vanilla HTML/CSS/JS** — no framework, no build step
- **HTML5 Audio API** — background music (random track rotation) + 2-3 ambient noise layers
- **Local tables** in js/data.js — all content generation, no external API
- **Google Fonts CDN** — VT323 (terminal log), IBM Plex Mono (UI), Share Tech Mono (Recursive faction), Courier Prime (Archivist faction)
- **Monogram Extended** (local) — pixel headers + Swarm faction log font
- **CSS-only CRT effects** — scanlines, phosphor glow, text-shadow
- **localStorage** for game state persistence
- **Ships as HTML5 zip** to itch.io

## Key Architecture

- **7-phase mission arc:** IDLE → SIGNAL → TRAVERSE → BREACH → FAULT → CORE → REBOOT
- **Procedural arcs:** ARC_STRUCTURES × ARC_MODIFIERS × ENCOUNTER_THEMES for variety
- **Multi-entry scenes:** Connected 2-4 tick mini-stories during BREACH/FAULT/CORE with shared pre-rolled variables (s_ prefix)
- **5 AI cultures:** Determinists (rule-based), Stochasts (ML), Swarm (distributed), Recursive (self-modifying), Archivists (database)
- **Multi-vessel UI:** vertical columns, each an independent signal feed (up to 3-4)
- **Operator commands:** Boost Signal (60s CD), Ping Vessel (90s CD), Inject Command (120s CD)
- **Global phenomena:** 8 types, timer 120-300s, visible across all vessel feeds
- **Local tables** (js/data.js) are the primary content engine — all narrative generated at runtime

## Audio System

- **Background music:** 11 tracks from GloryToTheMachine (CC BY 4.0), random rotation on track end
- **Ambient noise:** 5 OGG loops (air conditioning, fridge hum, machinery, drone, radio static), 2-3 randomly selected per session, layered at low volume (0.04-0.08) under music (0.3)
- **Preloading:** Audio files preloaded during boot screen with progress indicator
- **Total shipped audio:** ~32MB (30MB music + 2MB ambient)

## Font System

- Three-tier font hierarchy: pixel headers (Monogram) > CRT narrative (VT323) > clean data (IBM Plex Mono)
- Each AI culture has a distinct log font (from gridsagegames.com roguelike font article):
  - Determinists=Terminus, Stochasts=ProggyClean, Swarm=Dina, Recursive=Fira Mono (Input alt), Archivists=Courier Prime (X11 alt)
- Local font files in assets/font/article-fonts/: Terminus.ttf (SIL OFL), ProggyClean.ttf (MIT), Dina.ttf (free)
- Font label shown per vessel (FONT: name) for demo/evaluation purposes
- No italic usage — color differentiation instead (.hl-item=#ffd966, .hl-speech=#66aa77)

## Open Questions

## Asset Licenses

All assets are free/CC0/CC BY. See `design/assets.md` for full license table.

- GloryToTheMachine music: CC BY 4.0 (<https://glorytothemachine.itch.io/>)
- Air Conditioning by conradzbikowski: CC0 (Freesound 262592)
- Fridge by Hinoki.owo: CC BY 4.0 (Freesound 757438)
- Rope Machinery by Whats_The_Frequency_Kennett: CC BY-NC 4.0 (Freesound 762093)
- YP Plague Drone Loop 12 by nlux: CC BY 4.0 (Freesound 623082)
- Radio Music Loop 013 by nlux: CC BY 4.0 (Freesound 621679)
- Glitch Noises (WAV): CC0 1.0 (credit appreciated: credits@vladislavzh.net)
- Game UI Collection FREE: Free (SunGraphica)
- Icon Set 1: Free (SunGraphica)
- Google Fonts (VT323, IBM Plex Mono, Share Tech Mono, Courier Prime): SIL OFL 1.1
- Monogram font by datagoblin: CC0

## Tooling

- `tools/llm-judge.mjs` — LLM-as-judge: evaluates and expands templates + scenes via multi-provider LLM APIs (DeepInfra + OpenRouter). Usage: `--expand` to generate new content, `--apply` to inject into data.js
- `tools/narrative-judge.mjs` — Headless game simulation: generates multi-arc vessel transcripts and sends to LLM for holistic narrative quality review. Usage: `--vessels N --arcs N`
- `tools/dedup-templates.mjs` — Removes duplicate template strings from data.js arrays
- `tools/gen-cover-gif.py` — Playwright-based animated GIF generator for itch.io cover image

## Code Conventions (for implementation phase)

- Single-file or minimal-file approach — keep it simple for 2-day jam
- No transpilation, no TypeScript — plain JS with ES modules if needed
- Game state as a single JS object, saved to localStorage
- Content generation via local tables in js/data.js
- CSS custom properties for theming (terminal green/amber palette)
- Dark background (#0a0a0f), monospace everything
