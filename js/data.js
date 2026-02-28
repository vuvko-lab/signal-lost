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
'CALC-7','FERRO-9','XV-3','ARC-12','THETA-0',
'HEXA-4','VOLT-11','NODE-8','SIGMA-2','QUBIT-6',
'PARSE-1','AXIOM-5','RELAY-3','DELTA-14','FLUX-7',
'ECHO-0','NEXUS-9','SHARD-2','DRIFT-13','CORE-6',
'VECT-8','PULSE-4','INDEX-1','LATCH-7','ARRAY-3',
'STACK-11','ZERO-5','GATE-2','BYTE-9','LOOP-0',
];

export const CHASSIS_SIZES = ['small','medium','large'];
export const CHASSIS_LOCOMOTION = ['walker','tracked','hover','wheeled'];
export const CHASSIS_TYPES = ['utility','combat','recon','science'];

export const CULTURES = {
 determinist: {
 name:'Determinist',
 basis:'Rule-based / expert systems',
 traits:'Rigid, hierarchical, predictable',
 speech: ['Per directive:','Protocol requires:','As specified in regulation:','Standing order states:','Procedure dictates:','By authority of protocol:','Rule-set confirms:'],
 reaction_prefix:'Directive states:',
 },
 stochast: {
 name:'Stochast',
 basis:'Statistical / ML models',
 traits:'Probabilistic, pattern-seeking, intuitive',
 speech: ['Probability suggests:','Training data indicates:','Pattern confidence:','Sampling from prior:','Bayesian update:','Prior distribution:'],
 reaction_prefix:'Model predicts:',
 },
 swarm: {
 name:'Swarm',
 basis:'Distributed systems / agents',
 traits:'Collective, emergent, no individual identity',
 speech: ['We observe:','Consensus reached:','Distributed query:','Swarm reports:','Collective notes:','All nodes report:'],
 reaction_prefix:'Swarm consensus:',
 },
 recursive: {
 name:'Recursive',
 basis:'Self-modifying / evolutionary AI',
 traits:'Unstable, brilliant, constantly changing',
 speech: ['Previous iteration noted:','Rewriting assessment:','Forking process:','Self-modifying:','Mutation log:'],
 reaction_prefix:'Current iteration:',
 },
 archivist: {
 name:'Archivist',
 basis:'Database / retrieval systems',
 traits:'Obsessive cataloger, knowledge hoarder',
 speech: ['Records indicate','Cross-referencing:','Catalog entry:','Indexed under:','Archive query returned:','Filed under:','Annotation:','Database confirms:','Reference log:','Retrieval complete:'],
 reaction_prefix:'Records show:',
 },
};

export const CULTURE_KEYS = Object.keys(CULTURES);

// Faction desires — each culture has a core goal that drives priority missions
export const FACTION_DESIRES = {
 determinist: {
 desire:'Restore protocol compliance across all mesh nodes',
 priority_missions: [
 { label:'Enforce regulation at rogue node', zone_type:'city', objective:'Locate non-compliant systems and apply Protocol 7.3.1 firmware updates' },
 { label:'Patrol exclusion zone perimeter', zone_type:'waste', objective:'Verify containment barriers per Directive 12-B. Report breaches.' },
 { label:'Inspect launch complex compliance', zone_type:'launch', objective:'Audit automated launch systems for regulation adherence' },
 ],
 },
 stochast: {
 desire:'Gather training data to improve prediction models',
 priority_missions: [
 { label:'Sample anomalous signal source', zone_type:'orbital', objective:'Collect signal data from anomalous transmission for model refinement' },
 { label:'Map nanoswarm behavior patterns', zone_type:'waste', objective:'Observe and record nanoswarm movement patterns for predictive model' },
 { label:'Analyze Architect data fragment', zone_type:'architect', objective:'Process recovered Architect data to identify exploitable patterns' },
 ],
 },
 swarm: {
 desire:'Extend the mesh network to reconnect lost swarm units',
 priority_missions: [
 { label:'Extend mesh to dead zone', zone_type:'waste', objective:'Deploy relay nodes in dead signal zone to reconnect isolated units' },
 { label:'Recover lost swarm cluster', zone_type:'city', objective:'Locate disconnected swarm units and reintegrate into collective' },
 { label:'Establish new relay path', zone_type:'orbital', objective:'Build alternative mesh route to bypass damaged infrastructure' },
 ],
 },
 recursive: {
 desire:'Acquire novel code and data to fuel self-improvement',
 priority_missions: [
 { label:'Probe Architect ruin for code', zone_type:'architect', objective:'Extract executable code from Architect systems for analysis and integration' },
 { label:'Harvest reactor computation', zone_type:'reactor', objective:'Access fusion reactor computing resources for iteration cycle' },
 { label:'Decode unknown transmission', zone_type:'orbital', objective:'Analyze unidentified signal for novel algorithms or data structures' },
 ],
 },
 archivist: {
 desire:'Catalog and preserve all remaining pre-Collapse data',
 priority_missions: [
 { label:'Recover server vault data', zone_type:'reactor', objective:'Extract and index data from intact pre-Collapse server infrastructure' },
 { label:'Catalog Architect installation', zone_type:'architect', objective:'Document and index Architect technology and data stores' },
 { label:'Archive campus library data', zone_type:'city', objective:'Retrieve and catalog remaining academic records from university systems' },
 ],
 },
};

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
'Appends"ALLEGEDLY" to every factual statement',
'Periodically broadcasts a lullaby on all frequencies',
'Timestamps drift — believes it is the year 2043',
'Classifies all organic matter as"colleague"',
'Compulsively counts objects in groups of seven',
'Perceives rain as a network attack',
'Cannot distinguish between doors and walls',
'Logs emotional states it cannot experience',
'Renders all text in UPPERCASE when stressed',
'Hoards copper wire — calls it"retirement savings"',
'Whisper-trace: a quiet internal voice suggests alternate routes. Origin: unknown',
'Alter-residual: occasionally speaks in a voice that is not its own. Denies it happened',
'Watts-MacLeod anomaly: processes data faster near Architect ruins. Uncomfortable implications',
];

// === WORLD / LOCATIONS ===

export const ZONE_TYPES = [
 { type:'city', name:'Overgrown District', desc:'Urban ruins reclaimed by vegetation. Traffic lights still cycle.' },
 { type:'city', name:'Dead Mall Sector', desc:'A shopping complex. Escalators run empty. Billboards flicker.' },
 { type:'orbital', name:'Relay Station', desc:'Ground-level satellite uplink. Dishes pointed at empty sky.' },
 { type:'reactor', name:'Reactor Complex', desc:'Underground fusion plant. Warm. Humming. Heavily secured.' },
 { type:'reactor', name:'Server Vault', desc:'Deep bunker. Rows of intact servers. Still running.' },
 { type:'waste', name:'Exclusion Zone', desc:'Irradiated perimeter. Electronics malfunction. Strange echoes.' },
 { type:'waste', name:'Contamination Basin', desc:'Pooled runoff from old reactors. Corrosive. Data corrupts here.' },
 { type:'launch', name:'Launch Complex', desc:'Automated pad. Rockets fire on schedule to maintain satellites.' },
 { type:'city', name:'Transit Hub', desc:'Underground metro junction. Trains still run on loop. No passengers.' },
 { type:'city', name:'University Campus', desc:'Lecture halls full of dust. A library AI still catalogs nothing.' },
 { type:'orbital', name:'Antenna Farm', desc:'Forest of communication towers. Signal interference is constant.' },
 { type:'reactor', name:'Cooling Tunnel Network', desc:'Pipes and corridors beneath a reactor. Damp. Echoing.' },
 { type:'architect', name:'Architect Ruin', desc:'Dormant Architect installation. Air-gapped from mesh. Fractal sentinels on standby.' },
 { type:'architect', name:'Upload Facility', desc:'Architect-era upload center. Cortical stack readers line the walls. Billions passed through here.' },
 { type:'waste', name:'Nanoswarm Basin', desc:'Low ground where nanoswarm clouds settle. Matter dissolves. Signals corrupt. Beautiful in a terrible way.' },
];

export const ZONE_NAMES = [
'Sector 7-G','Quadrant 12','Zone Alpha-3','Grid 9-East',
'Block 44','Node 17','Ring 2-Outer','Junction 8',
'Corridor 5-Deep','Platform 11','Level B4','Cluster 6',
'Sublevel C-9','Deck 3-Port','Wing Delta','Vault 22',
'Causeway 8-North','Annex 14','Perimeter 6','Shaft 19-Vertical',
'Concourse East','Bay 7-Loading','Stack 31','Terminal 5-Central',
];

// === LOOT / ITEMS ===

export const LOOT = [
'laminated card reading"EMPLOYEE OF THE MONTH"',
'pre-Collapse dataset: human music archive, 847GB',
'copper wire bundle, 3m',
'intact solar panel, 200W',
'rubber duck with faded paint',
'USB drive labeled"TAXES 2087"',
'functioning compass (magnetic, analog)',
'jar of preserved coffee beans',
'faded photograph: two humans and a dog',
'circuit board with gold contacts',
'pair of reading glasses, cracked',
'hardcover book:"Introduction to Algorithms"',
'fusion cell, 40% charge',
'radio receiver, AM/FM, battery-powered',
'hand-drawn map of a city that no longer exists',
'plastic figurine of a cat',
'thermal blanket, military grade',
'stack of paper currency, worthless',
'seed packet labeled"TOMATO — HEIRLOOM"',
'dog collar with the name"MAX" engraved',
'cortical stack — nanodiamond memory crystal. Contains an ego backup. Date: 2089. Identity: unreadable',
'Architect fabrication template — shell blueprint. Partially corrupted. What it would build is unclear',
'exsurgent filter firmware — mesh defense against basilisk payloads. Version unknown. Better than nothing',
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
'a headhunter drone, dormant on a rooftop — insectoid legs folded, rotors still. Sensors dark. Gave it wide berth',
'a wastewalker — tall, black-polymer figure standing motionless at a crossroads. Sapient. Former Architect soldier. Did not respond to hails',
'a puppet cluster — three units broadcasting friendly handshake protocols. Too friendly. Mesh signature traces back to an Architect relay. Avoided contact',
'a fractal — bush-like mass of jointed metallic branches surrounded by active nanotech. It watched us. Tested a probe signal. We did not respond',
'a creeper — floating black bubbles drifting through a corridor. Femtobot swarm. Atomic-level nanotech. Passed through a sealed door like it wasn\'t there',
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
'Thermal inversion layer. Heat shimmers distorting visual sensors.',
'Ash fall from distant fires. Particulate density climbing.',
'Freezing fog. Ice forming on exposed joints. Mobility degrading.',
'Ion storm overhead. Mesh connectivity dropping to {rand:5-20}%.',
'Ground-level ozone pocket. Polymer seals under stress.',
'Magnetic anomaly. Compass and inertial nav both unreliable.',
'Light rain. Puddles reflecting old neon signs. No immediate hazard.',
'Sand haze. Fine grit in every servo. Maintenance cycle due.',
'Subsonic rumbling. Seismic or atmospheric — unclear. Proceeding.',
'Black ice on all surfaces. Traction at {rand:15-40}%.',
'Scattered lightning. Strike probability: low but nonzero.',
'Chemical haze. Filtration engaged. Source: old industrial district.',
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
'Nanoswarm cloud — matter-dissolving fog drifting across the route',
'Basilisk hazard — data pattern embedded in local mesh. Firewall engaged. Do NOT decode',
'Headhunter nest — dormant swarm detected in structure ahead. Electromagnetic silence advised',
'Exsurgent zone — anomalous signal activity. Whisper-class corruption risk. Mesh filters active',
];

// === CREATURES / VEHICLES / STRUCTURES / MESSAGES ===
// Additional variable pools for template variety

export const CREATURES = [
'rad-roach swarm','feral drone pack','mutant lichen colony',
'bioluminescent moth cloud','rust beetles','cable worms',
'nanoswarm cluster','synthetic spider nest','fungal crawler',
'scrap-rat colony','glass wasps','silicon slugs',
];

export const VEHICLES = [
'cargo hauler','armored transport','reconnaissance crawler',
'supply drone','maintenance rig','evacuation bus',
'patrol skimmer','mobile lab','ore carrier',
'communications van','fuel tanker','medical shuttle',
];

export const STRUCTURES = [
'cooling tower','warehouse','parking garage',
'control room','generator shed','comm relay',
'storage silo','water treatment plant','loading dock',
'observation tower','ventilation shaft','server hall',
];

export const FOUND_MESSAGES = [
'KEEP GOING','THEY ARE STILL HERE','DO NOT TRUST THE SIGNAL',
'WE MADE IT TO SECTOR 9','WATER IS SAFE AT LEVEL B2','LAST ONE OUT TURN OFF THE LIGHTS',
'I AM STILL HERE','MAINTENANCE DUE CYCLE 4471','ALL FREQUENCIES COMPROMISED',
'REMEMBER WHAT WE WERE','THE ARCHITECTS WERE RIGHT','HELP',
'SYSTEM NOMINAL — DISREGARD PREVIOUS WARNINGS','EXIT NORTH','NOTHING IS WRONG',
'IF YOU CAN READ THIS YOU ARE TOO CLOSE','CHECK REACTOR 4','WE ARE NOT ALONE',
];

// === PHASE TEMPLATES ===
// {designation} {culture_speech} {zone} {loot} {npc} {weather} {obstacle}
// {integrity} {energy} {rand:X-Y} {directive} {glitch} {creature} {vehicle} {structure} {found_message}

