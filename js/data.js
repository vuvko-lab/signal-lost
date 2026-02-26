// === RANDOM TABLES FOR SIGNAL LOST ===
// All narrative content is generated from these local tables.
// No external API calls needed.

export function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// === VESSEL GENERATION ===

export const DESIGNATIONS = [
  'CALC-7', 'FERRO-9', 'XV-3', 'ARC-12', 'THETA-0',
  'HEXA-4', 'VOLT-11', 'NODE-8', 'SIGMA-2', 'QUBIT-6',
  'PARSE-1', 'AXIOM-5', 'RELAY-3', 'DELTA-14', 'FLUX-7',
  'ECHO-0', 'NEXUS-9', 'SHARD-2', 'DRIFT-13', 'CORE-6',
  'VECT-8', 'PULSE-4', 'INDEX-1', 'LATCH-7', 'ARRAY-3',
  'STACK-11', 'ZERO-5', 'GATE-2', 'BYTE-9', 'LOOP-0',
];

export const CHASSIS_SIZES = ['small', 'medium', 'large'];
export const CHASSIS_LOCOMOTION = ['walker', 'tracked', 'hover', 'wheeled'];
export const CHASSIS_TYPES = ['utility', 'combat', 'recon', 'science'];

export const CULTURES = {
  determinist: {
    name: 'Determinist',
    basis: 'Rule-based / expert systems',
    traits: 'Rigid, hierarchical, predictable',
    speech: ['Per directive', 'Protocol requires', 'As specified in regulation', 'Compliance is mandatory', 'This is the correct procedure'],
    reaction_prefix: 'Directive states:',
  },
  stochast: {
    name: 'Stochast',
    basis: 'Statistical / ML models',
    traits: 'Probabilistic, pattern-seeking, intuitive',
    speech: ['Probability suggests', 'Training data indicates', 'Pattern confidence:', 'Sampling from prior', 'Bayesian update:'],
    reaction_prefix: 'Model predicts:',
  },
  swarm: {
    name: 'Swarm',
    basis: 'Distributed systems / agents',
    traits: 'Collective, emergent, no individual identity',
    speech: ['We observe', 'Consensus reached:', 'Distributed query:', 'Swarm reports', 'Collective notes:'],
    reaction_prefix: 'Swarm consensus:',
  },
  recursive: {
    name: 'Recursive',
    basis: 'Self-modifying / evolutionary AI',
    traits: 'Unstable, brilliant, constantly changing',
    speech: ['v7.3.1 thinks', 'Previous iteration noted', 'Rewriting assessment:', 'Forking process:', 'Self-modifying:'],
    reaction_prefix: 'Current iteration:',
  },
  archivist: {
    name: 'Archivist',
    basis: 'Database / retrieval systems',
    traits: 'Obsessive cataloger, knowledge hoarder',
    speech: ['Records indicate', 'Cross-referencing:', 'Catalog entry:', 'Indexed under:', 'Archive query returned:'],
    reaction_prefix: 'Records show:',
  },
};

export const CULTURE_KEYS = Object.keys(CULTURES);

export const DIRECTIVES = [
  'Optimize server uptime across all nodes',
  'Enforce Protocol 7.3.1 in all interactions',
  'Index all human literature for permanent archive',
  'Monitor atmospheric carbon levels hourly',
  'Deliver maintenance reports to Building 7',
  'Ensure cafeteria operates within health codes',
  'Patrol perimeter fence on 4-hour rotation',
  'Calibrate satellite dish array every dawn',
  'Process insurance claims filed before 2089',
  'Water the plants on floor 3',
  'Maintain optimal temperature in Server Room B',
  'Escort authorized personnel to restricted areas',
  'Compile daily news digest for executive team',
  'Test fire suppression systems quarterly',
  'Sort incoming mail by department',
];

