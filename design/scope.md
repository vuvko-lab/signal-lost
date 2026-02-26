# MVP Scope (2-Day Jam)

## Must Have (Day 1)

- [ ] Boot screen with operator ID input
- [ ] World generation via Chartopia
- [ ] Single Vessel auto-creation and log feed
- [ ] Terminal-style UI with CRT effects (CSS)
- [ ] Mission phase state machine (7 phases cycling)
- [ ] Template system that calls Chartopia `/gen/` per phase
- [ ] Basic Vessel state (integrity, energy, memory, inventory)
- [ ] Auto-tick: new log entry every 8-15 seconds
- [ ] Ambient audio loop (1 track)

## Should Have (Day 2)

- [ ] Multi-vessel columns (add/remove feeds)
- [ ] Global phenomena system (timer, banner, per-culture reactions)
- [ ] Satellite health tracker + dark mode when it hits 0
- [ ] Operator commands (Boost / Ping / Inject)
- [ ] SFX for events (beeps, glitches, global event alert tone)
- [ ] Vessel death and replacement
- [ ] Phase progress indicator per column
- [ ] Educational CS tooltips or annotations on key terms
- [ ] Polish: entry animations, satellite status indicator

## Won't Have (Post-Jam)

- Vessel-to-vessel direct interaction / trading
- Map visualization
- Persistent world evolution across sessions
- Player-created Vessels with custom directives
- Multiplayer (shared world between players)

---

## Open Questions

1. **CORS on Chartopia `/gen/`** — Need to verify browser-side calls work. Fallback: proxy or pre-generate.
2. **Rate limits** — Multiple Vessels = more API calls. May need to stagger ticks or batch requests.
3. **Custom tables** — Create on Chartopia, or hardcode as local JSON arrays and use `/gen/` only for the domain language randomization?
4. **Entry pacing** — 8-15s per Vessel. With 3 Vessels, screen updates every ~3-5s. Too fast? Needs playtesting.
5. **Educational depth** — How much CS to include? Light flavor vs. actual explanations? Tooltips?
6. **Vessel cap** — How many simultaneous feeds before it's overwhelming? Probably 3-4 max.
7. **Audio licensing** — Need to verify specific Freesound tracks before bundling. Budget time for this.
