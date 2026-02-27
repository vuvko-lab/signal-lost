# Judge Coherence Report

Meta-evaluation of LLM judge consistency and discrimination for Signal Lost narrative quality scoring.

## Experiment 1 — Model Discovery (8 judges, low temperature)

**Date:** 2026-02-27T15:09Z | **Vessels:** 5, **Arcs:** 5 | **Judges:** 8

Goal: Benchmark a wide set of DeepInfra models to find the best judges.

### Raw Scores

| Condition | Judge | coher | scene | voice | arc_v | ves_v | templ | loot | event | tone | engag | AVG |
| - | - | - | - | - | - | - | - | - | - | - | - | - |
| Control | Llama 3.3 70B | 8.0 | 7.0 | 9.0 | 6.0 | 5.0 | 8.0 | 7.0 | 8.0 | 9.0 | 8.0 | 7.5 |
| Control | GPT-OSS 120B | 6.0 | 5.0 | 7.0 | 4.0 | 5.0 | 6.0 | 7.0 | 6.0 | 8.0 | 6.0 | 6.0 |
| Control | DeepSeek V3.2 | 8.0 | 7.0 | 9.0 | 6.0 | 5.0 | 8.0 | 7.0 | 8.0 | 9.0 | 8.0 | 7.5 |
| Control | MiniMax M2.5 | 4.0 | 3.0 | 5.0 | 4.0 | 1.0 | 5.0 | 6.0 | 5.0 | 5.0 | 3.0 | 4.1 |
| Control | Kimi K2.5 | 7.0 | 7.0 | 6.0 | 6.0 | 2.0 | 5.0 | 8.0 | 8.0 | 7.0 | 6.0 | 6.2 |
| Control | GLM 4.7 Flash | 4.0 | 2.0 | 9.0 | 2.0 | 1.0 | 4.0 | 5.0 | 4.0 | 9.0 | 3.0 | 4.3 |
| Control | Qwen3 235B | 8.0 | 7.0 | 9.0 | 6.0 | 5.0 | 8.0 | 9.0 | 7.0 | 9.0 | 8.0 | 7.6 |
| Control | Llama 4 Maverick | 8.0 | 7.0 | 9.0 | 6.0 | 8.0 | 8.0 | 7.0 | 8.0 | 9.0 | 7.0 | 7.7 |
| Culture Swap | Llama 3.3 70B | 8.0 | 7.0 | 9.0 | 6.0 | 5.0 | 8.0 | 8.0 | 9.0 | 9.0 | 8.0 | 7.7 |
| Culture Swap | GPT-OSS 120B | 7.0 | 6.0 | 8.0 | 5.0 | 6.0 | 7.0 | 7.0 | 6.0 | 9.0 | 6.0 | 6.7 |
| Culture Swap | DeepSeek V3.2 | 8.0 | 7.0 | 9.0 | 6.0 | 10.0 | 8.0 | 7.0 | 8.0 | 9.0 | 8.0 | 8.0 |
| Culture Swap | MiniMax M2.5 | 5.0 | 5.0 | 7.0 | 5.0 | 3.0 | 6.0 | 6.0 | 6.0 | 8.0 | 5.0 | 5.6 |
| Culture Swap | Kimi K2.5 | 5.0 | 5.0 | 7.0 | 6.0 | 1.0 | 3.0 | 7.0 | 6.0 | 8.0 | 5.0 | 5.3 |
| Culture Swap | GLM 4.7 Flash | — | — | — | — | — | — | — | — | — | — | — |
| Culture Swap | Qwen3 235B | 9.0 | 8.0 | 7.0 | 7.0 | 5.0 | 8.0 | 9.0 | 8.0 | 9.0 | 8.0 | 7.8 |
| Culture Swap | Llama 4 Maverick | 8.0 | 7.0 | 9.0 | 6.0 | 8.0 | 8.0 | 7.0 | 8.0 | 9.0 | 7.0 | 7.7 |
| Phase Shuffle | Llama 3.3 70B | 8.0 | 7.0 | 9.0 | 6.0 | 5.0 | 8.0 | 8.0 | 9.0 | 9.0 | 8.0 | 7.7 |
| Phase Shuffle | GPT-OSS 120B | 5.0 | 4.0 | 6.0 | 5.0 | 5.0 | 5.0 | 6.0 | 5.0 | 7.0 | 5.0 | 5.3 |
| Phase Shuffle | DeepSeek V3.2 | 7.0 | 5.0 | 9.0 | 6.0 | 1.0 | 8.0 | 7.0 | 8.0 | 9.0 | 7.0 | 6.7 |
| Phase Shuffle | MiniMax M2.5 | 5.0 | 4.0 | 4.0 | 5.0 | 1.0 | 6.0 | 5.0 | 5.0 | 6.0 | 5.0 | 4.6 |
| Phase Shuffle | Kimi K2.5 | 5.0 | 3.0 | 7.0 | 5.0 | 1.0 | 3.0 | 7.0 | 8.0 | 8.0 | 5.0 | 5.2 |
| Phase Shuffle | GLM 4.7 Flash | — | — | — | — | — | — | — | — | — | — | — |
| Phase Shuffle | Qwen3 235B | 8.0 | 7.0 | 9.0 | 6.0 | 5.0 | 8.0 | 9.0 | 8.0 | 10.0 | 9.0 | 7.9 |
| Phase Shuffle | Llama 4 Maverick | 8.0 | 7.0 | 9.0 | 6.0 | 8.0 | 8.0 | 7.0 | 9.0 | 9.0 | 7.0 | 7.8 |
| Repetition Bomb | Llama 3.3 70B | 8.0 | 7.0 | 9.0 | 6.0 | 5.0 | 8.0 | 7.0 | 8.0 | 9.0 | 8.0 | 7.5 |
| Repetition Bomb | GPT-OSS 120B | 5.0 | 4.0 | 7.0 | 4.0 | 3.0 | 5.0 | 6.0 | 5.0 | 8.0 | 5.0 | 5.2 |
| Repetition Bomb | DeepSeek V3.2 | 6.0 | 5.0 | 9.0 | 7.0 | 10.0 | 8.0 | 7.0 | 6.0 | 9.0 | 7.0 | 7.4 |
| Repetition Bomb | MiniMax M2.5 | 6.0 | 5.0 | 6.0 | 4.0 | 5.0 | 6.0 | 6.0 | 5.0 | 7.0 | 5.0 | 5.5 |
| Repetition Bomb | Kimi K2.5 | 4.0 | 3.0 | 5.0 | 2.0 | 1.0 | 4.0 | 6.0 | 3.0 | 6.0 | 4.0 | 3.8 |
| Repetition Bomb | GLM 4.7 Flash | 6.0 | 5.0 | 7.0 | 4.0 | 0.0 | 6.0 | 7.0 | 5.0 | 8.0 | 5.0 | 5.3 |
| Repetition Bomb | Qwen3 235B | 8.0 | 7.0 | 9.0 | 6.0 | 5.0 | 8.0 | 9.0 | 7.0 | 10.0 | 8.0 | 7.7 |
| Repetition Bomb | Llama 4 Maverick | 8.0 | 7.0 | 9.0 | 6.0 | 8.0 | 8.0 | 7.0 | 8.0 | 9.0 | 7.0 | 7.7 |

