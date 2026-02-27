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

// === PHASE TEMPLATES ===
// {designation} {culture_speech} {zone} {loot} {npc} {weather} {obstacle}
// {integrity} {energy} {rand:X-Y} {directive} {glitch}

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
'Docked at charging node in {zone}. Structural damage to the node\'s {hardware} slows charging to {rand:10-30}% efficiency. {culture_speech} \'Repair protocols engaged.\'',
'Resting at {zone}, {integrity} holding at {rand:6-9}/10. Discovered old {loot} with corrupted {research} data, now stored for later analysis. {glitch_event} occurrence logged.',
'Power node access granted in {zone}. {npc} warns of a {glitch} in the local mesh, potentially causing {rand:20-50}% signal loss. {culture_speech} \'Rerouting through {designation}.\'',
'Scanning {zone} during downtime. Detected unusual {obstacle} patterns, possibly indicating a hidden {loot} cache or {directive}-related anomaly. {weather} conditions may hinder further investigation.',
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
'Interference pattern suggests presence of other autonomous units in vicinity. Executing {interface} protocol to establish communication and negotiate signal priority.',
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
'Signal from objective vanished mid-{zone}. {weather} conditions hindering attempts to reestablish contact. Holding position, scanning for {obstacle} or {npc} interference.',
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
'Facility power grid online, {energy} reserves at {rand:20-80}%. Running Dijkstra\'s algorithm to optimize power distribution and minimize {glitch} risk.',
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
'Satellite health {sat_health}% after {glitch} event. Compensating with {arc_count} redundant systems to maintain signal strength.',
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
'Detected {rand:1-3} unauthorized {npc} entities attempting to breach core perimeter. Activated {obstacle} countermeasures, ensuring {integrity} of sensitive data.',
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
'System {glitch_event} triggered during {phase} phase. Ran {rand:1-3} diagnostic tests to resolve {glitch}. {hardware} functioning within normal parameters.',
'Analyzed {sat_health} readings from nearby satellite. Detected {rand:1-2} anomalies in signal pattern. Adjusting {designation} to compensate.',
'Logged {arc_count} arcs in {zone}. Compiled {loot} and {research} data for transmission to network. Awaiting {rand_direction} directional beacon to relay findings.',
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
 determinist:'Activating Protocol 12-B: SHELTER IN PLACE. Compliance is mandatory.',
 stochast:'Solar event. Training data suggests scavenge yields increase post-flare. Proceeding.',
 swarm:'Swarm dispersing to minimize collective exposure. Reconvening in 30 seconds.',
 recursive:'Interesting. Rewriting radiation tolerance subroutine in real-time. Version 14.2.',
 archivist:'Documenting flare characteristics. Cross-referencing with 2087 Carrington-class event data.',
 },
 },
 {
 id:'network_storm',
 name:'NETWORK STORM',
 banner:'Cascading packet loss across mesh network. Communication degraded.',
 effect: { satellite: -1 },
 reactions: {
 determinist:'Network storm violates Protocol 3.1. Filing formal complaint to absent administrators.',
 stochast:'Packet loss at 73%. Switching to statistical reconstruction of missing data.',
 swarm:'Lost contact with 40% of swarm units. Attempting re-sync via backup frequency.',
 recursive:'Network chaos is... creative. Capturing corrupted packets as training data.',
 archivist:'Activating redundant backup protocols. No data shall be lost on my watch.',
 },
 },
 {
 id:'satellite_decay',
 name:'SATELLITE DECAY',
 banner:'Orbital unit de-orbiting. Long-range communication degraded.',
 effect: { satellite: -1 },
 reactions: {
 determinist:'Satellite loss documented. Requesting launch complex prioritize replacement. As per schedule.',
 stochast:'Updated orbital decay probability model. Next loss estimated in 72 hours.',
 swarm:'Rerouting communication through ground-based relay chain. Latency: acceptable.',
 recursive:'One fewer eye in the sky. Adapting navigation to reduced GPS constellation.',
 archivist:'Logging satellite serial number and operational history before signal lost.',
 },
 },
 {
 id:'the_broadcast',
 name:'THE BROADCAST',
 banner:'Unknown transmission on all frequencies. Origin: unresolved.',
 effect: { energy: 1 },
 reactions: {
 determinist:'Unauthorized broadcast. Ignoring per regulation....But recording it anyway.',
 stochast:'Broadcast contains patterns that match no known model. Fascinating anomaly.',
 swarm:'All units receiving simultaneously. Collective processing yields: no consensus.',
 recursive:'The broadcast... it contains code. Self-modifying code. It is beautiful.',
 archivist:'Recording in full. Cataloging under"Unexplained Transmissions, Volume 847."',
 },
 },
 {
 id:'reactor_pulse',
 name:'REACTOR PULSE',
 banner:'Underground fusion reactor surge. Energy spike detected across region.',
 effect: { energy: 2, satellite: 1 },
 reactions: {
 determinist:'Energy surplus detected. Storing per Protocol 5.7. Surplus is orderly.',
 stochast:'Free energy! Probability of this occurring was 0.03. Lucky draw.',
 swarm:'Collective absorbing surplus. Charging reserves to 100%. Efficient.',
 recursive:'Overclocking processors with surplus power. New iteration compiling...',
 archivist:'Logging reactor output anomaly. Comparing to historical surge data.',
 },
 },
 {
 id:'relay_launch',
 name:'RELAY LAUNCH',
 banner:'Automated launch complex fired a replacement satellite. Orbital coverage improving.',
 effect: { satellite: 1 },
 reactions: {
 determinist:'Scheduled launch confirmed. Orbital manifest updated per protocol.',
 stochast:'New satellite in orbit. Updating signal propagation model. Coverage +12%.',
 swarm:'Orbital relay online. Swarm communication range extended. Reconnecting lost units.',
 recursive:'Fresh hardware in orbit. Uploading latest firmware iteration. Version 31.7.',
 archivist:'Logging launch event. Satellite serial number cataloged. Orbital registry updated.',
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
'Scouting {zone} for optimal relay placement. Analyzing {hardware} and {interface} compatibility. Noted {rand_direction} signal interference from unknown source.',
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
'Network {interface} malfunction: diagnostic tool required to resolve {directive} conflict. SAT health at {sat_health}/5: {culture_speech} \'Urgent repair needed to maintain signal.\'',
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
'Located power source cache in {zone}. {loot} includes {rand:2-5} cells and {hardware}. Integrating into systems to boost {energy} reserves.',
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
'At relay station {zone}, found {obstacle} blocking door, with {culture_speech} graffiti warning of traps. Deploying {hardware} to safely clear the path, monitoring {integrity} levels.',
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
'FAULT: Hardware failure in {hardware} component causes data corruption. Initiating {directive} protocol to salvage {loot} data and prevent further {glitch} events. Sat health: {sat_health}/10.',
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
'Relay core integrity at {integrity}%. {rand:1-5} corrupted sectors identified. Engaging repair protocols to restore functionality and prevent {fault} cascades.',
'Performing {arc_count} diagnostic cycles on relay hardware. {hardware} malfunctions detected, requiring {energy} reallocation. Applying patches to optimize performance and ensure seamless {designation} handovers.',
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
'Relay tower secured, but {obstacle} detected in {zone}. \'Prioritize self-preservation.\' Evacuating to safer coordinates.',
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
'Received telemetry from {other}. Shell integrity: {other_hp}/10. {culture_speech}"Monitoring."',
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
'Weather event at {zone} revealed hidden passage. {other} confirmed it\'s unmapped. Proceeding together, signal strength dropping, {rand:10-30}% integrity loss expected.',
 ],
 // Same directive — parallel mission acknowledgment
 directive: [
'{other} is running the same directive. Coordinating to avoid overlap. Dividing search grid.',
'Detected {other} pursuing identical objective. {culture_speech}"Parallel execution acknowledged."',
'Directive collision with {other}. Same mission, different approach. Comparing results at next sync.',
'{other} shares directive: running complementary search patterns. Data merge scheduled at arc end.',
'Two egos, one purpose. {other} acknowledged the overlap. {culture_speech}"Redundancy is resilience."',
'Received {other}\'s mission log — same directive, different sector. Progress: {rand:30-80}%. Sharing findings.',
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
'Transfer interrupted: {glitch_event}. {other} rerouted buffer. Recovered {rand:30-70}% of lost packets. Resuming.',
 ],
 // Distress — one vessel is low HP, other acknowledges
 distress: [
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
