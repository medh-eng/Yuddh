# YUDDH — tasks

*Updated at the end of each session (last: 7 Nov 2026). Design and rules: `DESIGN.md`.*

## Waiting on Pon
- [ ] **Paint batch 5, The Golden Age** (`art/PROMPTS-BATCH5.md`): 2 Durgs, 5 Satrap cards, 4 Gupta cards (11 images). Optional: 3 Gupta music pieces (`music_gupta_briefing`, `music_gupta_calm`, `music_gupta_intense`; the game switches to them automatically).
- [ ] Play The Indus Line on the phone: is it fun and fair? Tell Claude if the pikes feel too harsh or the Seleucids too weak (balance is a JSON edit).
- [ ] Remaining sounds in `art/SOUND-LIST.md`.

## Next for Claude
- [ ] **When batch 5 arrives:** move the 9 `pendingArt` cards to `yuddh` in cards.json (Marubhumi needs an order that damages all enemy units; AI values for sa_mudra/g_navaratna), `npm run assets`, build `src/campaign/goldenAge.ts` (Gupta vs Western Satraps, Ujjain, battlefield `ujjain`, `music` override gupta), decks in decks.json (Gupta ally cards from the 6 painted g_* + neutrals), add a Gupta campaign to `campaign.ts` and the map, balance 45–70%.
- [ ] Morale / rout.
- [ ] More cards toward ~120.
- [ ] Search-based AI → **Gate 2**.
- [ ] Phase 3 campaigns: The Golden Age, Tigers of the South; cinematic briefings; original narrator voice.
- [ ] Apply the DESIGN.md / TASKS.md / data-in-JSON / agent-README conventions to Pon's other game repos (Astral-command, Indistock, Corebound, BLACK SWAN, Yuddh is done) when a session is opened in each.

## Done (7 Nov 2026)
- [x] Batch 4 complete: the four Maurya cards arrived mid-session and are in the game and in the Indus Line player deck: Sindhu Nauka (ferries 2 units across free, they may strike), Takshashila Scholars (draw + heal 2), Gaja Sandhi (draw + heal 6), Ashva Dhanurdhara (Vega mounted archer). Balance ~50%.
- [x] UI polish round, all 11 items (commit d100210).
- [x] Game data (cards, empires, decks, rule constants) moved into `src/data/*.json`; engine reads it; golden test unchanged.
- [x] DESIGN.md, TASKS.md, README file-layout guide for AI agents.
- [x] **The Indus Line** (battle 2): Seleucid deck (Seleucus, Pike Phalanx, Hetairoi, Toxotai, Lithobolos, Megasthenes), two new Durgs, Indus battlefield, pike rule, data-driven orders.
- [x] Campaign map (Training Ground → First Throne → Indus Line) with wins remembered; a victory leads to the next battle.
- [x] Removed a duplicate `indus.png` that had been uploaded into `art/source/cards/` (identical to the battlefield).

## Earlier
- Phase 0 (foundation), Phase 1 (the look, approved 4 Nov), Phase 2 so far: reading panels, damage shields, promotion, trample, seasons, tutorial, batch 3 cards, Dharma–Kuta meter. Details in `CLAUDE.md` and the git log.
