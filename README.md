# YUDDH: Rise of the Rajyas

A tactical card game of ancient India: Maurya, Gupta, Chalukya, Chola and Rajput armies fighting over one contested line, in the tradition of KARDS. Headed for the web and Google Play.

**Play:** https://medh-eng.github.io/Yuddh/ (the original prototype is at `/prototype/`).

## Where the project stands

| Phase | What | Status |
| --- | --- | --- |
| 0 | Foundation: TypeScript engine, PixiJS renderer, automatic publishing | Done |
| 1 | The Look: one battle (Maurya against the Nandas) at KARDS quality | Next. Waiting on the first 20 card paintings ([prompts](art/PROMPTS-PHASE1.md)) |
| 2 | Deeper war: formations, promotion, elephant rampage, morale, terrain, Dharma–Kuta, heroes, new AI | |
| 3 | Itihasa campaigns, Digvijaya conquest mode, Chanakya's Puzzles | |
| 4 | Collection, deck builder, Kirti crafting | |
| 5 | Polish, Hindi and Marathi, Google Play release | |

## Project layout

```
src/engine/        rules engine: types, card data, rules, AI (no screen code)
src/campaign/      the prototype's nine missions
src/meta/          Kirti and per-card upgrades (saved in the browser)
src/game/          PixiJS renderer: stage, theme, scenes, card view
src/assets/        art manifest (which cards have paintings)
art/               prompt sheets; masters go in art/source/ (not committed)
scripts/           convert-assets.mjs: masters → small WebP game files
tests/             rules tests and the golden-trace test
legacy/            Sarwam's prototype source and tests, unchanged
public/prototype/  the prototype build, still playable
```

## Commands

```bash
npm install
npm run dev        # play locally with live reload
npm test           # rules tests + golden traces
npm run build      # typecheck and build to dist/
npm run assets     # convert art/source/* into public/assets/*
```

## The golden-trace test

`legacy/golden.cjs` plays 154 seeded games (every empire pairing at every AI level, plus all nine missions) with the prototype engine and records each result. `tests/golden.test.ts` replays them on the TypeScript engine and requires identical winners, turn counts, logs and final boards. Re-record with `npm run golden` only when a rule is changed on purpose.

## Rules in brief

Each side has a **Rajya** line (four units) where its **Durg** (capital) sits, and both share the **Yudhbhumi**, which only one side can hold. **Kosha** (the treasury) pays both to deploy a card and to move or attack with a unit. It grows by one each turn, up to 12. A Durg can only be attacked from the Yudhbhumi. Keywords: *Vega* (acts at once), *Raksha* (guard), *Dhuan* (smokescreen). Card types: Units, Mantras (orders), Yantras (face-down traps), Shakti (power orders).

## Credits

Prototype engine, campaign and tests by Sarwam and Pon. New engine and renderer built with Claude.