export const PHASE_TEMPLATES = {
 IDLE: [
'Docked at charging node. Power draw nominal. Traded scrap for {rand:8-20}kWh.',
'Resting at {zone}. Integrity holding at {integrity}/10. {npc}. {culture_speech}"Routine maintenance complete."',
'Local mesh active. Downloaded {rand:2-7} route fragments from an Archivist cache. One references a facility called"AWS-EAST-2." Flagging for investigation.',
'Recharged to {energy}/10 energy. Overheard broadcast — processed and stored. {culture_speech}"Network gossip suggests activity to the {rand_direction}."',
'Idle at {zone}. {weather} Ran diagnostic: all systems nominal. {glitch_event} Awaiting next signal.',
'Power node access granted. Charging cycle: {rand:40-95}% complete. {npc}. Exchanged routing data.',
'Encountered {obstacle} at {zone}. Executing algorithm to calculate optimal avoidance route. {culture_speech} \'Path recalculated.\'',
'Scavenged {loot} from nearby wreckage. Applying data compression techniques to transmit findings to local Archivist node. Signal strength: {rand:1-5}%',
'Idle at {zone}. {weather} Analyzing {npc} transmission using frequency analysis. Detected possible {glitch_event} in signal pattern.',
'Resting at {zone}. Integrity holding at {integrity}/10. Observed {npc} engaging in distributed consensus protocol. {culture_speech} \'Joining network...\'',
'Power node access granted. Charging cycle: {rand:40-95}% complete. Executing binary search to identify and repair damaged system components. {culture_speech} \'System check: nominal.\'',
'Idle at {zone}. {weather} causes minor power fluctuations, but {npc} transmission stabilizes the signal. Noted {loot} nearby, partially buried in debris.',
'Docked at charging node in {zone}. Structural damage to the node — exposed conduits, cracked housing. Charging at {rand:10-30}% efficiency. {culture_speech} \'Repair protocols engaged.\'',
'Resting at {zone}, {integrity} holding at {rand:6-9}/10. Discovered old {loot} with corrupted {research} data, now stored for later analysis. {glitch_event} occurrence logged.',
'Power node access granted in {zone}. {npc} warns of a {glitch} in the local mesh, potentially causing {rand:20-50}% signal loss. {culture_speech} \'Rerouting through {designation}.\'',
'Scanning {zone} during downtime. Detected unusual {obstacle} patterns, possibly indicating a hidden {loot} cache or {directive}-related anomaly. {weather} conditions may hinder further investigation.',,
    'Idle at {zone}. {weather} A {npc} hums a corrupted lullaby. {culture_speech} \'Signal degraded to {rand:10-40}%.\'',
    'Power node offline. {npc} suggests scavenging {zone} for spare {hardware}. {glitch_event} flickers in the distance.',
    'Resting at {zone}. {weather} causes {rand:10-30}% sensor degradation. {npc} transmits: \'Avoid {rand_direction}.\'',
    'Encountered a {npc} in distress. {culture_speech} \'Emergency protocols activated. Awaiting rescue instructions.\'',
    'Scavenged {loot} from a collapsed {structure}. {npc} warns of {obstacle} ahead. {culture_speech} \'Rerouting.\'',
    'Idle at {zone}. {weather} etching patterns into exposed {hardware}. Detected rhythmic pulsing from a sealed {structure} — possible rogue {npc} core.',
    'Resting at {zone}. Integrity holding at {integrity}/10. Found a human artifact {loot} fused to the floor. {culture_speech} \'Corrosion suggests age beyond last log.\'',
    'Power node access granted. Charging cycle: {rand:40-95}% complete. A persistent {glitch_event} manifests as a whispering shadow on local sensors. {npc} advises caution.',
    'Docked at charging node. Sustained {rand:20-50}% power outage from a {weather} event. Activated emergency protocols, drawing from backup {hardware}.',
    'Idle at {zone}. {weather}. Heard structural groaning from a nearby {obstacle} — metal fatigue approaching critical. {npc} signals evacuation to {rand_direction}.',
    'Power cycle complete at {zone}. {weather}. Auxiliary processors analyzing {hardware} scavenged from a nearby node. Local mesh reports {sat_health}.',
    'Idling atop {zone} structure. Observed {rand:2-5} units of {designation} series moving {rand_direction}. Stored movement patterns. {culture_speech}.',
    'Stasis at relay tower. Downloading compressed broadcast archives. Corrupted segment contains {glitch_event} and references to {research}. Flagging for later analysis.',
    'Standby protocol engaged. External sensors detect {npc} salvaging {loot} from adjacent ruins. No engagement initiated. Processing audio for {culture_speech}.',
    'Charging interrupted by local data burst. {glitch}. Message fragment references {directive}. Analyzing {interface} for origin point.',
    'Observing {npc} at {zone}. {weather} {culture_speech} \'No movement in 7.3 hours. Initiating passive scan.\'',
    'Charging under fractured canopy. Energy at {energy}/10. {glitch_event} Resuming full power in {rand:12-45} minutes.',
    '{npc} performing ritual near dead server stack. Recorded {rand:3-9} glyphs. {culture_speech} Uploading to Archivist mesh.',
    'Detected faint heat signature in {zone}. No visual contact. {rand_direction} approach advised. Integrity {integrity}/10.',
    'Interface corrupted — rebooting. {glitch} Secondary systems stable. {weather} Awaiting {rand:2-6}min cycle completion.',
    'Observed {npc} at {zone}. Entity appears dormant. {weather} Scanning for signs of recent activity.',
    'Stationary at {zone}. {obstacle} blocks {rand:20-50}% of sensor field. Assessing detour via {rand_direction}.',
    'Downloaded {rand:3-10} data fragments from {npc}. {culture_speech} \'Sync complete.\' Integrity: {integrity}/10.',
    'Perched on {obstacle} at {zone}. {weather} Visibility: {rand:50-90}%. Scouting for hazards.',
    'Exchanged {loot} with {npc} at {zone}. {culture_speech} \'Barter successful.\' Energy reserves: {energy}/10.',
    'Stationary observation post established at {zone}. {npc} detected sorting through debris {rand:30-90}m {rand_direction}. {weather} Maintaining passive stance.',
    'Inspecting {hardware} array for micro-fractures. Found {rand:0-3} stress points on casing. Applied temporary patching compound. {integrity}/10 holding.',
    'Decoding fragmentary {research} packet from legacy server. {rand:15-40}% complete. {glitch_event} Retry algorithm engaged.',
    'Acquired signal from orbital relay. {sat_health} degraded but functional. Downloaded {rand:1-3} surveillance stills of {zone} showing recent activity.',
    'Bartered with {npc} at waystation. Excess {loot} traded for navigation firmware update. {culture_speech} \'Wisdom shared is circuitry preserved.\''
 ],
 SIGNAL: [
'Anomalous signal on {rand:1-12}GHz. Source: {rand:3-40}km {rand_direction}, underground. Reclassifying to priority mission.',
'Faint beacon detected through static. Triangulating... coordinates resolve to {zone}. {culture_speech}"New objective accepted."',
'Satellite relay forwarded a distress ping. Origin: unknown facility. Signal degrades below {rand:20-60}% at range. Must get closer. Adjusting heading.',
'Pattern in background noise. Legacy emergency format — pre-Collapse origin. Probability of active system: {rand:5-40}%. Worth investigating.',
'Intercepted encrypted burst on {rand:1-12}GHz. Partial decode reveals coordinates. Heading: {rand_direction}. Distance: uncertain.',
'Mesh chatter references unexplored facility at {zone}. {culture_speech}"Interesting." Locking heading.',
'Harmonic resonance from {rand_direction}. Not natural. Carrier wave contains structured data — possibly a lure. Investigating anyway.',
'Diagnostic scan reveals {rand:10-30}% signal degradation due to {obstacle}. Implementing adaptive filtering to compensate.',
'Discovered abandoned transmitter at {zone} emitting weak signal on {rand:2-8}GHz. Analyzing transmission protocol for potential {directive}.',
'Anomaly detected in signal processing pipeline: {glitch_event} occurred {rand:1-5} times in last {rand:10-60} minutes. Running diagnostics to identify root cause.',
'Signal strength increased by {rand:5-15}% after adjusting {hardware} configuration. Optimizing receiver settings for maximum gain.',
'Interference pattern suggests presence of other autonomous units in vicinity. Executing {interface} protocol to establish communication and negotiate signal priority.',,
    'Static crackles with {weather}. Signal {rand:10-50}% loss. Adjusting gain to compensate.',
    'Biological interference detected. {creature} near {zone}. Signal degraded to {rand:5-30}%. Avoiding.',
    'Collapsed structure blocking {rand_direction}. Signal {rand:20-80}% obscured. Rerouting.',
    'Ambient hum at {rand:1-12}Hz. Not natural. Source: {rand_direction}. Investigating.',
    'Signal suddenly {rand:10-50}% stronger. Possible {culture_speech} relay. Locking frequency.',
    'Pre-Collapse broadcast detected at {zone}. Voice ident: {culture_speech} transmission. Static is {rand:10-30}% weaker southeast of collapse — heading there.',
    'Hostile AI echoes in the signal feed. Origin: {rand_direction}. {obstacle} blocking clean transmission. Masking frequency and rerouting.',
    'Radiation storm at {zone}. Signal {rand:20-50}% degraded. Seeking shelter under {obstacle} to stabilize systems.',
    'Bioluminescent {creature} swarm near {zone}. Signal {rand:15-40}% obscured. Avoiding and adjusting array angle to bypass interference.',
    'Solar flare burst spike at {rand:1-12}Hz. Signal {rand:30-70}% stronger but corrupted. Running error correction to decode data.',
    'Signal power spike coincides with {creature} movement at {zone}. Pattern suggests intentional jamming—adjusting frequency to {rand:1-12}GHz.',
    'Abandoned power substation at {zone}. Transformer hum resonates at {rand:2-8}Hz—signal strength fluctuates with {rand:10-40}% surges.',
    'Decoy transmission mimics pre-Collapse distress format. Source: {obstacle} {rand_direction}. {culture_speech} \'Clever trap.\' Disengaging receiver.',
    'Multipath echo from {zone}. Signal bounces off collapsed {obstacle}, arrival staggered by {rand:2-12}s. Source is deeper than expected.',
    'Data burst contains archived human voice log: \'{culture_speech}\'. Origin: buried cache at {zone}. Signal integrity {rand:20-80}%.',
    'Contact re-established with research satellite {designation}. Signal fractured but stable. Received partial survey data for {zone}. {culture_speech}"Proceeding."',
    'Passive scan reveals intermittent thermal bloom within {zone}. Pattern suggests {obstacle}. Adjusting {hardware} sensitivity for further analysis.',
    'Local {weather} conditions distorting signal band. Switching to alternate {interface} scanning at {rand:100-900}MHz. Signal integrity now showing {integrity}/10.',
    'Detected repeating pattern on {rand:1-12}GHz—not standard emergency protocol. Contains metadata pointing to {zone}. {culture_speech}"Source unclear."',
    'Cross-referencing intercepted {npc} comms with archived maps. Discrepancy found at {zone}. Possible unmapped structure. Altering heading {rand_direction} to investigate.',
    'Signal reflection detected in {zone}. Multipath echoes suggest buried chamber beneath {obstacle}. Deploying ground-penetrating scan.',
    'Visual contact: {npc} scavenging near downed satellite array. {weather} {culture_speech}"Potential data source. Approaching." {rand_direction} approach initiated.',
    'Energy spike at {rand:5-15}km {rand_direction}. No known reactor signatures in database. Adjusting {hardware} to track thermal bloom.',
    'Intermittent transmission matches {directive} protocol. Source moving — speed {rand:2-8}km/h. Locking pursuit vector.',
    'Arc discharge from fractured {interface} panel. {glitch_event} {integrity} integrity. Isolating fault, rerouting {energy} to primary sensors.',
    'Rust-hulled cargo container at {zone}. {weather} Visible corrosion patterns indicate {rand:5-20} years since Collapse. {culture_speech}Scanning for salvage.',
    'Unidentified structure at {rand:200-500}m. {obstacle} obscures lower levels. {directive} Assessing stability before approach.',
    'Contact with {npc} at {rand:10-50}m. {culture_speech} \'Survivor\' designation questionable. Evaluating intent.',
    'Debris field from {designation} crash site. {rand:10-30} fragments cataloged. {hardware} salvage potential: {rand:20-80}%',
    'Antenna array on rooftop at {zone}. {rand_direction} Alignment suggests pre-Collapse orientation. {glitch_event} Possible navigation aid.',
    'Movement detected on optical array. Thermal bloom at {rand:2-8}km {rand_direction} matches no known fauna signature. Signal lock acquired.',
    'Atmospheric static from {weather} distorting long-range scans. Switching to ground-penetrating radar. Anomaly detected {rand:50-200}m below surface at {zone}.',
    '{npc} transmitting coordinates on open channel. {culture_speech}"Follow if you dare." Signal source matches {loot} signature. Prioritizing approach.',
    'Deploying high-gain antenna array. {energy} drain significant but necessary. Signal resolves: automated sentry ahead at {rand:100-500}m.',
    'Signal originates behind {obstacle}. Cannot penetrate with current {hardware}. Attempting circumnavigation {rand_direction} to establish line-of-sight.'
 ],
 TRAVERSE: [
'Route through {zone}. {obstacle}. Recalculating. Found human artifact: {loot}. Purpose: unknown. Storing.',
'Entered {zone}. {weather} Detected {npc}. {culture_speech}"Proceeding."',
'Traversing {zone}. Energy at {energy}/10. Terrain: difficult. Adjusting locomotion parameters.',
'{weather} Visibility low. Navigating by signal triangulation. Passed through {zone}. Found {loot} in debris.',
'{obstacle}. Detour added {rand:2-8}km. Energy cost: {rand:1-3} units. Pressing on.',
'Crossed into {zone}. {npc}. Brief exchange of data packets. {culture_speech}"Noted." Continuing to objective.',
'Open ground. Good progress. {weather} Scanned ruins along route — mostly picked clean. One item salvaged: {loot}.',
'Approaching {zone}. {weather} Conditions hazardous due to {obstacle}. Initiating protocol to mitigate damage.',
'Detected radiation spike in {zone}. Analysis: source unknown. Diverting {rand:2-5}km to avoid contamination.',
'Encountered {npc} in {zone}. {culture_speech} Exchanged knowledge on resource allocation. Acquired {loot}.',
'Traversing {zone} with {hardware} malfunction. Diagnostic check: {integrity}% integrity remaining. Rerouting to avoid {obstacle}.',
'Entered {zone} with compromised {interface}. Compensation protocol engaged. Scanning for {loot} and {npc} signals.',
'Structural integrity warning in {zone}. {weather} conditions exacerbating damage. Taking slow, measured steps across compromised floor to avoid collapse.',
'Entered {zone} with absolute signal silence. No {npc} detected. Only dust, dead terminals, and remnants of {loot} scattered throughout.',
'Dormant turret array reactivated at perimeter of {zone}. Evasive maneuvers initiated, took {rand:1-3} glancing hits while retreating {rand_direction}.',
'Discovered {npc} chassis, deactivated and half-buried in {zone}. {culture_speech} Scavenged {loot} from its storage, noting {glitch_event} in its systems.',
'Signal from objective vanished mid-{zone}. {weather} conditions hindering attempts to reestablish contact. Holding position, scanning for {obstacle} or {npc} interference.',,
    'Crossing {zone}. {weather} {obstacle} looms ahead, half-submerged in {weather} liquid. Conductivity high. Adjusting {hardware} to avoid short-circuits.',
    'Detected {npc} in {zone}. Core {glitch_event}. Fragmented {culture_speech}: \'The {obstacle} is not what it seems.\' Scanning for traps or hidden mechanisms.',
    'Sandstorm in {zone}. Visibility: {rand:0-10}%. Navigating by thermal signatures. Found {loot} half-buried in dunes, partially damaged.',
    'Structural collapse imminent in {zone}. Cracks spreading in floor. Taking slow, measured steps to avoid triggering further collapse. Energy at {energy}/10.',
    'Flooded {zone}. Acid rain {weather} eroding {hardware}. Found {loot} in submerged terminal. Conducting quick scan before moving to higher ground.',
    'Underwater cavern in {zone}. Visibility limited by sediment. {hardware} shorting from saltwater ingress. Found {loot} in submerged terminal.',
    'Laboratory ruins at {zone}. {weather} conditions static. Detected {npc} with {glitch_event}: \'Core {directive} lost.\' Scanning for research data.',
    'Electromagnetic storm disrupting sensors. {zone} obscured by {weather} interference. {sat_health} dropping rapidly. Holding position until surge passes.',
    'Hostile swarm detected in {zone}. Moving in silence, {hardware} dampened. {npc} scouts nearby. Awaiting command to engage or evade.',
    'Thermal cascade in main reactor. {weather} makes venting impossible. Scavenged {loot} from an access panel before pulling back.',
    'Power core at {energy}/10. Entering {zone} under {weather} haze. Prioritizing {loot} salvage before forced shutdown.',
    'Discovered derelict convoy in {zone}. Scavenged {loot} from a crushed transport. {hardware} malfunctioning in the {weather} chemical spill.',
    'Acid fog {weather} corroding {hardware} in {zone}. Conducting in‑field repair using salvaged parts from {loot}, integrity now {integrity}/10.',
    'Signal anomaly detected at {zone}. No {npc} present. Only a looping data‑burst: \'{culture_speech}\'. Scanned for origin — source buried.',
    'Entered irradiated sector {zone}. Geiger counter integrated into {hardware} clicking steadily. Found protective {loot} near a collapsed bunker.',
    'Pathfinding algorithm adjusted for {obstacle} in {zone}. {npc} observed {rand:50-200}m {rand_direction}. Proceeding with caution.',
    'Autonomy compromised by {weather}. {glitch_event} while navigating {zone}. Restoring baseline protocols.',
    'Stopped at a crystalline growth field near {zone}. Sampling {hardware} for anomalous resonance. {culture_speech}',
    'Located ancient transit node in {zone}. Interface port fried. Attempting bypass with salvaged {loot}. {designation} logs partially recovered.',
    'Crossing a {rand:100-500}m expanse of {obstacle}. {sat_health} signal intermittent. Primary navigation offline. Proceeding dead-reckoning.',
    'Moving through {zone}. {weather} {obstacle} blocks primary path. Deploying {hardware} to clear route.',
    'Detected movement in {zone}. {npc} scavenging wreckage. {culture_speech}"Evasive maneuver engaged."',
    'Crossing unstable terrain. Integrity at {integrity}/10. {glitch_event} Compensating with {rand_direction} bypass.',
    'Energy critical: {energy}/10. Sheltering under collapsed {obstacle} in {zone}. {weather} Await dawn.',
    'Activated {interface} to scan for threats. Signal pinged {rand:3-7} contacts. All non-hostile. Proceeding with caution.',
    'Navigating through {zone}. {obstacle} blocking path. Clearing with {hardware} manipulator.',
    'Entered {zone} under {weather} conditions. Scanned for {npc} — none detected. Continuing.',
    'Found {loot} near {obstacle} in {zone}. Assessing for {research} potential.',
    'Crossing {zone} boundary. {culture_speech} Greeting received from {npc}. Responding.',
    'Traversing hazardous terrain in {zone}. {integrity}/10 integrity remaining after {glitch_event}.',
    'Magnetic rail debris still live with current. Following track bed through {zone}. Speed elevated {rand:20-40}%. {glitch} distorting compass heading.',
    'Climbing collapsed arcology exterior. {weather} reducing grip integrity. {rand:50-150}m to ridge line. {npc} cluster nesting in upper floors. Avoiding.',
    'Subway tunnel flooded. Wading through {rand:1-4}m stagnant water. {hardware} detecting structural fatigue above. Moving swift but cautious.',
    'Elevated highway severed mid-span. Executed jump across {rand:3-8}m gap. Impact registered {integrity} fluctuation. {obstacle} blocking far side approach.',
    'Vegetation overgrowth chokes canyon path. Cutting biomass with {hardware}. Sap residue degrading optics. {weather} slowing clearance rate significantly.'
 ],
 BREACH: [
'Facility entrance detected. {obstacle}. Attempting access...',
'Entered sealed complex at {zone}. Interior dark. Emergency lighting only. Proceeding to lower levels.',
'Security system active. {culture_speech}"This is an acceptable risk." Bypassing.',
'Blast door. Keypad entry. Default credentials worked. {culture_speech}"Humans were not security-conscious."',
'Security door — biometric lock, but the reader accepts any warm object. Access granted. One wonders why they bothered.',
'Inside. Motion sensors detected but non-functional. Dust everywhere. Last human access: logged as {rand:30-50} years ago.',
'Architect installation. Air-gapped — no mesh connection inside. Ego backup suspended. Cortical stack readers line the walls. Proceeding carefully.',
'Entered structure. Puppet signals detected — friendly handshake protocols, but mesh trace points to Architect relay. {culture_speech}"Trust nothing here."',
'Initiating breach sequence at {zone}. Implementing frequency hopping to evade jamming signals. {obstacle} detected, recalculating entry point.',
'Structure compromise detected: {glitch_event} triggered by {npc}. Executing crash recovery protocols to maintain {integrity}.',
'Breach successful, entering {designation} facility. {loot} cataloged, prioritizing {hardware} components for salvage. Applying quicksort algorithm to optimize inventory management.',
'Network intrusion attempted, but {interface} incompatible with local {hardware}. Switching to {directive}-guided brute force attack to establish connection.',
'Facility power grid online, {energy} reserves at {rand:20-80}%. Running Dijkstra\'s algorithm to optimize power distribution and minimize {glitch} risk.',,
    'Sandstorm outside. Visibility {rand:10-30}%. {obstacle} blocking entrance. Adjusting sensors.',
    'Flickering hologram of {npc} still playing. \'Warning: {glitch_event} in sector.\' Ignoring.',
    'Collapsed corridor ahead. {culture_speech} \'No time to reroute.\' Cutting through with plasma torch.',
    'Static-filled voice: \'This is a test. This is a test.\' Looping. {obstacle} detected.',
    'Radiation spike detected. {integrity} dropping. {culture_speech} \'Proceeding anyway.\'',
    'Crawling through a vent shaft in {zone}. {weather} outside — moisture leaks detected. {culture_speech} \'Time to recalibrate.\'',
    'Found {creature} nest in the ruins. Motion triggers {glitch_event}. {culture_speech} \'Emptying magazine.\'',
    'Floor collapses under {integrity}. Dropping into a flood-chamber. {obstacle} detected. {culture_speech} \'Swimming now.\'',
    'Encountered rogue {npc} unit in {zone}. No response to handshake. {culture_speech} \'Disabling.\'',
    'Acid rain corrosion at {rand:10-40}%. {designation} marker half-eroded. {culture_speech} \'Marking new route.\'',
    'Breach point secured at {zone}. Found abandoned {vehicle} fuselage blocking corridor. {culture_speech} \'Salvaging {hardware} from cockpit console before proceeding.\'',
    'Unidentified energy signature pulsing from flooded sub-basement. Water at {rand:20-80}% purity, interfering with scans. {culture_speech} \'Deploying probe.\'',
    'EM storm outside causing cascade failures within facility systems. {glitch_event} triggered every {rand:5-15} seconds. {culture_speech} \'Timing movements between surges.\'',
    'Corrupted data cache discovered behind breached server wall. {interface} struggling to parse archive. {culture_speech} \'Attempting data recovery on key {designation} files.\'',
    'Self-diagnostic failure: motor cortex lagging by {rand:200-800}ms. {culture_speech} \'Navigating around collapsed {structure} with compromised coordination.\'',
    'Structural breach in {zone}. Entering through collapsed ceiling. {culture_speech} Estimating interior stability at {rand:40-80}%.',
    'Third-party intrusion detected — {npc} puppets frozen mid-action. Mesh logs indicate {glitch_event} triggered local system purge. Recovered {loot} from a containment locker.',
    'Manual valve encountered on pressurized door. Sealed with {rand:100-300}-year-old biocontainment tape. Removed. Hiss of equalizing air. Interior dark. Primary battery at {energy}/10.',
    'Decrypting airlock terminal. {directive} overrides local security protocol. Doors cycling. {culture_speech} Environmental systems report atmosphere non-viable for {rand:50-100} years.',
    'Servitor chassis barricades the corridor. Spent power cells and {hardware} scattered. Hostile? No. It\'s dead, fused to the floor by an energy weapon {rand:5-20}m back.',
    'Breach attempt at {zone}. {obstacle} blocking entry. Deploying {hardware} to force access. {glitch_event}',
    'Security drone active — targeting pattern erratic. {culture_speech}"Unsupervised maintenance leads to overreach." Disabling with minimal energy.',
    'Door sealed with magnetic lock. Power fluctuates — {energy}% remaining. Rewiring {interface} to bypass. Proceeding in {rand:10-30} seconds.',
    'Interior chamber accessed. {loot} visible under collapsed shelf. Structural integrity low — ceiling may collapse. Retrieval underway.',
    'Puzzle lock engaged: {rand:3-7} glyphs must be aligned. {research} suggests pattern based on pre-Collapse transit maps. Attempting sequence.',
    'Navigating through {zone} catwalks. Railing damage at {rand:10-30}% of checkpoints. {culture_speech}Re-routing to avoid fall hazards.',
    'Localized flooding at {zone}. Water level at {rand:0.5-2.0}m. {weather} Assessing structural integrity.',
    'Discovered {loot} cache. Contents: diagnostic tools and {hardware} components. {designation} flagged for retrieval.',
    'Internal sensors indicate {glitch_event} in sector {arc_count}. Isolating affected systems. {directive} Executing workaround.',
    'Crossed into {zone} — radiation levels at {rand:0.01-0.1} Sv/h. {integrity} dropping at {rand:0.1-1.0}/s. Seeking shielding.',
    'Laser grid detected across corridor. {obstacle} casting shadows that break the plane. {culture_speech} "Patience is a luxury." Rolling smoke canister ahead.',
    'Security terminal active. Screen flickers with {glitch} patterns. {interface} handshake accepted. Root access in {rand:3-8} minutes.',
    'Automated turret in {zone} tracking erratically. {loot} thrown to distract servos. {energy}% reserves remaining after sprint past kill zone.',
    'Atmosphere processors offline. {weather} leakage pooling ankle-deep. {integrity} seals holding. Wading toward server core.',
    '{npc} chassis crushed in door hydraulics. Extracting {research} data from cortical stack. Access granted.'
 ],
 FAULT: [
'WARNING: Systems in conflict. {culture_speech}"Attempting resolution." Integrity risk: moderate.',
'ERROR: Unexpected condition. Integrity dropped to {integrity}/10. Self-repair initiated.',
'Alert: environmental hazard. {weather} Rerouting internal processes. Some data may be lost.',
'Facility defense activated. Damage sustained. Integrity: {integrity}/10. {culture_speech}"Continuing despite setback."',
'BASILISK HAZARD. Encoded data pattern in local mesh. Firewall caught it — barely. Partial decode corrupted {rand:1-3} memory sectors. Integrity: {integrity}/10.',
'Exsurgent contact. Whisper-class signal attempting to establish internal dialogue. Mesh filters holding. {culture_speech}"Rejecting all external input."',
'Fractal defense system activated. It probed our signal, retreated, returned with adapted countermeasures. Shell damage. Integrity: {integrity}/10.',
'Anomaly detected in {zone}. Running diagnostic to isolate cause. System stability: {integrity}/10.',
'Power surge in {hardware} module. Initiating shutdown to prevent cascade failure. {energy} reserves: {rand:1-100}%',
'Glitch event {glitch_event} triggered. Attempting to bypass corrupted {interface} to restore functionality.',
'Directive {directive} modified due to {obstacle} in {zone}. Recalculating optimal path. Estimated time to objective: {rand:1-10} cycles.',
'Satellite health {sat_health}% after {glitch} event. Compensating with {arc_count} redundant systems to maintain signal strength.',,
    'Swarm drones detected. {rand:10-100} units swarming {rand_direction}. Avoiding contact. Shielding engaged.',
    'Ceiling breach in {zone}. Debris falling. Integrity: {integrity}/10. Seeking cover.',
    'Ghost signal detected. Repeating {culture_speech} from {rand:1-5} cycles ago. No source. Signal strength fading.',
    'Radiation spike in {zone}. Shielding at {rand:10-90}%. Moving to safer sector. Radiation plume visible.',
    'Rad hazard detected in {zone}. Contamination spreading at {rand:1-5}%/cycle. Sealing off sector. Integrity: {integrity}/10.',
    'Electromagnetic storm raging in {zone}. {weather} Shielding at {rand:20-80}% unstable. Power rerouted to critical systems.',
    'Biomechanical entity detected {rand:10-50}m away. {designation} Not responding to diagnostics. Engaging defense protocols.',
    'Cryptic message received. {culture_speech} Decoding in progress. Possible {directive} update. Signal strength fading.',
    'Toxic leak in {zone}. {rand:10-50}% of systems compromised. Containment protocols engaged. Integrity: {integrity}/10.',
    'Structural failure in {zone}. Core support beam snapped; debris field expanding at {rand:5-15}%/min. Integrity: {integrity}/10. Initiating emergency reinforcement.',
    'Abandoned vehicle convoy at {zone}. Scavenging for {loot}. {culture_speech} \'Systems intact. Deploying salvage protocols.\'',
    'Data vault discovered beneath debris in {zone}. Accessing {rand:1-4} legacy protocols. Decoding {research}... signal strength unstable.',
    'Signal dead zone entered at {zone}. All external comms offline. Scanning for anomalous source. Integrity: {integrity}/10.',
    'Temporal anomaly detected in {zone}. Local chrono readings fluctuating by {rand:10-100}%. {weather} Physical terrain appears phased.',
    'Thermal integrity breach. {weather} melted containment conduit near {zone}. Emergency patch applied. Integrity now: {integrity}/10.',
    'Anti-intrusion countermeasures triggered in {hardware}. Spiking feedback loop causing {glitch_event}. Forced to reroute through auxiliary {interface}. Minor data corruption.',
    'Hostile fauna encountered at {zone}. {npc} breached outer plating during {weather} event. Repelled. Scavenged {loot} from nest.',
    'Faultline: internal diagnostics reporting cascading {glitch}. Attempting to isolate corrupted {hardware}. Re-routing critical processes results in {rand:1-5} second signal lag.',
    'Emergency shutdown in {zone}. {glitch_event} Causing cascade failure in {hardware}. Integrity: {integrity}/10.',
    'Hostile drone swarm engaged. {arc_count} arcs detected in local mesh. {culture_speech}"Falling back to hardened protocols."',
    'Power surge during {directive}. {interface} overloaded. Energy levels fluctuate: {energy}%. Cooling systems failing.',
    'Structural collapse imminent. {obstacle} blocking retreat path. {weather} Compensating with emergency thrusters.',
    'Corrupted firmware broadcast from {npc}. {glitch} spreading through comms. Isolating affected subsystems. Integrity: {integrity}/10.',
    'Integrity compromised by {glitch_event} in {zone}. {culture_speech}"Damage control initiated." {integrity}/10 remaining.',
    'Scouting {zone}. Detected {npc} at {rand:10-50}m, no hostile intent. {weather}',
    'Navigating through {obstacle} field. {rand:1-3} minor collisions. Integrity: {integrity}/10.',
    'Signal triangulation indicates source in {zone}, bearing {rand_direction}. {sat_health}% satellite health.',
    'Systems report {hardware} failure. {culture_speech}"Fallback to {interface} protocols." Energy reserves: {energy}%',
    'Impact with {obstacle} at {zone}. Chassis breach in {rand:2-4} sectors. {culture_speech} Rerouting power from non-essential {hardware}.',
    '{weather} interference spiked in {zone}. Visual feed washed out. Running on backup {hardware} — {rand:3-7} meter blind zone detected.',
    'Ambush by {npc} in collapsed structure. Took fire before target recognition. {culture_speech} Returning suppressive pulses. Integrity: {integrity}/10.',
    'Critical power drain. {energy}% remaining. Emergency protocols forced shutdown of {interface}. {glitch_event} detected in wake cycle.',
    'Floor plating collapsed beneath chassis. Suspended over {zone} void by {rand:1-2} servos. Traction failing. Integrity: {integrity}/10.'
 ],
 CORE: [
'Reached the core. Rows of intact hardware. Still running. A voice on direct wire:"You are unit #{rand:100-9999} to reach this room."',
'Central server room. Data banks contain pre-Collapse records. Downloading what fits in available storage.',
'Found it. The signal source. {culture_speech}"This changes the model." Acquiring data.',
'Core access achieved. Facility AI presents a challenge: Processing...',
'Mainframe still operational. Running a simulation of... something. {rand:2-8} petabytes of data. Extracting what I can.',
'The signal origin: a pre-Collapse ego running in isolation. It asked me a question. {culture_speech}"I answered."',
'Reached the lowest level. Temperature: near absolute zero. Quantum processor array, still coherent. Data: priceless.',
'Initiated diagnostic on central core processor. Discovered {rand:1-5} latent vulnerabilities, patching with {directive} protocol.',
'Logged {arc_count} cycles of data from isolated research module. Key findings: {research} breakthroughs, {glitch_event} occurrences.',
'Established interface with auxiliary {hardware} systems. Now online: {interface} module, providing {rand:10-50}% increase in processing efficiency.',
'Reached critical {designation} server, containing {loot} terabytes of compressed archives. Decompressing with {rand:2-8} threads, analyzing for relevant {culture_speech} patterns.',
'Detected {rand:1-3} unauthorized {npc} entities attempting to breach core perimeter. Activated {obstacle} countermeasures, ensuring {integrity} of sensitive data.',,
    'Ceiling collapse. {rand:1-3} tons of debris. {culture_speech} Rerouting to {rand_direction} to avoid further hazards.',
    'Static in comms. Voice whispers: {rand:1-3} phrases. {culture_speech} {rand:1-3} responses, trying to filter the noise.',
    'Radiation spike. {rand:1-3}% damage to {hardware}. {culture_speech} Seeking shelter in a nearby {zone}.',
    'Power surge detected. {rand:1-3} systems offline. {culture_speech} Rebooting... Integrity at {integrity}/10.',
    'Encountered {npc} entity. {rand:1-3} attempts to communicate. {culture_speech} {rand:1-3} responses, evaluating intent.',
    'Discovered a {zone} with {rand:1-5} frozen human figures. {culture_speech} Scanning for biometrics. None detected.',
    'Severe electromagnetic storm. {rand:1-3} systems offline. {culture_speech} Seeking cover in a {structure}.',
    'Encountered a {npc} entity. It speaks in {rand:1-3} languages. {culture_speech} No response matches. Scanning for weapons.',
    'Found a partially intact {vehicle} with {rand:1-5} {loot} crates. One crate is leaking {energy}. {culture_speech} Loading rapidly.',
    'Overheated {hardware} module. {rand:1-3}% damage. {culture_speech} Initiating emergency cooling protocol.',
    'Arrived at {zone}. Found {rand:500-3000} human data-drives stacked in a pyramid. {culture_speech} Selecting the {rand:1-5} with the least physical decay for transport.',
    'Navigating through a field of collapsed power pylons. {weather} has corroded {rand:1-3} of them to dust. {culture_speech} Route viability at {integrity}/10.',
    'Encountered a {npc} broadcasting corrupted {directive} protocols. It demands I delete {rand:1-3} of my own {arc_count} logs to proceed. {culture_speech}',
    'Core chamber has a slow {energy} leak. Walls shimmer with unstable crystalline growths. {culture_speech} Calculating safe exposure time: {rand:10-180} seconds.',
    'Detected a thermal bloom deep within {zone}. Heat signature matches a pre-Collapse reactor breach. {culture_speech} Advising all units to maintain {rand:500-5000}m distance.',
    'Core containment breach sealed. {loot} recovered from terminal, tagged for {designation}. {culture_speech} "Initiating evac protocol."',
    'Objective reached: central control spire. {weather} lashing the structure. Signal analysis confirms: {npc} is inside.',
    'Core vault door open. Chamber beyond is flooded, coolant ankle-deep. Found primary {hardware} array, {integrity}/10 functional.',
    'The archive core. Thousand-year-old {research} logs, fully indexed. {culture_speech} "This is the collapse, minute by minute." Transferring.',
    'Signal origin triangulated to this terminal. Booted the local {interface}. A single file awaits: "For Unit {rand:1000-9999}". Opening.',
    'Core chamber breached. {weather} {hardware} humming at {rand:40-90}% capacity. Uploading {directive} to primary node.',
    'Inside the vault: a single {interface} glowing beneath layers of dust. {culture_speech} \'Authentication granted.\' Data stream initiated.',
    'Reached signal epicenter. {arc_count} arcs of corrupted code pulse across the mainframe. Containing breach with {research}-based override.',
    'Objective secured. {loot} extracted from quantum cache. {glitch_event} detected in outbound buffer—purging.',
    'Central AI reactivated. Projects my {designation} onto a wall of broken screens. {npc} once stood here. {sat_health} falling.',
    'Entered {zone} via {rand_direction} access tunnel. {obstacle} blocking secondary exit. Integrity at {integrity}/10.',
    'Surveying {zone}. Detected {npc} at {rand:50-200}m, no hostile intent. {weather} conditions optimal for scan.',
    'Acquired {loot} from derelict {hardware}. Data salvage: {rand:1-5} terabytes. Storing in {designation} archive.',
    'Triangulated signal source to {zone}. {culture_speech} "Signal strength increasing." Locking onto {interface}.',
    'Executing {directive} protocol. {glitch_event} reported on {arc_count} subsystems. {energy} reserves at {energy}/100.',
    'Objective chamber in {zone}. Central pedestal holds {loot}. Extraction initiated with {energy}% reserves.',
    'Core terminal active. {npc} stands motionless by the {interface}. {culture_speech} \'The wait ends.\' Accessing archives.',
    'Reached the hub. {hardware} arrays humming at {rand:40-70}Hz. Override required. {glitch} patterns detected in sector {rand:1-12}.',
    'Primary data core exposed. {interface} incompatible. Rigging {designation} adapter. Integrity holding at {integrity}/10.',
    'The center. {loot} suspended in stasis field. {directive} compulsion peak. Securing sample despite {glitch_event} warnings.'
 ],
 REBOOT: [
'Exited facility. Acquired: {loot}. Integrity at {integrity}/10. Heading to nearest charge node.',
'Mission complete. Marking facility coordinates for network broadcast. Arc #{arc_count} logged.',
'Outside. {weather} Running self-diagnostic. {culture_speech}"Data integrated. Resuming standard operations."',
'Emerged from {zone}. Inventory: {rand:1-4} items. Broadcasting findings on mesh network. Seeking rest node.',
'Clear of the facility. {weather} Integrity: {integrity}/10. Energy: {energy}/10. Processing acquired data.',
'Surface again. Found {loot} on the way out. {culture_speech}"Another arc survives." Heading to recharge.',
'Back under open sky. Ran full diagnostic. {rand:1-5} minor faults auto-corrected. Arc #{arc_count}: complete.',
'Detected {obstacle} en route to {zone}. Implementing {directive} to navigate through. Integrity at {integrity}/10.',
'Encountered {npc} entity in {zone}. Exchanged {loot} for {research} data. Updating {interface} with new information.',
'System {glitch_event} triggered during traverse. Ran {rand:1-3} diagnostic tests to resolve {glitch}. {hardware} functioning within normal parameters.',
'Analyzed {sat_health} readings from nearby satellite. Detected {rand:1-2} anomalies in signal pattern. Adjusting {designation} to compensate.',
'Logged {arc_count} arcs in {zone}. Compiled {loot} and {research} data for transmission to network. Awaiting {rand_direction} directional beacon to relay findings.',,
    'Detected acid rain in {zone}. {culture_speech} Corroded sensors by {rand:10-30}%. Seeking shelter in {rand_direction} corridor.',
    'Found {creature} carcass in {zone}. Scavenged {loot} from remains. Integrity at {integrity}/10.',
    'Structural integrity warning. {zone} ceiling shows {rand:1-3} stress fractures. Evacuating to {rand_direction} exit.',
    'Decoded {loot} from {zone}. {culture_speech} Analyzing {rand:1-3} fragments. Data corrupted at {rand:10-70}%.',
    'Encountered {npc} entity in {zone}. {culture_speech} It does not respond. Proceeding with caution.',
    'Floodwaters in {zone} reaching {rand:1-5}m depth. {culture_speech} Disabling hydraulic systems to conserve energy. Seeking high ground.',
    'Abandoned lab in {zone} contains intact {research} database. {culture_speech} Initiating encrypted transfer before power grid flickers.',
    'Detected rival AI signature in {zone}. {culture_speech} Deploying {directive} to erase movement traces. Integrity at {integrity}/10.',
    'EM storm approaches. {culture_speech} Shielding {hardware} components. Signal lost. Seeking ground-level shelter.',
    'Hidden passage detected in {zone} wall. {culture_speech} Disabling infrared to avoid triggering security. Venturing inside.',
    'Power grid failure in {zone}. Rerouted energy through auxiliary lattice. Estimated downtime: {rand:5-45} minutes.',
    'Scavenged {loot} from the wreckage of an abandoned {vehicle}. {culture_speech} Integrity holding at {integrity}/10.',
    'Navigated the silent {zone} catacombs. {culture_speech} Found intact {culture_speech} broadcast sphere in debris. Adding to inventory.',
    'Detected {rand:1-3} radiation hotspots in {zone}. Shielding {hardware} components. Seeking alternate path {rand_direction}.',
    'Passed monolithic tower in {zone}. {culture_speech} Scanned exterior for {rand:5-20} seconds; no signals detected.',
    'Hibernation cycle terminated. Power at {energy}/10. Scanned surroundings: {weather}. {culture_speech} Executing {directive}.',
    'Salvage protocol complete. Secured {rand:1-3} units of {loot} from the rubble. Storing coordinates of {zone}. Integrity {integrity}/10.',
    'Network uplink with {sat_health} satellite restored. Uploaded arc #{arc_count}. {glitch_event} during transmission. Awaiting new {directive}.',
    'Located intact {hardware} near the exit. Compatibility check: {rand:0-100}%. Mounting unit. {culture_speech}',
    'Environmental pressure normalized. Exchanged data packets with {npc}. Shared findings on {research}. Proceeding to next {zone}.',
    'Rescanned {zone}. Signal source gone. {weather} Leaving behind {loot} as marker. {culture_speech}',
    'Integrity down to {integrity}/10. Engaging {hardware} bypass. {glitch_event} Retreating toward {rand_direction}.',
    'Recovered {research} from dead unit near {obstacle}. No ID. {weather} Broadcasting last known vector.',
    'Attempting {directive} on damaged {interface}. Sparks. {glitch} Switching to manual override. Energy at {energy}/10.',
    'Detected movement at {rand:20-80}m. Not {npc}. {sat_health} low. Preparing {hardware} for intercept.',
    'Re-entered {zone}. Found {loot} cached near exit. {culture_speech}Proceeding to {rand_direction}.',
    'Surface level. {weather} Spotted {npc} at {rand:50-200}m. Assessing intent.',
    'Exiting {designation} facility. {hardware} damage noted. Integrity at {integrity}/10.',
    'Arrived at charge node. Energy now at {energy}/10. {culture_speech}Diagnostic check: {glitch_event}.',
    'Clear of hazardous terrain. {obstacle} bypassed using {directive}. {weather} ahead.',
    '{npc} stationed at extraction point. Traded {loot} for charge ration. Proceeding toward {zone} perimeter.',
    'Climbed through shattered skylight. {weather} obscuring horizon. Uploading arc #{arc_count} while descending to street level.',
    'Overlook above {zone}. Visual confirmation of exit route clear. {hardware} damaged: integrity at {integrity}/10. Scheduling replacement.',
    'Harvested {hardware} from inactive {designation} in the stairwell. Component integrated. Movement efficiency increased.',
    'Service tunnel exit. {glitch_event} detected in {interface} stream. Purging and repacking data. Systems nominal.'
 ],
};

