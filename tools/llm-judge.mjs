#!/usr/bin/env node
// LLM-as-Judge: Evaluates and expands game narrative templates via multi-provider LLM APIs
// Usage: node tools/llm-judge.mjs [--expand] [--phase PHASE] [--culture CULTURE]
// Models rotated randomly each cycle: 1 generator + 2 judges from diverse pool
// Providers: DeepInfra + OpenRouter (free tier)

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Load keys from .env
const envPath = join(ROOT, '.env');
if (!existsSync(envPath)) {
  console.error('Missing .env file. Create one with DEEPINFRA_API_KEY and/or OPENROUTER_API_KEY');
  process.exit(1);
}
const envVars = Object.fromEntries(
  readFileSync(envPath, 'utf8').split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);

// Provider configs
const PROVIDERS = {};
if (envVars.DEEPINFRA_API_KEY) {
  PROVIDERS.deepinfra = {
    url: 'https://api.deepinfra.com/v1/openai/chat/completions',
    key: envVars.DEEPINFRA_API_KEY,
  };
}
if (envVars.OPENROUTER_API_KEY) {
  PROVIDERS.openrouter = {
    url: 'https://openrouter.ai/api/v1/chat/completions',
    key: envVars.OPENROUTER_API_KEY,
  };
}
if (Object.keys(PROVIDERS).length === 0) {
  console.error('No API keys found. Set DEEPINFRA_API_KEY and/or OPENROUTER_API_KEY in .env');
  process.exit(1);
}

// Model pool: each entry has { id, provider, label }
// DeepInfra models (paid, reliable)
const DEEPINFRA_MODELS = [
  { id: 'google/gemma-3-27b-it', provider: 'deepinfra', label: 'Gemma 3 27B' },
  { id: 'mistralai/Mistral-Small-3.2-24B-Instruct-2506', provider: 'deepinfra', label: 'Mistral Small 3.2' },
  { id: 'openai/gpt-oss-120b', provider: 'deepinfra', label: 'GPT-OSS 120B' },
  { id: 'Qwen/Qwen2.5-72B-Instruct', provider: 'deepinfra', label: 'Qwen 2.5 72B' },
  { id: 'meta-llama/Llama-3.3-70B-Instruct-Turbo', provider: 'deepinfra', label: 'Llama 3.3 70B' },
  { id: 'deepseek-ai/DeepSeek-V3.2', provider: 'deepinfra', label: 'DeepSeek V3.2' },
];

// OpenRouter free models (no cost, may have rate limits)
const OPENROUTER_MODELS = [
  { id: 'google/gemma-3-27b-it:free', provider: 'openrouter', label: 'Gemma 3 27B (OR)' },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', provider: 'openrouter', label: 'Llama 3.3 70B (OR)' },
  { id: 'mistralai/mistral-small-3.1-24b-instruct:free', provider: 'openrouter', label: 'Mistral Small 3.1 (OR)' },
  { id: 'nousresearch/hermes-3-llama-3.1-405b:free', provider: 'openrouter', label: 'Hermes 3 405B (OR)' },
  { id: 'openai/gpt-oss-120b:free', provider: 'openrouter', label: 'GPT-OSS 120B (OR)' },
  { id: 'qwen/qwen3-coder:free', provider: 'openrouter', label: 'Qwen3 Coder 480B (OR)' },
  { id: 'nvidia/nemotron-3-nano-30b-a3b:free', provider: 'openrouter', label: 'Nemotron Nano 30B (OR)' },
  { id: 'stepfun/step-3.5-flash:free', provider: 'openrouter', label: 'Step 3.5 Flash (OR)' },
  { id: 'qwen/qwen3-next-80b-a3b-instruct:free', provider: 'openrouter', label: 'Qwen3 Next 80B (OR)' },
];

// Build available pools — prefer DeepInfra (paid, reliable), OpenRouter as supplement
const ALL_MODELS = [
  ...(PROVIDERS.deepinfra ? DEEPINFRA_MODELS : []),
  ...(PROVIDERS.openrouter ? OPENROUTER_MODELS : []),
];

function pickRandom(arr, exclude = []) {
  const pool = arr.filter(m => !exclude.some(e => e.id === m.id));
  return pool[Math.floor(Math.random() * pool.length)];
}

