# YUDDH: Rise of the Rajyas — working notes for Claude

KARDS-style card game of ancient India, built for Pon (owner, non-programmer, directs the work and generates all art with AI image tools from prompts Claude writes). Target: web now, **Google Play** later (landscape only). Repo is public; live at https://medh-eng.github.io/Yuddh/.

## Ground rules
- **Never break the golden test.** `tests/golden.test.ts` replays 154 games recorded from Sarwam's prototype engine. If a rule is changed on purpose, re-record with `npm run golden` and say so in the commit.
- The engine (`src/engine/`) has **no DOM code**. All screen work goes in `src/game/`.
- **Two rulesets.** `newGame({ rules })`: `'classic'` (default) is the prototype's rules, which the golden traces replay; `'yuddh'` (The First Throne and everything new) adds: a Raksha on the defender's Rajya line guards the Durg, and a unit either advances or attacks in a turn, except the charging classes (Cavalry, Chariot, Elite Chariot, Legendary Warrior → `canCharge`), which may advance then strike. **Promotion** (Yuddh only): a unit that destroys an enemy in its own attack and survives becomes Veer (+1 health), then Mahaveer (+1 attack, +1 health more); `unit.rank`, event `promote`, gold stars on the token. **Trample**: a War Elephant that destroys a unit carries the unneeded damage to that side's Durg (event `trample`). **Seasons** (`st.season`, `SEASONS` in rules.ts): Sharad (none), Varsha (mud: nothing advances and attacks in one turn), Grishma (heat haze: ranged deal 1 less, `strikeDamage()`), Hemanta (+1 Kosha each turn). The First Throne picks the season from its seed (`seasonFor`); the board shows a tappable season label and weather particles. **Batch 3 cards** (yuddhCards.ts): deploys kosha2 (Dhana Nanda), setYantra (Amatya Rakshasa sets a free Pratikar), hillVolley (Parvataka), elephantBuff (Hastipaka); orders nd_nanda_kosha (+3 Kosha), m_garuda_vyuha (+1 atk and `unit.surge = turn`: may advance and attack), m_makara_vyuha (+2 health on the Yudhbhumi); m_raja_dhwaja morale (+1 damage to comrades on the Yudhbhumi, inside `strikeDamage`); m_shalya_vaidya heals 2 at turn start (event `heal`); nd_kashtha_prakara ward 3 + 2 back at the attacker; trample applies to any `isElephant` sub. New cards: add to YUDDH_CARD_LIST, never CARD_LIST. Put new rule changes behind `st.rules === 'yuddh'` so the golden test stays meaningful.
- Before pushing: `npm test`, `npx tsc --noEmit`, `npm run build`, then a real playtest: `npm run preview` + `node tests/e2e/playtest.cjs http://localhost:4173/ <outdir> [w h]` (set `PW=/opt/npm-tools/node_modules/playwright CHROME=/usr/bin/google-chrome` in the cloud sandbox) and look at the screenshots. Test desktop and phone landscape (844×390 or 732×412), one at a time (two at once starve the headless GPU and drags time out). The playtest visits the gallery, plays a whole battle, films an enemy turn (13-enemy-turn-*), and lists any drag that had no effect with a `fail-N.png`. The sandbox renders 1600×900 at ~4 fps or worse (2 cores, software GL); when frames pass 0.5 s GSAP's lag smoothing slows every tween to a crawl and the board looks frozen mid-fade, so run the desktop playtest at **1280×720** (still desktop mode). The bot sets `window.__yuddhLongPressMs = 4000` to stop the 0.48 s hold-to-read firing mid-drag. With a mouse the hovered hand card lifts over its neighbours, so the bot steps off the hand before each grab and aims at a card's resting place (`home`). A desktop game takes ~10 minutes: run it in the background with a 25-minute limit. Any failure is now a bug.
- Waiting on a background process: never `pgrep -f` a pattern that also appears in your own shell's command line (it matches itself forever).
- Never `pkill -f "vite preview"` from a shell whose own command line contains that text (kills the shell); start servers with `setsid`.
- GitHub Pages settings API is blocked from the sandbox; publishing is the `deploy.yml` workflow pushing `dist/` to `gh-pages`.
- Commit as "Claude", attribution lines per session instructions.

