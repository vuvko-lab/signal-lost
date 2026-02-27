# Signal Lost — Tools

Quality assurance and content generation pipeline for narrative templates.

## Pipeline Overview

Run in this order:

```
judge-judge.mjs  -->  llm-judge.mjs --expand --apply  -->  narrative-judge.mjs
(pick models)         (expand templates)                    (evaluate full arcs)
```

### 1. `judge-judge.mjs` — Model Selection

Meta-evaluation: determines which LLM judges are reliable.

- Generates control transcripts via headless game engine
- Creates 3 corrupted variants (culture swap, phase shuffle, repetition bomb)
- Sends all 4 conditions to each judge model in parallel
- Measures **consistency** (same input = similar scores) and **discrimination** (corrupted = lower scores)
- Outputs: `judge-coherence.md` (tracked in git), `judge-judge-report.json` (gitignored)

```bash
node tools/judge-judge.mjs [--vessels N] [--arcs N]
```

### 2. `llm-judge.mjs` — Template Evaluation & Expansion

Evaluates raw templates from `js/data.js` and generates new ones.

- Fills templates with sample data, sends to 2 judge LLMs
- Scores: atmosphere, variety, template quality, readability, immersion (1-5)
- With `--expand`: generator LLM writes new templates based on judge feedback
- With `--apply`: injects new templates and scenes into `js/data.js`
- Outputs: `judge-report.json`, `judge-expansions.json`, `judge-scene-expansions.json` (all gitignored)

```bash
node tools/llm-judge.mjs                        # evaluate only
node tools/llm-judge.mjs --expand               # evaluate + generate new templates
node tools/llm-judge.mjs --expand --apply        # evaluate + generate + inject into data.js
node tools/llm-judge.mjs --phase BREACH          # filter by phase
node tools/llm-judge.mjs --culture determinist   # filter by culture
```

### 3. `narrative-judge.mjs` — Full Simulation Review

Runs the complete game engine headlessly and evaluates narrative quality.

- Simulates N vessels through M mission arcs (default: 5 vessels, 10 arcs)
- Generates full transcripts with faction voice, loot, scenes, phase transitions
- Sends to 2 randomly-selected judges for holistic review
- 10 scoring criteria: coherence, scene quality, cultural voice, arc variety, vessel variety, template quality, loot progression, global events, tone consistency, engagement
- Outputs: `narrative-transcripts.txt`, `narrative-judge-report.json` (gitignored)

```bash
node tools/narrative-judge.mjs [--vessels N] [--arcs N]
```

### 4. `dedup-templates.mjs` — Template Deduplication

Removes duplicate template strings from `js/data.js` arrays after expansion cycles.

```bash
node tools/dedup-templates.mjs
```

## Output Files

| File | Tracked | Description |
|------|---------|-------------|
| `judge-coherence.md` | Yes | Judge model benchmark results |
| `judge-judge-report.json` | No | Raw judge-judge data |
| `judge-report.json` | No | Raw llm-judge scores |
| `judge-expansions.json` | No | Generated template expansions |
| `judge-scene-expansions.json` | No | Generated scene expansions |
| `narrative-judge-report.json` | No | Raw narrative review data |
| `narrative-transcripts.txt` | No | Generated game transcripts |

## Current Judge Models

Top 5 from judge-judge benchmark (Feb 2026):

1. **Llama 4 Maverick** — Most consistent scores
2. **DeepSeek V3.2** — Good discrimination + consistency balance
3. **Kimi K2.5** — Best at detecting corruptions
4. **GPT-OSS 120B** — Reliable, slightly pessimistic
5. **Qwen3 235B** — Large model, reliable parsing

All via DeepInfra API. See `judge-coherence.md` for full benchmark data.
