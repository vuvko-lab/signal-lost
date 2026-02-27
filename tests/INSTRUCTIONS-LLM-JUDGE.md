# LLM-as-Judge Testing

## Overview

Use an LLM to evaluate the quality of generated game text. The game generates log entries from templates + faction voice modifiers, and an external LLM reviews them for quality, consistency, and engagement.

## Step 1: Generate Sample Logs

```bash
node tests/generate-sample-logs.mjs --entries 40 --output tests/sample-logs.txt
```

This simulates ~30 minutes of game time per faction and captures up to 40 log entries each.

## Step 2: Submit to LLM for Review

Feed the generated `tests/sample-logs.txt` to an LLM (Claude, GPT-4, etc.) with this evaluation prompt:

---

### Evaluation Prompt

You are reviewing procedurally generated log entries from a zero-player RPG called "Signal Lost." The game features AI vessels exploring a post-human world, and each vessel belongs to one of five factions with distinct communication styles.

Please evaluate the following sample logs on these criteria (score each 1-5, with commentary):

**1. Faction Voice Distinctiveness (1-5)**
Can you tell which faction wrote each section purely from the writing style? Do Determinists sound rigid and procedural? Do Stochasts sound probabilistic? Do Swarm units use collective pronouns? Do Recursive egos reference version numbers and self-modification? Do Archivists cite catalog references?

**2. Template Quality (1-5)**
Are there any broken placeholders (like literal `{zone}` or `{loot}` appearing in text)? Do the filled-in values make sense in context?

**3. Narrative Coherence (1-5)**
Do sequential entries within a mission arc feel like a progression? Does the story make sense as it moves through phases (IDLE → SIGNAL → TRAVERSE → BREACH → FAULT → CORE → REBOOT)?

**4. Variety (1-5)**
Do entries feel repetitive, or is there enough variation in phrasing, events, and details?

**5. Grammar and Flow (1-5)**
Is the text grammatically correct? Does it read naturally for a terminal/log format?

**6. CS/AI Educational Content (1-5)**
Are computer science concepts woven in naturally, or do they feel forced? Do they enhance the setting?

**7. Engagement (1-5)**
Would a player enjoy reading these logs? Do they create a sense of story and stakes?

**Overall Score: X/35**

Please also list:
- Top 3 strengths
- Top 3 issues to fix (with specific examples from the text)
- Any specific template strings that should be rewritten

---

## Step 3: Apply Feedback

Use the LLM's feedback to:
1. Fix any broken templates in `js/data.js` (PHASE_TEMPLATES, RELAY_TEMPLATES, etc.)
2. Adjust faction voice modifiers in `js/game.js` (applyFactionVoice function)
3. Add more template variety where repetitiveness was flagged
4. Improve CS snippet integration if flagged as forced

## Human Input Needed

- [ ] Run `node tests/generate-sample-logs.mjs --output tests/sample-logs.txt`
- [ ] Submit sample-logs.txt to preferred LLM with the evaluation prompt above
- [ ] Review LLM feedback and decide which changes to implement
- [ ] Iterate: regenerate logs, re-evaluate until quality target is met (aim for 28+/35)