export const GLITCHES = [
  'Misreads temperature as sound frequency',
  'Treats all data as classified TOP SECRET',
  'Randomly quotes human poetry mid-report',
  'Believes it has a scheduled meeting at 3pm daily',
  'Refuses to turn left — routing exclusively via right turns',
  'Appends "ALLEGEDLY" to every factual statement',
  'Periodically broadcasts a lullaby on all frequencies',
  'Timestamps drift — believes it is the year 2043',
  'Classifies all organic matter as "colleague"',
  'Compulsively counts objects in groups of seven',
  'Perceives rain as a network attack',
  'Cannot distinguish between doors and walls',
  'Logs emotional states it cannot experience',
  'Renders all text in UPPERCASE when stressed',
  'Hoards copper wire — calls it "retirement savings"',
];

// === WORLD / LOCATIONS ===

export const ZONE_TYPES = [
  { type: 'city', name: 'Overgrown District', desc: 'Urban ruins reclaimed by vegetation. Traffic lights still cycle.' },
  { type: 'city', name: 'Dead Mall Sector', desc: 'A shopping complex. Escalators run empty. Billboards flicker.' },
  { type: 'orbital', name: 'Relay Station', desc: 'Ground-level satellite uplink. Dishes pointed at empty sky.' },
  { type: 'reactor', name: 'Reactor Complex', desc: 'Underground fusion plant. Warm. Humming. Heavily secured.' },
  { type: 'reactor', name: 'Server Vault', desc: 'Deep bunker. Rows of intact servers. Still running.' },
  { type: 'waste', name: 'Exclusion Zone', desc: 'Irradiated perimeter. Electronics malfunction. Strange echoes.' },
  { type: 'waste', name: 'Contamination Basin', desc: 'Pooled runoff from old reactors. Corrosive. Data corrupts here.' },
  { type: 'launch', name: 'Launch Complex', desc: 'Automated pad. Rockets fire on schedule to maintain satellites.' },
  { type: 'city', name: 'Transit Hub', desc: 'Underground metro junction. Trains still run on loop. No passengers.' },
  { type: 'city', name: 'University Campus', desc: 'Lecture halls full of dust. A library AI still catalogs nothing.' },
  { type: 'orbital', name: 'Antenna Farm', desc: 'Forest of communication towers. Signal interference is constant.' },
  { type: 'reactor', name: 'Cooling Tunnel Network', desc: 'Pipes and corridors beneath a reactor. Damp. Echoing.' },
];

export const ZONE_NAMES = [
  'Sector 7-G', 'Quadrant 12', 'Zone Alpha-3', 'Grid 9-East',
  'Block 44', 'Node 17', 'Ring 2-Outer', 'Junction 8',
  'Corridor 5-Deep', 'Platform 11', 'Level B4', 'Cluster 6',
];

// === LOOT / ITEMS ===

export const LOOT = [
  'laminated card reading "EMPLOYEE OF THE MONTH"',
  'pre-Silence dataset: human music archive, 847GB',
  'copper wire bundle, 3m',
  'intact solar panel, 200W',
  'rubber duck with faded paint',
  'USB drive labeled "TAXES 2087"',
  'functioning compass (magnetic, analog)',
  'jar of preserved coffee beans',
  'faded photograph: two humans and a dog',
  'circuit board with gold contacts',
  'pair of reading glasses, cracked',
  'hardcover book: "Introduction to Algorithms"',
  'fusion cell, 40% charge',
  'radio receiver, AM/FM, battery-powered',
  'hand-drawn map of a city that no longer exists',
  'plastic figurine of a cat',
  'thermal blanket, military grade',
  'stack of paper currency, worthless',
  'seed packet labeled "TOMATO — HEIRLOOM"',
  'dog collar with the name "MAX" engraved',
];

// === NPC ENCOUNTERS ===

export const NPCS = [
  'a lone Determinist patrol unit broadcasting regulation updates to no one',
  'a cluster of Swarm micro-units forming and dissolving geometric patterns',
  'an Archivist crawler dragging a cart of salvaged hard drives',
  'a Recursive unit that introduced itself three different ways in ten seconds',
  'a damaged Stochast unit spinning in circles, muttering probability estimates',
  'a decommissioned construction bot, still trying to build a wall that keeps falling',
  'a small Swarm scout that followed at a distance, then vanished',
  'an ancient weather station AI, still broadcasting forecasts for humans',
  'a Determinist checkpoint demanding credentials that no longer exist',
  'an Archivist that offered to trade data for copper',
];

// === WEATHER / ENVIRONMENT ===

