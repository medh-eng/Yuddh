# YUDDH — tasks

*Updated at the end of each session (last: 13 Nov 2026). Design and rules: `DESIGN.md`.*

## Done 13 Nov: duel balance round 2 + the Android app
- **Duel field tuned by simulation**: new `add`/`trim` per-faction deck levers in `duel.json` (applied before the 52-card padding; campaign decks untouched), found by greedy search over every ordered pair. Field spread 21-76% → **36-61%**; elephants in, elephants out was the pattern. New tripwire test sweeps all 420 pairs (22-78% band). 134/134 tests pass.
- **Android app scaffolded (Capacitor)**: `capacitor.config.ts` + `android/` (landscape, immersive fullscreen, keep-screen-on, camera for QR, adaptive icons from `resources/`). `.github/workflows/android.yml` builds `yuddh-debug.apk` always and signed `yuddh-release.apk`+`.aab` once Pon adds the four keystore secrets (keystore generated and handed over in chat). Whole game ships offline inside the app (~91 MB).
- Full-game failcheck: desktop playtest (1280×720) played a whole battle to Victory — zero failed drags, zero console errors; screenshots checked.
- [ ] **Pon**: add the four Actions secrets, run the `android` workflow, install `yuddh-debug.apk` on his phone and report.
- [ ] Next: Play Console account + store listing; real-phone two-phone retest; Nearby Connections (Bluetooth) once the app shell is proven.

