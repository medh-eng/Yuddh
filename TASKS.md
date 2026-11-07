# YUDDH — tasks

*Updated at the end of each session (last: 7 Nov 2026). Design and rules: `DESIGN.md`.*

## Waiting on Pon
- [ ] **Paint the four Maurya cards of batch 4** (prompts in `art/PROMPTS-BATCH4.md`): `m_sindhu_nauka`, `m_takshashila`, `m_gaja_sandhi`, `m_ashva_dhanurdhara`. They were not in the upload (only 6 Seleucid cards, 2 Durgs and the battlefield arrived). Upload to `art/source/cards/` named exactly so.
- [ ] Play The Indus Line on the phone: is it fun and fair? Tell Claude if the pikes feel too harsh or the Seleucids too weak (balance is a JSON edit).
- [ ] Remaining sounds in `art/SOUND-LIST.md`.

## Next for Claude
- [ ] **When the four Maurya cards arrive:** move their entries from `pendingArt` to `yuddh` in `src/data/cards.json` (stats there are tentative; two need small new rules: Sindhu Nauka's free advance, Gaja Sandhi's draw/heal), run `npm run assets`, add them to the `indus_line` player deck in `src/data/decks.json`, re-run `npm test` (balance band 45–70%).
- [ ] Morale / rout.
- [ ] More cards toward ~120.
- [ ] Search-based AI → **Gate 2**.
- [ ] Phase 3 campaigns: The Golden Age, Tigers of the South; cinematic briefings; original narrator voice.
- [ ] Apply the DESIGN.md / TASKS.md / data-in-JSON / agent-README conventions to Pon's other game repos (Astral-command, Indistock, Corebound, BLACK SWAN, Yuddh is done) when a session is opened in each.

## Done (7 Nov 2026)
- [x] UI polish round, all 11 items (commit d100210).
- [x] Game data (cards, empires, decks, rule constants) moved into `src/data/*.json`; engine reads it; golden test unchanged.
- [x] DESIGN.md, TASKS.md, README file-layout guide for AI agents.
- [x] **The Indus Line** (battle 2): Seleucid deck (Seleucus, Pike Phalanx, Hetairoi, Toxotai, Lithobolos, Megasthenes), two new Durgs, Indus battlefield, pike rule, data-driven orders.
- [x] Campaign map (Training Ground → First Throne → Indus Line) with wins remembered; a victory leads to the next battle.
- [x] Removed a duplicate `indus.png` that had been uploaded into `art/source/cards/` (identical to the battlefield).

## Earlier
- Phase 0 (foundation), Phase 1 (the look, approved 4 Nov), Phase 2 so far: reading panels, damage shields, promotion, trample, seasons, tutorial, batch 3 cards, Dharma–Kuta meter. Details in `CLAUDE.md` and the git log.