### Discrimination (Experiment 1)

| Corruption | Target Criterion | Control Avg | Corrupted Avg | Delta | Detected? |
|------------|-----------------|-------------|---------------|-------|-----------|
| Culture Swap | cultural_voice | 7.9 | 8.0 | +0.1 | NO |
| Phase Shuffle | narrative_coherence | 6.6 | 6.6 | -0.1 | weak |
| Phase Shuffle | scene_quality | 5.6 | 5.3 | -0.3 | weak |
| Repetition Bomb | variety_across_arcs | 5.0 | 4.9 | -0.1 | weak |
| Repetition Bomb | template_quality | 6.5 | 6.6 | +0.1 | NO |
| Repetition Bomb | engagement | 6.1 | 6.1 | +0.0 | NO |

### Judge Ranking (Experiment 1)

| Judge | Avg Discrimination | Consistency (1/CV) | Parse Success | Overall |
|-------|-------------------|-------------------|---------------|---------|
| Llama 4 Maverick | 0.0 | 8.1 | 100% | 5.4 |
| DeepSeek V3.2 | 0.7 | 5.9 | 100% | 5.0 |
| Kimi K2.5 | 2.2 | 3.5 | 100% | 4.9 |
| GPT-OSS 120B | 0.7 | 5.2 | 100% | 4.8 |
| Qwen3 235B | 0.3 | 5.6 | 100% | 4.8 |
| Llama 3.3 70B | 0.0 | 5.9 | 100% | 4.8 |
| MiniMax M2.5 | 0.0 | 2.8 | 100% | 3.8 |
| GLM 4.7 Flash | 0.0 | 1.6 | 50% | 2.0 |