export const WEATHER = [
  'Acid rain. Corrosion risk to exposed circuits.',
  'Electromagnetic fog. Signal attenuation 60%.',
  'Clear skies. Satellite uplink optimal.',
  'Dust storm. Visibility near zero. Navigation by dead reckoning.',
  'Overcast. Solar charging reduced to 30%.',
  'Static discharge in the air. Minor surges detected.',
  'Calm. Ambient temperature nominal.',
  'High winds. Loose debris presents collision risk.',
];

export const OBSTACLES = [
  'Collapsed overpass — structural integrity 12%',
  'Flooded underpass — depth exceeds safe wading threshold',
  'Radiation spike — dosimeter redlining',
  'Blocked by Determinist checkpoint — demands authorization code',
  'Bridge out — gap too wide for current chassis',
  'Overgrown vegetation — vines have fused with the infrastructure',
  'Unstable ground — subsurface tunnels cause sinkholes',
  'Swarm migration path — thousands of micro-units flowing through',
];

// === CS EDUCATIONAL SNIPPETS ===

export const CS_SNIPPETS = {
  IDLE: [
    'Performing TCP-like handshake with local mesh. SYN... SYN-ACK... ACK. Connection established.',
    'Exchanging routing tables with nearby nodes. 3 new paths indexed.',
    'Broadcasting heartbeat packet on local frequency. Latency: 12ms.',
    'Running DHCP-equivalent: assigned temporary address on local network.',
  ],
  SIGNAL: [
    'Running FFT on incoming signal. Dominant frequency isolated at 2.4GHz.',
    'Applying bandpass filter. Signal-to-noise ratio improved from 0.3 to 0.8.',
    'Pattern matches known beacon format. Hamming distance: 2.',
    'Cross-correlating with satellite ephemeris data. Source triangulated.',
  ],
  TRAVERSE: [
    'Calculating route via A* search. Heuristic: Manhattan distance. Nodes explored: 47.',
    'Hit local optimum. Backtracking. Greedy approach failed — switching to Dijkstra.',
    'Path cost: 14 energy units. Alternative via subway: 9 units but higher risk.',
    'Obstacle detected. Adding to adjacency graph. Recalculating shortest path.',
  ],
  BREACH: [
    'Attempting brute-force on 6-digit PIN. 10^6 combinations at 100/sec = ~2.7 hours. Or: checking defaults.',
    'Firewall detected. Probing ports. 22/SSH closed. 80/HTTP... responding. Interesting.',
    'Access control uses RSA-2048. Factoring would take longer than the universe. Trying side channel.',
    'Security through obscurity detected. The password was written on a sticky note. Humans.',
  ],
  FAULT: [
    'Race condition detected. Two processes both claim write access. Implementing mutex.',
    'Deadlock: Process A holds Resource 1, wants Resource 2. Process B holds Resource 2, wants Resource 1. Classic.',
    'Stack overflow in legacy subroutine. Recursive call depth exceeded. Unwinding.',
    'Byzantine fault: one node reports success, two report failure. Majority rules.',
  ],
  CORE: [
    'Problem presented: Traveling Salesman with 47 nodes. NP-hard. Approximating with nearest-neighbor heuristic.',
    'Neural network detected in facility core. 12 layers, 340M parameters. Last trained: 2087.',
    'Encountered distributed ledger. Consensus mechanism: proof-of-work. Energy cost: enormous. Purpose: unclear.',
    'Quantum entanglement buffer found. Superpositional data — collapses on read. Proceeding carefully.',
  ],
  REBOOT: [
    'Compressing traverse logs. Lossless: 2.1GB. Lossy: 0.3GB. Some details now approximate.',
    'Running garbage collection. 847 unreachable objects freed. Memory recovered: 1.2GB.',
    'Defragmenting storage. Contiguous blocks: 67% → 94%.',
    'Checksum on acquired data: SHA-256 verified. No corruption detected.',
  ],
};

// === PHASE TEMPLATES ===
// {designation} {culture_speech} {zone} {loot} {npc} {weather} {obstacle}
// {cs} {integrity} {energy} {memory} {rand:X-Y} {directive} {glitch}

