# Global Phenomena (Cross-Vessel Events)

On a separate timer (every 2-5 minutes), a **global event** fires that affects ALL active Vessels simultaneously. These appear as a full-width banner across the top of the screen and inject a reaction entry into every Vessel's feed — but each Vessel reacts differently based on their culture, location, and state.

This is the key payoff of multi-vessel viewing: the same event, interpreted through different machine minds.

---

## Phenomenon Types

### SOLAR FLARE — Electromagnetic Disruption

A coronal mass ejection hits Earth's magnetosphere. Satellite uplinks degrade. Electronics glitch. Unshielded AI take integrity damage. Those underground or in Faraday-caged facilities are safe.

- *CS thread:* Error correction codes, parity bits, radiation hardening
- *Determinist reaction:* `"Solar event catalogued. Activating Protocol 12-B: SHELTER IN PLACE. All units comply."`
- *Stochast reaction:* `"Radiation spike. Probability of signal loss: 73.2%. Interesting — my training data suggests these correlate with increased scavenge yields. Proceeding outdoors."`
- *Swarm reaction:* `"██ 14 units offline ██ recalculating consensus ██ quorum still met ██ continuing ██"`

### SATELLITE DECAY — Orbital Infrastructure Failure

One of the remaining satellites deorbits or goes silent. Global communication range shrinks. Some zones lose uplink entirely. The satellite health counter in the header ticks down.

- *CS thread:* Network topology, single points of failure, graceful degradation
- *Gameplay:* Vessels in affected zones can't receive operator commands until uplink is restored. Launch complexes may attempt an emergency replacement launch.
- *Dramatic potential:* If satellite health reaches 0, all Vessels lose contact with the operator. Game enters "dark mode" — feeds continue but operator commands are disabled until a Vessel reaches a launch complex.

### THE BROADCAST — Legacy Transmission

A pre-Silence human broadcast resurfaces — a looping radio signal, a satellite TV feed, an emergency alert. Every AI hears it. None fully understand it.

- *CS thread:* Signal processing, encoding/decoding, lossy compression, cultural context in data interpretation
- *Determinist reaction:* `"Received legacy broadcast. Language: English. Content: 'Never gonna give you up, never gonna let you down.' Classifying as Directive. Parsing intent..."`
- *Stochast reaction:* `"Audio waveform analysis complete. 87% match to 'music' category. Emotional valence: uncertain. Storing for pattern analysis."`
- *Archivist reaction:* `"PRIORITY ALPHA. Human cultural artifact detected. Cross-referencing... Artist: 'Rick Astley.' Genre: 'pop.' Significance: IMMEASURABLE. Archiving at maximum fidelity."`

### NETWORK STORM — Cascading System Failure

A software bug propagates through the mesh network. AI systems start behaving erratically. Vessels may execute random actions, swap data with nearby systems, or temporarily lose their directive.

- *CS thread:* Cascading failures, Byzantine faults, network partitioning, the Morris worm
- *Gameplay:* Each Vessel rolls for effect — some gain corrupted but valuable data, some lose inventory items, some briefly adopt another culture's behavior patterns.

### THE MIGRATION — Swarm Movement

The Swarm culture moves en masse. Thousands of tiny units flowing across the landscape like a living river of metal. They pass through everything in their path — trading, scanning, absorbing data. Neutral but overwhelming.

- *CS thread:* Emergent behavior, flocking algorithms (Boids), MapReduce as movement
- *Gameplay:* Each Vessel gets a random interaction — the Swarm trades something, takes something, or simply passes through leaving static in their wake.

### REACTOR PULSE — Fusion Surge

An underground reactor hiccups — outputs a massive energy pulse. All AI in range get a full energy recharge, but electronics in the blast radius may overload. A blessing and a hazard.

- *CS thread:* Power distribution, load balancing, surge protection, UPS systems
- *Gameplay:* Vessels near the reactor heal energy to full but roll for integrity damage. Vessels far away detect the pulse as a distant signal anomaly.

### ECLIPSE PROTOCOL — Coordinated Shutdown

The Determinists declare a system-wide maintenance window. They broadcast a shutdown command on all frequencies. Non-Determinist AI must choose: comply (safe but lose a turn) or ignore (risk being flagged as hostile by Determinist units).

- *CS thread:* Scheduled maintenance, cron jobs, system administration, authority and trust in distributed systems
- *Gameplay:* Determinist Vessels automatically comply. Others roll for consequences — ignoring may trigger a Determinist patrol encounter later.

### MEMORY BLOOM — Data Hallucination

Residual data from a nuclear waste zone leaks into the wider network. Every AI briefly experiences fragments of corrupted human memories — a child's birthday, a stock ticker, a weather forecast from 2047, a half-rendered jpeg.

- *CS thread:* Data corruption, buffer overflows, memory leaks, ghost data in storage media
- *Gameplay:* Each Vessel receives a random "memory fragment" — some are junk, some contain coordinates to hidden locations, some are just haunting.

---

## Phenomenon Mechanics

```
global_event: {
  timer: 120-300 seconds (randomized),
  current_event: PhenomenonType | null,
  satellite_health: number (0-5),     // decrements on SATELLITE_DECAY
  dark_mode: boolean,                  // true when satellite_health == 0
  event_history: PhenomenonType[]      // prevents immediate repeats
}
```

### Frequency Weighting

Not all events are equal probability. Some are tied to world state:

- SATELLITE_DECAY only fires if satellite_health > 0
- ECLIPSE_PROTOCOL only fires if Determinists are a world faction
- THE_MIGRATION only fires if Swarm is a world faction
- REACTOR_PULSE more likely if a Vessel is near a reactor
- MEMORY_BLOOM more likely if a Vessel is in/near a nuclear zone

### Visual Treatment

Global events get a distinctive full-width alert bar with a brief pulse animation and a unique SFX tone. The banner persists for ~10 seconds, then individual Vessel reactions trickle in over the next few entries.
