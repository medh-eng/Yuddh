# YUDDH: Rise of the Rajyas — working notes for Claude

KARDS-style card game of ancient India, built for Pon (owner, non-programmer, directs the work and generates all art with AI image tools from prompts Claude writes). Target: web now, **Google Play** later (landscape only). Repo is public; live at https://medh-eng.github.io/Yuddh/.

## Ground rules
- **Never break the golden test.** `tests/golden.test.ts` replays 154 games recorded from Sarwam's prototype engine. If a rule is changed on purpose, re-record with `npm run golden` and say so in the commit.
- The engine (`src/engine/`) has **no DOM code**. All screen work goes in `src/game/`.
- **Two rulesets.** `newGame({ rules })`: `'classic'` (default) is the prototype's rules, which the golden traces replay; `'yuddh'` (The First Throne and everything new) adds: a Raksha on the defender's Rajya line guards the Durg, and a unit either advances or attacks in a turn, except the charging classes (Cavalry, Chariot, Elite Chariot, Legendary Warrior → `canCharge`), which may advance then strike. **Promotion** (Yuddh only): a unit that destroys an enemy in its own attack and survives becomes Veer (+1 health), then Mahaveer (+1 attack, +1 health more); `unit.rank`, event `promote`, gold stars on the token. Put new rule changes behind `st.rules === 'yuddh'` so the golden test stays meaningful.
- Before pushing: `npm test`, `npx tsc --noEmit`, `npm run build`, then a real playtest: `npm run preview` + `node tests/e2e/playtest.cjs http://localhost:4173/ <outdir> [w h]` (set `PW=/opt/npm-tools/node_modules/playwright CHROME=/usr/bin/google-chrome` in the cloud sandbox) and look at the screenshots. Test at 1600×900 and phone landscape 844×390, one at a time (two at once starve the headless GPU and drags time out). The playtest visits the gallery, plays a whole battle, films an enemy turn (13-enemy-turn-*), and lists any drag that had no effect with a `fail-N.png`. The sandbox renders 1600×900 at ~4 fps (2 cores, software GL), so the bot sets `window.__yuddhLongPressMs = 4000` to stop the 0.48 s hold-to-read firing mid-drag. One failure per game (a hand card still settling under the cursor) has been seen at 1600×900; more than one is a bug.
- Waiting on a background process: never `pgrep -f` a pattern that also appears in your own shell's command line (it matches itself forever).
- Never `pkill -f "vite preview"` from a shell whose own command line contains that text (kills the shell); start servers with `setsid`.
- GitHub Pages settings API is blocked from the sandbox; publishing is the `deploy.yml` workflow pushing `dist/` to `gh-pages`.
- Commit as "Claude", attribution lines per session instructions.