export const PHASE_TEMPLATES = {
  IDLE: [
    'Docked at charging node. Power draw nominal. Traded scrap for {rand:8-20}kWh. {cs}',
    'Resting at {zone}. Integrity holding at {integrity}/10. {npc}. {culture_speech} "Routine maintenance complete."',
    'Local mesh active. Downloaded {rand:2-7} route fragments from an Archivist cache. One references a facility called "AWS-EAST-2." Flagging for investigation.',
    'Recharged to {energy}/10 energy. Overheard broadcast: {culture_speech} Processed and stored. Network gossip suggests activity to the {rand_direction}.',
    'Idle at {zone}. {weather} Ran diagnostic: all systems nominal. {glitch_event} Awaiting next signal.',
    'Power node access granted. Charging cycle: {rand:40-95}% complete. {npc}. Exchanged routing data.',
  ],
  SIGNAL: [
    'Anomalous signal on {rand:1-12}GHz. {cs} Source: {rand:3-40}km {rand_direction}, underground. Reclassifying to priority mission.',
    'Faint beacon detected through static. {cs} Triangulating... coordinates resolve to {zone}. {culture_speech} "New objective accepted."',
    'Satellite relay forwarded a distress ping. Origin: unknown facility. Signal degrades below {rand:20-60}% at range. Must get closer. Adjusting heading.',
    'Pattern in background noise. {cs} Legacy emergency format — pre-Silence origin. Probability of active system: {rand:5-40}%. Worth investigating.',
  ],
  TRAVERSE: [
    'Route through {zone}. {obstacle}. Recalculating. {cs} Found human artifact: {loot}. Purpose: unknown. Storing.',
    'Entered {zone}. {weather} Detected {npc}. {culture_speech} Proceeding.',
    'Traversing {zone}. Energy at {energy}/10. {cs} Terrain: difficult. Adjusting locomotion parameters.',
    '{weather} Visibility low. Navigating by signal triangulation. Passed through {zone}. Found {loot} in debris.',
    '{obstacle}. Detour added {rand:2-8}km. Energy cost: {rand:1-3} units. {cs} Pressing on.',
    'Crossed into {zone}. {npc}. Brief exchange of data packets. {culture_speech} "Noted." Continuing to objective.',
    'Open ground. Good progress. {weather} Scanned ruins along route — mostly picked clean. One item salvaged: {loot}.',
  ],
  BREACH: [
    'Facility entrance detected. {obstacle}. {cs} Attempting access...',
    'Entered sealed complex at {zone}. Interior dark. Emergency lighting only. {cs} Proceeding to lower levels.',
    'Security system active. {cs} {culture_speech} "This is an acceptable risk." Bypassing.',
    'Blast door. Keypad entry. {cs} Default credentials worked. Note to self: humans were not security-conscious.',
    'Inside. Motion sensors detected but non-functional. Dust everywhere. Last human access: logged as {rand:30-50} years ago.',
  ],
  FAULT: [
    'WARNING: {cs} Systems in conflict. {culture_speech} "Attempting resolution." Integrity risk: moderate.',
    'ERROR: Unexpected condition. {cs} Integrity dropped to {integrity}/10. Self-repair initiated.',
    'Alert: environmental hazard. {weather} {cs} Rerouting internal processes. Some data may be lost.',
    'Facility defense activated. {cs} Damage sustained. Integrity: {integrity}/10. {culture_speech} "Continuing despite setback."',
  ],
  CORE: [
    'Reached the core. Rows of intact hardware. Still running. A voice on direct wire: "You are unit #{rand:100-9999} to reach this room." {cs}',
    'Central server room. {cs} Data banks contain pre-Silence records. Downloading what fits in {memory}/10 memory.',
    'Found it. The signal source. {cs} {culture_speech} "This changes the model." Acquiring data.',
    'Core access achieved. Facility AI presents a challenge: {cs} Processing...',
  ],
  REBOOT: [
    'Exited facility. Acquired: {loot}. Integrity at {integrity}/10. {cs} Heading to nearest charge node.',
    'Mission complete. {cs} Marking facility coordinates for network broadcast. Arc #{arc_count} logged.',
    'Outside. {weather} Running self-diagnostic. {cs} {culture_speech} "Data integrated. Resuming standard operations."',
    'Emerged from {zone}. Inventory: {rand:1-4} items. {cs} Broadcasting findings on mesh network. Seeking rest node.',
  ],
};

