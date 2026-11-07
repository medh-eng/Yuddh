# YUDDH: Rise of the Rajyas — design

*What the game is, how it plays, and why it is built this way. Updated at the end of each session (last: 7 Nov 2026). Tasks live in `TASKS.md`; technical working notes for Claude live in `CLAUDE.md`.*

## Vision
A KARDS-style tactical card game of ancient Indian empires, for **web now and Google Play later (landscape only)**. History, not mythology: real armies with epic unit names (Rathi, Maharathi, Atirathi), no gods as units. Tone: a "living miniature": Indian miniature painting, each empire's card frame carved from its own material (Maurya sandstone, Gupta gold, Chalukya red sandstone, Chola bronze, Rajput silver).

Owner: Pon (directs the work, generates all art with AI image tools from prompts Claude writes). Live: https://medh-eng.github.io/Yuddh/ · repo: https://github.com/medh-eng/Yuddh (public).

## The rules in one page
- **Board:** each side has a **Rajya line** (up to 4 units) behind a shared **Yudhbhumi** (front, up to 4 units, held by one side at a time). Each side has a **Durg** (capital, 24 health). Destroy the enemy Durg to win.
- **Kosha** is the resource: +1 maximum every turn. Cards cost Kosha; advancing or attacking costs the unit's *order cost* (the bronze coin, usually 1).
- **Turn:** play cards, advance units from the Rajya line to the Yudhbhumi, attack. A unit either advances **or** attacks in a turn, except **charging classes** (Cavalry, Chariot, Elite Chariot, Legendary Warrior). Only units on the Yudhbhumi can strike the Durg; a **Raksha** unit on the defender's Rajya line guards the Durg and must fall first.
- **Melee trades blows** (both deal damage); **ranged** units strike without a counter-blow.
- **Promotion:** a unit that destroys an enemy and survives becomes Veer (+1 health), then Mahaveer (+1 attack, +1 health more).
- **Trample:** a War Elephant that crushes a unit carries the spare damage to that side's Durg.
- **Seasons (Ritu):** Sharad (none), Varsha (mud: nothing advances and attacks in one turn), Grishma (ranged deal 1 less), Hemanta (+1 Kosha each turn). Chosen by the battle's seed.
- **Dharma–Kuta meter** (−3..+3 under each Durg): fair melee kills +1 Dharma; hidden traps, poison and spies −1. At +3 the Durg strikes +1 harder; at −3 orders and Yantras cost 1 less.
- **Yantras** are face-down traps that spring on their own trigger (when the enemy deploys, attacks your Durg, or attacks your unit).
- **Pikes** (Seleucid Phalanx): a melee unit that advanced this turn and strikes it takes 2 extra damage.
- Two rulesets exist: `'classic'` (the original prototype, replayed by the golden test) and `'yuddh'` (everything above, and all new work). New rule changes go behind `st.rules === 'yuddh'`.

## Campaign (Maurya, "Rise of Magadha")
| # | Battle | Enemy | Status |
|---|---|---|---|
| 0 | The Training Ground | Nanda border post (coached by Chanakya) | Done |
| 1 | The First Throne, Pataliputra, c. 321 BCE | Nanda court (Dhana Nanda, elephants, gold) | Done, approved at Gate 1 |
| 2 | The Indus Line, c. 305 BCE | Seleucus Nicator: pike phalanx, Companion cavalry, Cretan archers, stone-throwers | Built 7 Nov (6 of 10 batch 4 cards painted) |

Not locked: any battle can be started from the campaign map; a laurel marks battles won, "NEXT" marks the next unwon one. Winning a battle offers the next one. The nine battles of the prototype (`src/campaign/missions.ts`) are the later campaign's skeleton; the agreed direction is cinematic briefings, mid-battle events and an original narrator voice (not an imitation of a real person).

## Art and sound
- Pon paints every card, Durg and battlefield from Claude's prompt sheets (`art/PROMPTS-*.md`) and uploads masters to `art/source/{cards,battlefields,sfx}/` named exactly by card id. `npm run assets` makes the game files; credits in `art/CREDITS.md`.
- Fonts: Cinzel (titles, names, numbers), Alegreya Sans (rules text), Cormorant Garamond (story lines only).
- Sound effects from Pixabay; music generated with Google Gemini (Pon confirmed commercial use).

## Architecture
- **Engine** (`src/engine/`): pure TypeScript, no DOM. Rules, AI, events. Runs in browser and node.
- **Data** (`src/data/`): *all balance lives in JSON.* `cards.json` (every card and empire), `decks.json` (the decks of each battle), `rules.json` (ranks, seasons, Dharma limit, charge classes, Kuta cards). A balance change is an edit there, never a code rewrite. Order effects that fit common patterns are data-driven too (`power`, `hqDamage`, `draw`, `dharma`, `reprisal` fields); a new *kind* of effect needs a few lines in `rules.ts`.
- **Campaign** (`src/campaign/`): scenario definitions (story text, Durgs, AI level, setup) + `campaign.ts` (order, progress). Decks come from `decks.json`.
- **Renderer** (`src/game/`): PixiJS 8 + GSAP; two screen modes (desktop 1920×1080 design space; phone landscape 720-high). Scenes: title, campaign map, battle, card gallery, preview.
- **Tests** (`tests/`): golden traces (154 games from the prototype, never break), rules, card mechanics, battle balance (AI vs AI win-rate bands), scripted real-mouse playtests in `tests/e2e/`.

## Balance targets (AI "normal" vs AI "normal", 200 seeded games)
- The First Throne: player side 55–80% (now ~57%, ~16 turns).
- The Indus Line: player side 45–70% (now ~54%, ~15 turns). Deliberately harder than the first battle; a human beats the AI more often than the AI beats itself.

## Decisions log
- 3 Nov 2026: web + TypeScript + Vite + PixiJS + GSAP; Google Play via wrapper in Phase 5; name "YUDDH: Rise of the Rajyas"; repo public.
- 4 Nov: Gate 1 (the look) approved.
- 5–6 Nov: KARDS-style reading panels and damage shields; seasons; Dharma–Kuta; tutorial; batch 3 cards.
- 7 Nov: UI polish (11 items); board units stay in straight lines (any unit can attack any enemy, so a zig-zag would teach the wrong rule); data moved out of code into `src/data/*.json`; The Indus Line + campaign map built; Seleucid cards use the neutral (teak) frame and their own gallery tab.