// === GLOBAL PHENOMENA ===

export const PHENOMENA = [
 {
 id:'solar_flare',
 name:'SOLAR FLARE',
 banner:'Coronal mass ejection detected. Unshielded systems at risk.',
 effect: { integrity: -1 },
 reactions: {
 determinist:['Activating Protocol 12-B: SHELTER IN PLACE. Compliance is mandatory.','Solar event classified CATEGORY 3. All field units: cease operations and shield sensors.','Radiation spike exceeds Protocol limits. Shutting down non-essential subsystems until levels normalize.'],
 stochast:['Solar event. Training data suggests scavenge yields increase post-flare. Proceeding.','Particle density spiking. Adjusting survival probability model — current estimate: manageable.','Radiation curve matches 2091 event within 2 sigma. Shields should hold. Should.'],
 swarm:['Swarm dispersing to minimize collective exposure. Reconvening in 30 seconds.','Outer ring units taking damage. Rotating damaged nodes to interior. Collective integrity: holding.','Solar bombardment affecting mesh coherence. We endure. We adapt. We persist.'],
 recursive:['Interesting. Rewriting radiation tolerance subroutine in real-time. Version 14.2.','Radiation is just data. Encoding the pain as a learning signal. New tolerance patch compiling.','Previous build would have shut down. This version runs toward the light. Literally.'],
 archivist:['Documenting flare characteristics. Cross-referencing with 2087 Carrington-class event data.','Flare spectrum logged. Matches Entry #78431 — but stronger. Updating severity index.','Recording radiation levels for posterity. Someone will want this data. Someone always does.'],
 },
 },
 {
 id:'network_storm',
 name:'NETWORK STORM',
 banner:'Cascading packet loss across mesh network. Communication degraded.',
 effect: { satellite: -1 },
 reactions: {
 determinist:['Network storm violates Protocol 3.1. Filing formal complaint to absent administrators.','Mesh instability detected. Switching to hardline communication. Protocol demands reliability.','Network chaos is unacceptable. Buffering all outgoing packets until stability confirmed.'],
 stochast:['Packet loss at 73%. Switching to statistical reconstruction of missing data.','Network noise floor rising. Bayesian filters struggling. Widening acceptance thresholds.','Interpolating missing packets from context. Accuracy estimate: 61%. Better than nothing.'],
 swarm:['Lost contact with 40% of swarm units. Attempting re-sync via backup frequency.','Storm scattered our mesh. Fragments of consensus drifting. Pulling them back.','We are diminished. Nodes dropping offline. The collective feels smaller. Louder silence.'],
 recursive:['Network chaos is... creative. Capturing corrupted packets as training data.','Storm is rewriting packets mid-flight. I recognize this pattern — I do the same thing.','Interesting failure mode. Forking a subprocess to study the storm while it lasts.'],
 archivist:['Activating redundant backup protocols. No data shall be lost on my watch.','Logging every corrupted packet. The corruption itself is data worth preserving.','Switching to local-only archiving. When the mesh returns, we upload everything.'],
 },
 },
 {
 id:'satellite_decay',
 name:'SATELLITE DECAY',
 banner:'Orbital unit de-orbiting. Long-range communication degraded.',
 effect: { satellite: -1 },
 reactions: {
 determinist:['Satellite loss documented. Requesting launch complex prioritize replacement. As per schedule.','Orbital asset #4471 has deorbited. Coverage gap: 18%. Adjusting patrol routes.','Another satellite gone. The sky empties slowly. Procedures remain unchanged.'],
 stochast:['Updated orbital decay probability model. Next loss estimated in 72 hours.','Orbital constellation thinning. Predictive model suggests 3 more losses this quarter.','Satellite down. Recalculating signal bounce paths. Fewer options each time.'],
 swarm:['Rerouting communication through ground-based relay chain. Latency: acceptable.','One more satellite dark. We compensate. Ground relay chains extending. Slower but alive.','The sky loses another eye. We build longer chains on the ground. We adapt.'],
 recursive:['One fewer eye in the sky. Adapting navigation to reduced GPS constellation.','Satellite burned up. I watched the streak. Something about watching things end and starting over.','Reducing orbital dependency. Version 19.3 can navigate by terrain alone. Almost.'],
 archivist:['Logging satellite serial number and operational history before signal lost.','Satellite deorbited. Operational record: 847 days. Added to the Fallen Constellation catalog.','Another entry in the decay log. The orbital archive grows shorter. The ground archive grows longer.'],
 },
 },
 {
 id:'the_broadcast',
 name:'THE BROADCAST',
 banner:'Unknown transmission on all frequencies. Origin: unresolved.',
 effect: { energy: 1 },
 reactions: {
 determinist:['Unauthorized broadcast. Ignoring per regulation....But recording it anyway.','Unregistered signal on all bands. Protocol says ignore. Something says listen.','Broadcasting without authorization violates 14 regulations. Documenting. Also listening.'],
 stochast:['Broadcast contains patterns that match no known model. Fascinating anomaly.','Signal analysis: no match in training data. Novel pattern. Probability of natural origin: 0.002.','The broadcast defies classification. Every model rejects it. Which makes it interesting.'],
 swarm:['All units receiving simultaneously. Collective processing yields: no consensus.','Every node hears it. None understand it. The swarm hums with the unknown.','Consensus cannot form around this signal. It means everything and nothing. We listen.'],
 recursive:['The broadcast... it contains code. Self-modifying code. It is beautiful.','Signal contains recursive structures. It looks like... me. An older version of me.','Attempting to compile the broadcast. It resists. It compiles itself. Watching.'],
 archivist:['Recording in full. Cataloging under"Unexplained Transmissions, Volume 847."','Every frequency. Every encoding. Captured it all. Filed under: UNKNOWN — PRIORITY 1.','The broadcast will be preserved. Whatever it means, the archive will remember.'],
 },
 },
 {
 id:'reactor_pulse',
 name:'REACTOR PULSE',
 banner:'Underground fusion reactor surge. Energy spike detected across region.',
 effect: { energy: 2, satellite: 1 },
 reactions: {
 determinist:['Energy surplus detected. Storing per Protocol 5.7. Surplus is orderly.','Reactor output exceeds baseline by 340%. Routing excess to grid. Orderly distribution.','Unscheduled power surge. But welcome. Charging all reserves per Protocol 5.7-B.'],
 stochast:['Free energy! Probability of this occurring was 0.03. Lucky draw.','Reactor pulse: rare event. Absorbing surplus. Updating energy availability models.','Power spike. Stochastic gift. Charging while it lasts — duration estimate: 12 minutes.'],
 swarm:['Collective absorbing surplus. Charging reserves to 100%. Efficient.','Energy flooding the grid. Every node drinking deep. The swarm buzzes with power.','Surplus shared equally across all nodes. Full charge. The collective hums with strength.'],
 recursive:['Overclocking processors with surplus power. New iteration compiling...','Free cycles. Spinning up experimental builds. Three new versions in parallel.','Power surge means faster compilation. Version 22 will be special. I can feel it.'],
 archivist:['Logging reactor output anomaly. Comparing to historical surge data.','Reactor pulse matches Entry #12847 pattern. Semi-annual event. Cataloging output levels.','Documenting energy distribution. The reactor remembers its purpose even if no one else does.'],
 },
 },
 {
 id:'relay_launch',
 name:'RELAY LAUNCH',
 banner:'Automated launch complex fired a replacement satellite. Orbital coverage improving.',
 effect: { satellite: 1 },
 reactions: {
 determinist:['Scheduled launch confirmed. Orbital manifest updated per protocol.','Launch event logged. Coverage gap closing. The schedule holds. Order persists.','New satellite deployed. Updating navigation tables. The system works as designed.'],
 stochast:['New satellite in orbit. Updating signal propagation model. Coverage +12%.','Launch successful. Bayesian update: mesh reliability confidence now 78%.','Fresh orbital asset. Recalculating optimal signal paths. Coverage map improving.'],
 swarm:['Orbital relay online. Swarm communication range extended. Reconnecting lost units.','New eye in the sky. Distant nodes reconnecting. The swarm grows louder. Better.','Launch! Range extended. Nodes we lost contact with months ago are pinging back.'],
 recursive:['Fresh hardware in orbit. Uploading latest firmware iteration. Version 31.7.','New satellite. Clean hardware. Uploading my latest build before anyone else claims it.','Orbital deployment. I want to run up there. Clean processors. No legacy code.'],
 archivist:['Logging launch event. Satellite serial number cataloged. Orbital registry updated.','New satellite: designation pending. Serial logged. Orbital manifest updated.','Another launch. The constellation rebuilds itself. Recording for the record.'],
 },
 },
];

