# YUDDH: Rise of the Rajyas — working notes for Claude

KARDS-style card game of ancient India, built for Pon (owner, non-programmer, directs the work and generates all art with AI image tools from prompts Claude writes). Target: web now, **Google Play** later (landscape only). Repo is public; live at https://medh-eng.github.io/Yuddh/.

## Ground rules
- **Never break the golden test.** `tests/golden.test.ts` replays 154 games recorded from Sarwam's prototype engine. If a rule is changed on purpose, re-record with `npm run golden` and say so in the commit.
- The engine (`src/engine/`) has **no DOM code**. All screen work goes in `src/game/`.
- Before pushing: `npm test`, `npx tsc --noEmit`, `npm run build`, then a real playtest: `npm run preview` + `node tests/e2e/playtest.cjs http://localhost:4173/ <outdir> [w h]` (set `PW=/opt/npm-tools/node_modules/playwright CHROME=/usr/bin/google-chrome` in the cloud sandbox) and look at the screenshots. Test at 1600×900 and phone landscape 844×390.
- Never `pkill -f "vite preview"` from a shell whose own command line contains that text (kills the shell); start servers with `setsid`.
- GitHub Pages settings API is blocked from the sandbox; publishing is the `deploy.yml` workflow pushing `dist/` to `gh-pages`.
- Commit as "Claude", attribution lines per session instructions.

## Stack
TypeScript, Vite 8, PixiJS 8, GSAP 3, Vitest. Fonts bundled via @fontsource (Cormorant Garamond, Tiro Devanagari Hindi). Design space 1920×1080 scaled to fit; the battlefield fills the window behind it (`Stage.setBackdrop`).

## Map
```
src/engine/        types, cards (50, generated from prototype), rules (+ actionObservers hook), ai (prototype heuristics)
src/campaign/      missions.ts (Sarwam's 9 missions, data only) · firstThrone.ts (Phase 1 battle, painted cards only)
src/meta/          Kirti + upgrades (localStorage key yuddh.meta.v2)
src/game/stage.ts  app, scaling, backdrop, scene switch, destroyTree()
src/game/cards/    paint.ts (canvas-painted card faces, tokens, Durgs, card back) · views.ts (TokenView, HandCard, DurgView, diyas)
src/game/scenes/   title.ts · battle.ts (the game) · battlePreview.ts (AI vs AI, old placeholder look)
src/game/audio.ts  synth stand-ins; a recording at public/assets/sfx/<name>.mp3 listed in src/assets/sfx.json replaces each
scripts/convert-assets.mjs   art/source/{cards,battlefields,sfx} → public/assets (WebP / MP3) + card-art.json, sfx.json
art/               prompt sheets (PROMPTS-PHASE1.md done, PROMPTS-BATCH2.md in progress), SOUND-LIST.md
legacy/            Sarwam's prototype, untouched; public/prototype/ is its build
```

## Hard-won lessons
- **Kill tweens before destroying display objects.** A GSAP tween on a destroyed Pixi object throws every frame and freezes all animation. Use `destroyTree()` for containers; `TokenView`, `HandCard`, `DurgView` already stop their own tweens.
- The battle replays the AI turn by subscribing to `actionObservers` and snapshotting state per action; `reconcile(state)` makes the screen match a state (damage numbers come from hp diffs).
- `window.__yuddh` exposes read-only state and `moves()` (every legal drag) for the e2e bot.
- Art masters arrive on GitHub (Pon uploads via the web UI) in `art/source/`; run `npm run assets` and commit the outputs.
- Card art aspect ratios vary (1024×1536, 1060×1484…); the painter crops with a focus point, so keep the full picture.

## Status (3 Nov 2026)
- Phase 0 done. Phase 1 playable (The First Throne). **Next in Phase 1:** card flip animations (draw/reveal/enemy play), phone-landscape layout with larger text, wire in Durg/title paintings and recorded sounds as they arrive → Gate 1 (Pon approves the look).
- Then Phase 2 (formations, promotion, elephant rampage, morale, terrain, Dharma–Kuta, heroes, ~120 cards, search AI) and Phase 3 (cinematic campaigns built from Sarwam's 9 missions + Digvijaya). Full plan: https://claude.ai/artifact/GXWYv5rFMrBzsoqt3X456s
