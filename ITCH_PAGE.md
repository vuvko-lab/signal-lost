# itch.io Page Setup Instructions

## Screenshots Needed

Take these screenshots at **1280x720** or higher resolution:

1. **Boot screen** — The operator ID prompt with terminal-green text on dark background
2. **Single vessel feed** — One vessel column showing log entries scrolling, with stats visible
3. **Multi-vessel view** — 2-3 vessels running simultaneously, showing the column layout
4. **Global phenomenon** — The amber event banner across the top during a phenomenon
5. **Vessel death** — The "SIGNAL LOST" memorial overlay on a destroyed vessel

Bonus: Create an **animated GIF** of log text scrolling for the cover image (very eye-catching on itch.io).

## Cover Image

- **Size:** 630x500 px (2x retina, displays at 315x250)
- **Format:** PNG or animated GIF
- This is the thumbnail in search results, jam listings, and browse pages
- Suggestion: Dark background with the game title in terminal green, maybe a scrolling log GIF

## Banner Image

- **Size:** ~960x250 px, semi-transparent PNG or GIF
- Displayed at the top of the game page
- Suggestion: "SIGNAL LOST" title with green terminal glow effect

## Game Upload

### Building the ZIP

```bash
# From project root — create ZIP with only the active game files
zip -r signal-lost.zip \
  index.html \
  css/ \
  js/ \
  assets/icons/ \
  assets/ambient/ \
  assets/GloryToTheMachine/ \
  -x "assets/_unused/*" "*.DS_Store" "Thumbs.db"
```

**Important constraints:**
- Max 1,000 files after extraction
- Max 500 MB total
- File paths are **case-sensitive** on itch.io servers
- `index.html` must be at the ZIP root

### Upload Settings

- Mark the ZIP as **"This file will be played in the browser"**
- **Viewport size:** 960x600 (or 1024x640 for wider screens)
- **Click to Play:** Enabled (we load audio assets)
- **Fullscreen button:** Auto-provided by itch.io
- **Mobile Friendly:** Enable if CSS responsive (currently partial)

## Page Metadata

### Title
`Signal Lost`

### Short Description (shown in listings)
> A zero-player RPG. Watch AI vessels navigate the ruins of a post-human Earth. You are the operator — but the signal is fading.

### Full Description (Markdown)

```markdown
## What is this?

**Signal Lost** is a [zero-player RPG](https://en.wikipedia.org/wiki/Zero-player_game) — the game plays itself. You are an operator, a passive observer monitoring autonomous AI vessels as they explore the ruins of a war-torn Earth.

Humanity didn't vanish — they fled, abandoning the planet after a devastating conflict with the Architects. What remains is a landscape scarred by that war: derelict cities, unstable reactors, and artifacts no one was meant to find.

## How it works

- Vessels generate their own mission logs in real time
- Five AI cultures (Determinists, Stochasts, Swarm, Recursive, Archivists) with distinct personalities
- 7-phase mission arcs: IDLE → SIGNAL → TRAVERSE → BREACH → FAULT → CORE → REBOOT
- Global phenomena affect all vessels simultaneously
- Satellite network degrades over time — too low and you lose control

## Operator Commands

You have limited influence:
- **Boost** — Improve the next tick outcome for a vessel
- **Ping** — Force a scan that may find loot
- **Inject** — Send a message to a vessel

## Controls

- Click a vessel column to select it as your command target
- Use the buttons in the bottom bar to issue commands
- A-/A+ to adjust font size
- VOL to toggle audio

## Credits

- Music: [GloryToTheMachine](https://glorytothemachine.itch.io/) — CC BY 4.0
- Ambient: [Freesound](https://freesound.org) and [OpenGameArt](https://opengameart.org) contributors
- Icons: SunGraphica — Free
- Setting adapted from [Eclipse Phase](https://eclipsephase.com) by Posthuman Studios — CC BY-NC-SA 4.0
- Narrative templates iteratively expanded using an LLM-as-judge pipeline

## Made for

- [AI Apocalyptic Dark Fantasy Jam](https://itch.io/jam/ai-apocalyptic-dark-fantasy-jam-)
- [AI Browser Game Jam](https://itch.io/jam/ai-browser-game-jam) (theme: "Ghost in the Machine")
```

### Tags (up to 10)
`zero-player`, `idle`, `rpg`, `ai`, `terminal`, `sci-fi`, `atmospheric`, `procedural-generation`, `browser`, `singleplayer`

### Genre
`Simulation` or `RPG`

### Classification
`Game`

### Pricing
`Free` or `Name Your Price` ($0 minimum)

## Page Theme

Customize the itch.io page theme to match the game:
- **Background:** `#0a0a0f` (dark)
- **Text:** `#00ff41` (terminal green)
- **Link:** `#00e5ff` (cyan)
- **Button:** `#00ff41` on `#0a0a0f`

## Pre-Publish Checklist

- [ ] Cover image uploaded (630x500)
- [ ] Banner image uploaded (~960x250)
- [ ] 3-5 screenshots embedded in description
- [ ] ZIP file uploaded and marked as browser-playable
- [ ] Viewport size set (960x600)
- [ ] Short description filled in
- [ ] Full description with credits
- [ ] Tags added (10)
- [ ] Genre selected
- [ ] Test the game in itch.io's embed viewer
- [ ] Verify all file paths are case-correct (itch.io is case-sensitive)
- [ ] Submit to both jams

## Jam Deadlines

- **AI Apocalyptic Dark Fantasy Jam:** Feb 28, 2026
- **AI Browser Game Jam:** March 6, 2026 (theme: "Ghost in the Machine")
