# Signal Lost — Project Guide

## What Is This

A zero-player RPG (like Godville) for the [AI Apocalyptic Dark Fantasy Jam](https://itch.io/jam/ai-apocalyptic-dark-fantasy-jam-) on itch.io. Post-human world, AI-only characters, terminal/CRT aesthetic. The game plays itself — player is a passive "operator" watching AI vessel log feeds.

**Deadline:** Feb 28, 2026
**Status:** Design phase complete, entering code planning

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
assets/           # Downloaded asset packs (DO NOT commit zips)
  Glitch Noises (WAV)/    # 1101 WAV files, CC0, by Vladislav Zharkov
  Game UI collection FREE version/  # UI kit by SunGraphica
  FREE/                   # Icon set by SunGraphica
```

## Tech Stack

- **Vanilla HTML/CSS/JS** — no framework, no build step
- **Howler.js** for audio (ambient loops + SFX)
- **Local tables** in js/data.js — all content generation, no external API
- **Google Fonts CDN** — VT323 (terminal), IBM Plex Mono (body), Space Mono (headers)
- **CSS-only CRT effects** — scanlines, phosphor glow, text-shadow
- **localStorage** for game state persistence
- **Ships as HTML5 zip** to itch.io

## Key Architecture

- **7-phase mission arc:** IDLE → SIGNAL → TRAVERSE → BREACH → FAULT → CORE → REBOOT
- **5 AI cultures:** Determinists (rule-based), Stochasts (ML), Swarm (distributed), Recursive (self-modifying), Archivists (database)
- **Multi-vessel UI:** vertical columns, each an independent signal feed (up to 3-4)
- **Operator commands:** Boost Signal (60s CD), Ping Vessel (90s CD), Inject Command (120s CD)
- **Global phenomena:** 8 types, timer 120-300s, visible across all vessel feeds
- **Local tables** (js/data.js) are the primary content engine — all narrative generated at runtime

## Open Questions

1. **Ambient music** — still selecting from Freesound (CC0 candidates identified)

## Asset Licenses

All assets are free/CC0. See `design/assets.md` for full license table.

- Glitch Noises (WAV): CC0 1.0 (credit appreciated: credits@vladislavzh.net)
- Game UI Collection FREE: Free (SunGraphica)
- Icon Set 1: Free (SunGraphica)
- Google Fonts: SIL OFL 1.1

## Code Conventions (for implementation phase)

- Single-file or minimal-file approach — keep it simple for 2-day jam
- No transpilation, no TypeScript — plain JS with ES modules if needed
- Game state as a single JS object, saved to localStorage
- Content generation via local tables in js/data.js
- CSS custom properties for theming (terminal green/amber palette)
- Dark background (#0a0a0f), monospace everything