## Waiting on Pon
- [ ] Play **Koppam** (Chola tab, battle 4 on the map, the campaign's last stop; built 11 Nov, ~56% sim, close on purpose — "the Chola record says" victory, not a certainty). Does Rajadhiraja's elephant feel right as a 7-cost legendary that dies historically but doesn't have to in the game? Is A Downpour of Arrows (3 damage to the line) fair? Edit decks.json "koppam" or the hq values in koppam.ts.
- [ ] Play **Vikramaditya's Return** (Chalukya tab, battle 4, closes the campaign; built 11 Nov, ~62% sim, meant to be kinder than Badami — the history actually gives you this win). Edit decks.json "vikram_return" or the hq values in vikramReturn.ts.
- [ ] Play **The Fall of Badami** (Chalukya tab, battle 3 on the map; built 11 Nov, ~45% sim, duel faction "Mamalla's Pallava"). Does the Cliff Gate (3 damage to the enemy line) feel too strong or too weak? Is losing to Narasimhavarman (history says you should, often) bearable? Edit decks.json "badami" or the hq values in badami.ts.
- [ ] Play **The Kalinga War** (Maurya tab, battle 4 on the map; built 11 Nov night, ~45% sim, duel faction Kalinga ~58% average). Is Ashoka's +1 attack and Raksha enough? Do the Kalinga Gaja (Raksha 4/7) and The Daya in Spate (2 to every enemy on the Yudhbhumi) feel fair? Edit decks.json "kalinga" or `enemyHq` in kalinga.ts.
- [ ] **Two phones, retest (11 Nov):** the connection code was hardened (IPv6 candidates, more STUN, a public TURN relay, bigger QR, better scanner, clearer error). Same WiFi first, then one phone on the other's hotspot, then mobile data on both. If it still fails, tell Claude what the red message says (it now lists the candidate counts); the fix after this is a small relay or a 4-letter room code over a signalling service.
- [ ] Play **The Battle of Chandawar** (Rajput tab, new; ~40% sim): do the Elephant-Shooters feel fair against your elephants? Edit decks.json "chandawar" (enemy list) or `playerHq` in chandawar.ts.
- [ ] Play **Pullalur** (Chalukya tab, new; ~53% sim): is the Pallava side too passive, or its Retreat to Kanchi too strong?
- [ ] Try **Two players**, Maurya vs Gupta (balance fixed 11 Nov): does it feel even now?
- [ ] Play **Rajendra's Sea Road** (Campaign → Chola tab): are the boat wall (Perahu, Raksha) and fire boats (Pelita Api) fair? Balance ~63% sim, a JSON edit in decks.json.
- [ ] Play **The Ganga Road** (Chola tab, battle 2; ~58% sim).
- [ ] Play **The Crossing to Lanka** (Chola tab, first battle now; ~54% sim). Is the Sinhalese side (elephants, archers, Maha Thera, Wewa Jala) fair?
- [ ] Play **The First Battle of Tarain** (Rajput tab, new; ~55% sim). Do the horse archers and the Naqqara feel fair?
- [x] Batch 13 complete: Charan Bard in the Tarain 2 deck, `map_rajput` wired, enemy Durg now 30 (~46% sim). Play **The Second Battle of Tarain** (Rajput tab; ~44% sim, meant to be hard): are Feigned Flight and the Mailed Reserve fair? Edit decks.json "tarain2" or `enemyHq` in tarain2.ts to ease it.
- [x] Four campaign maps delivered and wired 10 Nov (`map:` in `campaign.ts`; backdrop dim lowered to 0.3 for maps).
- [x] Rajput regalia (6 pieces, `rg_rajput_1`–`6`) painted and absorbed 11 Nov (third later night): spear, recurved bow with thumb ring, bossed-and-lotus shield, sheathed sword, a gold drinking horn, and a ceremonial parasol. All 24 regalia medallions across all five empires are now in the game — none left to paint.
- [ ] Paint the four campaign maps when you like (`art/PROMPTS-MAPS.md`, optional) and pick which rank rewards to build (`DESIGN.md`, "Rank and renown").
- [ ] Play **The Great Forest** and **The Walls of Kanchi** (Campaign → Gupta tab); say if Dhuan archers or the Kanchi gate line feel unfair. Balance is a JSON edit in decks.json.
- [ ] Try morale/rout: does a broken unit read clearly (red ROUTED band, flee animation)? Too common or too rare (about 2 per battle now; the break line is in `rules.json`)?
- [ ] Play The Golden Age (it follows The Indus Line, or open Campaign → The Golden Age).
- [ ] Play The Indus Line on the phone: is it fun and fair? Tell Claude if the pikes feel too harsh or the Seleucids too weak (balance is a JSON edit).
- [ ] Remaining sounds in `art/SOUND-LIST.md`.

## Next for Claude
- [x] Two-human play steps 1 (pass-and-play) and 2 (two phones over WebRTC, QR/paste pairing) built 10 Nov.
- [ ] **Two-human play, step 3**: Nearby/Bluetooth in the Android wrapper. Also maybe: hidden hands (host-held secrets), online rematch, TURN relay.
- [ ] Playtest two-phone play on real phones (same WiFi, then mobile data) and report what fails.
- [ ] Duel follow-ups: balance per faction pairing (decks were made for campaign battles, some enemy factions are strong or weak without their scenario's Durg or Kosha tweaks); a coin-toss for who moves first; 'Two players' button on phones at 7 buttons is tight.
- [x] Batch 14 (Chandawar) and batch 15 (Pullalur) built 11 Nov.
- [ ] **Cinematics (proposed, not started):** 8-second illustrated clips (a still painting with slow push-in, short caption, sound) before and between battles; pilot = The First Throne, C01–C03 in `docs/HISTORY-RESEARCH.md`, with a skip button and a short "dramatised" footer.
- [ ] **Tigers of the South** (Chalukya campaign): battle 1 The Narmada Line (Pulakeshin II vs Harsha). Prompts: `art/PROMPTS-BATCH7.md` (11 images, with Pon). Narmada battlefield already painted.
- [ ] Pon to read the history notes in `src/data/history.json` for accuracy and tone; add a note for each new battle there (The Narmada Line next).
- [ ] More cards toward ~120.
- [ ] **Gate 2**: Pon plays with morale/rout and the Veteran foe (briefing → Foe: Veteran), says whether the AI is strong enough and morale readable.
- [ ] Phase 3 campaigns: more of Tigers of the South (Chola and Rajput battles after the Chola chronology is fixed); cinematic briefings (waiting for Pon); original narrator voice.
- [ ] Apply the DESIGN.md / TASKS.md / data-in-JSON / agent-README conventions to Pon's other game repos (Astral-command, Indistock, Corebound, BLACK SWAN, Yuddh is done) when a session is opened in each.

## Done 11 Nov (second later night)
- [x] **Batch 17 (Koppam) and batch 19 (Vikramaditya's Return) both uploaded and absorbed; two campaigns now close.** Four batch-19 files (`durg_vatapi_garrison.png`, `c_vikramaditya1.png`, `c_vatapi_praharak.png`, `c_punarasthapana.png`) landed at the repo root instead of `art/source/cards/` — moved with `git mv` before converting. **Koppam built** (`koppam.ts`, Chola campaign now Lanka → Ganga → Kadaram → Koppam, chronologically the last): ch_rajadhiraja (legendary, War Elephant sub so vsElephant/trample apply), ch_rajendra2 (legendary), ch_veera_ani (Rally order); wc_someshvara (legendary), wc_dhanu (vsElephant 2, the Archer Corps), wc_gaja, wc_barsha (3 damage to the line). Durg `durg_kalyani`; duel faction `western_chalukya`. History note honest about the disputed date (1052 or 1054) and site, and the doubted claim that Jayasimha died there. ~56% sim (tests/koppam.test.ts, band 45–62%). **Vikramaditya's Return built** (`vikramReturn.ts`, closes the Chalukya campaign's four-battle arc): c_vikramaditya1 (legendary), c_vatapi_praharak, c_punarasthapana (order); pv_vatapi_adhikari (the unnamed Governor of Vatapi), pv_vatapi_rakshak, pv_stambha_rakshak (both Raksha), pv_vatapi_avarodh (order). Reuses `durg_badami` and the `vatapi` battlefield; new Durg `durg_vatapi_garrison`; duel faction `pallava_garrison`. History note: no source names the Pallava commander (Narasimhavarman didn't die until c. 668, well after this date), the recapture date is a historians' estimate from a gap, not a described battle. ~62% sim (tests/vikramReturn.test.ts, band 50–70%, deliberately the kinder of the two). Both decks took several balance passes — card-count swings turned out far more sensitive than hq (one extra Raksha copy swung a sim from 44% to 82%); tune in small single-card steps and re-run, don't guess big jumps. All 133 tests pass; scripted Chromium playtests of both (7 turns each, 1280×720) clean, screenshots checked — new card art (Kalyani Gaja, Guardians of the Pillar, etc.) and both battlefields render correctly.

## Done 11 Nov (later night)
- [x] **Batch 18 absorbed and The Fall of Badami built** (`badami.ts`, Chalukya campaign now Narmada → Pullalur → Badami). New cards: c_badami_rakshak, c_badami_dhanu, c_shaila_dwar (3 damage to the enemy Yudhbhumi line); pv_narasimhavarman (legendary, Vega, deploy +1 attack to all), pv_paranjothi, pv_mallar (Raksha), pv_vijaya_stambha (Kosha + draw). New Durg `durg_pallava_camp` (reuses `durg_badami` for the Chalukya side), battlefield `vatapi`. History note `badami` (642 CE; Kuram/Velurpalaiyam plates; Paranjothi marked TRADITION from the Periya Puranam; Pulakeshin's death marked "presumed"). Duel faction "Mamalla's Pallava" (`pallava_badami`, hq 28) added to the two-player list. tests/badami.test.ts: ~45% sim (deliberately hard, band 30–60%), 127 tests pass overall. Scripted Chromium playtest (1280×720, 7 turns, 13 actions) found no failures; battlefield and all new card art render correctly (checked screenshots).
- [x] **Batch 19 sheet written** (`art/PROMPTS-BATCH19.md`, Vikramaditya's Return, Chalukya battle 4, c. 654–655 CE, 8 images, no new battlefield). Closes the Chalukya campaign arc.

## Done 11 Nov (night)
- [x] **Batch 16 built: The Kalinga War** (`kalinga.ts`, Maurya battle 4: Training Ground → First Throne → Indus Line → Kalinga → Digvijaya). New cards: m_ashoka (legendary, Raksha, deploy +1 attack to all), m_mahamatra (drawHeal), m_shila_lekh (heal 5, Dharma +1), kl_gaja (Raksha 4/7 elephant), kl_sena, kl_dhanu, kl_daya (`damageFront` 2); Kalinga gallery tab; Durg `durg_tosali`, battlefield `dhauli`; History note `kalinga`; duel faction Kalinga (hq 30). tests/kalinga.test.ts; duelBalance test now checks every legendary card appears once. Short phone playtest (844×390, 4 turns) found no failures.
- [x] **Batch 18 sheet written** (The Fall of Badami, 642 CE).

## Done 11 Nov
- [x] **Batches 14 and 15 built**: The Battle of Chandawar (Rajput 3, `chandawar.ts`, Elephant-Shooters / `vsElephant`), Pullalur (Chalukya 2, `pullalur.ts`, `pv_*` Pallava cards, gallery tab Pallava, Pallava added to the duel list). 14 new cards, 2 Durgs, 2 battlefields, 2 History notes, tests/chandawar.test.ts, tests/pullalur.test.ts. 118+ tests pass.
- [x] **Duel balance**: padded decks to 52 (attrition was deciding games), per-faction `hq`/`kosha` in duel.json, Maurya vs Gupta from 92/8 to ~50/50 (DESIGN.md, "Duel balance"). Other factions still uneven.
- [x] **Two-phone connection hardened** (DESIGN.md, "Connection hardening"): IPv6 and public candidates kept, STUN x3 + TURN, bigger QR, BarcodeDetector, error detail.
- [x] Batch 16 sheet written (The Kalinga War).
- [ ] Duel follow-up: dedicated duel decks per faction and a coin toss; the first-seat win rate is ~40-45%.

## Done 10 Nov (evening)
- [x] **Pass-and-play Duel built**: title "Two players", faction picker (16 factions, any pairing), board turns round with a pass-the-device curtain, Player 2 draws +1 card, random season, own win screen with Rematch / Choose factions. `src/engine/duel.ts`, `src/campaign/duel.ts`, `src/data/duel.json`, `scenes/duelSetup.ts`, tests/duel.test.ts, tests/duelFactions.test.ts, tests/e2e/duel.cjs (A=, B=, FAST=1). 104 tests pass; played at 1280×720 and 844×390.
- [x] **The Second Battle of Tarain built** (`tarain2.ts`, player leads the Rajputs; Ghurid Aibak / Mailed Reserve / Feigned Flight (`damageFront`) / Dawn Charge, Rajput Skandaraja / Rana's Clan Foot; enemy Durg 28; sim ~44% Rajput wins; History note; Rajput tab chain tarain1 → tarain2). Batch 14 sheet written.

## Done 10 Nov (afternoon)
- [x] **All 24 regalia absorbed** (Maurya, Gupta, Chalukya, Chola × 6; Gupta 6, Chalukya 1–6, Chola 1–6 converted today). Roll of Renown checked at 1280×720 and 844×390 with every rank earned. 94 tests pass.

## Done 10 Nov
- [x] **Batch 11 absorbed and The Crossing to Lanka built** (`lanka.ts`, `decks.json` "lanka", `history.json` "lanka", 9 cards in cards.json, Durg and battlefield converted, gallery tab Sinhala, tests/lanka.test.ts, 91 tests pass). Sim: Chola side wins 54%.
- [x] Batch 12 absorbed and **The First Battle of Tarain built** (Rajput campaign opens; 94 tests pass; briefing titles now shrink to fit). Regalia Maurya 1–6, Gupta 1–5 absorbed; four campaign maps wired. Batch 13 sheet written.

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
- [x] **The Crossing to Lanka** (Chola battle 1 by date, c. 993) built 10 Nov: `lanka.ts`, ch_vandiyadevan / ch_marakkalam / ch_valangai, si_* Sinhalese cards (gallery tab Sinhala), Chola list now Lanka → Ganga → Kadaram; ~54%. The engine cannot start a side below 1 Kosha (`startKosha: 0` reads as 1), so the empty treasury is shown by a Durg of 24 and few Kosha cards.
- [x] **Rajput campaign: The First Battle of Tarain (1191)** built 10 Nov: `tarain1.ts`, r_govindaraja / r_sawar / r_durgapala / r_samanta, gh_* Ghurid cards (gallery tab Ghurid), Rajput tab "The Saffron Banner", ranks.json entry; ~55%.
- [ ] **The Second Battle of Tarain (1192)**: build when batch 13 arrives (`tarain2.ts`).
- [x] Campaign map: winding route, frame, compass built 9 Nov; painted maps optional (`art/PROMPTS-MAPS.md`; then set `map:` in `campaign.ts`).
- [x] Rank and renown: Roll of Renown page, Yash, seven ranks, rank-up on the end screen, Kirti on rank-up (9 Nov). Rewards beyond titles wait for Pon's pick.
- [x] Chola campaign renamed The Tiger Banner and put in time order (Lanka, then Ganga, then Kadaram).
- [ ] Later: Chalukya Pullalur (c. 618) and Badami; Rajput Second Tarain 1192 (batch 13).

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

## Done 11 Nov (third later night): Rajput regalia complete
- All six `rg_rajput_*` pieces arrived and were absorbed: spear with red pennon (1), recurved bow with quiver and thumb ring (2, the piece originally painted as a Gupta sample and reserved for Rajput), a bronze-bossed shield with a central lotus (3), a sheathed straight sword (4), a gold ceremonial drinking horn (5), and a fringed ceremonial parasol/chhatra (6). `npm run assets` registered them; verified by seeding `yuddh.standing.v1` in a scripted Chromium session to force Rajput to Chakravartin rank and screenshotting the Roll of Renown — all six render lit and correctly cropped, no console errors. 133/133 tests pass, typecheck and build clean.
- This closes out `art/PROMPTS-REGALIA.md`: all 24 regalia medallions (Maurya, Gupta, Chalukya, Chola, Rajput) are now painted and in the game. No regalia work left.
- With Koppam, Vikramaditya's Return, and now regalia all done, there are no open art batches of any kind waiting in the repo.

## Done 9 Nov (night): rank rewards
- War Council chronicle (Nayaka), gilded frame (Senapati), regalia medallions + `art/PROMPTS-REGALIA.md` (24 prompts, Maurya first). tests/rewards.test.ts. Fixed: a custom hitArea on a column pruned buttons outside it.
- Next: profile portrait wearing the regalia; Pon paints regalia; The Crossing to Lanka when batch 11 arrives.
