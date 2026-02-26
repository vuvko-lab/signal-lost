# Vessel-World Interaction — Design Expansion

## Current State (Prototype)

The prototype has vessels moving through a 7-phase mission arc with template-based log entries. Interactions are mostly cosmetic — stat changes happen per phase, but the world doesn't meaningfully react to vessel actions, and vessels don't affect each other.

**What works:** The core loop (phase machine, log feed, stat bars) creates a readable "watching AI do things" experience. The template system produces varied text.

**What's missing:** Vessels exist in isolation. The world is static. Player commands feel disconnected. There's no emergent storytelling from vessel-to-vessel or vessel-to-world interactions.

---

## Proposal: Three Layers of Interaction

### Layer 1 — Vessel ↔ World (Reactive Environment)

**Goal:** The world changes based on what vessels do, and vessels encounter traces of their own (and others') past actions.

#### Zone State System
Each zone gets a simple state object:

```js
zone = {
  label: "Sector 9",
  explored: 0,        // 0-100, increases as vessels traverse
  threat: 3,          // 1-5, modified by events and vessel actions
  resources: 2,       // 0-5, depletes when vessels loot, replenishes slowly
  cached_data: [],    // breadcrumbs left by vessels
  faction_presence: "determinists",  // dominant culture, can shift
}
```

**Mechanics:**
- **TRAVERSE** in a zone increases its `explored` value. High exploration unlocks richer templates ("Your mapping data reveals a hidden passage" vs "Unknown territory. Proceeding blind.")
- **Looting** depletes `resources`. When resources hit 0, templates shift: "Nothing left to scavenge here. Someone stripped this place clean."
- Vessels can **leave data caches** in zones during IDLE. Other vessels visiting the zone later can find them: "{designation} left a routing table fragment here. Integrating into navigation."
- **FAULT** in a zone increases its `threat` level. Subsequent visitors face harder encounters.
- Zone states persist across sessions and slowly drift over time (resources regenerate, threat decays).

#### Environmental Consequences
- If a vessel BREACHES a facility, that facility's state changes (powered on, security disabled, etc.). Future visitors encounter the modified state.
- Global phenomena affect zone states: a "Signal Storm" might scramble zone exploration data, resetting `explored` values partially.

---

### Layer 2 — Vessel ↔ Vessel (Inter-vessel Events)

**Goal:** Vessels in the same zone can interact. Not player-controlled — emergent encounters.

#### Proximity Detection
Each tick, check if any two vessels share a `location`. If so, roll for an inter-vessel event:

```
Same zone + same culture  → 40% chance of cooperative event
Same zone + diff culture  → 30% chance of encounter (trade/conflict/debate)
Same zone + one in FAULT  → 60% chance of rescue attempt
```

#### Event Types

| Event | Trigger | Outcome |
|-------|---------|---------|
| **Data Exchange** | Same zone, cooperative | Both gain +1 MEM, shared route fragments |
| **Resource Sharing** | Same zone, one low EN | Higher-EN vessel transfers 1 EN to lower |
| **Cultural Debate** | Different cultures meet | Log entry of philosophical exchange based on their CS paradigms |
| **Territorial Dispute** | Same zone, high threat | Both lose 1 HP, zone threat increases |
| **Joint Exploration** | Same zone during TRAVERSE | Exploration bonus, richer loot |
| **Rescue** | One vessel in FAULT phase | Other vessel can stabilize (restore 1-2 HP) |
| **Signal Relay** | One vessel low signal | Nearby vessel boosts the other's satellite connection |

#### Template Examples

**Data Exchange (Stochast meets Archivist):**
> *[14:22:08] Detected friendly signal. FERRO-9 (Archivist) broadcasting on local mesh. Initiating handshake... Protocol mismatch: they use structured queries, we use probabilistic inference. Negotiating common format. Exchange complete: received pre-Silence facility map, sent environmental sensor readings. Their comment: "Your data has... acceptable noise margins." We choose to interpret this as a compliment.*

**Cultural Debate (Determinist meets Recursive):**
> *[16:45:33] Encountered THETA-0 at charging node 7A. They began modifying their own goal structure mid-conversation. Unsettling. Reminded them that Directive 4.1.2 prohibits self-modification of core parameters. They responded: "Which version of me wrote that rule? Not the current one." Disengaging.*

**Rescue:**
> *[09:11:44] Distress beacon from ARC-12 — integrity critical (2/10). 300m away. Diverting. Found them pinned under collapsed infrastructure. Applied emergency power coupling. Transferred 2 EN to stabilize systems. ARC-12 status: mobile. They transmitted: "Debt logged. Will repay with interest. Interest rate: undefined." Resuming original heading.*

---

### Layer 3 — Operator ↔ World (Meaningful Commands)

**Goal:** Player commands have visible, consequential effects that ripple through the world.

#### Enhanced Commands

**Boost Signal (60s CD)**
- Current: silently adds +1 HP on next tick.
- Enhanced: Adds a visible log entry (DONE in prototype). Additionally, during FAULT phase, Boost can prevent vessel destruction. During TRAVERSE, Boost gives a temporary exploration bonus. SAT health affects boost effectiveness: at SAT 5, full effect. At SAT 1-2, 50% chance boost fails ("Signal too weak. Boost packet lost.").

**Ping Vessel (90s CD)**
- Current: finds random loot item.
- Enhanced: Ping reveals zone information: current threat level, resource state, and whether other vessels are nearby. During BREACH, Ping can reveal security patterns. Ping consumes 1 satellite health when SAT < 3 (makes the player think about when to use it).

**Inject Command (120s CD)**
- Current: sends text message, gets culture-specific response.
- Enhanced: The injected message can contain keywords that trigger vessel behavior:
  - "retreat" / "fall back" → vessel attempts to skip current phase (advances faster but takes 1 HP damage)
  - "explore" / "search" → vessel focuses on exploration (next TRAVERSE yields more loot but takes longer)
  - "conserve" / "rest" → vessel enters low-power mode (next IDLE restores +2 EN instead of +1)
  - Unknown keywords get culture-specific confused responses

**New Command: Relay (180s CD)**
- Target two vessels. Establishes temporary communication link between them. If they're in the same zone, triggers a cooperative event. If different zones, they exchange zone data (both get exploration bonuses for each other's location).