## Stack
TypeScript, Vite 8, PixiJS 8, GSAP 3, Vitest. Fonts bundled via @fontsource (Cormorant Garamond, Tiro Devanagari Hindi). Two screen modes (`src/game/view.ts`): desktop uses a 1920×1080 design space; a phone held sideways (short side ≤ 540 CSS px) gets a 720-high design space 1280–1800 wide (follows the screen's shape, 16:9 to 2.5:1), plus `view.ui` (1.25) for text and controls. Phone layout is tuned for 5.5–6 inch phones: test at 640×360 and 732×412 as well as 844×390. Responsive scenes read `view` and implement `relayout()`; the battle keeps its numbers in one `battleLayout()` table per mode and rebuilds the board from the game state when the mode changes. A scene can pin a fixed size with `design` (the old AI-vs-AI preview does). The battlefield fills the window behind everything (`Stage.setBackdrop`).

## Map
```
src/engine/        types, cards (50, generated from prototype), rules (+ actionObservers hook), ai (prototype heuristics)
src/campaign/      missions.ts (Sarwam's 9 missions, data only) · firstThrone.ts (Phase 1 battle, painted cards only)
src/meta/          Kirti + upgrades (localStorage key yuddh.meta.v2)
src/game/stage.ts  app, scaling (follows view.ts), backdrop, scene switch, destroyTree()
src/game/view.ts   desktop / phone-landscape modes, fs() for sizes
src/game/cards/    paint.ts (canvas-painted card faces, tokens, Durgs, card back) · views.ts (TokenView, HandCard with turnUp/turnDown, DurgView, diyas) · flip.ts (3D card turn on a PerspectiveMesh)
src/game/scenes/   title.ts (title painting) · battle.ts (the game) · gallery.ts (Chitrashala: every card by empire over its battlefield) · battlePreview.ts (AI vs AI, old placeholder look, fixed 1920×1080)
src/game/ui/       button.ts (registers buttons for the playtest: window.__yuddhButtons) · inspect.ts (card at full size + KARDS-style bold rules panel beside it) · glossary.ts (what each class/keyword/rank means, the panel's text)
src/game/audio.ts  sfx: recordings replace synth stand-ins, preloaded on unlock. Music: playMusic(track) streams public/assets/sfx/music_*.mp3, cross-fades between pieces and into itself when looping; drone stands in if missing
src/assets/manifest.ts  paintings load on demand: loadArt(ids), artImage(id), cardArt(id); battlefields via loadBattlefield(name)
scripts/convert-assets.mjs   art/source/{cards,battlefields,sfx} → public/assets (WebP / MP3) + card-art.json, sfx.json. Sound effects are cut to one hit (onset found automatically, stops before a second hit), faded and levelled; music has silence trimmed from both ends. ALIAS maps other names (shankh → conch)
art/               prompt sheets (PROMPTS-PHASE1.md done, PROMPTS-BATCH2.md in progress), SOUND-LIST.md
legacy/            Sarwam's prototype, untouched; public/prototype/ is its build
```

## Hard-won lessons
- **Kill tweens before destroying display objects.** A GSAP tween on a destroyed Pixi object throws every frame and freezes all animation. Use `destroyTree()` for containers; `TokenView`, `HandCard`, `DurgView` already stop their own tweens.
- The battle replays the AI turn by subscribing to `actionObservers` and snapshotting state per action; `reconcile(state)` makes the screen match a state (damage numbers come from hp diffs).
- `window.__yuddh` exposes read-only state and `moves()` (every legal drag) for the e2e bot.
- Art masters arrive on GitHub (Pon uploads via the web UI) in `art/source/`; run `npm run assets` and commit the outputs.
- Card art aspect ratios vary (1024×1536, 1060×1484…); the painter crops with a focus point, so keep the full picture.
- **Decoration inside an interactive scene must have `eventMode = 'none'`.** The battle scene listens for taps everywhere (`static`), and Pixi then hit-tests every descendant as if interactive: a passing spark, the turn banner or a fading card silently swallowed presses on the unit beneath it. The battle's lanes, arrow, preview and fx layers opt out.
- Faces painted before their painting has loaded are drawn with a placeholder and not cached; load a scene's art (loadArt) before building it.
- Cards drawn from the deck are face-down and `flipping` while they fly in; the battle reports itself busy (`dealing()`) until they land.
- Hand cards show their current cost (`HandCard.setCost(koshaCost(...))` in refreshInteractivity); a discount (Maurya passive, upgrades) paints the coin green. Card faces mark charging classes "· CHARGES".
- Tapping an enemy unit reads its card; a tap that just chose a target is ignored for 0.7 s (`targetTapAt`).
- The playtest presses a hand card on its uncovered left strip (cards overlap on narrow phones).
- Combat feedback (KARDS-like): while aiming a unit, red damage shields show what each side would take (`combatFx`, above the arrow); hits pop a red shield with the number, the struck unit flashes red and flinches, melee raises dust.
- Music needs a user gesture; `audio.playMusic()` before unlock just records the wish. `audio.unlock()` runs on every pointerdown and retries a blocked play.

## Status (4 Nov 2026)
- Phase 0 done. Phase 1 feature-complete: The First Throne with card flips (opening deal and draws from the deck pile, enemy cards turned over in mid-air, Yantras set face-down and revealed), phone-landscape layout (tap a card to see it large at the side), all batch-2 art (Durg paintings, title painting, 30 cards, 4 battlefields), 8 recorded sound effects and all 6 music pieces, and the card gallery. Each side now carries a Pratikar Yantra (player also Yudh Niti, Nanda also Visha Baan). Yuddh rules since 4 Nov evening (Raksha guards the Durg, move-or-attack, promotion): simulated win rate ~60%, ~17 turns (firstThrone.test.ts requires 55–80%).
- Still synthesised (no recording yet): cardDraw, cardPlay, march, death, coin, yantra, fire, click, victory, defeat.
- **Gate 1 passed (4 Nov).** Phase 2 started: promotion done. Next: elephant rampage, formations, morale, terrain/season, Dharma–Kuta, heroes, ~120 cards, search AI. Pon sends the remaining sfx on 5 Nov.
- Then Phase 2 (formations, promotion, elephant rampage, morale, terrain, Dharma–Kuta, heroes, ~120 cards, search AI) and Phase 3 (cinematic campaigns built from Sarwam's 9 missions + Digvijaya). Full plan: https://claude.ai/artifact/GXWYv5rFMrBzsoqt3X456s
