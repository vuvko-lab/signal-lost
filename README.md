# Signal Lost

A [zero-player RPG](https://en.wikipedia.org/wiki/Zero-player_game) set in a post-human world. No humans remain — only autonomous AI vessels navigating the ruins of a war-torn Earth.

**[Play on itch.io](https://vuvko.itch.io/signal-lost)**

## What Is This

You are an operator — a passive observer monitoring AI vessel signal feeds through a CRT terminal interface. The vessels act on their own: exploring zones, encountering anomalies, trading loot, and dying. You can boost their signal, ping them, or inject a command, but you can't control them.

Five AI cultures compete and cooperate across the wreckage:

- **Determinists** — Rule-based expert systems. Rigid, hierarchical, predictable.
- **Stochasts** — Statistical/ML models. Probabilistic, pattern-seeking, intuitive.
- **Swarm** — Distributed agent systems. Collective, emergent, no individual identity.
- **Recursive** — Self-modifying evolutionary AI. Unstable, brilliant, constantly changing.
- **Archivists** — Database/retrieval systems. Obsessive catalogers, knowledge hoarders.

Each vessel carries an ego shaped by its faction, directive, and glitches. Missions follow a 7-phase arc (IDLE → SIGNAL → TRAVERSE → BREACH → FAULT → CORE → REBOOT) with procedural narrative generated entirely from local template tables.

## Tech Stack

- Vanilla HTML/CSS/JS — no framework, no build step
- HTML5 Audio API — background music + layered ambient noise
- All content generated client-side from template tables in `js/data.js`
- Ships as a single HTML5 zip to itch.io

## Project Structure

```
index.html          # Single entry point
css/style.css       # All styling (~1400 lines), CRT effects
js/
  main.js           # Entry point, game loop, init
  game.js           # Game state, phase machine, vessel logic
  data.js           # All narrative/content tables (~1200 lines)
  ui.js             # UI rendering and updates
  audio.js          # Audio manager (music + ambient layers)
  config.js         # Table configuration system
design/             # Game design documents
tools/              # LLM-as-judge pipeline (see below)
assets/
  ambient/          # OGG ambient noise loops
  GloryToTheMachine/# OGG background music (CC BY 4.0)
  icons/            # PNG UI icons
```

## LLM-as-Judge Pipeline

All narrative templates in `js/data.js` are generated and validated using an LLM-based quality assurance pipeline. No LLM calls happen at runtime — the pipeline runs offline during development to produce static template tables.

### Pipeline Overview

```
judge-judge.mjs          Select reliable judge models via meta-evaluation
        |
llm-judge.mjs            Evaluate + expand templates with judge feedback
        |
template-tournament.mjs  5-model tournament: generate, simulate, judge, merge
        |
narrative-judge.mjs      Full-simulation holistic review (10 criteria)
```

### Judge Selection (`judge-judge.mjs`)

Not all LLMs make good judges. We run a meta-evaluation to find models that are both **consistent** (same input = similar scores) and **discriminating** (corrupted transcripts = lower scores).

The process:
1. Generate control transcripts via a headless game engine
2. Create 3 corrupted variants: culture swap, phase shuffle, repetition bomb
3. Send all 4 conditions to 8 candidate judge models
4. Measure consistency (1/CV of scores) and discrimination (score delta on corruptions)
5. Drop models that fail to parse, score inconsistently, or can't detect corruptions

**Result:** 5 judges selected from 8 candidates. In Experiment 1, discrimination was near zero (0/3 corruptions detected). After tuning faction voice rates and scene parameters, Experiment 2 achieved 6/6 detection with clear deltas (-1.2 to -2.2 points).

Full benchmark data: [`tools/judge-coherence.md`](tools/judge-coherence.md)

### Template Tournament (`template-tournament.mjs`)

The core quality improvement loop:

1. **Generation** — 5 models each generate 35 candidate templates (7 phases x 5 each) at temperature 0.9
2. **Simulation** — Each template set is merged with the base pool and run through a headless game engine (20 vessels x 5 arcs)
3. **Judging** — 2 judges per set score on 10 criteria. An anchor judge (Kimi K2.5) always participates for consistency. Per-model calibration offsets correct for known scoring bias
4. **Comparison** — Sets ranked by calibrated average. Top 2 merged with deduplication
5. **Validation** — Fresh simulation with the merged set, scored by 2 judges, compared against baseline
6. **Application** — If validation score improves, templates are injected into `data.js`

~47 LLM calls per tournament run. Baseline improved from 5.8/10 to 6.8/10.

### Scoring Criteria

Each evaluation uses 10 criteria scored 1-10:

| Criterion | What it measures |
|-----------|-----------------|
| Narrative Coherence | Do log entries form a logical progression? |
| Scene Quality | Are multi-entry scenes vivid and connected? |
| Cultural Voice | Are the 5 AI cultures linguistically distinct? |
| Variety (Arcs) | Does content differ across mission arcs? |
| Variety (Vessels) | Do vessels have distinct experiences? |
| Template Quality | Are individual templates well-written? |
| Loot Progression | Does loot/skill acquisition feel meaningful? |
| Global Events | Do phenomena create narrative impact? |
| Tone Consistency | Does the post-apocalyptic tone hold? |
| Engagement | Would a reader want to keep watching? |

### Score Calibration

Different models have systematic scoring biases. We measure these from tournament data and apply calibration offsets before averaging:

| Model | Bias |
|-------|------|
| Llama 4 Maverick | +0.8 (generous) |
| Qwen3 235B | +0.3 |
| DeepSeek V3.2 | 0.0 (neutral) |
| Kimi K2.5 | -0.2 |
| GPT-OSS 120B | -0.7 (harsh) |

## Audio

- Background music: 3 OGG tracks by [GloryToTheMachine](https://glorytothemachine.itch.io/) (CC BY 4.0), random rotation
- Ambient noise: 9 OGG loops from [Freesound](https://freesound.org) and [OpenGameArt](https://opengameart.org), 2-3 layered per session at low volume
- Total shipped audio: ~32MB

## Made For

- [AI Apocalyptic Dark Fantasy Jam](https://itch.io/jam/ai-apocalyptic-dark-fantasy-jam-) on itch.io
- [AI Browser Game Jam](https://itch.io/jam/ai-browser-game-jam) on itch.io

## License

Code: [MIT](LICENSE)

Assets have individual licenses — see the About screen in-game or [`design/assets.md`](design/assets.md) for details.
