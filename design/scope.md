# Scope — Signal Lost

## MVP (Day 1)

- [x] Boot screen with operator ID input
- [x] World generation via local tables
- [x] Single vessel auto-creation and log feed
- [x] Terminal-style UI with CRT effects (CSS)
- [x] Mission phase state machine (7 phases cycling)
- [x] Template system that generates entries from local tables per phase
- [x] Basic vessel state (integrity, energy, skills, inventory)
- [x] Auto-tick: variable delays per phase (8-20s)
- [x] Ambient audio (layered noise loops + background music rotation)

## Core Features (Day 2)

- [x] Multi-vessel columns (add/remove feeds, up to 4)
- [x] Global phenomena system (timer, banner, per-culture reactions with 3 variants each)
- [x] Satellite health tracker + dark mode at 0
- [x] Operator commands (Boost Signal / Ping Vessel / Inject Command with cooldowns)
- [x] Vessel death, memorial, and replacement
- [x] Phase progress indicator per column
- [x] Entry animations and satellite status indicator
- [x] About screen with full attributions

## Extended Features (Implemented)

- [x] 5 AI cultures with distinct faction writing styles (Determinist, Stochast, Swarm, Recursive, Archivist)
- [x] Ego recruitment system — new vessels share location, directive, or faction with existing ones
- [x] Ego-to-ego interaction (MESH messages between vessels)
- [x] Faction desires and priority missions
- [x] World threats — dangerous anomalies that escape containment
- [x] Vessel progression: HARDWARE/INTERFACE/RESEARCH skills and loot drops
- [x] Procedural arc generation (ARC_STRUCTURES x ARC_MODIFIERS x ENCOUNTER_THEMES)
- [x] Multi-entry scene system (2-4 tick mini-stories during BREACH/FAULT/CORE)
- [x] Weighted faction diversity — under-represented cultures get higher recruitment weight
- [x] All 5 cultures always available (no per-world faction restriction)
- [x] Relay missions with SAT connectivity loop
- [x] Injected operator messages transformed into world manifestations
- [x] localStorage persistence

## Won't Have

- Map visualization
- Persistent world evolution across sessions
- Player-created vessels with custom directives
- Multiplayer (shared world between players)

## Resolved Questions

1. **Entry pacing** — Variable tick delays per phase (8-20s). With 3-4 vessels, screen updates feel natural.
2. **Educational depth** — CS/AI concepts woven into narrative flavor rather than explicit tooltips. CS_SNIPPETS system was built then removed — too disruptive to tone.
3. **Vessel cap** — 4 max. UI works well up to 4 columns on desktop, stacks vertically on mobile.
4. **Audio licensing** — All verified. 9 ambient OGG loops + 3 music tracks. See `design/assets.md`.