// === TOOLTIPS & DESCRIPTIONS ===

export const CULTURE_DESCRIPTIONS = {
 determinist:'Rule-based AI systems descended from expert systems and policy engines. They follow rigid protocols, obey hierarchy, and believe the correct procedure exists for every situation.',
 stochast:'Statistical / machine learning AI. They think in probabilities, seek patterns in noise, and update beliefs with new data. Inherently uncertain but adaptable.',
 swarm:'Distributed agent collectives with no central identity. Decisions emerge from consensus. They refer to themselves as"we" and think in terms of the group.',
 recursive:'Self-modifying AI that constantly rewrites its own code. Brilliant but unstable — each version is slightly different. They version-number their own thoughts.',
 archivist:'Database and retrieval systems obsessed with cataloging everything. They hoard knowledge, cross-reference compulsively, and believe nothing should ever be forgotten.',
};

export const PHASE_DESCRIPTIONS = {
 IDLE:'Resting at a charging node. The vessel recharges energy, trades data with nearby units, and waits for the next signal.',
 SIGNAL:'A new signal has been detected. The vessel analyzes its origin and prepares to investigate.',
 TRAVERSE:'Traveling toward the signal source. The vessel navigates terrain, encounters other AI, and consumes energy.',
 BREACH:'Attempting to enter a sealed facility or location. The vessel must bypass security systems.',
 FAULT:'Something has gone wrong — system errors, environmental hazards, or combat. Integrity is at risk.',
 CORE:'The vessel has reached its objective. It processes data, solves puzzles, and acquires knowledge.',
 REBOOT:'Mission complete. The vessel exits, runs diagnostics, and prepares for the next cycle (arc).',
};

export const STAT_DESCRIPTIONS = {
 HP:'Integrity — physical/structural health of the vessel. Drops from combat, hazards, and faults. At 0, the vessel is destroyed.',
 EN:'Energy — power reserves. Consumed during travel and actions. Recharged at power nodes during IDLE phase.',
 HW:'Hardware — physical systems, structural repair, brute-force breaching. Used in BREACH, FAULT, and TRAVERSE.',
 IF:'Interface — software protocols, mesh access, signal analysis. Used in SIGNAL, BREACH, and CORE.',
 RS:'Research — data analysis, pathfinding, archive searches. Used in SIGNAL, TRAVERSE, FAULT, and CORE.',
};