## Stack
TypeScript, Vite 8, PixiJS 8, GSAP 3, Vitest. Fonts bundled via @fontsource (Cormorant Garamond, Tiro Devanagari Hindi). Two screen modes (`src/game/view.ts`): desktop uses a 1920×1080 design space; a phone held sideways (short side ≤ 540 CSS px) gets a 720-high design space 1280–1800 wide (follows the screen's shape, 16:9 to 2.5:1), plus `view.ui` (1.25) for text and controls. Phone layout is tuned for 5.5–6 inch phones: test at 640×360 and 732×412 as well as 844×390. Responsive scenes read `view` and implement `relayout()`; the battle keeps its numbers in one `battleLayout()` table per mode and rebuilds the board from the game state when the mode changes. A scene can pin a fixed size with `design` (the old AI-vs-AI preview does). The battlefield fills the window behind everything (`Stage.setBackdrop`).

## Map
```
src/engine/        types, cards (50, generated from prototype: CARD_LIST, used by buildDeck), yuddhCards.ts (YUDDH_CARD_LIST: batch 3 Nanda court nd_* + Maurya heroes/formations; in CARDS but never in buildDeck), rules (+ actionObservers hook), ai (prototype heuristics + values for the new orders)
src/campaign/      scenario.ts (what the battle screen needs) · firstThrone.ts (FIRST_THRONE_SCENARIO) · tutorial.ts (The Training Ground, coached; localStorage yuddh.tutorial.done) · missions.ts (Sarwam's 9 missions, data only)
src/meta/          Kirti + upgrades (localStorage key yuddh.meta.v2)
src/game/stage.ts  app, scaling (follows view.ts), backdrop, scene switch, destroyTree()
src/game/view.ts   desktop / phone-landscape modes, fs() for sizes
src/game/cards/    paint.ts (canvas-painted card faces, tokens, Durgs, card back) · views.ts (TokenView, HandCard with turnUp/turnDown, DurgView, diyas) · flip.ts (3D card turn on a PerspectiveMesh)
src/game/scenes/   title.ts (title painting) · battle.ts (the game) · gallery.ts (Chitrashala: every card by empire over its battlefield) · battlePreview.ts (AI vs AI, old placeholder look, fixed 1920×1080)
src/game/ui/       button.ts (registers buttons for the playtest: window.__yuddhButtons) · inspect.ts (card at full size + KARDS-style bold rules panel beside it) · glossary.ts (what each class/keyword/rank means, the panel's text)
src/game/audio.ts  sfx: recordings replace synth stand-ins, preloaded on unlock. Music: playMusic(track) streams public/assets/sfx/music_*.mp3, cross-fades between pieces and into itself when looping; drone stands in if missing
src/assets/manifest.ts  paintings load on demand: loadArt(ids), artImage(id), cardArt(id); battlefields via loadBattlefield(name)
scripts/convert-assets.mjs   art/source/{cards,battlefields,sfx} → public/assets (WebP / MP3) + card-art.json, sfx.json. Sound effects are cut to one hit (onset found automatically, stops before a second hit), faded and levelled; music has silence trimmed from both ends. ALIAS maps other names (shankh → conch)
art/               prompt sheets (PHASE1, BATCH2, BATCH3 all painted), SOUND-LIST.md, CREDITS.md
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

## Status (5 Nov 2026, evening)
- Phase 1 approved (Gate 1, 4 Nov). Phase 2 so far: KARDS-style rules panel, damage shields, promotion, trample, seasons, the coached tutorial, bigger numbers, and the 12 batch 3 cards in The First Throne (Nanda court for the enemy; Parvataka, standard-bearer, surgeon, mahout, Garuda and Makara Vyuha for the player). Gallery has a Nanda page. Music licence confirmed by Pon.
- First Throne balance (firstThrone.test.ts wants 55–80%): ~58% over the four seasons, ~17 turns; Dhana Nanda costs 7 to keep it there.
- Next: Dharma–Kuta meter (honourable vs crooked play), morale/rout, more cards toward ~120 with prompt batch 4, campaign map for Phase 3, search AI → Gate 2. Full plan: https://claude.ai/artifact/GXWYv5rFMrBzsoqt3X456s