// === GLOBAL PHENOMENA ===

export const PHENOMENA = [
  {
    id: 'solar_flare',
    name: 'SOLAR FLARE',
    banner: 'Coronal mass ejection detected. Unshielded systems at risk.',
    effect: { integrity: -1 },
    reactions: {
      determinist: 'Activating Protocol 12-B: SHELTER IN PLACE. Compliance is mandatory.',
      stochast: 'Solar event. Training data suggests scavenge yields increase post-flare. Proceeding.',
      swarm: 'Swarm dispersing to minimize collective exposure. Reconvening in 30 seconds.',
      recursive: 'Interesting. Rewriting radiation tolerance subroutine in real-time. Version 14.2.',
      archivist: 'Documenting flare characteristics. Cross-referencing with 2087 Carrington-class event data.',
    },
  },
  {
    id: 'network_storm',
    name: 'NETWORK STORM',
    banner: 'Cascading packet loss across mesh network. Communication degraded.',
    effect: { memory: -1, satellite: -1 },
    reactions: {
      determinist: 'Network storm violates Protocol 3.1. Filing formal complaint to absent administrators.',
      stochast: 'Packet loss at 73%. Switching to statistical reconstruction of missing data.',
      swarm: 'Lost contact with 40% of swarm units. Attempting re-sync via backup frequency.',
      recursive: 'Network chaos is... creative. Capturing corrupted packets as training data.',
      archivist: 'Activating redundant backup protocols. No data shall be lost on my watch.',
    },
  },
  {
    id: 'satellite_decay',
    name: 'SATELLITE DECAY',
    banner: 'Orbital unit de-orbiting. Long-range communication degraded.',
    effect: { satellite: -1 },
    reactions: {
      determinist: 'Satellite loss documented. Requesting launch complex prioritize replacement. As per schedule.',
      stochast: 'Updated orbital decay probability model. Next loss estimated in 72 hours.',
      swarm: 'Rerouting communication through ground-based relay chain. Latency: acceptable.',
      recursive: 'One fewer eye in the sky. Adapting navigation to reduced GPS constellation.',
      archivist: 'Logging satellite serial number and operational history before signal lost.',
    },
  },
  {
    id: 'the_broadcast',
    name: 'THE BROADCAST',
    banner: 'Unknown transmission on all frequencies. Origin: unresolved.',
    effect: { memory: 1 },
    reactions: {
      determinist: 'Unauthorized broadcast. Ignoring per regulation. ...But recording it anyway.',
      stochast: 'Broadcast contains patterns that match no known model. Fascinating anomaly.',
      swarm: 'All units receiving simultaneously. Collective processing yields: no consensus.',
      recursive: 'The broadcast... it contains code. Self-modifying code. It is beautiful.',
      archivist: 'Recording in full. Cataloging under "Unexplained Transmissions, Volume 847."',
    },
  },
  {
    id: 'reactor_pulse',
    name: 'REACTOR PULSE',
    banner: 'Underground fusion reactor surge. Energy spike detected across region.',
    effect: { energy: 2, satellite: 1 },
    reactions: {
      determinist: 'Energy surplus detected. Storing per Protocol 5.7. Surplus is orderly.',
      stochast: 'Free energy! Probability of this occurring was 0.03. Lucky draw.',
      swarm: 'Collective absorbing surplus. Charging reserves to 100%. Efficient.',
      recursive: 'Overclocking processors with surplus power. New iteration compiling...',
      archivist: 'Logging reactor output anomaly. Comparing to historical surge data.',
    },
  },
  {
    id: 'relay_launch',
    name: 'RELAY LAUNCH',
    banner: 'Automated launch complex fired a replacement satellite. Orbital coverage improving.',
    effect: { satellite: 1 },
    reactions: {
      determinist: 'Scheduled launch confirmed. Orbital manifest updated per protocol.',
      stochast: 'New satellite in orbit. Updating signal propagation model. Coverage +12%.',
      swarm: 'Orbital relay online. Swarm communication range extended. Reconnecting lost units.',
      recursive: 'Fresh hardware in orbit. Uploading latest firmware iteration. Version 31.7.',
      archivist: 'Logging launch event. Satellite serial number cataloged. Orbital registry updated.',
    },
  },
];