// Select models: prefer DeepInfra for reliability, mix in at most 1 OpenRouter
function selectModels() {
  const diModels = PROVIDERS.deepinfra ? DEEPINFRA_MODELS : [];
  const orModels = PROVIDERS.openrouter ? OPENROUTER_MODELS : [];

  if (diModels.length >= 3) {
    // Pick 2 judges from DeepInfra, generator from DeepInfra or OpenRouter
    const judge1 = pickRandom(diModels);
    const judge2 = pickRandom(diModels, [judge1]);
    const genPool = orModels.length > 0 && Math.random() < 0.3 ? orModels : diModels;
    const gen = pickRandom(genPool, [judge1, judge2]);
    return { gen, judges: [judge1, judge2] };
  }
  // Fallback: pick from whatever is available
  const gen = pickRandom(ALL_MODELS);
  const judge1 = pickRandom(ALL_MODELS, [gen]);
  const judge2 = pickRandom(ALL_MODELS, [gen, judge1]);
  return { gen, judges: [judge1, judge2] };
}

const MODELS = selectModels();

// Import game data dynamically
const dataPath = join(ROOT, 'js/data.js');
const dataSource = readFileSync(dataPath, 'utf8');

// Parse key arrays from data.js (they're ES module exports, so we eval-extract)
function extractArray(name) {
  const re = new RegExp(`export const ${name}\\s*=\\s*(\\{[\\s\\S]*?\\});|export const ${name}\\s*=\\s*(\\[[\\s\\S]*?\\]);`, 'm');
  const match = dataSource.match(re);
  if (!match) return null;
  const raw = match[1] || match[2];
  try {
    return Function(`"use strict"; return (${raw})`)();
  } catch (e) {
    return null;
  }
}

const PHASE_TEMPLATES = extractArray('PHASE_TEMPLATES');
const RELAY_TEMPLATES = extractArray('RELAY_TEMPLATES');
const INTERACTION_TEMPLATES = extractArray('INTERACTION_TEMPLATES');
const PHASE_OBJECTIVES = extractArray('PHASE_OBJECTIVES');
const RELAY_OBJECTIVES = extractArray('RELAY_OBJECTIVES');
const CULTURES = extractArray('CULTURES');
const LOOT = extractArray('LOOT');
const NPCS = extractArray('NPCS');
const WEATHER = extractArray('WEATHER');
const OBSTACLES = extractArray('OBSTACLES');
const DIRECTIONS = extractArray('DIRECTIONS');

const PHASES = ['IDLE', 'SIGNAL', 'TRAVERSE', 'BREACH', 'FAULT', 'CORE', 'REBOOT'];
const CULTURE_KEYS = CULTURES ? Object.keys(CULTURES) : ['determinist', 'stochast', 'swarm', 'recursive', 'archivist'];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

// Simulate template filling (simplified version of game.js fillTemplate)
function fillTemplate(template, phase, culture) {
  let text = template;
  text = text.replace(/\{designation\}/g, `${pick(['CALC','VECT','NODE','UNIT','FLUX'])}-${randInt(1,99)}`);
  text = text.replace(/\{culture_speech\}/g, CULTURES ? pick(CULTURES[culture].speech) : 'Protocol states:');
  text = text.replace(/\{zone\}/g, pick(['Dead Mall Sector', 'Reactor Sub-Level 3', 'Orbital Relay Gamma', 'Overgrown Server Farm', 'Nuclear Cooling Pond']));
  text = text.replace(/\{loot\}/g, LOOT ? pick(LOOT) : 'corroded data chip');
  text = text.replace(/\{npc\}/g, NPCS ? pick(NPCS) : 'a dormant sentry turret');
  text = text.replace(/\{weather\}/g, WEATHER ? pick(WEATHER) : 'Electromagnetic interference detected.');
  text = text.replace(/\{obstacle\}/g, OBSTACLES ? pick(OBSTACLES) : 'Collapsed tunnel ahead.');
  text = text.replace(/\{integrity\}/g, String(randInt(3, 10)));
  text = text.replace(/\{energy\}/g, String(randInt(2, 10)));
  text = text.replace(/\{hardware\}/g, String(randInt(1, 5)));
  text = text.replace(/\{interface\}/g, String(randInt(1, 5)));
  text = text.replace(/\{research\}/g, String(randInt(1, 5)));
  text = text.replace(/\{directive\}/g, pick(['Map subsurface tunnels', 'Maintain cooling systems', 'Catalog surviving databases', 'Patrol exclusion zone']));
  text = text.replace(/\{glitch\}/g, pick(['phantom echoes on sonar', 'spontaneous reboot every 72h', 'left motor draws 2x power']));
  text = text.replace(/\{arc_count\}/g, String(randInt(1, 8)));
  text = text.replace(/\{sat_health\}/g, String(randInt(0, 5)));
  text = text.replace(/\{rand_direction\}/g, DIRECTIONS ? pick(DIRECTIONS) : 'northeast');
  text = text.replace(/\{rand:(\d+)-(\d+)\}/g, (_, a, b) => String(randInt(parseInt(a), parseInt(b))));
  text = text.replace(/\{glitch_event\}/g, '');
  // Interaction-specific
  text = text.replace(/\{self\}/g, `UNIT-${randInt(1,50)}`);
  text = text.replace(/\{other\}/g, `NODE-${randInt(1,50)}`);
  text = text.replace(/\{other_hp\}/g, String(randInt(1, 10)));
  text = text.replace(/\{other_arc\}/g, String(randInt(1, 8)));
  text = text.replace(/\{culture_speech_other\}/g, 'Pattern confidence:');
  return text;
}