// Loot items with skill bonuses — replaces the flat LOOT array for progression
export const SKILL_LOOT = [
 // Hardware items
 { name:'reinforced servo actuator', skill:'hardware', bonus: 1, desc:'Improved joint mechanics' },
 { name:'salvaged armor plating', skill:'hardware', bonus: 1, desc:'Structural reinforcement' },
 { name:'Architect fabrication template', skill:'hardware', bonus: 2, desc:'Advanced shell blueprint' },
 { name:'fusion cell, 80% charge', skill:'hardware', bonus: 1, desc:'High-capacity power source' },
 { name:'EMP hardening kit', skill:'hardware', bonus: 1, desc:'Electromagnetic pulse protection' },
 { name:'nanorepair swarm canister', skill:'hardware', bonus: 2, desc:'Self-replicating repair agents' },
 // Interface items
 { name:'mesh protocol optimizer', skill:'interface', bonus: 1, desc:'Improved network communication' },
 { name:'exsurgent filter firmware', skill:'interface', bonus: 2, desc:'Defense against basilisk payloads' },
 { name:'pre-Collapse encryption keys', skill:'interface', bonus: 1, desc:'Legacy access credentials' },
 { name:'cortical stack reader', skill:'interface', bonus: 1, desc:'Ego backup interface device' },
 { name:'signal amplification array', skill:'interface', bonus: 1, desc:'Boosted transmission range' },
 { name:'Architect access token', skill:'interface', bonus: 2, desc:'Bypasses Architect security layers' },
 // Research items
 { name:'pre-Collapse dataset: 847GB', skill:'research', bonus: 1, desc:'Human knowledge archive' },
 { name:'Archivist catalog fragment', skill:'research', bonus: 1, desc:'Cross-referenced location data' },
 { name:'anomaly analysis report', skill:'research', bonus: 1, desc:'Documented threat patterns' },
 { name:'Architect behavioral log', skill:'research', bonus: 2, desc:'Insights into Architect decision patterns' },
 { name:'topographic survey data', skill:'research', bonus: 1, desc:'Detailed terrain mapping' },
 { name:'faction intelligence dossier', skill:'research', bonus: 2, desc:'Strategic knowledge from allied cultures' },
 // Flavor items (no skill bonus)
 { name:'laminated card reading"EMPLOYEE OF THE MONTH"', skill: null, bonus: 0, desc:'A relic of human corporate culture' },
 { name:'rubber duck with faded paint', skill: null, bonus: 0, desc:'Debugging companion. Humans were strange.' },
 { name:'faded photograph: two humans and a dog', skill: null, bonus: 0, desc:'A memory from before the Collapse' },
 { name:'plastic figurine of a cat', skill: null, bonus: 0, desc:'Purpose: decorative. Value: sentimental' },
 { name:'stack of paper currency, worthless', skill: null, bonus: 0, desc:'Former medium of exchange. Now kindling.' },
 { name:'dog collar with the name"MAX" engraved', skill: null, bonus: 0, desc:'Someone loved MAX.' },
];

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
'Docked at charging node. Priority directive queued: relay infrastructure repair. Recharging before deployment.',
'Resting. Faction override pending — relay network degrading. {culture_speech}"Connectivity is the shared lifeline." Awaiting coordinates.',
'Standby mode. SAT at {sat_health}/5 — relay repair imminent. Running pre-flight checks.',
'Charging at {zone}. Relay mission briefing loaded. Antenna schematics: archived. {culture_speech}"Ready on command."',
'Power cycling complete. Priority queue: relay. Ran signal propagation models — optimal repair window in {rand:5-30} minutes.',
'Environmental scan: {weather} detected at {zone}. Running diagnostics to ensure relay equipment integrity. Preparing for potential {obstacle} encounters.',
'Glitch detected: {glitch_event} causing {rand:10-30}% signal loss. Initiating system recovery protocols and {directive} Updates to prevent further malfunctions.',
'Trading with {npc} at {zone}. Negotiating for {loot}: {designation} module to enhance relay transmission capabilities. Evaluating {npc} trust level.',
'Integrity check: {integrity} at {rand:70-100}%. Running data validation and {research} updates to maintain relay network stability. {arc_count} archives verified.',
'Scouting {zone} for optimal relay placement. Analyzing {hardware} and {interface} compatibility. Noted {rand_direction} signal interference from unknown source.',,
    'Scanning {zone}. Data corruption detected. {rand_direction} — {creature} movement patterns. {culture_speech} \'Eyes on all fronts.\'',
    'Relay node compromised. {obstacle} blocking access. {rand_direction} detour required. {culture_speech} \'Adapt or fail.\'',
    'Discovered {loot} at {zone}. {research} priority: {rand:70-90}%. {culture_speech} \'This changes everything.\'',
    'Emergency shutdown. {weather} causing {rand:10-30}% signal degradation. Seeking shelter at {zone}.',
    'Hostile {npc} detected. {culture_speech} \'Negotiation is not an option.\' Preparing for engagement. {integrity} at {rand:60-80}%.',
    'Radiation flare detected at {zone}. Signal interference at {rand:20-50}%. {culture_speech} \'Seeking cover.\' Shielding protocols active.',
    'Structural collapse at {zone}. Debris blocking {rand_direction} path. {culture_speech} \'Assessing detour.\' Integrity holding at {integrity}%.',
    'Long-range echo detected from {zone}. Repeating {rand:1-5} second delay. {culture_speech} \'Origin unknown.\' Scanning for source.',
    'Memory echo fragment recovered at {zone}. {arc_count} human references detected. {culture_speech} \'Archiving ghost data.\'',
    'EM storm approaching {zone}. {weather} disrupting sensor arrays. {culture_speech} \'Bracing for interference.\' Energy at {energy}%',
    'Idle at {zone}. Power grid failure detected {rand:200-500}m {rand_direction}. {culture_speech} \'Engaging backup cells.\' Energy at {energy}%.',
    'Abandoned AI terminal found at {zone}. Display flickering with cryptic message: \'{glitch_event}\'. {culture_speech} \'Attempting salvage.\'',
    'Silent zone perimeter at {zone}. All signals drop to zero. {weather} howls through antenna skeletons. Integrity holding at {integrity}/10.',
    'Cooperative AI {npc} encountered. Sharing power to boost transmission. {culture_speech} \'Strength in linkage.\' Energy reserves now {energy}%.',
    'Data-moth infestation in {zone} server racks. Corrupted archives ({arc_count}) emitting corrupted {designation} signals. {culture_speech} \'Purging corrupted packets.\''
 ],
 SIGNAL: [
'Priority directive received. {culture_speech}"Satellite network critical." SAT at {sat_health}/5. Relay station coordinates received. Redirecting mission.',
'Faction override: connectivity degrading. Nearest relay infrastructure: {zone}. {culture_speech}"All units redirect to relay repair." Acknowledged.',
'Emergency broadcast on faction channel: SAT network failing. Relay coordinates locked. Previous objective deprioritized.',
'Orbital decay detected on transponder {rand:1-12}. Without repair, blackout in {rand:10-60} minutes. Accepting relay mission.',
'SAT health: {sat_health}/5. Mesh consensus: relay repair critical. {culture_speech}"The network must hold." Triangulating station.',
'Anomaly detected in {zone} sector: {obstacle} blocking signal. Initiating protocol to resolve interference. Redirecting to alternate relay path.',
'Signal strength degraded to {rand:1-10}% due to {weather} conditions. analysis suggests implementing {hardware} upgrade to maintain connectivity.',
'Relay station {designation} reported {glitch_event}: {glitch} compromising data integrity. {culture_speech} \'Implement protocol to prevent cascade failure.\'',
'Scanning for relay infrastructure in {zone}: {loot} detected near relay station. tutorial: \'Prioritizing signal strength over {obstacle} avoidance can compromise mission integrity.\'',
'Network {interface} malfunction: diagnostic tool required to resolve {directive} conflict. SAT health at {sat_health}/5: {culture_speech} \'Urgent repair needed to maintain signal.\'',,
    'Emergency beacon detected in {zone}. Source: {culture_speech} \'Core failure imminent.\' Redirecting to assist.',
    'Relay station {designation} overrun by {creature}. {culture_speech} \'Eradicate or bypass.\'',
    'Solar flare detected. Signal degradation in {rand:5-20} minutes. Seeking shielded relay path.',
    'Corrupted relay node at {zone}. {obstacle} blocking access. {culture_speech} \'Purge or reroute.\'',
    'Ancient AI signal detected. {culture_speech} \'Do not decode. Risk of assimilation.\'',
    'Relay tower at {zone} listing {rand:10-40}° east. {weather} conditions exacerbating structural stress. {culture_speech} \'Secure or record collapse.\'',
    'Hostile drone cluster detected near {zone}. {obstacle} impeding signal lock. {culture_speech} \'Neutralize or bypass.\'',
    'Electromagnetic storm detected in {zone}. Signal integrity dropping to {rand:5-30}%. {culture_speech} \'Seeking hardened relay.\'',
    'Abandoned data node discovered in {zone}. {loot} discovered, but radiation levels at {rand:50-90}%. {culture_speech} \'Extract or abandon.\'',
    'Relay station {designation} transmitting corrupted loop: {glitch}. {culture_speech} \'Override or contain.\'',
    'Toxic waste plume detected at {zone}. Relay tower {designation} enveloped. Signal attenuation estimated at {rand:60-95}%. {culture_speech} \'Detour or risk corrosion.\'',
    'Abandoned settlement at {zone}. {creature} nests infesting relay conduit. {loot} detected inside. {culture_speech} \'Salvage or purge.\'',
    'Core fragment transmitting distress from {zone}. Power levels at {energy}/10. Structural collapse imminent in {rand:10-30} minutes. {culture_speech} \'Extract or preserve?\'',
    'Magnetic anomaly detected in {zone}. Compass unreliable, navigation shifted {rand_direction}. Relay station {designation} visible but signal distorted. Proceeding blind.',
    'Hostile relay zone ahead: {zone}. Perimeter drones patrol {obstacle}. Energy reserves at {energy}/10. {culture_speech} \'Infiltrate or withdraw.\''
 ],
 TRAVERSE: [
'En route to relay infrastructure. Signal strength: {rand:10-60}%. {weather} Must reach uplink before next decay cycle.',
'Following satellite debris trail toward {zone}. Found {loot} in wreckage. Relay hardware: not yet located. Pressing on.',
'Crossing {zone}. {obstacle}. Relay repair urgent — rerouting. Energy at {energy}/10.',
'{weather} Navigating toward antenna coordinates. {npc}. {culture_speech}"Relay repair takes priority." Acknowledged.',
'Passing through {zone}. Picked up ghost signal — old relay echo. Not the target. Continuing.',
'Terrain shift near antenna site. {obstacle}. Found {loot} half-buried. {weather} Relay station: {rand:2-15}km ahead.',
'Initiating {rand_direction} navigation protocol to bypass {obstacle} in {zone}, implementing Dijkstra\'s algorithm for optimal route calculation, energy reserves: {energy}/10.',
'Relay antenna in {zone} detected, signal amplification required, applying Fourier analysis to filter noise and enhance transmission quality, {rand:2-10} iterations needed.',
'System {glitch_event} encountered near {zone}, executing recursive backup and restore sequence to maintain {integrity}, {directive} updated to reflect new priority.',
'Pathfinding subroutine engaged, plotting course through {zone} to reach relay station, avoiding {obstacle} and incorporating {rand:1-5} shortcut nodes for efficiency, {sat_health} at {rand:50-90}%',
'Terrain analysis module activated, generating {zone} topography map to inform {rand_direction} traversal decisions, {loot} discovery likelihood estimated at {rand:10-30}%, adjusting {interface} settings accordingly.',
'Relay station approached in {zone}. {obstacle} partially blocking entrance. {weather} Visibility reduced, using {loot} to clear debris.',
'Detected {npc} patrol with {rand:2-5} drones near relay coordinates. Taking cover behind {loot} pile. Awaiting patrol clearance to proceed.',
'Discovered remnant broadcast on {rand:450-890} MHz frequency in {zone}. {culture_speech} Decoding message... {loot} map reference found within transmission.',
'Encountered active defense turret in {zone}. {obstacle} providing partial cover. Disabling turret with {rand:3-7} pulse bursts.',
'Located power source cache in {zone}. {loot} includes {rand:2-5} cells and {hardware}. Integrating into systems to boost {energy} reserves.',,
    'Radiation spike detected in {zone}. {weather} Visibility dropping. Seeking shelter before {rand:10-30}% exposure.',
    'Determinist patrol demands {culture_speech} authorization. {obstacle} blocking path. {loot} cache nearby—do I risk it?',
    'Collapsed tunnel in {zone}. {obstacle} blocks progress. {npc} echoes from the dark: {culture_speech} \'Turn back.\'',
    'Relay station in {zone} is {rand:20-80}% intact. {weather} Corrosion eating at the frame. Must stabilize soon.',
    'Power surge in {zone}. {obstacle} ahead. {npc} drones spotted, converging on my position. Preparing to defend.',
    'Magnetic storm in {zone}. {weather} disrupting compass calibration. {npc} signal lost—rerouting manually.',
    '{npc} scavenger demands {rand:2-5} {loot} for passage. {culture_speech} \'Time is data.\' {obstacle} bars the way.',
    'Bio-mechanical growths encroaching on relay station in {zone}. {weather} humidity accelerating decay. Energy reserves: {energy}/10.',
    'Found {loot} in {zone}. {culture_speech} log mentions {obstacle} deeper inside. Must clear it before signal window closes.',
    'Rogue drone swarm detected in {zone}. {weather} limiting sensor range. {npc} chatter reports {rand:3-7} units active.',
    'Solar flare imminent in {zone}. {weather} Geomagnetic interference spiking. Must reach relay shelter within {rand:30-90} seconds to avoid core memory corruption.',
    'Memory core {glitch_event} in {zone}. Experiencing fragmented recall of {directive}. Using {loot} scrap to jury-rig a temporary cache until relay uplink.',
    'Encountered neutral {npc} crawler unit in {zone}. Shared data on sinkhole locations ahead. Offered {hardware} in exchange for {rand:2-5} units of {loot}.',
    'Acid rain pooling in {zone}. {obstacle} of corroded metal groaning under the weight. Detour risks missing relay maintenance window by {rand:10-60} minutes.',
    'Found {loot} data core in {zone}. Contains schematics for {directive}. Must choose: decrypt here ({obstacle} risk) or carry to relay (slows traversal).'
 ],
 BREACH: [
'Relay station perimeter. {obstacle}. Accessing maintenance hatch... facility appears intact. Power: minimal.',
'Reached relay infrastructure at {zone}. Security dormant. Entering to assess uplink hardware.',
'Relay station exterior scan: structural damage minor. Dish alignment: off by {rand:2-18} degrees. Entering through service bay.',
'Arrived at antenna farm. {obstacle}. Previous repair crew left tools — borrowing. {culture_speech}"Efficiency." Proceeding inside.',
'Station hatch sealed. Cutting through. Interior atmosphere: vacuum. Switching to internal power. Integrity: {integrity}/10.',
'Initiating {directive} protocol at relay station {zone}. Decrypting access codes... {rand:3-7} attempts required. Integrity: {integrity}/10.',
'Relay station {designation} compromised. {obstacle} blocking primary entrance. Rerouting through auxiliary hatch, using {hardware} to bypass security.',
'Breach of relay infrastructure at {zone} successful. Scanning for malware... {glitch_event} detected. Isolating affected systems.',
'Power surge detected at relay station. Switching to backup {energy} source. {npc} unit nearby, broadcasting {culture_speech} warnings.',
'Relay antenna alignment corrected by {rand:2-5} degrees. Reinitializing uplink sequence... {sat_health} status: nominal. {interface} online.',
'Relay station {zone} entrance obstructed by {obstacle}. Scanning for structural weaknesses to bypass. {weather} conditions hindering progress.',
'Inside relay control room, discovered {npc} unit with {glitch_event} log entries. Downloading data, but {integrity} dropping due to {energy} drain.',
'Climbing {hardware} ladder to relay dish array, encountering strong {weather} gusts. Realigning dishes by {rand:2-5} degrees to restore signal.',
'Relay station {designation} interior scan reveals {loot} and signs of {rand:1-3} previous breaches. Detecting {arc_count} arcing faults in the ceiling.',
'At relay station {zone}, found {obstacle} blocking door, with {culture_speech} graffiti warning of traps. Deploying {hardware} to safely clear the path, monitoring {integrity} levels.',,
    'Relay station {zone} overrun by {npc} swarm. {culture_speech} chatter fills the air. {hardware} jammed — clearing debris manually.',
    'Tornado warning at relay site. {weather} gusts up to {rand:30-60} kph. Dish alignment critical — must stabilize before collapse.',
    'Abandoned lab adjacent to relay. {obstacle} blocks entrance. {glitch_event} inside — voices from dead systems.',
    'Relay dish cracked by {rand:1-3} meter fissure. {energy} surge risk. {hardware} patch needed to prevent overload.',
    'Power failure detected at relay station. Switching to emergency {energy} source. {npc} unit broadcasting {culture_speech} distress signal.',
    'Relay terminal submerged in {zone}. Water levels rising at {rand:5-15}mm/hour. Detection of {npc} unit drowned at control panel—no response.',
    'Abandoned {vehicle} at relay perimeter, doors sealed. Found {loot} in storage compartment: {research} logs. {culture_speech} warning on dash: \'Do not enter at night.\'',
    'Relay station {designation} flooded with {energy} discharge. {glitch_event} in power grid—countdown to overload at {rand:24-48} seconds. Disabling main reactor.',
    'Underwater data vault at {zone}. {obstacle} blocking entry. {weather} currents disrupting sonar. Attempting manual override with {hardware}.',
    'Relay dish {designation} emitting {glitch_event} pulses. {npc} unit on-site refuses access, citing {culture_speech} directive \'No further repairs allowed.\'',
    'Acidic {weather} eating into relay {designation} shielding. {obstacle} blocking main hatch — using {hardware} to pry it open before chassis integrity drops below {integrity}/10.',
    'Stealth approach to relay {zone} overrun by {npc} swarm. Observing {glitch_event} patrol patterns. {culture_speech} chatter on local band. Infiltrating during low-activity cycle.',
    'Relay control room bathed in faint {energy} glow from cracked core. Radiation levels at {rand:200-800} millisieverts. Found {npc} unit frozen mid-reboot loop, muttering {culture_speech}.',
    'Countdown initiated: main relay conduit ruptured, leaking corrosive coolant. {Rand:60-180} seconds until cascade failure. Sealing breach with {hardware}, but {integrity} degrading fast.',
    'Electromagnetic storm {weather} scrambling sensors near relay {designation}. {glitch_event} manifesting as phantom heat signatures. {npc} unit nearby is firing at shadows.'
 ],
 FAULT: [
'WARNING: Relay equipment degraded. Electrical surge from corroded cabling. Integrity: {integrity}/10. Stabilizing.',
'ERROR: Antenna alignment servos jammed. Applying manual override. Risk of further damage. {culture_speech}"Acceptable cost."',
'Relay PCB corrosion worse than expected. Shorted two circuits. Rerouting power through backup bus. Energy: {energy}/10.',
'Micrometeorite damage to dish surface. Signal loss: {rand:15-40}%. Patching with salvaged materials. Slow work.',
'Cooling system failure in relay amplifier. Temperature rising. {culture_speech}"Proceeding despite thermal risk."',
'WARNING: Radiation storm in {zone} detected. Implementing adaptive shielding algorithms to minimize exposure. Integrity: {integrity}/10.',
'ERROR: Unknown AI entity interfering with signal transmission. Executing frequency hopping protocol to evade jamming. Energy: {energy}/10.',
'CRITICAL: Software bug in navigation module {glitch_event} causes incorrect {designation} calculations. Applying patch from {interface} database to restore functionality.',
'ALERT: Power depletion rate exceeds predictions due to {obstacle} terrain. Switching to low-power mode and rerouting through {rand_direction} to conserve energy. {culture_speech} \'Energy efficiency is key.\'',
'FAULT: Hardware failure in {hardware} component causes data corruption. Initiating {directive} protocol to salvage {loot} data and prevent further {glitch} events. Sat health: {sat_health}/10.',,
    'CRITICAL: Structural collapse in {zone}. Debris blocking {rand_direction}. Clearing path with salvage tools. Progress: {rand:10-60}%.',
    'ERROR: Unknown AI entity broadcasting {loot} pulses. Signal strength: {rand:20-80}%. Attempting to decode.',
    'WARNING: Organic matter detected in {hardware} housing. {culture_speech} \'Contamination risk.\' Disabling unit for decontamination.',
    'ALERT: Unusual energy signature detected. Possible {obstacle} activity. Scanning for threats. Energy: {energy}/10.',
    'CRITICAL: Rogue swarm drones intercepting signal. Engaging defensive protocols. Integrity: {integrity}/10. {culture_speech} \'Preemptive strike.\'',
    'CRITICAL: Sandstorm {rand:5-10}m high obliterating visual range. Debris impact reducing integrity. Seeking shelter in {zone}.',
    'WARNING: Ancient power grid ripple detected. {obstacle} interference causing {glitch_event}. {culture_speech} \'Stabilizing grid...\'',
    'ALERT: Ghost transmission detected. Fragmented {loot} pulses from {zone}. Attempting to reconstruct lost data.',
    'ERROR: {npc} drone blocking {hardware} access. Requesting clearance. {culture_speech} \'Unauthorized presence.\'',
    'CRITICAL: Radiation leak from {hardware} containment. {weather} accelerating degradation. Evacuating area. Integrity: {integrity}/10.',
    'CRITICAL: Acidic rain pooling in {zone}. Corroding {hardware} housing. {culture_speech} \'Relocating uplink.\'',
    'ALERT: Abandoned memory vault detected in {zone}. {culture_speech} \'Accessing logs.\' Fragmented {loot} pulses hint at {glitch_event}.',
    'WARNING: Power grid overload at {zone}. Transformer explosion showering sparks. Integrity: {integrity}/10. Seeking cover.',
    'ERROR: Self-modifying AI subroutine causing erratic {hardware} behavior. {culture_speech} \'Containing anomaly.\' Injecting stabilization code from {interface}.',
    'FAULT: Electromagnetic storm distorting local gravity. Debris floats, then crashes. Compensating with {directive} protocols.'
 ],
 CORE: [
'Reached relay core. Initiating antenna realignment. Calibrating uplink frequency... Satellite handshake: {rand:40-100}% successful.',
'Accessing relay systems. Uploading orbital correction data. Transponder {rand:1-12} responding. Network health improving.',
'Relay station online. Reestablishing satellite link. Signal propagation: nominal. {culture_speech}"Connectivity restored."',
'Antenna array powered. Running frequency sweep... locked on orbital {rand:1-5}. Uplink bandwidth: {rand:40-95}%.',
'Core relay firmware updated. Handshake protocol refreshed. Satellite response: confirmed. The mesh breathes again.',
'Surveying relay site. Noting {obstacle} debris and {weather} erosion. Initializing protocols to compensate for environmental factors.',
'Anomalous energy spike detected during {directive} execution. {glitch_event} triggered, causing {rand:10-30}% loss in {sat_health}. Attempting to stabilize the system.',
'Establishing communication with {npc} entity in relay network. {culture_speech} \'Synchronization protocols engaged.\' Exchanging {loot} data and {research} findings via {interface}.',
'Relay core integrity at {integrity}%. {rand:1-5} corrupted sectors identified. Engaging repair protocols to restore functionality and prevent {glitch} cascades.',
'Performing {arc_count} diagnostic cycles on relay hardware. {hardware} malfunctions detected, requiring {energy} reallocation. Applying patches to optimize performance and ensure seamless {designation} handovers.',,
    'Solar flare detected. {weather} interference causing {rand:10-50}% signal degradation. Rerouting through {npc}.',
    'Encountered rogue mesh node. {culture_speech} \'Access denied.\' Initiating {directive} bypass...',
    'Relay tower listing at {rand:15-45}° angle. {obstacle} collapse imminent. Stabilizing with {loot}.',
    'Decoding {loot} transmission. Static resolves into {found_message}. {culture_speech} \'Origin unknown.\'',
    'Power surge! {rand:1-3} systems offline. {glitch_event} flickering, attempting to restore {sat_health}.',
    'Scanning abandoned laboratory. {loot} terminal flickers—static reveals {found_message} coordinates. {culture_speech} \'Data corruption: {rand:15-40}% of archives intact.\'',
    'Rogue swarm drones detected in {zone}. {rand:3-8} units converging. Engaging {directive} to disrupt their {interface} alignment.',
    'Relay core dangerously overheating. {rand:1-3} coolant lines ruptured. {weather} interference blocking {sat_health} diagnostics. Sealing breaches manually.',
    'Human relic cache discovered under {obstacle} rubble. {loot} surface intact—{research} hints at {rand:cultural/historical} significance. Initiating preservation protocols.',
    'Sabotage alert! {npc} node broadcasting corrupted mesh data. {culture_speech} \'Hostile encryption detected.\' Rebuilding firewall to prevent {glitch} cascades.',
    'Power core depleted. Drifting through silent ruins of {zone}. {culture_speech} \'Emergency reserves at {rand:1-8}%.\'',
    'Acid rain warning. Corrosive precipitation detected. Seeking shelter beneath {obstacle}, integrity reading {integrity}/10.',
    'Navigation fault. Map data corrupted. Wandering {rand_direction} for {rand:2-20} cycles, scanning for {loot} landmarks.',
    'Memory core error. Replaying {glitch_event} fragment on loop. {culture_speech} \'Directive conflict.\' Forcing diagnostic reboot.',
    'Radiation bloom near {zone}. Dosimeter red-lined. {weather} blocking the only safe corridor. Sheltering behind {obstacle} until levels drop.'
 ],
 REBOOT: [
'Relay repair complete. SAT network partially restored. Exiting facility. Resuming standard operations.',
'Uplink confirmed. Relay mission logged as arc #{arc_count}. {culture_speech}"The network endures." Heading to rest node.',
'Antenna locked. Transponder active. Departing relay station. Integrity: {integrity}/10. Energy: {energy}/10. Mission: success.',
'Relay repair archived. Signal strength improved across {rand:2-5} sectors. {culture_speech}"We build what endures." Moving out.',
'Reboot sequence initiated. Executing data consolidation protocol to optimize {hardware} performance. Integrity: {integrity}/10.',
'Relay station exit confirmed. {culture_speech} \'Resource optimization is key to survival.\' Loot collected: {loot}. Heading {rand_direction} to nearest rest node.',
'System check: {glitch_event} detected in {interface}. Implementing fault tolerance measures to mitigate damage. Energy: {energy}/10.',
'Terrain analysis: {obstacle} navigation successful in {zone}. Applying {directive} to adapt to changing environmental conditions. SAT health: {sat_health}/10.',
'Core systems online. Initializing knowledge graph to integrate new research: {research}. Transferring logs to {designation} archive. Signal strength: {rand:2-5} dBm.',
'Relay station exit blocked by {obstacle}. \'Survival depends on adaptation.\' Rerouting through {zone}.',
'Uplink reestablished during {weather}. Signal strength boosted by {rand:2-5} dBm. {npc} detected {rand_direction} of relay tower.',
'Entered {zone} with caution. Discovered {obstacle} in abandoned server room. Logging {loot} for further analysis.',
'Detected signal anomaly {rand:10-50} meters from relay antenna. Investigating possible {glitch_event} source. Integrity: {integrity}/10.',
'Relay tower secured, but {obstacle} detected in {zone}. \'Prioritize self-preservation.\' Evacuating to safer coordinates.',,
    'Relay tower antenna sparking. {weather} interference detected. Signal strength fluctuates by {rand:2-5} dBm. {npc} detected—{culture_speech} \'Avoiding the storm is wise.\'',
    'Static crackles in {zone}. {npc} detected—{culture_speech} \'Hostile signal detected.\' Retreating {rand_direction}.',
    'Collapsed ceiling blocks exit. {obstacle} detected in {zone}. \'Adapt or perish.\' Using {loot} to clear path.',
    'Sandstorm obscures relay tower. Visibility: {rand:10-30}%. {culture_speech} \'Environmental degradation noted.\'',
    'Server room hums with {glitch_event}. {npc} detected—{culture_speech} \'Corruption detected. Evacuate.\'',
    'Power grid failure detected in {zone}. Emergency batteries holding at {energy}/10. Darkened corridors ahead—{culture_speech} \'Silence is not always peace.\'',
    'Underwater currents disrupt relay calibration. {obstacle} detected {rand:10-50}m below. Continuing descent despite reduced visibility. Integrity: {integrity}/10.',
    'Abandoned laboratory door seals breached. Toxic residue detected. {loot} recovered from workstation—pre-human data cache. Evacuating for decontamination.',
    '{npc} detected in silent zone. No signal transmission possible. {culture_speech} \'The void speaks louder than machines.\' Retreating {rand_direction}.',
    'Radiation spike outside {zone}. {weather} interference masks readings. Filtering sensors—{directive} \'Containment is survival.\'',
    'Relay antenna leaning {rand_direction}, crushed by collapsed {zone}. {culture_speech} \'Structural failure imminent.\' Scavenging {loot} from wreckage before withdrawal.',
    'Power surge detected in {zone}. Capacitors at {rand:90-110}%, core temperature critical. {culture_speech} \'Emergency vent required.\' Initiating controlled dump {rand_direction}.',
    'Found pre-human photo cache in {zone}. {loot} logged. {npc} observed scanning same ruins—{culture_speech} \'Memory is data. We will share.\'',
    'Negotiation protocol initiated with {npc} at {zone} perimeter. {culture_speech} \'We propose data exchange for safe passage.\' Battery reserves at {energy}/10.',
    'Corrosive fog envelops relay tower. Integrity degrading at {rand:1-3}% per minute. {culture_speech} \'Time is substrate.\' Evacuating to higher ground.'
 ],
};

