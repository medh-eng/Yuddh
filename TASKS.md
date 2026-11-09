# YUDDH — tasks

*Updated at the end of each session (last: 9 Nov 2026). Design and rules: `DESIGN.md`.*

## Waiting on Pon
- [ ] Play **Rajendra's Sea Road** (Campaign → Chola tab): are the boat wall (Perahu, Raksha) and fire boats (Pelita Api) fair? Balance ~63% sim, a JSON edit in decks.json.
- [ ] Play **The Ganga Road** (Chola tab, battle 2; ~58% sim).
- [ ] Paint **batch 11** (`art/PROMPTS-BATCH11.md`, 11 images: The Crossing to Lanka, c. 993: Rajaraja's army vs Mahinda V at Anuradhapura) and upload to `art/source/`.
- [ ] Paint the four campaign maps when you like (`art/PROMPTS-MAPS.md`, optional) and pick which rank rewards to build (`DESIGN.md`, "Rank and renown").
- [ ] Play **The Great Forest** and **The Walls of Kanchi** (Campaign → Gupta tab); say if Dhuan archers or the Kanchi gate line feel unfair. Balance is a JSON edit in decks.json.
- [ ] Try morale/rout: does a broken unit read clearly (red ROUTED band, flee animation)? Too common or too rare (about 2 per battle now; the break line is in `rules.json`)?
- [ ] Play The Golden Age (it follows The Indus Line, or open Campaign → The Golden Age).
- [ ] Play The Indus Line on the phone: is it fun and fair? Tell Claude if the pikes feel too harsh or the Seleucids too weak (balance is a JSON edit).
- [ ] Remaining sounds in `art/SOUND-LIST.md`.

## Next for Claude
- [ ] **Cinematics (proposed, not started):** 8-second illustrated clips (a still painting with slow push-in, short caption, sound) before and between battles; pilot = The First Throne, C01–C03 in `docs/HISTORY-RESEARCH.md`, with a skip button and a short "dramatised" footer.
- [ ] **Tigers of the South** (Chalukya campaign): battle 1 The Narmada Line (Pulakeshin II vs Harsha). Prompts: `art/PROMPTS-BATCH7.md` (11 images, with Pon). Narmada battlefield already painted.
- [ ] Pon to read the history notes in `src/data/history.json` for accuracy and tone; add a note for each new battle there (The Narmada Line next).
- [ ] More cards toward ~120.
- [ ] **Gate 2**: Pon plays with morale/rout and the Veteran foe (briefing → Foe: Veteran), says whether the AI is strong enough and morale readable.
- [ ] Phase 3 campaigns: more of Tigers of the South (Chola and Rajput battles after the Chola chronology is fixed); cinematic briefings (waiting for Pon); original narrator voice.
- [ ] Apply the DESIGN.md / TASKS.md / data-in-JSON / agent-README conventions to Pon's other game repos (Astral-command, Indistock, Corebound, BLACK SWAN, Yuddh is done) when a session is opened in each.

## Done 9 Nov (Kadaram)
- [x] **Rajendra's Sea Road** (Chola campaign battle 1, `kadaram.ts`): batch 9 converted; Chola cards ch_rajendra (deploy +1 attack to all), ch_vanigar (Raksha, +1 Kosha), ch_kalam (ranged warship); Kadaram cards sv_* (own gallery tab "Kadaram"): Sangrama (Raksha, +2 Kosha), Nakhoda, Pemanah, Perahu Wall (Raksha 1/8), Penjaga, Pelita Api (3 damage + 1 to all). Chola passive (ranged +1) applies. Balance ~63% (band 45–70%). History note written from Rajendra's Tamil prasasti (c. 1026); the Tiruvalangadu plates are earlier and are not cited for Kadaram. The old "Chola prototype fix" is done (title now Rajendra, c. 1025).
- [x] **End screen on phones:** the title, line and three buttons no longer touch each other or the round corner buttons (battle.ts `endScreen`). `__yuddh.showEnd(won)` opens it for layout checks.
- [x] Batch 10 sheet written (The Ganga Road).

## Done 9 Nov
- [x] **The Great Forest** (Vyaghraraja of Mahakantara) and **The Walls of Kanchi** (Vishnugopa): batch 8 converted, 13 cards live (Forest and Kanchi gallery tabs; Harishena, Grahana-Moksha, Dakshinapatha for the Gupta side), decks tuned (~49% and ~53%), chain Digvijaya → Great Forest → Kanchi → Golden Age, history notes for both and for The Narmada Line.
- [x] The Golden Age relabelled c. 400 CE (Pon's decision).
- [x] Removed the duplicate, unused `Scenario.history` model; history.json is the single source. The e2e bots now skip the first-launch notice.

## Done 8 Nov (night)
- [x] **Morale and rout** (`checkRout` in rules.ts; `morale` in rules.json): see DESIGN.md. Token banner, flee animation, glossary entries, tutorial line. Tests: tests/morale.test.ts. Decks re-balanced (see DESIGN.md decisions).
- [x] **Search AI** (`src/engine/search.ts`, level `'search'`) with the Foe: Standard / Veteran button on the briefing. Tests: tests/search.test.ts (beats normal ~85%, leaves the game untouched, repeatable, no hidden information).
- [x] **Batch 8** prompt sheet + 13 cards designed in `pendingArt`.

## Done 8 Nov
- [x] **History panels**: `src/data/history.json` (notice + one note per battle: what history says, what the game changes tagged HISTORY / TRADITION / INVENTED, source line, epilogue). Shown by a History button on the briefing and on the victory screen, an epilogue before the next battle after a win, and a first-launch notice (plus a History button on the title). UI in `src/game/ui/historyPanel.ts`.
- [x] Battle: pause button (❚❚) opens a Paused menu (Resume / Campaign map / Title screen); end screen also offers Campaign map; the campaign map lets you open any battle. Corner round buttons enlarged (pause, full screen, music, sound) with drawn icons (speaker for sound effects).

## Done (7 Nov 2026)
- [x] **The Golden Age** (Gupta campaign, battle 1): Chandragupta II vs Rudrasimha III at Ujjain. 11 batch-5 paintings in (Ujjain and Satrap Durgs, 5 Satrap cards, 4 Gupta cards); Marubhumi Toofan (damage every enemy unit), Silver Mudra (Kosha + card), Navaratna, Kalidasa, Iron Pillar, Vikramaditya; second campaign on the map (tabs), The Indus Line now leads into it; Gupta music (3 pieces, ~3 min each) and the horse-gallop and sand-gust sounds delivered and converted (the game uses them in The Golden Age). Balance ~53%.
- [x] Batch 4 complete: the four Maurya cards arrived mid-session and are in the game and in the Indus Line player deck: Sindhu Nauka (ferries 2 units across free, they may strike), Takshashila Scholars (draw + heal 2), Gaja Sandhi (draw + heal 6), Ashva Dhanurdhara (Vega mounted archer). Balance ~50%.
- [x] UI polish round, all 11 items (commit d100210).
- [x] Game data (cards, empires, decks, rule constants) moved into `src/data/*.json`; engine reads it; golden test unchanged.
- [x] DESIGN.md, TASKS.md, README file-layout guide for AI agents.
- [x] **The Indus Line** (battle 2): Seleucid deck (Seleucus, Pike Phalanx, Hetairoi, Toxotai, Lithobolos, Megasthenes), two new Durgs, Indus battlefield, pike rule, data-driven orders.
- [x] Campaign map (Training Ground → First Throne → Indus Line) with wins remembered; a victory leads to the next battle.
- [x] Removed a duplicate `indus.png` that had been uploaded into `art/source/cards/` (identical to the battlefield).

## Next campaign work (9 Nov)
- [x] **Chola: Rajendra's Sea Road, c. 1025 CE** (Kadaram) built 9 Nov: see Done 9 Nov.
- [x] **The Ganga Road** (Chola battle 2) built 9 Nov evening: `ganga.ts`, pl_* Pala cards (gallery tab Pala), ch_araiyan / ch_velaikkarar / ch_ganga_jal / ch_marg; ~58%.
- [ ] **The Crossing to Lanka** (Chola battle 3, c. 993): build when batch 11 arrives (`lanka.ts`; hero card is the existing ch_rajaraja; Sinhalese cards si_*, enemy starts with 0 Kosha).
- [x] Campaign map: winding route, frame, compass built 9 Nov; painted maps optional (`art/PROMPTS-MAPS.md`; then set `map:` in `campaign.ts`).
- [x] Rank and renown: Roll of Renown page, Yash, seven ranks, rank-up on the end screen, Kirti on rank-up (9 Nov). Rewards beyond titles wait for Pon's pick.
- [x] Chola campaign renamed The Tiger Banner and put in time order (Ganga, then Kadaram; Lanka goes first when built).
- [ ] Later: Chalukya Pullalur (c. 618) and Badami; Rajput Tarain 1191/1192 (source-critical).

## Next ideas
- [ ] Next Gupta battles from the nine missions (Samudragupta's Digvijaya); Gupta passive in the reading panel.

## Earlier
- Phase 0 (foundation), Phase 1 (the look, approved 4 Nov), Phase 2 so far: reading panels, damage shields, promotion, trample, seasons, tutorial, batch 3 cards, Dharma–Kuta meter. Details in `CLAUDE.md` and the git log.

## Done 7 Nov (evening)
- Share image + icons (art/source/brand/ masters; public/icons, og-image.jpg; tags in index.html, manifest).
- Robust painting loader: retries, throttle, stall guard, in-place repaint of placeholder faces (phone report: glyph-only cards, blank campaign map). Verified by aborting 2 requests each for three paintings in headless Chrome: all still appeared.

## Done 7 Nov (night): The Digvijaya built
- Gupta campaign battle 1 (Samudragupta vs the Naga kings at Padmavati, c. 340 CE; ~50% simulated). New cards na_* (Naga, own gallery tab) and g_veena; na_sarpa_vish is a Kuta card. Campaign order: Indus Line → Digvijaya → Golden Age. Tests: tests/digvijaya.test.ts. History notes: project doc / Claude Doc "Samudragupta's Digvijaya".
- Next: more Gupta/South battles (the march to Mahakantara and Kanchi; second Aryavarta war), morale/rout, more cards, search AI → Gate 2.
