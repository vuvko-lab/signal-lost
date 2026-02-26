# Technical Architecture

## Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Frontend | Vanilla HTML/CSS/JS | No build step, fast iteration, single-file deploy |
| Styling | CSS with CRT/terminal effects | Scanlines, phosphor glow, monospace — fits AI console aesthetic |
| Audio | Howler.js (or HTML5 Audio) | Lightweight, handles ambient loops + SFX |
| Fonts | VT323 + IBM Plex Mono (Google Fonts) | Terminal aesthetic + readable body text |
| Backend | None — fully client-side | Chartopia `/gen/` called directly from browser |
| Data | localStorage | Persist game state between sessions |
| Hosting | itch.io (HTML5 zip upload) | Required by jam |
| API | Chartopia `/gen/` endpoint | No auth, no backend needed |

### Asset Pipeline

Assets bundled in the itch.io zip. Ambient audio loops as .ogg/.mp3 (small files). Fonts via Google Fonts CDN or self-hosted. CSS-only CRT effects (no image dependencies).

### Why No Backend

- The `/gen/` endpoint needs no authentication
- All game logic runs client-side (state machine, templates, timers)
- localStorage handles save/load
- This means we can ship as a zip of static files to itch.io

---

## Game State Schema

```
operator: {
  id: string,
  vessels: VesselID[],           // active monitored vessels
  boost_cooldown: timestamp,
  ping_cooldown: timestamp,
  inject_cooldown: timestamp
}

world: {
  factions: Faction[3-5],        // AI cultures present
  zones: Zone[],                 // generated locations
  satellite_health: number (0-5),// ticks down on SATELLITE_DECAY events
  dark_mode: boolean,            // true when satellite_health == 0 (no operator commands)
  day_cycle: number              // time progression
}

global_events: {
  timer_range: [120, 300],       // seconds between phenomena
  next_event_at: timestamp,
  current_event: PhenomenonType | null,
  event_history: PhenomenonType[], // last 3, prevents repeats
  available_pool: PhenomenonType[] // filtered by world factions & state
}

vessel: {
  id: string,
  designation: string,           // e.g. "CALC-7"
  chassis: {
    size: small | medium | large,
    locomotion: walker | tracked | hover | wheeled,
    type: utility | combat | recon | science
  },
  culture: determinist | stochast | swarm | recursive | archivist,
  directive: string,             // original purpose
  glitch: string,                // defining malfunction

  integrity: number (1-10),      // HP equivalent
  energy: number (1-10),         // depletes during travel, recharges at reactors
  memory: number (1-10),         // data storage capacity

  inventory: Item[] (max 6),
  location: ZoneID,

  mission: {
    phase: IDLE | SIGNAL | TRAVERSE | BREACH | FAULT | CORE | REBOOT,
    progress: number,
    arc_count: number
  },

  log: LogEntry[]                // scrolling feed
}
```

---

## Visual Design Direction

- Dark background (#0a0a0f), terminal green or amber text on dark panels
- CRT scanline overlay via CSS (see [assets.md](assets.md) for references)
- Monospace fonts throughout — VT323 for log entries, IBM Plex Mono for stats/UI
- Minimal animations: entries fade in, global event banner pulses
- Phosphor glow effect on text via `text-shadow`
- No heavy image assets — atmosphere through typography and color