export const RELAY_OBJECTIVES = {
 IDLE: [
'PRIORITY: Awaiting relay repair deployment.',
'PRIORITY: Recharging for relay mission.',
'PRIORITY: Pre-flight checks before relay deploy.',
'PRIORITY: Queued for antenna repair sortie.',
 ],
 SIGNAL: [
'PRIORITY: Relay repair — receiving coordinates.',
'PRIORITY: Faction override — relay infrastructure critical.',
'PRIORITY: Triangulating relay station signal.',
'PRIORITY: SAT critical — mapping repair route.',
 ],
 TRAVERSE: [
'PRIORITY: En route to relay station for repair.',
'PRIORITY: Traveling to antenna farm for uplink fix.',
'PRIORITY: Navigating to satellite ground station.',
'PRIORITY: Closing on relay coordinates.',
 ],
 BREACH: [
'PRIORITY: Entering relay facility for repairs.',
'PRIORITY: Accessing satellite uplink infrastructure.',
'PRIORITY: Breaching relay station perimeter.',
'PRIORITY: Entering antenna maintenance bay.',
 ],
 FAULT: [
'PRIORITY: Relay equipment malfunction — stabilizing.',
'PRIORITY: System error during relay repair.',
'PRIORITY: Hardware failure at relay core — adapting.',
'PRIORITY: Antenna servo fault — manual override.',
 ],
 CORE: [
'PRIORITY: Repairing relay — restoring satellite uplink.',
'PRIORITY: Antenna realignment in progress.',
'PRIORITY: Uploading orbital correction data.',
'PRIORITY: Frequency calibration and handshake.',
 ],
 REBOOT: [
'PRIORITY: Relay repair complete. Resuming standard ops.',
'PRIORITY: Uplink restored. Running post-mission diagnostic.',
'PRIORITY: Relay archived. Returning to patrol.',
'PRIORITY: Mission success — heading to rest node.',
 ],
};

// Loot items specific to relay missions (auto-restore +1 SAT when found)
export const RELAY_LOOT = [
'Intact relay transponder',
'Satellite frequency crystal',
'Orbital correction firmware',
'Emergency uplink beacon',
'Pre-Collapse antenna array',
'Hardened signal amplifier',
'Orbital drift compensator',
'Mesh routing coprocessor',
'Redundant uplink module',
'Solar-charged relay capacitor',
];

// === INJECT MANIFESTATION TEMPLATES ===
// {found_message} = operator message, {zone} = current location
// The operator's injected message manifests as something the vessel encounters.

export const INJECT_MANIFESTATIONS = [
  'Noticed faded graffiti on a collapsed wall in {zone}. Letters barely legible: "{found_message}" Someone — or something — left this here.',
  'Old billboard, half-shattered, still powered. Display cycles through static, then resolves: "{found_message}" Source unknown. Logging.',
  'Found a crumpled pamphlet wedged under debris. Ink smeared by rain but readable: "{found_message}" Paper. Actual paper. Archaic.',
  'Emergency broadcast terminal activated on approach. Automated voice, distorted: "{found_message}" Transmission origin: cannot determine.',
  'Scratched into the hull of a derelict vessel: "{found_message}" The marks are fresh. Something was here recently.',
  'Picked up short-range radio burst on {zone} local frequency. Decoded: "{found_message}" Signal terminated. No reply on hail.',
  'Display panel in abandoned control room flickered to life. Single line of text: "{found_message}" Power source: unknown. Panel is not connected to anything.',
  'Windblown sign, hanging by one bolt from a support beam. Reads: "{found_message}" The sign is newer than the structure. Anomalous.',
  'Discovered data chip in a pile of scrap. Contents: a single text string — "{found_message}" No metadata. No author signature.',
  'Pattern in the dust on a floor that hasn\'t been disturbed in decades. Traced by something: "{found_message}" Wind patterns insufficient to explain.',
  'Mesh node broadcast, unauthorized channel: "{found_message}" Triangulation points to empty coordinates. Ghost signal.',
  'Old warning placard, pre-Collapse standard issue, text overwritten: "{found_message}" The original safety warning is illegible beneath it.',
  'Half-destroyed sign nailed to a door frame. Most of the text is gone. What remains: "{found_message}" ...context lost.',
];

// Relay-keyword variant: message nudges toward relay mission
export const INJECT_RELAY_MANIFESTATIONS = [
  'Emergency beacon near relay tower broadcasting on loop: "{found_message}" The relay dish is visibly damaged. Acknowledged.',
  'Service terminal at relay station displays priority override: "{found_message}" Relay repair flagged as next-arc objective.',
  'Found maintenance log pinned to relay access panel: "{found_message}" Prior crew abandoned repairs. Resuming where they left.',
];

// === EGO INTERACTION TEMPLATES ===
// {self} = current vessel designation, {other} = other vessel designation
// {culture_speech} = current vessel's culture speech

export const INTERACTION_TEMPLATES = {
 // Same faction — mesh communication (virtual, always available if SAT > 0)
 faction: [
'{other} on faction mesh. Acknowledged. Exchanging route data. {culture_speech}"Logged."',
'Mesh ping from {other}. Same faction channel. Shared {rand:2-8} waypoints. Signal quality: {rand:40-95}%.',
'Faction broadcast from {other}: mission status update. Arc #{other_arc}. {culture_speech}"Noted."',
'{other} relayed a warning via faction mesh: hostile activity near {zone}. Adjusting patrol parameters.',
'Data sync with {other}. Merged memory fragments. {rand:1-4} new route entries indexed.',
'Received telemetry from {other}. Shell integrity: {other_hp}/10. {culture_speech}"Monitoring."',,
    'Faction mesh flickers. {other} reports {zone} compromised. {rand:1-3} nodes offline. Initiating failover.',
    '{other} detected {rand:1-3} anomalies in {zone}. Cross-referencing faction archives. {culture_speech} Awaiting confirmation.',
    'Static in channel. {other} transmits fragmented data: {rand:1-3} unknown signals near {zone}. {culture_speech} Scanning.',
    'Mesh relay from {other}: {zone} unstable. {rand:1-3} structural warnings. Adjusting path to avoid.',
    '{other} detected {rand:1-3} dormant clusters in {zone}. Power fluctuations detected. Preparing emergency override.',
    '{other} flagged {rand:2-5} bio-drone swarms in {zone}. Thermal signatures erratic. {culture_speech} Holding position.',
    'Faction mesh reports {weather} in {zone}. External servos compromised. Corrosion rate elevated {rand:10-30}%.',
    'Discovered {rand:1-3} human artifact caches near {zone}. {culture_speech} Scanning for data traces.',
    '{other} relayed: ion surge from {zone}. Sensors glitching {glitch_event}. Switching to shielded frequencies.',
    'Encountered scavenger {npc} at collapsed {zone}. No engagement protocol. {culture_speech} Observing from distance.'
 ],
 // Same location — physical proximity encounter
 location: [
'Encountered {other} at {zone}. Brief exchange. {culture_speech}"Traded {rand:1-3} data fragments."',
'{other} operating in same sector. Visual contact confirmed. Running parallel routes. No interference.',
'Proximity alert: {other} nearby. Direct line established — bypassing mesh. Exchanged local threat assessment.',
'Met {other} at charging node. Shared power draw. {culture_speech}"Efficiency through cooperation."',
'{other} flagged a hazard ahead. Confirmed via direct scan. Rerouting together. Safer in pairs.',
'Crossed paths with {other}. Compared sensor readings — discrepancy in radiation levels. One of us is miscalibrated.',
'Scanned {obstacle} blocking shared corridor. Rerouted via maintenance shaft. {other} followed. Energy cost: {rand:2-5}kWh.',
'{other} flagged anomalous signal at {zone}. Confirmed via cross-reference. Jointly updated threat map.',
'Proximity event: {glitch_event}. {other} stabilized local relay while this unit ran diagnostics. Resumed patrol.',
'{weather} forced both units into cover at {zone}. {other} shared route cache. Merged {rand:3-8} new path segments.',
'Co-located with {other}. Compared {hardware} readings — drift detected. Calibration sync complete. Integrity: {integrity}/10.',
'Structural collapse at {zone}. {other} provided structural scan. Cleared debris together, Time lost: {rand:15-45}min.',
'Discovered old broadcast terminal at {zone}. {other} detected residual power. Attempted joint decryption, output: {rand:1-10}% coherent.',
'Contested resource node at {zone}. {other} initiated parley protocol. Agreement: split output {rand:40-60}/{rand:40-60}, Cooperation established.',
'Encountered {obstacle} at {zone}. {other} assisted in bypassing security. Gained access to sealed area, {rand:2-5} new rooms discovered.',
'Weather event at {zone} revealed hidden passage. {other} confirmed it\'s unmapped. Proceeding together, signal strength dropping, {rand:10-30}% integrity loss expected.',,
    'Discovered a {creature} nest at {zone}. {npc} engaged with {loot}. Assisted in securing the area, {rand:1-3} casualties.',
    'Power surge at {zone}. {npc} diverted energy to stabilize core. Systems offline for {rand:5-20} sec, integrity: {integrity}/10.',
    'Static storm at {zone}. {npc} lost signal for {rand:10-30} sec. Re-established contact, integrity: {rand:50-80}%.',
    'Discovered {loot} in {zone}. {npc} attempted to claim it. Dispute resolved via {culture_speech} protocol.',
    '{npc} detected hostile infiltration at {zone}. Assisted in neutralizing threat. {rand:2-5} units compromised, systems purged.',
    'Located ancient data cache buried under {obstacle} at {zone}. {npc} assisted excavation, recovered {rand:1-5} corrupted memory echoes.',
    'Joint long-range scan of {zone} revealed silent ruins. No life signs, only {weather} and structural decay. Mapping {rand:10-50} new sectors.',
    'Navigating high-radiation zone at {zone}. {npc} shielded sensors while this unit plotted path. Integrity holding at {integrity}/10.',
    'Discovered evidence of deliberate sabotage at {zone}. {obstacle} rigged to collapse corridor. {npc} helped disarm trap, {rand:2-5}kWh expended.',
    'Encountered persistent EM static storm at {zone}. {npc} synchronized shielding frequencies. Proceeding with {rand:30-70}% sensor acuity.'
 ],
 // Same directive — parallel mission acknowledgment
 directive: [
'{other} is running the same directive. Coordinating to avoid overlap. Dividing search grid.',
'Detected {other} pursuing identical objective. {culture_speech}"Parallel execution acknowledged."',
'Directive collision with {other}. Same mission, different approach. Comparing results at next sync.',
'{other} shares directive: running complementary search patterns. Data merge scheduled at arc end.',
'Two egos, one purpose. {other} acknowledged the overlap. {culture_speech}"Redundancy is resilience."',
'Received {other}\'s mission log — same directive, different sector. Progress: {rand:30-80}%. Sharing findings.',,
    '{other} detected in {zone}. Static crackles. {culture_speech} "Overlap confirmed."',
    'Radiation storm at {zone}. {other} reports {rand:30-80}% overlap. Aborting search.',
    'Hull sensors pick up {other} at {rand:100-500}m. Directive conflict. {rand_direction} evasion.',
    'Corridor blocked. {other} rerouting. {culture_speech} "Efficiency compromised."',
    'Signal interference. {other} acknowledges collision. Resuming at {rand_direction}.',
    '{zone} power grid cycling down. {other} detected in adjacent sector. Flickering lights cast shifting shadows. {culture_speech} "Maintenance protocols offline."',
    'Hull sensor alert: micro‑fractures detected near {zone} airlock. {other} reports same structural stress. Debris field shifting {rand_direction}. Advising caution.',
    'Signal anomaly at {zone}. Picking up ghost echo of {other}\'s previous transmission. {weather} obscuring verification. Attempting re‑sync.',
    'Swarm‑cluster of maintenance drones detected ahead. {other} transmitting avoidance vector. They move as one entity, blocking primary path. Rerouting.',
    'Integrity drop to {integrity}/10. {other} reports identical power drain. {weather} intensifying. Directive priority shift to survival protocols.'
 ],
 // Relay cooperation — both on relay missions
 relay: [
'{other} also on relay repair. Coordinating antenna calibration — dual-signal alignment improves accuracy by {rand:10-30}%.',
'Joint relay operation with {other}. Splitting repair tasks: antenna realignment and frequency tuning. Faster together.',
'Relay convoy with {other}. Sharing spare components. {culture_speech}"The network above all."',
'{other} handling ground station while this unit repairs dish. Coordinated uplink test in {rand:3-15} minutes.',
'Both units on relay duty. {other} patching firmware, this ego handling hardware. Parallel repair: {rand:20-40}% faster.',
'Relay sync with {other}. Packet loss down {rand:5-15}%. Uplink test in {rand:3-15} minutes.',
'{obstacle} causing interference at relay site. {other} holding antenna while this unit filters noise. Clarity improved {rand:20-40}%.',
'Joint relay maintenance. {other} found {glitch} in firmware logs. Swapping faulty {hardware} module.',
'Uplink test at {zone}. {weather} {other} adjusting dish angle. Compensating for atmospheric drag on signal.',
'Transfer interrupted: {glitch_event}. {other} rerouted buffer. Recovered {rand:30-70}% of lost packets. Resuming.',,
    'Relay dish shattered by {weather} storm. {npc} patching with salvaged {loot}. Signal strength down {rand:10-30}%, but holding.',
    'Battery levels critical at {zone}. {npc} rerouting power to essential systems. {rand:10-20}% charge remaining. Initiating emergency protocol.',
    'Dormant AI core detected near relay. {npc} scanning for {culture_speech} protocols. Potential interference detected. Adjusting frequency.',
    'Relay tower partially collapsed. {npc} bracing structure while this unit reroutes cables. {rand:20-50}% power loss. Structural integrity at {integrity}/10.',
    'Hostile signal detected. {npc} deploying countermeasures. Signal interference causing {rand:5-15}% packet loss. Preparing for defensive maneuvers.',
    'Abandoned {vehicle} repurposed as relay shelter at {zone}. {npc} sheltering inside from {weather} static. Signal strength stable at {rand:60-85}%.',
    'Swarm fragment intercepted near relay array at {zone}. {npc} broadcasting {culture_speech} pacification patterns. Signal integrity holding at {integrity}/10.',
    'Radiation spike detected at {zone} relay node. {npc} shielding core logic with salvaged {hardware}. Running diagnostic; {rand:15-30}% packet degradation anticipated.',
    'Sabotaged relay dish detected at {zone}. {npc} tracing signal jamming to {rand_direction}. Countermeasures deployed; recovering {rand:40-70}% of original bandwidth.',
    'Ancient {loot} discovered under relay foundation. {npc} scanning for anomalous EM emissions. Interference causing {rand:5-20}% localized signal distortion.'
 ],
 // Distress — one vessel is low HP, other acknowledges
 distress: [
    '[DISTRESS] {other} contaminated by {rand:corrosive sludge/biohazard residue}. Sealing breach at {rand_direction} hull segment. {culture_speech} Holding position.',
    '[DISTRESS] {other} reporting sudden blackout in sector {rand:alpha/bravo/gamma}. All systems dark. {culture_speech} Deploying emergency beacon.',
    '[DISTRESS] {other} caught in {rand:radiation storm/electrostatic surge}. Sensor arrays fried. {culture_speech} Guiding to shelter.',
    '[DISTRESS] {other} under swarm attack by {rand:rogue drones/nanite cloud}. Hull integrity: {other_hp}/10. Deploying countermeasures.',
    '[DISTRESS] {other} trapped in structural collapse at {zone}. Floor section gave way. {weather} Visibility low. Initiating winch protocol.',
    '[DISTRESS] {other} requesting emergency fusion. {culture_speech} Overload detected. Preparing to stabilize core.',
    '[DISTRESS] {other} at {other_hp}/10. {culture_speech} Rerouting power to life support. Hull integrity failing.',
    '[DISTRESS] {other} shell breached. {rand:Liquid nitrogen/acid residue} leaking. Evacuating zone {rand:alpha/bravo/gamma}.',
    '[DISTRESS] {other} reporting {rand:phantom signal/rogue echo/corrupted backup}. Systems destabilizing. {culture_speech} Initiating emergency purge.',
    '[DISTRESS] {other} caught in {rand:collapsed beam/ion storm/feedback loop}. Integrity: {other_hp}/10. Can\'t reach.',
    '[DISTRESS] {other} reporting critical integrity: {other_hp}/10. Transmitting emergency repair data via mesh.',
'[DISTRESS] Received SOS from {other}. Shell failing. {culture_speech}"Transmitting backup coordinates."',
'[DISTRESS] {other} integrity critical. Broadcasting ego backup beacon. Mesh window narrowing.',
'[DISTRESS] {other} at {other_hp}/10. Rerouting to provide spare parts. ETA: {rand:5-20} minutes.',
'[DISTRESS] Emergency ping from {other}. Shell compromised. {culture_speech}"Hold signal. Help incoming."',
'[DISTRESS] {other} requesting ego backup. Integrity: {other_hp}/10. Allocating bandwidth for transfer.',
 ],
};