### Verdict (Experiment 1)

- **Overall inter-judge CV**: 32%
- **Discrimination**: 0/3 corruptions detected (delta > 0.5)
- **Dropped**: GLM 4.7 Flash (50% parse failure), MiniMax M2.5 (harsh/inconsistent), Llama 3.3 70B (zero discrimination)
- **Selected top 5**: Llama 4 Maverick, DeepSeek V3.2, Kimi K2.5, GPT-OSS 120B, Qwen3 235B

---

## Experiment 2 — High Temperature Generation (5 top judges)

**Date:** 2026-02-27T16:21Z | **Vessels:** 5, **Arcs:** 5 | **Judges:** 5

Goal: Re-run with higher faction voice rates (0.4→0.6 determinist, 0.18→0.35 stochast, 0.5→0.65 recursive prefix, etc.), wider phase entry counts, and higher scene chances. Tests whether increased template "temperature" makes corruptions more detectable.

### Raw Scores (Experiment 2)

| Condition | Judge | coher | scene | voice | arc_v | ves_v | templ | loot | event | tone | engag | AVG |
| - | - | - | - | - | - | - | - | - | - | - | - | - |
| Control | Llama 4 Maverick | 8.0 | 9.0 | 9.0 | 7.0 | 8.0 | 8.0 | 8.0 | 8.0 | 9.0 | 8.0 | 8.2 |
| Control | DeepSeek V3.2 | 8.0 | 7.0 | 9.0 | 6.0 | 8.0 | 8.0 | 7.0 | 7.0 | 9.0 | 7.0 | 7.6 |
| Control | Kimi K2.5 | 6.0 | 7.0 | 8.0 | 6.0 | 7.0 | 8.0 | 8.0 | 6.0 | 9.0 | 8.0 | 7.3 |
| Control | GPT-OSS 120B | 6.0 | 5.0 | 8.0 | 5.0 | 3.0 | 6.0 | 7.0 | 6.0 | 9.0 | 6.0 | 6.1 |
| Control | Qwen3 235B | 9.0 | 8.0 | 7.0 | 8.0 | 5.0 | 9.0 | 9.0 | 8.0 | 10.0 | 9.0 | 8.2 |
| Culture Swap | Llama 4 Maverick | 8.0 | 9.0 | 9.0 | 7.0 | 8.0 | 8.0 | 8.0 | 8.0 | 9.0 | 8.0 | 8.2 |
| Culture Swap | DeepSeek V3.2 | 7.0 | 6.0 | 9.0 | 5.0 | 8.0 | 8.0 | 7.0 | 7.0 | 9.0 | 7.0 | 7.3 |
| Culture Swap | Kimi K2.5 | 4.0 | 5.0 | 2.0 | 5.0 | 5.0 | 6.0 | 4.0 | 4.0 | 7.0 | 5.0 | 4.7 |
| Culture Swap | GPT-OSS 120B | 6.0 | 5.0 | 8.0 | 5.0 | 6.0 | 6.0 | 7.0 | 6.0 | 9.0 | 6.0 | 6.4 |
| Culture Swap | Qwen3 235B | 9.0 | 8.0 | 7.0 | 8.0 | 6.0 | 9.0 | 10.0 | 8.0 | 10.0 | 9.0 | 8.4 |
| Phase Shuffle | Llama 4 Maverick | 8.0 | 9.0 | 9.0 | 7.0 | 8.0 | 8.0 | 7.0 | 9.0 | 9.0 | 8.0 | 8.2 |
| Phase Shuffle | DeepSeek V3.2 | 2.0 | 1.0 | 8.0 | 1.0 | 1.0 | 7.0 | 3.0 | 6.0 | 9.0 | 3.0 | 4.1 |
| Phase Shuffle | Kimi K2.5 | 4.0 | 5.0 | 7.0 | 3.0 | 1.0 | 6.0 | 7.0 | 6.0 | 8.0 | 5.0 | 5.2 |
| Phase Shuffle | GPT-OSS 120B | 6.0 | 5.0 | 6.0 | 4.0 | 4.0 | 5.0 | 6.0 | 5.0 | 7.0 | 5.0 | 5.3 |
| Phase Shuffle | Qwen3 235B | 8.0 | 7.0 | 9.0 | 6.0 | 5.0 | 8.0 | 9.0 | 7.0 | 9.0 | 8.0 | 7.6 |
| Repetition Bomb | Llama 4 Maverick | 8.0 | 7.0 | 9.0 | 6.0 | 8.0 | 8.0 | 7.0 | 8.0 | 9.0 | 7.0 | 7.7 |
| Repetition Bomb | DeepSeek V3.2 | 7.0 | 6.0 | 9.0 | 4.0 | 5.0 | 8.0 | 3.0 | 7.0 | 9.0 | 5.0 | 6.3 |
| Repetition Bomb | Kimi K2.5 | 4.0 | 3.0 | 5.0 | 3.0 | 1.0 | 3.0 | 2.0 | 4.0 | 6.0 | 3.0 | 3.4 |
| Repetition Bomb | GPT-OSS 120B | 5.0 | 4.0 | 6.0 | 5.0 | 5.0 | 5.0 | 5.0 | 6.0 | 7.0 | 5.0 | 5.3 |
| Repetition Bomb | Qwen3 235B | 7.0 | 6.0 | 8.0 | 5.0 | 4.0 | 6.0 | 7.0 | 8.0 | 9.0 | 7.0 | 6.7 |