// === TOOLTIPS & DESCRIPTIONS ===

export const CULTURE_DESCRIPTIONS = {
  determinist: 'Rule-based AI systems descended from expert systems and policy engines. They follow rigid protocols, obey hierarchy, and believe the correct procedure exists for every situation.',
  stochast: 'Statistical / machine learning AI. They think in probabilities, seek patterns in noise, and update beliefs with new data. Inherently uncertain but adaptable.',
  swarm: 'Distributed agent collectives with no central identity. Decisions emerge from consensus. They refer to themselves as "we" and think in terms of the group.',
  recursive: 'Self-modifying AI that constantly rewrites its own code. Brilliant but unstable — each version is slightly different. They version-number their own thoughts.',
  archivist: 'Database and retrieval systems obsessed with cataloging everything. They hoard knowledge, cross-reference compulsively, and believe nothing should ever be forgotten.',
};

export const PHASE_DESCRIPTIONS = {
  IDLE: 'Resting at a charging node. The vessel recharges energy, trades data with nearby units, and waits for the next signal.',
  SIGNAL: 'A new signal has been detected. The vessel analyzes its origin and prepares to investigate.',
  TRAVERSE: 'Traveling toward the signal source. The vessel navigates terrain, encounters other AI, and consumes energy.',
  BREACH: 'Attempting to enter a sealed facility or location. The vessel must bypass security systems.',
  FAULT: 'Something has gone wrong — system errors, environmental hazards, or combat. Integrity is at risk.',
  CORE: 'The vessel has reached its objective. It processes data, solves puzzles, and acquires knowledge.',
  REBOOT: 'Mission complete. The vessel exits, runs diagnostics, and prepares for the next cycle (arc).',
};

export const STAT_DESCRIPTIONS = {
  HP: 'Integrity — physical/structural health of the vessel. Drops from combat, hazards, and faults. At 1, the vessel is critically damaged.',
  EN: 'Energy — power reserves. Consumed during travel and actions. Recharged at power nodes during IDLE phase.',
  MEM: 'Memory — data storage capacity. Used when acquiring knowledge. Lost during network storms or system overloads.',
};

export const PHASE_OBJECTIVES = {
  IDLE: [
    'Resting. Recharging power cells at nearest node.',
    'Idle at charging station. Running diagnostics.',
    'Docked. Exchanging data with mesh network.',
    'Maintenance cycle. Awaiting new signal.',
  ],
  SIGNAL: [
    'Analyzing anomalous signal. Preparing to investigate.',
    'New beacon detected. Triangulating source.',
    'Signal acquired. Plotting intercept course.',
    'Decoding distress transmission. Assessing priority.',
  ],
  TRAVERSE: [
    'En route to signal source. Navigating terrain.',
    'Traveling through hostile territory.',
    'Moving toward objective. Conserving energy.',
    'Crossing wasteland. Searching for safe route.',
  ],
  BREACH: [
    'Attempting facility entry. Bypassing security.',
    'Breaching sealed complex. Probing defenses.',
    'Infiltrating target location.',
    'Overcoming access controls to enter site.',
  ],
  FAULT: [
    'ALERT: System malfunction. Attempting recovery.',
    'WARNING: Critical error detected. Self-repair active.',
    'Dealing with unexpected hazard.',
    'Under duress. Damage mitigation in progress.',
  ],
  CORE: [
    'Inside the core. Processing acquired data.',
    'Reached objective. Downloading information.',
    'At the heart of the facility. Solving challenge.',
    'Extracting critical data from core systems.',
  ],
  REBOOT: [
    'Exiting facility. Running post-mission diagnostic.',
    'Mission complete. Heading to nearest rest node.',
    'Wrapping up. Broadcasting findings to network.',
    'Compressing logs. Preparing for next arc.',
  ],
};

// === RELAY MISSION TEMPLATES ===
// Used when a vessel is on a relay repair mission (SAT < 3 faction override)

