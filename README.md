# YUDDH: Rise of the Rajyas

A tactical card game of ancient India: Maurya, Gupta, Chalukya, Chola and Rajput armies fighting over one contested line, in the tradition of KARDS. Headed for the web and Google Play.

**Play:** https://medh-eng.github.io/Yuddh/ (the original prototype is at `/prototype/`).

## Where the project stands

| Phase | What | Status |
| --- | --- | --- |
| 0 | Foundation: TypeScript engine, PixiJS renderer, automatic publishing | Done |
| 1 | The Look: one battle (Maurya against the Nandas) at KARDS quality | Done: approved at Gate 1 (4 Nov). Some small sounds still to record ([sound list](art/SOUND-LIST.md)) |
| 2 | Deeper war: formations, promotion, elephant rampage, morale, terrain, Dharma–Kuta, heroes, new AI | In progress: seasons, promotion, trample, Dharma–Kuta, morale and rout, search AI, tutorial, campaign map with five battles built. Gate 2 next |
| 3 | Itihasa campaigns, Digvijaya conquest mode, Chanakya's Puzzles | |
| 4 | Collection, deck builder, Kirti crafting | |
| 5 | Polish, Hindi and Marathi, Google Play release | |

## For AI agents: read this instead of exploring the repo

Read `DESIGN.md` (what the game is), `TASKS.md` (what is next), `CLAUDE.md` (working rules and hard-won lessons). Then:

| To change… | Edit |
| --- | --- |
| A card's stats, cost, text, keywords; an empire's name or passive | `src/data/cards.json` (`yuddh` = new cards, `classic` = the prototype's 50, which the golden test replays: do not touch; `pendingArt` = designed but unpainted, not loaded) |
| What is in a battle's decks (`"id*3"` = three copies; order matters) | `src/data/decks.json` |
| Rank names, seasons and their rules, Dharma limit, charging classes, Kuta cards | `src/data/rules.json` |
| A battle's History note, sources, epilogue; the first-launch notice | `src/data/history.json` (keyed by scenario id) |
| A battle's story, Durgs, AI level, start Kosha / Durg health | `src/campaign/<battle>.ts` (`firstThrone.ts`, `indusLine.ts`, `digvijaya.ts`, `mahakantara.ts`, `kanchi.ts`, `goldenAge.ts`, `narmada.ts`, `kadaram.ts`, `ganga.ts`, `tutorial.ts`) |
| The campaigns, the order of their battles, and win tracking | `src/campaign/campaign.ts` |
| A new *kind* of rule or order effect | `src/engine/rules.ts` (behind `st.rules === 'yuddh'`), then the AI's value in `src/engine/ai.ts`, then the reading panel in `src/game/ui/glossary.ts` |
| Morale / rout (who breaks, the line, who is steadfast) | `src/data/rules.json` ("morale"); logic is `checkRout` in `src/engine/rules.ts` |
| How the Veteran (search) AI thinks and how long | `src/data/rules.json` ("ai": beam, depth, finalists, replies); code in `src/engine/search.ts`; the player's Standard/Veteran choice in `src/campaign/difficulty.ts` |
| How a screen looks | `src/game/scenes/` (title, campaign, standing, battle, gallery), `src/game/cards/` (card faces, tokens), `src/game/theme.ts` |
| Art or sound | Drop masters in `art/source/{cards,battlefields,sfx}/`, run `npm run assets`, commit `public/assets/` and `src/assets/*.json` |

```
src/data/          cards.json, decks.json, rules.json (all balance), index.ts (typed access)
src/engine/        rules engine: types, lookups (cards.ts), rules, AI (ai.ts heuristics, search.ts search AI; no screen code)
src/campaign/      battles (tutorial, firstThrone, indusLine, digvijaya, mahakantara, kanchi, goldenAge, narmada, kadaram), campaign.ts, the prototype's nine missions (missions.ts, data only)
src/meta/          progress.ts (Kirti and per-card upgrades) · standing.ts (Yash, rank per empire; data/ranks.json incl. chronicles and reward levels); game/ui/regalia.ts (rank medallions, art rg_<empire>_<n>) — saved in the browser
src/game/          PixiJS renderer: stage, screen modes, theme, audio, scenes (title, campaign, battle, gallery, preview)
src/game/cards/    card painter (frames, arch window, coins, badges), board views, 3D card flips
src/assets/        art manifest (which cards have paintings)
art/               prompt sheets, sound list, credits; masters in art/source/
scripts/           convert-assets.mjs: masters → small WebP / MP3 game files
tests/             golden traces, rules, card mechanics, battle balance; tests/e2e/ = scripted real-mouse playtests
legacy/            Sarwam's prototype source and tests, unchanged; public/prototype/ is its build
```

**End of every session:** update `DESIGN.md` (if rules or decisions changed) and `TASKS.md` (tick what is done, add what is next).

## Commands

```bash
npm install
npm run dev        # play locally with live reload
npm test           # rules tests + golden traces
npm run build      # typecheck and build to dist/
npm run assets     # convert art/source/* (cards, battlefields, sounds) into public/assets/*
node tests/e2e/playtest.cjs http://localhost:4173/ shots            # after `npm run preview` (desktop 1600×900)
node tests/e2e/playtest.cjs http://localhost:4173/ shots 844 390    # phone held sideways
node tests/e2e/campaign.cjs http://localhost:4173/ shots 1280 720   # title → campaign map → The Indus Line (TURNS=n to stop early)
```

## The golden-trace test

`legacy/golden.cjs` plays 154 seeded games (every empire pairing at every AI level, plus all nine missions) with the prototype engine and records each result. `tests/golden.test.ts` replays them on the TypeScript engine and requires identical winners, turn counts, logs and final boards. Re-record with `npm run golden` only when a rule is changed on purpose.

## Rules in brief

Each side has a **Rajya** line (four units) where its **Durg** (capital) sits, and both share the **Yudhbhumi**, which only one side can hold. **Kosha** (the treasury) pays both to deploy a card and to move or attack with a unit. It grows by one each turn, up to 12. A Durg can only be attacked from the Yudhbhumi. Keywords: *Vega* (acts at once), *Raksha* (guard), *Dhuan* (smokescreen). Card types: Units, Mantras (orders), Yantras (face-down traps), Shakti (power orders).

## Credits

Prototype engine, campaign and tests by Sarwam and Pon. New engine and renderer built with Claude.