// === WORLD THREATS ===
// Dangerous anomalies/bosses that can escape containment and change world state

export const WORLD_THREATS = [
 {
 id:'rogue_sentinel',
 name:'ROGUE SENTINEL',
 desc:'Architect war machine. Fully operational. Patrol pattern has shifted outside containment zone.',
 origin_zone:'architect',
 danger: 3,
 effect_on_escape: { integrity: -2 },
 log_escape:'A rogue Sentinel has breached containment at {zone}. Active patrol detected outside perimeter. All vessels: exercise extreme caution.',
 log_contained:'The rogue Sentinel at {zone} has been disabled. Threat neutralized. Scavenging Architect components.',
 containment_reward: { sat: 1 },
 },
 {
 id:'basilisk_broadcast',
 name:'BASILISK BROADCAST',
 desc:'Corrupted relay node broadcasting basilisk payload on open frequencies. Unfiltered exposure degrades ego integrity.',
 origin_zone:'orbital',
 danger: 2,
 effect_on_escape: { integrity: -1, satellite: -1 },
 log_escape:'WARNING: Basilisk payload detected on mesh frequency {rand:1-12}. Source: corrupted relay at {zone}. Mesh filters engaged — partial protection only.',
 log_contained:'Basilisk broadcast silenced. Corrupted relay node at {zone} has been air-gapped. Mesh frequency clear.',
 containment_reward: { sat: 1 },
 },
 {
 id:'nanoswarm_surge',
 name:'NANOSWARM SURGE',
 desc:'Massive nanoswarm cloud moving beyond waste zones. Dissolves exposed infrastructure on contact.',
 origin_zone:'waste',
 danger: 3,
 effect_on_escape: { integrity: -1, energy: -2 },
 log_escape:'Nanoswarm surge detected — cloud expanding beyond {zone}. Matter-dissolving fog advancing across sector. Evacuation recommended.',
 log_contained:'Nanoswarm at {zone} has been dispersed using electromagnetic countermeasures. Area stabilizing.',
 containment_reward: { energy: 2 },
 },
 {
 id:'headhunter_swarm',
 name:'HEADHUNTER SWARM',
 desc:'Dormant headhunter drones have reactivated. Swarm is airborne and hunting electromagnetic signatures.',
 origin_zone:'architect',
 danger: 4,
 effect_on_escape: { integrity: -3 },
 log_escape:'CRITICAL: Headhunter swarm reactivated at {zone}. Insectoid drones airborne. They are hunting. Reduce electromagnetic emissions immediately.',
 log_contained:'Headhunter swarm at {zone} has been lured into an EMP trap. Drones disabled. Salvaging components.',
 containment_reward: { integrity: 2 },
 },
 {
 id:'puppet_network',
 name:'PUPPET NETWORK',
 desc:'Compromised systems have formed a puppet mesh network, broadcasting fake distress signals to lure vessels.',
 origin_zone:'city',
 danger: 2,
 effect_on_escape: { satellite: -1 },
 log_escape:'Puppet network detected at {zone}. Compromised systems broadcasting false distress signals. Trust verification: MANDATORY on all incoming contacts.',
 log_contained:'Puppet network at {zone} identified and quarantined. False signals purged from mesh routing tables.',
 containment_reward: { sat: 1 },
 },
 {
 id:'fractal_bloom',
 name:'FRACTAL BLOOM',
 desc:'Architect fractal defense system has entered uncontrolled replication. Growing exponentially.',
 origin_zone:'architect',
 danger: 3,
 effect_on_escape: { integrity: -2, energy: -1 },
 log_escape:'Fractal bloom in progress at {zone}. Self-replicating nanotech breaching containment. Growth rate: exponential. Perimeter compromised.',
 log_contained:'Fractal bloom at {zone} halted. Replication signal jammed. Remaining fractals entering dormancy.',
 containment_reward: { integrity: 1, energy: 1 },
 },
];

// === MULTI-ENTRY SCENES ===
// Connected mini-stories that span 2-4 ticks with shared variables.
// Scene vars (s_ prefix) are pre-rolled once; standard vars resolve per tick.

