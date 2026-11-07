# YUDDH — tasks

*Updated at the end of each session (last: 7 Nov 2026). Design and rules: `DESIGN.md`.*

## Waiting on Pon
- [ ] Play The Golden Age (it follows The Indus Line, or open Campaign → The Golden Age).
- [ ] Play The Indus Line on the phone: is it fun and fair? Tell Claude if the pikes feel too harsh or the Seleucids too weak (balance is a JSON edit).
- [ ] Remaining sounds in `art/SOUND-LIST.md`.

## Next for Claude
- [ ] Morale / rout.
- [ ] More cards toward ~120.
- [ ] Search-based AI → **Gate 2**.
- [ ] Phase 3 campaigns: The Golden Age, Tigers of the South; cinematic briefings; original narrator voice.
- [ ] Apply the DESIGN.md / TASKS.md / data-in-JSON / agent-README conventions to Pon's other game repos (Astral-command, Indistock, Corebound, BLACK SWAN, Yuddh is done) when a session is opened in each.

## Done (7 Nov 2026)
- [x] **The Golden Age** (Gupta campaign, battle 1): Chandragupta II vs Rudrasimha III at Ujjain. 11 batch-5 paintings in (Ujjain and Satrap Durgs, 5 Satrap cards, 4 Gupta cards); Marubhumi Toofan (damage every enemy unit), Silver Mudra (Kosha + card), Navaratna, Kalidasa, Iron Pillar, Vikramaditya; second campaign on the map (tabs), The Indus Line now leads into it; Gupta music (3 pieces, ~3 min each) and the horse-gallop and sand-gust sounds delivered and converted (the game uses them in The Golden Age). Balance ~53%.
- [x] Batch 4 complete: the four Maurya cards arrived mid-session and are in the game and in the Indus Line player deck: Sindhu Nauka (ferries 2 units across free, they may strike), Takshashila Scholars (draw + heal 2), Gaja Sandhi (draw + heal 6), Ashva Dhanurdhara (Vega mounted archer). Balance ~50%.
- [x] UI polish round, all 11 items (commit d100210).
- [x] Game data (cards, empires, decks, rule constants) moved into `src/data/*.json`; engine reads it; golden test unchanged.
- [x] DESIGN.md, TASKS.md, README file-layout guide for AI agents.
- [x] **The Indus Line** (battle 2): Seleucid deck (Seleucus, Pike Phalanx, Hetairoi, Toxotai, Lithobolos, Megasthenes), two new Durgs, Indus battlefield, pike rule, data-driven orders.
- [x] Campaign map (Training Ground → First Throne → Indus Line) with wins remembered; a victory leads to the next battle.
- [x] Removed a duplicate `indus.png` that had been uploaded into `art/source/cards/` (identical to the battlefield).

## Next ideas
- [ ] Next Gupta battles from the nine missions (Samudragupta's Digvijaya); Gupta passive in the reading panel.

## Earlier
- Phase 0 (foundation), Phase 1 (the look, approved 4 Nov), Phase 2 so far: reading panels, damage shields, promotion, trample, seasons, tutorial, batch 3 cards, Dharma–Kuta meter. Details in `CLAUDE.md` and the git log.

## Done 7 Nov (evening)
- Share image + icons (art/source/brand/ masters; public/icons, og-image.jpg; tags in index.html, manifest).
- Robust painting loader: retries, throttle, stall guard, in-place repaint of placeholder faces (phone report: glyph-only cards, blank campaign map). Verified by aborting 2 requests each for three paintings in headless Chrome: all still appeared.