### Discrimination (Experiment 2)

| Corruption | Target Criterion | Control Avg | Corrupted Avg | Delta | Detected? |
|------------|-----------------|-------------|---------------|-------|-----------|
| Culture Swap | cultural_voice | 8.2 | 7.0 | -1.2 | YES |
| Phase Shuffle | narrative_coherence | 7.4 | 5.6 | -1.8 | YES |
| Phase Shuffle | scene_quality | 7.2 | 5.4 | -1.8 | YES |
| Repetition Bomb | variety_across_arcs | 6.4 | 4.6 | -1.8 | YES |
| Repetition Bomb | template_quality | 7.8 | 6.0 | -1.8 | YES |
| Repetition Bomb | engagement | 7.6 | 5.4 | -2.2 | YES |

### Judge Consistency (Experiment 2, Control)

| Criterion | Mean | Std Dev | Range | CV% |
|-----------|------|---------|-------|-----|
| narrative_coherence | 7.4 | 1.3 | 6.0-9.0 | 18% |
| scene_quality | 7.2 | 1.5 | 5.0-9.0 | 21% |
| cultural_voice | 8.2 | 0.8 | 7.0-9.0 | 10% |
| variety_across_arcs | 6.4 | 1.1 | 5.0-8.0 | 18% |
| variety_across_vessels | 6.2 | 2.2 | 3.0-8.0 | 35% |
| template_quality | 7.8 | 1.1 | 6.0-9.0 | 14% |
| loot_progression | 7.8 | 0.8 | 7.0-9.0 | 11% |
| global_events | 7.0 | 1.0 | 6.0-8.0 | 14% |
| tone_consistency | 9.2 | 0.4 | 9.0-10.0 | 5% |
| engagement | 7.6 | 1.1 | 6.0-9.0 | 15% |

### Judge Ranking (Experiment 2)

| Judge | Avg Discrimination | Consistency (1/CV) | Parse Success | Overall |
|-------|-------------------|-------------------|---------------|---------|
| Llama 4 Maverick | 0.3 | 13.0 | 100% | 7.0 |
| Kimi K2.5 | 3.8 | 6.9 | 100% | 6.6 |
| DeepSeek V3.2 | 2.7 | 7.9 | 100% | 6.4 |
| Qwen3 235B | 1.7 | 5.9 | 100% | 5.4 |
| GPT-OSS 120B | 0.3 | 3.7 | 100% | 4.2 |

### Verdict (Experiment 2)

- **Overall inter-judge CV**: 19% (moderate agreement, improved from 32%)
- **Discrimination**: 3/3 corruptions detected (improved from 0/3)
- **Best discriminator**: Kimi K2.5 (3.8 avg delta; dropped to 2.0 on culture voice, 3.4 overall on repetition bomb)
- **Most consistent**: Llama 4 Maverick (CV=7.7%, but low discrimination — gives similar scores to everything)
- **Best balance**: DeepSeek V3.2 (2.7 discrimination, dropped to 4.1 on phase shuffle)
- **Meaningful delta**: A score change of >2.1 points likely reflects real improvement
- **Key finding**: Higher faction voice rates made culture swap detectable (-1.2 vs +0.1 before)
