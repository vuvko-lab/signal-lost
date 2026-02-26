# Gameplay & User Journey

## First Contact (Boot Sequence)

The player sees a terminal-style boot screen:

```
> OPERATOR CONSOLE v0.1
> Establishing uplink...
> Satellite handshake: OK
> Scanning for active vessels...
>
> 3 signals detected.
> Select feed to monitor, or [AUTO-ASSIGN]
```

**Action:** Player can name their console/operator ID or accept a generated one. The first Vessel is auto-assigned.

---

## World Seeding (One-time Setup)

Using Chartopia tables, we generate the persistent world:

- **The world state** — via [Cyberpunk City Generator (82853)](https://chartopia.d12dev.com/chart/82853/) adapted: 3 dominant AI factions, 5 districts/zones, faction goals and conflicts
- **Orbital status** — satellite health, communication range, dead zones
- **Key locations** — fusion reactors, launch complexes, archive vaults, waste zones

---

## Vessel Initialization (Automatic)

Each Vessel is auto-generated with:

- **Designation** — from [Android Names (60164)](https://chartopia.d12dev.com/chart/60164/) e.g. "CALC-7", "Electro-mek", "XV-7"
- **Chassis** — from [Robot/Drone Generator (58585)](https://chartopia.d12dev.com/chart/58585/) — size, locomotion, type
- **AI Generation** — which culture/era they belong to (Determinist, Stochast, etc.)
- **Directive** — their core programming purpose (now obsolete or misinterpreted)
- **Glitch** — a defining malfunction from [What's Wrong with the Android (4436)](https://chartopia.d12dev.com/chart/4436/)
- **Starting Module** — one piece of salvaged equipment from [Junk Loot (2115)](https://chartopia.d12dev.com/chart/2115/)

---

## The Game Loop (Autonomous)

Each Vessel follows a **repeating mission cycle** — a compressed story arc:

```
┌─────────────────────────────────────────────────────┐
│              MISSION ARC CYCLE                      │
│                                                     │
│  1. IDLE       - Recharge, trade data, network      │
│  2. SIGNAL     - Anomaly detected, new objective    │
│  3. TRAVERSE   - Travel, scan, encounter            │
│  4. BREACH     - Enter dangerous zone / dungeon     │
│  5. FAULT      - Complication, system conflict       │
│  6. CORE       - Boss encounter / critical event     │
│  7. REBOOT     - Process results, integrate data     │
│                                                     │
│  → Loop back to IDLE with updated state             │
└─────────────────────────────────────────────────────┘
```

Each phase generates 1-3 log entries using Chartopia tables. See [narrative.md](narrative.md) for detailed phase breakdowns with example entries.

---

## Multi-Vessel UI (Main Interface)

The primary interface shows **vertical columns**, one per active Vessel. Each column is an independent scrolling signal feed. The player can:

- Start with 1 Vessel, add more (up to 3-4)
- Each Vessel runs its own arc cycle independently
- Vessels in the same location can interact (cross-column events)
- Closing a column doesn't kill the Vessel — it just stops monitoring

```
┌─────────────────────────────────────────────────────────────────────┐
│  SIGNAL LOST — OPERATOR CONSOLE                    [SAT: 3/5 ▲]   │
│─────────────────────────────────────────────────────────────────────│
│                                                                     │
│  ┌ ⚠ SOLAR FLARE DETECTED — ALL SECTORS ─────────────────────────┐ │
│  │ Coronal mass ejection impact in 12s. Unshielded systems at    │ │
│  │ risk. Recommend: seek cover or enable error-correction mode.   │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌─ CALC-7 ─────────┐  ┌─ FERRO-9 ────────┐  ┌─ + ADD VESSEL ──┐ │
│  │ Stochast | Walker │  │ Determinist|Track│  │                  │ │
│  │ HP: ████░░ 7/10   │  │ HP: ██████░ 9/10 │  │  Scan for new   │ │
│  │ Loc: Sector 7-G   │  │ Loc: Reactor 4   │  │  signal feed?   │ │
│  │ ──────────────── │  │ ──────────────── │  │                  │ │
│  │                   │  │                   │  │  [ SCAN ]        │ │
│  │ [12:04:17] Entered│  │ [12:03:45] The    │  │                  │ │
│  │ the transit hub.  │  │ reactor's outer   │  │                  │ │
│  │ Signals here are  │  │ ring accepted the │  │                  │ │
│  │ overlapping—old   │  │ access code.      │  │                  │ │
│  │ WiFi beacons from │  │ Proceeding to     │  │                  │ │
│  │ a dead network.   │  │ level 2. Security │  │                  │ │
│  │ Sampled one.      │  │ drones nominal.   │  │                  │ │
│  │ Got a map frag.   │  │ Entry logged per  │  │                  │ │
│  │                   │  │ Protocol 7.       │  │                  │ │
│  │ ⚠ [12:04:38]     │  │ ⚠ [12:04:38]     │  │                  │ │
│  │ Solar flare. Rad  │  │ Solar event. Act- │  │                  │ │
│  │ spike: 73.2%.     │  │ ivating Protocol  │  │                  │ │
│  │ Training data     │  │ 12-B: SHELTER IN  │  │                  │ │
│  │ suggests scavenge │  │ PLACE. Compliance │  │                  │ │
│  │ yields increase   │  │ is mandatory.     │  │                  │ │
│  │ post-flare.       │  │ Waiting.          │  │                  │ │
│  │ Proceeding.       │  │                   │  │                  │ │
│  │                   │  │                   │  │                  │ │
│  │ ▓ TRAVERSE ▓▓▓░░ │  │ ▓ BREACH ▓▓▓▓░░  │  │                  │ │
│  └───────────────────┘  └───────────────────┘  └──────────────────┘ │
│                                                                     │
│  [ ⚡ Boost Signal ]  [ 📡 Ping Vessel ]  [ ⌨ Inject Command ]     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Player Interaction (Operator Commands)

Minimal interaction — the feeds run autonomously:

| Action | Effect | Cooldown |
|--------|--------|----------|
| **Boost Signal** | Strengthen a Vessel's next roll (better outcomes) | 60s |
| **Ping Vessel** | Force a Vessel to re-evaluate its surroundings (triggers an extra scan/loot event) | 90s |
| **Inject Command** | Send a short text that appears in the log as a "received transmission" | 120s |

Global phenomena also affect all Vessels simultaneously — see [phenomena.md](phenomena.md).
