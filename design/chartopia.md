# Chartopia Integration Architecture

## Table Strategy

### Existing Tables (Direct Use)

| Purpose | Chart | ID | Notes |
|---------|-------|----|-------|
| AI entity names | Android Names | 60164 | Designation generator |
| Chassis/hardware | Robot/Drone Generator | 58585 | Size, locomotion, type |
| AI personality bugs | What's Wrong with the Android | 4436 | Glitches & malfunctions |
| AI motivations | Android Secret Agenda | 4506 | Hidden directives |
| Junk loot (human artifacts) | Post Apocalyptic Junk Loot | 2115 | 500 items, 68K+ rolls |
| Scrap materials | Mutant Year Zero Scrap | 6256 | Components for trading |
| Ruin exploration | Poking Through Ruins | 39327 | 7-step exploration sequence |
| Wasteland anomalies | Strange Anomalies Radioactive Wasteland | 75885 | 100 entries — nuclear zones |
| Machine failures | Machine Catastrophic Malfunction | 64698 | When infrastructure breaks |
| Orbital stations | The Expanse Space Station Generator | 109981 | Satellite infrastructure |
| Orbital encounters | System Points of Interest - SWN | 6155 | 64K combinations |
| Network architecture | Cyberpunk RED Net Architecture | 28494 | Digital dungeon structure |
| Security installations | Shadowrun Security Generator | 27367 | Automated defense systems |
| Mission generation | CBR+PNK Mission Generator | 51958 | Has "A.I." targets, power plants |
| City generation | Cyberpunk City Generator CWN | 82853 | Factions, districts, leaders |
| Urban encounters | Cyberpunk City Encounters | 17379 | 100 encounter prompts |
| NPC generation | NPC Generator Post-Apoc Careers | 62369 | Demeanour, goals, motivation |
| Colony types | Post Modern Colony Ideas | 100656 | Settlement archetypes |
| Abandoned places | Reasons Colony Was Abandoned | 4434 | Location backstories |
| Weather | Weather Changes Jerrico | 45259 | Dynamic environmental conditions |
| Post-apoc names | Post-Apocalyptic Names | 16637 | Callsigns, nicknames |
| Complications | Complication | 32606 | Twist events |
| Body loot | Post-Apoc Body Loot | 39287 | Tiered loot from deactivated machines |
| Low-tier AI archetypes | Low Budget Android Models | 4505 | "Commoner" AI types |

### Custom Tables (hardcode as local JSON)

| Purpose | Content |
|---------|---------|
| AI Culture Flavor | Phrases, beliefs, and behaviors per culture (Determinist, Stochast, etc.) |
| CS Concept Snippets | Educational fragments woven into entries ("This path optimizes for lowest latency...") |
| Human Legacy Artifacts | Objects with CS/tech significance (punch cards, floppy disks, RFC documents) |
| Signal Events | Satellite uplink/downlink events, signal degradation |
| Fusion Reactor Rooms | Dungeon rooms for reactor complexes |
| Vessel Directives | Original programming purposes (now obsolete) |
| Global Phenomena Reactions | Culture-specific reaction templates for each phenomenon type |

---

## API Usage Pattern

```
Primary:  POST /gen/  (no auth needed)
          Body: { "raw": "Chartopia domain language string" }
          → Used for inline randomization and chart chaining

Fallback: POST /charts/{id}/roll/  (needs API key)
          → Direct rolls on specific tables

Preview:  POST /charts/{id}/sim-roll/  (needs API key)
          → Test rolls without affecting statistics
```

The `/gen/` endpoint is the workhorse — it accepts raw Chartopia domain language and returns generated text, with no authentication required. This lets us build complex generation templates client-side:

```
"The Vessel enters {a ruined server farm|a collapsed overpass|a dead shopping mall}.
CHART(39327).
The air reads as {dust particulate|copper oxide|ozone|methane}."
```

---

## Generation Flow per Log Entry

```
1. Check Vessel's current mission phase
2. Select template set for that phase + Vessel's AI culture
3. Fill template with Chartopia rolls via /gen/
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