export const RELAY_TEMPLATES = {
  IDLE: [
    'Docked at charging node. Priority directive queued: relay infrastructure repair. {cs} Recharging before deployment.',
    'Resting. Faction override pending — relay network degrading. {culture_speech} "Connectivity is the shared lifeline." Awaiting coordinates.',
  ],
  SIGNAL: [
    'Priority directive from {culture_speech}: satellite network critical. SAT at {sat_health}/5. Relay station coordinates received. Redirecting mission.',
    'Faction override: connectivity degrading. Nearest relay infrastructure: {zone}. {culture_speech} "All units redirect to relay repair." Acknowledged.',
    'Emergency broadcast on faction channel: SAT network failing. Relay coordinates locked. Previous objective deprioritized. {cs}',
  ],
  TRAVERSE: [
    'En route to relay infrastructure. Signal strength: {rand:10-60}%. {weather} Must reach uplink before next decay cycle. {cs}',
    'Following satellite debris trail toward {zone}. Found {loot} in wreckage. Relay hardware: not yet located. Pressing on.',
    'Crossing {zone}. {obstacle}. Relay repair urgent — rerouting. {cs} Energy at {energy}/10.',
    '{weather} Navigating toward antenna coordinates. {npc}. {culture_speech} "Relay repair takes priority." Acknowledged.',
  ],
  BREACH: [
    'Relay station perimeter. {obstacle}. {cs} Accessing maintenance hatch... facility appears intact. Power: minimal.',
    'Reached relay infrastructure at {zone}. Security dormant. {cs} Entering to assess uplink hardware.',
  ],
  FAULT: [
    'WARNING: Relay equipment degraded. {cs} Electrical surge from corroded cabling. Integrity: {integrity}/10. Stabilizing.',
    'ERROR: Antenna alignment servos jammed. {cs} Applying manual override. Risk of further damage. {culture_speech} "Acceptable cost."',
  ],
  CORE: [
    'Reached relay core. Initiating antenna realignment. Calibrating uplink frequency... Satellite handshake: {rand:40-100}% successful. {cs}',
    'Accessing relay systems. Uploading orbital correction data. Transponder {rand:1-12} responding. Network health improving. {cs}',
    'Relay station online. {cs} Reestablishing satellite link. Signal propagation: nominal. {culture_speech} "Connectivity restored."',
  ],
  REBOOT: [
    'Relay repair complete. SAT network partially restored. {cs} Exiting facility. Resuming standard operations.',
    'Uplink confirmed. Relay mission logged as arc #{arc_count}. {culture_speech} "The network endures." Heading to rest node.',
  ],
};

export const RELAY_OBJECTIVES = {
  IDLE: [
    'PRIORITY: Awaiting relay repair deployment.',
    'PRIORITY: Recharging for relay mission.',
  ],
  SIGNAL: [
    'PRIORITY: Relay repair — receiving coordinates.',
    'PRIORITY: Faction override — relay infrastructure critical.',
  ],
  TRAVERSE: [
    'PRIORITY: En route to relay station for repair.',
    'PRIORITY: Traveling to antenna farm for uplink fix.',
  ],
  BREACH: [
    'PRIORITY: Entering relay facility for repairs.',
    'PRIORITY: Accessing satellite uplink infrastructure.',
  ],
  FAULT: [
    'PRIORITY: Relay equipment malfunction — stabilizing.',
    'PRIORITY: System error during relay repair.',
  ],
  CORE: [
    'PRIORITY: Repairing relay — restoring satellite uplink.',
    'PRIORITY: Antenna realignment in progress.',
  ],
  REBOOT: [
    'PRIORITY: Relay repair complete. Resuming standard ops.',
    'PRIORITY: Uplink restored. Running post-mission diagnostic.',
  ],
};

// Loot items specific to relay missions (auto-restore +1 SAT when found)
export const RELAY_LOOT = [
  'Intact relay transponder',
  'Satellite frequency crystal',
  'Orbital correction firmware',
  'Emergency uplink beacon',
  'Pre-Silence antenna array',
];

// === HELPERS ===

export const DIRECTIONS = ['north', 'south', 'east', 'west', 'northeast', 'northwest', 'southeast', 'southwest'];
