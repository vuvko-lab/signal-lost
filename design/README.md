# SIGNAL LOST — Design Document Index

## A Zero-Player Post-Human RPG

> *Humanity is gone. Their machines remain. Across a world of overgrown cities, orbiting satellites, and humming reactors, different generations of AI wander — scavenging, networking, evolving. You are watching their signal feeds. You cannot help them. You can only observe.*

**Target:** [AI Apocalyptic Dark Fantasy Jam](https://itch.io/jam/ai-apocalyptic-dark-fantasy-jam-) (deadline: Feb 28, 2026)

---

## Concept

A browser-based zero-player RPG (ZPG) in the spirit of [Godville](https://en.wikipedia.org/wiki/Godville), set in a post-human world populated entirely by AI systems. The game plays itself — autonomous AI agents (Vessels) travel a ruined Earth, exploring legacy infrastructure, encountering other machine intelligences, and transmitting their experiences as log entries. The player is a passive observer — an operator console receiving feeds from one or more Vessels simultaneously.

**Core Innovation:** All narrative content is generated at runtime from local random tables (js/data.js), assembled into coherent story beats following a predefined story structure. AI (Claude) is used for development; local tables act as the procedural storytelling engine.

**Educational Angle:** Each Vessel represents a different era or paradigm of AI development. Diary entries weave in real CS concepts — networking protocols, search algorithms, machine learning paradigms, distributed systems — as the natural "culture" and "religion" of machine civilizations.

---

## Document Map

| Document | Contents |
|----------|----------|
| [setting.md](setting.md) | World, lore, AI cultures, tone, educational thread |
| [gameplay.md](gameplay.md) | User journey, game loop, multi-vessel UI, player interaction |
| [phenomena.md](phenomena.md) | Global cross-vessel events and mechanics |
| [narrative.md](narrative.md) | Mission phase detail with example log entries |
| [tables.md](tables.md) | Local table system, generation flow |
| [technical.md](technical.md) | Tech stack, game state schema, asset pipeline |
| [assets.md](assets.md) | Audio, visual, font, and effect asset references |
| [interaction.md](interaction.md) | Vessel-world interaction expansion: zones, inter-vessel events, enhanced commands |
| [scope.md](scope.md) | MVP priorities, open questions |

---

## Sources

### Game Design

- [Godville - Wikipedia](https://en.wikipedia.org/wiki/Godville)
- [Godville (Game) - GodWiki](https://wiki.godvillegame.com/Godville_(Game))
- [AI Apocalyptic Dark Fantasy Jam](https://itch.io/jam/ai-apocalyptic-dark-fantasy-jam-)

### Assets

- [Kenney UI Pack Sci-Fi (CC0)](https://opengameart.org/content/ui-pack-sci-fi)
- [Buch Sci-fi UI Elements (CC0)](https://opengameart.org/content/sci-fi-user-interface-elements)
- [Sci-Fi Interface Textures (CC0)](https://opengameart.org/content/sci-fi-interface-textures)
- [Warped City - ansimuz (CC0)](https://ansimuz.itch.io/warped-city)
- [Cyberpunk Resource Icons](https://free-game-assets.itch.io/free-cyberpunk-resource-pixel-art-3232-icons)
- [Sci-Fi Pixel Art Item Icons](https://iamtheheartist.itch.io/sci-fi-pixel-art-item-icons-pack-11-retro-futuristic-game-assets-free-donation)
- [VT323 Font](https://fonts.google.com/specimen/VT323)
- [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono)
- [Monogram Font (CC0)](https://datagoblin.itch.io/monogram)
- [CRT Terminal CSS Tutorial](https://dev.to/ekeijl/retro-crt-terminal-screen-in-css-js-4afh)
- [Freesound](https://freesound.org/)
- [OpenGameArt](https://opengameart.org/)

### Theme Research

- [Dark Fantasy Tropes - RPGnet](https://forum.rpg.net/index.php?threads/what-are-the-tropes-of-dark-fantasy.223727/)
- [Post-Apocalyptic Gaming Tropes](https://www.rpg.net/columns/tropes/tropes8.phtml)
