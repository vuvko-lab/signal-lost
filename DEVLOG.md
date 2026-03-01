# Development Log — Signal Lost

A chronological summary of building Signal Lost for the AI Apocalyptic Dark Fantasy Jam (Feb 26-28, 2026). The entire project was built in roughly 36 hours across 6 sessions.

## Session 1 — Foundation (Feb 26, 23:15 – Feb 27, 02:03)

**Design docs first.** Eight documents covering setting, gameplay, narrative structure, phenomena, tables, technical stack, assets, and scope. The core concept: a zero-player RPG where autonomous AI vessels generate their own story through template-based log feeds.

**Playable prototype.** Boot screen, single vessel feed, 7-phase mission arc (IDLE → SIGNAL → TRAVERSE → BREACH → FAULT → CORE → REBOOT), terminal aesthetic with CSS effects. All content generated from local tables — no external API calls at runtime.

**Core systems.** SAT connectivity loop with relay missions, vessel destruction mechanics, simulation test harness for balance. Late in the session, redesigned the setting around Eclipse Phase-inspired post-Collapse Earth (CC BY-NC-SA 4.0).

**Audio and assets.** Added GloryToTheMachine music (CC BY 4.0), Monogram pixel font, initial UI assets.

## Session 2 — Game Systems (Feb 27, 07:13 – 08:33)

**Ego recruitment.** New vessels share a location, directive, or faction with an existing vessel — they don't appear from nowhere.

**Faction voice system.** Each of the 5 AI cultures gets a distinct writing style applied as post-processing on every log entry:
- Determinists: CAPS enums, regulation citations (`PROTOCOL: ENGAGED`)
- Stochasts: probability notation, confidence intervals (`p>0.7`)
- Swarm: collective pronouns, unit counts (`703 units concur`)
- Recursive: version numbers, fork/merge language (`[build 4.2.1]`)
- Archivists: catalog references, cross-indexing (`See: Catalog #78382`)

**Interaction system.** Vessels in the same zone exchange MESH messages — cooperative repair, distress calls, shared intel.

**World threats.** Dangerous anomalies (Resonance Cascade, Phantom Fleet, etc.) that spawn, escalate, and can be contained.

**Procedural arcs.** Missions composed from ARC_STRUCTURES × ARC_MODIFIERS × ENCOUNTER_THEMES for combinatorial variety. Added HARDWARE/INTERFACE/RESEARCH skill progression with loot drops.

**Local tables.** Removed Chartopia dependency, built a local table config system. Added About screen, in-game dialogs, UI polish.

## Session 3 — Content Quality & Polish (Feb 27, 09:09 – 12:31)

**LLM-as-judge pipeline (v1).** Built `llm-judge.mjs` — sends filled templates to 2 LLM judges, scores on 5 criteria, generates new templates based on feedback, injects into `data.js`. First run added ~80 templates.

**Audio overhaul.** Added layered ambient noise (2-3 OGG loops at low volume under music). Converted music MP3 → OGG (30MB → 14MB). Halved noise volumes after testing. Trimmed music to 3 best tracks.

**Asset cleanup.** Moved unused asset packs to `_unused/` (1.4GB → 18MB active). Simplified fonts to Courier Prime only. Replaced icons from asset pack, fixed dark versions for CSS filter tinting.

**Removed CRT scanline overlay** — looked good in screenshots but was distracting during play.

**CS snippets experiment.** Built a system to inject real CS/AI concepts into log entries. Tested it, removed it — broke the narrative tone. Educational content works better woven into the setting itself (the 5 cultures *are* CS concepts).

## Session 4 — Publishing (Feb 27, 13:19 – 15:14)

**LLM judge rounds.** Ran 2 additional judge rounds, applied 30 new templates, deduplicated expansions.

**itch.io setup.** Created HTML page description with cyberpunk styling, recorded demo video, built a Playwright-based cover GIF generator, shipped first HTML5 zip.

**Mobile fixes.** Fixed mobile-to-desktop transition, hide credits div on mobile, auto-dismiss phenomena popup after 15 seconds.

**Operator interaction.** Transformed injected operator messages into in-world manifestations rather than raw text.

## Session 5 — Deep Narrative (Feb 27, 19:37 – 23:53)

**Multi-entry scene system.** Connected 2-4 tick mini-stories during BREACH/FAULT/CORE phases with shared pre-rolled variables (`{s_creature}`, `{s_location}`) for narrative continuity.

**Narrative simulation judge.** Built `narrative-judge.mjs` — headless game engine generates multi-arc transcripts, sends to 2 judges for holistic 10-criteria review. Baseline score: **5.8/10**.

**Judge-judge meta-evaluation.** Not all LLMs make good judges. Built `judge-judge.mjs` to test 8 models with control + 3 corrupted conditions:

