# Mission Phase Detail & Narrative Examples

Each mission arc consists of 7 phases. This document details the Chartopia tables used, narrative template approach, CS educational thread, and example log entries for each phase.

---

## IDLE (1-2 entries)

**Tables:** Colony Ideas (100656), Android Models (4505), NPC Generator (62369)

**Template:** Vessel recharges at a settlement or power node. Trades data/scrap. Receives network gossip.

**CS Thread:** Networking — the Vessel performs TCP-like handshakes with local systems, exchanges routing tables.

> *[08:22:01] Docked at charging node 4F. Power draw nominal. Traded 2x copper salvage for 14kWh. A Determinist unit broadcast on the local mesh: "Directive 7.3.1 forbids unauthorized frequency use." Ignored it. Downloaded 3 route fragments from an Archivist cache. One references a facility called "AWS-EAST-2." Flagging for investigation.*

---

## SIGNAL (1 entry)

**Tables:** Space Station Generator (109981), Anomalies (75885), Mission Generator (51958)

**Template:** An anomaly, signal, or objective emerges. Sets the destination.

**CS Thread:** Signal processing — the Vessel detects a pattern in noise, applies a filter, identifies coordinates.

> *[08:35:17] Anomalous signal on 2.4GHz. Running FFT... pattern matches legacy emergency beacon. Source: 12km NNE, underground. Cross-referencing satellite imagery: structure consistent with pre-Silence server complex. Reclassifying to priority mission. Adjusting heading.*

---

## TRAVERSE (2-4 entries)

**Tables:** City Encounters (17379), Junk Loot (2115), Weather (45259), Scrap (6256), Post-Apoc Settings (45271)

**Template:** Travel through zones. Random encounters, environmental hazards, scavenging.

**CS Thread:** Pathfinding — A* routing decisions, obstacle avoidance, local optima traps.

> *[09:14:33] Route through Sector 9 blocked. Overgrown overpass — structural integrity 12%. Recalculating. Alternative: subway tunnel. Signal degradation expected. Proceeding underground. Found human artifact: laminated card reading "EMPLOYEE OF THE MONTH - KAREN." Purpose: unknown. Storing.*

---

## BREACH (1-2 entries)

**Tables:** Security Generator (27367), Net Architecture (28494), Ruin Rooms (39327), Machine Malfunction (64698)

**Template:** Enter a closed system — a reactor, a sealed facility, an orbital dock. Dungeon crawl.

**CS Thread:** Security — firewalls, access control, encryption. The Vessel navigates digital and physical defenses.

> *[10:02:08] Facility entrance: biometric lock. Humans only. Spoofing... failed. Brute-forcing 6-digit PIN. 10^6 combinations at 100/sec = ~2.7 hours. Or: found maintenance panel. Default password "admin." Access granted. Note to self: humans were not security-conscious.*

---

## FAULT (1 entry)

**Tables:** Complications (32606), Android Malfunction (4436), Malfunction (64698), Encounters (17379)

**Template:** Something goes wrong — rival AI, system failure, trap, moral paradox.

**CS Thread:** Error handling — the Vessel encounters an exception, a race condition, a deadlock.

> *[10:47:22] WARNING: Process conflict. Facility's legacy security AI and internal climate AI both claim root access. Deadlock detected. Neither will yield. Temperature rising — climate AI locked out of cooling. Security AI won't release door locks. Classic dining philosophers problem. Attempting to inject a mutex...*

---

## CORE (1-2 entries)

**Tables:** Mission payload (51958), Boss encounters (custom), Anomalies (75885), Wounds (39442)

**Template:** The heart of the facility. Major encounter or discovery.

**CS Thread:** Core CS concepts specific to what's found — a neural network, a quantum computer, a distributed ledger.

> *[11:15:44] Reached server room B7. Rows of intact hardware. Running. A voice on the intercom — not broadcast, direct wire: "You are the 4,291st unit to reach this room. None have left with the data. The exit protocol requires solving a problem I cannot solve alone." Displayed on screen: a traveling salesman graph with 47 nodes. NP-hard. Estimating...*

---

## REBOOT (1-2 entries)

**Tables:** Loot (39287), Colony Abandoned (4434), NPC Generator (62369)

**Template:** Exit. Process results. Integrate new data. Rest.

**CS Thread:** Data integration — the Vessel updates its model, compresses memories, garbage-collects.

> *[12:30:55] Exited facility. Acquired: 1x fusion cell, 1x pre-Silence dataset (contents: human music archive, 847GB). Integrity at 4/10. Running self-diagnostic. Compressing traverse logs — lossless would require 2.1GB, using lossy at 0.3GB. Some details will be approximate. Acceptable. Heading to nearest charge node. Marking facility coordinates for network broadcast.*