// Call LLM API with retry + exponential backoff (supports DeepInfra + OpenRouter)
async function llmCall(modelObj, messages, temperature = 0.7, maxRetries = 5) {
  const provider = PROVIDERS[modelObj.provider];
  if (!provider) throw new Error(`No API key for provider: ${modelObj.provider}`);

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${provider.key}`,
  };
  // OpenRouter requires HTTP-Referer
  if (modelObj.provider === 'openrouter') {
    headers['HTTP-Referer'] = 'https://signal.vuvko.net';
    headers['X-Title'] = 'Signal Lost LLM Judge';
  }

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const resp = await fetch(provider.url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ model: modelObj.id, messages, temperature, max_tokens: 8000 }),
      });
      if (resp.status === 429 || resp.status === 503) {
        const wait = Math.min(2000 * Math.pow(2, attempt), 30000);
        if (attempt < maxRetries) {
          process.stdout.write(`[retry ${attempt + 1} in ${(wait/1000).toFixed(0)}s] `);
          await new Promise(r => setTimeout(r, wait));
          continue;
        }
      }
      if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`API error ${resp.status}: ${err}`);
      }
      const data = await resp.json();
      return data.choices[0].message.content;
    } catch (e) {
      if (attempt < maxRetries && (e.message.includes('429') || e.message.includes('503') || e.message.includes('fetch'))) {
        const wait = Math.min(2000 * Math.pow(2, attempt), 30000);
        process.stdout.write(`[retry ${attempt + 1} in ${(wait/1000).toFixed(0)}s] `);
        await new Promise(r => setTimeout(r, wait));
        continue;
      }
      throw e;
    }
  }
}

// ============================================================
// JUDGE: Evaluate a batch of filled templates
// ============================================================
async function judgeTemplates(category, phase, templates, culture) {
  // Fill templates with sample data
  const samples = templates.map(t => fillTemplate(t, phase, culture || 'determinist'));

  const prompt = `You are an expert game narrative reviewer for a post-apocalyptic AI terminal game called "Signal Lost". The game has zero-player RPG logs displayed in a terminal aesthetic.

SETTING: Post-human world. All characters are AI systems (no humans). 5 AI cultures (Determinists=rule-based, Stochasts=ML, Swarm=distributed, Recursive=self-modifying, Archivists=database). Vessels explore ruins, hack facilities, and decode signals.

CRITICAL TONE GUIDELINES:
- Logs read like terse field reports from autonomous robots — short, concrete, evocative
- GOOD: "Hull breach sealed with emergency foam. Pressure holding at {rand:60-90}%. Moving to {zone}."
- GOOD: "Dormant sentry at junction 7. {culture_speech} Rerouting {rand_direction}."
- BAD: "Implementing recursive backtracking algorithms to optimize pathfinding subroutines" (pure jargon, no scene)
- BAD: "Deploying distributed hash table synchronization protocols across mesh network" (gibberish, not a log)
- Each entry should paint a SCENE or describe an ACTION, not just list technical terms
- Technical language is fine when it serves the narrative (e.g. "signal degraded to {rand:10-40}%") but should never dominate
- Avoid stacking multiple jargon terms without concrete imagery or action

EVALUATE these ${category} templates for phase "${phase}"${culture ? ` (culture: ${culture})` : ''}:

RAW TEMPLATES:
${templates.map((t, i) => `${i + 1}. "${t}"`).join('\n')}

FILLED EXAMPLES (with random data substituted):
${samples.map((s, i) => `${i + 1}. "${s}"`).join('\n')}

Score each template 1-5 on these criteria:
- ATMOSPHERE: Does it evoke a post-apocalyptic scene? Can you picture what's happening?
- VARIETY: Is it distinct from the others? Does it add a new scenario or angle?
- TEMPLATE_QUALITY: Are the {variable} placements natural? Does the filled version read well?
- READABILITY: Is it clear and concrete, or is it jargon soup? Would a non-programmer understand the gist?
- IMMERSION: Would this text hold a player's attention in a scrolling log feed?

Then provide:
1. OVERALL VERDICT: PASS (avg >= 3.5) or NEEDS_WORK (avg < 3.5)
2. WEAK SPOTS: Which specific templates are too jargon-heavy, too vague, or lack concrete imagery
3. MISSING THEMES: What scenarios/situations are missing (e.g. weather events, creature encounters, structural hazards, eerie discoveries)
4. SUGGESTED NEW TEMPLATES: Write 3-5 NEW templates using the same variables that paint vivid, concrete scenes

Respond in JSON format. Keep "note" fields under 15 words each. No markdown wrapping.
{
  "scores": [{"id": 1, "atmosphere": N, "variety": N, "template_quality": N, "readability": N, "immersion": N, "avg": N, "note": "brief"}],
  "verdict": "PASS|NEEDS_WORK",
  "weak_spots": ["..."],
  "missing_themes": ["..."],
  "new_templates": ["template string with {variables}..."]
}`;

  // Query both judges in parallel
  const judgeResults = await Promise.allSettled(
    MODELS.judges.map(model => llmCall(model, [{ role: 'user', content: prompt }], 0.3))
  );

  const parsed = [];
  for (let j = 0; j < judgeResults.length; j++) {
    const r = judgeResults[j];
    const modelName = MODELS.judges[j].label;
    if (r.status === 'rejected') {
      console.error(`  [${modelName}] failed: ${r.reason?.message}`);
      continue;
    }
    try {
      const raw = r.value;
      // Strip thinking tags (Qwen3 etc.)
      const cleaned = raw.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, cleaned];
      const text = jsonMatch[1] || cleaned;
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        const obj = JSON.parse(text.slice(start, end + 1));
        obj._judge = MODELS.judges[j].label;
        parsed.push(obj);
      }
    } catch (e) {
      console.error(`  [${modelName}] parse error: ${e.message}`);
    }
  }

  if (parsed.length === 0) {
    return { verdict: 'PARSE_ERROR', scores: [], _judges: MODELS.judges.map(m => m.label) };
  }

  // Merge: average scores across judges, union weak_spots and missing_themes
  const merged = {
    scores: parsed[0].scores || [],
    verdict: 'PASS',
    weak_spots: [...new Set(parsed.flatMap(p => p.weak_spots || []))],
    missing_themes: [...new Set(parsed.flatMap(p => p.missing_themes || []))],
    new_templates: [...new Set(parsed.flatMap(p => p.new_templates || []))],
    _judges: MODELS.judges.map(m => m.label),
  };

  // If both parsed, average the scores
  if (parsed.length === 2 && parsed[1].scores) {
    for (let i = 0; i < merged.scores.length && i < parsed[1].scores.length; i++) {
      for (const key of ['atmosphere', 'variety', 'template_quality', 'readability', 'immersion', 'avg']) {
        const a = merged.scores[i][key] || 0;
        const b = parsed[1].scores[i][key] || 0;
        merged.scores[i][key] = +((a + b) / 2).toFixed(1);
      }
    }
  }

  // Recalculate verdict from averaged scores
  if (merged.scores.length > 0) {
    const overallAvg = merged.scores.reduce((s, t) => s + (t.avg || 0), 0) / merged.scores.length;
    merged.verdict = overallAvg >= 3.5 ? 'PASS' : 'NEEDS_WORK';
  }

  return merged;
}

// ============================================================
// EXPAND: Generate new templates based on judge feedback
// ============================================================
async function expandTemplates(category, phase, existing, feedback, culture) {
  const missingThemes = feedback.missing_themes || [];
  const weakSpots = feedback.weak_spots || [];

  const prompt = `You are writing narrative log templates for "Signal Lost", a post-apocalyptic AI terminal RPG.

SETTING: Post-human world, AI-only characters. Logs read like terse field reports from autonomous robots exploring ruins. Each entry paints a concrete SCENE or describes a specific ACTION in 1-3 sentences.

CRITICAL RULES:
- GOOD: "Collapsed overpass at {zone}. Debris field spans {rand:20-80}m. {culture_speech} Scanning for alternate route {rand_direction}."
- GOOD: "Contact with {npc}. No hostile intent detected. {weather} Integrity holding at {integrity}/10."
- BAD: "Implementing distributed consensus protocols for mesh synchronization" (jargon soup, no scene)
- BAD: "Applying recursive tree traversal to optimize substrate allocation" (gibberish)
- Every template MUST describe something the vessel sees, does, or encounters
- Technical language should serve the scene, not replace it
- {cs} is optional — only use it if it fits naturally, never force it

CATEGORY: ${category}, PHASE: ${phase}${culture ? `, CULTURE: ${culture}` : ''}

EXISTING TEMPLATES (${existing.length}):
${existing.map((t, i) => `${i + 1}. "${t}"`).join('\n')}

JUDGE FEEDBACK:
- Weak spots: ${weakSpots.join('; ') || 'None noted'}
- Missing themes: ${missingThemes.join('; ') || 'None noted'}
- Suggested improvements from judge: ${(feedback.new_templates || []).join(' | ').slice(0, 500)}

AVAILABLE VARIABLES: {zone}, {loot}, {cs}, {obstacle}, {weather}, {npc}, {culture_speech}, {integrity}, {energy}, {rand:MIN-MAX}, {rand_direction}, {designation}, {glitch_event}, {directive}, {glitch}, {arc_count}, {sat_health}, {hardware}, {interface}, {research}

PHASE CONTEXT:
- IDLE: Vessel is powered down, recharging, trading data with nearby units, observing surroundings
- SIGNAL: Detecting anomalies, scanning terrain, picking up transmissions, triangulating sources
- TRAVERSE: Moving through ruins, crossing hazardous terrain, navigating obstacles, encountering wildlife/machines
- BREACH: Entering sealed facilities, bypassing security, hacking doors, disabling defenses
- FAULT: Systems failing, hostile encounters, environmental dangers, integrity damage, emergencies
- CORE: Reaching the objective, making discoveries, accessing critical data, confronting threats
- REBOOT: Exiting the site, collecting salvage, assessing damage, planning next move

Write exactly 5 NEW templates that:
1. Are DISTINCT from existing ones (different scenarios, different sentence structures)
2. Use {variables} naturally — each template should have 2-4 variables woven into the scene
3. Paint a vivid, concrete picture (what does the vessel see/do/encounter?)
4. Feel like terse field reports, not flowery prose or technical documentation
5. Are 1-3 sentences each
6. Address the missing themes and weak spots noted above

Return ONLY a JSON array of 5 template strings. No explanation.
["template1...", "template2...", ...]`;

  const result = await llmCall(MODELS.gen, [
    { role: 'user', content: prompt },
  ], 0.8);

  try {
    // Strip thinking tags (Qwen3 etc.)
    const cleaned = result.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, cleaned];
    const text = jsonMatch[1] || cleaned;
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    if (start !== -1 && end !== -1) {
      return JSON.parse(text.slice(start, end + 1));
    }
  } catch (e) {
    console.error(`  Failed to parse expansion for ${category}/${phase}: ${e.message}`);
  }
  return [];
}

// ============================================================
// MAIN: Run the judge loop
// ============================================================
const args = process.argv.slice(2);
const doExpand = args.includes('--expand');
const phaseFilter = args.includes('--phase') ? args[args.indexOf('--phase') + 1]?.toUpperCase() : null;
const cultureFilter = args.includes('--culture') ? args[args.indexOf('--culture') + 1] : null;

const results = {};
let totalPass = 0;
let totalFail = 0;

console.log('=== SIGNAL LOST — LLM-AS-JUDGE ===');
console.log(`Judges:    ${MODELS.judges.map(m => `${m.label} [${m.provider}]`).join(' + ')}`);
console.log(`Generator: ${MODELS.gen.label} [${MODELS.gen.provider}]`);
console.log(`Mode:        ${doExpand ? 'EVALUATE + EXPAND' : 'EVALUATE ONLY'}`);
console.log(`Filters:     phase=${phaseFilter || 'all'} culture=${cultureFilter || 'all'}`);
console.log('');

async function run() {
  const allNewTemplates = {};

  // 1. Judge PHASE_TEMPLATES
  if (PHASE_TEMPLATES) {
    console.log('--- PHASE_TEMPLATES ---');
    for (const phase of PHASES) {
      if (phaseFilter && phase !== phaseFilter) continue;
      const templates = PHASE_TEMPLATES[phase];
      if (!templates || templates.length === 0) continue;

      process.stdout.write(`  ${phase} (${templates.length} templates)... `);
      const feedback = await judgeTemplates('PHASE_TEMPLATES', phase, templates);
      const verdict = feedback.verdict || 'UNKNOWN';
      const avgScore = feedback.scores
        ? (feedback.scores.reduce((s, t) => s + (t.avg || 0), 0) / feedback.scores.length).toFixed(1)
        : '?';

      if (verdict === 'PASS') totalPass++;
      else totalFail++;

      console.log(`${verdict} (avg: ${avgScore})`);

      if (feedback.weak_spots?.length) {
        for (const w of feedback.weak_spots.slice(0, 2)) {
          console.log(`    ! ${w}`);
        }
      }

      results[`PHASE_TEMPLATES.${phase}`] = feedback;

      if (doExpand && (verdict !== 'PASS' || templates.length < 8)) {
        process.stdout.write(`    Expanding... `);
        const newTemplates = await expandTemplates('PHASE_TEMPLATES', phase, templates, feedback);
        console.log(`+${newTemplates.length} templates`);
        if (newTemplates.length > 0) {
          allNewTemplates[`PHASE_TEMPLATES.${phase}`] = newTemplates;
          for (const t of newTemplates) {
            console.log(`    + "${t.slice(0, 80)}${t.length > 80 ? '...' : ''}"`);
          }
        }
      }
    }
    console.log('');
  }

  // 2. Judge RELAY_TEMPLATES
  if (RELAY_TEMPLATES) {
    console.log('--- RELAY_TEMPLATES ---');
    for (const phase of PHASES) {
      if (phaseFilter && phase !== phaseFilter) continue;
      const templates = RELAY_TEMPLATES[phase];
      if (!templates || templates.length === 0) continue;

      process.stdout.write(`  ${phase} (${templates.length} templates)... `);
      const feedback = await judgeTemplates('RELAY_TEMPLATES', phase, templates);
      const verdict = feedback.verdict || 'UNKNOWN';
      const avgScore = feedback.scores
        ? (feedback.scores.reduce((s, t) => s + (t.avg || 0), 0) / feedback.scores.length).toFixed(1)
        : '?';

      if (verdict === 'PASS') totalPass++;
      else totalFail++;

      console.log(`${verdict} (avg: ${avgScore})`);
      results[`RELAY_TEMPLATES.${phase}`] = feedback;

      if (doExpand && (verdict !== 'PASS' || templates.length < 6)) {
        process.stdout.write(`    Expanding... `);
        const newTemplates = await expandTemplates('RELAY_TEMPLATES', phase, templates, feedback);
        console.log(`+${newTemplates.length} templates`);
        if (newTemplates.length > 0) {
          allNewTemplates[`RELAY_TEMPLATES.${phase}`] = newTemplates;
        }
      }
    }
    console.log('');
  }

  // 3. Judge INTERACTION_TEMPLATES
  if (INTERACTION_TEMPLATES) {
    console.log('--- INTERACTION_TEMPLATES ---');
    for (const type of Object.keys(INTERACTION_TEMPLATES)) {
      const templates = INTERACTION_TEMPLATES[type];
      if (!templates || templates.length === 0) continue;

      process.stdout.write(`  ${type} (${templates.length} templates)... `);
      const feedback = await judgeTemplates('INTERACTION_TEMPLATES', type, templates);
      const verdict = feedback.verdict || 'UNKNOWN';
      const avgScore = feedback.scores
        ? (feedback.scores.reduce((s, t) => s + (t.avg || 0), 0) / feedback.scores.length).toFixed(1)
        : '?';

      if (verdict === 'PASS') totalPass++;
      else totalFail++;

      console.log(`${verdict} (avg: ${avgScore})`);
      results[`INTERACTION_TEMPLATES.${type}`] = feedback;

      if (doExpand && (verdict !== 'PASS' || templates.length < 6)) {
        process.stdout.write(`    Expanding... `);
        const newTemplates = await expandTemplates('INTERACTION_TEMPLATES', type, templates, feedback);
        console.log(`+${newTemplates.length} templates`);
        if (newTemplates.length > 0) {
          allNewTemplates[`INTERACTION_TEMPLATES.${type}`] = newTemplates;
        }
      }
    }
    console.log('');
  }

  // 4. Judge PHASE_OBJECTIVES
  if (PHASE_OBJECTIVES) {
    console.log('--- PHASE_OBJECTIVES ---');
    for (const phase of PHASES) {
      if (phaseFilter && phase !== phaseFilter) continue;
      const templates = PHASE_OBJECTIVES[phase];
      if (!templates || templates.length === 0) continue;

      process.stdout.write(`  ${phase} (${templates.length} templates)... `);
      const feedback = await judgeTemplates('PHASE_OBJECTIVES', phase, templates);
      const verdict = feedback.verdict || 'UNKNOWN';

      if (verdict === 'PASS') totalPass++;
      else totalFail++;

      console.log(`${verdict}`);
      results[`PHASE_OBJECTIVES.${phase}`] = feedback;
    }
    console.log('');
  }

  // Summary
  console.log('=== SUMMARY ===');
  console.log(`PASS: ${totalPass}  NEEDS_WORK: ${totalFail}`);
  console.log(`Models used:`);
  console.log(`  Judges:    ${MODELS.judges.map(m => `${m.label} [${m.provider}]`).join(' + ')}`);
  console.log(`  Generator: ${MODELS.gen.label} [${MODELS.gen.provider}]`);

  // Save full results with model metadata
  const reportPath = join(ROOT, 'tools/judge-report.json');
  const report = {
    _meta: {
      timestamp: new Date().toISOString(),
      judges: MODELS.judges.map(m => ({ id: m.id, provider: m.provider, label: m.label })),
      generator: { id: MODELS.gen.id, provider: MODELS.gen.provider, label: MODELS.gen.label },
      pass: totalPass,
      needs_work: totalFail,
    },
    ...results,
  };
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`Full report: ${reportPath}`);

  // Save new templates if expanding
  if (doExpand && Object.keys(allNewTemplates).length > 0) {
    const expandPath = join(ROOT, 'tools/judge-expansions.json');
    writeFileSync(expandPath, JSON.stringify(allNewTemplates, null, 2));
    console.log(`New templates: ${expandPath}`);
    console.log(`\nTo apply: node tools/llm-judge.mjs --apply`);
  }

  // Apply mode: inject new templates into data.js
  if (args.includes('--apply')) {
    const expandPath = join(ROOT, 'tools/judge-expansions.json');
    try {
      const expansions = JSON.parse(readFileSync(expandPath, 'utf8'));
      let modified = readFileSync(dataPath, 'utf8');
      let applied = 0;

      for (const [key, newTemplates] of Object.entries(expansions)) {
        const [tableName, subKey] = key.split('.');
        // Find the array in data.js and append templates
        for (const template of newTemplates) {
          // Validate template has proper variables
          if (!template.includes('{') && !template.match(/^[A-Z]/)) continue;
          // Clean the template
          const clean = template.replace(/'/g, "\\'").trim();
          if (clean.length < 10) continue;

          // Find the closing bracket of the sub-array
          const searchKey = subKey.toUpperCase ? subKey : subKey;
          // This is fragile but works for the known structure
          const pattern = new RegExp(
            `(${tableName}[\\s\\S]*?${searchKey}:\\s*\\[[^\\]]*?)(\\s*\\])`,
            'm'
          );
          const match = modified.match(pattern);
          if (match) {
            modified = modified.replace(pattern, `$1,\n    '${clean}'$2`);
            applied++;
          }
        }
      }

      if (applied > 0) {
        writeFileSync(dataPath, modified);
        console.log(`Applied ${applied} new templates to js/data.js`);
      } else {
        console.log('No templates applied (check expansions file).');
      }
    } catch (e) {
      console.error(`Cannot apply: ${e.message}`);
    }
  }
}

run().catch(e => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