- Experiment 1: 0/3 corruptions detected. Judges couldn't tell good from bad.
- Increased faction voice rates (Determinist 0.4→0.6, Stochast 0.18→0.35, Recursive 0.5→0.65).
- Experiment 2: **6/6 corruptions detected** with deltas of -1.2 to -2.2 points.
- Selected top 5: Llama 4 Maverick, DeepSeek V3.2, Kimi K2.5, GPT-OSS 120B, Qwen3 235B.

Full benchmark data: [`tools/judge-coherence.md`](tools/judge-coherence.md)

## Session 6 — Tournament & Release (Feb 28, 07:24 – 09:40)

**Template tournament.** Built `template-tournament.mjs` — five models compete instead of one generating:

1. Each model generates 35 candidate templates at temperature 0.9
2. Each set merged with base pool and simulated (20 vessels × 5 arcs)
3. Two judges score each on 10 criteria
4. Sets ranked, top 2 merged with deduplication
5. Validated against baseline, applied if improved

**Anchor judge + calibration.** Discovered models have systematic scoring biases (Llama 4: +0.8, GPT-OSS: -0.7). Added Kimi K2.5 as fixed anchor judge plus per-model calibration offsets. Result: **5.8 → 6.8/10** (cultural voice 9.1, global events 5.2 → 7.1).

**Template variable bugs.** Tournament templates used variables `fillTemplate()` didn't support. Fixed by adding 4 new variable pools (CREATURES, VEHICLES, STRUCTURES, FOUND_MESSAGES), `{rand:choice/choice}` syntax, and making `fillInteractionTemplate` delegate to `fillTemplate`. Built `check-vars.mjs` to catch unknown variables.

**Phenomenon variety.** Expanded all PHENOMENA reactions from 1 string to 3 variants per culture (30 → 90 reaction strings).

**Culture availability bug.** `createWorld()` randomly selected only 3 of 5 cultures per world — Determinists and Swarm could be entirely absent. Fixed: all 5 always available. Built `debug-cultures.mjs` to verify (10,000 worlds: 100% coverage, 2.0 vessels/culture).

**Release v1.1.2.** MIT license, README with LLM pipeline documentation, updated About screen, shipped 6.5MB zip.

## Session 7 — UX Polish (Mar 2, 2026)

**Tick speed controls.** Replaced the table configuration (CFG) button with tick speed controls (0.5x–3x). Default speed reduced to 0.5x — the previous pace was too fast for reading. Removed the entire config panel system (js/config.js, CSS, HTML overlay).

**Smart auto-scroll.** Log feeds no longer force-scroll to the bottom when the user is reading earlier entries. A clickable "NEW" indicator appears at the bottom of the feed when new messages arrive while scrolled up.

**Audio volume increase.** Background music volume raised from 0.3 to 0.5. Ambient noise layers raised ~4x (0.008–0.015 → 0.035–0.06) so they're actually audible as atmosphere.

**Template variable fix.** The `{msg}` placeholder in INJECT_MANIFESTATIONS (operator's typed message) had been incorrectly renamed to `{found_message}` during a batch rename. Restored so injected commands display the operator's actual message.

**Dynamic SAT signal icons.** Generated 6 PNG icons (sat-0 through sat-5) showing filled/empty signal bars. The icon now updates in real-time as satellite health changes — full bars at SAT 5, empty outlines at SAT 0.

**Mobile header layout.** Reorganized the top banner into a two-row CSS grid on mobile. Title wraps to two lines; font/about controls on top row, speed controls on bottom; VOL and SAT stacked on the right spanning both rows. Fits cleanly within mobile viewport width.

**Version display.** Added version identifier (`v1.2.1` + commit hash) to the About screen header.

## Architecture Decisions

**No build step.** Vanilla HTML/CSS/JS ships directly as a zip. No bundler, no transpiler.

**Local tables over API calls.** All content generated client-side from `js/data.js` (~1200 lines). No runtime LLM calls — the game works offline.

**Headless engine in tools.** The LLM judge tools contain a simplified port of the game engine that runs without a browser — same phase machine, template filling, and faction voice.

**Template variables over string interpolation.** `{variable}` placeholders resolved at runtime. Makes templates portable between game and headless judge engine, and lets LLMs generate valid templates without knowing the runtime context.

## Final Stats

- ~94 phase templates + ~50 interaction templates + ~30 scene templates
- 5 AI cultures with distinct voice processing
- 9 ambient sound loops + 3 music tracks (~32MB audio)
- ~47 LLM calls per tournament run
- 10-criteria evaluation with calibrated multi-judge scoring
- Shipped as a 6.5MB HTML5 zip