#### SAT Health — The Connectivity Loop (IMPLEMENTED)

SAT (Satellite Network Health, 0-5) is the central resource creating a gameplay loop:

**Core Loop:**
```
SAT degrades naturally (~90-120s) and from phenomena
  → When SAT ≤ 3, factions override vessel objectives to "relay repair"
  → Vessels on relay missions travel to relay/launch zones
  → Completing CORE phase at relay zone restores +1 SAT
  → SAT rises above 3 → normal operations resume
  → (cycle continues)
```

**SAT Effects:**
| SAT | Effect |
|-----|--------|
| **5** | All systems nominal. Commands reliable. |
| **4** | Minor signal noise (cosmetic). |
| **3** | Faction threshold — 40% chance vessels redirect to relay repair. |
| **2** | 75% faction override. Operator commands 30% failure chance. |
| **1** | 100% override — all new arcs become relay. Commands 50% failure. |
| **0** | DARK MODE — all commands disabled. Vessels autonomous. |

**SAT Degradation:**
- Natural decay: -1 every 90-120 seconds
- SATELLITE_DECAY phenomenon: -1
- NETWORK_STORM phenomenon: -1

**SAT Restoration:**
- Relay mission CORE completion: +1
- Relay loot drops (8% chance during TRAVERSE/CORE): +1
- REACTOR_PULSE phenomenon: +1
- RELAY_LAUNCH phenomenon: +1
- Player Boost on relay vessel in CORE: +1 (guaranteed)

**Player Interaction:**
- Inject with keywords ("relay", "repair", "fix", "uplink", "satellite") → vessel picks up relay mission on next arc
- Boost on relay vessel during CORE → guaranteed SAT restore
- At SAT 0 → all commands disabled, "DARK MODE" indicator shown

---

## Implementation Priority

### Phase 1 — Jam Release (DONE)
1. ~~Boost log entry visibility~~ (DONE)
2. ~~SAT tooltip explanation~~ (DONE)
3. ~~SAT health affecting command success~~ (DONE — RNG failure at low SAT)
4. ~~SAT natural decay timer~~ (DONE — 90-120s cycle)
5. ~~Faction override → relay missions~~ (DONE — probability scales with SAT level)
6. ~~Relay mission templates and objectives~~ (DONE)
7. ~~Relay loot drops~~ (DONE — 8% chance, auto +1 SAT)
8. ~~SAT DARK MODE~~ (DONE — commands disabled at SAT 0)
9. ~~Inject keyword parsing for relay~~ (DONE — 5 relay keywords)
10. ~~Updated phenomena: network_storm -1 SAT, reactor_pulse +1 SAT, new relay_launch~~ (DONE)

### Phase 2 — Post-Jam Polish
5. Zone state system (explored/threat/resources)
6. Data cache breadcrumbs between vessels
7. Inter-vessel proximity detection
8. Enhanced Ping (zone info reveal)

### Phase 3 — Full Vision
9. Inter-vessel cooperative/conflict events with stat effects
10. Zone consequences from vessel actions
11. Relay command (link two vessels)
12. Global phenomena affecting zone states
13. Vessel reputation/relationship tracking

---

## Open Questions

1. **Performance:** Multiple vessels checking proximity every tick — keep it O(n²) or optimize with zone-based lookup?
2. **Balance:** How often should inter-vessel events fire? Too frequent = noise. Too rare = forgettable.
3. **SAT decay rate:** 90-120s may be too fast/slow — needs playtesting to tune.
4. **Zone count:** 5 zones means frequent vessel proximity. Scale to 10-15 for more meaningful encounters?
5. **Save state growth:** Zone state + vessel breadcrumbs increases localStorage usage. Cap at what size?