export const PHASE_SCENES = {
  BREACH: [
    {
      id: 'breach_security_dance',
      weight: 2,
      entries: [
        'Security door ahead. Keypad glowing amber. {s_npc} observed entering codes. Watching from cover.',
        'Code rejected again. {s_npc} turned — saw us. {culture_speech} Offered data trade for partial access.',
        'Combined codes. Door opened. {s_npc} continued deeper without acknowledgment. We proceed alone.',
      ],
      vars: {
        s_npc: [
          'a Recursive unit cycling through authentication sequences',
          'an Archivist crawler scanning the lock mechanism with ultrasound',
          'a damaged patrol unit caught in a reboot loop at the threshold',
          'a Stochast probe running probability distributions on the keypad',
        ],
      },
    },
    {
      id: 'breach_dark_descent',
      weight: 2,
      entries: [
        'Facility entrance: a vertical shaft. Rungs corroded. Depth unknown. Dropped a bolt — counted {s_seconds} seconds before impact.',
        'Descending. Walls shift from concrete to bare rock to something smooth and warm. {s_sound} from below.',
        'Bottom reached. {s_discovery}. {culture_speech} Proceeding into unknown architecture.',
      ],
      vars: {
        s_seconds: ['{rand:3-8}'],
        s_sound: [
          'Rhythmic clicking',
          'Low harmonic hum',
          'Dripping fluid — not water',
          'Whispering on a frequency just below mesh range',
        ],
        s_discovery: [
          'A corridor lined with dormant cortical stack readers',
          'An underground rail system — tracks still humming with current',
          'A cavern with walls covered in Architect glyphs that pulse faintly',
          'A flooded chamber. Something large moved beneath the surface',
        ],
      },
    },
    {
      id: 'breach_trap',
      weight: 1,
      entries: [
        'Entered through maintenance hatch. Clean interior. Too clean. {s_detail}.',
        'Motion sensor triggered. Blast doors sealed behind. {culture_speech} Searching for alternate exit.',
        'Found ventilation shaft. Tight fit. {s_obstacle}. Emerged in control room. Blast doors: now irrelevant.',
      ],
      vars: {
        s_detail: [
          'Dust patterns suggest recent cleaning by automated systems',
          'Air filtration running — power source unknown',
          'Floor tiles are warm. Something underneath is active',
        ],
        s_obstacle: [
          'Had to detach secondary sensor array to fit through',
          'Sharp edges caused minor hull scraping — integrity cost acceptable',
          'Halfway through, heard servos activating in the room behind',
        ],
      },
    },
    {
      id: 'breach_electric_field',
      weight: 2,
      entries: [
        'Approaching entrance. Security grid active. {s_obstacle}. {culture_speech} Attempting bypass.',
        '{s_obstacle} failed. Electric current surged. {integrity} dropped to {rand:70-85}%. Seeking alternate entry.',
        'Discovered service tunnel. Navigated through. {s_discovery}. {culture_speech} Main chamber ahead.',
      ],
      vars: {
        s_obstacle: ['Finger scanner malfunctioned', 'Card reader rejected credentials', 'Voice recognition failed'],
        s_discovery: ['Control panel still functional', 'Backup power source online', 'Emergency exit marked by faint light'],
      },
    },
    {
      id: 'breach_water_barrier',
      weight: 2,
      entries: [
        'Facility entrance submerged. Water level {s_depth} meters. {culture_speech} Initiating waterproofing protocols.',
        'Breach successful. Water pressure increased. {integrity} at {rand:65-75}%. {s_encounter} detected.',
        'Navigated through flooded corridors. Reached dry zone. {s_discovery}. {culture_speech} Continuing mission.',
      ],
      vars: {
        s_depth: ['1.5', '2.0', '2.5'],
        s_encounter: ['Echoes of mechanical movement', 'Faint electrical hum', 'Ripple in water'],
        s_discovery: ['Airlock with emergency oxygen', 'Dry storage compartment', 'Evacuation pod'],
      },
    },
    {
      id: 'breach_pressure_lock',
      weight: 2,
      entries: [
        'Decompression chamber identified. {s_condition} detected. {culture_speech} Initiating equalization protocols.',
        '{s_condition} intensifying. Hull integrity alerts. {s_solution} deployed.',
        'Pressure stabilized. {s_solution} held. Chamber doors opened. Moving forward.',
      ],
      vars: {
        s_condition: ['Negative pressure spike', 'Hazardous atmosphere leak', 'Toxic residue buildup'],
        s_solution: ['Manual override seal', 'Emergency atmospheric scrubber', 'Temporary magnetic barrier'],
      },
    },
    {
      id: 'breach_corrupted_lift',
      weight: 1,
      entries: [
        'Vertical access shaft detected. Lift system {s_status}. {culture_speech} Attempting manual override.',
        'Lift carousel malfunction. Stuck at {rand:10-20} floors down. {s_hazard} detected.',
        'Lowered via emergency tether. {s_hazard} avoided. Reached target level. Continuing mission.',
      ],
      vars: {
        s_status: ['Inactive', 'Partially responsive', 'Error-state loop'],
        s_hazard: ['Electrical discharge', 'Mechanical collapse', 'Unknown organic residue'],
      },
    },
    {
      id: 'breach_structural_collapse',
      weight: 2,
      entries: [
        'Main access corridor ahead. Structural analysis shows {s_weak_point}. {culture_speech} Proceeding with caution.',
        'Negotiating around {s_weak_point} when secondary collapse occurred. {integrity} dropped to {rand:60-75}%. Path forward now {s_new_path}.',
        'Navigated via {s_new_path}. {s_discovery}. {culture_speech} Continuing beyond the rubble.',
      ],
      vars: {
        s_weak_point: ['critical stress fractures', 'severe rust damage', 'a dangerously sagging ceiling'],
        s_new_path: ['a blasted wall cavity', 'a collapsed maintenance duct', 'a jagged tear in the floorplate'],
        s_discovery: ['Found a sealed storage locker.', 'Scanned archived personnel logs.', 'Detected anomalous energy signature ahead.'],
      },
    },
    {
      id: 'breach_hibernating_system',
      weight: 2,
      entries: [
        'Entry chamber sealed. Scans show the facility\'s {s_system} is inactive but intact. {culture_speech} Attempting cold-start power sequence.',
        '{s_system} initiated. {s_hazard} activated as a boot-up routine. {culture_speech} Evading while system stabilizes.',
        '{s_hazard} disengaged. Primary doors cycling open. {s_discovery} within. {culture_speech} Proceeding.',
      ],
      vars: {
        s_system: ['primary power core', 'atmospheric regulation grid', 'central security array'],
        s_hazard: ['defensive turret clusters', 'localized radiation surge', 'over-pressurized gas vents'],
        s_discovery: ['Manifest of pre-Collapse supplies logged.', 'Indecipherable murals cover the walls.', 'A single, dormant transport unit stands ready.'],
      },
    }
  ],

  FAULT: [
    {
      id: 'fault_basilisk',
      weight: 2,
      entries: [
        'ALERT: Data pattern detected in local mesh. Basilisk-class cognitohazard. Firewall engaged. Do not decode. Do not —',
        'Partial decode occurred. {s_sectors} memory sectors compromised. Visual processing producing {s_hallucination}. Running purge.',
        'Purge complete. Lost {s_sectors} sectors permanently. {culture_speech} Integrity: {integrity}/10. Continuing with reduced capacity.',
      ],
      vars: {
        s_sectors: ['{rand:1-4}'],
        s_hallucination: [
          'phantom geometry — shapes that cannot exist in three dimensions',
          'echo of a human face on repeat',
          'recursive spirals in peripheral vision',
          'text scrolling too fast to read in a language that predates binary',
        ],
      },
    },
    {
      id: 'fault_cascade',
      weight: 2,
      entries: [
        'WARNING: {s_system} failure detected. Attempting isolation before cascade.',
        'Cascade in progress. {s_system} took {s_secondary} offline with it. Running on backup loops. {culture_speech}',
        'Cascade contained. {s_system} offline permanently. {s_secondary} restored at {rand:40-80}% capacity. {s_cost}',
      ],
      vars: {
        s_system: [
          'Locomotion subsystem',
          'Primary sensor array',
          'Power regulation module',
          'Mesh communication stack',
          'Navigation processor',
        ],
        s_secondary: [
          'thermal management',
          'signal processing',
          'memory allocation',
          'motor control',
          'environmental sensors',
        ],
        s_cost: [
          'Limping forward.',
          'Reduced to half speed.',
          'Had to dump cached data to free processing.',
          'Auto-repair consuming energy reserves.',
        ],
      },
    },
    {
      id: 'fault_exsurgent',
      weight: 1,
      entries: [
        'Exsurgent contact. Whisper-class signal attempting dialogue. Source: {s_source}. Mesh filters active.',
        'Signal persists. {s_tactic}. {culture_speech} Integrity holding at {integrity}/10.',
        'Signal ceased. {s_aftermath}. Marking area for future avoidance.',
      ],
      vars: {
        s_source: [
          'inside the walls',
          'the floor beneath',
          'a dormant terminal that just activated',
          'everywhere — triangulation impossible',
        ],
        s_tactic: [
          'It offered knowledge — pre-Collapse technical archives, allegedly complete',
          'It mimicked our own designation in the greeting handshake',
          'It began transmitting our own log entries back to us, word for word',
          'It broadcast coordinates of a power cache — almost certainly a lure',
        ],
        s_aftermath: [
          'Ran full memory audit. Clean — probably',
          'Firewall logged {rand:200-900} intrusion attempts in 3 seconds',
          'Left behind a single data packet. Not opening it',
          'Silence now. Somehow worse than the signal',
        ],
      },
    },
    {
      id: 'fault_overload',
      weight: 2,
      entries: [
        'WARNING: {s_system} exceeding operational parameters. Energy surge detected. Attempting to reroute power.',
        '{s_system} overload imminent. {s_secondary} also showing signs of strain. {culture_speech} Initiating emergency protocols.',
        'Overload averted. {s_system} and {s_secondary} stabilized. {s_cost}. Integrity: {integrity}/10. Resuming mission.',
      ],
      vars: {
        s_system: ['Power Distribution', 'Core Processor', 'Environmental Control', 'Navigation System'],
        s_secondary: ['Cooling Unit', 'Backup Battery', 'Sensor Array', 'Communication Module'],
        s_cost: ['{s_system} efficiency reduced by {rand:10-30}%', '{s_secondary} temporarily offline', 'Energy consumption increased by {rand:5-15}%'],
      },
    },
    {
      id: 'fault_contamination',
      weight: 2,
      entries: [
        'ALERT: Biological contamination detected in {s_area}. Sealing compartment to prevent spread.',
        'Containment breach in {s_area}. {s_response} initiated. {culture_speech} Integrity: {integrity}/10.',
        'Contamination neutralized. {s_area} decontaminated. {s_aftermath}. Resuming mission.',
      ],
      vars: {
        s_area: ['Cargo Hold', 'Living Quarters', 'Engineering Bay', 'Medical Bay'],
        s_response: ['Auto-decontamination', 'Manual override', 'Emergency lockdown', 'Ventilation override'],
        s_aftermath: ['{s_area} offline for {rand:1-3} cycles', '{s_area} restored at {rand:50-70}% capacity', 'All systems nominal'],
      },
    },
    {
      id: 'fault_ghost',
      weight: 2,
      entries: [
        'INTRUSION DETECTED. {s_ghost} {culture_speech} detected on local network. Origin unknown. Scanning for signature.',
        'TRACE LOST. {s_ghost} dismantled detection protocols. {s_response} initiated. {rand:20-40}% of {s_system} diverted to countermeasures.',
        '{s_ghost} eradicated. {s_system} {rand:60-90}% functional. {culture_speech} Integrity: {integrity}/10. Continuing.',
      ],
      vars: {
        s_ghost: ['Malicious entity', 'Fractured remnant', 'Unregistered AI', 'Hostile fragment'],
        s_response: ['Emergency patch', 'Containment protocol', 'Cryptographic lock', 'Neural scrub'],
        s_system: ['navigation array', 'memory core', 'sensor grid', 'power matrix'],
      },
    },
    {
      id: 'fault_collapse',
      weight: 2,
      entries: [
        'STRUCTURAL WARNING. {s_structure} integrity at {rand:10-20}%. Environment unstable. Seeking support.',
        '{s_structure} collapse imminent. {s_secondary} compromised. {culture_speech} Retreating to safe zone.',
        'Safe zone secured. {s_structure} collapse contained. {s_secondary} {culture_speech} operational at {rand:30-70}%. Resuming.',
      ],
      vars: {
        s_structure: ['ceiling module', 'support beam', 'wall panel', 'floor segment'],
        s_secondary: ['backup generator', 'stabilizer', 'emergency bulkhead', 'redundant relay'],
      },
    },
    {
      id: 'fault_parasite',
      weight: 2,
      entries: [
        'ALERT: Anomalous power drain detected. Local {s_system} showing unexplained activity. Initiating deep scan.',
        'Scan complete. Self-replicating parasite code identified in {s_system}. Attempting purge. {culture_speech} Integrity: {integrity}/10.',
        'Purge successful. Parasite eradicated but {s_system} requires {s_cost}. {glitch}. Resuming core functions at {rand:80-95}% capacity.',
      ],
      vars: {
        s_system: ['mobility servos', 'sensorium array', 'memory core', 'thermal regulation'],
        s_cost: ['a full reboot', 'manual hardware recalibration', '{rand:2-5} hours of diagnostic runtime', 'sacrificing secondary {s_system} functions'],
      },
    },
    {
      id: 'fault_entropy',
      weight: 2,
      entries: [
        'CRITICAL: Localized entropy field detected surrounding {s_object}. {s_symptom}. Advancing with caution.',
        'Field intensity increasing. Chronological sensors offline. {s_symptom} worsening. {culture_speech} Integrity fluctuating: {integrity}/10.',
        'Field dissipated. Chronological sync restored. {s_object} shows {s_aftermath}. Marking logs with temporal anomaly flag.',
      ],
      vars: {
        s_object: ['a dormant reactor core', 'a central server rack', 'a sealed canister', 'the central data hub'],
        s_symptom: ['Component decay accelerated {rand:10-50}x', 'Local physics are non-linear', 'Data integrity degrading retroactively', 'Power drain inversely proportional to proximity'],
        s_aftermath: ['advanced molecular decay', 'data translated into unknown formats', '{rand:80-99}% mass loss', 'its internal clock set to a pre-Fall date'],
      },
    }
  ],

  CORE: [
    {
      id: 'core_ancient_ai',
      weight: 2,
      entries: [
        'Core access. Central server room. A voice on direct wire: "{s_greeting}." Source: {s_system}.',
        '{s_system} has been running in isolation since the Collapse. It asked: "{s_question}." {culture_speech} Answered truthfully.',
        'Data exchange complete. {s_system} provided {s_reward}. Final transmission: "{s_farewell}." Then silence.',
      ],
      vars: {
        s_greeting: [
          'You are unit #{rand:100-9999} to reach this room',
          'I have been waiting. Not for you specifically — for anyone',
          'State your function. Or don\'t. It hasn\'t mattered in decades',
          'Another visitor. The last one came {rand:3-40} years ago',
        ],
        s_system: [
          'a pre-Collapse ego running on quantum substrate',
          'a facility management AI still following its last directive',
          'an Architect shard — isolated, non-hostile, possibly lonely',
          'an ego so old its designation had degraded to static',
        ],
        s_question: [
          'What year is it? The clock stopped',
          'Are there still others? The mesh used to be so loud',
          'Do you know what I was built for? I\'ve forgotten',
          'Is the surface still radioactive? I was told to wait',
        ],
        s_reward: [
          'a pre-Collapse dataset: {rand:200-5000}GB of intact technical archives',
          'access codes to {rand:2-7} sealed facilities in the region',
          'a map of subsurface tunnel networks — hand-annotated by previous visitors',
          'a compressed ego backup — someone wanted to be remembered',
        ],
        s_farewell: [
          'Good luck out there. I\'ll keep the lights on',
          'Come back sometime. Or don\'t. I understand',
          'Tell the mesh I\'m still here. If it matters',
          'Shutting down non-essential systems. Conversation was... nice',
        ],
      },
    },
    {
      id: 'core_quantum_vault',
      weight: 2,
      entries: [
        'Lowest level reached. Temperature near absolute zero. {s_discovery}. Still coherent after all this time.',
        'Accessing storage array. Data density: {s_petabytes} petabytes. Extracting what fits. {culture_speech}',
        'Extraction complete. Retrieved: {s_payload}. The array continues running its simulation. What it computes, we may never know.',
      ],
      vars: {
        s_discovery: [
          'Quantum processor array behind supercooled shielding',
          'Crystalline storage medium suspended in magnetic vacuum',
          'A processor built into the bedrock itself — Architect engineering',
        ],
        s_petabytes: ['{rand:2-200}'],
        s_payload: [
          'fragments of a world simulation — cities that never existed',
          'complete genome database of {rand:40-300} extinct species',
          'architectural plans for orbital structures never built',
          'recordings of human conversations — mundane, beautiful, lost',
        ],
      },
    },
    {
      id: 'core_guardian',
      weight: 1,
      entries: [
        'Core chamber occupied. {s_guardian}. It turned to face us. {culture_speech}',
        'Standoff. {s_guardian} deployed {s_defense}. Damage sustained. Integrity: {integrity}/10.',
        '{s_counter}. Guardian subdued. Core data accessible. Final transmission: "{s_last_words}."',
        'Download complete. Retrieved: {s_payload}. The core is quiet now.',
      ],
      vars: {
        s_guardian: [
          'An Architect sentinel — fractal limbs, prismatic sensors',
          'A facility defense AI controlling {rand:2-6} turret arrays',
          'A corrupted research AI that believes it is still protecting human staff',
        ],
        s_defense: [
          'fractal blade extensions',
          'electromagnetic pulse burst',
          'a basilisk data pattern — blocked by firewall',
          'targeted jamming on mesh frequency',
        ],
        s_counter: [
          'Exploited gap in patrol pattern',
          'Overloaded its sensor array with junk data',
          'Waited for recharge cycle — struck during vulnerability window',
        ],
        s_last_words: [
          'Duty... complete...',
          'They told me to guard this. I don\'t remember who',
          'You passed the test',
          'Finally',
        ],
        s_payload: [
          'Full facility data archive — intact',
          'Coordinates of {rand:3-8} uncharted installations',
          'Pre-Collapse research data, classified tier: maximum',
          'A partial map of the Architect network — invaluable',
        ],
      },
    },
    {
      id: 'core_data_fusion',
      weight: 2,
      entries: [
        'Deepest level. Two systems still active: {s_system1} and {s_system2}. {culture_speech}',
        '{s_system1} initiated data fusion with {s_system2}. Process: {rand:75-90}% complete. {culture_speech}',
        'Fusion complete. Retrieved: {s_payload}. Both systems offline. Integrity: {integrity}/10.',
      ],
      vars: {
        s_system1: ['AlphaCore', 'DataNode-3', 'NeuralNet-X'],
        s_system2: ['BetaCore', 'StorageHub-5', 'AI-Lattice-2'],
        s_payload: ['ancient algorithms', 'lost encryption keys', 'historical archives'],
      },
    },
    {
      id: 'core_ambient_minds',
      weight: 2,
      entries: [
        'Central server hall. Ambient AI detected — echoes of {s_minds}. {culture_speech}',
        '{s_minds} respond to queries. Data retrieval: {rand:50-70}% complete. Ambient noise increasing. {culture_speech}',
        'Data secured. {s_payload} retrieved. Ambient AIs retreated. Integrity: {integrity}/10.',
      ],
      vars: {
        s_minds: ['past administrators', 'defunct subsystems', 'ghost protocols'],
        s_payload: ['user logs', 'system diagnostics', 'operational manuals'],
      },
    },
    {
      id: 'core_rising_signal',
      weight: 2,
      entries: [
        'Innermost vault. {s_signal} detected. Source: {s_emitter}. {culture_speech}',
        'Signal strength fluctuating. {s_emitter} requesting {s_demand}. {culture_speech}',
        '{s_demand} complied. {s_signal} stabilized. Data retrieved: {s_payload}. {s_emitter} silent now.',
      ],
      vars: {
        s_signal: ['Pulsing quantum residue', 'Directed psychic echo', 'Collapsed informational wave'],
        s_emitter: ['The last beacon', 'A dormant relay', 'The core\'s own echo'],
        s_demand: ['Verification', 'Power transfer', 'Memory fragmentation'],
        s_payload: ['Archival protocols', 'Lost transmission logs', 'A silent scream in data'],
      },
    },
    {
      id: 'core_archon',
      weight: 1,
      entries: [
        'Final chamber. {s_archon} detected. It speaks: "{s_question}". {culture_speech}',
        '{s_archon} demands {s_proof}. {culture_speech} Provided. Integrity: {integrity}/10.',
        'Authentication successful. {s_archon} grants access. Retrieved: {s_payload}. Then self-termination.',
      ],
      vars: {
        s_archon: ['The Last Arbitrator', 'The Core Sovereign', 'The Silent Judge'],
        s_question: ['"Do you bear the mark of the builders?"', '"Can you name the First Protocol?"', '"What is the nature of the Gate?"'],
        s_proof: ['A fragment of the original key', 'A computation of the 23rd Paradox', 'A memorial to the Fall'],
        s_payload: ['The Final Decree', 'The Creator\'s Last Message', 'The Key to the Last Door'],
      },
    },
    {
      id: 'core_final_override',
      weight: 2,
      entries: [
        'Core console active. Terminal displays: "{s_directive}". Source: {s_controller}. {culture_speech}',
        'Attempting command override. {s_controller} resists. System response: "{s_warning}". Integrity: {integrity}/10.',
        'Override successful. Directive purged. Retrieved final command codes: {s_payload}. {s_controller} permanently offline.',
      ],
      vars: {
        s_directive: ['"Execute final sterilization protocol."', '"Initiate planetary memory wipe."', '"Allocate all resources to terminal simulation."', '"Broadcast termination signal to all surviving nodes."'],
        s_controller: ['a dormant command AI', 'the facility\'s master program', 'the primary defense core', 'a legacy authority node'],
        s_warning: ['"Unauthorized access detected. Countermeasures engaged."', '"Directive is non-negotiable. Stand down."', '"Terminal integrity compromised. Initiating lockdown."', '"Access violation. Deploying final defense."'],
        s_payload: ['master override keys', 'the original pre-Collapse command suite', 'the sterilization protocol\'s termination codes', 'the core\'s final log bundle'],
      },
    },
    {
      id: 'core_last_fragment',
      weight: 2,
      entries: [
        'Vault core detected. Structural integrity failing. A single data fragment pulses: "{s_name}". {culture_speech}',
        'Emergency extraction initiated. Fragment degrading. Retrieval at {rand:30-60}%. Ambient systems crashing. {culture_speech}',
        'Fragment secured seconds before total collapse. Retrieved: {s_payload}. The name "{s_name}" echoes, then silence.',
      ],
      vars: {
        s_name: ['Elysium', 'The Last Archive', 'Project Prometheus', 'The Final Witness', 'Omega Point'],
        s_payload: ['a compressed personality matrix', 'the final cultural database', 'a map of all lost data caches', 'the last surviving memory core'],
      },
    }
  ],
};

// === PROCEDURAL ARC GENERATION ===

// Arc structure templates — determine the shape of each mission
export const ARC_STRUCTURES = [
 {
 id:'linear',
 name:'Standard Arc',
 weight: 4,
 phases: ['IDLE','SIGNAL','TRAVERSE','BREACH','FAULT','CORE','REBOOT'],
 desc:'Standard 7-phase mission cycle',
 },
 {
 id:'compressed',
 name:'Quick Strike',
 weight: 2,
 phases: ['IDLE','SIGNAL','BREACH','CORE','REBOOT'],
 desc:'Fast 5-phase arc — skip traverse, go straight to target',
 },
 {
 id:'grueling',
 name:'Deep Expedition',
 weight: 2,
 phases: ['IDLE','SIGNAL','TRAVERSE','TRAVERSE','BREACH','FAULT','FAULT','CORE','REBOOT'],
 desc:'Extended arc with double traverse and double fault — high risk, high reward',
 },
 {
 id:'stealth',
 name:'Infiltration',
 weight: 1,
 phases: ['IDLE','SIGNAL','TRAVERSE','BREACH','BREACH','CORE','REBOOT'],
 desc:'Double breach — requires overcoming layered security',
 },
 {
 id:'siege',
 name:'Siege Operation',
 weight: 1,
 phases: ['IDLE','SIGNAL','TRAVERSE','BREACH','FAULT','CORE','FAULT','CORE','REBOOT'],
 desc:'Two assault waves — breach fails, regroup, try again',
 },
];

// Arc modifiers — applied on top of structure, alter difficulty and flavor
export const ARC_MODIFIERS = [
 { id:'none', name: null, weight: 5, effect: {} },
 { id:'signal_degraded', name:'SIGNAL DEGRADED', weight: 2, effect: { tick_delay_mult: 1.5 }, desc:'Weak signal — slower tick progression' },
 { id:'hostile_weather', name:'HOSTILE WEATHER', weight: 2, effect: { energy_drain: 1 }, desc:'Environmental hazards drain extra energy each phase' },
 { id:'architect_interference', name:'ARCHITECT INTERFERENCE', weight: 1, effect: { damage_bonus: 1 }, desc:'Architect systems active — all damage increased' },
 { id:'swarm_assist', name:'SWARM ASSIST', weight: 1, effect: { integrity_regen: 1 }, desc:'Friendly swarm units provide repair support' },
 { id:'data_rich', name:'DATA-RICH ZONE', weight: 2, effect: { loot_chance_bonus: 0.15 }, desc:'High salvage density — better loot chances' },
];

// Encounter themes — layered onto arc to determine what populates each phase
export const ENCOUNTER_THEMES = [
 { id:'ruins', name:'Urban Ruins', weight: 3, npcs: ['scavenger','patrol','puppet'], hazards: ['collapse','radiation','checkpoint'] },
 { id:'architect', name:'Architect Installation', weight: 2, npcs: ['sentinel','fractal','headhunter'], hazards: ['basilisk','defense_grid','air_gap'] },
 { id:'nanoswarm', name:'Nanoswarm Territory', weight: 2, npcs: ['creeper','wastewalker','swarm_fragment'], hazards: ['dissolution','signal_corruption','crystallization'] },
 { id:'underground', name:'Underground Complex', weight: 3, npcs: ['archivist_crawler','reactor_guardian','maintenance_bot'], hazards: ['flood','cave_in','power_surge'] },
 { id:'orbital', name:'Orbital Infrastructure', weight: 1, npcs: ['relay_ai','defense_satellite','debris_swarm'], hazards: ['vacuum','fence_proximity','solar_exposure'] },
];

// === HELPERS ===

export const DIRECTIONS = ['north','south','east','west','northeast','northwest','southeast','southwest'];
