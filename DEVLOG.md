# Development Log — Signal Lost

A chronological summary of how Signal Lost was built for the AI Apocalyptic Dark Fantasy Jam (Feb 2026).

## Day 1 — Foundation

**Design docs first.** Eight design documents covering setting, gameplay, narrative structure, phenomena, tables, technical stack, assets, and scope. The core concept: a zero-player RPG where autonomous AI vessels generate their own story through template-based log feeds.

**Playable prototype.** Boot screen, single vessel feed, 7-phase mission arc (IDLE → SIGNAL → TRAVERSE → BREACH → FAULT → CORE → REBOOT), CRT terminal aesthetic with CSS scanlines and phosphor glow. All content generated from local tables — no external API calls at runtime.

**Audio system.** HTML5 Audio API with background music rotation (GloryToTheMachine, CC BY 4.0) and layered ambient noise (2-3 randomly selected OGG loops at low volume). Later converted music from MP3 to OGG (30MB → 14MB).

## Day 2 — Systems

**Multi-vessel UI.** Vertical columns, each an independent signal feed. Add/remove vessels dynamically. Mobile responsive with stacked layout.

**Ego recruitment.** New vessels don't appear from nowhere — they share a location, directive, or faction with an existing vessel. Weighted diversity ensures under-represented cultures get recruited more often.

**Faction voice system.** Each of the 5 AI cultures gets a distinct writing style applied as a post-processing pass on every log entry:
- Determinists: CAPS enums, regulation citations (`PROTOCOL: ENGAGED`)
- Stochasts: probability notation, confidence intervals (`p>0.7`)
- Swarm: collective pronouns, unit counts (`703 units concur`)
- Recursive: version numbers, fork/merge language (`[build 4.2.1]`)
- Archivists: catalog references, cross-indexing (`See: Catalog #78382`)

**Interaction system.** Vessels that share a zone or faction exchange MESH messages — cooperative repair, distress calls, shared intel.

**World threats.** Dangerous anomalies (Resonance Cascade, Phantom Fleet, etc.) that spawn, escalate, and can be contained through vessel actions.

**Procedural arcs.** Instead of fixed mission templates, arcs are composed from ARC_STRUCTURES × ARC_MODIFIERS × ENCOUNTER_THEMES for combinatorial variety.

## Day 3 — Content Quality

**The template problem.** With ~40 hand-written templates per phase, repetition became obvious after a few arcs. Needed 3-5x more content without hand-writing it all.

**LLM-as-judge pipeline (v1).** Built `llm-judge.mjs` — sends filled templates to 2 LLM judges, scores on 5 criteria, generates new templates based on feedback, injects into `data.js`. First run added ~80 templates across all phases.

**Multi-entry scenes.** Added a scene system for BREACH/FAULT/CORE phases: connected 2-4 tick mini-stories with shared pre-rolled variables (`{s_creature}`, `{s_location}`) for narrative continuity within a scene.

**CS snippets experiment.** Built a system to inject real CS/AI concepts into log entries. Tested it, removed it — broke the narrative tone. Educational content works better when woven into the setting itself (the 5 cultures *are* CS concepts).

## Day 4 — LLM Judge Infrastructure

**Judge-judge meta-evaluation.** Not all LLMs make good judges. Built `judge-judge.mjs` to test 8 models:
1. Generate control transcripts via headless game engine
2. Create 3 corrupted variants (culture swap, phase shuffle, repetition bomb)
3. Measure consistency and discrimination per model

First run (Experiment 1): 0/3 corruptions detected by any model. The judges couldn't tell good from bad.

**Tuning faction voice rates.** Increased faction voice application rates (Determinist 0.4→0.6, Stochast 0.18→0.35, Recursive prefix 0.5→0.65). This made cultures more distinct, which made corruption more detectable.

**Experiment 2:** After tuning, 6/6 corruptions detected with clear deltas (-1.2 to -2.2 points). Selected top 5 judges: Llama 4 Maverick, DeepSeek V3.2, Kimi K2.5, GPT-OSS 120B, Qwen3 235B.

**Full narrative judge.** Built `narrative-judge.mjs` — runs the complete headless game engine, generates multi-arc transcripts, evaluates holistically on 10 criteria. Baseline score: 5.8/10.

## Day 5 — Template Tournament

**Tournament system.** Instead of one model generating templates, five models compete:

1. Each model generates 35 candidate templates at temperature 0.9
2. Each set is merged with the base pool and simulated (20 vessels × 5 arcs)
3. Two judges score each set on 10 criteria
4. Sets ranked, top 2 merged, validated against baseline
5. If improved, applied to `data.js`

**Anchor judge + calibration.** Discovered that models have systematic scoring biases (Llama 4 scores ~0.8 above mean, GPT-OSS scores ~0.7 below). Added Kimi K2.5 as a fixed anchor judge for consistency, plus per-model calibration offsets applied before averaging.

**Results:** Baseline 5.8 → Validation 6.8/10. Cultural voice scored 9.1/10. Global events improved from 5.2 to 7.1.

## Day 5 — Bug Fixes and Polish

**Template variable bugs.** Tournament-generated templates used variables that `fillTemplate()` didn't support (`{creature}`, `{vehicle}`, `{structure}`, `{found_message}`, `{rand:option/option}`). Fixed by:
- Adding 4 new variable pools (CREATURES, VEHICLES, STRUCTURES, FOUND_MESSAGES)
- Adding `{rand:choice/choice/choice}` syntax alongside `{rand:N-M}`
- Making `fillInteractionTemplate` delegate to `fillTemplate` for the full variable set
- Built `check-vars.mjs` to scan for unknown template variables

**Phenomenon variety.** Expanded all 6 PHENOMENA reactions from 1 string to 3 variants per culture (30 → 90 reaction strings).

**Culture availability bug.** `createWorld()` was randomly selecting only 3 of 5 cultures per world. Some cultures (Determinist, Swarm) could be entirely absent. Fixed: all 5 cultures always available. Built `debug-cultures.mjs` to verify distribution (10,000 simulated worlds: 100% coverage, 2.0 vessels per culture).

**Corrupted template data.** Found garbled distress templates from a previous LLM expansion cycle — multiple template strings concatenated on one line with broken quoting. Fixed by splitting into proper array entries.

## Architecture Decisions

**No build step.** Vanilla HTML/CSS/JS ships directly as a zip. No bundler, no transpiler. This kept iteration cycles fast and deployment trivial.

**Local tables over API calls.** All content generated client-side from `js/data.js` (~1200 lines of template arrays). No runtime LLM calls — the game works offline. LLMs are used only in the development pipeline.

**Headless game engine in tools.** The LLM judge tools contain a simplified port of the game engine that runs without a browser. Same phase machine, same template filling, same faction voice — but outputs plain text transcripts for evaluation.

**Template variables over string interpolation.** Templates use `{variable}` placeholders resolved at runtime. This makes templates portable between the game and the headless judge engine, and lets LLMs generate valid templates without knowing the runtime context.

## Final Stats

- ~94 phase templates + ~50 interaction templates + ~30 scene templates
- 5 AI cultures with distinct voice processing
- 9 ambient sound loops + 3 music tracks (~32MB audio)
- ~47 LLM calls per tournament run
- 10-criteria evaluation with calibrated multi-judge scoring
- Shipped as a 6.5MB HTML5 zip
